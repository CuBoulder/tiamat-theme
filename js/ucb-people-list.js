class PeopleListProvider {
	static get noResultsMessage() { return 'No results matching your filters.'; }
	static get errorMessage() { return 'Error retrieving people from the API endpoint. Please try again later.'; }

	constructor(baseURI, filters = {}, userFilters = {}) {
		this.baseURI = baseURI;
		this.nextPath = PeopleListProvider.buildEndpointPath(filters, userFilters);
	}
	/**
	 * @returns {string} The API path (including all query parameters)
	 */
	static buildEndpointPath(filters = {}, userFilters = {}) {
		const
			// JSON API Endpoint information
			endpoint = '/node/ucb_person',
			baseParams = 'include[node--ucb_person]=uid,body,field_ucb_person_first_name,field_ucb_person_last_name,field_ucb_person_job_type,field_ucb_person_department,field_ucb_person_email,field_ucb_person_phone,field_ucb_person_title,field_ucb_person_photo'
				+ '&include=field_ucb_person_photo.field_media_image'
				+ '&fields[file--file]=uri,url',
			// Filter on only published (status = true) content
			publishedParams = '&filter[published][group][conjunction]=AND'
				+ '&filter[publish-check][condition][path]=status'
				+ '&filter[publish-check][condition][value]=1'
				+ '&filter[publish-check][condition][memberOf]=published',
			sortParams = '&sort=field_ucb_person_last_name',
			allFilterNames = Object.keys(filters).concat(Object.keys(userFilters));
		let params = '';
		allFilterNames.forEach(filterName => {
			const filterIncludes = (userFilters[filterName] || {})['includes'] || (filters[filterName] || {})['includes'];
			if(!filterIncludes || !filterIncludes.length) return;
			let filterParams = '';
			filterIncludes.forEach(filterItem => {
				if(!filterItem) return;
				filterParams += '&filter[filter-' + filterName + '-' + filterItem + '][condition][path]=field_ucb_person_' + filterName + '.meta.drupal_internal__target_id'
					+ '&filter[filter-' + filterName + '-' + filterItem + '][condition][value]=' + filterItem
					+ '&filter[filter-' + filterName + '-' + filterItem + '][condition][memberOf]=' + filterName + '-include';
			});
			if(!filterParams) return;
			params += '&filter[' + filterName + '-include][group][conjunction]=OR'
				+ filterParams
				+ '&filter[' + filterName + '-include][group][memberOf]=include-group';
		});
		if(params)
			params = '&filter[include-group][group][conjunction]=AND'
				+ '&filter[include-group][group][memberOf]=published'
				+ params
		return endpoint + '?' + baseParams + publishedParams + params + sortParams;
	}
	// Gets person data
	async fetchPeople() {
		try {
			const
				response = await fetch(this.baseURI + this.nextPath),
				data = await response.json(),
				results = data['data'];
			if (results.length === 0)
				console.warn('PeopleListProvider: ' + PeopleListProvider.noResultsMessage);
			return data;
		} catch (reason) {
			console.error('PeopleListProvider: ' + PeopleListProvider.errorMessage);
			throw reason;
		}
	}
}

