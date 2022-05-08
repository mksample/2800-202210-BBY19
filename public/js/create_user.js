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

    // Listener for the signin button
    document.getElementById("createUserButton").addEventListener("click", async function (e) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/createUser", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); // request contents description

        xhttp.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                console.log("new user is created successfully!");
            }
        }
        
        // Convert json object to text
        let input = JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            firstName: document.getElementById("fname").value,
            lastName: document.getElementById("lname").value,
            age: document.getElementById("age").value,
            gender: document.getElementById("gender").value,
            phoneNumber: document.getElementById("phoneNumber").value,
            role: document.getElementById("role").value
        });

        console.log(input); 
        xhttp.send(input);
        return;
    });

    //redirecting to singup page, for the first time using users
    document.getElementById("backButton").onclick = function () {
        window.location.replace("/");
    };
});

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("ready");
    }
}