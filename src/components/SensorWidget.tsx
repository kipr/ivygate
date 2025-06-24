import { styled } from 'styletron-react';
import * as React from 'react';
import { ThemeProps } from './constants/theme';
import { StyleProps } from './constants/style';
import SensorPlot from './SensorPlot';
import BooleanPlot from './BooleanPlot';
import { StyledText } from '../util/StyledText';
import { Fa } from "./Fa";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

export interface SensorWidgetProps extends ThemeProps, StyleProps {
  name: string;
  value: number | boolean;
  unit?: string;
  plotTitle?: string;
}

interface SensorWidgetState {
  showGuide: boolean;
  showActionTooltip: boolean;
  showPlot: boolean;
}

type Props = SensorWidgetProps;
type State = SensorWidgetState;

export const Spacer = styled('div', {
  flex: '1 1'
});

const Container = styled('div', ({ theme }: ThemeProps) => ({
  width: '100%',
  borderRadius: `${theme.itemPadding * 2}px`,
  overflow: 'none',
  border: `1px solid ${theme.borderColor}`,

  ':hover': {
    cursor: 'pointer',
    backgroundColor: theme.hoverOptionBackground
},
}));

const Name = styled('span', {
  userSelect: 'none'
});

const Header = styled('div', (props: ThemeProps) => ({
  fontFamily: `'Roboto Mono', monospace`,
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  alignItems: 'center',
  fontSize: '0.9em',
  padding: `${props.theme.itemPadding * 2}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  backgroundColor: `rgba(0, 0, 0, 0.1)`,
  ':last-child': {
    borderBottom: 'none'
  }
}));

const StyledToolIcon = styled(Fa, (props: ThemeProps & { withBorder?: boolean }) => ({
  userSelect: 'none',
  paddingLeft: !props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  paddingRight: props.withBorder ? `${props.theme.itemPadding}px` : undefined,
  borderRight: props.withBorder ? `1px solid ${props.theme.borderColor}` : undefined,
}));


class SensorWidget extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    if (!props.plotTitle) {
      props.plotTitle = `Plot`;
    }

    this.state = {
      showGuide: false,
      showActionTooltip: false,
      showPlot: false
    };
  }

  componentDidUpdate(prevProps: Readonly<SensorWidgetProps>, prevState: Readonly<SensorWidgetState>, snapshot?: any): void {

  }
  private onMouseEnter_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: true,
      showActionTooltip: true
    });
  };

  private onMouseLeave_ = (event: React.MouseEvent<HTMLDivElement>) => {
    this.setState({
      showGuide: false
    });
  };

  private onActionTooltipClose_ = () => this.setState({
    showActionTooltip: false
  });

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    this.ref_ = ref;
  };

  private onShowPlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.setState({
      showPlot: true
    });
  };

  private onHidePlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    this.setState({
      showPlot: false
    });
  };

  private onTogglePlotClick_ = (event: React.MouseEvent<HTMLSpanElement>) => {
    if (this.state.showPlot) {
      this.onHidePlotClick_(event);
    } else {
      this.onShowPlotClick_(event);
    }
  };

  render() {
    const { props, state } = this;
    const { style, className, theme, name, unit, value, plotTitle } = props;
    const {showPlot } = state;

    let plot: JSX.Element;

    const headerValue: number = typeof value === 'number'
      ? Math.round(value)
      : (value ? 1 : 0);

    switch (typeof value) {
      case 'boolean': {
        plot = <BooleanPlot value={value} theme={theme} />;
        break;
      }
      case 'number': {
        plot = <SensorPlot value={value} theme={theme} />;
        break;
      }
    }
    return (
      <>
        <Container
          ref={this.bindRef_}
          style={style}
          className={className}
          theme={theme}
          onMouseEnter={this.onMouseEnter_}
          onMouseLeave={this.onMouseLeave_}
        >
          <Header theme={theme} onClick={this.onTogglePlotClick_}>
            <Name>{name}</Name>
            <Spacer />
            <span style={{fontSize: '1.2em', userSelect: 'none' }}>{headerValue}{unit}</span>
          </Header>
          {showPlot ? plot : undefined}
        </Container>
       </>
    );
  }
}

export default SensorWidget;