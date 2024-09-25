document.addEventListener("DOMContentLoaded", () => {
  const checkMenuExistence = document.getElementsByClassName("ucb-main-nav-container")[0];
  if (checkMenuExistence != null) {
    const quantityMenus = checkMenuExistence.getElementsByClassName("menu-item");
    if(quantityMenus.length < 1) {
      document.getElementById("ucb-mobile-menu-toggle").style.display = "none";
    }
  }

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
});
