import * as React from 'react';
import tr from './i18n';
import LocalizedString from './util/LocalizedString';
import { ThemeProps } from './theme';
import { StyleProps } from './style';
import { styled } from 'styletron-react';
import { Fa } from "./components/Fa";
import { Motors, Servos, ServoPositions, SensorSelectionKey, MotorView, MotorVelocities, MotorPositions, ServoType, SensorValues, DEFAULT_SENSORS, DEFAULT_MOTORS, GraphTypes, GraphSelectionKey, DEFAULT_SERVOS, AnalogSensors, DigitalSensors, Sensors, SensorValue } from './types/motorServoSensorTypes';
import DynamicGauge from './components/DynamicGauge';
import ComboBox from './components/ComboBox';
import ResizeableComboBox from './components/ResizeableComboBox';
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import SensorWidget from './components/SensorWidget';


export interface MotorServoSensorDisplayProps extends ThemeProps, StyleProps {

    propedSensorValues?: SensorValues;
    propedAnalogValues?: number;
    propedDigitalValues?: number;
    propedAccelValues?: number;
    propedGyroValues?: number;
    propedMagnetoValues?: number;
    propedButtonValues?: number;


    propedMotorVelocities?: MotorVelocities;
    propedMotorPositions?: MotorPositions;
    propedServoPositions?: ServoType[];
    propedProgramRunning?: boolean;
    storeMotorPositions: (view: 'Power' | 'Velocity', motorPositions: { [key: string]: number }) => void;
    getMotorPositions: () => { [key: string]: number };
    storeServoPositions: (servoPositions: ServoType[]) => void;
    getServoPositions: () => ServoType[];
    stopMotor: (motor: Motors) => void;
    stopAllMotors: () => void;
    sensorDisplayShown: (visible: boolean) => void;
    sensorSelections: (selectedSensors: SensorSelectionKey[]) => void;
    graphSelections: (selectedGraphs: GraphSelectionKey[]) => void;
    //enableServo: (servo: Servos, enable: boolean | undefined) => void;
}
interface SectionProps {
    selected?: boolean;
}
interface MotorServoSensorDisplayReduxSideLayoutProps {

    locale: LocalizedString.Language;
}

interface MotorServoSensorDisplayPrivateProps {
    locale: LocalizedString.Language;
}

interface MotorServoSensorDisplayState {
    selectedSection: "Motor" | "Servo" | "Sensor";

    shownMotor: Motors;
    shownMotorValue: number;
    motorPositions: { [key: string]: number };
    shownMotorView: MotorView;
    motorMinValue: number;
    motorMaxValue: number;
    motorSubArcs: { limit: number, color: string, tooltip?: { text: string } }[];

    shownServo: Servos;
    shownServoValue: number;
    servoPositions: ServoType[];
    servoMinValue: number;
    servoMaxValue: number;
    servoSubArcs: { limit: number, color: string, tooltip?: { text: string } }[];

    sensorValues: {
        Analogs: { [key: string]: number };
        Digitals: { [key: string]: number };
        Accelerometers: { [key: string]: number };
        Gyroscopes: { [key: string]: number };
        Magnetometers: { [key: string]: number };
        Button: number;
    };

    selectedSensors: SensorSelectionKey[] | null;
    customTickValueConfig?: {};
    customTickLineConfig?: {};

    selectedGraphs: GraphSelectionKey[];

    //selectedSensorGraphs: (keyof AnalogSensors)[] | (keyof DigitalSensors)[];
    selectedSensorGraphs: SensorValue[];
    selectedMotorGraphs: (keyof MotorVelocities)[];



}
interface ClickProps {
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
}

type Props = MotorServoSensorDisplayProps & MotorServoSensorDisplayPrivateProps;
type State = MotorServoSensorDisplayState;

const MotorServoSensorContainer = styled('div', (props: ThemeProps) => ({


    left: '4%',
    height: '100%',
    width: '100%',
    margin: '5px',
    zIndex: 1,
    paddingBottom: '10px',

}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({

    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    border: `3px solid ${props.theme.borderColor}`,
    minHeight: '100%',
    height: 'auto',
    marginBottom: '6px',
}));

const SidePanel = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    //backgroundColor: 'blue',
    flexWrap: 'wrap',
    //flex: '1 0 0',
    left: '3.5%',
    top: '6%',
    zIndex: 1,
    //overflow: 'scroll',
    width: 'auto',
    height: '100%'
}));

const StyledComboBox = styled(ComboBox, {
    flex: '1 0',
    padding: '3px',

});

const StyledResizeableComboBox = styled(ResizeableComboBox, {
    flex: '1 0',
    padding: '3px',

});


const SettingContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    padding: `${props.theme.itemPadding * 1}px`,
}));

const SensorTypeContainer = styled('div', (props: ThemeProps) => ({
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: 'auto',
    gap: '5px',
    alignItems: 'start',
    alignContent: 'center',
    justifyContent: 'center',
    //borderBottom: `1px solid ${props.theme.borderColor}`,


}));

const SensorContainer = styled('div', (props: ThemeProps & { selected?: boolean }) => ({
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'space-between',
    height: '40%',
    justifyContent: 'flex-start',
    ':hover': {
        cursor: 'pointer',
        backgroundColor: props.theme.hoverOptionBackground
    },
    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,

    //  padding: '3px',
}));

const GraphTypeContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingBottom: '5%',
    marginBottom: '5%',

    alignContent: 'center',
    justifyContent: 'center',
    //borderBottom: `1px solid ${props.theme.borderColor}`,

}));

const SelectedGraphTypeContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',

    paddingBottom: '1%',

    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    //borderBottom: `1px solid ${props.theme.borderColor}`,

}));

const SubGraphTypeDropDownContainer = styled('span', (props: ThemeProps & { selected?: boolean }) => ({


    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,

    boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
    transition: 'background-color 0.2s, opacity 0.2s',
    paddingRight: '5px',
    paddingBottom: '5%',
    fontWeight: 500,
    fontSize: '1.44em',
    width: '98%',
    padding: '10px'
}));



