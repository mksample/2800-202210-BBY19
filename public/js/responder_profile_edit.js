"use strict";
// Prepares a users profile tab
async function prepareProfile() {
    const paragraph = document.getElementsByClassName("edit");
    const edit_button = document.getElementById("edit-button");
    const end_button = document.getElementById("end-editing");

    let response = await getData("/getUser");
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            if (response.user.avatar != null) {
                document.getElementById("detail_user_picture").src = response.user.avatar;
            }
            document.getElementById("detail_user_firstN").innerHTML = response.user.firstName;
            document.getElementById("detail_user_lastN").innerHTML = response.user.lastName;
            document.getElementById("detail_user_email").innerHTML = response.user.email;
            document.getElementById("detail_user_password").innerHTML = response.user.password;
            document.getElementById("detail_user_age").innerHTML = response.user.age;
            document.getElementById("detail_user_gender").innerHTML = response.user.gender;
            document.getElementById("detail_user_cellphone").innerHTML = response.user.phoneNumber;
            document.getElementById("detail_user_role").innerHTML = response.user.role;
        }
    }

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
        });
        if (response) {
            if (response.status == "fail") {
                console.log(response.msg);
                document.getElementById("editUserStatus").innerHTML = response.displayMsg; // display edit user failure
            } else {
                for (let i = 0; i < paragraph.length; i++) {
                    paragraph[i].contentEditable = false;
                    paragraph[i].style.backgroundColor = "lightblue";
                    document.getElementById("editUserStatus").innerHTML = "";
                }
            }
        }
    });
}