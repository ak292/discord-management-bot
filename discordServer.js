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
let results = [];

// results array from progress decision csv file
let progressResults = [];

// global variables required so I can make
// use of them in mutliple functions below
let securityQuestionAnswer = '';
let securityQuestion = false;
let studentNumber = '';
let securityMatchFound = false;
let matchFound = 0;
let messageArray = '';
let messageAuthor = '';
let sortedMessageArray = [];

// object will be used if user decides to set their own
// values for their csv file column numbers, otherwise
// default values will be used. a 0 indicates value not given.
export const csvValues = {
  FirstName: 0,
  LastName: 0,
  StudentNumber: 0,
  Level: 0,
  CourseName: 0,
  SecurityQuestionAnswer: 0,
};

// function to change csvValues object to be used in
// expressServer.js file
export function changeCSVValues(arrInputValues) {
  csvValues.FirstName = arrInputValues[0] - 1;
  csvValues.LastName = arrInputValues[1] - 1;
  csvValues.StudentNumber = arrInputValues[2] - 1;
  csvValues.Level = arrInputValues[3] - 1;
  csvValues.CourseName = arrInputValues[4] - 1;
  csvValues.SecurityQuestionAnswer = arrInputValues[5] - 1;
}

// used in expressServer.js to check if a CSV file
// has been uploaded or not. if not, dont run bot function yet
export let initialCSV = false;

// function change exported initialCSV variable, which is to be used
// in expressServer.js file when user uploads a CSV file
export function changeInitialCSV() {
  initialCSV = true;
}

let lastKnownSecurityStatus = '';

let roles = {
  L4NONSE: '1036313827983249468',
  L4SOFTWAREENGINEERING: '1036289578648215654',
  L5NONSE: '1036313889010352170',
  L5SOFTWAREENGINEERING: '1036289626446516274',
  L6NONSE: '1036313942005399553',
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

export function clearOutResults() {
  results = [];
}

export function clearOutProgressResults() {
  progressResults = [];
}

export function initialCSVLoader(csvPath) {
  // load in CSV file
  fs.createReadStream(`${csvPath}`)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      console.log('Successfully loaded in CSV file.'.green);
    });
}

