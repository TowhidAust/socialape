const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
admin.initializeApp();
const firebaseConfig = {
  apiKey: "AIzaSyCfQse-CxyLUvD3W-K_J-bWLMggWcq_7Ks",
  authDomain: "socialape-cc6b6.firebaseapp.com",
  databaseURL: "https://socialape-cc6b6.firebaseio.com",
  projectId: "socialape-cc6b6",
  storageBucket: "socialape-cc6b6.appspot.com",
  messagingSenderId: "665128045286",
  appId: "1:665128045286:web:773ae3fb91cfe085de0927",
  measurementId: "G-B5M754HDM6",
};
const firebase = require("firebase");
firebase.initializeApp(firebaseConfig);
const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("screams")
    .get()
    .then(data => {
      let screams = [];
      data.forEach(doc => {
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screams")
    .add(newScream)
    .then(doc => {
      res.json({
        message: `document ${doc.id} created successfully`,
      });
    })
    .catch(err => {
      res.status(500).json({
        error: "something went wrong",
      });
      console.log(err);
    });
});

// signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  // TODO: validate

  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: `this handle is already taken` });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      // authentication token generate
      return data.user.getIdToken();
    })
    .then(token => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
  //   firebase
  //     .auth()
  //     .createUserWithEmailAndPassword(newUser.email, newUser.password)
  //     .then(data => {
  //       return res
  //         .status(201)
  //         .json({ message: `user ${data.user.uid} signed up successfully` });
  //     })
  //     .catch(err => {
  //       console.error(err);
  //       return res.status(500).json({ error: err.code });
  //     });
});

// exports.api = functions.region('europe-west1').https.onRequest(app);
exports.api = functions.https.onRequest(app);
