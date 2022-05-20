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

    // Creates incident displays, attaches event listeners to them, and appends them to contentDOM.
    function createIncidentDisplay(incident, contentDOM) {
        // Creating incident display
        let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
        incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
        incidentDisp.querySelector("#incidentPriority").innerHTML = incident.priority;
        incidentDisp.querySelector("#incidentType").innerHTML = incident.type;
        incidentDisp.querySelector("#incidentStatus").innerHTML = incident.status;
        incidentDisp.querySelector("#incidentTimestamp").innerHTML = incident.timestamp;
        incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);

        // If the incident is not active, do not show a delete button. Otherwise add a listener.
        if (incident.status != "ACTIVE") {
            incidentDisp.querySelector("#deleteIncidentButton").style.display = "none";
        } else {
            incidentDisp.querySelector("#deleteIncidentButton").addEventListener("click", async function (e) {
                e.stopImmediatePropagation();
                openModal(incident, "deleteIncidentModal", "deleteIncidentCancelButton", "deleteIncidentSubmitButton", "deleteIncidentStatus", submitDeleteIncidentModal);
            })
        }

        // Append the incident display to the contentDOM.
        contentDOM.appendChild(incidentDisp);



        // If the incident is not active, add an event listener for displaying it. Otherwise, add an event listener for editing it.
        if (incident.status != "ACTIVE") {
            console.log("test")
            contentDOM.querySelector("#incident" + incident.ID).addEventListener("click", async function (e) {
                e.stopImmediatePropagation();
                prepareDisplayIncidentModal(incident);
                openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
            })
        } else {
            // TODO: add edit incident event listener here
        }
    }

    // Gets incidents from the database and adds them to the caller incident log.
    async function showIncidentLog() {
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

    // Gets incidents from the database and adds them to the caller dashboard if theyre active.
    async function showActiveIncidents() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("profiles");
                for (const incident of response.incidents) {
                    if (incident.status == "ACTIVE") {
                        createIncidentDisplay(incident, contentDOM);
                    }
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

    // DISPLAY INCIDENT LOG
    showIncidentLog();

    // DISPLAY ACTIVE INCIDENTS ON DASHBOARD
    showActiveIncidents();
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

