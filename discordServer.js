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
let securityMatchFound = false;
let matchFound = 0;
let messageArray = '';
let messageAuthor = '';
let userFirstName = '';
let userLastName = '';
let userStudentNumber = '';
let userLevel = '';
let userCourseName = '';

// this array keeps track of users who are currently in the
// proccess of verifying themselves with the bot
// this is to avoid any collisions when two users are using the bot
// at the same time. This is used in the Security feature
let activeUsers = [];

let foundUser = false;

let abbreviationsMode = false;

// object will be used if user decides to set their own
// values for their csv file column numbers, otherwise
// default values will be used. a -1 indicates value not given.
const csvValues = {
  FirstName: -1,
  LastName: -1,
  StudentNumber: -1,
  Level: -1,
  CourseName: -1,
  SecurityQuestionAnswer: -1,
};

// function to change csvValues object to be used in
// expressServer.js file
export function changeCSVValues(arrInputValues) {
  // if the array is of length 6, that means user must have submit
  // a column number for the security question answer column
  if (arrInputValues.length === 6) {
    csvValues.SecurityQuestionAnswer = arrInputValues[5] - 1;
  }
  csvValues.FirstName = arrInputValues[0] - 1;
  csvValues.LastName = arrInputValues[1] - 1;
  csvValues.StudentNumber = arrInputValues[2] - 1;
  csvValues.Level = arrInputValues[3] - 1;
  csvValues.CourseName = arrInputValues[4] - 1;
}

const abbreviations = {
  COMPUTERSCIENCE: '',
  CYBERSECURITY: '',
  COMPUTING: '',
  NETWORKS: '',
  SOFTWAREENGINEERING: '',
  INFORMATIONSYSTEMS: '',
  MENG: '',
  DATASCIENCE: '',
  CREATIVECOMPUTING: '',
};

export function changeAbbreviations(abbreviationValues) {
  abbreviationsMode = true;
  abbreviations.COMPUTERSCIENCE = abbreviationValues[0];
  abbreviations.COMPUTING = abbreviationValues[1];
  abbreviations.CYBERSECURITY = abbreviationValues[2];
  abbreviations.INFORMATIONSYSTEMS = abbreviationValues[3];
  abbreviations.COMPUTERNETWORKS = abbreviationValues[4];
  abbreviations.SOFTWAREENGINEERING = abbreviationValues[5];
  abbreviations.DATASCIENCE = abbreviationValues[6];
  abbreviations.CREATIVECOMPUTING = abbreviationValues[7];
  abbreviations.MENG = abbreviationValues[8];
}

// security question submit by user to be used in expressServer.js
let customSecurityQuestion = '';

