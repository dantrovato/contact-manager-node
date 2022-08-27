"use strict";
// FUNCTIONS ORDERED APHABETICALLY
// git changes:
// bugs:
// todo:

// collect variables that reference various domVariables elements
const domVariables = {};

function addErrorStyles(element) {
  element.classList.add("error-styles");
  element.parentElement.previousElementSibling.classList.add("make-text-red");
}

function addPositioningToContacts() {
  [...domVariables.$contactsSection[0].children].forEach(contact => {
    contact.classList.add("style-contact");
  });
}

// once the form is submitted it calls this function which attaches handlers for
// the delete, edit buttons within the individual contacts
// then when the edit button is clicked it takes us to the edit-form page where we
// can edit and resubmit the form or cancel the edit
function attachHandlersToEditFormButtons() {
  domVariables.$contactsSection.on("click", event => {
    // get the id of the contact stored in the div as data attribute
    const contact = event.target.closest("div.style-contact");
      //** the if (contact) makes sure contact is not null which it would be if user clicked on contacts-section but outside of the contacts themselves
    if (contact) {
      const id = contact.getAttribute("data-id");
      if (deleteWasClicked(event, id)) {
        deleteContact(event, id);
      }

      // if element clicked is 'delete' delete contact and reload main section of the page
      if (editWasClicked()) {
        displayEditForm();
        // // fill form entries with current contact data
        fillEditFormEntry(contact, id);
      }
    }
  });
}

// attach click event listeners to the add contact buttons to show form
function attachListenerToAddContact() {
  const addContactsButtons = [...document.querySelectorAll(".add-contact")];
  addContactsButtons.forEach(button => {
    button.addEventListener("click", event => {
      domVariables.$contactsSection.hide();
      // makes sure h3 has appropriate text as editing in loads the form and changes the text
      $(".form-container h3").text("Create Contact");
      domVariables.$formContainer.show();
      domVariables.$noContacts.hide();
      domVariables.$searchContainer.hide();
    });
  });
}

function attachListenerToSearchBtn() {
  domVariables.search.addEventListener("keydown", event => {
    const request = fetch("http://localhost:3000/api/contacts");
    request.
    then(response => response.json()).
    then(namesArray => {
      const results = namesArray.filter(contact => contact.full_name.
      toLowerCase().match(domVariables.search.value.toLowerCase()) ||
      contact.tags.toLowerCase().match(domVariables.search.value.toLowerCase()));
      domVariables.$contactsSection.html(domVariables.allTemp({contact: results}));
      addPositioningToContacts();
      // console.log(namesArray)
    }).
    catch(error => console.log(error));
  });

  domVariables.search.addEventListener("blur", event => {
    console.log("in the blur event");
    // the below line doesn't work. Don't know why
    // domVariables.search.setAttribute("value", "");

    // this one does
    domVariables.search.value = "";
  });
}

function attachListenerToSubmitEditButton(submit, $editForm, id) {
  submit.addEventListener("click", event => {
    event.preventDefault();
    const elements = collectValuesFromForm($editForm);

    let [editedName, editedPhone, editedEmail, editedTags] = elements;

    // validate form
    if (formValid(elements)) {
      // console.log("edits are valid");
      const editedData = {
        id: id,
        full_name: editedName.split(" ").map(name => _.capitalize(name)).join(" "),
        // the above line automatically capitalizes the names;
        // As this is the edit we may not want that. Use the line below in that case
        // full_name: editedName,
        phone_number: editedPhone,
        email: editedEmail,
      };

      if (editedTags === "No Tags") {
        editedData.tags = "No Tags";
      } else {
        editedData.tags = editedTags.replace(/\s/g, ",");
      }

      const json = JSON.stringify(editedData);
      // console.log(json);
      const request = fetch("http://localhost:3000/api/contacts/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: json,
      });

      request.
      then(response => response.json()).
      then(response => {
        // console.log(response);
        drawMainPage();
        domVariables.$searchContainer.show();
        resetForm(domVariables.$editFormContainer);
        resetForm(domVariables.$formContainer);
        domVariables.$editFormContainer.hide();
      }).
      catch(error => console.log(error));
    } else {
      handleErrorStyles(elements, $editForm);
    }
  });
}

