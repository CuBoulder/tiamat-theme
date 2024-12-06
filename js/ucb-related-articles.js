class RelatedArticles extends HTMLElement {
  static get observedAttributes() {
    return [
      'baseurl',
      'loggedin',
      'related-shown',
      'categories',
      'tags',
      'category-exclude',
      'tag-exclude',
    ];
  }

  constructor() {
    super();
    this._baseURL = '';
    this._loggedIn = false;
    this._categories = [];
    this._tags = [];
    this._excludeCategories = [];
    this._excludeTags = [];
    this._relatedShown = this.getAttribute('related-shown') !== 'Off';

    // Create container for related articles
    this._container = document.createElement('div');
    this._container.className = 'row related-articles-container';
    this.style.display = this._relatedShown ? 'block' : 'none';

    // Append container only if relatedShown is true
    if (this._relatedShown) {
      this.appendChild(this._container);

      // Loading element
      this._loadingElement = document.createElement('div');
      this._loadingElement.innerHTML = `<span class="visually-hidden">Loading</span><i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>`;
      this.appendChild(this._loadingElement);

      // Error element
      this._errorElement = document.createElement('div');
      this._errorElement.textContent = 'Error fetching related articles.';
      this._errorElement.style.display = 'none';
      this.appendChild(this._errorElement);
    }
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'related-shown') {
      const isShown = newValue !== 'Off';
      if (this._relatedShown !== isShown) {
        this._relatedShown = isShown;
        this.style.display = this._relatedShown ? 'block' : 'none';

        if (!this._relatedShown) {
          console.log('Hiding RelatedArticles component and stopping further processing.');
          // Cleanup or early exit logic if needed
          this._container.innerHTML = '';
          return;
        }

        // If related-shown becomes true, re-fetch articles
        this.fetchAndDisplayArticles();
      }
    }

    if (!this._relatedShown) return; // Early exit if not shown

    if (name === 'baseurl') this._baseURL = newValue || '';
    if (name === 'loggedin') this._loggedIn = newValue === 'true';

    // Parse JSON values safely, with fallback to empty arrays
    if (name === 'categories') this._categories = this._parseJSON(newValue);
    if (name === 'tags') this._tags = this._parseJSON(newValue);
    if (name === 'category-exclude') this._excludeCategories = this._parseJSON(newValue);
    if (name === 'tag-exclude') this._excludeTags = this._parseJSON(newValue);
  }

  connectedCallback() {
    if (!this._relatedShown) {
      console.log('RelatedArticles not shown. Hiding component and skipping processing.');
      this.style.display = 'none';
      return;
    }
    console.log('ConnectedCallback: RelatedArticles initialized.');
    console.log('Attributes:', {
      baseurl: this._baseURL,
      loggedin: this._loggedIn,
      relatedShown: this._relatedShown,
      categories: this._categories,
      tags: this._tags,
      excludeCategories: this._excludeCategories,
      excludeTags: this._excludeTags,
    });

    if (this._relatedShown) {
      this.fetchAndDisplayArticles();
    }
  }

  async fetchAndDisplayArticles() {
    if (!this._baseURL) {
      console.error('Base URL is missing.');
      return;
    }

    this.toggleLoading(true);

    try {
      const endpoint = this.buildEndpoint();
      console.log('Fetching articles from:', endpoint);

      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.status}`);
      }

      const data = await response.json();
      console.log('Fetched data:', data);

      const { articles, thumbnails } = this.processIncludedData(data.data, data.included);
      const rankedArticles = this.rankArticles(articles);
      console.log('Ranked articles:', rankedArticles);

      this.renderArticles(rankedArticles.slice(0, 3), thumbnails);
    } catch (error) {
      console.error('Error fetching articles:', error);
      this.toggleError(true);
    } finally {
      this.toggleLoading(false);
      this.toggleBlockVisibility();
    }
  }

  buildEndpoint() {
    let endpoint = `${this._baseURL}/jsonapi/node/ucb_article?filter[status][value]=1&include=field_ucb_article_thumbnail.field_media_image&sort=-created`;

    // Add category filters
    if (this._categories.length > 0) {
      const categoryFilters = this._categories
        .map(
          (cat) =>
            `&filter[cat${cat}][condition][path]=field_ucb_article_categories.meta.drupal_internal__target_id&filter[cat${cat}][condition][value]=${cat}&filter[cat${cat}][condition][memberOf]=categories`
        )
        .join('');
      endpoint += `&filter[categories][group][conjunction]=OR${categoryFilters}`;
    }

    // Add tag filters
    if (this._tags.length > 0) {
      const tagFilters = this._tags
        .map(
          (tag) =>
            `&filter[tag${tag}][condition][path]=field_ucb_article_tags.meta.drupal_internal__target_id&filter[tag${tag}][condition][value]=${tag}&filter[tag${tag}][condition][memberOf]=tags`
        )
        .join('');
      endpoint += `&filter[tags][group][conjunction]=OR${tagFilters}`;
    }

    console.log('Generated endpoint:', endpoint);
    return endpoint;
  }

  processIncludedData(articles, included) {
    const thumbnails = {};
    if (included) {
      const idObj = {};
      const altObj = {};

      const idFilterData = included.filter((item) => item.type === 'media--image');
      const altFilterData = included.filter((item) => item.type === 'file--file');

      altFilterData.forEach((item) => {
        if (item.links?.focal_image_square) {
          altObj[item.id] = { src: item.links.focal_image_square.href };
        } else {
          altObj[item.id] = { src: item.attributes.uri.url };
        }
      });

      idFilterData.forEach((pair) => {
        const thumbnailId = pair.relationships?.thumbnail?.data?.id;
        if (thumbnailId) {
          idObj[pair.id] = thumbnailId;
          if (altObj[thumbnailId]) {
            altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt || 'Thumbnail';
          }
          thumbnails[pair.id] = altObj[thumbnailId];
        }
      });
    }

    return { articles, thumbnails };
  }

  rankArticles(articles) {
    return articles
      .map((article) => {
        const urlCheck = article.attributes.path.alias
          ? article.attributes.path.alias
          : `/node/${article.attributes.drupal_internal__nid}`;

        // Exclude the current article
        if (urlCheck === window.location.pathname) {
          console.log(`Excluding current article: ${urlCheck}`);
          return null;
        }

        const categories = article.relationships?.field_ucb_article_categories?.data.map(
          (cat) => cat.meta.drupal_internal__target_id
        ) || [];
        const tags = article.relationships?.field_ucb_article_tags?.data.map(
          (tag) => tag.meta.drupal_internal__target_id
        ) || [];

        const categoryMatches = categories.filter((cat) => this._categories.includes(cat)).length;
        const tagMatches = tags.filter((tag) => this._tags.includes(tag)).length;
        console.log('excluded', this._excludeCategories)


        const hasExcludedCategory = categories.some((cat) => this._excludeCategories.includes(cat));
        const hasExcludedTag = tags.some((tag) => this._excludeTags.includes(tag));

        if (hasExcludedCategory || hasExcludedTag) {
          console.log(`Excluding article with excluded category or tag: ${urlCheck}`);
          return null;
        }

        return {
          article,
          categoryMatches,
          tagMatches,
          created: new Date(article.attributes.created),
        };
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => {
        if (b.categoryMatches !== a.categoryMatches) return b.categoryMatches - a.categoryMatches;
        if (b.tagMatches !== a.tagMatches) return b.tagMatches - a.tagMatches;
        return b.created - a.created;
      });
  }


  renderArticles(articles, thumbnails) {
    console.log('Rendering articles:', articles);

    this._container.innerHTML = '';

    if (articles.length === 0) {
      this._container.innerHTML = '<p>No related articles found.</p>';
      return;
    }

    articles.forEach(({ article }) => {
      const title = article.attributes.title;
      const summary = article.attributes.field_ucb_article_summary || '';
      const link = `${this._baseURL}${article.attributes.path.alias}`;
      const thumbnail = thumbnails[article.relationships?.field_ucb_article_thumbnail?.data?.id];

      const articleElement = document.createElement('div');
      articleElement.className = "ucb-article-card col-sm-12 col-md-6 col-lg-4";

      if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail.src;
        img.alt = thumbnail.alt;
        articleElement.appendChild(img);
      }

      const titleElement = document.createElement('span');
      titleElement.classList.add('ucb-article-card-title')
      titleElement.innerHTML = `<a href="${link}">${title}</a>`;
      articleElement.appendChild(titleElement);

      const summaryElement = document.createElement('p');
      summaryElement.classList.add('ucb-article-card-data')
      summaryElement.textContent = summary;
      articleElement.appendChild(summaryElement);

      this._container.appendChild(articleElement);
    });
  }

  toggleLoading(show) {
    this._loadingElement.style.display = show ? 'block' : 'none';
  }

  toggleError(show) {
    this._errorElement.style.display = show ? 'block' : 'none';
  }

  toggleBlockVisibility() {
    const block = this.closest('.ucb-related-articles-block');
    if (block) {
      block.style.display = this._container.innerHTML.trim() ? 'block' : 'none';
    }
  }

  _parseJSON(value) {
    try {
      return JSON.parse(value || '[]');
    } catch (e) {
      console.warn(`Error parsing JSON for value: ${value}`);
      return [];
    }
  }
}

customElements.define('related-articles', RelatedArticles);
