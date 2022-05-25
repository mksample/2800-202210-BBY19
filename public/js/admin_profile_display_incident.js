"use strict";
// Opens a modal when given a user, modalID (what modal to use), and a cancel button.
// Variant used because modal does not have a submit button or save method.
function openDisplayIncidentModal(incident, modalID, cancelButton) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // close modal when cancel button clicked
    var cancel = document.getElementById(cancelButton);
    cancel.onclick = function () {
        modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
}

// Prepares the display incident modal.
async function prepareDisplayIncidentModal(incident) {
    initDisplayMap(incident.lat, incident.lon, null, "displayIncidentMap");
    if (incident.image) {
        document.getElementById("displayIncidentImage").style.display = "";
        document.getElementById("displayIncidentImage").src = incident.image;
    } else {
        document.getElementById("displayIncidentImage").style.display = "none";
    }
    document.getElementById("displayIncidentTitle").innerHTML = incident.title;
    document.getElementById("displayIncidentPriority").innerHTML = incident.priority;
    document.getElementById("displayIncidentType").innerHTML = incident.type;
    document.getElementById("displayIncidentStatus").innerHTML = incident.status;
    document.getElementById("displayIncidentCallerID").innerHTML = incident.callerID;
    document.getElementById("displayIncidentDescription").innerHTML = incident.description;
    document.getElementById("displayIncidentTimestamp").innerHTML = incident.timestamp;
    if (incident.resolutionComment) {
        document.getElementById("displayIncidentResolutionComment").style.display = "";
        document.getElementById("displayIncidentResolutionComment").innerHTML = incident.resolutionComment;
    } else {
        document.getElementById("displayIncidentResolutionComment").style.display = "none";
    }
}