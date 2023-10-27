(function (document) {
  function selectSearchOption(radio) {
    const searchForm = radio.parentElement.parentElement.parentElement;
    searchForm.querySelector('.ucb-search-input-text input').setAttribute('placeholder', radio.dataset['placeholder']);
    searchForm.setAttribute('action', radio.dataset['action']);
  }
  const searchBoxOptions = document.getElementsByClassName('ucb-search-box-options');
  for (let i = 0; i < searchBoxOptions.length; i++) {
    const radios = searchBoxOptions[i].getElementsByTagName('input');
    for (let j = 0; j < radios.length; j++) {
      if (radios[j].checked)
        selectSearchOption(radios[j]);
      radios[j].parentElement.addEventListener('change', function (event) {
        const radio = event.target;
        if (radio.checked)
          selectSearchOption(radio);
      });
    }
  }
})(document);
