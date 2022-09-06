/**
 * Contains the title, url, data, and filters associated with an article provider provider.
 */
class ArticleProvider {
	/**
	 * Creates a new ArticleProvider.
	 * @param {string} title - The title of the site
	 * @param {string} url - The homepage URL of the site
	 * @param {object} config
	 */
	constructor(title, url, config = {'filters': {}}) {
		this.title = title;
		this.url = url;
		this.config = config;
		this.nextURL = ArticleProvider.buildEndpointPath(config);
		this.nextPage = 1;
		this.pageData = [];
		this.loadingData = false;
		this.errorOccurred = false;
		this.fetchRequest = null;
	}
	/**
	 * @param {number} page - A page number equal to or less than `this.nextPage` (defaults to `this.nextPage`)
	 * @returns {object} The data for the page of articles from this provider
	 */
	async getArticleListData(page = 0) {
		if (page < 1)
			page = this.nextPage;
		const pageData = this.pageData[page - 1];
		if (pageData) // Article data for this page is already present and cached.
			return pageData;
		else if (this.nextPage == page && this.nextURL) {
			if (!this.loadingData || !this.fetchRequest) { // There isn't an in-progress request, make a new one.
				this.loadingData = true;
				this.fetchRequest = fetch(this.url + this.nextURL)
						.then(reponse => reponse.json())
						.then(data => { // The request has come back with response data.
							this.pageData[this.nextPage - 1] = data;
							const nextURL = data['links']['next'] ? data['links']['next']['href'].split('/jsonapi/')[1] : null;
							if(nextURL) { // The endpoint is indicating there is a next page of articles and has graciously provided the path to it.
								this.nextPage++;
								this.nextURL = '/jsonapi/' + nextURL;
							} else this.nextURL = null;
							this.loadingData = false;
							this.errorOccurred = false;
							return data;
						}).catch(error => { // The request has failed.
							this.loadingData = false;
							this.errorOccurred = true;
							return error;
						});
			}
			return await this.fetchRequest;
		} else throw new Error('Attempted to request an invalid page of articles for provider `' + this.url + '`, please make sure requests are sequential and aren\'t attempted multiple times before results are returned!');
	}
	/**
	 * @param {object} config
	 * @returns {string} An API endpoint path (+ query parameters) relative to a site homepage, with supported configuration
	 */
	static buildEndpointPath(config) {
		const
			// JSON API Endpoint information
			endpoint = '/jsonapi/node/ucb_article',
			baseParams = 'include[node--ucb_article]=uid,title,ucb_article_content,created,field_ucb_article_summary,field_ucb_article_categories,field_ucb_article_tags,field_ucb_article_thumbnail'
				+ '&include=field_ucb_article_thumbnail.field_media_image'
				+ '&fields[file--file]=uri,url',
			// Filter on only published (status = true) content
			publishedFilter = '&filter[publish-check][condition][path]=status'
				+ '&filter[publish-check][condition][value]=1'
				+ '&filter[publish-check][condition][memberOf]=published',
			// Include filters
			filters = config['filters'], categories = filters['categories'], tags = filters['tags'],
			resultsPerPage = config['count'], sort = config['sort'];
		let params = '', catFilter = '', tagFilter = '';
		if (categories && categories.length) { // Setup Include Category Filter using a logical OR between included category IDs
			catFilter += '&filter[cat-include][group][conjunction]=OR';
			categories.forEach(category =>
				catFilter += '&filter[filter-cat-' + category + '][condition][path]=field_ucb_article_categories.meta.drupal_internal__target_id'
					+ '&filter[filter-cat-' + category + '][condition][value]=' + category
					+ '&filter[filter-cat-' + category + '][condition][memberOf]=cat-include');
		}
		if (tags && tags.length) { // Setup Include Tags Filter using a logical OR between included tag IDs
			tagFilter += '&filter[tag-include][group][conjunction]=OR';
			tags.forEach(tag =>
				tagFilter += '&filter[filter-tag-' + tag + '][condition][path]=field_ucb_article_tags.meta.drupal_internal__target_id'
					+ '&filter[filter-tag-' + tag + '][condition][value]=' + tag
					+ '&filter[filter-tag-' + tag + '][condition][memberOf]=tag-include');
		}
		// check to see if we have both Categories and Tags to filter on
		// if so... setup a logicial AND Between both include filters
		if (catFilter && tagFilter)
			params += '&filter[published][group][conjunction]=AND'
				+ publishedFilter
				+ '&filter[include-group][group][conjunction]=AND'
				+ '&filter[include-group][group][memberOf]=published'
				+ catFilter
				+ '&filter[cat-include][group][memberOf]=include-group'
				+ tagFilter
				+ '&filter[tag-include][group][memberOf]=include-group';
		// Otherwise default to either the Category filter or the Tag filter as defined
		else if (catFilter)
			params += '&filter[published][group][conjunction]=AND'
    			+ '&filter[cat-include][group][memberOf]=published'
    			+ publishedFilter
				+ catFilter;
		else if (tagFilter)
			params += '&filter[published][group][conjunction]=AND'
    			+ '&filter[tag-include][group][memberOf]=published'
    			+ publishedFilter
				+ tagFilter;
  		else // no includeded Categories or Tags ... still need to filter on published articles
			params += '&filter[status][value]=1';
		if (resultsPerPage) // Pagination filter
			params += '&page[limit]=' + resultsPerPage;
		if (sort == 'ASC' || sort == 'DESC') // Sorting filter
			params += '&sort[sort-created][path]=created&sort[sort-created][direction]=' + sort;
		return endpoint + '?' + baseParams + params;
	}
}

