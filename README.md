# SaveMe

## Description
Due to 911 dispatch wait times, our team Burnaby-19 has devloped a user safety web-application to help local businesses that have security personnel respond to conflicts on their property quickly.

## Technologies used
##### Frontend
HTML
CSS
JavaScript

##### Backend
Multer image uploading
Heroku hosting
Express routing
Express session management

##### Database
MYSQL
Remote MYSQL database provided by Heroku

## File Hierarchy
```bash
├── 2800_app.js
├── Procfile
├── README.md
├── app
│   ├── html
│   │   ├── about_page.html
│   │   ├── admin_profile.html
│   │   ├── caller_profile.html
│   │   ├── contact_page.html
│   │   ├── create_user.html
│   │   ├── index.html
│   │   └── responder_profile.html
│   └── sql
│       └── bootstrap.sql
├── package-lock.json
├── package.json
├── public
│   ├── css
│   │   ├── about.css
│   │   ├── admin_profile.css
│   │   ├── caller_profile.css
│   │   ├── contact.css
│   │   ├── create_user.css
│   │   ├── index.css
│   │   └── responder_profile.css
│   ├── fonts
│   ├── imgs
│   │   ├── background.jpg
│   │   ├── background2.jpg
│   │   ├── call.png
│   │   ├── favicon-32x32.png
│   │   ├── incident.png
│   │   ├── incidentImages
│   │   │   └── dummyfile.txt
│   │   ├── profile.png
│   │   ├── report.png
│   │   ├── saveme.ico
│   │   ├── saveme.jpg
│   │   ├── saveme.png
│   │   ├── sos.jpeg
│   │   ├── sos.png
│   │   ├── template_internal.png
│   │   └── userProfile
│   │       └── dummyfile.txt
│   └── js
│       ├── admin_profile.js
│       ├── admin_profile_create_user.js
│       ├── admin_profile_delete_user.js
│       ├── admin_profile_display_incident.js
│       ├── admin_profile_edit.js
│       ├── admin_profile_edit_user.js
│       ├── admin_profile_searchbar.js
│       ├── admin_profile_updater.js
│       ├── admin_profile_upload_photo.js
│       ├── caller_profile.js
│       ├── caller_profile_call_for_help.js
│       ├── caller_profile_delete_incident.js
│       ├── caller_profile_display_incident.js
│       ├── caller_profile_edit.js
│       ├── caller_profile_edit_incident.js
│       ├── caller_profile_report_incident.js
│       ├── caller_profile_updater.js
│       ├── caller_profile_upload_photo.js
│       ├── create_user.js
│       ├── index.js
│       ├── map.js
│       ├── responder_profile.js
│       ├── responder_profile_display_incident.js
│       ├── responder_profile_edit.js
│       ├── responder_profile_join_incident.js
│       ├── responder_profile_updater.js
│       └── responder_profile_upload_photo.js
└── readme.txt
```

## Installation
Installations needed:
  - Node.js
  - A text editor of your choice
  - A running MYSQL database (if you'd like to use a local database)
  
APIs needed:
  - None, all required APIs are included in the repository

If using the default remote database:
  1. Navigate to the main folder
  2. Run the command ```node 2800_app.js```
  3. You can now access the app at http://localhost:8000

If using a local database:
  1. On your database, run the SQL file located in app/sql/
  2. Open the file 2800_app.js with your text editor of choice
  3. On line 26, replace ```remoteSqlAuthentication``` with ```localSqlAuthentication```
  4. Run the command ```node 2800_app.js``` from the main folder
  5. You can now access the app at http://localhost:8000
  6. If your SQL access is denied, you can edit the connection config in the file 2800_app.js on line 9
