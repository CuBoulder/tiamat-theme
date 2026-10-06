(function (customElements) {

class CventFormElement extends HTMLElement {
    constructor() {
        super();
        var cventID = this.getAttribute('cventId');
        var cventIDRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (cventID && cventIDRegex.test(cventID)) {
            this.build(cventID);
        } else {
            console.error('Invalid Cvent embed ID');
        }
    }

    build(id){
        let div = document.createElement('div')
        div.setAttribute('data-cvt-embed', '')

        let outerScript = document.createElement('script')
        outerScript.async = true
        outerScript.src = `https://web.cvent.com/event_guest/v1/embed/${id}.js`

        this.appendChild(div)
        this.appendChild(outerScript)
    }
}


customElements.define('cvent-form', CventFormElement);
})(window.customElements);
