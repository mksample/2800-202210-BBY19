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
      var radios = [" " + user.email + ", " + user.firstName + " " + user.lastName];
      for (var value of radios) {
        $('#searchList')
          .append(`<input type="radio" id="${value}" name="contact" value="${value}">`)
          .append(`<label for="${value}">${value}</label></div>`)
          .append(`<br>`);
      }
    });
  }
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