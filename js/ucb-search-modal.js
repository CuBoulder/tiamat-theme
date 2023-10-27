(function (window, document) {
  document.querySelector('.ucb-search-link').addEventListener('click', function (event) {
    event.preventDefault();
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.removeAttribute('hidden');
    searchModal.querySelector('.ucb-search-input-text input').focus();
    window.setTimeout(function () {
      searchModal.className = searchModal.className.replace('opacity-0', 'opacity-100');
    }, 0);
  });

  document.querySelector('.ucb-search-modal .ucb-search-modal-close').addEventListener('click', function (event) {
    event.preventDefault();
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.setAttribute('hidden', '');
    searchModal.className = searchModal.className.replace('opacity-100', 'opacity-0');
    document.querySelector('.ucb-search-link').focus();
  });
})(window, document);
