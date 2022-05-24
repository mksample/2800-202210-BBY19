"use strict";
function submitCallForHelp() {
    console.log("submitted");
    let contactNumber = "7786972351";
    checkM(checkMobile(), contactNumber);
}

function prepareCallForHelpModal() {
    document.getElementById("previewContents").value = "";
    document.getElementById("textContents").value = "";
    document.getElementById("callForHelpPreviewButton").onclick = async function () {
        previewCallForHelp();
    }
}

function previewCallForHelp() {
    console.log("preview");
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

    document.getElementById("previewContents").innerText = previewText;
}

function checkMobile() {
    // Get userAgent
    var varUA = navigator.userAgent.toLowerCase();
    if (varUA.indexOf('android') > -1) {
        //For Android
        console.log("android");
        document.getElementById("callForHelpStatus").innerHTML = "android";
        return "android";
    } else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
        //For iOS
        console.log("ios");
        document.getElementById("callForHelpStatus").innerHTML = "ios";
        return "ios";
    } else {
        //For other OS
        console.log("other");
        document.getElementById("callForHelpStatus").innerHTML = "others";
        return "other";
    }
}

function success({
    coords,
}) {
    const latitude = coords.latitude;
    const longitude = coords.longitude;
    console.log(latitude + " " + longitude);
    updateText(latitude, longitude);
}

function getUserLocation() {
    if (!navigator.geolocation) {
        throw "Location information is not supported.";
    }
    console.log("get user location");
    navigator.geolocation.getCurrentPosition(success);
}

function checkM(m, contactNumber) {
    let phoneNumber = contactNumber;
    const text = document.getElementById('previewContents').value;
    console.log(text);
    console.log(phoneNumber);
    location.href = 'sms:' + phoneNumber + (m == 'ios' ? '&' : '?') + 'body=' + encodeURIComponent(text);
    console.log("message sent to " + phoneNumber);
}
