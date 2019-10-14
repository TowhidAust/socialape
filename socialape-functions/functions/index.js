const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();
// const express = require("express");
// const app = express();
// firebase config starts
admin.initializeApp();
const firebaseConfig = {
  apiKey: "AIzaSyCfQse-CxyLUvD3W-K_J-bWLMggWcq_7Ks",
  authDomain: "socialape-cc6b6.firebaseapp.com",
  databaseURL: "https://socialape-cc6b6.firebaseio.com",
  projectId: "socialape-cc6b6",
  storageBucket: "socialape-cc6b6.appspot.com",
  messagingSenderId: "665128045286",
  appId: "1:665128045286:web:773ae3fb91cfe085de0927",
  measurementId: "G-B5M754HDM6"
};
const firebase = require('firebase');
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();
// firebase config ends


app.get("/screams", (request, response) => {
  db
    .collection("screams")
    .orderBy("createdAt", "desc")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        // screams.push(doc.data());
        screams.push({
          screamID: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return response.json(screams);
    })
    .catch(err => console.log(err));
});

app.post("/scream", (request, response) => {
  const newScream = {
    body: request.body.body,
    userHandle: request.body.userHandle,
    // createdAt: admin.firestore.Timestamp.fromDate(new Date()),
    createdAt: new Date().toISOString(), //converting to actual date format
  };
  db
    .collection("screams")
    .add(newScream)
    .then(doc => {
      response.json({
        message: `document ${doc.id} created successfully`
      });
    })
    .catch(err => {
      response.status(500).json({
        error: "something went wrong"
      });
      console.log(err);
    });
});


// signup route
app.post('/signup', (request, response) => {
  const newUser = {
    email: request.body.email,
    password: request.body.password,
    confirmPassword: request.body.confirmPassword,
    handle: request.body.handle,
  };
  // TODO validate data
  db.doc(`/users/${newUser.handle}`).get().then(doc => {
    if (doc.exists) {
      return response.status(400).json({
        handle: 'this handle is already taken'
      });
    } else {
      return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
    }
  }).catch(function (err) {
    console.error(err);
    return response.status(500).json({
      error: 'error occured'
    });
  });


  // firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password).then(data => {
  //   return response.status(201).json({
  //     message: `user ${data.user.uid} signed up successfully`
  //   });
  // }).catch(function (err) {
  //   console.log(err);
  //   return response.status(500).json({
  //     error: err.code
  //   });
  // });
});





exports.api = functions.https.onRequest(app);
// to change the region we have to write below code
// exports.api = functions.region('europe-west1').https.onRequest(app); 