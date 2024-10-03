// (function () {
//   /**
//    * Get additional data from the paragraph content attached to the Article node
//    * @param {string} id - internal id used by Drupal to get the specific paragraph
//    */
//   async function getArticleParagraph(id) {
//     if (!id) {
//       return "";
//     }
//     try {
//       const response = await fetch(
//         `${baseURI}/jsonapi/paragraph/article_content/${id}`
//       );
//       const data = await response.json();
//       if (!data.data.attributes.field_article_text) return ""; //  needed for external articles
//       let htmlStrip = data.data.attributes.field_article_text.processed.replace(
//         /<\/?[^>]+(>|$)/g,
//         ""
//       );
//       let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
//       let trimmedString = lineBreakStrip.substr(0, 250);

//       if (trimmedString.length > 100) {
//         trimmedString = trimmedString.substr(
//           0,
//           Math.min(trimmedString.length, trimmedString.lastIndexOf(" "))
//         );
//       }
//       return trimmedString + "...";
//     } catch (Error) {
//       console.error(
//         "There was an error fetching Article Paragraph from the API - Please try again later."
//       );
//       console.error(Error);
//       toggleMessage("ucb-al-loading");
//       toggleMessage("ucb-al-api-error", "block");
//       return ""; // Return an empty string in case of error
//     }
//   }

//   /**
//    * Helper function to show/hide elements in the DOM
//    * @param {string} id - CSS ID of the element to target
//    * @param {string} display - display mode for that element (block | none)
//    */
//   function toggleMessage(id, display = "none") {
//     if (id) {
//       var toggle = document.getElementById(id);

//       if (toggle) {
//         switch (display) {
//           case "block":
//             toggle.style.display = "block";
//             break;
//           case "inline-block":
//             toggle.style.display = "inline-block";
//             break;
//           case "none":
//             toggle.style.display = "none";
//             break;
//           default:
//             toggle.style.display = "none";
//             break;
//         }
//       }
//     }
//   }

//   /**
//    * Main function that will load the initial data from the given URL and start processing it for display
//    * @param {string} JSONURL - URL for the JSON:API endpoint with filters, sort and pagination
//    * @param {string} id - target DOM element to add the content to
//    * @param {string} ExcludeCategories - array of categories to filter out when rendering
//    * @param {string} ExcludeTags - array of tags to filter out when rendering
//    * @returns - Promise with resolve or reject
//    */
//   async function renderArticleList(JSONURL, ExcludeCategories = "", ExcludeTags = "") {
//     return new Promise(function (resolve, reject) {
//       let excludeCatArray = ExcludeCategories.split(",").map(Number);
//       let excludeTagArray = ExcludeTags.split(",").map(Number);
//       // next URL if there is one, will be returned by this funtion
//       let NEXTJSONURL = "";

//       if (JSONURL) {
//         //let el = document.getElementById(id);

//         // show the loading spinner while we load the data
//         toggleMessage("ucb-al-loading", "block");

//         fetch(JSONURL)
//           .then((reponse) => reponse.json())
//           .then(async (data) => {
//             // get the next URL and return that if there is one
//             if (data.links.next) {
//               let nextURL = data.links.next.href.split("/jsonapi/");
//               NEXTJSONURL = nextURL[1];
//             } else {
//               NEXTJSONURL = "";
//             }

//             // if no articles of returned, stop the loading spinner and let the user know we received no data that matches their query
//             if (!data.data.length) {
//               toggleMessage("ucb-al-loading", "none");
//               toggleMessage("ucb-al-no-results", "block");
//               reject;
//             }

//             // Below objects are needed to match images with their corresponding articles. There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
//             let urlObj = {};
//             let idObj = {};
//             let altObj = {};
//             // Remove any blanks from our articles before map
//             if (data.included) {
//               // removes all other included data besides images in our included media
//               let idFilterData = data.included.filter((item) => {
//                 return item.type == "media--image";
//               });

//               let altFilterData = data.included.filter((item) => {
//                 return item.type == 'file--file';
//               });
//               // finds the focial point version of the thumbnail
//               altFilterData.map((item) => {
//                 // checks if consumer is working, else default to standard image instead of focal image
//                 if (item.links.focal_image_square != undefined) {
//                   altObj[item.id] = { src: item.links.focal_image_square.href }
//                 } else {
//                   altObj[item.id] = { src: item.attributes.uri.url }
//                 }
//               });

