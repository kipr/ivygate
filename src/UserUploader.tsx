import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import { ThemeProps, Theme } from './components/constants/theme';
import { StyleProps } from './components/constants/style';
import { styled } from 'styletron-react';
import tr from './i18n';
import { Dialog } from './components/Dialog';
import { faFolderOpen, faFileCode, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ProgrammingLanguage from './types/programmingLanguage';
import { Fa } from './components/Fa';
import ScrollArea from './components/interface/ScrollArea';
import { FileInfo } from './types/fileInfo';
import { UploadedProject } from './types/project';
import ResizeableComboBox from './components/ResizeableComboBox';
import ComboBox from './components/ComboBox';
import Classroom from './types/classroomTypes';
import { InterfaceMode } from './types/interface';
import { UploadedUser, User } from './types/user';


export interface UserUploaderPublicProps extends StyleProps, ThemeProps {
  theme: Theme;
  currentClassroom: Classroom;
  currentLanguage: ProgrammingLanguage;
  uploadType: 'project' | 'include' | 'src' | 'data' | 'config' | 'none';
  onUserUpload: (uploadedUser: UploadedUser) => void;
  onClose: () => void;
}

interface UserUploaderPrivateProps {
  locale: LocalizedString.Language;
}
interface UserUploaderState {
  selectedFiles: FileInfo[] | null;
  errorMessage?: string;
  duplicateUserErrorMessage?: string;
  projectErrorMessage?: string;
  folderName: string;
  sourceFiles: FileInfo[];
  includeFiles?: FileInfo[];
  dataFiles?: FileInfo[];
  userConfigFile: { configFileName: string, user: User, errorMessage?: string };
  projectConfigFiles: Map<string, FileInfo>;
  userProjects: UploadedProject[];
  projectLanguage: ProgrammingLanguage | string | undefined;
  interfaceMode: InterfaceMode | string | undefined;
  uploadedUser: UploadedUser;

}

type Props = UserUploaderPublicProps & UserUploaderPrivateProps;
type State = UserUploaderState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '300px',
  alignItems: 'center',
  padding: '1em'
}));


const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
  marginBottom: '1.2em',
  marginTop: '0.7em',
  paddingBottom: '13em',
  minHeight: '28vh',
  border: `2px solid ${theme.borderColor}`,
}));


const OuterScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
  paddingBottom: '3em',
  minHeight: '50vh',
  border: `2px solid ${theme.borderColor}`,
  backgroundColor: theme.backgroundColor,
}));

const Button = styled('button', (props: ThemeProps & { disabled?: boolean, }) => ({
  margin: '0.5em 0.75em',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  ':active': !props.disabled
    ? {
      boxShadow: '1px 1px 2px rgba(0,0,0,0.7)',
      transform: 'translateY(1px, 1px)',
      cursor: 'none'
    }
    : {},

  backgroundColor: props.disabled ? props.theme.yesButtonColor.disabled : props.theme.yesButtonColor.standard,
}));

const ProjectPreviewContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  width: '100%',
  height: '100%',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  padding: '1em',
}));


const UploadFolderPreviewButtonContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  marginTop: '10px',
  color: props.theme.color,
  maxHeight: '25vh',
  minHeight: '4vh',
  overflow: 'hidden'
}));

const FileListItem = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  padding: `${props.theme.itemPadding}px`,
  borderBottom: `1px solid ${props.theme.borderColor}`,
  ':last-child': {
    borderBottom: 'none',
  },
  alignContent: 'center',
  minWidth: '24em',
}));

const ListTitle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  fontWeight: 'bold',
  fontSize: '1.2em',
  marginBottom: '6px',
}));

const SubFolderListTitle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  fontWeight: 'bold',
  fontSize: '1em',
  alignItems: 'center',
}));


const ErrorMessageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'red',
  color: 'white',
  height: 'auto',
  alignItems: 'center',
  marginTop: '5px',
  padding: '10px',
  gap: '8px'
}));

const ItemIcon = styled(Fa, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});

const SubItemIcon = styled(Fa, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '24px'
});

const InstructionContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginTop: '10px',
  marginBottom: '10px',
  color: props.theme.color,

  width: '100%',
  paddingLeft: '10px',
}));

const FilePreviewContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  height: '100%',
  alignItems: 'stretch',
  margin: '0.6em 0 0.6em 2.3em',
}));

