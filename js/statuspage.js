class StatusPage extends HTMLElement{
    constructor() {
		super();
        const id = this.getAttribute('id')
		this.build(id)
	}

    build(id){
        const script = document.createElement('script')
        script.src = `https://${id}.statuspage.io/embed/script.js`
        this.appendChild(script)
    }
}

customElements.define('statuspage-service', StatusPage);