// when user click cancel on form it removes the form and goes back to main page
function cancelCreateContact() {
  const $cancel = $(".cancel-create-contact");

  $cancel.click(() => {
    domVariables.$formContainer.hide();
    domVariables.$editFormContainer.hide();
    domVariables.$noContacts.show();
    domVariables.$searchContainer.show();
    drawMainPage();
    resetForm(domVariables.$formContainer);
    resetForm(domVariables.$editFormContainer);
  });
}

function collectValuesFromForm(form) {
  const elements = form[0].elements;
  const name = elements[0].value;
  const phone = elements[1].value;
  const email = elements[2].value;
  const tags = elements[3].value;
  return [name, phone, email, tags];
}

function deleteContact(event, id) {
  // if element clicked is 'delete' delete contact and reload main section of the page
  if (confirm("Is this really it for this contact??!")) {
    (async function deleteContact() {
      try {
        await fetch("http://localhost:3000/api/contacts/" + id, {
          method: "DELETE",
          body: id,
          headers: {
            'Content-Type': 'text/plain',
          },
        });
        drawMainPage();
      } catch (e) {
        console.log("Custom error + " + e);
      }
    })();
  }
}

function deleteWasClicked() {
  return event.target.name === "delete" || event.target.parentElement.name === "delete";
}

function displayEditForm() {
  domVariables.$searchContainer.hide();
  domVariables.$editFormContainer.show();
  domVariables.$contactsSection.hide();
}

function drawMainPage() {
  const request = fetch("http://localhost:3000/api/contacts");
  request.
  then(response => response.json()).
  then(response => {
    if (response.length) {
      // hide the bottom part of main page which should only show when there are no contacts
      domVariables.$noContacts.hide();
      domVariables.$formContainer.hide();
      domVariables.$contactsSection.show();
      // create template for the contacts
      domVariables.oneTemp = Handlebars.compile($("#one").html());
      domVariables.allTemp = Handlebars.compile($("#all").html());
      // const oneTemp = Handlebars.compile($("#one").html());
      // const allTemp = Handlebars.compile($("#all").html());
      Handlebars.registerPartial("oneTemp", domVariables.oneTemp);
      domVariables.$contactsSection.html(domVariables.allTemp({contact: response}));
    } else {
      domVariables.$contactsSection.hide();
      domVariables.$noContacts.show();
    }
  }).
  then(() => {
    // this one adds padding to all individual contacts after they
    // are collected from server and formatted for rendering
    addPositioningToContacts();
    // domVariables.$contactsSection.show();
  }).
  catch(error => console.log(error));
}

function editWasClicked() {
  return event.target.name === "edit" || event.target.parentElement.name === "edit";
}

function emailIsValid(email) {
  // matches one or more letter, underscore, digit or dot followed by a @
  // followed but same as before then a single dot and one or nmore letter
  return email.match(/^(\w|[0-9]|\.)+@(\w|[0-9]|\.)+\.[a-zA-Z]+$/);
}

// fill edit form entries with contact data for contact clicked
function fillEditFormEntry(contact, id) {
  const fullName = contact.querySelector("h4").textContent;
  // collect values from the relevant contact
  const inputs = [... contact.querySelectorAll("dd")];
  const values = inputs.map(input => input.textContent);
  let [ phoneNumber, email, tags ] = values;
  const form = document.querySelector("form");
  const entries = form.querySelectorAll("input");
  const submit = document.querySelector("#edit-submit");
  const cancel = submit.parentElement.nextElementSibling;
  const $editForm = $("#edit-form");
  let $editName = $("#edit-name");
  let $editPhone = $("#edit-phone");
  let $editEmail = $("#edit-email");
  let $editTags = $("#edit-tags");

  entries[0].value = fullName;
  entries[1].value = phoneNumber;
  entries[2].value = email;
  entries[3].value = tags;

  $editName.val(fullName);
  $editPhone.val(phoneNumber);
  $editEmail.val(email);
  $editTags.val(tags.replace(/,/g, " "));

  attachListenerToSubmitEditButton(submit, $editForm, id);
}

