import { Project, SimClassroomProject, UploadedProject } from './project';
import { InterfaceMode } from './interface';
import Classroom  from './classroomTypes';
import { FileInfo } from './fileInfo';
import LocalizedString from '../util/LocalizedString';
import tr from '../i18n';
export type User = {
  userName: string;
  interfaceMode: InterfaceMode;
  projects: (Project | SimClassroomProject)[];
  classroomName?: string;
};

export type UploadedUser = {
   configFile: FileInfo;
  userName: string;
  interfaceMode: InterfaceMode;
  projects: UploadedProject[];
   classroomName?: string; 
};

export const BLANK_USER: User = {userName: '', interfaceMode: InterfaceMode.SIMPLE, projects: [], classroomName: ''};

export const BLANK_UPLOAD_USER: UploadedUser = {configFile: {
  name: '',
  errorMessage: '',
  content: '',
  language: '',
  uploadType: ''
}, userName: '', interfaceMode: InterfaceMode.SIMPLE, projects: [], classroomName: ''};