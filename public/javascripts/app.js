function showForm() {
  const addContactsButtons = [...document.querySelectorAll(".add-contact")];
  addContactsButtons.forEach(button => {
    button.addEventListener("click", event => {
      toggleForm();
    });
  });
}

function toggleForm() {
  const $form = $("#form-container");
  const $main = $("main");
  $form.slideToggle();
  $main.slideToggle();
}

function cancelCreateContact() {
  const $cancel = $("#cancel-create-contact");
  $cancel.click(() => toggleForm());
}

function submitForm() {
  const $submit = $("#submit");
  $submit.click(event => {
    event.preventDefault();
    console.log("fava");
  });
}

document.addEventListener("DOMContentLoaded", () => {

  // attach click event listeners to the add contact buttons to show form
  showForm();
  // attach click event listeners to the add contact buttons to restore main page
  cancelCreateContact();
  // attach click event listener to submit button in the form
  submitForm();
});
