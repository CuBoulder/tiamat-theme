(function (customElements) {
  class NewsletterListElement extends HTMLElement {

    static get errorMessage() {
      return 'Error retrieving Newsletters from the API endpoint. Please try again later.';
    }

    static get noResultsMessage() {
      return 'No results matching your filters.';
    }

    constructor() {
      super();
      this._baseURI = this.getAttribute('baseURI');
      this.count = parseInt(this.getAttribute('count'));
      this.newsletterType = this.getAttribute('newsletter-type');
      this.taxonomyMap;
      this.taxonomyName;

      // Loader
      this._loadingElement = document.createElement('div');
      this._loadingElement.innerHTML = `<span class="visually-hidden">Loading</span><i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>`;
      this._loadingElement.className = 'ucb-list-msg ucb-loading-data';
      this._loadingElement.id = 'ucb-al-loading'
      this._loadingElement.style.display = 'none';
      this.appendChild(this._loadingElement);
      this.toggleLoading(true);

      // Error
      this._errorElement = document.createElement('div');
      this._errorElement.innerText = NewsletterListElement.errorMessage;
      this._errorElement.className = 'ucb-list-msg ucb-error';
      this._errorElement.id = 'ucb-al-error'
      this._errorElement.style.display = 'none';
      this.appendChild(this._errorElement);

      // Fetch taxonomy terms to build the map first
      fetch(`${this._baseURI}/jsonapi/taxonomy_term/newsletter`)
        .then(response => {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.json();
        })
        .then(data => {
          // Create the ID-to-name map
          this.taxonomyMap = data.data.reduce((map, term) => {
            map[term.id] = term.attributes.name;
            return map;
          }, {});

          // Now that the taxonomyMap is ready, fetch newsletters
          this.fetchNewsletters();
        })
        .catch(error => {
          console.log("Failed to fetch taxonomy terms:", error);
          this.toggleLoading(false);
          this.toggleError(true);
        });
    }

    fetchNewsletters() {
      const publishedParams = '&filter[published][group][conjunction]=AND'
      + '&filter[publish-check][condition][path]=status'
      + '&filter[publish-check][condition][value]=1'
      + '&filter[publish-check][condition][memberOf]=published';

    fetch(`${this._baseURI}/jsonapi/node/newsletter?include=field_newsletter_section_block.field_newsletter_section_select.field_newsletter_article_select${publishedParams}&filter[field_newsletter_type.meta.drupal_internal__target_id][value]=${this.newsletterType}&sort=-created`)
        .then(this.handleError)
        .then((data) => this.build(data, this.count))
        .catch(error => {
          console.log(error);
        });
    }

    handleError = response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      } else {
        return response.json();
      }
    };

    // Traverses through nested paragraphs to grab the first one Newsletter -> First Section -> First Newsletter Article or First Newsletter Content. If first article -> get the article
    build(data, count) {
      const newsletters = data["data"];
      const references = data["included"];
      const newsletterElements = []; // Array to hold newsletter elements

      if(newsletters.length == 0){
        this.toggleLoading(false);
        this.toggleError(true);
        this._errorElement.innerText = NewsletterListElement.noResultsMessage;
        ;
        return;
      }

      // Loop through newsletters up to the specified count
      for (let i = 0; i < Math.min(newsletters.length, count); i++) {
        const newsletter = newsletters[i];
        const newsletterTitle = newsletter.attributes.title;

        // Get the path using taxonomy and title
        const taxonomyId = newsletter.relationships.field_newsletter_type?.data.id;
        this.taxonomyName = this.taxonomyMap[taxonomyId];
        const path = newsletter.attributes.path.alias
          ? newsletter.attributes.path.alias
          : `/node/${newsletter.attributes.drupal_internal__nid}`;

        // Check for a summary field in the newsletter
        let summary = newsletter.attributes.field_newsletter_summary;
        // If no summary is present, fall back to content processing
        if (!summary) {
          const sectionBlockRef = newsletter.relationships.field_newsletter_section_block?.data[0];
          if (sectionBlockRef) {
            const sectionBlock = references.find(
              ref => ref.id === sectionBlockRef.id && ref.type === 'paragraph--newsletter_section'
            );

            if (sectionBlock) {
              // Access the array of section items in the section block
              const sectionSelectRefs = sectionBlock.relationships?.field_newsletter_section_select?.data;

              if (sectionSelectRefs && sectionSelectRefs.length > 0) {
                // Loop through section items and find the first valid content
                for (const sectionSelectRef of sectionSelectRefs) {
                  const sectionContent = references.find(ref => ref.id === sectionSelectRef.id);

                  if (sectionContent) {
                    // Check if the section content is a paragraph or article and get the title
                    if (sectionContent.type === 'paragraph--newsletter_section_content') {
                      summary = sectionContent.attributes.field_newsletter_content_title;
                    } else if (sectionContent.type === 'paragraph--newsletter_section_article') {
                      const articleRef = sectionContent.relationships?.field_newsletter_article_select?.data;

                      if (articleRef) {
                        const article = references.find(
                          ref => ref.id === articleRef.id && ref.type === 'node--ucb_article'
                        );
                        if (article) {
                          summary = article.attributes.title;
                        }
                      }
                    }

                    // Exit the loop once a valid summary is found
                    if (summary) {
                      break;
                    }
                  }
                }
              }
            }
          }
        }

        // Store the newsletter information
        newsletterElements.push({ title: newsletterTitle, summary, path });
      }

      // Build DOM elements for each newsletter
      this.renderNewsletters(newsletterElements);
      this.renderButton(this.taxonomyName);
    }


    // This will create the Newsletter Rows
    renderNewsletters(newsletterElements) {
      this.toggleLoading(false);
      newsletterElements.forEach(newsletter => {
        const newsletterElement = document.createElement('div');
        newsletterElement.classList.add('ucb-newsletter-row');

        const linkElement = document.createElement('a');
        linkElement.href = this._baseURI + newsletter.path;
        linkElement.classList.add('ucb-newsletter-list-link');


        const titleElement = document.createElement('p');
        titleElement.textContent = newsletter.title;
        titleElement.classList.add('ucb-newsletter-list-text');

        linkElement.appendChild(titleElement);

        const summaryElement = document.createElement('p');
        summaryElement.textContent = newsletter.summary;
        summaryElement.classList.add('ucb-newsletter-list-summary');

        newsletterElement.appendChild(linkElement);
        newsletterElement.appendChild(summaryElement);
        this.appendChild(newsletterElement);
      });
    }

    // This will create the Archive Link
    renderButton(taxonomyName){
      const buttonElement = document.createElement('a');
      const urlName = taxonomyName
        .toLowerCase() // lower
        .replace(/[^\w\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-'); // spaces => -
      buttonElement.href = `${this._baseURI}/newsletter/${urlName}`;
      buttonElement.innerText = `${taxonomyName} Archive`;
      this.appendChild(buttonElement);
    }

    toggleLoading(show) {
      this._loadingElement.style.display = show ? 'block' : 'none';
    }

    toggleError(show) {
      this.classList.add("ucb-block-error");
      this._errorElement.style.display = show ? 'block' : 'none';
    }
  }

  customElements.define('ucb-newsletter-list', NewsletterListElement);

})(window.customElements);
