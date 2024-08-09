function megaMenuClicked(blockName) {
    const allMegaMenus =  document.getElementsByClassName("ucb-mega-menu-wrapper");
    const blockID =  document.getElementsByClassName("block-" + blockName);
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