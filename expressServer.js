import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import {
  botListeningEvents,
  securityMode,
  botCSVUpdater,
  getLastKnownStatus,
  toggleLastKnownStatus,
  initialCSVLoader,
  clearOutResults,
  clearOutProgressResults,
  initialCSV,
  changeInitialCSV,
} from './discordServer.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('colors');
const fs = require('fs');

// express configuration
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, 'public');
app.use(express.static(filePath));
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

app.get('/', (req, res) => {
  res.send('index');
});

app.get('/security', (req, res) => {
  res.send(securityMode());
});

app.get('/lastStatus', (req, res) => {
  res.send(getLastKnownStatus());
});

app.patch('/lastStatus', (req, res) => {
  res.send(toggleLastKnownStatus());
});

app.post('/initialCSV', async (req, res) => {
  if (initialCSV === false) {
    changeInitialCSV();
  } else {
    // delete all csv files in folder and clear out
    // corresponding results array in discordServer.js
    // since new CSV file is being uploaded
    clearOutResults();

    // clear out initialCSV folder before new CSV
    // file is uploaded
    const directory = './initialCSV';
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }

  const currentTime = Date.now();
  const pathToFile = `./initialCSV/initialCSV--${currentTime}.csv`;
  await fs.promises.writeFile(pathToFile, req.body, function (err) {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .send(
          'Error with your file upload. Please make sure it is a valid CSV file.'
        );
    }
    console.log('The CSV file was successfully saved!');
  });

  initialCSVLoader(pathToFile);

  return res
    .status(200)
    .send(
      'Your CSV file was successfully uploaded. The Discord Bot will now use the information provided to verify new users who join the server.'
    );
});

let progressCSV = false;

app.post('/csvFile', (req, res) => {
  if (progressCSV === false) {
    progressCSV = true;
  } else {
    // delete all csv files in folder and clear out
    // corresponding results array in discordServer.js
    // since new CSV file is being uploaded
    clearOutProgressResults();

    // clear out initialCSV folder before new CSV
    // file is uploaded
    const directory = './progressCSV';
    fs.readdir(directory, (err, files) => {
      if (err) throw err;

      for (const file of files) {
        fs.unlink(path.join(directory, file), (err) => {
          if (err) throw err;
        });
      }
    });
  }

  const currentTime = Date.now();
  const pathToFile = `./progressCSV/progressCSV--${currentTime}.csv`;
  fs.writeFile(pathToFile, req.body, function (err) {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .send(
          'Error with your file upload. Please make sure it is a valid CSV file.'
        );
    }
    console.log('The CSV file was successfully saved!');
    botCSVUpdater(pathToFile);
    return res
      .status(200)
      .send(
        'Your CSV file was successfully uploaded. Please allow the Discord bot a few seconds to complete all required role changes.'
      );
  });
});

app.listen('3000', () => {
  console.log('Server is up on port 3000.'.green);
  botListeningEvents();
});
