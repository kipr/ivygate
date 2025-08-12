import { Project, UploadedProject } from './project';
import { InterfaceMode } from './interface';
import Classroom  from './classroomTypes';
import { FileInfo } from './fileInfo';
export type User = {
  userName: string;
  interfaceMode: InterfaceMode;
  projects: Project[];
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