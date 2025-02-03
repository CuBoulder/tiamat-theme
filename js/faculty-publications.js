/**
 * @file Contains the Faculty Publications web component.
 */

(function(customElements) {

  /**
   * Defines a web component for loading and displaying a list of faculty
   * publications.
   */
  class FacultyPublicationsElement extends HTMLElement {

    /**
     * The offset to load from when a user presses the load more button.
     */
    offset = 0;

    /**
     * The element in which to display results.
     */
    resultsElement = document.createElement('div');

    /**
     * The element in which to display error or other messages.
     */
    messagesElement = document.createElement('div');

    /**
     * The element in which to display user controls.
     */
    controlsElement = document.createElement('div');

    /**
     * The loading throbber to display while results are loading.
     */
    throbberElement = document.createElement('div');

    /**
     * Constructs a new FacultyPublicationsElement.
     */
    constructor() {
      super();

      this.controlsElement.innerHTML = '<a role="button" class="faculty-publications-load" href="#"></a>';
      this.controlsElement.setAttribute('hidden', '');
      this.throbberElement.innerHTML = '<span class="visually-hidden">Loading</span>'
        + '<i aria-hidden="true" class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';

      this.appendChild(this.resultsElement);
      this.appendChild(this.messagesElement);
      this.appendChild(this.controlsElement);
      this.appendChild(this.throbberElement);

      /**
       * The button the user can click to load more results.
       */
      this.loadButtonElement = this.controlsElement.querySelector('.faculty-publications-load');
      this.loadButtonElement.addEventListener('click', event => {
        event.preventDefault();
        this.load()
      });

      // Loads the initial list of publications.
      this.load();
    }

    /**
     * Performs a load request to load results.
     */
    load() {
      this.getResults()
        .then(results => this.displayResults(results))
        .catch(error => {
          console.error(error);
          this.displayError();
        });
    }

    /**
     * Calls the API and gets the list of publications.
     *
     * @returns
     *   The returned list of publications.
     */
    async getResults() {
      this.messagesElement.setAttribute('hidden', '');
      this.controlsElement.setAttribute('hidden', '');
      this.throbberElement.removeAttribute('hidden');

      const
        from = this.getAttribute('from'),
        to = this.getAttribute('to'),
        department = this.getAttribute('department'),
        departmentId = parseInt(department),
        email = this.getAttribute('email'),
        sort = this.getAttribute('sort'),
        count = parseInt(this.getAttribute('count') || '25'),
        emails = this.getAttribute('emails'),
        emailQuotedStrings = [],
        query = [],
        params = new URLSearchParams();

      // Sets up query string.
      if (from || to) {
        // Defaults to the current date for a field that isn't set.
        query.push(`publicationDate:[${new Date(from).toISOString()} TO ${(to ? new Date(to) : new Date()).toISOString()}]`);
      }
      if (department) {
        query.push(`authors.organization.${isNaN(departmentId) ? `name:${quotedString(department)}` : `id:${departmentId}`}`);
      }
      if (email) {
        emailQuotedStrings.push(quotedString(email));
      }
      if (emails) {
        JSON.parse(emails).forEach(email => emailQuotedStrings.push(quotedString(email)));
      }
      if (emailQuotedStrings.length > 0) {
        query.push(`authors.email:(${emailQuotedStrings.join(',')})`);
      }

      if (query.length > 0) {
        // Joins filters with AND.
        params.set('q', query.join(' AND '));
      }
      params.set('sort', sort == 'date-asc' ? 'publicationDate:asc' : 'publicationDate:desc');
      params.set('from', this.offset);
      params.set('size', `${count > 0 ? count : 25}`);

      const paramsToString = params.toString();
      const response = await fetch(
        `https://search-experts-direct-cz3fpq4rlxcbn5z27vzq4mpzaa.us-east-2.es.amazonaws.com/fispubs-v1/_search?${paramsToString}`,
        {
          headers: {
            // Equivalent to `Basic ${btoa('anon:anonyM0us!')}`.
            Authorization: 'Basic YW5vbjphbm9ueU0wdXMh'
          }
        }
      );

      const json = await response.json();
      return {
        publications: json['hits']['hits'],
        count: json['hits']['total']['value']
      };
    }

    /**
     * Displays the returned list of publications.
     *
     * @param results
     *   The returned list of publications.
     */
    displayResults(results) {
      this.messagesElement.setAttribute('hidden', '');
      this.controlsElement.setAttribute('hidden', '');
      this.throbberElement.setAttribute('hidden', '');

      const { publications, count } = results;
      if (publications.length === 0) {
        if (this.offset === 0) {
          this.displayNoResults();
        }
        return;
      }
      let publicationsHTML = '';
      publications.forEach(publication => {
        publication = publication['_source'];
        publicationsHTML += '<div>'
          + '<h3 class="h5">'
          + link(preserveAllowedHTML(safe(publication['name'])), publication['uri'])
          + '</h3>';
        if (publication['authors']) {
          publicationsHTML += '<div>'
            + '<strong>CU Boulder Authors:</strong> '
            + publication['authors']
                .map(author => link(safe(author['name']), author['uri']))
                .join('; ')
            + '</div>';
        }
        if (publication['citedAuthors']) {
          publicationsHTML += '<div>'
            + '<strong>All Authors:</strong> '
            + safe(publication['citedAuthors'])
            + '</div>';
        }
        if (publication['publishedIn']) {
          publicationsHTML += '<div>'
            + '<strong>Published in:</strong> '
            + link(safe(publication['publishedIn']['name']), publication['publishedIn']['uri'])
            + '</div>';
        }
        if (publication['publicationDate']) {
          publicationsHTML += '<div>'
            + '<strong>Publication Date:</strong> '
            + safe(publication['publicationDate'])
            + '</div>';
        }
        if (publication['mostSpecificType']) {
          publicationsHTML += '<div>'
            + '<strong>Type:</strong> '
            + safe(publication['mostSpecificType'])
            + '</div>';
        }
        publicationsHTML += '</div>';
      });
      this.resultsElement.innerHTML += publicationsHTML;
      this.offset += publications.length;
      if (this.offset < count) {
        this.controlsElement.removeAttribute('hidden');
        this.loadButtonElement.innerHTML = '<i class="fa-solid fa-chevron-down"></i> More publications';
      }
    }

    /**
     * Displays an error message if an error occurred.
     */
    displayError() {
      this.messagesElement.innerHTML = '<p>'
        + '<strong>There was a problem fetching the publication data. Please try again later.</strong>'
        + '</p>';
      this.loadButtonElement.innerHTML = '<i class="fa-solid fa-rotate-right"></i> Retry';
      this.messagesElement.removeAttribute('hidden');
      this.messagesElement.classList.add('ucb-block-error');
      this.controlsElement.removeAttribute('hidden');
      this.throbberElement.setAttribute('hidden', '');
    }

    /**
     * Displays an error message if no publications were returned.
     */
    displayNoResults() {
      this.messagesElement.innerHTML = '<p>'
        + '<strong>There were no publications returned.</strong>'
        + '</p>';
      this.messagesElement.removeAttribute('hidden');
      this.messagesElement.classList.add('ucb-block-error');
    }

  }

  /**
   * Converts input text to an HTML-safe string.
   *
   * @param {string} text
   *   The input text.
   * @returns
   *   The HTML-safe text.
   */
  function safe(text) {
    return text
      // Strips unsupported MathML tags.
      .replace(/<\/?mml[^>]*>/gi, '')
      // Escapes HTML characters.
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Preserves allowed tags in HTML-safe text.
   *
   * @param {string} safeText
   *   Text that has been made HTML-safe.
   * @returns
   *   The text with allowed tags preserved.
   */
  function preserveAllowedHTML(safeText) {
    return safeText
      .replace(/&lt;i&gt;/gi, '<span class="fst-italic">')
      .replace(/&lt;\/i&gt;/gi, '</span>')
      .replace(/&lt;sub&gt;/gi, '<sub>')
      .replace(/&lt;\/sub&gt;/gi, '</sub>')
      .replace(/&lt;sup&gt;/gi, '<sup>')
      .replace(/&lt;\/sup&gt;/gi, '</sup>');
  }

  /**
   * Returns a link if `uri` is defined, otherwise returns the text.
   *
   * @param {string} safeText
   *   The link text.
   * @param {string|undefined} uri
   *   The URI to link to.
   * @returns
   *   The HTML link, if `uri` is valid.
   */
  function link(safeText, uri) {
    return uri ? `<a target="_blank" href="${safe(uri)}">${safeText}</a>` : safeText;
  }

  /**
   * Converts text to a quoted string.
   *
   * @param {string} text
   *   The text.
   * @returns
   *   The text as a quoted string.
   */
  function quotedString(text) {
    return '"' + text
      .toLowerCase()
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"') + '"';
  }

  // Registers the `<faculty-publications>` element as a web component
  // instance.
  customElements.define('faculty-publications', FacultyPublicationsElement);

})(customElements);
