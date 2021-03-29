const path = require('path');
const insertIntoFile = require('../index.js');

function createReducer (reducerName) {

  const reducerPath = path.resolve(__dirname, '..', 'output', 'reducers');

  const options = {
    readFromPath: path.resolve(__dirname, '..', 'sample', 'rootReducer.js'),
    writeToPath: path.resolve(reducerPath, 'index.js'),
    patterns: [
      {
        startPatterns: [/redux/],
        insertData: `import ${reducerName} from './${reducerName}';`,
        endPatterns: [/import/, /^\s*$/],
      },{
        startPatterns: [/.*combineReducers\(\{.*/],
        insertData: `    ${reducerName},`,
        endPatterns: [/.*\}\)/],
      }
    ]
  };
  
  insertIntoFile(options);
}

createReducer('pizza');
