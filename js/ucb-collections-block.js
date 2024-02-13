(function (customElements) {

  /**
   * Main function that will load the initial data from the given URL and start processing it for display
   * @param {string} JSONURL - URL for the JSON:API endpoint with filters, sort and pagination
   * @param {string} id - target DOM element to add the content to
   * @param {string} IncludeCategories - array of categories to include when rendering
   * @param {string} ExcludeTags - array of tags to filter out when rendering
   * @returns - Promise with resolve or reject
   */

  function renderCollectionCategories(JSONURL, blockID) {
    return new Promise(function (resolve, reject) {
      // next URL if there is one, will be returned by this funtion
      let NEXTJSONURL = "";

      if (JSONURL) {
        //let el = document.getElementById(id);

        // show the loading spinner while we load the data
        // toggleMessage("ucb-al-loading", "block");

        fetch(JSONURL)
          .then((reponse) => reponse.json())
          .then((data) => {
            // get the next URL and return that if there is one
            if (data.links.next) {
              NEXTJSONURL = data.links.next.href;
            } else {
              NEXTJSONURL = "";
            }

            // if no collections of returned, stop the loading spinner and let the user know we received no data that matches their query
            if (!data.data.length) {
              reject;
            }

            let hiddenCategories =
              document.getElementsByClassName("category-checkbox-" + blockID);
            for (let i = 0; i < hiddenCategories.length; i++) {
              hiddenCategories[i].classList.remove("collection-grid-no-display");
            }

            data.data.map((item) => {
              let currentDataID = item.attributes.drupal_internal__revision_id;
              let currentClassName =
                "category-label-" + currentDataID + "-" + blockID;
              let categoryLabels =
                document.getElementsByClassName(currentClassName);
              //console.log("currentClass: ", currentClassName)
              for (let i = 0; i < categoryLabels.length; i++) {
                //console.log("checkClass:")
                categoryLabels[i].innerHTML = item.attributes.name;
                categoryLabels[i].classList.remove("collection-grid-no-display");
              }
            });

            resolve(NEXTJSONURL);
          })
          .catch(function (error) {
            // catch any fetch errors and let the user know so they're not endlessly watching the spinner
            console.log("Fetch Error in URL : " + JSONURL);
            console.log("Fetch Error is : " + error);
          });
      }
    });
  }
  function renderCollectionList(
    JSONURL,
    ExcludeTags = "",
    BodyDisplay,
    blockID,
    BaseURL
  ) {
    return new Promise(function (resolve, reject) {
      let includeTypeArray = ExcludeTags.split(",").map(Number);
      // next URL if there is one, will be returned by this funtion
      let NEXTJSONURL = "";

      if (JSONURL) {
        //let el = document.getElementById(id);

        fetch(JSONURL)
          .then((reponse) => reponse.json())
          .then((data) => {
            // console.log("Data", data);
            // get the next URL and return that if there is one
            if (data.links.next) {
              NEXTJSONURL = data.links.next.href;
              //console.log("NEXTJSONURL", NEXTJSONURL)
            } else {
              NEXTJSONURL = "";
            }
            //console.log("data obj", data);

            // if no collections of returned, stop the loading spinner and let the user know we received no data that matches their query
            if (!data.data.length) {
              reject;
            }

            // Below objects are needed to match images with their corresponding collections. There are two endpoints => data.data (collection) and data.included (incl. media), both needed to associate a media library image with its respective collection
            let urlObj = {};
            let idObj = {};
            let altObj = {};
            let altTagObj = {};
            // Remove any blanks from our collections before map
            if (data.included) {
              // removes all other included data besides images in our included media
              let idFilterData = data.included.filter((item) => {
                return item.type == "media--image";
              });

              let altFilterData = data.included.filter((item) => {
                return item.type == "file--file";
              });
              // finds the focial point version of the thumbnail
              altFilterData.map((item) => {
                // checks if consumer is working, else default to standard image instead of focal image
                if (item.links.focal_image_wide != undefined) {
                  altObj[item.id] = item.links.focal_image_wide.href;
                } else {
                  altObj[item.id] = item.attributes.uri.url;
                }
              });

              // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
              idFilterData.map((pair) => {
                idObj[pair.id] = pair.relationships.thumbnail.data.id;
                altTagObj[pair.id] = pair.relationships.thumbnail.data.meta.alt;
              });
            }
            // console.log("idObj", idObj);
            // console.log("urlObj", urlObj);
            // console.log('altObj', altObj)
            //iterate over each item in the array
            data.data.map((item) => {
              // console.log("item", item);
              let thisCollectionCats = [];
              let thisCollectionTypes = "";
              let typeInclusion = 0;
              // // loop through and grab all of the categories
              if (item.relationships.field_collection_item_category.data) {
                for (
                  let i = 0;
                  i <
                  item.relationships.field_collection_item_category.data.length;
                  i++
                ) {
                  thisCollectionCats.push(
                    item.relationships.field_collection_item_category.data[i].meta
                      .drupal_internal__target_id
                  );
                }
              }

              // console.log("this collection cats",thisCollectionCats)
              // // loop through and grab all of the tags
              if (item.relationships.field_collection_item_page_type.data) {
                thisCollectionTypes =
                  item.relationships.field_collection_item_page_type.data.meta
                    .drupal_internal__target_id;
              }

              // checks to see if the current collection (item) contains a category or tag scheduled for exclusion
              let doesIncludeCat = thisCollectionCats;
              let doesIncludeType = thisCollectionTypes;
              if (includeTypeArray.includes(thisCollectionTypes)) {
                typeInclusion = 1;
              }

              // render the content if there is a similar type
              if (typeInclusion == 1) {
                // we need to render the Collection Card view for this returned element
                // **ADD DATA**
                // this is my id of the collection body paragraph type we need only if no thumbnail or summary provided
                //let bodyAndImageId = item.relationships.field_ucb_collection_content.data.length ? item.relationships.field_ucb_collection_content.data[0].id : "";
                let body = "";
                if (item.attributes.field_collection_item_preview) {
                  body = item.attributes.field_collection_item_preview.replace(
                    /<\/?[^>]+(>|$)/g,
                    ""
                  );
                  var el = document.createElement("div");
                  el.innerHTML = body;
                  body = el.innerText;
                }

                body = body.trim();

                let imageSrc = "";
                let imageAlt = "";
                // if no collection summary, use a simplified collection body
                if (!body.length) {
                  let data = item.attributes.body;
                  // Remove any html tags within the collection
                  let htmlStrip = data.value.replace(/<\/?[^>]+(>|$)/g, "");
                  // Remove any line breaks if media is embedded in the body
                  let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");

                  var el = document.createElement("div");
                  el.innerHTML = lineBreakStrip;
                  lineBreakStrip = el.innerText;
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
                  } else {
                    // set the contentBody of Collection Summary card to the minified body instead
                    body = `${trimmedString}`;
                  }
                  //document.getElementById(`body-${bodyAndImageId}`).innerText = body;
                }

                // if no thumbnail, show no image
                if (!item.relationships.field_collection_item_thumbnail.data) {
                  imageSrc = "";
                } else {
                  //Use the idObj as a memo to add the corresponding image url
                  let thumbId =
                    item.relationships.field_collection_item_thumbnail.data.id;
                  imageSrc = altObj[idObj[thumbId]];
                  imageAlt = altTagObj[thumbId];
                  //console.log("Alt: ", imageAlt)
                }

                let title = item.attributes.title;
                let link = "";
                // console.log("Link: ", BaseURL + "/node" + item.attributes.drupal_internal__nid);
                if (item.attributes.path.alias) {
                  link = item.attributes.path.alias;
                } else {
                  link =
                    BaseURL + "/node/" + item.attributes.drupal_internal__nid;
                }
                let image = "";
                let collectionSummarySize = "col-md-12";

                var collectionBlock = document.createElement("div");
                collectionBlock.className = "collections-item-block";

                if (link && imageSrc) {
                  collectionSummarySize = "col-md-10";

                  var imgContainer = document.createElement("div");
                  imgContainer.className = "ucb-collection-card-img";

                  var imgLink = document.createElement("a");
                  imgLink.href = link;

                  var collectionImg = document.createElement("img");
                  collectionImg.src = imageSrc;
                  collectionImg.alt = imageAlt;

                  imgLink.appendChild(collectionImg);
                  imgContainer.appendChild(imgLink);

                  // add to collection row
                  collectionBlock.appendChild(imgContainer);
                }

                // Container
                var collectionDataContainer = document.createElement("div");
                collectionDataContainer.className = `col-sm-12 ${collectionSummarySize} ucb-collection-card-data`;

                // Header
                var collectionDataLink = document.createElement("a");
                collectionDataLink.href = link;

                var collectionDataHead = document.createElement("h4");
                collectionDataHead.className = "ucb-collection-card-title";
                collectionDataHead.innerText = title;

                collectionDataLink.appendChild(collectionDataHead);

                collectionDataContainer.appendChild(collectionDataLink);

                // Summary
                if (BodyDisplay == "show") {
                  var collectionSummaryBody = document.createElement("p");
                  collectionSummaryBody.className = "ucb-collection-item-body";
                  //collectionSummaryBody.id = `body-${bodyAndImageId}`
                  collectionSummaryBody.innerText = body;
                  collectionDataContainer.appendChild(collectionSummaryBody);
                }

                //Appends
                collectionBlock.appendChild(collectionDataContainer);

                let dataOutput = document.getElementById(
                  "collections-grid-block-data-" + blockID
                );
                let thisCollection = document.createElement("collection");
                thisCollection.className =
                  "ucb-collection-card-container ucb-collection-card-container-" +
                  blockID;

                thisCollectionCats.map((item) => {
                  thisCollection.classList.add(
                    "ucb-collection-category-" + item + "-" + blockID
                  );
                });

                thisCollection.appendChild(collectionBlock);
                dataOutput.append(thisCollection);

                if (NEXTJSONURL) {
                  //toggleMessage('ucb-el-load-more', 'inline-block')
                }
              }
            });

            // done loading -- hide the loading spinner graphic
            //toggleMessage("ucb-al-loading", "none");
            resolve(NEXTJSONURL);
          })
          .catch(function (error) {
            // catch any fetch errors and let the user know so they're not endlessly watching the spinner
            console.log("Fetch Error in URL : " + JSONURL);
            console.log("Fetch Error is : " + error);
            // turn off spinner
            //toggleMessage("ucb-al-loading", "none");
            // turn on default error message
            if (error) {
              //toggleMessage("ucb-al-error", "block");
            }
          });
      }
    });
  }

  function filterChecked(blockID) {
    //console.log("BlockID: ", blockID)
    let allCards = document.getElementsByClassName(
      "ucb-collection-card-container-" + blockID
    );
    let addedSpanData = document.getElementsByClassName(
      "collection-grid-filter-span-" + blockID
    );
    let noFilters = 0;
    for (let i = 0; i < addedSpanData.length; i++) {
      addedSpanData[i].innerHTML = "<strong>Selected Filters: </strong>";
    }

    for (let i = 0; i < allCards.length; i++) {
      allCards[i].classList.add("filtered");
    }

    let allChecks = document.getElementsByClassName(
      "category-checkbox-" + blockID
    );
    for (let i = 0; i < allChecks.length; i++) {
      let currentID = allChecks[i].dataset.category;
      if (allChecks[i].checked) {
        noFilters = 1;
        let checkedCards = document.getElementsByClassName(
          "ucb-collection-category-" + currentID + "-" + blockID
        );
        for (let i = 0; i < checkedCards.length; i++) {
          checkedCards[i].classList.remove("filtered");
        }

        let currentCategory = document.getElementsByClassName(
          "category-label-" + currentID + "-" + blockID
        );
        for (let i = 0; i < addedSpanData.length; i++) {
          addedSpanData[i].innerHTML =
            addedSpanData[i].innerHTML + currentCategory[0].innerText + ", ";
        }
      }
    }

    for (let i = 0; i < addedSpanData.length; i++) {
      addedSpanData[i].innerHTML =
        addedSpanData[i].innerHTML.slice(0, -2) +
        "<a href='javascript:;' data-collection='collection-28' class='collection-reset' style='display: inline;' onclick = 'resetFilters(" +
        blockID +
        ")'><i class='fa-solid fa-xmark'></i> Reset Filters</a>";
    }
    if (noFilters == 0) {
      for (let i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove("filtered");
      }
      for (let i = 0; i < addedSpanData.length; i++) {
        addedSpanData[i].innerHTML = "";
      }
    }
  }

  function filterSingle(currentID, blockID) {
    //Reset and hide all cards to remove previous filters
    let allCards = document.getElementsByClassName(
      "ucb-collection-card-container-" + blockID
    );
    for (let i = 0; i < allCards.length; i++) {
      allCards[i].classList.add("filtered");
    }

    //Unfilter the active cards to be shown
    let checkedCards = document.getElementsByClassName(
      "ucb-collection-category-" + currentID + "-" + blockID
    );
    for (let i = 0; i < checkedCards.length; i++) {
      checkedCards[i].classList.remove("filtered");
    }

    //Reset all active buttons
    let allFilterButtons = document.getElementsByClassName(
      "category-label-reset-" + blockID
    );
    for (let i = 0; i < allFilterButtons.length; i++) {
      allFilterButtons[i].classList.remove("collection-grid-single-active");
    }

    let resetButtons = document.getElementsByClassName(
      "category-single-button-all-" + blockID
    );
    for (let i = 0; i < resetButtons.length; i++) {
      resetButtons[i].classList.remove("collection-grid-single-active");
    }

    //Add css for currently active button
    let filterCurrentButtons = document.getElementsByClassName(
      "category-label-" + currentID + "-" + blockID
    );
    for (let i = 0; i < filterCurrentButtons.length; i++) {
      filterCurrentButtons[i].classList.add("collection-grid-single-active");
    }



  }

  function resetFilters(blockID) {
    let allCards = document.getElementsByClassName(
      "ucb-collection-card-container-" + blockID
    );
    for (let i = 0; i < allCards.length; i++) {
      allCards[i].classList.remove("filtered");
    }

    let allChecks = document.getElementsByClassName(
      "category-checkbox-" + blockID
    );
    for (let i = 0; i < allChecks.length; i++) {
      allChecks[i].checked = false;
    }

    let clearSpanData = document.getElementsByClassName(
      "collection-grid-filter-span-" + blockID
    );
    for (let i = 0; i < clearSpanData.length; i++) {
      clearSpanData[i].innerHTML = "";
    }
  }

  function resetSingleFilters(blockID) {
    let allCards = document.getElementsByClassName(
      "ucb-collection-card-container-" + blockID
    );
    let resetButtons = document.getElementsByClassName(
      "category-single-button-all-" + blockID
    );
    let filterButtons = document.getElementsByClassName(
      "category-label-reset-" + blockID
    );
    for (let i = 0; i < allCards.length; i++) {
      allCards[i].classList.remove("filtered");
    }

    for (let i = 0; i < resetButtons.length; i++) {
      resetButtons[i].classList.add("collection-grid-single-active");
    }

    for (let i = 0; i < filterButtons.length; i++) {
      filterButtons[i].classList.remove("collection-grid-single-active");
    }
  }


  class CollectionGridElement extends HTMLElement {
    /**
     * Initilization and start of code
     */
    constructor() {
      // Get all instances of the collection grid
      let collectionGridInstances = document.getElementsByClassName(
        "collection-grid-container"
      );
      //console.log(collectionGridInstances)
      for (let i = 0; i < collectionGridInstances.length; i++) {
        // get the url from the data-jsonapi variable
        let el = document.getElementById(
          "collections-grid-block-data-" +
          collectionGridInstances[i].dataset.blockid
        );
        let JSONURL = ""; // JSON:API URL
        let JSONCATURL = ""; // JSON:API Category URL
        let NEXTJSONURL = ""; // next link for pagination
        let TagsExclude = ""; // tags to exclude
        let BodyDisplay = ""; // variable to display body text or not
        let BaseURL = "";
        let blockID = collectionGridInstances[i].dataset.blockid;

        // check to see if we have the data we need to work with.
        if (el) {
          JSONURL = el.dataset.jsonapi;
          JSONCATURL = el.dataset.jsoncats;
          TagsExclude = el.dataset.extags;
          BodyDisplay = el.dataset.bodydisplay;
          BaseURL = el.dataset.baseurl;
        }
        /*
        console.log("BASEURL: ", BaseURL)
        
        console.log("\n JSONURL: " + JSONURL);
        console.log("\n JSONCATURL: " + JSONCATURL);
        console.log("\n TagsExclude: " + TagsExclude);
        console.log("\n BodyDisplay: " + BodyDisplay);
        */
        // attempt to render the data requested
        renderCollectionCategories(JSONCATURL, blockID).then((response) => {
          if (response) {
            NEXTJSONURL = BaseURL + "/jsonapi/" + response;
          }
        });

        // attempt to render the data requested
        renderCollectionList(
          JSONURL,
          TagsExclude,
          BodyDisplay,
          blockID,
          BaseURL
        ).then((response) => {
          if (response) {
            NEXTJSONURL = BaseURL + "/jsonapi/" + response;
          }
        });
      }
    }
  }

  customElements.define('collection-grid', CollectionGridElement);

})(window.customElements);
