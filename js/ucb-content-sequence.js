let slideIndex = 1;

// Next/previous controls
function plusSlides(n) {
  showSlides((slideIndex += n));
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides((slideIndex = n));
}

function scrollSlides(n) {
  let i = 0;
  let dots = document.getElementsByClassName("dot-wrapper");
  for (i = 0; i < n + 1; i++) {
    dots[i].className = "dot-wrapper dotPrevious";
  }
  for (i = n + 1; i < dots.length; i++) {
    dots[i].className = "dot-wrapper dotNext";
  }
  dots[n].className = "dot-wrapper dotActive";
}

function scrollNext() {
  let dots = document.getElementsByClassName("dot-wrapper");
  let parentSlider = document.getElementsByClassName(
    "horizontal-timeline-slider-header"
  );
  const parentRect = parentSlider[0].getBoundingClientRect();
  let childSlider = document.getElementsByClassName(
    "horizontal-timeline-slider-header-wrapper"
  );
  const childRect = childSlider[0].getBoundingClientRect();
  if (
    (dots.length - 3) * ((parentRect.right - parentRect.left) / 3) -
      (parentRect.right - childRect.right) +
      1 >
    0
  ) {
    const newX = childRect.left - parentRect.left - 161;
    childSlider[0].style.transition = "translate .5s";
    childSlider[0].style.translate = newX + "px";
  }
}

function scrollPrevious() {
  let parentSlider = document.getElementsByClassName(
    "horizontal-timeline-slider-header"
  );
  const parentRect = parentSlider[0].getBoundingClientRect();
  let childSlider = document.getElementsByClassName(
    "horizontal-timeline-slider-header-wrapper"
  );
  const childRect = childSlider[0].getBoundingClientRect();
  if (parentRect.left - childRect.left > 0) {
    const newX = childRect.left - parentRect.left + 159;
    childSlider[0].style.transition = "translate .5s";
    childSlider[0].style.translate = newX + "px";
  }
}

function clickNext() {
  let i = 0;
  let n = 0;
  let dots = document.getElementsByClassName("dot-wrapper");
  if (dots[dots.length - 1].className.indexOf("dotActive") > -1) {
    n = 0;
  } else {
    for (i = 0; i < dots.length - 1; i++) {
      if (dots[i].className.indexOf("dotActive") > -1) {
        n = i + 1;
      }
    }
  }
  scrollSlides(n);
}

function clickPrevious() {
  let i = 0;
  let n = 0;
  let dots = document.getElementsByClassName("dot-wrapper");
  if (dots[0].className.indexOf("dotActive") > -1) {
    n = dots.length-1;
  } else {
    for (i = 1; i < dots.length; i++) {
      if (dots[i].className.indexOf("dotActive") > -1) {
        n = i - 1;
      }
    }
  }
  scrollSlides(n);
}