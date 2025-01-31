(function (customElements) {
class ArticleListBlockElement extends HTMLElement {
  constructor() {
    super();
    // Count, display and JSON API Endpoint
    var count = this.getAttribute("count");
    var display = this.getAttribute("display");
    var API = this.getAttribute("jsonapi");
    this._baseURI = this.getAttribute("base-uri");
    this.globalDateSetting = this.getAttribute('global-date-format');
    // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
    var excludeCatArray = this.getAttribute("exCats").split(",").map(Number);
    var excludeTagArray = this.getAttribute("exTags").split(",").map(Number);

    fetch(API)
      .then(this.handleError)
      .then((data) =>
        this.build(data, count, display, excludeCatArray, excludeTagArray)
      )
      .catch((Error) => {
        console.error(
          "There was an error fetching data from the API - Please try again later."
        );
        console.error(Error);
        this.toggleMessage("ucb-al-loading");
        this.toggleMessage("ucb-al-api-error", "block");
        this.classList.add("ucb-block-error");
      });
  }

  async build(
    data,
    count,
    display,
    excludeCatArray,
    excludeTagArray,
    finalArticles = []
  ) {
    // Handle the next URL for pagination if needed
    let NEXTJSONURL = data.links.next
      ? `${this._baseURI}/jsonapi/${data.links.next.href.split("/jsonapi/")[1]}`
      : "";

    // If no Articles retrieved...
    if (data.data.length === 0) {
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-error", "block");
      this.classList.add("ucb-block-error");
      console.warn(
        "No Articles retrieved - please check your inclusion filters and try again"
      );
      return;
    }

    // Map for media image associations
    const idObj = {};
    const altObj = {};
    const wideObj = {};

    // Process included data for media images
    if (data.included) {
      data.included
        .filter((item) => item.type === "media--image")
        .forEach((pair) => {
          idObj[pair.id] = pair.relationships.thumbnail.data.id;
        });
      data.included
        .filter((item) => item.type === "file--file")
        .forEach((item) => {
          if (item.links.focal_image_square && item.links.focal_image_wide) {
            altObj[item.id] = item.links.focal_image_square.href;
            wideObj[item.id] = item.links.focal_image_wide.href;
          } else {
            altObj[item.id] = item.attributes.uri.url;
          }
        });
    }

    // Process each article
    const promises = data.data.map(async (item) => {
        const thisArticleCats =
          item.relationships.field_ucb_article_categories?.data.map(
            (cat) => cat.meta.drupal_internal__target_id
          ) || [];
        const thisArticleTags =
          item.relationships.field_ucb_article_tags?.data.map(
            (tag) => tag.meta.drupal_internal__target_id
          ) || [];

        const doesIncludeCat = excludeCatArray.length
          ? thisArticleCats.filter((cat) => excludeCatArray.includes(cat))
          : [];
        const doesIncludeTag = excludeTagArray.length
          ? thisArticleTags.filter((tag) => excludeTagArray.includes(tag))
          : [];

          // Proceed if no excluded categories or tags are found
          if (doesIncludeCat.length === 0 && doesIncludeTag.length === 0) {
          const bodyAndImageId =
            item.relationships.field_ucb_article_content?.data[0]?.id || "";
          let body = item.attributes.field_ucb_article_summary || "";
          if (!body && bodyAndImageId) {
            body = await this.getArticleParagraph(bodyAndImageId);
          }
          const imageSrc = item.relationships.field_ucb_article_thumbnail.data
            ? altObj[
                idObj[item.relationships.field_ucb_article_thumbnail.data.id]
              ]
            : "";
          const imageSrcWide = item.relationships.field_ucb_article_thumbnail
            .data
            ? wideObj[
                idObj[item.relationships.field_ucb_article_thumbnail.data.id]
              ]
            : "";

            // If no path alias set, use defaults
            const path = item.attributes.path.alias ? item.attributes.path.alias : `/node/${item.attributes.drupal_internal__nid}`;

            return {
            title: item.attributes.title,
            link: this._baseURI + path,
            image: imageSrc,
            imageWide: imageSrcWide,
            date: (item.attributes.field_ucb_article_date_override != "7" &&
              (this.globalDateSetting != 6 || item.attributes.field_ucb_article_date_override != "0"))
              ? new Date(item.attributes.created).toLocaleDateString('en-us', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
              : null,
            body: body.trim(),
          };
        }
      return null;
    });

    const articlesToAdd = (await Promise.all(promises)).filter(
      (article) => article !== null
    );

    finalArticles.push(...articlesToAdd);

    // Fetch more articles if needed
    if (finalArticles.length < count && NEXTJSONURL) {
      fetch(NEXTJSONURL)
        .then(this.handleError)
        .then((data) =>
          this.build(
            data,
            count,
            display,
            excludeCatArray,
            excludeTagArray,
            finalArticles
          )
        )
        .catch((Error) => {
          console.error(
            "There was an error fetching data from the API - Please try again later."
          );
          console.error(Error);
          this.toggleMessage("ucb-al-loading");
          this.toggleMessage("ucb-al-api-error", "block");
        });
      return;
    }

    if (finalArticles.length === 0 && !NEXTJSONURL) {
      console.error(
        "There are no available Articles that match the selected filters. Please adjust your filters and try again."
      );
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-error", "block");
      this.classList.add("ucb-block-error");
      return;
    }

      if (finalArticles.length >= count || !NEXTJSONURL) {
        if (finalArticles.length > count) {
          finalArticles.length = count;
        }
        this.renderDisplay(display, finalArticles);
      }
  }

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
      console.error(
        "There was an error fetching Article Paragraph from the API - Please try again later."
      );
      console.error(Error);
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-api-error", "block");
      this.classList.add("ucb-block-error");
      return ""; // Return an empty string in case of error
    }
  }

  // Responsible for calling the render function of the appropriate display
  renderDisplay(display, articleArray) {
    switch (display) {
      case "feature-wide":
        this.renderFeatureWide(articleArray);
        break;
      case "feature-large":
        this.renderFeatureFull(articleArray);
        break;
      case "teaser":
        this.renderTeaser(articleArray);
        break;
      case "title-thumbnail":
        this.renderTitleThumb(articleArray);
        break;
      case "title-only":
        this.renderTitleOnly(articleArray);
        break;
      default:
        this.renderTeaser(articleArray);
        break;
    }
  }

  // renderX functions are responsible for taking the final array of Articles and displaying them appropriately
  renderFeatureFull(articleArray) {
    var container = document.createElement("div");
    container.classList = "ucb-article-list-block";

    articleArray.forEach((article) => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement("article");
      article.classList = "ucb-article-card";

      if (articleImgSrc) {
        var imgDiv = document.createElement("div");
        var imgLink = document.createElement("a");
        imgLink.href = articleLink;
        imgLink.setAttribute("role", "presentation");
        imgLink.setAttribute("aria-hidden", "true");

        var articleImg = document.createElement("img");
        articleImg.classList = "col-sm-12 ucb-article-card-img-full";
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement("div");
      articleBody.classList = "col-sm-12 ucb-article-card-data";

      var headerLink = document.createElement("a");
      headerLink.href = articleLink;

      var articleHeader = document.createElement("h3");
      articleHeader.classList = "ucb-article-card-title-feature";
      if(!articleDate){
        articleHeader.classList.add("ucb-article-card-title-no-date");
      }
      articleHeader.innerText = articleTitle;

      headerLink.appendChild(articleHeader);

      if(articleDate){
        var date = document.createElement("span");
        date.classList = "ucb-article-card-date";
        date.innerText = articleDate;
      }

      var articleSummary = document.createElement("p");
      articleSummary.innerText = articleSumm;
      articleSummary.classList = "ucb-article-card-summary";

      var readMore = document.createElement("a");
      readMore.href = articleLink;
      readMore.classList = "ucb-article-card-read-more";
      readMore.innerText = "Read More";
      readMore.setAttribute("aria-hidden", "true");

      articleBody.appendChild(headerLink);
      if (articleDate){articleBody.appendChild(date)};
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage("ucb-al-loading");
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderFeatureWide(articleArray) {
    var container = document.createElement("div");
    container.classList = "ucb-article-list-block";

    articleArray.forEach((article) => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.imageWide;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement("article");
      article.classList = "ucb-article-card";

      if (articleImgSrc) {
        var imgDiv = document.createElement("div");
        var imgLink = document.createElement("a");
        imgLink.href = articleLink;
        imgLink.setAttribute("role", "presentation");
        imgLink.setAttribute("aria-hidden", "true");

        var articleImg = document.createElement("img");
        articleImg.classList = "ucb-article-card-img-wide";
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement("div");
      articleBody.classList = "col-sm-12 ucb-article-card-data";

      var headerLink = document.createElement("a");
      headerLink.href = articleLink;

      var articleHeader = document.createElement("h3");
      articleHeader.classList = "ucb-article-card-title-feature";
      if(!articleDate){
        articleHeader.classList.add("ucb-article-card-title-no-date");
      }
      articleHeader.innerText = articleTitle;

      headerLink.appendChild(articleHeader);

      if(articleDate){
        var date = document.createElement("span");
        date.classList = "ucb-article-card-date";
        date.innerText = articleDate;
      }

      var articleSummary = document.createElement("p");
      articleSummary.innerText = articleSumm;
      articleSummary.classList = "ucb-article-card-summary";

      var readMore = document.createElement("a");
      readMore.href = articleLink;
      readMore.classList = "ucb-article-card-read-more";
      readMore.innerText = "Read More";
      readMore.setAttribute("aria-hidden", "true");

      articleBody.appendChild(headerLink);
      if(articleDate){articleBody.appendChild(date)};
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage("ucb-al-loading");
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTitleThumb(articleArray) {
    var container = document.createElement("div");
    container.classList = "ucb-article-list-block container";

    articleArray.forEach((article) => {
      // Article Data
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;

      // Create and Append Elements
      var article = document.createElement("article");
      article.classList = "ucb-article-card row";
      if (articleImgSrc) {
        var imgDiv = document.createElement("div");
        imgDiv.classList = "ucb-article-card-img title-thumbnail-img";

        var imgLink = document.createElement("a");
        imgLink.href = articleLink;
        imgLink.setAttribute("role", "presentation");
        imgLink.setAttribute("aria-hidden", "true");

        var articleImg = document.createElement("img");
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement("div");
      if (articleImgSrc) {
        articleBody.classList = "col px-3 ucb-article-card-data";
      } else {
        articleBody.classList = "col ucb-article-card-data";
      }

      var headerLink = document.createElement("a");
      headerLink.href = articleLink;
      headerLink.innerText = articleTitle;

      articleBody.appendChild(headerLink);

      article.appendChild(articleBody);

      this.toggleMessage("ucb-al-loading");
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTitleOnly(articleArray) {
    var container = document.createElement("div");
    container.classList = "ucb-article-list-block";

    articleArray.forEach((article) => {
      // Article Data
      var articleLink = article.link;
      var articleTitle = article.title;

      // Create and Append Elements
      var article = document.createElement("article");
      article.classList = "ucb-article-card-title-only";

      var articleBody = document.createElement("div");
      articleBody.classList = "col-sm-12 ucb-article-card-data";

      var headerLink = document.createElement("a");
      headerLink.href = articleLink;
      headerLink.innerText = articleTitle;

      articleBody.appendChild(headerLink);

      article.appendChild(articleBody);

      this.toggleMessage("ucb-al-loading");
      container.appendChild(article);
    });
    this.appendChild(container);
  }
  renderTeaser(articleArray) {
    var container = document.createElement("div");
    container.classList = "ucb-article-list-block container";

    articleArray.forEach((article) => {
      // Article Data
      var articleDate = article.date;
      var articleLink = article.link;
      var articleImgSrc = article.image;
      var articleTitle = article.title;
      var articleSumm = article.body;

      // Create and Append Elements
      var article = document.createElement("article");
      article.classList = "ucb-article-card row";

      if (articleImgSrc) {
        var imgDiv = document.createElement("div");
        imgDiv.classList = "ucb-article-card-img";

        var imgLink = document.createElement("a");
        imgLink.href = articleLink;
        imgLink.setAttribute("role", "presentation");
        imgLink.setAttribute("aria-hidden", "true");

        var articleImg = document.createElement("img");
        articleImg.src = articleImgSrc;

        imgLink.appendChild(articleImg);
        imgDiv.appendChild(imgLink);

        article.appendChild(imgDiv);
      }

      var articleBody = document.createElement("div");
      if (articleImgSrc) {
        articleBody.classList = "col px-3 ucb-article-card-data";
      } else {
        articleBody.classList = "col ucb-article-card-data";
      }

      var headerStrong = document.createElement("strong");

      var articleHeader = document.createElement("a");
      articleHeader.classList = "ucb-article-card-title-teaser";
      if(!articleDate){
        articleHeader.classList.add("ucb-article-card-title-no-date");
      }
      articleHeader.href = articleLink;
      articleHeader.innerText = articleTitle;

      headerStrong.appendChild(articleHeader);

      if(articleDate){
        var date = document.createElement("span");
        date.classList = "ucb-article-card-date";
        date.innerText = articleDate;
      }

      var articleSummary = document.createElement("p");
      articleSummary.innerText = articleSumm;
      articleSummary.classList = "ucb-article-card-summary";

      var readMore = document.createElement("a");
      readMore.href = articleLink;
      readMore.classList = "ucb-article-card-read-more";
      readMore.innerText = "Read More";
      readMore.setAttribute("aria-hidden", "true");

      articleBody.appendChild(headerStrong);
      if(articleDate){articleBody.appendChild(date)};
      articleBody.appendChild(articleSummary);
      articleBody.appendChild(readMore);

      article.appendChild(articleBody);

      this.toggleMessage("ucb-al-loading");
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
  handleError = (response) => {
    if (!response.ok) {
      throw new Error();
    } else {
      return response.json();
    }
  };
}

customElements.define('article-list-block', ArticleListBlockElement);
})(window.customElements);