const FilePreviewItem = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  paddingTop: '4px',
  paddingBottom: '4px',
  fontSize: '1.2em',
}));
const VerticalLine = styled('div', (props: ThemeProps) => ({
  width: '2px',
  alignSelf: 'stretch',
  backgroundColor: props.theme.verticalLineColor,
  marginRight: '8px',
  minWidth: '2px',
  flexShrink: 0,
}));


const StyledResizeableComboBox = styled(ResizeableComboBox, {
  flex: '1 0',
});

const ComboBoxLabel = styled('label', (theme: ThemeProps) => ({
  display: 'block',
  color: theme.theme.color,
  fontSize: '1.1em',
  fontWeight: 'normal',
  marginBottom: `${theme.theme.itemPadding}px`,
  marginRight: `${theme.theme.itemPadding}px`,
  userSelect: 'none'
}));

const TitleContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const Title = styled('div', (props: ThemeProps) => ({
  color: props.theme.color,
  fontSize: '1.1em',
  margin: '0.5em 0',
  textAlign: 'center',
}));


const LANGUAGE_OPTIONS: ComboBox.Option[] = [
  {
    text: 'Select Language',
    data: 'none'
  },
  {
    text: 'C',
    data: 'c'
  }, {
    text: 'C++',
    data: 'cpp'
  }, {
    text: 'Python',
    data: 'python'
  },
  {
    text: 'Graphical',
    data: 'graphical'
  }
];

const INTERFACEMODE_OPTIONS: ComboBox.Option[] = [
  {
    text: 'Select Interface Mode',
    data: 'none'
  },
  {
    text: 'Simple',
    data: InterfaceMode.SIMPLE
  },
  {
    text: 'Advanced',
    data: InterfaceMode.ADVANCED
  }
];

class UserUploader extends React.Component<Props, State> {
  fileInputRef: React.RefObject<HTMLInputElement>;
  projectRefs: React.MutableRefObject<Map<string, UploadedProject>>;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedFiles: null,
      errorMessage: '',
      folderName: '',
      sourceFiles: [],
      includeFiles: [],
      dataFiles: [],
      userConfigFile: {
        configFileName: '',
        user: {
          userName: '',
          interfaceMode: InterfaceMode.SIMPLE,
          projects: [],
          classroomName: ''
        }
      },

