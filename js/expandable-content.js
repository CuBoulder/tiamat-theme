
(function() {
    var accordionSection = window.location.hash;
    var expandableLocation = document.getElementById(accordionSection.substring(1));
    if (accordionSection.length) {
        const accordionHeaders = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("expandableHeaders");
        const accordionTexts = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("accordion-collapse");
        for (let i = 0; i < accordionHeaders.length; i++) {
            accordionHeaders[i].setAttribute("aria-expanded", "false")
            accordionHeaders[i].setAttribute("aria-selected", "false")
            accordionHeaders[i].classList.add('collapsed');
            accordionHeaders[i].classList.remove("active");
          }
          for (let i = 0; i < accordionTexts.length; i++) {
            accordionTexts[i].classList.remove('show');
          }
       expandableLocation.classList.remove('collapsed');
       expandableLocation.classList.add('active');
       expandableLocation.setAttribute("aria-expanded", "true");
       expandableLocation.setAttribute("aria-selected", "true");
       expandableLocation.parentNode.parentNode.parentNode.classList.add('hello');
       const hello = expandableLocation.parentNode.parentNode.getElementsByClassName("accordion-collapse");
          if(hello.length) {
       hello[0].classList.add("show");

          }
    }
 
 })();