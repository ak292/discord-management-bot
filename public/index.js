// client side code for the security mode feature
const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
const uploadMessage = document.querySelector('.upload-message');
const uploadMessageTwo = document.querySelector('.upload-message-two');
// const hiddenSecurityDiv = document.querySelector('.hidden-security-div');
let lastKnownStatus = '';
let message = '';

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
    // hiddenSecurityDiv.style.display = 'block';
    helperFunctionColor('red', 'green', 'Disable');

    securityParagraph.textContent = 'Security mode has been turned on.';
  }
}

// run function everytime page loads (so if user refreshes page)
document.addEventListener('DOMContentLoaded', initializeStatus);

securityButton.addEventListener('click', async () => {
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
// const progressDropArea = document.getElementById('drop-area-one');
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
  // progressDropArea.addEventListener(eventName, preventDefault);
  initialFileDropArea.addEventListener(eventName, preventDefault);
});

const dragOverEnter = ['dragenter', 'dragover'];
dragOverEnter.forEach((eventName) => {
  // progressDropArea.addEventListener(eventName, dragActive);
  initialFileDropArea.addEventListener(eventName, dragActiveTwo);
});

const dragLeaveDrop = ['dragleave', 'drop'];
dragLeaveDrop.forEach((eventName) => {
  // progressDropArea.addEventListener(eventName, dragInactive);
  initialFileDropArea.addEventListener(eventName, dragInactiveTwo);
});

// send dropped csv file from client to server
// using the FileReader() and reader.onload functions
// progressDropArea.addEventListener('drop', async (e) => {
//   const dataTransfer = e.dataTransfer;
//   let files = dataTransfer.files;
//   if (files.length > 1) {
//     const message =
//       'Error with your upload! Please upload no more than one CSV file at a time.';
//     timeoutAndColor('red', 'green', message, uploadMessage);
//     return;
//   }

//   files = files[0];

//   if (files.type !== 'text/csv') {
//     const message =
//       'Error with your upload! Please make sure it is a valid CSV file.';
//     timeoutAndColor('red', 'green', message, uploadMessage);
//     return;
//   }

//   let result = '';

//   reader = new FileReader();
//   reader.onload = async function (event) {
//     result = await event.target.result;

//     const options = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'text/plain',
//       },
//       body: result,
//     };

//     let response = await fetch('/csvFile', options);
//     let responseStatus = response.status;
//     response = await response.text();

//     if (responseStatus === 200) {
//       timeoutAndColor('green', 'red', response, uploadMessage);
//     } else {
//       timeoutAndColor('red', 'green', response, uploadMessage);
//     }
//   };

//   reader.readAsText(files);
// });

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
    if (input.value.length !== 0) {
      inputValues.push(input.value);
      filledInputs++;
    } else {
      console.log('N/A');
    }
  });

  if (
    (lastKnownStatus === 'true' ||
      message.msg === 'Security mode has been turned on.') &&
    filledInputs !== 6
  ) {
    filledInputs = 0;
    csvInputs.forEach((input) => (input.value = ''));
    submitCSVMessage.style.display = 'inline-block';
    submitCSVMessage.style.fontWeight = 'bold';
    submitCSVMessage.style.color = 'red';
    submitCSVMessage.textContent =
      'If you have security mode enabled, you must fill out all 6 columns (including the security question one).';
    setTimeout(() => {
      submitCSVMessage.textContent = '';
      submitCSVMessage.style.color = '';
      submitCSVMessage.style.fontWeight = '';
      submitCSVMessage.style.display = 'none';
    }, 5000);
    return;
  }

  // Either all 6 values are filled, or 5 values are filled and the missing one
  // is the security question one (which is optional)
  if (
    filledInputs === 6 ||
    (filledInputs === 5 && securityInput.value.length === 0)
  ) {
    const options = {
      method: 'POST',
      body: inputValues,
    };

    let response = await fetch('/csvCustomizer', options);
    response = await response.text();
    console.log(response);

    if (response === 'Success!') {
      submitCSVMessage.style.display = 'inline-block';
      submitCSVMessage.style.fontWeight = 'bold';
      submitCSVMessage.style.color = 'green';
      submitCSVMessage.textContent =
        'Success! Your CSV configuration has been saved.';
      setTimeout(() => {
        submitCSVMessage.textContent = '';
        submitCSVMessage.style.color = '';
        submitCSVMessage.style.fontWeight = 'bold';
        submitCSVMessage.style.display = 'none';
      }, 5000);
    } else {
      submitCSVMessage.style.display = 'inline-block';
      submitCSVMessage.style.fontWeight = 'bold';
      submitCSVMessage.style.color = 'red';
      submitCSVMessage.textContent =
        'There was an error saving your configuration, please try again later.';
      setTimeout(() => {
        submitCSVMessage.textContent = '';
        submitCSVMessage.style.color = '';
        submitCSVMessage.style.fontWeight = '';
        submitCSVMessage.style.display = 'none';
      }, 5000);
    }

    filledInputs = 0;
    inputValues = [];
    csvInputs.forEach((input) => (input.value = ''));
  } else {
    submitCSVMessage.style.display = 'inline-block';
    submitCSVMessage.style.fontWeight = 'bold';
    submitCSVMessage.style.color = 'red';
    submitCSVMessage.textContent =
      'Error! Please make sure you fill out all the values (aside from the Security Question one, which is optional)';
    setTimeout(() => {
      submitCSVMessage.textContent = '';
      submitCSVMessage.style.color = '';
      submitCSVMessage.style.fontWeight = '';
      submitCSVMessage.style.display = 'none';
    }, 5000);
    filledInputs = 0;
    inputValues = [];
  }
});

// ALL CODE BELOW IS FOR THE SECURITY QUESTION INPUT
const securityInputButton = document.querySelector('.security-input-button');
const securityInputValue = document.querySelector('#security-input');
securityInputButton.addEventListener('click', function () {
  console.log(securityInputValue);
  if (securityInputValue.length === 0) console.log('0');
});
