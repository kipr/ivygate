import * as React from 'react';
import * as ReactDom from 'react-dom';

import Ivygate from './Ivygate';

const code = `
int main() {
  return 0;
}
`;

ReactDom.render(<Ivygate code={code} language='cpp' />, document.getElementById('root'))