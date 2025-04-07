
export enum Motors {
  MOTOR0 = 'Motor 0',
  MOTOR1 = 'Motor 1',
  MOTOR2 = 'Motor 2',
  MOTOR3 = 'Motor 3',
}
export const DEFAULT_MOTORS: { [key: string]: number } = {
  [Motors.MOTOR0]: 0,
  [Motors.MOTOR1]: 0,
  [Motors.MOTOR2]: 0,
  [Motors.MOTOR3]: 0,
};

export enum MotorView {
  VELOCITY = 'Velocity',
  POWER = 'Power',
}

export enum Servos {
  SERVO0 = 'Servo 0',
  SERVO1 = 'Servo 1',
  SERVO2 = 'Servo 2',
  SERVO3 = 'Servo 3',
}

export type ServoType = {
  name: Servos;
  value: number;
  enable: boolean;

}

export const DEFAULT_SERVOS: ServoType[] = [
  { name: Servos.SERVO0, value: 1024, enable: false },
  { name: Servos.SERVO1, value: 1024, enable: false },
  { name: Servos.SERVO2, value: 1024, enable: false },
  { name: Servos.SERVO3, value: 1024, enable: false },

];
export enum AnalogSensors {
  ANALOG0 = 'Analog 0',
  ANALOG1 = 'Analog 1',
  ANALOG2 = 'Analog 2',
  ANALOG3 = 'Analog 3',
  ANALOG4 = 'Analog 4',
  ANALOG5 = 'Analog 5',
}
export const DEFAULT_ANALOG_SENSORS: { [key: string]: number } = {
  [AnalogSensors.ANALOG0]: 0,
  [AnalogSensors.ANALOG1]: 0,
  [AnalogSensors.ANALOG2]: 0,
  [AnalogSensors.ANALOG3]: 0,
  [AnalogSensors.ANALOG4]: 0,
  [AnalogSensors.ANALOG5]: 0,
};
export enum DigitalSensors {
  DIGITAL0 = 'Digital 0',
  DIGITAL1 = 'Digital 1',
  DIGITAL2 = 'Digital 2',
  DIGITAL3 = 'Digital 3',
  DIGITAL4 = 'Digital 4',
  DIGITAL5 = 'Digital 5',
  DIGITAL6 = 'Digital 6',
  DIGITAL7 = 'Digital 7',
  DIGITAL8 = 'Digital 8',
  DIGITAL9 = 'Digital 9',
}

export const DEFAULT_DIGITAL_SENSORS: { [key: string]: number } = {
  [DigitalSensors.DIGITAL0]: 0,
  [DigitalSensors.DIGITAL1]: 0,
  [DigitalSensors.DIGITAL2]: 0,
  [DigitalSensors.DIGITAL3]: 0,
  [DigitalSensors.DIGITAL4]: 0,
  [DigitalSensors.DIGITAL5]: 0,
  [DigitalSensors.DIGITAL6]: 0,
  [DigitalSensors.DIGITAL7]: 0,
  [DigitalSensors.DIGITAL8]: 0,
  [DigitalSensors.DIGITAL9]: 0,
};

export enum AccelerometerSensors {
  ACCELEROMETERX = 'Accelerometer X',
  ACCELEROMETERY = 'Accelerometer Y',
  ACCELEROMETERZ = 'Accelerometer Z',
}

export const DEFAULT_ACCELEROMETER_SENSORS: { [key: string]: number } = {
  [AccelerometerSensors.ACCELEROMETERX]: 0,
  [AccelerometerSensors.ACCELEROMETERY]: 0,
  [AccelerometerSensors.ACCELEROMETERZ]: 0,
};

export enum GyroscopeSensors {
  GYROSCOPEX = 'Gyroscope X',
  GYROSCOPEY = 'Gyroscope Y',
  GYROSCOPEZ = 'Gyroscope Z',
}

export const DEFAULT_GYROSCOPE_SENSORS: { [key: string]: number } = {
  [GyroscopeSensors.GYROSCOPEX]: 0,
  [GyroscopeSensors.GYROSCOPEY]: 0,
  [GyroscopeSensors.GYROSCOPEZ]: 0,
}

export enum MagnetometerSensors {
  MAGNETOMETERX = 'Magnetometer X',
  MAGNETOMETERY = 'Magnetometer Y',
  MAGNETOMETERZ = 'Magnetometer Z',
}

export const DEFAULT_MAGNETOMETER_SENSORS: { [key: string]: number } = {
  [MagnetometerSensors.MAGNETOMETERX]: 0,
  [MagnetometerSensors.MAGNETOMETERY]: 0,
  [MagnetometerSensors.MAGNETOMETERZ]: 0,
}

export type Sensors = {
  analogs: AnalogSensors;
  digitals: DigitalSensors;
  accelerometers: AccelerometerSensors;
  gyroscopes: GyroscopeSensors;
  magnetometers: MagnetometerSensors;
  button: number;
}

export const DEFAULT_SENSORS: {
  analogs: { [key: string]: number };
  digitals: { [key: string]: number };
  accelerometers: { [key: string]: number };
  gyroscopes: { [key: string]: number };
  magnetometers: { [key: string]: number };
  button: number;
} = {
  analogs: DEFAULT_ANALOG_SENSORS,
  digitals: DEFAULT_DIGITAL_SENSORS,
  accelerometers: DEFAULT_ACCELEROMETER_SENSORS,
  gyroscopes: DEFAULT_GYROSCOPE_SENSORS,
  magnetometers: DEFAULT_MAGNETOMETER_SENSORS,
  button: 0,

};