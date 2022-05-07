"use strict";
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

    let response = await getData("/getUser");

    if (response) {
        console.log(response.msg);
        if (response.status == "fail") {
            document.getElementById("username").innerHTML = response.msg;
        } else {
            let user = response.user;
            document.getElementById("username").innerHTML = "Welcome back " + user.firstName + " " + user.lastName + "!";
        }
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