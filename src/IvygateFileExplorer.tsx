import * as React from 'react';
import server from './server';
import LocalizedString from './util/LocalizedString';
import tr from './i18n';
import { styled } from 'styletron-react';
import { StyleProps } from './style';
import { ThemeProps } from './theme';
import { User, BLANK_USER } from './types/user';
import { Project, BLANK_PROJECT } from './types/project';
import { InterfaceMode } from './types/interface';
import { faFolderPlus, faFileCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import ProgrammingLanguage from './types/programmingLanguage';




export interface IvygateFileExplorerProps extends StyleProps, ThemeProps {
//
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

  onProjectSelected?: (user: User, project: Project, fileName: string, activeLanguage: ProgrammingLanguage, fileType: string) => void;
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
  onReloadProjects?: (user: User) => void;
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
  currentUserSelected: boolean;
  activeLanguage: ProgrammingLanguage;
  contextMenuProject?: Project;
  contextMenuPosition: { x: number; y: number } | null;
  includeFiles: [];
  srcFiles: [];
  userDataFiles: [];
  projects: [] | null;
  users: string[];

}

type Props = IvygateFileExplorerProps & IvygateFileExplorerPrivateProps;
type State = IvygateFileExplorerState;


const FileExplorerContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  // flexWrap: 'wrap',
  flex: '1',
  left: '3.5%',
  top: '6%',
  zIndex: 1,
  flexDirection: 'column',
  width: 'auto',
  height: '100vh',
  overflow: 'hidden',
 }));

const Container = styled('ul', {
  display: 'flex',
  flexDirection: 'column',
  flexWrap: 'wrap',
  overflow: 'hidden',
  padding: '0',
  margin: '0px 0px 0px -30px',
  listStyleType: 'none',
});

const ProjectContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',

  flexDirection: 'column',
    //overflowY: 'scroll',
  position: 'relative',
  flex: '0 0 350px',
  padding: '1px',
  marginLeft: '3px',
  boxShadow: '4px 4px 4px rgba(0,0,0,0.2)',
  width: '99%',
  height: '100vh',
}));

const ProjectHeaderContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  borderBottom: `3px solid ${props.theme.borderColor}`,
  padding: '0.5px'
}));

const ProjectTitle = styled('h2', {
  fontSize: '1.2em',
  marginBottom: '0px',
  textAlign: 'left',
  paddingRight: '20px',
});

const AddProjectButtonContainer = styled('div', (props: ThemeProps & { selected: boolean }) => ({
  borderRadius: '5px',
  cursor: 'pointer',
  marginTop: '10px',
  padding: '5px 5px 30px 5px',
  height: '5px',
  fontSize: '12px',
  alignItems: 'right',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverOptionBackground
  },
}));

const AddProjectItemIcon = styled(FontAwesomeIcon, {
  paddingLeft: '3px',
  paddingRight: '5px',
  alignItems: 'center',
  height: '15px'
});

const ProjectItem = styled('li', (props: ThemeProps & { selected: boolean, }) => ({
  display: 'flex',
  flexDirection: 'column',
  background: (props.selected) ? props.theme.selectedProjectBackground : props.theme.unselectedBackground,
  flexWrap: 'wrap',
  cursor: 'pointer',
  padding: '5px',
  width: '100%',
  boxSizing: 'border-box',
  textOverflow: 'ellipsis',
  whiteSpace: 'normal',
  borderRadius: '5px',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
}));
const FileTypeTitleContainer = styled('div', (props: ThemeProps) => ({
  width: '100%',
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `5px`,
  fontWeight: 400,
  userSelect: 'none',
}));

const FileTypeContainer = styled('span', (props: ThemeProps & { selected: boolean }) => ({
  width: '100%',
  backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
  transition: 'background-color 0.2s, opacity 0.2s',
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
  height: '15px'
});

const IndividualFile = styled('div', (props: ThemeProps & { selected: boolean, }) => ({
  listStyleType: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  width: '97%',
  backgroundColor: (props.selected) ? props.theme.selectedFileBackground : props.theme.unselectedBackground,
  padding: '3px',
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverFileBackground
  },
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
  overflowY: 'scroll',
  left: '4%',
  top: '4.8%',
  height: '100vh',
  width: '95%',
  margin: '5px',
  marginBottom: '55px', 
  zIndex: 1,
}));

const SectionsColumn = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: '0 0 50px',

  border: `3px solid ${props.theme.borderColor}`,
  height: '100vh',
  
}));

