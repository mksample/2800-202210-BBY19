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

    // Listener for the signin button
    document.querySelector("#signInButton").addEventListener("click", async function (e) {
        let emailInput = document.getElementById("emailInput");
        let passwordInput = document.getElementById("passwordInput");

        let response = await postData("/login", { email: emailInput.value, password: passwordInput.value });
        if (response) {
            if (response.status == "fail") {
                let errmsg = response.msg;
                // To do: need to be fixed the status placeholder
                document.getElementById("loginStatus_desktop").innerHTML = errmsg; // display login failure
                document.getElementById("loginStatus_mobile").innerHTML = errmsg; // display login failure
            } else {
                window.location.replace("/profile");
            }
        }
    });

    //redirecting to signup page, for the first time using users
    document.getElementById("signUpPage_desktop").onclick = function () {
        window.location.replace("/signup");
    };

    document.getElementById("signUpPage_mobile").onclick = function () {
        window.location.replace("/signup");
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

