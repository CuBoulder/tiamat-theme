class ClassNotesListElement extends HTMLElement {
	constructor() {
		super();
		const
			chromeElement = this._chromeElement = document.createElement('div'),
			userFormElement = this._userFormElement = document.createElement('div'),
			notesListElement = this._notesListElement = document.createElement('div'),
			messageElement = this._messageElement = document.createElement('div'),
			loadingElement = this._loadingElement = document.createElement('div');
		messageElement.className = 'ucb-list-msg';
		messageElement.setAttribute('hidden', '');
		loadingElement.className = 'ucb-loading-data';
		loadingElement.innerHTML = '<i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>';
		this._notesListElement.classList.add('ucb-class-notes-list-container')
			chromeElement.appendChild(userFormElement);
			chromeElement.appendChild(notesListElement)
			chromeElement.appendChild(messageElement);
			chromeElement.appendChild(loadingElement);
			this.appendChild(chromeElement);
        const dates = ['--Select date--', 1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050]
		const JSONURL = this.getAttribute('base-uri');
        // Build user filters
		this.generateForm(dates)
        // Insert year filter, make call
        this.getData(JSONURL, "", 'Class Year')
	}
	//  Gets info
	getData(JSONURL, year = '', sort, notes = [], nextURL = "") {
		this.toggleMessageDisplay(this._loadingElement, 'block', null, null);
		this.toggleMessageDisplay(this._messageElement, 'none', null, null);
		let yearFilter = '';
		let publishFilter = ''
		let sortFilter = ''

		// Query Params
		const queryParams = new URLSearchParams(window.location.search);
		let startDate = queryParams.get('startDate') ? new Date(queryParams.get('startDate')).getTime() / 1000 : null; // e.g., '2023-11-05'
		let endDate = queryParams.get('endDate') ? new Date(queryParams.get('endDate')).getTime() / 1000 : null; // e.g., '2023-11-06'

		// If startDate is provided but endDate is not, set endDate to today
		if (startDate && !endDate) {
			endDate = new Date().setHours(23, 59, 59, 999) / 1000; // Sets endDate to the end of today
		}
		// Date Published Range
		let dateFilter = '';
		if (startDate && endDate) {
			// Filter for nodes created between the start and end dates
			dateFilter = `&filter[created-on][group][conjunction]=AND`;
			dateFilter += `&filter[start-date][condition][path]=created&filter[start-date][condition][operator]=%3E%3D&filter[start-date][condition][value]=${startDate}&filter[start-date][condition][memberOf]=created-on`;
			dateFilter += `&filter[end-date][condition][path]=created&filter[end-date][condition][operator]=%3C&filter[end-date][condition][value]=${endDate}&filter[end-date][condition][memberOf]=created-on`;
		}

		if(sort == 'Class Year'){
			sortFilter = '&sort=field_ucb_class_year'
		} else {
			sortFilter = '&sort=-created'
		}
		// If its not a next link, build the JSON API URL
			if (year) {
				yearFilter = `?filter[field_ucb_class_year]=${year}`
				publishFilter = '&filter[status]=1'
			} else {
				yearFilter = ''
				publishFilter = '?filter[status]=1'
			}
		const images = '&include=field_ucb_class_note_image.field_media_image&fields[file--file]=uri,url'
		const API = nextURL != "" ? nextURL : JSONURL + yearFilter + publishFilter + images + sortFilter + dateFilter
		fetch(API)
            .then(this.handleError)
            .then((data) => {
				const images = data.included
				const nextURL = data.links.next ? data.links.next.href : "";
					// Iterate over all notes
					data.data.forEach(note=>{
						notes.push(note)
					})
					this.build(notes, nextURL, images)

			})
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
			  this.toggleMessageDisplay(this._loadingElement, 'none');
			  this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-api-error', 'Error retrieving data from the API endpoint. Please try again later.');
            });
	}
	// Render handler
	build(data, nextURL, images){
		const classNotesContainer = this._notesListElement
		// Classic Media Library image mapping
		let idObj = {};
		let altObj = {};
		// Remove any blanks from our articles before map
		if (images) {
		  // removes all other included data besides images in our included media
		  let idFilterData = images.filter((item) => {
			return item.type == "media--image";
		  })

		  let altFilterData = images.filter((item) => {
			return item.type == 'file--file';
		  });
		  // finds the focial point version of the thumbnail
		  altFilterData.map((item) => {
			// checks if consumer is working, else default to standard image instead of focal image
			if (item.links.focal_image_square != undefined) {
			  altObj[item.id] = { src: item.links.focal_image_square.href }
			} else {
			  altObj[item.id] = { src: item.attributes.uri.url }
			}
		  })

		  // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
		  idFilterData.map((pair) => {
			if (pair.relationships.thumbnail.data){
				const thumbnailId = pair.relationships.thumbnail.data.id;
				idObj[pair.id] = pair.relationships.thumbnail.data.id;
				altObj[thumbnailId].alt = pair.relationships.thumbnail.data.meta.alt;
			}

		  })
		}

		// Build Notes
		if(!data.length){
			this.toggleMessageDisplay(this._loadingElement, 'none', null, null);
			this.toggleMessageDisplay(this._messageElement, 'block', 'ucb-list-msg ucb-end-of-results', 'No results matching your filters.');
		} else {
			data.forEach(note => {
				const classNote = document.createElement('article')
					classNote.classList.add('ucb-class-notes-list-note-item')
				// Title & Year Container
				const classNoteHeader = document.createElement('div')
					classNoteHeader.classList.add('ucb-class-note-header')
				// Title
				const classNoteTitle = document.createElement('h3')
					classNoteTitle.classList.add('ucb-class-note-title')
					classNoteTitle.innerText = note.attributes.title
					classNoteHeader.append(classNoteTitle)

				// Bullet Point
				const classNoteTitleDateBullet = document.createElement('p')
					classNoteTitleDateBullet.classList.add('ucb-class-note-header-bullet')
					classNoteTitleDateBullet.innerText = '\u2022'
					classNoteHeader.append(classNoteTitleDateBullet)

				// Date (Class Note Link)
				const classNoteYearLink = document.createElement('a');
					classNoteYearLink.classList.add('ucb-class-note-link')
					classNoteYearLink.href = '#';
					classNoteYearLink.innerText = note.attributes.field_ucb_class_year;
					// Class Note Link Event Listener
					classNoteYearLink.addEventListener('click', (event) => {
						event.preventDefault(); // Prevent default anchor behavior
						this.onYearSelect(note.attributes.field_ucb_class_year);
					});
				classNoteHeader.appendChild(classNoteYearLink)

				// Div for Images and Text
				const imgAndTextDiv = document.createElement('div')
				imgAndTextDiv.classList.add('ucb-class-note-data', 'row')
				// Only add the image col if images exist, otherwise text pinned left
				let hasImages = false; // If images exist, this flag will be set to apply Bootstrap classes appropriately, else take col-12
				if(note.relationships.field_ucb_class_note_image.data.length){
					// Images
					const imgDiv = document.createElement('div')
						note.relationships.field_ucb_class_note_image.data.forEach(image=>{
							// Create an img el
							if(altObj[idObj[image.id]]){
								hasImages = true; // We have at least one image, sets flag for later
								imgDiv.classList.add('ucb-class-note-image-container','col-md-2','col-sm-3')
								let imageEl = document.createElement('img')
								imageEl.classList.add('ucb-class-note-image')
								imageEl.alt =  altObj[idObj[image.id]].alt;
								imageEl.src = altObj[idObj[image.id]].src
								imgDiv.append(imageEl)
							}
						})
					imgAndTextDiv.appendChild(imgDiv)
				}
				// Text
				const textDiv = document.createElement('div')
				// Sets Class Note body bootstrap style, dependent on having images (hasImages flag above)
				if(note.relationships.field_ucb_class_note_image.data.length && hasImages){
					textDiv.classList.add('ucb-class-note-data', 'col-md-10','col-sm-9')
				} else {
					textDiv.classList.add('ucb-class-note-data', 'col-sm-12')
				}
				textDiv.append(classNoteHeader)
				// Class Note Text
				const classNoteParagraph = document.createElement('p')
					classNoteParagraph.classList.add('ucb-class-note-body')
					classNoteParagraph.innerHTML = this.sanitizeHTML(note.attributes.body.processed);
					textDiv.appendChild(classNoteParagraph)
				// Date posted
				const classNotePosted = document.createElement('p')
					classNotePosted.classList.add('class-note-posted-date')
					classNotePosted.innerText = `Posted ${this.formatDateString(note.attributes.created)}`
					textDiv.appendChild(classNotePosted)
					imgAndTextDiv.appendChild(textDiv)
				classNote.appendChild(imgAndTextDiv)
					this.toggleMessageDisplay(this._loadingElement, 'none', null, null);

				classNotesContainer.appendChild(classNote)
			})
		}
		// Makes the next button
		if(nextURL != ""){
			const nextButtonContainer = document.createElement('div')
				nextButtonContainer.classList.add('ucb-class-notes-read-more-container')
			const nextButton = document.createElement('button');
			nextButton.classList.add('ucb-class-notes-read-more');
			nextButton.innerText = 'Load More Notes';
			nextButton.addEventListener('click', () => {
				this.getNextSet(nextURL);
				nextButton.remove(); // Remove the button after it's clicked
			});
			// Append the button to the container, then the element
			nextButtonContainer.appendChild(nextButton)
			this._notesListElement.appendChild(nextButtonContainer);
		}
	}
	// Used for toggling the error messages/loader on/off
	toggleMessageDisplay(element, display, className, innerText) {
		if(className)
			element.className = className;
		if(innerText)
			element.innerText = innerText;
		if(display === 'none')
			element.setAttribute('hidden', '');
		else element.removeAttribute('hidden');
	}
	// Builds the user forms
    generateForm(dates){
		// Create Elements
		const form = document.createElement('form'),
        	formDiv = document.createElement('div');
			form.className = 'class-notes-list-filter';
			formDiv.className = 'd-flex align-items-center';
		// Create container
		const container = document.createElement('div');
			container.className = `form-item`;
		// Create label el
		const itemLabel = document.createElement('label'),
			itemLabelSpan = document.createElement('span');
			itemLabelSpan.classList.add('filter-by-label','ucb-class-notes-filter-label')
			itemLabelSpan.innerText = "Filter by Year:";
			itemLabel.appendChild(itemLabelSpan);
		// Create select el
		const selectFilter = document.createElement('select');
			selectFilter.name = "Year"
			selectFilter.classList.add('Year-Select', 'class-note-year-select');
			selectFilter.onchange = this.onYearChange.bind(this); // Bind the event handler
			itemLabel.appendChild(selectFilter);
			container.appendChild(itemLabel);
			formDiv.appendChild(container);
		// Appends
		this.generateDropdown(dates, selectFilter)
		form.appendChild(formDiv);
		this._userFormElement.appendChild(form);

		// Sort By : Create container
		const sortContainer = document.createElement('div');
			sortContainer.classList.add('form-item', "sort-form-item");
		// Create label el
		const sortItemLabel = document.createElement('label'), sortItemLabelSpan = document.createElement('span');
			sortItemLabelSpan.innerText = "Sort By:";
			sortItemLabelSpan.classList.add('sort-by-label','ucb-class-notes-filter-label')
			sortItemLabel.appendChild(sortItemLabelSpan);
		const sortSelectFilter = document.createElement('select');
			sortSelectFilter.name = "Sort"
			sortSelectFilter.classList.add('Sort-Select','class-note-sort-select');
			sortSelectFilter.onchange = this.onSortChange.bind(this); // Bind the event handler
			sortItemLabel.appendChild(sortSelectFilter);
			container.appendChild(sortItemLabel);
			formDiv.appendChild(container);
			this.generateDropdown(["Class Year", "Date Posted"],sortSelectFilter)


		// Add 'View All Notes' Link
		const viewAllLinkContainer = document.createElement('div')
			viewAllLinkContainer.classList.add('ucb-class-notes-view-all-container')
		const viewAllLink = document.createElement('a');
			viewAllLink.href = '#';
			viewAllLink.innerText = 'View All Notes';
			viewAllLink.addEventListener('click', this.viewAllNotes.bind(this));
			viewAllLinkContainer.appendChild(viewAllLink)
			form.appendChild(viewAllLinkContainer);
			this._userFormElement.appendChild(form);
	}
	// Generates the Dropdowns, on the user form
	generateDropdown(dates, selectElement){
		dates.map(date => {
			const option = document.createElement('option');
			if(date === '--Select date--'){
				option.value = ''
			} else {
				option.value = date;
			}
				option.innerText = date;
				selectElement.appendChild(option);
		})
	}
	// Event handler for the dropdown change
    onYearChange(event) {
        const year = event.target.value;
        const JSONURL = this.getAttribute('base-uri');
		const sort = this.getSortValue();
		this.clearNotesList();
		this.getData(JSONURL, year, sort);
    }
	// If a Class Note Year is selected...
	onYearSelect(year){
		const JSONURL = this.getAttribute('base-uri');
		const yearDropdown = this.querySelector('.class-note-year-select');
		yearDropdown.value = year;

		this.clearNotesList()
		this.getData(JSONURL, year);
	}
	// Event handler for Sort filter dropdown change
	onSortChange(event){
		const sort = event.target.value
		const JSONURL = this.getAttribute('base-uri');
		const year = this.getYearValue();
		this.clearNotesList()
		this.getData(JSONURL, year, sort);
	}
	// Helper method to clear the notes list
	clearNotesList() {
		const notesListElement = this._notesListElement;
		while (notesListElement.firstChild) {
			notesListElement.removeChild(notesListElement.firstChild);
		}
	}
	// Event handler for View All -- no year specified
	viewAllNotes(event){
		event.preventDefault();
		this.resetDropdowns();
		// Update the URL to remove query parameters without reloading the page
		const urlWithoutParams = window.location.protocol + "//" + window.location.host + window.location.pathname;
		window.history.pushState({path:urlWithoutParams}, '', urlWithoutParams);
		const JSONURL = this.getAttribute('base-uri');
		this.clearNotesList()
		this.getData(JSONURL, "", "Class Year")
	}
	// Prevents malicious user input
  sanitizeHTML(input) {
    if (!input) return '';
    let sanitized = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
                         .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '');
    sanitized = sanitized.replace(/\s*on\w+="[^"]*"/gi, '')
                         .replace(/\s*on\w+='[^']*'/gi, '');
    sanitized = sanitized.replace(/href\s*=\s*(['"])\s*javascript:[^'"]*\1/gi, '');

    return sanitized;
}
	// Date formatter
	formatDateString(dateString) {
		const options = { year: 'numeric', month: 'short', day: 'numeric' };
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', options);
	}
	// Used for loading articles beyond 50, sets up next API calls
	getNextSet(nextURL){
		// Remove existing 'Load More Notes' button
		const loadMoreButton = this.querySelector('.ucb-class-notes-read-more');
		if (loadMoreButton) {
			loadMoreButton.remove();
		}

		// Call API and update data
		this.getData(nextURL);
	}
	// Helper method to get the current year value from the dropdown
	getYearValue() {
		return this.querySelector('.class-note-year-select').value;
	}
	// Helper method to get the current sort value from the dropdown
	getSortValue() {
    	return this.querySelector('.class-note-sort-select').value;
	}
	// Dropdown resetter
	resetDropdowns() {
		const yearDropdown = this.querySelector('.class-note-year-select');
		const sortDropdown = this.querySelector('.class-note-sort-select');

		if (yearDropdown && sortDropdown) {
			yearDropdown.value = '';
			sortDropdown.value = 'Class Year';
		}
	}
	// Error handler
	handleError = response => {
        if (!response.ok) {
           throw new Error;
        } else {
           return response.json();
        }
    };
}

customElements.define('ucb-class-notes-list', ClassNotesListElement);
