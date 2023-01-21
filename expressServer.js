import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import { botListeningEvents, securityMode } from './discordServer.js';
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
app.use(express.json());

app.get('/', (req, res) => {
  res.send('index');
});

app.get('/security', (req, res) => {
  res.send(securityMode());
});

app.listen('3000', () => {
  console.log('Server is up on port 3000.'.green);
  botListeningEvents();
});
