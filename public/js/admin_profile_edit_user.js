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

// Sets input values in the edit user modal to users current values.
function prepareEditUserModal(user) {
    if (user.avatar) {
        document.getElementById("editUserProfilePicture").src = user.avatar;
    } else {
        document.getElementById("editUserProfilePicture").src = "/imgs/saveme.jpg";
    }
    document.getElementById("editUserEmail").value = user.email;
    document.getElementById("editUserPassword").value = user.password;
    document.getElementById("editUserFirstName").value = user.firstName;
    document.getElementById("editUserLastName").value = user.lastName;
    document.getElementById("editUserAge").value = user.age;
    document.getElementById("editUserPhoneNumber").value = user.phoneNumber;
    document.getElementById('' + user.gender).checked = true;
    document.getElementById('' + user.role).checked = true;
}

// Submit function for the edit user modal. POSTS to /adminEditUser, returns true if successful, false if not.
// Updates the edited profile display on success.
async function submitEditUserModal(user) {
    // submit edit user POST
    let response = await postData("/adminEditUser", {
        userID: user.ID,
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
            document.getElementById("editUserStatus").innerHTML = response.displayMsg; // display edit user failure
            return false;
        } else {
            console.log(response.msg);
            updateProfileDisplay(response.user); // update profile display with edited info
        }
    }
    return true;
}

// Updates a profile display and re-prepares the event listeners for a given user.
async function updateProfileDisplay(user) {
    let profile = document.getElementById(user.ID);

    if (user.avatar != null) {
        profile.querySelector(".profilePicture").src = user.avatar;
    }
    profile.querySelector(".profileEmail").innerHTML = "Email: " + user.email
    profile.querySelector(".profileRole").innerHTML = "Role: " + user.role;;

    // re-prepare event listeners
    let newProfile = profile.cloneNode(true);
    profile.parentNode.replaceChild(newProfile, profile); // delete any existing event listeners
    newProfile.addEventListener("click", async function (e) { // attach new updated one
        e.stopImmediatePropagation();
        prepareEditUserModal(user);
        openModal(user, "editUserModal", "editUserCancelButton", "editUserSubmitButton", "editUserStatus", submitEditUserModal);
    })

    // when delete button clicked on, show delete profile modal
    newProfile.querySelector(".close").addEventListener("click", async function (e) {
        e.stopImmediatePropagation();
        openModal(user, "deleteUserModal", "deleteUserCancelButton", "deleteUserSubmitButton", "deleteUserStatus", submitDeleteUserModal);
    })
}