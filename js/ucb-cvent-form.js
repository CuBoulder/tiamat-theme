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
        let loadingElement = document.createElement('div')
        loadingElement.className = 'ucb-loading-data'
        loadingElement.innerHTML = '<i class="fa-solid fa-spinner fa-3x fa-spin-pulse"></i>'

        let div = document.createElement('div')
        div.setAttribute('data-cvt-embed', '')
        div.setAttribute('hidden', '')

        let outerScript = document.createElement('script')
        outerScript.async = true
        outerScript.src = `https://web.cvent.com/event_guest/v1/embed/${id}.js`

        let hideLoader = () => {
            loadingElement.setAttribute('hidden', '')
            div.removeAttribute('hidden')
        }

        let observer = new MutationObserver(() => {
            let iframe = div.querySelector('iframe')
            if (!iframe) {
                return
            }
            observer.disconnect()
            iframe.addEventListener('load', hideLoader)
        })
        observer.observe(div, { childList: true })
        outerScript.addEventListener('error', hideLoader)

        this.appendChild(loadingElement)
        this.appendChild(div)
        this.appendChild(outerScript)
    }
}


customElements.define('cvent-form', CventFormElement);
})(window.customElements);
