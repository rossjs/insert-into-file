// ! WARNING: this library currently stores the entire file contents in memory before writing to the file
// which may have significant memory/performance issues, especially if attepmting to run in parallel

const fs = require('fs');
const lineByLine = require('n-readlines');
const chalk = require('chalk');

const createPatterns = (patterns) => patterns.map(({ startPatterns, endPatterns, insertData }) => {
  if (typeof insertData !== 'string' && !Array.isArray(insertData)) {
    throw 'insertData property must be a string or an array';
  }
  // insertData must be an array
  if (!Array.isArray(insertData)) {
    insertData = [insertData];
  }

  const _startPatterns = startPatterns.map((pattern) => ({ regex: pattern, found: false }));
  const _endPatterns = endPatterns.map((pattern) => ({ regex: pattern, found: false }));

  return {
    startPatterns: _startPatterns,
    endPatterns: _endPatterns,
    insertData,
    startPatternFound: false,
    endPatternFound: false,
  };
});

module.exports = async function insertIntoFile(options) {
  let { readFromPath, patterns, repeating, writeToPath } = options;

  // create patterns objects
  const _patterns = createPatterns(patterns);

  // store new 
  let updatedFileContents = '';
  let line;
  
  const liner = new lineByLine(readFromPath);
  
  // loop through each line of the file
  while (line = liner.next()) {
    console.log(chalk.yellow(line));
    let lineInserted = false;

    // loop through each pattern
    for (let pattern of _patterns) {
      const { startPatterns, endPatterns, insertData } = pattern;

      let allEndPatternsFound = endPatterns.every(pattern => pattern.found);
      // restart search and insert operations if "repeating" option was set
      if (repeating && allEndPatternsFound) {
        startPatterns.forEach((pattern) => pattern.found = false);
        endPatterns.forEach((pattern) => pattern.found = false);
      }

      let allStartPatternsFound = startPatterns.every(pattern => pattern.found);
    
      // search for start pattern
      if (!allStartPatternsFound) {
        for (let pattern of startPatterns) {
          if (pattern.found) continue;
          // search line for start pattern
          const patternMatch = pattern.regex.test(line);
          console.log(chalk.green('startPatternMatch', patternMatch));
          if (patternMatch) {
            // if the start pattern matches, began searching for end pattern
            pattern.found = true;
          } else {
            // stop searching for patterns if current pattern fails
            break;
          }
        }
        allStartPatternsFound = startPatterns.every(pattern => pattern.found);
        // if we haven't found all of the start patterns yet, add line and break out of current pattern
        if (!allStartPatternsFound) {
          lineInserted = true;
          updatedFileContents += `${line}\n`;
        }
        continue;
      }

      // search for end pattern
      if (!allEndPatternsFound) {
        for (let pattern of endPatterns) {
          if (pattern.found) continue;
          // if end pattern matches, add in insertData statements
          const patternMatch = pattern.regex.test(line);
          if (patternMatch) {
            console.log(chalk.magenta('endPatternMatch', patternMatch));
            pattern.found = true;
            // check again to see if 
            allEndPatternsFound = endPatterns.every(pattern => pattern.found);
            if (allEndPatternsFound) {
              // add each insertData string as a new line
              insertData.forEach((insertDataString) => {
                updatedFileContents += `${insertDataString}\n`;
              });
            }
          } else {
            // stop searching for patterns if current pattern fails
            break;
          }
          // if (!lineInserted) {
          //   lineInserted = true;
          //   updatedFileContents += line;
          // }
          // pattern.found = true;
        }
      }
    }
    if (!lineInserted) {
      lineInserted = true;
      updatedFileContents += `${line}\n`;
    }
  }

  if (writeToPath) {
    // write to the path provided
    fs.writeFileSync(writeToPath, updatedFileContents);
  } else {
    // overwrite the read file
    fs.writeFileSync(readFromPath, updatedFileContents);
  }

  console.log(chalk.cyan(updatedFileContents));

};
