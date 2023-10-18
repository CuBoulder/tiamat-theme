
document.addEventListener("DOMContentLoaded", () => {
  const mainMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: document.querySelector("#ucb-main-menu"),
    controllerElement: document.querySelector("#example-toggle"),
    containerElement: document.querySelector("#ucb-main-menu-nav"),
    openClass: "open",
  });
  const secondaryWrapper = document.querySelector(".ucb-secondary-menu-region-container")
  const secondaryMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: document.getElementById("ucb-secondary-menu-region-container").getElementsByClassName("ucb-menu")[0],
    controllerElement: document.querySelector("#example-toggle"),
    containerElement: secondaryWrapper,
    openClass: "open",
  });

  const footerMenu = new AccessibleMenu.DisclosureMenu({
    menuElement: document.getElementById("ucb-mobile-footer-menu").getElementsByClassName("ucb-menu")[0],
    controllerElement: document.querySelector("#example-toggle"),
    containerElement: secondaryWrapper,
    openClass: "open",
  });
});
