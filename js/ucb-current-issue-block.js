console.log('Attached')

class CurrentIssueElement extends HTMLElement {
	constructor() {
		super();
        
        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(`/jsonapi/node/ucb_issue?include=field_ucb_issue_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&sort=-created`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(data){
       console.log(data)
        const title = data.data[0].attributes.title
        const imgURL = data.included[0].attributes.uri.url
        const articleURL = data.data[0].attributes.path.alias

        let div = document.createElement('div')
        div.classList='ucb-current-issue-block-content'

        const titleEl = document.createElement('h3')
        titleEl.classList = "ucb-current-issue-block-title"
        titleEl.innerText = title

        const imgEL = document.createElement('img')
        imgEL.classList = 'ucb-current-issue-block-img'
        imgEL.src = imgURL

        console.log(imgURL)

        const linkEl = document.createElement('a')
        linkEl.href = articleURL

        div.appendChild(imgEL)
        div.appendChild(titleEl)
        linkEl.appendChild(div)
        this.appendChild(linkEl)





    }
}


customElements.define('current-issue-block', CurrentIssueElement);