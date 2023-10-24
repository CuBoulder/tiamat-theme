class StatusPageElement extends HTMLElement {
	constructor() {
		super();
        let pageId = this.getAttribute('page-id')

        const handleError = response => {
            if (!response.ok) { 
               throw new Error;
            } else {
               return response.json();
            }
        };

        fetch(`https://${pageId}.statuspage.io/api/v2/status.json`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(Error=> this.handleError(Error));
    }

    build(response){
        const container = document.createElement('div');
        container.className = 'ucb-status-block-container';

        const link = document.createElement('a');
        link.className = 'ucb-status-block-link'
        link.target = "_blank"
        link.href = response.page.url;

        container.appendChild(link)

        const icon = document.createElement('i');
        icon.className = 'ucb-status-block-icon'
        link.appendChild(icon)

        const message = document.createElement('p');
        message.className = 'ucb-status-block-message'
        message.innerText = response.status.description;
        link.appendChild(message)

        // Use response to style the block
        switch (response.status.indicator) {
            case 'none':
                container.classList.add('ucb-status-none');
                link.firstChild.classList = 'fa-regular fa-face-smile'
                break;
            case 'minor':
                container.classList.add('ucb-status-minor')
                link.firstChild.classList = 'fa-regular fa-circle-question'
                break;
            case 'major':
                container.classList.add('ucb-status-major')
                link.firstChild.classList = 'fa-solid fa-triangle-exclamation'
                break;
            case 'critical':
                container.classList.add('ucb-status-crtical')
                link.firstChild.classList = 'fa-solid fa-triangle-exclamation'
                break;
        
            default:
                container.classList.add('ucb-status-none')
                this.renderNone(container)
                break;
        }
        // Add final container
        this.appendChild(container)
    }

    handleError(Error){
        const container = document.createElement('div');
        container.className = 'ucb-status-block-container ucb-status-error';
        const span = document.createElement('span')
        span.classList = "ucb-status-block-link"
        container.appendChild(span)

        const icon = document.createElement('i');
        icon.className = 'ucb-status-block-icon fa-solid fa-triangle-exclamation'
        span.appendChild(icon)

        const message = document.createElement('p');
        message.className = 'ucb-status-block-message'
        message.innerText = 'Error with Service - Check the console';
        span.appendChild(message)

        this.appendChild(container)
        console.error(Error)

    }
}


customElements.define('status-page-block', StatusPageElement);