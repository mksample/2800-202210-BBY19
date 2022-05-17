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
        console.log(response.users);
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
          .append(`<label for="${value}">${value}</label></div>`)
          .append(`<br>`);
      }
    });
  }

  function prepareEditUserModal(user) {
    // document.getElementById("editUserEmail").innerHTML = "Email: " + user.email;
    // document.getElementById("editUserFirstName").innerHTML = "First name: " + user.firstName;
    // document.getElementById("editUserLastName").innerHTML = "Last name: " + user.lastName;
    // document.getElementById("editUserAge").innerHTML = "Age: " + user.age;
    // document.getElementById("editUserGender").innerHTML = "Gender: " + user.gender;
    // document.getElementById("editUserPhoneNumber").innerHTML = "Phone number: " + user.phoneNumber;
    // document.getElementById("editUserRole").innerHTML = "Role: " + user.role;

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

  // Listener for the edit button for get the selected item from radio button
  document.querySelector("#edit").addEventListener("click", async function (e) {
    console.log("submit button");
    var obj_length = document.getElementsByName("contact").length;
    for (var i = 0; i < obj_length; i++) {
      if (document.getElementsByName("contact")[i].checked == true) {
        let str = document.getElementsByName("contact")[i].value;
        let str_id = str.split(',')[0];
        str_id = str_id.substr(1);
        console.log(str_id);

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
            console.log(response.users);
            for (const user of response.users) {
              console.log(user);
              var modal = document.getElementById("searchModal");
              modal.style.display = "none";
              prepareEditUserModal(user);
              openModal("editUserModal");
            }
          }
        }
      }
    }
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