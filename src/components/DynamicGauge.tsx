import * as React from 'react';
import { GaugeComponent } from 'react-gauge-component';
import { DARK, ThemeProps } from '../theme';
import { StyleProps } from '../style';
import { styled } from 'styletron-react';
import { SubArc } from 'react-gauge-component';
interface DynamicGaugeProps extends ThemeProps, StyleProps {
    initialValue?: number;
    minValue?: number;
    maxValue?: number;
    margins?: { top: number; bottom: number; left: number; right: number };
    arcColors?: string[];
    arcLimits?: { limit: number }[];
    changeValue?: number;
    subArcs?: SubArc[];
    customTickValueConfig?: {};
    customTickLineConfig?: {};
    onDialChange?: (value: number) => void;
}

interface DynamicGaugeState {
    value: number;
    isEditing: boolean;
    draftValue: string;
}
interface ClickProps {
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
}

type Props = DynamicGaugeProps;
type State = DynamicGaugeState;

const GaugeValue = styled('div', (props: ThemeProps & ClickProps) => ({
    fontSize: '2.5em',
    paddingBottom: '0.5em'

}));

const GaugeInput = styled('input', {
    fontSize: '2.5em',
    paddingBottom: '0.5em',
    width: '5ch',
});


export class DynamicGauge extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            value: props.initialValue,
            isEditing: false,
            draftValue: this.props.changeValue.toString()
        };
    }

    componentDidMount(): void {
        console.log("DyanmicGauge props: ", this.props);
        if (this.props.changeValue) {
            this.setState({ value: this.props.changeValue });
        }
    }
    componentDidUpdate(prevProps: Readonly<DynamicGaugeProps>, prevState: Readonly<DynamicGaugeState>, snapshot?: any): void {
        console.log("DyanmicGauge prevProps: ", prevProps);
        console.log("DyanmicGauge props: ", this.props);
        console.log("DyanmicGauge prevState: ", prevState);
        console.log("DyanmicGauge state: ", this.state);

        if (prevProps.changeValue !== this.props.changeValue) {
            console.log("DyanmicGauge changeValue CHANGED: ", this.props.changeValue);
            // this.setState({ value: this.props.changeValue });
        }
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ draftValue: value });
    };

    handleSliderChange = (e) => {
        this.setState({ draftValue: e.target.value }, () => {
            const parsed = Number(this.state.draftValue);
            if (!isNaN(parsed)) {
                this.props.onDialChange?.(parsed);
            }
        });

    }
    handleBlur = () => {
        const parsed = Number(this.state.draftValue);
        if (!isNaN(parsed)) {
            this.props.onDialChange?.(parsed);
        }
        this.setState({ isEditing: false });
    };

     handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur(); // Triggers onBlur to commit
        }
    };

    setIsEditing = (isEditing: boolean) => {

        this.setState({ isEditing });
    }
    handleClick = (e) => {
        e.stopPropagation();
        this.setState({ isEditing: true, draftValue: this.props.changeValue.toString() });
    }
    render() {
        const defaultMargins = { top: 0.07, bottom: 0.02, left: 0.07, right: 0.07 };
        const { value, isEditing, draftValue } = this.state;
        const {
            minValue = 0,
            maxValue = 100,
            margins,
            arcColors = ['#FF4E4E', '#2BDE3F'],
            arcLimits = [{ limit: 0 }, { limit: 1500 }],
            theme
        } = this.props;

        return (
            <div style={{ ...this.props.style, width: '95%', textAlign: 'center' }}>
                <GaugeComponent
                    value={Number(draftValue)}
                    minValue={minValue}
                    maxValue={maxValue}
                    type="semicircle"
                    marginInPercent={this.props.margins ? margins : defaultMargins}
                    arc={{
                        padding: 0.005,
                        cornerRadius: 1,
                        subArcs: this.props.subArcs
                    }}
                    labels={{
                        valueLabel: { hide: true },
                        tickLabels: {
                            ticks: [{ value: 0 }],
                            defaultTickValueConfig: this.props.customTickValueConfig ? this.props.customTickValueConfig : {},
                            defaultTickLineConfig: this.props.customTickLineConfig ? this.props.customTickLineConfig : {}
                        }
                    }}


                />
                {/* <GaugeValue theme={theme} >
                    {value}
                </GaugeValue> */}

                {isEditing ? (
                    <GaugeInput
                        value={draftValue}
                        onChange={this.handleChange}
                        onKeyDown={this.handleEnterPress}
                        onBlur={this.handleBlur}
                        autoFocus
                    />
                ) : (
                    <GaugeValue theme={theme} onClick={this.handleClick}>
                        {draftValue}
                    </GaugeValue>
                )
                }

                {/* Dynamic Control for Moving the Pointer */}
                <input
                    type="range"
                    min={minValue}
                    max={maxValue}
                    value={draftValue}
                   
                    onChange={this.handleSliderChange}
                    style={{ width: '80%' }}
                />


            </div>
        );
    }
}

export default DynamicGauge;
