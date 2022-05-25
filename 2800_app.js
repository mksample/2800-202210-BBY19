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
};
const remoteSqlAuthentication = {
    host: "us-cdbr-east-05.cleardb.net",
    user: "b65b151c88c296",
    password: "70fc390d",
    multipleStatements: "true",
    database: "heroku_b395e55ab1671ee"
};

const sqlAuthentication = localSqlAuthentication; // SETTING TO USE LOCAL OR REMOTE DB


// storing image at images
const profileUploadPath = "public/imgs/userProfile";
const profileStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, profileUploadPath);
    },
    filename: function (req, file, callback) {
        let filename = "user-" + req.session.userID + "." + file.originalname.split('.').pop();
        callback(null, filename);
    }
});
const profileUpload = multer({ storage: profileStorage });

const incidentUploadPath = "public/imgs/incidentImages";
const incidentStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, incidentUploadPath);
    },
    filename: function (req, file, callback) {
        let filename = "incident-" + Date.now() + "." + file.originalname.split('.').pop();
        callback(null, filename);
    }
});
const incidentUpload = multer({ storage: incidentStorage });

// sql tables
const userTable = "BBY_19_user";
const incidentTable = "BBY_19_incident";
const respondersTable = "BBY_19_responders";

// sql duplicate entry error code
const duplicateError = "ER_DUP_ENTRY";

// user roles
const callerRole = "CALLER";
const responderRole = "RESPONDER";
const adminRole = "ADMIN";

// user genders
const genderMale = "male";
const genderFemale = "female";
const genderOther = "other";

// incident status types
const activeStatus = "ACTIVE";
const inProgressStatus = "INPROGRESS";
const resolvedStatus = "RESOLVED";

// incident priority types
const urgentPriority = "URGENT";
const highPriority = "HIGH";
const mediumPriority = "MEDIUM";
const lowPriority = "LOW";

// incident types
const harassmentIncident = "HARASSMENT";
const suspiciousActivityIncident = "SUSACTIVITY"; // no amongus
const violentIncident = "VIOLENCE";

// static path mappings
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/imgs", express.static("public/imgs"));
app.use("/profilePictures", express.static("public/imgs/userProfile"));
app.use("/incidentImages", express.static("public/imgs/incidentImages"));
app.use("/fonts", express.static("public/fonts"));
app.use("/html", express.static("app/html"));
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

////////////////////////////////////
/////////// PAGE SERVING ///////////
////////////////////////////////////

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
    let doc = fs.readFileSync("./app/html/create_user.html", "utf8");
    res.send(doc);
});

