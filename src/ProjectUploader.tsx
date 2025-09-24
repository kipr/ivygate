import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import { ThemeProps, Theme } from './components/constants/theme';
import { StyleProps } from './components/constants/style';
import { styled } from 'styletron-react';
import tr from './i18n';
import { Dialog } from './components/Dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFileCode, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import ProgrammingLanguage from './types/programmingLanguage';
import { Fa } from './components/Fa';
import ScrollArea from './components/interface/ScrollArea';
import { FileInfo } from './types/fileInfo';
import { Project, UploadedProject } from './types/project';
import ResizeableComboBox from './components/ResizeableComboBox';
import ComboBox from './components/ComboBox';


export interface ProjectUploaderPublicProps extends StyleProps, ThemeProps {
  theme: Theme;
  currentUserProjects: Project[];
  currentLanguage: ProgrammingLanguage;
  uploadType: 'project' | 'include' | 'src' | 'data' | 'config' | 'none';
  onProjectUpload: (uploadedProject: UploadedProject) => void;
  onClose: () => void;
}

interface ProjectUploaderPrivateProps {
  locale: LocalizedString.Language;
}
interface ProjectUploaderState {
  selectedFiles: FileInfo[] | null;
  errorMessage?: string;
  projectErrorMessage?: string;
  folderName: string;
  sourceFiles: FileInfo[];
  includeFiles?: FileInfo[];
  dataFiles?: FileInfo[];
  configFile: FileInfo;
  projectLanguage: ProgrammingLanguage | string | undefined;

}

type Props = ProjectUploaderPublicProps & ProjectUploaderPrivateProps;
type State = ProjectUploaderState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '300px',
  // maxHeight: '80vh',
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

