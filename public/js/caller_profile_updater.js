"use strict";

const run = true;
const time = 5000; // how often the updater runs in ms.

// Gets incidents from the database.
async function getIncidents() {
    let response = await getData("/getIncidents");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            return response.incidents;
        }
    }
}

// Updates incidents on the dashboard and incident log.
async function runUpdater() {
    if (!run) {
        return;
    }

    let dashboardDOM = document.getElementById("profiles");
    let incidentLogDOM =document.getElementById("incidents");

    let newIncidents = await getIncidents();

    // Dashboard
    for (const newDashboardIncident of newIncidents) {
        let dashboardIncident = dashboardDOM.querySelector("#incident" + newDashboardIncident.ID);
        if (dashboardIncident && compare(dashboardIncident.incident, newDashboardIncident)) {
            createIncidentDisplay(newDashboardIncident, dashboardDOM, replace);
        }
    }

    // Incident Log
    for (const newIncidentLogIncident of newIncidents) {
        let incidentLogIncident = incidentLogDOM.querySelector("#incident" + newIncidentLogIncident.ID);
        if (incidentLogIncident && compare(incidentLogIncident.incident, newIncidentLogIncident)) {
            createIncidentDisplay(newIncidentLogIncident, incidentLogDOM, replace);
        }
    }
    
    setTimeout(runUpdater, time);
}

// Compares two incidents. Returns true if not equal.
function compare(incident1, incident2) {
    if (incident1.description != incident2.description) {
        return true;
    }
    if (incident1.image != incident2.image) {
        return true;
    }
    if (incident1.priority != incident2.priority) {
        return true;
    }
    if (incident1.resolutionComment != incident2.resolutionComment) {
        return true;
    }
    if (incident1.status != incident2.status) {
        return true;
    }
    if (incident1.title != incident2.title) {
        return true;
    }
    if (incident1.type != incident2.type) {
        return true;
    }
    return false;
}

// Updates an incident with a new one.
function replace(incidentDisp, contentDOM) {
    let incident = contentDOM.querySelector("#" + incidentDisp.querySelector(".incident").id).parentNode;
    incident.parentNode.replaceChild(incidentDisp, incident);
}