///////////////////////////////////////
/////////// USER MANAGEMENT ///////////
///////////////////////////////////////

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
            con.end(err => { if (err) { console.log(err); } });
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
                res.status(400).send("Unable to log out");
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
                con.end(err => { if (err) { console.log(err); } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "creating user: " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + userTable + ` WHERE email = '` + req.body.email + `'`, function (error, results) {
                    con.end(err => { if (err) { console.log(err); } });
                    if (error) {
                        console.log(error);
                        res.send({ status: "fail", msg: "creating user: " + error, displayMsg: "Database error" });
                    } else {
                        res.send({ status: "success", msg: "user created", user: results[0] });
                    }
                });
            }
        });
    } else {
        res.send({ status: "fail", msg: "creating user: invalid input", displayMsg: displayMsg });
    }
});

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
                con.end(err => { if (err) { console.log(err); } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "editing user: " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + userTable + ` WHERE ID = ` + req.session.userID, function (error, results) { // used session.
                    con.end(err => { if (err) { console.log(err); } });

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
});

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
                con.end(err => { if (err) { console.log(err); } });
                if (error.code == duplicateError) {
                    displayMsg = "User with this email already exists";
                } else {
                    console.log(error);
                    displayMsg = "Database error";
                }
                res.send({ status: "fail", msg: "editing user (admin): " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + userTable + ` WHERE ID = ` + req.body.userID, function (error, results) {
                    con.end(err => { if (err) { console.log(err); } });
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
});

// Get user request.
// Returns the current session user.
app.get("/getUser", function (req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    const getUser = `SELECT * FROM ` + userTable + ` WHERE ID = ` + req.session.userID;

    con.query(getUser, function (error, results) {
        con.end(err => { if (err) { console.log(err); } });
        if (error) {
            console.log("getting user: " + error);
            res.send({ status: "fail", msg: "getting user: " + error });
        } else {
            res.send({ status: "success", msg: "user retrieved", user: results[0] });
        }
    });
});

// Get users request (session must be admin).
// Returns all users except the current session user.
app.get("/getUsers", function (req, res) {
    if (req.session.role == adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const getUser = `SELECT * FROM ` + userTable + ` WHERE ID != ` + req.session.userID;

        con.query(getUser, function (error, results) {
            con.end(err => { if (err) { console.log(err); } });
            if (error) {
                console.log("getting users: " + error);
                res.send({ status: "fail", msg: "getting users: " + error });
            } else {
                res.send({ status: "success", msg: "users retrieved", users: results });
            }
        });
    } else {
        res.send({ status: "fail", msg: "getting users: requesting user is not admin" });
    }
});

// Delete user request.
// POST params: 
// ID - the ID of the user to delete.
app.post("/deleteUser", function (req, res) {
    if (req.session.role != adminRole) {
        res.send({ status: "fail", msg: "deleting user: user is not admin", displayMsg: "User is not admin" });
        return;
    }

    let validVars = validateDeleteUser(req);
    if (!validVars[0]) {
        res.send({ status: "fail", msg: "deleting user: invalid user ID", displayMsg: validVars[1] });
        return;
    }

    let displayMsg = "Database error";
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();

    let getRoleQuery = `SELECT role FROM ` + userTable + ` WHERE ID = ` + req.body.ID;

    const adminCountQuery = `SELECT COUNT(*) as admin_count
    FROM ` + userTable + `
    WHERE role = "ADMIN"`;

    const deleteUserQuery = `DELETE FROM ` + userTable + `
    WHERE ID = ` + req.body.ID;


    con.query(getRoleQuery, function (error, results) {
        if (error) {
            con.end(err => { if (err) { console.log(err); } });
            console.log(error);
            res.send({ status: "fail", msg: "getting user role: " + error, displayMsg: displayMsg });
        } else {
            if (results.role == adminRole) {
                con.query(adminCountQuery, function (error, results) {
                    if (error) {
                        con.end(err => { if (err) { console.log(err); } });
                        console.log(error);
                        res.send({ status: "fail", msg: "querying admin count: " + error, displayMsg: displayMsg });
                    } else {
                        if (results[0]["admin_count"] > 1) {
                            con.query(deleteUserQuery, function (error, results) {
                                con.end(err => { if (err) { console.log(err); } });
                                if (error) {
                                    console.log(error);
                                    res.send({ status: "fail", msg: "deleting user: " + error, displayMsg: displayMsg });
                                } else {
                                    res.send({ status: "success", msg: "user deleted" });
                                }
                            });
                        } else {
                            con.end(err => { if (err) { console.log(err); } });
                            console.log("tried to delete last admin");
                            res.send({ status: "fail", msg: "deleting user: cannot delete last admin", displayMsg: "Cannot delete last admin" });
                        }
                    }
                });
            } else {
                con.query(deleteUserQuery, function (error, results) {
                    con.end(err => { if (err) { console.log(err); } });
                    if (error) {
                        console.log(error);
                        res.send({ status: "fail", msg: "deleting user: " + error, displayMsg: displayMsg });
                    } else {
                        res.send({ status: "success", msg: "user deleted" });
                    }
                });
            }
        }
    });
});



app.post('/upload-images', profileUpload.array("files"), function (req, res) {
    for (let i = 0; i < req.files.length; i++) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();

        let insertPicQuery = `UPDATE ` + userTable + ` SET avatar = '/profilePictures/` + req.files[i].filename + `' WHERE ID = ` + req.session.userID; // update query

        con.query(insertPicQuery, function (error, results) {
            con.end(err => { if (err) { console.log(err); } });
            if (error) {
                console.log(error);
                res.send({ status: "fail", msg: "uploading image: " + error });
            } else {
                res.send({ status: "success", msg: "image uploaded successfully", avatar: `/profilePictures/` + req.files[i].filename });
            }
        });
    }
});

app.post('/upload-images-incident', incidentUpload.array("files"), function (req, res) {
    for (let i = 0; i < req.files.length; i++) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();

        let insertPicQuery = `UPDATE ` + incidentTable + ` SET image = '/incidentImages/` + req.files[i].filename + `' WHERE ID = ` + req.body.incidentID; // update query

        con.query(insertPicQuery, function (error, results) {
            con.end(err => { if (err) { console.log(err); } });
            if (error) {
                console.log(error);
                res.send({ status: "fail", msg: "uploading image: " + error });
            } else {
                res.send({ status: "success", msg: "image uploaded successfully", image: `/incidentImages/` + req.files[i].filename });
            }
        });
    }
});