const ProjectListTitle = styled('div', (props: ThemeProps) => ({
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

class ProjectUploader extends React.Component<Props, State> {
  fileInputRef: React.RefObject<HTMLInputElement>;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedFiles: null,
      errorMessage: '',
      folderName: '',
      sourceFiles: [],
      includeFiles: [],
      dataFiles: [],
      configFile: {
        name: '',
        content: '',
        errorMessage: '',
        uploadType: 'none',
        language: 'none',

      },
      projectLanguage: 'none',
      projectErrorMessage: ''

    };
    this.fileInputRef = React.createRef();
  }

  componentDidUpdate = async (prevProps: Props, prevState: State) => {
    console.log('ProjectUploader componentDidUpdate state: ', this.state);
    console.log('ProjectUploader componentDidUpdate props: ', this.props);
  }


  getProjectLanguage = async (configFile: File): Promise<ProgrammingLanguage | string | undefined> => {
    const content = await configFile.text();
    let parsedConfigLanguage: ProgrammingLanguage | string | undefined = undefined;
    try {
      const parsedConfig = JSON.parse(content);
      if (parsedConfig.language) {
        parsedConfigLanguage = parsedConfig.language as ProgrammingLanguage | string;
        this.setState({
          projectLanguage: parsedConfig.language,
          configFile: {
            name: configFile.name,
            content: content,
            errorMessage: '',
            uploadType: 'config',
            language: parsedConfig.language || 'none'
          }
        });

      } else {
        console.warn('No language specified in config file.');
      }
    } catch (error) {
      this.setState({ errorMessage: 'Invalid config file format.' });
    }

    return parsedConfigLanguage;
  }


  onLanguageSelect = (languageIndex: number, option: ComboBox.Option) => {
    this.setState({
      projectLanguage: option.data as ProgrammingLanguage | string,

    })

  };
  handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { projectLanguage } = this.state;
    const files = event.target.files;
    let projectErrorMessage = '';
    let extension = '';

    if (files && files.length > 0) {

      const fileArray = Array.from(files);
      const firstRelativePath = fileArray[0].webkitRelativePath;
      console.log("First relative path: ", firstRelativePath);
      const folderName = firstRelativePath.split('/')[0]; // Top-level folder name
      console.log("Detected folder name: ", folderName);
      this.setState({ 
        folderName,
      });
      if (this.props.currentUserProjects.some(project => project.projectName === folderName)) {
        console.log("Project with this name already exists.");
        this.setState({
          errorMessage: `Project with name "${folderName}" already exists. Please choose a different name.`,
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
            const hasSpaces = /\s/.test(file.name);
            const hasSpecialCharacters = /[^a-zA-Z0-9._-]/.test(file.name);

            switch (fileExtension) {
              case 'json':
                uploadType = 'config';

                const parsedConfig = JSON.parse(content);
                console.log('Parsed config:', parsedConfig);
                if (parsedConfig.projectLanguage) {
                  language = parsedConfig.projectLanguage;
                  if (language !== projectLanguage) {
                    errorMessage = `File ${file.name} detected as ${parsedConfig.projectLanguage}, not matching selected project language ${projectLanguage}.`
                    this.setState({
                      //projectErrorMessage: `Project language in config file (${parsedConfig.projectLanguage}) does not match selected project language (${projectLanguage}).`
                    })
                  }
                }

                //Error handling for folder name not matching projectName in config file
                if (parsedConfig.projectName && parsedConfig.projectName !== folderName) {
                  errorMessage = `Folder name "${folderName}" does not match project name "${parsedConfig.projectName}" in config file.`;
                  this.setState({
                    //projectErrorMessage: `Folder name "${folderName}" does not match project name "${parsedConfig.projectName}" in config file.`
                  })
                }
                break;
              case 'h':
                uploadType = 'include';
                language = 'c';
                break;
              case 'txt':
                uploadType = 'data';
                language = 'plaintext';
                break;
              case 'cpp':
              case 'c':
              case 'py':
                for (const [lang, ext] of Object.entries(ProgrammingLanguage.FILE_EXTENSION)) {

                  if (ext === fileExtension) {
                    if (detectedLanguage === projectLanguage) {
                      language = lang as ProgrammingLanguage;
                      uploadType = 'src';
                    }
                    else {
                      uploadType = 'src';
                      errorMessage = `File ${file.name} detected as ${detectedLanguage}, not matching project language ${projectLanguage}.
                    Please ensure all source files match the selected project language.`;

                    }
                  }



                }
                break;

              default:
                uploadType = 'none';
                language = 'plaintext'; // Default to plaintext for unknown extensions
                console.warn(`Unknown file type for ${file.name}, defaulting to plaintext.`);
            }
            if (hasSpaces) {
              errorMessage = `Please remove all spaces in the name "${file.name}".`;
            }
            if(hasSpecialCharacters){
              errorMessage = `Please remove all special characters in the name "${file.name}".`;
            }
            if(file.name.length > 50){
              errorMessage = `File name "${file.name}" exceeds maximum length of 50 characters.`;
            }
            console.log("ErrorMessage: ", errorMessage);
            console.log("ProjectErrorMessage: ", projectErrorMessage);
            return {
              name: file.name,
              content,
              language,
              errorMessage,
              projectErrorMessage,
              uploadType: uploadType,
            };
          })
        );

        console.log("File Infos: ", fileInfos);
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

            sourceFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'src'
            ) || [],
            includeFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'include'
            ) || [],
            dataFiles: this.state.selectedFiles?.filter(
              (f) => f.uploadType === 'data'
            ) || [],
            configFile: this.state.selectedFiles?.find(
              (f) => f.uploadType === 'config'
            ) || { name: '', content: '', errorMessage: '', uploadType: 'none', language: 'none' }
          });
        });
      }


    }
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

  onUploadProjectClick = async () => {
    const { configFile, includeFiles, sourceFiles, dataFiles, projectLanguage } = this.state;
    console.log("Uploading project with state: ", this.state);
    console.log("Uploading project with props: ", this.props);
    const newUploadedProject: UploadedProject =
    {
      configFile: configFile.name === '' ? this.constructProjectConfigFile() : configFile,
      projectName: this.state.folderName,
      projectLanguage: projectLanguage as ProgrammingLanguage,
      includeFolderFiles: includeFiles,
      srcFolderFiles: sourceFiles,
      dataFolderFiles: dataFiles,
    };

    console.log("Uploading project: ", newUploadedProject);

   this.props.onProjectUpload(newUploadedProject);

  }

  constructProjectConfigFile = () : FileInfo => {
    const { folderName, projectLanguage } = this.state;
    const configObject = {
      projectName: folderName,
      projectLanguage: projectLanguage,
      includeFolderFiles: this.state.includeFiles.map((file)=> file.name),
      srcFolderFiles: this.state.sourceFiles.map((file)=> file.name),
      dataFolderFiles: this.state.dataFiles.map((file)=> file.name),
    }
    return {
      name: '.project.config.json',
      language: 'c',
      content: JSON.stringify(configObject, null, 2),
      errorMessage: '',
      uploadType: 'config',
    
    };
  }

  uploadFolderInstructions = () => {
    const { theme, locale } = this.props;
    const languageIndex = LANGUAGE_OPTIONS.findIndex(option => option.data === this.state.projectLanguage);
    return (<>
      {LocalizedString.lookup(tr('Select a Project from your computer to upload\n'), locale)}
      <br />
      {LocalizedString.lookup(tr('Be sure the heirarchy format follows:\n'), locale)}

      <StyledScrollArea theme={theme}>
        <InstructionContainer theme={theme}>
          <ProjectListTitle theme={theme}>
            <ItemIcon icon={faFolderOpen} />
            {LocalizedString.lookup(tr("Project Name"), locale)}
          </ProjectListTitle>
          <div style={{ display: 'flex', marginLeft: '3em' }}>
            <VerticalLine theme={theme} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
              </FilePreviewContainer>
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
              </FilePreviewContainer>
              <SubFolderListTitle theme={theme}>
                <SubItemIcon icon={faFolderOpen} />
                {LocalizedString.lookup(tr('bin'), locale)}
              </SubFolderListTitle>
              <FilePreviewContainer theme={theme} style={{ display: 'flex' }}>
                <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>

                </div>
              </FilePreviewContainer>
            </div>
          </div>

        </InstructionContainer>
      </StyledScrollArea>

      <UploadFolderPreviewButtonContainer style={{ padding: '0.5em 0', alignItems: "center" }} theme={theme}>
        <ComboBoxLabel theme={theme}>Select Project Language:</ComboBoxLabel>
        <StyledResizeableComboBox
          options={LANGUAGE_OPTIONS}
          index={languageIndex}
          onSelect={this.onLanguageSelect}
          theme={theme}
          mainWidth={'10em'}
          mainHeight={'1.5em'}
          mainFontSize={'1em'}

        />

      </UploadFolderPreviewButtonContainer>
      <Button style={{}} disabled={this.state.projectLanguage === "none"} onClick={() => this.fileInputRef.current?.click()} theme={theme}>
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
      /></>)
  };


  configFilePreview = (file: FileInfo, index: number) => {
    const { theme, locale } = this.props;

    return (
      <>
        {file.content !== '' ? (
          <FileListItem style={{ marginLeft: '7px' }} key={index} theme={theme}>
            <SubFolderListTitle theme={theme}>
              <SubItemIcon icon={faFileCode} />
              {LocalizedString.lookup(tr('Config File'), locale)}
            </SubFolderListTitle>
            {file.content != '' ? (
              <FilePreviewContainer theme={theme}>
                <VerticalLine style={{ margin: '0 5px 0 0' }} theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column', paddingLeft: '8px' }}>
                  <FilePreviewItem theme={theme}>
                    <SubItemIcon icon={faFileCode} />
                    {LocalizedString.lookup(tr(`${file.name} `), locale)}
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

  includeFilePreview = (files: FileInfo[], index: number) => {
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
                <div key={i}>
                  <FilePreviewItem theme={theme} key={i}>
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

          </FilePreviewContainer>
        ) : (
          <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
        )}
      </FileListItem>
    );
  };


  sourceFilePreview = (files: FileInfo[], index: number) => {
    const { projectErrorMessage, errorMessage } = this.state;
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



  dataFilePreview = (files: FileInfo[], index: number) => {
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
                <div key={i}>
                  <FilePreviewItem theme={theme} key={i}>
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

          </FilePreviewContainer>
        ) : (
          <p>{LocalizedString.lookup(tr('No files selected.'), locale)}</p>
        )}
      </FileListItem>
    );
  };

  uploadFolderPreview = () => {
    const { theme, locale } = this.props;
    const { selectedFiles, folderName, sourceFiles, includeFiles, dataFiles, configFile, projectLanguage } = this.state;
    return (
      <>

        <TitleContainer theme={theme}>
          <Title theme={theme}>
            <strong>{LocalizedString.lookup(tr('Selected Project Folder: '), locale)}</strong>
            {LocalizedString.lookup(tr(`${folderName} `), locale)}
          </Title>
          <Title theme={theme}>
            <strong>{LocalizedString.lookup(tr('Selected Project Language: '), locale)}</strong>
            {LocalizedString.lookup(tr(`${projectLanguage} `), locale)}
          </Title>

        </TitleContainer>
        <StyledScrollArea theme={theme} >
          <ProjectPreviewContainer theme={theme}>
            <ProjectListTitle theme={theme}>
              <ItemIcon icon={faFolderOpen} />
              {LocalizedString.lookup(tr(`${folderName} `), locale)}
              
            </ProjectListTitle>
            {this.state.projectErrorMessage && (
                <ErrorMessageContainer theme={theme}>
                  <Fa icon={faExclamationTriangle} />
                  {LocalizedString.lookup(tr(`${this.state.projectErrorMessage} `), locale)}
                </ErrorMessageContainer>
              )}
            {selectedFiles && configFile ? (<div style={{ display: 'flex', marginLeft: '3em' }}>
              <VerticalLine theme={theme} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {this.configFilePreview(configFile, 0)}

              </div>
            </div>) :
              (''
              )}

            {selectedFiles && includeFiles && includeFiles.length > 0 ? (
              <div style={{ display: 'flex', marginLeft: '3em' }}>
                <VerticalLine theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {this.includeFilePreview(includeFiles, 0)}
                </div>
              </div>
            ) : (
              ''
            )}

            {selectedFiles && sourceFiles && sourceFiles.length > 0 ? (
              <div style={{ display: 'flex', marginLeft: '3em' }}>
                <VerticalLine theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {this.sourceFilePreview(sourceFiles, 0)}
                </div>
              </div>
            ) : (
              ''
            )}

            {selectedFiles && dataFiles && dataFiles.length > 0 ? (
              <div style={{ display: 'flex', marginLeft: '3em' }}>
                <VerticalLine theme={theme} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {this.dataFilePreview(dataFiles, 0)}
                </div>
              </div>
            ) : (
              ''
            )}

          </ProjectPreviewContainer>
        </StyledScrollArea>
        <UploadFolderPreviewButtonContainer theme={theme}>

          <Button onClick={() => this.setState({ folderName: '', selectedFiles: [], projectLanguage: 'none' })} theme={theme}>
            {LocalizedString.lookup(tr('Choose a different project'), locale)}
          </Button>
          <Button disabled={
            this.state.sourceFiles.some(file => file.errorMessage !== '') ||
            this.state.projectErrorMessage !== '' ||
            this.state.errorMessage !== ''
          } theme={theme} onClick={() => this.onUploadProjectClick()}>
            {LocalizedString.lookup(tr('Upload Project'), locale)}
          </Button>
        </UploadFolderPreviewButtonContainer>

      </>

    )
  };
  uploadFolderError = (errorMessage: string) => {
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
    const { folderName, errorMessage } = this.state;
    console.log('ProjectUploader render state: ', this.state);
    console.log('ProjectUploader render props: ', this.props);
    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Upload Project'), locale)}
        style={{ color: theme.whiteText, backgroundColor: theme.backgroundColor }}
        onClose={onClose}
      >
        <OuterScrollArea theme={theme}>
          <Container theme={theme} style={style} className={className}>
            {!folderName && (
              this.uploadFolderInstructions()
            )}
            {folderName && !errorMessage && (
              this.uploadFolderPreview()
            )}
            {folderName && errorMessage && (
              this.uploadFolderError(errorMessage)
            )}

          </Container>

        </OuterScrollArea>

      </Dialog >
    );
  }

}

export default ProjectUploader;