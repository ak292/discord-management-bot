// client side code for the security mode feature
const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
const uploadMessage = document.querySelector('.upload-message');
securityParagraph.textContent = 'Security Question Mode: Disabled';
let enabled = false;

securityButton.addEventListener('click', async () => {
  let message = await fetch('/security');
  message = await message.json();

  if (enabled) {
    enabled = false;
    securityParagraph.classList.remove('security-message-green');
    securityParagraph.classList.add('security-message-red');
    securityButton.textContent = 'Enable';
  } else {
    enabled = true;
    securityParagraph.classList.remove('security-message-red');
    securityParagraph.classList.add('security-message-green');
    securityButton.textContent = 'Disable';
  }

  securityParagraph.textContent = message.msg;
});

// timeout & color setter function
function timeoutAndColor(colorToAdd, colorToRemove, message) {
  uploadMessage.classList.remove(`${colorToRemove}-message`);
  uploadMessage.classList.add(`${colorToAdd}-message`);
  uploadMessage.textContent = message;
  setTimeout(() => {
    uploadMessage.textContent = '';
  }, 5000);
}

// client side code for the CSV drag and drop *COPY PASTED CODE, REWORD*
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

dropArea.addEventListener('drop', async (e) => {
  const dataTransfer = e.dataTransfer;
  let files = dataTransfer.files;
  if (files.length > 1) {
    const message =
      'Error with your upload! Please only upload one CSV file at a time.';
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
