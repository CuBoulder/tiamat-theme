document.addEventListener("DOMContentLoaded", function () {
  // Check if there is a hash in the URL and open the corresponding item
  if (window.location.hash) {
    openAccordionItem(window.location.hash.substring(1));
  }

  // Add event listeners for all accordion or tab elements
  document.querySelectorAll('.accordion-button, .expandableHeaders').forEach(function (link) {
    link.addEventListener("click", function () {
      const href = this.getAttribute("href");
      if (href) {
        const hash = href.substring(1);
        setHashWithoutJump(hash);
      }
    });
  });
});

// Function to set the URL hash without causing the page to jump
function setHashWithoutJump(hash) {
  if (history.pushState) {
    history.pushState(null, null, "#" + hash);
  } else {
    window.location.hash = hash;
  }
}

// Function to open an accordion or tab item based on the hash
function openAccordionItem(hash) {
  if (!hash) return;

  // Try to find the link that matches the hash
  const targetLink = document.querySelector(`.accordion-button[href="#${hash}"], .nav-link[href="#${hash}"]`);
  if (targetLink) {
    targetLink.click(); // Programmatically click to open the item
  }
}
