"use strict";
const express = require("express");
const session = require("express-session");
const sanitizeHtml = require("sanitize-html");
const app = express();
const fs = require("fs");
const multer = require("multer"); // storing images
const readline = require('readline');
const { JSDOM } = require('jsdom');
const { connected } = require("process");

const localSqlAuthentication = { // sql connection settings
    host: "127.0.0.1",// for Mac os, type 127.0.0.1
    user: "root",
    password: "",
    multipleStatements: true,
    database: "COMP2800"
}
const remoteSqlAuthentication = {
    host: "us-cdbr-east-05.cleardb.net",
    user: "b65b151c88c296",
    password: "70fc390d",
    multipleStatements: "true",
    database: "heroku_b395e55ab1671ee"
}

const sqlAuthentication = localSqlAuthentication; // SETTING TO USE LOCAL OR REMOTE DB


// storing image at images
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "public/imgs/userProfile")
    },
    filename: function(req, file, callback) {
        callback(null, "SaveMe-app-profile-" + file.originalname.split('/').pop().trim());
    }
});
const upload = multer({ storage: storage });

const userTable = "BBY_19_user";
const duplicateError = "ER_DUP_ENTRY";

const callerRole = "CALLER";
const responderRole = "RESPONDER";
const adminRole = "ADMIN";

const genderMale = "male";
const genderFemale = "female";
const genderOther = "other";

// static path mappings
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/imgs", express.static("public/imgs"));
app.use("/fonts", express.static("public/fonts"));
app.use("/html", express.static("public/html"));
app.use("/media", express.static("public/media"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session(
    { // session settings
        secret: "someSecret",
        name: "someSessionID",
        resave: false,
        saveUninitialized: true
    })
);

//////// PAGE SERVING ////////

// Index page
app.get("/", function (req, res) { 
    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else {
        let doc = fs.readFileSync("./app/html/index.html", "utf8");
        res.send(doc);
    }
});

// Profile page
app.get("/profile", async function (req, res) {
    if (req.session.loggedIn) {
        let doc = "";
        if (req.session.role == callerRole) {
            doc = fs.readFileSync("./app/html/caller_profile.html", "utf8");
        } else if (req.session.role == responderRole) {
            doc = fs.readFileSync("./app/html/responder_profile.html", "utf8");
        } else if (req.session.role == adminRole) {
            doc = fs.readFileSync("./app/html/admin_profile.html", "utf8");
        } else {
            res.redirect("/");
            return;
        }
        res.send(doc);
    } else {
        res.redirect("/");
    }
});

// Signup page
app.get("/signup", function (req, res) {
    let doc = fs.readFileSync("./app/html/create_user.html", "utf8")
    res.send(doc)
});


//////// USER MANAGEMENT ////////

// User login request.
// POST params: 
// email (string) - email of the account.
// password (string) - password of the account.
app.post("/login", function (req, res) {
    authenticate(req.body.email, req.body.password,
        function (userRecord) {
            if (userRecord == null) {
                res.send({ status: "fail", msg: "Incorrect email or password" });
                return;
            } else if (userRecord.role == callerRole) { // sorting types of users 
                req.session.role = callerRole;
            } else if (userRecord.role == responderRole) {
                req.session.role = responderRole;
            } else if (userRecord.role == adminRole) {
                req.session.role = adminRole;
            }
            req.session.loggedIn = true;
            req.session.userID = userRecord.ID;
            req.session.save(function (err) {
                if (err) {
                    console.log(err);
                }
            });
            res.send({ status: "success", msg: "Logged in" });
        }
    );
});

// Helper function for user login request.
function authenticate(email, pwd, callback) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    con.query(
        "SELECT * FROM " + userTable + " WHERE email = ? AND password = ?", [email, pwd],
        function (error, results) {
            con.end(err => { if (err) { console.log(err) } });
            if (error) {
                console.log(error);
            }
            if (results && results.length > 0) {
                return callback(results[0]);
            } else {
                return callback(null);
            }
        }
    );
}

