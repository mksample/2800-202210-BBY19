"use strict";
const express = require("express");
const session = require("express-session");
const sanitizeHtml = require("sanitize-html");
const app = express();
const fs = require("fs");
const readline = require('readline');
const { JSDOM } = require('jsdom');
const { connected } = require("process");

const sqlAuthentication = { // sql connection settings
    host: "127.0.0.1",// for Mac os, type 127.0.0.1
    user: "root",
    password: "",
    multipleStatements: true,
    database: "COMP2800"
}

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

function validateCreateUser(req) {
    let validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    let validPhoneNumberRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
    let validAgeRegex = /^(0?[1-9]|[1-9][0-9])$/;
    let msg = "";

    // email
    if (!req.body.email.match(validEmailRegex)) {
        msg = "Please enter a valid email"
        console.log("creating user: invalid email");
        return [false, msg];
    }

    // password
    if (sanitizeHtml(req.body.password) != req.body.password || req.body.password == "") {
        msg = "Please enter a valid password";
        console.log("creating user: invalid password");
        return [false, msg];
    }

    // first name
    if (sanitizeHtml(req.body.firstName) != req.body.firstName || req.body.firstName == "") {
        msg = "Please enter a valid first name";
        console.log("creating user: invalid first name");
        return [false, msg];
    }

    // last name
    if (sanitizeHtml(req.body.lastName) != req.body.lastName || req.body.lastName == "") {
        msg = "Please enter a valid last name";
        console.log("creating user: invalid last name");
        return [false, msg];
    }

    // phone number
    if (!req.body.phoneNumber.match(validPhoneNumberRegex)) {
        msg = "Please enter a valid phone number (format: XXX XXX XXXX)";
        console.log("creating user: invalid phone number");
        return [false, msg];
    }

    // age
    if (!req.body.age.match(validAgeRegex)) {
        msg = "Please enter a valid age";
        console.log("creating user: invalid age");
        return [false, msg];
    }

    // gender
    if (req.body.gender != genderMale && req.body.gender != genderFemale && req.body.gender != genderOther) {
        msg = "Please select a valid gender";
        console.log("creating user: invalid gender");
        return [false, msg];
    }

    // role
    if (req.body.role != callerRole && req.body.role != responderRole) {
        msg = "Please select a valid role";
        console.log("creating user: invalid role");
        return [false, msg];
    }

    return [true, msg];
}

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
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "creating user: " + error, displayMsg: displayMsg});
            } else {
                console.log(req.body);
                res.send({ status: "success", msg: "user created"});
            }
        });
    } else {
        res.send({ status: "fail", msg: "creating user: invalid input", displayMsg: displayMsg});
    }
})

// Edit profile request (caller/responder).
// Changes values for current session users profile. POST params are safe to be left blank.
// POST params:
// password (string) - new password for user.
// firstName (string) - new first name for user.
// lastName (string) - new last name for user.
// age (int) - new age for user.
// gender (string) - new gender for user.
// phoneNumber (string) - new phone number for user.
app.post("/editUser", function (req, res) {
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
            console.log(error);
            res.send({ status: "fail", msg: "editing user: " + error });
        } else {
            res.send({ status: "success", msg: "user edited" });
        }
    });
})

// Edit profile request (admin).
// Changes values for another users profile. Admins can edit roles. POST params are safe to be left blank.
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
    if (req.session.role = adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const editUser = `UPDATE ` + userTable + ` SET
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
                console.log(error);
                res.send({ status: "fail", msg: "editing user (admin): " + error });
            } else {
                res.send({ status: "success", msg: "user edited by admin" });
            }
        });
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

    var rl = readline.createInterface({
        input: fs.createReadStream('./app/sql/bootstrap.sql'),
        terminal: false
    });
    rl.on('line', function (chunk) {
        con.query(chunk.toString('ascii'), function (err, sets, fields) {
            if (err) console.log(err);
        });
    });
    rl.on('close', function () {
        console.log("Listening on port " + port + "!");
    });
}

// RUN SERVER
let port = 8000;
app.listen(port, init);
