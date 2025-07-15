
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
  ANALOG0 = 'analog(0)',
  ANALOG1 = 'analog(1)',
  ANALOG2 = 'analog(2)',
  ANALOG3 = 'analog(3)',
  ANALOG4 = 'analog(4)',
  ANALOG5 = 'analog(5)',
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
  DIGITAL0 = 'digital(0)',
  DIGITAL1 = 'digital(1)',
  DIGITAL2 = 'digital(2)',
  DIGITAL3 = 'digital(3)',
  DIGITAL4 = 'digital(4)',
  DIGITAL5 = 'digital(5)',
  DIGITAL6 = 'digital(6)',
  DIGITAL7 = 'digital(7)',
  DIGITAL8 = 'digital(8)',
  DIGITAL9 = 'digital(9)',
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
  ACCELEROMETERX = 'accel_x()',
  ACCELEROMETERY = 'accel_y()',
  ACCELEROMETERZ = 'accel_z()',
}

export const DEFAULT_ACCELEROMETER_SENSORS: { [key: string]: number } = {
  [AccelerometerSensors.ACCELEROMETERX]: 0,
  [AccelerometerSensors.ACCELEROMETERY]: 0,
  [AccelerometerSensors.ACCELEROMETERZ]: 0,
};

export enum GyroscopeSensors {
  GYROSCOPEX = 'gyro_x()',
  GYROSCOPEY = 'gyro_y()',
  GYROSCOPEZ = 'gyro_z()',
}

export const DEFAULT_GYROSCOPE_SENSORS: { [key: string]: number } = {
  [GyroscopeSensors.GYROSCOPEX]: 0,
  [GyroscopeSensors.GYROSCOPEY]: 0,
  [GyroscopeSensors.GYROSCOPEZ]: 0,
}

export enum MagnetometerSensors {
  MAGNETOMETERX = 'magneto_x()',
  MAGNETOMETERY = 'magneto_y()',
  MAGNETOMETERZ = 'magneto_z()',
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
  Button: number;
}

export type SensorValue =
  | AnalogSensors
  | DigitalSensors
  | AccelerometerSensors
  | GyroscopeSensors
  | MagnetometerSensors
  | "Button";



export type SensorValues = {
  Analogs: { [key: string]: number };
  Digitals: { [key: string]: number };
  Accelerometers: { [key: string]: number };
  Gyroscopes: { [key: string]: number };
  Magnetometers: { [key: string]: number };
  Button: number;
}
export type SensorSelection = {
  Analog: "Analog";
  Digital: "Digital";
  Accelerometer: "Accelerometer";
  Gyroscope: "Gyroscope";
  Magnetometer: "Magnetometer";
  Button: "Button";
}

export type SensorSelectionKey = keyof SensorSelection;

export const DEFAULT_SENSORS: {
  Analogs: { [key: string]: number };
  Digitals: { [key: string]: number };
  Accelerometers: { [key: string]: number };
  Gyroscopes: { [key: string]: number };
  Magnetometers: { [key: string]: number };
  Button: number;
} = {
  Analogs: DEFAULT_ANALOG_SENSORS,
  Digitals: DEFAULT_DIGITAL_SENSORS,
  Accelerometers: DEFAULT_ACCELEROMETER_SENSORS,
  Gyroscopes: DEFAULT_GYROSCOPE_SENSORS,
  Magnetometers: DEFAULT_MAGNETOMETER_SENSORS,
  Button: 0,

};

export type MotorVelocities = {
  [key in Motors]?: number;
}

export type MotorPositions = {
  [key in Motors]?: number;
}
export type ServoPositions = {
  [key in Servos]?: number;
}
export type GraphTypes = {
  MotorVelocities?: MotorVelocities;
  MotorPositions?: MotorPositions;


}

export type GraphSelection = {
  MotorVelocities: "Motor Velocities";
  MotorPositions: "Motor Positions";
  ServoGraphs: "ServoGraphs";
  AnalogGraphs: "AnalogGraphs";
  DigitalGraphs: "DigitalGraphs";
  AccelerometerGraphs: "AccelerometerGraphs";
  GyroscopeGraphs: "GyroscopeGraphs";
  MagnetometerGraphs: "MagnetometerGraphs";
  ButtonGraphs: "ButtonGraphs";
}

export type GraphSelectionKey = keyof GraphSelection;