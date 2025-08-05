import * as React from 'react';
import LocalizedString from './util/LocalizedString';
import { ThemeProps, Theme } from './components/constants/theme';
import { StyleProps } from './components/constants/style';
import { styled } from 'styletron-react';
import tr from './i18n';
import { Dialog } from './components/Dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan, faExclamationTriangle, faFileCode } from '@fortawesome/free-solid-svg-icons';
import ProgrammingLanguage from './types/programmingLanguage';
import { Fa } from './components/Fa';
import ScrollArea from './components/interface/ScrollArea';
import { FileInfo } from './types/fileInfo';
import { Project } from './types/project';

export interface FileUploaderPublicProps extends StyleProps, ThemeProps {
  theme: Theme;
  currentUserProjectFiles: Project;
  currentLanguage: ProgrammingLanguage;
  uploadType: 'user' | 'project' | 'include' | 'src' | 'data' | 'none';
  onFileUpload: (files: FileInfo[]) => void;
  onClose: () => void;
}
interface FileUploaderPrivateProps {
  locale: LocalizedString.Language;
}
interface FileUploaderState {
  selectedFiles: FileInfo[] | null;
  errorMessage?: string;
}

type Props = FileUploaderPublicProps & FileUploaderPrivateProps;
type State = FileUploaderState;

const Container = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  color: props.theme.color,
  backgroundColor: props.theme.backgroundColor,
  minHeight: '300px',
  maxHeight: '50vh',
  alignItems: 'center',
  padding: '1em'
}));

const UploadFileButton = styled('div', (props: ThemeProps & { disabled?: boolean }) => ({
  flex: '1 1',
  borderRadius: `${props.theme.itemPadding * 2}px`,
  padding: `${props.theme.itemPadding * 2}px`,
  backgroundColor: props.disabled ? props.theme.yesButtonColor.disabled : props.theme.yesButtonColor.standard,
  ':hover': props.disabled ? {} : {
    backgroundColor: props.theme.yesButtonColor.hover,
  },
  minWidth: '24em',
  fontWeight: 400,
  fontSize: '1.1em',
  textAlign: 'center',
  cursor: props.disabled ? 'auto' : 'pointer',
  marginBottom: '2.5em'
}));

const StyledScrollArea = styled(ScrollArea, ({ theme }: ThemeProps) => ({
  flex: 1,
  marginBottom: '1.5em',
  marginTop: '1em',
  paddingBottom: '13em',
  minHeight: '28vh',
  border: `2px solid ${theme.borderColor}`,
}));


const Button = styled('button', (props: ThemeProps) => ({
  margin: '0 10px',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  backgroundColor: props.theme.yesButtonColor.standard,
}));


const FileListContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'column',
  marginTop: '10px',
  color: props.theme.color,
  maxHeight: '90vh',
  minHeight: '40vh',
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

const FileListTitle = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'row',
  fontWeight: 'bold',
  fontSize: '1.2em',

}));

const TrashIcon = styled(FontAwesomeIcon, {
  paddingLeft: '3px',
  paddingRight: '5px',
  height: '1.4em',
  '@media (max-width: 850px)': {
    width: '1.2rem',
  },
});


const ErrorMessageContainer = styled('div', (props: ThemeProps) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: 'red',
  color: 'white',
  height: '40px',
  alignItems: 'center',
  marginTop: '10px',
  paddingRight: '10px',
  paddingLeft: '10px',
  gap: '5px'
}));

const ItemIcon = styled(Fa, {
  paddingLeft: '10px',
  paddingRight: '10px',
  alignItems: 'center',
  height: '30px'
});


