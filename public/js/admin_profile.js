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

    // Creates profile displays, attaches event listeners to them, and appends them to the contentDOM.
    function createProfileDisplay(user, contentDOM) {
        // creating profile display
        let profile = document.getElementById("UserProfileTemplate").content.cloneNode(true);
        if (user.avatar != null) {
            profile.querySelector(".profilePicture").src = user.avatar;
        }
        profile.querySelector(".profileEmail").innerHTML = "Email: " + user.email;
        profile.querySelector(".profileRole").innerHTML = "Role: " + user.role;
        profile.querySelector('.profile').setAttribute("id", user.ID);
        profile.querySelector('.profile').user = user;

        // appending the profile to the contentDOM
        contentDOM.appendChild(profile);

        // when profile clicked on, prepare and show edit profile modal
        document.getElementById(user.ID).addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            prepareEditUserModal(user);
            openModal(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
        });

        // when delete button clicked on, show delete profile modal
        document.getElementById(user.ID).querySelector(".delete").addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            openModal(user, "deleteUserModal", "deleteUserCancelButton", "deleteUserSubmitButton", "deleteUserStatus", submitDeleteUserModal);
        });
    }

    // Creates incident displays, attaches event listeners to them, and appends them to the contentDOM.
    function createIncidentDisplay(incident, contentDOM) {
        // Creating incident display
        let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
        var date = new Date(Date.parse(incident.timestamp));
        incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
        incidentDisp.querySelector("#incidentPriority").innerHTML = "Priority: " + incident.priority;
        incidentDisp.querySelector("#incidentType").innerHTML = "Type: " + incident.type;
        incidentDisp.querySelector("#incidentStatus").innerHTML = "Status: " + incident.status;
        incidentDisp.querySelector("#incidentTimestamp").innerHTML = date.toLocaleString('en-US');
        incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);
        incidentDisp.querySelector('.incident').incident = incident;

        // appending the incident to the contentDOM
        contentDOM.appendChild(incidentDisp);

        contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            prepareDisplayIncidentModal(incident);
            openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
        });
    }

    // Gets incidents from the database and adds them to the admin incident log.
    async function showIncidents() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("incidents");
                for (const incident of response.incidents) {
                    createIncidentDisplay(incident, contentDOM);
                }
            }
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

    // ADD LISTENER TO CREATE USER BUTTON
    // (this re-uses the edit user modal, see the top of admin_profile_create_user.js for a longer explanation)
    document.getElementById("createUserButton").addEventListener("click", function (e) {
        prepareCreateUserModal();
        openModal(null, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitCreateUserModal);
    });

    // DISPLAY USER PROFILES
    await showUsers();

    // DISPLAY SESSION USER INFO
    await displaySessionUser();

    // DISPLAY INCIDENT LOG
    await showIncidents();

    // PREPARE PROFILE EDITING TAB (from admin_profile_edit.js)
    await prepareProfile();

    // PREPARE SEARCH BAR (from admin_profile_searchbar.js)
    await prepareSearchBar();

    // RUN UPDATER
    runUpdater();
});

function ready(callback) {
    if (document.readyState != "loading") {
        callback();
    } else {
        document.addEventListener("DOMContentLoaded", callback);
    }
}