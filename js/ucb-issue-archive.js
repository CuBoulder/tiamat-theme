class IssueArchiveElement extends HTMLElement {
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

        // Pagination &page[limit]=5
        fetch(`${this._baseURI}/jsonapi/node/ucb_issue?include=field_ucb_issue_cover_image.field_media_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&sort=-created`)
        .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> {
                this.toggleMessage('ucb-al-loading');
                this.handleError(Error)
            });
    }

    build(data){
        if(data.data.length == 0){
            this.toggleMessage('ucb-al-loading')
            this.handleError({name : "No Issues Retrieved", message : "There are no Issues created"} , 'Create Issues for All Issues to appear here')
        } else {
            const archiveContainer = document.createElement('div')
            archiveContainer.classList='ucb-issue-archive-container col-lg-12 col-md-12 col-sm-12 col-xs-12'
            const issues = data.data
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
                const issueUrl = this._baseURI + issue.attributes.path.alias;
                const issueContainer = document.createElement('div')
                issueContainer.classList = 'ucb-issue-archive-card px-3'
                if(issue.relationships.field_ucb_issue_cover_image.data){
                    const issueId = issue.relationships.field_ucb_issue_cover_image.data.id;
                    const imgUrl = urlObj[idObj[issueId]]
                    const issueImg = document.createElement('img')
                    issueImg.classList = 'ucb-archive-card-img'
                    issueImg.src = imgUrl
                    issueImg.alt = `${title} issue artwork`

                    const IssueImgLink = document.createElement('a')
                    IssueImgLink.classList = 'ucb-archive-card-img-link'
                    IssueImgLink.href = issueUrl

                    IssueImgLink.appendChild(issueImg)
                    issueContainer.appendChild(IssueImgLink)
                }

                const issueTitle = document.createElement('h3')
                issueTitle.classList = 'ucb-archive-card-title'
                issueTitle.innerText = title

                const titleLink = document.createElement('a')
                titleLink.classList = 'ucb-archive-card-link'
                titleLink.href = issueUrl
                titleLink.appendChild(issueTitle)


                issueContainer.appendChild(titleLink)
                archiveContainer.appendChild(issueContainer)
            }
            this.toggleMessage('ucb-al-loading')
            this.appendChild(archiveContainer)

        }
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

    handleError(Error){
        console.error(Error)
    }
}

customElements.define('ucb-issue-archive', IssueArchiveElement);
