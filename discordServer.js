import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client, GatewayIntentBits, Partials } = require('discord.js');
require('dotenv/config');
const csv = require('csv-parser');
const fs = require('fs');
require('colors');

// guildID is the server ID (change as you wish)
const guildID = '1034878587129569401';
// results array from CSV file
const results = [];

// global variables required so I can make
// use of them in mutliple functions below
let middleName = '';
let securityQuestion = false;
let studentNumber = '';
let securityMatchFound = false;
let matchFound = 0;
let messageArray = '';
let messageAuthor = '';

let lastKnownSecurityStatus = '';

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
  ALUMNI: '1066931568112848990',
};

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

export function botListeningEvents() {
  client.on('ready', async () => {
    console.log(`Bot successfully connected at ${client.user.tag}`.green);

    // load in CSV file
    fs.createReadStream('dummydata.csv')
      .pipe(
        csv([
          'FirstName',
          'LastName',
          'StudentNumber',
          'Level',
          'CourseName',
          'MiddleName',
        ])
      )
      .on('data', (data) => results.push(data))
      .on('end', () => {
        console.log('Successfully loaded in CSV file.'.green);
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

    // seperate event listener for the security question mode
    if (message.content.startsWith('!')) {
      middleName = message.content.split('').slice(1).join('').toUpperCase();

      for (let i = 0; i < results.length; i++) {
        if (
          Object.values(results[i])[2] === studentNumber &&
          Object.values(results[i])[5] === middleName
        ) {
          securityMatchFound = true;
          break;
        } else {
          securityMatchFound = false;
        }
      }

      if (!securityMatchFound) {
        return message.reply('Incorrect answer. Please try again.');
      } else {
        message.reply('Correct answer! Changing your nickname and role now.');

        nameAndRoleChanger();
      }
      return;
    }

    messageAuthor = message.author.id;
    messageArray = message.content.split(' ');

    // if user message is longer than 5 or 6 length, they have
    // incorrectly formatted their message (eg. extra spaces)
    if (messageArray.length !== 5 && messageArray.length !== 6) {
      return message.reply(
        'Incorrect information provided. Please make sure you have spelled everything correctly and followed the proper format. Example: Josh Smith UP12345 L5 Computer Science'
      );
    }

    if (messageArray.length === 5) {
      // outer for loop is for results object
      // inner for loop is for users message content
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
          if (matchFound === 5) {
            break outerloop;
          }
        }
      }
    }

    studentNumber = messageArray[2];

    // total 5 rows should match, so if matchfound = 5
    // all rows matched and student is successfully identified
    if (matchFound === 5) {
      if (securityQuestion) {
        return await message.reply(
          'For security purposes, please answer: What is your middle name? Type your answer with an exclamation mark followed by your middle name. For example: !Michael'
        );
      }

      nameAndRoleChanger();

      message.reply(
        'Successfully identified. Changing your nickname & role now.'
      );
    } else {
      message.reply('Cannot identify you. Invalid information provided.');
    }
  });
}

export function securityMode() {
  if (securityQuestion) {
    securityQuestion = false;
    return { msg: 'Security mode has been turned off.' };
  } else {
    securityQuestion = true;
    return { msg: 'Security mode has been turned on.' };
  }
}

export function getLastKnownStatus() {
  return lastKnownSecurityStatus;
}

export function toggleLastKnownStatus() {
  if (!lastKnownSecurityStatus || lastKnownSecurityStatus === '') {
    lastKnownSecurityStatus = true;
    return 'Last Known Status: Enabled.';
  } else {
    lastKnownSecurityStatus = false;
    return 'Last Known Status: Disabled.';
  }
}

// reusable function for changing users role and nickname
// once they have been verified
async function nameAndRoleChanger() {
  let userRole = messageArray[4];
  let userLevel = messageArray[3];

  // grab all members from server to find match
  const members = await client.guilds.cache.get(guildID).members.fetch();

  members.forEach((member) => {
    try {
      if (member.user.id === messageAuthor) {
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
        member.roles.add(roles[usersRole]);
      }
    } catch (e) {
      console.log(e);
    }
  });
}

function helperRoleUpdate(memberToEdit, roleRemoveId, roleAddId) {
  memberToEdit.roles.remove(roleRemoveId);
  memberToEdit.roles.add(roleAddId);
}

export async function botCSVUpdater(path) {
  let results = [];

  // load in updated CSV file
  fs.createReadStream(`${path}`)
    .pipe(csv(['StudentNumber', 'ProgressDecision']))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('Successfully loaded in Progress Decision CSV file.'.green);
    });

  // grab all members from server to find match
  const members = await client.guilds.cache.get(guildID).members.fetch();

  members.forEach((member) => {
    try {
      for (let i = 0; i < results.length; i++) {
        const nickName = `${member.nickname.toUpperCase()}`;

        if (
          nickName.includes(Object.values(results[i])[0]) &&
          Object.values(results[i])[1] === 'PROGRESS'
        ) {
          member.roles.cache.map((role) => {
            switch (role.id) {
              case roles['L4COMPUTERSCIENCE']:
                helperRoleUpdate(
                  member,
                  roles['L4COMPUTERSCIENCE'],
                  roles['L5COMPUTERSCIENCE']
                );
                break;
              case roles['L4CYBERSECURITY']:
                helperRoleUpdate(
                  member,
                  roles['L4CYBERSECURITY'],
                  roles['L5CYBERSECURITY']
                );
                break;
              case roles['L4SOFTWAREENGINEERING']:
                helperRoleUpdate(
                  member,
                  roles['L4SOFTWAREENGINEERING'],
                  roles['L5SOFTWAREENGINEERING']
                );
                break;
              case roles['L5COMPUTERSCIENCE']:
                helperRoleUpdate(
                  member,
                  roles['L5COMPUTERSCIENCE'],
                  roles['L6COMPUTERSCIENCE']
                );
                break;
              case roles['L5CYBERSECURITY']:
                helperRoleUpdate(
                  member,
                  roles['L5CYBERSECURITY'],
                  roles['L6CYBERSECURITY']
                );
                break;
              case roles['L5SOFTWAREENGINEERING']:
                helperRoleUpdate(
                  member,
                  roles['L5SOFTWAREENGINEERING'],
                  roles['L6SOFTWAREENGINEERING']
                );
                break;
              case roles['L6COMPUTERSCIENCE']:
              case roles['L6CYBERSECURITY']:
              case roles['L6SOFTWAREENGINEERING']:
                member.roles.remove(roles['L6COMPUTERSCIENCE']);
                member.roles.remove(roles['L6CYBERSECURITY']);
                member.roles.remove(roles['L6SOFTWAREENGINEERING']);
                member.roles.add(roles['ALUMNI']);
                break;
              default:
                break;
            }
          });
        }
      }
    } catch (e) {
      console.log(`Error! ${member.user.username} does not have a nickname.`);
    }
  });
}

client.login(process.env.TOKEN);
