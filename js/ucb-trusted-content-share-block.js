(function (customElements) {
  class TrustedContentShare extends HTMLElement {
    constructor() {
      super();
      this._shareURL = this.getAttribute("shareURL").replace(/&amp;/g, '&');
      this._display = this.getAttribute("display");

      fetch(`${this._shareURL}`)
        .then((response) => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then((data) => this.build(data))
        .catch((error) => this.handleError(error));
    }

    build(data) {
      const node = this.normalizeSingleEntry(data)
      switch (this._display) {
        case "Teaser":
          this.renderTeaser(node);
          break;
        case "Feature":
          this.renderFeature(node);
          break;

        default:
          this.renderTeaser(node);
          break;
      }
    }

    handleError(error, errorMsg = 'Error Fetching Tags - Check the console') {
      this.classList.add("ucb-block-error");

      const container = document.createElement('div');
      container.className = 'ucb-tag-cloud-container';

      const span = document.createElement('span');
      span.className = 'ucb-tag-cloud-span';
      container.appendChild(span);

      const icon = document.createElement('i');
      icon.className = 'fa-solid fa-triangle-exclamation';
      span.appendChild(icon);

      const message = document.createElement('p');
      message.className = 'ucb-category-cloud-message';
      message.innerText = errorMsg;
      span.appendChild(message);

      this.appendChild(container);

      console.error(error);
    }
    normalizeSingleEntry(json) {
      const node = json.data[0];
      const included = json.included || [];
      const type = node.type.replace('node--', '');

      const title = node.attributes?.title || '';
      const urlBase = new URL(this._shareURL).origin;
      const relativePath = node.attributes?.path.alias ? node.attributes?.path.alias : `/node/${node.attributes?.drupal_internal__nid}`;
      const link = urlBase + relativePath;
      const summary =
        node.attributes?.field_ucb_article_summary ||
        node.attributes?.body?.summary ||
        '';

      let mediaId = null;
      if (type === 'ucb_article') {
        mediaId = node.relationships?.field_ucb_article_thumbnail?.data?.id;
      } else if (type === 'basic_page') {
        mediaId = node.relationships?.field_social_sharing_image?.data?.id;
      } else if (type === 'ucb_person'){
        mediaId = node.relationships?.field_ucb_person_photo?.data?.id;
      }

      const media = included.find(item => item.type === 'media--image' && item.id === mediaId);
      const fileId = media?.relationships?.field_media_image?.data?.id;
      const file = included.find(item => item.type === 'file--file' && item.id === fileId);

      return {
        title,
        link,
        summary,
        images: {
          focal_image_square: file?.links?.focal_image_square?.href || null,
          focal_image_wide: file?.links?.focal_image_wide?.href || null,
        }
      };
    }
renderTeaser(entry) {
  const container = document.createElement("div");
  container.classList = "ucb-article-list-block container";

  const article = document.createElement("article");
  article.classList = "ucb-article-card row";

  const hasImage = entry.images?.focal_image_square;

  if (hasImage) {
    const imgDiv = document.createElement("div");
    imgDiv.classList = "ucb-article-card-img";

    const imgLink = document.createElement("a");
    imgLink.href = entry.link;
    imgLink.setAttribute("role", "presentation");
    imgLink.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.src = entry.images.focal_image_square;

    imgLink.appendChild(img);
    imgDiv.appendChild(imgLink);
    article.appendChild(imgDiv);
  }

  const articleBody = document.createElement("div");
  articleBody.classList = hasImage
    ? "col px-3 ucb-article-card-data"
    : "col ucb-article-card-data";

  const strong = document.createElement("strong");
  const headerLink = document.createElement("a");
  headerLink.classList = "ucb-article-card-title-teaser";
  headerLink.href = entry.link;
  headerLink.innerText = entry.title;
  strong.appendChild(headerLink);
  articleBody.appendChild(strong);

  const summary = document.createElement("p");
  summary.classList = "ucb-article-card-summary";
  summary.innerText = entry.summary;
  articleBody.appendChild(summary);

  const readMore = document.createElement("a");
  readMore.href = entry.link;
  readMore.classList = "ucb-article-card-read-more";
  readMore.innerText = "Read More";
  readMore.setAttribute("aria-hidden", "true");
  articleBody.appendChild(readMore);

  article.appendChild(articleBody);
  this.toggleMessage("ucb-al-loading");
  container.appendChild(article);
  this.appendChild(container);
}

renderFeature(entry) {
  const container = document.createElement("div");
  container.classList = "ucb-article-list-block";

  const article = document.createElement("article");
  article.classList = "ucb-article-card";

  const hasImage = entry.images?.focal_image_wide;

  if (hasImage) {
    const imgDiv = document.createElement("div");

    const imgLink = document.createElement("a");
    imgLink.href = entry.link;
    imgLink.setAttribute("role", "presentation");
    imgLink.setAttribute("aria-hidden", "true");

    const img = document.createElement("img");
    img.classList = "ucb-article-card-img-wide";
    img.src = entry.images.focal_image_wide;

    imgLink.appendChild(img);
    imgDiv.appendChild(imgLink);
    article.appendChild(imgDiv);
  }

  const articleBody = document.createElement("div");
  articleBody.classList = "col-sm-12 ucb-article-card-data";

  const headerLink = document.createElement("a");
  headerLink.href = entry.link;

  const header = document.createElement("h3");
  header.classList = "ucb-article-card-title-feature";
  if (!entry.date) header.classList.add("ucb-article-card-title-no-date");
  header.innerText = entry.title;
  headerLink.appendChild(header);
  articleBody.appendChild(headerLink);

  if (entry.date) {
    const dateSpan = document.createElement("span");
    dateSpan.className = "ucb-article-card-date";

    const formattedDate = new Date(entry.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    dateSpan.innerText = formattedDate;
    articleBody.appendChild(dateSpan);
  }

  const summary = document.createElement("p");
  summary.classList = "ucb-article-card-summary";
  summary.innerText = entry.summary;
  articleBody.appendChild(summary);

  const readMore = document.createElement("a");
  readMore.href = entry.link;
  readMore.classList = "ucb-article-card-read-more";
  readMore.innerText = "Read More";
  readMore.setAttribute("aria-hidden", "true");
  articleBody.appendChild(readMore);

  article.appendChild(articleBody);
  this.toggleMessage("ucb-al-loading");
  container.appendChild(article);
  this.appendChild(container);
}

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




  }

  customElements.define('trusted-content-share', TrustedContentShare);
})(window.customElements);
