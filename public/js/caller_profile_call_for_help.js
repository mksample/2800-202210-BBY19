"use strict";

function submitCallForHelp() {
    let contactNumber = document.getElementById("callForHelpNumberInput").value;
    document.getElementById("callForHelpStatus").innerHTML = ``;
    if (contactNumber == `` || contactNumber.length != 10 || isNaN(contactNumber)) {
        document.getElementById("callForHelpStatus").innerHTML = "Please input valid phone number.";
    } else {
        document.getElementById("callForHelpStatus").innerHTML = ``;
        checkM(checkMobile(), contactNumber);
    }
}

function prepareCallForHelpModal() {
    document.getElementById("callForHelpNumberInput").value = ``;
    document.getElementById("previewContents").value = ``;
    document.getElementById("textContents").value = ``;
    document.getElementById("callForHelpPreviewButton").onclick = async function () {
        previewCallForHelp();
    };
}

function previewCallForHelp() {
    document.getElementById("previewContents").innerText = ``;
    getUserLocation();
}

function updateText(la, lo) {
    let latitude = la;
    let longitude = lo;
    let today = new Date();
    let timeStamp = today.toLocaleString();
    const messageText = document.getElementById('textContents').value;
    let previewText = `Current time: ` + timeStamp + ` \n` + messageText + ` \n` + `https://maps.google.co.kr/?ll=` + latitude + `,` + longitude;
    document.getElementById("previewContents").value = previewText;
}

function checkMobile() {
    // Get userAgent
    var varUA = navigator.userAgent.toLowerCase();
    if (varUA.indexOf('android') > -1) {
        return "android";
    } else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
        //For iOS
        return "ios";
    } else {
        //For other OS
        return "other";
    }
}

function success({
    coords,
}) {
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    updateText(latitude, longitude);
}

function getUserLocation() {
    if (!navigator.geolocation) {
        throw "Location information is not supported.";
    }
    navigator.geolocation.getCurrentPosition(success);
}

function checkM(m, contactNumber) {
    let phoneNumber = contactNumber;
    const text = document.getElementById('previewContents').value;
    if (text == ``) {
        document.getElementById("callForHelpStatus").innerHTML = "Please preview the text before submission.";
    } else {
        document.getElementById("callForHelpStatus").innerHTML = ``;
        location.href = 'sms:' + phoneNumber + (m == 'ios' ? '&' : '?') + 'body=' + encodeURIComponent(text);
    }
}