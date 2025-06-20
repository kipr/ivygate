

import Documentation from './Documentation';
import { Size } from '../../components/interface/Widget';
import DocumentationLocation from './Documentation/DocumentationLocation';
import LocalizedString from '../../util/LocalizedString';

export interface DocumentationState {
  documentation: Documentation;
  locationStack: DocumentationLocation[];
  size: Size;
  language: 'c' | 'python';
}
export namespace DocumentationState {
  export const DEFAULT: DocumentationState = {
    documentation: IDE_LIBKIPR_C_DOCUMENTATION as Documentation || Documentation.EMPTY,
    locationStack: [],
    size: Size.MINIMIZED,
    language: 'c'
  };
}
export interface I18n {
  locale: LocalizedString.Language;
}
