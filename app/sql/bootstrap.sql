CREATE DATABASE IF NOT EXISTS COMP2800;
use COMP2800;
CREATE TABLE IF NOT EXISTS BBY_19_user (ID int NOT NULL AUTO_INCREMENT, email varchar(30), password varchar(30), firstName varchar(30), lastName varchar(30), age int, gender varchar(30), phoneNumber varchar(30), role varchar(30), PRIMARY KEY (ID));
INSERT INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('admin', 'test', 'test', 'admin', 50, 'Male', '780293728', 'ADMIN');
INSERT INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('caller', 'test', 'test', 'caller', 50, 'Male', '780293728', 'CALLER');
INSERT INTO BBY_19_user (email, password, firstName, lastName, age, gender, phoneNumber, role) VALUES ('responder', 'test', 'test', 'responder', 50, 'Male', '780293728', 'RESPONDER');