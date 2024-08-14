//Triggers when the mega menu link is clicked to show or hide the mega menu
function megaMenuClicked(blockName) {
  const blockID =  document.getElementsByClassName("block-" + blockName);
  const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
  let blockState = 0;
  for (let i = 0; i < blockID.length; i++) {
    if(blockID[i].classList.contains("show")) {
      blockState = 1;
    }
  }
  for (let i = 0; i < allMegaMenus.length; i++) {
    if(allMegaMenus[i].classList.contains("show"))
    {
      allMegaMenus[i].classList.remove("show")
      allMegaMenus[i].classList.add("collapse")
    }
  }
  for (let i = 0; i < blockID.length; i++) {
    if(blockState == 0)
    {
      blockID[i].classList.add("show")
      blockID[i].classList.remove("collapse")
    }
    else {
      blockID[i].classList.add("collapse")
      blockID[i].classList.remove("show")
    }
  }
};

//Adds the click event listener to all mega menu outer links
const megaMenuLinks = document.getElementsByClassName("ucb-mega-menu-outer-link");
for (let i = 0; i < megaMenuLinks.length; i++) {
  if(megaMenuLinks[i].dataset.click.length > 0) {
    megaMenuLinks[i].addEventListener("click", function(event){
      event.preventDefault();
      megaMenuClicked(megaMenuLinks[i].dataset.click);
    });
  }
}

//Adds the column value to the column wrapper
const megaMenuColumns = document.getElementsByClassName("ucb-mega-menu-column-wrapper");
for (let i = 0; i < megaMenuLinks.length; i++) {
  let megaMenuColumnCount = megaMenuColumns[i].children.length;
  if(megaMenuColumnCount < 6) {
    megaMenuColumnCount = 3;
  }
  if(megaMenuColumnCount > 6) {
    megaMenuColumnCount = 6;
  }
  megaMenuColumns[i].classList.add("ucb-mega-menu-column-" + megaMenuColumnCount);
}

//Adds a method for hiding the mega menu in mobile views when the mobile menu isn't open
document.getElementById("ucb-mobile-menu-toggle").addEventListener("click", function(event){
  resizeFn();
});

function resizeFn() {
  if(window.innerWidth < 577) {
    if(document.getElementById("ucb-mobile-menu-toggle").ariaExpanded.toString().localeCompare("false")==0) {
      const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
      for (let i = 0; i < allMegaMenus.length; i++) {
        if(allMegaMenus[i].classList.contains("show"))
        {
          allMegaMenus[i].classList.remove("show")
          allMegaMenus[i].classList.add("collapse")
        }
      }
    }
  }
}
window.onresize = resizeFn;

 //Add an even listener to check if the user clicked outside the mega menu, then close the mega menu
 window.addEventListener('click', function(e){
  const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
  const allMainMenus =  document.getElementsByClassName("block-system-menu-blockmain");
  for (let i = 0; i < allMegaMenus.length; i++) {
    for (let j = 0; i < allMainMenus.length; i++) {
      if (!allMegaMenus[i].contains(e.target) && !allMainMenus[j].contains(e.target) && allMegaMenus[i].classList.contains("show")){
        allMegaMenus[i].classList.remove("show")
        allMegaMenus[i].classList.add("collapse")
      }
    }
  }
})