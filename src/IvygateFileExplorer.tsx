import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import tr from './i18n';
import { styled } from 'styletron-react';
import { StyleProps } from './components/constants/style';
import { ThemeProps } from './components/constants/theme';
import { User, BLANK_USER } from './types/user';
import { Project, BLANK_PROJECT, UploadedProject } from './types/project';
import { InterfaceMode } from './types/interface';
import { faFolderPlus, faFileCirclePlus, faUser, faFolderOpen, faFileCode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import ProgrammingLanguage from './types/programmingLanguage';
import ScrollArea from './components/interface/ScrollArea';
import FileUploader from './FileUploader';
import { FileInfo } from './types/fileInfo';
import ProjectUploader from './ProjectUploader';
import { Fa } from './components/Fa';

export interface IvygateFileExplorerProps extends StyleProps, ThemeProps {
  propsSelectedProjectName?: string;
  propFileName?: string;
  propProjectName?: string;
  propUserName?: string;
  propedFromRootFileName?: string;
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

  onProjectSelected?: (user: User, project: Project, fileName: string, activeLanguage: ProgrammingLanguage) => void;
  onFileSelected?: (user: User, project: Project, fileName: string, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onUserSelected?: (user: User, loadUserData: boolean) => void;
  onAddNewProject?: (user: User) => void;
  onAddNewFile?: (user: User, project: Project, activeLanguage: ProgrammingLanguage, fileType: string) => void;
  onDeleteUser?: (user: User, deleteUserFlag: boolean) => void;
  onDeleteProject?: (user: User, project: Project, deleteProjectFlag: boolean) => void;
  onDeleteFile?: (user: User, project: Project, fileName: string, deleteFileFlag: boolean) => void;
  onDownloadUser?: (user: User) => void;
  onRenameUser?: (user: User) => void;
  onDownloadProject?: (user: User, project: Project) => void;
  onRenameProject?: (user: User, project: Project) => void;
  onDownloadFile?: (user: User, project: Project, fileName: string) => void;
  onRenameFile?: (user: User, project: Project, fileName: string) => void;
  onResetHighlightFlag?: () => void;
  onReloadProjects?: (user: User) => Promise<void>;
  onUploadFiles?: (user: User, project: Project, files: FileInfo[]) => void;
  onUploadProject?: (user: User, project: UploadedProject) => void;
}

interface IvygateFileExplorerPrivateProps {
  locale: LocalizedString.Language;
}
interface IvygateFileExplorerState {
  selectedUser: User;
  selectedProject: Project;
  selectedFile: string;
  userName: string;
  error: string | null;
  projectName: string;
  fileType: string;
  contextMenuUser?: User;
  contextMenuFile?: string;
  deleteUserFlag: boolean;
  showProjectFiles: boolean;
  showProjects: boolean;
  showUserContextMenu: boolean;
  showProjectContextMenu: boolean;
  showFileContextMenu: boolean;
  showFileUploader: boolean;
  showProjectUploader: boolean;
  currentUserSelected: boolean;
  activeLanguage: ProgrammingLanguage;
  contextMenuProject?: Project;
  contextMenuPosition: { x: number; y: number } | null;
  includeFiles: [];
  srcFiles: [];
  userDataFiles: [];
  projects: [] | null;
  users: string[];
  uploadType: 'project' | 'include' | 'src' | 'data' | 'none';

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
  paddingBottom: '2em'
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
  margin: '0px 0px 0px -30px',
  listStyleType: 'none',
});

const ExtraFilesContainer = styled('div', (props: ThemeProps) => ({
  borderRadius: '5px',
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'row',

  width: '98%',
  height: '2.25em',
  fontSize: '1em',
  border: `2px solid ${props.theme.borderColor}`,
}));

const ProjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  resize: 'horizontal',
  position: 'relative',
  flex: '0 0 25rem',
  padding: '1px',
  marginLeft: '3px',
  boxShadow: '4px 4px 4px rgba(0,0,0,0.2)',
  width: '99%',
  height: '100vh',
}));

const ProjectHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: `3px solid ${props.theme.borderColor}`,
  padding: '0.5px',
  fontSize: '1.2em',
  overflow: 'hidden',
  flexWrap: 'nowrap',
  gap: '1rem',
}));

const ProjectTitle = styled('h2', {
  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  flexShrink: 0,
  textAlign: 'left',
  paddingRight: '20px',
  paddingBottom: '0.5em',
});

const AddProjectText = styled('div', {
  fontSize: 'clamp(1rem, 2vw, 1em)',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

});

const AddProjectButtonContainer = styled('div', (props: ThemeProps & { selected: boolean }) => ({
  borderRadius: '5px',
  display: 'flex',
  flexDirection: 'row',
  marginTop: '1.9em',
  marginRight: '0.5em',
  width: '100%',
  height: '1.6em',
  fontSize: '1em',
  gap: '0.5rem',
  flexShrink: 1,
  flexWrap: 'nowrap',
  minWidth: 0,
}));

const AddProjectButton = styled('div', (props: ThemeProps & ClickProps) => ({
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
  marginLeft: '7px',
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
  minWidth: '7em',
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
  boxShadow: '2px 2px 4px rgba(0,0,0,0.9)',
  ':active': props.onClick && !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
    }
    : {},

  flexShrink: 1,
  flexWrap: 'nowrap'
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
  height: '100vh',
  width: '95%',
  margin: '5px',
  marginBottom: '55px',
  zIndex: 1,
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
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
      showProjectFiles: false,
      showProjects: false,
      currentUserSelected: false,
      includeFiles: [],
      srcFiles: [],
      userDataFiles: [],
      deleteUserFlag: false,
      contextMenuPosition: null,
      showUserContextMenu: false,
      showProjectContextMenu: false,
      showFileContextMenu: false,
      showFileUploader: false,
      showProjectUploader: false,
      uploadType: 'none'
    };
    this.selectedFileRefFE = React.createRef();
    this.previousSelectedFileFE = React.createRef();
  }

  async componentDidMount(): Promise<void> {
    if (this.props.propUserShown !== undefined) {
      await this.props.onReloadProjects(this.props.propUserShown);
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
    if (this.props.propUserShown !== undefined) {
      this.props.onReloadProjects(this.props.propUserShown);
    }

  }
  async componentDidUpdate(prevProps: Props, prevState: State) {

    if (prevProps.propsSelectedProjectName !== this.props.propsSelectedProjectName) {
      this.setState({
        selectedProject: this.props.propUserData.find(
          (project) => project.projectName === this.props.propsSelectedProjectName
        ),
      })
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
        const foundUser = this.props.propUsers.find((user) => user.userName === this.state.selectedUser.userName);

        if (foundUser) {
          this.setState({
            selectedUser: foundUser
          })

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
      else if (prevState.selectedProject.projectName === '') {
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

  deleteUser = (user: User) => {
    this.props.onDeleteUser(user, true);
  }

  deleteProject = (project: Project) => {
    this.props.onDeleteProject(this.state.selectedUser, project, true);
  }

  deleteFile = (file: string) => {
    ;
    this.props.onDeleteFile(this.state.selectedUser, this.state.selectedProject, file, true);
  }

  downloadUser = (user: User) => {
    this.props.onDownloadUser(user);
  }

  renameUser = (user: User) => {
    this.props.onRenameUser(user);
  }

  downloadProject = (project: Project) => {
    this.props.onDownloadProject(this.state.selectedUser, project);
  }

  renameProject = (project: Project) => {
    this.props.onRenameProject(this.state.selectedUser, project);
  }
  downloadFile = (file: string) => {
    this.props.onDownloadFile(this.state.selectedUser, this.state.selectedProject, file);
  }

  renameFile = (file: string) => {
    this.props.onRenameFile(this.state.selectedUser, this.state.selectedProject, file);
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
      </ContextMenu>

    );
  }

  renderUploadFileView(uploadType: 'project' | 'include' | 'src' | 'data' | 'none') {
    const { theme, locale } = this.props;
    return (
      <FileUploader
        theme={theme}
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
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuUser: user
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
  private setSelectedUser = async (user: User) => {

    if (this.state.selectedUser.userName !== user.userName) {
      if (this.state.projectName !== this.state.selectedProject.projectName) {
        this.setState({ showProjects: null });
      }
    }

    this.setState((prevState) => (

      {
        selectedUser: prevState.selectedUser === user ? BLANK_USER : user,
        selectedProject: this.state.selectedProject ? BLANK_PROJECT : prevState.selectedProject,

        showProjects: !this.state.showProjects
      }));
    this.props.onUserSelected(user, true);
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
    const { selectedUser, selectedProject } = this.state;

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
            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'c' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'cpp':
        this.setState({
          activeLanguage: "cpp"
        }, () => {
          if (this.props.onFileSelected) {

            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'cpp' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'py':
        this.setState({
          activeLanguage: "python"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'python' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'h':
        this.setState({
          activeLanguage: projectDetails.projectLanguage
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'c' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;
      case 'txt':
        this.setState({
          activeLanguage: "plaintext"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'plaintext' as ProgrammingLanguage, this.state.fileType);
          }
        });
        break;

      case 'graphical':
        this.setState({
          activeLanguage: "graphical"
        }, () => {
          if (this.props.onFileSelected) {
            this.props.onFileSelected(selectedUser, selectedProject, fileName, 'graphical' as ProgrammingLanguage, this.state.fileType);
          }
        })

    }
  }

  private onClose = () => {
    const { showFileUploader, showProjectUploader } = this.state;
    if (showFileUploader) {
      this.setState({ showFileUploader: false });
    }
    if (showProjectUploader) {
      this.setState({ showProjectUploader: false });
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
      contextMenuPosition: {
        x: event.pageX,
        y: event.pageY,
      },
      contextMenuFile: file
    }, () => {
      document.addEventListener('click', this.closeContextMenu);
    });
  };


  renderProjects = (projects: Project[]) => {
    const { theme } = this.props;

    return (
      <ProjectContainer theme={theme} key={this.state.selectedUser.userName}>
        <ProjectHeaderContainer theme={theme}>
          <ProjectTitle>Projects</ProjectTitle>
          <AddProjectButtonContainer
            theme={theme}
            selected={false}

          >
            <AddProjectButton theme={theme} onClick={() => this.addNewProject()}>
              <AddProjectItemIcon icon={faFolderPlus} />
              <AddProjectText  >
                {LocalizedString.lookup(tr('Create Project'), this.props.locale)}
              </AddProjectText>
            </AddProjectButton>
            |
            <AddProjectButton theme={theme} onClick={() => this.setState({ uploadType: 'project', showProjectUploader: true })}>
              <AddProjectItemIcon icon={faFolderPlus} />
              <AddProjectText >
                {LocalizedString.lookup(tr('Upload Project'), this.props.locale)}
              </AddProjectText>
            </AddProjectButton>
          </AddProjectButtonContainer>
        </ProjectHeaderContainer>
        <ul>
          {projects.map((project) => (
            <Container key={project.projectName}>

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
    return <FileTypeContainer theme={theme} selected={false}>
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
              <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />
              {file}
            </IndividualFile>
          ))}
          <ExtraFilesContainer theme={theme}>
            <ExtraFileButton theme={theme} selected={false} onClick={() => this.addNewFile("h")}>
              <FileItemIcon icon={faFileCirclePlus} />
              {LocalizedString.lookup(tr('Create File'), this.props.locale)}
            </ExtraFileButton>

          </ExtraFilesContainer>
        </FileContainer>
      </FileTypeItem>

    </FileTypeContainer>
  };

  advancedView = (project: Project) => {
    const { theme } = this.props;
    return (<FileTypeContainer theme={theme} selected={false}>
      {project.projectLanguage != "python" && (
        <FileTypeItem theme={theme} key={`IncludeFileHeader-${project.projectName}`}>
          <FileTypeTitleContainer theme={theme} >
            Include Files
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


            <ExtraFilesContainer theme={theme}>
              <ExtraFileButton theme={theme} selected={false} onClick={() => this.addNewFile("h")}>
                <FileItemIcon icon={faFileCirclePlus} />
                {LocalizedString.lookup(tr('Create File'), this.props.locale)}
              </ExtraFileButton>
              <ExtraFileButton theme={theme} selected={false} onClick={() => this.setState({ uploadType: 'include', showFileUploader: true })}>
                <FileItemIcon icon={faFileCirclePlus} />
                {LocalizedString.lookup(tr('Upload File'), this.props.locale)}
              </ExtraFileButton>
            </ExtraFilesContainer>

          </FileContainer>
        </FileTypeItem>
      )}

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
              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
              <FileItemIcon style={{ paddingRight: '7px' }} icon={faFileCode} />
              {file}
            </IndividualFile>
          ))}

          <ExtraFilesContainer theme={theme}>
            <ExtraFileButton theme={theme} selected={false} onClick={() => this.addNewFile(project.projectLanguage)}>
              <FileItemIcon icon={faFileCirclePlus} />
              {LocalizedString.lookup(tr('Create File'), this.props.locale)}
            </ExtraFileButton>
            <ExtraFileButton theme={theme} selected={false} onClick={() => this.setState({ uploadType: 'src', showFileUploader: true })}>
              <FileItemIcon icon={faFileCirclePlus} />
              {LocalizedString.lookup(tr('Upload File'), this.props.locale)}
            </ExtraFileButton>
          </ExtraFilesContainer>
        </FileContainer>
      </FileTypeItem>

      <FileTypeItem theme={theme} key={`UserDataFileHeader-${project.projectName}`}>
        <FileTypeTitleContainer theme={theme}>
          User Data Files
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

          <ExtraFilesContainer theme={theme}>
            <ExtraFileButton
              theme={theme}
              selected={false}
              onClick={() => this.addNewFile("txt")}>
              <FileItemIcon icon={faFileCirclePlus} />
              {LocalizedString.lookup(tr('Create File'), this.props.locale)}
            </ExtraFileButton>
            <ExtraFileButton theme={theme} selected={false} onClick={() => this.setState({ uploadType: 'data', showFileUploader: true })}>
              <FileItemIcon icon={faFileCirclePlus} />
              {LocalizedString.lookup(tr('Upload File'), this.props.locale)}
            </ExtraFileButton>
          </ExtraFilesContainer>
        </FileContainer>
      </FileTypeItem>
    </FileTypeContainer>)
  };

  render() {
    if (!this.props.theme) {
      return null; 
    }

    const { props, state } = this;
    const {theme, propUsers, locale } = props;
    const {
      selectedUser,
      showUserContextMenu,
      showProjectContextMenu,
      showFileContextMenu,
      showFileUploader,
      showProjectUploader,
      uploadType
    } = state;

    const userSections = (propUsers || []).map((user: User) => {
      const projects = this.props.propUserData || [];
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
          {selectedUser.userName === user.userName && this.state.showProjects && this.renderProjects(projects)}
        </SectionsColumn>
      );
    });


    return (
      <div onClick={this.closeContextMenu}>
        <FileExplorerContainer
          theme={theme}
          style={{
            flex: 1,

          }}
        >
          <h2 style={{ marginLeft: '6px', fontSize: '1.728em' }}>Explorer</h2>
          <StyledScrollArea theme={theme}>
            <UsersContainer theme={theme}>
              {userSections}
            </UsersContainer>
          </StyledScrollArea>
        </FileExplorerContainer>
        {showUserContextMenu && this.renderUserContextMenu()}
        {showProjectContextMenu && this.renderProjectContextMenu()}
        {showFileContextMenu && this.renderFileContextMenu()}
        {showFileUploader && this.renderUploadFileView(uploadType)}
        {showProjectUploader && this.renderUploadProjectView()}

      </div >
    );
  }
}