// User logout request.
// Destroys the users session and returns them to the index page. Returns nothing.
app.get("/logout", function (req, res) {
    if (req.session) {
        req.session.destroy(function (error) {
            if (error) {
                res.status(400).send("Unable to log out")
            } else {
                res.redirect("/");
            }
        });
    }
});

// Create user request. Returns displayMsg if user input is invalid.
// Returns a status ("success" or "fail"), a status message (internal, not for display), and a display message.
// POST params:
// email (string) - email of the new user.
// password (string) - password of the new user.
// firstName (string) - first name of the new user.
// lastName (string) - last name of the new user.
// age (int) - age of the new user.
// gender (string) - gender of the new user.
// phoneNumber (string) - phone number of the new user.
// role (string) - role of the new user (must be "ADMIN", "CALLER", or "RESPONDER"). 
app.post("/createUser", function (req, res) {
    let validVals = validateCreateUser(req);
    if (req.session.role == adminRole) {
        validVals = validateAdminCreateUser(req);
    }
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const addUser = `INSERT INTO ` + userTable + ` (email, password, firstName, lastName, age, gender, phoneNumber, role)
    VALUES ('` + req.body.email +
            `', '` + req.body.password +
            `', '` + req.body.firstName +
            `', '` + req.body.lastName +
            `', '` + req.body.age +
            `', '` + req.body.gender +
            `', '` + req.body.phoneNumber +
            `', '` + req.body.role +
            `');`;

        con.query(addUser, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err) } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "creating user: " + error, displayMsg: displayMsg });
            } else {
                console.log(req.body);
                con.query(`SELECT * FROM ` + userTable + ` WHERE email = '` + req.body.email + `'`, function (error, results) {
                    con.end(err => { if (err) { console.log(err) } });
                    if (error) {
                        console.log(error)
                        res.send({ status: "fail", msg: "creating user: " + error, displayMsg: "Database error"});
                    } else {
                        res.send({ status: "success", msg: "user created", user: results[0]});
                    }
                })
            }
        });
    } else {
        res.send({ status: "fail", msg: "creating user: invalid input", displayMsg: displayMsg });
    }
})

// Edit the profile of the current session user. Role is not editable. POST params are safe to be left blank.
// POST params:
// password (string) - new password for user.
// firstName (string) - new first name for user.
// lastName (string) - new last name for user.
// age (int) - new age for user.
// gender (string) - new gender for user.
// phoneNumber (string) - new phone number for user.
app.post("/editUser", function (req, res) {
    let validVals = validateEditUser(req);
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const editUser = `UPDATE ` + userTable + ` SET
    password = IfNull(` + (req.body.password ? "'" + req.body.password + "'" : "NULL") + `, password),
    firstName = IfNull(` + (req.body.firstName ? "'" + req.body.firstName + "'" : "NULL") + `, firstName),
    lastName = IfNull(` + (req.body.lastName ? "'" + req.body.lastName + "'" : "NULL") + `, lastName),
    age = IfNull(` + (req.body.age ? req.body.age : "NULL") + `, age),
    gender = IfNull(` + (req.body.gender ? "'" + req.body.gender + "'" : "NULL") + `, gender),
    phoneNumber = IfNull(` + (req.body.phoneNumber ? "'" + req.body.phoneNumber + "'" : "NULL") + `, phoneNumber)
    WHERE ID = ` + req.session.userID;

        con.query(editUser, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err) } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "editing user: " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + userTable + ` WHERE ID = ` + req.body.userID, function (error, results) {
                    con.end(err => { if (err) { console.log(err) } });
                    if (error || !results) {
                        res.send({ status: "fail", msg: "editing user: failed to fetch updated user", displayMsg: "Database error" });
                    } else {
                        res.send({ status: "success", msg: "edited user retrieved", user: results[0] });
                    }
                });
            }
        });
    } else {
        res.send({ status: "fail", msg: "editing user: invalid input", displayMsg: displayMsg });
    }
})

