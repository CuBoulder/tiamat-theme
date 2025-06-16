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
        basic_page: ['title', 'body', 'nid', 'path']
      };
    }

connectedCallback() {
  const fullType = this.getAttribute("node-type");
  // strip out the node-- for api
  const shortType = fullType.replace(/^node--/, '');
  const nid = this.getAttribute("nid");

  const baseFields = {
    ucb_article: 'title,body,field_ucb_article_summary,field_ucb_article_thumbnail,changed,nid,path',
    ucb_person: 'title,body,changed,field_ucb_person_photo,nid,path',
    basic_page: 'title,body,changed,nid,path'
  };

  const includeFields = {
    ucb_article: 'field_ucb_article_thumbnail,field_ucb_article_thumbnail.field_media_image',
    ucb_person: 'field_ucb_person_photo,field_ucb_person_photo.field_media_image',
    basic_page: ''
  };

  const query = new URLSearchParams();

  const fieldList = baseFields[shortType];
  if (fieldList) {
    query.set(`fields[node--${shortType}]`, fieldList);
  }

  query.set('fields[media--image]', 'field_media_image');
  query.set('fields[file--file]', 'uri,url');

  const includes = includeFields[shortType];
  if (includes) {
    query.set('include', includes);
  }

// filter by nid
  query.set('filter[nid]', nid);

  const fullUrl = `${this._baseURI}/jsonapi/node/${shortType}?${query.toString()}`;
  this.renderUI(fullUrl);
}






    includeForType(type) {
      switch (type) {
        case 'ucb_article':
          return 'field_ucb_article_thumbnail.field_media_image';
        case 'ucb_person':
          return 'field_ucb_person_photo.field_media_image';
        default:
          return '';
      }
    }

    renderUI(url) {
      this.innerHTML = `
        <div style="margin-top: 0.5rem;">
          <input type="text" value="${url}" readonly style="width: 100%; padding: 4px;" />
          <button type="button">Copy Link</button>
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
