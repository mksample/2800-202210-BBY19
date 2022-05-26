"use strict";

const run = true;
const time = 30000; // how often the updater runs in ms.

// Gets users from the database.
async function getUsers() {
    let response = await getData("/getUsers");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            return response.users;
        }
    }
}

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

// Updates users and incidents on a timed interval.
async function runUpdater() {
    if (!run) {
        return;
    }

    let newUsers = await getUsers();
    let newIncidents = await getIncidents();

    // Users
    if (newUsers) {
        for (const newUser of newUsers) {
            let user = document.getElementById(newUser.ID);
            if (user && compareUser(user.user, newUser)) {
                createProfileDisplay(newUser, document.getElementById("userProfiles"), replaceUser);
            }
        }
    }

    // Incident Log
    if (newIncidents) {
        for (const newIncident of newIncidents) {
            let incident = document.getElementById("incident" + newIncident.ID);
            if (incident && compareIncident(incident.incident, newIncident)) {
                createIncidentDisplay(newIncident, document.getElementById("incidents"), replaceIncident);
            }
        }
    }

    setTimeout(runUpdater, time);
}

// Compares an incident with another. Returns true if not equal.
function compareIncident(incident1, incident2) {
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
    if (incident1.lat != incident2.lat) {
        return true;
    }
    if (incident1.lon != incident2.lon) {
        return true;
    }
    return false;
}

// Compares a user with another. Returns true if not equal.
function compareUser(user1, user2) {
    if (user1.age != user2.age) {
        return true;
    }
    if (user1.avatar != user2.avatar) {
        return true;
    }
    if (user1.email != user2.email) {
        return true;
    }
    if (user1.firstName != user2.firstName) {
        return true;
    }
    if (user1.gender != user2.gender) {
        return true;
    }
    if (user1.lastName != user2.lastName) {
        return true;
    }
    if (user1.password != user2.password) {
        return true;
    }
    if (user1.phoneNumber != user2.phoneNumber) {
        return true;
    }
    if (user1.role != user2.role) {
        return true;
    }
    return false;
}

// Creates profile displays, attaches event listeners to them, and appends them with a provided append method.
function createProfileDisplay(user, contentDOM, appendMethod) {
    // creating profile display
    let profile = document.getElementById("UserProfileTemplate").content.cloneNode(true);
    if (user.avatar != null) {
        profile.querySelector(".profilePicture").src = user.avatar;
    }
    profile.querySelector(".profileEmail").innerHTML = "Email: " + user.email;
    profile.querySelector(".profileRole").innerHTML = "Role: " + user.role;
    profile.querySelector('.profile').setAttribute("id", user.ID);
    profile.querySelector('.profile').user = user;

    // appending the profile
    appendMethod(profile);

    // when profile clicked on, prepare and show edit profile modal
    document.getElementById(user.ID).addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        prepareEditUserModal(user);
        openModal(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
    });

    // when delete button clicked on, show delete profile modal
    document.getElementById(user.ID).querySelector(".delete").addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        openModal(user, "deleteUserModal", "deleteUserCancelButton", "deleteUserSubmitButton", "deleteUserStatus", submitDeleteUserModal);
    });
}

// Creates incident displays, attaches event listeners to them, and appends with a provided append method.
function createIncidentDisplay(incident, contentDOM, appendMethod) {
    // Creating incident display
    let incidentDisp = document.getElementById("IncidentTemplate").content.cloneNode(true);
    var date = new Date(Date.parse(incident.timestamp));
    incidentDisp.querySelector("#incidentTitle").innerHTML = incident.title;
    incidentDisp.querySelector("#incidentPriority").innerHTML = "Priority: " + incident.priority;
    incidentDisp.querySelector("#incidentType").innerHTML = "Type: " + incident.type;
    incidentDisp.querySelector("#incidentStatus").innerHTML = "Status: " + incident.status;
    incidentDisp.querySelector("#incidentTimestamp").innerHTML = date.toLocaleString('en-US');
    incidentDisp.querySelector('.incident').setAttribute("id", "incident" + incident.ID);
    incidentDisp.querySelector('.incident').incident = incident;

    // appending the incident
    appendMethod(incidentDisp);

    contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        prepareDisplayIncidentModal(incident);
        openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
    });
}

// Append method. Replaces a user with a an updated version.
function replaceUser(userDisp) {
    let user = document.getElementById(userDisp.querySelector(".profile").id).parentNode;
    user.parentNode.replaceChild(userDisp, user);
}

// Append method. Replaces an incident with an updated version.
function replaceIncident(incidentDisp) {
    let incident = document.getElementById(incidentDisp.querySelector('.incident').id).parentNode;
    incident.parentNode.replaceChild(incidentDisp, incident);
}