"use strict";
ready(async function () {
    async function getData(url) {
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
        });
        return response.json();
    }

  
});


const paragraph = document.getElementsByClassName("edit");// this must be defined 
const edit_button = document.getElementById("edit-button");
const end_button = document.getElementById("end-editing");

edit_button.addEventListener("click", function() {
    console.log(paragraph.length)

    for(let i = 0; i < paragraph.length; i++) {
        paragraph[i].contentEditable = true;
        paragraph[i].style.backgroundColor = "#dddbdb";

    }
 
} );

end_button.addEventListener("click", function() {
  paragraph.contentEditable = false;
  paragraph.style.backgroundColor = "#ffe44d";
} )


// response = await postData("./app/html/caller_profile.html", 
// {email: document.getElementById("detail_user_email"),
//  password: document.getElementById("detail_user_password"),
//  firstName: document.getElementById("detail_user_firstN"), 
//  lastName: document.getElementById("detail_user_lastN"), 
//  age: document.getElementById("detail_user_age"), 
//  gender: document.getElementById("detail_user_gender"), 
//  phoneNumber: document.getElementById("detail_user_cellphone"), 
//  });
//         if (response) {
//             if (response.status == "fail") {
//                 console.log(response.msg);
//             } else {
//                 console.log(response.msg);
//             }
//         }



document.getElementById("end-editing").addEventListener("click", async function (e) {
    let xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/editUser", true);
    xhttp.setRequestHeader("Content-Type", "application/json; charset=UTF-8");


    xhttp.onreadystatechange = function () {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            console.log("new user is created successfully!");
        }
    }
    
    // Convert json object to text
    let input = JSON.stringify({
        email: document.getElementById("detail_user_email").textContent,
        password: document.getElementById("detail_user_password").textContent,
        firstName: document.getElementById("detail_user_firstN").textContent,
        lastName: document.getElementById("detail_user_lastN").textContent,
        age: document.getElementById("detail_user_age").textContent,
        gender: document.getElementById("detail_user_gender").textContent,
        phoneNumber: document.getElementById("detail_user_cellphone").textContent,
    });

    console.log(input); 
    xhttp.send(input);
    return;
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
