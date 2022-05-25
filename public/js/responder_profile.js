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

    // Creates incident displays, attaches event listeners to them, and appends them to contentDOM.
    async function createIncidentDisplay(incident, contentDOM, appendMethod, joinButton) {
        // Creating incident display
        let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
        var date = new Date(Date.parse(incident.timestamp));
        incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
        incidentDisp.querySelector("#incidentPriority").innerHTML = "Priority: " + incident.priority;
        incidentDisp.querySelector("#incidentType").innerHTML = "Type: " + incident.type;
        incidentDisp.querySelector("#incidentStatus").innerHTML = "Status: " + incident.status;
        incidentDisp.querySelector("#incidentTimestamp").innerHTML = date.toLocaleString('en-US', { timeZone: 'PST' });
        incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);
        incidentDisp.querySelector('.incident').incident = incident;

        // appending the incident to the contentDOM
        appendMethod(incidentDisp, contentDOM);

        // Query user for ID
        let response = await getData("/getUser");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let joined = false;
                let user = response.user;
                for (const responderID of incident.responderIDs) {
                    if (responderID == user.ID) {
                        joined = true;
                    }
                }
                // If the user has already joined the incident, disable the join button.
                if (joined) {
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").value = "Responding";
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").style.border = "1px solid #71e027";
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").style.backgroundColor = "#71e027";
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").style.cursor = "default"
                    contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").disabled = true;
                } 
            }
        }
        if (incident.image) {
            document.getElementById("displayIncidentImage").src = incident.image;
        }

        // Remove join button if needed. Otherwise attach event listener to it.
        if (!joinButton) {
            contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").style.display = "none";
        } else {
            contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").addEventListener("click", async function (e) {
                e.stopImmediatePropagation();
                openModal(incident, "joinIncidentModal", "joinIncidentCancelButton", "joinIncidentSubmitButton", "joinIncidentStatus", submitJoinIncidentModal);
            });
        }

        // Add an event listener to the display for displaying the incident.
        contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            await prepareDisplayIncidentModal(incident);
            openModal(incident, "displayIncidentModal", "displayIncidentCancelButton", "displayIncidentResolveButton", "displayIncidentResolveStatus", submitDisplayIncidentModal);
        });
    }

    function appendAfter(incidentDisp, contentDOM) {
        contentDOM.appendChild(incidentDisp);
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
                    await createIncidentDisplay(incident, contentDOM, appendAfter, true);
                }
            }
        }
    }

    // Gets incidents from the database and adds them incident log.
    async function showIncidentLog() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("incidentLog");
                for (const incident of response.incidents) {
                    createIncidentDisplay(incident, contentDOM, appendAfter, false); // dont display a join button in the incidentLog
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
    await displaySessionUser();

    // DISPLAY DASHBOARD
    await showIncidents();

    // DISPLAY INCIDENT LOG
    await showIncidentLog();

    // PREPARE USER PROFILE (from responder_profile_edit.js)
    await prepareProfile();

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
