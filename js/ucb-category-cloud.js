(function (customElements) {

class CategoryCloudElement extends HTMLElement {
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

        fetch(`${this._baseURI}/jsonapi/taxonomy_term/category?page[limit]=1000`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(data){
        if(data.data.length == 0){
            this.handleError({name : "No Categories Retrieved", message : "There are no Categories created"} , 'No Categories Found')
        } else {
            const categories = data.data
            const categoryCloudContainer = document.createElement('div')
            categoryCloudContainer.classList = 'ucb-category-cloud-container'

            categories.map(category => {
                const categoryName = category.attributes.name
                const categoryURL = document.createElement('a')
                categoryURL.classList = 'ucb-category-cloud-link'
                categoryURL.innerText = categoryName
                categoryURL.href = this._baseURI + `/taxonomy/term/${category.attributes.drupal_internal__tid}`
                categoryCloudContainer.appendChild(categoryURL)
            })

        this.appendChild(categoryCloudContainer)
    }
}

    handleError(Error, ErrorMsg = 'Error Fetching Categories - Check the console'){
        this.classList.add("ucb-block-error");
        const container = document.createElement('div');
        container.className = 'ucb-category-cloud-container';
        const span = document.createElement('span')
        span.className = 'ucb-category-cloud-span'
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

customElements.define('category-cloud-block', CategoryCloudElement);
})(window.customElements);
