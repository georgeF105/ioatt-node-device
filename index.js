var admin = require('firebase-admin');
var hubKey = require('./hub.config').hubKey;
var serviceAccount = require('./firebase-admin.config.json');
var exec = require('child_process').exec;

console.log('starting Internet of all the things - node device');

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
        var errorMessage = updateDevice(deviceVal, () => {
          deviceRef.update({ updated: false, errorMessage: null });
        }, (error) => {
          console.log('logging error', error);
          deviceRef.update({ errorMessage: error });
        });

        // if (errorMessage) {
        //   deviceRef.update({ errorMessage: errorMessage });
        // } else {
        //   deviceRef.update({ updated: false });
        // }
      }
    });
  });
}

function updateDevice(deviceVal, successFn, errorFn) {
  if (deviceVal.type = 'rfPlug') {
    return updatePlug(deviceVal, successFn, errorFn);
  }
}

function updatePlug(deviceVal, successFn, errorFn) {
  var cmd = './scripts/send-plug-code ';
  if (deviceVal.state) {
    cmd += deviceVal.onCode;    
  } else {
    cmd += deviceVal.offCode;
  }

  exec(cmd, function(error, stdout, stderr) {
    if (error) {
      console.log('error', stderr);
      errorFn(stderr);
      return;
    }
    console.log('stdout', stdout);
    successFn();
  });
}
