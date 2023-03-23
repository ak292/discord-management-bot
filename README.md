# Discord-Management-Bot

- This is a Discord bot created to help manage the University of Portsmouth official Discord server. The bot has many functionalities built in to help manage a large Discord server with the two main functionalities being:
- Verifying new students who join the Discord server by reading a CSV file containing UoP students information which will be input by the client.
- Updating students roles based on progress decisions at the end of the academic year by reading a CSV file containing the progress decisions of each student which will be input by the client.

# Usage

- See the [documentation](https://github.com/ak292/discord-management-bot/blob/main/DOCUMENTATION.md) for a full breakdown of the Express server file containing the API endpoints & the Discord server file containing all the main logic/functionality of the bot.

# Completed tasks

- Make code more reusable/cleaner/add comments where neccessary (DONE)
- Add (potentially) abbreviations feature, CS: Computer Science etc. (with MEng as well), but keep in mind MEng wont count for progress roles updating (DONE)
- Add display none style to security message paragraph to fix spacing (DONE)
- Make sure code works when security option enabled and is included in CSV file (DONE)
- Add client side validations for things like turning security mode on requiring you to have a question etc. (DONE)
- Add custom security question functionality (DONE)
- When comparing message array to the object results, make it continue as soon as one option does not match, instead of having it loop through every single object waiting for it to reach 5 match count.
- Fix issue with duplicate first/last names (DONE)
- Change the client side from input into drag and drop file for CSV (DONE)
- Finish working on the botCSVUpdate discord.js function to update roles (DONE)
  - Make sure to remove a users old rank when giving them new one (DONE)
- Delete old CSV files when new one is uploaded (DONE)
- Test requirements (DONE)

# Install

1. Run npm install
2. Run npm start
3. Navigate to localhost:3000 in your browser
