(function(stickyMenuElement, headerElement) {
	if (!stickyMenuElement || !headerElement) return;
	let stickyMenuHidden = true;
	document.addEventListener('scroll', function(e) {
		const headerRect = headerElement.getBoundingClientRect();
		if (headerRect.bottom <= 0) {
			if (stickyMenuHidden) {
				stickyMenuElement.removeAttribute('hidden');
				stickyMenuHidden = false;
			}
		} else {
			if (!stickyMenuHidden) {
				stickyMenuElement.setAttribute('hidden', '');
				stickyMenuHidden = true;
			}
		}
	});
})(
	document.querySelector('.ucb-sticky-menu'),
	document.querySelector('.page-header')
);
