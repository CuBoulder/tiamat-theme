class ClassNotesListElement extends HTMLElement {
	constructor() {
		super();
		const 			
			chromeElement = this._chromeElement = document.createElement('div'),
			userFormElement = this._userFormElement = document.createElement('div');
			chromeElement.appendChild(userFormElement);
		this.appendChild(chromeElement);
        const dates = [1900, 1901, 1902, 1903, 1904, 1905, 1906, 1907, 1908, 1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1917, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925, 1926, 1927, 1928, 1929, 1930, 1931, 1932, 1933, 1934, 1935, 1936, 1937, 1938, 1939, 1940, 1941, 1942, 1943, 1944, 1945, 1946, 1947, 1948, 1949, 1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962, 1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975, 1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050]
		const JSONURL = this.getAttribute('base-uri');
        // Build user filters
		this.generateForm(dates)
        // Insert year filter, make call
        const year  = "1901"
        this.getData(JSONURL, year)
	}
//  Gets info
	getData(JSONURL, year, data = []) {
        const publishFilter = '&filter[status]=1'
		const API = JSONURL + year + publishFilter
		fetch(API)
            .then(this.handleError)
            .then((data) => this.build(data))
            .catch(Error=> {
              console.error('There was an error fetching data from the API - Please try again later.')
              console.error(Error)
              this.toggleMessage('ucb-al-loading')
              this.toggleMessage('ucb-al-api-error', "block")
            });
	}
	build(data){
		console.log(data)
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
			const itemLabel = document.createElement('label'), itemLabelSpan = document.createElement('span');
			itemLabelSpan.innerText = "Filter by Year:";
			itemLabel.appendChild(itemLabelSpan);
		// Create select el
			const selectFilter = document.createElement('select');
			selectFilter.name = "Year"
			selectFilter.className = 'Year Select';
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
			sortItemLabel.appendChild(sortItemLabelSpan);
		const sortSelectFilter = document.createElement('select');
			sortSelectFilter.name = "Sort"
			sortSelectFilter.className = 'Sort Select';
			sortSelectFilter.onchange = this.onYearChange.bind(this); // Bind the event handler
			sortItemLabel.appendChild(sortSelectFilter);
			container.appendChild(sortItemLabel);
			formDiv.appendChild(container);
			this.generateDropdown(["Class Year", "Date Posted"],sortSelectFilter)
	}

	generateDropdown(dates, selectElement){
		dates.map(date => {
			const option = document.createElement('option');
				option.value = date;
				option.innerText = date;
				selectElement.appendChild(option);
		})
	}

	// Event handler for the dropdown change
    onYearChange(event) {
        const year = event.target.value;
        const JSONURL = this.getAttribute('base-uri');
        this.getData(JSONURL, year);
    }

	handleError = response => {
        if (!response.ok) { 
           throw new Error;
        } else {
           return response.json();
        }
    };
}

customElements.define('ucb-class-notes-list', ClassNotesListElement);
