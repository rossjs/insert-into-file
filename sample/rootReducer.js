import { combineReducers } from 'redux';

import search from './search';
import modal from './modal';
import snackbar from './snackbar';

const createGlobalReducer = () => (
  combineReducers({
    search,
    modal,
    snackbar,
  })
);

export default createGlobalReducer;
