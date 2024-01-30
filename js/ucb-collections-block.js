  /**
   * Main function that will load the initial data from the given URL and start processing it for display
   * @param {string} JSONURL - URL for the JSON:API endpoint with filters, sort and pagination 
   * @param {string} id - target DOM element to add the content to 
   * @param {string} IncludeCategories - array of categories to filter out when rendering 
   * @param {string} ExcludeTags - array of tags to filter out when rendering
   * @returns - Promise with resolve or reject
   */

  function renderCollectionCategories( JSONURL, CategoryMap, CategoryInclude) {
    return new Promise(function(resolve, reject) {
        let includeCatArray = CategoryInclude.split(",");
        console.log("XCAT", includeCatArray)
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
          if(data.links.next) {
            let nextURL = data.links.next.href.split("/jsonapi/");
            NEXTJSONURL = nextURL[1];
          } else {
            NEXTJSONURL = "";
          }
          console.log("Category Data Item: ", data);

           // console.log("Inner Map", CategoryMap)
          //console.log("data obj", data);
  
          // if no collections of returned, stop the loading spinner and let the user know we received no data that matches their query
          if (!data.data.length) {
            //toggleMessage("ucb-al-loading", "none");
            //toggleMessage("ucb-al-no-results", "block");
            reject;
          }
  
          data.data.map((item) => { 
            let currentDataID = item.attributes.drupal_internal__revision_id;
            console.log("CurrentDataID: ", currentDataID)
            console.log("includeCatArr: ", includeCatArray)
            if(includeCatArray.includes(currentDataID.toString())) {
                let currentClassName = "category-label-" + currentDataID;
                let categoryLabels = document.getElementsByClassName(currentClassName);
                for (let i = 0; i < categoryLabels.length; i++) {
                    categoryLabels[i].innerHTML = item.attributes.name;
                  }
            CategoryMap.set(currentDataID, item.attributes.name);

            }
          })
          // done loading -- hide the loading spinner graphic
          //toggleMessage("ucb-al-loading", "none");
          resolve(NEXTJSONURL);
        }).catch(function(error) {
          // catch any fetch errors and let the user know so they're not endlessly watching the spinner
          console.log("Fetch Error in URL : " + JSONURL);
          console.log("Fetch Error is : " + error);
          // turn off spinner
          //toggleMessage("ucb-al-loading", "none");
          // turn on default error message
          if(error){
            //toggleMessage("ucb-al-error", "block");
  
          }
  
      });
  
    }
    });
  }
  function renderCollectionList( JSONURL, IncludeCategories = "", ExcludeTags = "", CategoryMap) {
    return new Promise(function(resolve, reject) {
    let includeCatArray = IncludeCategories.split(",").map(Number);
    let includeTypeArray = ExcludeTags.split(",").map(Number);
    // next URL if there is one, will be returned by this funtion
    let NEXTJSONURL = "";
       console.log(CategoryMap);
        console.log("CC2", CategoryMap.get("5"))
        console.log("CC3", CategoryMap.get(5))


    if (JSONURL) {
      //let el = document.getElementById(id);
  
      // show the loading spinner while we load the data
     // toggleMessage("ucb-al-loading", "block");
  
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
  
          // if no collections of returned, stop the loading spinner and let the user know we received no data that matches their query
          if (!data.data.length) {
            //toggleMessage("ucb-al-loading", "none");
            //toggleMessage("ucb-al-no-results", "block");
            reject;
          }
  
          // Below objects are needed to match images with their corresponding collections. There are two endpoints => data.data (collection) and data.included (incl. media), both needed to associate a media library image with its respective collection
          let urlObj = {};
          let idObj = {};
          let altObj = {};
          // Remove any blanks from our collections before map
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
          // console.log("idObj", idObj);
          // console.log("urlObj", urlObj);
          // console.log('altObj', altObj)
          //iterate over each item in the array
          data.data.map((item) => {
            let thisCollectionCats = [];
            let thisCollectionTypes = "";
            let typeInclusion = 0;
            console.log("Data", item)
            // // loop through and grab all of the categories
            if (item.relationships.field_collection_item_category.data) {
              for (let i = 0; i < item.relationships.field_collection_item_category.data.length; i++) {
                thisCollectionCats.push(
                  item.relationships.field_collection_item_category.data[i].meta.drupal_internal__target_id
                )
              }
            }

            console.log("Current item categories: ", thisCollectionCats);
            // console.log("this collection cats",thisCollectionCats)
            // // loop through and grab all of the tags
            if (item.relationships.field_collection_item_page_type.data) {
                thisCollectionTypes = item.relationships.field_collection_item_page_type.data.meta.drupal_internal__target_id;
            }
            console.log("Current item types: ", thisCollectionTypes);
  
            // checks to see if the current collection (item) contains a category or tag scheduled for exclusion
            let doesIncludeCat = thisCollectionCats;
            let doesIncludeType = thisCollectionTypes;
                if(includeTypeArray.includes(thisCollectionTypes)) {
                    typeInclusion = 1;
                }
              
  
            // render the content if there is a similar type
            if (typeInclusion == 1) {
              // we need to render the Collection Card view for this returned element
              // **ADD DATA**
              // this is my id of the collection body paragraph type we need only if no thumbnail or summary provided
            //let bodyAndImageId = item.relationships.field_ucb_collection_content.data.length ? item.relationships.field_ucb_collection_content.data[0].id : "";
              let body = item.attributes.field_collection_item_preview ? item.attributes.field_collection_item_preview.value.replace(
                /<\/?[^>]+(>|$)/g,
                ""
              ) : "";
              body = body.trim();

              let imageSrc = "";
  
              // if no collection summary, use a simplified collection body
              if (!body.length) {
                let data = item.attributes.body;
                    // Remove any html tags within the collection
                    let htmlStrip = data.value.replace(
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
                    // set the contentBody of Collection Summary card to the minified body instead
                    body = `${trimmedString}`;
                    //document.getElementById(`body-${bodyAndImageId}`).innerText = body;
                  
              }
  
              // if no thumbnail, show no image
              if (!item.relationships.field_collection_item_thumbnail.data) {
                imageSrc = "";
              } else {
                //Use the idObj as a memo to add the corresponding image url
                let thumbId = item.relationships.field_collection_item_thumbnail.data.id;
                imageSrc = altObj[idObj[thumbId]];
              }
  
              let title = item.attributes.title;
              let link = item.attributes.path.alias;
              let image = "";
              let collectionSummarySize = "col-md-12";
  
              var collectionBlock = document.createElement('div')
              collectionBlock.className = 'collections-item-block'
  
              if(link && imageSrc) {
                  collectionSummarySize = "col-md-10"
  
                  var imgContainer = document.createElement('div')
                  imgContainer.className = 'ucb-collection-card-img'
  
                  var imgLink = document.createElement('a')
                  imgLink.href = link;
  
                  var collectionImg = document.createElement('img')
                  collectionImg.src = imageSrc;
  
                  imgLink.appendChild(collectionImg)
                  imgContainer.appendChild(imgLink)
  
                  // add to collection row
                  collectionBlock.appendChild(imgContainer)
                }
  
  
                // Container
                var collectionDataContainer = document.createElement('div')
                collectionDataContainer.className = `col-sm-12 ${collectionSummarySize} ucb-collection-card-data`
                
  
                // Header
                var collectionDataLink = document.createElement('a')
                collectionDataLink.href = link;
  
                var collectionDataHead = document.createElement('h4')
                collectionDataHead.className = "ucb-collection-card-title"
                collectionDataHead.innerText = title;
  
                collectionDataLink.appendChild(collectionDataHead)
  
  
  
                // Summary
  
                var collectionSummaryBody = document.createElement('p')
                collectionSummaryBody.className = 'ucb-collection-item-body'
                //collectionSummaryBody.id = `body-${bodyAndImageId}`
                collectionSummaryBody.innerText = body;
  
                //Appends
  
                collectionDataContainer.appendChild(collectionDataLink)
                collectionDataContainer.appendChild(collectionSummaryBody)
                collectionBlock.appendChild(collectionDataContainer)
  
  
  
              let dataOutput = document.getElementById("collections-grid-block-data");
              let thisCollection = document.createElement("collection");
              thisCollection.className = 'ucb-collection-card-container';

            thisCollectionCats.map((item) => {
                console.log("TOI: ", typeof item)
                if(CategoryMap.has(item)) {
                    thisCollection.classList.add('ucb-collection-category-' + item);
                }
            });


            console.log("Check5Build", CategoryMap.get(5))
              thisCollection.appendChild(collectionBlock);
              dataOutput.append(thisCollection);
  
              if(NEXTJSONURL){
                toggleMessage('ucb-el-load-more', 'inline-block')
              }
            }
          })
  
          // done loading -- hide the loading spinner graphic
          //toggleMessage("ucb-al-loading", "none");
          resolve(NEXTJSONURL);
        }).catch(function(error) {
          // catch any fetch errors and let the user know so they're not endlessly watching the spinner
          console.log("Fetch Error in URL : " + JSONURL);
          console.log("Fetch Error is : " + error);
          // turn off spinner
          //toggleMessage("ucb-al-loading", "none");
          // turn on default error message
          if(error){
            //toggleMessage("ucb-al-error", "block");
  
          }
  
      });
  
    }
    });
  }
  
  function renderFilterList(CategoryMap) {
    return new Promise(function(resolve, reject) {
      /*let collection = document.getElementsByClassName("category-label");
        console.log("MAPISSUE", CategoryMap);
        console.log("CC", CategoryMap.get(5));
        console.log(typeof CategoryMap);
    [].forEach.call(collection, function (item) {
        if(CategoryMap.has(3)) {
        console.log("CC2", CategoryMap.get("5"))
        console.log("CC3", CategoryMap.get(5))

        }
        item.innerText = CategoryMap.get(Number(item.innerText));

    });*/
    });
   
    /*collection.map((item) => { 
        console.log("Filter: ", item);
      })*/
  }

  /**
   * Initilization and start of code 
   */
  (function () {
    // get the url from the data-jsonapi variable
    let el = document.getElementById("collections-grid-block-data");
    let JSONURL = ""; // JSON:API URL 
    let JSONCATURL = ""; // JSON:API Category URL 
    let NEXTJSONURL = ""; // next link for pagination 
    let CategoryInclude = ""; // categories to exclude
    let TagsExclude = ""; // tags to exclude 
    let CategoryMap = new Map();
  
    // check to see if we have the data we need to work with.  
    if (el) {
      JSONURL = el.dataset.jsonapi;
      JSONCATURL = el.dataset.jsoncats;
      CategoryInclude = el.dataset.currentcats;
      TagsExclude = el.dataset.extags;
    }
    console.log("\n JSONURL: " + JSONURL);
    console.log("\n JSONCATURL: " + JSONCATURL);
    console.log("\n CategoryInclude: " + CategoryInclude);
    console.log("\n TagsExclude: " + TagsExclude);
    // attempt to render the data requested 
    renderCollectionCategories( JSONCATURL, CategoryMap, CategoryInclude).then((response) => {
      if(response) {
        NEXTJSONURL = "/jsonapi/" + response;
      }
    });

    console.log("Outer Map", CategoryMap)
    console.log("Check Map Values 3: ", CategoryMap.get(3));

    // attempt to render the data requested 
    renderCollectionList( JSONURL, CategoryInclude, TagsExclude, CategoryMap).then((response) => {
      if(response) {
        NEXTJSONURL = "/jsonapi/" + response;
      }
    });
    
    renderFilterList(CategoryMap);
  })()
  
 function filterChecked() {
    let allCards = document.getElementsByClassName("ucb-collection-card-container");
    let noFilters = 0;
    for (let i = 0; i < allCards.length; i++) {
    allCards[i].classList.add("filtered");
    }

    let allChecks = document.getElementsByClassName("category-checkbox");
    for (let i = 0; i < allChecks.length; i++) {
        let currentID = allChecks[i].dataset.category;
        if(allChecks[i].checked) {
            noFilters = 1;
            let checkedCards = document.getElementsByClassName("ucb-collection-category-" + currentID);
            for (let i = 0; i < checkedCards.length; i++) {
            checkedCards[i].classList.remove("filtered");
            }

            
        }
    }

    if(noFilters == 0) {
        for (let i = 0; i < allCards.length; i++) {
        allCards[i].classList.remove("filtered");
        }

    }
  }


 function resetFilters() {
    let allCards = document.getElementsByClassName("ucb-collection-card-container");
    for (let i = 0; i < allCards.length; i++) {
    allCards[i].classList.remove("filtered");
    }

    let allChecks = document.getElementsByClassName("category-checkbox");
    for (let i = 0; i < allChecks.length; i++) {
        allChecks[i].checked = false;
    }

  }