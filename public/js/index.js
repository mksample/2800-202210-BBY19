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

    // Listener for the signin button
    document.querySelector("#signInButton").addEventListener("click", async function (e) {
        let emailInput = document.getElementById("emailInput");
        let passwordInput = document.getElementById("passwordInput");

        response = await postData("/login", {email: emailInput.value, password: passwordInput.value});
        if (response) {
            if (response.status == "fail") {
                document.getElementById("loginStatus").innerHTML = response.msg; // display login failure
            } else {
                window.location.replace("/profile");
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

//redirecting to singup page, for the first time using users
document.getElementById("signUpPage").onclick = function () {
    window.location.replace("/signup");
};

