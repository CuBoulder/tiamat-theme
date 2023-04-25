class ArticleListBlockElement extends HTMLElement {
	constructor() {
		super();
        // Count, display and JSON API Endpoint
        var count = this.getAttribute('count');
        var display = this.getAttribute('display');
        var API = this.getAttribute('jsonapi');
        // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
        var excludeCatArray = this.getAttribute('exCats').split(",").map(Number);
        var excludeTagArray = this.getAttribute('exTags').split(",").map(Number);

        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(API)
            .then(handleError)
            .then((data) => this.build(data, count, display, excludeCatArray,excludeTagArray))
            .catch(Error=> {
                // this.handleError(Error)
                console.log(Error)
            });
    }

    build(data, count, display, excludeCatArray, excludeTagArray){
        if(data.data.length == 0){
            // TO DO -- add in error message for no data
            // this.handleError({name : "No Tags Retrieved", message : "There are no Tags created"} , 'No Tags Found')
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


        let finalArticles = [];

        // Iterate over each Article
        data.data.map(item=>{
            let thisArticleCats = [];
            let thisArticleTags = [];
            // // loop through and grab all of the categories
            if (item.relationships.field_ucb_article_categories) {
              for (let i = 0; i < item.relationships.field_ucb_article_categories.data.length; i++) {
                thisArticleCats.push(
                  item.relationships.field_ucb_article_categories.data[i].meta
                    .drupal_internal__target_id
                )
              }
            }  
            // // loop through and grab all of the tags
            if (item.relationships.field_ucb_article_tags) {
              for (var i = 0; i < item.relationships.field_ucb_article_tags.data.length; i++) {
                thisArticleTags.push(item.relationships.field_ucb_article_tags.data[i].meta.drupal_internal__target_id)
              }
            }

            let doesIncludeCat = thisArticleCats;
            let doesIncludeTag = thisArticleTags;
  
            // check to see if we need to filter on categories
            if (excludeCatArray.length && thisArticleCats.length) {
              doesIncludeCat = thisArticleCats.filter((element) =>
                excludeCatArray.includes(element)
              )
            }
            // check to see if we need to filter on tags
            if (excludeTagArray.length && thisArticleTags.length) {
              doesIncludeTag = thisArticleTags.filter((element) =>
                excludeTagArray.includes(element)
              )
            }

            // If there's no categories or tags that are in the exclusions, proceed
            if (doesIncludeCat.length == 0 && doesIncludeTag.length == 0) {
                // okay to render
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
                        document.getElementById(`body-${bodyAndImageId}`).innerHTML = body;
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

                  const article = {
                    title,
                    link,
                    image: imageSrc,
                    date,
                    body,
                  }
                  finalArticles.push(article)
            }
        })
        this.renderDisplay(display, finalArticles)

        // See if articles retrieved are included in Exclusions


    }
}

    // TO DO -- Create Error handling for Article Block
    // handleError(Error, ErrorMsg = 'Error Fetching Tags - Check the console'){
    //     const container = document.createElement('div');
    //     container.className = 'ucb-tag-cloud-container';
    //     const span = document.createElement('span')
    //     span.className = 'ucb-tag-cloud-span'
    //     container.appendChild(span)

    //     const icon = document.createElement('i');
    //     icon.className = 'fas fa-exclamation-triangle'
    //     span.appendChild(icon)

    //     const message = document.createElement('p');
    //     message.className = 'ucb-category-cloud-message'
    //     message.innerText = ErrorMsg
    //     span.appendChild(message)

    //     this.appendChild(container)
    //     // Log error
    //         console.error(Error)
        
    // }


    // Function to parse data and assemble articles
    // Choose render method
    // Teaser Design
    // Feature Wide
    // Feature Full
    // Title & Thumb
    // Title Only

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

    renderDisplay(display, articleArray){
        switch (display) {
            case 'feature-wide':
                console.log('I am rendering Feature - wide')
                this.renderFeatureWide(articleArray)
                break;
            case 'feature-large':
                console.log('I am rendering Feature - full')
                this.renderFeatureFull(articleArray)
                break;
            case 'teaser':
                console.log('I am rendering teaser')
                this.renderTeaser(articleArray)
                break;
            case 'title-thumbnail':
                console.log('I am rendering title thumbnail')
                this.renderTitleThumb(articleArray)
                break;
            case 'title-only':
                console.log('I am rendering title ONLY')
                this.renderTitleOnly(articleArray)
                break;
            default:
                console.log('I am the default (teaser')
                this.renderTeaser(articleArray)
                break;
        }

    }

    renderFeatureFull(articleArray){
        console.log(articleArray)
    }
    renderFeatureWide(articleArray){
        console.log(articleArray)
    }
    renderTitleThumb(articleArray){
        console.log(articleArray)
    }
    renderTitleOnly(articleArray){
        console.log(articleArray)
    }
    renderTeaser(articleArray){
        var container = document.createElement('div')
        container.classList = 'ucb-article-list-block container'

        articleArray.forEach(article=>{
            // Article Data
            var articleDate = article.date;
            var articleLink = article.link;
            var articleImgSrc = article.image;
            var articleTitle = article.title;
            var articleSumm = article.body;

            // Create and Append Elements
            var article = document.createElement('article');
            article.classList = 'ucb-article-card row';
            var imgDiv = document.createElement('div');
            imgDiv.classList = 'col-sm-12 col-md-2 ucb-article-card-img';

            var imgLink = document.createElement('a');
            imgLink.href = articleLink;
            
            var articleImg = document.createElement('img')
            articleImg.src = articleImgSrc;

            imgLink.appendChild(articleImg);
            imgDiv.appendChild(imgLink);

            article.appendChild(imgDiv);

            var articleBody = document.createElement('div');
            articleBody.classList = 'col-sm-12 col-md-10 ucb-article-card-data';

            var headerLink = document.createElement('a');
            headerLink.href = articleLink;

            var articleHeader = document.createElement('h2');
            articleHeader.classList = 'ucb-article-card-title'
            articleHeader.innerText = articleTitle;

            headerLink.appendChild(articleHeader);

            var date = document.createElement('span');
            date.classList = 'ucb-article-card-date'
            date.innerText = articleDate;

            var articleSummary = document.createElement('p');
            articleSummary.innerText = articleSumm;
            articleSummary.classList = 'ucb-article-card-summary'

            var readMore = document.createElement('a');
            readMore.href = articleLink;
            readMore.classList = 'ucb-article-card-read-more'
            readMore.innerHTML = `Read More <i class="fal fa-chevron-double-right"></i>`;

            articleBody.appendChild(headerLink)
            articleBody.appendChild(date)
            articleBody.appendChild(articleSummary)
            articleBody.appendChild(readMore)

            article.appendChild(articleBody)
            this.toggleMessage('ucb-al-loading')
            container.appendChild(article)
        })
        this.appendChild(container)
    }

    toggleMessage(id, display = "none") {
        if (id) {
          var toggle = document.getElementById(id);
          if (toggle) {
            if (display === "block") {
              toggle.style.display = "block";
            } else {
              toggle.style.display = "none";
            }
          }
        }
      }
}

customElements.define('article-list-block', ArticleListBlockElement);