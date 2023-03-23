## Documentation

NOTE: The word "client" in this file refers to the person who will be making use of this bot, which will most likely be a University of Portsmouth staff member. The word "user" or "users" refers to the users or students in a Discord server. The word "client-side" will be used to refer to the actual client-side in a software context.

### This documentation will break down all the main files and folders that can be found in this repository.

### discordServer.js (Discord server file)

| Function    | Arguments   | Description   |
| :---        |    :----:   |          :--- |
| changeCSVValues      | An array of 5 OR 6 values       | This function receives an array of 5 or 6 values which will be received from the client-side. When the client submits their values, a POST request is made to a specific endpoint called "csvCustomizer" setup in the server, which will then invoke this function. This function takes the array of values and uses it to change the values of an object called "csvValues". The purpose of this function is to allow the client to customize their CSV file column numbers any way they want. If the client has the first name of students as the 1st column in their CSV file, they would input 1 for that value, and so on, and these values will be taken as an argument by this function and the "csvValues" object will be changed accordingly. |
| Paragraph   | Text        | And more      |

### expressServer.js (Express server file)

### expressHelpers.js (Express file with helper functions)

### public, csvTestFiles, initialCSV, progressCSV (Folders)
