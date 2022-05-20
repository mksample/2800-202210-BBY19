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

    async function prepareProfile() {
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
    }

    // Creates incident displays, attaches event listeners to them, and appends them to contentDOM.
    async function createIncidentDisplay(incident, contentDOM, joinButton) {
        // creating incident display
        let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
        incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
        incidentDisp.querySelector("#incidentPriority").innerHTML = incident.priority;
        incidentDisp.querySelector("#incidentType").innerHTML = incident.type;
        incidentDisp.querySelector("#incidentStatus").innerHTML = incident.status;
        incidentDisp.querySelector("#incidentTimestamp").innerHTML = incident.timestamp;
        incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);

        // appending the incident to the contentDOM
        contentDOM.appendChild(incidentDisp);

        // Query user for ID
        let response = await getData("/getUser");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let joined = false
                let user = response.user;
                for (const responderID of incident.responderIDs) {
                    if (responderID == user.ID) {
                        joined = true;
                    }
                }
                // If the user has already joined the incident, disable the join button.
                if (joined) {
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").value = "Joined"
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").disabled = true;
                } 
            }
        }
        if (incident.image) {
            document.getElementById("displayIncidentImage").src = incident.image;
        }

        // Remove join button if needed. Otherwise attach event listener to it.
        if (!joinButton) {
            contentDOM.querySelector("#incident" + incident.ID).removeChild(contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton"));
        } else {
            contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").addEventListener("click", async function (e) {
                e.stopImmediatePropagation();
                openModal(incident, "joinIncidentModal", "joinIncidentCancelButton", "joinIncidentSubmitButton", "joinIncidentStatus", submitJoinIncidentModal);
            })
        }

        // Add an event listener to the display for displaying the incident.
        contentDOM.querySelector("#incident" + incident.ID).addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            await prepareDisplayIncidentModal(incident);
            openModal(incident, "displayIncidentModal", "displayIncidentCancelButton", "displayIncidentResolveButton", "displayIncidentResolveStatus", submitDisplayIncidentModal);
        })
    }

    // Gets incidents from the database and adds them to the responder dashboard.
    async function showIncidents() {
        let response = await getData("/getResponderIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("incidents");
                for (const incident of response.incidents) {
                    await createIncidentDisplay(incident, contentDOM, true);
                }
            }
        }
    }

    // Gets incidents from the database and adds them to the responder dashboard.
    async function showIncidentLog() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("incidentLog");
                for (const incident of response.incidents) {
                    createIncidentDisplay(incident, contentDOM, false); // dont display a join button in the incidentLog
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

    // DISPLAY SESSION USER INFO
    displaySessionUser();

    // DISPLAY PROFILE INFORMATION
    prepareProfile();

    // DISPLAY DASHBOARD
    showIncidents();

    // DISPLAY INCIDENT LOG
    showIncidentLog();
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