const SectionName = styled('span', (props: ThemeProps & { selected: boolean }) => ({
  ':hover': {
    cursor: 'pointer',
    backgroundColor: props.theme.hoverOptionBackground
  },
  width: '100%',

  backgroundColor: props.selected ? props.theme.selectedUserBackground : props.theme.unselectedBackground,
  boxShadow: props.theme.themeName === 'DARK' ? '0px 10px 13px -6px rgba(0, 0, 0, 0.2), 0px 20px 31px 3px rgba(0, 0, 0, 0.14), 0px 8px 38px 7px rgba(0, 0, 0, 0.12)' : undefined,
  transition: 'background-color 0.2s, opacity 0.2s',
  padding: `5px`,
  fontWeight: props.selected ? 400 : undefined,
  userSelect: 'none',
 
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
      showFileContextMenu: false
    };
    this.selectedFileRefFE = React.createRef();
    this.previousSelectedFileFE = React.createRef();
  }



  async componentDidMount(): Promise<void> {
    console.log("FileExplorer mounted!");
    console.log("FileExplorer compDidMount props.propUserShown: ", this.props.propUserShown);
    console.log("FileExplorer props: ", this.props);
    if (this.props.propUserShown !== undefined) {
      await this.props.onReloadProjects(this.props.propUserShown);
      if (this.props.propUserShown.userName !== '') {
        console.log("FileExplorer componentDidMount propUserShown: ", this.props.propUserShown);
        console.log("FileExplorer componentDidMount propsSelectedProjectName: ", this.props.propsSelectedProjectName);
        console.log("FileExplorer componentDidMount propFileName: ", this.props.propFileName);
        const selectedProject = this.props.propUserShown.projects.find((project) => {
          console.log("Checking Project:", project.projectName); // Logs each project being checked
          return project.projectName === this.props.propsSelectedProjectName;
        });

        console.log("Selected Project:", selectedProject);
        console.log("FileExplorer compDidMount state: ", this.state);

        this.setState
          ({
            selectedUser: this.props.propUserShown,
            showProjects: true,
            selectedProject: this.props.propUserData.find(
              (project) => project.projectName === this.props.propsSelectedProjectName
            ),
            projectName: this.props.propsSelectedProjectName,
            selectedFile: this.props.propFileName,
            activeLanguage: this.props.propActiveLanguage,
          }, () => {
            console.log("FileExplorer componentDidMount AFTER state: ", this.state);
          });
      }

    }

  }

  componentWillUnmount(): void {
    console.log("FILEEXPLORER UNMOUNTED");
    this.props.onReloadProjects(this.props.propUserShown);
  }
  async componentDidUpdate(prevProps: Props, prevState: State) {
    console.log("FileExplorer compDidUpdate prevProps: ", prevProps);
    console.log("FileExplorer compDidUpdate prevState: ", prevState);
    console.log("FileExplorer componentDidUpdate state: ", this.state);
    console.log("FileExplorer componentDidUpdate props: ", this.props);
    console.log("FileExplorer rehighlightfile: ", this.props.reHighlightFile);
    console.log("FileExplorer compDidUpdate selectedFileRefFE.current: ", this.selectedFileRefFE.current);


    if (prevProps.propsSelectedProjectName !== this.props.propsSelectedProjectName) {
      console.log("FileExplorer compDidUpdate propsSelectedProjectName changed from: ", prevProps.propsSelectedProjectName, " to: ", this.props.propsSelectedProjectName);
      this.setState({
        selectedProject: this.props.propUserData.find(
          (project) => project.projectName === this.props.propsSelectedProjectName
        ),
      })

    }
    if (this.props.propUserShown !== prevProps.propUserShown) {
      console.log("FileExplorer componentDidUpdate propUserShown changed from: ", prevProps.propUserShown, " to: ", this.props.propUserShown);
    }
    if (prevProps.reHighlightProject !== this.props.reHighlightProject && this.props.reHighlightProject.projectName !== '') {
      console.log("FileExplorer componentDidUpdate reHighlightProject changed from: ", prevProps.reHighlightProject, " to: ", this.props.reHighlightProject);
      console.log("FileExplorer compDidUpdate selectedFileRefFE.current: ", this.selectedFileRefFE.current);
      this.selectedFileRefFE.current = this.props.reHighlightProject.srcFolderFiles[0];
      console.log("FileExplorer compDidUpdate selectedFileRefFE.current AFTER: ", this.selectedFileRefFE.current);
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
    if (prevProps.reloadUser !== this.props.reloadUser) {
      console.log("FileExplorer componentDidUpdate reloadUser changed from: ", prevProps.reloadUser, " to: ", this.props.reloadUser);
      console.log("FileExplorer compDidUpdate state.users: ", this.state.users);
    }
    if (this.props.propUsers !== prevProps.propUsers) {

      if (this.props.renameUserFlag) {
        console.log("FileExplorer compDidUpdate renameUserFlag changed from: ", prevProps.renameUserFlag, " to: ", this.props.renameUserFlag);
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

        } else {
          console.log("Selected user not found in updated propUsers.");
        }
      }

    }
    if (this.props.propFileName !== prevProps.propFileName) {
      console.log("FileExplorer compDidUpdate propFileName changed from: ", prevProps.propFileName, " to: ", this.props.propFileName);
      if (this.props.propFileName !== null) {
        this.setState({ selectedFile: this.props.propFileName });
      }
    }

    if (prevState.selectedProject !== this.state.selectedProject) {
      console.log("FileExplorer compDidUpdate selectedProject changed from: ", prevState.selectedProject, " to: ", this.state.selectedProject);
      console.log("FileExplorer compDidUPdate selectedProject state: ", this.state);
      this.getProjects(this.state.selectedUser);
      console.log("FileExplorer compDidUpdate selectedProject props: ", this.props);
      this.selectedFileRefFE.current = '';
      if (this.props.reHighlightFile) {
        console.log("REHIGHLIGHT FILE EXISTS");
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: this.props.reHighlightFile,
        }, () => {
          console.log("FileExplorer compDidUpdate AFTER STATE state: ", this.state);
        });
      }
      else if (prevState.selectedProject.projectName === '') {
        console.log("PREVSTATE.SELECTEDPROJECT IS BLANK");
        console.log("FileExplorer compDidUpdate selectedProject prevState: ", prevState.selectedProject);
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: this.props.propFileName,
        }, () => {
          console.log("FileExplorer compDidUpdate AFTER STATE state: ", this.state);
        });
      }
      else if (this.state.selectedProject.projectName !== this.props.propsSelectedProjectName) {
        console.log("ELSE");
        console.log("FileExplorer compDidUpdate selectedProject propfilename: ", this.props.propFileName);
        console.log("FileExplorer compDidUpdate selectedProject this.state.selectedProject.projectName: ", this.state.selectedProject.projectName);
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: '',
        }, () => {
          console.log("FileExplorer compDidUpdate AFTER STATE state: ", this.state);
        });
      }
      else if (this.props.propFileName !== null) {
        console.log("PROPFILENAME IS NOT NULL");
        console.log("FileExplorer compDidUpdate prevstate.selectedProject.projectName: ", prevState.selectedProject.projectName);
        console.log("FileExplorer compDidUpdate selectedProject this.state.selectedProject.projectName: ", this.state.selectedProject.projectName);

        console.log("FileExplorer compDidUpdate selectedProject propfilename: ", this.props.propFileName);
        console.log("FileExplorer compDidUpdate selectedProject propsSelectedProjectName: ", this.props.propsSelectedProjectName);
        this.setState({
          selectedProject: this.state.selectedProject,
          projectName: this.state.selectedProject.projectName,
          showProjectFiles: true,
          selectedFile: this.props.propFileName,
        }, () => {
          console.log("FileExplorer compDidUpdate AFTER STATE state: ", this.state);
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
      console.log("FileExp compDidUpdate addFileFlag changed from: ", prevProps.addFileFlag, " to: ", this.props.addFileFlag);
      console.log("FileExp compDidUpdate need to reload Project files for: ", this.state.selectedProject);

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

    console.log("Viewport Width: ", viewportWidth);
    console.log("Viewport Height: ", viewportHeight);

    const menuWidth = 200;  // Adjust as needed
    const menuHeight = 185; // Adjust as needed

    

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
      console.log("FileExp getProjects selectedUser: ", selectedUser);
      console.log("FileExp getProjects selectedProject: ", selectedProject);
      console.log("FileExp getProjects propUserData: ", propUserData);

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
    console.log("FileExp addNewProject selectedUser: ", selectedUser);
    if (this.props.onAddNewProject) {
      this.props.onAddNewProject(selectedUser);
    }

  }

  private handleProjectClick = async (project: Project, user: User, language: ProgrammingLanguage) => {


    this.setState((prevState) => (

      {
        showProjectFiles: prevState.selectedProject === project ? false : true,
        selectedProject: prevState.selectedProject === project ? BLANK_PROJECT : project,
        activeLanguage: prevState.selectedProject === project ? null : language

      }));

  };

  private handleFileClick = async (fileName: string, projectDetails?: Project) => {
    console.log("FILEEXPLORER HANDLE FILECLICK");
    const { selectedUser, selectedProject, activeLanguage, } = this.state;

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
            onClick={() => this.addNewProject()}
          >
            <AddProjectItemIcon icon={faFolderPlus} />
            {LocalizedString.lookup(tr('Add Project'), this.props.locale)}
          </AddProjectButtonContainer>
        </ProjectHeaderContainer>
        <ul>
          {projects.map((project) => (

            <Container key={project.projectName}>
              <ProjectItem

                selected={this.state.selectedProject.projectName === project.projectName}

                onClick={() => this.handleProjectClick(project, this.state.selectedUser, project.projectLanguage)}

                onContextMenu={(e) => this.handleProjectRightClick(e, project)} theme={theme}
              >
                {project.projectName}
              </ProjectItem>

              {this.state.selectedProject.projectName === project.projectName && this.state.showProjectFiles && (
                this.state.selectedUser.interfaceMode === InterfaceMode.SIMPLE ? (
                  <FileTypeContainer theme={theme} selected={false}>
                    <FileTypeItem theme={theme} key={`SourceFileHeader-${project.projectName}`}>
                      <FileTypeTitleContainer theme={theme}>
                        Source Files
                      </FileTypeTitleContainer>
                      <FileContainer theme={theme}>
                        {project.srcFolderFiles.map((file, i) => (
                          <IndividualFile
                            key={`src-${i}`}
                            theme={theme}
                            selected={this.state.selectedFile === file}
                            onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}
                          >
                            {file}
                          </IndividualFile>
                        ))}
                        <IndividualFile theme={theme} selected={false} onClick={() => this.addNewFile(project.projectLanguage)}>
                          <FileItemIcon icon={faFileCirclePlus} />
                          {LocalizedString.lookup(tr('Add File'), this.props.locale)}
                        </IndividualFile>
                      </FileContainer>
                    </FileTypeItem>

                  </FileTypeContainer>
                ) : this.state.selectedUser.interfaceMode === InterfaceMode.ADVANCED ? (
                  <FileTypeContainer theme={theme} selected={false}>
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
                              selected={this.state.selectedFile === file}
                              onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
                              {file}
                            </IndividualFile>
                          ))}
                          <IndividualFile theme={theme} selected={false} onClick={() => this.addNewFile("h")}>
                            <FileItemIcon icon={faFileCirclePlus} />
                            {LocalizedString.lookup(tr('Add File'), this.props.locale)}
                          </IndividualFile>
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
                            selected={this.state.selectedFile === file}
                            onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
                            {file}
                          </IndividualFile>
                        ))}
                        <IndividualFile theme={theme} selected={false} onClick={() => this.addNewFile(project.projectLanguage)}>
                          <FileItemIcon icon={faFileCirclePlus} />
                          {LocalizedString.lookup(tr('Add File'), this.props.locale)}
                        </IndividualFile>
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
                            selected={this.state.selectedFile === file}
                            onClick={() => this.handleFileClick(file, project)} onContextMenu={(e) => this.handleFileRightClick(e, file)}>
                            {file}
                          </IndividualFile>
                        ))}
                        <IndividualFile
                          theme={theme}
                          selected={false}
                          onClick={() => this.addNewFile("txt")}>
                          <FileItemIcon icon={faFileCirclePlus} />
                          {LocalizedString.lookup(tr('Add File'), this.props.locale)}
                        </IndividualFile>
                      </FileContainer>
                    </FileTypeItem>
                  </FileTypeContainer>
                ) : null)

              }
            </Container>
          ))}
        </ul>
      </ProjectContainer>
    )
  }

  render() {
    if (!this.props.theme) {
      console.log("IvygateFileExplorer render this.props.theme is null");
      return null; // Or a loading spinner
    }

    const { props, state } = this;
    const { style, className, theme, propUsers, locale } = props;
    const {
      selectedUser,
      showUserContextMenu,
      showProjectContextMenu,
      showFileContextMenu,

    } = state;

    const userSections = (propUsers || []).map((user: User) => {
      const projects = this.props.propUserData || [];
      return (
        <SectionsColumn theme={theme} key={user.userName}>
          <SectionName
            theme={theme}
            selected={selectedUser.userName === user.userName}
            onClick={() => this.setSelectedUser(user)}
            onContextMenu={(e) => this.handleUserRightClick(e, user)}
          >
            {LocalizedString.lookup(tr(user.userName), locale)}
          </SectionName>
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
          <h2 style={{ marginLeft: '6px' }}>Explorer</h2>
          <UsersContainer theme={theme}>
            {userSections}
          </UsersContainer>
        </FileExplorerContainer>
        {showUserContextMenu && this.renderUserContextMenu()}
        {showProjectContextMenu && this.renderProjectContextMenu()}
        {showFileContextMenu && this.renderFileContextMenu()}


      </div >
    );
  }
}

