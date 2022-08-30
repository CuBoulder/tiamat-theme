document.querySelectorAll(".webform-submission-form").forEach((item) => {
  item.addEventListener("submit", () => {
    const submitButton = item.querySelector(".webform-button--submit");
    const newItem = document.createElement("span");
    newItem.innerHTML = "Submission in progress!";
    submitButton.parentNode.replaceChild(newItem, submitButton);
  });
});