class ArticleListElement extends HTMLElement {
	constructor() {
		super();

		this.providers = new Set();
		this.providersWithArticlesRemaining = new Set();
		this.nextPageReady = true; // If this is true then at lease one site is ready to reqeust the next page
		this.done = false; // If this is true then there are no more articles left to fetch
		this.defaultConfig = JSON.parse(this.getAttribute('config'));

		const
			CategoryExclude = this.dataset['excats'], // categories to exclude
			TagsExclude = this.dataset['extags']; // tags to exclude 
		
		let lastKnownScrollPosition = 0; // scroll position to determine if we need to load more articles
		/* Note that event tracking on scroll is expensive and noisy -- these two flag will help to make sure
			that we're not overwhelming the system by tracking scroll events when we don't need to */
		let ticking = false; // flag to know if we're currently scrolling 

		this.innerHTML = `
			<div class="ucb-al-no-results ucb-list-msg ucb-no-data">
				No articles were returned, please check your filters and try again.
			</div>
			<div class="ucb-al-data"></div>
			<div class="ucb-al-loading ucb-list-msg ucb-loading-data">
				<i class="fas fa-spinner fa-3x fa-pulse"></i>
			</div>
			<div class="ucb-al-end-of-data ucb-list-msg ucb-end-of-results">
				No more results matching your filters.
			</div>
			<div class="ucb-al-error ucb-list-msg ucb-error">
				Error retrieving article list from the API endpoint.  Please try again later.  
			</div>`;

		JSON.parse(this.getAttribute('providers')).forEach((providerData) => {
			const provider = new ArticleProvider(providerData['title'], providerData['url'], providerData['config'] || this.defaultConfig);
			this.providers.add(provider);
			this.providersWithArticlesRemaining.add(provider);
		});

		this.requestNextPage(CategoryExclude, TagsExclude);

		// watch for scrolling and determine if we're at the bottom of the content and need to request more 
		this.infiniteScrollFunction = () => {
			lastKnownScrollPosition = window.scrollY;
			if (!ticking && this.nextPageReady) {
				window.requestAnimationFrame(() => {
					// check to see if we've scrolled through our content and need to attempt to load more
					if (lastKnownScrollPosition + window.innerHeight >= document.documentElement.scrollHeight)
						this.requestNextPage();
					ticking = false;
				});
				ticking = true;
			}
		};
		document.addEventListener('scroll', this.infiniteScrollFunction);
	}

