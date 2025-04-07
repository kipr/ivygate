import { Project } from './project';
import { InterfaceMode } from './interface';

export type User = {
  userName: string;
  interfaceMode: InterfaceMode;
  projects: Project[];
};

export const BLANK_USER: User = {userName: '', interfaceMode: InterfaceMode.SIMPLE, projects: []};