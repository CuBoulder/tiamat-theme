class ArticleListBlockElement extends HTMLElement {
	constructor() {
		super();
        var excludedCategories = this.getAttribute('exCats');
        var excludedTags = this.getAttribute('exTags')
        var API = this.getAttribute('jsonapi')

        console.log('my ex cats are: ', excludedCategories)
        console.log('my ex tags are', excludedTags)
        
        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(API)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> {
                // this.handleError(Error)
                console.log(Error)
            });
    }

    build(data){
        console.log('my data', data)
        if(data.data.length == 0){
            // this.handleError({name : "No Tags Retrieved", message : "There are no Tags created"} , 'No Tags Found')
        } else {

    }
}

    // TO DO -- Create Error handling for Article Block
    // handleError(Error, ErrorMsg = 'Error Fetching Tags - Check the console'){
    //     const container = document.createElement('div');
    //     container.className = 'ucb-tag-cloud-container';
    //     const span = document.createElement('span')
    //     span.className = 'ucb-tag-cloud-span'
    //     container.appendChild(span)

    //     const icon = document.createElement('i');
    //     icon.className = 'fas fa-exclamation-triangle'
    //     span.appendChild(icon)

    //     const message = document.createElement('p');
    //     message.className = 'ucb-category-cloud-message'
    //     message.innerText = ErrorMsg
    //     span.appendChild(message)

    //     this.appendChild(container)
    //     // Log error
    //         console.error(Error)
        
    // }
}

customElements.define('article-list-block', ArticleListBlockElement);