class PeopleListElement extends HTMLElement {
	/**
	 * @param {string|null|undefined} raw A raw string
	 * @returns {string} An HTML-safe string (or an empty string if `raw` is `null` or `undefined`)
	 */
	static escapeHTML(raw) { return raw ? raw.replace(/\&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
	static get observedAttributes() { return ['user-config']; }

	constructor() {
		super();
		let config = {};
		try {
			config = this._config = JSON.parse(this.getAttribute('config')) || config;
		} catch(e) {}
		this._baseURI = this.getAttribute('base-uri');
		const
			chromeElement = this._chromeElement = document.createElement('div'),
			contentElement = this._contentElement = document.createElement('div'),
			userFormElement = this._userFormElement = document.createElement('div'),
			messageElement = this._messageElement = document.createElement('div'),
			loadingElement = this._loadingElement = document.createElement('div');
		messageElement.className = 'ucb-list-msg';
		messageElement.setAttribute('hidden', '');
		loadingElement.className = 'ucb-loading-data';
		loadingElement.innerHTML = '<i class="fas fa-spinner fa-3x fa-pulse"></i>';
		chromeElement.appendChild(userFormElement);
		chromeElement.appendChild(messageElement);
		chromeElement.appendChild(loadingElement);
		this.appendChild(chromeElement);
		this.appendChild(contentElement);
		const taxonomyIds = this._taxonomyIds = config['taxonomies'], 
			filters = this._filters = config['filters'] || {},
			groupBy = this._groupBy = config['groupby'] || 'none',
			syncTaxonomies = this._syncTaxonomies = new Set(),
			asyncTaxonomies = this._asyncTaxonomies = new Set(['department']),
			userAccessibleFilters = this._userAccessibleFilters = {};
		if (groupBy != 'none' && taxonomyIds[groupBy]) { // The taxonomy used for groups must be fetched sync
			syncTaxonomies.add(groupBy);
			asyncTaxonomies.delete(groupBy);
		} else this._groupBy = 'none';
		// If no filters are visitor accessible, skip the form entirely
		let formRenderBool = false; // running check
		for(const filterName in filters) { // If user filter dropdowns are necessary, they can be generated async
			const filter = filters[filterName];
			filter['includes'] = filter['includes'].filter(include => !!include);
			if(filter['userAccessible']) {
				userAccessibleFilters[filterName] = filter;
				if(!syncTaxonomies.has(filterName))
					asyncTaxonomies.add(filterName);
				formRenderBool = true;
			}
		}
		// call generateForm method if there's atleast one vistor accessible field
		if (formRenderBool) this.generateForm();
		this._loadedTaxonomies = {};
		this._syncTaxonomiesLoaded = 0;
		this.loadSyncTaxonomies();
		Array.from(asyncTaxonomies).forEach(taxonomyFieldName => {
			const taxonomyId = taxonomyIds[taxonomyFieldName];
			this.fetchTaxonomy(taxonomyId, taxonomyFieldName).then(taxonomy => {
				this.onTaxonomyLoaded(taxonomyFieldName, taxonomy);
			}).catch(reason => console.warn('Taxonomy with id `' + taxonomyId + '` failed to load!'));	
		});
	}

	loadSyncTaxonomies() {
		if(this._syncTaxonomiesLoaded < this._syncTaxonomies.size) {
			Array.from(this._syncTaxonomies).forEach(taxonomyFieldName => {
				if(!this.taxonomyHasLoaded(taxonomyFieldName)) {
					this.fetchTaxonomy(this._taxonomyIds[taxonomyFieldName], taxonomyFieldName).then(taxonomy => {
						if(!this.taxonomyHasLoaded(taxonomyFieldName)) {
							this.onTaxonomyLoaded(taxonomyFieldName, taxonomy);
							this._syncTaxonomiesLoaded++;
							if(this._syncTaxonomiesLoaded >= this._syncTaxonomies.size) // Enter build method
								this.build();
						}
					}).catch(reason => this.onFatalError(reason));	
				}
			});
		} else this.build();
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if(name == 'user-config' && oldValue !== null && this._syncTaxonomiesLoaded >= this._syncTaxonomies.size)
			this.build();
	}

	build() {
		let userConfig = {};
		try {
			userConfig = this._userConfig = JSON.parse(this.getAttribute('user-config'));
		} catch(e) {}
		
		const
			config = this._config,
			baseURI = this._baseURI,
			filters = this._filters,
			userFilters = userConfig['filters'] || {},
			peopleListProvider = this._peopleListProvider = new PeopleListProvider(baseURI, filters, userFilters),
			format = this._format = userConfig['format'] || config['format'] || 'list',
			orderBy = this._orderBy = userConfig['orderby'] || config['orderby'] || 'last';
		this.toggleMessageDisplay(this._messageElement, 'none', null, null);
		this.toggleMessageDisplay(this._loadingElement, 'block', null, null);

		let groupBy = userConfig['groupby'] || config['groupby'] || 'none';
		if(groupBy != 'none' && !this._taxonomyIds[groupBy]) // Group by is invalid!
			groupBy = 'none';
		// User-specified grouping is working as a feature to add in the future
		if(groupBy != this._groupBy && !this.taxonomyHasLoaded(groupBy)) {
			this._groupBy = groupBy;
			this._syncTaxonomies.add(groupBy);
			this.loadSyncTaxonomies();
			return;
		}
		this._groupBy = groupBy;

		// Get our people
		peopleListProvider.fetchPeople().then(response => {
			this._contentElement.innerText = '';
			const results = response['data'];
			if(!results.length)
				this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-end-of-results', PeopleListProvider.noResultsMessage);
			else {
				if(groupBy != 'none') { // Build person -> term mapping
					const groupedPeople = this._groupedPeople = new Map();
					results.forEach(person => {
						((person['relationships']['field_ucb_person_' + groupBy] || {})['data'] || []).forEach(
							termData => {
								const termId = termData['meta']['drupal_internal__target_id'];
								let termPeople = groupedPeople.get(termId);
								if(!termPeople) {
									termPeople = [];
									groupedPeople.set(termId, termPeople);
								}
								termPeople.push(person);
							});
					});
				}	
				// get all of the include images id => url
				const urlObj = {}; // key from data.data to key from data.includes
				const idObj = {}; // key from data.includes to URL
				// Remove any blanks from our articles before map
				if (response['included']) {
					const filteredData = response['included'].filter(url => !!url['attributes']['uri']);
					// creates the urlObj, key: data id, value: url
					filteredData.map((pair) => {
						// checks if consumer is working, else default to standard image instead of focal image
						if(pair['links']['focal_image_square'])
							urlObj[pair['id']] = pair['links']['focal_image_square']['href'];
						else
							urlObj[pair['id']] = pair['attributes']['uri']['url'];
					});
					// removes all other included data besides images in our included media
					const idFilterData = response['included'].filter(item => item['type'] == 'media--image');
					// using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
					idFilterData.map(pair => idObj[pair['id']] = pair['relationships']['thumbnail']['data']['id']);
				}
				(groupBy == 'none' ? [null] : this.getTaxonomy(groupBy) || [null]).forEach(taxonomyTerm => {
					const peopleInGroup = this.getPeopleInGroup(results, taxonomyTerm);
					if(!peopleInGroup) return;
					const groupContainerElement = this.buildGroup(format, taxonomyTerm);
					if(orderBy == 'type') {
						this.displayPeople(format, peopleInGroup.filter(person => person['relationships']['field_ucb_person_job_type']['data'].length > 0), urlObj, idObj, groupContainerElement);
						this.displayPeople(format, peopleInGroup.filter(person => person['relationships']['field_ucb_person_job_type']['data'].length == 0), urlObj, idObj, groupContainerElement);
					} else this.displayPeople(format, peopleInGroup, urlObj, idObj, groupContainerElement);
				});
			}
			this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
		}).catch(reason => this.onFatalError(reason));
	}

	// Getter function for Departments and Job Types
	async fetchTaxonomy(taxonomyId, taxonomyFieldName) {
		const response = await fetch(this._baseURI + '/taxonomy_term/' + taxonomyId + '?sort=weight,name'),
			data = await response.json(),
			results = data['data'],
			terms = [];
		results.map(termResult => {
			const id = termResult['attributes']['drupal_internal__tid'],
				name = termResult['attributes']['name'];
			terms.push({ id: id, name: name, fieldName: taxonomyFieldName });
		});
		return terms;
	}

	static getTaxonomyName(taxonomy, termId) {
		return taxonomy.find( ({ id }) => id === termId ).name;
	}

	onTaxonomyLoaded(taxonomyFieldName, taxonomy) {
		this._loadedTaxonomies[taxonomyFieldName] = taxonomy;
		const showContainerElements = this.getElementsByClassName('taxonomy-visible-' + taxonomyFieldName),
			hideContainerElements = this.getElementsByClassName('taxonomy-hidden-' + taxonomyFieldName),
			selectContainerElements = this.getElementsByClassName('taxonomy-select-' + taxonomyFieldName),
			taxonomyElements = this.getElementsByClassName('taxonomy-' + taxonomyFieldName);
		for(let index = 0; index < showContainerElements.length; index++)
			showContainerElements[index].removeAttribute('hidden');
		for(let index = 0; index < hideContainerElements.length; index++)
			showContainerElements[index].setAttribute('hidden', '');
		for(let index = 0; index < selectContainerElements.length; index++)
			this.generateDropdown(taxonomy, taxonomyFieldName, selectContainerElements[index]);
		for(let index = 0; index < taxonomyElements.length; index++) {
			const taxonomyElement = taxonomyElements[index];
			taxonomyElement.innerText = PeopleListElement.getTaxonomyName(taxonomy, parseInt(taxonomyElement.dataset['termId'])) || '';
		}
	}

	getTaxonomy(taxonomyFieldName) {
		return this._loadedTaxonomies[taxonomyFieldName];
	}

	taxonomyHasLoaded(taxonomyFieldName) {
		return !!this._loadedTaxonomies[taxonomyFieldName];
	}

	attachElementToTaxonomyTerm(element, taxonomyTerm) {
		const taxonomyClass = 'taxonomy-' + taxonomyTerm.fieldName;
		if(element.className)
			element.className += ' ' + taxonomyClass;
		else element.className = taxonomyClass;
		element.dataset['termId'] = taxonomyTerm.id;
		element.innerText = taxonomyTerm.name;
		return element;
	}

	buildListGroup(taxonomyTerm) {
		const wrapper = document.createElement('section');
		if(taxonomyTerm) {
			const groupTitleContainer = document.createElement('div');
			groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(document.createElement('h2'), taxonomyTerm));
			wrapper.appendChild(groupTitleContainer);
		}
		this._contentElement.appendChild(wrapper);
		return wrapper;
	}

	buildGridGroup(taxonomyTerm) {
		const wrapper = document.createElement('section');
		wrapper.className = 'row ucb-people-list-content';
		if(taxonomyTerm) {
			const groupTitleContainer = document.createElement('div');
			groupTitleContainer.className = 'col-12';
			groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(document.createElement('h2'), taxonomyTerm));
			wrapper.appendChild(groupTitleContainer);
		}
		this._contentElement.appendChild(wrapper);
		return wrapper;
	}

