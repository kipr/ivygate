import * as React from 'react';
import * as monaco from 'monaco-editor';
import { StyleProps } from './components/constants/style';
import server from './server';
import { Message } from './Message';
import format from './c-indent';

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
  theme: string;
}

interface IvygateState {
  depth: number
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


export class Ivygate extends React.PureComponent<Props, State> {

  constructor(props: Props) {
    super(props);

  }
  private editor_: monaco.editor.ICodeEditor;
  get editor() { return this.editor_; }
  depth = 0;

  private ref_: HTMLDivElement;
  private bindRef_ = (ref: HTMLDivElement) => {
    if (this.ref_ === ref) return;

    if (this.editor_) this.editor_.dispose();
    this.ref_ = ref;

    if (!this.ref_) return;

    const { props } = this;
    const { code, language, autocomplete } = props;


    // Register the customCpp language and tokenizer
    monaco.languages.register({ id: 'customCpp' });

    monaco.languages.setLanguageConfiguration('customCpp', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      onEnterRules: [
        {
          beforeText: /^.*\b(?:if|for|while|switch)\b.*$/,
          action: { indentAction: monaco.languages.IndentAction.Indent }
        }
      ]
    });

    monaco.languages.register({ id: 'customPython' });
    monaco.languages.setLanguageConfiguration('customPython', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      onEnterRules: [
        {
          beforeText: /^.*\b(?:if|for|while|switch)\b.*$/,
          action: { indentAction: monaco.languages.IndentAction.Indent }
        }
      ]
    });
    monaco.languages.setLanguageConfiguration('plaintext', {
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '"', close: '"' },
        { open: "'", close: "'" }
      ],
      onEnterRules: [
        {
          beforeText: /^.*\b(?:if|for|while|switch)\b.*$/,
          action: { indentAction: monaco.languages.IndentAction.Indent }
        }
      ]
    });
    monaco.languages.setMonarchTokensProvider('customCpp', {
      brackets: [
        { open: '{', close: '}', token: 'root.curlyBracket' },
        { open: '[', close: ']', token: 'root.square' },
        { open: '(', close: ')', token: 'root.parenthesis' }
      ],
      tokenizer: {
        root: [
          [/\b(?:extern|typedef|struct|using|namespace|virtual|typename|public|private|auto|class|try|catch|throw|for|if|else|else if|while|switch|const|\?)\b/, 'keyword'],
          [/\b(?:long|double|return|void|operator|while|for|char|bool|int|string|\?)\b/, 'keyword.boldBlue'],
          [/\b(?:conditional_t|\?)\b/, 'built-in'],
          [/\bcout\b\s*/, { token: 'source', }],

          [/\b(?!cout\b)(?!\s*<<\s*)[a-zA-Z_][a-zA-Z0-9_]*\s*(?=<)/, { token: '', next: '@angleBracketState' }],



          [/\b(?:size_t|\?)\b/, 'keyword'],
          [/_\w+\b/, 'user-defined-literal.suffix'],
          // Match function calls (e.g., open("file2.txt"))
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\()/, 'function.declaration'],  // Matches function names like 'open'

          // Match member access (e.g., .name), but ensure it's not part of a function call
          [/(?<!\w)\.(\w+)(?!\w)(?!\()/, 'variable.member'], // Matches '.name' if it's not followed by '(' (to prevent function calls)

          [/\(\s*\*\s*(\w+)\s*\)/, 'variable.function.pointer'], // Match and tokenize function name after `(*`

          [/(?<=->\s*)([a-zA-Z_]\w*)/, { token: 'variable.special.this.cpp' }],

          [/\?/, 'operator'],  // Highlight '?' as an operator (part of ternary operator)
          [/\s*delete\b/, { token: 'operator.special.delete' }],
          [/\s*new\b/, { token: 'keyword.new' }],

          [/\s*this\b/, { token: 'variable.special.this.cpp' }],
          [/\*\s*\w+\s*(?=\()/, 'variable.function.pointer'],  // Function pointer match without capturing the *
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\.)/, 'variable.instance'],
          [/\\n/, { token: 'string.newline' }],


          [/\b\w+(?=\s*\[)/, 'root.arrayName'],
          [/\b[a-zA-Z_]\w*\d\w*\b/, 'variable.mixed'],
          [/\s*\/\/\s?.*$/, 'comment'],

          [/\/\*/, { token: 'comment', next: '@comment' }],  // Multi-line comment  
          [/\b\d+(\.\d+)?_\w+\b/, 'user-defined-literal'],
          [/"/, 'delimiter.quote', '@string_double'],
          [/'/, 'delimiter.quote', '@string_single'],
          [/\b\d+(\.\d+)?\b(?!\w)/, 'number'],

          [/[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=|(?!->)\b(?:[^\s\w]+)\b/, 'operator'],
          [/\[/, { token: 'bracket.level0', }],
          [/\(/, { token: 'test1', next: '@nestedParens' }],
          [/\b[A-Z0-9_]+\b/, 'macro.constant'],

          [/\s*!?defined\b/, { token: 'keyword.defined', next: '@defined' }],
          [/\s*template\b/, { token: 'keyword.defined', next: '@template' }],

          [/#\s*include\b/, { token: 'preprocessor.include', next: '@inInclude' }],
          [/#\s*define\b/, { token: 'preprocessor.define', next: '@macroDef' }],
          [/#\s*if\b/, { token: 'preprocessor.define', },],
          [/#\s*endif\b/, { token: 'keyword.directive' }],
          [/#\s*ifndef\b/, { token: 'preprocessor.define', next: '@macroDef' }],
        ],

        angleBracketState: [
          [/[^<>]+/, 'type'],  // Tokenize content inside the angle brackets as 'type'
          [/>/, 'delimiter.angle', '@pop'],  // When '>' is encountered, pop back to the root state
        ],
        template: [
          [/\b(?:extern|typedef|struct|using|namespace|virtual|typename|public|private|auto|class|try|catch|throw|for|if|else|else if|while|switch|int|float|long|const|double|char|bool|void|operator|\?)\b/, 'keyword'],

          [/\</, { token: 'source' }],
          [/\>/, { token: 'source', next: '@pop' }],
        ],
        defined: [
          [/\b[A-Z0-9_]+\b/, 'macro.constant'],
          [/\b[a-z0-9_]+\b/, 'macro.constant'],
          [/\)/, 'test1', '@pop'],
        ],
        string_double: [
          [/[^"\\]+/, 'string'],  // Match everything inside the quotes
          [/\\[a-zA-Z0-9]+/, 'character.escape'],
          [/"/, 'delimiter.quote', '@pop'] // Closing quote, exit state
        ],

        string_single: [
          [/[^'\\]+/, 'string'],
          [/\\[a-zA-Z0-9]+/, 'string.escape'],
          [/'/, 'delimiter.quote', '@pop']
        ],

        comment: [
          [/[^\/*]+/, 'comment'],        // Matches content inside the comment
          [/\*\//, { token: 'comment', next: '@pop' }], // Properly handles the closing '*/'
          [/\/\*/, 'comment'],           // If another `/*` appears inside, continue treating it as a comment
          [/./, 'comment']               // Ensures unmatched characters inside comments are still treated as comments
        ],


        nestedParens: [
          //[/\(/, 'delimiter.parenthesis', '@push'], // Handles deeper nesting
          [/\b(?:long|double|return|void|operator|while|for|char|bool|int|string|\?)\b/, 'keyword.boldBlue'],
          [/"/, 'delimiter.quote', '@string_double'],
          [/'/, 'delimiter.quote', '@string_single'],
          [/\)/, 'test1', '@pop'],
          [/\s*!?defined\b/, { token: 'keyword.defined', next: '@defined' }],
          [/\b_[A-Z0-9_]+\b/, 'source'],
          [/\b_[a-z0-9_]+\b/, 'source'],
          [/[!<>=&|]/, 'operator'],
          [/\d+/, 'number'],
        ],

        inInclude: [
          // Match content inside angle brackets (<...>)
          [/</, 'delimiter.angle'],  // Handle opening angle bracket
          [/>/, { token: 'delimiter.angle', next: '@pop' }],  // Match closing angle bracket

          // Match content inside double quotes ("...")
          [/"/, { token: 'delimiter.quote', next: '@inIncludeQuote' }], // Transition to a state that handles quotes

          // Match the header library inside angle brackets or quotes
          [/[^\s<>"]+/, 'header.library'],  // Match the library name in angle brackets or quotes

          // Match content within the quotes (e.g., "xtensor/xbuffer_adaptor.hpp")
          [/"\s*$/, { token: 'delimiter.quote', next: '@pop' }]  // Match closing quote and transition out of the include state
        ],

        // Handle content inside the quotes for include files (if there are any special characters inside quotes)
        inIncludeQuote: [
          [/"\s*$/, { token: 'delimiter.quote', next: '@root' }],  // End the string inside quotes and pop back to previous state
          [/[^"\\]+/, 'string'],  // Match everything inside the quotes except the quote itself
          [/\\./, 'string'],  // Match escape sequences inside the string (e.g., \" or \\)
        ],
        macroDef: [
          // Match only the first word after `#define` and style it as a macro
          [/\b\w+\b/, { token: 'macro.customCpp', next: '@pop' }], // Pop back to `root` after matching
        ],
      },

    });

    monaco.languages.setMonarchTokensProvider('customPython', {
      brackets: [
        { open: '{', close: '}', token: 'root.curlyBracket' },
        { open: '[', close: ']', token: 'root.square' },
        { open: '(', close: ')', token: 'root.parenthesis' }
      ],
      tokenizer: {
        root: [//

          [/\s*print\b/, { token: 'print.token', next: '@print' }],  // Specific rule for print()
          [/f(?=\s*['"])/, { token: 'keyword.fstring', next: '@fString' }],
          [/@[\w]+/, 'support.type.decorator'],
          [/\b(?:import|extern|typedef|raise|from|yield|struct|using|namespace|public|private|pass|for|if|else|elif|while|switch|operator|in|with|and|or|not|\?)\b/, 'keyword.boldBlue'],
          [/\b(?:long|int|double|return|void|operator|while|for|char|bool|float|string\?)\b/, 'keyword.boldBlue'],
          [/\b(?:len|max|isinstance|type|int|str|float|sum|min|set|abs|range|sorted|reversed|id|zip|all|any|eval|input|open|divmod|list|super|\?)\b/, { token: 'builtin.function', next: '@insideFunction' }],
          [/\b[A-Z][A-Z0-9_]*\b/, 'constant.caps'],  // Tokenize all uppercase words
          [/\s*self\b/, { token: 'variable.special.self.python' }],
          [/\?/, 'operator'],  // Highlight '?' as an operator (part of ternary operator)
          [/\{:0?\d*d\}/, 'formatSpecifier.python'],  // Match format specifiers like :02d
          [/\s*class\b/, { token: 'keyword', next: '@class' }],
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\s*\.)/, 'variable.instance'],
          [/\\n/, { token: 'string.newline' }],

          [/#.*/, 'comment'],  // Single-line comment
          [/\/\#/, { token: 'comment' }],  // Multi-line comment  
          [/\b\d+(\.\d+)?_\w+\b/, 'user-defined-literal'],
          [/"/, 'delimiter.quote', '@string_double'],
          [/'/, 'delimiter.quote', '@string_single'],
          [/\b\d+(\.\d+)?\b(?!\w)/, 'number'],
          [/\*\*|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=/, 'operator'],

          [/\[/, { token: 'bracket.level0', }], // bracket.level0
          //[/\w+\s*(?=\()/, { token: 'function.declaration', next: '@insideFunction' }],  // Match any function declaration
          [/#\s*include\b/, { token: 'preprocessor.include', next: '@inInclude' }],
          [/\s*def\b/, { token: 'keyword.boldBlue', next: '@def' }],
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\()/, { token: 'function-call.python', next: '@insideFunction' }],
          [/\b[a-zA-Z_]\w*\d\w*\b/, 'variable.mixed'],
          [/\b[a-zA-Z_]\w*\b/, 'variable.mixed'],

        ], fString: [
          // Opening quote (either single or double)
          [/'(?=\S)/, 'string', '@fStringSingleQuote'],  // Opening single quote
          [/"(?=\S)/, 'string', '@fStringDoubleQuote'],  // Opening double quote

          // Match variable members like {self.make}
          [/{\s*(?<=\.)\s*[a-zA-Z_][a-zA-Z0-9_]*/, 'variable.member'],

          // Any other characters within the f-string
          [/[^'"]+/, 'string'],

          // Closing quote (either single or double)
          [/'(?!\S)/, 'string', '@pop'],  // Closing single quote
          [/"(?!\S)/, 'delimiter.quote', '@pop'],  // Closing double quote
        ],

        fStringSingleQuote: [
          // Any content inside the single-quoted f-string
          [/{/, 'source', '@curly'],
          [/\*\*|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=/, 'string'],

          [/"(?=\S)/, 'string', '@fStringDoubleQuote'],  // Opening double quote
          [/\b[a-zA-Z_]\w*\b/, 'string'],
          [/'(?=\))/, 'string', '@root'],  // Closing single quote
          [/'(?!\S)/, 'string', '@root'],

        ],

        fStringDoubleQuote: [
          [/{/, 'source', '@curly'],
          // [/\*\*|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=|...|/, 'string'],
          [/(\b[a-zA-Z_]\w*\b|\.{3}|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=|==|!=|<<|>>|\+\+|--|\?|[.,'()])/, 'string'],
          [/"(?=\))/, 'string', '@root'],
          [/"(?!\S)/, 'string', '@pop']
        ],
        curly: [
          [/\s*self\b/, { token: 'variable.special.self.python' }],
          [/(?<=\.)\s*[a-zA-Z_][a-zA-Z0-9_]*/, 'variable.member'],  // Handles .thrust
          [/\b[a-zA-Z_]\w*\b/, 'function-call.arguments.python'],
          [/}/, 'source', '@pop'],
        ],

        class: [
          [/\w+/, 'source'],
          [/\(/, { token: 'delimiter.parenthesis', next: '@insideFunction' }],

          [/:/, 'source', '@pop'],  // Closing `)`, exit back to root
        ],
        print: [
          [/\b(?:len|max|isinstance|type|int|str|float|sum|set|min|abs|range|sorted|reversed|id|zip|all|any|eval|input|open|divmod|list|\?)\b/, { token: 'builtin.function', next: '@insideFunction' }],
          [/\*\*|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=/, 'operator'],
          [/f(?=\s*['"])/, { token: 'keyword.fstring', next: '@fString' }],
          [/"/, 'delimiter.quote', '@string_double'],
          [/'/, 'delimiter.quote', '@string_single'],
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\()/, { token: 'function-call.python', next: '@insideFunction' }],

          [/\s*end\b/, { token: 'keyword.argument.function-call.python', next: '@pop' }],

          [/\w+/, 'function-call.arguments.python'],

          [/\)/, { token: 'delimiterPrint.parenthesis', next: '@pop' }],
        ],
        def: [
          [/\w+\s*(?=\()/, { token: 'entity.name.function.python' }],
          [/\b\d+(\.\d+)?\b(?!\w)/, 'number'],
          [/\w+/, 'def.variable'],  // Match any parameter inside parentheses

          ////
          [/:/, 'source', '@pop'],  // Closing `)`, exit back to root
        ],
        insideFunction: [
          [/\b(?:len|max|isinstance|type|int|str|set|float|sum|min|abs|range|round|sorted|reversed|id|zip|all|any|eval|input|open|divmod|list|\?)\b/, { token: 'builtin.function', next: '@insideFunction' }],
          [/\b[a-zA-Z_]\w*\b/, 'variable'],
          [/f(?=\s*['])/, { token: 'keyword.fstring', next: '@fStringSingleQuote' }],
          ['(\d+(?:\.\d+)*)', 'string'],
          [/\s*self\b/, { token: 'variable.special.self.python' }],
          [/\b[a-zA-Z_][a-zA-Z0-9_]*(?=\()/, { token: 'function-call.python', next: '@insideFunction' }],
          [/\s*lambda\b/, { token: 'storage.type.function.lambda.python', next: '@lambda' }],
          // Variables inside `()`
          [/\*\*|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=/, 'operator'],
          [/"/, 'delimiter.quote', '@string_double'],
          [/'/, 'delimiter.quote', '@string_single'],
          [/\d+(\.\d+)?/, 'number'],  // Numbers inside `()`
          [/\)/, 'delimiter.parenthesis', '@pop'],  // Closing `)`, exit back to root
        ],
        lambda: [
          [/\w+/, 'storage.type.variable.lambda.python'],
          [/:/, 'variable', '@pop'],  // Closing `)`, exit back to root
          //
        ],
        string_double: [
          [/:/, 'string',],
          //[/-/, 'string'],  // Tokenize as punctuation

          [/\s*self\b/, { token: 'variable.special.self.python' }],
          [/[!\"#$%&'()*+,\-./:;<=>?@[\\]^_`{|}~]/, 'string'],
          [/(\b[a-zA-Z_]\w*\b|\.{3}|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=|==|!=|<<|>>|\+\+|--|\?|\(|\)|,|\.)/, 'string'],


          [/\\[a-zA-Z0-9]+/, 'character.escape.python'],  // Match any sequence following \
          [/\[\d+(;\d+)*m/, 'string'],
          [/[!\"#$%&'()*+,\-./:;<=>?@[\\]^_`{|}~]/, 'string'],
          [/%[0-9]*\.?[0-9]*[a-zA-Z]/, 'format.placeholder.python'],
          [/\{:0?\d*d\}/, 'formatSpecifier.python'],
          //[/\{|\}/, 'placeholder'],  // Match just the curly braces `{` and `}`
          [/[\w\d\p{P}]+/u, 'string'],

          [/"/, 'delimiter.quote', '@pop'] // Closing quote, exit state
        ],

        string_single: [
          [/\s*self\b/, { token: 'variable.special.self.python' }],
          [/(\b[a-zA-Z_]\w*\b|\.{3}|[+\-*\/%=!&|^<>]=?|&&|\|\||<=|>=|==|!=|<<|>>|\+\+|--|\?|\(|\)|,|\.)/, 'string'],

          // [/{\d+}/, 'placeholder'],  // Match content like {0}, {1}, etc.
          [/:/, 'string',],
          //[/[^\x00-\x7F]+/, 'symbol.unicode'],  // Unicode characters
          [/\b\d+(\.\d+)?\b(?!\w)/, 'string'],

          [/\\[a-zA-Z0-9]+/, 'character.escape.python'],  // Match any sequence following \
          [/\[\d+(;\d+)*m/, 'string'],
          [/%[0-9]*\.?[0-9]*[a-zA-Z]/, 'format.placeholder.python'],
          [/\{:0?\d*d\}/, 'formatSpecifier.python'],
          [/\{|\}/, 'placeholder'],  // Match just the curly braces `{` and `}`
          [/\b[a-zA-Z_][\w.]*\b/, 'string'],
          ['(\d+(?:\.\d+)*)', 'string'],



          [/'/, 'delimiter.quote', '@pop']
        ],

        afterDot: [

          [/\w+/, { token: 'variable.member' }],  // Match the member variable name after the dot
          [/\(/, { token: 'delimter.parenthesis', next: '@insideFunction' }], // Closing parenthesis, exit state
          //[/\b[a-zA-Z_]\w*\b/, 'variable'],  // Variables inside `()`
          [/\)/, { token: 'delimiter.parenthesis', next: '@pop' }] // Closing parenthesis, exit state
        ],
        comment: [
          [/[^\*\/]+/, 'comment'],  // Matches content inside comment (excluding */)

          // Match the comment ending (*/)
          [/\/\*/, 'comment'],  // Stay in comment state when `/*` is encountered (multi-line)

          // End of comment
          [/^\*\//, { token: 'comment', next: '@pop' }], // On `*/`, pop back to root state

        ],



        inInclude: [
          // Match content inside angle brackets
          [/</, 'delimiter.angle'],  // Handle opening angle bracket
          [/[a-zA-Z0-9_.-]+/, 'header.library'],  // Match the library name inside the angle brackets

          // Match the angle bracket `>`
          [/>/, { token: 'delimiter.angle', next: '@pop' }], // Exit the `inInclude` state once we encounter `>`
        ],
        macroDef: [
          // Match only the first word after `#define` and style it as a macro
          [/\b\w+\b/, { token: 'macro.customCpp', next: '@pop' }], // Pop back to `root` after matching
        ],
      },

    });
    monaco.languages.setMonarchTokensProvider('plaintext', {
      tokenizer: {
        root: [
          [/.*/, 'source'],
        ],
      },
    });

    // Define custom theme
    monaco.editor.defineTheme('ideLightTheme', {
      base: 'vs',
      inherit: true,

      rules: [
        { token: 'root.curlyBracket', foreground: '#2751ff' }, //blue
        { token: 'root.parenthesis', foreground: '#ff0000' }, //blue
        { token: 'root.square', foreground: '#2751ff' }, //blue
        { token: 'root.arrayName', foreground: '#4876D6' },
        { token: 'variable', foreground: '#4876D6' },
        { token: 'variable.instance', foreground: '#3e7ada' },
        { token: 'variable.member', foreground: '#0C969B' },
        { token: 'variable.mixed', foreground: '#000000' },
        { token: 'variable.special.self.python', foreground: '#AA0982' },
        { token: 'variable.special.this.cpp', foreground: '#0C969B' },
        { token: 'constant.caps', foreground: '#4876D6' },
        { token: 'keyword.argument.function-call.python', foreground: '#403F53' },
        { token: 'entity.name.function.python', foreground: '#4876D6' },
        { token: 'function-call.python', foreground: '#0C969B' },
        { token: 'function-call.arguments.python', foreground: '#4876D6' },
        { token: 'function.declaration', foreground: '#3e7ada' },
        { token: 'function.declaration.python', foreground: '#0C969B' },
        { token: 'builtin.function', foreground: '#4876D6' },
        { token: 'macro', foreground: '#2fa2a6' },
        { token: 'python.def', foreground: '#8439ac' },
        { token: 'def.variable', foreground: '#0C969B' },
        { token: 'preprocessor.define', foreground: '#8439ac' },
        { token: 'preprocessor.include', foreground: '#8439ac' },
        { token: 'placeholder', foreground: '#4876D6' },
        { token: 'delimiter', foreground: '#1331de' },
        { token: 'formatSpecifier.python', foreground: '#994CC3' },
        { token: 'format.placeholder.python', foreground: '#4876D6' },
        { token: 'storage.type.function.lambda.python', foreground: '#994CC3' },
        { token: 'storage.type.variable.lambda.python', foreground: '#0C969B' },
        { token: 'support.type.decorator', foreground: '#4876D6' },
        { token: 'keyword', foreground: '#8439ac' },
        { token: 'keyword.boldBlue', foreground: '#2751ff', fontStyle: 'bold' },
        { token: 'operator', foreground: '#8439ac' },
        { token: 'print.token', foreground: '#3e7ada' },
        { token: 'class', foreground: '#8439ac' },
        { token: 'class.name', foreground: '#0C969B' },
        { token: 'string', foreground: '#c96765' },
        { token: 'string.content', foreground: '#c96765' },
        { token: 'string.newline', foreground: '#AA0982' },
        { token: 'character.escape', foreground: '#AA0982' },
        { token: 'character.escape.python', foreground: '#AA0982' },
        { token: 'symbol.unicode', foreground: '#AA0982' },
        { token: 'number', foreground: '#AA0982' },
        { token: 'source', foreground: '#000000' },
        { token: 'header.library', foreground: '#c96765' },
        { token: 'delimiter.angle', foreground: '#000000' },
        { token: 'delimiter.curly', foreground: '#00cc00' },
        { token: 'delimiter.parenthesis', foreground: '#00cc00' },
        { token: 'delimiterPrint.parenthesis', foreground: '#00cc00' },
        { token: 'delimiter.brace', foreground: '#8439ac' },
        { token: 'delimiter.quote', foreground: '#000000' },
        { token: 'delimiter.return.quote', foreground: '#C96765' },
        { token: 'user-defined-literal', foreground: '#AA0982' },
        { token: 'bracket.level0', foreground: '#ff6600' }, //orangeish

        { token: 'test1', foreground: '#ff0000' },
      ],
      colors: {
        'editor.background': '#fbfbfb',
        //'editor.foreground': '#D4D4D4',
        'editorCursor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F0F0F0',
        "editorBracketMatch.background": "#d8e2d8", // Light red highlight
        "editorBracketMatch.border": "#b9b9b9",  // Red border around matched brackets
        'editorBracketHighlight.foreground2': '#2b601d',

        'editorHoverWidget.background': '#f4edeb',        // dark gray background
        'editorHoverWidget.border': '#007ACC',            // bright blue border
        'editorHoverWidget.foreground': '#000000',        // light gray text
        'editorHoverWidget.highlightForeground': '#FFD700', // gold for highlights
        'editorHoverWidget.statusBarBackground': '#e6d6d2', // darker gray status bar

        'editorMarkerNavigation.background': '#f4edeb',
        'editorMarkerNavigationError.background': '#B71C1C',
        'editorMarkerNavigationWarning.background': '#FFA000',
        'editorMarkerNavigationInfo.background': '#1976D2',
        'editorMarkerNavigation.foreground': '#000000', // black text for better contrast
      }
    });
    monaco.editor.defineTheme('ideDarkTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'root.curlyBracket', foreground: '#2751ff' }, //blue
        { token: 'root.parenthesis', foreground: '#2751ff' }, //blue
        { token: 'root.square', foreground: '#2751ff' }, //blue
        { token: 'root.arrayName', foreground: '#C5E478' },
        { token: 'variable', foreground: '#4876D6' },
        { token: 'variable.instance', foreground: '#C5E478' },
        { token: 'variable.member', foreground: '#BAEBE2' },
        { token: 'variable.mixed', foreground: '#D6DEEB' },
        { token: 'variable.function.pointer', foreground: '#C5E478' },
        { token: 'variable.special.self.python', foreground: '#AA0982' },
        { token: 'variable.special.this.cpp', foreground: '#0C969B' },
        { token: 'constant.caps', foreground: '#4876D6' },
        { token: 'keyword.argument.function-call.python', foreground: '#403F53' },
        { token: 'entity.name.function.python', foreground: '#4876D6' },
        { token: 'function-call.python', foreground: '#0C969B' },
        { token: 'function-call.arguments.python', foreground: '#4876D6' },
        { token: 'function.declaration', foreground: '#82AAFF' },
        { token: 'function.declaration.python', foreground: '#0C969B' },
        { token: 'builtin.function', foreground: '#4876D6' },
        { token: 'built-in', foreground: '#C5E478' },
        { token: 'macro', foreground: '#7FDBCA' },
        { token: 'python.def', foreground: '#8439ac' },
        { token: 'def.variable', foreground: '#0C969B' },
        { token: 'preprocessor.define', foreground: '#C792EA' },
        { token: 'preprocessor.include', foreground: '#C792EA' },
        { token: 'placeholder', foreground: '#4876D6' },
        { token: 'delimiter', foreground: '#1331de' },
        { token: 'formatSpecifier.python', foreground: '#994CC3' },
        { token: 'format.placeholder.python', foreground: '#4876D6' },
        { token: 'storage.type.function.lambda.python', foreground: '#994CC3' },
        { token: 'storage.type.variable.lambda.python', foreground: '#0C969B' },
        { token: 'support.type.decorator', foreground: '#4876D6' },
        { token: 'keyword', foreground: '#C792EA' },
        { token: 'keyword.new', foreground: '#7FDBCA' },
        { token: 'keyword.defined', foreground: '#C792EA' },
        { token: 'comment', foreground: '#637777' },
        { token: 'operator', foreground: '#C792EA' },
        { token: 'operator.special.delete', foreground: '#7FDBCA' },
        { token: 'print.token', foreground: '#C5E478' },
        { token: 'class', foreground: '#8439ac' },
        { token: 'class.name', foreground: '#0C969B' },
        { token: 'string', foreground: '#ECC48D' },
        { token: 'string.content', foreground: '#c96765' },
        { token: 'string.newline', foreground: '#AA0982' },
        { token: 'character.escape', foreground: '#F78C6C' },
        { token: 'character.escape.python', foreground: '#AA0982' },
        { token: 'symbol.unicode', foreground: '#AA0982' },
        { token: 'number', foreground: '#F78C6C' },
        { token: 'source', foreground: '#D6DEEB' },
        { token: 'header.library', foreground: '#ECC48D' },
        { token: 'delimiter.angle', foreground: '#D9F5DD' },
        { token: 'delimiter.curly', foreground: '#00cc00' },
        { token: 'delimiter.parenthesis', foreground: '#00cc00' },
        { token: 'delimiterPrint.parenthesis', foreground: '#00cc00' },
        { token: 'delimiter.brace', foreground: '#8439ac' },
        { token: 'delimiter.quote', foreground: '#D6DEEB' },
        { token: 'delimiter.return.quote', foreground: '#C96765' },
        { token: 'user-defined-literal', foreground: '#F78C6C' },
        { token: 'user-defined-literal.suffix', foreground: '#C792EA' },
        { token: 'bracket.level0', foreground: '#ff6600' }, //orangeish

        { token: 'test1', foreground: '#ff0000' },
      ],
      colors: {
        'editor.background': '#011627',
        'editor.foreground': '#D6DEEB',
        'editorCursor.foreground': '#80a4c2',
        'editor.lineHighlightBackground': '#072434',
        "editorBracketMatch.background": "#062a30", // Light red highlight
        "editorBracketMatch.border": "#888888"       // Red border around matched brackets
      }
    });
    monaco.languages.register({ id: 'customCpp' });
    monaco.languages.register({ id: 'customPython' });
    monaco.languages.register({ id: 'plaintext' });

    // Create Monaco editor with correct language and theme
    this.editor_ = monaco.editor.create(this.ref_, {
      fontSize: 16,
      tabSize: 2,
      insertSpaces: false,
      detectIndentation: false,
      language: language,
      theme: this.props.theme === 'LIGHT' ? 'ideLightTheme' : 'ideDarkTheme',
      automaticLayout: true,
      matchBrackets: "always",
      bracketPairColorization: {
        enabled: true
      }
    });

    this.editor_.setValue(code);
    const model = this.editor_.getModel() as monaco.editor.ITextModel;
    model.onDidChangeContent(this.onContentChange_);

  }

  formatCode() {
    this.editor_.getAction('editor.action.formatDocument').run()
  }

  changeFormatter(formattingFunction: (code: string, tabSize: number, insertSpaces: boolean) => string): void {
    monaco.languages.registerDocumentFormattingEditProvider('customCpp', {
      provideDocumentFormattingEdits(model, options) {
        return [{
          range: model.getFullModelRange(),
          text: formattingFunction(model.getValue(), options.tabSize, options.insertSpaces).replace(/\s+$/, '')
        }];
      }
    });
  }

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


  }
  //
  componentDidUpdate(nextProps: Props) {
    if (!this.editor_) return;
    const { code, language, autocomplete, theme } = nextProps;


    if (language === 'customCpp' || language === 'customPython' || language === 'plaintext') {
      this.changeFormatter(format);
    }

    if (theme !== this.props.theme) {

      monaco.editor.setTheme(this.props.theme === 'LIGHT' ? 'ideLightTheme' : 'ideDarkTheme');
    }

    const model = this.editor_.getModel() as monaco.editor.ITextModel;
    if (!this.guard_ && code !== model.getValue()) {
      model.setValue(nextProps.code);
      this.guard_ = false;
    }

    monaco.editor.setModelLanguage(model, language);

    const monacoMessages = (this.props.messages || []).map(Message.toMonaco).reduce((a, b) => [...a, ...b], []);
    monaco.editor.setModelMarkers(model, '', monacoMessages);

    if (autocomplete !== this.props.autocomplete) {
      this.editor_.updateOptions(Ivygate.getAutocompleteEditorOptions(autocomplete));
    }
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
      autoSurround: autocomplete ? 'languageDefined' : 'never',
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

