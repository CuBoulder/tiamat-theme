(function (customElements) {
class TagCloudElement extends HTMLElement {
	constructor() {
		super();
    this._baseURI = this.getAttribute("base-uri");
        const handleError = response => {
            if (!response.ok) {
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(`${this._baseURI}/jsonapi/taxonomy_term/tags?page[limit]=1000`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(data){
        if(data.data.length == 0){
            this.handleError({name : "No Tags Retrieved", message : "There are no Tags created"} , 'No Tags Found')
        } else {
            const tags = data.data
            const tagCloudContainer = document.createElement('div')
            tagCloudContainer.classList = 'ucb-tag-cloud-container'

            tags.map(tag => {
                const tagName = tag.attributes.name
                const tagURL = document.createElement('a')
                tagURL.classList = 'ucb-tag-cloud-link'
                tagURL.innerText = tagName
                tagURL.href = this._baseURI +`/taxonomy/term/${tag.attributes.drupal_internal__tid}`;
                tagCloudContainer.appendChild(tagURL)
            })

        this.appendChild(tagCloudContainer)
    }
}

    handleError(Error, ErrorMsg = 'Error Fetching Tags - Check the console'){
        this.classList.add("ucb-block-error");
        const container = document.createElement('div');
        container.className = 'ucb-tag-cloud-container';
        const span = document.createElement('span')
        span.className = 'ucb-tag-cloud-span'
        container.appendChild(span)

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-triangle-exclamation'
        span.appendChild(icon)

        const message = document.createElement('p');
        message.className = 'ucb-category-cloud-message'
        message.innerText = ErrorMsg
        span.appendChild(message)

        this.appendChild(container)
        // Log error
            console.error(Error)

    }
}

customElements.define('tag-cloud-block', TagCloudElement);
})(window.customElements);
