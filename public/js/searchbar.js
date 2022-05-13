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
    document.getElementById("search_status").innerHTML = keyword;
    let response = await postData("/getUsersKeyword", { keyword: keyword });
    if (response) {
      if (response.status == "fail") {
        console.log(response.msg);
      } else {
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