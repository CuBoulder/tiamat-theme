(function (customElements) {

  /**
   * Newsletter MJML Preview web component.
   *
   * Reads the raw MJML produced by the newsletter MJML view mode templates
   * (node--newsletter--email-mjml.html.twig and
   * paragraph--newsletter-section--email-mjml.html.twig), sends it to an MJML
   * render endpoint, and shows the compiled email HTML in a preview iframe when
   * the user clicks the preview button, along with the MJML and HTML for easy copy/ pasting.
   *
   * The MJML source is read from a <script type="text/mjml"> child so the
   * browser does not parse the MJML tags as DOM (which would mangle
   * self-closing tags like <mj-image ... />).
   *
   * Attributes:
   *   data-endpoint       Render endpoint. The template points this at the
   *                       server-side MJML render proxy provided by the
   *                       ucb_site_configuration module so the MJML API
   *                       credentials are never exposed client side. Falls back
   *                       to the proxy path when the attribute is absent.
   *   data-authorization  Optional value for the Authorization header, only
   *                       needed if pointing data-endpoint directly at the MJML
   *                       API instead of the proxy (not recommended: this
   *                       exposes the credentials to end users).
   */
  class NewsletterMjmlPreviewElement extends HTMLElement {

    static get errorMessage() {
      return 'Error generating the email preview. Please try again later.';
    }

    static get emptyMessage() {
      return 'No MJML content was found to preview.';
    }

    static get defaultEndpoint() {
      return '/newsletter-mjml/render';
    }

    constructor() {
      super();

      // Render endpoint and optional auth header, both configurable via markup
      this._endpoint = this.getAttribute('data-endpoint') || NewsletterMjmlPreviewElement.defaultEndpoint;
      this._authorization = this.getAttribute('data-authorization') || '';

      // Controls bar with the preview btn
      this._controls = document.createElement('div');
      this._controls.className = 'ucb-mjml-preview-controls';

      this._button = document.createElement('button');
      this._button.type = 'button';
      this._button.className = 'ucb-mjml-preview-button';
      this._button.textContent = 'Preview email';
      this._button.onclick = () => this.renderPreview();
      this._controls.appendChild(this._button);

      // Light/dark toggle
      this._scheme = 'light';
      this._schemeToggle = document.createElement('button');
      this._schemeToggle.type = 'button';
      this._schemeToggle.className = 'ucb-mjml-preview-toggle';
      this._schemeToggle.setAttribute('aria-pressed', 'false');
      this._schemeToggle.textContent = 'Dark mode';
      this._schemeToggle.onclick = () => this.toggleScheme();
      this._controls.appendChild(this._schemeToggle);

      this.appendChild(this._controls);

      // Last compiled HTML, kept so the toggle can re-render without re-fetching
      this._lastHtml = '';

      // Load
      this._loadingElement = document.createElement('div');
      this._loadingElement.className = 'ucb-list-msg ucb-loading-data ucb-mjml-preview-loading';
      this._loadingElement.innerHTML = '<span class="visually-hidden">Loading</span><i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';
      this._loadingElement.style.display = 'none';
      this.appendChild(this._loadingElement);

      // Error
      this._errorElement = document.createElement('div');
      this._errorElement.className = 'ucb-list-msg ucb-block-error ucb-mjml-preview-error';
      this._errorElement.innerText = NewsletterMjmlPreviewElement.errorMessage;
      this._errorElement.style.display = 'none';
      this.appendChild(this._errorElement);

      // Preview iframe. Sandboxed so preview markup/scripts cannot touch the page.
      this._previewFrame = document.createElement('iframe');
      this._previewFrame.className = 'ucb-mjml-preview-frame';
      this._previewFrame.title = 'Email preview';
      this._previewFrame.setAttribute('sandbox', 'allow-same-origin');
      this._previewFrame.style.display = 'none';
      this.appendChild(this._previewFrame);

      // Copy/paste boxes holding the compiled MJML document and the email HTML
      this._sources = document.createElement('div');
      this._sources.className = 'ucb-mjml-preview-sources';
      this._sources.style.display = 'none';

      this._mjmlField = this.createSourceField('MJML source');
      this._htmlField = this.createSourceField('Email HTML');
      this._sources.appendChild(this._mjmlField.container);
      this._sources.appendChild(this._htmlField.container);
      this.appendChild(this._sources);
    }

    /**
     * Builds a labelled read-only textarea with its own copy button
     *
     * @param {string} label
     *   Visible label, also used as the field's accessible name
     * @returns {{container: HTMLElement, textarea: HTMLTextAreaElement}}
     *   The field wrapper and the textarea holding the source
     */
    createSourceField(label) {
      const container = document.createElement('div');
      container.className = 'ucb-mjml-preview-source';

      const header = document.createElement('div');
      header.className = 'ucb-mjml-preview-source-header';

      const heading = document.createElement('span');
      heading.className = 'ucb-mjml-preview-source-label';
      heading.textContent = label;
      header.appendChild(heading);

      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.className = 'ucb-mjml-preview-copy';
      copyButton.textContent = 'Copy';
      header.appendChild(copyButton);

      const textarea = document.createElement('textarea');
      textarea.className = 'ucb-mjml-preview-source-text';
      textarea.readOnly = true;
      textarea.spellcheck = false;
      textarea.setAttribute('wrap', 'off');
      textarea.setAttribute('aria-label', label);

      copyButton.onclick = () => this.copyToClipboard(textarea, copyButton);

      container.appendChild(header);
      container.appendChild(textarea);

      return { container: container, textarea: textarea };
    }

    /**
     * Copies a source field to the clipboard
     *
     * @param {HTMLTextAreaElement} textarea
     *   The field to copy from.
     * @param {HTMLButtonElement} button
     *   The button to report the result on.
     */
    async copyToClipboard(textarea, button) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(textarea.value);
        } else {
          textarea.select();
          document.execCommand('copy');
        }
        button.textContent = 'Copied';
      } catch (error) {
        console.error(error);
        // Leave the text selected
        textarea.select();
        button.textContent = 'Copy failed';
      }

      window.setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    }

    /**
     * Reads the raw MJML source from the <script type="text/mjml"> child and
     * ensures it is wrapped in a complete <mjml> document.
     *
     * @returns {string} The MJML document, or an empty string if none exists.
     */
    getMjmlSource() {
      const sourceElement = this.querySelector('script[type="text/mjml"]');
      if (!sourceElement) {
        return '';
      }

      const source = sourceElement.textContent.trim();
      if (!source) {
        return '';
      }

      // Wrap bare fragments so a valid MJML document is always sent
      if (source.indexOf('<mjml') === -1) {
        return `<mjml><mj-body>${source}</mj-body></mjml>`;
      }
      return source;
    }

    /**
     * Compiles the MJML source and renders the resulting email HTML
     */
    async renderPreview() {
      const mjml = this.getMjmlSource();
      if (!mjml) {
        this.toggleError(true, NewsletterMjmlPreviewElement.emptyMessage);
        return;
      }

      this.toggleError(false);
      this.toggleLoading(true);
      this._button.disabled = true;

      try {
        const html = await this.fetchRenderedHtml(mjml);
        this.showPreview(html);
        this.showSources(mjml, html);
        this.toggleLoading(false);
      } catch (error) {
        console.error(NewsletterMjmlPreviewElement.errorMessage);
        console.error(error);
        this.toggleLoading(false);
        this.toggleError(true);
      } finally {
        this._button.disabled = false;
      }
    }

    /**
     * Sends the MJML to the render endpoint and returns the compiled HTML
     *
     * @param {string} mjml
     *   The MJML document to compile.
     * @returns {Promise<string>}
     *   The compiled email HTML.
     */
    async fetchRenderedHtml(mjml) {
      const headers = { 'Content-Type': 'application/json' };
      if (this._authorization) {
        headers.Authorization = this._authorization;
      }

      const response = await fetch(this._endpoint, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ mjml: mjml }),
      });

      if (!response.ok) {
        throw new Error(`MJML render endpoint responded with ${response.status}`);
      }

      const data = await response.json();

      // The MJML API returns validation issues in an "errors" array but still
      // provides best-effort HTML, so log them without aborting the preview.
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        console.warn('MJML validation warnings:', data.errors);
      }

      if (!data.html) {
        throw new Error('MJML render endpoint returned no HTML.');
      }
      return data.html;
    }

    /**
     * Injects compiled email HTML into the sandboxed preview iframe
     *
     * @param {string} html
     *   The compiled email HTML.
     */
    showPreview(html) {
      this._lastHtml = html;
      this.renderFrame();
      this._previewFrame.style.display = 'block';
    }

    /**
     * Fills the copy/paste boxes with the MJML and Email HTML from transpiler
     *
     * @param {string} mjml
     *   The MJML document that was submitted.
     * @param {string} html
     *   The compiled email HTML returned by the renderer.
     */
    showSources(mjml, html) {
      this._htmlField.textarea.value = html;
      this._mjmlField.textarea.value = mjml;
      this._sources.style.display = 'block';
    }

    /**
     * Flips the preview between light and dark
     */
    toggleScheme() {
      this._scheme = this._scheme === 'dark' ? 'light' : 'dark';
      const isDark = this._scheme === 'dark';
      this._schemeToggle.textContent = isDark ? 'Light mode' : 'Dark mode';
      this._schemeToggle.setAttribute('aria-pressed', String(isDark));
      if (this._lastHtml) {
        this.renderFrame();
      }
    }

    /**
     * Renders the last compiled email into the iframe for the selected color
     */
    renderFrame() {
      if (!this._lastHtml) {
        return;
      }

      const isDark = this._scheme === 'dark';
      const darkMediaQuery = /@media[^{]*prefers-color-scheme\s*:\s*dark[^{]*\)/gi;
      let html = this._lastHtml;

      if (isDark) {
        // Force every dark-mode block to always apply
        html = html.replace(darkMediaQuery, '@media all');
        html = html.replace(/content=(["'])light dark\1/gi, 'content="dark"');
      } else {
        // Disable dark-mode blocks so an OS set to dark can't leak in
        html = html.replace(darkMediaQuery, '@media (max-width: 0px)');
        html = html.replace(/content=(["'])light dark\1/gi, 'content="light"');
      }

      this._previewFrame.style.colorScheme = isDark ? 'dark' : 'light';
      this._previewFrame.style.backgroundColor = isDark ? '#222222' : '#ffffff';
      this._previewFrame.srcdoc = html;
    }

    toggleLoading(show) {
      this._loadingElement.style.display = show ? 'block' : 'none';
    }

    toggleError(show, message) {
      if (message) {
        this._errorElement.innerText = message;
      }
      this._errorElement.style.display = show ? 'block' : 'none';
    }

  }

  customElements.define('newsletter-mjml-preview', NewsletterMjmlPreviewElement);

})(window.customElements);
