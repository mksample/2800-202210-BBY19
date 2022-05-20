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

// Opens a modal when given a user, modalID (what modal to use), a cancel button, submit button, status, and a save method.
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

// Submit function for the delete incident modal. POSTS to /deleteIncident, returns true if successful, false if not.
// Updates the incident displays on success.
async function submitDeleteIncidentModal(incident) {
    // submit delete incident POST
    let response = await postData("/deleteIncident", {
        incidentID: incident.ID,
    });

    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            return false;
        } else {
            console.log(response.msg);
            updateDeleteIncident(incident);
        }
    }
    return true;
}

// Removes profile displays from the dashboard and incident log.
async function updateDeleteIncident(incident) {
    // delete from dashboard
    let contentDOM = document.getElementById("profiles");
    let incidentDisp = contentDOM.querySelector("#incident" + incident.ID);
    contentDOM.removeChild(incidentDisp.parentNode); // remove profile display

    // delete from incident log
    contentDOM = document.getElementById("incidents");
    incidentDisp = contentDOM.querySelector("#incident" + incident.ID);
    contentDOM.removeChild(incidentDisp.parentNode); // remove profile display
}