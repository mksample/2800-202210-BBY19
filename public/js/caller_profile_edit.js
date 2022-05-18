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

    /**
     * JS for each button: edit and save
     */
    const paragraph = document.getElementsByClassName("edit");
    const edit_button = document.getElementById("edit-button");
    const end_button = document.getElementById("end-editing");

    edit_button.addEventListener("click", function () {

        for (let i = 0; i < paragraph.length; i++) {
            paragraph[i].contentEditable = true;
            paragraph[i].style.backgroundColor = "#ffcccb";
            paragraph[2].contentEditable = false; // email address cannot be changed, except admin
            paragraph[2].style.backgroundColor = "#ffffe0";
            paragraph[7].contentEditable = false; // email address cannot be changed, except admin
            paragraph[7].style.backgroundColor = "#ffffe0";


        }

    });

    function closeEditing() {
        for (let i = 0; i < paragraph.length; i++) {
            paragraph[i].contentEditable = false;
            paragraph[i].style.backgroundColor = "lightblue";
            document.getElementById("editUserStatus").innerHTML = "";
        }
    }

    document.getElementById("end-editing").addEventListener("click", async function (e) {

        let response = await postData("/editUser", {
            email: document.getElementById("detail_user_email").textContent,
            password: document.getElementById("detail_user_password").textContent,
            firstName: document.getElementById("detail_user_firstN").textContent,
            lastName: document.getElementById("detail_user_lastN").textContent,
            age: document.getElementById("detail_user_age").textContent,
            gender: document.getElementById("detail_user_gender").textContent,
            phoneNumber: document.getElementById("detail_user_cellphone").textContent,
            role: document.getElementById("detail_user_role").textContent
        })

        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
                document.getElementById("editUserStatus").innerHTML = response.displayMsg; // display edit user failure
            } else {
                console.log(response.msg);
                closeEditing();
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
