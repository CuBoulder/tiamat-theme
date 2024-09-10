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
        .catch(() => this.displayError());
    }

    /**
     * Calls the API and gets the list of publications.
     *
     * @returns
     *   The returned list of publications.
     */
    async getResults() {
      // TODO: Query parameters.
      const response = await fetch(
        'https://search-experts-direct-cz3fpq4rlxcbn5z27vzq4mpzaa.us-east-2.es.amazonaws.com/fispubs-v1/_search',
        {
          headers: {
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
        const publicatonName = safe(publication['_source']['name']);
        const publicatonLink = safe(publication['_source']['uri']);
        publicationsHTML += `<div><h3 class="h5"><a target="_blank" href="${publicatonLink}">${publicatonName}</a></h3>`;
        // TODO: More info here.
        publicationsHTML += '</div>';
      });
      this.innerHTML = publicationsHTML;
    }

    /**
     * Displays an error message if an error occurred.
     */
    displayError() {
      this.innerHTML = '<p><strong>There was a problem fetching the publication data. Please try again later.</strong></p>';
    }

    /**
     * Displays an error message if no publications were returned.
     */
    displayNoResults() {
      this.innerHTML = '<p><strong>There were no publications returned.</strong></p>';
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

  // Registers the `<faculty-publications>` element as a web component
  // instance.
  customElements.define('faculty-publications', FacultyPublicationsElement);

})(customElements);
