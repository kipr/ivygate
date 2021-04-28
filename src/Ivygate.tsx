import * as React from 'react';
import * as monaco from 'monaco-editor';
import styled from 'styled-components';
import { StyleProps } from './style';

import server from './server';

import('monaco-themes/themes/Monokai.json')
  .then(data => {
      monaco.editor.defineTheme('monokai', data as any);
      monaco.editor.setTheme('monokai');
  });

(self as any).MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return './json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return './css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return './html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return './ts.worker.bundle.js';
		}
		return './editor.worker.bundle.js';
	}
};

export interface IvygateProps extends StyleProps {
  code: string;
  language: string;
}

interface IvygateState {

}

type Props = IvygateProps;
type State = IvygateState;

class Ivygate extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private editor_: monaco.editor.IEditor;

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    if (this.ref_ === ref) return;

    if (this.editor_) this.editor_.dispose();
    this.ref_ = ref;

    const { props } = this;
    const { code, language } = props;
    this.editor_ = monaco.editor.create(this.ref_, {
      value: code,
      language
    });
  }

  private handle_?: number;

  componentDidMount() {
    server.open('')
  }

  componentDidUpdate() {
    if (!this.editor_) return;

    const { props } = this;
    const { code, language } = props;

    const model = this.editor_.getModel() as monaco.editor.ITextModel;
    if (code !== model.getValue()) model.setValue(code);

    monaco.editor.setModelLanguage(model, language);

    let markers: monaco.editor.IMarkerData[] = [];

    monaco.editor.setModelMarkers(model, '', []);
  }

  componentWillUnmount() {
    server.close();
  }

  render() {
    const { props } = this;
    const { style, className } = props;
    return (
      <div style={style} className={className} ref={this.bindRef_} />
    );
  }
}

export default styled(Ivygate)`
  width: 100%;
  height: 100%;
`;