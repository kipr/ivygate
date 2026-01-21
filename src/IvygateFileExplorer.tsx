import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import tr from './i18n';
import { styled } from 'styletron-react';
import { StyleProps } from './components/constants/style';
import { ThemeProps } from './components/constants/theme';
import { User, BLANK_USER, UploadedUser } from './types/user';
import { Project, BLANK_PROJECT, UploadedProject, SimClassroomProject, SimEditorProject } from './types/project';
import { InterfaceMode } from './types/interface';
import { faUsersRectangle, faUser, faFolderOpen, faFileCode, faTrash, faUserTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgrammingLanguage from './types/programmingLanguage';
import ScrollArea from './components/interface/ScrollArea';
import FileUploader from './FileUploader';
import { FileInfo } from './types/fileInfo';
import ProjectUploader from './ProjectUploader';
import { Fa } from './components/Fa';
import ResizeableComboBox from './components/ResizeableComboBox';
import ComboBox from './components/ComboBox';
import { ClassroomCreationType, FileCreationTypeAction, FileCreationTypeActionSimple, ProjectCreationType, UserCreationType } from './types/creationTypes';
import { Settings } from './types/settings';
import Classroom from './types/classroomTypes';
import { PROJECT_CREATION_LABEL, FILE_CREATION_LABEL, FILE_CREATION_SIMPLE_LABEL, CLASSROOM_CREATION_LABEL, USER_CREATION_LABEL } from '../i18n/creationLabels';
import UserUploader from './UserUploader';
import { Ivygate } from './Ivygate';
import Dict from './types/Dict';

export interface IvygateFileExplorerProps extends StyleProps, ThemeProps {

  ChallengeComponent?: React.ComponentType<any>;
  config: { appName?: string, component?: string };
  propsSelectedProjectName?: string;
  propFileName?: string;
  propProjectName?: string;
  propUserName?: string;
  propedFromRootFileName?: string;
  propProjectShown?: Project;
  propUserShown?: User;
  addProjectFlag?: boolean;
  addFileFlag?: boolean;
  reloadFilesFlag?: boolean;
  userSelectedFlag?: boolean;
  userDeleteFlag?: boolean;
  reloadUser?: boolean;
  reHighlightProject?: Project;
  reHighlightFile?: string;
  renameUserFlag?: boolean;
  simEditorProjects?: SimEditorProject[];
  ivygateLanguageMapping?: Dict<string>;

  propActiveLanguage?: ProgrammingLanguage;
  propUsers?: User[];
  propUserData?: Project[];
  propSettings?: Settings;
  propClassrooms?: Classroom[];

  classroomInvitationCode?: string;

  onRenameClassroom?: (classroom: Classroom) => void;

  onCopyObject?: (object: Classroom | User | Project | string) => void;
  //onPasteObject?: (toPasteObject: Classroom | User | Project | string, toPasteWhere: Classroom | User | Project | string) => void;
  onPasteObject?: (toPasteData: { pasteFromData: {}, pasteToData: {} }) => void;
  onProjectSelected?: (user: User, project: Project | SimClassroomProject, fileName: string, activeLanguage: ProgrammingLanguage) => void;
  onSimProjectSelected?: (project: SimEditorProject) => void;
  onFileSelected?: (classroom: Classroom, user: User, project: Project | SimEditorProject, fileName: string, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onSimFileSelected?: (project: SimEditorProject, fileName: string, fileType: string) => void
  onUserSelected?: (user: User) => void;
  onClassroomSelected?: (classroom: Classroom) => void;
  onAddNewClassroom?: (classroom: Classroom) => void;
  onAddNewUser?: (classroom: Classroom) => void;
  onAddNewProject?: (user: User, classroom?: Classroom) => void;
  onAddNewFile?: (user: User, project: Project, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onAddNewSimFile?: (project: SimEditorProject, fileType: string) => void;
  onDeleteClassroom?: (classroom: Classroom) => void;
  onDeleteUser?: (user: User, deleteUserFlag: boolean) => void;
  onDeleteProject?: (user: User, project: Project | SimEditorProject, deleteProjectFlag: boolean) => void;
  onDeleteSimProject?: (project: SimEditorProject) => void;
  onDeleteFile?: (user: User, project: Project | SimEditorProject, fileName: string, deleteFileFlag: boolean) => void;
  onDownloadUser?: (user: User) => void;
  onRenameUser?: (user: User) => void;
  onRemoveUserFromClassroom?: (user: User, classroom: Classroom) => void;
  onDownloadProject?: (user: User, project: Project) => void;
  onRenameProject?: (user: User, project: Project) => void;
  onMoveProject?: (user: User, project: Project) => void;
  onMoveUserToClassroom?: (user: User) => void;
  onDownloadFile?: (user: User, project: Project | SimEditorProject, fileName: string) => void;
  onRenameFile?: (user: User, project: Project | SimEditorProject, fileName: string) => void;
  onResetHighlightFlag?: () => void;
  onReloadProjects?: (user: User) => Promise<void>;
  onUploadFiles?: (user: User, project: Project, files: FileInfo[]) => void;
  onUploadProject?: (user: User, project: UploadedProject) => void;
  onUploadUser?: (uploadedUser: UploadedUser) => void;
}

interface IvygateFileExplorerPrivateProps {
  locale: LocalizedString.Language;
}
interface IvygateFileExplorerState {
  selectedClassroom?: Classroom;
  selectedUser: User;
  selectedProject: Project | SimClassroomProject | SimEditorProject;
  selectedFile: string;
  userName: string;
  error: string | null;
  projectName: string;
  fileType: string;
  contextMenuClassroom?: Classroom;
  contextMenuUser?: User;
  contextMenuFile?: string;
  deleteUserFlag: boolean;
  showProjectFiles: boolean;
  showProjects: boolean;
  showClassroomUsers: boolean;
  showClassroomContextMenu: boolean;
  showUserContextMenu: boolean;
  showProjectContextMenu: boolean;
  showFileContextMenu: boolean;
  showFileUploader: boolean;
  showProjectUploader: boolean;
  showUserUploader: boolean;
  currentUserSelected: boolean;
  activeLanguage: ProgrammingLanguage;
  contextMenuProject?: Project | SimClassroomProject;
  contextMenuPosition: { x: number; y: number } | null;
  fileCreationTypeAction: FileCreationTypeAction | null;
  includeFiles: [];
  srcFiles: [];
  userDataFiles: [];
  projects: [] | null;
  classroomCreationType: ClassroomCreationType | null;
  projectCreationType: ProjectCreationType | null;
  userCreationType: UserCreationType | null;
  users: string[];
  uploadType: 'project' | 'include' | 'src' | 'data' | 'none' | 'user';
  toCopyObject?: { copyObjectUser: User, copyObjectProject?: Project, copyObjectFile?: string };
  hoveredClassroom: string
  hoveredUser: string;
}

type Props = IvygateFileExplorerProps & IvygateFileExplorerPrivateProps;
type State = IvygateFileExplorerState;
interface ClickProps {
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}

const FileExplorerContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flex: '1',
  left: '3.5%',
  top: '6%',
  zIndex: 1,
  flexDirection: 'column',
  minWidth: '12vw',
  width: '100%',
  height: 'calc(100vh - 210px)',
  overflow: 'hidden',
  paddingBottom: '5em'
}));

const ItemIcon = styled(Fa, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'

});

const InvitationCodeContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',

}));


const Container = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  overflow: 'hidden',
  padding: '0',
  margin: '0px 0px 0px -40px',
  listStyleType: 'none',
});

const ExplorerContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',

}));

const ProjectContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  resize: 'horizontal',
  position: 'relative',
  //flex: '0 0 25rem',
  padding: '1px',
  marginLeft: '3px',
  marginRight: '3px',
  boxShadow: '4px 4px 4px rgba(0,0,0,0.2)',
  //width: '99%',
  //height: '100vh',

}));

const ProjectHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',

}));

