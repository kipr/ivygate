type ProgrammingLanguage = 'c' | 'cpp' | 'python' | 'plaintext';

namespace ProgrammingLanguage {
  export const FILE_EXTENSION: { [key in ProgrammingLanguage]: string } = {
    c: 'c',
    cpp: 'cpp',
    python: 'py',
    plaintext: 'txt',
  };


  export const DEFAULT_CODE: { [key in ProgrammingLanguage]: string } = {
    c: '#include <stdio.h>\n#include <kipr/wombat.h>\n\nint main()\n{\n  printf("Hello, World!\\n");\n  return 0;\n}\n',
    cpp: '#include <iostream>\n#include <kipr/wombat.hpp>\n\nint main()\n{\n  std::cout << "Hello, World!" << std::endl;\n  return 0;\n}\n',
    python: '#!/usr/bin/python3\nimport os, sys\nsys.path.append("/usr/lib")\nfrom kipr import *\n\nprint(\'Hello, World!\')',
    plaintext: '*Your User Data Here*',
  };


  export const DEFAULT_HEADER_CODE = '#include <kipr/wombat.h>\n';

  export const DEFAULT_USER_DATA_CODE = '*Your User Data Here*';
}

export default ProgrammingLanguage;