class PeopleListProvider {
	static get noResultsMessage() { return 'No results matching your filters.'; }
	static get errorMessage() { return 'Error retrieving people from the API endpoint. Please try again later.'; }

	constructor(baseURI, userConfig, config) {
		this.baseURI = baseURI;
		this.nextPath = PeopleListProvider.buildEndpointPath(userConfig, config);
	}
	/**
	 * 
	 * @param {object} config The People List configuration object
	 * @returns {string} The API path (including all query parameters)
	 */
	static buildEndpointPath(userConfig, config) {
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
			userFilters = userConfig['filters'] || {},
			filters = config['filters'] || {},
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
	 * 
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
		// this.generateDropdown();
		const taxonomyIds = this._taxonomyIds = config['taxonomies'], 
			groupBy = this._groupBy = config['groupby'] || 'none',
			syncTaxonomies = this._syncTaxonomies = new Set(['department', 'job_type']),
			asyncTaxonomies = this._asyncTaxonomies = new Set();
		this._loadedTaxonomies = {};
		if (groupBy !== 'none' && taxonomyIds[groupBy]) // The taxonomy used for groups must be fetched sync
			syncTaxonomies.add(groupBy);
		else this._groupBy = 'none';
		for(const filterName in config['filters']) { // If user filter dropdowns are necessary, they can be generated async
			if(config['filters'][filterName]['userAccessible'])
				asyncTaxonomies.add(filterName);
		}
		this._syncTaxonomiesLoaded = 0;
		Array.from(syncTaxonomies).forEach(taxonomyFieldName => {
			this.fetchTaxonomy(taxonomyIds[taxonomyFieldName], taxonomyFieldName).then(taxonomy => {
				this.onTaxonomyLoaded(taxonomyFieldName, taxonomy);
				this._syncTaxonomiesLoaded++;
				if(this._syncTaxonomiesLoaded >= syncTaxonomies.size) // Enter build method
					this.build();
			}).catch(reason => this.onFatalError(reason));	
		});
		Array.from(asyncTaxonomies).forEach(taxonomyFieldName => {
			const taxonomyId = taxonomyIds[taxonomyFieldName];
			this.fetchTaxonomy(taxonomyId, taxonomyFieldName).then(taxonomy => {
				this.onTaxonomyLoaded(taxonomyFieldName, taxonomy);
			}).catch(reason => console.warn('Taxonomy with id `' + taxonomyId + '` failed to load!'));	
		});
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if(name == 'user-config' && this._syncTaxonomiesLoaded >= this._syncTaxonomies.size)
			this.build();
	}

