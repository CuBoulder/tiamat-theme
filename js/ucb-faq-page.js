/*
This handles the updating hash functionality of an FAQ page's address bar so you can share a specific question.
The page will open to that question's answer revealed if visited with a hashed address
*/

document.addEventListener('DOMContentLoaded', function() {
  // Handle page load with a specific hash
  if (window.location.hash) {
    openAccordionItem(window.location.hash.substring(1));
  }

  // Bootstrap collapse events to handle URL hash update
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function(item) {
    var collapseElement = item.querySelector('.accordion-collapse');
    var hrefId = item.querySelector('h3').id;

    // Event when an accordion item finishes opening
    collapseElement.addEventListener('shown.bs.collapse', function() {
      window.location.hash = hrefId;
    });

    // Event when an accordion item finishes closing
    collapseElement.addEventListener('hidden.bs.collapse', function() {
      if (window.location.hash.substring(1) === hrefId) {
        window.location.hash = '';
      }
    });
  });
});

// Function to open the accordion item for the given hash
function openAccordionItem(hash) {
  var targetAccordionTitle = document.getElementById(hash);
  if (targetAccordionTitle) {
    var collapseElement = targetAccordionTitle.closest('.accordion-item').querySelector('.accordion-collapse');
    if (collapseElement && !collapseElement.classList.contains('show')) {
      var button = collapseElement.previousElementSibling.querySelector('.accordion-button');
      if (button) {
        button.click(); // Trigger a click to open the accordion
      }
    }
  }
}

