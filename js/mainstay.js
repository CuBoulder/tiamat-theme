class MainStay extends HTMLElement{
    constructor() {
		super();
        const id = this.getAttribute('id')
		this.build(id)
	}

    build(id){
        let tokenScript = document.createElement('script')
        tokenScript.innerText= `window.admitHubBot = {botToken: "${id}" };`
 
        let chatScript = document.createElement('script')
        chatScript.src="https://webbot.admithub.com/static/js/webchat.js"
        let stylesheet = document.createElement('link')
        stylesheet.rel = "stylesheet"
        stylesheet.type ="text/css"
        stylesheet.href="https://webbot.admithub.com/static/css/webchat.css"
 
        this.appendChild(tokenScript)
        this.appendChild(chatScript)
        this.appendChild(stylesheet)
    }
}

customElements.define('mainstay-service', MainStay);