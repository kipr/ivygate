import {  combineReducers, applyMiddleware, compose } from 'redux';

import { configureStore } from '@reduxjs/toolkit';
import { DocumentationState } from "./State";
import { createBrowserHistory } from "history";
import * as reducer from './reducer';
import { I18n } from './State';

export const history = createBrowserHistory();



const rootReducer = combineReducers({
  documentationDefault: reducer.reduceDocumentation,
  documentationCommon: reducer.reduceDocumentationCommon,
  i18n: reducer.reduceI18n,
});

const store = configureStore({
  reducer: rootReducer,


});

export interface State {
  documentationDefault: DocumentationState;
  documentationCommon: DocumentationState;
  i18n: I18n
  
}
export default store;