class StatusPageElement extends HTMLElement {
	constructor() {
		super();
        var url = this.getAttribute('url');
        this.build(url);
    }

    build(url){
        const webcomponentScript = document.createElement('script');
        webcomponentScript.src = `${url}/embed/script.js`
        this.appendChild(webcomponentScript)
    }
}


customElements.define('status-page', StatusPageElement);