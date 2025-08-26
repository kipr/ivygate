import * as React from 'react';
import tr from './i18n';
import LocalizedString from './util/LocalizedString';
import { ThemeProps } from './components/constants/theme';
import { StyleProps } from './components/constants/style';
import { styled } from 'styletron-react';
import { Fa } from "./components/Fa";
import { Motors, Servos, SensorSelectionKey, MotorView, MotorVelocities, MotorPositions, ServoType, SensorValues, DEFAULT_SENSORS, DEFAULT_MOTORS, GraphSelectionKey, SensorValue } from './types/motorServoSensorTypes';
import DynamicGauge from './components/DynamicGauge';
import ComboBox from './components/ComboBox';
import ResizeableComboBox from './components/ResizeableComboBox';
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import SensorWidget from './components/SensorWidget';
import ScrollArea from './components/interface/ScrollArea';


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
    clearMotorPosition(motor: Motors): void;

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
    selectedSensorGraphs: SensorValue[];
    selectedMotorGraphs: (keyof MotorVelocities)[];

    servoInputStyle: React.CSSProperties;
    motorInputStyle: React.CSSProperties;

    stackVertically: boolean;

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
}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    border: `3px solid ${props.theme.borderColor}`,
    minHeight: '100%',
    height: 'auto',
    paddingBottom: '8em',
}));

const SidePanel = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    flexWrap: 'wrap',
    left: '3.5%',
    top: '6%',
    zIndex: 1,
    width: 'auto',
    height: '100%'
}));

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

const SensorTypeContainer = styled('div', (props: ThemeProps & {$stacked: boolean}) => ({
    display: props.$stacked ? 'flex' : 'grid',
    flexDirection: props.$stacked ? 'column' : null,
    gridTemplateColumns: props.$stacked ? null: 'repeat(2, 1fr)',
    gridTemplateRows: props.$stacked ? null: 'auto',
    alignItems: 'start',
    alignContent: 'center',
    justifyContent: 'center',
}));

const GraphTypeContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingBottom: '5%',
    marginBottom: '5%',
    alignContent: 'center',
    justifyContent: 'center',
}));

const SelectedGraphTypeContainer = styled('div', (props: ThemeProps) => ({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
}));

const SubGraphTypeDropDownContainer = styled('span', (props: ThemeProps & { selected?: boolean }) => ({
    backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
    boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
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
    paddingRight: '5px',
    fontWeight: 500,
    fontSize: '1.44em',
    width: '100%',
    padding: '3%',

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
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '2.5em'
});

const SectionInfoText = styled('span', {
    paddingRight: '5px',
    fontSize: '1.2em',
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
    paddingRight: '3%',
    paddingLeft: '1.5%',
    fontWeight: 500,
    fontSize: '1.44em',
    width: '100%',
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
    flex: 1,
}));

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

const EnableDisableAllServos = styled(Button, (props: ThemeProps & ClickProps & { allServosEnabled?: boolean }) => ({
    backgroundColor: props.allServosEnabled ? props.theme.noButtonColor.standard : props.theme.yesButtonColor.standard,
    border: props.allServosEnabled ? `1px solid ${props.theme.noButtonColor.border}` : `1px solid ${props.theme.yesButtonColor.border}`,
    ':hover':
        { backgroundColor: props.allServosEnabled ? props.theme.noButtonColor.hover : props.theme.yesButtonColor.hover },
    color: props.theme.noButtonColor.textColor,
    fontSize: '1.2em',
    fontWeight: 500,
    textShadow: props.theme.noButtonColor.textShadow,
    boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',

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
        ret.push(ComboBox.option(motor, motor));
    }
    return ret;
})();

const SERVO_OPTIONS: ComboBox.Option[] = (() => {

    const ret: ComboBox.Option[] = [];
    for (const servo of Object.values(Servos)) {
        ret.push(ComboBox.option(servo, servo));
    }
    return ret;
})();

