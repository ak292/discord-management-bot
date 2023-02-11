// client side code for the security mode feature
const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
const uploadMessage = document.querySelector('.upload-message');
const uploadMessageTwo = document.querySelector('.upload-message-two');

let lastKnownStatus = '';
let message = '';

// keep track of these values because user is not allowed to
// turn security mode on unless both values are true
// user must have submit a column # for security column
// and user must have submit their custom security question
let submitSecurityColumn = false;
let submitSecurityQuestion = false;

// when DOMContentLoaded, fetch from server last known status of security mode
// to properly display on client even when page refeshes
// this makes sure client and server side code is always in sync
async function initializeStatus() {
  lastKnownStatus = await fetch('/lastStatus');
  lastKnownStatus = await lastKnownStatus.text();

  if (lastKnownStatus.length === 0 || lastKnownStatus === 'false') {
    helperFunctionColor('green', 'red', 'Enable');
    securityParagraph.textContent = 'Security mode has been turned off.';
  } else {
    helperFunctionColor('red', 'green', 'Disable');
    securityParagraph.textContent = 'Security mode has been turned on.';
  }
}

// run function everytime page loads (so if user refreshes page)
document.addEventListener('DOMContentLoaded', initializeStatus);

// helper function for setting text content/styling
function textContentAndStyling(
  elementToModify,
  displayStyle,
  fontWeight,
  color,
  textContent
) {
  elementToModify.style.display = displayStyle;
  elementToModify.style.fontWeight = fontWeight;
  elementToModify.style.color = color;
  elementToModify.textContent = textContent;
  setTimeout(() => {
    elementToModify.style.display = 'none';
    elementToModify.textContent = '';
    elementToModify.style.color = '';
    elementToModify.style.fontWeight = '';
    elementToModify.style.display = 'none';
  }, 5000);
}

const securityParaMessage = document.querySelector(
  '.security-paragraph-message'
);

securityButton.addEventListener('click', async () => {
  if (!submitSecurityColumn || !submitSecurityQuestion) {
    const message =
      'Error! You must submit both a column # for the Security Question column & your custom security question to turn security mode on.';
    textContentAndStyling(
      securityParaMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
    return;
  }

  message = await fetch('/security');
  message = await message.json();

  if (message.msg === 'Security mode has been turned off.') {
    helperFunctionColor('green', 'red', 'Enable');
  } else {
    helperFunctionColor('red', 'green', 'Disable');
  }

  securityParagraph.textContent = message.msg;

  const options = {
    method: 'PATCH',
  };

  // update last known status
  await fetch('/lastStatus', options);
});

function helperFunctionColor(colorToRemove, colorToAdd, toggle) {
  securityParagraph.classList.remove(`security-message-${colorToRemove}`);
  securityParagraph.classList.add(`security-message-${colorToAdd}`);
  securityButton.textContent = `${toggle}`;
}

// timeout & color setter function
function timeoutAndColor(colorToAdd, colorToRemove, message, element) {
  element.classList.remove(`${colorToRemove}-message`);
  element.classList.add(`${colorToAdd}-message`);
  element.textContent = message;
  setTimeout(() => {
    element.textContent = '';
  }, 5000);
}

// client side code for the CSV drag and drops
const progressDropArea = document.getElementById('drop-area-one');
const initialFileDropArea = document.getElementById('drop-area-two');

const dragActive = () => {
  progressDropArea.classList.add('green-border');
};

const dragActiveTwo = () => {
  initialFileDropArea.classList.add('green-border');
};

const dragInactive = () => {
  progressDropArea.classList.remove('green-border');
};

const dragInactiveTwo = () => {
  initialFileDropArea.classList.remove('green-border');
};

const preventDefault = (e) => e.preventDefault();

const allEvents = ['drop', 'dragleave', 'dragover', 'dragcenter'];
allEvents.forEach((eventName) => {
  progressDropArea.addEventListener(eventName, preventDefault);
  initialFileDropArea.addEventListener(eventName, preventDefault);
});

const dragOverEnter = ['dragenter', 'dragover'];
dragOverEnter.forEach((eventName) => {
  progressDropArea.addEventListener(eventName, dragActive);
  initialFileDropArea.addEventListener(eventName, dragActiveTwo);
});

const dragLeaveDrop = ['dragleave', 'drop'];
dragLeaveDrop.forEach((eventName) => {
  progressDropArea.addEventListener(eventName, dragInactive);
  initialFileDropArea.addEventListener(eventName, dragInactiveTwo);
});

// send dropped csv file from client to server
// using the FileReader() and reader.onload functions
progressDropArea.addEventListener('drop', async (e) => {
  const dataTransfer = e.dataTransfer;
  let files = dataTransfer.files;
  if (files.length > 1) {
    const message =
      'Error with your upload! Please upload no more than one CSV file at a time.';
    timeoutAndColor('red', 'green', message, uploadMessage);
    return;
  }

  files = files[0];

  if (files.type !== 'text/csv') {
    const message =
      'Error with your upload! Please make sure it is a valid CSV file.';
    timeoutAndColor('red', 'green', message, uploadMessage);
    return;
  }

  let result = '';

  reader = new FileReader();
  reader.onload = async function (event) {
    result = await event.target.result;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: result,
    };

    let response = await fetch('/csvFile', options);
    let responseStatus = response.status;
    response = await response.text();

    if (responseStatus === 200) {
      timeoutAndColor('green', 'red', response, uploadMessage);
    } else {
      timeoutAndColor('red', 'green', response, uploadMessage);
    }
  };

  reader.readAsText(files);
});

