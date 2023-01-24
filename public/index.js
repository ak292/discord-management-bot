// client side code for the security mode feature
const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
const uploadMessage = document.querySelector('.upload-message');

// when DOMContentLoaded, fetch from server last known status of security mode
// to properly display on client even when page refeshes
// this makes sure client and server side code is always in sync
async function initializeStatus() {
  let lastKnownStatus = await fetch('/lastStatus');
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

securityButton.addEventListener('click', async () => {
  let message = await fetch('/security');
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
function timeoutAndColor(colorToAdd, colorToRemove, message) {
  uploadMessage.classList.remove(`${colorToRemove}-message`);
  uploadMessage.classList.add(`${colorToAdd}-message`);
  uploadMessage.textContent = message;
  setTimeout(() => {
    uploadMessage.textContent = '';
  }, 5000);
}

// client side code for the CSV drag and drop
const dropArea = document.querySelector('.drop-area');

const dragActive = () => dropArea.classList.add('green-border');
const dragInactive = () => dropArea.classList.remove('green-border');
const preventDefault = (e) => e.preventDefault();

const allEvents = ['drop', 'dragleave', 'dragover', 'dragcenter'];
allEvents.forEach((eventName) => {
  dropArea.addEventListener(eventName, preventDefault);
});

const dragOverEnter = ['dragenter', 'dragover'];
dragOverEnter.forEach((eventName) => {
  dropArea.addEventListener(eventName, dragActive);
});

const dragLeaveDrop = ['dragleave', 'drop'];
dragLeaveDrop.forEach((eventName) => {
  dropArea.addEventListener(eventName, dragInactive);
});

// send dropped csv file from client to server
// using the FileReader() and reader.onload functions
dropArea.addEventListener('drop', async (e) => {
  const dataTransfer = e.dataTransfer;
  let files = dataTransfer.files;
  if (files.length > 1) {
    const message =
      'Error with your upload! Please upload no more than one CSV file at a time.';
    timeoutAndColor('red', 'green', message);
    return;
  }

  files = files[0];

  if (files.type !== 'text/csv') {
    const message =
      'Error with your upload! Please make sure it is a valid CSV file.';
    timeoutAndColor('red', 'green', message);
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
      timeoutAndColor('green', 'red', response);
    } else {
      timeoutAndColor('red', 'green', response);
    }
  };

  reader.readAsText(files);
});
