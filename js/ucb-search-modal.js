(function (window, document) {
  let keyListener;

  function showModal() {
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.removeAttribute('hidden');
    searchModal.querySelector('.ucb-search-input-text input').focus();
    window.setTimeout(function () {
      searchModal.className = searchModal.className.replace('opacity-0', 'opacity-100');
    }, 0);
    keyListener = document.addEventListener('keyup', function (event) {
      if(event.key == 'Escape' || event.key == 'Esc' || event.keyCode == 27)
        hideModal();
    });
  }

  function hideModal() {
    const searchModal = document.querySelector('.ucb-search-modal');
    searchModal.setAttribute('hidden', '');
    searchModal.className = searchModal.className.replace('opacity-100', 'opacity-0');
    document.querySelector('.ucb-search-link').focus();
    document.removeEventListener('keypress', keyListener);
  }

  document.querySelector('.ucb-search-link').addEventListener('click', function (event) {
    event.preventDefault();
    showModal();
  });

  document.querySelector('.ucb-search-modal .ucb-search-modal-close').addEventListener('click', function (event) {
    event.preventDefault();
    hideModal();
  });

  document.querySelector('.ucb-search-modal .ucb-search-modal-backdrop').addEventListener('click', function (event) {
    event.preventDefault();
    hideModal();
  });

})(window, document);
