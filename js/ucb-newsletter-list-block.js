(function (customElements) {
  class NewsletterListElement extends HTMLElement {
    constructor() {
      super();
      this._baseURI = this.getAttribute('baseURI');
      this.count = parseInt(this.getAttribute('count'));
      this.newsletterType = this.getAttribute('newsletter-type');

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
        });
    }

    fetchNewsletters() {
      const publishedParams = '&filter[published][group][conjunction]=AND'
      + '&filter[publish-check][condition][path]=status'
      + '&filter[publish-check][condition][value]=1'
      + '&filter[publish-check][condition][memberOf]=published';

    fetch(`${this._baseURI}/jsonapi/node/newsletter?include=field_newsletter_section_block.field_newsletter_section_select.field_newsletter_article_select${publishedParams}&filter[field_newsletter_type.meta.drupal_internal__target_id][value]=${this.newsletterType}&sort=-created`)        .then(this.handleError)
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

      // Loop through newsletters up to the specified count
      for (let i = 0; i < Math.min(newsletters.length, count); i++) {
        const newsletter = newsletters[i];
        const newsletterTitle = newsletter.attributes.title;

        // Get the path using taxonomy and title
        const taxonomyId = newsletter.relationships.field_newsletter_type?.data.id;
        const taxonomyPath = this.taxonomyMap[taxonomyId];
        const path = newsletter.attributes.path.alias ? newsletter.attributes.path.alias : `/node/${newsletter.attributes.drupal_internal__nid}`;

        // Access the first section block reference
        const sectionBlockRef = newsletter.relationships.field_newsletter_section_block?.data[0];
        if (sectionBlockRef) {
          const sectionBlock = references.find(ref => ref.id === sectionBlockRef.id && ref.type === 'paragraph--newsletter_section');

          if (sectionBlock) {
            // Access the array of section items in the section block
            const sectionSelectRefs = sectionBlock.relationships?.field_newsletter_section_select?.data;

            if (sectionSelectRefs && sectionSelectRefs.length > 0) {
              // Loop through section items and find the first valid content
              for (const sectionSelectRef of sectionSelectRefs) {
                const sectionContent = references.find(ref => ref.id === sectionSelectRef.id);

                if (sectionContent) {
                  let contentTitle = null;

                  // Check if the section content is a paragraph or article and get the title
                  if (sectionContent.type === 'paragraph--newsletter_section_content') {
                    contentTitle = sectionContent.attributes.field_newsletter_content_title;
                  } else if (sectionContent.type === 'paragraph--newsletter_section_article') {
                    const articleRef = sectionContent.relationships?.field_newsletter_article_select?.data;

                    if (articleRef) {
                      const article = references.find(ref => ref.id === articleRef.id && ref.type === 'node--ucb_article');
                      if (article) {
                        contentTitle = article.attributes.title;
                      }
                    }
                  }

                  // Store the title, summary, and path
                  if (contentTitle) {
                    newsletterElements.push({ title: newsletterTitle, summary: contentTitle, path });
                    break; // Exit once we have the first valid content for this newsletter
                  }
                }
              }
            }
          }
        }
      }

      // Call a method to build DOM elements for each newsletter
      this.renderNewsletters(newsletterElements);
    }

    renderNewsletters(newsletterElements) {
      newsletterElements.forEach(newsletter => {
        const newsletterElement = document.createElement('div');
        newsletterElement.classList.add('ucb-newsletter-row');

        const linkElement = document.createElement('a');
        linkElement.href = newsletter.path;
        linkElement.classList.add('ucb-newsletter-list-link');


        const titleElement = document.createElement('p');
        titleElement.textContent = newsletter.title;
        titleElement.classList.add('ucb-newsletter-list-text')

        linkElement.appendChild(titleElement);

        const summaryElement = document.createElement('p');
        summaryElement.textContent = newsletter.summary;
        summaryElement.classList.add('ucb-newsletter-list-summary');

        newsletterElement.appendChild(linkElement);
        newsletterElement.appendChild(summaryElement);
        this.appendChild(newsletterElement);
      });
    }
  }

  customElements.define('ucb-newsletter-list', NewsletterListElement);

})(window.customElements);
