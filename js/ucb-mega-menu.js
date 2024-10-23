//Adds the column value to the column wrapper
let megaMenuLinks = document.getElementsByClassName("ucb-mega-menu-outer-link");
let megaMenuColumns = document.getElementsByClassName("ucb-mega-menu-column-wrapper");
for (let i = 0; i < megaMenuLinks.length; i++) {
  let megaMenuColumnCount = megaMenuColumns[i].children.length;
  if(megaMenuColumnCount < 3) {
    megaMenuColumnCount = 3;
  }
  if(megaMenuColumnCount > 6) {
    megaMenuColumnCount = 6;
  }
  megaMenuColumns[i].classList.add("ucb-mega-menu-column-" + megaMenuColumnCount);
}

const megaMenuElementList = document.querySelectorAll('.ucb-mega-menu');
const megaMenuList = [...megaMenuElementList].map(collapseEl => new bootstrap.Collapse(collapseEl,{ toggle: false}));

 //Add an event listener to check if the user clicked outside the mega menu, then close the mega menu
 window.addEventListener('click', function(e){
  const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu");
  const allMainMenus =  document.getElementsByClassName("block-system-menu-blockmain");
  for (let i = 0; i < allMegaMenus.length; i++) {
    for (let j = 0; j < allMainMenus.length; j++) {
      if (!allMegaMenus[i].contains(e.target) && !allMainMenus[j].contains(e.target) && allMegaMenus[i].classList.contains("show")){
        megaMenuList[i].hide();
      }
    }
  }
})

// Disable Sticky Menu Mega Menus
const stickyMenu = document.getElementsByClassName("ucb-sticky-menu");
for (let i = 0; i < stickyMenu.length; i++) {
  const allMegaMenus =  stickyMenu[i].getElementsByClassName("ucb-mega-menu-outer-link");
  for (let j = 0; j < allMegaMenus.length; j++) {
    allMegaMenus[j].removeAttribute("data-bs-toggle");
    allMegaMenus[j].removeAttribute("data-bs-target");
    allMegaMenus[j].removeAttribute("aria-expanded");
    allMegaMenus[j].removeAttribute("aria-controls");
  }
}

// Disable Footer Menu Mega Menus
const footerMenus = document.getElementsByClassName("ucb-footer-top");
for (let i = 0; i < footerMenus.length; i++) {
  const allMegaMenus =  footerMenus[i].getElementsByClassName("ucb-mega-menu-outer-link");
  for (let j = 0; j < allMegaMenus.length; j++) {
    allMegaMenus[j].removeAttribute("data-bs-toggle");
    allMegaMenus[j].removeAttribute("data-bs-target");
    allMegaMenus[j].removeAttribute("aria-expanded");
    allMegaMenus[j].removeAttribute("aria-controls");
  }
}

// Disable Below Content Menu Mega Menus
const belowContentMenus = document.getElementsByClassName("ucb-below-content-region");
for (let i = 0; i < belowContentMenus.length; i++) {
  const allMegaMenus =  belowContentMenus[i].getElementsByClassName("ucb-mega-menu-outer-link");
  for (let j = 0; j < allMegaMenus.length; j++) {
    allMegaMenus[j].removeAttribute("data-bs-toggle");
    allMegaMenus[j].removeAttribute("data-bs-target");
    allMegaMenus[j].removeAttribute("aria-expanded");
    allMegaMenus[j].removeAttribute("aria-controls");
  }
}

// Disable Above Content Menu Mega Menus
const aboveContentMenus = document.getElementsByClassName("ucb-above-content-region");
for (let i = 0; i < aboveContentMenus.length; i++) {
  const allMegaMenus =  aboveContentMenus[i].getElementsByClassName("ucb-mega-menu-outer-link");
  for (let j = 0; j < allMegaMenus.length; j++) {
    allMegaMenus[j].removeAttribute("data-bs-toggle");
    allMegaMenus[j].removeAttribute("data-bs-target");
    allMegaMenus[j].removeAttribute("aria-expanded");
    allMegaMenus[j].removeAttribute("aria-controls");
  }
}