"use strict";

// When the user clicks the submit button, it opens the text messaging application in user's device.
function submitCallForHelp() {
    let contactNumber = document.getElementById("callForHelpNumberInput").value;
    // Cleans the text input box of contact number.
    document.getElementById("callForHelpStatus").innerHTML = ``;
    // Verifies the contact number is valid.
    if (contactNumber == `` || contactNumber.length != 10 || isNaN(contactNumber)) {
        document.getElementById("callForHelpStatus").innerHTML = "Please input valid phone number.";
    } else {
        document.getElementById("callForHelpStatus").innerHTML = ``;
        checkM(checkMobile(), contactNumber);
    }
}

// Initializes the call for help modal window.
function prepareCallForHelpModal() {
    document.getElementById("callForHelpNumberInput").value = ``;
    document.getElementById("previewContents").value = ``;
    document.getElementById("textContents").value = ``;
    document.getElementById("callForHelpPreviewButton").onclick = async function () {
        previewCallForHelp();
    };
}

// Generate text message based on the user input.
// It adds time stamp, current user location, and Google link.
function previewCallForHelp() {
    document.getElementById("previewContents").innerText = ``;
    getUserLocation();
}

// Updates the generated text message into preview text box.
function updateText(la, lo) {
    let latitude = la;
    let longitude = lo;
    let today = new Date();
    let timeStamp = today.toLocaleString();
    const messageText = document.getElementById('textContents').value;
    let previewText = `Current time: ` + timeStamp + ` \n` + messageText + ` \n` + `https://maps.google.co.kr/?ll=` + latitude + `,` + longitude;
    document.getElementById("previewContents").value = previewText;
}

// Detects the OS of user's device to figure out the method for calling text message application.
function checkMobile() {
    // Get userAgent information.
    var varUA = navigator.userAgent.toLowerCase();
    if (varUA.indexOf('android') > -1) {
        return "android";
    } else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
        return "ios";
    } else {
        return "other";
    }
}

// Gets the current location information.
function success({
    coords,
}) {
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    updateText(latitude, longitude);
}

// Checks the navigator to get the current location information.
function getUserLocation() {
    if (!navigator.geolocation) {
        throw "Location information is not supported.";
    }
    navigator.geolocation.getCurrentPosition(success);
}

// Opens the text messaging applicaion for each device 
function checkM(m, contactNumber) {
    let phoneNumber = contactNumber;
    const text = document.getElementById('previewContents').value;
    // If the preview box is empty, it shows the alert message to prevent unintended results. 
    if (text == ``) {
        document.getElementById("callForHelpStatus").innerHTML = "Please preview the text before submission.";
    } else {
        document.getElementById("callForHelpStatus").innerHTML = ``;
        location.href = 'sms:' + phoneNumber + (m == 'ios' ? '&' : '?') + 'body=' + encodeURIComponent(text);
    }
}