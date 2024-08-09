function megaMenuClicked(blockName) {
    alert(blockName)
    const blockID =  document.getElementsByClassName("block-" + blockName);
    console.log(blockID);
    for (let i = 0; i < blockID.length; i++) {
        if(blockID[i].classList.contains("collapse"))
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