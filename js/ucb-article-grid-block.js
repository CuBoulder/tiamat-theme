(function (customElements) {

class ArticleGridBlockElement extends HTMLElement {
  constructor() {
    super();
    // Count, display and JSON API Endpoint
    var count = this.getAttribute("count");
    var includeSummary = this.getAttribute("includeSummary");
    var API = this.getAttribute("jsonapi");
    // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
    var excludeCatArray = this.getAttribute("exCats").split(",").map(Number);
    var excludeTagArray = this.getAttribute("exTags").split(",").map(Number);
    this._baseURI = this.getAttribute("base-uri");
    fetch(API)
      .then(this.handleError)
      .then((data) =>
        this.build(
          data,
          count,
          includeSummary,
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

  async build(
    data,
    count,
    includeSummary,
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
          altObj[item.id] = item.links.focal_image_wide
            ? item.links.focal_image_wide.href
            : item.attributes.uri.url;
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

          // If no path alias set, use defaults
          const path = item.attributes.path.alias ? item.attributes.path.alias : `/node/${item.attributes.drupal_internal__nid}`;

          return {
            title: item.attributes.title,
            link: this._baseURI + path,
            image: imageSrc,
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

  // Check if more articles are needed
  if (finalArticles.length < count && NEXTJSONURL) {
    try {
      const response = await fetch(NEXTJSONURL);
      const nextData = await this.handleError(response);
      await this.build(
        nextData,
        count,
        includeSummary,
        excludeCatArray,
        excludeTagArray,
        finalArticles
      );
    } catch (error) {
      console.error(
        "There was an error fetching data from the API - Please try again later."
      );
      console.error(error);
      this.toggleMessage("ucb-al-loading");
      this.toggleMessage("ucb-al-api-error", "block");
      this.classList.add("ucb-block-error");
    }
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
    this.renderDisplay(finalArticles, includeSummary);
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
  renderDisplay(articleArray, includeSummary) {
    var articleGridContainer = document.createElement("div");
    articleGridContainer.className = "row ucb-article-grid-container";

    articleArray.forEach((article) => {
      var articleCard = document.createElement("div");
      articleCard.className =
        "ucb-article-grid-card col-sm-12 col-md-6 col-lg-4";

      // Image
      var articleImgContainer = document.createElement("div");
      articleImgContainer.className = "ucb-article-grid-card-img-container";

      var articleImg = document.createElement("img");
      articleImg.className = "ucb-article-grid-card-img";
      articleImg.src = article.image;

      var articleImgLink = document.createElement("a");
      articleImgLink.className = "ucb-article-grid-card-img-link";
      articleImgLink.href = article.link;
      articleImgLink.setAttribute("role", "presentation");
      articleImgLink.setAttribute("aria-hidden", "true");

      // Image append
      articleImgLink.appendChild(articleImg);
      articleImgContainer.appendChild(articleImgLink);
      articleCard.appendChild(articleImgContainer);

      // Header
      var articleCardTitle = document.createElement("h3");
      articleCardTitle.className = "ucb-article-grid-header";
      articleCardTitle.innerText = article.title;
      var articleCardTitleLink = document.createElement("a");
      articleCardTitleLink.className = "ucb-article-grid-header-link";
      articleCardTitleLink.href = article.link;

      articleCardTitleLink.appendChild(articleCardTitle);
      articleCard.appendChild(articleCardTitleLink);

      // Summary - optional
      if (includeSummary === "True") {
        var articleCardSummary = document.createElement("p");
        articleCardSummary.className = "ucb-article-grid-summary";
        articleCardSummary.innerText = article.body;
        articleCard.appendChild(articleCardSummary);
      }

      // Append final article card to div
      articleGridContainer.appendChild(articleCard);
    });

    // Hide loader, append final container
    this.toggleMessage("ucb-al-loading");
    this.appendChild(articleGridContainer);
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

customElements.define("article-grid-block", ArticleGridBlockElement);
})(window.customElements);
