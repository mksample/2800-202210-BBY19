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

// Submit function for the join incident modal. POSTS to /joinIncident, returns true if successful, false if not.
// Updates the incident display on success.
async function submitJoinIncidentModal(incident) {
    // submit resolve incident POST
    let response = await postData("/joinIncident", {
        incidentID: incident.ID,
    });

    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            return false;
        } else {
            console.log(response.msg);
            updateJoinIncident(response.incident); // update incident display
        }
    }
    return true;
}

// Updates an incident display in the dashboard and incident log.
async function updateJoinIncident(incident) {
    // Update the dashboard display.
    let contentDOM = document.getElementById("incidents");
    let incidentDisp = contentDOM.querySelector("#incident" + incident.ID);
    incidentDisp.querySelector("#joinIncidentButton").value = "Joined";
    incidentDisp.querySelector("#joinIncidentButton").disabled = true;
    incidentDisp.querySelector("#incidentStatus").innerHTML = incident.status; // update display with new status

    // Incident returned from /joinIncident doesn't have responderIDs, append the current session users ID.
    // There is a TODO on /joinIncident for this functionality. This is a temporary fix.
    let response = await getData("/getUser");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else if (incident.responderIDs != null && incident.responderIDs != undefined) {
            incident.responderIDs.push(response.user.ID);
        } else {
            incident.responderIDs = [response.user.ID];
        }
    }

    // Re-prepare event listeners with new incident information
    let newIncidentDisp = incidentDisp.cloneNode(true);
    incidentDisp.parentNode.replaceChild(newIncidentDisp, incidentDisp); // delete any existing event listeners
    newIncidentDisp.querySelector("#joinIncidentButton").addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        openModal(incident, "joinIncidentModal", "joinIncidentCancelButton", "joinIncidentSubmitButton", "joinIncidentStatus", submitJoinIncidentModal);
    })
    newIncidentDisp.addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        await prepareDisplayIncidentModal(incident);
        openModal(incident, "displayIncidentModal", "displayIncidentCancelButton", "displayIncidentResolveButton", "displayIncidentResolveStatus", submitDisplayIncidentModal);
    })

    // TODO: UPDATE INCIDENT LOG WITH UPDATED INCIDENT
}