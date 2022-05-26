const upLoadForm = document.getElementById("upload-images-form");
upLoadForm.addEventListener("submit", uploadImages);

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

async function uploadImages(e) {
    e.preventDefault();

    const imageUpload = document.querySelector('#image-upload');
    const formData = new FormData();

    formData.append("files", imageUpload.files[0]);

    const options = {
        method: 'POST',
        mode: 'same-origin',
        cache: 'default',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: formData
    };

    // now use fetch
    fetch("/upload-images", options).then(function (res) {
        getData("/getUser").then(function (response) { // update user profile picture display
            if (response) {
                if (response.status == "fail") {
                    console.log(response.msg);
                } else {
                    let user = response.user;
                    if (user.avatar != null) { 
                        document.getElementById("userPicture").src = user.avatar;
                        document.getElementById("detail_user_picture").src = user.avatar;
                    }
                }
            }
        });
    }).catch(function (err) {
        ("Error:", err);
    });
}