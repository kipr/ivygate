
/**
 * basic indentation based on bracket, parens, and brace level
 * should work okay for the immediate future
 * Complexity: O(n) time (n chars in line), O(n+m) space (m parens in line)
 * 
 * @param line 
 * @returns [
 *  number: The change in indent level of this line (<=0, if a brace is closed)
 *  number: The indent level of the following line, based on this line (>= 0, if a brace is opened)
 * ]
 */
function getIndentationChange(line: string): [number, number] {
  let indentLevel = 0;
  const parenOpenList = ['(','[','{']
  const parenCloseList = [')',']','}']
  let parenStack = []
  for (let i = 0; i < line.length; i++) {
    if (parenOpenList.indexOf(line.charAt(i)) !== -1) {
      parenStack.push(line.charAt(i));
    } else if (
      (line.charAt(i) === ')' && parenStack[parenStack.length - 1] === '(') ||
      (line.charAt(i) === ']' && parenStack[parenStack.length - 1] === '[') ||
      (line.charAt(i) === '}' && parenStack[parenStack.length - 1] === '{')
    ) {
      parenStack.pop();
    } else if (parenCloseList.indexOf(line.charAt(i)) !== -1) {
      // closing paren without opening paren, decrease indent
      indentLevel -= 1;
    }
  }
  return [indentLevel, parenStack.length];
}

/**
 * Indent the provided c code
 * 
 * @param code The code string
 * @param options Any options for the indentation
 * @returns The indented code string
 */
function format(code: string, tabSize: number, insertSpaces: boolean): string {
  let indentLevel = 0;
  
  let indentStr: string;
  if (insertSpaces) {
    indentStr = ' '.repeat(tabSize);
  } else {
    indentStr = '\t';
  }

  let linesOfCode = code.split('\n');
  let indentedCode = '';
  linesOfCode.forEach((line) => {
    let newline = line.trim();

    let [lineIndentChange, postLineIndentChange] = getIndentationChange(newline);
    indentLevel = Math.max(0, indentLevel + lineIndentChange);

    // do the indentation
    if (indentLevel > 0) {
      newline = indentStr.repeat(indentLevel) + newline + '\n';
    } else {
      newline = newline + '\n';
    }

    indentLevel = Math.max(0, indentLevel + postLineIndentChange);
    
    indentedCode += newline;
  });

  return indentedCode;
}

export default format;