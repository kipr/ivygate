import ProgrammingLanguage from './programmingLanguage';

export type Project = {
  projectName: string;
  projectLanguage: ProgrammingLanguage;
  includeFolderFiles: string[];
  srcFolderFiles: string[];
  dataFolderFiles: string[];
};

export const BLANK_PROJECT: Project = {
  projectName: '',
  projectLanguage: 'c',
  includeFolderFiles: [],
  srcFolderFiles: [],
  dataFolderFiles: [],
};