//               // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
//               idFilterData.map((pair) => {
//                 const thumbnailId = pair.relationships.thumbnail.data.id;
//                 idObj[pair.id] = pair.relationships.thumbnail.data.id;
//                 altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt;
//               });
//             }
//             // Make these promises so they resolve in chronological order with PromiseAll
//             let promises = data.data.map(async (item) => {
//               let thisArticleCats = [];
//               let thisArticleTags = [];
//               // // loop through and grab all of the categories
//               if (item.relationships.field_ucb_article_categories) {
//                 for (let i = 0; i < item.relationships.field_ucb_article_categories.data.length; i++) {
//                   thisArticleCats.push(
//                     item.relationships.field_ucb_article_categories.data[i].meta
//                       .drupal_internal__target_id
//                   );
//                 }
//               }
//               // // loop through and grab all of the tags
//               if (item.relationships.field_ucb_article_tags) {
//                 for (var i = 0; i < item.relationships.field_ucb_article_tags.data.length; i++) {
//                   thisArticleTags.push(item.relationships.field_ucb_article_tags.data[i].meta.drupal_internal__target_id)
//                 }
//               }
//               // checks to see if the current article (item) contains a category or tag scheduled for exclusion
//               let doesIncludeCat = thisArticleCats;
//               let doesIncludeTag = thisArticleTags;

//               // check to see if we need to filter on categories
//               if (excludeCatArray.length && thisArticleCats.length) {
//                 doesIncludeCat = thisArticleCats.filter((element) =>
//                   excludeCatArray.includes(element)
//                 );
//               }
//               // check to see if we need to filter on tags
//               if (excludeTagArray.length && thisArticleTags.length) {
//                 doesIncludeTag = thisArticleTags.filter((element) =>
//                   excludeTagArray.includes(element)
//                 );
//               }

//               // if we didn't match any of the filtered tags or cats, then render the content
//               if (doesIncludeCat.length == 0 && doesIncludeTag.length == 0) {
//                 // we need to render the Article Card view for this returned element
//                 // **ADD DATA**
//                 // this is my id of the article body paragraph type we need only if no thumbnail or summary provided
//                 let bodyAndImageId = item.relationships.field_ucb_article_content.data.length ? item.relationships.field_ucb_article_content.data[0].id : "";
//                 let body = item.attributes.field_ucb_article_summary ? item.attributes.field_ucb_article_summary : "";
//                 body = body.trim();

//                 let imageSrc = "";

//                 // if no article summary, use a simplified article body
//                 if (!body.length && bodyAndImageId != "") {
//                   body = await getArticleParagraph(bodyAndImageId);
//                 }

//                 // if no thumbnail, show no image
//                 if (!item.relationships.field_ucb_article_thumbnail.data) {
//                   imageSrc = null;
//                 } else {
//                   //Use the idObj as a memo to add the corresponding image url
//                   let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
//                   imageSrc = altObj[idObj[thumbId]];
//                 }

//                 //Date - make human readable
//                 const options = { year: 'numeric', month: 'short', day: 'numeric' };
//                 let date = new Date(item.attributes.created).toLocaleDateString('en-us', options);
//                 let title = item.attributes.title;
//                 let link = baseURI + item.attributes.path.alias;

//                 // Pre-create the article rows in order
//                 return {
//                   articleRow: createArticleRow(title, link, date, body, imageSrc, bodyAndImageId)
//                 };
//               }
//             });

//             let results = await Promise.all(promises);

//             results
//             .filter(result => result !== undefined)
//             .forEach(result => {
//               let dataOutput = document.getElementById("ucb-al-data");
//               let thisArticle = document.createElement("article");
//               thisArticle.className = 'ucb-article-card-container';
//               thisArticle.appendChild(result.articleRow);
//               dataOutput.append(thisArticle);
//             });


