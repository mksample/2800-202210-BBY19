"use strict";

const sqlAuthentication = { // sql connection settings
  host: "127.0.0.1", // for Mac os, type 127.0.0.1
  user: "root",
  password: "",
  multipleStatements: true,
  database: "COMP2800"
}

const userTable = "BBY_19_user";

ready(async function () {
  async function getData(url) {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'same-origin',
      cache: 'default',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
    return response.json();
  }


  document.getElementById("searchButton").addEventListener("click", async function (e) {
    console.log("Search button pushed");
    let keyword = document.getElementById("searchKeyword").value;
    console.log(keyword);
    document.getElementById("search_result").innerHTML = keyword;
  });

  // Listener for the signup button
  // document.getElementById("signUpButton").addEventListener("click", async function (e) {
  //   let response = await postData("/createUser", {
  //     email: document.getElementById("email").value,
  //     password: document.getElementById("password").value,
  //     firstName: document.getElementById("fname").value,
  //     lastName: document.getElementById("lname").value,
  //     age: document.getElementById("age").value,
  //     gender: document.querySelector('input[name="gender"]:checked').value,
  //     phoneNumber: document.getElementById("phoneNumber").value,
  //     role: document.querySelector('input[name="role"]:checked').value
  //   })
  //   if (response) {
  //     if (response.status == "fail") {
  //       console.log(response.msg);
  //       document.getElementById("createUserStatus").innerHTML = response.displayMsg; // display create user failure
  //     } else {

  //       window.location.replace("/");
  //     }
  //   }
  // });

  //redirecting to login page, back button
  document.getElementById("cancelButton").onclick = function () {
    window.location.replace("/");
  };
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