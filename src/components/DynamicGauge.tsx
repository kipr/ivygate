import * as React from 'react';
import { GaugeComponent } from 'react-gauge-component';
import { DARK, ThemeProps } from '../theme';
import { StyleProps } from '../style';
import { SubArc } from 'react-gauge-component';
interface DynamicGaugeProps extends ThemeProps,StyleProps{
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
  margins?: { top: number; bottom: number; left: number; right: number };
  arcColors?: string[];
  arcLimits?: { limit: number }[];
  changeValue?: number;
  subArcs?: SubArc[];
  onDialChange?: (value: number) => void;
}

interface DynamicGaugeState {
  value: number;
}

type Props = DynamicGaugeProps;
type State = DynamicGaugeState;


export class DynamicGauge extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.initialValue // Default to 50 if no initial value is provided
        };
    }

    componentDidMount(): void {
        console.log("DyanmicGauge props: ", this.props);
        if(this.props.changeValue) {
            this.setState({ value: this.props.changeValue });
        }
    }
    componentDidUpdate(prevProps: Readonly<DynamicGaugeProps>, prevState: Readonly<DynamicGaugeState>, snapshot?: any): void {
        console.log("DyanmicGauge prevProps: ", prevProps);
        console.log("DyanmicGauge props: ", this.props);
        console.log("DyanmicGauge prevState: ", prevState);
        console.log("DyanmicGauge state: ", this.state);

        if(prevProps.changeValue !== this.props.changeValue) {
            console.log("DyanmicGauge changeValue CHANGED: ", this.props.changeValue);
            this.setState({ value: this.props.changeValue });
        }
    }
    handleChange = (e) => {
        const newValue = Number(e.target.value);
        this.props.onDialChange && this.props.onDialChange(newValue);
        this.setState({ value: newValue });
    };

    render() {
        const { value } = this.state;
        const {
            minValue = 0,
            maxValue = 100,
            margins = { top:0.05, bottom: 0.01, left: 0.05, right: 0.05 },
            arcColors = ['#FF4E4E', '#2BDE3F'],
            arcLimits = [{ limit: 0 }, { limit: 1500 }]
        } = this.props;

        return (
            <div style={{ ...this.props.style,width: '280px', textAlign: 'center', }}>
                <GaugeComponent
                    value={value}
                    minValue={minValue}
                    maxValue={maxValue}
                    type="semicircle"
                    arc={{
                        subArcs: this.props.subArcs
                    }}
                    labels={{
                        valueLabel: { formatTextValue: (val) => `${val}` },
                        tickLabels: {
                            ticks: [{value:0}],
                        }
                    }}
                    
                />

                {/* Dynamic Control for Moving the Pointer */}
                <input
                    type="range"
                    min={minValue}
                    max={maxValue}
                    value={value}
                    onChange={this.handleChange}
                    style={{ width: '80%' }}
                />
               Current Value: {value}
               
            </div>
        );
    }
}

export default DynamicGauge;