//             if (NEXTJSONURL) {
//               toggleMessage('ucb-el-load-more', 'inline-block');
//             }
//             toggleMessage("ucb-al-loading", "none");
//             resolve(NEXTJSONURL);
//           }).catch(function (error) {
//             console.error("Fetch Error in URL : " + JSONURL);
//             console.error("Fetch Error is : " + error);
//             toggleMessage("ucb-al-loading", "none");
//             toggleMessage("ucb-al-error", "block");
//           });
//       }
//     });
//   }

  // Helper function that handles the creation of article rows
  // function createArticleRow(title, link, date, body, imageSrc, bodyAndImageId) {
  //   var articleRow = document.createElement('div');
  //   articleRow.className = 'ucb-article-card row';

  //   if (link && imageSrc) {
  //     var articleSummarySize = "col-md-10";

  //     var imgContainer = document.createElement('div');
  //     imgContainer.className = 'col-md-2 ucb-article-card-img';

  //     var imgLink = document.createElement('a');
  //     imgLink.href = link;
  //     imgLink.setAttribute('role', 'presentation');
  //     imgLink.setAttribute('aria-hidden', 'true');

  //     var articleImg = document.createElement('img');
  //     articleImg.src = imageSrc.src;
  //     articleImg.setAttribute('alt', imageSrc.alt);

  //     imgLink.appendChild(articleImg);
  //     imgContainer.appendChild(imgLink);

  //     articleRow.appendChild(imgContainer);
  //   } else {
  //     articleSummarySize = "col-md-12";
  //   }

  //   var articleDataContainer = document.createElement('div');
  //   articleDataContainer.className = `col-sm-12 ${articleSummarySize} ucb-article-card-data`;

  //   var articleDataLink = document.createElement('a');
  //   articleDataLink.href = link;

  //   var articleDataHead = document.createElement('h2');
  //   articleDataHead.className = "ucb-article-card-title";
  //   articleDataHead.innerText = title;

  //   articleDataLink.appendChild(articleDataHead);

  //   var articleCardDate = document.createElement('span');
  //   articleCardDate.className = 'ucb-article-card-date';
  //   articleCardDate.innerText = date;

  //   var articleSummaryBody = document.createElement('p');
  //   articleSummaryBody.className = 'ucb-article-card-body';
  //   articleSummaryBody.id = `body-${bodyAndImageId}`;
  //   articleSummaryBody.innerText = body;

  //   var articleSummaryReadMore = document.createElement('span');
  //   articleSummaryReadMore.className = 'ucb-article-card-more';

  //   var readMoreLink = document.createElement('a');
  //   readMoreLink.href = link;
  //   readMoreLink.setAttribute('aria-hidden', 'true');
  //   readMoreLink.innerText = `Read more`;

  //   articleSummaryReadMore.appendChild(readMoreLink);

  //   articleDataContainer.appendChild(articleDataLink);
  //   articleDataContainer.appendChild(articleCardDate);
  //   articleDataContainer.appendChild(articleSummaryBody);
  //   articleDataContainer.appendChild(articleSummaryReadMore);

  //   articleRow.appendChild(articleDataContainer);

  //   return articleRow;
  // }

//   /*
//    * Initilization and start of code
//    */

//   // get the url from the data-jsonapi variable
//   let el = document.getElementById("ucb-article-listing");
//   let JSONURL = ""; // JSON:API URL
//   let NEXTJSONURL = ""; // next link for pagination
//   let CategoryExclude = ""; // categories to exclude
//   let TagsExclude = ""; // tags to exclude
//   let baseURI = ""

//   // check to see if we have the data we need to work with.
//   if (el) {
//     JSONURL = el.dataset.jsonapi;
//     CategoryExclude = el.dataset.excats;
//     TagsExclude = el.dataset.extags;
//     baseURI = el.dataset.baseuri;
//   }

//   // attempt to render the data requested
//   renderArticleList(JSONURL, CategoryExclude, TagsExclude,).then((response) => {
//     if (response) {
//       NEXTJSONURL = `${baseURI}/jsonapi/` + response;
//     }
//   });

//   // watch for scrolling and determine if we're at the bottom of the content and need to request more
//   const button = document.getElementById('ucb-el-load-more');
//   button.addEventListener("click", function () {
//     if (NEXTJSONURL) {
//       renderArticleList(NEXTJSONURL, CategoryExclude, TagsExclude,).then((response) => {
//         if (response) {
//           NEXTJSONURL = `${baseURI}/jsonapi/` + response;
//           loadingData = false;
//         } else {
//           NEXTJSONURL = "";
//           toggleMessage("ucb-al-end-of-data", "block");
//           toggleMessage('ucb-el-load-more');
//         }
//       });
//     }
//   });
// })();

