# Discord-Management-Bot

- This is a Discord bot created to help manage the University of Portsmouth official Discord server. The bot has many functionalities built in to help manage a large Discord server like the University Discord server with the two main functionalities being:

  - Verifying new students who join the Discord server by reading a CSV file containing UoP students information which will be input by the client.
  - Updating students roles based on progress decisions at the end of the academic year by reading a CSV file containing the progress decisions of each student which will be input by the client.

# Usage

- See the [documentation](https://github.com/ak292/discord-management-bot/blob/main/DOCUMENTATION.md) for a full breakdown of the Express server file containing the API endpoints & the Discord server file containing all the main logic/functionality of the bot.

# How to Test/Run the Bot (READ BEFORE INSTALLING)

- Before following the installation instructions below, a few changes are required before the bot can successfully run in the Discord server you want it to run in. However, if you would like to skip all the steps below and jump right into testing the bot, you can simply join this [Discord server](https://discord.gg/kGdW5vbgWy) I have created for your convenience and you may ignore all the steps below. This Discord server already has the bot as a member inside it along with a few random Discord users that are in the Discord server for testing purposes (these users can be used to test the bots verification/progress decisions functionality). **However, if you would like to run the Discord bot in your own server, please continue reading the steps below.**

1. Add the Discord bot to your server by clicking this [link](https://discord.com/api/oauth2/authorize?client_id=1034879663111147570&permissions=8&scope=bot%20applications.commands). This link will redirect you to the official Discord website and will ask you to authorize the Discord bot and allow it to join your server. It should be noted that you must have "Manager Server" privileges in the Discord server you would like to add the bot in or else this will not work.

2. Grab the UID of the Discord server you would like to add the bot in. It is important to note that you must have developer mode activated to be able to grab Discord UIDs. This mode can easily be turned on in your user settings on Discord. Afterwards, on line 10 of the [Discord server file](https://github.com/ak292/discord-management-bot/blob/main/discordServer.js), you must change the value of the "guildID" variable to the UID of the Discord server you would like to add the bot in.

3. Since this bot was created specifically for the official UoP Discord server, it is assumed that the server will have L4/L5/L6 SE roles, L4/L5/L6 NON-SE roles, an L7MENG role, and an ALUMNI role. You need to grab the UID of each one of these roles in your Discord server and replace them accordingly in the "roles" object that can be found at line 116 of the [Discord server file](https://github.com/ak292/discord-management-bot/blob/main/discordServer.js). To grab the UID of a role in your Discord server, simply go to "Server Settings", then click "Roles", then right click on the role you want to copy and click "Copy ID".

# Requirements

- Must have NodeJS installed.

# Install

1. Run npm install
2. Run npm start
3. Navigate to localhost:3000 in your browser
