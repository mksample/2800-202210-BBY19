"use strict";
// Prepares a users profile tab
async function prepareProfile() {
    const input = document.getElementsByClassName("editable");
    const edit_button = document.getElementById("edit-button");

    let response = await getData("/getUser");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            if (response.user.avatar != null) {
                document.getElementById("detail_user_picture").src = response.user.avatar;
            }
            document.getElementById("detail_user_firstN").value = response.user.firstName;
            document.getElementById("detail_user_lastN").value = response.user.lastName;
            document.getElementById("detail_user_email").value = response.user.email;
            document.getElementById("detail_user_password").value = response.user.password;
            document.getElementById("detail_user_age").value = response.user.age;
            document.getElementById("detail_user_gender").value = response.user.gender;
            document.getElementById("detail_user_cellphone").value = response.user.phoneNumber;
        }
    }

    edit_button.addEventListener("click", function () {

        for (let i = 0; i < input.length; i++) {
            input[i].readOnly = false;
            input[i].style.color = "black"
            input[2].readOnly = true; // email address cannot be changed, except admin
            input[2].style.color = "grey"

        }

    });

    document.getElementById("end-editing").addEventListener("click", async function (e) {
        let response = await postData("/editUser", {
            email: document.getElementById("detail_user_email").value,
            password: document.getElementById("detail_user_password").value,
            firstName: document.getElementById("detail_user_firstN").value,
            lastName: document.getElementById("detail_user_lastN").value,
            age: document.getElementById("detail_user_age").value,
            gender: document.getElementById("detail_user_gender").value,
            phoneNumber: document.getElementById("detail_user_cellphone").value
        })
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
                document.getElementById("editUserStatus").innerHTML = response.displayMsg; // display edit user failure
            } else {
                for (let i = 0; i < input.length; i++) {
                    input[i].contentEditable = false;
                    input[i].style.color = "grey";
                    document.getElementById("editUserStatus").innerHTML = "";
                }
            }
        }
    });
}