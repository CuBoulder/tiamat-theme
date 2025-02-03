(function (customElements) {

  /**
   * Creates a taxonomy filter group to filter by specific taxonomy terms.
   *
   * @param {string} params
   *   The URL params to add the filter group to.
   * @param {number[]} termIds
   *   The terms to include in the filter (joined with OR).
   * @param {string} groupName
   *   The name of the filter group.
   * @param {string} fieldName
   *   The name of the Drupal field.
   */
  function jsonAPICreateFilterGroup(params, termIds, groupName, fieldName) {
    if (termIds.length > 0) {
      params += `&filter[${groupName}][condition][path]=${fieldName}.meta.drupal_internal__target_id`;
      params += `&filter[${groupName}][condition][operator]=IN`;
      for (let i = 0; i < termIds.length; i++) {
        params += `&filter[${groupName}][condition][value][${i + 1}]=${termIds[i]}`;
      }
      return params;
    }
  }

  /**
   * Converts a string to an array of term ids.
   *
   * @param {string | null} input
   *   The input string of term ids separated by a delimiter.
   * @param {string} delimiter
   *   The delimiter.
   * @returns {number[]}
   *   The term ids.
   */
  function stringToTermIds(input, delimiter = ',') {
    return input ? input.split(delimiter).map(Number) : [];
  }

  // Handles construction of endpoints, and fetching of articles and taxonomies
  class ArticleListProvider {
    static get noResultsMessage() {
      return 'No results matching your filters.';
    }

    static get errorMessage() {
      return 'Error retrieving articles from the API endpoint. Please try again later.';
    }

    constructor(baseURI, includeCategories = [], includeTags = [], excludeCategories = [], excludeTags = [], includeSyndicationAudiences = [], includeSyndicationUnits = [], pageCount = 10) {
      this.baseURI = baseURI;
      this.nextURL = '';
      this.includeCategories = includeCategories;
      this.includeTags = includeTags;
      this.excludeCategories = excludeCategories;
      this.excludeTags = excludeTags;
      this.includeSyndicationAudiences = includeSyndicationAudiences;
      this.includeSyndicationUnits = includeSyndicationUnits;
      this.pageCount = pageCount;
      this._categoryTerms = null;
      this._tagTerms = null;
      // Build the endpoint path, now in JS
      this.endpoint = this.buildEndpointPath();
    }

    /**
     * Builds the JSON:API endpoint path with all the filters and parameters (previously Twig)
     */
    buildEndpointPath() {
      const endpoint = '';

      // Include base fields
      let queryString = '/jsonapi/node/ucb_article?include[node--ucb_article]=uid,title,ucb_article_content,created,field_ucb_article_summary,field_ucb_article_categories,field_ucb_article_tags,field_ucb_article_thumbnail&include=field_ucb_article_thumbnail.field_media_image&fields[file--file]=uri,url';

      // Add published filter
      queryString += '&filter[status][value]=1';

      // Placeholder for filters
      queryString += jsonAPICreateFilterGroup(queryString, this.includeCategories, 'category', 'field_ucb_article_categories');
      queryString += jsonAPICreateFilterGroup(queryString, this.includeTags, 'tag', 'field_ucb_article_tags');
      queryString += jsonAPICreateFilterGroup(queryString, this.includeSyndicationAudiences, 'audience', 'field_syndication_audience');
      queryString += jsonAPICreateFilterGroup(queryString, this.includeSyndicationUnits, 'unit', 'field_syndication_unit');

      // Pagination filter
      queryString += `&page[limit]=${this.pageCount}`;

      // Sorting filter
      queryString += '&sort[sort-created][path]=created&sort[sort-created][direction]=DESC';

      return `${this.baseURI}${endpoint}${queryString}`;
    }

    // Method to fetch and cache taxonomies by their machine name
    async fetchTaxonomies() {
      if (!this._categoryTerms) {
        this._categoryTerms = await this.fetchTaxonomy('category');
      }
      if (!this._tagTerms) {
        this._tagTerms = await this.fetchTaxonomy('tags');
      }
    }

    // Fetches taxonomy terms by machine name
    async fetchTaxonomy(taxonomyMachineName, url = null, aggregatedTerms = []) {
      const fetchUrl = url || `${this.baseURI}/jsonapi/taxonomy_term/${taxonomyMachineName}?sort=weight,name`;
      const response = await fetch(fetchUrl);
      const data = await response.json();
      const results = data["data"];

      const terms = results.map((termResult) => {
        const id = termResult["attributes"]["drupal_internal__tid"];
        const name = termResult["attributes"]["name"];
        return { id, name };
      });

      aggregatedTerms.push(...terms);

      // Recursive call for pagination if there are more than 50 terms
      if (data["links"] && data["links"]["next"] && data["links"]["next"]["href"]) {
        return this.fetchTaxonomy(taxonomyMachineName, data["links"]["next"]["href"], aggregatedTerms);
      }

      return aggregatedTerms;
    }
    /**
     * Fetches articles
     */
    async fetchAllArticles(url) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        // Aggregate data for current page only
        const articles = data['data'] || [];
        const included = data['included'] || [];

        // Update the next URL if available, otherwise set it to null
        this._nextURL = data['links']?.next?.href || null;
        return { data: articles, included: included };
      } catch (error) {
        this.classList.add("ucb-block-error", this.getAttribute('logged-in'));
        console.error(ArticleListProvider.errorMessage);
        throw error;
      }
    }
  }

  // Article List Component: Handles the rendering and client side exclusion filtering
  class ArticleListElement extends HTMLElement {
    static get observedAttributes() {
      return ['base-uri', 'exclude-categories', 'exclude-tags', 'include-categories', 'include-tags'];
    }

    constructor() {
      super();
      this._baseURI = this.getAttribute('base-uri');

      // Store the initial values for resetting to 'All'.
      this._initialIncludeCategories = stringToTermIds(this.getAttribute('include-categories'));
      this._initialIncludeTags = stringToTermIds(this.getAttribute('include-tags'));

      const pathname = window.location.pathname.split('/');
      // Adds the functionality for a "read more" page in article syndication.
      if (pathname[pathname.length - 1] === 'syndicate') {
        const params = new URL(window.location.href).searchParams;
        const categories = stringToTermIds(params.get('category'), ' ');
        if (categories.length > 0) {
          this._initialIncludeCategories = categories;
        }
        this._includeSyndicationAudiences = stringToTermIds(params.get('audience'), ' ');
        this._includeSyndicationUnits = stringToTermIds(params.get('unit'), ' ');
      } else {
        this._includeSyndicationAudiences = [];
        this._includeSyndicationUnits = [];
      }

      // Set the current tags to the initial state.
      this._includeTags = [...this._initialIncludeTags];
      // Set the current categories to the initial state.
      this._includeCategories = [...this._initialIncludeCategories];

      this._excludeCategories = stringToTermIds(this.getAttribute('exclude-categories'))
      this._excludeTags = stringToTermIds(this.getAttribute('exclude-tags'));

      this._exposeCategory = this.getAttribute('expose-categories') === "True";
      this._exposeTag = this.getAttribute('expose-tags') === "True";

      this._provider = new ArticleListProvider(
        this._baseURI,
        this._includeCategories,
        this._includeTags,
        this._excludeCategories,
        this._excludeTags,
        this._includeSyndicationAudiences,
        this._includeSyndicationUnits
      );

      // User Dropdown Form Element
      this._filterFormElement = document.createElement('form');
      this._filterFormElement.classList = 'article-list-filter-form';
      this.appendChild(this._filterFormElement);
      this._filterFormElement.style.display = 'none';

      // Article List Content
      this._contentElement = document.createElement('div');
      this._contentElement.className = 'article-list';
      // Only generate the filters/buttons if something is exposed
      if (this._exposeCategory || this._exposeTag) {
        this.generateFilterForm();
        this._filterFormElement.style.display = 'flex';
        this._filterFormElement.style.alignItems = 'center';
        this._contentElement.setAttribute('aria-live', 'polite');
      }
      // Date format
      this.globalDateSetting = this.getAttribute('global-date-format');
      this.appendChild(this._contentElement);
      // Loader
      this._loadingElement = document.createElement('div');
      this._loadingElement.innerHTML = `<span class="visually-hidden">Loading</span><i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>`;
      this._loadingElement.className = 'ucb-list-msg ucb-loading-data';
      this._loadingElement.id = 'ucb-al-loading'
      this._loadingElement.style.display = 'none';
      this.appendChild(this._loadingElement);
      // Error
      this._errorElement = document.createElement('div');
      this._errorElement.innerText = ArticleListProvider.errorMessage;
      this._errorElement.className = 'ucb-list-msg ucb-block-error';
      this._errorElement.id = 'ucb-al-error'
      this._errorElement.style.display = 'none';
      this.appendChild(this._errorElement);
      // No Results Found
      this._noResultsElement = document.createElement('div');
      this._noResultsElement.className = 'ucb-list-msg ucb-no-results ucb-block-error';
      this._noResultsElement.innerText = 'No results found.';
      this._noResultsElement.style.display = 'none';
      this.appendChild(this._noResultsElement);
      // Add Load More button + container
      const loadMoreButtonContainer = document.createElement('div');
      loadMoreButtonContainer.classList = 'ucb-article-list-button-container';
      this._loadMoreButton = document.createElement('button');
      this._loadMoreButton.textContent = 'Load More';
      this._loadMoreButton.className = 'ucb-article-list-button load-more-button';
      this._loadMoreButton.style.display = 'none'; // Initially hidden
      this._loadMoreButton.onclick = () => this.loadMoreArticles();
      loadMoreButtonContainer.appendChild(this._loadMoreButton);
      this.appendChild(loadMoreButtonContainer);

      this._nextURL = '';
    }

    // Part of web component API, called on attribute change
    async connectedCallback() {
      try {
        await this._provider.fetchTaxonomies();
        this.generateFilterForm();
        this.loadArticles();
      } catch (error) {
        this.classList.add("ucb-block-error");
        console.error('Error fetching taxonomies:', error);
      }
    }

    // Part of web component API, called on attribute change
    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'base-uri') {
        this._baseURI = newValue;
      }
      if (name === 'exclude-categories') {
        this._excludeCategories = newValue
          ? newValue.split(',').filter(Boolean).map(Number)
          : [];
      }
      if (name === 'exclude-tags') {
        this._excludeTags = newValue
          ? newValue.split(',').filter(Boolean).map(Number)
          : [];
      }
    }

    // Generates the user-accessible filter form for categories and/or tags.
    generateFilterForm() {
      this._filterFormElement.innerHTML = '';

      // Filter categories
      if (this._exposeCategory && this._provider._categoryTerms) {
        // Container
        const categoryFilterContainer = document.createElement('div');
        categoryFilterContainer.classList = "form-item-categories form-item";
        // Label
        const categoryFilterLabel = document.createElement('label');
        const categoryFilterLabelContent = document.createElement('span');
        categoryFilterLabelContent.innerText = "Category";
        categoryFilterLabel.appendChild(categoryFilterLabelContent);
        categoryFilterContainer.appendChild(categoryFilterLabel)

        // Filter
        const categoryFilter = document.createElement('select');
        categoryFilter.name = 'categoryFilter';
        categoryFilter.id = 'category-filter';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Categories';
        categoryFilter.appendChild(defaultOption);

        // If no includes are selected (empty array), load all except excluded
        const includeCategories = this._includeCategories.length > 0
          ? this._includeCategories
          : this._provider._categoryTerms.map(({ id }) => id); // Load all if includes is empty

        this._provider._categoryTerms
          .filter(({ id }) => includeCategories.includes(id)) // Load all if no includes
          .filter(({ id }) => !this._excludeCategories.includes(id)) // Exclude the excluded
          .forEach(({ id, name }) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            categoryFilter.appendChild(option);
          });
        categoryFilterContainer.appendChild(categoryFilter)
        this._filterFormElement.appendChild(categoryFilterContainer);
      }

      // Filter tags
      if (this._exposeTag && this._provider._tagTerms) {
        // Container
        const tagFilterContainer = document.createElement('div');
        tagFilterContainer.classList = "form-item-tags form-item";
        // Label
        const tagFilterLabel = document.createElement('label');
        const tagFilterLabelContent = document.createElement('span');
        tagFilterLabelContent.innerText = "Tags";
        tagFilterLabel.appendChild(tagFilterLabelContent);
        tagFilterContainer.appendChild(tagFilterLabel)

        // Filter
        const tagFilter = document.createElement('select');
        tagFilter.name = 'tagFilter';
        tagFilter.id = 'tag-filter';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Tags';
        tagFilter.appendChild(defaultOption);

        // If no includes are selected (empty array), load all except excluded
        const includeTags = this._includeTags.length > 0
          ? this._includeTags
          : this._provider._tagTerms.map(({ id }) => id); // Load all if includes is empty

        this._provider._tagTerms
          .filter(({ id }) => includeTags.includes(id)) // Load all if no includes
          .filter(({ id }) => !this._excludeTags.includes(id)) // Exclude the excluded
          .forEach(({ id, name }) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            tagFilter.appendChild(option);
          });

        tagFilterContainer.appendChild(tagFilter)
        this._filterFormElement.appendChild(tagFilterContainer);
      }

      // Filter button
      const filterButton = document.createElement('button');
      filterButton.type = 'button';
      filterButton.className = 'form-submit-btn'
      filterButton.textContent = 'Apply Filters';
      filterButton.onclick = this.applyFilters.bind(this);

      this._filterFormElement.appendChild(filterButton);

      // Reset button
      const resetButton = document.createElement('button');
      resetButton.type = 'button';
      resetButton.className = 'form-reset-btn';
      resetButton.textContent = 'Reset Filters';
      resetButton.onclick = () => {
        // Reset dropdowns to default (All)
        if (this._exposeCategory) {
          document.getElementById('category-filter').value = '';
        }
        if (this._exposeTag) {
          document.getElementById('tag-filter').value = '';
        }

        // Automatically apply default filters after reset
        this.applyFilters();
      };
      this._filterFormElement.appendChild(resetButton);
    }

    // Reload component using new term filters, force re-render
    applyFilters() {
      const selectedCategory = document.getElementById('category-filter')?.value || '';
      const selectedTag = document.getElementById('tag-filter')?.value || '';
      // If the user selects the "All Categories" option, revert to the initial includeCategories
      if (selectedCategory === '') {
        this._includeCategories = [...this._initialIncludeCategories];
      } else {
        this._includeCategories = [Number(selectedCategory)];
      }

      // If the user selects the "All Tags" option, revert to the initial includeTags
      if (selectedTag === '') {
        this._includeTags = [...this._initialIncludeTags];
      } else {
        this._includeTags = [Number(selectedTag)];
      }

      // Rebuild the provider with updated filters
      this._provider = new ArticleListProvider(
        this._baseURI,
        this._includeCategories,
        this._includeTags,
        this._excludeCategories,
        this._excludeTags
      );

      // Load the articles based on the new filters
      this.loadArticles(true); // Pass true to clear existing content and re-render with new filters
    }


    async loadArticles(clearContent = true) {
      const url = this._provider.endpoint;
      this.toggleLoading(true);

      try {
        const response = await this._provider.fetchAllArticles(url);

        this.renderArticles(response.data, response.included, clearContent);

        this._nextURL = this._provider._nextURL;
        this.toggleLoadMoreButton(!!this._nextURL);
        this.toggleLoading(false);
      } catch (error) {
        this.toggleError(true);
        this.toggleLoading(false);
      }
    }

    async loadMoreArticles() {
      if (this._nextURL) {
        try {
          this.toggleLoading(true);
          const response = await this._provider.fetchAllArticles(this._nextURL);

          // Do not clear content for loadMoreArticles, append to existing content
          this.renderArticles(response.data, response.included, false);

          // Update the element’s next URL again after loading more articles
          this._nextURL = this._provider._nextURL;

          // Show or hide the Load More button based on the updated next URL
          this.toggleLoadMoreButton(!!this._nextURL);
          this.toggleLoading(false);
        } catch (error) {
          this.toggleError(true);
          this.toggleLoading(false);
        }
      }
    }

    async renderArticles(articles, included, clearContent = false) {
      // Clear content if specified -- only when applyFilters is called
      if (clearContent) {
        this._contentElement.innerHTML = '';
      }

      // If no results
      if (articles.length === 0) {
        this._noResultsElement.style.display = 'block';
        this._contentElement.style.display = 'none';
        return;
      } else {
        this._noResultsElement.style.display = 'none';
        this._contentElement.style.display = 'block';
      }

      let excludeCatArray = this._excludeCategories;
      let excludeTagArray = this._excludeTags;

      // Image map objects
      let idObj = {};
      let altObj = {};

      // Process the included media
      if (included) {
        // Filter media and file data
        let idFilterData = included.filter((item) => item.type === 'media--image');
        let altFilterData = included.filter((item) => item.type === 'file--file');

        // Populate the altObj map with focal or standard images
        altFilterData.forEach((item) => {
          if (item.links && item.links.focal_image_square) {
            altObj[item.id] = { src: item.links.focal_image_square.href };
          } else {
            altObj[item.id] = { src: item.attributes.uri.url };
          }
        });

        // Populate the idObj map to associate thumbnails with their articles
        idFilterData.forEach((pair) => {
          const thumbnailId = pair.relationships.thumbnail.data.id;
          idObj[pair.id] = thumbnailId;
          altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt;
        });
      }

      // Process the articles
      let promises = articles.map(async (item) => {
        let thisArticleCats = [];
        let thisArticleTags = [];

        // Get article categories
        if (item.relationships.field_ucb_article_categories) {
          thisArticleCats = item.relationships.field_ucb_article_categories.data.map(
            (cat) => cat.meta.drupal_internal__target_id
          );
        }

        // Get article tags
        if (item.relationships.field_ucb_article_tags) {
          thisArticleTags = item.relationships.field_ucb_article_tags.data.map(
            (tag) => tag.meta.drupal_internal__target_id
          );
        }

        // Check if the article's categories or tags overlap with the excluded categories/tags
        const hasExcludedCategory = excludeCatArray.length && thisArticleCats.some(cat => excludeCatArray.includes(cat));
        const hasExcludedTag = excludeTagArray.length && thisArticleTags.some(tag => excludeTagArray.includes(tag));

        // If the article has an excluded category or tag, skip it
        if (hasExcludedCategory || hasExcludedTag) {
          return undefined;
        }

        // Get article body and thumbnail
        let body = item.attributes.field_ucb_article_summary
          ? item.attributes.field_ucb_article_summary.trim()
          : '';
        if (!body && item.relationships.field_ucb_article_content.data.length) {
          const bodyId = item.relationships.field_ucb_article_content.data[0].id;
          body = await this.getArticleParagraph(bodyId);
        }

        let imageSrc = "";

        // If no thumbnail, show no image
        if (!item.relationships.field_ucb_article_thumbnail.data) {
          imageSrc = null;
        } else {
          // Use the idObj as a memo to add the corresponding image URL
          let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
          imageSrc = altObj[idObj[thumbId]];
        }

        // Format
        const date = (item.attributes.field_ucb_article_date_override != "7" &&
          (this.globalDateSetting != 6 || item.attributes.field_ucb_article_date_override != "0"))
          ? new Date(item.attributes.created).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
          : null;
        const title = item.attributes.title;
        // If no path alias set, use defaults
        const path = item.attributes.path.alias ? item.attributes.path.alias : `/node/${item.attributes.drupal_internal__nid}`;

        const link = `${this._baseURI}${path}`;

        // Return article row
        return this.createArticleRow(title, link, date, body, imageSrc);
      });

      let results = await Promise.all(promises);

      // Filter out undefined results (those excluded) and check if there are any remaining
      const filteredResults = results.filter((result) => result !== undefined);

      // If all articles were filtered out post-exclusion, show a "No results found"
      if (filteredResults.length === 0) {
        this._noResultsElement.style.display = 'block';
        this._contentElement.style.display = 'none';
      } else {
        this._noResultsElement.style.display = 'none';
        this._contentElement.style.display = 'block';

        // Render the filtered articles
        filteredResults.forEach((result) => {
          let articleElement = document.createElement('article');
          articleElement.className = 'ucb-article-card-container';
          articleElement.appendChild(result);
          this._contentElement.append(articleElement);
        });
      }
    }
    // Thumbnail helper
    getThumbnail(article, idObj, altObj) {
      if (article.relationships.field_ucb_article_thumbnail) {
        const thumbnailId = article.relationships.field_ucb_article_thumbnail.data.id;
        if (idObj[thumbnailId] && altObj[thumbnailId]) {
          return {
            src: altObj[thumbnailId].src,
            alt: altObj[thumbnailId].alt || 'Article thumbnail',
          };
        }
      }
      return null;
    }
    // Create the Article Row - image, body, read more link
    createArticleRow(title, link, date, body, imageSrc) {
      const articleRow = document.createElement('div');
      articleRow.className = 'ucb-article-card row';

      let articleSummarySize = 'col-md-12';
      if (imageSrc) {
        articleSummarySize = 'col-md-10';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'col-md-2 ucb-article-card-img';

        const imgLink = document.createElement('a');
        imgLink.href = link;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        const articleImg = document.createElement('img');
        articleImg.src = imageSrc.src;
        articleImg.setAttribute('alt', imageSrc.alt);

        imgLink.appendChild(articleImg);
        imgContainer.appendChild(imgLink);
        articleRow.appendChild(imgContainer);
      }

      const articleDataContainer = document.createElement('div');
      articleDataContainer.className = `col-sm-12 ${articleSummarySize} ucb-article-card-data`;

      const articleDataLink = document.createElement('a');
      articleDataLink.href = link;

      const articleDataHead = document.createElement('h2');
      articleDataHead.className = 'ucb-article-card-title';
      articleDataHead.innerText = title;

      articleDataLink.appendChild(articleDataHead);

      const articleCardDate = document.createElement('span');
      articleCardDate.className = 'ucb-article-card-date';
      articleCardDate.innerText = date;

      const articleSummaryBody = document.createElement('p');
      articleSummaryBody.className = 'ucb-article-card-body';
      articleSummaryBody.innerText = body;

      const articleSummaryReadMore = document.createElement('span');
      articleSummaryReadMore.className = 'ucb-article-card-more';

      const readMoreLink = document.createElement('a');
      readMoreLink.href = link;
      readMoreLink.innerText = 'Read more';
      readMoreLink.setAttribute("aria-hidden", "true");

      articleSummaryReadMore.appendChild(readMoreLink);

      articleDataContainer.appendChild(articleDataLink);
      articleDataContainer.appendChild(articleCardDate);
      articleDataContainer.appendChild(articleSummaryBody);
      articleDataContainer.appendChild(articleSummaryReadMore);

      articleRow.appendChild(articleDataContainer);

      return articleRow;
    }

    // Helper function to fetch the Article body if no summary and do the processing
    // Fixes special characters such as & and nbsp
    decodeHtmlEntities(text) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      return doc.documentElement.textContent;
    }

    // Responsible for fetching & processing the body of the Article if no summary provided
    async getArticleParagraph(id) {
      if (!id) {
        return "";
      }

      try {
        const response = await fetch(
          `${this._baseURI}/jsonapi/paragraph/article_content/${id}`
        );
        const data = await response.json();
        if (!data.data.attributes.field_article_text) return ""; //  needed for external articles
        let htmlStrip = data.data.attributes.field_article_text.processed.replace(
          /<\/?[^>]+(>|$)/g,
          ""
        );
        let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
        let decodedString = this.decodeHtmlEntities(lineBreakStrip); // Decode HTML entities here
        let trimmedString = decodedString.substring(0, 250);

        if (trimmedString.length > 100) {
          trimmedString = trimmedString.substring(
            0,
            Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
          );
        }
        return trimmedString + "...";
      } catch (Error) {
        this.classList.add("ucb-block-error", this.getAttribute('logged-in'));
        console.error(
          "There was an error fetching Article Paragraph from the API - Please try again later."
        );
        console.error(Error);
        return ""; // Return an empty string in case of error
      }
    }

    // Various toggles
    toggleLoading(show) {
      this._loadingElement.style.display = show ? 'block' : 'none';
    }

    toggleError(show) {
      this._errorElement.style.display = show ? 'block' : 'none';
    }

    toggleLoadMoreButton(show) {
      this._loadMoreButton.style.display = show ? 'inline' : 'none';
    }

  }

  customElements.define('article-list', ArticleListElement);

})(window.customElements);
