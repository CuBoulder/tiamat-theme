(function (customElements) {
class CurrentIssueElement extends HTMLElement {
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

        fetch(`${this._baseURI}/jsonapi/node/ucb_issue?include=field_ucb_issue_cover_image.field_media_image&fields[file--file]=uri,url&filter[published][group][conjunction]=AND&filter[publish-check][condition][path]=status&filter[publish-check][condition][value]=1&filter[publish-check][condition][memberOf]=published&sort=-created`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> {
                this.toggleMessage('ucb-al-loading');
                this.handleError(Error);
            });
    }

    build(data){
        if(data.data.length == 0){
            this.handleError({name : "No Issues Retrieved", message : "There are no Issues created"} , 'No Issues Found');
        } else {
            const title = data.data[0].attributes.title
            let imgURL
            const issueURL = this._baseURI + data.data[0].attributes.path.alias;

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

            // Image
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

            const issue = data.data[0] ? data.data[0] : null
            const linkEl = document.createElement('a')
            linkEl.href = issueURL


            linkEl.appendChild(titleEl)
            titleDiv.appendChild(linkEl)

            if(issue.relationships.field_ucb_issue_cover_image.data){
                const issueId = issue.relationships.field_ucb_issue_cover_image.data.id;
                imgURL = urlObj[idObj[issueId]]
                const imgEL = document.createElement('img')
                imgEL.classList = 'ucb-current-issue-block-img'
                imgEL.src = imgURL
                imgEL.alt = `${title} cover image`
                imgLinkEL.appendChild(imgEL)
                imgDiv.appendChild(imgLinkEL)
            }


            blockDiv.appendChild(imgDiv)
            blockDiv.appendChild(titleDiv)
            this.toggleMessage('ucb-al-loading');
            this.appendChild(blockDiv)
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


customElements.define('current-issue-block', CurrentIssueElement);
})(window.customElements);
