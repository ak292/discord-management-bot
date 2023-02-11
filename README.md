# Discord-Management-Bot

- This is an engineering project that I will submit as part of my final year graduation project as a Computer Science student at the University of Portsmouth.
- README to be updated.

# To-Do-List

- Make code more reusable
- Add (potentially) abbreviations feature, CS: Computer Science etc. (with MEng as well), but keep in mind MEng wont count for progress roles updating
- Add display none style to security message paragraph to fix spacing
- Additional functionality yet to be added (need more data to do it). For example:
  - If student withdraws, or changes course, etc.
  - Students optional Modules

# Completed tasks

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
