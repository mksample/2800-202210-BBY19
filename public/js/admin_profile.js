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

    function openModal(modalID) {
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

    function prepareEditUserModal(user) {
        document.getElementById("editUserEmail").innerHTML = "Email: " + user.email;
        document.getElementById("editUserFirstName").innerHTML = "First name: " + user.firstName;
        document.getElementById("editUserLastName").innerHTML = "Last name: " + user.lastName;
        document.getElementById("editUserAge").innerHTML = "Age: " + user.age;
        document.getElementById("editUserGender").innerHTML = "Gender: " + user.gender;
        document.getElementById("editUserPhoneNumber").innerHTML = "Phone number: " + user.phoneNumber;
        document.getElementById("editUserRole").innerHTML = "Role: " + user.role;
    }

    function createProfileDisplay(user, contentDOM) {
        // creating profile display
        let profile = document.getElementById("UserProfileTemplate").content.cloneNode(true);
        profile.querySelector(".profilePicture").innerHTML = user.email;
        profile.querySelector(".profileEmail").innerHTML = "Email: " + user.email
        profile.querySelector(".profileRole").innerHTML = "Role: " + user.role;;
        profile.querySelector('.profile').setAttribute("id", user.ID);

        // appending the profile to the contentDOM
        contentDOM.appendChild(profile);

        // when profile clicked on, prepare and show edit profile modal
        document.getElementById(user.ID).addEventListener("click", async function (e) {
            prepareEditUserModal(user);
            openModal("editUserModal");
        })
    }

    // USER PROFILE DISPLAY
    let response = await getData("/getUsers");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            let contentDOM = document.getElementById("profiles");
            for (const user of response.users) {
                createProfileDisplay(user, contentDOM);
            }
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