// send dropped csv file from client to server
// using the FileReader() and reader.onload functions
initialFileDropArea.addEventListener('drop', async (e) => {
  const dataTransfer = e.dataTransfer;
  let files = dataTransfer.files;
  if (files.length > 1) {
    const message =
      'Error with your upload! Please upload no more than one CSV file at a time.';
    timeoutAndColor('red', 'green', message, uploadMessageTwo);
    return;
  }

  files = files[0];

  if (files.type !== 'text/csv') {
    const message =
      'Error with your upload! Please make sure it is a valid CSV file.';
    timeoutAndColor('red', 'green', message, uploadMessageTwo);
    return;
  }

  let result = '';

  reader = new FileReader();
  reader.onload = async function (event) {
    result = await event.target.result;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: result,
    };

    let response = await fetch('/initialCSV', options);
    let responseStatus = response.status;
    response = await response.text();

    if (responseStatus === 200) {
      timeoutAndColor('green', 'red', response, uploadMessageTwo);
    } else {
      timeoutAndColor('red', 'green', response, uploadMessageTwo);
    }
  };

  reader.readAsText(files);
});

// ALL CODE BELOW IS RELATED TO THE CSV CUSTOMIZATION (USER INPUTS THE NUMBERING OF CSV COLUMNS ETC.)
const submitCSV = document.querySelector('.submit-csv');
const csvInputs = document.querySelectorAll('.input-csv');
const securityInput = document.querySelector('.security-input');
const submitCSVMessage = document.querySelector('.submit-csv-message');
let filledInputs = 0;
let inputValues = [];

submitCSV.addEventListener('click', async function () {
  csvInputs.forEach((input) => {
    if (input.value < 0) input.value = 0;

    if (input.value.length !== 0) {
      inputValues.push(input.value);
      filledInputs++;
    } else {
      console.log('N/A');
    }
  });

  // if security mode already turned on, filledInputs must be 6
  // ie. user must supply column # for security question column
  if (
    (lastKnownStatus === 'true' ||
      message.msg === 'Security mode has been turned on.') &&
    filledInputs !== 6
  ) {
    filledInputs = 0;
    csvInputs.forEach((input) => (input.value = ''));

    const message =
      'If you have security mode enabled, you must fill out all 6 columns (including the security question one).';
    textContentAndStyling(
      submitCSVMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
    return;
  }

  if (filledInputs === 6) {
    submitSecurityColumn = true;
  }

  // Either all 6 values are filled, or 5 values are filled and the missing one
  // is the security question one (which is optional)
  if (
    filledInputs === 6 ||
    (filledInputs === 5 && securityInput.value.length === 0)
  ) {
    const body = { inputValues };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    };

    let response = await fetch('/csvCustomizer', options);
    response = await response.text();
    console.log(response);

    if (response === 'Success!') {
      const message = 'Success! Your CSV configuration has been saved.';
      textContentAndStyling(
        submitCSVMessage,
        'inline-block',
        'bold',
        'green',
        message
      );
    } else {
      const message =
        'There was an error saving your configuration, please try again later.';
      textContentAndStyling(
        submitCSVMessage,
        'inline-block',
        'bold',
        'red',
        message
      );
    }

    filledInputs = 0;
    inputValues = [];
    csvInputs.forEach((input) => (input.value = ''));
  } else {
    const message =
      'Error! Please make sure you fill out all the values (aside from the Security Question one, which is optional)';
    textContentAndStyling(
      submitCSVMessage,
      'inline-block',
      'bold',
      'red',
      message
    );

    filledInputs = 0;
    inputValues = [];
  }
});

// ALL CODE BELOW IS FOR THE SECURITY QUESTION INPUT
const securityInputButton = document.querySelector('.security-input-button');
const securityInputValue = document.querySelector('#security-input');
const securityInputMessage = document.querySelector('.security-input-message');
securityInputButton.addEventListener('click', async function () {
  if (securityInputValue.value.length === 0) return;
  submitSecurityQuestion = true;

  const options = {
    method: 'POST',
    body: securityInputValue.value,
  };

  securityInputValue.value = '';

  let response = await fetch('/securityQuestion', options);
  response = await response.text();
  console.log(response);

  if (response === 'Success!') {
    const message = 'Success! Your security question has been saved.';
    textContentAndStyling(
      securityInputMessage,
      'inline-block',
      'bold',
      'green',
      message
    );
  } else {
    const message =
      'Error! There was a problem saving your security question. Please try again later.';
    textContentAndStyling(
      securityInputMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
  }
});
