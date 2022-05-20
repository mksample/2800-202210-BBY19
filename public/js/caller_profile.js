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

    function appendAfter(incidentDisp, contentDOM) {
        contentDOM.appendChild(incidentDisp);
    }

    function appendBefore(incidentDisp, contentDOM) {
        contentDOM.insertBefore(incidentDisp, contentDOM.firstChild)
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
                prepareDisplayIncidentModal(incident);
                openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
            })
        } else {

            // TODO: temp, replace this with the edit incident modal
            contentDOM.querySelector("#incident" + incident.ID).parentNode.addEventListener("click", async function (e) {
                e.stopImmediatePropagation();
                prepareDisplayIncidentModal(incident);
                openDisplayIncidentModal(incident, "displayIncidentModal", "displayIncidentCancelButton");
            })
        }
    }

    // TEMPORARY UNTIL SWITCHED OVER TO STANDARD
    function tempOpenModal(modalID) {
        // get modal
        var modal = document.getElementById(modalID);
        modal.style.display = "block";

        // // When the user clicks cancel button, closes the modal
        // var cancel = document.getElementsByClassName("cancelButton")[0];
        var cancel = document.getElementsByClassName(modalID + "CancelButton")[0];
        cancel.onclick = function () {
            console.log("cancel button");
            modal.style.display = "none";
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }
    }

    // Prepares a callers dashboard
    async function prepareDashboard() {
        document.getElementById("callForHelp").addEventListener("click", async function (e) {
            console.log("callForHelp called");
            tempOpenModal("callForHelpModal");
        });

        document.getElementById("reportIncident").addEventListener("click", async function (e) {
            console.log("reportIncident called");
            tempOpenModal("reportIncidentModal");
        });

        document.getElementById("activeIncident").addEventListener("click", async function (e) {
            console.log("activeIncident called");
            tempOpenModal("activeIncidentModal");
        });

        // Listener for call for help
        document.getElementById("callSubmit").addEventListener("click", async function (e) {
            let response = await postData("/createIncident", {
                title: document.getElementById("title").value,
                priority: document.getElementById("Priority").value,
                type: document.getElementById("InciType").value,
                description: document.getElementById("description").value,
                // lat: document.getElementById("user_lat").textContent,
                // lon: document.getElementById("user_lng").textContent
                lat: 48.787386,
                lon:  -125.221652
            })
            if (response) {
                if (response.status == "fail") {
                    console.log(response.msg);
                    document.getElementById("callForHelpModalStatus").innerHTML = response.displayMsg;
                } else {
                    console.log(response.msg);
                    let incident = response.incident;
                    let image = await uploadImagesIncident(e, response.incident);
                    if (image) {
                        incident.image = image;
                    }
                    createIncidentDisplay(incident, document.getElementById("profiles"), appendAfter);
                    createIncidentDisplay(incident, document.getElementById("incidents"), appendBefore);
                    document.getElementById("callForHelpModal").style.display = "none";
                }
            }
        });
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

    // Gets incidents from the database and adds them to the caller dashboard if theyre active.
    async function showActiveIncidents() {
        let response = await getData("/getIncidents");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                let contentDOM = document.getElementById("profiles");
                for (const incident of response.incidents) {
                    if (incident.status == "ACTIVE") {
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

