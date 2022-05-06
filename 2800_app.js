const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const readline = require('readline');
const { JSDOM } = require('jsdom');
const { connected } = require("process");

const sqlAuthentication = { // sql connection settings
    host: "localhost",// for Mac os, type 127.0.0.1
    user: "root",
    password: "",
    multipleStatements: true,
    database: "BBY19"
}

const callerRole = "CALLER";
const responderRole = "RESPONDER";
const adminRole = "ADMIN";

// static path mappings
app.use("/js", express.static("public/js"));
app.use("/css", express.static("public/css"));
app.use("/img", express.static("public/imgs"));
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

// Get the index page
app.get("/", function (req, res) {
    if (req.session.loggedIn) {
        res.redirect("/profile");
    } else {
        let doc = fs.readFileSync("./app/html/index.html", "utf8");
        res.send(doc);
    }
});

// Get the profile page
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


//////// USER MANAGEMENT ////////

// Login request
app.post("/login", function (req, res) {
    authenticate(req.body.email, req.body.password,
        function (userRecord) {
            if (userRecord == null) {
                res.send({ status: "fail", msg: "Incorrect email or password" });
                return;
            } else if (userRecord.role == callerRole) {
                req.session.loggedIn = true;
                req.session.role = callerRole;
            } else if (userRecord.role == responderRole) {
                req.session.loggedIn = true;
                req.session.role = responderRole;
            } else if (userRecord.role == adminRole) {
                req.session.loggedIn = true;
                req.session.role = adminRole;
            }
            req.session.userID = userRecord.ID;
            req.session.save(function (err) { });
            res.send({ status: "success", msg: "Logged in" });
        }
    );
});

// Authenticate the user
function authenticate(email, pwd, callback) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    con.query(
        "SELECT * FROM user WHERE email = ? AND password = ?", [email, pwd],
        function (error, results) {
            if (error) {
                console.log(error);
            }
            if (results.length > 0) {
                return callback(results[0]);
            } else {
                return callback(null);
            }
        }
    );
}

// Logout request
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

// Get the signup page
app.get("/signup", function (req, res) {
    let doc = fs.readFileSync("./app/html/create_user.html", "utf8")
    res.send(doc)
    
});

// Create user request
app.post("/createUser", function (req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    const addUser = `INSERT INTO user (email, password, firstName, lastName, age, gender, phoneNumber, role)
    VALUES ('` + req.body.email +
        `', '` + req.body.password +
        `', '` + req.body.firstName +
        `', '` + req.body.lastName +
        `', ` + req.body.age +
        `, '` + req.body.gender +
        `', '` + req.body.phoneNumber +
        `', '` + req.body.role +
        `');`;

    con.query(addUser, function (error, results) {
        if (error) {
            console.log(error);
            res.send({ status: "fail", msg: "creating user: " + error });
        } else {
            res.send({ status: "success", msg: "user created" });
        }
    });
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
app.post("/editUser", function(req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();
    const editUser = `UPDATE user SET
    password = IfNull(` + (req.body.password ? "'" + req.body.password + "'" : "NULL") + `, password),
    firstName = IfNull(` + (req.body.firstName? "'" + req.body.firstName + "'" : "NULL")  + `, firstName),
    lastName = IfNull(` + (req.body.lastName ? "'" + req.body.lastName + "'" : "NULL")  + `, lastName),
    age = IfNull(` + (req.body.age ? req.body.age : "NULL") + `, age),
    gender = IfNull(` + (req.body.gender ? "'" + req.body.gender + "'" : "NULL")  + `, gender),
    phoneNumber = IfNull(` + (req.body.phoneNumber ? "'" + req.body.phoneNumber + "'" : "NULL")  + `, phoneNumber)
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
app.post("/adminEditUser", function(req, res) {
    if (req.session.role = adminRole) {
        const mysql = require("mysql2");
        const con = mysql.createConnection(sqlAuthentication);
        con.connect();
        const editUser = `UPDATE user SET
        password = IfNull(` + (req.body.password ? "'" + req.body.password + "'" : "NULL") + `, password),
        firstName = IfNull(` + (req.body.firstName? "'" + req.body.firstName + "'" : "NULL")  + `, firstName),
        lastName = IfNull(` + (req.body.lastName ? "'" + req.body.lastName + "'" : "NULL")  + `, lastName),
        age = IfNull(` + (req.body.age ? req.body.age : "NULL") + `, age),
        gender = IfNull(` + (req.body.gender ? "'" + req.body.gender + "'" : "NULL")  + `, gender),
        phoneNumber = IfNull(` + (req.body.phoneNumber ? "'" + req.body.phoneNumber + "'" : "NULL")  + `, phoneNumber),
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
    const getUser = `SELECT * FROM user WHERE ID = ` + req.session.userID;

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
        const getUser = `SELECT * FROM user WHERE ID != ` + req.session.userID;

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
app.post("/deleteUser", function(req, res) {
    const mysql = require("mysql2");
    const con = mysql.createConnection(sqlAuthentication);
    con.connect();

    const adminCountQuery = `SELECT COUNT(*) as admin_count
    FROM user
    WHERE role = "ADMIN"`;

    const deleteUserQuery = `DELETE FROM USER
    WHERE ID = ` + req.body.ID;

    con.query(adminCountQuery, function(error, results) {
        if (error) {
            console.log(error);
            res.send({status: "fail", msg: "querying admin count: " + error});
        } else {
            if (results[0]["admin_count"] > 1) {
                con.query(deleteUserQuery, function(error, results) {
                    if (error) {
                        console.log(error);
                        res.send({status: "fail", msg: "deleting user: " + error});
                    } else {
                        res.send({ status: "success", msg: "user deleted" });
                    }
                })
            } else {
                console.log("tried to delete last admin");
                res.send({status: "fail", msg: "deleting user: cannot delete last admin"});
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
