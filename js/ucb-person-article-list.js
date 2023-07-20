console.log('Attached')

class PersonArticleList extends HTMLElement {
	constructor() {
		super();
        // Article Endpoint
        var API = this.getAttribute('jsonapi');

        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, 5))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
    }

    build(data, count, finalArticles = []){
        console.log('i have arrived', data)
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
            console.warn('No Articles retrieved - please check your inclusion filters and try again')
        } else {
        // Below objects are needed to match images with their corresponding articles. There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
        let idObj = {};
        let altObj = {};
        // Remove any blanks from our articles before map
        if (data.included) {
          // removes all other included data besides images in our included media
          let idFilterData = data.included.filter((item) => {
            return item.type == "media--image";
          })

          let altFilterData = data.included.filter((item) => {
            return item.type == 'file--file';
          });
          // finds the focial point version of the thumbnail
          altFilterData.map((item)=>{
            // checks if consumer is working, else default to standard image instead of focal image
            if(item.links.focal_image_square != undefined){
              altObj[item.id] = item.links.focal_image_square.href
            } else {
              altObj[item.id] = item.attributes.uri.url
            }
        })

          // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
          idFilterData.map((pair) => {
            idObj[pair.id] = pair.relationships.thumbnail.data.id;
          })
        }

        // Iterate over each Article
        data.data.map(item=>{
                let bodyAndImageId = item.relationships.field_ucb_article_content.data.length ? item.relationships.field_ucb_article_content.data[0].id : "";
                let body = item.attributes.field_ucb_article_summary ? item.attributes.field_ucb_article_summary : "";
                body = body.trim();
                let imageSrc = "";

                if (!body.length && bodyAndImageId != "") {
                    this.getArticleParagraph(bodyAndImageId)
                      .then((response) => response.json())
                      .then((data) => {
                        // Remove any html tags within the article
                        let htmlStrip = data.data.attributes.field_article_text.processed.replace(
                          /<\/?[^>]+(>|$)/g,
                          ""
                        )
                        // Remove any line breaks if media is embedded in the body
                        let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
                        // take only the first 100 words ~ 500 chars
                        let trimmedString = lineBreakStrip.substr(0, 250);
                        // if in the middle of the string, take the whole word
                        if(trimmedString.length > 100){
                          trimmedString = trimmedString.substr(
                            0,
                            Math.min(
                              trimmedString.length,
                              trimmedString.lastIndexOf(" ")
                            )
                          )
                          body = `${trimmedString}...`;
                        }
                        // set the contentBody of Article Summary card to the minified body instead
                        body = `${trimmedString}`;
                        document.getElementById(`body-${bodyAndImageId}`).innerText = body;
                      })
                  }
      
                  // if no thumbnail, show no image
                  if (!item.relationships.field_ucb_article_thumbnail.data) {
                    imageSrc = "";
                  } else {
                    //Use the idObj as a memo to add the corresponding image url
                    let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
                    imageSrc = altObj[idObj[thumbId]];
                  }
      
                  //Date - make human readable
                  const options = { year: 'numeric', month: 'short', day: 'numeric' };
                  let date = new Date(item.attributes.created).toLocaleDateString('en-us', options);
                  let title = item.attributes.title;
                  let link = item.attributes.path.alias;

                  // Create an Article Object for programatic rendering
                  const article = {
                    title,
                    link,
                    image: imageSrc,
                    date,
                    body,
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
          console.error('There are no available Articles that match the selected filters. Please adjust your filters and try again.')
          this.toggleMessage('ucb-al-loading')
          this.toggleMessage('ucb-al-error', "block")
        }

        // Case for Too many articles
        if(finalArticles.length > count){
            finalArticles.length = count
        }

        // Have articles and want to proceed
        if(finalArticles.length > 0 && !NEXTJSONURL){
          this.renderDisplay(finalArticles)
        }
    }
}
    
    async getArticleParagraph(id) {
        if(id) {
          const response = await fetch(
            `/jsonapi/paragraph/article_content/${id}`
          );
          return response;
        } else {
            return "";
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
          article.classList = 'ucb-article-card-title-only';
    
          var articleBody = document.createElement('div');
          articleBody.classList = 'col-sm-12 ucb-article-card-data';

          var headerLink = document.createElement('a');
          headerLink.href = articleLink;

          var articleHeader = document.createElement('h2');
          articleHeader.classList = 'ucb-article-card-title'
          articleHeader.innerText = articleTitle;

          headerLink.appendChild(articleHeader);

          articleBody.appendChild(headerLink)

          article.appendChild(articleBody)

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

/*
http://localhost:61658/jsonapi/node/ucb_article?include[node--ucb_article]=uid,title,ucb_article_content,created,field_ucb_article_summary,field_ucb_article_categories,field_ucb_article_tags,field_ucb_article_thumbnail&include=field_ucb_article_thumbnail.field_media_image&fields[file--file]=uri,url&filter[status][value]=1&page[limit]=10&sort[sort-created][path]=created&sort[sort-created][direction]=DESC
*/