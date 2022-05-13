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

    // let response = await getData("/getUser");
    // if (response) {
    //   if (response.status == "fail") {
    //     console.log(response.msg);
    //   } else {
    //     document.getElementById("search_profile").innerHTML = "firstName " + response.user.firstName;
    //     document.getElementById("search_profile1").innerHTML = "lastName " + response.user.lastName;
    //     document.getElementById("search_profile2").innerHTML = "email " + response.user.email;
    //     document.getElementById("search_profile3").innerHTML = "password " + response.user.password;
    //     document.getElementById("search_profile4").innerHTML = "age " + response.user.age;
    //   }
    // }

    // Grap all users' profile
    let response = await getData("/getUsers");
    if (response) {
      if (response.status == "fail") {
        console.log(response.msg);
      } else {
        // let contentDOM = document.getElementById("profiles");
        for (const user of response.users) {
          console.log(user);
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