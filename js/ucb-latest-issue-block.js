(function (customElements) {
class LatestIssueElement extends HTMLElement {
	constructor() {
		super();
    const baseURL = this.getAttribute("baseURL");
        const handleError = response => {
            if (!response.ok) {
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(`${baseURL}/jsonapi/node/ucb_issue?include=field_ucb_issue_cover_image.field_media_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&page[limit]=4&sort=-created`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> {
                this.toggleMessage('ucb-al-loading');
                this.handleError(Error)
            });
    }

   async build(data){
        const baseURL = this.getAttribute("baseURL");
        if(data.data.length == 0){
            this.handleError({name : "No Issues Retrieved", message : "There are no Issues created"} , 'No Issues Found')
        } else {
            const issues = data.data
            const latestIssueContainer = document.createElement('div')
            latestIssueContainer.classList = 'ucb-latest-issue-container'
            // Media Image
            const urlObj = {}; // key from data.data to key from data.includes
            const idObj = {}; // key from data.includes to URL
            // Remove any blanks from our articles before map
            if (data['included']) {
                const filteredData = data['included'].filter(url => !!url['attributes']['uri']);
                // creates the urlObj, key: data id, value: url
                filteredData.map((pair) => {
                    // checks if consumer is working, else default to standard image instead of focal image
                    if(pair['links']['large_image_style'])
                        urlObj[pair['id']] = pair['links']['large_image_style']['href'];
                    else
                        urlObj[pair['id']] = pair['attributes']['uri']['url'];
                });
                // removes all other included data besides images in our included media
                const idFilterData = data['included'].filter(item => item['type'] == 'media--image');
                // using the image-only data, creates the idObj =>  key: thumbnail id, value : data id
                idFilterData.map(pair => idObj[pair['id']] = pair['relationships']['thumbnail']['data']['id']);
            }

            for(let i=0;i<issues.length;i++){
                const issue = issues[i]
                const title = issue.attributes.title
                const issueUrl = baseURL + issue.attributes.path.alias
                const issueContainer = document.createElement('div')
                issueContainer.classList = 'ucb-latest-issue-card'
                // Image
                if(issue.relationships.field_ucb_issue_cover_image.data){
                    const issueId = issue.relationships.field_ucb_issue_cover_image.data.id;
                    const imgUrl = urlObj[idObj[issueId]]
                    const issueImg = document.createElement('img')
                        issueImg.classList = 'ucb-latest-issue-img'
                        issueImg.src = imgUrl
                        issueImg.alt = `${title} issue artwork`

                    const IssueImgLink = document.createElement('a')
                        IssueImgLink.classList = 'ucb-latest-issue-img-link'
                        IssueImgLink.href = issueUrl

                IssueImgLink.appendChild(issueImg)
                issueContainer.appendChild(IssueImgLink)
                }

                const issueTitle = document.createElement('h3')
                issueTitle.classList = 'ucb-latest-issue-title'
                issueTitle.innerText = title

                const titleLink = document.createElement('a')
                titleLink.href = issueUrl
                titleLink.appendChild(issueTitle)


                issueContainer.appendChild(titleLink)
                latestIssueContainer.appendChild(issueContainer)
            }
            this.toggleMessage('ucb-al-loading');
            this.appendChild(latestIssueContainer)
            const siteTitle = this.getAttribute('siteName');
            // Check if Archive Exists:
            let archiveExists
            const response = await fetch(`${baseURL}/${siteTitle}/issue/archive`)
                    .then((data) => {
                       archiveExists = data.status == 200 ? true : false
                    })
                    .catch(Error=> {
                        console.error(Error)
                    });
            // Add Archive link if articles >=4
            if (issues.length >= 4 && archiveExists){
                const archiveContainer = document.createElement('div')
                archiveContainer.classList = 'ucb-latest-issue-archive-container'
                const archiveLink = document.createElement('a')
                archiveLink.classList = 'ucb-latest-issue-archive-button'
                archiveLink.href = baseURL + '/issue/archive'
                archiveLink.innerText = 'Issue Archive'

                archiveContainer.appendChild(archiveLink)
                this.appendChild(archiveContainer)
            }
        }
    }

    handleError(Error, ErrorMsg = 'Error Fetching issues - Check the console'){
        this.classList.add("ucb-block-error");
        this.toggleMessage('ucb-al-loading');
        const container = document.createElement('div');
        container.className = 'ucb-current-issue-block-content';
        const span = document.createElement('span')
        span.classList = "ucb-status-block-link"
        container.appendChild(span)

        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-triangle-exclamation'
        span.appendChild(icon)

        const message = document.createElement('p');
        message.className = 'ucb-current-issue-block-message'
        message.innerText = ErrorMsg
        span.appendChild(message)

        this.appendChild(container)
        console.error(Error)

    }
    toggleMessage(id, display = "none") {
        if (id) {
          var toggle = this.querySelector(`#${id}`);
          if (toggle) {
            if (display === "block") {
              toggle.style.display = "block";
            } else {
              toggle.style.display = "none";
            }
          }
        }
    }
}


customElements.define('latest-issue-block', LatestIssueElement);
})(window.customElements);