class FileUploader extends React.Component<Props, State> {
  fileInputRef: React.RefObject<HTMLInputElement>;
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedFiles: null,
      errorMessage: '',
    };
    this.fileInputRef = React.createRef();
  }


  handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {

    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);

      const fileInfos = await Promise.all(
        fileArray.map(async (file) => {
          const content = await file.text();
          let language;
          let errorMessage = '';
          if (this.props.uploadType === 'include') {
            const projectIncludeFiles = this.props.currentUserProjectFiles?.includeFolderFiles || [];
            const isFileAlreadyIncluded = projectIncludeFiles.some(includeFile => includeFile === file.name);
            if (isFileAlreadyIncluded) {
              errorMessage = LocalizedString.lookup(tr('The selected file is already included in the project.'), this.props.locale);
            }
            language = await this.detectLanguage(file);
            if (language !== 'c') {
              errorMessage = LocalizedString.lookup(tr('The selected file does not match the expected language.'), this.props.locale);
            }
            if (!file.name.endsWith('.h')) {
              errorMessage = LocalizedString.lookup(tr('The selected file must have a .h extension.'), this.props.locale);
            }
          }
          else if (this.props.uploadType === 'src') {
            const projectSrcFiles = this.props.currentUserProjectFiles?.srcFolderFiles || [];
            const isFileAlreadyIncluded = projectSrcFiles.some(srcFile => srcFile === file.name);
            if (isFileAlreadyIncluded) {
              errorMessage = LocalizedString.lookup(tr('The selected file is already included in the project.'), this.props.locale);
            }
            language = await this.detectLanguage(file);
            if (language !== this.props.currentLanguage) {
              errorMessage = LocalizedString.lookup(tr('The selected file does not match the expected language.'), this.props.locale);
            }
          }
          else if (this.props.uploadType === 'data') {
            const projectDataFiles = this.props.currentUserProjectFiles?.dataFolderFiles || [];
            const isFileAlreadyIncluded = projectDataFiles.some(dataFile => dataFile === file.name);
            if (isFileAlreadyIncluded) {
              errorMessage = LocalizedString.lookup(tr('The selected file is already included in the project.'), this.props.locale);
            }
            if (!file.name.endsWith('.txt')) {
              errorMessage = LocalizedString.lookup(tr('The selected file must have a .txt extension.'), this.props.locale);
            }
          }
          else {
            language = '';
          }


          return {
            name: file.name,
            content,
            language,
            errorMessage,
            uploadType: this.props.uploadType,
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

      });
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

  onUploadClick = async () => {
    const { selectedFiles } = this.state;
    const { currentLanguage } = this.props;

    if (selectedFiles) {
      if (!selectedFiles.some(fileInfo => fileInfo.errorMessage)) {
        this.props.onFileUpload(selectedFiles);
        this.props.onClose();
      }
    }

  }

  render() {
    const { theme, locale, style, className, onClose } = this.props;
    const { selectedFiles } = this.state;
    console.log("FileUploader render props:", this.props);
    return (
      <Dialog
        theme={theme}
        name={LocalizedString.lookup(tr('Upload File'), locale)}
        style={{ color: theme.whiteText }}
        onClose={onClose}
      >
        <Container theme={theme} style={style} className={className}>
          <p>{LocalizedString.lookup(tr('Select a file from your computer to upload'), locale)}</p>
          <Button onClick={() => this.fileInputRef.current?.click()} theme={theme}>
            {LocalizedString.lookup(tr('Choose File'), locale)}
          </Button>
          <input
            type="file" multiple
            ref={this.fileInputRef}
            onChange={this.handleFileChange}
            style={{ display: 'none' }}

          />

          <StyledScrollArea theme={theme}>
            <FileListContainer theme={theme}>
              {selectedFiles ? (

                this.state.selectedFiles.map(fileInfo => (

                  <FileListItem theme={theme} key={fileInfo.name + fileInfo.language}>
                    <FileListTitle theme={theme}>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <ItemIcon icon={faFileCode} />
                        {LocalizedString.lookup(tr(`${fileInfo.name}`), locale)}
                      </div>
                      <TrashIcon
                        icon={faTrashCan}
                        onClick={() => {
                          this.setState(prevState => ({
                            selectedFiles: prevState.selectedFiles?.filter(f => f.name !== fileInfo.name)
                          }));
                        }}
                        style={{ cursor: 'pointer', color: theme.color }}
                      />
                    </FileListTitle>

                    {fileInfo.errorMessage && (
                      <ErrorMessageContainer theme={theme}>
                        <Fa icon={faExclamationTriangle} />
                        {fileInfo.errorMessage}
                      </ErrorMessageContainer>
                    )}
                  </FileListItem>
                ))) : (
                <FileListItem theme={theme}>
                  {LocalizedString.lookup(tr('No file selected'), locale)}
                </FileListItem>
              )}
            </FileListContainer>
          </StyledScrollArea>
          <UploadFileButton
            theme={theme}
            disabled={!this.state.selectedFiles}
            onClick={() => this.onUploadClick()} >
            Upload File
          </UploadFileButton>

        </Container>
      </Dialog>
    );
  }


}

export default FileUploader;