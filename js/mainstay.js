class MainStay extends HTMLElement{
    constructor() {
		super();
        const id = this.getAttribute('id')
        const precollege = this.getAttribute('college')

        // Sanitize
        const college = precollege.replace(/[\W_]+/g, '');
		this.build(id, college)
	}

    build(id, college){
        let tokenScript = document.createElement('script')
        tokenScript.innerText= `window.admitHubBot = {botToken: "${id}", collegeId: "${college}" };`
 
        let chatScript = document.createElement('script')
        chatScript.src="https://webbot.mainstay.com/static/js/webchat.js"
        let stylesheet = document.createElement('link')
        stylesheet.rel = "stylesheet"
        stylesheet.type ="text/css"
        stylesheet.href="https://webbot.mainstay.com/static/css/webchat.css"
 
        this.appendChild(tokenScript)
        this.appendChild(chatScript)
        this.appendChild(stylesheet)
    }
}

customElements.define('mainstay-service', MainStay);