const GraphTypeDropDownContainer = styled('span', (props: ThemeProps & { selected: boolean }) => ({


    ':hover': {
        cursor: 'pointer',
        backgroundColor: props.theme.hoverOptionBackground
    },
    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,

    boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
    transition: 'background-color 0.2s, opacity 0.2s',
    paddingRight: '5px',
    fontWeight: 500,
    fontSize: '1.44em',
    width: '100%',
    padding: '3%',

}));

const GraphContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'space-between',
    height: '20%',
    width: '100%',
    justifyContent: 'flex-start',
    //  padding: '3px',
}));
const ContainerSeparator = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
    borderBottom: `1px solid ${props.theme.borderColor}`,

}));



const ViewContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `2px`,
    width: '10em',



}));
const Row = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    flexBasis: 0,
    alignItems: 'center',
    marginBottom: `${props.theme.itemPadding * 2}px`,
    ':last-child': {
        marginBottom: 0
    }
}));
const DropIcon = styled(Fa, {
    position: 'relative',
    width: '15px',
    left: '2%',
    top: '50%',

});

const SectionTitleContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',

    padding: `${props.theme.itemPadding * 1}px`,
    width: '100%',
}));

const ControlContainer = styled('div', {
    display: 'flex',
    flexDirection: 'row',
    //flex: '1 0',
    alignItems: 'center',
    justifyContent: 'space-between',

    height: '2.5em'
});
const SectionInfoText = styled('span', {
    paddingRight: '5px',
    fontSize: '1.2em',
});
const SectionText = styled('span', {
    paddingRight: '5px',
    fontSize: '1.2em'

});

const SectionTitleText = styled('span', (props: ThemeProps & { selected: boolean }) => ({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'center',
    ':hover': {
        cursor: 'pointer',
        backgroundColor: props.theme.hoverOptionBackground
    },
    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
    boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
    transition: 'background-color 0.2s, opacity 0.2s',
    paddingRight: '3%',
    fontWeight: 500,
    fontSize: '1.44em',
    width: '100%',
}));





const SettingInfoSubtext = styled(SectionInfoText, {
    fontSize: '10pt',
});
const Button = styled('button', {
    margin: '0 10px',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
});


const SectionName = styled('span', (props: ThemeProps & SectionProps & { selected: boolean }) => ({
    ':hover': {
        cursor: 'pointer',
        backgroundColor: props.theme.hoverOptionBackground
    },
    width: '100%',
    fontSize: '1.44em',

    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
    boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : '0px 10px 13px -6px rgba(255, 105, 180, 0.1), 0px 1px 31px 0px rgba(135, 206, 250, 0.08), 0px 8px 38px 7px rgba(144, 238, 144, 0.1)',

    transition: 'background-color 0.2s, opacity 0.2s',
    padding: `5px`,
    fontWeight: props.selected ? 400 : undefined,
    userSelect: 'none',
}));


const MotorStopButton = styled(Button, (props: ThemeProps & ClickProps) => ({

    backgroundColor: !props.disabled ? props.theme.noButtonColor.standard : 'lightgrey',
    border: !props.disabled ? `1px solid ${props.theme.noButtonColor.border}` : '1px solid lightgrey',
    ':hover':
        props.onClick && !props.disabled
            ? {
                pointer: 'cursor',
                backgroundColor: props.theme.noButtonColor.hover
            }
            : { pointer: 'not-allowed' },
    color: props.theme.noButtonColor.textColor,
    fontSize: '1.2em',
    fontWeight: 500,
    textShadow: props.theme.noButtonColor.textShadow,
    boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
    ':active': props.onClick && !props.disabled
        ? {
            boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            transform: 'translateY(1px, 1px)',
        }
        : {},
}));
const StopButton = styled(Button, (props: ThemeProps & ClickProps) => ({
    backgroundColor: !props.disabled ? props.theme.noButtonColor.standard : 'lightgrey',
    border: !props.disabled ? `1px solid ${props.theme.noButtonColor.border}` : '1px solid lightgrey',
    ':hover':
        props.onClick && !props.disabled
            ? {
                backgroundColor: props.theme.noButtonColor.hover,
            }
            : {},
    color: props.theme.noButtonColor.textColor,
    fontSize: '1.2em',
    fontWeight: 500,
    textShadow: props.theme.noButtonColor.textShadow,
    boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
    ':active': props.onClick && !props.disabled
        ? {
            boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            transform: 'translateY(1px, 1px)',
        }
        : {},
}));

