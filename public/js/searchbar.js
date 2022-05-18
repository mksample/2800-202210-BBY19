"use strict";
const sqlAuthentication = { // sql connection settings
  host: "127.0.0.1", // for Mac os, type 127.0.0.1
  user: "root",
  password: "",
  multipleStatements: true,
  database: "COMP2800" // Database name
}

const userTable = "BBY_19_user"; // Table name

ready(async function () {
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

  document.getElementById("searchButton").addEventListener("click", async function (e) {
    var keyword = document.getElementById("searchKeyword").value;
    let response = await postData("/getUsersKeyword", {
      keyword: keyword
    });

    if (response.users.length == 0) {
      alert("No search results found.");
    }
    if (response) {
      if (response.status == "fail") {
        console.log(response.msg);
      } else {
        // console.log(response.users);
        document.getElementById("searchList").innerHTML = "";
        for (const user of response.users) {
          openSearchModal("searchModal");
          createSearchList(user);
        }
      }
    }
  });

  function openSearchModal(modalID) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("searchModalClose")[0];
    span.onclick = function () {
      modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById("searchList").innerHTML = "";
      }
    }
  }

  function createSearchList(user) {
    $(document).ready(function () {
      var radios = [" " + user.ID + ", " + user.email + ", " + user.firstName + " " + user.lastName];
      for (var value of radios) {
        $('#searchList')
          .append(`<input type="radio" id="${value}" name="contact" value="${value}">`)
          .append(`<label for="${value}" class="radio">${value}</label></div>`)
          .append(`<br>`);
      }
    });
  }

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

  function openModal(modalID) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("modalClose")[0];
    span.onclick = function () {
      modal.style.display = "none";
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
  }

  // Opens a modal when given a user, modalID (what modal to use), and a save method.
  // Save method is what happens when the modal is submitted, must return true or false if successful submission or not.
  function openModalEdit(user, modalID, cancelButton, submitButton, status, saveMethod) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // close modal when cancel button clicked
    var cancel = document.getElementById(cancelButton);
    cancel.onclick = function () {
      modal.style.display = "none";
      document.getElementById(status).innerHTML = ""; // clear status when closing
    }

    var save = document.getElementById(submitButton);
    save.onclick = async function () {
      let success = await saveMethod(user);
      if (success) {
        modal.style.display = "none";
        document.getElementById(status).innerHTML = ""; // clear status when closing
      }
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = "none";
        document.getElementById(status).innerHTML = ""; // clear status when closing
      }
    }
  }


  // Listener for the edit button for get the selected item from radio button
  document.querySelector("#edit").addEventListener("click", async function (e) {
    var obj_length = document.getElementsByName("contact").length;
    for (var i = 0; i < obj_length; i++) {
      if (document.getElementsByName("contact")[i].checked == true) {
        let str = document.getElementsByName("contact")[i].value;
        let str_id = str.split(',')[0];
        str_id = str_id.substr(1);
        // exactly search again with user ID
        let response = await postData("/getUsersKeywordExact", {
          keyword: str_id,
        });

        if (response.users.length == 0) {
          alert("No search results found.");
        }
        if (response) {
          if (response.status == "fail") {
            console.log(response.msg);
          } else {
            for (const user of response.users) {
              var modal = document.getElementById("searchModal");
              modal.style.display = "none";
              prepareEditUserModal(user);
              openModalEdit(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
            }
          }
        }
      }
    }
  });

  document.querySelector("#cancel").addEventListener("click", async function (e) {
    var modal = document.getElementById("searchModal");
    modal.style.display = "none";
  });
});

function ready(callback) {
  if (document.readyState != "loading") {
    callback();
    console.log("ready state is 'complete'");
  } else {
    document.addEventListener("DOMContentLoaded", callback);
    console.log("Listener was invoked");
  }
}