const ProjectTitle = styled('h2', (props: ThemeProps) => ({
  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
  textAlign: 'left',
  paddingRight: '20px',
  color: props.theme.color
  //paddingBottom: '0.5em',
}));

const FileTypeTitle = styled('div', (props: ThemeProps) => ({
  width: '100%',
  fontSize: '1em',
  padding: `5px`,
  color: props.theme.color,
  fontWeight: 400,
}));

const EditorContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  height: '33vh',
  backgroundColor: props.theme.backgroundColor,
  color: props.theme.color,
  border: 'none',
  ':focus': { outline: 'none' },
  '& > *': {
    flex: 1,
    height: '100%',
  },
}));


const StyledResizeableComboBox = styled(ResizeableComboBox, (props: ThemeProps & { selectedType?: string }) => ({
  //flex: '1 0',
  //padding: '3px',
  color: props.theme.color

}));



const AddProjectItemIcon = styled(FontAwesomeIcon, {
  paddingLeft: '3px',
  paddingRight: '5px',
  height: '1.4em',
  '@media (max-width: 850px)': {
    width: '1.2rem',
  },
});

const ProjectItem = styled('li', (props: ThemeProps & { selected: boolean, }) => ({
  display: 'flex',
  color: props.theme.color,
  flexDirection: 'row',
  background: (props.selected) ? props.theme.selectedProjectBackground : props.theme.unselectedBackground,
  flexWrap: 'wrap',
  cursor: 'pointer',
  padding: '5px',
  fontWeight: props.selected ? 550 : undefined,
  fontSize: '1.44em',
  width: '100%',
  boxSizing: 'border-box',
  textOverflow: 'ellipsis',
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  borderRadius: '5px',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
}));

const ChallengeProgressContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  minWidth: '33%',


}));

const ChallengeContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 1',
  color: props.theme.color,
}));

const ChallengeProgressTitle = styled('div', (props: ThemeProps) => ({
  fontSize: '1.2em',
  textAlign: 'center',

}));

const FileTypeTitleContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  fontSize: '1.2em',
  padding: `5px`,
  fontWeight: 400,
  userSelect: 'none',
  display: 'flex',
  flexDirection: 'row',
}));

const FileTypeContainer = styled('span', (props: ThemeProps & { selected: boolean }) => ({
  width: '100%',
  backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
  padding: `5px`,
  border: `3px solid ${props.theme.borderColor}`,
  userSelect: 'none',
}));

const FileTypeItem = styled('li', (props: ThemeProps) => ({
  listStyleType: 'none',
  padding: '3px',
  borderRadius: '5px',
  boxShadow: props.theme.themeName === "DARK" ? ' 0px 7px 8px -4px rgba(0, 0, 0, 0.2), 0px 12px 17px 2px rgba(0, 0, 0, 0.14), 0px 5px 22px 4px rgba(0, 0, 0, 0.12)' : undefined,
}));

const FileContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  flex: '0 0 150px',
  marginLeft: '20px',
}));

const FileItemIcon = styled(FontAwesomeIcon, {
  paddingRight: '3px',
  alignItems: 'center',
  height: '20px'
});

const IndividualFile = styled('div', (props: ThemeProps & { selected: boolean, }) => ({
  display: 'flex',
  flexDirection: 'row',
  listStyleType: 'none',
  borderRadius: '5px',
  color: props.theme.color,
  alignItems: 'center',
  fontWeight: props.selected ? 500 : undefined,
  cursor: 'pointer',
  width: '97%',
  fontSize: '1.15em',
  backgroundColor: (props.selected) ? props.theme.selectedFileBackground : props.theme.unselectedBackground,
  padding: '3px',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
  userSelect: 'none',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
}));

const ContextMenu = styled('div', (props: ThemeProps & { x: number; y: number }) => ({
  position: "absolute",
  top: `${props.y}px`,
  left: `${props.x}px`,
  background: props.theme.contextMenuBackground,
  border: `2px solid ${props.theme.borderColor}`,
  borderRadius: "4px",
  boxShadow: "0px 4px 6px hsla(0, 0.00%, 0.00%, 0.10)",
  zIndex: 1000,
}));


const ContextMenuItem = styled('div', (props: ThemeProps) => ({
  listStyle: "none",
  padding: "10px",
  color: props.theme.color,
  margin: 0,
  cursor: "pointer",
  ':hover': {
    cursor: 'pointer',
    backgroundColor: `${props.theme.hoverFileBackground}`
  },
}));

const UsersContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  left: '4%',
  top: '4.8%',
  // height: '100vh',
  width: '95%',
  //margin: '5px',
  // marginBottom: '55px',
  margin: '5px 5px 55px 5px',
  zIndex: 1,
  minHeght: 'fit-content'
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
  paddingBottom: '4em',
}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 50px',
  border: `3px solid ${props.theme.borderColor}`,
  height: '100vh',
}));

const SectionName = styled('div', (props: ThemeProps) => ({
  width: '100%',
  fontSize: '1.44em',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'flex-start',

  boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
  padding: `5px`,
  userSelect: 'none',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
}));

const UserTitleContainer = styled('div', (props: ThemeProps & { selected: boolean }) => ({
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverOptionBackground
  },
  backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
  display: 'flex',
  fontWeight: props.selected ? 600 : undefined,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '5px'
}));

const USER_OPTIONS: ComboBox.Option[] = (() => {
  const ret: ComboBox.Option[] = [];
  for (const view of Object.values(UserCreationType)) {
    ret.push(ComboBox.option(view, view));
  }
  return ret;
})();

export const getUserCreationOptions = (
  locale: LocalizedString.Language
): ComboBox.Option[] => {
  return Object.values(UserCreationType).map((value) =>
    ComboBox.option(
      LocalizedString.lookup(USER_CREATION_LABEL[value], locale),
      value
    )
  );
};

export const getClassroomCreationOptions = (locale: LocalizedString.Language): ComboBox.Option[] =>
  Object.values(ClassroomCreationType).map((value) => ({
    text: LocalizedString.lookup(CLASSROOM_CREATION_LABEL[value], locale), // label
    data: value, // stable id
  }));


export const getProjectCreationOptions = (locale: LocalizedString.Language): ComboBox.Option[] =>
  Object.values(ProjectCreationType).map((value) => ({
    text: LocalizedString.lookup(PROJECT_CREATION_LABEL[value], locale), // label
    data: value, // stable id
  }
)
  
);
export const getFileCreationOptions = (locale: LocalizedString.Language): ComboBox.Option[] =>
  Object.values(FileCreationTypeAction).map((value) => ({
    text: LocalizedString.lookup(FILE_CREATION_LABEL[value], locale), // label
    data: value, // stable id
  }));

export class IvygateFileExplorer extends React.PureComponent<Props, State> {
  private selectedFileRefFE: React.MutableRefObject<string>;
  private previousSelectedFileFE: React.MutableRefObject<string>;
  private hostApp: string;
  constructor(props: Props) {
    super(props);

    this.state = {
      userName: '',
      users: [],
      selectedUser: {
        userName: '',
        interfaceMode: InterfaceMode.SIMPLE,
        projects: [],
        type: 'user'
      },
      selectedProject: {
        projectName: '',
        projectLanguage: 'c',
        includeFolderFiles: [],
        srcFolderFiles: [],
        dataFolderFiles: []
      },
      selectedFile: '',
      projects: null,
      error: null,
      projectName: '',
      activeLanguage: 'c',
      fileType: '',
      showClassroomUsers: false,
      showProjectFiles: false,
      showProjects: false,
      currentUserSelected: false,
      fileCreationTypeAction: FileCreationTypeAction.ADD,
      includeFiles: [],
      srcFiles: [],
      userDataFiles: [],
      deleteUserFlag: false,
      contextMenuPosition: null,
      showClassroomContextMenu: false,
      showUserContextMenu: false,
      showProjectContextMenu: false,
      showFileContextMenu: false,
      showFileUploader: false,
      showProjectUploader: false,
      showUserUploader: false,
      uploadType: 'none',
      classroomCreationType: ClassroomCreationType.ADD,
      projectCreationType: ProjectCreationType.ADD,
      userCreationType: UserCreationType.ADD,
      hoveredClassroom: null as string | null,
      hoveredUser: null as string | null
    };
    this.selectedFileRefFE = React.createRef();
    this.previousSelectedFileFE = React.createRef();
    this.hostApp = this.getHostApp();
        console.log("Using aadfasdff local ivygate");
    console.log("IvygateFileExplorer initialized with props:", this.props);
  }
///


