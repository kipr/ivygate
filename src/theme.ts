export interface ButtonColor {
  disabled: string;
  standard: string;
  hover: string;
  border?: string;
  textColor?: string;
  textShadow?: string;
}

export const GREEN: ButtonColor = Object.freeze({
  disabled: '#507255',
  standard: '#488b49',
  hover: '#4aad52'
});

export const LIGHTMODE_GREEN: ButtonColor = Object.freeze({
  disabled: '#507255',
  standard: '#89c28a',
  hover: '#4aad52'
});

export const RED: ButtonColor = Object.freeze({
  disabled: '#735350',
  standard: '#8C494C',
  hover: '#AD4C4B'
});

export const BLUE: ButtonColor = Object.freeze({
  disabled: '#4f5673',
  standard: '#495d8c',
  hover: '#4b64ad'
});

export const BROWN: ButtonColor = Object.freeze({
  disabled: '#72674f',
  standard: '#8a7547',
  hover: '#ab8c49',
});

export const LIGHTMODE_YES: ButtonColor = Object.freeze({
  disabled: '#808080',
  border: '#1f7a72',
  standard: "#2AA298",
  hover: "#34cbbe",
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const LIGHTMODE_NO: ButtonColor = Object.freeze({
  disabled: '#507255',
  border: '#800000',
  standard: "#cc0000",
  hover: "#ff1a1a",
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const DARKMODE_YES: ButtonColor = Object.freeze({
  disabled: '#5c665e',
  standard: '#488b49',
  hover: '#4aad52',
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',
});

export const DARKMODE_NO: ButtonColor = Object.freeze({
  disabled: '#735350',
  standard: '#8C494C',
  hover: '#AD4C4B',
  textColor: 'white',
  textShadow: '2px 2px 4px rgba(0,0,0,0.9)',

});

export interface Theme {
  themeName: string;

  foreground: 'white' | 'black';
  color: string;
  backgroundColor: string;
  iconColor: string;
  whiteText: string;

  titleBarBackground: string;
  fileContainerBackground: string;
  leftBarContainerBackground: string;
  editorPageBackground: string;
  startContainerBackground: string;
  editorConsoleBackground: string;
  editorBackground: string;
  homeStartContainerBackground: string;
  selectedUserBackground: string;
  selectedProjectBackground: string;
  selectedFileBackground: string;
  hoverFileBackground: string;
  hoverOptionBackground: string;
  confirmMessageBackground: string;
  successMessageBackground: string;

  dialogBoxTitleBackground: string;
  unselectedBackground: string;
  contextMenuBackground: string;

  runButtonColor: ButtonColor;
  yesButtonColor: ButtonColor;
  noButtonColor: ButtonColor;

  borderColor: string;
  borderRadius: number;
  widget: {
    padding: number;
  };
  itemPadding: number;
  switch: {
    on: {
      primary: string;
      secondary: string;
    };
    off: {
      primary: string;
      secondary: string;
    }
  };

  transparentBackgroundColor: (a: number) => string;
  lighten: (frac: number) => string;
  darken: (frac: number) => string;
}

export const COMMON: Theme = {
  themeName: 'common',
  foreground: undefined,
  backgroundColor: undefined,
  transparentBackgroundColor: undefined,
  color: undefined,
  titleBarBackground: undefined,
  startContainerBackground: undefined,
  homeStartContainerBackground: undefined,
  selectedUserBackground: undefined,
  selectedProjectBackground: undefined,
  selectedFileBackground: undefined,
  hoverFileBackground: undefined,
  fileContainerBackground: undefined,
  leftBarContainerBackground: undefined,
  editorPageBackground: undefined,
  editorConsoleBackground: undefined,
  confirmMessageBackground: undefined,
  successMessageBackground: undefined,
  editorBackground: undefined,
  yesButtonColor: undefined,
  noButtonColor: undefined,
  hoverOptionBackground: undefined,
  dialogBoxTitleBackground: undefined,
  whiteText: undefined,
  unselectedBackground: undefined,
  borderColor: undefined,
  runButtonColor: undefined,
  contextMenuBackground: undefined,
  borderRadius: 10,
  widget: {
    padding: 10
  },
  itemPadding: 5,
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgba(255, 255, 255, 0.2)'
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)'
    }
  },
  lighten: undefined,
  darken: undefined,

  iconColor: undefined
};

export const LIGHT: Theme = {
  ...COMMON,
  themeName: 'LIGHT',
  whiteText: 'white',
  color: '#403f53',
  borderColor: '#ede0e0',
  iconColor: '#f5ebeb',
  foreground: 'white',
  backgroundColor: '#ffffff',
  titleBarBackground: '#f4ecec',
  startContainerBackground: '#ebdbdc',
  dialogBoxTitleBackground: '#e3cece',
  editorPageBackground: '#FBFBFB',
  editorConsoleBackground: '#fff6f7',
  editorBackground: '#fbfbfb',
  contextMenuBackground: '#ffffff',

  unselectedBackground: '#f4ebec',
  fileContainerBackground: '#f4ecec',
  leftBarContainerBackground: '#f4ecec',
  homeStartContainerBackground: '#f4ebec',
  confirmMessageBackground: '#ff4d4d',
  successMessageBackground: '#5dd5cb',

  selectedUserBackground: '#dadada',
  selectedProjectBackground: '#dadada',
  selectedFileBackground: '#d3e8f9',

  hoverFileBackground: '#e4f1fb',
  hoverOptionBackground: '#e4f1fb',

  yesButtonColor: LIGHTMODE_YES,
  noButtonColor: LIGHTMODE_NO,
  runButtonColor: LIGHTMODE_GREEN,

  transparentBackgroundColor: (a) => `rgba(255, 255, 255, ${a})`,
  switch: {
    on: {
      primary: 'rgb(0, 0, 0)',
      secondary: 'rgb(72, 139, 73)',
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(0, 0, 0, 0.1)',
    },
  },
  lighten: (frac) => `rgba(0, 0, 0, ${frac})`,
  darken: (frac) => `rgba(255, 255, 255, ${frac})`,
};

export const DARK: Theme = {
  ...COMMON,
  themeName: 'DARK',
  color: '#ffffff',
  borderColor: '#323232',
  foreground: 'black',
  backgroundColor: '#212121',
  titleBarBackground: '#212121',

  dialogBoxTitleBackground: '#212121',
  editorPageBackground: '#212121',
  editorConsoleBackground: '#212121',
  editorBackground: '#212121',
  contextMenuBackground: '#212121',

  fileContainerBackground: '#343436',
  leftBarContainerBackground: '#212121',
  homeStartContainerBackground: '#333333',
  startContainerBackground: '#404040',
  unselectedBackground: '#343436',
  confirmMessageBackground: '#ff1a1a',
  successMessageBackground: '#488b49',

  selectedUserBackground: '#3f3f3f',
  selectedProjectBackground: '#3f3f3f',
  selectedFileBackground: '#3f3f3f',

  hoverFileBackground: `rgba(255, 255, 255, 0.1)`,
  hoverOptionBackground: `rgba(255, 255, 255, 0.1)`,


  yesButtonColor: DARKMODE_YES,
  noButtonColor: DARKMODE_NO,
  runButtonColor: GREEN,

  transparentBackgroundColor: (a) => `rgba(${0x21}, ${0x21}, ${0x21}, ${a})`,
  switch: {
    on: {
      primary: 'rgb(255, 255, 255)',
      secondary: 'rgb(72, 139, 73)',
    },
    off: {
      primary: 'rgb(127, 127, 127)',
      secondary: 'rgba(255, 255, 255, 0.1)',
    },
  },
  lighten: (frac) => `rgba(255, 255, 255, ${frac})`,
  darken: (frac) => `rgba(0, 0, 0, ${frac})`,
};

export interface ThemeProps {
  theme: Theme;
}