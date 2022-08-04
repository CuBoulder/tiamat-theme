/**
 * Containes the Rave Alert web component.
 */

class RaveAlertElement extends HTMLElement {
	constructor() {
		super();
		const feedURL = new URL(this.getAttribute('feed'));
		fetch(feedURL, {method: 'GET'})
			.then(response => response.text())
			.then(responseText => new DOMParser().parseFromString(responseText, 'text/xml'))
			.then(responseDocument => {
				const
					itemElement = responseDocument.getElementsByTagName('item')[0],
					titleText = itemElement.getElementsByTagName('title')[0].childNodes[0].nodeValue,
					descriptionText = itemElement.getElementsByTagName('description')[0].childNodes[0].nodeValue,
					linkText = itemElement.getElementsByTagName('link')[0].childNodes[0] ? itemElement.getElementsByTagName('link')[0].childNodes[0].nodeValue : '';
				if(titleText.indexOf('[CLEAR]') == -1) // This means there's an active alert to show.
					this.build(descriptionText, linkText);
			});
	}

	build(descriptionText, linkText) {
		linkText = linkText || this.getAttribute('link') || 'https://alerts.colorado.edu';
		const
			alertElement = document.createElement('div'),
			alertTextElement = document.createElement('span'),
			alertLinkElement = document.createElement('a');
		alertElement.className = 'alert alert-danger alert-dismissible fade show ucb-alert ucb-rave-alert';
		alertElement.setAttribute('role', 'alert');
		alertTextElement.className = 'ucb-alert-text ucb-rave-alert-text';
		alertLinkElement.className = 'alert-link ucb-alert-link ucb-rave-alert-link';
		alertTextElement.innerText = descriptionText;
		alertLinkElement.target = '_blank';
		alertLinkElement.href = linkText;
		alertLinkElement.innerText = 'Learn more';
		alertElement.appendChild(alertTextElement);
		alertElement.innerHTML += ' ';
		alertElement.appendChild(alertLinkElement);
		alertElement.innerHTML += '<button type="button" class="btn-close ucb-alert-close ucb-rave-alert-close" data-bs-dismiss="alert" aria-label="Close"></button>';
		this.appendChild(alertElement);
	}
}

customElements.define('rave-alert', RaveAlertElement);