// Search the keyword from database when using search bar.
app.post("/getUsersKeyword", function (req, res) {
    if (req.session.role == adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        var keyword;
        if (req.body.keyword == '') {
            // If there's empty search keyword, it intentionally induces search results to be lost.
            keyword = `'%EmptySearchKeyword%'`;
        } else {
            keyword = `'%` + req.body.keyword + `%'`;
        }
        const getUser = `SELECT * FROM ` + userTable + ` WHERE ID != ` + req.session.userID + ` AND email LIKE ` + keyword + ` OR firstName LIKE ` + keyword + ` OR lastName LIKE ` + keyword;
        con.query(getUser, function (error, results) {
            con.end(err => {
                if (err) {
                    console.log(err);
                }
            });
            if (error) {
                console.log("getting users: " + error);
                res.send({
                    status: "fail",
                    msg: "getting users: " + error
                });
            } else {
                res.send({
                    status: "success",
                    msg: "users retrieved",
                    users: results
                });
            }
        });
    } else {
        res.send({
            status: "fail",
            msg: "getting users: requesting user is not admin"
        });
    }
});

// Search the keyword from database when using search bar.
app.post("/getUsersKeywordExact", function (req, res) {
    if (req.session.role == adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const getUser = `SELECT * FROM ` + userTable + ` WHERE ID = ` + req.body.keyword;
        con.query(getUser, function (error, results) {
            con.end(err => {
                if (err) {
                    console.log(err);
                }
            });
            if (error) {
                console.log("getting users: " + error);
                res.send({
                    status: "fail",
                    msg: "getting users: " + error
                });
            } else {
                res.send({
                    status: "success",
                    msg: "users retrieved",
                    users: results
                });
            }
        });
    } else {
        res.send({
            status: "fail",
            msg: "getting users: requesting user is not admin"
        });
    }
});


///////////////////////////////////////////
/////////// INCIDENT MANAGEMENT ///////////
///////////////////////////////////////////


// Create incident request. Returns displayMsg if incident input is invalid.
// Returns a status ("success" or "fail"), a status message (internal, not for display), and a display message.
// POST params:
// title (string) - title of the incident.
// priority (see valid priorities at top of file) - priority of the incident.
// type (see valid types at top of file) - type of the incident.
// description (string) - description of the incident.
// lat (float) - latitude of the incident.
// lon (float) - longitude of the incident.
app.post("/createIncident", function (req, res) {
    if (req.session.role != callerRole) {
        res.send({ status: "fail", msg: "creating incident: user is not caller" });
        return;
    }

    let validVals = validateCreateIncident(req);
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const addUser = `INSERT INTO ` + incidentTable + ` (title, priority, type, status, callerID, description, lat, lon, timestamp)
    VALUES ('` + req.body.title +
            `', '` + req.body.priority +
            `', '` + req.body.type +
            `', '` + activeStatus +
            `', '` + req.session.userID +
            `', '` + req.body.description +
            `', '` + req.body.lat +
            `', '` + req.body.lon +
            `', CURRENT_TIMESTAMP);`;

        con.query(addUser, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err); } });
                console.log("creating incident: " + error);
                res.send({ status: "fail", msg: "creating incident: " + error, displayMsg: "Database error" });
            } else {
                con.query(`SELECT * FROM ` + incidentTable + ` WHERE callerID = ` + req.session.userID + ` AND title = '` + req.body.title + `' ORDER BY timestamp DESC`, function (error, results) {
                    con.end(err => { if (err) { console.log(err); } });
                    if (error) {
                        console.log(error);
                        res.send({ status: "fail", msg: "getting created incident: " + error, displayMsg: "Database error" });
                    } else {
                        res.send({ status: "success", msg: "incident created", incident: results[0] });
                    }
                });
            }
        });
    } else {
        res.send({ status: "fail", msg: "creating incident: invalid input", displayMsg: displayMsg });
    }
});

