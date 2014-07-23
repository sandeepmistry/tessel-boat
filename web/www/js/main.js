function init() {
  var wsUri = 'ws://' + location.host + '/browser';

  var serverStateElement = document.querySelector('.server-state');
  var iosStateElement = document.querySelector('.ios-state');

  var rudderDirectionElement = document.querySelector('.rudder-direction');
  var motorSpeedElement = document.querySelector('.motor-speed');

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

    if (message.connected !== undefined) {
      iosStateElement.innerHTML = message.connected ? 'connected' : 'disconnected';

      rudderDirectionElement.innerHTML = rudderDirectionInput.value = 0;
      motorSpeedElement.innerHTML = motorSpeedInput.value = 0;
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
