class ArticleListBlockElement extends HTMLElement {
  constructor() {
    super();
    // Count, display and JSON API Endpoint
    var count = this.getAttribute('count');
    var display = this.getAttribute('display');
    var API = this.getAttribute('jsonapi');
    this._baseURI = this.getAttribute("base-uri");

    // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
    var excludeCatArray = this.getAttribute('exCats').split(",").map(Number);
    var excludeTagArray = this.getAttribute('exTags').split(",").map(Number);

    fetch(API)
      .then(this.handleError)
      .then((data) => this.build(data, count, display, excludeCatArray, excludeTagArray))
      .catch(Error => {
        console.error('There was an error fetching data from the API - Please try again later.');
        console.error(Error);
        this.toggleMessage('ucb-al-loading');
        this.toggleMessage('ucb-al-api-error', "block");
      });
  }

  async build(data, count, display, excludeCatArray, excludeTagArray, finalArticles = []) {
    // More than 10 articles? This sets up the next call if there's more articles to be retrieved but not enough post-filters
    let NEXTJSONURL = "";
    if (data.links.next) {
      let nextURL = data.links.next.href.split("/jsonapi/");
      NEXTJSONURL = `${this._baseURI}/jsonapi/${nextURL[1]}`;
    } else {
      NEXTJSONURL = "";
    }

    // If no Articles retrieved...
    if (data.data.length == 0) {
      this.toggleMessage('ucb-al-loading');
      this.toggleMessage('ucb-al-error', "block");
      console.warn('No Articles retrieved - please check your inclusion filters and try again');
    } else {
      // Below objects are needed to match images with their corresponding articles. There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
      let idObj = {};
      let altObj = {};
      let wideObj = {};
      // Remove any blanks from our articles before map
      if (data.included) {
        // removes all other included data besides images in our included media
        let idFilterData = data.included.filter((item) => {
          return item.type == "media--image";
        });

        let altFilterData = data.included.filter((item) => {
          return item.type == 'file--file';
        });
        // finds the focial point version of the thumbnail
        altFilterData.map((item) => {
          // checks if consumer is working, else default to standard image instead of focal image
          if (item.links.focal_image_square != undefined) {
            altObj[item.id] = item.links.focal_image_square.href
            // This is used if a user selects the "Wide" image style
            wideObj[item.id] = item.links.focal_image_wide.href
          } else {
            altObj[item.id] = item.attributes.uri.url
          }
        });

        // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
        idFilterData.map((pair) => {
          idObj[pair.id] = pair.relationships.thumbnail.data.id;
        });
      }

      // Iterate over each Article
      await Promise.all(data.data.map(async (item) => {
        let thisArticleCats = [];
        let thisArticleTags = [];
        // // loop through and grab all of the categories
        if (item.relationships.field_ucb_article_categories) {
          for (let i = 0; i < item.relationships.field_ucb_article_categories.data.length; i++) {
            thisArticleCats.push(
              item.relationships.field_ucb_article_categories.data[i].meta
                .drupal_internal__target_id
            );
          }
        }
        // // loop through and grab all of the tags
        if (item.relationships.field_ucb_article_tags) {
          for (var i = 0; i < item.relationships.field_ucb_article_tags.data.length; i++) {
            thisArticleTags.push(item.relationships.field_ucb_article_tags.data[i].meta.drupal_internal__target_id);
          }
        }

        let doesIncludeCat = thisArticleCats;
        let doesIncludeTag = thisArticleTags;

        // check to see if we need to filter on categories
        if (excludeCatArray.length && thisArticleCats.length) {
          doesIncludeCat = thisArticleCats.filter((element) =>
            excludeCatArray.includes(element)
          );
        }
        // check to see if we need to filter on tags
        if (excludeTagArray.length && thisArticleTags.length) {
          doesIncludeTag = thisArticleTags.filter((element) =>
            excludeTagArray.includes(element)
          );
        }

        // If there's no categories or tags that are in the exclusions, proceed
        if (doesIncludeCat.length == 0 && doesIncludeTag.length == 0) {
          // okay to render
          let bodyAndImageId = item.relationships.field_ucb_article_content.data.length ? item.relationships.field_ucb_article_content.data[0].id : "";
          let body = item.attributes.field_ucb_article_summary ? item.attributes.field_ucb_article_summary : "";
          body = body.trim();
          let imageSrc = "";
          let imageSrcWide = "";
          if (!body.length && bodyAndImageId != "") {
            body = await this.getArticleParagraph(bodyAndImageId);
          }

          // if no thumbnail, show no image
          if (!item.relationships.field_ucb_article_thumbnail.data) {
            imageSrc = "";
          } else {
            //Use the idObj as a memo to add the corresponding image url
            let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
            imageSrc = altObj[idObj[thumbId]];
            imageSrcWide = wideObj[idObj[thumbId]]
          }

          //Date - make human readable
          const options = { year: 'numeric', month: 'short', day: 'numeric' };
          let date = new Date(item.attributes.created).toLocaleDateString('en-us', options);
          let title = item.attributes.title;
          let link = item.attributes.path.alias;

          // Create an Article Object for programatic rendering
          const article = {
            title,
            link,
            image: imageSrc,
            imageWide: imageSrcWide,
            date,
            body,
          }
          // Adds the article object to the final array of articles chosen
          finalArticles.push(article);
        }
      }));
      // Case for not enough articles selected and extra articles available
      if (finalArticles.length < count && NEXTJSONURL) {
        fetch(NEXTJSONURL).then(this.handleError)
          .then((data) => this.build(data, count, display, excludeCatArray, excludeTagArray, finalArticles))
          .catch(Error => {
            console.error('There was an error fetching data from the API - Please try again later.');
            console.error(Error);
            this.toggleMessage('ucb-al-loading');
            this.toggleMessage('ucb-al-api-error', "block");
          });
      }

      // If no chosen articles and no other options, provide error
      if (finalArticles.length === 0 && !NEXTJSONURL) {
        console.error('There are no available Articles that match the selected filters. Please adjust your filters and try again.');
        this.toggleMessage('ucb-al-loading');
        this.toggleMessage('ucb-al-error', "block");
      }

      // Case for Too many articles
      if (finalArticles.length >= count || (finalArticles.length >= count && NEXTJSONURL)) {
        finalArticles.length = count
      }

      // Have articles and want to proceed
      if ((finalArticles.length >= 0 && !NEXTJSONURL) || (finalArticles.length == count && NEXTJSONURL)) {
        this.renderDisplay(display, finalArticles);
      }
    }
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
      let trimmedString = lineBreakStrip.substr(0, 250);

      if (trimmedString.length > 100) {
        trimmedString = trimmedString.substr(
          0,
          Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
        );
      }
      return trimmedString + "...";
    } catch (Error) {
      console.error(
        "There was an error fetching Article Paragraph from the API - Please try again later."
      );
      console.error(Error);
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-api-error", "block");
      return ""; // Return an empty string in case of error
    }
  }


  // Responsible for calling the render function of the appropriate display
  renderDisplay(display, articleArray) {
    switch (display) {
      case 'feature-wide':
        this.renderFeatureWide(articleArray);
        break;
      case 'feature-large':
        this.renderFeatureFull(articleArray);
        break;
      case 'teaser':
        this.renderTeaser(articleArray);
        break;
      case 'title-thumbnail':
        this.renderTitleThumb(articleArray);
        break;
      case 'title-only':
        this.renderTitleOnly(articleArray);
        break;
      default:
        this.renderTeaser(articleArray);
        break;
    }

  }

  // renderX functions are responsible for taking the final array of Articles and displaying them appropriately
  renderFeatureFull(articleArray) {
    var container = document.createElement('div');
    container.classList = 'ucb-article-list-block';

    articleArray.forEach(article => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement('article');
      article.classList = 'ucb-article-card';


      if (articleImgSrc) {
        var imgDiv = document.createElement('div');
        var imgLink = document.createElement('a');
        imgLink.href = articleLink;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        var articleImg = document.createElement('img');
        articleImg.classList = 'col-sm-12 ucb-article-card-img-full';
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement('div');
      articleBody.classList = 'col-sm-12 ucb-article-card-data';

      var headerLink = document.createElement('a');
      headerLink.href = articleLink;

      var articleHeader = document.createElement('h3');
      articleHeader.classList = 'ucb-article-card-title-feature';
      articleHeader.innerText = articleTitle;

      headerLink.appendChild(articleHeader);

      var date = document.createElement('span');
      date.classList = 'ucb-article-card-date';
      date.innerText = articleDate;

      var articleSummary = document.createElement('p');
      articleSummary.innerText = articleSumm;
      articleSummary.classList = 'ucb-article-card-summary';

      var readMore = document.createElement('a');
      readMore.href = articleLink;
      readMore.classList = 'ucb-article-card-read-more';
      readMore.innerText = 'Read More';
      readMore.setAttribute('aria-hidden', 'true');

      articleBody.appendChild(headerLink);
      articleBody.appendChild(date);
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage('ucb-al-loading');
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderFeatureWide(articleArray) {
    var container = document.createElement('div');
    container.classList = 'ucb-article-list-block';

    articleArray.forEach(article => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.imageWide;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement('article');
      article.classList = 'ucb-article-card';

      if (articleImgSrc) {
        var imgDiv = document.createElement('div');
        var imgLink = document.createElement('a');
        imgLink.href = articleLink;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        var articleImg = document.createElement('img');
        articleImg.classList = 'ucb-article-card-img-wide';
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement('div');
      articleBody.classList = 'col-sm-12 ucb-article-card-data';

      var headerLink = document.createElement('a');
      headerLink.href = articleLink;

      var articleHeader = document.createElement('h3');
      articleHeader.classList = 'ucb-article-card-title-feature';
      articleHeader.innerText = articleTitle;

      headerLink.appendChild(articleHeader);

      var date = document.createElement('span');
      date.classList = 'ucb-article-card-date';
      date.innerText = articleDate;

      var articleSummary = document.createElement('p');
      articleSummary.innerText = articleSumm;
      articleSummary.classList = 'ucb-article-card-summary';

      var readMore = document.createElement('a');
      readMore.href = articleLink;
      readMore.classList = 'ucb-article-card-read-more';
      readMore.innerText = 'Read More';
      readMore.setAttribute('aria-hidden', 'true');

      articleBody.appendChild(headerLink);
      articleBody.appendChild(date);
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage('ucb-al-loading');
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTitleThumb(articleArray) {
    var container = document.createElement('div');
    container.classList = 'ucb-article-list-block container';

    articleArray.forEach(article => {
      // Article Data
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;

      // Create and Append Elements
      var article = document.createElement('article');
      article.classList = 'ucb-article-card row';
      if (articleImgSrc) {
        var imgDiv = document.createElement('div');
        imgDiv.classList = 'ucb-article-card-img title-thumbnail-img';

        var imgLink = document.createElement('a');
        imgLink.href = articleLink;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        var articleImg = document.createElement('img');
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement('div');
      if (articleImgSrc) {
        articleBody.classList = 'col px-3 ucb-article-card-data';
      } else {
        articleBody.classList = 'col ucb-article-card-data';
      }

      var headerLink = document.createElement('a');
      headerLink.href = articleLink;
      headerLink.innerText = articleTitle

      articleBody.appendChild(headerLink);

      article.appendChild(articleBody);

      this.toggleMessage('ucb-al-loading');
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTitleOnly(articleArray) {
    var container = document.createElement('div');
    container.classList = 'ucb-article-list-block';

    articleArray.forEach(article => {
      // Article Data
      var articleLink = article.link;
      var articleTitle = article.title;

      // Create and Append Elements
      var article = document.createElement('article');
      article.classList = 'ucb-article-card-title-only';

      var articleBody = document.createElement('div');
      articleBody.classList = 'col-sm-12 ucb-article-card-data';

      var headerLink = document.createElement('a');
      headerLink.href = articleLink;
      headerLink.innerText = articleTitle

      articleBody.appendChild(headerLink);

      article.appendChild(articleBody);

      this.toggleMessage('ucb-al-loading');
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTeaser(articleArray) {
    var container = document.createElement('div');
    container.classList = 'ucb-article-list-block container';

    articleArray.forEach(article => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement('article');
      article.classList = 'ucb-article-card row';

      if (articleImgSrc) {
        var imgDiv = document.createElement('div');
        imgDiv.classList = 'ucb-article-card-img';

        var imgLink = document.createElement('a');
        imgLink.href = articleLink;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        var articleImg = document.createElement('img');
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement('div');
      if (articleImgSrc) {
        articleBody.classList = 'col px-3 ucb-article-card-data';
      } else {
        articleBody.classList = 'col ucb-article-card-data';
      }

      var headerStrong = document.createElement('strong');

      var articleHeader = document.createElement('a');
      articleHeader.classList = 'ucb-article-card-title-teaser';
      articleHeader.href = articleLink;
      articleHeader.innerText = articleTitle;

      headerStrong.appendChild(articleHeader);

      var date = document.createElement('span');
      date.classList = 'ucb-article-card-date';
      date.innerText = articleDate;

      var articleSummary = document.createElement('p');
      articleSummary.innerText = articleSumm;
      articleSummary.classList = 'ucb-article-card-summary';

      var readMore = document.createElement('a');
      readMore.href = articleLink;
      readMore.classList = 'ucb-article-card-read-more';
      readMore.innerText = 'Read More';
      readMore.setAttribute('aria-hidden', 'true');

      articleBody.appendChild(headerStrong);
      articleBody.appendChild(date);
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage('ucb-al-loading');
      container.appendChild(article);
    });
    this.appendChild(container);

  }

  // Used to toggle error messages and loader
  toggleMessage(id, display = "none") {
    if (id) {
      var toggle = this.querySelector(`#${id}`);
      if (toggle) {
        if (display === "block") {
          toggle.style.display = "block";
        } else {
          toggle.style.display = "none";
        }
      }
    }
  }

  // Used for error handling within the API response
  handleError = response => {
    if (!response.ok) {
      throw new Error;
    } else {
      return response.json();
    }
  };
}

customElements.define('article-list-block', ArticleListBlockElement);