const EnableButton = styled(Button, (props: ThemeProps & ClickProps & { $enabled?: boolean }) => ({
    backgroundColor: props.$enabled ? props.theme.noButtonColor.standard : props.theme.yesButtonColor.standard,
    border: props.$enabled ? `1px solid ${props.theme.noButtonColor.border}` : `1px solid ${props.theme.yesButtonColor.border}`,
    ':hover':
        props.onClick && !props.disabled
            ? {
                backgroundColor: props.$enabled ? props.theme.noButtonColor.hover : props.theme.yesButtonColor.hover,
            }
            : {},
    color: props.$enabled ? props.theme.noButtonColor.textColor : props.theme.yesButtonColor.textColor,
    fontSize: '1.2em',
    fontWeight: 500,
    textShadow: props.$enabled ? props.theme.noButtonColor.textShadow : props.theme.yesButtonColor.textShadow,
    boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
    ':active': props.onClick && !props.disabled
        ? {
            boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
            transform: 'translateY(1px, 1px)',
        }
        : {},
}));
const MOTOR_OPTIONS: ComboBox.Option[] = (() => {

    const ret: ComboBox.Option[] = [];
    for (const motor of Object.values(Motors)) {
        console.log("Motor: ", motor);
        ret.push(ComboBox.option(motor, motor));
    }
    return ret;
})();
const SERVO_OPTIONS: ComboBox.Option[] = (() => {

    const ret: ComboBox.Option[] = [];
    for (const servo of Object.values(Servos)) {
        console.log("servo: ", servo);
        ret.push(ComboBox.option(servo, servo));
    }
    return ret;
})();
const VIEW_OPTIONS: ComboBox.Option[] = (() => {

    const ret: ComboBox.Option[] = [];
    for (const view of Object.values(MotorView)) {
        console.log("view: ", view);
        ret.push(ComboBox.option(view, view));
    }
    return ret;
})();
export class MotorServoSensorDisplay extends React.PureComponent<Props & MotorServoSensorDisplayReduxSideLayoutProps, State> {
    private newMotorRef: React.MutableRefObject<Motors | undefined>;
    constructor(props: Props & MotorServoSensorDisplayReduxSideLayoutProps) {
        super(props);

        this.state = {
            selectedSection: "Motor",
            shownMotor: Motors.MOTOR0,
            shownMotorValue: 0,
            motorPositions: DEFAULT_MOTORS,
            shownMotorView: MotorView.VELOCITY,

            motorMinValue: -1500,
            motorMaxValue: 1500,
            motorSubArcs: [
                {
                    limit: 0,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Reverse'
                    }
                },
                {
                    limit: 1500,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    tooltip: {
                        text: 'Forward'
                    }
                }
            ],
            shownServo: Servos.SERVO0,
            shownServoValue: 0,
            servoPositions: [
                {
                    name: Servos.SERVO0,
                    value: 1024,
                    enable: false,
                },
                {
                    name: Servos.SERVO1,
                    value: 1024,
                    enable: false,
                },
                {
                    name: Servos.SERVO2,
                    value: 1024,
                    enable: false,
                },
                {
                    name: Servos.SERVO3,
                    value: 1024,
                    enable: false,
                }
            ],
            servoMinValue: 0,
            servoMaxValue: 2047,
            servoSubArcs: [
                {
                    limit: 100,
                    //color: '#AD4C4B'
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Warning! Could damage servo in this range'
                    }
                },
                {
                    limit: 1947,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                },
                {
                    limit: 2047,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Warning! Could damage servo in this range'
                    }
                }
            ],
            sensorValues: DEFAULT_SENSORS,
            selectedSensors: [],
            customTickValueConfig: {
                style: { fontSize: '1.2em', fill: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000' },
            },
            customTickLineConfig: {
                color: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000',
                length: 11
            },
            selectedGraphs: [],
            selectedMotorGraphs: [],
            selectedSensorGraphs: [],
        };
        this.newMotorRef = React.createRef<Motors | undefined>();

    }



    async componentDidMount(): Promise<void> {
        console.log("IVYGATE MOTOSERVOSENSORDISPLAY MOUNTED");

        console.log("MotorServoSensorDisplay props: ", this.props);
        console.log("MotorServoSensorDisplay state: ", this.state);

        this.newMotorRef.current = Motors.MOTOR0;

        console.log("newMotorRef: ", this.newMotorRef.current);

        console.log("MotorServoSensorDisplay compDidMount this.props.getMotorPositions(): ", this.props.getMotorPositions());
        if (this.props.getMotorPositions() !== undefined) {
            this.setState({
                motorPositions: this.props.getMotorPositions(),
            }, () => {
                console.log("MotorServoSensorDisplay compDidMount NEW this.state.motorPositions: ", this.state.motorPositions);
            });
        }

        console.log("MotorServoSensorDisplay compDidMount this.props.getServoPositions(): ", this.props.getServoPositions());
        if (this.props.getServoPositions() !== undefined) {
            this.setState({
                servoPositions: this.props.getServoPositions(),
            }, () => {
                console.log("MotorServoSensorDisplay compDidMount NEW this.state.servoPositions: ", this.state.servoPositions);
            });

        }
    }

    componentWillUnmount(): void {
        console.log("MotorServoSensorDisplay UNMOUNTED");
        this.props.sensorDisplayShown(false);
    }

    async componentDidUpdate(prevProps: Props, prevState: State): Promise<void> {
        console.log("MotorServoSensorDisplay compDidUpdate prevProps: ", prevProps);
        console.log("MotorServoSensorDisplay compDidUpdate props: ", this.props);
        console.log("MotorServoSensorDisplay compDidUpdate prevState: ", prevState);
        console.log("MotorServoSensorDisplay compDidUpdate state: ", this.state);


        if (prevProps.propedServoPositions !== this.props.propedServoPositions) {
            console.log("MotorServoSensorDisplay compDidUpdate props propedServoPositions CHANGED from: ", prevProps.propedServoPositions, "to: ", this.props.propedServoPositions);
            this.setState({
                servoPositions: this.props.propedServoPositions,
            }, () => {
                console.log("MotorServoSensorDisplay compDidUpdate NEW this.state.servoPositions: ", this.state.servoPositions);
            });
        }
        if (prevProps.propedProgramRunning !== this.props.propedProgramRunning) {

            console.log("MotorServoSensorDisplay compDidUpdate props propedProgramRunning CHANGED from: ", prevProps.propedProgramRunning, "to: ", this.props.propedProgramRunning);


        }

        if (prevState.selectedSensors !== this.state.selectedSensors) {
            console.log("MotorServoSensorDisplay compDidUpdate state selectedSensors CHANGED from: ", prevState.selectedSensors);
            console.log("MotorServoSensorDisplay compDidUpdate state selectedSensors CHANGED to: ", this.state.selectedSensors);


        }
        if (prevProps.propedSensorValues !== this.props.propedSensorValues) {
            console.log("MotorServoSensorDisplay compDidUpdate props propedSensorValues CHANGED from: ", prevProps.propedSensorValues, "to: ", this.props.propedSensorValues);

        }
        if (prevProps.theme !== this.props.theme) {
            console.log("MotorServoSensorDisplay compDidUpdate props theme CHANGED from: ", prevProps.theme);
            let newMotorSubArcs = [];
            if (this.state.shownMotorView === MotorView.VELOCITY) {
                newMotorSubArcs = [{
                    limit: 0,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Reverse'
                    }
                },
                {
                    limit: 1500,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    tooltip: {
                        text: 'Forward'
                    }
                }];
            }
            else if (this.state.shownMotorView === MotorView.POWER) {

                newMotorSubArcs = [{
                    limit: 0,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Reverse'
                    }
                },
                {
                    limit: 100,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    tooltip: {
                        text: 'Forward'
                    }
                }];
            }




            this.setState({
                motorSubArcs: newMotorSubArcs,
                servoSubArcs: [
                    {
                        limit: 100,
                        //color: '#AD4C4B'
                        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                        tooltip: {
                            text: 'Warning! Could damage servo in this range'
                        }
                    },
                    {
                        limit: 1947,
                        color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    },
                    {
                        limit: 2047,
                        color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                        tooltip: {
                            text: 'Warning! Could damage servo in this range'
                        }
                    }

                ],
                customTickValueConfig: {
                    style: { fontSize: '1.2em', fill: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000' },
                },
                customTickLineConfig: {
                    color: this.props.theme.themeName === 'DARK' ? '#FFFFFF' : '#000000',
                    length: 11
                }
            })
        }
        if (prevState.shownServoValue !== this.state.shownServoValue) {
            console.log("MotorServoSensorDisplay compDidUpdate state shownServoValue CHANGED from: ", prevState.shownServoValue);
            console.log("MotorServoSensorDisplay compDidUpdate state shownServoValue CHANGED to: ", this.state.shownServoValue);

            this.setState({
                shownServoValue: this.state.shownServoValue,
            })
        }
        if (prevState.motorPositions !== this.state.motorPositions) {
            console.log("MotorServoSensorDisplay compDidUpdate state motorPositions CHANGED from: ", prevState.motorPositions);
            console.log("MotorServoSensorDisplay compDidUpdate state motorPositions CHANGED to: ", this.state.motorPositions);

            this.setState({
                shownMotorValue: this.state.motorPositions[this.state.shownMotor],
            })
        }
        if (prevState.shownMotor !== this.state.shownMotor) {
            console.log("MotorServoSensorDisplay compDidUpdate state shownMotor: ", this.state.shownMotor);
            console.log("MotorServoSensorDisplay compDidUpdate state shownMotorValue: ", this.state.shownMotorValue);
            console.log("MotorServoSensorDisplay compDidUpdate state motorPositions: ", this.state.motorPositions);

        }

        if (prevState.shownMotorValue !== this.state.shownMotorValue) {
            console.log("MotorServoSensorDisplay compDidUpdate state shownMotorValue: ", this.state.shownMotorValue);
        }

    }

    private setSensorSelection(section: 'Analog' | 'Digital' | 'Accelerometer' | 'Gyroscope' | 'Magnetometer' | 'Button') {
        console.log("setSensorSelection: ", section);
        const { selectedSensors } = this.state;
        if (selectedSensors && selectedSensors.includes(section)) {

            const updated = selectedSensors.filter(s => s !== section);
            this.setState({
                selectedSensors: updated.length > 0 ? updated : [],
            }, () => {
                this.props.sensorSelections(this.state.selectedSensors);
            });
        } else {

            const updated = [...(selectedSensors || []), section];
            this.setState({
                selectedSensors: updated,
            }, () => {
                this.props.sensorSelections(this.state.selectedSensors);
            });
        }
    };

    private onMotorSelect_ = (index: number, option: ComboBox.Option) => {
        console.log("Motor selected: ", option.data);

        this.newMotorRef.current = option.data as Motors;
        console.log("onMotorSelect_ newMotorRef: ", this.newMotorRef.current);
        console.log("onMotorSelect_ this.state.motorPositions[option.data]: ", this.state.motorPositions[option.data as Motors]);

        if (this.state.shownMotor !== option.data) {
            console.log("if this.state.shownMotor");
            this.setState({
                shownMotor: option.data as Motors,
                shownMotorValue: this.state.motorPositions[option.data as Motors],
            });

        }
    };

    private onServoSelect_ = (index: number, option: ComboBox.Option) => {

        console.log("Servo selected: ", option.data);

        this.setState((prevState) => {
            const selectedServo = option.data as Servos;

            // Find the corresponding servo object in the array
            const servoObj = prevState.servoPositions.find(servo => servo.name === selectedServo);

            return {
                shownServo: selectedServo,
                shownServoValue: servoObj ? servoObj.value : 1024, // Default to 0 if not found
            };
        });
    };

    private onMotorViewSelect_ = (index: number, option: ComboBox.Option) => {
        console.log("Motor view selected: ", option.data);

        if (this.state.shownMotorView !== option.data) {
            let newMotorLimits = { motorMinValue: 0, motorMaxValue: 0 };
            let newMotorSubArcs = [];
            if (option.data === MotorView.VELOCITY) {
                newMotorLimits = { motorMinValue: -1500, motorMaxValue: 1500 };
                newMotorSubArcs = [{
                    limit: 0,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Reverse'
                    }
                },
                {
                    limit: 1500,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    tooltip: {
                        text: 'Forward'
                    }
                }];
            }
            else if (option.data === MotorView.POWER) {
                newMotorLimits = { motorMinValue: -100, motorMaxValue: 100 };
                newMotorSubArcs = [{
                    limit: 0,
                    color: this.props.theme.themeName === 'DARK' ? '#AD4C4B' : '#FF4E4E',
                    tooltip: {
                        text: 'Reverse'
                    }
                },
                {
                    limit: 100,
                    color: this.props.theme.themeName === 'DARK' ? '#4aad52' : '#2BDE3F',
                    tooltip: {
                        text: 'Forward'
                    }
                }];
            }
            this.setState({
                motorMinValue: newMotorLimits.motorMinValue,
                motorMaxValue: newMotorLimits.motorMaxValue,
                motorSubArcs: newMotorSubArcs,
                shownMotorView: option.data as MotorView,
            });
        }
    };
    private onMotorChange_ = (value: number) => {
        console.log("Motor value: ", value, "for Motor: ", this.newMotorRef.current);
        if (this.newMotorRef.current) {
            this.setState({
                motorPositions: {
                    ...this.state.motorPositions,
                    [this.newMotorRef.current]: value,
                },
                shownMotorValue: value,

            }, () => {
                this.props.storeMotorPositions(this.state.shownMotorView, this.state.motorPositions);
            });
        }
    };

    private setMotorGraphSelection = (motorSelection: Motors) => {
        console.log("setMotorGraphSelection: ", motorSelection);
        this.setState(prevState => ({
            selectedMotorGraphs: [...prevState.selectedMotorGraphs, motorSelection]
        }), () => {
            console.log("setGraphSelection selectedGraphs: ", this.state.selectedMotorGraphs);
        });
    };

    private setGraphSelection = (graph: GraphSelectionKey) => {
        console.log("setGraphSelection: ", graph);
        const { selectedGraphs } = this.state;

        this.setState({
            selectedGraphs: selectedGraphs.includes(graph) ? selectedGraphs.filter(g => g !== graph) : [...selectedGraphs, graph],
        }, () => {
            this.props.graphSelections(this.state.selectedGraphs);
            console.log("setGraphSelection selectedGraphs: ", this.state.selectedGraphs);
        })

    };

    private setSensorGraphSelection = (sensorSelection: SensorValue) => {
        console.log("setSensorGraphSelection: ", sensorSelection);
        this.setState({
            selectedSensorGraphs: this.state.selectedSensorGraphs.includes(sensorSelection) ? this.state.selectedSensorGraphs.filter(g => g !== sensorSelection) : [...this.state.selectedSensorGraphs, sensorSelection],
        }, () => {
            console.log("setGraphSelection selectedSensorGraphs: ", this.state.selectedSensorGraphs);
        })

    }

    private onServoChange_ = (value: number) => {
        console.log("Servo value: ", value, "for Servo: ", this.state.shownServo);

        this.setState((prevState) => {
            const updatedServoPositions = prevState.servoPositions.map((servo) =>
                servo.name === prevState.shownServo ? { ...servo, value } : servo
            );

            return {
                servoPositions: updatedServoPositions,
                shownServoValue: value,
            };
        }, () => {
            console.log("After set state servoPositions: ", this.state.servoPositions);
            this.props.storeServoPositions(this.state.servoPositions);
        });
    };

    private flipEnableServo_ = (servo: Servos) => {
        console.log("Flip enable for servo: ", servo);

        this.setState((prevState) => {
            const updatedServoPositions = prevState.servoPositions.map((servoObj) =>
                servoObj.name === servo ? { ...servoObj, enable: !servoObj.enable } : servoObj
            );

            return {
                servoPositions: updatedServoPositions,
            };
        }, () => {
            console.log("After set state servoPositions: ", this.state.servoPositions);
            this.props.storeServoPositions(this.state.servoPositions);
            //this.props.enableServo(servo, this.state.servoPositions.find(servoObj => servoObj.name === servo)?.enable);
        });
    };

    private disableAllServos_ = () => {
        console.log("Disable all servos");
        this.setState((prevState) => {
            const updatedServoPositions = prevState.servoPositions.map((servo) =>
                ({ ...servo, enable: false })
            );

            return {
                servoPositions: updatedServoPositions,
            };
        }, () => {
            console.log("After set state servoPositions: ", this.state.servoPositions);
            this.props.storeServoPositions(this.state.servoPositions);
        });

    };

    private stopAllMotors_ = () => {
        console.log("Stop all motors");
        this.setState({
            motorPositions: {
                [Motors.MOTOR0]: 0,
                [Motors.MOTOR1]: 0,
                [Motors.MOTOR2]: 0,
                [Motors.MOTOR3]: 0,
            },
            shownMotorValue: 0,

        }, () => {
            this.props.storeMotorPositions(this.state.shownMotorView, this.state.motorPositions);
            this.props.stopAllMotors();
        });
    };

    private stopCurrentMotor_ = () => {
        console.log("Stop current motor");
        if (this.newMotorRef.current) {
            this.setState({
                motorPositions: {
                    ...this.state.motorPositions,
                    [this.newMotorRef.current]: 0,
                },
                shownMotorValue: 0,
                //motorRunning: ) ? false : true
            }, () => {
                this.props.storeMotorPositions(this.state.shownMotorView, this.state.motorPositions);
                this.props.stopMotor(this.newMotorRef.current);
            });
        }
    }



    private onSectionSelect_ = (section: "Motor" | "Servo" | "Sensor") => {
        console.log("Section selected: ", section);
        if (section === "Sensor") {
            this.props.sensorDisplayShown(true);

        }
        else {
            this.props.sensorDisplayShown(false);
        }

        if (section === "Servo") {
            console.log("Setting shownServoValue to: ", this.state.servoPositions[0].value);
            this.setState({
                shownServoValue: this.state.servoPositions[0].value,
            })
        }
        this.setState({
            selectedSection: section,
        }, () => {
            //console.log("Section selected: ", this.state.selectedSection);
        })
    };



    renderSensor = (sensor: string) => {
        const {
            theme,
            propedSensorValues,
            propedAnalogValues,
            propedDigitalValues,
            propedAccelValues,
            propedGyroValues,
            propedMagnetoValues,
            propedButtonValues,
            locale
        } = this.props;
        const { selectedGraphs, selectedSensorGraphs } = this.state;
        console.log("renderSensor: ", sensor);
        console.log("renderSensor props: ", this.props);
        switch (sensor) {
            case 'Analog':

                return (
                    <SensorTypeContainer theme={theme}>

                        {Object.entries(this.state.sensorValues.Analogs).map(([key, value], index) => (

                            console.log("Analog key: ", key, " value: ", value),
                            <SelectedGraphTypeContainer theme={theme} >
                                <SubGraphTypeDropDownContainer theme={theme}>
                                    <Row key={`${key}`} theme={theme}>
                                        <SensorWidget
                                            value={propedAnalogValues && propedAnalogValues[index] !== undefined ? propedAnalogValues[index] : value}
                                            name={`${key}`}
                                            plotTitle={LocalizedString.lookup(tr(`${key} Plot`), locale)}
                                            theme={theme}

                                        />
                                    </Row>
                                </SubGraphTypeDropDownContainer>

                            </SelectedGraphTypeContainer>

                        ))}

                    </SensorTypeContainer>


                );
            case 'Digital':
                return (
                    <SensorTypeContainer theme={theme}>
                        {Object.entries(this.state.sensorValues.Digitals).map(([key, value], index) => (
                            <SelectedGraphTypeContainer theme={theme} >
                                <SubGraphTypeDropDownContainer theme={theme}>
                                    <Row key={`${key}`} theme={theme}>
                                        <SensorWidget
                                            value={propedDigitalValues && propedDigitalValues[index] !== undefined ? propedDigitalValues[index] : value}
                                            name={`${key}`}
                                            plotTitle={LocalizedString.lookup(tr(`${key} Plot`), locale)}
                                            theme={theme}

                                        />
                                    </Row>
                                </SubGraphTypeDropDownContainer>

                            </SelectedGraphTypeContainer>

                        ))}
                    </SensorTypeContainer>
                );
            case 'Accelerometer':
                return (<SensorTypeContainer theme={theme}>
                    {Object.entries(this.state.sensorValues.Accelerometers).map(([key, value], index) => (
                        <SelectedGraphTypeContainer theme={theme} >
                            <SubGraphTypeDropDownContainer theme={theme}>
                                <Row key={`${key}`} theme={theme}>
                                    <SensorWidget
                                        value={propedAccelValues && propedAccelValues[index] !== undefined ? propedAccelValues[index] : value}
                                        name={`${key}`}
                                        plotTitle={LocalizedString.lookup(tr(`${key} Plot`), locale)}
                                        theme={theme}

                                    />
                                </Row>
                            </SubGraphTypeDropDownContainer>

                        </SelectedGraphTypeContainer>

                    ))}
                </SensorTypeContainer>
                );
            case 'Gyroscope':
                return (<SensorTypeContainer theme={theme}>
                    {Object.entries(this.state.sensorValues.Gyroscopes).map(([key, value], index) => (
                        <SelectedGraphTypeContainer theme={theme} >
                            <SubGraphTypeDropDownContainer theme={theme}>
                                <Row key={`${key}`} theme={theme}>
                                    <SensorWidget
                                        value={propedGyroValues && propedGyroValues[index] !== undefined ? propedGyroValues[index] : value}
                                        name={`${key}`}
                                        plotTitle={LocalizedString.lookup(tr(`${key} Plot`), locale)}
                                        theme={theme}

                                    />
                                </Row>
                            </SubGraphTypeDropDownContainer>

                        </SelectedGraphTypeContainer>

                    ))}
                </SensorTypeContainer>
                );
            case 'Magnetometer':
                return (<SensorTypeContainer theme={theme}>
                    {Object.entries(this.state.sensorValues.Magnetometers).map(([key, value], index) => (
                        <SelectedGraphTypeContainer theme={theme} >
                            <SubGraphTypeDropDownContainer theme={theme}>
                                <Row key={`${key}`} theme={theme}>
                                    <SensorWidget
                                        value={propedMagnetoValues && propedMagnetoValues[index] !== undefined ? propedMagnetoValues[index] : value}
                                        name={`${key}`}
                                        plotTitle={LocalizedString.lookup(tr(`${key} Plot`), locale)}
                                        theme={theme}

                                    />
                                </Row>
                            </SubGraphTypeDropDownContainer>

                        </SelectedGraphTypeContainer>
                    ))}
                </SensorTypeContainer>);
            case 'Button':
                return (
                <SensorTypeContainer theme={theme}>
                     <SelectedGraphTypeContainer theme={theme} >
                        <SubGraphTypeDropDownContainer theme={theme}>
                            <Row key={'Button'} theme={theme}>
                                <SensorWidget
                                    value={propedButtonValues && propedButtonValues[0] !== undefined ? propedButtonValues[0] : 0}
                                    name={'Button'}
                                    plotTitle={LocalizedString.lookup(tr(`Button Plot`), locale)}
                                    theme={theme}

                                />
                            </Row>
                        </SubGraphTypeDropDownContainer>

                    </SelectedGraphTypeContainer>
                </SensorTypeContainer>
                );


        };
    };

    renderMotorGraphs = (motorGraph: 'MotorVelocities' | 'MotorPositions') => {
        const { selectedGraphs, selectedMotorGraphs, } = this.state;
        const { theme, locale } = this.props;
        const motorVelocities: JSX.Element[] = [];
        const motorPositions: JSX.Element[] = [];
        console.log("renderMotorGraphs props: ", this.props);
        console.log("renderMotorGraphs this.state.motorPositions: ", this.state.motorPositions);


        console.log("renderMotorGraphs state.motorPositions['Motor 0']: ", this.state.motorPositions['Motor 0']);
        console.log("renderMotorGraphs this.props.propedMotorVelocities: ", this.props.propedMotorVelocities);
        console.log("renderMotorGraphs this.props.propedMotorPositions: ", this.props.propedMotorPositions);
        for (let i = 0; i < 4; ++i) {

            motorVelocities.push(
                <Row key={`motor-velocity-${i}`} theme={theme}>
                    <SensorWidget

                        value={this.state.shownMotorView === MotorView.VELOCITY ? (this.props.propedProgramRunning ? this.props.propedMotorVelocities[`Motor ${i}`] : this.state.motorPositions[`Motor ${i}`]) : 0}
                        name={`motor ${i} velocity`}
                        plotTitle={LocalizedString.lookup(tr('Motor Velocity Plot'), locale)}
                        theme={theme}

                    />
                </Row>
            );

            motorPositions.push(
                <Row key={`motor-position-${i}`} theme={theme}>
                    <SensorWidget
                        value={this.props.propedProgramRunning ? this.props.propedMotorPositions[`Motor ${i}`] : this.state.motorPositions[`Motor ${i}`]}
                        name={`get_motor_position_counter(${i})`}
                        plotTitle={LocalizedString.lookup(tr('Motor Position Plot'), locale)}
                        theme={theme}

                    />
                </Row>
            );
        }

        return (
            <SelectedGraphTypeContainer theme={theme} >
                <SubGraphTypeDropDownContainer theme={theme}>
                    {motorGraph === 'MotorVelocities' ? motorVelocities : motorPositions}
                    {/* {motorVelocities} */}
                </SubGraphTypeDropDownContainer>

            </SelectedGraphTypeContainer>
        );
    };

    renderServoGraphs = () => {
        const { selectedGraphs, selectedMotorGraphs, } = this.state;
        const { theme, locale } = this.props;

        const servoPositions: JSX.Element[] = [];
        console.log("renderServoGraphs props: ", this.props);
        console.log("renderServoGraphs this.state: ", this.state);
        console.log("renderServoGraphs this.state.servoPositions: ", this.state.servoPositions);


        let propedServos = this.props.propedServoPositions;
        console.log("renderServoGraphs this.props.propedServoPositions: ", this.props.propedServoPositions);
        for (let i = 0; i < 4; ++i) {
            //console.log("renderServoGraphs this.props.propedServoPositions[i]: ", this.props.propedServoPositions[i].value);
            servoPositions.push(
                <Row key={`servo-position-${i}`} theme={theme}>
                    <SensorWidget
                        value={this.props.propedServoPositions.length < 1 ? 0 : this.props.propedServoPositions[i].value}
                        // name={`get_servo_position(${i}), ${this.state.servoPositions[i].enable ? 'enabled' : 'disabled'}`}
                        name={`get_servo_position(${i}), ${this.props.propedServoPositions.length < 1 ? 'disabled' : this.props.propedServoPositions[i].enable ? 'enabled' : 'disabled'}`}
                        plotTitle={LocalizedString.lookup(tr('Servo Position Plot'), locale)}
                        theme={theme}

                    />
                </Row>
            );
        }

        return (
            <SelectedGraphTypeContainer theme={theme} >
                <SubGraphTypeDropDownContainer theme={theme}>
                    {servoPositions}

                </SubGraphTypeDropDownContainer>

            </SelectedGraphTypeContainer>
        );
    };

    render() {
        const { props } = this;
        const {
            theme,
            locale,

        } = props;

        const {
            selectedSection,
            shownMotor,
            shownMotorValue,
            shownMotorView,
            motorMinValue,
            motorMaxValue,
            motorSubArcs,
            shownServo,
            shownServoValue,
            servoMinValue,
            servoMaxValue,
            servoSubArcs

        } = this.state;

        console.log("MotorServoSensorDisplay render state shownMotorValue: ", shownMotorValue);
        const motorSection = () => {
            const { selectedGraphs } = this.state;
            const { theme } = this.props;
            return (
                <SectionsColumn theme={theme}>

                    <SettingContainer style={{ justifyContent: 'flex-end' }} theme={theme}>
                        <ViewContainer theme={theme}>
                            <SectionInfoText style={{ fontSize: '1.2em' }}>{LocalizedString.lookup(tr('View:'), locale)}</SectionInfoText>
                            <StyledResizeableComboBox
                                options={VIEW_OPTIONS}
                                index={VIEW_OPTIONS.findIndex(opt => opt.data === shownMotorView)}
                                onSelect={this.onMotorViewSelect_}
                                theme={theme}
                                mainWidth={'1em'}
                                mainHeight={'1.2em'}
                                mainFontSize={'1em'}

                            />
                        </ViewContainer>
                    </SettingContainer>


                    <SettingContainer theme={theme}>
                        <ControlContainer >
                            <SectionInfoText style={{ fontSize: '1.44em' }}>{LocalizedString.lookup(tr('Motor Port:'), locale)}</SectionInfoText>
                            <StyledResizeableComboBox
                                options={MOTOR_OPTIONS}
                                index={MOTOR_OPTIONS.findIndex(opt => opt.data === shownMotor)}
                                onSelect={this.onMotorSelect_}
                                theme={theme}
                                mainWidth={'8.3em'}
                                mainHeight={'1.2em'}
                                mainFontSize={'1em'}

                            />
                        </ControlContainer>

                    </SettingContainer>


                    <SettingContainer theme={theme} >
                        <DynamicGauge
                            minValue={motorMinValue}
                            maxValue={motorMaxValue}
                            initialValue={0}
                            theme={theme}
                            margins={{ top: 0.095, bottom: 0.02, left: 0.07, right: 0.07 }}
                            onDialChange={this.onMotorChange_}
                            changeValue={this.state.shownMotorValue}
                            customTickValueConfig={this.state.customTickValueConfig}
                            customTickLineConfig={this.state.customTickLineConfig}
                            subArcs={motorSubArcs}
                        />
                    </SettingContainer>
                    <SettingContainer theme={theme}>
                        <MotorStopButton disabled={!(Object.keys(this.state.motorPositions).some((key) => this.state.motorPositions[key] !== 0))} onClick={() => this.stopAllMotors_()} theme={theme}>
                            {LocalizedString.lookup(tr('Stop All Motors'), locale)}
                        </MotorStopButton>
                        <MotorStopButton disabled={Number(this.state.shownMotorValue) === 0} onClick={() => this.stopCurrentMotor_()} theme={theme} >
                            {LocalizedString.lookup(tr('Stop Current Motor'), locale)}
                        </MotorStopButton>

                    </SettingContainer>

                    <ContainerSeparator style={{ marginTop: '3%' }} theme={theme} />


                    <GraphTypeContainer theme={theme} >
                        <GraphTypeDropDownContainer theme={theme} selected={selectedGraphs.includes('MotorVelocities')} onClick={() => this.setGraphSelection('MotorVelocities')}>
                            {LocalizedString.lookup(tr('Motor Velocities'), this.props.locale)}
                            <DropIcon icon={faCaretDown} />
                        </GraphTypeDropDownContainer>
                        <SelectedGraphTypeContainer theme={theme} >
                            {selectedGraphs.includes('MotorVelocities') && this.renderMotorGraphs('MotorVelocities')}
                        </SelectedGraphTypeContainer>
                        <GraphTypeDropDownContainer theme={theme} selected={selectedGraphs.includes('MotorPositions')} onClick={() => this.setGraphSelection('MotorPositions')}>
                            {LocalizedString.lookup(tr('Motor Positions'), this.props.locale)}
                            <DropIcon icon={faCaretDown} />
                        </GraphTypeDropDownContainer>

                        <SelectedGraphTypeContainer theme={theme} >
                            {selectedGraphs.includes('MotorPositions') && this.renderMotorGraphs('MotorPositions')}
                        </SelectedGraphTypeContainer>
                    </GraphTypeContainer>


                </SectionsColumn>
            );
        };

        const servoSection = () => {
            console.log("Servo section this.state.shownServoValue: ", this.state.shownServoValue);
            const { selectedGraphs } = this.state;
            const { theme } = this.props;
            return (
                <SectionsColumn theme={theme}>
                    <SettingContainer theme={theme}>
                        <ControlContainer style={{ marginTop: '0.9em' }}>
                            <SectionInfoText style={{ fontSize: '1.44em' }}>{LocalizedString.lookup(tr('Servo Port:'), locale)}</SectionInfoText>
                            <StyledResizeableComboBox
                                options={SERVO_OPTIONS}
                                index={SERVO_OPTIONS.findIndex(opt => opt.data === shownServo)}
                                onSelect={this.onServoSelect_}
                                theme={theme}
                                mainWidth={'8.3em'}
                                mainHeight={'1.2em'}
                                mainFontSize={'1em'}

                            />
                        </ControlContainer>

                    </SettingContainer>


                    <SettingContainer theme={theme} >
                        <DynamicGauge
                            minValue={servoMinValue}
                            maxValue={servoMaxValue}
                            initialValue={1024}
                            theme={theme}
                            onDialChange={this.onServoChange_}
                            changeValue={this.props.propedServoPositions.length < 1 ? 1024 : (this.state.servoPositions[parseInt(this.state.shownServo.split(' ')[1])].value)}
                            customTickValueConfig={this.state.customTickValueConfig}
                            customTickLineConfig={this.state.customTickLineConfig}
                            subArcs={servoSubArcs}
                        />
                    </SettingContainer>
                    <SettingContainer theme={theme} style={{ padding: '1px', paddingBottom: '5px', }}>

                        <StopButton disabled={Object.values(this.props.propedServoPositions).every(
                            (servo) => servo.enable === false
                        )} onClick={() => this.disableAllServos_()} theme={theme}>
                            {LocalizedString.lookup(tr('Disable All Servos'), locale)}
                        </StopButton>
                        <EnableButton onClick={() => this.flipEnableServo_(shownServo)} theme={theme} $enabled={this.state.servoPositions.find(servo => servo.name === shownServo)?.enable}>
                            {this.state.servoPositions.find(servo => servo.name === shownServo)?.enable
                                ? LocalizedString.lookup(tr('Disable Servo'), locale)
                                : LocalizedString.lookup(tr('Enable Servo'), locale)}
                        </EnableButton>



                    </SettingContainer>
                    <ContainerSeparator style={{ marginTop: '3%' }} theme={theme} />


                    <GraphTypeContainer theme={theme} >
                        <GraphTypeDropDownContainer theme={theme} selected={selectedGraphs.includes('ServoGraphs')} onClick={() => this.setGraphSelection('ServoGraphs')}>
                            {LocalizedString.lookup(tr('Servo Positions'), this.props.locale)}
                            <DropIcon icon={faCaretDown} />
                        </GraphTypeDropDownContainer>
                        <SelectedGraphTypeContainer theme={theme} >
                            {selectedGraphs.includes('ServoGraphs') && this.renderServoGraphs()}
                        </SelectedGraphTypeContainer>

                    </GraphTypeContainer>


                </SectionsColumn >
            );
        };


        const sensorSection = () => {
            const { theme } = this.props;
            const { selectedSensors } = this.state;
            return (
                console.log("Sensor section selectedSensors: ", selectedSensors),
                <SectionsColumn theme={theme} style={{ paddingBottom: '10px' }}>

                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Analog')}
                            selected={selectedSensors.includes('Analog')}>
                            {LocalizedString.lookup(tr('Analog Sensors'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Analog') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>

                    </SectionTitleContainer>
                    {selectedSensors.includes('Analog') && this.renderSensor('Analog')}

                    <ContainerSeparator theme={theme} />


                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Digital')}
                            selected={selectedSensors.includes('Digital')}>
                            {LocalizedString.lookup(tr('Digital Sensors'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Digital') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>
                    </SectionTitleContainer>
                    {selectedSensors.includes('Digital') && this.renderSensor('Digital')}
                    <ContainerSeparator theme={theme} />
                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Accelerometer')}
                            selected={selectedSensors.includes('Accelerometer')}>
                            {LocalizedString.lookup(tr('Accelerometers'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Accelerometer') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>
                    </SectionTitleContainer>
                    {selectedSensors.includes('Accelerometer') && this.renderSensor('Accelerometer')}
                    <ContainerSeparator theme={theme} />
                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Gyroscope')}
                            selected={selectedSensors.includes('Gyroscope')}>
                            {LocalizedString.lookup(tr('Gyroscopes'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Gyroscope') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>
                    </SectionTitleContainer>
                    {selectedSensors.includes('Gyroscope') && this.renderSensor('Gyroscope')}
                    <ContainerSeparator theme={theme} />
                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Magnetometer')}
                            selected={selectedSensors.includes('Magnetometer')}>
                            {LocalizedString.lookup(tr('Magnetometers'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Magnetometer') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>
                    </SectionTitleContainer>
                    {selectedSensors.includes('Magnetometer') && this.renderSensor('Magnetometer')}
                    <ContainerSeparator theme={theme} />
                    <SectionTitleContainer theme={theme}>
                        <SectionTitleText
                            theme={theme}
                            onClick={() => this.setSensorSelection('Button')}
                            selected={selectedSensors.includes('Button')}>
                            {LocalizedString.lookup(tr('Buttons'), locale)}
                            <DropIcon style={{ top: '0%' }} icon={selectedSensors.includes('Button') ? faCaretUp : faCaretDown} />
                        </SectionTitleText>
                    </SectionTitleContainer>
                    {selectedSensors.includes('Button') && this.renderSensor('Button')}
                    <ContainerSeparator theme={theme} />

                </SectionsColumn>
            );
        };
        return (
            <SidePanel
                theme={theme}
                style={{
                    flex: 1,
                    overflowY: 'scroll',
                }}
            >
                <h2 style={{ marginLeft: '6px', fontSize: '1.728em' }}>Motors, Servos and Sensors</h2>
                <MotorServoSensorContainer theme={theme} style={{ marginBottom: '10px' }}>
                    <SectionName theme={theme} selected={selectedSection === "Motor"} onClick={() => this.onSectionSelect_("Motor")}>
                        Motor
                    </SectionName>
                    <SectionName theme={theme} selected={selectedSection === "Servo"} onClick={() => this.onSectionSelect_("Servo")}>
                        Servo
                    </SectionName>
                    <SectionName theme={theme} selected={selectedSection === "Sensor"} onClick={() => this.onSectionSelect_("Sensor")}>
                        Sensor
                    </SectionName>
                    {selectedSection == "Motor" && motorSection()}
                    {selectedSection == "Servo" && servoSection()}
                    {selectedSection == "Sensor" && sensorSection()}
                </MotorServoSensorContainer>
            </SidePanel >
        );
    }
}

