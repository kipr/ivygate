import LocalizedString from "../src/util/LocalizedString";
import tr from "../src/i18n";
import {ProjectCreationType, FileCreationTypeAction, FileCreationTypeActionSimple, ClassroomCreationType, UserCreationType} from "../src/types/creationTypes";

export const PROJECT_CREATION_LABEL: Record<string, LocalizedString> = {
  [ProjectCreationType.ADD]: tr("+"),
  [ProjectCreationType.CREATE_PROJECT]: tr("Create Project"),
  [ProjectCreationType.UPLOAD_PROJECT]: tr("Upload Project"),
};

export const FILE_CREATION_LABEL: Record<string, LocalizedString> = {
  [FileCreationTypeAction.ADD]: tr("+"),
  [FileCreationTypeAction.CREATE_FILE]: tr("Create File"),
  [FileCreationTypeAction.UPLOAD_FILE]: tr("Upload File"),
};

export const FILE_CREATION_SIMPLE_LABEL: Record<string, LocalizedString> = {
  [FileCreationTypeActionSimple.ADD]: tr("+"),
  [FileCreationTypeActionSimple.CREATE_FILE]: tr("Create File"),
};

export const CLASSROOM_CREATION_LABEL: Record<string, LocalizedString> = {
  [ClassroomCreationType.ADD]: tr("+"),
  [ClassroomCreationType.CREATE_CLASSROOM]: tr("Create Classroom"),
};

export const USER_CREATION_LABEL: Record<string, LocalizedString> = {
  [UserCreationType.ADD]: tr("+"),
  [UserCreationType.CREATE_USER]: tr("Create User"),
  [UserCreationType.UPLOAD_USER]: tr("Upload User"),
};