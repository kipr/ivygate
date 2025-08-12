import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import tr from './i18n';
import { styled } from 'styletron-react';
import { StyleProps } from './components/constants/style';
import { ThemeProps } from './components/constants/theme';
import { User, BLANK_USER, UploadedUser } from './types/user';
import { Project, BLANK_PROJECT, UploadedProject } from './types/project';
import { InterfaceMode } from './types/interface';
import { faUsersRectangle, faUser, faFolderOpen, faFileCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgrammingLanguage from './types/programmingLanguage';
import ScrollArea from './components/interface/ScrollArea';
import FileUploader from './FileUploader';
import { FileInfo } from './types/fileInfo';
import ProjectUploader from './ProjectUploader';
import { Fa } from './components/Fa';
import ResizeableComboBox from './components/ResizeableComboBox';
import ComboBox from './components/ComboBox';
import { FileCreationTypeAction, FileCreationTypeActionSimple, ProjectCreationType, UserCreationType } from './types/creationTypes';
import { Settings } from './types/settings';
import Classroom from './types/classroomTypes';
import { to } from 'colorjs.io/fn';
import UserUploader from './UserUploader';

export interface IvygateFileExplorerProps extends StyleProps, ThemeProps {

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
  reHighlightProject: Project;
  reHighlightFile: string;
  renameUserFlag?: boolean;

  propActiveLanguage?: ProgrammingLanguage;
  propUsers: User[];
  propUserData: Project[];
  propSettings: Settings;
  propClassrooms?: Classroom[];

  onRenameClassroom?: (classroom: Classroom) => void;

  onCopyObject?: (object: Classroom | User | Project | string) => void;
  //onPasteObject?: (toPasteObject: Classroom | User | Project | string, toPasteWhere: Classroom | User | Project | string) => void;
  onPasteObject?: (toPasteData: { pasteFromData: {}, pasteToData: {} }) => void;
  onProjectSelected?: (user: User, project: Project, fileName: string, activeLanguage: ProgrammingLanguage) => void;
  onFileSelected?: (classroom: Classroom, user: User, project: Project, fileName: string, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onUserSelected?: (user: User, loadUserData: boolean) => void;
  onAddNewUser?: (classroom: Classroom) => void;
  onAddNewProject?: (user: User, classroom?: Classroom) => void;
  onAddNewFile?: (user: User, project: Project, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onDeleteUser?: (user: User, deleteUserFlag: boolean) => void;
  onDeleteProject?: (user: User, project: Project, deleteProjectFlag: boolean) => void;
  onDeleteFile?: (user: User, project: Project, fileName: string, deleteFileFlag: boolean) => void;
  onDownloadUser?: (user: User) => void;
  onRenameUser?: (user: User) => void;
  onRemoveUserFromClassroom?: (user: User, classroom: Classroom) => void;
  onDownloadProject?: (user: User, project: Project) => void;
  onRenameProject?: (user: User, project: Project) => void;
  onMoveProject?: (user: User, project: Project) => void;
  onMoveUserToClassroom?: (user: User) => void;
  onDownloadFile?: (user: User, project: Project, fileName: string) => void;
  onRenameFile?: (user: User, project: Project, fileName: string) => void;
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
  selectedProject: Project;
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
  contextMenuProject?: Project;
  contextMenuPosition: { x: number; y: number } | null;
  fileCreationTypeAction: FileCreationTypeAction | null;
  includeFiles: [];
  srcFiles: [];
  userDataFiles: [];
  projects: [] | null;
  projectCreationType: ProjectCreationType | null;
  userCreationType: UserCreationType | null;
  users: string[];
  uploadType: 'project' | 'include' | 'src' | 'data' | 'none' | 'user';
  toCopyObject?: { copyObjectUser: User, copyObjectProject?: Project, copyObjectFile?: string };

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
  width: 'auto',
  height: '100vh',
  overflow: 'hidden',
  paddingBottom: '5em'
}));

const ItemIcon = styled(Fa, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});

const Container = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  overflow: 'hidden',
  padding: '0',
  margin: '0px 0px 0px -40px',
  listStyleType: 'none',
});