// function to allow user to change the security question to whatever they want
// to be used in expressServer.js
export function changeCustomSecurityQuestion(inputQuestion) {
  customSecurityQuestion = inputQuestion;
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
let lastKnownAbbreviationStatus = '';

let userRoleInput = '';
let roles = {
  L4NONSE: '1036313827983249468',
  L4SOFTWAREENGINEERING: '1036289578648215654',
  L5NONSE: '1036313889010352170',
  L5SOFTWAREENGINEERING: '1036289626446516274',
  L6NONSE: '1036313942005399553',
  L6SOFTWAREENGINEERING: '1036289659501805648',
  L7MENG: '1073880628866592848',
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
    .on('data', (data) => {
      results.push(data);
    })
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
      `Example: Josh Smith UP12345 L5 Computer Science. \nCourse options: Computer Networks, Computer Science, Information Systems, Computing, Creative Computing, Cyber Security, Data Science, Software Engineering, and MEng`
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

    // seperate event listener for the security question mode question
    // user answers security question with a !<ANSWER-HERE>
    if (message.content.startsWith('!')) {
      securityMatchFound = false;
      foundUser = false;
      securityQuestionAnswer = message.content
        .split('')
        .slice(1)
        .join('')
        .toUpperCase();

      // check if user is in activeUsers, if not, see below
      for (let i = 0; i < activeUsers.length; i++) {
        if (Object.values(activeUsers[i])[0] === message.author.id) {
          foundUser = true;
        }
      }

      // if user tries to answer a security question BEFORE verifying any of their other original info
      // this is just here as a simple safe guard to provide an appropriate error message to user
      if (!foundUser) {
        return message.reply(
          'Error! You must verify your other information, as previously asked, before attempting to answer a security question.'
        );
      }

      outerloop: for (let i = 0; i < results.length; i++) {
        for (let j = 0; j < activeUsers.length; j++) {
          // find users student number in activeUsers and match it to the results object from CSV
          // make sure users security question answer is correct
          if (
            Object.values(results[i])[csvValues.StudentNumber] ===
              Object.values(activeUsers[j])[1].toUpperCase() &&
            Object.values(results[i])[csvValues.SecurityQuestionAnswer] ===
              securityQuestionAnswer
          ) {
            // only if the user who typed message typed the security value assosciated with their id
            // this makes sure if two people have the same security question answer (for example), no issues will arise, because
            // we check if the ID of the user found in activeUsers matches with the message.author.id
            // this also prevents issues if multiple users are using the bot at the same time (User A's answer cannot work for User B)
            if (Object.values(activeUsers[j])[0] === message.author.id) {
              securityMatchFound = true;
              break outerloop;
            }
          } else {
            securityMatchFound = false;
          }
        }
      }

      if (!securityMatchFound) {
        // find user who didnt get verified and remove from activeusers, they must restart verification
        for (let i = 0; i < activeUsers.length; i++) {
          if (Object.values(activeUsers[i])[0] === message.author.id) {
            activeUsers.splice(i, 1);
          }
        }

        return message.reply(
          'Incorrect answer. Sorry, you must restart the verification proccess. Please type your first name, surname, student number, level (L4/L5/L6), and course title in one message seperated by spaces.'
        );
      } else {
        message.reply('Correct answer! Changing your nickname and role now.');
        // find user who did get verified and remove from activeusers, they are done verification.
        for (let i = 0; i < activeUsers.length; i++) {
          if (Object.values(activeUsers[i])[0] === message.author.id) {
            activeUsers.splice(i, 1);
          }
        }

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

    let foundUserId = false;

    for (let i = 0; i < activeUsers.length; i++) {
      if (Object.values(activeUsers[i])[0].includes(message.author.id)) {
        foundUserId = true;
        break;
      }
    }

    // if user not in activeUsers, push user student id and their discord ID.
    // this will be used later in the security mode event listener (if security mode is enabled) to verify
    // that the user who is answering the security question is the same user who just verified themself.

    if (!foundUserId) {
      activeUsers.push({
        id: message.author.id,
        studentNumber: messageArray[2].toUpperCase(),
      });
    }

    // at this point, messageArray must either be of length 5 or 6 (based on previous checks done before this point)
    // so if messageArray is of length 6, user must have typed Computer Science for example (with a space)
    // instead of ComputerScience (with no space). So just join the two together.
    if (messageArray.length !== 5) {
      let courseName = messageArray[4] + messageArray[5];
      messageArray = messageArray.slice(0, 4);
      messageArray = [...messageArray, courseName];
    }

    // now loop and try to find a match
    // for loop is for results object
    for (let i = 0; i < results.length; i++) {
      // reset matchFound for every row
      matchFound = 0;

      userFirstName = messageArray[0].toUpperCase();
      userLastName = messageArray[1].toUpperCase();
      userStudentNumber = messageArray[2].toUpperCase();
      userLevel = messageArray[3].toUpperCase();
      userCourseName = messageArray[4].toUpperCase();
      userRoleInput = userCourseName;

      if (abbreviationsMode) {
        userCourseName = abbreviations[userCourseName];
      }

      if (
        userFirstName ===
        Object.values(results[i])[csvValues.FirstName].toUpperCase()
      ) {
        matchFound++;
      } else {
        continue;
      }

      if (
        userLastName ===
        Object.values(results[i])[csvValues.LastName].toUpperCase()
      ) {
        matchFound++;
      } else {
        continue;
      }

      if (
        userStudentNumber ===
        Object.values(results[i])[csvValues.StudentNumber].toUpperCase()
      ) {
        matchFound++;
      } else {
        continue;
      }

      if (
        userLevel === Object.values(results[i])[csvValues.Level].toUpperCase()
      ) {
        matchFound++;
      } else {
        continue;
      }

      if (
        userCourseName.toUpperCase() ===
        Object.values(results[i])[csvValues.CourseName].toUpperCase()
      ) {
        matchFound++;
      } else {
        continue;
      }

      if (matchFound === 5) break;
    }

    // total 5 rows should match, so if matchfound = 5
    // all rows matched and student is successfully identified
    if (matchFound === 5) {
      if (securityQuestion) {
        return await message.reply(
          `For security purposes, please answer: ${customSecurityQuestion} Type your answer with an exclamation mark followed by your answer. For example: !Answer`
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

export function getLastKnownAbbreviationStatus() {
  return lastKnownAbbreviationStatus;
}

export function toggleLastKnownAbbreviationStatus() {
  if (!lastKnownAbbreviationStatus || lastKnownAbbreviationStatus === '') {
    lastKnownAbbreviationStatus = true;
    return 'Last Known Abbreviation Status: Enabled.';
  } else {
    lastKnownAbbreviationStatus = false;
    return 'Last Known Abbreviation Status: Disabled.';
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
    'NETWORKS',
    'MENG',
  ];

  let userRole = userRoleInput;
  let usersLevel = userLevel;
  userRole = userRole.toUpperCase();

  // all options other than Software Eng = NONSE, excluding MENG, since that is its own role
  if (userRole !== 'MENG' && nonEngineeringRoles.includes(userRole))
    userRole = 'NONSE';

  // grab all members from server to find match
  const members = await client.guilds.cache.get(guildID).members.fetch();

  members.forEach((member) => {
    try {
      if (member.user.id === messageAuthor) {
        userFirstName = userFirstName.toLowerCase();
        userStudentNumber = userStudentNumber.toLowerCase();
        member
          .setNickname(
            `${userFirstName[0].toUpperCase()}${userFirstName
              .slice(1)
              .toLowerCase()} ${userLastName[0].toUpperCase()} / ${userStudentNumber}`
          )
          .catch((e) =>
            console.log(
              `Error, bot does not have permission to set ${member.user.username} nickname.`
            )
          );

        let usersRole = usersLevel + userRole;
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

// function below is for updating roles based on progress decisions
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
              case roles['L7MENG']:
                member.roles.remove(roles['L6NONSE']);
                member.roles.remove(roles['L6SOFTWAREENGINEERING']);
                member.roles.remove(roles['L7MENG']);
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
