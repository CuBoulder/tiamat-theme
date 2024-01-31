/*
This handles the updating hash functionality of an FAQ page's address bar so you can share a specific question:
  - The page will open to that question's answer revealed, if visited with a hashed address.
  - Avoids scroll due to constantly updating hash values while on the page, way less annoying.

Uses built in bootstrap collapse events for timings of all this:
  https://getbootstrap.com/docs/4.0/components/collapse/
*/

document.addEventListener('DOMContentLoaded', function() {
  // Handle page load with a specific hash
  if (window.location.hash) {
    openAccordionItem(window.location.hash.substring(1));
  }

  // Event listener for accordion collapse events (these events are from bootstrap!)
  var collapseElements = document.querySelectorAll('.accordion-collapse');
  collapseElements.forEach(function(collapseElement) {
    // Event when an accordion item finishes opening
    collapseElement.addEventListener('shown.bs.collapse', function() {
      var h3Element = collapseElement.previousElementSibling.querySelector('h3');
      var hrefId = h3Element ? h3Element.id : null;
      if (hrefId) {
        setHashWithoutJump(hrefId);
      }
    });

    // Event when an accordion item finishes closing
    collapseElement.addEventListener('hidden.bs.collapse', function() {
      var h3Element = collapseElement.previousElementSibling.querySelector('h3');
      var hrefId = h3Element ? h3Element.id : null;
      if (hrefId && window.location.hash.substring(1) === hrefId) {
        setHashWithoutJump('');
      }
    });
  });
});

// Function to update the URL hash based on the collapse state
function updateHashBasedOnCollapseState(collapseElement, hrefId) {
  if (collapseElement.classList.contains('show')) {
    // Update the hash if the item is being opened
    setHashWithoutJump(hrefId);
  } else {
    // Clear the hash if the item is being closed
    setHashWithoutJump('');
  }
}

// Function to set the URL hash without affecting the scroll position
function setHashWithoutJump(hash) {
  var scrollV, scrollH, loc = window.location;
  if ("pushState" in history) {
    if (hash) {
      history.pushState("", document.title, loc.pathname + loc.search + '#' + hash);
    } else {
      history.pushState("", document.title, loc.pathname + loc.search);
    }
  } else {
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;
    loc.hash = hash;
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

// Function to open the accordion item for the given hash
function openAccordionItem(hash) {
  var targetAccordionTitle = document.getElementById(hash);
  if (targetAccordionTitle) {
    var collapseElement = targetAccordionTitle.closest('.accordion-item').querySelector('.accordion-collapse');
    if (collapseElement && !collapseElement.classList.contains('show')) {
      var button = collapseElement.previousElementSibling.querySelector('.accordion-button');
      if (button) {
        button.click();
      }
    }
  }
}



