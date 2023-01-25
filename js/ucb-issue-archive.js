class IssueArchiveElement extends HTMLElement {
	constructor() {
		super();
        
        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        // Pagination &page[limit]=5
        fetch(`/jsonapi/node/ucb_issue?include=field_ucb_issue_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&sort=-created`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(data){
        if(data.data.length == 0){
            this.handleError({name : "No Issues Retrieved", message : "There are no Issues created"} , 'Create Issues for All Issues to appear here')
        } else {
            console.log(data)
            const archiveContainer = document.createElement('div')
            archiveContainer.classList='ucb-issue-archive-container'
            const issues = data.data
            const issuesArt = data.included

            for(let i=0;i<issues.length;i++){
                const issue = issues[i]
                const issueArt = issuesArt[i]

                const title = issue.attributes.title
                const imgUrl = issueArt.attributes.uri.url
                const issueUrl = issue.attributes.path.alias

                const issueContainer = document.createElement('div')
                issueContainer.classList = 'ucb-issue-archive-card col-sm-2 mx-3'

                const issueImg = document.createElement('img')
                issueImg.classList = 'ucb-archive-card-img'
                issueImg.src = imgUrl
                issueImg.alt = `${title} issue artwork`

                const IssueImgLink = document.createElement('a')
                IssueImgLink.classList = 'ucb-archive-card-img-link'
                IssueImgLink.href = issueUrl

                const issueTitle = document.createElement('h3')
                issueTitle.classList = 'ucb-archive-card-title'
                issueTitle.innerText = title

                const titleLink = document.createElement('a')
                titleLink.classList = 'ucb-archive-card-link'
                titleLink.href = issueUrl
                titleLink.appendChild(issueTitle)

                IssueImgLink.appendChild(issueImg)
                issueContainer.appendChild(IssueImgLink)
                issueContainer.appendChild(titleLink)
                archiveContainer.appendChild(issueContainer)
            }

            this.appendChild(archiveContainer)

        }
    }

    handleError(Error){
        console.error(Error)
    }
}

customElements.define('ucb-issue-archive', IssueArchiveElement);