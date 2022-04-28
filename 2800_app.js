
const express = require("express");
const session = require("express-session");
const app = express();
const fs = require("fs");
const { JSDOM } = require('jsdom');
const sqlAuthentication = { // sql connection settings
    host: "localhost",
    user: "root",
    password: "",
    multipleStatements: true,
    database: "safetyApp"
}

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
        let doc = fs.readFileSync("./app/html/user_profile.html", "utf8");
        if (req.session.admin) {
            doc = fs.readFileSync("./app/html/admin_profile.html", "utf8");
        }
        res.send(doc);
    } else {
        res.redirect("/");
    }
});


// Handle login request
app.post("/login", function (req, res) {
//    res.setHeader("Content-Type", "application/json");
    authenticate(req.body.email, req.body.password,
        function (userRecord) {
            if (userRecord == null) {
                res.send({ status: "fail", msg: "Incorrect email or password" });
            } else if (userRecord.admin) {
                req.session.loggedIn = true;
                req.session.admin = true;
                req.session.save(function (err) { });
                res.send({status: "success", msg: "Logged in as admin"});
            } else {
                req.session.loggedIn = true;
                req.session.admin = false;
                req.session.save(function (err) { });
                res.send({status: "success", msg: "Logged in as user"});
            }
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

// Log the user out
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

// Connects to the mysql database, creates a user table if it doesn't exist.
async function init() {
    const mysql = require("mysql2/promise");
    const con = await mysql.createConnection({
        host: sqlAuthentication.host,
        user: sqlAuthentication.user,
        password: sqlAuthentication.password,
        multipleStatements: sqlAuthentication.multipleStatements,
    });

    const createUserTable = `CREATE DATABASE IF NOT EXISTS ` + sqlAuthentication.database + `;
        use ` + sqlAuthentication.database + `;
        CREATE TABLE IF NOT EXISTS user (
        ID int NOT NULL AUTO_INCREMENT,
        email varchar(30),
        password varchar(30),
        admin bool,
        PRIMARY KEY (ID));`;
    await con.query(createUserTable);

    console.log("Listening on port " + port + "!");
}

// RUN SERVER
let port = 8000;
app.listen(port, init);
