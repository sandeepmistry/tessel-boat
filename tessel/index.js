var WebSocket = require('ws');

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


var host = process.argv[2];

function wsConnect() {
  var ws = new WebSocket('ws://' + host + '/tessel');

  ws.on('open', function() {
    console.log('websocket opened');

    if (led1) {
      led1.toggle();    
    }
  });

  ws.on('message', function(data, flags) {
    var message = JSON.parse(data);

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

  ws.on('close', function() {
    console.log('websocket closed');

    console.log('reseting ...');
    spartan.reset(function() {
      console.log('reset done!');
    });

    if (led1) {
      led1.toggle();    
    }

    ws = null;
    process.nextTick(wsConnect);
  });

  ws.on('error', function() {
    console.log('websocket error');

    ws = null;
    setTimeout(wsConnect, 5000);
  });
}

wsConnect();
