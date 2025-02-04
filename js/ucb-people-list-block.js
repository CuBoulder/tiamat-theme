(function (customElements) {
  /**
   * The absolute URL of the default avatar image.
   * @type string
   */
  const defaultAvatarURL = drupalSettings.path.baseUrl + drupalSettings.themePath + '/images/avatar320.jpeg';

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
        if (!filterIncludes || !filterIncludes.length) return;
        let filterParams = '';
        filterIncludes.forEach(filterItem => {
          if (!filterItem) return;
          filterParams += '&filter[filter-' + filterName + '-' + filterItem + '][condition][path]=field_ucb_person_' + filterName + '.meta.drupal_internal__target_id'
            + '&filter[filter-' + filterName + '-' + filterItem + '][condition][value]=' + filterItem
            + '&filter[filter-' + filterName + '-' + filterItem + '][condition][memberOf]=' + filterName + '-include';
        });
        if (!filterParams) return;
        params += '&filter[' + filterName + '-include][group][conjunction]=OR'
          + filterParams
          + '&filter[' + filterName + '-include][group][memberOf]=include-group';
      });
      if (params)
        params = '&filter[include-group][group][conjunction]=AND'
          + '&filter[include-group][group][memberOf]=published'
          + params
      return endpoint + '?' + baseParams + publishedParams + params + sortParams;
    }
    // Gets all person data
    async fetchAllPeople(url, aggregatedData = [], aggregatedIncluded = []) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        // Warn if no results are returned in the 'data' section
        if (!data['data'] || data['data'].length === 0) {
          console.warn('PeopleListProvider: ' + PeopleListProvider.noResultsMessage);
          this.classList.add("ucb-block-error");
        } else {
          aggregatedData.push(...data['data']);
        }

        // Aggregate 'included' data if present
        if (data['included']) {
          aggregatedIncluded.push(...data['included']);
        }

        // Check if there is a 'next' link and make a recursive call
        if (data['links'] && data['links']['next'] && data['links']['next']['href']) {
          return this.fetchAllPeople(data['links']['next']['href'], aggregatedData, aggregatedIncluded);
        }

        return { data: aggregatedData, included: aggregatedIncluded };
      } catch (error) {
        console.error('PeopleListProvider: ' + PeopleListProvider.errorMessage);
        this.classList.add("ucb-block-error");
        throw error;
      }
    }
  }

  class PeopleListBlockElement extends HTMLElement {
    /**
     * @param {string|null|undefined} raw A raw string
     * @returns {string} An HTML-safe string (or an empty string if `raw` is `null` or `undefined`)
     */
    static escapeHTML(raw) { return raw ? raw.replace(/\&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }
    static get observedAttributes() { return ['user-config']; }
    /**
     * @param {string|null|undefined} text A raw body string
     * @returns {string} An HTML-safe body
     */
    static decodeHtmlEntities(text) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      return doc.documentElement.textContent;
    }

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
      loadingElement.innerHTML = '<i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';
      chromeElement.appendChild(userFormElement);
      chromeElement.appendChild(messageElement);
      chromeElement.appendChild(loadingElement);
      this.appendChild(chromeElement);
      this.appendChild(contentElement);
      const taxonomyIds = this._taxonomyIds = config['taxonomies'],
        filters = this._filters = config['filters'] || {},
        groupBy = this._groupBy = config['groupby'] || 'none',
        orderBy = this._orderBy = config['orderby'] || 'last',
        syncTaxonomies = this._syncTaxonomies = new Set(orderBy == 'type' ? ['job_type'] : []),
        asyncTaxonomies = this._asyncTaxonomies = new Set(['department']),
        userAccessibleFilters = this._userAccessibleFilters = {};
      if (groupBy != 'none' && taxonomyIds[groupBy]) { // The taxonomy used for groups must be fetched sync
        syncTaxonomies.add(groupBy);
        asyncTaxonomies.delete(groupBy);
      } else this._groupBy = 'none';
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
      if (this._syncTaxonomiesLoaded < this._syncTaxonomies.size) {
        Array.from(this._syncTaxonomies).forEach(taxonomyFieldName => {
          if (!this.taxonomyHasLoaded(taxonomyFieldName)) {
            this.fetchTaxonomy(this._taxonomyIds[taxonomyFieldName], taxonomyFieldName).then(taxonomy => {
              if (!this.taxonomyHasLoaded(taxonomyFieldName)) {
                this.onTaxonomyLoaded(taxonomyFieldName, taxonomy);
                this._syncTaxonomiesLoaded++;
                if (this._syncTaxonomiesLoaded >= this._syncTaxonomies.size) // Enter build method
                  this.build();
              }
            }).catch(reason => this.onFatalError(reason));
          }
        });
      } else this.build();
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (name == 'user-config' && oldValue !== null && this._syncTaxonomiesLoaded >= this._syncTaxonomies.size)
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
        orderBy = this._orderBy,
        userFilters = userConfig['filters'] || {},
        peopleListProvider = this._peopleListProvider = new PeopleListProvider(baseURI, filters, userFilters),
        format = this._format = userConfig['format'] || config['format'] || 'list';
      this.toggleMessageDisplay(this._messageElement, 'none', null, null);
      this.toggleMessageDisplay(this._loadingElement, 'block', null, null);

      let groupBy = userConfig['groupby'] || config['groupby'] || 'none';
      if (groupBy != 'none' && !this._taxonomyIds[groupBy]) // Group by is invalid!
        groupBy = 'none';
      // User-specified grouping is working as a feature to add in the future
      if (groupBy != this._groupBy && !this.taxonomyHasLoaded(groupBy)) {
        this._groupBy = groupBy;
        this._syncTaxonomies.add(groupBy);
        this.loadSyncTaxonomies();
        return;
      }
      this._groupBy = groupBy;

      // Get our people
      peopleListProvider.fetchAllPeople(baseURI + peopleListProvider.nextPath).then(response => {
        this._contentElement.innerText = '';
        const results = response['data'];
        if (!results.length){
          this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-end-of-results', PeopleListProvider.noResultsMessage);
          this.classList.add("ucb-block-error");
        } else {
          if (groupBy != 'none') { // Build person -> term mapping
            const groupedPeople = this._groupedPeople = new Map();
            results.forEach(person => {
              ((person['relationships']['field_ucb_person_' + groupBy] || {})['data'] || []).forEach(
                termData => {
                  const termId = termData['meta']['drupal_internal__target_id'];
                  let termPeople = groupedPeople.get(termId);
                  if (!termPeople) {
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
              if (pair['links']['focal_image_square'])
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
            if (!peopleInGroup) return;
            const groupContainerElement = this.buildGroup(format, taxonomyTerm);
            if (orderBy == 'type') {
              this.displayPeople(format, peopleInGroup.sort((personA, personB) => {
                const
                  jobTypeTaxonomy = this.getTaxonomy('job_type'),
                  personAJobTypeData = personA['relationships']['field_ucb_person_job_type']['data'],
                  personBJobTypeData = personB['relationships']['field_ucb_person_job_type']['data'],
                  personAJobTypeDataLength = personAJobTypeData.length,
                  personBJobTypeDataLength = personBJobTypeData.length;
                if (!personAJobTypeDataLength || !personBJobTypeDataLength) // Someone doesn't have a job type (length 0), push them to the bottom
                  return !personAJobTypeDataLength && personBJobTypeDataLength ? 1 : personAJobTypeDataLength && !personBJobTypeDataLength ? -1 : 0;
                const
                  personAJobTypeWeight = PeopleListBlockElement.getTaxonomyWeight(jobTypeTaxonomy, personAJobTypeData[0]['meta']['drupal_internal__target_id']),
                  personBJobTypeWeight = PeopleListBlockElement.getTaxonomyWeight(jobTypeTaxonomy, personBJobTypeData[0]['meta']['drupal_internal__target_id']);
                // Sorts by job type weights.
                return personAJobTypeWeight > personBJobTypeWeight ? 1 : personAJobTypeWeight < personBJobTypeWeight ? -1 : 0;
              }), urlObj, idObj, groupContainerElement);
            } else this.displayPeople(format, peopleInGroup, urlObj, idObj, groupContainerElement);
          });
        }
        this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
      }).catch(reason => this.onFatalError(reason));
    }

    // Getter function for Departments and Job Types
    async fetchTaxonomy(
      taxonomyId,
      taxonomyFieldName,
      url = null,
      aggregatedTerms = []
    ) {
      try {
        const fetchUrl =
          url ||
          `${this._baseURI}/taxonomy_term/${taxonomyId}?sort=weight,name`;
        const response = await fetch(fetchUrl);
        const data = await response.json();
        const results = data["data"];

        const terms = results.map((termResult) => {
          const id = termResult["attributes"]["drupal_internal__tid"];
          const name = termResult["attributes"]["name"];
          const weight = termResult["attributes"]["weight"];
          return { id, name, weight, fieldName: taxonomyFieldName };
        });

        aggregatedTerms.push(...terms);
        // Recursive calls for >50 Terms
        if (
          data["links"] &&
          data["links"]["next"] &&
          data["links"]["next"]["href"]
        ) {
          return this.fetchTaxonomy(
            taxonomyId,
            taxonomyFieldName,
            data["links"]["next"]["href"],
            aggregatedTerms
          );
        }

        return aggregatedTerms;
      } catch (error) {
        console.error("Error fetching taxonomy:", error);
        return aggregatedTerms;
      }
    }

    static getTaxonomyName(taxonomy, termId) {
      if (!termId) return
      return taxonomy.find( ({ id }) => id === termId ).name;
    }

    static getTaxonomyWeight(taxonomy, termId) {
      if (!termId) return
      return taxonomy.find(({ id }) => id === termId).weight;
    }

    onTaxonomyLoaded(taxonomyFieldName, taxonomy) {
      this._loadedTaxonomies[taxonomyFieldName] = taxonomy;
      const showContainerElements = this.getElementsByClassName('taxonomy-visible-' + taxonomyFieldName),
        hideContainerElements = this.getElementsByClassName('taxonomy-hidden-' + taxonomyFieldName),
        selectContainerElements = this.getElementsByClassName('taxonomy-select-' + taxonomyFieldName),
        taxonomyElements = this.getElementsByClassName('taxonomy-' + taxonomyFieldName);
      for (let index = 0; index < showContainerElements.length; index++)
        showContainerElements[index].removeAttribute('hidden');
      for (let index = 0; index < hideContainerElements.length; index++)
        showContainerElements[index].setAttribute('hidden', '');
      for (let index = 0; index < selectContainerElements.length; index++)
        this.generateDropdown(taxonomy, taxonomyFieldName, selectContainerElements[index]);
      for (let index = 0; index < taxonomyElements.length; index++) {
        const taxonomyElement = taxonomyElements[index];
        taxonomyElement.innerText = PeopleListBlockElement.getTaxonomyName(taxonomy, parseInt(taxonomyElement.dataset['termId'])) || '';
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
      if (element.className)
        element.className += ' ' + taxonomyClass;
      else element.className = taxonomyClass;
      element.dataset['termId'] = taxonomyTerm.id;
      element.innerText = taxonomyTerm.name;
      return element;
    }

    buildListGroup(taxonomyTerm) {
      const wrapper = document.createElement('section');
      if (taxonomyTerm) {
        const groupTitleContainer = document.createElement('div');
        groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(document.createElement('h2'), taxonomyTerm));
        wrapper.appendChild(groupTitleContainer);
      }
      this._contentElement.appendChild(wrapper);
      return wrapper;
    }
    buildNameGroup(taxonomyTerm) {
      const wrapper = document.createElement('section');
      if (taxonomyTerm) {
        const groupTitleContainer = document.createElement('div');
        groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(document.createElement('h2'), taxonomyTerm));
        wrapper.appendChild(groupTitleContainer);
      }
      this._contentElement.appendChild(wrapper);
      return wrapper;
    }

    buildThumbnailGroup(taxonomyTerm) {
      const wrapper = document.createElement('section');
      if (taxonomyTerm) {
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
      if (taxonomyTerm) {
        const groupTitleContainer = document.createElement('div');
        groupTitleContainer.className = 'col-12';
        groupTitleContainer.appendChild(this.attachElementToTaxonomyTerm(document.createElement('h2'), taxonomyTerm));
        wrapper.appendChild(groupTitleContainer);
      }
      this._contentElement.appendChild(wrapper);
      return wrapper;
    }

    buildGroup(format, taxonomyTerm) {
      switch (format) {
        case 'list': default: return this.buildListGroup(taxonomyTerm);
        case 'grid': return this.buildGridGroup(taxonomyTerm);
        case 'name-thumbnail': return this.buildThumbnailGroup(taxonomyTerm);
        case 'name-only': return this.buildNameGroup(taxonomyTerm);
      }
    }

    getPeopleInGroup(people, taxonomyTerm) {
      return taxonomyTerm && this._groupedPeople ? this._groupedPeople.get(taxonomyTerm.id) : people;
    }

    displayPeople(format, people, urlObj, idObj, containerElement) {
      // If grid render and no thumbnail, use a default image for the person. Else no image.
      const defaultThumbnail = format == 'grid' ? defaultAvatarURL : '';

      people.forEach((person) => {
        const personRelationshipData = person['relationships'],
          departmentsData = personRelationshipData['field_ucb_person_department']['data'],
          jobTypesData = personRelationshipData['field_ucb_person_department']['data'],
          personAttributeData = person['attributes'],
          departments = [],
          jobTypes = [],
          photoId = (personRelationshipData['field_ucb_person_photo']['data'] || {})['id'] || '';

          // Special case for if media image was removed
        const isPhotoMissing = photoId === 'missing';
        const photoExists = photoId && !isPhotoMissing;

        const thisPerson = {
          link: (personAttributeData['path'] || {})['alias'] || `/node/${personAttributeData['drupal_internal__nid']}`,
          name: personAttributeData['title'],
          titles: personAttributeData['field_ucb_person_title'],
          departments: departments,
          jobTypes: jobTypes,
          photoId: photoId,
          photoURI: photoExists ? urlObj[idObj[photoId]] : defaultThumbnail,
          body: '',
          email: personAttributeData['field_ucb_person_email'],
          phone: personAttributeData['field_ucb_person_phone'],
          primaryLinkURI: '',
          primaryLinkTitle: ''
        };


        // Builds arrays of department and job type ids
        departmentsData.forEach(departmentData => departments.push(departmentData['meta']['drupal_internal__target_id']));
        jobTypesData.forEach(jobTypeData => jobTypes.push(jobTypeData['meta']['drupal_internal__target_id']));
        // needed to verify if primary link exists on page
        if (personAttributeData['field_ucb_person_primary_link']) {
          thisPerson.primaryLinkURI =  personAttributeData['field_ucb_person_primary_link']['uri'];
          thisPerson.primaryLinkTitle = personAttributeData['field_ucb_person_primary_link']['title'];
        }
        // This makes relative internal urls absolute, needed for multisite with single domain
        if (thisPerson.primaryLinkURI.startsWith('internal:/')) {
          thisPerson.primaryLinkURI = this.getAttribute('site-base') + thisPerson.primaryLinkURI.replace('internal:/', '/');
        }
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
              if (trimmedString.length > 70){
                trimmedString = trimmedString.substr(
                  0,
                  Math.min(
                    trimmedString.length,
                    trimmedString.lastIndexOf(" ")
                  )
                );

                thisPerson.body = `${trimmedString}...`;
              } else {
                thisPerson.body = trimmedString;
              }
            }
        }

        this.appendPerson(format, thisPerson, containerElement);
      });
    }

    appendPerson(format, person, containerElement) {
      let cardElement, cardHTML = '', personTitleList = '', personDepartmentList = '';
      const
        personLink = this.getAttribute('site-base') + person.link,
        personName = PeopleListBlockElement.escapeHTML(person.name),
        personPhoto = person.photoURI ? '<img src="' + person.photoURI + '">' : '',
        personBody = PeopleListBlockElement.decodeHtmlEntities(person.body),
        personEmail = PeopleListBlockElement.escapeHTML(person.email),
        personPhone = PeopleListBlockElement.escapeHTML(person.phone),
        personPrimaryLinkURI = PeopleListBlockElement.escapeHTML(person.primaryLinkURI),
        personPrimaryLinkTitle = PeopleListBlockElement.escapeHTML(person.primaryLinkTitle),
        departmentTaxonomy = this.getTaxonomy('department');
      person.titles.forEach(title => {
        personTitleList += (personTitleList ? ' &bull; ' : '') + PeopleListBlockElement.escapeHTML(title);
      });
      person.departments.forEach(termId => {
        const department = departmentTaxonomy ? PeopleListBlockElement.escapeHTML(PeopleListBlockElement.getTaxonomyName(departmentTaxonomy, termId)) : '';
        personDepartmentList +=  (personDepartmentList ? ' &bull; ' : '') + '<span class="taxonomy-department" data-term-id="' + termId + '">' + department + '</span>';
      });
      if (personDepartmentList)
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
                    ${
                      personEmail ?
                        `<span class="ucb-person-card-links ucb-person-card-email">
                          <i class="fa-solid fa-envelope iconColor"></i>
                          <a href="mailto:${personEmail}">
                            <span class="ucb-people-list-contact">  ${personEmail}</span>
                          </a>
                        </span>`
                      : ''
                    }
                    ${
                      personPhone ?
                        `<span class="ucb-person-card-links ucb-person-card-phone">
                          <i class="fa-solid fa-phone iconColor"></i>
                          <a href="tel:${personPhone.replace(/[^+\d]+/g, '',)}">
                            <span class="ucb-people-list-contact">  ${personPhone}</span>
                          </a>
                        </span>`
                      : ''
                    }
                    ${
                      personPrimaryLinkURI ?
                        `<span class="ucb-person-card-links ucb-person-card-primary-link">
                        <i class="` + this.generateLinkIcon(personPrimaryLinkURI) + `"></i>
                        <a href="${personPrimaryLinkURI}">
                          <span class="ucb-people-list-contact">  ${personPrimaryLinkTitle}</span>
                        </a>
                        </span>
                        `
                      : ''
                    }
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
                    <h2>${personName ? personName : ''}</h2>
                  </span>
                </a>
                <span class="ucb-person-card-title title-grid">
                  ${personTitleList}
                </span>
                <span class="ucb-person-card-dept departments-grid">
                  ${personDepartmentList}
                </span>
              </div>
            </div>`;
        break;
        case 'name-thumbnail':
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
                </div>
              </div>
            </div>`;
        break;
        case 'name-only':
          cardElement = document.createElement('div');
          cardHTML = `
            <div class="ucb-person-card-list row">
              <div class="col-sm-12 col-md-9 ucb-person-card-details">
                <a href="${personLink}">
                  <span class="ucb-person-card-name">
                    <h2>${personName}</h2>
                  </span>
                </a>
                </div>
              </div>
            </div>`;
        break;
      }
      cardElement.innerHTML = cardHTML;
      containerElement.appendChild(cardElement);
      return cardElement;
    }

    onFatalError(reason) {
      this.classList.add("ucb-block-error");
      this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-error', PeopleListProvider.errorMessage);
      this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
      throw reason;
    }

    toggleMessageDisplay(element, display, className, innerText) {
      if (className)
        element.className = className;
      if (innerText)
        element.innerText = innerText;
      if (display === 'none')
        element.setAttribute('hidden', '');
      else element.removeAttribute('hidden');
    }
    generateLinkIcon(linkURI) {
      var linkIcon = "fa-solid fa-link primaryLinkIcon";

      try {
        const url = new URL(linkURI);
        const domainParts = url.hostname.toLowerCase().split('.');
        const domain = domainParts.length > 1 ? domainParts[domainParts.length - 2] : url.hostname;

        switch (domain.toUpperCase()) {
          case 'FACEBOOK':
            linkIcon = "fa-brands fa-facebook primaryLinkIcon";
            break;
          case 'TWITTER':
            linkIcon = "fa-brands fa-x-twitter primaryLinkIcon";
            break;
          case 'FLICKR':
            linkIcon = "fa-brands fa-flickr primaryLinkIcon";
            break;
          case 'LINKEDIN':
            linkIcon = "fa-brands fa-linkedin primaryLinkIcon";
            break;
          case 'YOUTUBE':
            linkIcon = "fa-brands fa-youtube primaryLinkIcon";
            break;
          case 'INSTAGRAM':
            linkIcon = "fa-brands fa-instagram primaryLinkIcon";
            break;
          case 'DISCORD':
            linkIcon = "fa-brands fa-discord primaryLinkIcon";
            break;
          case 'PINTEREST':
            linkIcon = "fa-brands fa-pinterest-p primaryLinkIcon";
            break;
          case 'VIMEO':
            linkIcon = "fa-brands fa-vimeo-v primaryLinkIcon";
            break;
          case 'WORDPRESS':
            linkIcon = "fa-brands fa-wordpress-simple primaryLinkIcon";
            break;
          case 'TIKTOK':
            linkIcon = "fa-brands fa-tiktok primaryLinkIcon";
            break;
          case 'REDDIT':
            linkIcon = "fa-brands fa-reddit-alien primaryLinkIcon";
            break;
          case 'PATREON':
            linkIcon = "fa-brands fa-patreon primaryLinkIcon";
            break;
          default:
            linkIcon = "fa-solid fa-link primaryLinkIcon";
        }
      } catch (e) {
        console.error(`Error processing URL ${linkURI}:`, e);
      }

      return linkIcon;
    }
  }

  customElements.define('people-list-block', PeopleListBlockElement);
})(window.customElements);
