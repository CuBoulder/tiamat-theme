class PersonArticleList extends HTMLElement {
    constructor() {
        super();
        // Article Endpoint
        const nodeID = this.getAttribute('nodeId');
        this._baseURI = this.getAttribute("base-uri");
        const API = `${this._baseURI}/jsonapi/node/ucb_article?include=field_ucb_article_byline.field_author_person_page&filter[field_ucb_article_byline.field_author_person_page.meta.drupal_internal__target_id]=${nodeID}&filter[status][value]=1&page[limit]=10&sort=-created`;
        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, 5))
            .catch(Error=> {
              console.error('Articles by Person Block Error: There was an error fetching data from the API - Please try again later.');
              console.error(Error);
              this.toggleMessage('ucb-al-loading');
              this.toggleMessage('ucb-al-api-error', "block");
            });
    }

    build(data, count, finalArticles = []){
      // More than 10 articles? This sets up the next call if there's more articles to be retrieved but not enough post-filters
        let NEXTJSONURL = "";
        if(data.links.next) {
            let nextURL = data.links.next.href.split("/jsonapi/");
            NEXTJSONURL = `${this._baseURI}/jsonapi/${nextURL[1]}`;
          } else {
            NEXTJSONURL = "";
          }

        if(data.data.length != 0){
        this.toggleMessage('ucb-person-article-block-title', "block");
        this.toggleMessage('ucb-al-loading',"block");
        // Iterate over each Article
        data.data.map(item=>{
          let title = item.attributes.title;
          let link = item.attributes.path.alias ? item.attributes.path.alias : `/node/${item.attributes.drupal_internal__nid}`;

        // Create an Article Object for programatic rendering
          const article = {
            title,
            link,
          };
          // Adds the article object to the final array of articles chosen
          finalArticles.push(article);
        })
        // Case for not enough articles selected and extra articles available
        if(finalArticles.length < count && NEXTJSONURL){
            fetch(NEXTJSONURL).then(this.handleError)
            .then((data) => this.build(data, count, display, excludeCatArray, excludeTagArray, finalArticles))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.');
              console.error(Error);
              this.toggleMessage('ucb-al-loading');
              this.toggleMessage('ucb-al-api-error', "block");
            });
        }
        // View
        let bylineTerm = null;
        // Case for Too many articles
        if(finalArticles.length > count){
          bylineTerm = this.findBylineId(data.included); // if >5 then we'll need to pass the term id to link the the view
          // TO DO -- create read more link, lead to Article List by Person filtered (needed)
          finalArticles.length = count;
        }

        // Have articles and want to proceed
        if(finalArticles.length > 0 && (!NEXTJSONURL || finalArticles.length >= count)){
          this.renderDisplay(finalArticles, bylineTerm);
        }
    }
}
    // Responsible for calling the render function of the appropriate display
    renderDisplay(articleArray, bylineTerm){
        var container = document.createElement('div');
        container.classList = 'ucb-article-list-block';

        articleArray.forEach(article=>{
          // Article Data
          var articleLink = `${this._baseURI}${article.link}`;
          var articleTitle = article.title;

          // Create and Append Elements
          var article = document.createElement('article');
          article.classList = 'ucb-article-card-title-only col-sm-12 col-md-6';

          var articleBody = document.createElement('div');
          articleBody.classList = 'ucb-article-card-data';

          var headerLink = document.createElement('a');
          headerLink.href = articleLink;

          var articleHeader = document.createElement('p');
          articleHeader.classList = 'ucb-article-card-title';
          articleHeader.innerText = articleTitle;

          headerLink.appendChild(articleHeader);

          articleBody.appendChild(headerLink);

          article.appendChild(articleBody);
          container.appendChild(article);
          this.toggleMessage('ucb-al-loading');
      })

      // Adds Read More link to Article List view, filtered by Byline tax term
      if(bylineTerm != null){
        var readMoreDiv = document.createElement('div');
        readMoreDiv.classList.add('ucb-article-read-more-container', 'col-sm-12', 'col-md-6');
        var readMoreLink = document.createElement('a');
        readMoreLink.href = `${this._baseURI}/taxonomy/term/${bylineTerm.id}`;
        readMoreLink.classList.add('ucb-article-read-more');
        readMoreLink.innerText = `More Articles by ${bylineTerm.name}`;
        readMoreDiv.appendChild(readMoreLink);
        container.append(readMoreDiv);
      }
      this.appendChild(container);
    }

    // Used to toggle error messages and loader
    toggleMessage(id, display = "none") {
        if (id) {
          var toggle = this.querySelector(`#${id}`);
          if (toggle) {
            if (display === "block") {
              toggle.style.display = "block";
            } else {
              toggle.style.display = "none";
            }
          }
        }
    }

    // Used for error handling within the API response
    handleError = response => {
        if (!response.ok) {
           throw new Error;
        } else {
           return response.json();
        }
    };

    // Used to link to Article List (view)
    findBylineId(includedData) {
      const byline = includedData.find(item =>
        item.type === 'taxonomy_term--byline' &&
        item.relationships.field_author_person_page.data?.meta.drupal_internal__target_id == this.getAttribute('nodeId')
      );
      return byline ? {id:byline.attributes.drupal_internal__tid, name: byline.attributes.name} : null;
    }
}

customElements.define('person-article-list', PersonArticleList);