const VIEW_OPTIONS: ComboBox.Option[] = (() => {

    const ret: ComboBox.Option[] = [];
    for (const view of Object.values(MotorView)) {
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
            motorInputStyle: this.props.theme.themeName === 'DARK' ?
                {
                    width: '80%',
                    appearance: 'none',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 50%,#4aad52 50%,#4aad52 100%)`,
                    outline: 'none'
                } : {
                    width: '80%',
                    appearance: 'none',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 50%,#2BDE3F 50%,#2BDE3F 100%)`,
                    outline: 'none'
                },
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
            servoInputStyle: this.props.theme.themeName === 'DARK' ?
                {
                    width: '80%',
                    appearance: 'none',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 10%,#4aad52 10%,#4aad52 90%,#AD4C4B 90%,#AD4C4B 100%)`,
                    outline: 'none'
                } : {
                    width: '80%',
                    appearance: 'none',
                    height: '6px',
                    borderRadius: '3px',
                    background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 10%,#2BDE3F 10%,#2BDE3F 90%,#FF4E4E 90%,#FF4E4E 100%)`,
                    outline: 'none'
                },
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
            stackVertically: false,
        };
        this.newMotorRef = React.createRef<Motors | undefined>();
    }

    async componentDidMount(): Promise<void> {
         this.checkLayout();
        window.addEventListener('resize', this.checkLayout);
        this.newMotorRef.current = Motors.MOTOR0;

        if (this.props.getMotorPositions() !== undefined) {
            this.setState({
                motorPositions: this.props.getMotorPositions(),
            });
        }

        if (this.props.getServoPositions() !== undefined) {
            this.setState({
                servoPositions: this.props.getServoPositions(),
            });
        }
    }
   checkLayout = () => {
        const availableWidth = window.innerWidth;
        // Example threshold: if there's at least 600px, stack
        const stack = availableWidth < 700;
        this.setState({ stackVertically: stack });
    };

    componentWillUnmount(): void {
            window.removeEventListener('resize', this.checkLayout);
        this.props.sensorDisplayShown(false);
    }

    async componentDidUpdate(prevProps: Props, prevState: State): Promise<void> {
        console.log('MotorServoSensorDisplay componentDidUpdate prevstate', prevState);
        console.log('MotorServoSensorDisplay componentDidUpdate state', this.state);
        if (prevProps.propedServoPositions !== this.props.propedServoPositions) {
            this.setState({
                servoPositions: this.props.propedServoPositions,
            });
        }

        if (prevProps.theme !== this.props.theme) {
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
                servoInputStyle: this.props.theme.themeName === 'DARK' ?
                    {
                        width: '80%',
                        appearance: 'none',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 10%,#4aad52 10%,#4aad52 90%,#AD4C4B 90%,#AD4C4B 100%)`,
                        outline: 'none'
                    } : {
                        width: '80%',
                        appearance: 'none',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 10%,#2BDE3F 10%,#2BDE3F 90%,#FF4E4E 90%,#FF4E4E 100%)`,
                        outline: 'none'
                    },
                motorInputStyle: this.props.theme.themeName === 'DARK' ?
                    {
                        width: '80%',
                        appearance: 'none',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right,#AD4C4B 0%,#AD4C4B 50%,#4aad52 50%,#4aad52 100%)`,
                        outline: 'none'
                    } : {
                        width: '80%',
                        appearance: 'none',
                        height: '6px',
                        borderRadius: '3px',
                        background: `linear-gradient(to right,#FF4E4E 0%,#FF4E4E 50%,#2BDE3F 50%,#2BDE3F 100%)`,
                        outline: 'none'
                    },
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
            this.setState({
                shownServoValue: this.state.shownServoValue,
            })
        }
        if (prevState.motorPositions !== this.state.motorPositions) {
            this.setState({
                shownMotorValue: this.state.motorPositions[this.state.shownMotor],
            })
        }
    }

    private setSensorSelection(section: 'Analog' | 'Digital' | 'Accelerometer' | 'Gyroscope' | 'Magnetometer' | 'Button') {
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
        this.newMotorRef.current = option.data as Motors;

        if (this.state.shownMotor !== option.data) {
            this.setState({
                shownMotor: option.data as Motors,
                shownMotorValue: this.state.motorPositions[option.data as Motors],
            });

        }
    };

    private onServoSelect_ = (index: number, option: ComboBox.Option) => {

        this.setState((prevState) => {
            const selectedServo = option.data as Servos;
            const servoObj = prevState.servoPositions.find(servo => servo.name === selectedServo);

            return {
                shownServo: selectedServo,
                shownServoValue: servoObj ? servoObj.value : 1024, // Default to 0 if not found
            };
        });
    };

    private onMotorViewSelect_ = (index: number, option: ComboBox.Option) => {
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
                motorPositions: DEFAULT_MOTORS
            });
        }
    };

    private onMotorChange_ = (value: number) => {
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

    private setGraphSelection = (graph: GraphSelectionKey) => {
        const { selectedGraphs } = this.state;

        this.setState({
            selectedGraphs: selectedGraphs.includes(graph) ? selectedGraphs.filter(g => g !== graph) : [...selectedGraphs, graph],
        }, () => {
            this.props.graphSelections(this.state.selectedGraphs);
        })

    };

    private onServoChange_ = (value: number) => {
        this.setState((prevState) => {
            const updatedServoPositions = prevState.servoPositions.map((servo) =>
                servo.name === prevState.shownServo ? { ...servo, value } : servo
            );

            return {
                servoPositions: updatedServoPositions,
                shownServoValue: value,
            };
        }, () => {
            this.props.storeServoPositions(this.state.servoPositions);
        });
    };

    private flipEnableServo_ = (servo: Servos) => {
        this.setState((prevState) => {
            const updatedServoPositions = prevState.servoPositions.map((servoObj) =>
                servoObj.name === servo ? { ...servoObj, enable: !servoObj.enable } : servoObj
            );

            return {
                servoPositions: updatedServoPositions,
            };
        }, () => {
            this.props.storeServoPositions(this.state.servoPositions);
        });
    };

    private flipEnableDisableAllServos_ = () => {
        this.setState((prevState) => {
            const allEnabled = prevState.servoPositions.every(servo => servo.enable);
            const updatedServoPositions = prevState.servoPositions.map((servo) =>
                ({ ...servo, enable: !allEnabled })
            );
            return {
                servoPositions: updatedServoPositions,
            };
        }, () => {
            this.props.storeServoPositions(this.state.servoPositions);
        });

    };

    private stopAllMotors_ = () => {
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
        if (this.newMotorRef.current) {
            this.setState({
                motorPositions: {
                    ...this.state.motorPositions,
                    [this.newMotorRef.current]: 0,
                },
                shownMotorValue: 0,
            }, () => {
                this.props.storeMotorPositions(this.state.shownMotorView, this.state.motorPositions);
                this.props.stopMotor(this.newMotorRef.current);
            });
        }
    }

    private clearCurrentMotorPosition_ = () => {
        if (this.newMotorRef.current) {
            this.props.clearMotorPosition(this.newMotorRef.current);
        }
    };

    private onSectionSelect_ = (section: "Motor" | "Servo" | "Sensor") => {
        if (section === "Sensor") {
            this.props.sensorDisplayShown(true);
        }
        else {
            this.props.sensorDisplayShown(false);
        }

        if (section === "Servo") {
            this.setState({
                shownServoValue: this.state.servoPositions[0].value,
            })
        }
        this.setState({
            selectedSection: section,
        })
    };

    renderSensor = (sensor: string) => {
        const {
            theme,
            propedAnalogValues,
            propedDigitalValues,
            propedAccelValues,
            propedGyroValues,
            propedMagnetoValues,
            propedButtonValues,
            locale
        } = this.props;
        const {stackVertically} = this.state;
        switch (sensor) {
            case 'Analog':
                return (
                    <SensorTypeContainer theme={theme} $stacked={stackVertically}>

                        {Object.entries(this.state.sensorValues.Analogs).map(([key, value], index) => (
                            <SelectedGraphTypeContainer  theme={theme} >
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
                    <SensorTypeContainer theme={theme} $stacked={stackVertically}>
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
                return (<SensorTypeContainer theme={theme} $stacked={stackVertically}>
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
                return (<SensorTypeContainer theme={theme} $stacked={stackVertically}>
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
                return (<SensorTypeContainer theme={theme} $stacked={stackVertically}>
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
                    <SensorTypeContainer theme={theme} $stacked={stackVertically}>
                        <SelectedGraphTypeContainer theme={theme} >
                            <SubGraphTypeDropDownContainer theme={theme}>
                                <Row key={'Button'} theme={theme}>
                                    <SensorWidget
                                        value={propedButtonValues && propedButtonValues[0] !== undefined ? propedButtonValues[0] : 0}
                                        name={'right_button()'}
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
        const { theme, locale } = this.props;
        const motorVelocities: JSX.Element[] = [];
        const motorPositions: JSX.Element[] = [];

        for (let i = 0; i < 4; ++i) {
            motorVelocities.push(
                <Row key={`motor-velocity-${i}`} theme={theme}>
                    <SensorWidget

                        value={(this.state.shownMotorView === MotorView.VELOCITY ? (this.props.propedProgramRunning ? this.props.propedMotorVelocities[`Motor ${i}`] : this.state.motorPositions[`Motor ${i}`]) : 0) ||
                            (this.state.shownMotorView === MotorView.POWER ? (this.props.propedProgramRunning ? this.props.propedMotorPositions[`Motor ${i}`] : this.state.motorPositions[`Motor ${i}`]) : 0)}
                        name={`motor(${i}) velocity`}
                        plotTitle={LocalizedString.lookup(tr('Motor Velocity Plot'), locale)}
                        theme={theme}

                    />
                </Row>
            );

            motorPositions.push(
                <Row key={`motor-position-${i}`} theme={theme}>
                    <SensorWidget
                        value={this.props.propedMotorPositions ? this.props.propedMotorPositions[`Motor ${i}`] : 0}
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
        const { theme, locale } = this.props;
        const servoPositions: JSX.Element[] = [];

        for (let i = 0; i < 4; ++i) {
            servoPositions.push(
                <Row key={`servo-position-${i}`} theme={theme}>
                    <SensorWidget
                        value={this.props.propedServoPositions.length < 1 ? 0 : this.props.propedServoPositions[i].value}
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
            servoMinValue,
            servoMaxValue,
            servoSubArcs

        } = this.state;

        const motorSection = () => {
            const { selectedGraphs, motorInputStyle } = this.state;
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
                                mainHeight={'1.8em'}
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
                                mainHeight={'2em'}
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
                            margins={{ top: 0.1, bottom: 0.02, left: 0.07, right: 0.07 }}
                            onDialChange={this.onMotorChange_}
                            changeValue={this.state.shownMotorValue}
                            customTickValueConfig={this.state.customTickValueConfig}
                            customTickLineConfig={this.state.customTickLineConfig}
                            subArcs={motorSubArcs}
                            inputStyle={motorInputStyle}
                        />
                    </SettingContainer>
                    <SettingContainer theme={theme}>
                        <MotorStopButton disabled={!(Object.keys(this.props.propedMotorPositions).some((key) => this.props.propedMotorPositions[key] !== 0))} onClick={() => this.clearCurrentMotorPosition_()} theme={theme} >
                            {LocalizedString.lookup(tr('Clear Motor Position'), locale)}
                        </MotorStopButton>
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
            const { selectedGraphs, servoInputStyle } = this.state;
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
                                mainHeight={'2em'}
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
                            margins={{ top: 0.07, bottom: 0.02, left: 0.12, right: 0.12 }}
                            changeValue={this.props.propedServoPositions.length < 1 ? 1024 : (this.state.servoPositions[parseInt(this.state.shownServo.split(' ')[1])].value)}
                            customTickValueConfig={this.state.customTickValueConfig}
                            customTickLineConfig={this.state.customTickLineConfig}
                            inputStyle={servoInputStyle}
                            subArcs={servoSubArcs}
                        />
                    </SettingContainer>
                    <SettingContainer theme={theme} style={{ padding: '1px', paddingBottom: '5px', }}>

                        <EnableDisableAllServos
                            allServosEnabled={Object.values(this.state.servoPositions).every((servo) => servo.enable === true)} onClick={() => this.flipEnableDisableAllServos_()} theme={theme}>
                            {Object.values(this.props.propedServoPositions).every(
                                (servo) => servo.enable === false
                            ) ? LocalizedString.lookup(tr('Enable All Servos'), locale) : LocalizedString.lookup(tr('Disable All Servos'), locale)}
                        </EnableDisableAllServos>
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
                <SectionsColumn theme={theme}>
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
            >
                <h2 style={{ marginLeft: '6px', }}>Motors, Servos and Sensors</h2>
                <StyledScrollArea theme={theme} >
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
                </StyledScrollArea>
            </SidePanel >
        );
    }
}