(function (customElements) {
  // Handles construction of endpoints, and fetching of articles and taxonomies
  class ArticleListProvider {
    static get noResultsMessage() {
      return 'No results matching your filters.';
    }

    static get errorMessage() {
      return 'Error retrieving articles from the API endpoint. Please try again later.';
    }

    constructor(baseURI, includeCategories, includeTags, excludeCategories = '', excludeTags = '', pageCount = 10) {
      this.baseURI = baseURI;
      this.nextURL = '';
      this.includeCategories = includeCategories || [];
      this.includeTags = includeTags || [];
      this.excludeCategories = excludeCategories || [];
      this.excludeTags = excludeTags || [];
      this.pageCount = pageCount;
      this._categoryTerms = null;
      this._tagTerms = null;

      // Build the endpoint path, now in JS
      this.endpoint = this.buildEndpointPath();
    }

    /**
     * Builds the JSON:API endpoint path with all the filters and parameters (previously Twig)
     */
    buildEndpointPath() {
      const endpoint = '';
      let queryString = '';

      // Include base fields
      queryString += '/jsonapi/node/ucb_article?include[node--ucb_article]=uid,title,ucb_article_content,created,field_ucb_article_summary,field_ucb_article_categories,field_ucb_article_tags,field_ucb_article_thumbnail&include=field_ucb_article_thumbnail.field_media_image&fields[file--file]=uri,url';

      // Add published filter
      const publishedFilter = '&filter[status][value]=1';

      // Placeholder for filters
      let IncludeFilter = '';
      let IncludeCategoryFilter = '';
      let IncludeTagsFilter = '';
      let ExcludeCategoryFilter = '';
      let ExcludeTagsFilter = '';

      // Handle Include Categories Filter
      if (this.includeCategories && this.includeCategories.length > 0) {
        let includeGroupMembers = this.includeCategories.map(category => {
          return `&filter[filter-cat${category}][condition][path]=field_ucb_article_categories.meta.drupal_internal__target_id&filter[filter-cat${category}][condition][value]=${category}&filter[filter-cat${category}][condition][memberOf]=cat-include`;
        }).join('');
        IncludeCategoryFilter = `&filter[cat-include][group][conjunction]=OR${includeGroupMembers}`;
      }

      // Handle Include Tags Filter
      if (this.includeTags && this.includeTags.length > 0) {
        let includeGroupMembers = this.includeTags.map(tag => {
          return `&filter[filter-tag${tag}][condition][path]=field_ucb_article_tags.meta.drupal_internal__target_id&filter[filter-tag${tag}][condition][value]=${tag}&filter[filter-tag${tag}][condition][memberOf]=tag-include`;
        }).join('');
        IncludeTagsFilter = `&filter[tag-include][group][conjunction]=OR${includeGroupMembers}`;
      }

      // Combine Include Filters
      if (IncludeCategoryFilter && IncludeTagsFilter) {
        IncludeFilter = `${publishedFilter}&filter[include-group][group][conjunction]=AND&filter[include-group][group][memberOf]=published${IncludeCategoryFilter}${IncludeTagsFilter}`;
      } else if (IncludeCategoryFilter) {
        IncludeFilter = `${publishedFilter}${IncludeCategoryFilter}`;
      } else if (IncludeTagsFilter) {
        IncludeFilter = `${publishedFilter}${IncludeTagsFilter}`;
      } else {
        IncludeFilter = publishedFilter; // No include filters, just published
      }

      // Pagination filter
      const pageCountFilter = `&page[limit]=${this.pageCount}`;

      // Sorting filter
      const sortFilter = "&sort[sort-created][path]=created&sort[sort-created][direction]=DESC";

      // Combine all filters
      const fullQueryString = `${queryString}${IncludeFilter}${ExcludeCategoryFilter}${ExcludeTagsFilter}${pageCountFilter}${sortFilter}`;

      return `${this.baseURI}${endpoint}${fullQueryString}`;
    }
    // Method to fetch and cache taxonomies by their machine name
    async fetchTaxonomies() {
      if (!this._categoryTerms) {
        this._categoryTerms = await this.fetchTaxonomy('category');
      }
      if (!this._tagTerms) {
        this._tagTerms = await this.fetchTaxonomy('tags');
      }
    }

    // Fetches taxonomy terms by machine name
    async fetchTaxonomy(taxonomyMachineName, url = null, aggregatedTerms = []) {
      const fetchUrl = url || `${this.baseURI}/jsonapi/taxonomy_term/${taxonomyMachineName}?sort=weight,name`;
      const response = await fetch(fetchUrl);
      const data = await response.json();
      const results = data["data"];

      const terms = results.map((termResult) => {
        const id = termResult["attributes"]["drupal_internal__tid"];
        const name = termResult["attributes"]["name"];
        return { id, name };
      });

      aggregatedTerms.push(...terms);

      // Recursive call for pagination if there are more than 50 terms
      if (data["links"] && data["links"]["next"] && data["links"]["next"]["href"]) {
        return this.fetchTaxonomy(taxonomyMachineName, data["links"]["next"]["href"], aggregatedTerms);
      }

      return aggregatedTerms;
    }
    /**
     * Fetches articles recursively, handling pagination and aggregating the results.
     */
    async fetchAllArticles(url, aggregatedData = [], aggregatedIncluded = []) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        // If no articles are found, log a warning
        if (!data['data'] || data['data'].length === 0) {
          console.warn(ArticleListProvider.noResultsMessage);
        } else {
          aggregatedData.push(...data['data']);
        }

        // Aggregate included data if present
        if (data['included']) {
          aggregatedIncluded.push(...data['included']);
        }

        // Handle pagination (check if there's a "next" link)
        if (data['links'] && data['links']['next'] && data['links']['next']['href']) {
          return this.fetchAllArticles(data['links']['next']['href'], aggregatedData, aggregatedIncluded);
        }

        return { data: aggregatedData, included: aggregatedIncluded };
      } catch (error) {
        console.error(ArticleListProvider.errorMessage);
        throw error;
      }
    }
  }
