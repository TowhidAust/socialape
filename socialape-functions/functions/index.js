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
  db.collection("screams").get().then(data => {
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
    }).catch(err => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("screams").add(newScream).then(doc => {
      res.json({
        message: `document ${doc.id} created successfully`,
      });
    }).catch(err => {
      res.status(500).json({
        error: "something went wrong",
      });
      console.log(err);
    });
});

/**
 * ?------------------------------------------------------------------
 * ? Helper functions starts here
 * ? -----------------------------------------------------------------
 */
const isEmail = (email) => {
  //got this email regex exp link from: 'https://pastebin.com/f33g85pd'
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  (email.match(emailRegEx)) ? true : false;
}
const isEmpty = (string) =>{
  // to make sure the string is not empty
  if(string.trim() === ''){ return  true} else{ return false}
}
/**
 * ?------------------------------------------------------------------
 * ? Helper functions ends here
 * ? -----------------------------------------------------------------
 */
// signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  // TODO: validate data
  let errors = {};
  if(isEmpty(newUser.email)){
    errors.email = 'Must not be empty'
  }else if(!isEmail(newUser.email)) {
    errors.email = 'Must be a valid email address'
  }

  if(isEmpty(newUser.password)) errors.password = 'Must not be empty';
  if(newUser.password != newUser.confirmPassword) errors.confirmPassword = 'Password Must match';
  if(isEmpty(newUser.handle))  errors.handle = 'Must not be empty'; 
  if(Object.keys(errors).length > 0)  res.status(400).json(errors);

  let token, userID;
  db.doc(`/users/${newUser.handle}`).get().then(doc => {
      if (doc.exists) {
        return res.status(400).json({
          handle: `this handle is already taken`
        });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    }).then(data => {
      // authentication token generate
      userID = data.user.uid;
      return data.user.getIdToken();
    }).then(idToken => {
      token = idToken;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userID: userID
      };
      db.doc(`users/${newUser.handle}`).set(userCredentials);
      return res.status(201).json({token});
    }).then(() => {
      return res.status(201).json({token});
    }).catch(err => {
      console.error(err);
      // note that 'auth/email-already-in-use' this string is firebase default error msg. so we are handling it on our own way which is actually a client error 400.
      if (err.code == 'auth/email-already-in-use') {
        return res.status(400).json({
          email: 'Email is already in use'
        });
      } else {
        return res.status(500).json({ error: err.code});
      }
    });
});

/**
 * if you want to change the region.. dothis--> 
 * ? exports.api = functions.region('europe-west1').https.onRequest(app);
*/
exports.api = functions.https.onRequest(app);