  async componentDidMount(): Promise<void> {

    if (this.props.propUserShown !== undefined) {

      if (this.props.propsSelectedProjectName !== '') {
        const selectedProject = this.props.propUserShown.projects.find((project) => {
          return project.projectName === this.props.propsSelectedProjectName;
        });

        const propUserShownClassroomName = this.props.propUserShown.classroomName;
        this.setState
          ({
            selectedClassroom: this.props.propUserShown.classroomName ? this.props.propClassrooms?.find(
              (classroom) => classroom.name === this.props.propUserShown.classroomName
            ) : undefined,
            showClassroomUsers: propUserShownClassroomName !== '' || propUserShownClassroomName !== undefined,
            selectedUser: this.props.propUserShown,
            showProjects: true,
            projectName: this.props.propsSelectedProjectName,
            selectedFile: this.props.propFileName,
            activeLanguage: this.props.propActiveLanguage,
          }, () => {
            if (this.props.propUserData !== undefined && this.props.propUserData.length > 0) {
              this.setState({
                selectedProject: this.props.propUserData.find(
                  (project) => project.projectName === this.props.propsSelectedProjectName
                )
              });
            }
          });
      }

    }

  }

  async componentDidUpdate(prevProps: Props, prevState: State) {

    console.log("IvygateFileExplorer componentDidUpdate called with props:", this.props, "and state:", this.state);
    console.log("Previous props:", prevProps, "Previous state:", prevState);

    if (prevProps.propClassrooms !== this.props.propClassrooms) {
      if (this.props.propUserShown !== undefined) {
        this.setState({
          selectedClassroom: this.props.propClassrooms.find(
            (classroom) => classroom.name === this.props.propUserShown.classroomName
          ),
          selectedUser: this.props.propUserShown,
          selectedProject: this.props.propProjectShown || this.props.propUserData.find(
            (project) => project.projectName === this.props.propsSelectedProjectName
          ),
          showProjects: true,
          showClassroomUsers: true,
        }, () => {
          this.getProjects(this.state.selectedUser);
        });
      }
    }

    if (prevProps.reHighlightProject !== this.props.reHighlightProject && this.props.reHighlightProject.projectName !== '') {
      this.selectedFileRefFE.current = this.props.reHighlightProject.srcFolderFiles[0];
      if (this.props.reHighlightFile) {
        this.setState({
          selectedProject: this.props.reHighlightProject,
          activeLanguage: this.props.reHighlightProject.projectLanguage,
          selectedFile: this.props.reHighlightFile
        }, () => {
          this.props.onResetHighlightFlag();
        })
      }
      else {
        this.setState({
          selectedProject: this.props.reHighlightProject,
          activeLanguage: this.props.reHighlightProject.projectLanguage,
          selectedFile: this.props.reHighlightProject.srcFolderFiles[0]
        }, () => {
          this.props.onResetHighlightFlag();
        })
      }

    }

    if (this.props.propUsers !== prevProps.propUsers) {
      if (this.props.renameUserFlag) {
        this.setState({
          selectedUser: this.props.propUserShown
        })
      }
      else {
        if (this.props.propUserShown) {
          const foundUser = Object.values(this.props.propUsers).find(
            (user) => user.userName === this.props.propUserShown.userName
          );
          if (foundUser) {
            const foundProject = Object.values(foundUser.projects).find(
              (project) => project.projectName === this.props.propProjectShown?.projectName
            );

            this.setState({
              selectedUser: foundUser,
              selectedProject: foundProject || BLANK_PROJECT
            })

          }
        }
      }

    }
    if (this.props.propFileName !== prevProps.propFileName) {
      if (this.props.propFileName !== null) {
        this.setState({ selectedFile: this.props.propFileName });
      }
    }

    if (prevState.selectedProject !== this.state.selectedProject) {
      this.getProjects(this.state.selectedUser);
      this.selectedFileRefFE.current = '';
      if (this.props.reHighlightFile) {

        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject?.projectName,
          showProjectFiles: true,
          selectedFile: this.props.reHighlightFile,
        });
      }
      else if (this.props.propFileName !== '') {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject?.projectName,
          showProjectFiles: true,
          selectedFile: this.props.propFileName,
        });
      }
      else if (this.state.selectedProject?.projectName !== this.props.propsSelectedProjectName) {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject?.projectName,
          showProjectFiles: true,
          selectedFile: '',
        });
      }
      else if (this.props.propFileName !== null) {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject?.projectName,
          showProjectFiles: true,
          selectedFile: this.props.propFileName,
        });
      }
    }

    if (prevState.selectedUser !== this.state.selectedUser) {
      this.setState({ showProjects: true });
    }
    if (prevProps.addProjectFlag !== this.props.addProjectFlag) {
      if (this.props.addProjectFlag == false) {
        this.getProjects(this.state.selectedUser);
      }
    }

    if (prevProps.addFileFlag !== this.props.addFileFlag) {
      if (this.props.addFileFlag == false) {
        this.getProjects(this.state.selectedUser);
      }
    }

    if (
      prevProps.propFileName !== this.props.propFileName ||
      prevProps.propProjectName !== this.props.propProjectName ||
      prevProps.propActiveLanguage !== this.props.propActiveLanguage ||
      prevProps.propUserName !== this.props.propUserName ||
      prevProps.addProjectFlag !== this.props.addProjectFlag ||
      prevProps.addFileFlag !== this.props.addFileFlag
    ) {
      this.setState({
        projectName: this.props.propsSelectedProjectName
      });
    }


  }

  getHostApp = () => {
    return this.props.config?.appName || 'Ivygate';
  }
  closeContextMenu = () => {
    this.setState({ contextMenuPosition: null });
  };

  copyObject = (object: Classroom | User | Project | string) => {

    //Copying a file
    if (typeof object === "string") {
      this.setState({
        toCopyObject: { copyObjectUser: this.state.selectedUser, copyObjectProject: this.state.selectedProject as Project, copyObjectFile: object },
      });
    }
    else if (typeof object === "object" && "projectName" in object) {

      this.setState({
        toCopyObject: { copyObjectUser: this.state.selectedUser, copyObjectProject: object as Project, copyObjectFile: undefined },
      })
    }

  }

  pasteObject = (toPasteObject: {}, toPasteWhere: Classroom | User | Project | string) => {

    let toPasteData = { pasteFromData: {}, pasteToData: {} };

    //if pasting to a Project (file)
    if (typeof toPasteWhere === "object" && "projectName" in toPasteWhere) {
      toPasteData = {
        pasteFromData: {

          toPasteObject: toPasteObject,
        },
        pasteToData: {
          toPasteWhere: toPasteWhere,
          pasteWhereUser: this.state.selectedUser,
        }

      };
    }
    else if (typeof toPasteWhere === "object" && "userName" in toPasteWhere) {

      toPasteData = {
        pasteFromData: {
          toPasteObject: toPasteObject,
        },
        pasteToData: {

          pasteWhereUser: this.state.selectedUser,
        }
      };

    }

    this.props.onPasteObject?.(toPasteData);
  };

  deleteClassroom = (classroom: Classroom) => {
    this.props.onDeleteClassroom(classroom);
  }

  deleteUser = (user: User) => {
    this.props.onDeleteUser(user, true);
  }

  deleteProject = (project: Project | SimEditorProject) => {
    this.props.onDeleteSimProject?.(project as SimEditorProject);
    this.props.onDeleteProject?.(this.state.selectedUser, project as Project, true);
  }

  deleteFile = (file: string) => {
    const { selectedProject } = this.state;
    if ('srcFolderFiles' in selectedProject) {
      this.props.onDeleteFile(this.state.selectedUser, selectedProject, file, true);

    }
  }

  downloadUser = (user: User) => {
    this.props.onDownloadUser(user);
  }

  renameUser = (user: User) => {
    this.props.onRenameUser(user);
  }

  renameClassroom = (classroom: Classroom) => {
    this.props.onRenameClassroom(classroom);
  }
  removeUserFromClassroom = (user: User, classroom: Classroom) => {

    if (classroom.users.some(u => u.userName === user.userName)) {
      this.props.onRemoveUserFromClassroom(user, classroom);
    }
  }

  moveUserToClassroom = (user: User) => {
    this.props.onMoveUserToClassroom(user);
  }

  downloadProject = (project: Project) => {
    this.props.onDownloadProject(this.state.selectedUser, project);
  }

  renameProject = (project: Project) => {
    this.props.onRenameProject(this.state.selectedUser, project);
  }

  moveProject = (project: Project) => {
    this.props.onMoveProject(this.state.selectedUser, project);
  }

  downloadFile = (file: string) => {
    const { selectedProject } = this.state;
    if ('srcFolderFiles' in selectedProject) {
      this.props.onDownloadFile(this.state.selectedUser, selectedProject, file);
    }
  }

  renameFile = (file: string) => {
    const { selectedProject } = this.state;
    if ('srcFolderFiles' in selectedProject) {
      this.props.onRenameFile(this.state.selectedUser, selectedProject, file);
    }
  }

  renderClassroomContextMenu() {

    const { contextMenuPosition } = this.state;
    const { theme } = this.props;
    if (!contextMenuPosition) return null;

    const { x, y, } = contextMenuPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - menuHeight);
    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteClassroom(this.state.contextMenuClassroom);
            }}
          >
            {LocalizedString.lookup(tr("Delete Classroom"), this.props.locale)}
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameClassroom(this.state.contextMenuClassroom);
            }}
          >
            {LocalizedString.lookup(tr("Rename Classroom"), this.props.locale)}
          </li>
        </ContextMenuItem>

      </ContextMenu>
    );
  }


  renderUserContextMenu() {
    const { contextMenuPosition, contextMenuUser } = this.state;
    const { theme } = this.props;
    if (!contextMenuPosition) return null;

    const { x, y, } = contextMenuPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const menuWidth = 200;
    const menuHeight = 185;

    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));
    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteUser(this.state.contextMenuUser);
            }}
          >
            {LocalizedString.lookup(tr("Delete User"), this.props.locale)}
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadUser(this.state.contextMenuUser);
            }}
          >
           {LocalizedString.lookup(tr("Download User"), this.props.locale)}
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameUser(this.state.contextMenuUser);
            }}
          >
            {LocalizedString.lookup(tr("Rename User"), this.props.locale)}
          </li>
        </ContextMenuItem>

        {this.props.propSettings.classroomView && contextMenuUser.classroomName !== null && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.removeUserFromClassroom(this.state.contextMenuUser, this.state.selectedClassroom);
              }}
            >
              {LocalizedString.lookup(tr("Remove User from Classroom"), this.props.locale)}
            </li>
          </ContextMenuItem>

        )}

        {this.props.propSettings.classroomView && this.props.propClassrooms.length > 0 && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.moveUserToClassroom(this.state.contextMenuUser);
              }}
            >
              {LocalizedString.lookup(tr("Move User to Classroom"), this.props.locale)}
            </li>
          </ContextMenuItem>)}

        {this.state.toCopyObject && typeof this.state.toCopyObject.copyObjectProject === "object" && this.state.toCopyObject.copyObjectProject && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.pasteObject(this.state.toCopyObject, this.state.contextMenuUser);
              }}
            >
                {LocalizedString.lookup(tr("Paste Project"), this.props.locale)}
            </li>
          </ContextMenuItem>)}
      </ContextMenu>
    );
  }

  renderProjectContextMenu() {
    const { contextMenuPosition } = this.state;
    const { theme, config } = this.props;
    if (!contextMenuPosition) return null;

    const { x, y } = contextMenuPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 200;
    const menuHeight = 185;
    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));
    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteProject(this.state.contextMenuProject as Project);
            }}
          >
            {LocalizedString.lookup(tr("Delete Project"), this.props.locale)}
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadProject(this.state.contextMenuProject as Project);
            }}
          >
            {LocalizedString.lookup(tr("Download Project"), this.props.locale)}
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameProject(this.state.contextMenuProject as Project);
            }}
          >
            {LocalizedString.lookup(tr("Rename Project"), this.props.locale)}
          </li>
        </ContextMenuItem>
        {config?.component !== 'SimEditor' && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.moveProject(this.state.contextMenuProject as Project);
              }}
            >
              {LocalizedString.lookup(tr("Move Project"), this.props.locale)}
            </li>
          </ContextMenuItem>
        )}
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.copyObject(this.state.contextMenuProject as Project);
            }}
          >
            {LocalizedString.lookup(tr("Copy Project"), this.props.locale)}
          </li>
        </ContextMenuItem>
        {this.state.toCopyObject && typeof this.state.toCopyObject.copyObjectFile && config?.component !== 'SimEditor' && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.pasteObject(this.state.toCopyObject, this.state.contextMenuProject as Project);
              }}
            >
              {LocalizedString.lookup(tr("Paste File"), this.props.locale)}
            </li>
          </ContextMenuItem>)}
      </ContextMenu>

    );
  }

  renderFileContextMenu() {
    const { contextMenuPosition } = this.state;
    const { theme } = this.props;
    if (!contextMenuPosition) return null;

    const { x, y } = contextMenuPosition;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 200;
    const menuHeight = 185;
    const adjustedX = Math.min(x, viewportWidth - menuWidth);
    const adjustedY = Math.min(y, viewportHeight - (menuHeight + 50));

    return (
      <ContextMenu x={adjustedX} y={adjustedY} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteFile(this.state.contextMenuFile);
            }}
          >
            {LocalizedString.lookup(tr("Delete File"), this.props.locale)}
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadFile(this.state.contextMenuFile);
            }}
          >
           {LocalizedString.lookup(tr("Download File"), this.props.locale)}
          </li>
        </ContextMenuItem>
        {this.state.contextMenuFile !== `main.${ProgrammingLanguage.FILE_EXTENSION[this.state.activeLanguage]}` && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.renameFile(this.state.contextMenuFile);
              }}
            >
              {LocalizedString.lookup(tr("Rename File"), this.props.locale)}
            </li>
          </ContextMenuItem>
        )}
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.copyObject(this.state.contextMenuFile);
            }}
          >
            {LocalizedString.lookup(tr("Copy File"), this.props.locale)}
          </li>
        </ContextMenuItem>

      </ContextMenu>

    );
  }

  renderUploadFileView(uploadType: 'user' | 'project' | 'include' | 'src' | 'data' | 'none') {
    const { theme, locale } = this.props;

    return (
      <FileUploader
        theme={theme}
        currentUserProjectFiles={this.state.selectedProject as Project}
        onFileUpload={this.onFileUploadClose_}
        onClose={() => this.onClose()}
        locale={locale}
        currentLanguage={this.state.activeLanguage}
        uploadType={uploadType}
      />


    )
  }

  renderUploadProjectView() {
    const { theme, locale } = this.props;

    return (
      <ProjectUploader
        theme={theme}
        onProjectUpload={this.onProjectUploadClose_}
        currentUserProjects={Object.values(this.props.propUsers).find(
          (user) => user.userName === this.state.selectedUser.userName
        )?.projects as Project[] || []}
        onClose={() => this.onClose()}
        locale={locale}
        currentLanguage={this.state.activeLanguage}
        uploadType={'project'}
      />
    );
  }

  renderUploadUserView() {
    const { theme, locale } = this.props;

    return (
      <UserUploader
        theme={theme}
        onUserUpload={this.onUserUploadClose_}
        currentClassroom={this.state.selectedClassroom}
        onClose={() => this.onClose()}
        locale={locale}
        currentLanguage={this.state.activeLanguage}
        uploadType={'project'}
      />
    );
  }

  renderChallengeProgress(project: SimClassroomProject) {
    const { selectedUser } = this.state;
    const { theme, style, ChallengeComponent } = this.props;
    return (
      <ChallengeProgressContainer theme={theme}>
        <ChallengeProgressTitle theme={theme}>
          Challenge Progress
        </ChallengeProgressTitle>
        {ChallengeComponent ? (
          <ChallengeComponent theme={theme} challenge={project.challenge} challengeCompletion={project.challengeCompletion} />
        ) : (
          <div>No component received</div>
        )}

      </ChallengeProgressContainer>
    );

  }

  private onFileUploadClose_ = (files: FileInfo[]) => {
    this.props.onUploadFiles(this.state.selectedUser, this.state.selectedProject as Project, files);
  };

  private onProjectUploadClose_ = (project: UploadedProject) => {
    this.setState({
      showProjectUploader: false,
    })
    this.props.onUploadProject(this.state.selectedUser, project);
  };

  private onUserUploadClose_ = (user: UploadedUser) => {
    this.setState({
      showUserUploader: false,
    })
    this.props.onUploadUser(user);
  }

  /**
     * Right click handler for Users
     * @param event - right click event
     * @param user - user name
     */
  handleUserRightClick = (event: React.MouseEvent, user: User) => {
    event.preventDefault();

    this.setState({
      showUserContextMenu: true,
      showProjectContextMenu: false,
      showFileContextMenu: false,
      showClassroomContextMenu: false,
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuUser: user
    }, () => {
      document.addEventListener('click', this.closeContextMenu);
    });
  };

  handleClassroomRightClick = (event: React.MouseEvent, classroom: Classroom) => {
    event.preventDefault();
    this.setState({
      showClassroomContextMenu: true,
      showUserContextMenu: false,
      showProjectContextMenu: false,
      showFileContextMenu: false,
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuClassroom: classroom
    }, () => {
      document.addEventListener('click', this.closeContextMenu);
    });
  };

  private getProjects = async (name: User) => {

    const { selectedUser, selectedProject, } = this.state;
    const { propUserData } = this.props;
    this.setState({ error: null });
    try {
    }
    catch (error) {
      this.setState({ error: 'Failed to fetch projects' });
      console.error(error);
    }

  }

  /**
   * Sets the state user based on the user selected
   * @param user - The User object
   */

  private setSelectedUser = async (user: User, classroom?: Classroom) => {
    const { selectedUser } = this.state;
    const sameUserClicked = selectedUser.userName === user.userName;
    if (sameUserClicked) {

      this.setState({
        selectedUser: BLANK_USER,
        selectedProject: BLANK_PROJECT,
        showProjects: false,
        showProjectFiles: false,

      });
      return;
    }
    this.props.onUserSelected(user);
    this.setState({
      selectedUser: Object.values(this.props.propUsers).find(
        (u) => u.userName === user.userName
      ) || user,
      selectedProject: BLANK_PROJECT,
      showProjects: true,
    });
  };

  private setSelectedClassroom = async (classroom: Classroom) => {

    const { selectedClassroom } = this.state;
    const sameClassroomClicked = selectedClassroom?.name === classroom.name;
    if (sameClassroomClicked) {
      this.setState({
        selectedClassroom: null,
        selectedUser: BLANK_USER,
        selectedProject: BLANK_PROJECT,
        showProjects: null,
      });
      return;
    }
    this.setState({
      selectedClassroom: classroom,
      selectedUser: BLANK_USER,
      selectedProject: BLANK_PROJECT,
      showClassroomUsers: true,
    });
  };
  private addNewFile = async (fileType: string) => {
    const { activeLanguage, selectedUser, selectedProject } = this.state;
    const { onAddNewFile, onAddNewSimFile } = this.props;
    if (onAddNewFile) {
      if (fileType == "python") {
        this.setState({ fileType: 'py' });
        onAddNewFile(selectedUser, selectedProject as Project, activeLanguage, 'py');
      } else {
        this.setState({ fileType: fileType });
        onAddNewFile(selectedUser, selectedProject as Project, activeLanguage, fileType);
      }
    }
    if (onAddNewSimFile) {
      onAddNewSimFile(selectedProject as SimEditorProject, fileType);
    }
  }


  private onClassroomCreationSelect = (index: number, option: ComboBox.Option) => {
    const { classroomCreationType, selectedClassroom } = this.state;

    this.setState({
      classroomCreationType: option.data as ClassroomCreationType,
    }, () => {
      switch (option.data) {
        case ClassroomCreationType.ADD:
          break;
        case ClassroomCreationType.CREATE_CLASSROOM:
          this.props.onAddNewClassroom(selectedClassroom);
          this.setState({
            classroomCreationType: ClassroomCreationType.ADD,
          });
          break;

      }
    })

  };

  private onUserCreationSelect = (index: number, option: ComboBox.Option) => {
    const { userCreationType, selectedClassroom } = this.state;

    this.setState({
      userCreationType: option.data as UserCreationType,
    }, () => {
      switch (option.data) {
        case UserCreationType.ADD:
          break;
        case UserCreationType.CREATE_USER:
          this.props.onAddNewUser(selectedClassroom);
          this.setState({
            userCreationType: UserCreationType.ADD,
          });
          break;
        case UserCreationType.UPLOAD_USER:
          this.setState({
            showUserUploader: true,
            uploadType: 'user',
            userCreationType: UserCreationType.ADD,
          });
          break;
      }
    })

  };

  private onProjectCreationSelect = (index: number, option: ComboBox.Option) => {
    const { propSettings, config } = this.props;
    const { projectCreationType } = this.state;

    this.setState({
      projectCreationType: option.data as ProjectCreationType,
    }, () => {
      switch (option.data) {
        case ProjectCreationType.ADD:
          break;
        case ProjectCreationType.CREATE_PROJECT:
          if (propSettings?.classroomView) {
            this.props.onAddNewProject(this.state.selectedUser, this.state.selectedClassroom);
          } else {
            this.props.onAddNewProject(this.state.selectedUser);
          }
          this.setState({
            projectCreationType: ProjectCreationType.ADD,
          })
          break;
        case ProjectCreationType.UPLOAD_PROJECT:
          this.setState({
            showProjectUploader: true,
            uploadType: 'project',
            projectCreationType: ProjectCreationType.ADD,
          });
          break;

      }
    })



  }

  private onFileCreationSelect = (index: number, option: ComboBox.Option,) => {

    this.setState({
      fileCreationTypeAction: option.data as FileCreationTypeAction,
    }, () => {
      switch (option.data) {
        case FileCreationTypeAction.ADD:
          break;
        case FileCreationTypeAction.CREATE_FILE:
          this.addNewFile(this.state.activeLanguage);
          this.setState({
            fileCreationTypeAction: FileCreationTypeAction.ADD,
          });
          break;
        case FileCreationTypeAction.UPLOAD_FILE:
          this.setState({

          })
      }
    })

  }

  onFileCreationSelectWithContext = (fileGroup: 'h' | 'src' | 'txt' | 'include', srcType?: string) => {
    return (index: number, option: ResizeableComboBox.Option) => {
      const fileType = option.data as string;
      let fileT;

      this.setState({
        fileCreationTypeAction: option.data as FileCreationTypeAction,
      }, () => {
        if (fileGroup === 'h') {
          fileT = 'include';
        }
        else if (fileGroup === 'txt') {
          fileT = 'data';
        }
        else {
          fileT = 'src';
        }
        switch (option.data) {
          case FileCreationTypeAction.ADD:
            break;
          case FileCreationTypeAction.CREATE_FILE:
            if (srcType) {
              this.addNewFile(srcType);
            }
            else {
              this.addNewFile(fileGroup);
            }
            this.setState({
              fileCreationTypeAction: FileCreationTypeAction.ADD,
            });
            break;
          case FileCreationTypeAction.UPLOAD_FILE:
            this.setState({
              showFileUploader: true,
              uploadType: fileT,
              fileCreationTypeAction: FileCreationTypeAction.ADD,
            });
            break;
        }
      })

    };
  };



  private handleProjectClick = async (project: Project | SimClassroomProject | SimEditorProject, user: User, language: ProgrammingLanguage) => {
    const { config, onSimProjectSelected } = this.props;
    let mainFile: string;
    console.log("handleProjectClick state:", this.state);
    if (this.state.selectedUser.interfaceMode === InterfaceMode.SIMPLE && config?.component !== 'SimEditor') {
      if ('srcFolderFiles' in project && Array.isArray(project.srcFolderFiles)) {
        mainFile = project.srcFolderFiles.find(file =>
          typeof file === 'string' && file.includes('main.')
        ) || '';
      }

      this.props.onProjectSelected(user, project as Project | SimClassroomProject, mainFile, language);
      this.setState({
        selectedFile: mainFile,
      });
    }
    onSimProjectSelected?.(project as SimEditorProject);
    this.setState((prevState) => (
      {

        showProjectFiles: prevState.selectedProject === project ? false : true,
        selectedProject: prevState.selectedProject === project ? BLANK_PROJECT : project,
        activeLanguage: prevState.selectedProject === project ? null : language
      }), () => {
        console.log("handleProjectClick updated state:", this.state);
      });

  };

  private handleFileClick = async (fileName: string, projectDetails?: Project | SimEditorProject) => {
    const { selectedUser, selectedProject, selectedClassroom, fileType } = this.state;
    const { onFileSelected, onSimFileSelected, config } = this.props;

    console.log('handleFileClick called with fileName:', fileName, 'and projectDetails:', projectDetails);
    console.log("handleFileClick state before setState:", this.state);
    if (this.previousSelectedFileFE.current === null) {
      this.previousSelectedFileFE.current = fileName;
    }
    else {
      this.previousSelectedFileFE.current = this.selectedFileRefFE.current;
    }
    this.selectedFileRefFE.current = fileName;


    const [name, extension] = fileName.split('.');
    let selectedLanguage: string;
    let fileT: 'src' | 'include' | 'data' | 'none' = 'none';
    switch (extension) {
      case 'c':
        selectedLanguage = 'c';
        fileT = 'src';
        break;
      case 'cpp':
        selectedLanguage = 'cpp';
        fileT = 'src';
        break;
      case 'py':
        selectedLanguage = 'python';
        fileT = 'src';
        break;
      case 'graphical':
        selectedLanguage = 'graphical';
        fileT = 'src';
        break;
      case 'h':
        selectedLanguage = 'c';
        fileT = 'include';
        break;
      case 'txt':
        selectedLanguage = 'plaintext';
        fileT = 'data';
        break;
    }

    console.log("handleFileClick selectedLanguage:", selectedLanguage, "and fileType:", fileT);
    this.setState({
      fileType: extension,
      selectedFile: fileName
    });
    (onFileSelected || onSimFileSelected) ? config?.component === "SimEditor" ?
      onSimFileSelected(selectedProject as SimEditorProject, fileName, fileT) :
      onFileSelected(selectedClassroom, selectedUser, selectedProject as (Project | SimEditorProject), fileName, selectedLanguage as ProgrammingLanguage, fileT)
      : null;
  }

  private onClose = () => {
    const { showUserUploader, showFileUploader, showProjectUploader } = this.state;
    if (showFileUploader) {
      this.setState({ showFileUploader: false });
    }
    if (showProjectUploader) {
      this.setState({ showProjectUploader: false });
    }
    if (showUserUploader) {
      this.setState({ showUserUploader: false });
    }
  }

  /**
   * Right click handler for Projects
   * @param event - right click event
   * @param project - project name
   */
  handleProjectRightClick = (event: React.MouseEvent, project: Project | SimClassroomProject) => {
    event.preventDefault();
    this.setState({
      showProjectContextMenu: true,
      showUserContextMenu: false,
      showFileContextMenu: false,
      showClassroomContextMenu: false,
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuProject: project
    }, () => {
      document.addEventListener('click', this.closeContextMenu);
    });
  };

  /**
   * Right click handler for Files
   * @param event - right click event
   * @param file - file name
   */
  handleFileRightClick = (event: React.MouseEvent, file: string) => {
    event.preventDefault();
    this.setState({
      showFileContextMenu: true,
      showProjectContextMenu: false,
      showUserContextMenu: false,
      showClassroomContextMenu: false,
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuFile: file
    }, () => {
      document.addEventListener('click', this.closeContextMenu);
    });
  };

  renderClassroomUsers = (classroom: Classroom) => {
    const { theme, locale } = this.props;
    const { userCreationType, selectedUser } = this.state;

    const classroomUsers = classroom.users || [];
    const hostApp = this.getHostApp();

    const completeUsersInClass = Object.values(this.props.propUsers).filter((user) => {
      return user.classroomName === classroom.name;
    });

    // MAKE LIST OF ALL STATE.USERS IN GIVEN CLASSROOM
    return (
      <ProjectContainer theme={this.props.theme} key={classroom.name}>
        <ProjectHeaderContainer theme={theme}>
          <ProjectTitle theme={theme}>{LocalizedString.lookup(tr("Users"), locale)}</ProjectTitle>
          {hostApp === 'Simulator' ?
            <InvitationCodeContainer theme={theme}>
              <ProjectTitle theme={theme}>{LocalizedString.lookup(tr("Classroom Invitation Code:"), locale)}</ProjectTitle>{classroom.classroomInvitationCode}
            </InvitationCodeContainer>
            : <StyledResizeableComboBox
              options={USER_OPTIONS}
              index={USER_OPTIONS.findIndex(opt => opt.data === userCreationType)}
              onSelect={this.onUserCreationSelect}
              theme={theme}
              mainWidth={'4em'}
              mainHeight={'1.5em'}
              mainFontSize={'0.9em'}

            />}
        </ProjectHeaderContainer>

        {classroomUsers.map((user) => (
          <React.Fragment key={`user-${user.userName}`}>
            <UserTitleContainer

              theme={theme}
              selected={selectedUser?.userName === user.userName}

              onMouseEnter={() => this.setState({ hoveredUser: user.displayName ? user.displayName : user.userName })}
              onMouseLeave={() => this.setState({ hoveredUser: null })}
            >
              <ItemIcon icon={faUser} />

              <SectionName
                theme={theme}
                onContextMenu={(e) => this.handleUserRightClick(e, user)}
                onClick={() => this.setSelectedUser(user, classroom)}
              >
                {user.displayName ? LocalizedString.lookup(tr(`${user.displayName}`), locale) : LocalizedString.lookup(tr(`${user.userName}`), locale)}
              </SectionName>
              {user.displayName ? this.state.hoveredUser === user.displayName && (<ItemIcon icon={faUserTimes} onClick={() => this.deleteUser(user)} />)
                : this.state.hoveredUser === user.userName && (
                  <ItemIcon icon={faUserTimes} onClick={() => this.deleteUser(user)} />
                )
              }
            </UserTitleContainer>

            {user.displayName ? (LocalizedString.lookup(tr(this.state.selectedUser.displayName), locale)) === `${user.displayName}` && this.state.showProjects && (
              this.renderProjects()) : (LocalizedString.lookup(tr(this.state.selectedUser.userName), locale)) === `${user.userName}` && this.state.showProjects && (
                this.renderProjects()
              )}

          </React.Fragment>

        ))}

      </ProjectContainer>
    );
  };

  renderSimClassroomsProject(project: SimClassroomProject) {

    return (<EditorContainer theme={this.props.theme} >
      <Ivygate
        code={'code' in project ? project.code || '' : ''}
        language={this.props.ivygateLanguageMapping[project.projectLanguage]}
        autocomplete={false}
        onCodeChange={function (code: string): void {
          throw new Error('Function not implemented.');
        }}
        editable={false}
        theme={"DARK"}

      />
      {this.renderChallengeProgress(project as SimClassroomProject)}
    </EditorContainer>)
  }

  renderProjects = () => {
    const { theme, locale,style, config, propUsers, propClassrooms, simEditorProjects } = this.props;
    const { projectCreationType, selectedUser, showProjectFiles } = this.state;
    const userProjects =
      propUsers
        ? Object.values(propUsers)
          ?.find(user => user.userName === selectedUser.userName)
          ?.projects || []
        : [];

    const SimClassroomsProjects = propClassrooms ?
      Object.values(propClassrooms).find((classroom) => classroom.name === selectedUser.classroomName)?.users?.find((user) => user.userName === selectedUser.userName)?.projects || [] : null;

    console.log("simEditorProjects", simEditorProjects);

    const SimEditorProjects = simEditorProjects ? Object.values(simEditorProjects) : [];


    // Determine projects visual display based on host app (Simulator vs IDE (Voldigate))
    const renderedProjects = (this.hostApp === 'Simulator') && (config?.component === 'SimClassrooms')
      ? SimClassroomsProjects : config?.component === 'SimEditor' ? SimEditorProjects : userProjects;
    const projectOptions = getProjectCreationOptions(locale)
    return (
      <ProjectContainer theme={theme} >
        <ProjectHeaderContainer theme={theme}>
          <ProjectTitle theme={theme}>{LocalizedString.lookup(tr("Projects"), this.props.locale)}</ProjectTitle>
          {config?.component === 'SimulatorClassrooms' ? null : <StyledResizeableComboBox
            options={projectOptions}
            index={projectOptions.findIndex(opt => opt.data === projectCreationType)}
            onSelect={this.onProjectCreationSelect}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />}
        </ProjectHeaderContainer>

        <div style={{ borderBottom: `3px solid ${this.props.theme.borderColor}`, }} />
        <ul>
          {renderedProjects.map((project) => (
            <Container key={config?.component === 'SimEditor' ? `${project.projectName}` : `${selectedUser.userName}-${project.projectName}`}>

              <ProjectItem
                selected={
                  this.state.selectedProject?.projectName === project.projectName ||
                  this.props.propsSelectedProjectName === project.projectName ||
                  (
                    this.props.propUserShown?.projects?.some(
                      p =>
                        p.projectName === project.projectName &&
                        p.projectName === this.state.selectedProject?.projectName
                    ) &&
                    this.props.propUserShown?.userName === this.state.selectedUser?.userName
                  )
                }

                onClick={() => this.handleProjectClick(project, this.state.selectedUser, project.projectLanguage)}
                onContextMenu={(e) => this.handleProjectRightClick(e, project)} theme={theme}
              >
                <ItemIcon style={{ height: '25px' }} icon={faFolderOpen} />
                {LocalizedString.lookup(tr(project.projectName), this.props.locale)}
              </ProjectItem>

              {this.state.selectedProject?.projectName === project.projectName && this.state.showProjectFiles &&
                (this.hostApp === "Simulator" && config?.component === 'SimClassrooms' ? (
                  this.renderSimClassroomsProject(project as SimClassroomProject)
                )
                  : (config?.component === 'SimEditor' ?
                     ( (
                    project.projectLanguage === "graphical" ? (
                      this.graphicalView(project as SimEditorProject)
                    ) : (project.interfaceMode === InterfaceMode.SIMPLE ? (
                      this.simpleView(project as SimEditorProject)
                    ) : (project.interfaceMode === InterfaceMode.ADVANCED ? (
                      this.advancedView(project as SimEditorProject)
                    ) : null))
                  ))
                    : (
                      project.projectLanguage === "graphical" ? (
                        this.graphicalView(project as Project | SimEditorProject)
                      ) : (this.state.selectedUser.interfaceMode === InterfaceMode.SIMPLE ? (
                        this.simpleView(project as Project | SimEditorProject)
                      ) : (this.state.selectedUser.interfaceMode === InterfaceMode.ADVANCED ? (
                        this.advancedView(project as Project)
                      ) : null))
                    )
                  )
                )
              }
            </Container>
          ))}
        </ul>
      </ProjectContainer>
    )
  }

  graphicalView = (project: Project | SimEditorProject) => {
    const { theme, config } = this.props;
    const srcFolderFiles = config?.component === 'SimEditor' ? Object.keys((project as SimEditorProject).srcFiles) : (project as Project).srcFolderFiles;
    return (<FileTypeContainer theme={theme} selected={false}>
      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitle theme={theme}>{LocalizedString.lookup(tr("Source Files"), this.props.locale)}</FileTypeTitle>
        <FileContainer theme={theme}>
          {srcFolderFiles.map((file, i) => (

            <IndividualFile
              key={`src-${i}`}
              theme={theme}
              selected={
                (this.state.selectedFile === file || this.props.propFileName === file)
                && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
              }
              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}
            >
              <FileItemIcon icon={faFileCode} />
              {LocalizedString.lookup(tr(file), this.props.locale)}
            </IndividualFile>
          ))}

        </FileContainer>
      </FileTypeItem>

    </FileTypeContainer>);

  };

  simpleView = (project: Project | SimEditorProject) => {

    const { theme, config } = this.props;
    const { fileCreationTypeAction } = this.state;
    const srcFolderFiles = config?.component === 'SimEditor' ? Object.keys((project as SimEditorProject).srcFiles) : (project as Project).srcFolderFiles;
    console.log("render simple view");
    return <FileTypeContainer theme={theme} selected={false}>
      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle theme={theme}>{LocalizedString.lookup(tr("Source Files"), this.props.locale)}</FileTypeTitle>
          </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {Object.values(srcFolderFiles).map((file, i) => (
            <IndividualFile
              key={`src-${i}`}
              theme={theme}
              selected={
                (this.state.selectedFile === file || this.props.propFileName === file)
                && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
              }
              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}
            >
              <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />
              {LocalizedString.lookup(tr(file), this.props.locale)}
            </IndividualFile>
          ))}
        </FileContainer>
      </FileTypeItem>

    </FileTypeContainer>
  };

  advancedView = (project: Project | SimEditorProject) => {
    const { theme,config, locale} = this.props;
    const { fileCreationTypeAction } = this.state;
    const includeFolderFiles = config?.component === 'SimEditor' ? Object.keys((project as SimEditorProject).includeFiles) : (project as Project).includeFolderFiles;
    const srcFolderFiles = config?.component === 'SimEditor' ? Object.keys((project as SimEditorProject).srcFiles) : (project as Project).srcFolderFiles;
    const dataFolderFiles = config?.component === 'SimEditor' ? Object.keys((project as SimEditorProject).userDataFiles) : (project as Project).dataFolderFiles;

    const fileOptions = getFileCreationOptions(locale);
    return (<FileTypeContainer theme={theme} selected={false}>
      {project.projectLanguage != "python" && (
        <FileTypeItem theme={theme} key={`IncludeFileHeader-${project.projectName}`}>
          <FileTypeTitleContainer theme={theme} >
            <FileTypeTitle theme={theme}>{LocalizedString.lookup(tr("Include Files"), this.props.locale)}</FileTypeTitle>
            <StyledResizeableComboBox
              options={fileOptions}
              index={fileOptions.findIndex(opt => opt.data === fileCreationTypeAction)}
              onSelect={this.onFileCreationSelectWithContext('h')}
              theme={theme}
              mainWidth={'4em'}
              mainHeight={'1.5em'}
              mainFontSize={'0.9em'}

            />
          </FileTypeTitleContainer>
          <FileContainer theme={theme}>
            {includeFolderFiles.map((file, i) => (
              <IndividualFile
                key={`include-${i}`}
                theme={theme}
                selected={
                  (this.state.selectedFile === file || this.props.propFileName === file)
                  && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                  && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
                }
                onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
                <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />{LocalizedString.lookup(tr(file), this.props.locale)}
              </IndividualFile>
            ))}


          </FileContainer>
        </FileTypeItem>
      )}

      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle theme={theme}>{LocalizedString.lookup(tr("Source Files"), this.props.locale)}</FileTypeTitle>
          <StyledResizeableComboBox
            options={fileOptions}
            index={fileOptions.findIndex(opt => opt.data === fileCreationTypeAction)}
            onSelect={this.onFileCreationSelectWithContext('src', project.projectLanguage)}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {srcFolderFiles.map((file, i) => (
            <IndividualFile
              key={`src-${i}`}
              theme={theme}
              selected={
                (this.state.selectedFile === file || this.props.propFileName === file)
                && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
              }
              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
              <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />
              {LocalizedString.lookup(tr(file), this.props.locale)}
            </IndividualFile>
          ))}

        </FileContainer>
      </FileTypeItem>

      <FileTypeItem theme={theme} key={`UserDataFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle theme={theme}>{LocalizedString.lookup(tr("User Data Files"), this.props.locale)}</FileTypeTitle>
          <StyledResizeableComboBox
            options={fileOptions}
            index={fileOptions.findIndex(opt => opt.data === fileCreationTypeAction)}
            onSelect={this.onFileCreationSelectWithContext('txt')}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {dataFolderFiles.map((file, i) => (
            <IndividualFile
              key={`data-${i}`}
              theme={theme}
              selected={
                (this.state.selectedFile === file || this.props.propFileName === file)
                && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
              }
              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
              <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />
              {LocalizedString.lookup(tr(file), this.props.locale)}
            </IndividualFile>
          ))}

        </FileContainer>
      </FileTypeItem>
    </FileTypeContainer>)
  };

  render() {
    if (!this.props.theme) {
      return null;
    }

    const { props, state } = this;
    const { theme, propUsers, locale, propSettings, propClassrooms, config } = props;
    const {
      selectedUser,
      selectedClassroom,
      showUserContextMenu,
      showProjectContextMenu,
      showFileContextMenu,
      showFileUploader,
      showProjectUploader,
      showUserUploader,
      showClassroomContextMenu,
      uploadType,
      userCreationType,
      classroomCreationType
    } = state;
    const hostApp = config?.appName || 'Default';
    const component = config?.component;
    const usersArray = Object.values(propUsers || {});
    console.log("Rendering File Explorer with users:", usersArray);

    const userSections = usersArray.map((user: User) => {
      const projects = user.projects || [];

      return (
        <SectionsColumn theme={theme} key={user.userName}>
          <UserTitleContainer
            theme={theme}
            selected={selectedUser.userName === user.userName}
            onClick={() => this.setSelectedUser(user)}
          >
            <ItemIcon icon={faUser} />

            <SectionName
              theme={theme}
              onContextMenu={(e) => this.handleUserRightClick(e, user)}
            >
              {LocalizedString.lookup(tr(user.userName), locale)}
            </SectionName>
          </UserTitleContainer>

          {selectedUser.userName === user.userName &&
            this.state.showProjects &&
            this.renderProjects()}
        </SectionsColumn>
      );
    });

    const classroomSections = (propClassrooms || []).map((classroom: Classroom) => {
      return (
        <SectionsColumn theme={theme} key={classroom.name}>
          <UserTitleContainer
            theme={theme}
            selected={selectedClassroom?.name === classroom.name}

            onMouseEnter={() => this.setState({ hoveredClassroom: classroom.name })}
            onMouseLeave={() => this.setState({ hoveredClassroom: null })}
          >
            <ItemIcon icon={faUsersRectangle} />
            <SectionName
              theme={theme}
              onClick={() => this.setSelectedClassroom(classroom)}
              onContextMenu={(e) => this.handleClassroomRightClick(e, classroom)}
            >{
                LocalizedString.lookup(tr(classroom.name), locale)}

            </SectionName>
            {this.state.hoveredClassroom === classroom.name && (
              <ItemIcon icon={faTrash} onClick={() => this.deleteClassroom(classroom)} />
            )}
          </UserTitleContainer>
          {selectedClassroom?.name === classroom.name && this.state.showClassroomUsers && this.renderClassroomUsers(classroom)}


        </SectionsColumn>
      );
    });

    const usersWithoutClassroomsSection = usersArray.filter(user => !user.classroomName).map((user: User) => {
      return (
        <SectionsColumn theme={theme} key={user.userName}>
          <UserTitleContainer
            theme={theme}
            key={user.userName}
            selected={selectedUser.userName === user.userName}
            onClick={() => this.setSelectedUser(user)}
          >
            <ItemIcon icon={faUser} />
            <SectionName
              theme={theme}
              onContextMenu={(e) => this.handleUserRightClick(e, user)}
            >
              {LocalizedString.lookup(tr(user.userName), locale)}
            </SectionName>
          </UserTitleContainer>
          {selectedUser.userName === user.userName &&
            this.state.showProjects &&
            this.renderProjects()}
        </SectionsColumn>
      )

    });
    const classroomOptions = getClassroomCreationOptions(locale);
    const userOptions = getUserCreationOptions(locale);
    return (
      <div onClick={this.closeContextMenu}>

        <FileExplorerContainer
          theme={theme}
          style={{
            flex: 1,
          }}
        >


          <ExplorerContainer theme={theme}>
            {
              component === 'SimEditor' ? (
                this.renderProjects()
              ) : (
                <>
                  <h2
                    style={{ marginLeft: '6px', fontSize: '1.728em', color: theme.color }}
                  >
                    {propSettings.classroomView === true ? LocalizedString.lookup(tr("Explorer - Classrooms"), locale) : LocalizedString.lookup(tr("Explorer - Users"), locale)}
                  </h2>

                  {propSettings.classroomView === true ? (
                    <StyledResizeableComboBox
                      options={classroomOptions}
                      index={classroomOptions.findIndex(
                        opt => opt.data === classroomCreationType
                      )}
                      onSelect={this.onClassroomCreationSelect}
                      theme={theme}
                      mainWidth="5.5em"
                      mainHeight="1.5em"
                      mainFontSize="0.9em"
                    />
                  ) : (
                    <StyledResizeableComboBox
                      options={userOptions}
                      index={userOptions.findIndex(
                        opt => opt.data === userCreationType
                      )}
                      onSelect={this.onUserCreationSelect}
                      theme={theme}
                      mainWidth="4em"
                      mainHeight="1.5em"
                      mainFontSize="0.9em"
                    />
                  )}
                </>
              )
            }

          </ExplorerContainer>
          <StyledScrollArea theme={theme}>

            {/*Used for the IDE (Voldigate)*/}
            <UsersContainer theme={theme} style={{}}>
              {propSettings.classroomView === true ? classroomSections : userSections}

              {propSettings.classroomView === true ?
                propUsers.length > 0 ? <UsersContainer theme={theme} style={{}}>
                  <h3 style={{ marginLeft: '6px', fontSize: '1.3em' }}>{LocalizedString.lookup(tr('Users without Classrooms'), locale)}</h3>
                  {usersWithoutClassroomsSection}
                </UsersContainer> : null
                : null}
            </UsersContainer>
          </StyledScrollArea>
        </FileExplorerContainer>
        {config?.component === 'SimEditor' && (
          <>
            {showProjectContextMenu && this.renderProjectContextMenu()}
          </>
        )}
        {this.hostApp !== 'Simulator' && (
          <>
            {showUserContextMenu && this.renderUserContextMenu()}
            {showProjectContextMenu && this.renderProjectContextMenu()}
            {showFileContextMenu && this.renderFileContextMenu()}
            {showFileUploader && this.renderUploadFileView(uploadType)}
            {showProjectUploader && this.renderUploadProjectView()}
            {showUserUploader && this.renderUploadUserView()}
            {showClassroomContextMenu && this.renderClassroomContextMenu()}
          </>
        )}

      </div>
    );
  }
}

