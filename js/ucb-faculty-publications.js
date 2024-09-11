(function(customElements) {

  /**
   * Defines a web component for loading and displaying a list of faculty
   * publications.
   */
  class FacultyPublicationsElement extends HTMLElement {

    /**
     * Constructs a new FacultyPublicationsElement.
     */
    constructor() {
      super();
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
      this.displayLoader();
      const
        from = this.getAttribute('from'),
        to = this.getAttribute('to'),
        department = this.getAttribute('department'),
        departmentId = parseInt(department),
        email = this.getAttribute('email'),
        sort = this.getAttribute('sort'),
        query = [],
        params = new URLSearchParams();
      if (from || to) {
        // Defaults to the current date for a field that isn't set.
        const currentDate = new Date();
        query.push(`publicationDate:[${from || currentDate.toISOString()} TO ${to || currentDate.toISOString()}]`);
      }
      if (department) {
        query.push(`authors.organization.${isNaN(departmentId) ? 'name:' + department : 'id:' + departmentId}`);
      }
      if (email) {
        query.push(`authors.email:${email}`);
      }
      if (query.length > 0) {
        // Joins filters with AND.
        params.set('q', query.join(' AND '));
      }
      // TODO: Figure out why this seems to disable the filters.
      // params.set('sort', sort == 'date-asc' ? 'publicationDate:asc' : 'publicationDate:desc');
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
        publications: json['hits']['hits']
      };
    }

    /**
     * Displays the returned list of publications.
     *
     * @param results
     *   The returned list of publications.
     */
    displayResults(results) {
      const publications = results.publications;
      if (!publications) {
        this.displayNoResults();
        return;
      }
      let publicationsHTML = '';
      publications.forEach(publication => {
        publication = publication['_source'];
        publicationsHTML += '<div>\n'
          + '<h3 class="h5">\n'
          + `${link(preserveItalics(safe(publication['name'])), publication['uri'])}\n`
          + '</h3>\n'
          + '<div>\n'
          + '<strong>CU Boulder Authors:</strong>\n'
          + '<ul class="faculty-publications-authors">\n';
        publication['authors'].forEach(author => {
          publicationsHTML += `<li>${link(safe(author['name']), author['uri'])}</li>\n`;
        });
        publicationsHTML += '</ul>\n'
          + '</div>\n'
          + '<div>\n'
          + '<strong>All Authors:</strong>\n'
          + '<ul class="faculty-publications-authors">\n';
        publication['citedAuthors'].split(';').forEach(citedAuthor => {
          publicationsHTML += `<li>${citedAuthor}</li>\n`;
        });
        publicationsHTML += '</ul>\n'
          + '</div>\n'
          + '<div>\n'
          + '<strong>Published in:</strong>\n'
          + `${link(safe(publication['publishedIn']['name']), publication['publishedIn']['uri'])}\n`
          + '</div>\n'
          + '<div>\n'
          + '<strong>Publication Date:</strong>\n'
          + `${safe(publication['publicationDate'])}\n`
          + '</div>\n'
          + '<div>\n'
          + '<strong>Type:</strong>\n'
          + `${safe(publication['mostSpecificType'])}\n`
          + '</div>\n'
          + '</div>\n'
          + '</div>';
      });
      this.innerHTML = publicationsHTML;
    }

    /**
     * Displays the loader while the publications are being fetched.
     */
    displayLoader() {
      this.innerHTML = '<span class="visually-hidden">Loading</span>\n'
        + '<i aria-hidden="true" class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';
    }

    /**
     * Displays an error message if an error occurred.
     */
    displayError() {
      this.innerHTML = '<p>\n'
        + '<strong>There was a problem fetching the publication data. Please try again later.</strong>\n'
        + '</p>';
    }

    /**
     * Displays an error message if no publications were returned.
     */
    displayNoResults() {
      this.innerHTML = '<p>\n'
        + '<strong>There were no publications returned.</strong>\n'
        + '</p>';
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
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * Preserves `<i>` italics in HTML-safe text.
   *
   * @param {string} safeText
   *   Text that has been made HTML-safe.
   * @returns
   *   The text with italics preserved.
   */
  function preserveItalics(safeText) {
    return safeText
      .replace(/&lt;i&gt;/g, '<span class="fst-italic">')
      .replace(/&lt;\/i&gt;/g, '</span>')
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

  // Registers the `<faculty-publications>` element as a web component
  // instance.
  customElements.define('faculty-publications', FacultyPublicationsElement);

})(customElements);
