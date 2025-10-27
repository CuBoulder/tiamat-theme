(function (customElements) {
  class TrustedContentPreview extends HTMLElement {
    constructor() {
      super();
      this._baseURI = this.getAttribute("base-uri");
      this._nid = this.getAttribute("nid");
      this._contentType = this.getAttribute("node-type");
      this._title = this.getAttribute("title");

      this._originalHTML = this.innerHTML;
      this._endpoint = this.buildTrustedContentShareURL(
        this._baseURI,
        this._contentType,
        this._nid
      );
      this._nodeData = null;
    }

  connectedCallback() {
    const existingCard = this.querySelector(".ucb-discover-card-container");

    if (!this.querySelector(".ucb-preview-shell") && existingCard) {
      const shell = document.createElement("div");
      shell.classList = "ucb-preview-shell";

      const content = document.createElement("div");
      content.classList = "ucb-preview-content container ucb-discover-card-container";

      const metricsEl = existingCard.querySelector(".ucb-card-metrics");

      // Create the replaceable region
      const replaceable = document.createElement("div");
      replaceable.classList = "ucb-preview-replaceable";

      if (metricsEl) {
        // Move all nodes BEFORE metrics into replaceable
        let node = existingCard.firstChild;
        while (node && node !== metricsEl) {
          const next = node.nextSibling;
          replaceable.appendChild(node);
          node = next;
        }

        // Move metrics into content (fixed, not replace)
        content.appendChild(replaceable);
        content.appendChild(metricsEl);

        const toolbarAnchor = document.createElement("div");
        toolbarAnchor.classList = "ucb-preview-toolbar-anchor";
        content.appendChild(toolbarAnchor);

        // If there are any nodes AFTER metrics, make them part of replaceable too
        while (existingCard.firstChild) {
          replaceable.appendChild(existingCard.firstChild);
        }

      } else {
        // Fallback: no metrics found — make everything replaceable
        while (existingCard.firstChild) {
          replaceable.appendChild(existingCard.firstChild);
        }
        content.appendChild(replaceable);

        const toolbarAnchor = document.createElement("div");
        toolbarAnchor.classList = "ucb-preview-toolbar-anchor";
        content.appendChild(toolbarAnchor);
      }

      // Set original HTML to the replaceable region only
      this._originalHTML = replaceable.innerHTML;

      // Loader
      const loader = document.createElement("div");
      loader.classList = "ucb-loading ucb-list-msg ucb-loading-data";
      loader.innerHTML = `<i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>`;
      loader.style.display = "none"; // hidden initially
      shell.appendChild(loader);
      this._loader = loader;

      // Replace old HTML with the new
      this.innerHTML = "";
      shell.appendChild(content);
      this.appendChild(shell);
    }

    // Render the toolbar into the fixed anchor
    this.renderToggleUI();
  }

  renderToggleUI() {
      // Build toolbar
      const toolbar = document.createElement("div");
      toolbar.classList = "ucb-preview-toolbar mb-3";

      const group = document.createElement("div");
      group.classList = "btn-group";
      group.setAttribute("role", "group");
      group.setAttribute("aria-label", "Preview mode toggle");

      // Unique ids
      const cleanBase = (this._baseURI || "")
      .replace(/^https?:\/\//, "")
      .replace(/[^a-z0-9]/gi, "");
      const cleanType = (this._contentType || "").replace(/[^a-z0-9]/gi, "");
      const cleanNid = this._nid || "unknown";
      const groupName = `preview-mode-${cleanBase}-${cleanType}-${cleanNid}`;

      const modes = [
          { id: "default", label: "Preview" },
          { id: "teaser", label: "Teaser" },
          { id: "feature", label: "Feature" },
      ];

      modes.forEach((m, i) => {
          const input = document.createElement("input");
          input.type = "radio";
          input.classList = "btn-check";
          input.name = groupName;
          input.id = `ucb-preview-${m.id}-${groupName}`;
          if (i === 0) input.checked = true;

          const label = document.createElement("label");
          label.classList = "btn btn-outline-primary btn-sm";
          label.setAttribute("for", input.id);
          label.textContent = m.label;

          group.appendChild(input);
          group.appendChild(label);
      });

      toolbar.appendChild(group);

      const anchor = this.querySelector(".ucb-preview-toolbar-anchor");
      if (anchor) {
          anchor.innerHTML = "";
          anchor.appendChild(toolbar);
      } else {
          this.appendChild(toolbar); // fallback
      }

      // Attach change listeners
      group.querySelectorAll(".btn-check").forEach((input) => {
          input.addEventListener("change", async (e) => {
            const mode = e.target.id.split("-")[2];
            const replaceable = this.querySelector(".ucb-preview-replaceable");
            if (!replaceable) return;

          // Clear old content
          replaceable.innerHTML = "";

          // Fade loader in
          await new Promise((resolve) => requestAnimationFrame(resolve));
          this.showLoader();


          try {
            if (mode === "default") {
              await new Promise((r) => setTimeout(r, 200));
              replaceable.innerHTML = this._originalHTML;
            } else {
              if (!this._nodeData) await this.fetchNodeData();
              this.renderPreview(mode, replaceable);
            }
          } catch (err) {
            console.error("ucb-trusted-preview render error:", err);
          } finally {
            // Fade loader out
            this.hideLoader();
          }
        });
      });
  };

  async fetchNodeData() {
    try {
      const res = await fetch(this._endpoint);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      this._nodeData = this.normalizeSingleEntry(json);
    } catch (e) {
      console.error("ucb-trusted-preview fetch error:", e);
    }
  }

  renderPreview(mode, container) {
    if (!this._nodeData) return;
    container.innerHTML = "";
    switch (mode) {
      case "feature":
        this.renderFeature(this._nodeData, container);
        break;
      default:
        this.renderTeaser(this._nodeData, container);
    }
  }

  normalizeSingleEntry(json) {
    const node = json.data[0];
    const included = json.included || [];
    const type = node.type.replace("node--", "");
    const title = node.attributes?.title || "";
    const urlBase = this._endpoint.split("/jsonapi/")[0];
    const relativePath =
      node.attributes?.path.alias ||
      `/node/${node.attributes?.drupal_internal__nid}`;
    const link = urlBase + relativePath;
    const summary =
      node.attributes?.field_ucb_article_summary ||
      node.attributes?.body?.summary ||
      "";
    const abstract = node.attributes?.field_abstract?.processed || null;

    let mediaId = null;
    if (type === "ucb_article") {
      mediaId = node.relationships?.field_ucb_article_thumbnail?.data?.id;
    } else if (type === "basic_page") {
      mediaId = node.relationships?.field_social_sharing_image?.data?.id;
    } else if (type === "ucb_person") {
      mediaId = node.relationships?.field_ucb_person_photo?.data?.id;
    }

    const media = included.find(
      (i) => i.type === "media--image" && i.id === mediaId
    );
    const fileId = media?.relationships?.field_media_image?.data?.id;
    const file = included.find(
      (i) => i.type === "file--file" && i.id === fileId
    );
    const alt = media?.relationships?.field_media_image?.data?.meta?.alt || "";

    return {
      title,
      link,
      summary,
      abstract,
      images: {
        focal_image_square: file?.links?.focal_image_square?.href || null,
        focal_image_wide: file?.links?.focal_image_wide?.href || null,
        alt: alt,
      },
    };
  }
// Renders
  renderTeaser(entry, container) {
    const outer = document.createElement("div");
    outer.classList = "ucb-article-list-block container";
    const article = document.createElement("article");
    article.classList = "ucb-article-card ucb-article-card-teaser row";

    const hasImage = entry.images?.focal_image_square;
    const body = document.createElement("div");
    body.classList = hasImage
      ? "col px-3 ucb-article-card-data"
      : "col ucb-article-card-data";

    const strong = document.createElement("strong");
    const link = document.createElement("a");
    link.classList = "ucb-article-card-title-teaser";
    link.href = entry.link;
    link.innerText = entry.title;
    strong.appendChild(link);
    body.appendChild(strong);
      const summary = document.createElement("p");
      summary.classList = "ucb-article-card-summary";
      summary.innerText = entry.summary;
      body.appendChild(summary);

    const readMore = document.createElement("a");
    readMore.href = entry.link;
    readMore.classList = "ucb-article-card-read-more";
    readMore.innerText = "Read More";
    body.appendChild(readMore);
    article.appendChild(body);

    if (hasImage) {
      const imgDiv = document.createElement("div");
      imgDiv.classList = "ucb-article-card-img";
      const imgLink = document.createElement("a");
      imgLink.href = entry.link;
      imgLink.setAttribute("role", "presentation");
      const img = document.createElement("img");
      img.src = entry.images.focal_image_square;
      img.alt = entry.images.alt;
      imgLink.appendChild(img);
      imgDiv.appendChild(imgLink);
      article.appendChild(imgDiv);
    }

    outer.appendChild(article);
    container.appendChild(outer);
  }

  renderFeature(entry, container) {
    const outer = document.createElement("div");
    outer.classList = "ucb-article-list-block container";
    const article = document.createElement("article");
    article.classList = "ucb-article-card ucb-article-card-feature";

    const body = document.createElement("div");
    body.classList = "col-sm-12 ucb-article-card-data";

    const link = document.createElement("a");
    link.href = entry.link;
    const header = document.createElement("p");
    header.classList = "ucb-article-card-title-feature";
    header.innerText = entry.title;
    link.appendChild(header);
    body.appendChild(link);

    const summary = document.createElement("div");
    summary.classList = "ucb-article-card-summary";
    summary.innerHTML = entry.summary || "";
    body.appendChild(summary);

    const readMore = document.createElement("a");
    readMore.href = entry.link;
    readMore.classList = "ucb-article-card-read-more";
    readMore.innerText = "Read More";
    body.appendChild(readMore);
    article.appendChild(body);

    const hasImage = entry.images?.focal_image_wide;
    if (hasImage) {
      const imgDiv = document.createElement("div");
      const imgLink = document.createElement("a");
      imgLink.href = entry.link;
      const img = document.createElement("img");
      img.classList = "ucb-article-card-img-wide";
      img.src = entry.images.focal_image_wide;
      img.alt = entry.images.alt;
      imgLink.appendChild(img);
      imgDiv.appendChild(imgLink);
      article.appendChild(imgDiv);
    }

    outer.appendChild(article);
    container.appendChild(outer);
  }
  // Fixes links within Abstracts
  normalizeLinks(container) {
    container.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      try {
        const url = new URL(href, this._baseURI);
        if (!/^https?:\/\//i.test(href)) link.href = url.href;
      } catch (e) {
        console.warn("Bad href:", href);
      }
    });
  }

  buildTrustedContentShareURL(site, type, nid) {
    const baseFields = {
      ucb_article:
        "title,body,field_abstract,field_ucb_article_summary,field_ucb_article_thumbnail,changed,nid,path",
      ucb_person:
        "title,body,field_abstract,changed,field_ucb_person_photo,nid,path",
      basic_page:
        "title,body,field_abstract,changed,nid,path,field_social_sharing_image",
    };

    const includeFields = {
      ucb_article: "field_ucb_article_thumbnail.field_media_image",
      ucb_person:
        "field_ucb_person_photo,field_ucb_person_photo.field_media_image",
      basic_page:
        "field_social_sharing_image,field_social_sharing_image.field_media_image",
    };

    const shortType = type.replace(/^node--/, "");
    const fields = baseFields[shortType];
    const includes = includeFields[shortType];
    const params = [];
    params.push(`fields[node--${shortType}]=${encodeURIComponent(fields)}`);
    params.push("fields[media--image]=field_media_image");
    params.push("fields[file--file]=uri,url");
    params.push(`filter[nid]=${encodeURIComponent(nid)}`);
    if (includes) params.push(`include=${encodeURIComponent(includes)}`);
    return `${site}/jsonapi/node/${shortType}?${params.join("&")}`;
  }

  // Loader Toggles
  showLoader() {
    if (this._loader) {
      this._loader.style.display = "flex";
      requestAnimationFrame(() => this._loader.classList.add("active"));
    }
  }

  hideLoader() {
    if (this._loader) {
      this._loader.classList.remove("active");
      // Wait for fade-out transition before hiding
      setTimeout(() => (this._loader.style.display = "none"), 300);
    }
  }

}
  customElements.define("ucb-trusted-preview", TrustedContentPreview);
})(window.customElements);
