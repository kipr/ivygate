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
  kind: 'sim-editor';
  id: string;
  srcFiles: Dict<{fileName: string, fileContent: string}>;
  includeFiles?: Dict<{fileName: string, fileContent: string}>;
  userDataFiles?: Dict<{fileName: string, fileContent: string}>;
}

export function isSimEditorProject(
  project: Project | SimEditorProject | SimClassroomProject
): project is SimEditorProject {
  return 'kind' in project && project.kind === 'sim-editor';
}

export function createSimEditorProject(
  params: Omit<SimEditorProject, 'kind'>
): SimEditorProject {
  return { ...params, kind: 'sim-editor' };
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