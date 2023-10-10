class ArticleGridBlockElement extends HTMLElement {
	constructor() {
		super();
        // Count, display and JSON API Endpoint
        var count = this.getAttribute('count');
        var includeSummary = this.getAttribute('includeSummary');
        var API = this.getAttribute('jsonapi');
        // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
        var excludeCatArray = this.getAttribute('exCats').split(",").map(Number);
        var excludeTagArray = this.getAttribute('exTags').split(",").map(Number);

        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, count, includeSummary, excludeCatArray, excludeTagArray))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
    }

    async build(data, count, includeSummary, excludeCatArray, excludeTagArray, finalArticles = []){
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
    await Promise.all(data.data.map(async (item)=>{
            // Article must have a thumbnail
            if(item.relationships.field_ucb_article_thumbnail.data){
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
                      body = await this.getArticleParagraph(bodyAndImageId);
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
                }
        }
    }));
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
          this.renderDisplay(finalArticles, includeSummary)
        }
    }
}

    // Responsible for fetching & processing the body of the Article if no summary provided
    async getArticleParagraph(id) {
          if (!id) {
              return "";
          }
          
          const response = await fetch(`/jsonapi/paragraph/article_content/${id}`);
          if (!response.ok) {
              throw new Error('Failed to fetch article paragraph');
          }
    
          const data = await response.json();
          
          let htmlStrip = data.data.attributes.field_article_text.processed.replace(
              /<\/?[^>]+(>|$)/g,
              ""
          );
          let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
          let trimmedString = lineBreakStrip.substr(0, 250);
          
          if (trimmedString.length > 100) {
              trimmedString = trimmedString.substr(
                  0,
                  Math.min(
                      trimmedString.length,
                      trimmedString.lastIndexOf(" ")
                  )
              );
          }
    
          return trimmedString + "...";
    }

    // Responsible for calling the render function of the appropriate display
    renderDisplay(articleArray, includeSummary){
        var articleGridContainer = document.createElement('div')
        articleGridContainer.className = 'row ucb-article-grid-container';

        articleArray.forEach(article => {
          var articleCard = document.createElement('div')
          articleCard.className = 'ucb-article-grid-card col-sm-12 col-md-6 col-lg-4'

          // Image
          var articleImgContainer = document.createElement('div')
          articleImgContainer.className = 'ucb-article-grid-card-img-container'

          var articleImg = document.createElement('img')
          articleImg.className = 'ucb-article-grid-card-img'
          articleImg.src = article.image;

          var articleImgLink = document.createElement('a')
          articleImgLink.className = 'ucb-article-grid-card-img-link'
          articleImgLink.href = article.link;

          // Image append
          articleImgLink.appendChild(articleImg)
          articleImgContainer.appendChild(articleImgLink)
          articleCard.appendChild(articleImgContainer)

          // Header
          var articleCardTitle = document.createElement('h3')
          articleCardTitle.className = 'ucb-article-grid-header'
          articleCardTitle.innerText = article.title
          var articleCardTitleLink = document.createElement('a')
          articleCardTitleLink.className = 'ucb-article-grid-header-link'
          articleCardTitleLink.href = article.link;

          articleCardTitleLink.appendChild(articleCardTitle)
          articleCard.appendChild(articleCardTitleLink)

          // Summary - optional
          if(includeSummary === 'True'){
            var articleCardSummary = document.createElement('p')
            articleCardSummary.className = 'ucb-article-grid-summary'
            articleCardSummary.innerText = article.body;
            articleCard.appendChild(articleCardSummary)
          }

          // Append final article card to div
          articleGridContainer.appendChild(articleCard)
        });

        // Hide loader, append final container
        this.toggleMessage('ucb-al-loading')
        this.appendChild(articleGridContainer)

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

customElements.define('article-grid-block', ArticleGridBlockElement);