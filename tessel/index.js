var jot = require('json-over-tcp');

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
    console.log('calibrating ...');
    spartan.calibrate(function() {
      console.log('calibration done!');
    });
  } else if (data === 'reset') {
    console.log('reseting ...');
    spartan.reset(function() {
      console.log('reset done!');
    });
  } else if (matched = data.match(/^m(-?\d+\.?\d*?)$/)) {
    var percentage = parseFloat(matched[1], 10);

    console.log('setting motor speed to ', percentage);
    spartan.setMotorSpeedPercentage(percentage, function() {
      console.log('setting motor speed done!');
    });
  } else if (matched = data.match(/^r(-?\d+\.?\d*?)$/)) {
    var percentage = matched[1];

    console.log('setting rudder position to ', percentage);
    spartan.setRudderDirectionPercentage(percentage, function() {
      console.log('setting rudder position done!');
    });
  } else {
    console.log('unknown command: ', data);
  }
});

console.log(process.argv);

var host = process.argv[2];
var port = process.argv[3];

function socketConnect() {
  var socket = jot.connect({
    host: host,
    port: port
  });

  socket.on('connect', function() {
    console.log('connected');

    if (led1) {
      led1.toggle();    
    }
  });

  socket.on('data', function(message) {
    if (message.reset) {
      console.log('reseting ...');
      spartan.reset(function() {
        console.log('reset done!');
      });
    }

    if (message.calibrate) {
      console.log('calibrating ...');
      spartan.calibrate(function() {
        console.log('calibration done!');
      });
    }

    if (message.motorSpeed !== undefined) {
      console.log('setting motor speed to ', message.motorSpeed);
      spartan.setMotorSpeedPercentage(message.motorSpeed, function() {
        console.log('setting motor speed done!');
      });
    }

    if (message.rudderDirection !== undefined) {
      console.log('setting rudder position to ', message.rudderDirection);
      spartan.setRudderDirectionPercentage(message.rudderDirection, function() {
        console.log('setting rudder position done!');
      });
    }
  });

  socket.on('close', function() {
    console.log('close');

    spartan.reset(function() {
      console.log('reset done!');
    });

    if (led1) {
      led1.toggle();    
    }

    socket = null;
    setTimeout(socketConnect, 5000);
  });

  socket.on('error', function() {
    console.log('error');
  });
}

socketConnect();
