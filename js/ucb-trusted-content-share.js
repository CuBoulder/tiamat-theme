(function (customElements) {
  class TrustedShareButton extends HTMLElement {
    constructor() {
      super();
      this._baseURI = this.getAttribute("base-uri");
      this.nid = this.getAttribute("nid");
      this.contentType = this.getAttribute("node-type");

      this.fieldsByType = {
        ucb_article: ['title', 'field_ucb_article_summary', 'field_ucb_article_thumbnail', 'nid', 'path'],
        ucb_person: ['title', 'body', 'field_ucb_person_photo', 'nid', 'path'],
        basic_page: ['title', 'body', 'nid', 'path', 'field_social_sharing_image']
      };
    }

    connectedCallback() {
      const fullType = this.getAttribute("node-type");
      const shortType = fullType.replace(/^node--/, '');
      const nid = this.getAttribute("nid");

      const baseFields = {
        ucb_article: 'title,body,field_ucb_article_summary,field_ucb_article_thumbnail,changed,nid,path',
        ucb_person: 'title,body,changed,field_ucb_person_photo,nid,path',
        basic_page: 'title,body,changed,nid,path,field_social_sharing_image'
      };

      const includeFields = {
        ucb_article: 'field_ucb_article_thumbnail.field_media_image',
        ucb_person: 'field_ucb_person_photo,field_ucb_person_photo.field_media_image',
        basic_page: 'field_social_sharing_image,field_social_sharing_image.field_media_image'
      };

      const fieldList = baseFields[shortType];
      const includes = includeFields[shortType];


      const params = [];
      params.push(`fields[node--${shortType}]=${encodeURIComponent(fieldList)}`);
      params.push('fields[media--image]=field_media_image');
      params.push('fields[file--file]=uri,url');
      params.push(`filter[nid]=${encodeURIComponent(nid)}`);
      if (includes) {
        const includeParams = includes.split(',').map((inc) => `include=${encodeURIComponent(inc)}`);
        params.push(...includeParams);
      }

      const fullUrl = `${this._baseURI}/jsonapi/node/${shortType}?${params.join('&')}`;

      this.renderUI(fullUrl);
    }

    includeForType(type) {
      switch (type) {
        case 'ucb_article':
          return 'field_ucb_article_thumbnail.field_media_image';
        case 'ucb_person':
          return 'field_ucb_person_photo.field_media_image';
        case 'basic_page':
          return 'field_social_sharing_image.field_media_image';
        default:
          return '';
      }
    }

    renderUI(url) {
      this.innerHTML = `
        <div class="ucb-discover-card-share-section">
          <i class="fa-solid fa-share"></i>
          <input type="text" value="${url}" readonly style="width: 100%; padding: 4px;" />
          <button class="button" type="button">Copy Link</button>
        </div>
      `;

      const input = this.querySelector('input');
      const button = this.querySelector('button');
      button.addEventListener('click', () => {
        input.select();
        document.execCommand('copy');
        button.textContent = 'Copied!';
        setTimeout(() => (button.textContent = 'Copy Link'), 1500);
      });
    }
  }

  customElements.define('trusted-share-button', TrustedShareButton);
})(window.customElements);
