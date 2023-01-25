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
        }
    }

    handleError(Error){
        console.error(Error)
    }
}

customElements.define('ucb-issue-archive', IssueArchiveElement);