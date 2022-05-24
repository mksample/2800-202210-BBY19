"use strict";

const run = true;
const time = 5000; // how often the updater runs in ms.

// Gets active or inprogress incidents from the database.
async function getIncidents() {
    let response = await getData("/getResponderIncidents");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            return response.incidents;
        }
    }
}

// Gets incidents from the database.
async function getIncidentLogIncidents() {
    let response = await getData("/getIncidents");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            return response.incidents;
        }
    }
}

// Updates, creates, and deletes incidents on the dashboard and incident log.
async function runUpdater() {
    if (!run) {
        return;
    }

    let dashboardDOM = document.getElementById("incidents");
    let incidentLogDOM =document.getElementById("incidentLog");

    let newDashboardIncidents = await getIncidents();
    let newIncidentLogIncidents = await getIncidentLogIncidents();

    // Updating/Creating dashboard incidents
    for (const newDashboardIncident of newDashboardIncidents) {
        let dashboardIncident = dashboardDOM.querySelector("#incident" + newDashboardIncident.ID);
        if (dashboardIncident && compare(dashboardIncident.incident, newDashboardIncident)) {
            console.log("incident updated");
            createIncidentDisplay(newDashboardIncident, dashboardDOM, replace, true);
        } else if (!dashboardIncident) {
            createIncidentDisplay(newDashboardIncident, dashboardDOM, appendBefore, true);
        }
    }

    // Deleting dashboard incidents
    let currentDashboardIncidents = dashboardDOM.children;
    for (const currentDashboardIncident of currentDashboardIncidents) {
        let found = false;
        for (const newDashboardIncident of newDashboardIncidents) {
            if (currentDashboardIncident.querySelector(".incident").id == "incident" + newDashboardIncident.ID) {
                found = true;
            }
        }
        if (!found) {
            console.log("incident deleted");
            dashboardDOM.removeChild(currentDashboardIncident);
        }
    }

    // Incident Log
    for (const newIncidentLogIncident of newIncidentLogIncidents) {
        let incidentLogIncident = incidentLogDOM.querySelector("#incident" + newIncidentLogIncident.ID);
        if (incidentLogIncident && compare(incidentLogIncident.incident, newIncidentLogIncident)) {
            console.log("incident updated");
            createIncidentDisplay(newIncidentLogIncident, incidentLogDOM, replace, false);
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

// Appends at the start of contentDOM.
function appendBefore(incidentDisp, contentDOM) {
    if (contentDOM.firstChild) {
        contentDOM.insertBefore(incidentDisp, contentDOM.firstChild);
    } else {
        contentDOM.appendChild(incidentDisp);
    }
}