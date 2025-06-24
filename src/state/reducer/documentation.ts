import { DocumentationState } from '../State';
import Documentation from '../State/Documentation';
import DocumentationLocation from '../State/Documentation/DocumentationLocation';
import construct from '../../util/redux/construct';
import { Size } from '../../components/interface/Widget';

export namespace DocumentationAction {
  export interface Push {
    type: 'documentationDefault/push' | 'documentationCommon/push';
    location: DocumentationLocation;
  }

  export const pushLocation = construct<Push>('documentationDefault/push');
  export const pushLocationCommon = construct<Push>('documentationCommon/push');

  export interface Pop {
    type: 'documentationDefault/pop' | 'documentationCommon/pop';
  }

  export const POP: Pop = { type: 'documentationDefault/pop' };
  export const POP_COMMON: Pop = { type: 'documentationCommon/pop' };

  export interface PopAll {
    type: 'documentationDefault/pop-all' | 'documentationCommon/pop-all';
  }

  export const POP_ALL: PopAll = { type: 'documentationDefault/pop-all' };
  export const POP_ALL_COMMON: PopAll = { type: 'documentationCommon/pop-all' };

  export interface Hide {
    type: 'documentationDefault/hide' | 'documentationCommon/hide';
  }

  export const HIDE: Hide = { type: 'documentationDefault/hide' };
  export const HIDE_COMMON: Hide = { type: 'documentationCommon/hide' };

  export interface Show {
    type: 'documentationDefault/show' | 'documentationCommon/show';
  }

  export const SHOW: Show = { type: 'documentationDefault/show' };
  export const SHOW_COMMON: Show = { type: 'documentationCommon/show' };

  export interface SetSize {
    type: 'documentationDefault/set-size' | 'documentationCommon/set-size';
    size: Size;
  }

  export const setSize = construct<SetSize>('documentationDefault/set-size');
  export const setSizeCommon = construct<SetSize>('documentationCommon/set-size');

  export interface Toggle {
    type: 'documentationDefault/toggle' | 'documentationCommon/toggle';
  }

  export const TOGGLE: Toggle = { type: 'documentationDefault/toggle' };
  export const TOGGLE_COMMON: Toggle = { type: 'documentationCommon/toggle' };

  export interface PopSome {
    type: 'documentationDefault/pop-some' | 'documentationCommon/pop-some';
    count: number;
  }

  export const popSome = construct<PopSome>('documentationDefault/pop-some');
  export const popSomeCommon = construct<PopSome>('documentationCommon/pop-some');

  export interface SetLanguage {
    type: 'documentationDefault/set-language' | 'documentationCommon/set-language';
    language: 'c' | 'python';
  }

  export const setLanguage = construct<SetLanguage>('documentationDefault/set-language');
  export const setLanguageCommon = construct<SetLanguage>('documentationCommon/set-language');

  export interface GoTo {
    type: 'documentationDefault/go-to' | 'documentationCommon/go-to';
    location: DocumentationLocation;
    language: 'c' | 'python';
  }

  export const goTo = construct<GoTo>('documentationDefault/go-to');
  export const goToCommon = construct<GoTo>('documentationCommon/go-to');

  export interface GoToFuzzy {
    type: 'documentationDefault/go-to-fuzzy' | 'documentationCommon/go-to-fuzzy';
    query: string;
    language: 'c' | 'python';
  }

  export const goToFuzzy = construct<GoToFuzzy>('documentationDefault/go-to-fuzzy');
  export const goToFuzzyCommon = construct<GoToFuzzy>('documentationCommon/go-to-fuzzy');
}

export type DocumentationAction = (
  DocumentationAction.Push |
  DocumentationAction.Pop |
  DocumentationAction.PopAll |
  DocumentationAction.Hide |
  DocumentationAction.Show |
  DocumentationAction.SetSize |
  DocumentationAction.Toggle |
  DocumentationAction.PopSome |
  DocumentationAction.SetLanguage |
  DocumentationAction.GoTo |
  DocumentationAction.GoToFuzzy
);

const createDocumentationReducer = (initialState: DocumentationState, namespace: string) => {
  return (state: DocumentationState = initialState, action: DocumentationAction): DocumentationState => {
    switch (action.type) {

      case `${namespace}/push`:
        if ('location' in action) {
          return {
            ...state,
            locationStack: [...state.locationStack, action.location],
          };
        }
        return state;

      case `${namespace}/pop`:
        return {
          ...state,
          locationStack: state.locationStack.slice(0, -1),
        };
      case `${namespace}/pop-all`:
        return {
          ...state,
          locationStack: [],
        };
      case `${namespace}/hide`: return {
        ...state,
        size: Size.MINIMIZED,
      };
      case `${namespace}/show`: return {
        ...state,
        size: Size.PARTIAL,
      };

      case `${namespace}/set-size`:
        if ('size' in action) {
          return {
            ...state,
            size: action.size,
          };
        }
        return state;

      case `${namespace}/toggle`: return {
        ...state,
        size: state.size.type === Size.Type.Minimized ? Size.PARTIAL : Size.MINIMIZED,
      };

      case `${namespace}/pop-some`:
        if ('count' in action) {
          return {
            ...state,
            locationStack: state.locationStack.slice(0, -action.count),
          };
        }
        return state;

      case `${namespace}/set-language`:
        if ('language' in action) {
          return {
            ...state,
            language: action.language,
          };
        }
        return state;

      case `${namespace}/go-to`:
        if ('location' in action && 'language' in action) {  // TypeScript narrows here
          return {
            ...state,
            locationStack: [action.location],
            language: action.language,
            size: state.size === Size.MINIMIZED ? Size.PARTIAL : state.size,
          };
        }
        return state;
      case `${namespace}/go-to-fuzzy`: {
        if ('query' in action && 'language' in action) {
          const { query, language } = action;
          const location = Documentation.lookup(state.documentation, query);
          if (location) {
            return {
              ...state,
              locationStack: [location],
              language,
              size: state.size === Size.MINIMIZED ? Size.PARTIAL : state.size,
            };
          }
          return {
            ...state,
            locationStack: [],
            language,
            size: state.size === Size.MINIMIZED ? Size.PARTIAL : state.size,
          };
        }
        return state;
      }
      default: return state;
    }
  }
};



export const reduceDocumentation = createDocumentationReducer(DocumentationState.DEFAULT, "documentationDefault");
export const reduceDocumentationCommon = createDocumentationReducer(DocumentationState.COMMON, "documentationCommon");