// Edit the profile of any user. Role is editable. POST params are safe to be left blank.
// POST params:
// password (string) - new password for user.
// firstName (string) - new first name for user.
// lastName (string) - new last name for user.
// age (int) - new age for user.
// gender (string) - new gender for user.
// phoneNumber (string) - new phone number for user.
// role (string) - new role for user (must be "ADMIN", "CALLER", or "RESPONDER").
// userID (int) - ID of the user being edited
app.post("/adminEditUser", function (req, res) {
    if (req.session.role != adminRole) {
        res.send({ status: "fail", msg: "editing user (admin): user is not admin" });
    }
    let validVals = validateAdminEditUser(req);
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const editUser = `UPDATE ` + userTable + ` SET
        email = IfNull(` + (req.body.email ? "'" + req.body.email + "'" : "NULL") + `, email),
        password = IfNull(` + (req.body.password ? "'" + req.body.password + "'" : "NULL") + `, password),
        firstName = IfNull(` + (req.body.firstName ? "'" + req.body.firstName + "'" : "NULL") + `, firstName),
        lastName = IfNull(` + (req.body.lastName ? "'" + req.body.lastName + "'" : "NULL") + `, lastName),
        age = IfNull(` + (req.body.age ? req.body.age : "NULL") + `, age),
        gender = IfNull(` + (req.body.gender ? "'" + req.body.gender + "'" : "NULL") + `, gender),
        phoneNumber = IfNull(` + (req.body.phoneNumber ? "'" + req.body.phoneNumber + "'" : "NULL") + `, phoneNumber),
        role = IfNull(` + (req.body.role ? "'" + req.body.role + "'" : "NULL") + `, role)
        WHERE ID = ` + req.body.userID;

        con.query(editUser, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err) } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "editing user (admin): " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + userTable + ` WHERE ID = ` + req.body.userID, function (error, results) {
                    con.end(err => { if (err) { console.log(err) } });
                    if (error || !results) {
                        res.send({ status: "fail", msg: "editing user (admin): failed to fetch updated user", displayMsg: "Database error" });
                    } else {
                        res.send({ status: "success", msg: "edited user retrieved", user: results[0] });
                    }
                });
            }
        });
    } else {
        res.send({ status: "fail", msg: "editing user (admin): invalid input", displayMsg: displayMsg });
    }
})

// Get user request.
// Returns the current session user.
app.get("/getUser", function (req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    const getUser = `SELECT * FROM ` + userTable + ` WHERE ID = ` + req.session.userID;

    con.query(getUser, function (error, results) {
        con.end(err => { if (err) { console.log(err) } });
        if (error) {
            console.log("getting user: " + error);
            res.send({ status: "fail", msg: "getting user: " + error })
        } else {
            res.send({ status: "success", msg: "user retrieved", user: results[0] })
        }
    })
})

// Get users request (session must be admin).
// Returns all users except the current session user.
app.get("/getUsers", function (req, res) {
    if (req.session.role == adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const getUser = `SELECT * FROM ` + userTable + ` WHERE ID != ` + req.session.userID;

        con.query(getUser, function (error, results) {
            con.end(err => { if (err) { console.log(err) } });
            if (error) {
                console.log("getting users: " + error);
                res.send({ status: "fail", msg: "getting users: " + error })
            } else {
                res.send({ status: "success", msg: "users retrieved", users: results })
            }
        })
    } else {
        res.send({ status: "fail", msg: "getting users: requesting user is not admin" })
    }
})

// Delete user request.
// POST params: 
// ID - the ID of the user to delete.
app.post("/deleteUser", function (req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();

    const adminCountQuery = `SELECT COUNT(*) as admin_count
    FROM ` + userTable + `
    WHERE role = "ADMIN"`;

    const deleteUserQuery = `DELETE FROM USER
    WHERE ID = ` + req.body.ID;

    con.query(adminCountQuery, function (error, results) {
        if (error) {
            console.log(error);
            res.send({ status: "fail", msg: "querying admin count: " + error });
        } else {
            if (results[0]["admin_count"] > 1) {
                con.query(deleteUserQuery, function (error, results) {
                    con.end(err => { if (err) { console.log(err) } });
                    if (error) {
                        console.log(error);
                        res.send({ status: "fail", msg: "deleting user: " + error });
                    } else {
                        res.send({ status: "success", msg: "user deleted" });
                    }
                })
            } else {
                console.log("tried to delete last admin");
                res.send({ status: "fail", msg: "deleting user: cannot delete last admin" });
            }
        }
    })
})

