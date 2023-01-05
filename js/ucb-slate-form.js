class SlateFormElement extends HTMLElement {
	constructor() {
		super();
        var slateID = this.getAttribute('slateId');
        var slateDomain = this.getAttribute('slateDomain')
        this.build(slateID, slateDomain);
    }

    build(id, domain){
        let div = document.createElement('div')
        div.id = `form_${id}`
        div.innerText = "Loading..."
        let outerScript = document.createElement('script')
        outerScript.innerText = `
            var script = document.createElement('script');
            var div = jQuery('.field-item'),
            comment = div.contents().filter(function() {
            return this.nodeType === 8;
            }).get(0);
        
        if (typeof comment !== "undefined") {
            var options = comment.nodeValue.split(":");
            var optionsquery = '&sys:field:' + options[0] + '=' + options[1];
        } else {
            var optionsquery = '';
        }
        script.async = 1; script.src = '${domain}/register/?id=${id}&output=embed' + optionsquery + '&div=form_${id}' + ((location.search.length > 1) ? '&' + location.search.substring(1) : ''); var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(script, s);
        `
        outerScript.innerText.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g,' ') // removes line breaks from template
        this.appendChild(div)
        this.appendChild(outerScript)
    }
}


customElements.define('slate-form', SlateFormElement);