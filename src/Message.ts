import * as monaco from 'monaco-editor';



interface Message {
  file?: string;
  severity: Message.Severity;
  ranges: Message.Range[];
  message: string;
}

export namespace Message {
  export type Severity = 'error' | 'warning' | 'info';

  export namespace Severity {
    export const toMonaco = (severity: Severity): monaco.MarkerSeverity => {
      switch (severity) {
        case 'error': return monaco.MarkerSeverity.Error;
        case 'warning': return monaco.MarkerSeverity.Warning;
        case 'info': return monaco.MarkerSeverity.Info;
      }
    };
  }

  export interface Index {
    line: number;
    col: number;
  }
  
  export interface Range {
    start: Index;
    end: Index;
  }

  export const toMonaco = (message: Message): monaco.editor.IMarkerData[] => {
    const ret: monaco.editor.IMarkerData[] = [];
    const severity = Severity.toMonaco(message.severity);

    for (let i = 0; i < message.ranges.length; ++i) {
      const range = message.ranges[i];
      ret.push({
        message: message.message,
        severity,
        startLineNumber: range.start.line,
        startColumn: range.start.col,
        endLineNumber: range.end.line,
        endColumn: range.end.col
      });
    }

    return ret;
  };
}

export default Message;