      projectConfigFiles: new Map<string, FileInfo>(),
      userProjects: [],
      projectLanguage: 'none',
      projectErrorMessage: '',
      interfaceMode: "none",
      uploadedUser: {
        configFile: { name: '', errorMessage: '', content: '', language: '', uploadType: 'config' },
        userName: '',
        interfaceMode: InterfaceMode.SIMPLE,
        projects: [],
        classroomName: ''
      }

    };
    this.fileInputRef = React.createRef();
    this.projectRefs = { current: new Map<string, UploadedProject>() };
  }



  getUserInterfaceFromConfig = async (userConfigFile: File): Promise<InterfaceMode | string | undefined> => {
    const content = await userConfigFile.text();
    let parsedConfig: any;
    try {
      parsedConfig = JSON.parse(content);
    } catch (error) {
      this.setState({ errorMessage: 'Invalid user config file format.' });
      return;
    }

    return parsedConfig.interfaceMode || 'none';
  }

  onLanguageSelect = (languageIndex: number, option: ComboBox.Option) => {
    this.setState({
      projectLanguage: option.data as ProgrammingLanguage | string,

    })

  };

  onInterfaceModeSelect = (interfaceModeIndex: number, option: ComboBox.Option) => {
    this.setState({
      interfaceMode: option.data as InterfaceMode,
    })


  };

  handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;

    let extension = '';

    if (files && files.length > 0) {

      const fileArray = Array.from(files);
      const firstRelativePath = fileArray[0].webkitRelativePath;
      const folderName = firstRelativePath.split('/')[0]; // Top-level folder name

      this.setState({ folderName });

      //If classrooms.json contains uploaded user, show error message
      if (this.props.currentClassroom.users.some(user => user.userName === folderName)) {
        
        this.setState({
          duplicateUserErrorMessage: `User with name "${folderName}" already exists. Please choose a different name.`,
          selectedFiles: null,
          projectErrorMessage: ''
        })

      }
      else {
        const fileInfos = await Promise.all(
          fileArray.map(async (file) => {
            const content = await file.text();
            const detectedLanguage = await this.detectLanguage(file);
            let errorMessage = '';
            const fileExtension = file.name.split('.').pop()?.toLowerCase();
            let uploadType: 'project' | 'include' | 'src' | 'data' | 'config' | 'none' = 'none';
            // Determine language from extension
            let language: ProgrammingLanguage | string = undefined;
            let filePath = file.webkitRelativePath;

            const [userName, projectName, fileTypeName, fileName] = filePath.split('/');

            switch (fileExtension) {
              case 'json':
                uploadType = 'config';

                const parsedConfig = JSON.parse(content);

                //Deconstruct user config file to User object
                if (file.name.includes('.user')) {

                  //Error handling for folder name not matching userName in config file
                  if (parsedConfig.userName && parsedConfig.userName !== folderName) {
                    errorMessage = `Folder name "${folderName}" does not match user name "${parsedConfig.userName}" in config file.`;
                  }

                  //Get user interface mode from config file
                  const interfaceMode = await this.getUserInterfaceFromConfig(file);
               
                  if (interfaceMode && interfaceMode !== this.state.interfaceMode) {
                    errorMessage = `File ${file.name} detected with interface mode ${interfaceMode}, not matching project interface mode ${this.state.interfaceMode}.`;
                  }

                  this.setState(prevState => ({
                    uploadedUser: {
                      ...prevState.uploadedUser,
                      configFile: { name: file.name, content, errorMessage, language: 'json', uploadType: 'config' },
                      userName: parsedConfig.userName || folderName,
                      interfaceMode: interfaceMode === 'none' ? InterfaceMode.SIMPLE : interfaceMode as InterfaceMode,
                      projects: [],
                      classroom: this.props.currentClassroom
                    }

                  }))
                }
                //Deconstruct project config file to UploadedProject object
                else if (file.name.includes('.project')) {
                  this.projectRefs.current.set(parsedConfig.projectName, {
                    projectName: parsedConfig.projectName || '',
                    projectLanguage: parsedConfig.projectLanguage || 'none',
                    configFile: {
                      name: file.name,
                      content,
                      errorMessage,
                      uploadType: 'config',
                      language: parsedConfig.projectLanguage || 'none'
                    },
                    includeFolderFiles: [],
                    srcFolderFiles: [],
                    dataFolderFiles: []
                  });

                }
                break;
              case 'h':
                uploadType = 'include';
                language = 'c';

                this.projectRefs.current.get(projectName)?.includeFolderFiles.push({
                  name: file.name,
                  content,
                  errorMessage,
                  uploadType: 'include',
                  language: 'c'
                });
                break;
              case 'txt':
                uploadType = 'data';
                language = 'plaintext';
                this.projectRefs.current.get(projectName)?.dataFolderFiles.push({
                  name: file.name,
                  content,
                  errorMessage,
                  uploadType: 'data',
                  language: 'plaintext'
                });
                break;
              case 'cpp':
              case 'c':
              case 'py':

                for (const [lang, ext] of Object.entries(ProgrammingLanguage.FILE_EXTENSION)) {

                  if (ext === fileExtension) {
                    if (detectedLanguage === this.projectRefs.current.get(projectName)?.projectLanguage) {
                      language = lang as ProgrammingLanguage;
                      uploadType = 'src';
                    }
                    else {
                      uploadType = 'src';
                      errorMessage = `File ${file.name} detected as ${detectedLanguage}, not matching project language ${this.projectRefs.current.get(projectName)?.projectLanguage}.
                  Please ensure all source files match the project language.`;

                    }
                  }
                }
                if (uploadType === 'src') {
                  this.projectRefs.current.get(projectName)?.srcFolderFiles.push({
                    name: file.name,
                    content,
                    errorMessage,
                    uploadType: 'src',
                    language: language
                  });
                }
                break;

              default:
                uploadType = 'none';
                language = 'plaintext'; // Default to plaintext for unknown extensions
                console.warn(`Unknown file type for ${file.name}, defaulting to plaintext.`);
            }
          
            if (errorMessage) {
              this.setState({ errorMessage });
            }
            return {
              name: file.name,
              content,
              language,
              errorMessage,
              uploadType: uploadType,
            };

          })
        );
        this.setState(prevState => {
          if (prevState.selectedFiles) {
            // Merge new files with previous selected files
            for (const fileInfo of fileInfos) {
              // Check if the file is already selected
              const isAlreadySelected = prevState.selectedFiles.some(
                selectedFile => selectedFile.name === fileInfo.name
              );
              if (!isAlreadySelected) {
                prevState.selectedFiles.push(fileInfo);
              }
            }
            return { selectedFiles: prevState.selectedFiles };
          }
          else {

            return { selectedFiles: fileInfos };
          }

        }, () => {

          this.setState({
            projectErrorMessage: this.state.selectedFiles?.some(file => file.name.includes('main.'))
              ? '' : `Project must contain a main.${extension} file`,

            sourceFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'src'
            ) || [],
            includeFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'include'
            ) || [],
            dataFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'data'
            ) || []
          });
        });
      }


    }


    this.setState(prevState => ({
      uploadedUser: {
        ...prevState.uploadedUser,
        projects: Array.from(this.projectRefs.current.values()).map(project => ({
          projectName: project.projectName,
          projectLanguage: project.projectLanguage,
          configFile: project.configFile,
          includeFolderFiles: project.includeFolderFiles,
          srcFolderFiles: project.srcFolderFiles,
          dataFolderFiles: project.dataFolderFiles
        })),

      }
    }));
  };

  readFile = (file: File): Promise<string> => {

    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result;
        if (typeof content === 'string') {

          resolve(content);
        } else {
          reject(new Error('File content is not a string.'));
        }
      };

      reader.onerror = (e) => {
        console.error('Error reading file:', e);
        reject(e);
      };

      reader.readAsText(file);
    });
  };

  detectLanguage = async (file: File): Promise<string> => {

    const content = await this.readFile(file);
    // Check for Python
    if (
      (content.startsWith("#!") && content.includes("python")) ||
      /def\s+\w+\s*\(/.test(content) ||
      /import\s+\w+/.test(content) ||
      /print\s*\(/.test(content)
    ) {
      return "python";
    }

    // Check for C++
    if (
      /#include\s*<iostream>/.test(content) ||
      /\bstd::/.test(content) ||
      /\bcout\s*<</.test(content)
    ) {
      return "cpp";
    }

    // Check for C
    if (/#include\s*<.*>/.test(content) || /\bint\s+main\s*\(/.test(content) || /\.h[">\)]/.test(content)) {
      return "c";
    }

    return "unknown";
  }

  onUploadUserClick = async () => {
    const { uploadedUser } = this.state;

    this.props.onUserUpload(uploadedUser);

  }

  includePreview = () => {
    const { theme, locale } = this.props;
    return (<>

      <SubFolderListTitle theme={theme}>
        <SubItemIcon icon={faFolderOpen} />
        {LocalizedString.lookup(tr('include'), locale)}
      </SubFolderListTitle>
      <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
        <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`includeFile1.h (optional)`), locale)}
          </FilePreviewItem>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`includeFile2.h (optional)`), locale)}
          </FilePreviewItem>
        </div>
      </FilePreviewContainer>
    </>)
  }

  srcPreview = () => {
    const { theme, locale } = this.props;
    return (<>
      <SubFolderListTitle theme={theme}>
        <SubItemIcon icon={faFolderOpen} />
        {LocalizedString.lookup(tr('src'), locale)}
        <span style={{ fontWeight: 'bold', color: '#d9534f', marginLeft: '10px' }}>
          {LocalizedString.lookup(tr(`NOTE: file extension must match project language`), locale)}
        </span>
      </SubFolderListTitle>
      <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
        <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`srcFile1.*`), locale)}

          </FilePreviewItem>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`srcFile2.*`), locale)}
          </FilePreviewItem>
        </div>
      </FilePreviewContainer></>)


  }

  userDataPreview = () => {
    const { theme, locale } = this.props;

    return (<>

      <SubFolderListTitle theme={theme}>
        <SubItemIcon icon={faFolderOpen} />
        {LocalizedString.lookup(tr('data'), locale)}
      </SubFolderListTitle>
      <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
        <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`dataFile1.txt (optional)`), locale)}
          </FilePreviewItem>
          <FilePreviewItem theme={theme} >
            <SubItemIcon icon={faFileCode} />
            {LocalizedString.lookup(tr(`dataFile2.txt (optional)`), locale)}
          </FilePreviewItem>
        </div>
      </FilePreviewContainer></>)
  }

  binPreview = () => {
    const { theme, locale } = this.props;
    return (<>
      <SubFolderListTitle theme={theme}>
        <SubItemIcon icon={faFolderOpen} />
        {LocalizedString.lookup(tr('bin'), locale)}
      </SubFolderListTitle>
      <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
        <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>

        </div>
      </FilePreviewContainer></>)

  }



  uploadFolderInstructions = () => {
    const { theme, locale } = this.props;
    const { interfaceMode } = this.state;
    const languageIndex = LANGUAGE_OPTIONS.findIndex(option => option.data === this.state.projectLanguage);
    return (
      <>
        {LocalizedString.lookup(tr('Select a User from your computer to upload\n'), locale)}
        <br />
        {LocalizedString.lookup(tr('Be sure the heirarchy format follows:\n'), locale)}

        <StyledScrollArea theme={theme}>
          <InstructionContainer theme={theme}>
            <ListTitle theme={theme}>
              <ItemIcon icon={faFolderOpen} />
              {LocalizedString.lookup(tr("User Name"), locale)}
              <span style={{ fontWeight: 'bold', color: '#d9534f', marginLeft: '7px' }}>
                {LocalizedString.lookup(tr(`(At least 1 project must be in the User folder)`), locale)}
              </span>
            </ListTitle>
            <div style={{ display: 'flex', marginLeft: '3em' }}>
              <VerticalLine theme={theme} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>

                <SubFolderListTitle theme={theme}>
                  <SubItemIcon icon={faFolderOpen} />
                  {LocalizedString.lookup(tr('Project Name 1'), locale)}
                </SubFolderListTitle>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <VerticalLine theme={theme} />
                  <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
                    <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {this.includePreview()}
                      {this.srcPreview()}
                      {this.userDataPreview()}
                      {this.binPreview()}
                    </div>
                  </FilePreviewContainer>
                </div>
                <SubFolderListTitle theme={theme}>
                  <SubItemIcon icon={faFolderOpen} />
                  {LocalizedString.lookup(tr('Project Name 2'), locale)}
                </SubFolderListTitle>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <VerticalLine theme={theme} />
                  <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
                    <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      ...
                    </div>
                  </FilePreviewContainer>
                </div>

              </div>
            </div>


          </InstructionContainer>
        </StyledScrollArea>

        <UploadFolderPreviewButtonContainer style={{ padding: '0.5em 0', alignItems: "center" }} theme={theme}>
          <ComboBoxLabel theme={theme}>Select User Interface Mode:</ComboBoxLabel>
          <StyledResizeableComboBox
            options={INTERFACEMODE_OPTIONS}
            index={INTERFACEMODE_OPTIONS.findIndex(opt => opt.data === interfaceMode)}
            onSelect={this.onInterfaceModeSelect}
            theme={theme}
            mainWidth={'10em'}
            mainHeight={'1.5em'}
            mainFontSize={'1em'}

          />

        </UploadFolderPreviewButtonContainer>
        <Button style={{}} disabled={this.state.interfaceMode === "none"} onClick={() => this.fileInputRef.current?.click()} theme={theme}>
          {LocalizedString.lookup(tr('Choose Folder'), locale)}
        </Button>
        <input
          type="file"
          multiple
          onChange={this.handleFileChange}
          ref={this.fileInputRef}
          style={{ display: 'none' }}
          // Add webkitdirectory to allow folder selection
          {...{ webkitdirectory: '' } as any}
        />
      </>)
  };
  //

  configFilePreview = (file: { configFileName: string, user: User, errorMessage?: string } | FileInfo, index: string) => {
    const { theme, locale } = this.props;
    const fileName = 'configFileName' in file ? file.configFileName : (file as FileInfo).name;
    return (
      <>
        {file !== undefined ? (
          <FileListItem style={{ marginLeft: '7px' }} key={index} theme={theme}>
            <SubFolderListTitle theme={theme}>
              <SubItemIcon icon={faFileCode} />
              {LocalizedString.lookup(tr('Config File'), locale)}
            </SubFolderListTitle>
            {file != undefined ? (
              <FilePreviewContainer theme={theme}>
                <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
                  <FilePreviewItem theme={theme}>
                    <SubItemIcon icon={faFileCode} />
                    {LocalizedString.lookup(tr(`${fileName} `), locale)}
                  </FilePreviewItem>
                  {file.errorMessage && (<ErrorMessageContainer theme={theme}>
                    <Fa icon={faExclamationTriangle} />
                    {LocalizedString.lookup(tr(`${file.errorMessage} `), locale)}
                  </ErrorMessageContainer>)}
                </div>
              </FilePreviewContainer>
            ) : (
              <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
            )}
          </FileListItem>
        ) : (
          <>
          </>
        )}

      </>
    );
  };

  includeFilePreview = (files: FileInfo[], index: string) => {
    const { theme, locale } = this.props;
    return (
      <FileListItem style={{ marginLeft: '7px' }} key={index} theme={theme}>
        <SubFolderListTitle theme={theme}>
          <SubItemIcon icon={faFolderOpen} />
          {LocalizedString.lookup(tr('Include Files'), locale)}
        </SubFolderListTitle>
        {files ? (
          <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
            <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {files.map((file, i) => (
                <FilePreviewItem theme={theme} key={i}>
                  <SubItemIcon icon={faFileCode} />
                  {LocalizedString.lookup(tr(`${file.name} `), locale)}
                </FilePreviewItem>
              ))}

            </div>

          </FilePreviewContainer>
        ) : (
          <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
        )}
      </FileListItem>
    );
  };


  sourceFilePreview = (files: FileInfo[], index: string) => {
    const { projectErrorMessage } = this.state;
    const { theme, locale } = this.props;
    return (
      <FileListItem style={{ marginLeft: '7px' }} key={index} theme={theme}>
        <SubFolderListTitle theme={theme}>
          <SubItemIcon icon={faFolderOpen} />
          {LocalizedString.lookup(tr('Source Files'), locale)}
        </SubFolderListTitle>
        {files && files.length > 0 ? (
          <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>

              <VerticalLine theme={theme} />

              <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
                {projectErrorMessage && (
                  <ErrorMessageContainer theme={theme}>
                    <Fa icon={faExclamationTriangle} />
                    {LocalizedString.lookup(tr(`${projectErrorMessage} `), locale)}
                  </ErrorMessageContainer>
                )}
                {files.map((file, i) => (
                  <div key={i}>
                    <FilePreviewItem theme={theme}>
                      <SubItemIcon icon={faFileCode} />
                      {LocalizedString.lookup(tr(`${file.name} `), locale)}
                    </FilePreviewItem>
                    {file.errorMessage && (
                      <ErrorMessageContainer theme={theme}>
                        <Fa icon={faExclamationTriangle} />
                        {LocalizedString.lookup(tr(`${file.errorMessage} `), locale)}
                      </ErrorMessageContainer>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FilePreviewContainer>

        ) : (
          <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
        )}
      </FileListItem>
    );
  };



  dataFilePreview = (files: FileInfo[], index: string) => {
    const { theme, locale } = this.props;
    return (
      <FileListItem style={{ marginLeft: '7px' }} key={index} theme={theme}>
        <SubFolderListTitle theme={theme}>
          <SubItemIcon icon={faFolderOpen} />
          {LocalizedString.lookup(tr('User Data Files'), locale)}
        </SubFolderListTitle>
        {files ? (
          <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
            <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {files.map((file, i) => (
                <FilePreviewItem theme={theme} key={i}>
                  <SubItemIcon icon={faFileCode} />
                  {LocalizedString.lookup(tr(`${file.name} `), locale)}
                </FilePreviewItem>
              ))}

            </div>

          </FilePreviewContainer>
        ) : (
          <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
        )}
      </FileListItem>
    );
  };

  uploadedUserPreview = (uploadedUser: UploadedUser) => {
    const { theme, locale } = this.props;
    const { folderName } = this.state;

    return (
      <>
        <ListTitle theme={theme}>
          <ItemIcon icon={faFolderOpen} />
          {LocalizedString.lookup(tr(`${folderName} `), locale)}
        </ListTitle>
        <div style={{ display: 'flex', marginLeft: '1.5em', }}>
          <VerticalLine theme={theme} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {this.configFilePreview(uploadedUser.configFile, `${uploadedUser.configFile.name}-config`)}
            {this.projectView()}
          </div>
        </div>

      </>
    )

  };

  projectView = () => {
    const { theme, locale } = this.props;
    const { selectedFiles, userConfigFile, userProjects, projectConfigFiles, uploadedUser } = this.state;

    return (
      <>

        {uploadedUser.projects.map((project, i) => (
   
          <ProjectPreviewContainer theme={theme} key={i}>
            <ListTitle theme={theme}>
              <ItemIcon icon={faFolderOpen} />
              {LocalizedString.lookup(tr(`${project.projectName} `), locale)}
            </ListTitle>
            <div style={{ display: 'flex', marginLeft: '2.1em' }}>
              <VerticalLine theme={theme} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {this.configFilePreview(project.configFile, `${project.projectName}-config`)}
                {project.includeFolderFiles && project.includeFolderFiles.length > 0 ?
                  this.includeFilePreview(project.includeFolderFiles, `${project.projectName}-include`) : ''}
                {project.srcFolderFiles && project.srcFolderFiles.length > 0 ?
                  this.sourceFilePreview(project.srcFolderFiles, `${project.projectName}-src`) : ''}
                {project.dataFolderFiles && project.dataFolderFiles.length > 0 ?
                  this.dataFilePreview(project.dataFolderFiles, `${project.projectName}-data`) : ''}
              </div>
            </div>
          </ProjectPreviewContainer>
        ))}

      </>
    )
  }

  uploadFolderPreview = () => {
    const { theme, locale } = this.props;
    const { uploadedUser } = this.state;
    return (
      <>

        <TitleContainer theme={theme}>
          <Title theme={theme}>
            <strong>{LocalizedString.lookup(tr('Selected User Folder: '), locale)}</strong>
            {LocalizedString.lookup(tr(`${uploadedUser.userName} `), locale)}
          </Title>
          <Title theme={theme}>
            <strong>{LocalizedString.lookup(tr('Selected User Interface Mode: '), locale)}</strong>
            {LocalizedString.lookup(tr(`${uploadedUser.interfaceMode} `), locale)}
          </Title>

        </TitleContainer>
        <StyledScrollArea theme={theme} >
          <ProjectPreviewContainer theme={theme}>
            {this.uploadedUserPreview(uploadedUser)}
          </ProjectPreviewContainer>
        </StyledScrollArea>
        <UploadFolderPreviewButtonContainer theme={theme}>

          <Button onClick={() => this.setState({ folderName: '', selectedFiles: [], projectLanguage: 'none', errorMessage: '' })} theme={theme}>
            {LocalizedString.lookup(tr('Choose a different project'), locale)}
          </Button>
          <Button disabled={

            this.state.errorMessage !== ''
          } theme={theme} onClick={() => this.onUploadUserClick()}>
            {LocalizedString.lookup(tr('Upload Project'), locale)}
          </Button>
        </UploadFolderPreviewButtonContainer>

      </>

    )
  };
  duplicateUserUploadError = () => {
    const { theme, locale } = this.props;
    const { folderName } = this.state;
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',

      }}>
        <TitleContainer theme={theme}>
          <Title theme={theme}>
            <strong>
              {LocalizedString.lookup(tr(`The selected project ${folderName} already exists for this user.`), locale)}
            </strong>
            <br />
            <strong>
              {LocalizedString.lookup(tr(`Please choose a different project.`), locale)}
            </strong>
          </Title>
        </TitleContainer>

        <UploadFolderPreviewButtonContainer theme={theme}>
          <Button
            onClick={() => this.setState({ folderName: '', selectedFiles: [], projectLanguage: 'none' })}
            theme={theme}
          >
            {LocalizedString.lookup(tr('Choose a different project'), locale)}
          </Button>
        </UploadFolderPreviewButtonContainer>
      </div>
    )
  }

  render() {
    const { theme, locale, style, className, onClose } = this.props;
    const { folderName, errorMessage, duplicateUserErrorMessage } = this.state;

    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Upload User'), locale)}
        style={{ color: theme.whiteText, backgroundColor: theme.backgroundColor }}
        onClose={onClose}
      >
        <OuterScrollArea theme={theme}>
          <Container theme={theme} style={style} className={className}>
            {!folderName && (
              this.uploadFolderInstructions()
            )}
            {folderName && !duplicateUserErrorMessage && (
              this.uploadFolderPreview()
            )}
            {folderName && duplicateUserErrorMessage && (
              this.duplicateUserUploadError()
            )}

          </Container>

        </OuterScrollArea>

      </Dialog >
    );
  }

}

export default UserUploader;