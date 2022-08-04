/**  
 * Get additional data from the paragraph content attached to the Article node
 * @param {string} id - internal id used by Drupal to get the specific paragraph
 */ 
async function getArticleParagraph(id) {
  if(id) {
    const response = await fetch(
      `/jsonapi/paragraph/article_content/${id}`
    );
    return response;
  } else {
      return "";
  }
}

/**
 * Helper function to show/hide elements in the DOM
 * @param {string} id - CSS ID of the element to target
 * @param {string} display - display mode for that element (block | none) 
 */
function toggleMessage(id, display = "none") {
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

/**
 * Main function that will load the initial data from the given URL and start processing it for display
 * @param {string} JSONURL - URL for the JSON:API endpoint with filters, sort and pagination 
 * @param {string} id - target DOM element to add the content to 
 * @param {string} ExcludeCategories - array of categories to filter out when rendering 
 * @param {string} ExcludeTags - array of tags to filter out when rendering
 * @returns - Promise with resolve or reject
 */
function renderArticleList( JSONURL, ExcludeCategories = "", ExcludeTags = "") {
  return new Promise(function(resolve, reject) {
  let excludeCatArray = ExcludeCategories.split(",").map(Number);
  let excludeTagArray = ExcludeTags.split(",").map(Number);
  // next URL if there is one, will be returned by this funtion
  let NEXTJSONURL = "";

  if (JSONURL) {
    //let el = document.getElementById(id);

    // show the loading spinner while we load the data
    toggleMessage("ucb-al-loading", "block");

    fetch(JSONURL)
      .then((reponse) => reponse.json())
      .then((data) => {
        // get the next URL and return that if there is one
        if(data.links.next) {
          let nextURL = data.links.next.href.split("/jsonapi/");
          NEXTJSONURL = nextURL[1];
        } else {
          NEXTJSONURL = "";
        }

        //console.log("data obj", data);

        // if no articles of returned, stop the loading spinner and let the user know we received no data that matches their query
        if (!data.data.length) {
          toggleMessage("ucb-al-loading", "none");
          toggleMessage("ucb-al-no-results", "block");
          reject;
        }

        // Below objects are needed to match images with their corresponding articles. There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
        let urlObj = {};
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
            altObj[item.id] = item.links.focal_image.href
          })

          // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
          idFilterData.map((pair) => {
            idObj[pair.id] = pair.relationships.thumbnail.data.id;
          })
        }
        // console.log("idObj", idObj);
        // console.log("urlObj", urlObj);
        // console.log('altObj', altObj)
        //iterate over each item in the array
        data.data.map((item) => {
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
          // console.log("this article cats",thisArticleCats)

          // // loop through and grab all of the tags
          if (item.relationships.field_ucb_article_tags) {
            for (var i = 0; i < item.relationships.field_ucb_article_tags.data.length; i++) {
              thisArticleTags.push(item.relationships.field_ucb_article_tags.data[i].meta.drupal_internal__target_id)
            }
          }
          // console.log('this article tags',thisArticleTags)

          // checks to see if the current article (item) contains a category or tag scheduled for exclusion
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

          // console.log(excludeCatArray, thisArticleCats,doesIncludeCat)
          // console.log(excludeTagArray,thisArticleTags,doesIncludeTag)

          // if we didn't match any of the filtered tags or cats, then render the content
          if (doesIncludeCat.length == 0 || doesIncludeTag.length == 0) {
            // we need to render the Article Card view for this returned element

            // **ADD DATA**
            // this is my id of the article body paragraph type we need only if no thumbnail or summary provided
            let bodyAndImageId = item.relationships.field_ucb_article_content.data[0].id;
            let body = item.attributes.field_ucb_article_summary?item.attributes.field_ucb_article_summary : "";
            body = body.trim();
            let imageSrc = "";

            // if no article summary, use a simplified article body
            if (!body.length) {
              getArticleParagraph(bodyAndImageId)
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
                  let trimmedString = lineBreakStrip.substr(0, 500);
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
            let date = new Date(item.attributes.created)
              .toDateString()
              .split(" ")
              .slice(1)
              .join(" ");
            let title = item.attributes.title;
            let link = item.attributes.path.alias;
            let image = "";
            if(link && imageSrc) {
                image = `<a href="${link}"><img src="${imageSrc}" /></a>`;
            }

            let outputHTML = `
                            <div class='ucb-article-card row'>
                                <div id='img-${bodyAndImageId}' class='col-sm-12 col-md-2 ucb-article-card-img'>${image}</div>
                                <div class='col-sm-12 col-md-10 ucb-article-card-data'>
                                    <span class='ucb-article-card-title'><a href="${link}">${title}</a></span>
                                    <span class='ucb-article-card-date'>${date}</span>
                                    <span id='body-${bodyAndImageId}' class='ucb-article-card-body'>${body}</span>
                                    <span class='ucb-article-card-more'>
                                        <a href="${link}">Read more <i class="fal fa-chevron-double-right"></i></a></span>
                                </div>
                            </div>
                        `;

            let dataOutput = document.getElementById("ucb-al-data");
            let thisArticle = document.createElement("article");
            thisArticle.innerHTML = outputHTML;

            dataOutput.append(thisArticle);
          }
        })

        // check if anything was returned, if nothing, prompt user to adjust filters, else remove loading text/error msg
        // if(el.children.length===1){
        //     el.innerHTML = "<h5>No articles currently match your selected included/excluded filters. Please adjust your filters and try again</h5>"
        // } else {
        // el.innerText = "";
        // }

        // done loading -- hide the loading spinner graphic
        toggleMessage("ucb-al-loading", "none");
        resolve(NEXTJSONURL);
      }).catch(function(error) {
        // catch any fetch errors and let the user know so they're not endlessly watching the spinner
        console.log("Fetch Error in URL : " + JSONURL);
        console.log("Fetch Error is : " + error);
        // turn off spinner
        toggleMessage("ucb-al-loading", "none");
        // turn on default error message
        toggleMessage("ucb-al-error", "block");

    });

  }
  });
}

