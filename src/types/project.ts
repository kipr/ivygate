import ProgrammingLanguage from './programmingLanguage';
import { FileInfo } from './fileInfo';
export type Project = {
  projectName: string;
  projectLanguage: ProgrammingLanguage;
  includeFolderFiles: string[];
  srcFolderFiles: string[];
  dataFolderFiles: string[];
};

export type UploadedProject = {
  projectName: string;
  projectLanguage: ProgrammingLanguage;
  configFile: FileInfo;
  includeFolderFiles: FileInfo[];
  srcFolderFiles: FileInfo[];
  dataFolderFiles: FileInfo[];
}

export const BLANK_PROJECT: Project = {
  projectName: '',
  projectLanguage: 'c',
  includeFolderFiles: [],
  srcFolderFiles: [],
  dataFolderFiles: [],
};