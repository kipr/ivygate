import ProgrammingLanguage from './programmingLanguage';
import { FileInfo } from './fileInfo';
import LocalizedString from '../util/LocalizedString';
import tr from '../i18n';
import Dict from './Dict';

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
  eventStates: Dict<{eventName: string, completed: boolean}>;
  challenge?: any;
  challengeCompletion?: any;
}

export interface SimEditorProject extends ProjectBase {
  id: string; // Project ID for integration with Firestore-based architecture
  srcFiles: Dict<{fileName: string, fileContent: string}>;
  includeFiles?: Dict<{fileName: string, fileContent: string}>;
  userDataFiles?: Dict<{fileName: string, fileContent: string}>;

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