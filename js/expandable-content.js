
(function() {
    var accordionSection = window.location.hash;
    var expandableLocation = document.getElementById(accordionSection.substring(1));
    if (accordionSection.length) {
        const accordionHeaders = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("accordion-button");
        const accordionTexts = expandableLocation.parentNode.parentNode.parentNode.getElementsByClassName("accordion-collapse");
        for (let i = 0; i < accordionHeaders.length; i++) {// header.classList.add("collapsed");
            accordionHeaders[i].setAttribute("aria-expanded", "false")
            accordionHeaders[i].classList.add("collapsed");
            accordionTexts[i].classList.remove('show');
          }
       expandableLocation.classList.remove('collapsed');
       expandableLocation.setAttribute("aria-expanded", "true")
       expandableLocation.parentNode.parentNode.parentNode.classList.add('hello');
       const hello = expandableLocation.parentNode.parentNode.getElementsByClassName("accordion-collapse");

       hello[0].classList.add("show");
       alert("yuh");
    }
 
 })();