const ExtraFilesContainer = styled('div', (props: ThemeProps) => ({
  borderRadius: '5px',
  display: 'flex',
  flexDirection: 'row',
  marginBottom: '0.3em',

  width: '97%',
  height: '1.6em',
  fontSize: '1em',
  gap: '0.5rem',
  flexShrink: 1,
  flexWrap: 'nowrap',
  minWidth: 0,
}));

const ProjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  resize: 'horizontal',
  position: 'relative',
  flex: '0 0 25rem',
  padding: '1px',
  marginLeft: '3px',
  marginRight: '3px',
  boxShadow: '4px 4px 4px rgba(0,0,0,0.2)',
  //width: '99%',
  height: '100vh',
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

const ProjectTitle = styled('h2', {
  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
  textAlign: 'left',
  paddingRight: '20px',
  //paddingBottom: '0.5em',
});

const FileTypeTitle = styled('div', {
  width: '100%',
  fontSize: '1em',
  padding: `5px`,
  fontWeight: 400,
});


const StyledResizeableComboBox = styled(ResizeableComboBox, (props: ThemeProps & { selectedType?: string }) => ({
  //flex: '1 0',
  //padding: '3px',

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

const ExtraFileButton = styled('div', (props: ThemeProps & ClickProps & { selected: boolean, }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  listStyleType: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '97%',
  minWidth: '168px',
  fontSize: 'clamp(1rem, 2vw, 1em)',
  padding: '3px',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
  userSelect: 'none',
  wordBreak: 'break-word',
  overflowWrap: 'anywhere',
  boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {}
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
  margin: '5px',
  marginBottom: '55px',
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


const PROJECT_OPTIONS: ComboBox.Option[] = (() => {

  const ret: ComboBox.Option[] = [];
  for (const view of Object.values(ProjectCreationType)) {
    ret.push(ComboBox.option(view, view));
  }
  return ret;
})();
const FILE_OPTIONS: ComboBox.Option[] = (() => {

  const ret: ComboBox.Option[] = [];
  for (const view of Object.values(FileCreationTypeAction)) {
    ret.push(ComboBox.option(view, view));
  }
  return ret;
})();

const SIMPLE_FILE_OPTIONS: ComboBox.Option[] = (() => {

  const ret: ComboBox.Option[] = [];
  for (const view of Object.values(FileCreationTypeActionSimple)) {
    ret.push(ComboBox.option(view, view));
  }
  return ret;
})();


export class IvygateFileExplorer extends React.PureComponent<Props, State> {
  private selectedFileRefFE: React.MutableRefObject<string>;
  private previousSelectedFileFE: React.MutableRefObject<string>;
  constructor(props: Props) {
    super(props);

    this.state = {
      userName: '',
      users: [],
      selectedUser: {
        userName: '',
        interfaceMode: InterfaceMode.SIMPLE,
        projects: []
      },
      selectedProject: {
        projectName: '',
        projectLanguage: 'c',
        includeFolderFiles: [],
        srcFolderFiles: [],
        dataFolderFiles: []
      },
      selectedFile: "",
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
      projectCreationType: ProjectCreationType.ADD,
      userCreationType: UserCreationType.ADD,
    };
    this.selectedFileRefFE = React.createRef();
    this.previousSelectedFileFE = React.createRef();
  }

  async componentDidMount(): Promise<void> {

    if (this.props.propUserShown !== undefined) {
  
      if (this.props.propUserShown.userName !== '') {
        const selectedProject = this.props.propUserShown.projects.find((project) => {
          return project.projectName === this.props.propsSelectedProjectName;
        });

        this.setState
          ({
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

  componentWillUnmount(): void {
    // if (this.props.propUserShown !== undefined) {
    //   this.props.onReloadProjects(this.props.propUserShown);
    // }

  }
  async componentDidUpdate(prevProps: Props, prevState: State) {

    if (prevProps.propClassrooms !== this.props.propClassrooms) {
    
      if (this.props.propUserShown !== undefined) {
        this.setState({
          selectedClassroom: this.props.propClassrooms.find(
            (classroom) => classroom.name === this.props.propUserShown.classroomName
          ),
          selectedUser: this.props.propUserShown,
          // selectedProject: this.props.propUserData.find(
          //   (project) => project.projectName === this.props.propsSelectedProjectName
          // ),
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
          const foundProject = Object.values(foundUser.projects).find(
            (project) => project.projectName === this.props.propProjectShown?.projectName
          );

          if (foundUser) {
            this.setState({
              selectedUser: foundUser,
              selectedProject: foundProject
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
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: this.props.reHighlightFile,
        });
      }
      else if (prevState.selectedProject.projectName !== '') {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: this.props.propFileName,
        });
      }
      else if (this.state.selectedProject.projectName !== this.props.propsSelectedProjectName) {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: '',
        });
      }
      else if (this.props.propFileName !== null) {
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
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

  closeContextMenu = () => {
    this.setState({ contextMenuPosition: null });
  };

  copyObject = (object: Classroom | User | Project | string) => {

    //Copying a file
    if (typeof object === "string") {
      this.setState({
        toCopyObject: { copyObjectUser: this.state.selectedUser, copyObjectProject: this.state.selectedProject, copyObjectFile: object },
      });
    }
    else if (typeof object === "object" && "projectName" in object) {

      this.setState({
        toCopyObject: { copyObjectUser: this.state.selectedUser, copyObjectProject: object, copyObjectFile: undefined },
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

  deleteUser = (user: User) => {
    this.props.onDeleteUser(user, true);
  }

  deleteProject = (project: Project) => {
    this.props.onDeleteProject(this.state.selectedUser, project, true);
  }

  deleteFile = (file: string) => {
    this.props.onDeleteFile(this.state.selectedUser, this.state.selectedProject, file, true);
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
    this.props.onDownloadFile(this.state.selectedUser, this.state.selectedProject, file);
  }

  renameFile = (file: string) => {
    this.props.onRenameFile(this.state.selectedUser, this.state.selectedProject, file);
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
              this.deleteUser(this.state.contextMenuUser);
            }}
          >
            Delete Classroom
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadUser(this.state.contextMenuUser);
            }}
          >
            Download Classroom
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameClassroom(this.state.contextMenuClassroom);
            }}
          >
            Rename Classroom
          </li>
        </ContextMenuItem>

      </ContextMenu>
    );
  }


  renderUserContextMenu() {
    const { contextMenuPosition } = this.state;
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
            Delete User
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadUser(this.state.contextMenuUser);
            }}
          >
            Download User
          </li>
        </ContextMenuItem>

        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameUser(this.state.contextMenuUser);
            }}
          >
            Rename User
          </li>
        </ContextMenuItem>

        {this.props.propSettings.classroomView && this.state.contextMenuUser.classroomName !== '' && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.removeUserFromClassroom(this.state.contextMenuUser, this.state.selectedClassroom);
              }}
            >
              Remove User from Classroom
            </li>
          </ContextMenuItem>

        )}

        {this.props.propSettings.classroomView && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.moveUserToClassroom(this.state.contextMenuUser);
              }}
            >
              Move User to Classroom
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
              Paste Project
            </li>
          </ContextMenuItem>)}
      </ContextMenu>
    );
  }

  renderProjectContextMenu() {
    const { contextMenuPosition } = this.state;
    const { theme } = this.props;
    if (!contextMenuPosition) return null;

    const { x, y } = contextMenuPosition;


    return (
      <ContextMenu x={x} y={y} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteProject(this.state.contextMenuProject);
            }}
          >
            Delete Project
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadProject(this.state.contextMenuProject);
            }}
          >
            Download Project
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.renameProject(this.state.contextMenuProject);
            }}
          >
            Rename Project
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.moveProject(this.state.contextMenuProject);
            }}
          >
            Move Project
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.copyObject(this.state.contextMenuProject);
            }}
          >
            Copy Project
          </li>
        </ContextMenuItem>
        {this.state.toCopyObject && typeof this.state.toCopyObject.copyObjectFile && (
          <ContextMenuItem theme={theme}>
            <li
              style={{ padding: "5px 10px" }}
              onClick={() => {
                this.pasteObject(this.state.toCopyObject, this.state.contextMenuProject);
              }}
            >
              Paste File
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

    return (
      <ContextMenu x={x} y={y} theme={theme} onClick={this.closeContextMenu}>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.deleteFile(this.state.contextMenuFile);
            }}
          >
            Delete File
          </li>
        </ContextMenuItem>
        <ContextMenuItem theme={theme}>
          <li
            style={{ padding: "5px 10px" }}
            onClick={() => {
              this.downloadFile(this.state.contextMenuFile);
            }}
          >
            Download File
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
              Rename File
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
            Copy File
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
        currentUserProjectFiles={this.state.selectedProject}
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
        )?.projects || []}
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

  private onFileUploadClose_ = (files: FileInfo[]) => {
    this.props.onUploadFiles(this.state.selectedUser, this.state.selectedProject, files);
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
    this.props.onUploadUser( user);
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
    if (this.props.onAddNewFile) {
      if (fileType == "python") {
        this.setState({ fileType: 'py' });
        this.props.onAddNewFile(selectedUser, selectedProject, activeLanguage, 'py');
      } else {
        this.setState({ fileType: fileType });
        this.props.onAddNewFile(selectedUser, selectedProject, activeLanguage, fileType);
      }
    }
  }

  /**
   * Add new project to previously selected user
   */
  private addNewProject = async () => {
    const { selectedUser } = this.state;

    if (this.props.onAddNewProject) {
      this.props.onAddNewProject(selectedUser);
    }
  }

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
    const { propSettings } = this.props;
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



  private handleProjectClick = async (project: Project, user: User, language: ProgrammingLanguage) => {


    if (this.state.selectedUser.interfaceMode === InterfaceMode.SIMPLE) {
      const mainFile = project.srcFolderFiles.find(file => file.includes('main.'));

      this.props.onProjectSelected(user, project, mainFile, language,);
      this.setState({
        selectedFile: mainFile,
      });
    }
    this.setState((prevState) => (
      {

        showProjectFiles: prevState.selectedProject === project ? false : true,
        selectedProject: prevState.selectedProject === project ? BLANK_PROJECT : project,
        activeLanguage: prevState.selectedProject === project ? null : language
      }));

  };

  private handleFileClick = async (fileName: string, projectDetails?: Project) => {
    const { selectedUser, selectedProject, selectedClassroom } = this.state;

    if (this.previousSelectedFileFE.current === null) {
      this.previousSelectedFileFE.current = fileName;
    }
    else {
      this.previousSelectedFileFE.current = this.selectedFileRefFE.current;
    }
    this.selectedFileRefFE.current = fileName;

    const [name, extension] = fileName.split('.');
    this.setState({
      fileType: extension,
      selectedFile: fileName
    });
    switch (extension) {
      case 'c':
        this.setState({
          activeLanguage: "c"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'c' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'cpp':
        this.setState({
          activeLanguage: "cpp"
        }, () => {
          if (this.props.onFileSelected) {

            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'cpp' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'py':
        this.setState({
          activeLanguage: "python"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'python' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'h':
        this.setState({
          activeLanguage: projectDetails.projectLanguage
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'c' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'txt':
        this.setState({
          activeLanguage: "plaintext"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'plaintext' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;

      case 'graphical':
        this.setState({
          activeLanguage: "graphical"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedClassroom, selectedUser, selectedProject, fileName, 'graphical' as ProgrammingLanguage, this.state.fileType);
          }
        })

    }
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
  handleProjectRightClick = (event: React.MouseEvent, project: Project) => {
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

    const completeUsersInClass = Object.values(this.props.propUsers).filter((user) => {
      return user.classroomName === classroom.name;
    });

    // MAKE LIST OF ALL STATE.USERS IN GIVEN CLASSROOM
    return (
      <ProjectContainer theme={this.props.theme} key={classroom.name}>
        <ProjectHeaderContainer theme={theme}>
          <ProjectTitle>{LocalizedString.lookup(tr("Users"), locale)}</ProjectTitle>
          <StyledResizeableComboBox
            options={USER_OPTIONS}
            index={USER_OPTIONS.findIndex(opt => opt.data === userCreationType)}
            onSelect={this.onUserCreationSelect}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </ProjectHeaderContainer>

        {classroomUsers.map((user) => (
          <React.Fragment key={`user-${user.userName}`}>
            <UserTitleContainer

              theme={theme}
              selected={selectedUser?.userName === user.userName}
              onClick={() => this.setSelectedUser(user, classroom)}
            >
              <ItemIcon icon={faUser} />

              <SectionName
                theme={theme}
                onContextMenu={(e) => this.handleUserRightClick(e, user)}
              >
                {LocalizedString.lookup(tr(`${user.userName}`), locale)}
              </SectionName>
            </UserTitleContainer>

            {(this.state.selectedUser.userName) === `${user.userName}` && this.state.showProjects && (
              this.renderProjects(user.projects || [])
            )}
          </React.Fragment>

        ))}

      </ProjectContainer>
    );
  };

  renderProjects = (projects: Project[]) => {
    const { theme } = this.props;
    const { projectCreationType, selectedUser, showProjectFiles } = this.state;

    const userProjects = Object.values(this.props.propUsers).find((user) => user.userName === selectedUser.userName)?.projects || [];

    return (
      <ProjectContainer theme={theme} >
        <ProjectHeaderContainer theme={theme}>
          <ProjectTitle>Projects</ProjectTitle>
          <StyledResizeableComboBox
            options={PROJECT_OPTIONS}
            index={PROJECT_OPTIONS.findIndex(opt => opt.data === projectCreationType)}
            onSelect={this.onProjectCreationSelect}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </ProjectHeaderContainer>

        <div style={{ borderBottom: `3px solid ${this.props.theme.borderColor}`, }} />
        <ul>
          {userProjects.map((project) => (

            <Container key={`${selectedUser?.userName}_${project.projectName}`}>

              <ProjectItem
                selected={this.state.selectedProject.projectName === project.projectName || this.props.propsSelectedProjectName === project.projectName
                  && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                }
                onClick={() => this.handleProjectClick(project, this.state.selectedUser, project.projectLanguage)}
                onContextMenu={(e) => this.handleProjectRightClick(e, project)} theme={theme}
              >
                <ItemIcon style={{ height: '25px' }} icon={faFolderOpen} />
                {project.projectName}
              </ProjectItem>

              {this.state.selectedProject.projectName === project.projectName && this.state.showProjectFiles && (
                project.projectLanguage === "graphical" ? (
                  this.graphicalView(project)
                ) : (this.state.selectedUser.interfaceMode === InterfaceMode.SIMPLE ? (
                  this.simpleView(project)
                ) : (this.state.selectedUser.interfaceMode === InterfaceMode.ADVANCED ? (
                  this.advancedView(project)
                ) : null))
              )
              }
            </Container>
          ))}
        </ul>
      </ProjectContainer>
    )
  }

  graphicalView = (project: Project) => {
    const { theme } = this.props;

    return (<FileTypeContainer theme={theme} selected={false}>
      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          Source Files
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {project.srcFolderFiles.map((file, i) => (

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
              {file}
            </IndividualFile>
          ))}

        </FileContainer>
      </FileTypeItem>

    </FileTypeContainer>);

  };

  simpleView = (project: Project) => {

    const { theme } = this.props;
    const { fileCreationTypeAction } = this.state;
    return <FileTypeContainer theme={theme} selected={false}>
      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle>Source Files</FileTypeTitle>
          <StyledResizeableComboBox
            options={SIMPLE_FILE_OPTIONS}
            index={SIMPLE_FILE_OPTIONS.findIndex(opt => opt.data === fileCreationTypeAction)}
            onSelect={this.onFileCreationSelect}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {project.srcFolderFiles.map((file, i) => (
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
              {file}
            </IndividualFile>
          ))}
        </FileContainer>
      </FileTypeItem>

    </FileTypeContainer>
  };

  advancedView = (project: Project) => {
    const { theme } = this.props;
    const { fileCreationTypeAction } = this.state;
    return (<FileTypeContainer theme={theme} selected={false}>
      {project.projectLanguage != "python" && (
        <FileTypeItem theme={theme} key={`IncludeFileHeader-${project.projectName}`}>
          <FileTypeTitleContainer theme={theme} >
            <FileTypeTitle>Include Files</FileTypeTitle>
            <StyledResizeableComboBox
              options={FILE_OPTIONS}
              index={FILE_OPTIONS.findIndex(opt => opt.data === fileCreationTypeAction)}
              onSelect={this.onFileCreationSelectWithContext('h')}
              theme={theme}
              mainWidth={'4em'}
              mainHeight={'1.5em'}
              mainFontSize={'0.9em'}

            />
          </FileTypeTitleContainer>
          <FileContainer theme={theme}>
            {project.includeFolderFiles.map((file, i) => (
              <IndividualFile
                key={`include-${i}`}
                theme={theme}
                selected={
                  (this.state.selectedFile === file || this.props.propFileName === file)
                  && (this.props.propUserShown ? this.props.propUserShown.userName === this.state.selectedUser.userName : false)
                  && (this.props.propUserShown ? this.props.propsSelectedProjectName === project.projectName : false)
                }
                onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
                <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />{file}
              </IndividualFile>
            ))}


          </FileContainer>
        </FileTypeItem>
      )}

      <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle>Source Files</FileTypeTitle>
          <StyledResizeableComboBox
            options={FILE_OPTIONS}
            index={FILE_OPTIONS.findIndex(opt => opt.data === fileCreationTypeAction)}
            onSelect={this.onFileCreationSelectWithContext('src', project.projectLanguage)}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {project.srcFolderFiles.map((file, i) => (
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
              {file}
            </IndividualFile>
          ))}

        </FileContainer>
      </FileTypeItem>

      <FileTypeItem theme={theme} key={`UserDataFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          <FileTypeTitle>User Data Files</FileTypeTitle>
          <StyledResizeableComboBox
            options={FILE_OPTIONS}
            index={FILE_OPTIONS.findIndex(opt => opt.data === fileCreationTypeAction)}
            onSelect={this.onFileCreationSelectWithContext('txt')}
            theme={theme}
            mainWidth={'4em'}
            mainHeight={'1.5em'}
            mainFontSize={'0.9em'}

          />
        </FileTypeTitleContainer>
        <FileContainer theme={theme}>
          {project.dataFolderFiles.map((file, i) => (
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
              {file}
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
    const { theme, propUsers, locale, propSettings, propClassrooms } = props;
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
      uploadType
    } = state;

    const usersArray = Object.values(propUsers || {});

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
            this.renderProjects(user.projects || [])}
        </SectionsColumn>
      );
    });

    const classroomSections = (propClassrooms || []).map((classroom: Classroom) => {

      return (
        <SectionsColumn theme={theme} key={classroom.name}>
          <UserTitleContainer
            theme={theme}
            selected={selectedClassroom?.name === classroom.name}
            onClick={() => this.setSelectedClassroom(classroom)}
          >
            <ItemIcon icon={faUsersRectangle} />
            <SectionName
              theme={theme}
              onContextMenu={(e) => this.handleClassroomRightClick(e, classroom)}
            >{
                LocalizedString.lookup(tr(classroom.name), locale)}
            </SectionName>
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
            this.renderProjects(user.projects || [])}
        </SectionsColumn>
      )

    });


    return (
      <div onClick={this.closeContextMenu}>
        <FileExplorerContainer
          theme={theme}
          style={{
            flex: 1,
          }}
        >
          <h2 style={{ marginLeft: '6px', fontSize: '1.728em' }}>{LocalizedString.lookup(tr(`Explorer - ${propSettings.classroomView === true ? 'Classrooms' : 'Users'}`), locale)}</h2>
          <StyledScrollArea theme={theme}>
            <UsersContainer theme={theme} style={{}}>
              {propSettings.classroomView === true ? classroomSections : userSections}

              {propSettings.classroomView === true ?
                <UsersContainer theme={theme} style={{}}>
                  <h3 style={{ marginLeft: '6px', fontSize: '1.3em' }}>{LocalizedString.lookup(tr(`Users without Classrooms`), locale)}</h3>
                  {usersWithoutClassroomsSection}
                </UsersContainer>
                : null}
            </UsersContainer>
          </StyledScrollArea>
        </FileExplorerContainer>
        {showUserContextMenu && this.renderUserContextMenu()}
        {showProjectContextMenu && this.renderProjectContextMenu()}
        {showFileContextMenu && this.renderFileContextMenu()}
        {showFileUploader && this.renderUploadFileView(uploadType)}
        {showProjectUploader && this.renderUploadProjectView()}
        {showUserUploader && this.renderUploadUserView()}
        {showClassroomContextMenu && this.renderClassroomContextMenu()}
      </div>
    );
  }
}

