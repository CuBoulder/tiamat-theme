console.log("Attached")

class ClassNotesListElement extends HTMLElement {

	constructor() {
		super();
		const JSONURL = this.getAttribute('base-uri');
        console.log(JSONURL)
	}

	build() {
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
	}

	generateDropdown(){
	}
}

customElements.define('ucb-class-notes-list', ClassNotesListElement);
