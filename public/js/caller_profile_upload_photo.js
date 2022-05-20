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

async function postForm(url, form) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'same-origin',
        cache: 'default',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: form
    });
    return response.json();
}

async function uploadImages(e) {
    e.preventDefault();

    const imageUpload = document.querySelector('#image-upload');
    const formData = new FormData();

    for (let i = 0; i < imageUpload.files.length; i++) {
        // put the images from the input into the form data
        formData.append("files", imageUpload.files[i]);
    }

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
        ("Error:", err)
    });
}

async function uploadImagesIncident(e, incident) {
    e.preventDefault();

    const imageUpload = document.querySelector('#image-upload-incident');
    const formData = new FormData();

    if (imageUpload.files.length == 0) {
        return "";
    } else {
        for (let i = 0; i < imageUpload.files.length; i++) {
            // put the images from the input into the form data
            formData.append("files", imageUpload.files[i]);
        }
    }
    formData.append("incidentID", incident.ID)

    let image = "";
    let response = await postForm("/upload-images-incident", formData)
    if (response) {
        if (response.status == "fail") {
            console.log(response.msg);
        } else {
            console.log(response.msg);
            image = response.image;
        }
    }
    return image;
}