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
    async fetchAllPeople(url, aggregatedData = [], aggregatedIncluded = []) {
      try {
        const response = await fetch(url);
        const data = await response.json();

        // Warn if no results are returned in the 'data' section
        if (!data['data'] || data['data'].length === 0) {
          console.warn('PeopleListProvider: ' + PeopleListProvider.noResultsMessage);
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
        throw error;
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
      } catch (e) { }
      this._baseURI = this.getAttribute('base-uri');
      const
        chromeElement = this._chromeElement = document.createElement('div'),
        contentWrapperElement = this._contentWrapperElement = document.createElement('div'),
        contentElement = this._contentElement = document.createElement('div'),
        userFormElement = this._userFormElement = document.createElement('div'),
        messageElement = this._messageElement = document.createElement('div'),
        loadingElement = this._loadingElement = document.createElement('div');
      messageElement.className = 'ucb-list-msg';
      messageElement.setAttribute('hidden', '');
      loadingElement.className = 'ucb-loading-data';
      loadingElement.innerHTML = '<span class="visually-hidden">Loading</span><i aria-hidden="true" class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';
      chromeElement.appendChild(userFormElement);
      contentWrapperElement.appendChild(messageElement);
      contentWrapperElement.appendChild(contentElement);
      chromeElement.appendChild(loadingElement);
      this.appendChild(chromeElement);
      this.appendChild(contentWrapperElement);
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
      // If no filters are visitor accessible, skip the form entirely
      let formRenderBool = false; // running check
      for (const filterName in filters) { // If user filter dropdowns are necessary, they can be generated async
        const filter = filters[filterName];
        filter['includes'] = filter['includes'].filter(include => !!include);
        if (filter['userAccessible']) {
          userAccessibleFilters[filterName] = filter;
          if (!syncTaxonomies.has(filterName))
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
      } catch (e) { }

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

      // Check if grouping is requested and the taxonomy data is available to do this.
      if (groupBy != 'none') {
        const taxonomyData = this.getTaxonomy(groupBy);
        if (!taxonomyData || taxonomyData.length === 0) {
          // Taxonomy data required for grouping is missing, can't group by!
          console.error(`Grouping by ${groupBy} is requested, but taxonomy data is missing. Please adjust your page's 'Group By' setting or make sure taxonomy data exists for that term.`);
          this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-error', `Cannot group by ${groupBy} because taxonomy data is missing.`);
          this._messageElement.classList.add('ucb-block-error')
          this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
          return;
        }
      }

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
          this._messageElement.classList.add('ucb-block-error')
        } else {
          if (groupBy != 'none') { // Build person -> term mapping
            const groupedPeople = this._groupedPeople = new Map();
            let hasGroupingTaxonomy = false;
            results.forEach(person => {
              const groupingData = (person['relationships']['field_ucb_person_' + groupBy] || {})['data'];
              if (groupingData && groupingData.length) {
                hasGroupingTaxonomy = true;
              }

              ((person['relationships']['field_ucb_person_' + groupBy] || {})['data'] || []).forEach(termData => {
                const termId = termData['meta']['drupal_internal__target_id'];
                // If there are filters applied to the current groupBy field (e.g., job_type), apply them so unwanted groups don't show up
                if (!this._filters[groupBy] || this._filters[groupBy].includes.length === 0 || this._filters[groupBy].includes.map(Number).includes(termId)) {
                  let termPeople = groupedPeople.get(termId);
                  if (!termPeople) {
                    termPeople = [];
                    groupedPeople.set(termId, termPeople);
                  }
                  termPeople.push(person);
                }
              });
            });
            if (!hasGroupingTaxonomy) {
              this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg', `No results found for the '${groupBy}' grouping.`);
              this._messageElement.classList.add('ucb-block-error');
              this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
              return;
            }
          }
          // get all of the include images id => url
          const photoUrls = {}; // key from data.data to key from data.includes
          const photoData = {}; // key from data.includes to URL
          // Remove any blanks from our articles before map
          if (response['included']) {
            const filteredData = response['included'].filter(url => !!url['attributes']['uri']);
            // creates the photoUrls, key: data id, value: url
            filteredData.map((pair) => {
              // checks if consumer is working, else default to standard image instead of focal image
              if (pair['links']['focal_image_square'])
                photoUrls[pair['id']] = pair['links']['focal_image_square']['href'];
              else
                photoUrls[pair['id']] = pair['attributes']['uri']['url'];
            });
            // removes all other included data besides images in our included media
            const idFilterData = response['included'].filter(item => item['type'] == 'media--image');
            // using the image-only data, creates the photoData => key: thumbnail id, value : data
            idFilterData.map(pair => photoData[pair['id']] = pair['relationships']['thumbnail']['data']);
          }
          (groupBy == 'none' ? [null] : this.getTaxonomy(groupBy) || [null]).forEach(taxonomyTerm => {
            const peopleInGroup = this.getPeopleInGroup(results, taxonomyTerm);
            if (!peopleInGroup) return;
            const groupContainerElement = this.buildGroup(format, taxonomyTerm);
            if (orderBy == 'type') {
              this.displayPeople(format, peopleInGroup.sort((personA, personB) => {
                const
                  jobTypeTaxonomy = this.getTaxonomy('job_type'),
                  personAJobTypeData = personA['relationships']['field_ucb_person_job_type']['data'] || [],
                  personBJobTypeData = personB['relationships']['field_ucb_person_job_type']['data'] || [];

                // Handle cases where one or both people have no job type
                if (!personAJobTypeData.length || !personBJobTypeData.length) {
                  return personAJobTypeData.length ? -1 : 1; // Push people without job type to the bottom
                }

                // Get job type weights
                const personAJobTypeWeight = PeopleListElement.getTaxonomyWeight(jobTypeTaxonomy, personAJobTypeData[0]['meta']['drupal_internal__target_id']);
                const personBJobTypeWeight = PeopleListElement.getTaxonomyWeight(jobTypeTaxonomy, personBJobTypeData[0]['meta']['drupal_internal__target_id']);

                // Primary sort: By Job Type Weight (lower weight = higher priority)
                if (personAJobTypeWeight !== personBJobTypeWeight) {
                  return personAJobTypeWeight - personBJobTypeWeight;
                }

                // Get job type names
                const personAJobTypeName = PeopleListElement.getTaxonomyName(jobTypeTaxonomy, personAJobTypeData[0]['meta']['drupal_internal__target_id']) || '';
                const personBJobTypeName = PeopleListElement.getTaxonomyName(jobTypeTaxonomy, personBJobTypeData[0]['meta']['drupal_internal__target_id']) || '';

                // Secondary sort: Alphabetical by Job Type Name
                if (personAJobTypeName !== personBJobTypeName) {
                  return personAJobTypeName < personBJobTypeName ? -1 : 1;
                }

                // Tertiary sort: Alphabetical by Last Name
                const lastNameA = (personA['attributes']['field_ucb_person_last_name'] || '').toLowerCase();
                const lastNameB = (personB['attributes']['field_ucb_person_last_name'] || '').toLowerCase();
                if (lastNameA !== lastNameB) {
                  return lastNameA < lastNameB ? -1 : 1;
                }

                // Final sort: Alphabetical by First Name (optional)
                const firstNameA = (personA['attributes']['field_ucb_person_first_name'] || '').toLowerCase();
                const firstNameB = (personB['attributes']['field_ucb_person_first_name'] || '').toLowerCase();
                return firstNameA < firstNameB ? -1 : firstNameA > firstNameB ? 1 : 0;
              }), photoUrls, photoData, groupContainerElement);
            }
             else {
              this.displayPeople(format, peopleInGroup.sort((personA, personB) => {
                const lastNameA = personA['attributes']['field_ucb_person_last_name'] || '';
                const lastNameB = personB['attributes']['field_ucb_person_last_name'] || '';
                const firstNameA = personA['attributes']['field_ucb_person_first_name'] || '';
                const firstNameB = personB['attributes']['field_ucb_person_first_name'] || '';

                if (lastNameA.toLowerCase() < lastNameB.toLowerCase()) return -1;
                if (lastNameA.toLowerCase() > lastNameB.toLowerCase()) return 1;

                // If last names are the same, sort by first name
                if (firstNameA.toLowerCase() < firstNameB.toLowerCase()) return -1;
                if (firstNameA.toLowerCase() > firstNameB.toLowerCase()) return 1;

                return 0; // If both are the same
              }), photoUrls, photoData, groupContainerElement);
            }
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
      return taxonomy.find(({ id }) => id === termId).name;
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

    buildTableGroup(taxonomyTerm) {
      let table = this._contentElement.querySelector('table'), tableBody;
      // we only need to render the table header the first time
      // this function will be called multiple times so check to
      // see if we've already rendered the table header HTML
      if (!table) {
        table = document.createElement('table');
        table.classList = 'table table-bordered table-striped';
        const tableHead = document.createElement('thead');
        tableHead.classList = 'ucb-people-list-table-head';
        const tableRow = document.createElement('tr');
        tableRow.innerHTML = '<th aria-hidden="true"></th><th>Name</th><th>Contact Information</th>';
        tableBody = document.createElement('tbody');
        tableBody.className = 'ucb-people-list-table-tablebody';
        tableHead.appendChild(tableRow);
        table.appendChild(tableHead);
        table.appendChild(tableBody);
        this._contentElement.appendChild(table);
      }
      tableBody = tableBody || table.querySelector('tbody.ucb-people-list-table-tablebody');
      if (taxonomyTerm) {
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

    displayPeople(format, people, photoUrls, photoData, containerElement) {
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
          photoUrl: photoExists ? photoUrls[photoData[photoId]['id']] : defaultThumbnail,
          photoAlt: photoExists ? photoData[photoId]['meta']['alt'] : 'This person has no photo',
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
          thisPerson.primaryLinkURI = personAttributeData['field_ucb_person_primary_link']['uri'];
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
          else {
            let htmlStrip = personAttributeData['body']['value'].replace(/<\/?[^>]+(>|$)/g, "");
            // Remove any line breaks if media is embedded in the body
            let lineBreakStrip = htmlStrip.replace(/(\r\n|\n|\r)/gm, "");
            // take only the first 100 words ~ 500 chars
            let trimmedString = lineBreakStrip.substr(0, 400);
            // if in the middle of the string, take the whole word
            if (trimmedString.length > 70) {
              trimmedString = trimmedString.substr(
                0,
                Math.min(
                  trimmedString.length,
                  trimmedString.lastIndexOf(" ")
                )
              )
              thisPerson.body = `${trimmedString}...`; // shortened
            } else {
              thisPerson.body = trimmedString; // not shortened
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
        personName = PeopleListElement.escapeHTML(person.name),
        personPhoto = person.photoUrl ? '<img src="' + person.photoUrl + '" alt="' + PeopleListElement.escapeHTML(person.photoAlt) + '">' : '',
        personBody = PeopleListElement.decodeHtmlEntities(person.body),
        personEmail = PeopleListElement.escapeHTML(person.email),
        personPhone = PeopleListElement.escapeHTML(person.phone),
        personPrimaryLinkURI = PeopleListElement.escapeHTML(person.primaryLinkURI),
        personPrimaryLinkTitle = PeopleListElement.escapeHTML(person.primaryLinkTitle),
        departmentTaxonomy = this.getTaxonomy('department');
      person.titles.forEach(title => {
        personTitleList += (personTitleList ? ' &bull; ' : '') + PeopleListElement.escapeHTML(title);
      });
      person.departments.forEach(termId => {
        const department = departmentTaxonomy ? PeopleListElement.escapeHTML(PeopleListElement.getTaxonomyName(departmentTaxonomy, termId)) : '';
        personDepartmentList += (personDepartmentList ? ' &bull; ' : '') + '<span class="taxonomy-department" data-term-id="' + termId + '">' + department + '</span>';
      });
      if (personDepartmentList)
        personDepartmentList = '<span' + (departmentTaxonomy ? '' : ' hidden') + ' class="taxonomy-visible-department">' + personDepartmentList + '</span>';
      switch (format) {
        case 'list': default:
          cardElement = document.createElement('div');
          cardHTML = `
            <div class="ucb-person-card-list row">
              ${
                personPhoto
                  ? `
                <div aria-hidden="true" class="col-sm-12 col-md-3 ucb-person-card-img">
                  <a href="${personLink}">${personPhoto}</a>
                </div>`
                  : ""
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
                    personEmail
                      ? `
                    <span class="ucb-person-card-links ucb-person-card-email">
                      <i class="fa-solid fa-envelope iconColor"></i>
                      <a href="mailto:${personEmail}">
                        <span class="ucb-people-list-contact">${personEmail}</span>
                      </a>
                    </span>`
                      : ""
                  }
                  ${
                    personPhone
                      ? `
                    <span class="ucb-person-card-links ucb-person-card-phone">
                      <i class="fa-solid fa-phone iconColor"></i>
                      <a href="tel:${personPhone.replace(/[^+\d]+/g, "")}">
                        <span class="ucb-people-list-contact">${personPhone}</span>
                      </a>
                    </span>`
                      : ""
                  }
                  ${
                    personPrimaryLinkURI
                      ? `
                    <span class="ucb-person-card-links ucb-person-card-primary-link">
                      <i class="${this.generateLinkIcon(
                        personPrimaryLinkURI
                      )}"></i>
                      <a href="${personPrimaryLinkURI}">
                        <span class="ucb-people-list-contact">${personPrimaryLinkTitle}</span>
                      </a>
                    </span>`
                      : ""
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
              <div aria-hidden="true" class="col-sm-12 ucb-person-card-img-grid">
                <a href="${personLink}">${personPhoto}</a>
              </div>
              <div>
                <a href="${personLink}">
                  <span class="ucb-person-card-name">
                    <h2>${personName}</h2>
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
        case 'table':
          cardElement = document.createElement('tr');
          cardHTML = `
            <td aria-hidden="true" class="ucb-people-list-table-photo">
              <a href="${personLink}">${personPhoto}</a>
            </td>
            <td>
              <a href="${personLink}">
                <span class="ucb-person-card-name">
                  ${personName}
                </span>
              </a>
              <span class="ucb-person-card-title person-title-table">
                ${personTitleList}
              </span>
              <span class="ucb-person-card-dept person-dept-table">
                ${personDepartmentList}
              </span>
            </td>
            <td>
              <div class="ucb-person-card-contact-table">
                ${
                  personEmail
                    ? `
                  <span class="ucb-person-card-links ucb-person-card-email">
                    <i class="fa-solid fa-envelope iconColor"></i>
                    <a href="mailto:${personEmail}">
                      <span aria-hidden="true" class="ucb-people-list-contact">Email</span>
                      <span class="visually-hidden">Email ${personName} at ${personEmail}</span>
                    </a>
                  </span>`
                    : ""
                }
                ${
                  personPhone
                    ? `
                  <span class="ucb-person-card-links ucb-person-card-phone">
                    <i class="fa-solid fa-phone iconColor"></i>
                    <a href="tel:${personPhone.replace(/[^+\d]+/g, "")}">
                      <span class="ucb-people-list-contact">${personPhone}</span>
                    </a>
                  </span>`
                    : ""
                }
                ${
                  personPrimaryLinkURI
                    ? `
                  <span class="ucb-person-card-links ucb-person-card-primary-link">
                    <i class="${this.generateLinkIcon(
                      personPrimaryLinkURI
                    )}"></i>
                    <a href="${personPrimaryLinkURI}">
                      <span class="ucb-people-list-contact">${personPrimaryLinkTitle}</span>
                    </a>
                  </span>`
                    : ""
                }
              </div>
            </td>`;
      }
      cardElement.innerHTML = cardHTML;
      containerElement.appendChild(cardElement);
      return cardElement;
    }

    onFatalError(reason) {
      this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-error', PeopleListProvider.errorMessage);
      this._messageElement.classList.add('ucb-block-error');
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

    generateForm() {
      const userAccessibleFilters = this._userAccessibleFilters;
      // Create Elements
      const form = document.createElement('form'), formDiv = document.createElement('div'),
        resetButtonContainerElement = document.createElement('div'), resetButtonElement = document.createElement('button'), // Creates the reset button (see https://github.com/CuBoulder/tiamat-theme/issues/312)
        onChange = form => {
          const formItemsData = new FormData(form),
            userSettings = {};
          // Create a dataObject with ids for second render
          for (const formItemData of formItemsData) {
            const filterName = formItemData[0], filterInclude = formItemData[1];
            if (filterInclude != '-1')
              userSettings[filterName] = { 'includes': [filterInclude] };
          }
          this._contentWrapperElement.setAttribute('aria-live', 'polite');
          this.setAttribute('user-config', JSON.stringify({ 'filters': userSettings }));
          // Shows or hides the reset button when a non-default is selected anywhere
          let showReset = false;
          const selectElements = form.getElementsByTagName('select');
          for (let index = 0; index < selectElements.length; index++) {
            const selectElement = selectElements[index], options = selectElement.options;
            if (options.length > 1 && !options[selectElement.selectedIndex].classList.contains('taxonomy-option-default')) {
              showReset = true;
              break;
            }
          }
          if (showReset) resetButtonContainerElement.removeAttribute('hidden');
          else resetButtonContainerElement.setAttribute('hidden', '');
        };
      form.className = 'people-list-filter';
      formDiv.className = 'd-flex align-items-center';

      // If User-Filterable...Create Dropdowns
      for (const key in userAccessibleFilters) {
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
        selectFilter.onchange = event => onChange(event.target.form);

        if (filter['includes'].length != 1) {
          // All option as first entry
          const defaultOption = document.createElement('option');
          defaultOption.value = '-1';
          defaultOption.innerText = 'All';
          defaultOption.className = 'taxonomy-option-all taxonomy-option-default';
          if (!filter['restrict'] && filter['includes'].length > 1) {
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

      // Enables the reset button
      resetButtonContainerElement.className = 'form-item reset-button-form-item';
      resetButtonContainerElement.setAttribute('hidden', ''); // Hides the reset button by default
      resetButtonElement.className = 'reset-button';
      resetButtonElement.innerText = 'Reset';
      resetButtonElement.onclick = event => { // Resets all <select> elements to the default option, if there is one
        event.preventDefault();
        const selectElements = form.getElementsByTagName('select');
        for (let index = 0; index < selectElements.length; index++) {
          const selectElement = selectElements[index],
            defaultOption = selectElement.querySelector('.taxonomy-option-default');
          if (defaultOption)
            defaultOption.selected = true;
        }
        onChange(form);
      };
      resetButtonContainerElement.appendChild(resetButtonElement);
      formDiv.appendChild(resetButtonContainerElement);

      // Appends child elements to match the schema:
      // <form class="people-list-filter">
      //  <div> { items } </div>
      // </form>
      form.appendChild(formDiv);
      this._userFormElement.appendChild(form);
    }

    generateDropdown(taxonomy, taxonomyFieldName, selectElement) {
      if (taxonomy.length === 0) return;
      const
        filters = this._filters,
        taxonomyConfig = filters[taxonomyFieldName],
        taxonomiesIncluded = taxonomyConfig['includes'].map(Number), // The data type for taxonomyTerm.id is Number, the includes may be strings
        restrict = taxonomyConfig['restrict'] && taxonomiesIncluded.length > 0;
      taxonomy.forEach(taxonomyTerm => {
        if (restrict && taxonomiesIncluded.indexOf(taxonomyTerm.id) === -1) return; // Rejects a restricted option
        const option = document.createElement('option');
        option.value = taxonomyTerm.id;
        option.innerText = taxonomyTerm.name;
        option.selected = taxonomiesIncluded.length === 1 && taxonomiesIncluded[0] == taxonomyTerm.id;
        selectElement.appendChild(option);
      });
      if (!restrict && taxonomy.length > 1 && taxonomy.length === taxonomiesIncluded.length) { // Removes the "Default" option if all the taxonomy terms are included
        const defaultOption = selectElement.querySelector('.taxonomy-option-default'),
          allOption = selectElement.querySelector('.taxonomy-option-all');
        if (selectElement.options[selectElement.selectedIndex] == defaultOption)
          allOption.selected = true;
        selectElement.removeChild(defaultOption);
        allOption.classList.add('taxonomy-option-default');
      }
    }
    generateLinkIcon(linkURI) {
      let linkIcon = 'fa-solid fa-link';

      try {
        const hostname = new URL(linkURI).hostname;
        if (hostname.match(/facebook\\.com$/i)) {
          linkIcon = 'fa-brands fa-facebook';
        } else if (hostname.match(/instagram\\.com$/i)) {
          linkIcon = 'fa-brands fa-instagram';
        } else if (hostname.match(/linkedin\\.com$/i)) {
          linkIcon = 'fa-brands fa-linkedin';
        } else if (hostname.match(/youtube\\.com$/i)) {
          linkIcon = 'fa-brands fa-youtube';
        } else if (hostname.match(/(pinterest\\.com|pin\\.it)$/i)) {
          linkIcon = 'fa-brands fa-pinterest-p';
        } else if (hostname.match(/(flickr\\.com|flic\\.kr)$/i)) {
          linkIcon = 'fa-brands fa-flickr';
        } else if (hostname.match(/vimeo\\.com$/i)) {
          linkIcon = 'fa-brands fa-vimeo-v';
        } else if (hostname.match(/wordpress\\.com$/i)) {
          linkIcon = 'fa-brands fa-wordpress-simple';
        } else if (hostname.match(/tiktok\\.com$/i)) {
          linkIcon = 'fa-brands fa-tiktok';
        } else if (hostname.match(/reddit\\.com$/i)) {
          linkIcon = 'fa-brands fa-reddit-alien';
        } else if (hostname.match(/patreon\\.com$/i)) {
          linkIcon = 'fa-brands fa-patreon';
        } else if (hostname.match(/discord\\.(com|gg)$/i)) {
          linkIcon = 'fa-brands fa-discord';
        } else if (hostname.match(/(twitter|x)\\.com$/i)) {
          linkIcon = 'fa-brands fa-x-twitter';
        }
      } catch (e) {
        console.error(`Error processing URL ${linkURI}:`, e);
      }

      return linkIcon + ' primaryLinkIcon';
    }
  }

  customElements.define('ucb-people-list', PeopleListElement);
})(window.customElements);
