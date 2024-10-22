(function () {
  var accordionSection = window.location.hash;
  var expandableLocation = document.getElementById(
    accordionSection.substring(1)
  );
  if (accordionSection.length) {
    const expandableHeaders =
      expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName(
        "expandableHeaders"
      );
    const accordionTexts =
      expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName(
        "accordion-collapse"
      );
    for (let i = 0; i < expandableHeaders.length; i++) {
      expandableHeaders[i].setAttribute("aria-expanded", "false");
      expandableHeaders[i].setAttribute("aria-selected", "false");
      expandableHeaders[i].classList.add("collapsed");
      expandableHeaders[i].classList.remove("active");
    }
    for (let i = 0; i < accordionTexts.length; i++) {
      accordionTexts[i].classList.remove("show");
    }
    expandableLocation.classList.remove("collapsed");
    expandableLocation.classList.add("active");
    expandableLocation.setAttribute("aria-expanded", "true");
    expandableLocation.setAttribute("aria-selected", "true");
    const accordionDiv =
      expandableLocation.parentNode.parentNode.getElementsByClassName(
        "accordion-collapse"
      );
    if (accordionDiv.length) {
      accordionDiv[0].classList.add("show");
    }
  }
})();

/*
This handles the updating hash functionality of an expandable block's address bar so you can share a specific question:

Uses built in bootstrap collapse events for timings of all this:
  https://getbootstrap.com/docs/5.0/components/collapse/
*/

document.addEventListener("DOMContentLoaded", function () {
  // Handle page load with a specific hash
  if (window.location.hash) {
    openAccordionItem(window.location.hash.substring(1));
  }

  // Event listener for accordion collapse events (these events are from bootstrap!)
  var collapseElements = document.querySelectorAll(".accordion-collapse");
  collapseElements.forEach(function (collapseElement) {
    // Event when an accordion item finishes opening
    collapseElement.addEventListener("shown.bs.collapse", function () {
      var h3Element =
        collapseElement.previousElementSibling.querySelector("h3");
      var hrefId = h3Element ? h3Element.id : null;
      if (hrefId) {
        setHashWithoutJump(hrefId);
      }
    });

    // Event when an accordion item finishes closing
    collapseElement.addEventListener("hidden.bs.collapse", function () {
      var h3Element =
        collapseElement.previousElementSibling.querySelector("h3");
      var hrefId = h3Element ? h3Element.id : null;
      if (hrefId && window.location.hash.substring(1) === hrefId) {
        setHashWithoutJump("");
      }
    });
  });
});

// Function to update the URL hash based on the collapse state
function updateHashBasedOnCollapseState(collapseElement, hrefId) {
  if (collapseElement.classList.contains("show")) {
    // Update the hash if the item is being opened
    setHashWithoutJump(hrefId);
  } else {
    // Clear the hash if the item is being closed
    setHashWithoutJump("");
  }
}

// Function to set the URL hash without affecting the scroll position
function setHashWithoutJump(hash) {
  var scrollV,
    scrollH,
    loc = window.location;
  if ("pushState" in history) {
    if (hash) {
      history.pushState(
        "",
        document.title,
        loc.pathname + loc.search + "#" + hash
      );
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
  if (!hash) return; // Do nothing if no hash is provided, keeps active classes from being killed

  // Find the correct tab-link or accordion-button using the hash
  var targetNavLink = document.querySelector(`.nav-link[href="#${hash}"], .accordion-button[href="#${hash}"]`);
  if (targetNavLink) {
    var container = targetNavLink.closest('.accordian-content, .horizontal-tab-accordion, .vertical-tab-accordion');
    
    if (container) {
      // Collapse all other accordion-items or tab-panes in the same container
      container.querySelectorAll('.accordion-collapse.show, .tab-pane.show').forEach(function (tabPane) {
        tabPane.classList.remove('active', 'show');
        tabPane.previousElementSibling.querySelector('.accordion-button').classList.add('collapsed');
        tabPane.previousElementSibling.querySelector('.accordion-button').setAttribute('aria-expanded', 'false');
      });

      // Remove active classes from any active nav-link or accordion button in the container
      container.querySelectorAll('.nav-link.active, .accordion-button.active').forEach(function (navLink) {
        navLink.classList.remove('active');
        navLink.setAttribute('aria-selected', 'false');
        navLink.setAttribute('tabindex', '-1');
      });
    }

    // Add the active class to the targeted nav-link or accordion button
    targetNavLink.classList.add('active');
    targetNavLink.setAttribute('aria-selected', 'true');
    targetNavLink.setAttribute('tabindex', '0');
    
    // Find the correct tab-pane or accordion-collapse using the hash
    var targetTabPane = document.getElementById(hash);
    if (targetTabPane) {
      targetTabPane.classList.add('active', 'show');
      targetTabPane.previousElementSibling.querySelector('.accordion-button').classList.remove('collapsed');
      targetTabPane.previousElementSibling.querySelector('.accordion-button').setAttribute('aria-expanded', 'true');
    }
  }
}
