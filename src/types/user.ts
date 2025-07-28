import { Project } from './project';
import { InterfaceMode } from './interface';
import Classroom  from './classroomTypes';

export type User = {
  userName: string;
  interfaceMode: InterfaceMode;
  projects: Project[];
  classroomName?: string;
};

export const BLANK_USER: User = {userName: '', interfaceMode: InterfaceMode.SIMPLE, projects: [], classroomName: ''};