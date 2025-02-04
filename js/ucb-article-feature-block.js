(function (customElements) {

class ArticleFeatureBlockElement extends HTMLElement {
  constructor() {
    super();
    // Image Size, display and JSON API Endpoint
    var display = this.getAttribute("display");
    var imgSize = this.getAttribute("imgSize");
    var API = this.getAttribute("jsonapi");
    this._baseURI = this.getAttribute("base-uri");

    var count = display === "stacked" ? 4 : 5;
    // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
    var excludeCatArray = this.getAttribute("exCats").split(",").map(Number);
    var excludeTagArray = this.getAttribute("exTags").split(",").map(Number);

    fetch(API)
      .then(this.handleError)
      .then((data) =>
        this.build(
          data,
          display,
          count,
          imgSize,
          excludeCatArray,
          excludeTagArray
        )
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

  // This is the article list filtering function that assembles the article javascript object array from the JSON response. Handles exclusions of categories and tags.
  async build(
    data,
    display,
    count,
    imgSize,
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
      if (item.relationships.field_ucb_article_thumbnail.data) {
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
            imageSquare: imageSrc,
            imageWide: imageSrcWide,
            date: new Date(item.attributes.created).toLocaleDateString(
              "en-us",
              { year: "numeric", month: "short", day: "numeric" }
            ),
            body: body.trim(),
          };
        }
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
            display,
            count,
            imgSize,
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
          this.classList.add("ucb-block-error");
        });
      return;
    }

    // Handle the case where no articles are found
    if (finalArticles.length === 0 && !NEXTJSONURL) {
      console.error(
        "There are no available Articles that match the selected filters. Please adjust your filters and try again."
      );
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-error", "block");
      this.classList.add("ucb-block-error");
      return;
    }
    // Render articles if the count is met or no more articles are available
    if (finalArticles.length >= count || !NEXTJSONURL) {
      if (finalArticles.length > count) {
        finalArticles.length = count;
      }
      this.renderDisplay(finalArticles, display, imgSize);
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
  renderDisplay(articleArray, display, imgSize) {
    switch (display) {
      case "inline-large":
        this.renderInlineLarge(articleArray, imgSize);
        break;
      case "inline-half":
        this.renderInlineHalf(articleArray, imgSize);
        break;
      case "stacked":
        this.renderStacked(articleArray, imgSize);
        break;
      default:
        this.renderStacked(articleArray, imgSize);
        break;
    }
  }
  // The below functions are used to render the appropriate display
  // Render Inline 50/50
  renderInlineHalf(articleArray, imgSize) {
    // Container
    var articleFeatureContainer = document.createElement("div");
    articleFeatureContainer.className = "ucb-article-feature-container row";

    // This is the list of 'secondary' articles
    var secondaryContainer = document.createElement("div");
    secondaryContainer.className =
      "ucb-inline-half-secondary-container col-lg-6 col-md-6 col-sm-12 col-sm-12";

    articleArray.map((article) => {
      // First article (feature)
      if (articleFeatureContainer.children.length == 0) {
        // This is the large feature article
        var featureContainer = document.createElement("article");
        featureContainer.className =
          "ucb-inline-half-feature-container col-lg-6 col-md-6 col-sm-12 col-xs-12";

        // Image
        var featureImg = document.createElement("img");
        if (imgSize === "wide") {
          featureImg.src = article.imageWide;
          featureImg.className = "ucb-feature-article-img feature-img-wide";
        } else {
          featureImg.src = article.imageSquare;
          featureImg.className = "ucb-feature-article-img feature-img-square";
        }
        // Image Link
        var featureImgLink = document.createElement("a");
        featureImgLink.className = "ucb-feature-article-img-link";
        featureImgLink.href = article.link;
        featureImgLink.setAttribute("role", "presentation");
        featureImgLink.setAttribute("aria-hidden", "true");
        featureImgLink.appendChild(featureImg);

        // Title
        var featureTitle = document.createElement("h2");
        featureTitle.className = "ucb-feature-article-header";
        // Title Link
        var featureTitleLink = document.createElement("a");
        featureTitleLink.href = article.link;
        featureTitleLink.innerText = article.title;
        featureTitle.appendChild(featureTitleLink);

        // Body
        var featureSummary = document.createElement("p");
        featureSummary.className = "ucb-feature-article-summary";
        featureSummary.innerText = article.body;

        // Read More
        var featureReadMore = document.createElement("a");
        featureReadMore.className = "ucb-article-read-more";
        featureReadMore.setAttribute("aria-hidden", "true");
        featureReadMore.href = article.link;
        featureReadMore.innerText = "Read More";

        // Append
        featureContainer.appendChild(featureImgLink);
        featureContainer.appendChild(featureTitle);
        featureContainer.appendChild(featureSummary);
        featureContainer.appendChild(featureReadMore);

        articleFeatureContainer.appendChild(featureContainer);
      } else {
        // The non features

        // Row
        var articleContainer = document.createElement("article");
        articleContainer.className = "ucb-article-card row";

        //Img
        var articleImg = document.createElement("img");
        articleImg.className = "ucb-article-feature-secondary-img";
        articleImg.src = article.imageSquare;

        // Img Link
        var articleImgLink = document.createElement("a");
        articleImgLink.className = "ucb-article-img-link";
        articleImgLink.href = article.link;
        articleImgLink.setAttribute("role", "presentation");
        articleImgLink.setAttribute("aria-hidden", "true");
        articleImgLink.appendChild(articleImg);

        // Title
        var articleTitle = document.createElement("h3");
        articleTitle.className = "ucb-article-feature-secondary-title";
        //Title Link
        var articleTitleLink = document.createElement("a");
        articleTitleLink.href = article.link;
        articleTitleLink.innerText = article.title;
        articleTitle.appendChild(articleTitleLink);

        articleContainer.appendChild(articleImgLink);
        articleContainer.appendChild(articleTitle);
        secondaryContainer.appendChild(articleContainer);
      }
    });
    // Hide loader, append final container
    this.toggleMessage("ucb-al-loading");
    articleFeatureContainer.appendChild(secondaryContainer);
    this.appendChild(articleFeatureContainer);
  }
  // Render Inline 66/33
  renderInlineLarge(articleArray, imgSize) {
    // Container
    var articleFeatureContainer = document.createElement("div");
    articleFeatureContainer.className = "ucb-article-feature-container row";

    // This is the list of 'secondary' articles
    var secondaryContainer = document.createElement("div");
    secondaryContainer.className =
      "ucb-inline-large-secondary-container col-lg-4 col-md-4 col-sm-4 col-sm-12";

    articleArray.map((article) => {
      // First article (feature)
      if (articleFeatureContainer.children.length == 0) {
        // This is the large feature article
        var featureContainer = document.createElement("article");
        featureContainer.className =
          "ucb-inline-large-feature-container col-lg-8 col-md-8 col-sm-12 col-xs-12";

        // Image
        var featureImg = document.createElement("img");
        if (imgSize === "wide") {
          featureImg.src = article.imageWide;
          featureImg.className = "ucb-feature-article-img feature-img-wide";
        } else {
          featureImg.src = article.imageSquare;
          featureImg.className = "ucb-feature-article-img feature-img-square";
        }
        // Image Link
        var featureImgLink = document.createElement("a");
        featureImgLink.className = "ucb-feature-article-img-link";
        featureImgLink.href = article.link;
        featureImgLink.appendChild(featureImg);

        // Title
        var featureTitle = document.createElement("h3");
        featureTitle.className = "ucb-feature-article-header";
        // Title Link
        var featureTitleLink = document.createElement("a");
        featureTitleLink.href = article.link;
        featureTitleLink.innerText = article.title;
        featureTitle.appendChild(featureTitleLink);

        // Body
        var featureSummary = document.createElement("p");
        featureSummary.className = "ucb-feature-article-summary";
        featureSummary.innerText = article.body;

        // Read More
        var featureReadMore = document.createElement("a");
        featureReadMore.className = "ucb-article-read-more";
        featureReadMore.href = article.link;
        featureReadMore.innerText = "Read More";
        //Screen Reader text
        var srOnly = document.createElement("span");
        srOnly.className = "visually-hidden";
        srOnly.innerText = ` about ${article.title}`;
        featureReadMore.appendChild(srOnly);

        // Append
        featureContainer.appendChild(featureImgLink);
        featureContainer.appendChild(featureTitle);
        featureContainer.appendChild(featureSummary);
        featureContainer.appendChild(featureReadMore);

        articleFeatureContainer.appendChild(featureContainer);
      } else {
        // The non features

        // Row
        var articleContainer = document.createElement("article");
        articleContainer.className = "ucb-article-card row";

        //Img
        var articleImg = document.createElement("img");
        articleImg.className = "ucb-article-feature-secondary-img";
        articleImg.src = article.imageSquare;

        // Img Link
        var articleImgLink = document.createElement("a");
        articleImgLink.className = "ucb-article-img-link";
        articleImgLink.href = article.link;
        articleImgLink.appendChild(articleImg);

        // Title
        var articleTitle = document.createElement("h3");
        articleTitle.className = "ucb-article-feature-secondary-title";
        //Title Link
        var articleTitleLink = document.createElement("a");
        articleTitleLink.href = article.link;
        articleTitleLink.innerText = article.title;
        articleTitle.appendChild(articleTitleLink);

        articleContainer.appendChild(articleImgLink);
        articleContainer.appendChild(articleTitle);
        secondaryContainer.appendChild(articleContainer);
      }
    });
    // Hide loader, append final container
    this.toggleMessage("ucb-al-loading");
    articleFeatureContainer.appendChild(secondaryContainer);
    this.appendChild(articleFeatureContainer);
  }
  // Render Stacked
  renderStacked(articleArray, imgSize) {
    // Container
    var articleFeatureContainer = document.createElement("div");
    articleFeatureContainer.className = "ucb-article-feature-container row";

    // This is the list of 'secondary' articles
    var secondaryContainer = document.createElement("div");
    secondaryContainer.className =
      "ucb-stacked-secondary-container row col-sm-12";

    articleArray.map((article) => {
      // First article (feature)
      if (articleFeatureContainer.children.length == 0) {
        // This is the large feature article
        var featureContainer = document.createElement("article");
        featureContainer.className = "ucb-stacked-primary-container col-xs-12";

        // Image
        var featureImg = document.createElement("img");
        if (imgSize === "wide") {
          featureImg.src = article.imageWide;
          featureImg.className = "ucb-feature-article-img feature-img-wide";
        } else {
          featureImg.src = article.imageSquare;
          featureImg.className = "ucb-feature-article-img feature-img-square";
        }
        // Image Link
        var featureImgLink = document.createElement("a");
        featureImgLink.className = "ucb-feature-article-img-link";
        featureImgLink.href = article.link;
        featureImgLink.appendChild(featureImg);

        // Title
        var featureTitle = document.createElement("h2");
        featureTitle.className = "ucb-feature-article-header";
        // Title Link
        var featureTitleLink = document.createElement("a");
        featureTitleLink.href = article.link;
        featureTitleLink.innerText = article.title;
        featureTitle.appendChild(featureTitleLink);

        // Body
        var featureSummary = document.createElement("p");
        featureSummary.className = "ucb-feature-article-summary";
        featureSummary.innerText = article.body;

        // Read More
        var featureReadMore = document.createElement("a");
        featureReadMore.className = "ucb-article-read-more";
        featureReadMore.href = article.link;
        featureReadMore.innerText = "Read More";
        //Screen Reader text
        var srOnly = document.createElement("span");
        srOnly.className = "visually-hidden";
        srOnly.innerText = ` about ${article.title}`;
        featureReadMore.appendChild(srOnly);

        // Append
        featureContainer.appendChild(featureImgLink);
        featureContainer.appendChild(featureTitle);
        featureContainer.appendChild(featureSummary);
        featureContainer.appendChild(featureReadMore);

        articleFeatureContainer.appendChild(featureContainer);
      } else {
        // The non features

        // Row
        var articleContainer = document.createElement("article");
        articleContainer.className = "ucb-article-card col-md-4 col-sm-12 row";

        //Img
        var articleImg = document.createElement("img");
        articleImg.className = "ucb-article-feature-secondary-img";
        articleImg.src = article.imageSquare;

        // Img Link
        var articleImgLink = document.createElement("a");
        articleImgLink.className = "ucb-article-img-link";
        articleImgLink.href = article.link;
        articleImgLink.appendChild(articleImg);

        // Title
        var articleTitle = document.createElement("h3");
        articleTitle.className = "ucb-article-feature-secondary-title";
        //Title Link
        var articleTitleLink = document.createElement("a");
        articleTitleLink.href = article.link;
        articleTitleLink.innerText = article.title;
        articleTitle.appendChild(articleTitleLink);

        articleContainer.appendChild(articleImgLink);
        articleContainer.appendChild(articleTitle);
        secondaryContainer.appendChild(articleContainer);
      }
    });
    // Hide loader, append final container
    this.toggleMessage("ucb-al-loading");
    articleFeatureContainer.appendChild(secondaryContainer);
    this.appendChild(articleFeatureContainer);
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

customElements.define("article-feature-block", ArticleFeatureBlockElement);
})(window.customElements);
