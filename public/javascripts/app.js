"use strict";
// FUNCTIONS ORDERED APHABETICALLY
// git
// Add row div with class="line" to space vertically the form from the Create Contact heading in html and give that css rule a margin bottom of 3 rem.
// Add resetForm() to submitForm().
// Add runContactManager() async await IIFE to run the app.
// Add attachHandlersToContactButtons() which is called from within the runContactManager() after awaiting the submitting of the form.
// Add html data attribute data-id to the $contactsSection templates so that we can use it to edit or delete correct contact.
// Add else part to if statement in drawMainPage() to show $noContacts section and hide the now deleted contact $contactsSection.
// Remove code at the end of drawMainPage() which kept showing the contacts page.

// to do:
// handle edit button
// implement search facility

// collect variables that reference various dom elements
const dom = {};

function addErrorStyles(element) {
  element.classList.add("error-styles");
  element.parentElement.previousElementSibling.classList.add("make-text-red");
}

// once the form is submitted it calls this function which attaches handlers for
// the edit and the delete buttons within the individual contacts
function attachHandlersToContactButtons() {
  dom.$contactsSection.on("click", event => {

    // if element clicked is either edit or delete
    if (event.target.name === "delete" || event.target.parentElement.name === "delete") {
        const contact = event.target.closest("div.style-contact");
        const id = contact.getAttribute("data-id");
        // get the id of the contact and put in url and body
        (async function deleteContact() {
          try {
            await fetch("http://localhost:3000/api/contacts/" + id, {
              method: "DELETE",
              body: id,
              headers: {
                'Content-Type': 'text/plain',
                // 'Content-Type': 'application/x-www-form-urlencoded',
              },
            });
            drawMainPage();
            // return;
          } catch (e) {
            console.log("Custom error + " + e);
          }
        })();
    }

    if (event.target.name === "edit" || event.target.parentElement.name === "edit") {
      // console.log(event.target);
    }

  });
}

// when user click cancel on form it removes the form and goes back to main page
function cancelCreateContact() {
  const $cancel = $("#cancel-create-contact");

  $cancel.click(() => {
    dom.$formContainer.hide();
    dom.$noContacts.show();
    dom.$searchContainer.show();
    drawMainPage();
    resetForm();
  });
}

function drawMainPage() {
  const request = fetch("http://localhost:3000/api/contacts");
  request
  .then(response => response.json())
  .then(response => {
    if (response.length) {
      // hide the bottom part of main page which should only show when there are no contacts
      console.log(response);
      // console.log(response.id);
      dom.$noContacts.hide();
      dom.$formContainer.hide();
      dom.$contactsSection.show();

      // attachHandlersToContactButtons();

      Handlebars.registerPartial("oneTemp", dom.oneTemp);
      dom.$contactsSection.html(dom.allTemp({contact: response}));

    } else {
      dom.$contactsSection.hide();
      dom.$noContacts.show();
    }
  })
  .then(() => {
    // this one adds padding to all individual contacts after they
    // are collected from server and formatted for rendering
    [...dom.$contactsSection[0].children].forEach(contact => {
      contact.classList.add("style-contact");
    });
    // dom.$contactsSection.show();
  })
  .catch(error => console.log(error));
}

function emailIsValid(email) {
  // matches one or more letter, underscore, digit or dot followed by a @
  // followed but same as before then a single dot and one or nmore letter
  return email.match(/^(\w|[0-9]|\.)+@(\w|[0-9]|\.)+\.[a-zA-Z]+$/);
}

function formValid(name, email, phone, tags) {
  // handleErrorStyles(name, email, phone, tags);

  // return true if form is valid
  return nameIsValid(name) && emailIsValid(email) &&
  phoneIsValid(phone) && tagsAreValid(tags);
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

// adds error styles to incorrect inputs plus adds error message and it removes
// all that if fields are correct
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

function nameIsValid(name) {
  // upto three single space separated words of any number of letters
  return name.match(/^[a-zA-Z]+\s?[a-zA-Z]*\s?[a-zA-Z]*$/);
}

function phoneIsValid(phone) {
  // matches a plus sign followed by 9 to 13 digits
  return phone.match(/\+[0-9]{9,13}$/);
}

function removeErrorMessage(element) {
  if (element.nextElementSibling) {
    element.nextElementSibling.remove();
  }
}

function removeErrorStyles(element) {
  element.classList.remove("error-styles");
  element.parentElement.previousElementSibling.classList.remove("make-text-red");
}

function resetForm() {
  // remove error styles and messages from form
  [...dom.$formContainer[0].querySelectorAll("input")].slice(0, 4).forEach(input => {
    removeErrorStyles(input);
    removeErrorMessage(input);
    input.value = "";
  });
}

// attach click event listeners to the add contact buttons to show form
function showForm() {
  const addContactsButtons = [...document.querySelectorAll(".add-contact")];
  addContactsButtons.forEach(button => {
    button.addEventListener("click", event => {
      dom.$contactsSection.hide();
      dom.$formContainer.show();
      dom.$noContacts.hide();
      dom.$searchContainer.hide();
      // dom.$searchContainer.hide();
    });
  });
}

// attach click event listener to submit button in the form
function submitForm() {
  const $submit = $("#submit");
  $submit.click(event => {
    event.preventDefault();
    const $form = $("form");
    const elements = $form[0].elements;
    const name = elements[0].value;
    const email = elements[1].value;
    const phone = elements[2].value;
    const tags = elements[3].value;

    if (formValid(name, email, phone, tags)) {
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
      then(response => {
        console.log(response);
        drawMainPage();
        dom.$searchContainer.show();
        resetForm();
      }).
      catch(error => console.log(error));
    } else {
      handleErrorStyles(name, email, phone, tags);
    }
  });
}

function tagsAreValid(tags) {
  // matches any number of letters, underscores, numbers and whitespaces
  return tags.match(/^(\w|\s)*$/);
}

document.addEventListener("DOMContentLoaded", () => {
  // populate the dom object literal with useful variables:
  dom.$contactsSection = $("#contacts-section");  // where handlebars is gonna show
  dom.oneTemp = Handlebars.compile($("#one").html());
  dom.allTemp = Handlebars.compile($("#all").html());
  dom.$noContacts = $(".no-contacts");
  dom.$formContainer = $(".form-container");
  dom.$searchContainer = $(".search-container");

  (async function runContactManager() {
    // check if any contact exists and if so display them on the page. If not let the default
    // display go ahead
    drawMainPage();
    // attach click event listeners to the add contact buttons to show form
    showForm();
    // attach click event listeners to the add contact buttons to restore main page
    cancelCreateContact();
    // attach click event listener to submit button in the form
    await submitForm();

    attachHandlersToContactButtons();

  })();
  // fetch("http://localhost:3000/api/contacts/1", {method: "DELETE", body: 1});
  // fetch("http://localhost:3000/api/contacts/2", {method: "DELETE", body: 2});
  // fetch("http://localhost:3000/api/contacts/3", {method: "DELETE", body: 3});
  // fetch("http://localhost:3000/api/contacts/4", {method: "DELETE", body: 4});
});
