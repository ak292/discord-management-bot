import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import express from 'express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv/config');
const csv = require('csv-parser');
const fs = require('fs');

const guildID = '1034878587129569401';
const results = [];

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, 'public');
app.use(express.static(filePath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const client = new Client({
  // partials: [Partials.Channel, Partials.Message],
  partials: [Partials.Channel],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageTyping,
  ],
});

client.on('ready', async () => {
  console.log(`Bot successfully connected at ${client.user.tag}`);

  // load in CSV file
  fs.createReadStream('dummydata.csv')
    .pipe(csv(['FirstName', 'LastName', 'StudentNumber', 'CourseName']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('Successfully loaded in CSV file.');
    });
});

client.on('guildMemberAdd', (member) => {
  member.send(
    `Welcome to the server ${member.user.username}. If you wish to gain full access to the server, please type your first name, surname, student number, and course in one message seperated by spaces.`
  );
  member.send(`For example: Josh Smith UP12345 Computer Science`);
});

client.on('messageCreate', async (message) => {
  // line below so bot doesn't detect its own messages
  if (message.author.bot === true) {
    return;
  }

  // bot only works with DMs
  if (message.channel.type !== 1) {
    return;
  }

  let matchFound = 0;
  let messageArray = message.content.split(' ');
  console.log(messageArray);

  // outer for loop is for results object
  // inner for loop is for users message content
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < messageArray.length; j++) {
      if (messageArray[j].toUpperCase() === Object.values(results[i])[j]) {
        matchFound++;
      }

      if (matchFound === 4) break;
    }
  }

  // total 4 rows should match, so if matchfound = 4
  // all rows matched and student is successfully identified
  if (matchFound === 4) {
    // grab all members from server to find match
    const members = await client.guilds.cache.get(guildID).members.fetch();
    // console.log(members);

    members.forEach((member) => {
      try {
        if (member.user.id === message.author.id) {
          member
            .setNickname(
              `${messageArray[0][0].toUpperCase()}${messageArray[0].slice(1)} ${
                messageArray[1][0]
              } / ${messageArray[2]}`
            )
            .catch((e) => console.log(e, 'Error, invalid permissions.'));
        }
      } catch (e) {
        console.log(e);
      }
    });
    message.reply('Successfully identified. Changing your nickname now.');
  } else {
    message.reply('Cannot identify you. Invalid information provided.');
  }
});

client.login(process.env.TOKEN);

app.get('/', (req, res) => {
  res.send('index');
});

// app.post('/csv', (req, res) => {
//   const csvFileName = 'dummydata';
//   res.send({
//     csvFileName,
//   });
//   // const csvFileName = req.body.value;
// });

app.listen('3000', () => {
  console.log('Server is up on port 3000.');
});
