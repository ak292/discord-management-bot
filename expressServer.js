import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import { botListeningEvents, botCSVUpdater } from './discordServer.js';

// nodeJS configuration
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

app.post('/csv', (req, res) => {
  const csvFileName = req.body.val;
  botCSVUpdater(csvFileName);
  res.send({ status: 200 });
});

app.listen('3000', () => {
  console.log('Server is up on port 3000.');
  botListeningEvents();
});
