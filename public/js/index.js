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

    // Listener for the signin button for desktop
    document.querySelector("#signInButton_desktop").addEventListener("click", async function (e) {
        let emailInput = document.getElementById("emailInput_desktop");
        let passwordInput = document.getElementById("passwordInput_desktop");

        let response = await postData("/login", { email: emailInput.value, password: passwordInput.value });
        if (response) {
            if (response.status == "fail") {
                let errmsg = response.msg;
                console.log(errmsg);
                document.getElementById("loginStatus_desktop").innerHTML = errmsg; // display login failure
            } else {
                window.location.replace("/profile");
            }
        }
    });

    // Listener for the signin button for mobile
    document.querySelector("#signInButton_mobile").addEventListener("click", async function (e) {
        let emailInput = document.getElementById("emailInput_mobile");
        let passwordInput = document.getElementById("passwordInput_mobile");

        let response = await postData("/login", { email: emailInput.value, password: passwordInput.value });
        if (response) {
            if (response.status == "fail") {
                let errmsg = response.msg;
                console.log(errmsg);
                document.getElementById("loginStatus_mobile").innerHTML = errmsg; // display login failure
            } else {
                window.location.replace("/profile");
            }
        }
    });

    //redirecting to signup page for desktop, for the first time using users
    document.getElementById("signUpPage_desktop").onclick = function () {
        window.location.replace("/signup");
    };

    //redirecting to signup page for mobile, for the first time using users
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

