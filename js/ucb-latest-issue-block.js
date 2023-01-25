console.log('connected')

class LatestIssueElement extends HTMLElement {
	constructor() {
		super();
        
        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(`/jsonapi/node/ucb_issue?include=field_ucb_issue_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&page[limit]=4&sort=-created`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(data){
        if(data.data.length == 0){
            this.handleError({name : "No Issues Retrieved", message : "There are no Issues created"} , 'No Issues Found')
        } else {
            const issues = data.data
            const issuesArt = data.included

            const latestIssueContainer = document.createElement('div')
            latestIssueContainer.classList = 'ucb-latest-issue-container'

            for(let i=0;i<issues.length;i++){
                const issue = issues[i]
                const issueArt = issuesArt[i]

                const title = issue.attributes.title
                const imgUrl = issueArt.attributes.uri.url
                const issueUrl = issue.attributes.path.alias

                const issueContainer = document.createElement('div')
                issueContainer.classList = 'ucb-latest-issue-card'

                const issueImg = document.createElement('img')
                issueImg.classList = 'ucb-latest-issue-img'
                issueImg.src = imgUrl
                issueImg.alt = `${title} issue artwork`

                const IssueImgLink = document.createElement('a')
                IssueImgLink.classList = 'ucb-latest-issue-img-link'
                IssueImgLink.href = issueUrl

                const issueTitle = document.createElement('h3')
                issueTitle.classList = 'ucb-latest-issue-title'
                issueTitle.innerText = title

                const titleLink = document.createElement('a')
                titleLink.href = issueUrl
                titleLink.appendChild(issueTitle)

                IssueImgLink.appendChild(issueImg)
                issueContainer.appendChild(IssueImgLink)
                issueContainer.appendChild(titleLink)
                latestIssueContainer.appendChild(issueContainer)
            }

            this.appendChild(latestIssueContainer)

            // Add Archive link if articles >=4
            if (issues.length >= 4){
                const archiveContainer = document.createElement('div')
                archiveContainer.classList = 'ucb-latest-issue-archive-container'
                const archiveLink = document.createElement('a')
                archiveLink.classList = 'ucb-latest-issue-archive-button'
                // TO DO -- add archive link here
                archiveLink.href = '/'
                archiveLink.innerText = 'Issue Archive'

                archiveContainer.appendChild(archiveLink)
                this.appendChild(archiveContainer)
            }
        }
    }

    handleError(Error, ErrorMsg = 'Error Fetching issues - Check the console'){
        const container = document.createElement('div');
        container.className = 'ucb-current-issue-block-content';
        const span = document.createElement('span')
        span.classList = "ucb-status-block-link"
        container.appendChild(span)

        const icon = document.createElement('i');
        icon.className = 'fas fa-exclamation-triangle'
        span.appendChild(icon)

        const message = document.createElement('p');
        message.className = 'ucb-current-issue-block-message'
        message.innerText = ErrorMsg
        span.appendChild(message)

        this.appendChild(container)
       
            console.error(Error)
        
    }
}


customElements.define('latest-issue-block', LatestIssueElement);