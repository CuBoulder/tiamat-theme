
document.addEventListener("DOMContentLoaded", () => {
  const mainMenuElement = document.querySelector('.ucb-main-menu');
  const mainMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: mainMenuElement,
    controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
    containerElement: mainMenuElement,
    openClass: "open",
  });

  const secondaryWrapper = document.querySelector(".ucb-secondary-menu-region-container")
  const secondaryMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: document.getElementById("ucb-secondary-menu-region-container").getElementsByClassName("ucb-menu")[0],
    controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
    containerElement: secondaryWrapper,
    openClass: "open",
  });

  const footerMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: document.getElementById("ucb-mobile-footer-menu").getElementsByClassName("ucb-menu")[0],
    controllerElement: document.querySelector("#ucb-mobile-menu-toggle"),
    containerElement: secondaryWrapper,
    openClass: "open",
  });
});
