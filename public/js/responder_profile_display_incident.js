"use strict";
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

// Opens a modal when given a incident, modalID (what modal to use), cancel button, submit button, status, and a save method.
// Save method is what happens when the modal is submitted, must return true or false if successful submission or not.
function openModal(incident, modalID, cancelButton, submitButton, status, saveMethod) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // close modal when cancel button clicked
    var cancel = document.getElementById(cancelButton);
    cancel.onclick = function () {
        modal.style.display = "none";
        document.getElementById(status).innerHTML = ""; // clear status when closing
    }

    var save = document.getElementById(submitButton);
    save.onclick = async function () {
        let success = await saveMethod(incident);
        if (success) {
            modal.style.display = "none";
            document.getElementById(status).innerHTML = ""; // clear status when closing
        }
    }
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementById(status).innerHTML = ""; // clear status when closing
        }
    }
}

// Prepares the display incident modal.
async function prepareDisplayIncidentModal(incident) {
    // Get session users ID
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
            // If the user has not joined the incident, or if the incident is already resolved, don't display the resolve button or resolutionComment input box.
            // Otherwise, make sure they're displayed
            if (!joined || incident.status == "RESOLVED") {
                document.getElementById("displayIncidentResolveButton").style.display = "none";
                document.getElementById("displayIncidentResolutionComment").style.display = "none";
            } else {
                document.getElementById("displayIncidentResolveButton").style.display = "";
                document.getElementById("displayIncidentResolutionComment").style.display = "";
            }
        }
    }
    if (incident.image) {
        document.getElementById("displayIncidentImage").src = incident.image;
    }
    document.getElementById("displayIncidentTitle").innerHTML = incident.title;
    document.getElementById("displayIncidentPriority").innerHTML = incident.priority;
    document.getElementById("displayIncidentType").innerHTML = incident.type;
    document.getElementById("displayIncidentStatus").innerHTML = incident.status;
    document.getElementById("displayIncidentCallerID").innerHTML = incident.callerID
    document.getElementById("displayIncidentDescription").innerHTML = incident.description
    document.getElementById("displayIncidentLat").innerHTML = incident.lat;
    document.getElementById("displayIncidentLon").innerHTML = incident.lon;
    document.getElementById("displayIncidentTimestamp").innerHTML = incident.timestamp;
    document.getElementById("displayIncidentResolutionComment").value = "";
}

// Submit function for the display incident modal. POSTS to /resolveIncident, returns true if successful, false if not.
// Updates the incident display on success.
async function submitDisplayIncidentModal(incident) {
    // submit resolve incident POST
    let response = await postData("/resolveIncident", {
        incidentID: incident.ID,
        resolutionComment: document.getElementById("displayIncidentResolutionComment").value
    });

    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            document.getElementById("displayIncidentResolveStatus").innerHTML = response.displayMsg; // display resolve failure
            return false;
        } else {
            console.log(response.msg);
            response.incident.responderIDs = incident.responderIDs;
            updateIncidentDisplay(response.incident); // update profile display with edited info
        }
    }
    return true;
}

// Updates a profile display and re-prepares the event listeners for a given user.
async function updateIncidentDisplay(incident) {
    // Remove the dashboard incident display.
    let contentDOM = document.getElementById("incidents");
    let incidentDisp = contentDOM.querySelector("#incident" + incident.ID);
    contentDOM.removeChild(incidentDisp.parentNode); // remove incident display

    // Update the incidentLog incident display
    contentDOM = document.getElementById("incidentLog");
    incidentDisp = contentDOM.querySelector("#incident" + incident.ID);

    // Delete existing event listeners
    let newIncidentDisp = incidentDisp.cloneNode(true);
    incidentDisp.parentNode.replaceChild(newIncidentDisp, incidentDisp);

    // Re-prepare event listeners and update display status
    newIncidentDisp.querySelector("#incidentStatus").innerHTML = incident.status;
    newIncidentDisp.addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        await prepareDisplayIncidentModal(incident);
        openModal(incident, "displayIncidentModal", "displayIncidentCancelButton", "displayIncidentResolveButton", "displayIncidentResolveStatus", submitDisplayIncidentModal);
    })
}