function formValid(elementsArray) {
  let [name, phone, email, tags] = elementsArray;

  // return true if form is valid
  return nameIsValid(name) && phoneIsValid(phone) &&
  emailIsValid(email) && tagsAreValid(tags);
}

function generateMessage(element) {
  const text = element.parentElement.previousElementSibling.firstElementChild.textContent;
  // return appropriate text according to which element is passed in
  let message;
  if ( text === "Full name:") {
    message = "Enter upto three single space separated words of any number of letters.";
  } else if (text === "Email address:") {
    message = "Enter one or more letter, underscore, digit or dot followed by a @ followed but same as before then a single dot and one or more letter.";
  } else if (text === "Telephone number:") {
    message = "Enter a plus sign followed by 9 to 13 digits.";
  } else if (text === "Tags:") {
    message = "Enter any number of letters, numbers  or underscores followed by an optional dash for double barrel words (chimney-sweep) and single space. More tags can be entered with the same pattern.";
  }

  return message;
}

// adds error styles to incorrect inputs plus adds error message and it removes
// all that if fields are correct
function handleErrorStyles(elementsArray, form) {
  let [name, phone, email, tags] = elementsArray;
  const elements = form[0].elements;
  const nameInput = elements[0];
  const phoneInput = elements[1];
  const emailInput = elements[2];
  const tagsInput = elements[3];

  if (!nameIsValid(name)) {
    addErrorStyles(nameInput);
    insertErrorMessage(nameInput);
  } else {
    removeErrorStyles(nameInput);
    removeErrorMessage(nameInput);
  }

  if (!phoneIsValid(phone)) {
    addErrorStyles(phoneInput);
    insertErrorMessage(phoneInput);
  } else {
    removeErrorStyles(phoneInput);
    removeErrorMessage(phoneInput);
  }

  if (!emailIsValid(email)) {
    addErrorStyles(emailInput);
    insertErrorMessage(emailInput);
  } else {
    removeErrorStyles(emailInput);
    removeErrorMessage(emailInput);
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

function resetForm($form) {
  // remove error styles and messages from form
  [...$form[0].querySelectorAll("input")].slice(0, 4).forEach(input => {
    removeErrorStyles(input);
    removeErrorMessage(input);
    input.value = "";
  });
}

// attach click event listener to submit button in the form
function submitForm() {
  const $submit = $("#submit");
  $submit.click(event => {
    event.preventDefault();
    const $form = $("#form");
    const elements = collectValuesFromForm($form); // returns an array [name, phone, email, tags]

    if (formValid(elements)) {
      // console.log("valid");
      const formValues = $form[0].elements;
      const data = {
        full_name: formValues[0].value.split(" ").map(name => _.capitalize(name)).join(" "),
        phone_number: formValues[1].value,
        email: formValues[2].value,
        tags: formValues[3].value.replace(/\s/g, ","),
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
        // console.log(response);
        drawMainPage();
        domVariables.$searchContainer.show();
        resetForm(domVariables.$formContainer);
      }).
      catch(error => console.log(error));
    } else {
      handleErrorStyles(elements, $form);
    }
  });
}

function tagsAreValid(tags) {
  // matches any number of letters, underscores, numbers and whitespaces

  return tags.match(/^(\w+-?\s?)+$/) || !tags.length;
}

document.addEventListener("DOMContentLoaded", () => {
  // populate the domVariables object literal with useful variables:
  domVariables.$contactsSection = $("#contacts-section");  // where handlebars is gonna show
  domVariables.$noContacts = $(".no-contacts");
  domVariables.$formContainer = $(".form-container");
  domVariables.$searchContainer = $(".search-container");
  domVariables.$editFormContainer = $(".edit-form-container");
  domVariables.search = document.querySelector("#search");

  (function runContactManager() {
    // check if any contact exists and if so display them on the page. If not let the default
    // display go ahead
    drawMainPage();

    attachListenerToSearchBtn();
    // attach click event listeners to the add contact buttons to show form
    attachListenerToAddContact();
    // attach click event listeners to the cancel buttons to restore main page
    cancelCreateContact();
    // attach click event listener to submit button in the form
    submitForm();

    attachHandlersToEditFormButtons();
  })();
});
