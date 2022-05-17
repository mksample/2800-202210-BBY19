"use strict";

// const {
//   response
// } = require("express");

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
    document.getElementById("search_status").innerHTML = keyword;
    let response = await postData("/getUsersKeyword", {
      keyword: keyword
    });
    if (response) {
      if (response.status == "fail") {
        console.log(response.msg);
      } else {
        for (const user of response.users) {
          console.log(user);
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

  function createSearchList(user) {
    // creating search list
    // var hold = document.getElementById("searchList");
    // var checkbox = document.createElement('input');
    // checkbox.type = "checkbox";
    // checkbox.name = "chkbox1";
    // checkbox.value = user.ID;
    // checkbox.onclick = "checkOnlyOne(this)";
    // var label = document.createElement('label');
    // var tn = document.createTextNode(" " + user.email + " " + user.firstName + " " + user.lastName);
    // label.htmlFor = "cbid";
    // label.appendChild(tn);
    // hold.appendChild(checkbox);
    // hold.appendChild(label);
    // document.getElementById("searchList").innerHTML += '<br />';

    // var radiobox = document.createElement('input');
    // radiobox.type = 'radio';
    // radiobox.id = 'contact';
    // radiobox.value = 'email';

    // var label = document.createElement('label')
    // label.htmlFor = 'contact';

    // var description = document.createTextNode('Email');
    // label.appendChild(description);

    // var newline = document.createElement('br');

    // var container = document.getElementById('searchList');
    // container.appendChild(radiobox);
    // container.appendChild(label);
    // container.appendChild(newline);

    $(document).ready(function () {
      $('#submit').click(function () {
        var radios = [" " + user.email + " " + user.firstName + " " + user.lastName];
        console.log(typeof user);
        for (var value of radios) {
          $('#searchList')
            .append(`<input type="radio" id="${value}" name="contact" value="${value}">`)
            .append(`<label for="${value}">${value}</label></div>`)
            .append(`<br>`);
        }
      })
    });


  }
});



function checkOnlyOne(element) {

  const checkboxes = document.getElementsByName("chkbox1");

  checkboxes.forEach((cb) => {
    cb.checked = false;
  })

  element.checked = true;
}

function ready(callback) {
  if (document.readyState != "loading") {
    callback();
    console.log("ready state is 'complete'");
  } else {
    document.addEventListener("DOMContentLoaded", callback);
    console.log("Listener was invoked");
  }
}