document.addEventListener("DOMContentLoaded", () => {

// Add columns for Below Content Menus
let totalMenus = 0;
const belowContentRegion = document.getElementsByClassName("ucb-below-content-region");
for (let i = 0; i < belowContentRegion.length; i++) {
  const allBelowContentMenus =  belowContentRegion[i].getElementsByClassName("ucb-system-menu-block");
  totalMenus =  allBelowContentMenus.length;
  for (let j = 0; j < allBelowContentMenus.length; j++) {
    allBelowContentMenus[j].classList.add("ucb-menu-column-" + totalMenus);
    allBelowContentMenus[j].parentElement.classList.add("ucb-menu-column-wrapper");
  }
}

// Add columns for Above Content Menus
 totalMenus = 0;
const aboveContentRegion = document.getElementsByClassName("ucb-above-content-region");
for (let i = 0; i < aboveContentRegion.length; i++) {
  const allAboveContentMenus =  aboveContentRegion[i].getElementsByClassName("ucb-system-menu-block");
  totalMenus =  allAboveContentMenus.length;
  for (let j = 0; j < allAboveContentMenus.length; j++) {
    allAboveContentMenus[j].classList.add("ucb-menu-column-" + totalMenus);
    allAboveContentMenus[j].parentElement.classList.add("ucb-menu-column-wrapper");
  }
}

// Add columns for Footer Menus
totalMenus = 0;
const footerRegion = document.getElementsByClassName("ucb-footer-top");
for (let i = 0; i < footerRegion.length; i++) {
  const footerMenus =  footerRegion[i].getElementsByClassName("ucb-system-menu-block");
  totalMenus =  footerMenus.length;
  for (let j = 0; j < footerMenus.length; j++) {
    footerMenus[j].classList.add("ucb-menu-column-" + totalMenus);
    footerMenus[j].parentElement.classList.add("ucb-menu-column-wrapper");
  }
}

//Build Mobile Menu
  let quantityMenusLength = 0;
  const checkMenuExistence = document.getElementsByClassName("ucb-main-nav-container")[0];
  if (checkMenuExistence != null) {
    const quantityMenus = checkMenuExistence.getElementsByClassName("menu-item");
    quantityMenusLength = quantityMenus.length;
    if(quantityMenus.length < 1 && document.getElementById("ucb-mobile-menu-toggle") != null) {
      document.getElementById("ucb-mobile-menu-toggle").style.display = "none";
    }
  }
  if(quantityMenusLength > 0) {
    const sectionCheck = document.getElementsByClassName("ucb-main-nav-section")[0];
    if (sectionCheck != null) {
      const menuCheck = sectionCheck.getElementsByClassName("ucb-main-nav-container")[0];
      if (menuCheck != null) {
        const mobileMenu = new AccessibleMenu.DisclosureMenu({
          menuElement: menuCheck,
          controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
          containerElement: sectionCheck,
          openClass: "open",
        });
      }
    }
  }
});
