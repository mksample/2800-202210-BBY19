"use strict";
ready(async function () {
    // Creates profile displays, attaches event listeners to them, and appends them to the id="profiles" div.
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
            openModal(user, "editUserModal", submitEditUserModal);
        })
    }

    // Gets users from the database and adds them to the admin dashboard.
    async function showUsers() {
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
    }

    // DISPLAY USER PROFILES
    showUsers();

    // ADD LISTENER TO CREATE USER BUTTON
    // (this re-uses the edit user modal, see the top of admin_profile_create_user.js for a longer explanation)
    document.getElementById("createUserButton").addEventListener("click", function (e) {
        prepareCreateUserModal();
        openModal(null, "editUserModal", submitCreateUserModal);
    })
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