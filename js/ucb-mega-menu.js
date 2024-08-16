//Triggers when the mega menu link is clicked to show or hide the mega menu
function megaMenuClicked(blockName) {
  const blockID =  document.getElementsByClassName("block-" + blockName);
  let allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
  let blockState = 0;
  for (let i = 0; i < blockID.length; i++) {
    if(blockID[i].classList.contains("show")) {
      blockState = 1;
    }
  }

  for (let i = 0; i < allMegaMenus.length; i++) {
    if(allMegaMenus[i].classList.contains("show"))
    {
      allMegaMenus[i].classList.remove("show");
      allMegaMenus[i].classList.add("collapse");
    }
  }

  for (let i = 0; i < blockID.length; i++) {
    if(blockState == 0)
    {
      blockID[i].classList.add("show");
      blockID[i].classList.remove("collapse");
    }
    else {
      blockID[i].classList.add("collapse");
      blockID[i].classList.remove("show");
    }
  }
};

//Adds the click event listener to all mega menu outer links
let megaMenuLinks = document.getElementsByClassName("ucb-mega-menu-outer-link");
for (let i = 0; i < megaMenuLinks.length; i++) {
  if(megaMenuLinks[i].dataset.click.length > 0) {
    megaMenuLinks[i].addEventListener("click", function(event){
      event.preventDefault();
      megaMenuClicked(megaMenuLinks[i].dataset.click);
    });
  }
}

//Adds the column value to the column wrapper
let megaMenuColumns = document.getElementsByClassName("ucb-mega-menu-column-wrapper");
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

 //Add an even listener to check if the user clicked outside the mega menu, then close the mega menu
 window.addEventListener('click', function(e){
  const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
  const allMainMenus =  document.getElementsByClassName("block-system-menu-blockmain");
  for (let i = 0; i < allMegaMenus.length; i++) {
    for (let j = 0; j < allMainMenus.length; j++) {
      if (!allMegaMenus[i].contains(e.target) && !allMainMenus[j].contains(e.target) && allMegaMenus[i].classList.contains("show")){
        console.log(allMegaMenus[i].classList);
        allMegaMenus[i].classList.remove("show");
        allMegaMenus[i].classList.add("collapse");
      }
    }
  }
})