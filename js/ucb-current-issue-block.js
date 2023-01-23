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
        const issueURL = data.data[0].attributes.path.alias

        const imgLinkEL = document.createElement('a')
        imgLinkEL.href = issueURL

        let blockDiv = document.createElement('div')
        blockDiv.classList='ucb-current-issue-block-content'

        const imgDiv = document.createElement('div')
        imgDiv.classList = 'ucb-current-issue-block-img-container'


        const titleDiv = document.createElement('div')
        titleDiv.classList = 'ucb-current-issue-block-title-container'

        const titleEl = document.createElement('h3')
        titleEl.classList = "ucb-current-issue-block-title"
        titleEl.innerText = title

        const imgEL = document.createElement('img')
        imgEL.classList = 'ucb-current-issue-block-img'
        imgEL.src = imgURL

        const linkEl = document.createElement('a')
        linkEl.href = issueURL


        linkEl.appendChild(titleEl)
        titleDiv.appendChild(linkEl)

        imgLinkEL.appendChild(imgEL)
        imgDiv.appendChild(imgLinkEL)
        
        blockDiv.appendChild(imgDiv)
        blockDiv.appendChild(titleDiv)

        this.appendChild(blockDiv)



    }
}


customElements.define('current-issue-block', CurrentIssueElement);