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

 //Add an event listener to check if the user clicked outside the mega menu, then close the mega menu
 window.addEventListener('click', function(e){
  const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu");
  const allMainMenus =  document.getElementsByClassName("block-system-menu-blockmain");
  for (let i = 0; i < allMegaMenus.length; i++) {
    for (let j = 0; j < allMainMenus.length; j++) {
      if (!allMegaMenus[i].contains(e.target) && !allMainMenus[j].contains(e.target) && allMegaMenus[i].classList.contains("show")){
        allMegaMenus[i].classList.remove("show");
        allMegaMenus[i].ariaExpanded = "false";
      }
    }
  }
})