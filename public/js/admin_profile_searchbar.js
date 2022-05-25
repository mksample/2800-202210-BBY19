// This file supports search bar function in admin profile page.

"use strict";
async function postData(url, data) {
  const response = await fetch(url, {
    method: 'POST',
    mode: 'same-origin',
    cache: 'default',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: JSON.stringify(data)
  });
  return response.json();
}

// Opens the modal window with the list of searched items.
function openSearchModal(modalID) {
  // Get the unique modalID to control modal window.
  var modal = document.getElementById(modalID);
  modal.style.display = "block";

  // Get the <span> element that closes the modal.
  var span = document.getElementsByClassName("searchModalClose")[0];
  span.onclick = function () {
    modal.style.display = "none";
  };
  // When the user clicks anywhere outside of the modal, close the modal window.
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      // Cleans the text input box of search bar before opening the display window.
      document.getElementById("searchList").innerHTML = "";
    }
  };
}

// Generates the list of searched items from the database.
function createSearchList(user) {
  $(document).ready(function () {
    // Cleans the warning message.
    document.getElementById("searchStatus").innerHTML = "";
    var radios = [" " + user.ID + ", " + user.email + ", " + user.firstName + " " + user.lastName];
    for (var value of radios) {
      $('#searchList')
        .append(`<input type="radio" id="${value}" name="contact" value="${value}">`)
        .append(`<label for="${value}" class="radio">${value}</label></div>`)
        .append(`<br>`);
    }
  });
}

// It fills in the edit form of profile with selected user.
function prepareEditUserModal(user) {
  document.getElementById("editUserEmail").value = user.email;
  document.getElementById("editUserPassword").value = user.password;
  document.getElementById("editUserFirstName").value = user.firstName;
  document.getElementById("editUserLastName").value = user.lastName;
  document.getElementById("editUserAge").value = user.age;
  document.getElementById("editUserPhoneNumber").value = user.phoneNumber;
  document.getElementById('' + user.gender).checked = true;
  document.getElementById('' + user.role).checked = true;
}

// Opens a modal when given a user, modalID (what modal to use), and a save method.
// Save method is what happens when the modal is submitted, must return true or false if successful submission or not.
function openModalEdit(user, modalID, cancelButton, submitButton, status, saveMethod) {
  // Get the unique modalID to control modal window.
  var modal = document.getElementById(modalID);
  modal.style.display = "block";

  // When the user clicks the cancel button, close the modal window.
  var cancel = document.getElementById(cancelButton);
  cancel.onclick = function () {
    modal.style.display = "none";
    // Cleans the text input box of search bar before closing the display window.
    document.getElementById(status).innerHTML = "";
  };

  // When the user clicks the submit button, it opens another window for editing the profile.
  var save = document.getElementById(submitButton);
  save.onclick = async function () {
    let success = await saveMethod(user);
    if (success) {
      modal.style.display = "none";
      // Cleans the text input box of search bar before closing the display window by submit button.
      document.getElementById(status).innerHTML = "";
    }
  };
  // When the user clicks anywhere outside of the modal, close the modal window.
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
      // Cleans the text input box of search bar before closing the display window.
      document.getElementById(status).innerHTML = "";
    }
  };
}

// When user clicks the search button, the keyword is passed to the server side to search from the database. 
async function prepareSearchBar() {
  document.getElementById("searchButton").addEventListener("click", async function (e) {
    var keyword = document.getElementById("searchKeyword").value;
    // The parameter "/getUsersKeyword" enables to search the keyword from the database by the include search option.
    // It searches for emails, firstNames, and lastNames. 
    let response = await postData("/getUsersKeyword", {
      keyword: keyword
    });
    // If the keyword is empty, it shows the warning message.
    if (response.users.length == 0) {
      document.getElementById("searchStatus").innerHTML = "No search results found.";
    }
    if (response) {
      if (response.status == "fail") {
        console.log(response.msg);
      } else {
        // Cleans the text input box before opening the display window.
        document.getElementById("searchList").innerHTML = "";
        for (const user of response.users) {
          openSearchModal("searchModal");
          // Generates the list of searched items.
          createSearchList(user);
        }
      }
    }
  });

  // Listener for the edit button for get the selected item from radio button.
  document.querySelector("#searchEdit").addEventListener("click", async function (e) {
    var obj_length = document.getElementsByName("contact").length;
    for (var i = 0; i < obj_length; i++) {
      if (document.getElementsByName("contact")[i].checked == true) {
        let str = document.getElementsByName("contact")[i].value;
        let str_id = str.split(',')[0];
        str_id = str_id.substr(1);
        // It searches result by exact matching with user ID which is unique attribute.
        let response = await postData("/getUsersKeywordExact", {
          keyword: str_id,
        });
        if (response.users.length == 0) {
          document.getElementById("searchStatus").innerHTML = "No search results found.";
        }
        if (response) {
          if (response.status == "fail") {
            console.log(response.msg);
          } else {
            for (const user of response.users) {
              var modal = document.getElementById("searchModal");
              modal.style.display = "none";
              prepareEditUserModal(user);
              // Opens edit modal window for editing of selected profile.
              // parameters: user, modalID, cancelButton, submitButton, status, saveMethod
              openModalEdit(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
            }
          }
        }
      }
    }
  });

  // When the user clicks the cancel button, close the modal window.
  document.querySelector("#cancel").addEventListener("click", async function (e) {
    var modal = document.getElementById("searchModal");
    modal.style.display = "none";
  });
}