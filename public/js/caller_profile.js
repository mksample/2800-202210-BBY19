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
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            document.getElementById("detail_user_firstN").innerHTML = response.user.firstName;
            document.getElementById("detail_user_lastN").innerHTML = response.user.lastName;
            document.getElementById("detail_user_email").innerHTML = response.user.email;
            document.getElementById("detail_user_password").innerHTML = response.user.password;
            document.getElementById("detail_user_age").innerHTML = response.user.age;
            document.getElementById("detail_user_gender").innerHTML = response.user.gender;
            document.getElementById("detail_user_cellphone").innerHTML = response.user.phoneNumber;
            document.getElementById("detail_user_role").innerHTML = response.user.role;
        }
    }

    // Get the current session user and display their info. 
    async function displaySessionUser() {
        let response = await getData("/getUser");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let user = response.user;
                if (user.avatar != null) {
                    document.getElementById("userPicture").src = user.avatar;
                }
                document.getElementById("sessionName").innerHTML = user.firstName + " " + user.lastName;
                document.getElementById("sessionEmail").innerHTML = user.email;
            }
        }
    }
    displaySessionUser();
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

