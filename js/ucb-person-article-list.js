class PersonArticleList extends HTMLElement {
	constructor() {
		super();
        // Article Endpoint
        const nodeID = this.getAttribute('nodeId');
        const API = `http://localhost:61658/jsonapi/node/ucb_article?include=field_ucb_article_byline.field_author_person_page&filter[field_ucb_article_byline.field_author_person_page.meta.drupal_internal__target_id]=${nodeID}&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&page[limit]=10&sort[sort-created][path]=created&sort[sort-created][direction]=DESC`

        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, 5))
            .catch(Error=> {
              console.error('Articles by Person Block Error: There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
    }

    build(data, count, finalArticles = []){
      // More than 10 articles? This sets up the next call if there's more articles to be retrieved but not enough post-filters
        let NEXTJSONURL = "";
        if(data.links.next) {
            let nextURL = data.links.next.href.split("/jsonapi/");
            NEXTJSONURL = `/jsonapi/${nextURL[1]}`;
          } else {
            NEXTJSONURL = "";
          }

          // If no Articles retrieved...
        if(data.data.length == 0){
            this.toggleMessage('ucb-al-loading')
            this.toggleMessage('ucb-al-error',"block")
            console.warn('Articles by Person Block Error: There are no available Articles authored by this person')
        } else {
       
        // Iterate over each Article
        data.data.map(item=>{
          let title = item.attributes.title;
          let link = item.attributes.path.alias;

        // Create an Article Object for programatic rendering
          const article = {
            title,
            link,
          }
          // Adds the article object to the final array of articles chosen
          finalArticles.push(article)
        })
        // Case for not enough articles selected and extra articles available
        if(finalArticles.length < count && NEXTJSONURL){
            fetch(NEXTJSONURL).then(this.handleError)
            .then((data) => this.build(data, count, display, excludeCatArray, excludeTagArray, finalArticles))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
        }

        // If no chosen articles and no other options, provide error
        if(finalArticles.length === 0 && !NEXTJSONURL){
          console.error('There are no available Articles authored by this person.')
          this.toggleMessage('ucb-al-loading')
          this.toggleMessage('ucb-al-error', "block")
        }

        // Case for Too many articles
        if(finalArticles.length > count){
            finalArticles.length = count
            // TO DO -- create read more link
        }

        // Have articles and want to proceed
        if(finalArticles.length > 0 && !NEXTJSONURL){
          this.renderDisplay(finalArticles)
        }
    }
}
    // Responsible for calling the render function of the appropriate display
    renderDisplay(articleArray){
        var container = document.createElement('div')
        container.classList = 'ucb-article-list-block'

        articleArray.forEach(article=>{
          // Article Data
          var articleLink = article.link;
          var articleTitle = article.title;

          // Create and Append Elements
          var article = document.createElement('article');
          article.classList = 'ucb-article-card-title-only col-sm-6';
    
          var articleBody = document.createElement('div');
          articleBody.classList = 'ucb-article-card-data';

          var headerLink = document.createElement('a');
          headerLink.href = articleLink;

          var articleHeader = document.createElement('p');
          articleHeader.classList = 'ucb-article-card-title'
          articleHeader.innerText = articleTitle;

          headerLink.appendChild(articleHeader);

          articleBody.appendChild(headerLink)

          article.appendChild(articleBody)
          this.toggleMessage('ucb-person-article-block-title', "block")
          this.toggleMessage('ucb-al-loading')
          container.appendChild(article)
      })
      this.appendChild(container)
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
}

customElements.define('person-article-list', PersonArticleList);