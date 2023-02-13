/* this file contains helper functions to be imported
into expressServer.js file */

import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('colors');
const fs = require('fs');

export function deleteCSVFiles(directory) {
  // clear out initialCSV folder before new CSV
  // file is uploaded
  fs.readdir(directory, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(directory, file), (err) => {
        if (err) throw err;
      });
    }
  });
}

export function createCSVFile(
  pathToFile,
  requestBody,
  response,
  successMessage,
  functionToRun
) {
  fs.writeFile(pathToFile, requestBody, function (err) {
    if (err) {
      console.log(err);
      return response
        .status(400)
        .send(
          'Error with your file upload. Please make sure it is a valid CSV file.'
        );
    }
    console.log('The CSV file was successfully saved!');
    functionToRun(pathToFile);
    return response.status(200).send(`${successMessage}`);
  });
}