// Delete incident request. User needs to be a caller to delete it.
// Returns a status ("success" or "fail"), a status message (internal, not for display).
// POST params:
// incidentID (int) - ID of the incident to delete.
app.post("/deleteIncident", function (req, res) {
    if (req.session.role != callerRole) {
        res.send({ status: "fail", msg: "deleting incident: user is not caller" });
        return;
    }

    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();

    let deleteIncidentQuery = "DELETE FROM " + incidentTable + " WHERE ID = " + req.body.incidentID + " AND callerID = " + req.session.userID;
    let deleteRespondersQuery = "DELETE FROM " + respondersTable + " WHERE incidentID = " + req.body.incidentID;

    con.query(deleteRespondersQuery, function (error, results) {
        if (error) {
            con.end(err => { if (err) { console.log(err); } });
            console.log("deleting responders: " + error);
            res.send({ status: "fail", msg: "deleting responders: " + error });
        } else {
            con.query(deleteIncidentQuery, function (error, results) {
                con.end(err => { if (err) { console.log(err); } });
                if (error) {
                    console.log("deleting incident: " + error);
                    res.send({ status: "fail", msg: "deleting incident: " + error });
                } else {
                    res.send({ status: "success", msg: "incident deleted" });
                }
            });
        }
    });
});

// Gets incidents based on the current session user
// Returns an array of incidents.
// Incident:
// ID (int) - ID of the incident.
// title (string) - title of the incident.
// priority (string) - priority of the incident.
// type (string) - type of the incident.
// status (string) - the status of the incident.
// callerID (int) - the ID of the user who reported the incident.
// description (string) - the description of the incident.
// lat (float) - the latitude of where the incident occurred.
// lon (float) - the longitude of where the incident occurred.
// timestamp (yyyy-mm-dd hh:mm:ss) - timestamp of when the incident was created.
// resolutionComment (string) - comment left on resolution of incident.
// responderIDs (int array) - IDs of the users who responded to the incident.
app.get("/getIncidents", function (req, res) {
    // select which query to use
    let query = "";
    if (req.session.role == adminRole) {
        query = "SELECT * FROM " + incidentTable + " ORDER BY timestamp DESC";   // admins get all incidents
    } else if (req.session.role == callerRole) {
        query = "SELECT * FROM " + incidentTable + " WHERE callerID = " + req.session.userID + " ORDER BY timestamp DESC";   // callers get all incidents they created
    } else if (req.session.role == responderRole) { // responders get all incidents they responded to 
        query = `SELECT ` + incidentTable + `.ID, title, priority, type, status, callerID, description, image, lat, lon, timestamp, resolutionComment
        FROM ` + incidentTable + `
        JOIN ` + respondersTable + `
        ON ` + incidentTable + `.ID = ` + respondersTable + `.IncidentID 
        WHERE responderID = ` + req.session.userID + " ORDER BY timestamp DESC";
    }

    // query for getting responder IDs
    let responderIDQuery = `SELECT responderID
    FROM ` + incidentTable + `
    JOIN ` + respondersTable + `
    ON ` + incidentTable + `.ID = ` + respondersTable + `.IncidentID
    WHERE ` + incidentTable + `.ID = `; // append incident ID here

    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    con.query(query, function (error, incidentResults) {
        if (error) {
            con.end(err => { if (err) { console.log(err); } });
            console.log("getting incidents: " + error);
            res.send({ status: "fail", msg: "getting incidents: " + error });
        } else {
            if (incidentResults.length < 1) {
                con.end(err => { if (err) { console.log(err); } });
                res.send({ status: "success", msg: "incidents retrieved", incidents: incidentResults }); // return incidents
            } else {
                for (let i = 0; i < incidentResults.length; i++) { // for each incident get all responder IDs associated with that incident
                    con.query(responderIDQuery + incidentResults[i].ID, function (error, responderResults) { // append incident ID onto end of responderIDQuery
                        if (error) {
                            con.end(err => { if (err) { console.log(err); } });
                            console.log("getting responderIDs: " + error);
                            res.send({ status: "fail", msg: "getting responder IDs: " + error });
                            return;
                        } else {
                            let responderIDs = [];
                            for (const result of responderResults) {
                                responderIDs.push(result.responderID);
                            }
                            incidentResults[i].responderIDs = responderIDs; // append responder IDs to incident
                        }
                        if (i + 1 == incidentResults.length) { // if done processing the final incident send response
                            con.end(err => { if (err) { console.log(err); } });
                            res.send({ status: "success", msg: "incidents retrieved", incidents: incidentResults }); // return incidents
                        }
                    });
                }
            }
        }
    });
});

