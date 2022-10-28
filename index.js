const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv/config');
const csv = require('csv-parser');
const fs = require('fs');
const results = [];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
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
  console.log(`Welcome to the server ${member.user.username}.`);
});

client.on('messageCreate', async (message) => {
  // Line below so bot doesn't detect its own message
  if (message.author.bot === true) {
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
    const members = await message.guild.members.fetch();

    members.forEach((member) => {
      try {
        if (member.user.id === message.author.id) {
          member
            .setNickname(`${messageArray[0].toUpperCase()}`)
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
