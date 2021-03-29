import { combineReducers } from 'redux';

import search from './search';
import modal from './modal';
import snackbar from './snackbar';
import pizza from './pizza';

const createGlobalReducer = () => (
  combineReducers({
    search,
    modal,
    snackbar,
    pizza,
  })
);

export default createGlobalReducer;