	build() {
		let userConfig = this._userConfig || {};
		try {
			userConfig = this._userConfig = JSON.parse(this.getAttribute('user-config'));
		} catch(e) {}
		const
			config = this._config,
			baseURI = this._baseURI,
			peopleListProvider = this._peopleListProvider = new PeopleListProvider(baseURI, userConfig, config),
			format = this._format = userConfig['format'] || config['format'] || 'list',
			groupBy = this._groupBy,
			orderBy = this._orderBy = userConfig['orderby'] || config['orderby'] || 'type';
    
		this.toggleMessageDisplay(this._messageElement, 'none', null, null);
		this.toggleMessageDisplay(this._loadingElement, 'block', null, null);
		// Get our people
		peopleListProvider.fetchPeople().then(response => {
			this._contentElement.innerText = '';
			const results = response['data'];
			if(!results.length)
				this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-end-of-results', PeopleListProvider.noResultsMessage);
			else {
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
				(groupBy !== 'none' ? this._loadedTaxonomies[groupBy] || [null] : [null]).forEach(taxonomy => {
					const peopleInGroup = this.getPeopleInGroup(results, taxonomy);
					if(!peopleInGroup) return;
					const groupContainerElement = this.buildGroup(format, taxonomy);
					if(orderBy == 'type') {
						firstPassCount = 0; 
						this.displayPeople(format, "firstpass", peopleInGroup, urlObj, idObj, groupContainerElement);
						this.displayPeople(format, "secondpass", peopleInGroup, urlObj, idObj, groupContainerElement);
					} else {
						this.displayPeople(format, "", peopleInGroup, urlObj, idObj, groupContainerElement);
					}
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
		// for(let index = 0; index < selectContainerElements.length; index++)
			// TODO: Construct dropdowns in form
		for(let index = 0; index < taxonomyElements.length; index++) {
			const taxonomyElement = taxonomyElements[index];
			taxonomyElement.innerText = PeopleListElement.getTaxonomyName(taxonomy, parseInt(taxonomyElement.dataset['termId'])) || '';
		}
	}

	buildListGroup(taxonomy) {
		const wrapper = document.createElement('section');
		if(taxonomy) {
			const groupTitleContainer = document.createElement('div'), groupTitleH2 = document.createElement('h2');
			groupTitleH2.className = 'taxonomy-' + taxonomy.fieldName;
			groupTitleH2.dataset['termId'] = taxonomy.id;
			groupTitleH2.innerText = taxonomy.name;
			groupTitleContainer.appendChild(groupTitleH2);
			wrapper.appendChild(groupTitleContainer);
		}
		this._contentElement.appendChild(wrapper);
		return wrapper;
	}

	buildGridGroup(taxonomy) {
		const wrapper = document.createElement('section');
		wrapper.className = 'row ucb-people-list-content';
		if(taxonomy) {
			const groupTitleContainer = document.createElement('div'), groupTitleH2 = document.createElement('h2');
			groupTitleContainer.className = 'col-12';
			groupTitleH2.className = 'taxonomy-' + taxonomy.fieldName;
			groupTitleH2.dataset['termId'] = taxonomy.id;
			groupTitleH2.innerText = taxonomy.name;
			groupTitleContainer.appendChild(groupTitleH2);
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
			groupTitleTh.className = 'ucb-people-list-group-title-th taxonomy-' + taxonomy.fieldName;
			groupTitleTh.setAttribute('colspan', '3');
			groupTitleTh.dataset['termId'] = taxonomy.id;
			groupTitleTh.innerText = taxonomy.name;
			groupTitleContainer.appendChild(groupTitleTh);
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
		if(!taxonomy)
			return people;
		if(!this._groupedPeople) {
			this._groupedPeople = new Map();
			people.forEach(person => {
				((person['relationships']['field_ucb_person_' + taxonomy.fieldName] || {})['data'] || []).forEach(
					termData => {
						const termId = termData['meta']['drupal_internal__target_id'];
						let termPeople = this._groupedPeople.get(termId);
						if(!termPeople) {
							termPeople = [];
							this._groupedPeople.set(termId, termPeople);
						}
						termPeople.push(person);
					});
			});
		}
		return this._groupedPeople.get(taxonomy.id);
	}

	displayPeople(format, ORDERBY, people, urlObj, idObj, containerElement) {
		// maps over data
		people.forEach((person) => {
			const personRelationshipData = person['relationships'],
				departmentsData = personRelationshipData['field_ucb_person_department']['data'],
				jobTypesData = personRelationshipData['field_ucb_person_department']['data'];
			
			// if first pass (sort by type first) then only render the people with a Job Type 
			// else if second pass (sort by type first) then only render the people without a Job Type
			if((ORDERBY === "firstpass" && !jobTypesData.length) || (ORDERBY === "secondpass" && jobTypesData.length))
				return;

			const personAttributeData = person['attributes'],
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
		// console.log('Rendering the card for ' + Person.Name)
		let cardElement, cardHTML = '';
		// grab the friendly name from the global variable
		// note: there may be a race condidtion here as we're also querying
		//  to get those friendly names from the API endpoint.
		// console.log('Departments :', Departments)
		let myDept = "";
		for(let i = 0; i < person.departments.length; i++) {
			const 
				thisDeptID = person.departments[i], 
				thisDeptName = PeopleListElement.getTaxonomyName(this._loadedTaxonomies['department'], thisDeptID);
			myDept += `<li>${PeopleListElement.escapeHTML(thisDeptName)}</li>`;
		}

		const
			personLink = person.link,
			personName = PeopleListElement.escapeHTML(person.name),
			personTitle = PeopleListElement.escapeHTML(person.title),
			personPhoto = person.photoURI ? `<img src="${person.photoURI}">` : '',
			personBody = PeopleListElement.escapeHTML(person.body),
			personEmail = PeopleListElement.escapeHTML(person.email),
			personPhone = PeopleListElement.escapeHTML(person.phone);
	
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
								<ul class="ucb-person-card-dept-ul">
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
								<ul class="ucb-person-card-dept-ul">
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
							<ul class="ucb-person-card-dept-ul">
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
/**
 * 
 * TO DO -
 * 
 * - Add functionality to re-filter list after user input
 * - Assign Filter 1,2,3 names
 * - Programatically assign options - (value and innerText)
 *
 */
  async generateDropdown(){
    if(this._userFormElement.children.length == 0){
      var config = JSON.parse(this.getAttribute('config'))
      // Create Elements
      var form = document.createElement('form')
      form.id = 'user-filter'
      form.addEventListener('submit',(event)=> {
        event.preventDefault()
        var formData = new FormData(document.forms['user-filter']);
        var dataObj = {}
        // Create a dataObject with ids for second render
        for (var p of formData) {
          dataObj[p[0]] = p[1]
        }
        var deptObj = JSON.parse(dataObj.editDepartment)
        var typeObj = JSON.parse(dataObj.editJobType)
        var filter1Obj = JSON.parse(dataObj.editFilterOne)
        var filter2Obj = JSON.parse(dataObj.editFilterTwo)
        var filter3Obj = JSON.parse(dataObj.editFilterThree)
        
        console.log('=====================')
        console.log('dropdown dept', deptObj)
        console.log('dropdown type', typeObj)
        console.log('filter 1 obj', filter1Obj)
        console.log('filter 2 obj', filter2Obj)
        console.log('filter 3 obj', filter3Obj)
  
        renderedTable = 0;  // flag to know if we've rendered the table header or not yet
        firstPassCount = 0;
         // TO DO -- fix build
        // this.build(deptObj, typeObj)

      })
      form.classList = 'people-list-filter'
      var formDiv = document.createElement('div')
      formDiv.classList = 'd-flex align-items-center'
  
      // If User-Filterable...
      // Departments, create filterable dropdown of Departments
      if(config.filters.department.userAccessible){
        var formItemDeptContainer = document.createElement('div')
        formItemDeptContainer.classList = 'form-item-department form-item'
    
        var formItemDeptLabel = document.createElement('label')
        formItemDeptLabel.htmlFor = "Edit Departments"
        formItemDeptLabel.innerText = 'Departments'
    
        var selectDept = document.createElement('select')
        selectDept.name = 'editDepartment'
        selectDept.id = 'edit-department'
        // Get departments and IDs and iterate over creating options
        const departments = await this.getTaxonomy('department')
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:"", name: "" }])
        allOption.innerText = 'All'
        selectDept.appendChild(allOption)
        departments.forEach(department=>{
          let option = document.createElement('option')
          option.value = JSON.stringify([{id:department.id, name: department.name}])
          option.innerText = department.name
          selectDept.appendChild(option)
        })
        // Append
        formItemDeptContainer.appendChild(formItemDeptLabel)
        formItemDeptContainer.appendChild(selectDept)
    
        formDiv.appendChild(formItemDeptContainer)
      }
  
      // Create filterable dropdown of Job Types
      if(config.filters.job_type.userAccessible){
        var formItemJobTypeContainer = document.createElement('div')
        formItemJobTypeContainer.classList = 'form-item-job-type form-item'
    
        var formItemJobTypeLabel = document.createElement('label')
        formItemJobTypeLabel.htmlFor = "Edit Job Types"
        formItemJobTypeLabel.innerText = 'Job Types'
    
        var selectJobType = document.createElement('select')
        selectJobType.name = 'editJobType'
        selectJobType.id = 'edit-job-types'
  
        const jobTypes = await this.getTaxonomy('ucb_person_job_type')
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: ""}])
        allOption.innerText = 'All'
        // Get ID's of departments
        selectJobType.appendChild(allOption)
        jobTypes.forEach(type=>{
          let option = document.createElement('option')
          option.value = JSON.stringify([{id:type.id, name: type.name}])
          option.innerText = type.name
          selectJobType.appendChild(option)
        })
    
        formItemJobTypeContainer.appendChild(formItemJobTypeLabel)
        formItemJobTypeContainer.appendChild(selectJobType)
    
        formDiv.appendChild(formItemJobTypeContainer)
      }
      // Create Filter 1
      if(config.filters.filter_1.userAccessible){
        var formItemFilter1Container = document.createElement('div')
        formItemFilter1Container.classList = 'form-item-filter-one form-item'
    
        var formItemFilter1Label = document.createElement('label')
        formItemFilter1Label.htmlFor = "Edit Filer 1"
        formItemFilter1Label.innerText = 'Filter 1'
    
        var selectFilter1 = document.createElement('select')
        selectFilter1.name = 'editFilterOne'
        selectFilter1.id = 'edit-filter-one'
  
  
        const filter1s = await this.getTaxonomy('filter_1')
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: ''}])
        allOption.innerText = 'All'
        // Get ID's of filter 1
        selectFilter1.appendChild(allOption)
        filter1s.forEach(type=>{
          let option = document.createElement('option')
          option.value = JSON.stringify([{id:type.id, name: type.name}])
          option.innerText = type.name
          selectFilter1.appendChild(option)
        })
        // Create options programmatically - TO DO
        // var option7 = document.createElement('option')
        // var option8 = document.createElement('option')
        // var option9 = document.createElement('option')
        
        // option7.value = '0'
        // option7.innerText = 'Example'
        // option8.value = '1'
        // option8.innerText = 'Example 2'
        // option9.value = '3'
        // option9.innerText = 'Example 3'
    
        // selectFilter1.appendChild(option7)
        // selectFilter1.appendChild(option8)
        // selectFilter1.appendChild(option9)
        
    
        formItemFilter1Container.appendChild(formItemFilter1Label)
        formItemFilter1Container.appendChild(selectFilter1)
    
        formDiv.appendChild(formItemFilter1Container)
      }
      // Create Filter 2
      if(config.filters.filter_2.userAccessible){
        var formItemFilter2Container = document.createElement('div')
        formItemFilter2Container.classList = 'form-item-filter-two form-item'
    
        var formItemFilter2Label = document.createElement('label')
        formItemFilter2Label.htmlFor = "Edit Filter 2"
        formItemFilter2Label.innerText = 'Filter 2'
    
        var selectFilter2 = document.createElement('select')
        selectFilter2.name = 'editFilterTwo'
        selectFilter2.id = 'edit-filter-two'
        // Create options programmatically - TO DO
        // var option10 = document.createElement('option')
        // var option11 = document.createElement('option')
        // var option12 = document.createElement('option')
        
        // option10.value = '0'
        // option10.innerText = 'Example'
        // option11.value = '1'
        // option11.innerText = 'Example 2'
        // option12.value = '3'
        // option12.innerText = 'Example 3'
    
        // selectFilter2.appendChild(option10)
        // selectFilter2.appendChild(option11)
        // selectFilter2.appendChild(option12)
  
        const filter2s = await this.getTaxonomy('filter_2')
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: ''}])
        allOption.innerText = 'All'
        // Get ID's of filter 1
        selectFilter2.appendChild(allOption)
        filter2s.forEach(type=>{
          let option = document.createElement('option')
          option.value = JSON.stringify([{id:type.id, name: type.name}])
          option.innerText = type.name
          selectFilter2.appendChild(option)
        })
    
