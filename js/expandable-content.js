
(function() {
    var accordionSection = window.location.hash;
    var expandableLocation = document.getElementById(accordionSection.substring(1));
    if (accordionSection.length) {
        const expandableHeaders = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("expandableHeaders");
        const accordionTexts = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("accordion-collapse");
        for (let i = 0; i < expandableHeaders.length; i++) {
            expandableHeaders[i].setAttribute("aria-expanded", "false")
            expandableHeaders[i].setAttribute("aria-selected", "false")
            expandableHeaders[i].classList.add('collapsed');
            expandableHeaders[i].classList.remove("active");
          }
          for (let i = 0; i < accordionTexts.length; i++) {
            accordionTexts[i].classList.remove('show');
          }
       expandableLocation.classList.remove('collapsed');
       expandableLocation.classList.add('active');
       expandableLocation.setAttribute("aria-expanded", "true");
       expandableLocation.setAttribute("aria-selected", "true");
       const accordionDiv = expandableLocation.parentNode.parentNode.getElementsByClassName("accordion-collapse");
          if(accordionDiv.length) {
       accordionDiv[0].classList.add("show");

          }
    }
 
 })();