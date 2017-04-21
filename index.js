var admin = require('firebase-admin');
var hubKey = require('./hub.config').hubKey;
var serviceAccount = require('./firebase-admin.config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://angle-control.firebaseio.com'
});

console.log(hubKey);

var db = admin.database();
var hubRef = db.ref("hubs/" + hubKey);
var deviceRefs = [];

hubRef.on('value', (hub) => {
  console.log('hub', hub.val());
}, (err) => {
  console.log('DeviceConnected update error:', err);
});