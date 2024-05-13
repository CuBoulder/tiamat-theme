(function () {
  /**  
   * Get additional data from the paragraph content attached to the Article node
   * @param {string} id - internal id used by Drupal to get the specific paragraph
   */
  async function getArticleParagraph(id) {
    if (id) {
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
        switch (display) {
          case "block":
            toggle.style.display = "block";
            break;
          case "inline-block":
            toggle.style.display = "inline-block";
            break;
          case "none":
            toggle.style.display = "none";
            break;
          default:
            toggle.style.display = "none";
            break;
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
  function renderArticleList(JSONURL, ExcludeCategories = "", ExcludeTags = "") {
    return new Promise(function (resolve, reject) {
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
            if (data.links.next) {
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
              });

              let altFilterData = data.included.filter((item) => {
                return item.type == 'file--file';
              });
              // finds the focial point version of the thumbnail
              altFilterData.map((item) => {
                // checks if consumer is working, else default to standard image instead of focal image
                if (item.links.focal_image_square != undefined) {
                  altObj[item.id] = { src: item.links.focal_image_square.href }
                } else {
                  altObj[item.id] = { src: item.attributes.uri.url }
                }
              });

              // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
              idFilterData.map((pair) => {
                const thumbnailId = pair.relationships.thumbnail.data.id;
                idObj[pair.id] = pair.relationships.thumbnail.data.id;
                altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt;
              });
            }
            // console.log("idObj", idObj);
            // console.log("urlObj", urlObj);
            // console.log('altObj', altObj);
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
                  );
                }
              }
              // console.log("this article cats",thisArticleCats);

              // // loop through and grab all of the tags
              if (item.relationships.field_ucb_article_tags) {
                for (var i = 0; i < item.relationships.field_ucb_article_tags.data.length; i++) {
                  thisArticleTags.push(item.relationships.field_ucb_article_tags.data[i].meta.drupal_internal__target_id)
                }
              }
              // console.log('this article tags',thisArticleTags);

              // checks to see if the current article (item) contains a category or tag scheduled for exclusion
              let doesIncludeCat = thisArticleCats;
              let doesIncludeTag = thisArticleTags;

              // check to see if we need to filter on categories
              if (excludeCatArray.length && thisArticleCats.length) {
                doesIncludeCat = thisArticleCats.filter((element) =>
                  excludeCatArray.includes(element)
                );
              }
              // check to see if we need to filter on tags
              if (excludeTagArray.length && thisArticleTags.length) {
                doesIncludeTag = thisArticleTags.filter((element) =>
                  excludeTagArray.includes(element)
                );
              }

              // if we didn't match any of the filtered tags or cats, then render the content
              if (doesIncludeCat.length == 0 && doesIncludeTag.length == 0) {
                // we need to render the Article Card view for this returned element
                // **ADD DATA**
                // this is my id of the article body paragraph type we need only if no thumbnail or summary provided
                let bodyAndImageId = item.relationships.field_ucb_article_content.data.length ? item.relationships.field_ucb_article_content.data[0].id : "";
                let body = item.attributes.field_ucb_article_summary ? item.attributes.field_ucb_article_summary : "";
                body = body.trim();
                let imageSrc = "";

                // if no article summary, use a simplified article body
                if (!body.length && bodyAndImageId != "") {
                  getArticleParagraph(bodyAndImageId)
                    .then((response) => response.json())
                    .then((data) => {
                      // Remove any html tags within the article
                      let htmlStrip = data.data.attributes.field_article_text.processed.replace(
                        /<\/?[^>]+(>|$)/g,
                        ""
                      );
                      // Remove any line breaks if media is embedded in the body
                      let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
                      // take only the first 100 words ~ 500 chars
                      let trimmedString = lineBreakStrip.substr(0, 250);
                      // if in the middle of the string, take the whole word
                      if (trimmedString.length > 100) {
                        trimmedString = trimmedString.substr(
                          0,
                          Math.min(
                            trimmedString.length,
                            trimmedString.lastIndexOf(" ")
                          )
                        );
                        body = `${trimmedString}...`;
                      }
                      // set the contentBody of Article Summary card to the minified body instead
                      body = `${trimmedString}`;
                      document.getElementById(`body-${bodyAndImageId}`).innerText = body;
                    });
                }

                // if no thumbnail, show no image
                if (!item.relationships.field_ucb_article_thumbnail.data) {
                  imageSrc = null;
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
                let image = "";
                let articleSummarySize = "col-md-12";

                var articleRow = document.createElement('div');
                articleRow.className = 'ucb-article-card row';

                if (link && imageSrc) {
                  articleSummarySize = "col-md-10";

                  var imgContainer = document.createElement('div');
                  imgContainer.className = 'col-md-2 ucb-article-card-img';

                  var imgLink = document.createElement('a');
                  imgLink.href = link;
                  imgLink.setAttribute('role', 'presentation');
                  imgLink.setAttribute('aria-hidden', 'true');

                  var articleImg = document.createElement('img');
                  articleImg.src = imageSrc.src;
                  articleImg.setAttribute('alt', imageSrc.alt);

                  imgLink.appendChild(articleImg);
                  imgContainer.appendChild(imgLink);

                  // add to article row
                  articleRow.appendChild(imgContainer);
                }


                // Container
                var articleDataContainer = document.createElement('div');
                articleDataContainer.className = `col-sm-12 ${articleSummarySize} ucb-article-card-data`;


                // Header
                var articleDataLink = document.createElement('a');
                articleDataLink.href = link;

                var articleDataHead = document.createElement('h2');
                articleDataHead.className = "ucb-article-card-title";
                articleDataHead.innerText = title;

                articleDataLink.appendChild(articleDataHead);


                // Date
                var articleCardDate = document.createElement('span');
                articleCardDate.className = 'ucb-article-card-date';
                articleCardDate.innerText = date;

                // Summary

                var articleSummaryBody = document.createElement('p');
                articleSummaryBody.className = 'ucb-article-card-body';
                articleSummaryBody.id = `body-${bodyAndImageId}`;
                articleSummaryBody.innerText = body;

                // Read more & link
                var articleSummaryReadMore = document.createElement('span');
                articleSummaryReadMore.className = 'ucb-article-card-more';

                var readMoreLink = document.createElement('a');
                readMoreLink.href = link;
                readMoreLink.setAttribute('aria-hidden', 'true');
                readMoreLink.innerText = `Read more`;

                articleSummaryReadMore.appendChild(readMoreLink);

                //Appends

                articleDataContainer.appendChild(articleDataLink);
                articleDataContainer.appendChild(articleCardDate);
                articleDataContainer.appendChild(articleSummaryBody);
                articleDataContainer.appendChild(articleSummaryReadMore);

                articleRow.appendChild(articleDataContainer);

                let dataOutput = document.getElementById("ucb-al-data");
                let thisArticle = document.createElement("article");
                thisArticle.className = 'ucb-article-card-container';
                thisArticle.appendChild(articleRow);
                dataOutput.append(thisArticle);

                if (NEXTJSONURL) {
                  toggleMessage('ucb-el-load-more', 'inline-block');
                }
              }
            });

            // done loading -- hide the loading spinner graphic
            toggleMessage("ucb-al-loading", "none");
            resolve(NEXTJSONURL);
          }).catch(function (error) {
            // catch any fetch errors and let the user know so they're not endlessly watching the spinner
            console.log("Fetch Error in URL : " + JSONURL);
            console.log("Fetch Error is : " + error);
            // turn off spinner
            toggleMessage("ucb-al-loading", "none");
            // turn on default error message
            if (error) {
              toggleMessage("ucb-al-error", "block");

            }

          });

      }
    });
  }

  /*
   * Initilization and start of code 
   */

  // get the url from the data-jsonapi variable
  let el = document.getElementById("ucb-article-listing");
  let JSONURL = ""; // JSON:API URL 
  let NEXTJSONURL = ""; // next link for pagination 
  let CategoryExclude = ""; // categories to exclude
  let TagsExclude = ""; // tags to exclude 

  // check to see if we have the data we need to work with.  
  if (el) {
    JSONURL = el.dataset.jsonapi;
    CategoryExclude = el.dataset.excats;
    TagsExclude = el.dataset.extags;
  }

  // attempt to render the data requested 
  renderArticleList(JSONURL, CategoryExclude, TagsExclude,).then((response) => {
    if (response) {
      NEXTJSONURL = "/jsonapi/" + response;
    }
  });

  // watch for scrolling and determine if we're at the bottom of the content and need to request more
  const button = document.getElementById('ucb-el-load-more');
  button.addEventListener("click", function () {
    if (NEXTJSONURL) {
      renderArticleList(NEXTJSONURL, CategoryExclude, TagsExclude,).then((response) => {
        if (response) {
          NEXTJSONURL = "/jsonapi/" + response;
          loadingData = false;
        } else {
          NEXTJSONURL = "";
          toggleMessage("ucb-al-end-of-data", "block");
          toggleMessage('ucb-el-load-more');
        }
      });
    }
  });
})();
