(function (customElements) {
  class TrustedShareButton extends HTMLElement {
    constructor() {
      super();
      this._baseURI = this.getAttribute("base-uri");
      this.nid = this.getAttribute("nid");
      this.contentType = this.getAttribute("node-type");
    }

    connectedCallback() {
      const fullType = this.contentType;
      const shortType = fullType.replace(/^node--/, '');
      const nid = this.nid;
      const site = this._baseURI.replace(/\/$/, ''); // remove trailing slash if any

      // Generate share pattern string
      const sharePattern = `${site}|${shortType}|${nid}`;

      this.renderUI(sharePattern);
    }

    renderUI(pattern) {
      this.innerHTML = `
        <div class="ucb-discover-card-share-section">
          <i class="fa-solid fa-share"></i>
          <input type="text" value="${pattern}" readonly style="width: 100%; padding: 4px;" />
          <button class="button" type="button">Copy Pattern</button>
        </div>
      `;

      const input = this.querySelector('input');
      const button = this.querySelector('button');
      button.addEventListener('click', () => {
        input.select();
        document.execCommand('copy');
        button.textContent = 'Copied!';
        setTimeout(() => (button.textContent = 'Copy Pattern'), 1500);
      });
    }
  }

  customElements.define('trusted-share-button', TrustedShareButton);
})(window.customElements);
