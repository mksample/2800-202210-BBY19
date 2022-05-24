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

    function appendAfter(incidentDisp, contentDOM) {
        contentDOM.appendChild(incidentDisp);
    }

    // Opens a modal when given a user, modalID (what modal to use), and a save method.
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

    // Prepares a callers dashboard
    async function prepareDashboard() {
        document.getElementById("reportIncident").addEventListener("click", async function () {
            prepareCreateIncidentModal();
            openModal(null, "reportIncidentModal", "reportIncidentCancelButton", "reportIncidentSubmitButton", "reportIncidentStatus", submitReportIncident)
        });

        document.getElementById("callForHelp").addEventListener("click", function() {
            prepareCallForHelpModal();
            openModal(null, "callForHelpModal", "callForHelpCancelButton", "callForHelpSubmitButton", "callForHelpStatus", submitCallForHelp);
        })
    }

    // Gets incidents from the database and adds them to the caller incident log.
    async function showIncidentLog() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("incidents");
                for (const incident of response.incidents) {
                    createIncidentDisplay(incident, contentDOM, appendAfter);
                }
            }
        }
    }

    // Gets incidents from the database and adds them to the caller dashboard if theyre active or in progress.
    async function showActiveIncidents() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("profiles");
                for (const incident of response.incidents) {
                    if (incident.status == "ACTIVE" || incident.status == "INPROGRESS") {
                        createIncidentDisplay(incident, contentDOM, appendAfter);
                    }
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
    displaySessionUser();

    // DISPLAY INCIDENT LOG
    showIncidentLog();

    // DISPLAY ACTIVE INCIDENTS ON DASHBOARD
    showActiveIncidents();

    // PREPARE PROFILE TAB (from caller_profile_edit.js)
    prepareProfile();

    // PREPARE DASHBOARD
    prepareDashboard();

    // RUN UPDATER
    runUpdater();
});


function ready(callback) {
    if (document.readyState != "loading") {
        callback();
        console.log("ready state is 'complete'");
    } else {
        document.addEventListener("DOMContentLoaded", callback);
        console.log("Listener was invoked");
    }
}