	buildTableGroup(taxonomyTerm) {
		let table = this._contentElement.querySelector('table'), tableBody;
		// we only need to render the table header the first time
		// this function will be called multiple times so check to 
		// see if we've already rendered the table header HTML
		if(!table) {
			table = document.createElement('table');
			table.classList = 'table table-bordered table-striped';
			const tableHead = document.createElement('thead');
			tableHead.classList = 'ucb-people-list-table-head';
			const tableRow = document.createElement('tr');
			tableRow.innerHTML = '<th><span class="sr-only">Photo</span></th><th>Name</th><th>Contact Information</th>';
			tableBody = document.createElement('tbody');
			tableBody.className = 'ucb-people-list-table-tablebody';
			tableHead.appendChild(tableRow);
			table.appendChild(tableHead);
			table.appendChild(tableBody);
			this._contentElement.appendChild(table);
		}
		tableBody = tableBody || table.querySelector('tbody.ucb-people-list-table-tablebody');
		if(taxonomyTerm) {
			const groupTitleContainer = document.createElement('tr'), groupTitleTh = document.createElement('th');
			groupTitleTh.className = 'ucb-people-list-group-title-th';
			groupTitleTh.setAttribute('colspan', '3');
			groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(groupTitleTh, taxonomyTerm));
			tableBody.appendChild(groupTitleContainer);
		}
		return tableBody;
	}

	buildGroup(format, taxonomyTerm) {
		switch (format) {
			case 'list': default: return this.buildListGroup(taxonomyTerm);
			case 'grid': return this.buildGridGroup(taxonomyTerm);
			case 'table': return this.buildTableGroup(taxonomyTerm);
		}
	}

	getPeopleInGroup(people, taxonomyTerm) {
		return taxonomyTerm && this._groupedPeople ? this._groupedPeople.get(taxonomyTerm.id) : people;
	}

	displayPeople(format, people, urlObj, idObj, containerElement) {		
		// If grid render and no thumbnail, use a default image for the person. Else no image.
		const defaultThumbnail = format == 'grid' ? 'themes/custom/boulder_d9_base/images/avatar320.jpeg' : '';

		people.forEach((person) => {
			console.log(person);
			const personRelationshipData = person['relationships'],
				departmentsData = personRelationshipData['field_ucb_person_department']['data'],
				jobTypesData = personRelationshipData['field_ucb_person_department']['data'],
				personAttributeData = person['attributes'],
				departments = [], jobTypes = [], photoId = (personRelationshipData['field_ucb_person_photo']['data'] || {})['id'] || '',
				thisPerson = {
					link: (personAttributeData['path'] || {})['alias'] || `/node/${personAttributeData['drupal_internal__nid']}`,
					name: personAttributeData['title'],
					titles: personAttributeData['field_ucb_person_title'],
					departments: departments,
					jobTypes: jobTypes,
					photoId: photoId,
					photoURI: photoId ? urlObj[idObj[photoId]] : defaultThumbnail,
					body: '',
					email: personAttributeData['field_ucb_person_email'],
					phone: personAttributeData['field_ucb_person_phone']
				};

			// Builds arrays of department and job type ids
			departmentsData.forEach(departmentData => departments.push(departmentData['meta']['drupal_internal__target_id']));
			jobTypesData.forEach(jobTypeData => jobTypes.push(jobTypeData['meta']['drupal_internal__target_id']));	
							
			// needed to verify body exists on the Person page, if so, use that
			if (personAttributeData['body']) {
				// use summary if available
				if (personAttributeData['body']['summary'])
					thisPerson.body = personAttributeData['body']['summary'].replace(/(\r\n|\n|\r)/gm, ''); // strip out line breaks
				else  {
					let htmlStrip = personAttributeData['body']['value'].replace(
						/<\/?[^>]+(>|$)/g,
						""
					  )
					  // Remove any line breaks if media is embedded in the body
					  let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
					  // take only the first 100 words ~ 500 chars
					  let trimmedString = lineBreakStrip.substr(0, 400);
					  // if in the middle of the string, take the whole word
					  if(trimmedString.length > 70){
						trimmedString = trimmedString.substr(
						  0,
						  Math.min(
							trimmedString.length,
							trimmedString.lastIndexOf(" ")
						  )
						)
						thisPerson.body = `${trimmedString}...`;
					  }
					}
			}
			
			this.appendPerson(format, thisPerson, containerElement);
		});
	}

	appendPerson(format, person, containerElement) {
		let cardElement, cardHTML = '', personTitleList = '', personDepartmentList = '';
		const
			personLink = person.link,
			personName = PeopleListElement.escapeHTML(person.name),
			personPhoto = person.photoURI ? '<img src="' + person.photoURI + '">' : '',
			personBody = PeopleListElement.escapeHTML(person.body),
			personEmail = PeopleListElement.escapeHTML(person.email),
			personPhone = PeopleListElement.escapeHTML(person.phone),
			departmentTaxonomy = this.getTaxonomy('department');
		person.titles.forEach(title => {
			personTitleList += (personTitleList ? ' &bull; ' : '') + PeopleListElement.escapeHTML(title);
		});
		person.departments.forEach(termId => {
			const department = departmentTaxonomy ? PeopleListElement.escapeHTML(PeopleListElement.getTaxonomyName(departmentTaxonomy, termId)) : '';
			personDepartmentList +=  (personDepartmentList ? ' &bull; ' : '') + '<span class="taxonomy-department" data-term-id="' + termId + '">' + department + '</span>';
		});
		if(personDepartmentList)
			personDepartmentList = '<span' + (departmentTaxonomy ? '' : ' hidden') + ' class="taxonomy-visible-department">' + personDepartmentList + '</span>';
		switch (format) {
			case 'list': default:
				cardElement = document.createElement('div');
				cardHTML = `
					<div class="ucb-person-card-list row">
					${
						personPhoto ?
							`
							<div class="col-sm-12 col-md-3 ucb-person-card-img">
								<a href="${personLink}">${personPhoto}</a>
							</div>`
						: ''
					}
						<div class="col-sm-12 col-md-9 ucb-person-card-details">
							<a href="${personLink}">
								<span class="ucb-person-card-name">
									<h2>${personName}</h2>
								</span>
							</a>
							<span class="ucb-person-card-title">
								${personTitleList}
							</span>
							<span class="ucb-person-card-dept">
								${personDepartmentList} 
							</span>
							<span class="ucb-person-card-body">
								${personBody}
							</span>
							<div class="ucb-person-card-contact">
								<span class="ucb-person-card-email">
									${
										personEmail ?
											`<i class="fa fa-envelope iconColor"></i>
											<a href="mailto:${personEmail}">
												<span class="ucb-people-list-contact">  ${personEmail}</span>
											</a>`
										: ''
									}
								</span>
								<span class="ucb-person-card-phone">
									${
										personPhone ?
											`<i class="fa fa-phone iconColor"></i>
											<a href="tel:${personPhone.replace(/[^+\d]+/g, '',)}">
												<span class="ucb-people-list-contact">  ${personPhone}</span>
											</a>`
										: ''
									}
								</span>
							</div>
						</div>
					</div>`;
			break;
			case 'grid':
				cardElement = document.createElement('div');
				cardElement.className = 'col-sm-12 col-md-6 col-lg-4';
				cardHTML = `
					<div class="col-sm mb-3">
						<div class="col-sm-12 ucb-person-card-img-grid">
							<a href="${personLink}">${personPhoto}</a>
						</div>
						<div>
							<a href="${personLink}">
								<span class="ucb-person-card-name">
									<h2>${personName ? personName : ''}<h2>
								</span>
							</a>
							<span class="ucb-person-card-title departments-grid">
								${personTitleList}
							</span>
							<span class="ucb-person-card-dept departments-grid">
								${personDepartmentList}
							</span>
						</div>
					</div>`;
			break;
			case 'table':
				cardElement = document.createElement('tr');
				cardHTML = `
				
					<td class="ucb-people-list-table-photo">
						<a href="${personLink}">${personPhoto}</a>  
					</td>
					<td>
						<a href="${personLink}">
							<span class="ucb-person-card-name">
								${personName}
							</span>
						</a>
						<span class="ucb-person-card-title departments-grid">
							${personTitleList}
						</span>
						<span class="ucb-person-card-dept departments-grid">
							${personDepartmentList}
						</span>
					</td>
					<td>
						<div class="ucb-person-card-contact-table">
							<span class="ucb-person-card-email">
								${
									personEmail ?
										`<i class="fa fa-envelope iconColor"></i>
										<a href="mailto:${personEmail}">
											<span class="ucb-people-list-contact"> ${personEmail}</span>
										</a>`
									: ''
								}
							</span>
							<span class="ucb-person-card-phone">
									${
										personPhone ?
											`<i class="fa fa-phone iconColor"></i>
											<a href="tel:${personPhone.replace(/[^+\d]+/g, '',)}">
												<span class="ucb-people-list-contact">${personPhone}</span>
											</a>`
										: ''
									}
							</span>
						</div>
					</td>`;
		}
		cardElement.innerHTML = cardHTML;
		containerElement.appendChild(cardElement);
		return cardElement;
	}

	onFatalError(reason) {
		this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-error', PeopleListProvider.errorMessage);
		this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
		throw reason;
	}

	toggleMessageDisplay(element, display, className, innerText) {
		if(className)
			element.className = className;
		if(innerText)
			element.innerText = innerText;
		if(display === 'none')
			element.setAttribute('hidden', '');
		else element.removeAttribute('hidden');
	}

	generateForm(){
		const userAccessibleFilters = this._userAccessibleFilters;
		// Create Elements
		const form = document.createElement('form'), formDiv = document.createElement('div'), onChange = event => {
			const form = event.target.form, formItemsData = new FormData(form),
				userSettings = {};
			// Create a dataObject with ids for second render
			for (const formItemData of formItemsData) {
				const filterName = formItemData[0], filterInclude = formItemData[1];
				if(filterInclude != '-1')
					userSettings[filterName] = {'includes': [filterInclude]};
			} 
			this.setAttribute('user-config', JSON.stringify({'filters': userSettings}));
		};
		form.className = 'people-list-filter';
		formDiv.className = 'd-flex align-items-center';
	
		// If User-Filterable...Create Dropdowns
		for(const key in userAccessibleFilters){
			const filter = userAccessibleFilters[key];
			// Create container
			const container = document.createElement('div');
			container.className = `form-item-${key} form-item`;
			// Create label el
			const itemLabel = document.createElement('label'), itemLabelSpan = document.createElement('span');
			itemLabelSpan.innerText = filter['label'];
			itemLabel.appendChild(itemLabelSpan);
			// Create select el
			const selectFilter = document.createElement('select');
			selectFilter.name = key;
			selectFilter.className = 'taxonomy-select-' + key + ' taxonomy-select';
			selectFilter.onchange = onChange;

			if(filter['includes'].length != 1) {
				// All option as first entry
				const defaultOption = document.createElement('option');
				defaultOption.value = '-1';
				defaultOption.innerText = 'All';
				defaultOption.className = 'taxonomy-option-all';
				if(!filter['restrict'] && filter['includes'].length > 1){
					defaultOption.innerText = 'Default';
					defaultOption.className = 'taxonomy-option-default';
					const allOptions = document.createElement('option');
					allOptions.innerText = 'All';
					allOptions.value = '';
					allOptions.className = 'taxonomy-option-all';
					selectFilter.appendChild(allOptions);
				}
				defaultOption.selected = true;
				// Append
				selectFilter.appendChild(defaultOption);
			}
			itemLabel.appendChild(selectFilter);
			container.appendChild(itemLabel);
			formDiv.appendChild(container);
		}
		form.appendChild(formDiv);
		// Append final container
		this._userFormElement.appendChild(form);   
	}

	generateDropdown(taxonomy, taxonomyFieldName, selectElement){
		if(taxonomy.length === 0) return;
		const
			filters = this._filters,
			taxonomyConfig = filters[taxonomyFieldName],
			taxonomiesIncluded = taxonomyConfig['includes'].map(Number), // The data type for taxonomyTerm.id is Number, the includes may be strings
			restrict = taxonomyConfig['restrict'] && taxonomiesIncluded.length > 0;
		taxonomy.forEach(taxonomyTerm => {
			if(restrict && taxonomiesIncluded.indexOf(taxonomyTerm.id) === -1) return; // Rejects a restricted option
			const option = document.createElement('option');
			option.value = taxonomyTerm.id;
			option.innerText = taxonomyTerm.name;
			option.selected = taxonomiesIncluded.length === 1 && taxonomiesIncluded[0] == taxonomyTerm.id;
			selectElement.appendChild(option);
		});
		if(!restrict && taxonomy.length > 1 && taxonomy.length === taxonomiesIncluded.length) { // Removes the "Default" option if all the taxonomy terms are included
			const defaultOption = selectElement.querySelector('.taxonomy-option-default');
			if(selectElement.options[selectElement.selectedIndex] == defaultOption)
				selectElement.querySelector('.taxonomy-option-all').selected = true;
			selectElement.removeChild(defaultOption);
		}
	}
}

customElements.define('ucb-people-list', PeopleListElement);
