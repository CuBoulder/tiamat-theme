class ArticleFeatureBlockElement extends HTMLElement {
	constructor() {
		super();
        // Image Size, display and JSON API Endpoint
        var display = this.getAttribute('display');
        var imgSize = this.getAttribute('imgSize');
        var API = this.getAttribute('jsonapi');
        var count = display === "stacked" ? 4 : 5;
        // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
        var excludeCatArray = this.getAttribute('exCats').split(",").map(Number);
        var excludeTagArray = this.getAttribute('exTags').split(",").map(Number);

        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, display, count, imgSize, excludeCatArray, excludeTagArray))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
    }

    // This is the article list filtering function that assembles the article javascript object array from the JSON response. Handles exclusions of categories and tags.
    build(data, display, count, imgSize, excludeCatArray, excludeTagArray, finalArticles = []){
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
        let wideObj = {};
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
            if(item.links.focal_image_square != undefined && item.links.focal_image_wide != undefined){
              altObj[item.id] = item.links.focal_image_square.href
              // This is used if a user selects the "Wide" image style
              wideObj[item.id] = item.links.focal_image_wide.href
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
                    let imageSrcWide = "";

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
                    //Use the idObj as a memo to add the corresponding image url
                    let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
                        imageSrc = altObj[idObj[thumbId]];
                    imageSrcWide = wideObj[idObj[thumbId]]

                    //Date - make human readable
                    const options = { year: 'numeric', month: 'short', day: 'numeric' };
                    let date = new Date(item.attributes.created).toLocaleDateString('en-us', options);
                    let title = item.attributes.title;
                    let link = item.attributes.path.alias;

                    // Create an Article Object for programatic rendering
                    const article = {
                        title,
                        link,
                        imageSquare: imageSrc,
                        imageWide: imageSrcWide,
                        date,
                        body,
                    }
                    // Adds the article object to the final array of articles chosen
                    finalArticles.push(article)
                }
        }
    })
        // Case for not enough articles selected and extra articles available
        if(finalArticles.length < count && NEXTJSONURL){
            fetch(NEXTJSONURL).then(this.handleError)
            .then((data) => this.build(data, display, count, imgSize, excludeCatArray, excludeTagArray, finalArticles))
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
          this.renderDisplay(finalArticles, display, imgSize)
        }
    }
}
    // Gets the body if no summary
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
    renderDisplay(articleArray, display, imgSize){        
        switch (display) {
            case 'inline-large':
                this.renderInlineLarge(articleArray, imgSize)
                break;
            case 'inline-half':
                this.renderInlineHalf(articleArray, imgSize)
                break;
            case 'stacked':
                this.renderStacked(articleArray, imgSize)
                break;
            default:
                this.renderStacked(articleArray, imgSize)
                break;
        }
    }
    // The below functions are used to render the appropriate display
    // Render Inline 50/50
    renderInlineHalf(articleArray, imgSize){
        console.log('I am rendering inline 50-50')
        console.log('This is my final array', articleArray)
        console.log('This is my img size', imgSize)
                // Container
                var articleFeatureContainer = document.createElement('div')
                articleFeatureContainer.className = 'ucb-article-feature-container row'
        
                // This is the list of 'secondary' articles
                var secondaryContainer = document.createElement('div')
                secondaryContainer.className = 'ucb-inline-half-secondary-container col-lg-6 col-md-6 col-sm-12 col-sm-12'
        
                articleArray.map(article =>{
                    console.log(article)
                    // First article (feature)
                    if(articleFeatureContainer.children.length == 0){
                        // This is the large feature article
                        var featureContainer = document.createElement('article')
                        featureContainer.className = 'ucb-inline-half-feature-container col-lg-6 col-md-6 col-sm-12 col-xs-12'
        
                        // Image
                        var featureImg = document.createElement('img')
                        if(imgSize === 'wide'){
                            featureImg.src = article.imageWide
                            featureImg.className = 'ucb-feature-article-img feature-img-wide'
                        } else {
                            featureImg.src = article.imageSquare
                            featureImg.className = 'ucb-feature-article-img feature-img-square'
                        }
                        // Image Link
                        var featureImgLink = document.createElement('a')
                        featureImgLink.className = 'ucb-feature-article-img-link'
                        featureImgLink.href = article.link;
                        featureImgLink.appendChild(featureImg)
        
                        // Title
                        var featureTitle = document.createElement('h2')
                        featureTitle.className = 'ucb-feature-article-header'
                        // Title Link
                        var featureTitleLink = document.createElement('a')
                        featureTitleLink.href = article.link;
                        featureTitleLink.innerText = article.title;
                        featureTitle.appendChild(featureTitleLink)
        
                        // Body
                        var featureSummary = document.createElement('p')
                        featureSummary.className = 'ucb-feature-article-summary'
                        featureSummary.innerText = article.body;
        
                        // Read More
                        var featureReadMore = document.createElement('a')
                        featureReadMore.className = 'ucb-article-read-more'
                        featureReadMore.href = article.link;
                        featureReadMore.innerText = 'Read More'
        
                        // Append
                        featureContainer.appendChild(featureImgLink)
                        featureContainer.appendChild(featureTitle)
                        featureContainer.appendChild(featureSummary)
                        featureContainer.appendChild(featureReadMore)
        
                        articleFeatureContainer.appendChild(featureContainer)
                    } else {
                    // The non features
        
                    // Row
                    var articleContainer = document.createElement('article')
                    articleContainer.className = 'ucb-article-card row'
        
                    //Img
                    var articleImg = document.createElement('img')
                    articleImg.className = 'ucb-article-feature-secondary-img'
                    articleImg.src = article.imageSquare;
        
                    // Img Link
                    var articleImgLink = document.createElement('a')
                    articleImgLink.className = 'ucb-article-img-link'
                    articleImgLink.href = article.link;
                    articleImgLink.appendChild(articleImg)
        
                    // Title
                    var articleTitle = document.createElement('h3')
                    articleTitle.className = 'ucb-article-feature-secondary-title'
                    //Title Link 
                    var articleTitleLink = document.createElement('a')
                    articleTitleLink.href = article.link;
                    articleTitleLink.innerText = article.title;
                    articleTitle.appendChild(articleTitleLink)
        
                    articleContainer.appendChild(articleImgLink)
                    articleContainer.appendChild(articleTitle)
                    secondaryContainer.appendChild(articleContainer)
                    }
                })
                // Hide loader, append final container
                this.toggleMessage('ucb-al-loading')
                articleFeatureContainer.appendChild(secondaryContainer)
                this.appendChild(articleFeatureContainer)
    }
    // Render Inline 66/33
    renderInlineLarge(articleArray, imgSize){
        console.log('i am rendering inline 66/33')
        console.log('This is my final array', articleArray)
        console.log('This is my img size', imgSize)
        // Container
        var articleFeatureContainer = document.createElement('div')
        articleFeatureContainer.className = 'ucb-article-feature-container row'

        // This is the list of 'secondary' articles
        var secondaryContainer = document.createElement('div')
        secondaryContainer.className = 'ucb-inline-large-secondary-container col-lg-4 col-md-4 col-sm-4 col-sm-12'

        articleArray.map(article =>{
            console.log(article)
            // First article (feature)
            if(articleFeatureContainer.children.length == 0){
                // This is the large feature article
                var featureContainer = document.createElement('article')
                featureContainer.className = 'ucb-inline-large-feature-container col-lg-8 col-md-8 col-sm-8 col-xs-12'

                // Image
                var featureImg = document.createElement('img')
                if(imgSize === 'wide'){
                    featureImg.src = article.imageWide
                    featureImg.className = 'ucb-feature-article-img feature-img-wide'
                } else {
                    featureImg.src =article.imageSquare
                    featureImg.className = 'ucb-feature-article-img feature-img-square'
                }
                // Image Link
                var featureImgLink = document.createElement('a')
                featureImgLink.className = 'ucb-feature-article-img-link'
                featureImgLink.href = article.link;
                featureImgLink.appendChild(featureImg)

                // Title
                var featureTitle = document.createElement('h2')
                featureTitle.className = 'ucb-feature-article-header'
                // Title Link
                var featureTitleLink = document.createElement('a')
                featureTitleLink.href = article.link;
                featureTitleLink.innerText = article.title;
                featureTitle.appendChild(featureTitleLink)

                // Body
                var featureSummary = document.createElement('p')
                featureSummary.className = 'ucb-feature-article-summary'
                featureSummary.innerText = article.body;

                // Read More
                var featureReadMore = document.createElement('a')
                featureReadMore.className = 'ucb-article-read-more'
                featureReadMore.href = article.link;
                featureReadMore.innerText = 'Read More'

                // Append
                featureContainer.appendChild(featureImgLink)
                featureContainer.appendChild(featureTitle)
                featureContainer.appendChild(featureSummary)
                featureContainer.appendChild(featureReadMore)

                articleFeatureContainer.appendChild(featureContainer)
            } else {
            // The non features

            // Row
            var articleContainer = document.createElement('article')
            articleContainer.className = 'ucb-article-card row'

            //Img
            var articleImg = document.createElement('img')
            articleImg.className = 'ucb-article-feature-secondary-img'
            articleImg.src = article.imageSquare;

            // Img Link
            var articleImgLink = document.createElement('a')
            articleImgLink.className = 'ucb-article-img-link'
            articleImgLink.href = article.link;
            articleImgLink.appendChild(articleImg)

            // Title
            var articleTitle = document.createElement('h3')
            articleTitle.className = 'ucb-article-feature-secondary-title'
            //Title Link 
            var articleTitleLink = document.createElement('a')
            articleTitleLink.href = article.link;
            articleTitleLink.innerText = article.title;
            articleTitle.appendChild(articleTitleLink)

            articleContainer.appendChild(articleImgLink)
            articleContainer.appendChild(articleTitle)
            secondaryContainer.appendChild(articleContainer)
            }
        })
        // Hide loader, append final container
        this.toggleMessage('ucb-al-loading')
        articleFeatureContainer.appendChild(secondaryContainer)
        this.appendChild(articleFeatureContainer)
    }
    // Render Stacked
    renderStacked(articleArray, imgSize){
        console.log('i am rendering stacked')
        console.log('This is my final array', articleArray)
        console.log('This is my img size', imgSize)
        // Hide loader, append final container
        this.toggleMessage('ucb-al-loading')
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

customElements.define('article-feature-block', ArticleFeatureBlockElement);