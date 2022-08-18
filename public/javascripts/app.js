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

// when user click cancel on form it removes the form and goes back to main page
function cancelCreateContact() {
  const $cancel = $("#cancel-create-contact");
  $cancel.click(() => toggleForm());
}

function nameIsValid(name) {
  // upto three single space separated words of any number of letters
  return name.match(/^[a-zA-Z]+\s?[a-zA-Z]*\s?[a-zA-Z]*$/);
}

function emailIsValid(email) {
  // matches one or more letter, underscore, digit or dot followed by a @
  // followed but same as before then a single dot and one or nmore letter
  return email.match(/^(\w|[0-9]|\.)+@(\w|[0-9]|\.)+\.[a-zA-Z]+$/);
}

function phoneIsValid(phone) {
  // matches a plus sign followed by 9 to 13 digits
  return phone.match(/\+[0-9]{9,13}$/);
}

function addErrorStyles(element) {
  element.classList.add("error-styles");
  element.parentElement.previousElementSibling.classList.add("make-text-red");
}

function removeErrorStyles(element) {
  element.classList.remove("error-styles");
  element.parentElement.previousElementSibling.classList.remove("make-text-red");
}

function generateMessage(element) {
  const text = element.parentElement.previousElementSibling.firstElementChild.textContent;
  // return appropriate text according to which element is passed in
  let message;
  if ( text === "Full name:") {
    message = "Enter upto three single space separated words of any number of letters.";
  } else if (text === "Email address:") {
    message = "Enter one or more letter, underscore, digit or dot followed by a @ followed but same as before then a single dot and one or nmore letter.";
  } else if (text === "Telephone number:") {
    message = "Enter a plus sign followed by 9 to 13 digits.";
  }

  return message;
}

function insertErrorMessage(element) {
  // this checks and only inserts the error message if it hasn't already been set
  if (!element.nextElementSibling) {
    const message = generateMessage(element);
    const text = document.createTextNode(message);
    const p = document.createElement("p");
    p.classList.add("make-text-red");
    p.appendChild(text);
    element.insertAdjacentElement("afterend", p);
  }
}

function removeErrorMessage(element) {
  if (element.nextElementSibling) {
    element.nextElementSibling.remove();
  }
}

function handleErrorStyles(name, email, phone) {
  const $elements = $("form")[0].elements;
  const nameInput = $elements[0];
  const emailInput = $elements[1];
  const phoneInput = $elements[2];

  if (!nameIsValid(name)) {
    addErrorStyles(nameInput);
    insertErrorMessage(nameInput);
  } else {
    removeErrorStyles(nameInput);
    removeErrorMessage(nameInput);
  }

  if (!emailIsValid(email)) {
    addErrorStyles(emailInput);
    insertErrorMessage(emailInput);
  } else {
    removeErrorStyles(emailInput);
    removeErrorMessage(emailInput);
  }

  if (!phoneIsValid(phone)) {
    addErrorStyles(phoneInput);
    insertErrorMessage(phoneInput);
  } else {
    removeErrorStyles(phoneInput);
    removeErrorMessage(phoneInput);
  }
}

function formValid() {
  // extract name, email and phone from form
  const $form = $("form");
  const elements = $form[0].elements;
  const name = elements[0].value;
  const email = elements[1].value;
  const phone = elements[2].value;

  // adds error styles to incorrect inputs plus adds error message and it removes
  // all that if fields are correct
  handleErrorStyles(name, email, phone);

  if (nameIsValid(name) && emailIsValid(email) && phoneIsValid(phone)) {
    console.log("form is valid");
  }
}

function submitForm() {
  const $submit = $("#submit");
  $submit.click(event => {
    event.preventDefault();
    if (formValid()) {

    }
    // check if form is valid
    //   if it is send through
    //   else reload
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
