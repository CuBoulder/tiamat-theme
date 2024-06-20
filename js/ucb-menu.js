document.addEventListener("DOMContentLoaded", () => {
  
  const mainMenuCheck = document.getElementsByClassName("ucb-primary-menu-region-container")[0].getElementsByClassName("ucb-menu")[0];
  if (mainMenuCheck != null) {
    const mainMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: mainMenuCheck,
    controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
    containerElement: document.getElementsByClassName("ucb-primary-menu-region-container")[0],
    openClass: "open",
  });
}
  const secondaryCheck = document.getElementsByClassName("ucb-secondary-menu-region-container")[0].getElementsByClassName("ucb-menu")[0];
  if (secondaryCheck != null) {
    const secondaryMenu = new AccessibleMenu.DisclosureMenu({
      menuElement: secondaryCheck,
      controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
      containerElement: document.getElementsByClassName("ucb-secondary-menu-region-container")[0],
      openClass: "open",
    });
  }
  const footerCheck = document.getElementsByClassName("ucb-mobile-footer-menu")[0].getElementsByClassName("ucb-menu")[0];
  if (footerCheck != null) {
    const footerMenu = new AccessibleMenu.DisclosureMenu({
      menuElement: footerCheck,
      controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
      containerElement: document.getElementsByClassName("ucb-mobile-footer-menu")[0],
      openClass: "open",
    });
  }
  const socialSecondaryCheck = document.getElementsByClassName("ucb-mobile-social-media-menu")[0].getElementsByClassName("social-media")[0];
  if (socialSecondaryCheck != null) {
    const socialSecondaryMenu = new AccessibleMenu.DisclosureMenu({
      menuElement: socialSecondaryCheck,
      controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
      containerElement: document.getElementsByClassName("ucb-mobile-social-media-menu")[0],
      openClass: "open",
    });
  }
});
