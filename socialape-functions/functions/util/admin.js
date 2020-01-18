const admin = require("firebase-admin");
var serviceAccount = require("F:/firebaseFunctions/socialape-cc6b6-firebase-adminsdk-fc9lm-aad2ecd548.json"); //this line of code is for run firebase serve locally using a service account. with an unique key which is stored in the mentioned directory
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://socialape-cc6b6.firebaseio.com",
    storageBucket: "socialape-cc6b6.appspot.com",
  });
  const db = admin.firestore();

  module.exports = {admin,db};