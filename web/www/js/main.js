function init() {
  var wsUri = 'ws://' + location.host + '/browser';

  var serverStateElement = document.querySelector('.server-state');
  var iosStateElement = document.querySelector('.ios-state');

  var rudderDirectionElement = document.querySelector('.rudder-direction');
  var motorSpeedElement = document.querySelector('.motor-speed');
  var accelerometerXElement = document.querySelector('.accelerometer-x');
  var accelerometerYElement = document.querySelector('.accelerometer-y');
  var accelerometerZElement = document.querySelector('.accelerometer-z');
  var magneticHeadingElement = document.querySelector('.magnetic-heading');
  var trueHeadingElement = document.querySelector('.true-heading');
  var longitudeElement = document.querySelector('.longitude');
  var latitudeElement = document.querySelector('.latitude');
  var speedElement = document.querySelector('.speed');
  var courseElement = document.querySelector('.course');

  var rudderDirectionInput = document.querySelector('input[name="rudder-direction"]');
  var motorSpeedInput = document.querySelector('input[name="motor-speed"]');

  var resetButton = document.querySelector('.reset');
  var calibrateButton = document.querySelector('.calibrate');

  websocket = new WebSocket(wsUri);
  websocket.onopen = function(evt) {
    serverStateElement.innerHTML = 'connected';
  };
  websocket.onclose = function(evt) {
    serverStateElement.innerHTML = 'disconnected';
    iosStateElement.innerHTML = 'unknown';
  };
  websocket.onmessage = function(evt) {
    var data = evt.data;
    var message = JSON.parse(data);

    // console.log(message);

    if (message.connected !== undefined) {
      iosStateElement.innerHTML = message.connected ? 'connected' : 'disconnected';

      rudderDirectionElement.innerHTML = rudderDirectionInput.value = 0;
      motorSpeedElement.innerHTML = motorSpeedInput.value = 0;
    }

    if (message.accelerometerX !== undefined) {
      accelerometerXElement.innerHTML = message.accelerometerX;
    }

    if (message.accelerometerY !== undefined) {
      accelerometerYElement.innerHTML = message.accelerometerY;
    }

    if (message.accelerometerZ !== undefined) {
      accelerometerZElement.innerHTML = message.accelerometerZ;
    }

    if (message.magneticHeading !== undefined) {
      magneticHeadingElement.innerHTML = message.magneticHeading;
    }

    if (message.trueHeading !== undefined) {
      trueHeadingElement.innerHTML = message.trueHeading;
    }

    if (message.longitude !== undefined) {
      longitudeElement.innerHTML = message.longitude;
    }

    if (message.latitude !== undefined) {
      latitudeElement.innerHTML = message.latitude;
    }

    if (message.speed !== undefined) {
      speedElement.innerHTML = message.speed;
    }

    if (message.course !== undefined) {
      courseElement.innerHTML = message.course;
    }
  };
  websocket.onerror = function(evt) {
    // console.log('error');
    // console.log(evt);
  };

  window.onkeydown = function(event) {
    switch (window.event.keyCode) {
      case 37:
        setRudderDirection(parseFloat(rudderDirectionInput.value, 10) - parseFloat(rudderDirectionInput.step, 10));
        break;

      case 38:
        setMotorSpeed(parseFloat(motorSpeedInput.value, 10) + parseFloat(motorSpeedInput.step, 10));
        break;

      case 39:
        setRudderDirection(parseFloat(rudderDirectionInput.value, 10) + parseFloat(rudderDirectionInput.step, 10));
        break;

      case 40:
        setMotorSpeed(parseFloat(motorSpeedInput.value, 10) - parseFloat(motorSpeedInput.step, 10));
        break;
    }
  };

  resetButton.onclick = function() {
    sendCommand({
      reset: true
    });

    rudderDirectionElement.innerHTML = rudderDirectionInput.value = 0;
    motorSpeedElement.innerHTML = motorSpeedInput.value = 0;
  };

  function setRudderDirection(value) {
    rudderDirectionElement.innerHTML = rudderDirectionInput.value = value;

    sendCommand({
      rudderDirection: value
    });
  }

  function setMotorSpeed(value) {
    motorSpeedElement.innerHTML = motorSpeedInput.value = value;

    sendCommand({
      motorSpeed: value
    });
  }

  function sendCommand(command) {
    websocket.send(JSON.stringify(command));
  }
}

window.addEventListener('load', init, false);
