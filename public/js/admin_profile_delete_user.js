"use strict";

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

// Opens a modal when given a user, modalID (what modal to use), and a save method.
// Save method is what happens when the modal is submitted, must return true or false if successful submission or not.
function openModal(user, modalID, cancelButton, submitButton, status, saveMethod) {
    // get modal
    var modal = document.getElementById(modalID);
    modal.style.display = "block";

    // close modal when cancel button clicked
    var cancel = document.getElementById(cancelButton);
    cancel.onclick = function () {
        modal.style.display = "none";
        document.getElementById(status).innerHTML = ""; // clear status when closing
    };

    var save = document.getElementById(submitButton);
    save.onclick = async function () {
        let success = await saveMethod(user);
        if (success) {
            modal.style.display = "none";
            document.getElementById(status).innerHTML = ""; // clear status when closing
        }
    };
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.getElementById(status).innerHTML = ""; // clear status when closing
        }
    };
}

// Submit function for the delete user modal. POSTS to /deleteUser, returns true if successful, false if not.
// Removes the deleted profile display on success.
async function submitDeleteUserModal(user) {
    let response = await postData("/deleteUser", {ID: user.ID});
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            document.getElementById("deleteUserStatus").innerHTML = response.displayMsg;
            return false;
        } else {
            let contentDOM = document.getElementById("profiles");
            let profile = document.getElementById(user.ID);
            contentDOM.removeChild(profile.parentNode); // remove profile display
        }
        return true;
    } 
}