app.post('/upload-images', upload.array("files"), function (req, res) {

    //console.log(req.body);
    console.log(req.files);

    for(let i = 0; i < req.files.length; i++) {
        req.files[i].filename = req.files[i].originalname;
    }

});

// VALIDATE FUNCTIONS

const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const validPhoneNumberRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
const validAgeRegex = /^(0?[1-9]|[1-9][0-9])$/;

function validEmail(condition) {
    if (!condition) {
        let msg = "Please enter a valid email"
        console.log("creating user: invalid email");
        return [false, msg];
    }
    return [true, null];
}

function validPassword(condition) {
    if (!condition) {
        let msg = "Please enter a valid password";
        console.log("creating user: invalid password");
        return [false, msg];
    }
    return [true, null];
}

function validFirstName(condition) {
    if (!condition) {
        let msg = "Please enter a valid first name";
        console.log("creating user: invalid first name");
        return [false, msg];
    }
    return [true, null];
}

function validLastName(condition) {
    if (!condition) {
        let msg = "Please enter a valid last name";
        console.log("creating user: invalid last name");
        return [false, msg];
    }
    return [true, null];
}

function validPhoneNumber(condition) {
    if (!condition) {
        let msg = "Please enter a valid phone number (format: XXX XXX XXXX)";
        console.log("creating user: invalid phone number");
        return [false, msg];
    }
    return [true, null];
}

function validAge(condition) {
    if (!condition) {
        let msg = "Please enter a valid age";
        console.log("creating user: invalid age");
        return [false, msg];
    }
    return [true, null];
}

function validGender(condition) {
    if (!condition) {
        let msg = "Please select a valid gender";
        console.log("creating user: invalid gender");
        return [false, msg];
    }
    return [true, null];
}

function validRole(condition) {
    if (!condition) {
        let msg = "Please select a valid role";
        console.log("creating user: invalid role");
        return [false, msg];
    }
    return [true, null];
}

// validation for creating a user
function validateCreateUser(req) {
    let email = validEmail(req.body.email.match(validEmailRegex))
    if (!email[0]) {
        return email;
    }
    let password = validPassword(sanitizeHtml(req.body.password) == req.body.password && req.body.password != "");
    if (!password[0]) {
        return password;
    }
    let firstName = validFirstName(sanitizeHtml(req.body.firstName) == req.body.firstName && req.body.firstName != "");
    if (!firstName[0]) {
        return firstName;
    }
    let lastName = validLastName(sanitizeHtml(req.body.lastName) == req.body.lastName && req.body.lastName != "");
    if (!lastName[0]) {
        return lastName;
    }
    let phoneNumber = validPhoneNumber(req.body.phoneNumber.match(validPhoneNumberRegex));
    if (!phoneNumber[0]) {
        return phoneNumber;
    }
    let age = validAge(req.body.age.match(validAgeRegex));
    if (!age[0]) {
        return age;
    }
    let gender = validGender(req.body.gender == genderMale || req.body.gender == genderFemale || req.body.gender == genderOther);
    if (!gender[0]) {
        return gender;
    }
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole);
    if (!role[0]) {
        return role;
    }
    return [true, null];
}

