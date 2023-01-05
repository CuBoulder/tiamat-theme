class MainStay extends HTMLElement{
    constructor() {
		super();
        const id = this.getAttribute('id')
        const college = this.getAttribute('college')
		this.build(id, college)
	}

    build(id, college){
        window.admitHubBot = {botToken: id, collegeId: college};
 
        let chatScript = document.createElement('script')
        chatScript.src="https://webbot.mainstay.com/static/js/webchat.js"
        let stylesheet = document.createElement('link')
        stylesheet.rel = "stylesheet"
        stylesheet.type ="text/css"
        stylesheet.href="https://webbot.mainstay.com/static/css/webchat.css"
 
        this.appendChild(chatScript)
        this.appendChild(stylesheet)
    }
}

customElements.define('mainstay-service', MainStay);