// Gets active or in progress incidents, only accessible by responders.
// Returns an array of incidents.
// Incident:
// ID (int) - ID of the incident.
// title (string) - title of the incident.
// priority (string) - priority of the incident.
// type (string) - type of the incident.
// status (string) - the status of the incident.
// callerID (int) - the ID of the user who reported the incident.
// description (string) - the description of the incident.
// lat (float) - the latitude of where the incident occurred.
// lon (float) - the longitude of where the incident occurred.
// timestamp (yyyy-mm-dd hh:mm:ss) - timestamp of when the incident was created.
// responderIDs (int array) - IDs of the users who responded to the incident.
app.get("/getResponderIncidents", function (req, res) {
    if (req.session.role == responderRole) {
        let query = "SELECT * FROM " + incidentTable + ` WHERE status = '` + activeStatus + `' OR status = '` + inProgressStatus + `' ORDER BY timestamp DESC`; // get all active or in progess incidents

        // query for getting responder IDs
        let responderIDQuery = `SELECT responderID
    FROM ` + incidentTable + `
    JOIN ` + respondersTable + `
    ON ` + incidentTable + `.ID = ` + respondersTable + `.IncidentID
    WHERE ` + incidentTable + `.ID = `; // append incident ID here

        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        con.query(query, function (error, incidentResults) {
            if (error) {
                con.end(err => { if (err) { console.log(err); } });
                console.log("getting responder incidents: " + error);
                res.send({ status: "fail", msg: "getting responder incidents: " + error });
            } else {
                for (let i = 0; i < incidentResults.length; i++) { // for each incident get all responder IDs associated with that incident
                    con.query(responderIDQuery + incidentResults[i].ID, function (error, responderResults) { // append incident ID onto end of responderIDQuery
                        if (error) {
                            con.end(err => { if (err) { console.log(err); } });
                            console.log("getting responderIDs: " + error);
                            res.send({ status: "fail", msg: "getting responder IDs: " + error });
                            return;
                        } else {
                            let responderIDs = [];
                            for (const result of responderResults) {
                                responderIDs.push(result.responderID);
                            }
                            incidentResults[i].responderIDs = responderIDs; // append responder IDs to incident
                        }
                        if (i + 1 == incidentResults.length) { // if done processing the final incident send response
                            con.end(err => { if (err) { console.log(err); } });
                            res.send({ status: "success", msg: "incidents retrieved", incidents: incidentResults }); // return incidents
                        }
                    });
                }
            }
        });
    } else {
        res.send({ status: "fail", msg: "getting responder incidents: user is not a responder" });
    }
});

