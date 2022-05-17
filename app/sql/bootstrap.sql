CREATE DATABASE IF NOT EXISTS COMP2800;
use COMP2800;

CREATE TABLE IF NOT EXISTS BBY_19_user (ID int NOT NULL AUTO_INCREMENT, email varchar(30) UNIQUE, password varchar(30), firstName varchar(30), lastName varchar(30), age int, gender varchar(30), phoneNumber varchar(30), role varchar(30), PRIMARY KEY (ID));
CREATE TABLE BBY_19_incident (ID int NOT NULL AUTO_INCREMENT, title varchar(200), type varchar(100), callerID int, description varchar(1000), lat float, lon float, timestamp TIMESTAMP, PRIMARY KEY (ID));
CREATE TABLE BBY_19_responders (ID int NOT NULL AUTO_INCREMENT, responderID int, incidentID int NOT NULL REFERENCES incident(ID) ON DELETE CASCADE, PRIMARY KEY (ID));

REPLACE INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('admin@saveme.ca', 'test', 'test', 'admin', 50, 'male', '780 293 7281', 'ADMIN');
REPLACE INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('caller@saveme.ca', 'test', 'test', 'caller', 50, 'male', '780 293 7281', 'CALLER');
REPLACE INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('responder@saveme.ca', 'test', 'test', 'responder', 50, 'female', '780 293 7281', 'RESPONDER');

REPLACE INTO BBY_19_incident (title, type, callerID, description, lat, lon, timestamp) VALUES ('Test Incident', 'URGENT', 2, 'Some description', 48.787386, -125.221652, CURRENT_TIMESTAMP);

REPLACE INTO BBY_19_responders (responderID, incidentID) VALUES (3, 1);