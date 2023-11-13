(function (document) {

  function selectSearchOption(radio) {
    const searchForm = radio.parentElement.parentElement.parentElement;
    const input = searchForm.querySelector('.ucb-search-input-text input');
    input.setAttribute('placeholder', radio.dataset['placeholder']);
    input.setAttribute('name', radio.dataset['parameter']);
    searchForm.setAttribute('action', radio.dataset['action']);
  }

  const searchBoxes = document.getElementsByClassName('ucb-search-box');
  for (let i = 0; i < searchBoxes.length; i++) {
    const searchBoxOptions = searchBoxes[i].querySelector('.ucb-search-box-options');
    if (!searchBoxOptions) continue;
    const radios = searchBoxOptions.getElementsByTagName('input');
    searchBoxes[i].querySelector('form').onsubmit = function (event) {
      for (let j = 0; j < radios.length; j++)
        radios[j].removeAttribute('name');
    };
    for (let j = 0; j < radios.length; j++) {
      if (radios[j].checked)
        selectSearchOption(radios[j]);
      radios[j].addEventListener('change', function (event) {
        const radio = event.target;
        if (radio.checked)
          selectSearchOption(radio);
      });
    }
  }

})(document);