// Edit an incident the session user created.  is not editable. POST params are safe to be left blank.
// POST params:
// incidentID (int) - ID of the incident to edit.
// title (string) - new title of the incident.
// priority (see valid priorities at top of file) - new priority of the incident.
// type (see valid types at top of file) - new type of the incident.
// description (string) - new description of the incident.
// lat (float) - new latitude of the incident location.
// lon (float) - new longitude of the incident location.
app.post("/editIncident", function (req, res) {
    if (req.session.role != callerRole) {
        res.send({ status: "fail", msg: "editing incident: user is not caller", displayMsg: "user is not caller" });
        return;
    }
    let validVals = validateEditIncident(req);
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();

        let editIncident = `UPDATE ` + incidentTable + ` SET
    title = IfNull(` + (req.body.title ? "'" + req.body.title + "'" : "NULL") + `, title),
    priority = IfNull(` + (req.body.priority ? "'" + req.body.priority + "'" : "NULL") + `, priority),
    type = IfNull(` + (req.body.type ? "'" + req.body.type + "'" : "NULL") + `, type),
    description = IfNull(` + (req.body.description ? "'" + req.body.description + "'": "NULL") + `, description),
    lat = IfNull(` + (req.body.lat ? "'" + req.body.lat + "'" : "NULL") + `, lat),
    lon = IfNull(` + (req.body.lon ? "'" + req.body.lon + "'" : "NULL") + `, lon)
    WHERE ID = ` + req.body.incidentID;

        con.query(editIncident, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err); } });
                console.log(error);
                displayMsg = "Database error";
                res.send({ status: "fail", msg: "editing incident: " + error, displayMsg: displayMsg });
            } else {
                con.query(`SELECT * FROM ` + incidentTable + ` WHERE ID = ` + req.body.incidentID, function (error, results) {
                    con.end(err => { if (err) { console.log(err); } });
                    if (error || !results) {
                        res.send({ status: "fail", msg: "editing incident: failed to fetch updated incident", displayMsg: "Database error" });
                    } else {
                        res.send({ status: "success", msg: "edited incident retrieved", incident: results[0] });
                    }
                });
            }
        });
    } else {
        res.send({ status: "fail", msg: "editing incident: invalid input", displayMsg: displayMsg });
    }
});

// Join incident request. User needs to be a responder to join it.
// Returns a status ("success" or "fail"), a status message (internal, not for display).
// POST params:
// incidentID (int) - ID of the incident to join.
app.post("/joinIncident", function (req, res) {
    if (req.session.role != responderRole) {
        res.send({ status: "fail", msg: "joining incident: user is not responder" });
        return;
    }

    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();

    let query = "INSERT INTO " + respondersTable + " (responderID, incidentID) VALUES (" + req.session.userID + ", " + req.body.incidentID + ");";
    con.query(query, function (error, results) {
        if (error) {
            con.end(err => { if (err) { console.log(err); } });
            console.log("joining incident: " + error);
            res.send({ status: "fail", msg: "joining incident: " + error });
        } else {
            query = "UPDATE " + incidentTable + " SET status = '" + inProgressStatus + "' WHERE ID = " + req.body.incidentID;
            con.query(query, function (error, results) {
                if (error) {
                    con.end(err => { if (err) { console.log(err); } });
                    console.log("updating incidents table: " + error);
                    res.send({ status: "fail", msg: "updating incidents table: " + error });
                } else {
                    query = "SELECT * FROM " + incidentTable + " WHERE ID = " + req.body.incidentID;
                    con.query(query, function (error, results) {
                        con.end(err => { if (err) { console.log(err); } });
                        if (error) {
                            console.log("getting joined incident: " + error);
                            res.send({ status: "fail", msg: "getting joined incident: " + error });
                        } else {
                            res.send({ status: "success", msg: "incident joined", incident: results[0] });
                        }
                    });
                }
            });
        }
    });
});

