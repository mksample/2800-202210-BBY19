"use strict";
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

    // Listener for the signup button
    document.getElementById("signUpButton").addEventListener("click", async function (e) {
        let xhttp = new XMLHttpRequest();
        xhttp.open("POST", "/createUser", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); // request contents description

        xhttp.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
                console.log("new user is created successfully!");
            }
        }

        // gender types
        let male = document.getElementById("male");
        let female = document.getElementById("female");
        let other = document.getElementById("other");

        // role types
        let caller = document.getElementById("caller");
        let responder = document.getElementById("responder");
        
        // Convert json object to text
        let input = JSON.stringify({
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            firstName: document.getElementById("fname").value,
            lastName: document.getElementById("lname").value,
            age: document.getElementById("age").value,
            gender: male.checked ? "Male" : female.checked ? "Female" : other.checked ? "Other" : null,
            phoneNumber: document.getElementById("phoneNumber").value,
            role: caller.checked ? "CALLER" : responder.checked ? "RESPONDER" : null
        });

        console.log(input); 
        xhttp.send(input);
    });

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
        console.log("ready");
    }
}