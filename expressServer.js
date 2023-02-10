import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import {
  botListeningEvents,
  securityMode,
  getLastKnownStatus,
  toggleLastKnownStatus,
  botCSVUpdater,
  initialCSVLoader,
  clearOutResults,
  clearOutProgressResults,
  initialCSV,
  changeInitialCSV,
  changeCSVValues,
} from './discordServer.js';
import { deleteCSVFiles, createCSVFile } from './expressHelpers.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('colors');

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

app.post('/csvCustomizer', (req, res) => {
  req.body = req.body.replaceAll(',', '');
  let arrInputValues = [...req.body];
  console.log('from csv', arrInputValues);
  changeCSVValues(arrInputValues);
  res.status(200).send('Success!');
});

app.post('/initialCSV', async (req, res) => {
  if (initialCSV === false) {
    // make initialCSV true
    changeInitialCSV();
  } else {
    // clear out corresponding results array in
    // discordServer.js since new CSV file is being uploaded
    clearOutResults();

    // delete old CSV files
    const directory = './initialCSV';
    deleteCSVFiles(directory);
  }

  const currentTime = Date.now();
  const pathToFile = `./initialCSV/initialCSV--${currentTime}.csv`;
  const successMessage =
    'Your CSV file was successfully uploaded. The Discord Bot will now use the information provided to verify new users who join the server.';
  createCSVFile(pathToFile, req.body, res, successMessage, initialCSVLoader);
});

let progressCSV = false;

app.post('/csvFile', (req, res) => {
  if (progressCSV === false) {
    progressCSV = true;
  } else {
    // clear out corresponding results array in
    // discordServer.js since new CSV file is being uploaded
    clearOutProgressResults();

    // delete old CSV files
    const directory = './progressCSV';
    deleteCSVFiles(directory);

    // create new CSV File and write it to folder path
    const currentTime = Date.now();
    const pathToFile = `./progressCSV/progressCSV--${currentTime}.csv`;
    const successMessage =
      'Your CSV file was successfully uploaded. Please allow the Discord bot a few seconds to complete all required role changes.';
    createCSVFile(pathToFile, req.body, res, successMessage, botCSVUpdater);
  }
});

app.listen('3000', () => {
  console.log('Server is up on port 3000.'.green);
  botListeningEvents();
});
