document.addEventListener("DOMContentLoaded", () => {
  
  const mainCheck = document.getElementsByClassName("ucb-primary-menu-region-container")[0];
  if (mainCheck != null) {
  const mainMenuCheck = mainCheck.getElementsByClassName("ucb-menu")[0];
  if (mainMenuCheck != null) {
    const mainMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: mainMenuCheck,
    controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
    containerElement: document.getElementsByClassName("ucb-primary-menu-region-container")[0],
    openClass: "open",
  });
}
  }
const secondaryCheck = document.getElementsByClassName("ucb-secondary-menu-region-container")[0];
if (secondaryCheck != null) {
  const secondaryMenuCheck = secondaryCheck.getElementsByClassName("ucb-menu")[0];
  if (secondaryMenuCheck != null) {
    const secondaryMenu = new AccessibleMenu.DisclosureMenu({
      menuElement: secondaryMenuCheck,
      controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
      containerElement: document.getElementsByClassName("ucb-secondary-menu-region-container")[0],
      openClass: "open",
    });
  }
}
  const footerCheck = document.getElementsByClassName("ucb-mobile-footer-menu")[0];
  if (footerCheck != null) {
  const footerMenuCheck = footerCheck.getElementsByClassName("ucb-menu")[0];
  if (footerMenuCheck != null) {
    const footerMenu = new AccessibleMenu.DisclosureMenu({
      menuElement: footerMenuCheck,
      controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
      containerElement: document.getElementsByClassName("ucb-mobile-footer-menu")[0],
      openClass: "open",
    });
  }
}
  const socialSecondaryCheck = document.getElementsByClassName("ucb-mobile-social-media-menu")[0]
  if (socialSecondaryCheck != null) {
   const socialSecondaryMenuCheck = socialSecondaryCheck.getElementsByClassName("social-media")[0];
   if (socialSecondaryMenuCheck != null) {
     const socialSecondaryMenu = new AccessibleMenu.DisclosureMenu({
       menuElement: socialSecondaryMenuCheck,
       controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
       containerElement: document.getElementsByClassName("ucb-mobile-social-media-menu")[0],
       openClass: "open",
     });
   }
  }
}
);
