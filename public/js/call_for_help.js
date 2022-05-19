"use strict";
ready(async function () {
    async function postData(url, data) {
        const response = await fetch(url, {
            method: 'POST',
            mode: 'same-origin',
            cache: 'default',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            body: JSON.stringify(data)
        });
        return response.json();
    }


    // Listener for call for help
    document.getElementById("callSubmit").addEventListener("click", async function (e) {
        let response = await postData("/createIncident", {
            title: document.getElementById("title").value,
            priority: document.querySelector('input[name="Priority"]:checked').value,
            type: document.querySelector('input[name="InciType"]:checked').value,
            description: document.getElementById("description").value,
            lat: document.getElementById("user_lat").textContent,
            lon: document.getElementById("user_lng").textContent 
           
        })
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
            } else {
                console.log(response.msg);
            }
        }
    });
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