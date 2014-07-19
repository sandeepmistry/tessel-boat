var async = require('async');

var tessel = require('tessel');
var servolib = require('servo-pca9685');

var servo = servolib.use(tessel.port['A']);


var frequency = 100;
var servo1    = 5; // We have a servo plugged in at position 1

var maxForward = 0.20;
var maxReverse = 0.10;
var neutral    = 0.15;

var delay      = 3750;

function calibrate(done) {
  async.series([
    function(callback) {
      console.log('duty cycle: maxForward');
      servo.setDutyCycle(servo1, maxForward, callback);
    },
    function(callback) {
      setTimeout(callback, delay);
    },
    function(callback) {
      console.log('duty cycle: maxReverse');
      servo.setDutyCycle(servo1, maxReverse, callback);
    },
    function(callback) {
      setTimeout(callback, delay);
    },
    function(callback) {
      console.log('duty cycle: neutral');
      servo.setDutyCycle(servo1, neutral, callback);
    },
    function(callback) {
      done();
    }
  ]);
}

servo.on('ready', function () {
  console.log('servo ready');

  async.series([
    function(callback) {
      servo.setModuleFrequency(frequency, callback);
    },
    function(callback) {
      console.log('servo module frequency set: ', frequency);
      callback();
    },
    function(callback) {
      console.log('duty cycle: neutral');
      servo.setDutyCycle(servo1, neutral, callback);
    }
  ]);
});

// ?.??? -> reverse -> 1.0 ms               0.114
// 0.171 -> neutral -> 1.5 ms ??? 1.48 ms
// ?.??? -> forward -> 2.0 ms               0.228

process.stdin.resume();
process.stdin.on('data', function (data) {
  data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings

  if (data === 'calibrate') {
    console.log('calibrating ...');
    calibrate(function() {
      console.log('calibration complete');
    });
  } else {
    var dutyCycle = parseFloat(data);

    if (dutyCycle > 0.1 && dutyCycle < 0.2) {
      console.log('setting duty cycle to: ', dutyCycle);
      servo.setDutyCycle(servo1, dutyCycle);
    }
  }
});

