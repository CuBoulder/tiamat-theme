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
				if(filterItem == '') return;
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
			asyncTaxonomies = this._asyncTaxonomies = new Set(['department']);
		if (groupBy != 'none' && taxonomyIds[groupBy]) { // The taxonomy used for groups must be fetched sync
			syncTaxonomies.add(groupBy);
			asyncTaxonomies.delete(groupBy);
		} else this._groupBy = 'none';
		for(const filterName in filters) { // If user filter dropdowns are necessary, they can be generated async
			if(filters[filterName]['userAccessible'] && !syncTaxonomies.has(filterName))
				asyncTaxonomies.add(filterName);
		}
		this.generateForm();
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
				(groupBy == 'none' ? [null] : this.getTaxonomy(groupBy) || [null]).forEach(taxonomy => {
					const peopleInGroup = this.getPeopleInGroup(results, taxonomy);
					if(!peopleInGroup) return;
					const groupContainerElement = this.buildGroup(format, taxonomy);
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
			this.generateDropdown(taxonomy, selectContainerElements[index], this._config);
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

	attachElementToTaxonomy(element, taxonomy) {
		const taxonomyClass = 'taxonomy-' + taxonomy.fieldName;
		if(element.className)
			element.className += ' ' + taxonomyClass;
		else element.className = taxonomyClass;
		element.dataset['termId'] = taxonomy.id;
		element.innerText = taxonomy.name;
		return element;
	}

	buildListGroup(taxonomy) {
		const wrapper = document.createElement('section');
		if(taxonomy) {
			const groupTitleContainer = document.createElement('div');
			groupTitleContainer.appendChild(this.attachElementToTaxonomy(document.createElement('h2'), taxonomy));
			wrapper.appendChild(groupTitleContainer);
		}
		this._contentElement.appendChild(wrapper);
		return wrapper;
	}

	buildGridGroup(taxonomy) {
		const wrapper = document.createElement('section');
		wrapper.className = 'row ucb-people-list-content';
		if(taxonomy) {
			const groupTitleContainer = document.createElement('div');
			groupTitleContainer.className = 'col-12';
			groupTitleContainer.appendChild(this.attachElementToTaxonomy(document.createElement('h2'), taxonomy));
			wrapper.appendChild(groupTitleContainer);
		}
		this._contentElement.appendChild(wrapper);
		return wrapper;
	}

	buildTableGroup(taxonomy) {
		let table = this._contentElement.querySelector('table'), tableBody;
		// we only need to render the table header the first time
		// this function will be called multiple times so check to 
		// see if we've already rendered the table header HTML
		if(!table) {
			table = document.createElement('table');
			table.id = 'ucb-pl-table';
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
		if(taxonomy) {
			const groupTitleContainer = document.createElement('tr'), groupTitleTh = document.createElement('th');
			groupTitleTh.className = 'ucb-people-list-group-title-th';
			groupTitleTh.setAttribute('colspan', '3');
			groupTitleContainer.appendChild(this.attachElementToTaxonomy(groupTitleTh, taxonomy));
			tableBody.appendChild(groupTitleContainer);
		}
		return tableBody;
	}

	buildGroup(format, taxonomy) {
		switch (format) {
			case 'list': default: return this.buildListGroup(taxonomy);
			case 'grid': return this.buildGridGroup(taxonomy);
			case 'table': return this.buildTableGroup(taxonomy);
		}
	}

	getPeopleInGroup(people, taxonomy) {
		return taxonomy && this._groupedPeople ? this._groupedPeople.get(taxonomy.id) : people;
	}

	displayPeople(format, people, urlObj, idObj, containerElement) {
		// maps over data
		people.forEach((person) => {
			const personRelationshipData = person['relationships'],
				departmentsData = personRelationshipData['field_ucb_person_department']['data'],
				jobTypesData = personRelationshipData['field_ucb_person_department']['data'],
				personAttributeData = person['attributes'],
				departments = [], jobTypes = [], photoId = (personRelationshipData['field_ucb_person_photo']['data'] || {})['id'] || '',
				thisPerson = {
					link: (personAttributeData['path'] || {})['alias'] || `/node/${personAttributeData['drupal_internal__nid']}`,
					name: personAttributeData['title'],
					title: personAttributeData['field_ucb_person_title'][0],
					departments: departments,
					jobTypes: jobTypes,
					photoId: photoId,
					photoURI: photoId ? urlObj[idObj[photoId]] : '',
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
			}
			
			this.appendPerson(format, thisPerson, containerElement);
		});
	}

	appendPerson(format, person, containerElement) {
		let cardElement, cardHTML = '', myDept = '';
		const
			personLink = person.link,
			personName = PeopleListElement.escapeHTML(person.name),
			personTitle = PeopleListElement.escapeHTML(person.title),
			personPhoto = person.photoURI ? `<img src="${person.photoURI}">` : '',
			personBody = PeopleListElement.escapeHTML(person.body),
			personEmail = PeopleListElement.escapeHTML(person.email),
			personPhone = PeopleListElement.escapeHTML(person.phone),
			departmentTaxonomy = this.getTaxonomy('department');
		person.departments.forEach(termId => {
			const thisDeptName = departmentTaxonomy ? PeopleListElement.escapeHTML(PeopleListElement.getTaxonomyName(departmentTaxonomy, termId)) : '';
			myDept += '<li class="taxonomy-department" data-term-id="' + termId + '">' + thisDeptName + '</li>';
		});	
		switch (format) {
			case 'list': default:
				cardElement = document.createElement('div');
				cardHTML = `
					<div class="ucb-person-card-list row">
						<div class="col-sm-12 col-md-3 ucb-person-card-img">
							<a href="${personLink}">${personPhoto}</a>
						</div>
						<div class="col-sm-12 col-md-9 ucb-person-card-details">
							<a href="${personLink}">
								<span class="ucb-person-card-name">
									${personName}
								</span>
							</a>
							<span class="ucb-person-card-title">
								${personTitle}
							</span>
							<span class="ucb-person-card-dept">
								<ul${departmentTaxonomy ? '' : ' hidden'} class="ucb-person-card-dept-ul taxonomy-visible-department">
									${myDept} 
								</ul>
							</span>
							<span class="ucb-person-card-body">
								${personBody}
							</span>
							<div class="ucb-person-card-contact">
								<span class="ucb-person-card-email">
									${
										personEmail ?
											`<a href="mailto:${personEmail}">
												<span class="ucb-people-list-contact">  ${personEmail}</span>
											</a>`
										: ''
									}
								</span>
								<span class="ucb-person-card-phone">
									${
										personPhone ?
											`<a href="tel:${personPhone.replace(/[^+\d]+/g, '',)}">
												<p><span class="ucb-people-list-contact">  ${personPhone}</span></p>
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
									${personName ? personName : ''}
								</span>
							</a>
							<span class="ucb-person-card-title departments-grid">
								${personTitle}
							</span>
							<span class="ucb-person-card-dept departments-grid">
								<ul${departmentTaxonomy ? '' : ' hidden'} class="ucb-person-card-dept-ul taxonomy-visible-department">
									${myDept}
								</ul>
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
							${personTitle}
						</span>
						<span class="ucb-person-card-dept departments-grid">
							<ul${departmentTaxonomy ? '' : ' hidden'} class="ucb-person-card-dept-ul taxonomy-visible-department">
								${myDept}
							</ul>
						</span>
					</td>
					<td>
					<span class="ucb-person-card-email">
						${
							personEmail ?
								`<a href="mailto:${personEmail}">
									<span class="ucb-people-list-contact"> ${personEmail}</span>
								</a>`
							: ''
						}
						</span>
						<span class="ucb-person-card-phone">
							${
								personPhone ?
									`<a href="tel:${personPhone.replace(/[^+\d]+/g, '',)}">
										<p><span class="ucb-people-list-contact">${personPhone}</span></p>
									</a>`
								: ''
							}
						</span>
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
		const config = this._config, filters = config['filters'], userAccessibleFilters = {};
		// If no filters are visitor accessible, skip the form entirely
		let formRenderBool = false; // running check
		for(const filterName in filters){
			const filter = filters[filterName];
			if(filter['userAccessible']/* && filter['includes'].filter(include => include != '').length > 0 */) {
				formRenderBool = true;
				userAccessibleFilters[filterName] = filter;
			}
		}
		// run generateForm method if there's atleast one vistor accessible field
		if (!formRenderBool) return;
	// for(filter in config.)
      // Create Elements
      var form = document.createElement('form')
      form.addEventListener('submit',(event)=> {
        event.preventDefault()
        var formData = new FormData(event.target);
        var dataObj = {}
        // Create a dataObject with ids for second render
        for (var p of formData) {
          dataObj[p[0]] = JSON.parse(p[1])
        } 
        var userSettings = {
          filters: {
            department: {
              includes: dataObj.department ? [dataObj.department[0].id] : [],
            },
            filter_1:{
                includes: dataObj.filter_1 ? [dataObj.filter_1[0].id] : [],
            },
            filter_2:{
                includes: dataObj.filter_2 ? [dataObj.filter_2[0].id] : [],
            },
            filter_3:{
                includes: dataObj.filter_3 ? [dataObj.filter_3[0].id] : [],
            },
            job_type:{
                includes: dataObj.job_type ? [dataObj.job_type[0].id] : [],
            },            
        }
	}
		// If restricted, remove user config filters from the user filter, default to config obj
		for(let key in userSettings['filters']){
			if(userSettings['filters'][key]['includes'][0] == "" && config['filters'][key]['restrict']){
				delete userSettings['filters'][key]
			}
		}
      this.setAttribute('user-config', JSON.stringify(userSettings))
      })
      form.classList = 'people-list-filter'
      var formDiv = document.createElement('div')
      formDiv.classList = 'd-flex align-items-center'
  
      // If User-Filterable...
      // Departments, create filterable dropdown of Departments
      if(config.filters.department.userAccessible){
        var formItemDeptContainer = document.createElement('div')
        formItemDeptContainer.classList = 'form-item-department form-item taxonomy-select-department'
    
        var formItemDeptLabel = document.createElement('label')
        formItemDeptLabel.htmlFor = "Edit Departments"
        formItemDeptLabel.innerText = 'Departments'
    
        var selectDept = document.createElement('select')
        selectDept.name = 'department'
        selectDept.id = 'edit-department'
        selectDept.className = "taxonomy-select"
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:"", name: "",fieldName:''}])
		// If restricted, set to Default instead of All
		if(config.filters.department.restrict){
			allOption.innerText = 'Default'
		} else {
			allOption.innerText = 'All'
		}
        selectDept.appendChild(allOption)
        // Append
        formItemDeptContainer.appendChild(formItemDeptLabel)
        formItemDeptContainer.appendChild(selectDept)
        formDiv.appendChild(formItemDeptContainer)
      }
  
      // Create filterable dropdown of Job Types
      if(config.filters.job_type.userAccessible){
        var formItemJobTypeContainer = document.createElement('div')
        formItemJobTypeContainer.classList = 'form-item-job-type form-item taxonomy-select-job_type'
    
        var formItemJobTypeLabel = document.createElement('label')
        formItemJobTypeLabel.htmlFor = "Edit Job Types"
        formItemJobTypeLabel.innerText = 'Job Types'
    
        var selectJobType = document.createElement('select')
        selectJobType.name = 'job_type'
        selectJobType.id = 'edit-job-types'
        selectJobType.className = "taxonomy-select"
  
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: "",fieldName:''}])
        	// If restricted, set to Default instead of All
		if(config.filters.job_type.restrict){
			allOption.innerText = 'Default'
		} else {
			allOption.innerText = 'All'
		}
        // Append
        selectJobType.appendChild(allOption)    
        formItemJobTypeContainer.appendChild(formItemJobTypeLabel)
        formItemJobTypeContainer.appendChild(selectJobType)
    
        formDiv.appendChild(formItemJobTypeContainer)
      }
      // Create Filter 1
      if(config.filters.filter_1.userAccessible){
        var formItemFilter1Container = document.createElement('div')
        formItemFilter1Container.classList = 'form-item-filter-one form-item taxonomy-select-filter_1'
    
        var formItemFilter1Label = document.createElement('label')
        formItemFilter1Label.htmlFor = "Edit Filer 1"
        formItemFilter1Label.innerText = config.filters.filter_1.label
    
        var selectFilter1 = document.createElement('select')
        selectFilter1.name = 'filter_1'
        selectFilter1.id = 'edit-filter-one'
        selectFilter1.className = "taxonomy-select"
  
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: '',fieldName:''}])
        // If restricted, set to Default instead of All
		if(config.filters.filter_1.restrict){
			allOption.innerText = 'Default'
		} else {
			allOption.innerText = 'All'
		}
        // Append
        selectFilter1.appendChild(allOption)
        formItemFilter1Container.appendChild(formItemFilter1Label)
        formItemFilter1Container.appendChild(selectFilter1)
        formDiv.appendChild(formItemFilter1Container)
      }
      // Create Filter 2
      if(config.filters.filter_2.userAccessible){
        var formItemFilter2Container = document.createElement('div')
        formItemFilter2Container.classList = 'form-item-filter-two form-item taxonomy-select-filter_2'
    
        var formItemFilter2Label = document.createElement('label')
        formItemFilter2Label.htmlFor = "Edit Filter 2"
        formItemFilter2Label.innerText = config.filters.filter_2.label
    
        var selectFilter2 = document.createElement('select')
        selectFilter2.name = 'filter_2'
        selectFilter2.id = 'edit-filter-two'
        selectFilter2.className = "taxonomy-select"
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: '',fieldName:''}])
        // If restricted, set to Default instead of All
		if(config.filters.filter_2.restrict){
			allOption.innerText = 'Default'
		} else {
			allOption.innerText = 'All'
		}
        // Append
        selectFilter2.appendChild(allOption)    
        formItemFilter2Container.appendChild(formItemFilter2Label)
        formItemFilter2Container.appendChild(selectFilter2)
        formDiv.appendChild(formItemFilter2Container)
      }
      // Create Filter 3
      if(config.filters.filter_3.userAccessible){
        var formItemFilter3Container = document.createElement('div')
        formItemFilter3Container.classList = 'form-item-filter-three form-item taxonomy-select-filter_3'
    
        var formItemFilter3Label = document.createElement('label')
        formItemFilter3Label.htmlFor = "Edit Filter 3"
        formItemFilter3Label.innerText = config.filters.filter_3.label
    
        var selectFilter3 = document.createElement('select')
        selectFilter3.name = 'filter_3'
        selectFilter3.id = 'edit-filter-three'
        selectFilter3.className = "taxonomy-select"
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: '', fieldName:''}])
        // If restricted, set to Default instead of All
		if(config.filters.filter_3.restrict){
			allOption.innerText = 'Default'
		} else {
			allOption.innerText = 'All'
		}
        // Append
        selectFilter3.appendChild(allOption)    
        formItemFilter3Container.appendChild(formItemFilter3Label)
        formItemFilter3Container.appendChild(selectFilter3)
        formDiv.appendChild(formItemFilter3Container)
      }
      // Create Filter button after filters are rendered
      var formButtonContainer = document.createElement('div')
      formButtonContainer.classList = 'form-item-button form-item'
  
      var formButton = document.createElement('input')
      formButton.classList = 'form-submit-btn'
      formButton.type = 'submit'
      formButtonContainer.appendChild(formButton)
      formDiv.appendChild(formButtonContainer)
      form.appendChild(formDiv)
		// Append final container
		this._userFormElement.appendChild(form);   
	}

	generateDropdown(taxonomy, selectContainerElements){
		const config = this._config;
    if(selectContainerElements.getElementsByClassName('taxonomy-select')[0]){
      let selectEl = selectContainerElements.getElementsByClassName('taxonomy-select')[0]
      taxonomy.forEach(taxonomy=>{
            let fieldName = taxonomy.fieldName
            let taxonomyConfig = config.filters[fieldName]
            let taxonomiesIncluded = taxonomyConfig.includes[0] == "" ? taxonomyConfig.includes : taxonomyConfig.includes.map(Number)

            // Render selection if no taxonomies were selected to filter, if restricted is on and the taxonomy is included, or if restricted = false
            if((taxonomyConfig.includes[0] == "") || (taxonomyConfig.restrict && taxonomiesIncluded.includes(taxonomy.id)) || taxonomyConfig.restrict == false){
              let option = document.createElement('option')
              option.value = JSON.stringify([{id:taxonomy.id, name: taxonomy.name, fieldName: taxonomy.fieldName}])
              option.innerText = taxonomy.name
              selectEl.appendChild(option)
            }
      })
    }
  }
}

customElements.define('ucb-people-list', PeopleListElement);