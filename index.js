if (!navigator.bluetooth) {
  alert('Sorry, your browser doesn\'t support the Bluetooth API.');
}

const BT_DEVICE_NAME = 'CC41-A';

const SEND_SERVICE = 0xFFE0;
const SEND_SERVICE_CHARACTERISTIC = 0xFFE1;

const controlButtonsListElements = document.querySelectorAll('.control-buttons > li');

const connectButton = document.getElementById('btnConnect');
const disconnectButton = document.getElementById('btnDisconnect');
const setSpeedButton = document.getElementById('btnSetSpeed');
const rotateLeftButton = document.getElementById('btnRotateLeft');
const rotateRightButton = document.getElementById('btnRotateRight');

let btDevice;
let rotCharacteristic;
let textEncoder = new TextEncoder();

let speedLabel = document.getElementById("speedLabel");
let speedSlider = document.getElementById("speedSlider");

connectButton.addEventListener('pointerup', connectButtonPointerUpHandler);
speedSlider.addEventListener("input", speedSliderInputHandler, false);

function connectButtonPointerUpHandler() {
  navigator.bluetooth.requestDevice({
    filters:
      [
        { name: BT_DEVICE_NAME },
        { services: [ SEND_SERVICE ] },
      ]
  })
    .then(device => {
      btDevice = device;
      return device.gatt.connect();
    })
    .then(server => server.getPrimaryService(SEND_SERVICE))
    .then(service => service.getCharacteristic(SEND_SERVICE_CHARACTERISTIC))
    .then(characteristic => {
      rotCharacteristic = characteristic;
      toggleButtonsVisible();
      toggleEventListeners('addEventListener');
    })
    .catch(error => {
      console.error(error);
    });
}

function toggleButtonsVisible() {
  Array.prototype.forEach.call(controlButtonsListElements, listElement => {
    listElement.classList.toggle('visible');
  });
}

function toggleEventListeners(action) {
  disconnectButton[action]('click', disconnectButtonClickHandler);
  rotateLeftButton[action]('click', directionButtonClickHandler);
  rotateRightButton[action]('click', directionButtonClickHandler);
  setSpeedButton[action]('click', setSpeedButtonClickHandler);
}

function disconnectButtonClickHandler() {
  btDevice.gatt.disconnect();
  toggleEventListeners('removeEventListener');
  toggleButtonsVisible();
  rotCharacteristic = undefined;
  btDevice = undefined;
}

function directionButtonClickHandler(event) {
  return rotCharacteristic.writeValue(textEncoder.encode('dir:' + event.target.dataset.dir));
}

function setSpeedButtonClickHandler(event) {
  return rotCharacteristic.writeValue(textEncoder.encode('spd:' + speedSlider.value));
}

function speedSliderInputHandler() {
  speedLabel.innerHTML = speedSlider.value;
}
