const {admin, db} = require('../util/admin');
const config = require('../util/config');
const firebase = require('firebase');
firebase.initializeApp(config);
const { validateSignupData, validateLoginData,reduceUserDetails } = require('../util/validator');

exports.signup = (req, res) => {
 
    console.log('signup route triggered');
    console.log('req body parameters are', req.body);
    const newUser = {
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      handle: req.body.handle,
    };
    console.log('new user json', newUser);

    // destructuring from validator.js helper funtions
    const {valid, errors} = validateSignupData(newUser);
    if(!valid) res.status(400).json(errors);
    const noImg = 'no-image.png';
    console.log('valid and errors validation check', valid, errors);
    let token, userID;
    db.doc(`/users/${newUser.handle}`).get().then(doc => {
        if (doc.exists) {
        console.log('this handle already existrs');
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
          imageUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noImg}?alt=media`,
          userID: userID
        };
        db.doc(`users/${newUser.handle}`).set(userCredentials);
        // return res.status(201).json({token});
      }).then(() => {
        return res.status(201).json({token});
      }).catch(err => {
        console.log('entered into catch block');
        console.error(err);
        // note that 'auth/email-already-in-use' this string is firebase default error msg. so we are handling it on our own way which is actually a client error 400.
        if (err.code == 'auth/email-already-in-use') {
          return res.status(400).json({
            email: 'Email is already in use'
          });
        } else {
            console.log('error here');
          return res.status(500).json({ error: err.code});
        }
      });
}



exports.login = (req,res)=>{
    const user = {
      email:  req.body.email,
      password: req.body.password,
    }
     // destructuring from validator.js helper funtions
     const {valid, errors} = validateLoginData(user);
     if(!valid) res.status(400).json(errors);

    firebase.auth().signInWithEmailAndPassword(user.email, user.password).then(data => {
      return data.user.getIdToken();
    }).then(token =>{
      return res.json({token})
    }).catch(err=>{
      if(err.code == "auth/wrong-password") {
        return res.status(403).json({general: 'Wrong credentials, Please try again.'});
      } else{
        return res.status(500).json({error: err.code});
      }
      
    })
}

exports.addUserDetails = (req, res) =>{
  let userDetails = reduceUserDetails(req.body);
  db.doc(`/users/${req.user.handle}`).update(userDetails).then(()=>{
    return res.json({message:'details added successfully'});
  }).catch(err=>{
    console.error(err);
    return res.status(500).json({error: err.code});
  })
}

// here we are using busboy npm package to upload an image
exports.uploadImage = (req,res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs'); 

  const busboy = new BusBoy({headers: req.headers});
  let imageFileName;
  let imageToBeUploaded = {};



//* used busboy npm package to detect the upload finish, image mimetype etc.
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {  
    // console.log('File [' + fieldname + ']: filename: ' + filename + ', encoding: ' + encoding + ', mimetype: ' + mimetype);
    const imageExtension = filename.split('.')[filename.split('.').length-1];
     imageFileName = `${Math.round(Math.random()*10000000000)}.${imageExtension}`; //output sample: 459847502075.png
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = {filepath, mimetype};
    file.pipe(fs.createWriteStream(filepath));
  });


  busboy.on('finish', function() { 
    admin.storage().bucket().upload(imageToBeUploaded.filepath, {
      resumable: false,
      metadata: {
        metadata: {
          contentType: imageToBeUploaded.mimetype
        }
      }
    }).then(()=>{
      const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
      // add this user to database user doc

      return db.doc(`/users/${req.user.handle}`).update({imageUrl: imageUrl});
    }).then(()=>{
      return res.json({message: `image uploaded successfully`});
    }).catch(err=>{
      console.error(err);
      return res.status(500).json({error: err.code});
    });
  });
  
  busboy.end(req.rawBody);
}

exports.getAuthenticatedUser = (req,res) => {
  console.log('entered into get authenticated user');
  let userData = {};
  db.doc(`users/${req.user.handle}`).get().then((doc)=>{
    if(doc.exists){
      console.log('doc exists');
      userData.credentials = doc.data();
      console.log(userData);
      return db.collection('likes').where('userHandle', '==', req.user.handle).get();
    }
    console.log('doc doesnt exists');
  }).then((data)=>{
    console.log('entered into then block');
    userData.likes = [];
    data.forEach((doc)=>{
      userData.likes.push(doc.data());
    });
    console.log(userData.likes);

    return res.json(userData);
  }).catch((err)=>{
    console.error(err);
    res.status(500).json({error: error.code});
  })
}