// Article List Component: Handles the rendering and client side exclusion filtering
  class ArticleListElement extends HTMLElement {
    static get observedAttributes() {
      return ['base-uri', 'exclude-categories', 'exclude-tags', 'include-categories', 'include-tags'];
    }

    constructor() {
      super();
      this._baseURI = this.getAttribute('base-uri');
      this._includeCategories = this.getAttribute('include-categories')
        ? this.getAttribute('include-categories').split(',').map(Number)
        : [];
      this._excludeCategories = this.getAttribute('exclude-categories')
        ? this.getAttribute('exclude-categories').split(',').map(Number)
        : [];
      this._includeTags = this.getAttribute('include-tags')
        ? this.getAttribute('include-tags').split(',').map(Number)
        : [];
      this._excludeTags = this.getAttribute('exclude-tags')
        ? this.getAttribute('exclude-tags').split(',').map(Number)
        : [];

      this._exposeCategory = this.getAttribute('expose-categories') === "True";
      this._exposeTag = this.getAttribute('expose-tags') === "True";

      this._provider = new ArticleListProvider(
        this._baseURI,
        this._includeCategories,
        this._includeTags,
        this._excludeCategories,
        this._excludeTags
      );

      // User Dropdown Form Element
      this._filterFormElement = document.createElement('form');
      this._filterFormElement.classList = 'article-list-filter-form';
      this.appendChild(this._filterFormElement);
      this._filterFormElement.style.display = 'none';

      if (this._exposeCategory || this._exposeTag) {
        this.generateFilterForm();
        this._filterFormElement.style.display = 'flex';
        this._filterFormElement.style.alignItems = 'center';

      }
      // Article List Content
      this._contentElement = document.createElement('div');
      this._contentElement.className = 'article-list';
      this.appendChild(this._contentElement);
      // Loader
      this._loadingElement = document.createElement('div');
      this._loadingElement.innerHTML = `<i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>`;
      this._loadingElement.className = 'ucb-list-msg ucb-loading-data';
      this._loadingElement.id = 'ucb-al-loading'
      this._loadingElement.style.display = 'none';
      this.appendChild(this._loadingElement);
      // Error
      this._errorElement = document.createElement('div');
      this._errorElement.innerText = ArticleListProvider.errorMessage;
      this._errorElement.className = 'ucb-list-msg ucb-error';
      this._errorElement.id = 'ucb-al-error'
      this._errorElement.style.display = 'none';
      this.appendChild(this._errorElement);
      // No Results Found
      this._noResultsElement = document.createElement('div');
      this._noResultsElement.className = 'ucb-list-msg ucb-no-results';
      this._noResultsElement.innerText = 'No results found.';
      this._noResultsElement.style.display = 'none';
      this.appendChild(this._noResultsElement);

      this._nextURL = '';
    }

    async connectedCallback() {
      try {
        await this._provider.fetchTaxonomies();
        this.generateFilterForm();
        this.loadArticles();
      } catch (error) {
        console.error('Error fetching taxonomies:', error);
      }
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name === 'base-uri') {
        this._baseURI = newValue;
      }
      if (name === 'exclude-categories') {
        this._excludeCategories = newValue
          ? newValue.split(',').filter(Boolean).map(Number)
          : [];
      }
      if (name === 'exclude-tags') {
        this._excludeTags = newValue
          ? newValue.split(',').filter(Boolean).map(Number)
          : [];
      }
    }
   /**
   * Generates the user-accessible filter form for categories and/or tags.
   */
    generateFilterForm() {
      this._filterFormElement.innerHTML = '';

      // Filter categories
      if (this._exposeCategory && this._provider._categoryTerms) {
        // Container
        const categoryFilterContainer = document.createElement('div');
        categoryFilterContainer.classList = "form-item-categories form-item";
        // Label
        const categoryFilterLabel = document.createElement('label');
        const categoryFilterLabelContent = document.createElement('span');
        categoryFilterLabelContent.innerText = "Category";
        categoryFilterLabel.appendChild(categoryFilterLabelContent);
        categoryFilterContainer.appendChild(categoryFilterLabel)

        // Filter
        const categoryFilter = document.createElement('select');
        categoryFilter.name = 'categoryFilter';
        categoryFilter.id = 'category-filter';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Categories';
        categoryFilter.appendChild(defaultOption);

        // If no includes are selected (empty array), load all except excluded
        const includeCategories = this._includeCategories.length > 0
          ? this._includeCategories
          : this._provider._categoryTerms.map(({ id }) => id); // Load all if includes is empty

        this._provider._categoryTerms
          .filter(({ id }) => includeCategories.includes(id)) // Load all if no includes
          .filter(({ id }) => !this._excludeCategories.includes(id)) // Exclude the excluded
          .forEach(({ id, name }) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            categoryFilter.appendChild(option);
          });
        categoryFilterContainer.appendChild(categoryFilter)
        this._filterFormElement.appendChild(categoryFilterContainer);
      }

      // Filter tags
      if (this._exposeTag && this._provider._tagTerms) {
        // Container
        const tagFilterContainer = document.createElement('div');
        tagFilterContainer.classList = "form-item-tags form-item";
        // Label
        const tagFilterLabel = document.createElement('label');
        const tagFilterLabelContent = document.createElement('span');
        tagFilterLabelContent.innerText = "Tags";
        tagFilterLabel.appendChild(tagFilterLabelContent);
        tagFilterContainer.appendChild(tagFilterLabel)

        // Filter
        const tagFilter = document.createElement('select');
        tagFilter.name = 'tagFilter';
        tagFilter.id = 'tag-filter';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'All Tags';
        tagFilter.appendChild(defaultOption);

        // If no includes are selected (empty array), load all except excluded
        const includeTags = this._includeTags.length > 0
          ? this._includeTags
          : this._provider._tagTerms.map(({ id }) => id); // Load all if includes is empty

        this._provider._tagTerms
          .filter(({ id }) => includeTags.includes(id)) // Load all if no includes
          .filter(({ id }) => !this._excludeTags.includes(id)) // Exclude the excluded
          .forEach(({ id, name }) => {
            const option = document.createElement('option');
            option.value = id;
            option.textContent = name;
            tagFilter.appendChild(option);
          });

        tagFilterContainer.appendChild(tagFilter)
        this._filterFormElement.appendChild(tagFilterContainer);
      }

      // Filter button
      const filterButton = document.createElement('button');
      filterButton.type = 'button';
      filterButton.className = 'form-submit-btn'
      filterButton.textContent = 'Apply Filters';
      filterButton.onclick = this.applyFilters.bind(this);

      this._filterFormElement.appendChild(filterButton);
    }

    // Reload component using new term filters
    applyFilters() {
      const selectedCategory = document.getElementById('category-filter')?.value || '';
      const selectedTag = document.getElementById('tag-filter')?.value || '';

      this._includeCategories = selectedCategory ? [Number(selectedCategory)] : [];
      this._includeTags = selectedTag ? [Number(selectedTag)] : [];

      this._provider = new ArticleListProvider(
        this._baseURI,
        this._includeCategories,
        this._includeTags,
        this._excludeCategories,
        this._excludeTags
      );
      this.loadArticles();
    }

    async loadArticles() {
      const url = this._provider.endpoint;
      this.toggleLoading(true);
      try {
        const response = await this._provider.fetchAllArticles(url);
        this.renderArticles(response.data, response.included);
        if (response.links && response.links.next) {
          this._nextURL = response.links.next.href;
        }
        this.toggleLoading(false);
      } catch (error) {
        this.toggleError(true);
        this.toggleLoading(false);
      }
    }

    async loadMoreArticles() {
      if (this._nextURL) {
        try {
          this.toggleLoading(true);
          const response = await this._provider.fetchAllArticles(this._nextURL);
          this.renderArticles(response.data, response.included);
          this._nextURL = response.links?.next?.href || '';

          // Update Load More button visibility based on the next URL
          this.toggleLoadMoreButton(!!this._nextURL);
          this.toggleLoading(false);
        } catch (error) {
          this.toggleError(true);
          this.toggleLoading(false);
        }
      } else {
        // No more content
        this._loadMoreButton.innerText = 'End of results';
        this._loadMoreButton.style.pointerEvents = 'none';
        this._loadMoreButton.classList.add('disabled'); // Optional styling for disabled state
      }
    }

    async renderArticles(articles, included) {
      this._contentElement.innerHTML = ''; // Clear the content element

      // If no results
      if (articles.length === 0) {
        this._noResultsElement.style.display = 'block';
        this._contentElement.style.display = 'none';
        return;
      } else {
        this._noResultsElement.style.display = 'none';
        this._contentElement.style.display = 'block';
      }

      let excludeCatArray = this._excludeCategories;
      let excludeTagArray = this._excludeTags;

      // Image map objects
      let idObj = {};
      let altObj = {};

      // Process the included media
      if (included) {
        // Filter media and file data
        let idFilterData = included.filter((item) => item.type === 'media--image');
        let altFilterData = included.filter((item) => item.type === 'file--file');

        // Populate the altObj map with focal or standard images
        altFilterData.forEach((item) => {
          if (item.links && item.links.focal_image_square) {
            altObj[item.id] = { src: item.links.focal_image_square.href };
          } else {
            altObj[item.id] = { src: item.attributes.uri.url };
          }
        });

        // Populate the idObj map to associate thumbnails with their articles
        idFilterData.forEach((pair) => {
          const thumbnailId = pair.relationships.thumbnail.data.id;
          idObj[pair.id] = thumbnailId;
          altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt;
        });
      }

      // Process the articles
      let promises = articles.map(async (item) => {
        let thisArticleCats = [];
        let thisArticleTags = [];

        // Get article categories
        if (item.relationships.field_ucb_article_categories) {
          thisArticleCats = item.relationships.field_ucb_article_categories.data.map(
            (cat) => cat.meta.drupal_internal__target_id
          );
        }

        // Get article tags
        if (item.relationships.field_ucb_article_tags) {
          thisArticleTags = item.relationships.field_ucb_article_tags.data.map(
            (tag) => tag.meta.drupal_internal__target_id
          );
        }

        // Check if the article's categories or tags overlap with the excluded categories/tags
        const hasExcludedCategory = excludeCatArray.length && thisArticleCats.some(cat => excludeCatArray.includes(cat));
        const hasExcludedTag = excludeTagArray.length && thisArticleTags.some(tag => excludeTagArray.includes(tag));

        // If the article has an excluded category or tag, skip it
        if (hasExcludedCategory || hasExcludedTag) {
          return undefined;
        }

        // Get article body and thumbnail
        let body = item.attributes.field_ucb_article_summary
          ? item.attributes.field_ucb_article_summary.trim()
          : '';
        if (!body && item.relationships.field_ucb_article_content.data.length) {
          const bodyId = item.relationships.field_ucb_article_content.data[0].id;
          body = await this.getArticleParagraph(bodyId);
        }

        let imageSrc = "";

        // If no thumbnail, show no image
        if (!item.relationships.field_ucb_article_thumbnail.data) {
          imageSrc = null;
        } else {
          // Use the idObj as a memo to add the corresponding image URL
          let thumbId = item.relationships.field_ucb_article_thumbnail.data.id;
          imageSrc = altObj[idObj[thumbId]];
        }

        // Format date
        const date = new Date(item.attributes.created).toLocaleDateString('en-us', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
        const title = item.attributes.title;
        const link = `${this._baseURI}${item.attributes.path.alias}`;

        // Return article row
        return this.createArticleRow(title, link, date, body, imageSrc);
      });

      let results = await Promise.all(promises);

      // Filter out undefined results and render the rest
      results.filter((result) => result !== undefined).forEach((result) => {
        let articleElement = document.createElement('article');
        articleElement.className = 'ucb-article-card-container';
        articleElement.appendChild(result);
        this._contentElement.append(articleElement);
      });
    }
    // Thumbnail helper
    getThumbnail(article, idObj, altObj) {
      if (article.relationships.field_ucb_article_thumbnail) {
        const thumbnailId = article.relationships.field_ucb_article_thumbnail.data.id;
        if (idObj[thumbnailId] && altObj[thumbnailId]) {
          return {
            src: altObj[thumbnailId].src,
            alt: altObj[thumbnailId].alt || 'Article thumbnail',
          };
        }
      }
      return null;
    }
    // Create the Article Row - image, body, read more link
    createArticleRow(title, link, date, body, imageSrc) {
      const articleRow = document.createElement('div');
      articleRow.className = 'ucb-article-card row';

      let articleSummarySize = 'col-md-12';
      if (imageSrc) {
        articleSummarySize = 'col-md-10';

        const imgContainer = document.createElement('div');
        imgContainer.className = 'col-md-2 ucb-article-card-img';

        const imgLink = document.createElement('a');
        imgLink.href = link;
        imgLink.setAttribute('role', 'presentation');
        imgLink.setAttribute('aria-hidden', 'true');

        const articleImg = document.createElement('img');
        articleImg.src = imageSrc.src;
        articleImg.setAttribute('alt', imageSrc.alt);

        imgLink.appendChild(articleImg);
        imgContainer.appendChild(imgLink);
        articleRow.appendChild(imgContainer);
      }

      const articleDataContainer = document.createElement('div');
      articleDataContainer.className = `col-sm-12 ${articleSummarySize} ucb-article-card-data`;

      const articleDataLink = document.createElement('a');
      articleDataLink.href = link;

      const articleDataHead = document.createElement('h2');
      articleDataHead.className = 'ucb-article-card-title';
      articleDataHead.innerText = title;

      articleDataLink.appendChild(articleDataHead);

      const articleCardDate = document.createElement('span');
      articleCardDate.className = 'ucb-article-card-date';
      articleCardDate.innerText = date;

      const articleSummaryBody = document.createElement('p');
      articleSummaryBody.className = 'ucb-article-card-body';
      articleSummaryBody.innerText = body;

      const articleSummaryReadMore = document.createElement('span');
      articleSummaryReadMore.className = 'ucb-article-card-more';

      const readMoreLink = document.createElement('a');
      readMoreLink.href = link;
      readMoreLink.innerText = 'Read more';

      articleSummaryReadMore.appendChild(readMoreLink);

      articleDataContainer.appendChild(articleDataLink);
      articleDataContainer.appendChild(articleCardDate);
      articleDataContainer.appendChild(articleSummaryBody);
      articleDataContainer.appendChild(articleSummaryReadMore);

      articleRow.appendChild(articleDataContainer);

      return articleRow;
    }
    // Helper function to fetch the Article body if no summary and do the processing
    async getArticleParagraph(id) {
      if (!id) {
        return '';
      }
      try {
        const response = await fetch(`${this._baseURI}/jsonapi/paragraph/article_content/${id}`);
        const data = await response.json();
        if (!data.data.attributes.field_article_text) return '';
        let htmlStrip = data.data.attributes.field_article_text.processed.replace(/<\/?[^>]+(>|$)/g, '');
        let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, '');
        let trimmedString = lineBreakStrip.substr(0, 250);
        if (trimmedString.length > 100) {
          trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')));
        }
        return trimmedString + '...';
      } catch (error) {
        console.error('Error fetching Article Paragraph:', error);
        return '';
      }
    }

    toggleLoading(show) {
      this._loadingElement.style.display = show ? 'block' : 'none';
    }

    toggleError(show) {
      this._errorElement.style.display = show ? 'block' : 'none';
    }
  }

  customElements.define('article-list', ArticleListElement);

})(window.customElements);
