const functions = require("firebase-functions");
// const admin = require("firebase-admin");
const express = require("express");
const app = express();
const {getAllScreams, postOneScream} = require('./handlers/screams');
const {signup,login, uploadImage} = require('./handlers/users');
const FBAuth = require('./util/fbAuth'); //middleware

// scream routes
app.get("/screams", getAllScreams);
app.post("/scream", FBAuth, postOneScream);
// users route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image",FBAuth, uploadImage);




/**
 * ?------------------------------------------------------------------
 * ? Helper functions starts here
 * ? -----------------------------------------------------------------
 */

/**
 * ?------------------------------------------------------------------
 * ? Helper functions ends here
 * ? -----------------------------------------------------------------
 */


/**
 * if you want to change the region.. dothis--> 
 * ? exports.api = functions.region('europe-west1').https.onRequest(app);
*/

exports.api = functions.https.onRequest(app);