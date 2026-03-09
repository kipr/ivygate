import LocalizedString from "../src/util/LocalizedString";
import tr from "../src/i18n";
import {
  Motors, MotorView, Servos,
  AnalogSensors, DigitalSensors,
  AccelerometerSensors, GyroscopeSensors, MagnetometerSensors,
} from "../src/types/motorServoSensorTypes";

export const SENSOR_LABEL: Record<string, LocalizedString> = {
  // Motors
  [Motors.MOTOR0]: tr("Motor 0"),
  [Motors.MOTOR1]: tr("Motor 1"),
  [Motors.MOTOR2]: tr("Motor 2"),
  [Motors.MOTOR3]: tr("Motor 3"),

  // Motor views
  [MotorView.VELOCITY]: tr("Velocity"),
  [MotorView.POWER]: tr("Power"),

  // Servos
  [Servos.SERVO0]: tr("Servo 0"),
  [Servos.SERVO1]: tr("Servo 1"),
  [Servos.SERVO2]: tr("Servo 2"),
  [Servos.SERVO3]: tr("Servo 3"),

  // Analog
  [AnalogSensors.ANALOG0]: tr("analog(0)"),
  [AnalogSensors.ANALOG1]: tr("analog(1)"),
  [AnalogSensors.ANALOG2]: tr("analog(2)"),
  [AnalogSensors.ANALOG3]: tr("analog(3)"),
  [AnalogSensors.ANALOG4]: tr("analog(4)"),
  [AnalogSensors.ANALOG5]: tr("analog(5)"),

  // Digital
  [DigitalSensors.DIGITAL0]: tr("digital(0)"),
  [DigitalSensors.DIGITAL1]: tr("digital(1)"),
  [DigitalSensors.DIGITAL2]: tr("digital(2)"),
  [DigitalSensors.DIGITAL3]: tr("digital(3)"),
  [DigitalSensors.DIGITAL4]: tr("digital(4)"),
  [DigitalSensors.DIGITAL5]: tr("digital(5)"),
  [DigitalSensors.DIGITAL6]: tr("digital(6)"),
  [DigitalSensors.DIGITAL7]: tr("digital(7)"),
  [DigitalSensors.DIGITAL8]: tr("digital(8)"),
  [DigitalSensors.DIGITAL9]: tr("digital(9)"),

  // Accelerometer
  [AccelerometerSensors.ACCELEROMETERX]: tr("accel_x()"),
  [AccelerometerSensors.ACCELEROMETERY]: tr("accel_y()"),
  [AccelerometerSensors.ACCELEROMETERZ]: tr("accel_z()"),

  // Gyro
  [GyroscopeSensors.GYROSCOPEX]: tr("gyro_x()"),
  [GyroscopeSensors.GYROSCOPEY]: tr("gyro_y()"),
  [GyroscopeSensors.GYROSCOPEZ]: tr("gyro_z()"),

  // Magnetometer
  [MagnetometerSensors.MAGNETOMETERX]: tr("magneto_x()"),
  [MagnetometerSensors.MAGNETOMETERY]: tr("magneto_y()"),
  [MagnetometerSensors.MAGNETOMETERZ]: tr("magneto_z()"),

  // Button
  Button: tr("right_button()"),
};