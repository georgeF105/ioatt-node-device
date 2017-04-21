var admin = require("firebase-admin");

var serviceAccount = require("firebase-admin.config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://angle-control.firebaseio.com"
});