// Resolve incident request. User needs to have responded to the incident for them to resolve it.
// Returns a status ("success" or "fail"), a status message (internal, not for display).
// POST params:
// incidentID (int) - ID of the incident to resolve.
// resolutionComment (string) - resolution comment for the incident.
app.post("/resolveIncident", function (req, res) {
    if (req.session.role != responderRole) {
        res.send({ status: "fail", msg: "resolving incident: user is not responder" });
        return;
    }

    let validVals = validateResolveIncident(req);
    let valid = validVals[0];
    let displayMsg = validVals[1];
    if (valid) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();

        let responderQuery = `SELECT responderID
        FROM ` + incidentTable + `
        JOIN ` + respondersTable + `
        ON ` + incidentTable + `.ID = ` + respondersTable + `.IncidentID
        WHERE ` + incidentTable + `.ID = ` + req.body.incidentID;

        let resolveQuery = `UPDATE ` + incidentTable + ` 
        SET resolutionComment = '` + req.body.resolutionComment + `', status = '` + resolvedStatus + `' 
        WHERE ID = ` + req.body.incidentID;

        con.query(responderQuery, function (error, results) {
            if (error) {
                con.end(err => { if (err) { console.log(err); } });
                console.log("getting responder IDs: " + error);
                res.send({ status: "fail", msg: "getting responder IDs: " + error });
            } else {
                let valid = false;
                for (const result of results) {
                    if (result.responderID == req.session.userID) {
                        valid = true;
                    }
                }
                if (!valid) {
                    con.end(err => { if (err) { console.log(err); } });
                    console.log("resolving incident: user did not respond to this incident");
                    res.send({ status: "fail", msg: "resolving incident: user did not respond to this incident" });
                } else {
                    con.query(resolveQuery, function (error, results) {
                        if (error) {
                            con.end(err => { if (err) { console.log(err); } });
                            console.log("resolving incident: " + error);
                            res.send({ status: "fail", msg: "resolving incident: " + error });
                        } else {
                            let query = "SELECT * FROM " + incidentTable + " WHERE ID = " + req.body.incidentID;
                            con.query(query, function (error, results) {
                                con.end(err => { if (err) { console.log(err); } });
                                if (error) {
                                    console.log("getting resolved incident: " + error);
                                    res.send({ status: "fail", msg: "getting resolved incident: " + error });
                                } else {
                                    res.send({ status: "success", msg: "incident resolved", incident: results[0] });
                                }
                            });
                        }
                    });
                }
            }
        });
    } else {
        res.send({ status: "fail", msg: "creating incident: invalid input", displayMsg: displayMsg });
    }
});



////////////////////////////////////////
/////////// INPUT VALIDATION ///////////
////////////////////////////////////////

// USER
const validEmailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
const validPhoneNumberRegex = /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/;
const validAgeRegex = /^(0?[1-9]|[1-9][0-9])$/;

function validID(condition) {
    if (!condition) {
        let msg = "Please enter a valid ID";
        console.log("deleting user: invalid user ID");
        return [false, msg];
    }
    return [true, null];
}

function validEmail(condition) {
    if (!condition) {
        let msg = "Please enter a valid email";
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
    let email = validEmail(req.body.email.match(validEmailRegex));
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
    let email = validEmail(req.body.email.match(validEmailRegex));
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
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole || req.body.role == null);
    if (!role[0]) {
        return role;
    }
    return [true, null];
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
    let role = validRole(req.body.role == callerRole || req.body.role == responderRole || req.body.role == adminRole || req.body.role == ""); // accept admin roles as well
    if (!role[0]) {
        return role;
    }
    return [true, null];
}

function validateDeleteUser(req) {
    let ID = validID(sanitizeHtml(req.body.ID) == req.body.ID && req.body.ID != "");
    if (!ID[0]) {
        return ID;
    }
    return [true, null];
}

// INCIDENT
function validTitle(condition) {
    if (!condition) {
        let msg = "Please enter a valid title";
        console.log("creating incident: invalid title");
        return [false, msg];
    }
    return [true, null];
}

