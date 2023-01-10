class StatusPageElement extends HTMLElement {
	constructor() {
		super();
        let pageId = this.getAttribute('page-id')

        const handleError = response => {
            if (!response.ok) { 
               throw Error(response.statusText);
            } else {
               return response.json();
            }
        };

        fetch(`https://${pageId}.statuspage.io/api/v2/status.json`)
            .then(handleError)
            .then((data) => this.build(data))
            .catch(console.log);
    }

    build(response){
        console.log("buildin", response);
        const container = document.createElement('div');
        container.className = 'ucb-status-block-container';

        const link = document.createElement('a');
        link.className = 'ucb-status-block-link'
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
                link.firstChild.classList = 'fas fa-smile'
                break;
            case 'minor':
                container.classList.add('ucb-status-minor')
                link.firstChild.classList = 'fas fa-exclamation-circle'
                break;
            case 'major':
                container.classList.add('ucb-status-major')
                link.firstChild.classList = 'fas fa-exclamation-square'
                break;
            case 'critical':
                container.classList.add('ucb-status-crtical')
                link.firstChild.classList = 'fas fa-exclamation-triangle'
                break;
        
            default:
                container.classList.add('ucb-status-none')
                this.renderNone(container)
                break;
        }
        // Add final container
        this.appendChild(container)
    }
}


customElements.define('status-page-block', StatusPageElement);