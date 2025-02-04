(function (customElements) {
class ArticleSliderBlockElement extends HTMLElement {
	constructor() {
		super();
        // Count, display and JSON API Endpoint
        var count = 6;
        var API = this.getAttribute('jsonapi');
        this._baseURI = this.getAttribute("base-uri");
        this._id = this.getAttribute("id")

        // Exclusions are done on the JS side, get into arrays. Blank if no exclusions
        var excludeCatArray = this.getAttribute('exCats').split(",").map(Number);
        var excludeTagArray = this.getAttribute('exTags').split(",").map(Number);

        fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data, count, excludeCatArray,excludeTagArray))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block");
              this.classList.add("ucb-block-error");
            });
    }

    async build(data, count, excludeCatArray, excludeTagArray, finalArticles = []){
      // More than 10 articles? This sets up the next call if there's more articles to be retrieved but not enough post-filters
        let NEXTJSONURL = "";
        if(data.links.next) {
            let nextURL = data.links.next.href.split("/jsonapi/");
            NEXTJSONURL = `${this._baseURI}/jsonapi/${nextURL[1]}`;
          } else {
            NEXTJSONURL = "";
          }

          // If no Articles retrieved...
        if(data.data.length == 0){
            this.toggleMessage('ucb-al-loading')
            this.toggleMessage('ucb-al-error',"block")
            this.classList.add("ucb-block-error");
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
            if(item.links.focal_image_wide != undefined){
              altObj[item.id] = item.links.focal_image_wide.href
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
        const promises = data.data.map(async (item) => {
          if (!item.relationships.field_ucb_article_thumbnail.data) {
            return null;
          }

          let thisArticleCats = [];
          let thisArticleTags = [];

          if (item.relationships.field_ucb_article_categories) {
            thisArticleCats = item.relationships.field_ucb_article_categories.data.map(
              cat => cat.meta.drupal_internal__target_id
            );
          }

          if (item.relationships.field_ucb_article_tags) {
            thisArticleTags = item.relationships.field_ucb_article_tags.data.map(
              tag => tag.meta.drupal_internal__target_id
            );
          }

          let doesIncludeCat = excludeCatArray.length
            ? thisArticleCats.filter(cat => excludeCatArray.includes(cat))
            : thisArticleCats;

          let doesIncludeTag = excludeTagArray.length
            ? thisArticleTags.filter(tag => excludeTagArray.includes(tag))
            : thisArticleTags;

          if (doesIncludeCat.length === 0 && doesIncludeTag.length === 0) {
            let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
            let imageSrc = altObj[idObj[thumbId]];
            let title = item.attributes.title;
            // If no path alias set, use defaults
            let path = item.attributes.path.alias ? item.attributes.path.alias : `/node/${item.attributes.drupal_internal__nid}`;
            let link = this._baseURI + path;

            return {
              title,
              link,
              image: imageSrc,
            };
          }

          return null;
        });

        const articlesToAdd = (await Promise.all(promises)).filter(article => article !== null);
        finalArticles.push(...articlesToAdd);

        // Case for not enough articles selected and extra articles available
        if(finalArticles.length < count && NEXTJSONURL){
            fetch(NEXTJSONURL).then(this.handleError)
            .then((data) => this.build(data, count, excludeCatArray, excludeTagArray, finalArticles))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block");
              this.classList.add("ucb-block-error");
            });
        }

        // If no chosen articles and no other options, provide error
        if(finalArticles.length === 0 && !NEXTJSONURL){
          console.error('There are no available Articles that match the selected filters. Please adjust your filters and try again.')
          this.toggleMessage('ucb-al-loading')
          this.toggleMessage('ucb-al-error', "block");
          this.classList.add("ucb-block-error");
        }

        // Case for Too many articles
        if(finalArticles.length >= count || (finalArticles.length >= count && NEXTJSONURL)){
            finalArticles.length = count;
        }

        // Have articles and want to proceed
        if((finalArticles.length >= 0 && !NEXTJSONURL) || (finalArticles.length == count && NEXTJSONURL)){
          this.renderDisplay(finalArticles)
        }
    }
}

    renderDisplay(articleArray){
      var fliktyInit = document.getElementsByClassName(`ucb-article-slider${this._id}`)[0]
      articleArray.map(article=>{
        var articleContainer = document.createElement('div')
        articleContainer.className = 'ucb-article-slider-container carousel-cell'
        //  Container
        var articleInnerContainer = document.createElement('div')
        articleInnerContainer.className = 'ucb-article-slider-container-inner'
        //  Link
        var articleImgLink = document.createElement('a')
            articleImgLink.className = 'ucb-article-img-link'
            articleImgLink.href = article.link
        //  Img
        var articleImg = document.createElement('img')
            articleImg.className = 'ucb-article-slider-article-img'
            articleImg.src = article.image;
        //  Title
        var articleTitle = document.createElement('span')
            articleTitle.className = 'ucb-article-img-title'
            articleTitle.innerText = article.title;

        //  Append
        articleImgLink.appendChild(articleTitle)
        articleImgLink.appendChild(articleImg)
        articleInnerContainer.appendChild(articleImgLink)
        articleContainer.appendChild(articleInnerContainer)
        fliktyInit.append(articleContainer)
      })
      this.toggleMessage('ucb-al-loading')
      this.toggleMessage('ucb-el-flick','block')
      // Make this a Flickity container -- this line appears to need to be here, creating the container before
      new Flickity(`.ucb-article-slider${this._id}`,{
        'autoPlay': false,
        'wrapAround': true,
        'adaptiveHeight': true,
        'draggable': false,
        'cellAlign': 'left',
        'groupCells': true,
        'contain': true,
        'lazyLoad': true
      })
     this.makeAccessibile()
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
    // Adds aria properties to Flickity Carousel
    makeAccessibile(){
      if(this.getElementsByClassName('flickity-page-dots').length){
        const dots = this.getElementsByClassName('flickity-page-dots')[0]
        dots.setAttribute('aria-hidden', 'true');
      }

      const sliderBtns = this.getElementsByClassName('flickity-button')
      if(sliderBtns){
        Array.from(sliderBtns).forEach(element=>{
          element.firstChild.setAttribute('aria-hidden', 'true')
        })
      }
    }
}

customElements.define('article-slider-block', ArticleSliderBlockElement);
})(window.customElements);
