(function (document) {
  document.querySelector('.ucb-search-link').addEventListener('click', function (event) {
    event.preventDefault();
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.removeAttribute('hidden');
  });

  document.querySelector('.ucb-search-modal .ucb-search-modal-close').addEventListener('click', function (event) {
    event.preventDefault();
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.setAttribute('hidden', '');
  });
})(document);
