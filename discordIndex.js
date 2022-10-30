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

// guildID is the server ID (change as you wish)
const guildID = '1034878587129569401';
// results array from CSV file
const results = [];

// nodeJS configuration
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const filePath = path.join(__dirname, 'public');
app.use(express.static(filePath));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// discord.js configuration
const client = new Client({
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
    .pipe(
      csv(['FirstName', 'LastName', 'StudentNumber', 'Level', 'CourseName'])
    )
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('Successfully loaded in CSV file.');
    });
});

client.on('guildMemberAdd', (member) => {
  member.send(
    `Welcome to the server ${member.user.username}. If you wish to gain full access to the server, please type your first name, surname, student number, level (L4/L5/L6), and course in one message seperated by spaces.`
  );
  member.send(`For example: Josh Smith UP12345 L5 Computer Science`);
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

  // if user message is longer than 5 or 6 length, they have
  // incorrectly formatted their message (eg. extra spaces)
  if (messageArray.length !== 5 && messageArray.length !== 6) {
    return message.reply(
      'Incorrect information provided. Please make sure you have spelled everything correctly and followed the proper format. Example: Josh Smith UP12345 L5 Computer Science'
    );
  }

  console.log(results);

  if (messageArray.length === 5) {
    // outer for loop is for results object
    // inner for loop is for users message content
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < messageArray.length; j++) {
        if (messageArray[j].toUpperCase() === Object.values(results[i])[j]) {
          matchFound++;
        }

        if (matchFound === 5) break;
      }
    }
  } else {
    let courseName = messageArray[4] + messageArray[5];
    messageArray = messageArray.slice(0, 4);
    messageArray = [...messageArray, courseName];

    outerloop: for (let i = 0; i < results.length; i++) {
      // reset matchFound for every row
      matchFound = 0;
      for (let j = 0; j < messageArray.length; j++) {
        if (messageArray[j].toUpperCase() === Object.values(results[i])[j]) {
          matchFound++;
        }
        if (matchFound === 5) break outerloop;
      }
    }
  }

  // total 5 rows should match, so if matchfound = 5
  // all rows matched and student is successfully identified
  if (matchFound === 5) {
    let userRole = messageArray[4];
    let userLevel = messageArray[3];

    // grab all members from server to find match
    const members = await client.guilds.cache.get(guildID).members.fetch();

    // all role IDs
    let roles = {
      L4COMPUTERSCIENCE: '1036313827983249468',
      L4CYBERSECURITY: '1036313827983249468',
      L4SOFTWAREENGINEERING: '1036289578648215654',
      L5COMPUTERSCIENCE: '1036313889010352170',
      L5CYBERSECURITY: '1036313889010352170',
      L5SOFTWAREENGINEERING: '1036289626446516274',
      L6COMPUTERSCIENCE: '1036313942005399553',
      L6CYBERSECURITY: '1036313942005399553',
      L6SOFTWAREENGINEERING: '1036289659501805648',
    };

    members.forEach((member) => {
      try {
        if (member.user.id === message.author.id) {
          messageArray[0] = messageArray[0].toLowerCase();
          messageArray[2] = messageArray[2].toLowerCase();
          member
            .setNickname(
              `${messageArray[0][0].toUpperCase()}${messageArray[0]
                .slice(1)
                .toLowerCase()} ${messageArray[1][0].toUpperCase()} / ${
                messageArray[2]
              }`
            )
            .catch((e) => console.log(e, 'Error, invalid permissions.'));

          let usersRole = userLevel + userRole;
          usersRole = usersRole.toUpperCase();
          console.log(usersRole);
          member.roles.add(roles[usersRole]);
        }
      } catch (e) {
        console.log(e);
      }
    });
    message.reply(
      'Successfully identified. Changing your nickname & role now.'
    );
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
