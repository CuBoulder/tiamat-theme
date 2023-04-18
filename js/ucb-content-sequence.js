let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("horizontal-cards");
  let dots = document.getElementsByClassName("dot-wrapper");
  if (n > slides.length) {slideIndex = slides.length}
  if (n < 1) {slideIndex = 1}
  for (i = 0; i < slides.length; i++) {
    slides[i].className = "horizontal-cards cardsHidden";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = "dot-wrapper dotPrevious";
  }

  for (i = slideIndex; i < dots.length; i++) {
    dots[i].className = "dot-wrapper dotNext";
  }
  slides[slideIndex-1].className = "horizontal-cards cardsActive";
  dots[slideIndex-1].className = "dot-wrapper dotActive";
}


function scrollNext() {

    let dots = document.getElementsByClassName("dot-wrapper");
    let parentSlider = document.getElementsByClassName("horizontal-timeline-slider-header");
    const parentRect = parentSlider[0].getBoundingClientRect();
      let childSlider = document.getElementsByClassName("horizontal-timeline-slider-header-wrapper");
      const childRect = childSlider[0].getBoundingClientRect();
    if((dots.length-3) * ((parentRect.right - parentRect.left)/3) - (parentRect.right-childRect.right) + 1 > 0) {
          const newX = childRect.left - parentRect.left - 161;
        childSlider[0].style.transform = "translate(" + newX  + "px)";
    }
  }

function scrollPrevious() {

    let parentSlider = document.getElementsByClassName("horizontal-timeline-slider-header");
    const parentRect = parentSlider[0].getBoundingClientRect();
      let childSlider = document.getElementsByClassName("horizontal-timeline-slider-header-wrapper");
      const childRect = childSlider[0].getBoundingClientRect();
      if(parentRect.left - childRect.left > 0) {
          const newX = childRect.left - parentRect.left + 159;
        childSlider[0].style.transform = "translate(" + newX  + "px)";
      }
  }