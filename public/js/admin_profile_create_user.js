"use strict";

// NOTE: Create user re-uses the edit user modal except it keeps inputs blank and uses a different submit method.
// This is why you will see the editUserModal and its form ids referenced in this file.
// Eventually this could be de-coupled and we can use the sign-up form icons instead of the editUserModal icon labels.

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
    }

    var save = document.getElementById(submitButton);
    save.onclick = async function () {
        let success = await saveMethod(user);
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

// Creates profile displays, attaches event listeners to them, and appends them to the id="profiles" div.
function createProfileDisplay(user, contentDOM) {
    // creating profile display
    let profile = document.getElementById("UserProfileTemplate").content.cloneNode(true);
    profile.querySelector(".profilePicture").innerHTML = user.email;
    profile.querySelector(".profileEmail").innerHTML = "Email: " + user.email
    profile.querySelector(".profileRole").innerHTML = "Role: " + user.role;;
    profile.querySelector('.profile').setAttribute("id", user.ID);

    // appending the profile to the contentDOM
    contentDOM.appendChild(profile);

    // when profile clicked on, prepare and show edit profile modal
    document.getElementById(user.ID).addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        prepareEditUserModal(user);
        openModal(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
    })

    // when delete button clicked on, show delete profile modal
    document.getElementById(user.ID).querySelector(".close").addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        openModal(user, "deleteUserModal", "deleteUserCancelButton", "deleteUserSubmitButton", "deleteUserStatus", submitDeleteUserModal);
    })
}

// Sets input values in the edit user modal to blank values and default radio button values.
function prepareCreateUserModal(user) {
    document.getElementById("editUserEmail").value = "";
    document.getElementById("editUserPassword").value = "";
    document.getElementById("editUserFirstName").value = "";
    document.getElementById("editUserLastName").value = "";
    document.getElementById("editUserAge").value = "";
    document.getElementById("editUserPhoneNumber").value = "";
    document.getElementById("male").checked = true;
    document.getElementById("CALLER").checked = true;
}

// Submit function for the edit user modal. POSTS to /createUser, returns true if successful, false if not.
// Creates a new profile display for the new profile on success.
async function submitCreateUserModal(user) {
    // submit create user POST
    let response = await postData("/createUser", {
        email: document.getElementById("editUserEmail").value,
        password: document.getElementById("editUserPassword").value,
        firstName: document.getElementById("editUserFirstName").value,
        lastName: document.getElementById("editUserLastName").value,
        age: document.getElementById("editUserAge").value,
        gender: document.querySelector('input[name="gender"]:checked').value,
        phoneNumber: document.getElementById("editUserPhoneNumber").value,
        role: document.querySelector('input[name="role"]:checked').value
    });

    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
            document.getElementById("modalStatus").innerHTML = response.displayMsg; // display create user failure
            return false;
        } else {
            console.log(response.msg);
            createProfileDisplay(response.user, document.getElementById("profiles")); 
        }
    }
    return true;
}