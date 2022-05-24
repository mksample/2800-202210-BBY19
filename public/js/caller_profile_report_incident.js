"use strict";

// Submit method for the report incident modal.
async function submitReportIncident(incident) {
    let response = await postData("/createIncident", {
        title: document.getElementById("reportIncidentTitle").value,
        priority: document.getElementById("reportIncidentPriority").value,
        type: document.getElementById("reportIncidentType").value,
        description: document.getElementById("reportIncidentDescription").value,
        lat: document.getElementById("reportIncidentLat").value,
        lon: document.getElementById("reportIncidentLon").value
    })
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            document.getElementById("reportIncidentStatus").innerHTML = response.displayMsg;
            return false;
        } else {
            console.log(response.msg);
            let incident = response.incident;
            let image = await uploadImagesIncident(response.incident, document.getElementById("reportIncidentImageUpload"));
            updateReportIncident(incident, image);
        }
    }
    return true;
}

// Preparation funciton for the report incident modal.
function prepareCreateIncidentModal() {
    initMap(null, null, null, "reportIncidentMap", true, true, false, "reportIncidentLat", "reportIncidentLon");
    document.getElementById("reportIncidentTitle").value = ""; 
    document.getElementById("reportIncidentPriority").value = "URGENT";
    document.getElementById("reportIncidentType").value = "HARASSMENT";
    document.getElementById("reportIncidentDescription").value = "";
    document.getElementById("reportIncidentLat").value = "";
    document.getElementById("reportIncidentLon").value = "";
    document.getElementById("reportIncidentImageUpload").value = null;
}

// Adds the created incident to the dashboard and incident log.
function updateReportIncident(incident, image) {
    if (image) {
        incident.image = image;
    }
    createIncidentDisplay(incident, document.getElementById("profiles"), appendAfterActiveIncident); // dashboard
    createIncidentDisplay(incident, document.getElementById("incidents"), appendBefore); // incident log
}

// Creates incident displays, attaches event listeners to them, and appends them to contentDOM.
function createIncidentDisplay(incident, contentDOM, appendFunction) {
    // Creating incident display
    let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
    incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
    incidentDisp.querySelector("#incidentPriority").innerHTML = incident.priority;
    incidentDisp.querySelector("#incidentType").innerHTML = incident.type;
    incidentDisp.querySelector("#incidentStatus").innerHTML = incident.status;
    incidentDisp.querySelector("#incidentTimestamp").innerHTML = incident.timestamp;
    incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);
    incidentDisp.querySelector('.incident').incident = incident;

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
    appendFunction(incidentDisp, contentDOM);

    // If the incident is not active, add an event listener for displaying it. Otherwise, add an event listener for editing it.
    if (incident.status != "ACTIVE") {
        contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            await prepareDisplayIncidentModal(incident);
            openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
        })
    } else {
        contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
            e.stopImmediatePropagation();
            await prepareEditIncidentModal(incident);
            openModal(incident, "editIncidentModal", "editIncidentCancelButton", "editIncidentSubmitButton", "editIncidentStatus", submitEditIncident);
        })
    }
}

// Appends at the end of the contentDOM.
function appendAfter(incidentDisp, contentDOM) {
    contentDOM.appendChild(incidentDisp);
}

// Appends after the active incident button.
function appendAfterActiveIncident(incidentDisp, contentDOM) {
    contentDOM.insertBefore(incidentDisp, document.getElementById("activeIncident").parentNode.nextSibling)
}