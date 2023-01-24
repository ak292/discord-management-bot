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

app.post('/csvFile', (req, res) => {
  const currentTime = Date.now();
  const path = `./csvFiles/csvFile--${currentTime}.csv`;
  fs.writeFile(path, req.body, function (err) {
    if (err) {
      console.log(err);
      return res
        .status(400)
        .send(
          'Error with your file upload. Please make sure it is a valid CSV file.'
        );
    }
    console.log('The CSV file was successfully saved!');
    botCSVUpdater(path);
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