        formItemFilter2Container.appendChild(formItemFilter2Label)
        formItemFilter2Container.appendChild(selectFilter2)
    
        formDiv.appendChild(formItemFilter2Container)
      }
      // Create Filter 3
      if(config.filters.filter_3.userAccessible){
        var formItemFilter3Container = document.createElement('div')
        formItemFilter3Container.classList = 'form-item-filter-three form-item'
    
        var formItemFilter3Label = document.createElement('label')
        formItemFilter3Label.htmlFor = "Edit Filter 3"
        formItemFilter3Label.innerText = 'Filter 3'
    
        var selectFilter3 = document.createElement('select')
        selectFilter3.name = 'editFilterThree'
        selectFilter3.id = 'edit-filter-three'
        // Create options programmatically - TO DO
        // var option13 = document.createElement('option')
        // var option14 = document.createElement('option')
        // var option15 = document.createElement('option')
        
        // option13.value = '0'
        // option13.innerText = 'Example'
        // option14.value = '1'
        // option14.innerText = 'Example 2'
        // option15.value = '3'
        // option15.innerText = 'Example 3'
    
        // selectFilter3.appendChild(option13)
        // selectFilter3.appendChild(option14)
        // selectFilter3.appendChild(option15)
  
        const filter3s = await this.getTaxonomy('filter_3')
        // All option as first entry
        var allOption = document.createElement('option')
        allOption.value = JSON.stringify([{id:'', name: ''}])
        allOption.innerText = 'All'
        // Get ID's of filter 3
        selectFilter3.appendChild(allOption)
        filter3s.forEach(type=>{
          let option = document.createElement('option')
          option.value = JSON.stringify([{id:type.id, name: type.name}])
          option.innerText = type.name
          selectFilter3.appendChild(option)
        })
    
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
   
  }
}

customElements.define('ucb-people-list', PeopleListElement);