// /* naughty global variables!!! */
let renderedTable = 0;  // flag to know if we've rendered the table header or not yet
let firstPassCount = 0; // count for the first pass per group.  

class PeopleListProvider {
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
				console.log("No people matching the filter returned.");
			return data;
		} catch (reason) {
			console.error("Error retrieving people from the API endpoint.  Please try again later.");
			throw reason;
		}
	}
}

class PeopleListElement extends HTMLElement {
	constructor() {
		super();
		this._baseURI = this.getAttribute('base-uri');
		this.taxonomiesLoaded = 0;
		this.departments = [];
		this.jobTypes = [];
		// Pre build logic
		// Fetch all available Departments and Job Types then enter the build stage
		this.getTaxonomy('department').then(departments => {
			this.departments = departments;
			this.taxonomiesLoaded++;
			if(this.taxonomiesLoaded == 2) // Enter build method
				this.build(this.departments, this.jobTypes);
		}).catch(reason => this.fatalError(reason));
		this.getTaxonomy('ucb_person_job_type').then(jobs => {
			this.jobTypes = jobs;
			this.taxonomiesLoaded++;
			if(this.taxonomiesLoaded == 2) // Enter build method
				this.build(this.departments, this.jobTypes);
		}).catch(reason => this.fatalError(reason));
	}

	static get observedAttributes() { return ['user-config']; }
	attributeChangedCallback(name, oldValue, newValue) {
		if(name == 'user-config' && this.taxonomiesLoaded == 2)
			this.build(this.departments, this.jobTypes);
	}

