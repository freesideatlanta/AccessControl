# AccessControl

This app has the following pre-requisites:
* MongoDB installed
* node.js installed
* the folder /data/db exists and the user you intend to run node as has rights to it

To build the project:
> npm install

To run the project:
> node server.js

The application is built on the MEAN.js stack; MongoDB, Express, AngularJS, node.js. Data is persisted using MongoDB. 

There is a CRUD application for the card info as well as the locations. Locations are not currently in use.

There is also a JSON API that is used by the AngularJS application but can also be used with cURL statements to authenticate a user. Currently only the active/inactive flag is checked for a given card ID. If the provided card ID is not found, you will get a return value of false.
> /api/users/auth?cardNumber=XXXX