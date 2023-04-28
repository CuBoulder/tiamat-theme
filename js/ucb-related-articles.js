(function(relatedArticlesBlock) {
	if (!relatedArticlesBlock) return;
	const loggedIn = relatedArticlesBlock.getAttribute('data-loggedin') == 'true' ? true : false;
	let childCount = 0;

	const excludeCatArr = relatedArticlesBlock.getAttribute('data-catexclude')
	const excludeTagArr = relatedArticlesBlock.getAttribute('data-tagexclude')

	// Global variable to store articles that are good matches. Danger!
	let articleArrayWithScores = []

	// Related Shown? 
	const relatedShown = relatedArticlesBlock.getAttribute('data-relatedshown') != "Off" ? true : false;

	// This function returns a total of matched categories or tags
	function checkMatches(data, ids, privateIds = []){
		let count = 0;
		let numberArr = ids.map(Number)
		// TO DO -- add in private taxonomy, dont include on counts
		data.forEach((article)=>{
			if(numberArr.includes(article.meta.drupal_internal__target_id) && !privateIds.includes(article.meta.drupal_internal__target_id)){
				count++
			}
		})
		return count
	}
	// This function takes in the tag endpoint and current array of related articles, returns the array of related articles once it has a count of 3. 
	async function getArticlesWithTags(url, array, articleTags ,numLeft, privateTags){
		fetch(url)
		.then(response => response.json())
		.then(data=>{
			let relatedArticlesDiv = document.querySelector('.related-articles-section')

			// console.log("TAG DATA", data)
			let returnedArticles = data.data
			let existingIds = [];
			// create an array of existing ids
			array.map(article=>{
				existingIds.push(article.id)
			})

			// remove any articles already chosen, excluded categories, and the current article
			let filterData = []
			returnedArticles.map((article)=>{

				

				let thisArticleCats = article.relationships.field_ucb_article_categories.data
					let thisArticleTags = article.relationships.field_ucb_article_tags.data
					let urlCheck = article.attributes.path.alias;
					let toInclude = true;
					//remove excluded category & tagss
					if(thisArticleTags.length){ // if there are categories
						thisArticleTags.forEach((tag)=>{
							let id = tag.meta.drupal_internal__target_id.toString();
							// console.log(id)
							if(excludeTagArr.includes(id)){
								toInclude = false;
								return
							}
						}) 
					}

					if(article.attributes.field_ucb_article_external_url){
						toInclude = false;
						return
					}

					if(thisArticleCats.length){ // if there are categories
						thisArticleCats.forEach((category)=>{ // check each category
							let id = category.meta.drupal_internal__target_id.toString();
							// console.log('cat id', id)                        
							if(excludeCatArr.includes(id)){ // if excluded, do not proceed
								// console.log('i have an included id')
								toInclude = false;
								return
							} 
							if( urlCheck == window.location.pathname) { // if same article, do not proceed
								//  console.log("im the current article! ignore me!")
								toInclude = false
								return;
							}  // proceed
								// create an object out of 
								// add to running array of possible matches
							
						}) 
					}

				// console.log(article.id, existingIds.includes(article.id))
				if(existingIds.includes(article.id) || article.attributes.path.alias == window.location.pathname ){
					toInclude = false
				// filter on categories
				} 
				if(toInclude){
					let articleObj ={}
					articleObj.id = article.id
					articleObj.catMatches = checkMatches(article.relationships.field_ucb_article_tags.data, articleTags, privateTags) // count the number of matches
					articleObj.article = article 
					filterData.push(articleObj)
				}
				else{
					return
				}
			})

			// console.log(returnedArticles)

			let urlObj = {};
			let idObj = {};

			if (data.included) {
				let filteredData = data.included.filter((url) => {
				return url.attributes.uri !== undefined;
				})
				// creates the urlObj, key: data id, value: url
				filteredData.map((pair) => {
					// console.log('my pair', pair)
				urlObj[pair.id] = pair.links.focal_image_square.href;
				})
	
				// removes all other included data besides images in our included media
				let idFilterData = data.included.filter((item) => {
				return item.type == "media--image";
				})
				// using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
				idFilterData.map((pair) => {
				idObj[pair.id] = pair.relationships.thumbnail.data.id;
				})
			}

			// Rank based on matches (cats)
			filterData.sort((a, b) => a.catMatches - b.catMatches).reverse();
			filterData.length = numLeft // sets to fill in however many articles are left

			filterData.map((article)=>{
				let articleCard = document.createElement('div')
				articleCard.classList = "ucb-article-card col-sm-12 col-md-6 col-lg-4"
				let title = article.article.attributes.title;
				let link = article.article.attributes.path.alias;
						// if no thumbnail, show no image
						if (!article.article.relationships.field_ucb_article_thumbnail.data) {
							image = "";
						} else {
							//Use the idObj as a memo to add the corresponding image url
							let thumbId = article.article.relationships.field_ucb_article_thumbnail.data.id;
							image = urlObj[idObj[thumbId]];
						}
				let body = ""
				// if summary, use that
				if( article.article.attributes.field_ucb_article_summary != null){
					body = article.article.attributes.field_ucb_article_summary;
				}
		
				// if image, use it
				if (!article.article.relationships.field_ucb_article_thumbnail.data) {
					imageSrc = "";
				} else {
					//Use the idObj as a memo to add the corresponding image url
					let thumbId = article.article.relationships.field_ucb_article_thumbnail.data.id;
					imageSrc = urlObj[idObj[thumbId]];
				}
		
				if(link && imageSrc) {
					image = `<a href="${link}"><img src="${imageSrc}" /></a>`;
				}
				let outputHTML = `
					<div id='img' class='ucb-article-card-img'>${image}</div>
					<div class='ucb-article-card-data'>
						<span class='ucb-article-card-title'><a href="${link}">${title}</a></span>
						<span id='body' class='ucb-related-article-card-body'>${body}</span>
					</div>
			`;
		
			articleCard.innerHTML = outputHTML
			relatedArticlesDiv.appendChild(articleCard)
				})

			// Check to see what was rendered
			// sets global counter of children
			childCount = relatedArticlesDiv.childElementCount
			// If no matches and logged in, render error message for admin
		if(childCount == 0 && loggedIn == true){
			let message = document.createElement('h3')
			message.innerText = 'There are no returned article matches - check exclusion filters and try again'
			relatedArticlesDiv.appendChild(message)
			// If no matches and not logged in, hide section
		} else if (relatedArticlesDiv.childElementCount == 0 && loggedIn == false){
			let header = relatedArticlesBlock.children[0]
			header.innerText = ''
			// console.log('am i available', relatedArticlesBlock.children[0])
			
		} else if(childCount > 1 && loggedIn==true){
			var message = document.getElementById('admin-notif-message')
			if(message){
				message.remove()
			}
		}else {
			// last check for error message
		}
		
		})
	}

	// If related articles is toggled on create section, run the fetch
	if(relatedShown){
		// Iterate through the json data of the articles tags and categories, store the values
		let x=0
		let n=0
		// Tag array - iterate through and store taxonomy ID's for fetch
		var tagJSON = JSON.parse(relatedArticlesBlock.getAttribute('data-tagsjson'));
		var myTagIDs = []

		while(tagJSON[n]!=undefined){
			myTagIDs.push(tagJSON[n]["#cache"].tags[0])
			n++;
		}
		var myTags = myTagIDs.map((id)=> id.replace(/\D/g,'')) // remove blanks, get only the tag ID#s

		// console.log("my tags", myTags)

		// Cat array - iterate through and store taxonomy ID's for fetch
		var catsJSON = JSON.parse(relatedArticlesBlock.getAttribute('data-catsjson'));
		var myCatsID= [];
		while(catsJSON[x]!=undefined){
			myCatsID.push(catsJSON[x]["#cache"].tags[0])
			x++;
		}

		var myCats = myCatsID.map((id)=> id.replace(/\D/g,''))// remove blanks, get only the cat ID#s

		// Using tags and categories, construct an API call
		var rootURL = `/jsonapi/node/ucb_article?include[node--ucb_article]=uid,title,ucb_article_content,created,field_ucb_article_summary,field_ucb_article_categories,field_ucb_article_tags,field_ucb_article_thumbnail&include=field_ucb_article_thumbnail.field_media_image&fields[file--file]=uri,url%20&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published`;

		var tagQuery = buildTagFilter(myTags)
		var catQuery = buildCatFilter(myCats)

		// varructs the tag portion of the API filter
		function buildTagFilter(array){
			let string = `${rootURL}`

			array.forEach(value => {
				let tagFilterString = `&filter[filter-tag${value}][condition][path]=field_ucb_article_tags.meta.drupal_internal__target_id&filter[filter-tag${value}][condition][value]=${value}&filter[filter-tag${value}][condition][memberOf]=tag-include`;
				string += tagFilterString
			});
			// console.log(string)
			return string
			// let tagFilterString = ``
		}
		// Constructs the category portion of the API filter
		function buildCatFilter(array){
			let string = `${rootURL}`
			array.forEach(value=>{
				let catFilterString = `&filter[filter-cat${value}][condition][path]=field_ucb_article_categories.meta.drupal_internal__target_id&filter[filter-cat${value}][condition][value]=${value}&filter[filter-cat${value}][condition][memberOf]=cat-include`
				string += catFilterString

			});
			return string
		}

		var URL = `${catQuery}`

		// Fetch
		async function getArticles(URL){
			const privateTags = getPrivateTags()
			const privateCats = getPrivateCategories()
			fetch(URL)
				.then(response=>response.json())
				.then(data=> {

			// Below objects are needed to match images with their corresponding articles. 
			// There are two endpoints => data.data (article) and data.included (incl. media), both needed to associate a media library image with its respective article
			let urlObj = {};
			let idObj = {};
			// Remove any blanks from our articles before map
			if (data.included) {
			let filteredData = data.included.filter((url) => {
				return url.attributes.uri !== undefined;
			})

			// creates the urlObj, key: data id, value: url
			filteredData.map((pair) => {
				// console.log(pair)
				urlObj[pair.id] = pair.links.focal_image_square.href;
			})

			// removes all other included data besides images in our included media
			let idFilterData = data.included.filter((item) => {
				return item.type == "media--image";
			})
			// using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
			idFilterData.map((pair) => {
				idObj[pair.id] = pair.relationships.thumbnail.data.id;
			})
			}
				let returnedArticles = data.data
				// console.log("my returned articles from categories", returnedArticles)
				// Create an array of options to render with additional checks
				returnedArticles.map((article)=> {
					let thisArticleCats = article.relationships.field_ucb_article_categories.data
					let thisArticleTags = article.relationships.field_ucb_article_tags.data
					let urlCheck = article.attributes.path.alias;
					let toInclude = true;

					// If article is external,
					if(article.attributes.field_ucb_article_external_url){
						toInclude = false;
						return
					}

					//remove excluded category & tagss
					if(thisArticleTags.length){ // if there are tags
						thisArticleTags.forEach((tag)=>{
							let id = tag.meta.drupal_internal__target_id.toString();
							// console.log(id)
							if(excludeTagArr.includes(id)){
								toInclude = false;
								return
							}
						}) 
					}

					if(thisArticleCats.length){ // if there are categories
						thisArticleCats.forEach((category)=>{ // check each category
							let id = category.meta.drupal_internal__target_id.toString();
							// console.log('exclude cat arr' , excludeCatArr)
							// console.log('cat id', id)                        
							if(excludeCatArr.includes(id)){ // if excluded, do not proceed
								// console.log('i have an included id')
								toInclude = false;
								return
							} 
							if( urlCheck == window.location.pathname) { // if same article, do not proceed
								//  console.log("im the current article! ignore me!")
								toInclude = false
								return;
							}  // proceed
								// create an object out of 
								// add to running array of possible matches
							
						}) 
					}
					// if it triggered any fail conditions, do not proceed with the article
					if(toInclude){
					let articleObj = {}
								articleObj.id = article.id
								articleObj.catMatches = checkMatches(article.relationships.field_ucb_article_categories.data, myCats, privateCats) // count the number of matches
								articleObj.article = article // contain the existing article
								articleArrayWithScores.push(articleObj)
					}
					
				})

				//Remove current article from those availabile in the block
				articleArrayWithScores.filter((article)=>{
					if(article.article.attributes.path.alias == window.location.pathname){
						articleArrayWithScores.splice(articleArrayWithScores.indexOf(article),1)
					} else {
						return article;
					}
				})
				articleArrayWithScores.sort((a, b) => a.catMatches - b.catMatches).reverse(); // sort in order

				//Remove articles without matches from those availabile in the block
				var finalArr = articleArrayWithScores.filter(article=> article.catMatches > 0)

				// console.log("LASST PASS ARTICLES WITH SCORES", finalArr)
				// if more than 3 articles, take the top 3
				if(finalArr.length>3){
					finalArr.length = 3
				} else if(finalArr.length<3){
					let howManyLeft = 3 - finalArr.length
					// if less than 3, grab the most tags
				getArticlesWithTags(tagQuery,finalArr, myTags, howManyLeft, privateTags);
				// console.log(howManyLeft)
				
				}






		// Create the article cards contained within the block, assign classes
		let relatedArticlesDiv = document.createElement('div')
		relatedArticlesDiv.classList = "row related-articles-section"
		relatedArticlesBlock.appendChild(relatedArticlesDiv)

		finalArr.map((article)=>{
			let articleCard = document.createElement('div')
			articleCard.classList = "ucb-article-card col-sm-12 col-md-6 col-lg-4"
			let title = article.article.attributes.title;
			let link = article.article.attributes.path.alias;
					// if no thumbnail, show no image
					if (!article.article.relationships.field_ucb_article_thumbnail.data) {
						image = "";
					} else {
						//Use the idObj as a memo to add the corresponding image url
						let thumbId = article.article.relationships.field_ucb_article_thumbnail.data.id;
						image = urlObj[idObj[thumbId]];
					}
			let body = ""
			// if summary, use that
			if( article.article.attributes.field_ucb_article_summary != null){
				body = article.article.attributes.field_ucb_article_summary;
			}

			// if image, use it
			if (!article.article.relationships.field_ucb_article_thumbnail.data) {
				imageSrc = "";
			} else {
				//Use the idObj as a memo to add the corresponding image url
				let thumbId = article.article.relationships.field_ucb_article_thumbnail.data.id;
				imageSrc = urlObj[idObj[thumbId]];
			}

			if(link && imageSrc) {
				image = `<a href="${link}"><img src="${imageSrc}" /></a>`;
			}
			let outputHTML = `
				<div id='img' class='ucb-article-card-img'>${image}</div>
				<div class='ucb-article-card-data'>
					<span class='ucb-article-card-title'><a href="${link}">${title}</a></span>
					<span id='body' class='ucb-related-article-card-body'>${body}</span>
				</div>
		`;
		// Append
		articleCard.innerHTML = outputHTML
		relatedArticlesDiv.appendChild(articleCard)
			}) 

		// Check to see what was rendered
			// sets global counter of children
			childCount = relatedArticlesDiv.childElementCount
				// If no matches and logged in, render error message for admin
			if(childCount == 0 && loggedIn == true){
				let message = document.createElement('h3')
				message.id = 'admin-notif-message'
				message.innerText = 'There are no returned article matches - check exclusion filters and try again'
				relatedArticlesDiv.appendChild(message)
				// If no matches and not logged in, hide section
			} else if (relatedArticlesDiv.childElementCount == 0 && loggedIn == false){
				let header = relatedArticlesBlock.children[0]
				header.innerText = ''
				// console.log('am i available', relatedArticlesBlock.children[0])
				
			} else {
				//do nothing and proceed
			}
		})
	}
			
			getArticles(URL) // init

		relatedArticlesBlock.style.display = "block"
	} else {
		relatedArticlesBlock.style.display = "none";
	}
})(document.querySelector(".ucb-related-articles-block"));


// These functions get the privated Categories and tags to not include them on the match count for their respective taxonomies
function getPrivateCategories(){
	let privateCats = []
		fetch('/jsonapi/taxonomy_term/category?filter[field_ucb_category_display]=false')
		.then(response => response.json())
		.then(data=>{ 
			data.data.forEach(cat=>{
				privateCats.push(cat.attributes.drupal_internal__tid)
			})
		})
	return privateCats
}

function getPrivateTags(){
	let privateTags = []
		fetch('/jsonapi/taxonomy_term/tags?filter[field_ucb_tag_display]=false')
		.then(response => response.json())
		.then(data=>{ 
			data.data.forEach(tag=>{
				privateTags.push(tag.attributes.drupal_internal__tid)
			})
		})
	return privateTags

}