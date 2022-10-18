import * as React from 'react';
import * as monaco from 'monaco-editor';
import { styled } from 'styletron-react';
import { StyleProps } from './style';

import server from './server';
import { Message } from './Message';

import format from './c-indent';

// import('monaco-themes/themes/Blackboard.json')
//   .then(data => {
//       monaco.editor.defineTheme('blackboard', data as any);
//       monaco.editor.setTheme('blackboard');
//   });

(self as any).MonacoEnvironment = {
	getWorkerUrl: function (_moduleId: any, label: string) {
		if (label === 'json') {
			return '/json.worker.bundle.js';
		}
		if (label === 'css' || label === 'scss' || label === 'less') {
			return '/css.worker.bundle.js';
		}
		if (label === 'html' || label === 'handlebars' || label === 'razor') {
			return '/html.worker.bundle.js';
		}
		if (label === 'typescript' || label === 'javascript') {
			return '/ts.worker.bundle.js';
		}
		return '/editor.worker.bundle.js';
	}
};

export interface IvygateProps extends StyleProps {
  code: string;
  language: string;
  messages?: Message[];
  autocomplete: boolean;
  onCodeChange: (code: string) => void;
}

interface IvygateState {

}

type Props = IvygateProps;
type State = IvygateState;

const clamp = (min: number, value: number, max: number) => Math.min(max, Math.max(min, value));


const clampRange = <A extends monaco.IRange, B extends monaco.IRange>(a: A, b: B): monaco.IRange => ({
  startColumn: clamp(a.startColumn, b.startColumn, a.endColumn),
  startLineNumber: clamp(a.startLineNumber, b.startLineNumber, a.endLineNumber),
  endColumn: clamp(a.startColumn, b.endColumn, a.endColumn),
  endLineNumber: clamp(a.startLineNumber, b.endLineNumber, a.endLineNumber),
});

/* const intersect = <A extends monaco.IRange, B extends monaco.IRange>(a: A, b: B) => {
  if (b.startLineNumber > a.endLineNumber || b.endLineNumber < a.startLineNumber)
};*/

export class Ivygate extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  private editor_: monaco.editor.ICodeEditor;

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    if (this.ref_ === ref) return;

    if (this.editor_) this.editor_.dispose();
    this.ref_ = ref;

    if (!this.ref_) return;

    const { props } = this;
    const { code, language, autocomplete } = props;
    this.editor_ = monaco.editor.create(this.ref_, {
      ...Ivygate.getAutocompleteEditorOptions(autocomplete),
      value: code,
      language,
      theme: 'vs-dark',
      automaticLayout: true
    });

    const model = this.editor_.getModel() as monaco.editor.ITextModel;
    model.onDidChangeContent(this.onContentChange_);
  }

  formatCode() {
    this.editor_.getAction('editor.action.formatDocument').run()
  }

  changeFormatter(formattingFunction: (code: string, tabSize: number, insertSpaces: boolean) => string): void {
    monaco.languages.registerDocumentFormattingEditProvider('c', {
      provideDocumentFormattingEdits(model, options) {
        return [{
          range: model.getFullModelRange(),
          text: formattingFunction(model.getValue(), options.tabSize, options.insertSpaces)
        }];
      }
    });
  }

  private handle_?: number;

  componentDidMount() {
    server.open('')
  }

  private guard_ = false;

  private onContentChange_ = (event: monaco.editor.IModelContentChangedEvent) => {
    
    const model = this.editor_.getModel() as monaco.editor.ITextModel;
    
    // TODO: Update markers when text changes
    /*let nextMarkers = monaco.editor.getModelMarkers({});
    
    for (const change of event.changes) {
      for (let i = 0; i < nextMarkers.length; ++i) {
        const marker = nextMarkers[i];
        
      }
      change.range.startLineNumber
    }*/
    
    this.guard_ = true;
    this.props.onCodeChange(model.getLinesContent().join('\n'));
  };

  // TODO: change this to a memoization helper
  UNSAFE_componentWillReceiveProps(nextProps: Props) {

    if (!this.editor_) return;

    const { code, language, messages, autocomplete } = nextProps; 

    if (language === 'c') {
      this.changeFormatter(format);
    }

    const model = this.editor_.getModel() as monaco.editor.ITextModel;

    if (!this.guard_ && code !== model.getValue()) model.setValue(code);
    this.guard_ = false;

    monaco.editor.setModelLanguage(model, language);

    const monacoMessages = (messages || []).map(Message.toMonaco).reduce((a, b) => [ ...a, ...b ], []);
    monaco.editor.setModelMarkers(model, '', monacoMessages);

    if (autocomplete !== this.props.autocomplete) {
      this.editor_.updateOptions(Ivygate.getAutocompleteEditorOptions(autocomplete));
    }
  }

  componentDidUpdate() {
    if (!this.editor_) return;
  }

  componentWillUnmount() {
    server.close(0);
  }

  revealLineInCenter(line: number) {
    this.editor_.revealLineInCenter(line, monaco.editor.ScrollType.Smooth);
  }

  private static getAutocompleteEditorOptions(autocomplete: boolean): monaco.editor.IEditorOptions {
    return {
      autoClosingBrackets: autocomplete ? 'languageDefined' : 'never',
      autoClosingOvertype: autocomplete ? 'always' : 'never',
      autoClosingQuotes: autocomplete ? 'languageDefined' : 'never',
      autoSurround: autocomplete ? 'languageDefined': 'never',
      suggest: {
        showWords: autocomplete,
      }
    };
  }

  render() {
    const { props } = this;
    const { style, className } = props;
    return (
      <div style={{ width: '100%', height: '100%', ...style }} className={className} ref={this.bindRef_} />
    );
  }
}