	requestNextPage(CategoryExclude, TagsExclude) {
		if(!this.nextPageReady)
			return;
		this.nextPageReady = false;
		this.toggleMessage('ucb-al-loading', 'block'); // Show loading spinner
		const providerCount = this.providersWithArticlesRemaining.size;
		for (let iterator = new Set(this.providersWithArticlesRemaining).values(), provider, loadedCount = 0, erroredCount = 0; provider = iterator.next().value;) {
			if(!provider.loadingData && !provider.errorOccurred) {
				const nextPage = provider.nextPage;
				provider.getArticleListData(nextPage).then(data => {
					loadedCount++;
					if(loadedCount + erroredCount == providerCount)
						this.toggleMessage('ucb-al-loading', 'none'); // Hide loading spinner
					this.renderArticleList(provider, data, CategoryExclude, TagsExclude);
					if (provider.nextPage > nextPage) // The site is ready to load a next page
						this.providersWithArticlesRemaining.add(provider);
					else this.providersWithArticlesRemaining.delete(provider);
					if(!this.checkDone()) this.nextPageReady = true; // If at least one of the sites comes back with results and isn't done, mark as next page ready
				}).catch(error => {
					erroredCount++;
					if(loadedCount + erroredCount == providerCount)
						this.toggleMessage('ucb-al-loading', 'none'); // Hide loading spinner
					if(erroredCount == providerCount)
						this.toggleMessage('ucb-al-error', 'block');
					console.error('Failed to load articles for provider `' + site.url + '`');
					this.providersWithArticlesRemaining.remove(site);
					this.checkDone();
				});
			}
		}	
	}
		
	checkDone() {
		if(this.providersWithArticlesRemaining.size == 0) {
			this.nextPageReady = false;
			this.done = true;
			document.removeEventListener('scroll', this.infiniteScrollFunction);
			this.toggleMessage('ucb-al-end-of-data', 'block'); // Show "no more results" message
			return true;
		}
		return false;
	}

