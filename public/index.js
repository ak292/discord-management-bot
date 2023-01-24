// client side code for the security mode feature
const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
const uploadMessage = document.querySelector('.upload-message');
const uploadMessageTwo = document.querySelector('.upload-message-two');

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
