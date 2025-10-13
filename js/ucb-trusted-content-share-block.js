(function (customElements) {
  class TrustedContentShare extends HTMLElement {
    constructor() {
      super();

      // Raw input (pipe format)
      this._shareInput = this.getAttribute("shareURL");

      // Parse parts
      const [host, type, nid] = this._shareInput.split("|");
      this._host = host;
      this._type = type;
      this._nid = nid;

      // Build real JSON:API endpoint
      this._endpoint = this.buildTrustedContentShareURL(this._host, this._type, this._nid);

      this._display = this.getAttribute("display");

      // Fetch content
      fetch(this._endpoint)
        .then((response) => {
          if (!response.ok) {
            this.handleError(response.status, "Error Fetching from Source - Check the console for error logs.");
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => this.build(data))
        .catch((error) => {
          console.error("🔍 TrustedContentShare: Error fetching data:", error);
          this.handleError(error, "Error Fetching Data");
        });
    }

  build(data) {
    const node = this.normalizeSingleEntry(data);

    switch (this._display) {
      case "Feature":
        this.renderFeature(node);
        break;
      case "Teaser":
      default:
        this.renderTeaser(node);
    }

    this.reportView(data);
  }

  reportView(data) {
    if (!data.data || !data.data.length) return;

    const node = data.data[0];
    let nodeId = null;

    // Method 1: From attributes
    if (node.attributes?.drupal_internal__nid) {
      nodeId = node.attributes.drupal_internal__nid;
    }
    // Method 2: From self link
    else if (node.links?.self?.href) {
      const urlMatch = node.links.self.href.match(/\/node\/(\d+)/);
      if (urlMatch) nodeId = urlMatch[1];
    }
    // Method 3: From endpoint query param
    else {
      const urlMatch = this._endpoint.match(/filter\[nid\]=(\d+)/);
      if (urlMatch) nodeId = urlMatch[1];
    }
    // Method 4: Parse with URLSearchParams (safe, since _endpoint is a real URL)
    if (!nodeId) {
      try {
        const url = new URL(this._endpoint);
        const params = new URLSearchParams(url.search);
        const filterNid = params.get("filter[nid]");
        if (filterNid) nodeId = filterNid;
      } catch (error) {
        console.warn("TrustedContentShare: Skipping URL parsing", error);
      }
    }

    if (!nodeId) return;

    // Report view
    const sourceSiteUrl = this._endpoint.split("/jsonapi/")[0];
    const reportUrl = `${sourceSiteUrl}/api/trust-schema/${nodeId}/report-view`;
    
    // Get consumer site with Drupal base path for multisite support
    // Drupal exposes base path in drupalSettings or we can derive it from pathPrefix
    // e.g., "colorado.edu/biden" or "colorado.edu/trust/discovery"
    let basePath = '';
    if (typeof drupalSettings !== 'undefined' && drupalSettings.path) {
      basePath = drupalSettings.path.baseUrl || drupalSettings.path.pathPrefix || '';
      basePath = basePath.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes
    }
    
    const consumerSite = basePath 
      ? window.location.hostname + '/' + basePath
      : window.location.hostname;

    fetch(reportUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Consumer-Site": consumerSite,
      },
    }).catch((error) => {
      console.error("🔍 TrustedContentShare: Error reporting view:", error);
    });
  }

  handleError(error, errorMsg = "Error Fetching Data") {
    this.classList.add("ucb-block-error");
    const container = document.createElement("div");
    container.className = "ucb-tag-cloud-container";

    const span = document.createElement("span");
    span.className = "ucb-tag-cloud-span";
    container.appendChild(span);

    const icon = document.createElement("i");
    icon.className = "fa-solid fa-triangle-exclamation";
    span.appendChild(icon);

    const message = document.createElement("p");
    message.className = "ucb-category-cloud-message";
    message.innerText = errorMsg;
    span.appendChild(message);

    this.appendChild(container);
    console.error(error);
  }

  normalizeSingleEntry(json) {
    const node = json.data[0];
    const included = json.included || [];
    const type = node.type.replace("node--", "");

    const title = node.attributes?.title || "";
    const urlBase = this._endpoint.split("/jsonapi/")[0];
    const relativePath = node.attributes?.path.alias || `/node/${node.attributes?.drupal_internal__nid}`;
    const link = urlBase + relativePath;
    const summary = node.attributes?.field_ucb_article_summary || node.attributes?.body?.summary || "";

    let mediaId = null;
    if (type === "ucb_article") {
      mediaId = node.relationships?.field_ucb_article_thumbnail?.data?.id;
    } else if (type === "basic_page") {
      mediaId = node.relationships?.field_social_sharing_image?.data?.id;
    } else if (type === "ucb_person") {
      mediaId = node.relationships?.field_ucb_person_photo?.data?.id;
    }

    const media = included.find((item) => item.type === "media--image" && item.id === mediaId);
    const fileId = media?.relationships?.field_media_image?.data?.id;
    const file = included.find((item) => item.type === "file--file" && item.id === fileId);
    const alt = media?.relationships?.field_media_image?.data?.meta?.alt || "";

    return {
      title,
      link,
      summary,
      images: {
        focal_image_square: file?.links?.focal_image_square?.href || null,
        focal_image_wide: file?.links?.focal_image_wide?.href || null,
        alt: alt,
      },
    };
  }

  renderTeaser(entry) {
      const container = document.createElement("div");
      container.classList = "ucb-article-list-block container";

      const article = document.createElement("article");
      article.classList = "ucb-article-card ucb-article-card-teaser row";

      const hasImage = entry.images?.focal_image_square;

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
      if (hasImage) {
        const imgDiv = document.createElement("div");
        imgDiv.classList = "ucb-article-card-img";

        const imgLink = document.createElement("a");
        imgLink.href = entry.link;
        imgLink.setAttribute("role", "presentation");
        imgLink.setAttribute("aria-hidden", "true");

        const img = document.createElement("img");
        img.src = entry.images.focal_image_square;
        img.alt = entry.images.alt;

        imgLink.appendChild(img);
        imgDiv.appendChild(imgLink);
        article.appendChild(imgDiv);
      }
      this.toggleMessage("ucb-al-loading");
      container.appendChild(article);
      this.appendChild(container);
  }

  renderFeature(entry) {
    const container = document.createElement("div");
    container.classList = "ucb-article-list-block";

    const article = document.createElement("article");
    article.classList = "ucb-article-card ucb-article-card-feature";

    const articleBody = document.createElement("div");
    articleBody.classList = "col-sm-12 ucb-article-card-data";

    const headerLink = document.createElement("a");
    headerLink.href = entry.link;

    const header = document.createElement("p");
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

    // Image
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
      img.alt = entry.images.alt;


      imgLink.appendChild(img);
      imgDiv.appendChild(imgLink);
      console.log("Add imag")
      article.appendChild(imgDiv);
    }

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

  buildTrustedContentShareURL(site, type, nid) {
    const baseFields = {
      ucb_article: 'title,body,field_ucb_article_summary,field_ucb_article_thumbnail,changed,nid,path',
      ucb_person: 'title,body,changed,field_ucb_person_photo,nid,path',
      basic_page: 'title,body,changed,nid,path,field_social_sharing_image',
    };

    const includeFields = {
      ucb_article: 'field_ucb_article_thumbnail.field_media_image',
      ucb_person: 'field_ucb_person_photo,field_ucb_person_photo.field_media_image',
      basic_page: 'field_social_sharing_image,field_social_sharing_image.field_media_image',
    };

    const shortType = type.replace(/^node--/, '');
    const fields = baseFields[shortType];
    const includes = includeFields[shortType];

    const params = [];
    params.push(`fields[node--${shortType}]=${encodeURIComponent(fields)}`);
    params.push('fields[media--image]=field_media_image');
    params.push('fields[file--file]=uri,url');
    params.push(`filter[nid]=${encodeURIComponent(nid)}`);

    if (includes) {
      includes.split(',').forEach(inc => {
        params.push(`include=${encodeURIComponent(inc)}`);
      });
    }

    return `${site}/jsonapi/node/${shortType}?${params.join('&')}`;
  }
}
  customElements.define("trusted-content-share", TrustedContentShare);
})(window.customElements);