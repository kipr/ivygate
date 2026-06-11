import * as React from 'react';
import { TourRegistry } from "../../tours/TourRegistry";

interface TourTargetProps {
  registry?: TourRegistry | null;
  targetKey?: string | null;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export class TourTarget extends React.PureComponent<TourTargetProps> {
  private wrapperEl: HTMLDivElement | null = null;

  private setRef = (node: HTMLDivElement | null) => {
    this.wrapperEl = node;
  };

  private getMeasuredElement(): HTMLElement | null {
    if (!this.wrapperEl) return null;

    const firstChild = this.wrapperEl.firstElementChild;
    if (firstChild instanceof HTMLElement) {
      return firstChild;
    }

    return this.wrapperEl;
  }

  private registerTarget(key: string | null | undefined, el: HTMLElement | null, registry = this.props.registry) {
    if (!registry || !key) return;
    registry.register(key, el);
  }

  componentDidMount() {
    this.registerTarget(this.props.targetKey, this.getMeasuredElement());
  }

  componentDidUpdate(prevProps: TourTargetProps) {
    if (prevProps.registry !== this.props.registry || prevProps.targetKey !== this.props.targetKey) {
      this.registerTarget(prevProps.targetKey, null, prevProps.registry);
    }
    this.registerTarget(this.props.targetKey, this.getMeasuredElement());
  }

  componentWillUnmount() {
    this.registerTarget(this.props.targetKey, null);
  }

  render() {
    return (
      <div
        ref={this.setRef}
        className={this.props.className}
        style={{ display: 'contents', ...this.props.style }}
      >
        {this.props.children}
      </div>
    );
  }
}

export default TourTarget;
