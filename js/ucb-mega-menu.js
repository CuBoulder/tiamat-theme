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

const megaMenuLinks = document.getElementsByClassName("ucb-mega-menu-outer-link");
for (let i = 0; i < megaMenuLinks.length; i++) {
    console.log(megaMenuLinks[i].dataset.checktt)
    if(megaMenuLinks[i].dataset.click.length > 0)
    megaMenuLinks[i].addEventListener("click", function(event){
        megaMenuClicked(megaMenuLinks[i].dataset.click);
    });
}

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