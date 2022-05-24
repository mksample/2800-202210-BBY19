"use strict";

let contactNumber;
function submitCallForHelp() {
    console.log("submitted");
    let number = contactNumber.substr(0,3) + contactNumber.substr(4,3) + contactNumber.substr(8,4);
    console.log("Message to: " + number);
    checkM(checkMobile(), number);
}

function prepareCallForHelpModal() {
    document.getElementById("previewContents").value = "";
    document.getElementById("textContents").value = "";
    document.getElementById("callForHelpPreviewButton").onclick = async function () {
        let response = await getData("/getUser");
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                contactNumber = response.user.contactNumber;
                document.getElementById("contactNumber").innerHTML = contactNumber; // TODO change this to registered number from database
            }
        }
        previewCallForHelp();
    }
}

function previewCallForHelp() {
    console.log("preview");
    document.getElementById("previewContents").value = ``;
    getUserLocation();
}

function updateText(la, lo) {
    let latitude = la;
    let longitude = lo;
    let today = new Date();
    let timeStamp = today.toLocaleString();
    const messageText = document.getElementById('textContents').value;
    let previewText = `Current time: ` + timeStamp + ` \n` + messageText + ` \n` + `https://maps.google.co.kr/?ll=` + latitude + `,` + longitude;
    console.log(previewText);
    document.getElementById("previewContents").value = previewText;
}

function checkMobile() {
    // Get userAgent
    var varUA = navigator.userAgent.toLowerCase();
    if (varUA.indexOf('android') > -1) {
        //For Android
        console.log("android");
        return "android";
    } else if (varUA.indexOf("iphone") > -1 || varUA.indexOf("ipad") > -1 || varUA.indexOf("ipod") > -1) {
        //For iOS
        console.log("ios");
        return "ios";
    } else {
        //For other OS
        console.log("other");
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
    console.log("message sent to " + phoneNumber);
    location.href = 'sms:' + phoneNumber + (m == 'ios' ? '&' : '?') + 'body=' + encodeURIComponent(text);
}