	/**
	 * Main function that will load the initial data from the given URL and start processing it for display
	 * @param {ArticleListSite} provider - The site to which the request was directed
	 * @param {object} data - The data returned from the API endpoint
	 * @param {string} id - target DOM element to add the content to 
	 * @param {string} ExcludeCategories - array of categories to filter out when rendering 
	 * @param {string} ExcludeTags - array of tags to filter out when rendering
	 */
	renderArticleList(provider, data, ExcludeCategories = "", ExcludeTags = "") {
		//console.log("data obj", data);

		let excludeCatArray = ExcludeCategories.split(",").map(Number);
		let excludeTagArray = ExcludeTags.split(",").map(Number);

		// Below objects are needed to match images with their corresponding articles. There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
		let idObj = {};
		let altObj = {};
		// Remove any blanks from our articles before map
		if (data['included']) {
			// removes all other included data besides images in our included media
			let idFilterData = data['included'].filter((item) => {
				return item['type'] == "media--image";
			});

			let altFilterData = data['included'].filter((item) => {
				return item['type'] == 'file--file';
			});
			// finds the focial point version of the thumbnail
			altFilterData.map((item) => {
				// checks if consumer is working, else default to standard image instead of focal image
				if (item['links']['focal_image_square'] != undefined) {
					altObj[item['id']] = item['links']['focal_image_square']['href'];
				} else {
					altObj[item['id']] = item['attributes']['uri']['url'];
				}
			});

			// using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
			idFilterData.map((pair) => {
				idObj[pair['id']] = pair['relationships']['thumbnail']['data']['id'];
			});
		}
		// console.log("idObj", idObj);
		// console.log('altObj', altObj)
		//iterate over each item in the array
		data['data'].map((item) => {
			let thisArticleCats = [];
			let thisArticleTags = [];
			// // loop through and grab all of the categories
			if (item['relationships']['field_ucb_article_categories']) {
				for (let i = 0; i < item['relationships']['field_ucb_article_categories']['data'].length; i++) {
					thisArticleCats.push(item['relationships']['field_ucb_article_categories']['data'][i]['meta']['drupal_internal__target_id']);
				}
			}
			// console.log("this article cats",thisArticleCats)

			// // loop through and grab all of the tags
			if (item['relationships']['field_ucb_article_tags']) {
				for (var i = 0; i < item['relationships']['field_ucb_article_tags']['data'].length; i++) {
					thisArticleTags.push(item['relationships']['field_ucb_article_tags']['data'][i]['meta']['drupal_internal__target_id']);
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

			// if we didn't match any of the filtered tags or cats, then render the content
			if (doesIncludeCat.length == 0 && doesIncludeTag.length == 0) {
				// we need to render the Article Card view for this returned element

				// **ADD DATA**
				// this is my id of the article body paragraph type we need only if no thumbnail or summary provided
				let bodyAndImageId = item['relationships']['field_ucb_article_content']['data'][0]['id'];
				let body = item['attributes']['field_ucb_article_summary'] ? item['attributes']['field_ucb_article_summary'] : "";
				body = body.trim();
				let imageSrc = "";

				// if no article summary, use a simplified article body
				if (!body.length) {
					this.getArticleParagraph(provider, bodyAndImageId)
						.then((response) => response.json())
						.then((data) => {
							// Remove any html tags within the article
							let htmlStrip = data['data']['attributes']['field_article_text']['processed'].replace(
								/<\/?[^>]+(>|$)/g,
								""
							);
							// Remove any line breaks if media is embedded in the body
							let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
							// take only the first 100 words ~ 500 chars
							let trimmedString = lineBreakStrip.substr(0, 500);
							// if in the middle of the string, take the whole word
							if (trimmedString.length > 100) {
								trimmedString = trimmedString.substr(
									0,
									Math.min(
										trimmedString.length,
										trimmedString.lastIndexOf(" ")
									)
								);
								// set the contentBody of Article Summary card to the minified body instead
								body = `${trimmedString}...`;
							} else body = trimmedString;
							const articleElements = this.getElementsByClassName('ucb-article-content-id-' + bodyAndImageId);
							for(let articleElementIndex = 0; articleElementIndex < articleElements.length; articleElementIndex++)
								articleElements[articleElementIndex].querySelector('.ucb-article-card-body').innerText = body;
						});
				}

				// if no thumbnail, show no image
				if (!item['relationships']['field_ucb_article_thumbnail']['data']) {
					imageSrc = "";
				} else {
					//Use the idObj as a memo to add the corresponding image url
					let thumbId = item['relationships']['field_ucb_article_thumbnail']['data']['id'];
					imageSrc = altObj[idObj[thumbId]];
				}

				//Date - make human readable
				let date = new Date(item['attributes']['created'])
					.toDateString()
					.split(" ")
					.slice(1)
					.join(" ");
				let title = item['attributes']['title'];
				let link = provider.url + item['attributes']['path']['alias'];
				let image = "";
				if (link) {
					image = `<a href="${link}">` + (imageSrc ? `<img src="${imageSrc}">` : this.defaultArticleImage()) + '</a>';
				}

				const outputHTML = `
			<div class='ucb-article-card row ucb-article-content-id-${bodyAndImageId}'>
				<div class='col-sm-12 col-md-2 ucb-article-card-img'>${image || this.defaultArticleImage()}</div>
				<div class='col-sm-12 col-md-10 ucb-article-card-data'>
					<span class='ucb-article-card-title'><a href="${link}">${title}</a></span>
					<span class="ucb-article-card-info"><span class='ucb-article-card-date'>${date}</span>` + (provider.title ? ' • <span class="ucb-article-card-site"><a href="' + provider.url + '/">' + provider.title + '</a></span>' : '') + `</span>
					<span class='ucb-article-card-body'>${body}</span>
					<span class='ucb-article-card-more'>
						<a href="${link}">Read more <i class="fal fa-chevron-double-right"></i></a></span>
				</div>
			</div>
		`;
				const dataOutput = this.querySelector(".ucb-al-data");
				const thisArticle = document.createElement("article");
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
		this.toggleMessage("ucb-al-loading", "none");
	}

	/**
	 * Helper function to show/hide elements in the DOM
	 * @param {string} id - CSS ID of the element to target
	 * @param {string} display - display mode for that element (block | none) 
	 */
	toggleMessage(id, display = "none") {
		if (id) {
			const toggle = this.querySelector('.' + id);
			if (toggle) {
				if (display === "block") {
					toggle.style.display = "block";
				} else {
					toggle.style.display = "none";
				}
			}
		}
	}

	defaultArticleImage() {
		return '<div class="ucb-article-card-default-img"><i class="fas fa-solid fa-newspaper"></i></div>'
	}

	/**  
	 * Get additional data from the paragraph content attached to the Article node
	 * @param {ArticleListSite} provider - The site to which this request is directed
	 * @param {string} id - internal id used by Drupal to get the specific paragraph
	 */
	async getArticleParagraph(provider, id) {
		if (id) {
			const response = await fetch(
				`${provider.url}/jsonapi/paragraph/article_content/${id}`
			);
			return response;
		} else {
			return "";
		}
	}
}

customElements.define('article-list', ArticleListElement);
