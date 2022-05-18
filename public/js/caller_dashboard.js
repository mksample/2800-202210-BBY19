"use strict";

ready(async function () {

    document.getElementById("callForHelp").addEventListener("click", async function (e) {
        console.log("callForHelp called");
        openModal("callForHelpModal");
    });

    document.getElementById("reportIncident").addEventListener("click", async function (e) {
        console.log("reportIncident called");
        openModal("reportIncidentModal");
    });

    document.getElementById("activeIncident").addEventListener("click", async function (e) {
        console.log("activeIncident called");
        openModal("activeIncidentModal");
    });

    function openModal(modalID) {
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

    // document.querySelector("#cancel").addEventListener("click", async function (e) {
    //     var modal = document.getElementById(modalID);
    //     modal.style.display = "none";
    // });

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