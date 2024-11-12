console.log("WHATTUP");
(function (customElements) {
  class NewsletterListElement extends HTMLElement {
    constructor(){
      super();
      this._baseURI = this.getAttribute('baseURI');
      this.count = this.getAttribute('count');
      this.newsletterType = this.getAttribute('newsletter-type');

      console.log(`I am fetching ${this.count} article(s) of the type: ${this.newsletterType} from ${this.baseURI}`);
      fetch(`${this._baseURI}/jsonapi/node/newsletter?include=field_newsletter_section_block.field_newsletter_section_select.field_newsletter_article_select&filter[status][value]=1&filter[field_newsletter_type.meta.drupal_internal__target_id][value]=${this.newsletterType}&sort=-created`)
      .then(this.handleError)
        .then((data) => this.build(data, this.count))
        .catch(Error=> {
            console.log(Error)
        });
    }

    handleError = response => {
      if (!response.ok) {
         throw new Error;
      } else {
         return response.json();
      }
  };

  build(data) {
    const newsletters = data["data"];
    const references = data["included"];

    newsletters.forEach(newsletter => {
      // Get the newsletter title
      const newsletterTitle = newsletter.attributes.title;

      // Access the first section block reference
      const sectionBlockRef = newsletter.relationships.field_newsletter_section_block?.data[0];
      if (sectionBlockRef) {
        const sectionBlock = references.find(ref => ref.id === sectionBlockRef.id && ref.type === 'paragraph--newsletter_section');

        if (sectionBlock) {
          // Access the array of section items in the section block
          const sectionSelectRefs = sectionBlock.relationships?.field_newsletter_section_select?.data;

          if (sectionSelectRefs && sectionSelectRefs.length > 0) {
            // Loop through section items and stop once we find the first valid content
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

                // We've got the first Article/Content and can break out with this one
                if (contentTitle) {
                  console.log("Newsletter Title:", newsletterTitle);
                  console.log("Content/Article Title:", contentTitle);
                  break;
                }
              }
            }
          }
        }
      }
    });
  }







  }
  customElements.define('ucb-newsletter-list', NewsletterListElement);

})(window.customElements);
