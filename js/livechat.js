class LiveChat extends HTMLElement{
	constructor() {
		super();
		const id = this.getAttribute('license-id');
		this.build(id);
	}

	build(id){
		window.__lc = {'license': id};
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = true;
		script.src = 'https://cdn.livechatinc.com/tracking.js';
		this.appendChild(script);
	}
}

customElements.define('livechat-service', LiveChat);
