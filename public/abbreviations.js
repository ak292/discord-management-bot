const submitButton = document.querySelector('.submit-abbreviation');
const submitInputs = document.querySelectorAll('.input-abbreviation');
const submitMessage = document.querySelector('.submit-abbreviation-message');
const abbreviationParagraph = document.querySelector('.abbreviation-paragraph');
const abbreviationParagraphMessage = document.querySelector(
  '.abbreviation-paragraph-message'
);
const abbreviationButton = document.querySelector('.abbreviation-button');

let abbreviationInputs = [];
let abbreviationInputAmount = 0;
let lastKnownStatus = '';
let submitAbbreviations = false;

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

function buttonToggleAndStyling(
  button,
  buttonTextContent,
  paragraphElement,
  paragraphColor,
  paragraphMessage
) {
  button.textContent = buttonTextContent;
  paragraphElement.style.color = paragraphColor;
  paragraphElement.textContent = paragraphMessage;
}

// when DOMContentLoaded, fetch from server last known status of security mode
// to properly display on client even when page refeshes
// this makes sure client and server side code is always in sync
async function initializeStatus() {
  lastKnownStatus = await fetch('/lastAbbreviationStatus');
  lastKnownStatus = await lastKnownStatus.text();
  console.log(lastKnownStatus);

  if (lastKnownStatus.length === 0 || lastKnownStatus === 'false') {
    const paraMessage = 'Abbreviation mode has been turned off.';
    buttonToggleAndStyling(
      abbreviationButton,
      'Enable',
      abbreviationParagraph,
      'red',
      paraMessage
    );
  } else {
    const paraMessage = 'Abbreviation mode has been turned on.';
    buttonToggleAndStyling(
      abbreviationButton,
      'Disable',
      abbreviationParagraph,
      'green',
      paraMessage
    );
  }
}

// run function everytime page loads (so if user refreshes page)
document.addEventListener('DOMContentLoaded', initializeStatus);

abbreviationButton.addEventListener('click', async function () {
  if (!submitAbbreviations) {
    const message =
      'Error! You cannot turn activation mode on until you have submit your abbreviation values.';
    textContentAndStyling(
      abbreviationParagraphMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
    abbreviationParagraphMessage.style.textAlign = 'center';
    return;
  }

  if (
    abbreviationParagraph.textContent ===
    'Abbreviation mode has been turned off.'
  ) {
    const paraMessage = 'Abbreviation mode has been turned on.';
    buttonToggleAndStyling(
      abbreviationButton,
      'Disable',
      abbreviationParagraph,
      'green',
      paraMessage
    );
  } else {
    const paraMessage = 'Abbreviation mode has been turned off.';
    buttonToggleAndStyling(
      abbreviationButton,
      'Enable',
      abbreviationParagraph,
      'red',
      paraMessage
    );
  }

  const options = {
    method: 'PATCH',
  };

  // update last known abbreviation status
  await fetch('/lastAbbreviationStatus', options);
});

submitButton.addEventListener('click', async function () {
  submitInputs.forEach((input) => {
    if (input.value.length !== 0) {
      abbreviationInputs.push(input.value);
      input.value = '';
      abbreviationInputAmount++;
    } else {
      return;
    }
  });

  if (abbreviationInputAmount !== 9) {
    const message =
      'Error! You must fill out all the values to submit. If you would like to skip one of the values, type "NA".';
    textContentAndStyling(
      submitMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
    abbreviationInputs = [];
    abbreviationInputAmount = 0;
    return;
  }

  submitAbbreviations = true;

  const body = { abbreviationInputs };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };

  let response = await fetch('/abbreviations', options);
  response = await response.text();
  console.log(response);

  if (response === 'Success!') {
    const message = 'Success! Your abbreviations settings have been saved.';
    textContentAndStyling(
      submitMessage,
      'inline-block',
      'bold',
      'green',
      message
    );
    abbreviationInputs = [];
    abbreviationInputAmount = 0;
  } else {
    const message =
      'Error! There was a problem saving your abbreviations settings. Please try again later.';
    textContentAndStyling(
      submitMessage,
      'inline-block',
      'bold',
      'red',
      message
    );
    abbreviationInputs = [];
    abbreviationInputAmount = 0;
  }
});
