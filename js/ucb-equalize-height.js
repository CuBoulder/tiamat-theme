function setHeight(el, val) {
  if (typeof val === "function") val = val();
  if (typeof val === "string") el.style.height = val;
  else el.style.height = val + "px";
}

var equalheight = function (container) {
  // eslint-disable-line
  var currentTallest = 0,
    currentRowStart = 0,
    rowDivs = new Array(),
    $el, // eslint-disable-line
    topPosition = 0,
    currentDiv = 0;

  Array.from(document.querySelectorAll(container)).forEach((el, i) => { // eslint-disable-line
    el.style.height = "auto";
    topPosition = el.offsetTop;
    if (currentRowStart != topPosition) {
      for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
        setHeight(rowDivs[currentDiv], currentTallest, container);
      }
      rowDivs.length = 0;
      currentRowStart = topPosition;
      currentTallest = parseFloat(
        getComputedStyle(el, null).height.replace("px", "")
      );
      rowDivs.push(el);
    } else {
      rowDivs.push(el);
      currentTallest =
        currentTallest <
        parseFloat(getComputedStyle(el, null).height.replace("px", ""))
          ? parseFloat(getComputedStyle(el, null).height.replace("px", ""))
          : currentTallest;
    }
    for (currentDiv = 0; currentDiv < rowDivs.length; currentDiv++) {
      setHeight(rowDivs[currentDiv], currentTallest, container);
    }
  });
};

/* 
  Classes to equalize Column Layout images using ucb-equalize-height.js
*/
window.addEventListener("load", function () {
  equalheight(".grid-column .grid-image-container article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-column .grid-image-container article");
  });
});

window.addEventListener("load", function () {
  equalheight(".grid-column .grid-image-container.wide-img article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-column .grid-image-container.wide-img article");
  });
});

/* 
  Classes to equalize Card Layout fields using ucb-equalize-height.js
*/
window.addEventListener("load", function () {
  equalheight(".grid-card .grid-image-container article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-card .grid-image-container article");
  });
});

window.addEventListener("load", function () {
  equalheight(".grid-card .grid-image-container.wide-img article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-card .grid-image-container.wide-img article");
  });
});

window.addEventListener("load", function () {
  equalheight(".grid-card");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-card");
  });
});

/* 
  Classes to equalize Overlay Layout images using ucb-equalize-height.js
*/
window.addEventListener("load", function () {
  equalheight(".overlay-grid-image-container article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".overlay-grid-image-container article");
  });
});

window.addEventListener("load", function () {
  equalheight(".overlay-grid-image-container.wide-img article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".overlay-grid-image-container.wide-img article");
  });
});

/* 
  Classes to equalize using ucb-equalize-height.js
*/
window.addEventListener("load", function () {
  equalheight(".grid-image-container-small .grid-image-container article");
});
window.addEventListener("resize", function () {
  setTimeout(function () {
    equalheight(".grid-image-container-small .grid-image-container article");
  });
});
