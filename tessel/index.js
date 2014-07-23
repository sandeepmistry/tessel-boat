var tessel = require('tessel');

var spartan = require('./spartan');

var led1 = null;

if (tessel.led) {
  led1 = tessel.led[0].output(1);  
}

spartan.on('ready', function() {
  console.log('spartan - ready');
});

process.stdin.resume();
process.stdin.on('data', function (data) {
  data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings

  var matched;

  if (data === 'calibrate') {
    console.log('CLI: calibrating ...');
    spartan.calibrate(function() {
      console.log('SPARTAN: calibration done!');
    });
  } else if (data === 'reset') {
    console.log('CLI: reseting ...');
    spartan.reset(function() {
      console.log('SPARTAN: reset done!');
    });
  } else if (matched = data.match(/^m(-?\d+\.?\d*?)$/)) {
    var percentage = parseFloat(matched[1], 10);

    console.log('CLI: setting motor speed to ', percentage);
    spartan.setMotorSpeedPercentage(percentage, function() {
      console.log('SPARTAN: setting motor speed done!');
    });
  } else if (matched = data.match(/^r(-?\d+\.?\d*?)$/)) {
    var percentage = matched[1];

    console.log('CLI: setting rudder position to ', percentage);
    spartan.setRudderDirectionPercentage(percentage, function() {
      console.log('SPARTAN: setting rudder position done!');
    });
  } else {
    console.log('CLI: unknown command: ', data);
  }
});

var ble = require('ble-ble113a').use(tessel.port['B']); 

ble.on('ready', function(err) {
  if (err) return console.log(err);
  console.log('BLE: start advertising');
  ble.startAdvertising();

  if (led1) {
    led1.write(0);
  }
});

ble.on('connect', function() {
  console.log("BLE: master connected");

  if (led1) {
    led1.write(1);
  }
});

ble.on('remoteWrite', function(connection, index, data) {
  console.log('BLE: remote write', index, data);

  if (index == 0 && data.length == 4) {
    var speed = data.readFloatLE(0);

    console.log('BLE: setting motor speed to ', speed);
    spartan.setMotorSpeedPercentage(speed, function() {
      console.log('SPARTAN: setting motor speed done!');
    });
  } else if (index == 1 && data.length == 4) {
    var direction = data.readFloatLE(0);

    console.log('BLE: setting rudder position to ', direction);
    spartan.setRudderDirectionPercentage(direction, function() {
      console.log('SPARTAN: setting rudder position done!');
    });
  }
});

ble.on('disconnect', function() {
  console.log("BLE: master disconnected");

  spartan.reset(function() {
    console.log('SPARTAN: reset done!');
  });

  if (led1) {
    led1.write(0);
  }

  console.log('BLE: start advertising');
  ble.startAdvertising();
});
