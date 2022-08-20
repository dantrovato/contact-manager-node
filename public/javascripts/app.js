"use strict";

function drawMainPage() {
  const request = fetch("http://localhost:3000/api/contacts");

  request
  .then(response => response.json())
  .then(response => {
    if (response.length) {
      // hide the bottom part of main page which should only show when there are no contacts
      console.log(response);
      $(".bottom-placeholder").hide();

      const $contactsSection = $("#contacts-section");
      const oneTemp = Handlebars.compile($("#one").html());
      const allTemp = Handlebars.compile($("#all").html());
      Handlebars.registerPartial("oneTemp", $("#one").html());
      $contactsSection.html(allTemp({contact: response}));
    }
  })
  .then(() => {
    // this one adds padding to all individual contacts dinamically after they
    // are collected from server
    [...document.querySelector("#contacts-section").children].forEach(contact => {
      contact.classList.add("add-padding");
    });
  })
  .catch(error => console.log(error));
}

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

function tagsAreValid(tags) {
  // matches any number of letters, underscores, numbers and whitespaces
  return tags.match(/^(\w|\s)*$/);
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
  } else if (text === "Tags:") {
    message = "Enter any number of letters, underscores, numbers and whitespaces only. For double barrel names use underscore: wood chopper => wood_chopper";
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

function handleErrorStyles(name, email, phone, tags) {
  const $elements = $("form")[0].elements;
  const nameInput = $elements[0];
  const emailInput = $elements[1];
  const phoneInput = $elements[2];
  const tagsInput = $elements[3];

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

  if (!tagsAreValid(tags)) {
    addErrorStyles(tagsInput);
    insertErrorMessage(tagsInput);
  } else {
    removeErrorStyles(tagsInput);
    removeErrorMessage(tagsInput);
  }
}

function formValid() {
  // extract name, email and phone from form
  const $form = $("form");
  const elements = $form[0].elements;
  const name = elements[0].value;
  const email = elements[1].value;
  const phone = elements[2].value;
  const tags = elements[3].value;

  // adds error styles to incorrect inputs plus adds error message and it removes
  // all that if fields are correct
  handleErrorStyles(name, email, phone, tags);

  // return true if form is valid
  return nameIsValid(name) && emailIsValid(email) &&
  phoneIsValid(phone) && tagsAreValid(tags);
}

function updateMainPage() {} // function to be created

function submitForm() {
  const $submit = $("#submit");
  $submit.click(event => {
    event.preventDefault();
    if (formValid()) {
      console.log("valid");
      const formValues = $("form")[0].elements;
      const data = {
        full_name: formValues[0].value,
        email: formValues[1].value,
        phone_number: formValues[2].value,
        tags: formValues[3].value.replace(/\s+/g, ","),
      };

      const json = JSON.stringify(data);

      const request = fetch("http://localhost:3000/api/contacts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: json,
      });

      request.
      then(response => response.json()).
      then(response => console.log(response)).
      then(updateMainPage()).
      catch(error => console.log(error));
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // check if any contact exists and if so display them on the page. If not let the default
  // display go ahead
  drawMainPage();
  // attach click event listeners to the add contact buttons to show form
  showForm();
  // attach click event listeners to the add contact buttons to restore main page
  cancelCreateContact();
  // attach click event listener to submit button in the form
  submitForm();
});