	build(Departments, JobTypes) {
		let userConfig = {}, config = {};
		try {
			userConfig = JSON.parse(this.getAttribute('user-config'));
			config = JSON.parse(this.getAttribute('config'));
		} catch(e) {}
		const
			baseURI = this._baseURI,
			peopleListProvider = this._peopleListProvider = new PeopleListProvider(baseURI, userConfig, config),
			FORMAT = userConfig['format'] || config['format'] || 'list',
			GROUPBY = userConfig['groupby'] || config['groupby'] || 'none',
			ORDERBY = userConfig['orderby'] || config['orderby'] || 'type';
    
		this.toggleMessage('ucb-loading-data', 'block');
		// Get our people
		peopleListProvider.fetchPeople().then(response => {
			const ourPeople = response;
			if(ourPeople['data'].length == 0){
				this.toggleMessage('ucb-end-of-results', 'block');
			} else {
				if (GROUPBY == 'department') {
					for (const [key] of Object.entries(Departments)) {
						// let thisDeptID = Departments[key].id
						// let thisDeptName = getTaxonomyName(Departments, thisDeptID);
						// console.log("Group by Dept : " + thisDeptID)
						// console.log("Group by Dept : " + thisDeptName.name)
						if(ORDERBY == "type") {
							firstPassCount = 0; 
							this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "firstpass", ourPeople, Departments, JobTypes);
							this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "secondpass", ourPeople, Departments, JobTypes);
						} else {
							this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "", ourPeople, Departments, JobTypes);
						}
					}
				} else if (GROUPBY == 'type') {
					for (const [key] of Object.entries(JobTypes)) {
						let thisTypeID = JobTypes[key].id
						// let thisTypeName = this.getTaxonomyName(JobTypes, thisTypeID) 
						// console.log("Group by Type : " + thisTypeID)
						// console.log("Group by Name : " + thisTypeName.name)
						if(ORDERBY == "type") {
							firstPassCount = 0; 
							this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "firstpass", ourPeople, Departments, JobTypes);
							this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "secondpass", ourPeople, Departments, JobTypes);
						} else {
							this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "", ourPeople, Departments, JobTypes);
						}
					}
				} else {
					if(ORDERBY == "type") {
						firstPassCount = 0; 
						this.displayPeople(FORMAT, "", "", "firstpass", ourPeople, Departments, JobTypes);
						this.displayPeople(FORMAT, "", "", "secondpass", ourPeople, Departments, JobTypes);
					} else {
						this.displayPeople(FORMAT, "", "", "", ourPeople, Departments, JobTypes);
					}
				}
			}
			this.toggleMessage('ucb-loading-data');
		}).catch(reason => this.fatalError(reason));
	}

	// Getter function for Departments and Job Types
	async getTaxonomy(taxonomyName) {
		const
			response = await fetch(this._baseURI + '/taxonomy_term/' + taxonomyName + '?sort=weight,name'),
			data = await response.json(),
			results = data['data'],
			terms = [];
		results.map(termResult => {
			const
				id = termResult['attributes']['drupal_internal__tid'],
				name = termResult['attributes']['name'];
			terms.push({ id: id, name: name });
		});
		return terms;
	}

	fatalError(reason) {
		this.toggleMessage('ucb-error', 'block');
		this.toggleMessage('ucb-loading-data');
		throw reason;
	}

  displayPeople(DISPLAYFORMAT, GROUPBY, groupID, ORDERBY, ourPeople, Departments, JobTypes) {
    let renderThisGroup = 0; 
    let el = this
    let thisDeptName = ""
    let thisTypeName = ""
    if(GROUPBY === "department") {
      thisDeptName = this.getTaxonomyName(Departments, groupID).name
    } else if(GROUPBY === "type") {
      thisTypeName = this.getTaxonomyName(JobTypes, groupID).name
    }
    // el.classList = 'container'
    // let headerHTML = layoutHeader(DISPLAYFORMAT)
    // let footerHTML = layoutFooter(DISPLAYFORMAT)
    let parentContainer = this.getParentContainer(DISPLAYFORMAT)
  
    // TO DO -- issue here with header adding correctly to grid
    if (DISPLAYFORMAT === 'grid' || DISPLAYFORMAT === 'table') {
      el.appendChild(parentContainer)
    }
  
    // if this is our second pass on rendering content we don't need a group-by title 
    // we also don't some of the opening DOM elements before the card info.  
    if(ORDERBY === "secondpass" && firstPassCount) {
      renderThisGroup++;
    }
  
    // fetch(JSONURL)
    //   .then((response) => response.json())
    //   .then((data) => {
    //     console.log(data) // our data obj
    if (Object.keys(ourPeople) != 0) {
      // get all of the include images id => url
      let urlObj = {} // key from data.data to key from data.includes
      let idObj = {} // key from data.includes to URL
      // Remove any blanks from our articles before map
      if (ourPeople.included) {
        let filteredData = ourPeople.included.filter((url) => {
          return url.attributes.uri !== undefined
        })
        // creates the urlObj, key: data id, value: url
        filteredData.map((pair) => {
          // checks if consumer is working, else default to standard image instead of focal image
          if(pair.links.focal_image_square != undefined){
            urlObj[pair.id] = pair.links.focal_image_square.href
          } else {
            urlObj[pair.id] = pair.attributes.uri.url
          }
        })
  
        // removes all other included data besides images in our included media
        let idFilterData = ourPeople.included.filter((item) => {
          return item.type == 'media--image'
        })
        // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
        idFilterData.map((pair) => {
          idObj[pair.id] = pair.relationships.thumbnail.data.id
        })
      }
  
      // maps over data
      ourPeople.data.map((person) => {
        // get the person data we need
        let renderMe = true;
        let thisPerson = {}
        let thisPersonCard = '' // placeholder for the HTML to render this card in the required format
        thisPerson['Name'] = person.attributes.title
        thisPerson['Title'] = person.attributes.field_ucb_person_title[0]
        thisPerson['Dept'] = []
        for(let i = 0; i < person.relationships.field_ucb_person_department.data.length; i++) {
          thisPerson['Dept'].push(
            person.relationships.field_ucb_person_department.data[i].meta.drupal_internal__target_id
          );
        } 
        thisPerson['Jobtype'] = []
        for(let i = 0; i < person.relationships.field_ucb_person_job_type.data.length; i++) {
          thisPerson['Jobtype'].push(
            person.relationships.field_ucb_person_job_type.data[i].meta.drupal_internal__target_id
          );
        }
        if(!person.relationships.field_ucb_person_photo.data){
          thisPerson['PhotoID']= ""
        } else {
          thisPerson['PhotoID'] =
            person.relationships.field_ucb_person_photo.data.id
        }
        thisPerson['PhotoURL'] = ''
        thisPerson['Email'] = person.attributes.field_ucb_person_email
        thisPerson['Phone'] = person.attributes.field_ucb_person_phone
        thisPerson['Link'] = `/node/${person.attributes.drupal_internal__nid}`
        // needed to verify body exists on the Person page, if so, use that
        if (person.attributes.body) {
          var myBody = person.attributes.body.processed
          myBody.replace(/<\/?[^>]+(>|$)/g, '') // strip out HTML characters
          myBody.replace(/(\r\n|\n|\r)/gm, '') // strip out line breaks
          thisPerson['Body'] = myBody
        } else {
          // if no body, set to empty
          thisPerson['Body'] = ''
        }
        if (thisPerson.PhotoID) {
          thisPerson['PhotoURL'] = urlObj[idObj[thisPerson.PhotoID]]
          // console.log('Am I an image URL? : ' + thisPerson.PhotoURL)
        }
  
        // if first pass (sort by type first) then only render the people with a Job Type 
        // else if second pass (sort by type first) then only render the people without a Job Type
        if(ORDERBY === "firstpass" && !thisPerson['Jobtype'].length) {
          renderMe = false;
        } else if(ORDERBY === "secondpass" && thisPerson['Jobtype'].length) {
          renderMe = false;
        }
  
        // check to see if this person needs to be rendered 
        if(renderMe) {
  
  
        // check to see if we need to filter based on a group by seeting
        // and if so that this person matches our groupID
        if ((!GROUPBY || !groupID) || (thisPerson['Dept'].find(deptid => deptid == groupID) || thisPerson['Jobtype'].find(typeid => typeid == groupID))) {
          //console.log( "I'm a match! " + groupID + ' = ' + thisPerson['Dept'] + ' or ' + thisPerson['Jobtype'],)
  
          // increment flags for rendering in this group as necessary
          renderThisGroup++; 
          if(ORDERBY === "firstpass") {
            firstPassCount++;
          }
          // console.log("my display format is", DISPLAYFORMAT)
          thisPersonCard = this.displayPersonCard(DISPLAYFORMAT, thisPerson, Departments)
  
          let thisCard
          // Needed to switch types of container for individual person cards => article for grid & list displays, tr for table display
          if (DISPLAYFORMAT === 'table') {
            thisCard = document.createElement('tr')
          } else {
            thisCard = document.createElement('article')
          }
  
          thisCard.innerHTML = thisPersonCard
  
          // This section apprends the generated cards for each respective display type
          if (DISPLAYFORMAT === 'list') {
            // check to see if this is the first time we're adding in a member of this group
            // if so, add the name of the group first 
            if(renderThisGroup === 1 && groupID) {
              // we may be on a second pass and have already rendered the title in the first pass
              // if so, skip the title so we don't end up with two 
              // console.log("First Pass Count is : " + firstPassCount)
              // console.log("Render pass is : " + ORDERBY)
              if((ORDERBY === "secondpass" && !firstPassCount) || ORDERBY != "secondpass") {
                let GroupTitle = document.createElement('div');
                GroupTitle.innerHTML = ` 
                  <h2>${GROUPBY == 'type' ? thisTypeName : thisDeptName}</h2>`
                el.appendChild(GroupTitle);
              }
            }

            el.appendChild(thisCard)
          } else if (DISPLAYFORMAT === 'grid') {
  
            // check to see if this is the first time we're adding in a member of this group
            // if so, add the name of the group first 
            if(renderThisGroup === 1 && groupID) {
              // we may be on a second pass and have already rendered the title in the first pass
              // if so, skip the title so we don't end up with two 
              if((ORDERBY === "secondpass" && !firstPassCount) || ORDERBY != "secondpass") {
                let GroupTitle = document.createElement('div');
                GroupTitle.classList = "col-12";
                GroupTitle.innerHTML = `<h2>${GROUPBY == 'type' ? thisTypeName : thisDeptName}</h2>`
                parentContainer.appendChild(GroupTitle)
              }
            }
  
            thisCard.classList = 'col-sm-12 col-md-6 col-lg-4'
            thisCard.innerHTML = thisPersonCard
            parentContainer.appendChild(thisCard)
          } else {
            // if table display, append to inner tablebody instead of parent element
            let tablebody = this.getElementsByClassName(
              'ucb-people-list-table-tablebody',
            )[0]

            // let tablebody = this.getElementById('ucb-people-list-table-tablebody')
  
            // check to see if this is the first time we're adding in a member of this group
            // if so, add the name of the group first 
            if(renderThisGroup === 1 && groupID) { 
              // we may be on a second pass and have already rendered the title in the first pass
              // if so, skip the title so we don't end up with two 
              if((ORDERBY === "secondpass" && !firstPassCount) || ORDERBY != "secondpass") {
                let GroupTitle = document.createElement('tr');
                let GroupTitleHTML = `
                  <th colspan="3" class="ucb-people-list-group-title-th">
                  ${GROUPBY == 'type' ? thisTypeName : thisDeptName}
                  </th>
                  `
                GroupTitle.innerHTML = GroupTitleHTML;
                // console.log('table body', tablebody)
                tablebody.appendChild(GroupTitle);
              }
            }
            // console.log('table body', tablebody)
            
            tablebody.appendChild(thisCard)
          }
        } else {
          // console.log( 'Not a match! ' + groupID + ' != ' + thisPerson['Dept'] + ' or ' + thisPerson['Jobtype'],);
        }
      }
      })
    } else {
      console.log('empty staff object, no people to render ', ourPeople)
      this.toggleMessage('ucb-end-of-results', 'block')
    }
    // done with cards, clean up and close any HTML tags we have opened.
    // el.append(footerHTML)
  this.generateDropdown()
    // console.log(el.dataset.json)
  }
  getParentContainer(Format) // flag to know if we've rendered the table header or not yet
   {
    // console.log("my format is", Format)
    let container = null;
    switch (Format) {
      case 'list':
        break
      case 'grid':
        container = document.createElement('div');
        container.classList = "row ucb-people-list-content";
        break
      case 'table':
        // we only need to render the table header the first time
        // this function will be called multiple times so check to 
        // see if we've already rendered the table header HTML
        if(!renderedTable) {
        let pageBody = this
        container = document.createElement('table')
        container.id = 'ucb-pl-table'
        container.classList = 'table  table-bordered table-striped'
        var tableHead = document.createElement('thead')
        tableHead.classList = 'ucb-people-list-table-head'
        var tableRow = document.createElement('tr')
        tableRow.innerHTML = `
              <th><span class="sr-only">Photo</span></th>
              <th>Name</th>
              <th>Contact Information</th>
        `
        var tableBody = document.createElement('tbody')
        tableBody.classList = 'ucb-people-list-table-tablebody'

        tableHead.appendChild(tableRow)
        container.appendChild(tableHead)
        container.appendChild(tableBody)
        pageBody.appendChild(container)
        
        }else {
          container = this
        }
        renderedTable++; 
        break
      default:
    }
    return container
  }
  displayPersonCard(Format, Person, Departments) {
    // console.log('Rendering the card for ' + Person.Name)
    let cardHTML = ''
    // grab the friendly name from the global variable
    // note: there may be a race condidtion here as we're also querying
    //  to get those friendly names from the API endpoint.
    // console.log('Departments :', Departments)
    let myDept = ""
    for(let i = 0; i < Person.Dept.length; i++) {
      let thisDeptID = Person.Dept[i]
      let thisDeptName = this.getTaxonomyName(Departments, thisDeptID).name;
      myDept += `<li>${thisDeptName}</li>`
    }
    let myPhoto = ''
    if (Person.PhotoURL) {
      myPhoto = `<img src="${Person.PhotoURL}"  />`
    }
  
    switch (Format) {
      case 'list':
        cardHTML = `
                  <div class="ucb-person-card-list row">
                      <div class="col-sm-12 col-md-3 ucb-person-card-img">
                          <a href="${Person.Link}">${myPhoto}</a>
                      </div>
                      <div class="col-sm-12 col-md-9 ucb-person-card-details">
                          <a href="${Person.Link}">
                              <span class="ucb-person-card-name">
                                  ${Person.Name ? Person.Name : ''}
                              </span>
                          </a>
                          <span class="ucb-person-card-title">
                              ${Person.Title ? Person.Title : ''}
                          </span>
                      <span class="ucb-person-card-dept">
                        <ul class="ucb-person-card-dept-ul">
                          ${myDept} 
                        </ul>
                      </span>
                      <span class="ucb-person-card-body">
                          ${Person.Body ? Person.Body : ''}
                      </span>
                      <div class="ucb-person-card-contact">
                          <span class="ucb-person-card-email">
                              ${
                                Person.Email
                                  ? `<a href="mailto:${Person.Email}"><span class="ucb-people-list-contact">  ${Person.Email}</span></a>`
                                  : ''
                              }
                          </span>
                          <span class="ucb-person-card-phone">
                              ${
                                Person.Phone
                                  ? `<a href="tel:${Person.Phone.replace(
                                      /[^+\d]+/g,
                                      '',
                                    )}"><p><span class="ucb-people-list-contact">  ${
                                      Person.Phone
                                    }</span></p></a>`
                                  : ''
                              }
                          </span>
                      </div>
                      </div>
                  </div>
              `
        break
      case 'grid':
        cardHTML = `
                  <div class="col-sm mb-3">
                      <div class="col-sm-12 ucb-person-card-img-grid">
                          <a href="${Person.Link}">${myPhoto}</a>
                      </div>
                  <div>
                  <a href="${Person.Link}">
                              <span class="ucb-person-card-name">
                                  ${Person.Name ? Person.Name : ''}
                              </span>
                          </a>
                  <span class="ucb-person-card-title departments-grid">
                    ${Person.Title ? Person.Title : ''}
                  </span>
                  <span class="ucb-person-card-dept departments-grid">
                    <ul class="ucb-person-card-dept-ul">
                     ${myDept}
                    </ul>
                   </span>
                  </div>
                  </div>
          `
        break
      case 'table':
        cardHTML = `
  
                    <td class="ucb-people-list-table-photo">
                      <a href="${Person.Link}">${myPhoto}</a>  
                    </td>
                    <td>
                      <a href="${Person.Link}">
                        <span class="ucb-person-card-name">
                          ${Person.Name ? Person.Name : ''}
                        </span>
                      </a>
                      <span class="ucb-person-card-title departments-grid">
                    ${Person.Title ? Person.Title : ''}
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
                                Person.Email
                                  ? `<a href="mailto:${Person.Email}"><span class="ucb-people-list-contact"> ${Person.Email}</span></p></a>`
                                  : ''
                              }
                          </span>
                          <span class="ucb-person-card-phone">
                              ${
                                Person.Phone
                                  ? `<a href="tel:${Person.Phone.replace(
                                      /[^+\d]+/g,
                                      '',
                                    )}"><p>
                                      <span class="ucb-people-list-contact"> 
                                    ${Person.Phone}</span></p></a>`
                                  : ''
                              }
                          </span>
                    </td>
  
          `
        break
      default:
    }
    return cardHTML
  }
  getTaxonomyName(taxonomy, tid) {
  // console.log(taxonomy)
    return taxonomy.find( ({ id }) => id === tid );
  }
  toggleMessage(id, display = 'none') {
  if (id) {
    var toggle = this.parentElement.children[1].getElementsByClassName(id)[0]
    if (toggle) {
      if (display === 'block') {
        toggle.style.display = 'block'
      } else {
        toggle.style.display = 'none'
      }
    }
  }
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
  generateDropdown(){
    // Create Elements
    var form = document.createElement('form')
    form.classList = 'people-list-filter'
    var formDiv = document.createElement('div')
    formDiv.classList = 'd-flex align-items-center'

    // If User-Filterable...
    // Departments, create filterable dropdown of Departments
    if(this.getAttribute('allowUserDeptFilters')==='True'){
      var formItemDeptContainer = document.createElement('div')
      formItemDeptContainer.classList = 'form-item-department form-item'
  
      var formItemDeptLabel = document.createElement('label')
      formItemDeptLabel.htmlFor = "Edit Departments"
      formItemDeptLabel.innerText = 'Departments'
  
      var selectDept = document.createElement('select')
      selectDept.id = 'edit-department'
      // Create options programmatically - TO DO
      var option4 = document.createElement('option')
      var option5 = document.createElement('option')
      var option6 = document.createElement('option')
      
      option4.value = '0'
      option4.innerText = 'Example 4'
      option5.value = '1'
      option5.innerText = 'Example 5'
      option6.value = '3'
      option6.innerText = 'Example 6'
  
      selectDept.appendChild(option4)
      selectDept.appendChild(option5)
      selectDept.appendChild(option6)
  
      formItemDeptContainer.appendChild(formItemDeptLabel)
      formItemDeptContainer.appendChild(selectDept)
  
      formDiv.appendChild(formItemDeptContainer)
    }

    // Create filterable dropdown of Job Types
    if(this.getAttribute('allowUserJobTypeFilters')==='True'){
      var formItemJobTypeContainer = document.createElement('div')
      formItemJobTypeContainer.classList = 'form-item-job-type form-item'
  
      var formItemJobTypeLabel = document.createElement('label')
      formItemJobTypeLabel.htmlFor = "Edit Job Types"
      formItemJobTypeLabel.innerText = 'Job Types'
  
      var selectJobType = document.createElement('select')
      selectJobType.id = 'edit-job-types'
      // Create options programmatically - TO DO
      var option1 = document.createElement('option')
      var option2 = document.createElement('option')
      var option3 = document.createElement('option')
      
      option1.value = '0'
      option1.innerText = 'Example'
      option2.value = '1'
      option2.innerText = 'Example 2'
      option3.value = '3'
      option3.innerText = 'Example 3'
  
      selectJobType.appendChild(option1)
      selectJobType.appendChild(option2)
      selectJobType.appendChild(option3)
  
      formItemJobTypeContainer.appendChild(formItemJobTypeLabel)
      formItemJobTypeContainer.appendChild(selectJobType)
  
      formDiv.appendChild(formItemJobTypeContainer)
    }
    // Create Filter 1
    if(this.getAttribute('allowUserFilter1')==='True'){
      var formItemFilter1Container = document.createElement('div')
      formItemFilter1Container.classList = 'form-item-filter-one form-item'
  
      var formItemFilter1Label = document.createElement('label')
      formItemFilter1Label.htmlFor = "Edit Filer 1"
      formItemFilter1Label.innerText = 'Filter 1'
  
      var selectFilter1 = document.createElement('select')
      selectFilter1.id = 'edit-filter-one'
      // Create options programmatically - TO DO
      var option7 = document.createElement('option')
      var option8 = document.createElement('option')
      var option9 = document.createElement('option')
      
      option7.value = '0'
      option7.innerText = 'Example'
      option8.value = '1'
      option8.innerText = 'Example 2'
      option9.value = '3'
      option9.innerText = 'Example 3'
  
      selectFilter1.appendChild(option7)
      selectFilter1.appendChild(option8)
      selectFilter1.appendChild(option9)
  
      formItemFilter1Container.appendChild(formItemFilter1Label)
      formItemFilter1Container.appendChild(selectFilter1)
  
      formDiv.appendChild(formItemFilter1Container)
    }
    // Create Filter 2
    if(this.getAttribute('allowUserFilter2')==='True'){
      var formItemFilter2Container = document.createElement('div')
      formItemFilter2Container.classList = 'form-item-filter-two form-item'
  
      var formItemFilter2Label = document.createElement('label')
      formItemFilter2Label.htmlFor = "Edit Filter 2"
      formItemFilter2Label.innerText = 'Filter 2'
  
      var selectFilter2 = document.createElement('select')
      selectFilter2.id = 'edit-filter-two'
      // Create options programmatically - TO DO
      var option10 = document.createElement('option')
      var option11 = document.createElement('option')
      var option12 = document.createElement('option')
      
      option10.value = '0'
      option10.innerText = 'Example'
      option11.value = '1'
      option11.innerText = 'Example 2'
      option12.value = '3'
      option12.innerText = 'Example 3'
  
      selectFilter2.appendChild(option10)
      selectFilter2.appendChild(option11)
      selectFilter2.appendChild(option12)
  
      formItemFilter2Container.appendChild(formItemFilter2Label)
      formItemFilter2Container.appendChild(selectFilter2)
  
      formDiv.appendChild(formItemFilter2Container)
    }
    // Create Filter 3
    if(this.getAttribute('allowUserFilter3')==='True'){
      var formItemFilter3Container = document.createElement('div')
      formItemFilter3Container.classList = 'form-item-filter-three form-item'
  
      var formItemFilter3Label = document.createElement('label')
      formItemFilter3Label.htmlFor = "Edit Filter 3"
      formItemFilter3Label.innerText = 'Filter 3'
  
      var selectFilter3 = document.createElement('select')
      selectFilter3.id = 'edit-filter-three'
      // Create options programmatically - TO DO
      var option13 = document.createElement('option')
      var option14 = document.createElement('option')
      var option15 = document.createElement('option')
      
      option13.value = '0'
      option13.innerText = 'Example'
      option14.value = '1'
      option14.innerText = 'Example 2'
      option15.value = '3'
      option15.innerText = 'Example 3'
  
      selectFilter3.appendChild(option13)
      selectFilter3.appendChild(option14)
      selectFilter3.appendChild(option15)
  
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
    this.parentElement.insertBefore(form, this.parentElement.children[2])
  }
}

customElements.define('ucb-people-list', PeopleListElement);