"use strict";

// Submit method for the edit incident modal.
async function submitEditIncident(incident) {
    let image = await uploadImagesIncident(incident, document.getElementById("editIncidentImageUpload"));

    let response = await postData("/editIncident", {
        incidentID: incident.ID,
        title: document.getElementById("editIncidentTitle").value,
        priority: document.getElementById("editIncidentPriority").value,
        type: document.getElementById("editIncidentType").value,
        description: document.getElementById("editIncidentDescription").value,
        lat: document.getElementById("editIncidentLat").value,
        lon: document.getElementById("editIncidentLon").value
    })
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            document.getElementById("editIncidentStatus").innerHTML = response.displayMsg;
            return false;
        } else {
            console.log(response.msg);
            let incident = response.incident;
            updateEditIncidents(incident, image);
        }
    }
    return true;
}

// Preparation function for the edit incident modal.
async function prepareEditIncidentModal(incident) {
    initMap(incident.lat, incident.lon, null, "editIncidentMap", true, true, true, "editIncidentLat", "editIncidentLon");
    document.getElementById("editIncidentTitle").value = incident.title;
    document.getElementById("editIncidentPriority").value = incident.priority;
    document.getElementById("editIncidentType").value = incident.type;
    document.getElementById("editIncidentDescription").value = incident.description;
    document.getElementById("editIncidentLat").value = incident.lat;
    document.getElementById("editIncidentLon").value = incident.lon;
    if (incident.image) {
        document.getElementById("editIncidentImage").style.display = "";
        document.getElementById("editIncidentImage").src = incident.image;
    } else {
        document.getElementById("editIncidentImage").style.display = "none";
    }
    document.getElementById("reportIncidentImageUpload").value = null;
}

// Updates edited incidents in the dashboard and incident log.
function updateEditIncidents(incident, image) {
    createIncidentDisplay(incident, document.getElementById("profiles"), replace); // update dashboard display
    createIncidentDisplay(incident, document.getElementById("incidents"), replace); // update incident log display
}

// Appends at the end of the contentDOM.
function appendAfter(incidentDisp, contentDOM) {
    contentDOM.appendChild(incidentDisp);
}

// Appends at the start of the contentDOM.
function appendBefore(incidentDisp, contentDOM) {
    contentDOM.insertBefore(incidentDisp, contentDOM.firstChild);
}

// Replaces an incident with an updated one.
function replace(incidentDisp, contentDOM) {
    let incident = contentDOM.querySelector("#" + incidentDisp.querySelector(".incident").id).parentNode;
    incident.parentNode.replaceChild(incidentDisp, incident);
}