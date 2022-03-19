#include <AccelStepper.h>
#include <SoftwareSerial.h>

#define motorPin1 7
#define motorPin2 6
#define motorPin3 5
#define motorPin4 4

#define MotorInterfaceType 8

AccelStepper stepper = AccelStepper(MotorInterfaceType, motorPin1, motorPin3, motorPin2, motorPin4);

SoftwareSerial btSerial(2, 3);

bool started = false;

String cmd;

void setup() {
  Serial.begin(9600);
  btSerial.begin(9600);
  stepper.setMaxSpeed(1000);
}

void loop() {
  if (btSerial.available() > 0) {
    cmd = btSerial.readString();
    Serial.println("received: " + cmd);
    if (cmd.startsWith("start:")) {
      // e.g. start:cw=1;mins=60
      startRotating(cmd.substring(9, 10) == "1", cmd.substring(16).toInt());
    }
    else if (cmd == "stop") {
      stopRotating();
    }
  }

  if (started) {    
    stepper.runSpeed();
  }
}

void startRotating(bool cw, int mins) {
  stepper.setSpeed(4096.0 / (mins * 60.0) * (cw ? 1 : -1));
  started = true;
}

void stopRotating() {
  stepper.stop();
  stepper.disableOutputs();
  started = false;
}
