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

    // Update the dashboard display.
    let contentDOM = document.getElementById("incidents");
    createIncidentDisplay(incident, contentDOM, replace, true);

    // Update the incident log display
    contentDOM = document.getElementById("incidentLog");
    createIncidentDisplay(incident, contentDOM, appendBefore, false);

    // If clicked on from within display incident modal, update button and add listener for closing    
    if (document.getElementById("displayIncidentModal").style.display == "block") {
        document.getElementById("displayIncidentResolveButton").style.display = "";
        document.getElementById("displayIncidentResolutionCommentInput").style.display = "";
        document.getElementById("joinIncidentModalButton").value = "Responding"
        document.getElementById("joinIncidentModalButton").disabled = true;
        window.onclick = function (event) {
            if (event.target == document.getElementById("displayIncidentModal")) {
                document.getElementById("displayIncidentModal").style.display = "none";
                document.getElementById("displayIncidentResolveStatus").innerHTML = "";
            }
        }
    }

}

// Creates incident displays, attaches event listeners to them, and appends them to contentDOM.
async function createIncidentDisplay(incident, contentDOM, appendMethod, joinButton) {
    // creating incident display
    let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
    incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
    incidentDisp.querySelector("#incidentPriority").innerHTML = incident.priority;
    incidentDisp.querySelector("#incidentType").innerHTML = incident.type;
    incidentDisp.querySelector("#incidentStatus").innerHTML = incident.status;
    incidentDisp.querySelector("#incidentTimestamp").innerHTML = incident.timestamp;
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
            let joined = false
            let user = response.user;
            for (const responderID of incident.responderIDs) {
                if (responderID == user.ID) {
                    joined = true;
                }
            }
            // If the user has already joined the incident, disable the join button.
            if (joined) {
                contentDOM.querySelector("#incident" + incident.ID).querySelector("#joinIncidentButton").value = "Responding"
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
        })
    }

    // Add an event listener to the display for displaying the incident.
    contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        await prepareDisplayIncidentModal(incident);
        openModal(incident, "displayIncidentModal", "displayIncidentCancelButton", "displayIncidentResolveButton", "displayIncidentResolveStatus", submitDisplayIncidentModal);
    })
}

function replace(incidentDisp, contentDOM) {
    let incident = contentDOM.querySelector("#" + incidentDisp.querySelector(".incident").id).parentNode;
    incident.parentNode.replaceChild(incidentDisp, incident);
}

function appendBefore(incidentDisp, contentDOM) {
    contentDOM.insertBefore(incidentDisp, contentDOM.firstChild)
}