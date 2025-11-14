import ProgrammingLanguage from './programmingLanguage';
import { FileInfo } from './fileInfo';
import LocalizedString from '../util/LocalizedString';
import tr from '../i18n';

interface ProjectBase {
  projectName: string;
  projectLanguage: ProgrammingLanguage;
}

export interface Project extends ProjectBase {
  includeFolderFiles: string[];
  srcFolderFiles: string[];
  dataFolderFiles: string[];
}

export interface SimClassroomProject extends ProjectBase {
  type: string; //Default, JBC0, JBC1, etc.
  code: string;
}



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