function validType(condition) {
    if (!condition) {
        let msg = "Please select a valid type";
        console.log("creating incident: invalid type");
        return [false, msg];
    }
    return [true, null];
}

function validPriority(condition) {
    if (!condition) {
        let msg = "Please select a valid priority";
        console.log("creating incident: invalid priority");
        return [false, msg];
    }
    return [true, null];
}

function validDescription(condition) {
    if (!condition) {
        let msg = "Please enter a valid description";
        console.log("creating incident: invalid description");
        return [false, msg];
    }
    return [true, null];
}

function validLatitude(condition) {
    if (!condition) {
        let msg = "Please select a valid latitude";
        console.log("creating incident: invalid latitude");
        return [false, msg];
    }
    return [true, null];
}

function validLongitude(condition) {
    if (!condition) {
        let msg = "Please select a valid longitude";
        console.log("creating incident: invalid longitude");
        return [false, msg];
    }
    return [true, null];
}

function validResolutionComment(condition) {
    if (!condition) {
        let msg = "Please enter a valid resolution comment";
        console.log("resolving incident: invalid resolution comment");
        return [false, msg];
    }
    return [true, null];
}

function validateCreateIncident(req) {
    let title = validTitle(sanitizeHtml(req.body.title) == req.body.title && req.body.title != "");
    if (!title[0]) {
        return title;
    }
    let priority = validPriority(req.body.priority == urgentPriority || req.body.priority == highPriority || req.body.priority == mediumPriority || req.body.priority == lowPriority);
    if (!priority[0]) {
        return priority;
    }
    let type = validType(req.body.type == harassmentIncident || req.body.type == suspiciousActivityIncident || req.body.type == violentIncident);
    if (!type[0]) {
        return type;
    }
    let description = validDescription(sanitizeHtml(req.body.description) == req.body.description && req.body.description != "");
    if (!description[0]) {
        return description;
    }
    let latitude = validLatitude(req.body.lat < 90 && req.body.lat > -90 && req.body.lat != null && req.body.lat != "");
    if (!latitude[0]) {
        return latitude;
    }
    let longitude = validLongitude(req.body.lon < 180 && req.body.lon > -180 && req.body.lon != null && req.body.lat != "");
    if (!longitude[0]) {
        return longitude;
    }
    return [true, null];
}

function validateEditIncident(req) {
    let title = validTitle(sanitizeHtml(req.body.title) == req.body.title || req.body.title == "");
    if (!title[0]) {
        return title;
    }
    let priority = validPriority(req.body.priority == urgentPriority || req.body.priority == highPriority || req.body.priority == mediumPriority || req.body.priority == lowPriority || req.body.priority == "");
    if (!priority[0]) {
        return priority;
    }
    let type = validType(req.body.type == harassmentIncident || req.body.type == suspiciousActivityIncident || req.body.type == violentIncident || req.body.type == "");
    if (!type[0]) {
        return type;
    }
    let description = validDescription(sanitizeHtml(req.body.description) == req.body.description || req.body.description == "");
    if (!description[0]) {
        return description;
    }
    let latitude = validLatitude(req.body.lat < 90 && req.body.lat > -90 || req.body.lat == null || req.body.lat == "");
    if (!latitude[0]) {
        return latitude;
    }
    let longitude = validLongitude(req.body.lon < 180 && req.body.lon > -180 || req.body.lon == null || req.body.lon == "");
    if (!longitude[0]) {
        return longitude;
    }
    return [true, null];
}

function validateResolveIncident(req) {
    let resolutionComment = validResolutionComment(sanitizeHtml(req.body.resolutionComment) == req.body.resolutionComment && req.body.resolutionComment != "");
    if (!resolutionComment[0]) {
        return resolutionComment;
    }
    return [true, null];
}

////////////////////////////
/////////// INIT ///////////
////////////////////////////

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
    con.end(err => { if (err) { console.log(err); } });
    console.log("Listening on port " + port + "!");
}



// RUN SERVER
let port = process.env.PORT || 8000;
app.listen(port, init);