/**
 * Initilization and start of code 
 */
(function () {
  // get the url from the data-jsonapi variable
  let el = document.getElementById("ucb-article-listing");
  let JSONURL = ""; // JSON:API URL 
  let NEXTJSONURL = ""; // next link for pagination 
  let CategoryExclude = ""; // categories to exclude
  let TagsExclude = ""; // tags to exclude 
  let lastKnownScrollPosition = 0; // scroll position to determine if we need to load more articles
  /* Note that event tracking on scroll is expensive and noisy -- these two flag will help to make sure
      that we're not overwhelming the system by tracking scroll events when we don't need to */
  let ticking = false; // flag to know if we're currently scrolling 
  let loadingData = false; // flag to know if we're currently getting additional articles

  // check to see if we have the data we need to work with.  
  if (el) {
    JSONURL = el.dataset.jsonapi;
    CategoryExclude = el.dataset.excats;
    TagsExclude = el.dataset.extags;
  }
  
  // attempt to render the data requested 
  renderArticleList( JSONURL, CategoryExclude, TagsExclude,).then((response) => {
    if(response) {
      NEXTJSONURL = "/jsonapi/" + response;
    }
  });

  // watch for scrolling and determine if we're at the bottom of the content and need to request more 
  document.addEventListener("scroll", function () {
    lastKnownScrollPosition = window.scrollY;

    if (!ticking && !loadingData) {
      window.requestAnimationFrame(function () {
        // check to see if we've scrolled through our content and need to attempt to load more
        if ( lastKnownScrollPosition + window.innerHeight >= document.documentElement.scrollHeight) {
          // grab the next link from our JSON data object and call the loader
          loadingData = true;
          // if we have another set of data to load, get the next batch.
          if(NEXTJSONURL) {
            renderArticleList( NEXTJSONURL, CategoryExclude, TagsExclude,).then((response) => {
              if(response) {
                NEXTJSONURL = "/jsonapi/" + response;
                loadingData = false;
              } else {
                NEXTJSONURL = "";
                toggleMessage("ucb-al-end-of-data", "block");
              }
            });
          }
        }
        ticking = false;
      })
      ticking = true;
    }
  })
})()
