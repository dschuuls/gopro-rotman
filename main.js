if (!navigator.bluetooth) {
  alert('Sorry, your browser doesn\'t support the Bluetooth API.');
}

const BT_DEVICE_NAME = 'ROT.MAN';

const SEND_SERVICE = 0xFFE0;
const SEND_SERVICE_CHARACTERISTIC = 0xFFE1;

const controlButtonsListElements = document.querySelectorAll('.control-buttons > li');

const connectButton = document.getElementById('btnConnect');
const disconnectButton = document.getElementById('btnDisconnect');
const rotateCcwButton = document.getElementById('btnRotateCcw');
const rotateCwButton = document.getElementById('btnRotateCw');
const stopRotatingButton = document.getElementById('btnStopRotating');

let btDevice;
let rotCharacteristic;
let textEncoder = new TextEncoder();

let minutesLabel = document.getElementById("minutesLabel");
let minutesSlider = document.getElementById("minutesSlider");

connectButton.addEventListener('pointerup', connectButtonPointerUpHandler);
minutesSlider.addEventListener("input", minutesSliderInputHandler, false);

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
  rotateCcwButton[action]('click', directionButtonClickHandler);
  rotateCwButton[action]('click', directionButtonClickHandler);
  stopRotatingButton[action]('click', stopRotatingButtonClickHandler);
}

function minutesSliderInputHandler() {
  minutesLabel.innerHTML = minutesSlider.value;
}

function disconnectButtonClickHandler() {
  btDevice.gatt.disconnect();
  toggleEventListeners('removeEventListener');
  toggleButtonsVisible();
  rotCharacteristic = undefined;
  btDevice = undefined;
}

function directionButtonClickHandler(event) {
  return rotCharacteristic.writeValue(textEncoder.encode(`start:cw=${event.target.dataset.cw};mins=${minutesSlider.value}`));
}

function stopRotatingButtonClickHandler() {
  return rotCharacteristic.writeValue(textEncoder.encode('stop'));
}