export function botListeningEvents() {
  client.on('ready', () => {
    console.log(`Bot successfully connected at ${client.user.tag}`.green);
  });

  client.on('guildMemberAdd', (member) => {
    if (!initialCSV) return;
    member.send(
      `Welcome to the server ${member.user.username}. If you wish to gain full access to the server, please type your first name, surname, student number, level (L4/L5/L6), and course title in one message seperated by spaces.
      \nBelow is a proper example of how to verify yourself, and all the course options are also below for your convenience.`
    );
    member.send(
      `Example: Josh Smith UP12345 L5 Computer Science. \nCourse options: Computer Networks, Computer Science, Information Systems, Computing, Creative Computing, Cyber Security, Data Science, Software Engineering`
    );
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

    if (!initialCSV)
      return message.reply(
        'No CSV file has been uploaded yet, so the bot cannot verify you. Please try again later.'
      );

    // seperate event listener for the security question mode
    if (message.content.startsWith('!')) {
      securityQuestionAnswer = message.content
        .split('')
        .slice(1)
        .join('')
        .toUpperCase();

      for (let i = 0; i < results.length; i++) {
        if (
          Object.values(results[i])[csvValues.StudentNumber] ===
            studentNumber &&
          Object.values(results[i])[csvValues.SecurityQuestionAnswer] ===
            securityQuestionAnswer
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

    // sortedMessageArray.splice(
    //   csvValues.SecurityQuestionAnswer,
    //   0,
    //   messageArray[5]
    // );

    // if user message is longer than 5 or 6 length, they have
    // incorrectly formatted their message (eg. extra spaces)
    if (messageArray.length !== 5 && messageArray.length !== 6) {
      return message.reply(
        'Incorrect information provided. Please make sure you have spelled everything correctly and followed the proper format. Example: Josh Smith UP12345 L5 Computer Science'
      );
    }

    if (messageArray.length === 5) {
      // sorting message array based on the csv column number values that the user input
      // this allows for the csv to be customized by the user and the code still works
      sortedMessageArray.splice(csvValues.FirstName, 0, messageArray[0]);
      sortedMessageArray.splice(csvValues.LastName, 0, messageArray[1]);
      sortedMessageArray.splice(csvValues.StudentNumber, 0, messageArray[2]);
      sortedMessageArray.splice(csvValues.Level, 0, messageArray[3]);
      sortedMessageArray.splice(csvValues.CourseName, 0, messageArray[4]);
      // outer for loop is for results object
      // inner for loop is for users message content
      outerloop: for (let i = 0; i < results.length; i++) {
        // reset matchFound for every row
        matchFound = 0;
        for (let j = 0; j < messageArray.length; j++) {
          if (
            sortedMessageArray[j].toUpperCase() === Object.values(results[i])[j]
          ) {
            matchFound++;
          }

          if (matchFound === 5) break outerloop;
        }
      }
    } else {
      let courseName = messageArray[4] + messageArray[5];
      messageArray = messageArray.slice(0, 4);
      messageArray = [...messageArray, courseName];

      // sorting message array based on the csv column number values that the user input
      // this allows for the csv to be customized by the user and the code still works
      sortedMessageArray.splice(csvValues.FirstName, 0, messageArray[0]);
      sortedMessageArray.splice(csvValues.LastName, 0, messageArray[1]);
      sortedMessageArray.splice(csvValues.StudentNumber, 0, messageArray[2]);
      sortedMessageArray.splice(csvValues.Level, 0, messageArray[3]);
      sortedMessageArray.splice(csvValues.CourseName, 0, messageArray[4]);

      outerloop: for (let i = 0; i < results.length; i++) {
        // reset matchFound for every row
        matchFound = 0;
        for (let j = 0; j < messageArray.length; j++) {
          if (
            sortedMessageArray[j].toUpperCase() === Object.values(results[i])[j]
          ) {
            matchFound++;
          }
          if (matchFound === 5) {
            break outerloop;
          }
        }
      }
    }

    studentNumber = sortedMessageArray[csvValues.StudentNumber];

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
  let nonEngineeringRoles = [
    'COMPUTERSCIENCE',
    'INFORMATIONSYSTEMS',
    'COMPUTING',
    'CREATIVECOMPUTING',
    'CYBERSECURITY',
    'DATASCIENCE',
  ];
  let userRole = sortedMessageArray[csvValues.CourseName];
  let userLevel = sortedMessageArray[csvValues.Level];
  userRole = userRole.toUpperCase();

  // all options other than Software Eng = NONSE
  if (nonEngineeringRoles.includes(userRole)) userRole = 'NONSE';

  // grab all members from server to find match
  const members = await client.guilds.cache.get(guildID).members.fetch();

  members.forEach((member) => {
    try {
      if (member.user.id === messageAuthor) {
        sortedMessageArray[csvValues.FirstName] =
          sortedMessageArray[csvValues.FirstName].toLowerCase();
        sortedMessageArray[csvValues.StudentNumber] =
          sortedMessageArray[csvValues.StudentNumber].toLowerCase();
        member
          .setNickname(
            `${sortedMessageArray[
              csvValues.FirstName
            ][0].toUpperCase()}${sortedMessageArray[csvValues.FirstName]
              .slice(1)
              .toLowerCase()} ${sortedMessageArray[
              csvValues.LastName
            ][0].toUpperCase()} / ${
              sortedMessageArray[csvValues.StudentNumber]
            }`
          )
          .catch((e) =>
            console.log(
              `Error, bot does not have permission to set ${member.user.username} nickname.`
            )
          );

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
  // load in updated CSV file
  fs.createReadStream(`${path}`)
    .pipe(csv(['StudentNumber', 'ProgressDecision']))
    .on('data', (data) => progressResults.push(data))
    .on('end', () => {
      console.log('Successfully loaded in Progress Decision CSV file.'.green);
    });

  // grab all members from server to find match
  const members = await client.guilds.cache.get(guildID).members.fetch();

  members.forEach((member) => {
    try {
      for (let i = 0; i < progressResults.length; i++) {
        const nickName = `${member.nickname.toUpperCase()}`;

        if (
          nickName.includes(Object.values(progressResults[i])[0]) &&
          Object.values(progressResults[i])[1] === 'PROGRESS'
        ) {
          member.roles.cache.map((role) => {
            switch (role.id) {
              // this case below is just the "EVERYONE" role id assigned to ALL members
              // in the discord server by default, it does not count as a real role and
              // it has nothing to do with any of roles in the discord server
              case '1034878587129569401':
                break;
              case roles['L4NONSE']:
                helperRoleUpdate(member, roles['L4NONSE'], roles['L5NONSE']);
                break;
              case roles['L4SOFTWAREENGINEERING']:
                helperRoleUpdate(
                  member,
                  roles['L4SOFTWAREENGINEERING'],
                  roles['L5SOFTWAREENGINEERING']
                );
                break;
              case roles['L5NONSE']:
                helperRoleUpdate(member, roles['L5NONSE'], roles['L6NONSE']);
                break;
              case roles['L5SOFTWAREENGINEERING']:
                helperRoleUpdate(
                  member,
                  roles['L5SOFTWAREENGINEERING'],
                  roles['L6SOFTWAREENGINEERING']
                );
                break;
              case roles['L6NONSE']:
              case roles['L6SOFTWAREENGINEERING']:
                member.roles.remove(roles['L6NONSE']);
                member.roles.remove(roles['L6SOFTWAREENGINEERING']);
                member.roles.add(roles['ALUMNI']);
                break;
              default:
                console.log(
                  `Error! ${member.user.username} is either unverified or is already an alumni.`
                );
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
