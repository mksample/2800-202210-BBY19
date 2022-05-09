
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

    // Listener for the createUser button
    document.querySelector("#createUser").addEventListener("click", async function (e) {
        response = await postData("/createUser", {email: "testValue", password: "test", firstName: "test", lastName: "test", age: 5, gender: "test", phoneNumber: "1324123", role: "ADMIN"});
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


    


