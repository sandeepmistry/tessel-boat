var events = require('events');
var util = require('util');

var tessel = require('tessel');
var servolib = require('servo-pca9685');

var PORT              = 'A';
var MODULE_FREQUENCY  = 100; // Hz
var RUDDER_PIN        = 4;
var MOTOR_PIN         = 5;

var MAX_DUTY_CYCLE    = 0.20;
var MIN_DUTY_CYCLE    = 0.10;
var MID_DUTY_CYCLE    = 0.15;

var CALIBRATION_DELAY = 3750; // ms

function Spartan() {
  this._servo = null;

  if (tessel.port && tessel.port[PORT]) {
    this._servo = servolib.use(tessel.port[PORT]);

    this._servo.on('ready', this._onServoReady.bind(this));
  } else {
    console.warn('test mode');
    process.nextTick(function() {
      this.emit('ready');
    }.bind(this));
  }
}

util.inherits(Spartan, events.EventEmitter);

Spartan.prototype._onServoReady = function() {
  // console.log('servo ready');

  this._servo.setModuleFrequency(MODULE_FREQUENCY, function() {
    // console.log('servo module frequency set: ', MODULE_FREQUENCY);

    this.reset(function() {
      this.emit('ready');
    }.bind(this));
  }.bind(this));
};

Spartan.prototype._setPinPercentage = function(pin, percentage, callback) {
  percentage = parseFloat(percentage);
  var dutyCycle = (percentage / 100.0) * ((MAX_DUTY_CYCLE + MIN_DUTY_CYCLE) / 2.0) + MID_DUTY_CYCLE;

  if (dutyCycle < MIN_DUTY_CYCLE) {
    dutyCycle = MIN_DUTY_CYCLE;
  } else if (dutyCycle > MAX_DUTY_CYCLE) {
    dutyCycle = MAX_DUTY_CYCLE;
  }

  // console.log('setting pin duty cycle: ', pin, dutyCycle);

  if (this._servo) {
    this._servo.setDutyCycle(pin, dutyCycle, callback);
  } else {
    callback();
  }
};

Spartan.prototype.setMotorSpeedPercentage = function(percentage, callback) {
  this._setPinPercentage(MOTOR_PIN, percentage, callback);
};

Spartan.prototype.setRudderDirectionPercentage = function(percentage, callback) {
  this._setPinPercentage(RUDDER_PIN, percentage, callback);
};

Spartan.prototype.calibrate = function(callback) {
  this.setMotorSpeedPercentage(100, function() {
    setTimeout(function () {
      this.setMotorSpeedPercentage(-100, function() {
        setTimeout(function () {
          this.setMotorSpeedPercentage(0, function() {
            callback();
          }.bind(this));
        }.bind(this), CALIBRATION_DELAY);
      }.bind(this));
    }.bind(this), CALIBRATION_DELAY);
  }.bind(this));
};

Spartan.prototype.reset = function(callback) {
  this.setMotorSpeedPercentage(0, function() {
    this.setRudderDirectionPercentage(0, function() {
      callback();
    }.bind(this));
  }.bind(this));
};

module.exports = new Spartan();