// validation for creating a user (admin)
function validateAdminCreateUser(req) {
    let email = validEmail(req.body.email.match(validEmailRegex))
    if (!email[0]) {
        return email;
    }
    let password = validPassword(sanitizeHtml(req.body.password) == req.body.password && req.body.password != "");
    if (!password[0]) {
        return password;
    }
    let firstName = validFirstName(sanitizeHtml(req.body.firstName) == req.body.firstName && req.body.firstName != "");
    if (!firstName[0]) {
        return firstName;
    }
    let lastName = validLastName(sanitizeHtml(req.body.lastName) == req.body.lastName && req.body.lastName != "");
    if (!lastName[0]) {
        return lastName;
    }
    let phoneNumber = validPhoneNumber(req.body.phoneNumber.match(validPhoneNumberRegex));
    if (!phoneNumber[0]) {
        return phoneNumber;
    }
    let age = validAge(req.body.age.match(validAgeRegex));
    if (!age[0]) {
        return age;
    }
    let gender = validGender(req.body.gender == genderMale || req.body.gender == genderFemale || req.body.gender == genderOther);
    if (!gender[0]) {
        return gender;
    }
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole || req.body.role == adminRole); // accept admin role
    if (!role[0]) {
        return role;
    }
    return [true, null];
}

// validation for editing a user
function validateEditUser(req) {
    let email = validEmail(req.body.email.match(validEmailRegex) || req.body.email == "");
    if (!email[0]) {
        return email;
    }
    let password = validPassword(sanitizeHtml(req.body.password) == req.body.password);
    if (!password[0]) {
        return password;
    }
    let firstName = validFirstName(sanitizeHtml(req.body.firstName) == req.body.firstName);
    if (!firstName[0]) {
        return firstName;
    }
    let lastName = validLastName(req.body.lastName == req.body.lastName);
    if (!lastName[0]) {
        return lastName;
    }
    let phoneNumber = validPhoneNumber(req.body.phoneNumber.match(validPhoneNumberRegex) || req.body.phoneNumber == "");
    if (!phoneNumber[0]) {
        return phoneNumber;
    }
    let age = validAge(req.body.age.match(validAgeRegex) || req.body.age == "");
    if (!age[0]) {
        return age;
    }
    let gender = validGender(req.body.gender == genderMale || req.body.gender == genderFemale || req.body.gender == genderOther || req.body.gender == "");
    if (!gender[0]) {
        return gender;
    }
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole || req.body.role == "");
    if (!role[0]) {
        return role;
    }
    return [true, msg];
}

// validation for editing a user (admin)
function validateAdminEditUser(req) {
    let email = validEmail(req.body.email.match(validEmailRegex) || req.body.email == "");
    if (!email[0]) {
        return email;
    }
    let password = validPassword(sanitizeHtml(req.body.password) == req.body.password);
    if (!password[0]) {
        return password;
    }
    let firstName = validFirstName(sanitizeHtml(req.body.firstName) == req.body.firstName);
    if (!firstName[0]) {
        return firstName;
    }
    let lastName = validLastName(req.body.lastName == req.body.lastName);
    if (!lastName[0]) {
        return lastName;
    }
    let phoneNumber = validPhoneNumber(req.body.phoneNumber.match(validPhoneNumberRegex) || req.body.phoneNumber == "");
    if (!phoneNumber[0]) {
        return phoneNumber;
    }
    let age = validAge(req.body.age.match(validAgeRegex) || req.body.age == "");
    if (!age[0]) {
        return age;
    }
    let gender = validGender(req.body.gender == genderMale || req.body.gender == genderFemale || req.body.gender == genderOther || req.body.gender == "");
    if (!gender[0]) {
        return gender;
    }
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole || req.body.role == adminRole ||req.body.role == ""); // accept admin roles as well
    if (!role[0]) {
        return role;
    }
    return [true, null];
}

// Connects to the mysql database, creates a user table if it doesn't exist.
function init() {
    const mysql = require("mysql2");
    const con = mysql.createConnection({
        host: sqlAuthentication.host,
        user: sqlAuthentication.user,
        password: sqlAuthentication.password,
        multipleStatements: sqlAuthentication.multipleStatements,
    });
    con.connect();
    con.end(err => { if (err) { console.log(err) } });
    console.log("Listening on port " + port + "!");
}



// RUN SERVER
let port = process.env.PORT || 8000
app.listen(port, init);
