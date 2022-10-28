
// /* naughty global variables!!! */
let Departments = {} // translate table for department id => department name
let JobTypes = {} // translate table for type id => type name
let ourPepole = {} // all of the pepole that match our filter 
let renderedTable = 0;  // flag to know if we've rendered the table header or not yet
let firstPassCount = 0; // count for the first pass per group.  

class PeopleListElement extends HTMLElement {
	constructor() {
		super();
    // Pre build logic
    // Fetch all available Departments and Job Types then enter the build stage
    this.getTaxonomy('department').then(departments=>{
      // console.log('I am logging departments',departments)
      Departments=departments
      this.getTaxonomy('ucb_person_job_type').then(jobs=>{
        // console.log("these are my jobs", jobs)
        JobTypes=jobs
        // Enter build method
        this.build(Departments,JobTypes)
      })
    })
	}

	build(Departments, JobTypes) {
    var JSONAPI = this.getAttribute("JSON")
    var FORMAT = this.getAttribute("format")
    var GROUPBY = this.getAttribute("groupby")
    var ORDERBY = this.getAttribute("orderby")

    var ourPeople = {} // all of the pepole that match our filter 
     // count for the first pass per group.  

    this.toggleMessage('ucb-al-loading','block')

    //Get our people
    this.getStaff(JSONAPI).then(response=>{
      ourPeople = response;

      if (GROUPBY == 'department') {
        for (const [key] of Object.entries(Departments)) {
          // let thisDeptID = Departments[key].id
          // let thisDeptName = getTaxonomyName(Departments, thisDeptID);
          // console.log("Group by Dept : " + thisDeptID)
          // console.log("Group by Dept : " + thisDeptName.name)

          if(ORDERBY === "type") {
            // console.log('i match type')
            firstPassCount = 0; 
            this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "firstpass", ourPeople, Departments)
            this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "secondpass", ourPeople, Departments)
          }else {
            this.displayPeople(FORMAT, GROUPBY, Departments[key].id, "", ourPeople, Departments)
          }
        }
      } else if (GROUPBY == 'type') {
        for (const [key] of Object.entries(JobTypes)) {
          let thisTypeID = JobTypes[key].id
          let thisTypeName = this.getTaxonomyName(JobTypes, thisTypeID) 
          // console.log("Group by Type : " + thisTypeID)
          // console.log("Group by Name : " + thisTypeName.name)
          if(ORDERBY === "type") {
            firstPassCount = 0; 
            this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "firstpass", ourPeople, Departments)
            this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "secondpass", ourPeople, Departments)
          }else {
            this.displayPeople(FORMAT, GROUPBY, JobTypes[key].id, "", ourPeople, Departments)
          }
        }
      } else {
        if(ORDERBY === "type") {
          firstPassCount = 0; 
          this.displayPeople(FORMAT, "", "", "firstpass", ourPeople, Departments)
          this.displayPeople(FORMAT, "", "", "secondpass", ourPeople, Departments)
        }else {
          this.displayPeople(FORMAT, "", "", "", ourPeople, Departments)
        }
      }
    })
  }

  // Getter function for Departments and Job Types
  getTaxonomy(taxonomyName) {
    return new Promise(function (resolve, reject) {
      if (taxonomyName) {
        let result = [] 
        let taxonomyURL = `/jsonapi/taxonomy_term/${taxonomyName}?sort=weight,name`
  
        fetch(taxonomyURL)
          .then((response) => response.json())
          .then((data) => {
            // console.log("Taxonomy Object : ", data)
            data.data.map((attributes) => {
              let id = attributes.attributes.drupal_internal__tid
              let name = attributes.attributes.name
              let thisTerm = {}
  
              thisTerm['id'] = id
              thisTerm['name'] = name
              result.push(thisTerm) 
            })
  
            resolve(result)
          })
      } else {
        // no taxonomy term to load
        reject
      }
    })
  }
  // Gets person data
  getStaff(JSONAPI) {
    return new Promise(function (resolve, reject) {
      if (JSONAPI) {
        fetch(JSONAPI)
          .then((response) => response.json())
          .then((data) => {
            if(data.data.length === 0) {
              console.log("No people matching the filter returned.")
              this.toggleMessage('ucb-al-end-of-data', 'block')
            }
            resolve(data)
          })
      } else {
        this.toggleMessage('ucb-al-error', 'block')
        reject
      }
    })
  }

  displayPeople(DISPLAYFORMAT, GROUPBY, groupID, ORDERBY, ourPeople, Departments) {
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
        thisPerson['PhotoID'] =
          person.relationships.field_ucb_person_photo.data.id
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
          if (DISPLAYFORMAT === 'Table') {
            thisCard = document.createElement('tr')
          } else {
            thisCard = document.createElement('article')
          }
  
          thisCard.innerHTML = thisPersonCard
  
          // This section apprends the generated cards for each respective display type
          if (DISPLAYFORMAT === 'List') {
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
            this.toggleMessage('ucb-al-loading')

            el.appendChild(thisCard)
          } else if (DISPLAYFORMAT === 'Grid') {
  
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
            this.toggleMessage('ucb-al-loading')
            parentContainer.appendChild(thisCard)
          } else {
            // if table display, append to inner tablebody instead of parent element
            let tablebody = document.getElementById(
              'ucb-people-list-table-tablebody',
            )
  
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
      console.log('empty staff object, no people to render ', ourPepole)
      this.toggleMessage('ucb-al-end-of-data', 'block')
    }
    // done with cards, clean up and close any HTML tags we have opened.
    // el.append(footerHTML)
  
    // console.log(el.dataset.json)
  }
  getParentContainer(Format) // flag to know if we've rendered the table header or not yet
   {
    // console.log("my format is", Format)
    let container = ''
    switch (Format) {
      case 'List':
        break
      case 'Grid':
        container = this
        container.classList = "row ucb-people-list-content"
        break
      case 'Table':
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
        tableBody.id = 'ucb-people-list-table-tablebody'
        this.toggleMessage('ucb-al-loading')

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
      case 'List':
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
      case 'Grid':
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
      case 'Table':
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
    var toggle = document.getElementById(id)

    if (toggle) {
      if (display === 'block') {
        toggle.style.display = 'block'
      } else {
        toggle.style.display = 'none'
      }
    }
  }
  }
}

customElements.define('ucb-people-list', PeopleListElement);