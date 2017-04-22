var admin = require('firebase-admin');
var hubKey = require('./hub.config').hubKey;
var serviceAccount = require('./firebase-admin.config.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://angle-control.firebaseio.com'
});

var db = admin.database();
var hubRef = db.ref("hubs/" + hubKey);
var deviceRefs = [];

hubRef.on('value', (hub) => {
  var hubVal = hub.val();
  var deviceKeys = Object.keys(hubVal.devices).map(key => {
    return hubVal.devices[key].key;
  });
  attachDeviceWatchers(deviceKeys);
}, (err) => {
  console.log('DeviceConnected update error:', err);
});

function attachDeviceWatchers(deviceKeys) {
  deviceRefs.forEach(deviceRef => deviceRef.off());

  deviceRefs = deviceKeys.map(key => {
    return db.ref(`devices/${key}`);
  });

  deviceRefs.forEach(deviceRef => {
    deviceRef.on('value', device => {
      var deviceVal = device.val();
      if (deviceVal.updated) {
        deviceUpdated(deviceVal);
      }
      deviceRef.update({ updated: false });
    });
  });
}

function deviceUpdated(deviceVal) {
  if (deviceVal.type = 'rfPlug') {
    updatePlug(deviceVal);
  }
}

function updatePlug(deviceVal) {
  if (deviceVal.state) {
    console.log('sending code', deviceVal.onCode);
  } else {
    console.log('sending code', deviceVal.offCode);
  }
}