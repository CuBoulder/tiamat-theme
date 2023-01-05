class LiveChat extends HTMLElement{
    constructor() {
		super();
        const id = this.getAttribute('id')
		this.build(id)
	}

    build(id){
        const script = document.createElement('script')
        script.innerText = `var __lc = {}; __lc.license = ${id};(function() {var lc = document.createElement('script'); lc.type = 'text/javascript'; lc.async = true;lc.src = ('https:' == document.location.protocol ? 'https://' : 'http://') + 'cdn.livechatinc.com/tracking.js';var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(lc, s);})();`
        this.appendChild(script)
    }
}

customElements.define('livechat-service', LiveChat);