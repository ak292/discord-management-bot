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

// when DOMContentLoaded, fetch from server last known status of security mode
// to properly display on client even when page refeshes
// this makes sure client and server side code is always in sync
async function initializeStatus() {
  lastKnownStatus = await fetch('/lastAbbreviationStatus');
  lastKnownStatus = await lastKnownStatus.text();
  console.log(lastKnownStatus);

  if (lastKnownStatus.length === 0 || lastKnownStatus === 'false') {
    abbreviationButton.textContent = 'Enable';
    abbreviationParagraph.style.color = 'red';
    abbreviationParagraph.textContent =
      'Abbreviation mode has been turned off.';
  } else {
    abbreviationButton.textContent = 'Disable';
    abbreviationParagraph.style.color = 'green';
    abbreviationParagraph.textContent = 'Abbreviation mode has been turned on.';
  }
}

// run function everytime page loads (so if user refreshes page)
document.addEventListener('DOMContentLoaded', initializeStatus);

abbreviationButton.addEventListener('click', async function () {
  if (!submitAbbreviations) {
    abbreviationParagraphMessage.style.display = 'inline-block';
    abbreviationParagraphMessage.style.color = 'red';
    abbreviationParagraphMessage.style.color = 'bold';
    abbreviationParagraphMessage.style.textAlign = 'center';
    abbreviationParagraphMessage.textContent =
      'Error! You cannot turn activation mode on until you have submit your abbreviation values.';
    setTimeout(() => {
      abbreviationParagraphMessage.textContent = '';
      abbreviationParagraphMessage.style.color = '';
      abbreviationParagraphMessage.style.fontWeight = '';
      abbreviationParagraphMessage.style.display = 'none';
    }, 5000);
    return;
  }

  if (
    abbreviationParagraph.textContent ===
    'Abbreviation mode has been turned off.'
  ) {
    abbreviationButton.textContent = 'Disable';
    abbreviationParagraph.style.color = 'green';
    abbreviationParagraph.textContent = 'Abbreviation mode has been turned on.';
  } else {
    abbreviationButton.textContent = 'Enable';
    abbreviationParagraph.style.color = 'red';
    abbreviationParagraph.textContent =
      'Abbreviation mode has been turned off.';
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
    submitMessage.style.display = 'inline-block';
    submitMessage.style.fontWeight = 'bold';
    submitMessage.style.color = 'red';
    submitMessage.textContent =
      'Error! You must fill out all the values to submit. If you would like to skip one of the values, type "NA".';
    setTimeout(() => {
      submitMessage.textContent = '';
      submitMessage.style.color = '';
      submitMessage.style.fontWeight = '';
      submitMessage.style.display = 'none';
    }, 5000);
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
    submitMessage.style.display = 'inline-block';
    submitMessage.style.fontWeight = 'bold';
    submitMessage.style.color = 'green';
    submitMessage.textContent =
      'Success! Your abbreviations settings have been saved.';
    setTimeout(() => {
      submitMessage.textContent = '';
      submitMessage.style.color = '';
      submitMessage.style.fontWeight = '';
      submitMessage.style.display = 'none';
    }, 5000);
    abbreviationInputs = [];
    abbreviationInputAmount = 0;
  } else {
    submitMessage.style.display = 'inline-block';
    submitMessage.style.fontWeight = 'bold';
    submitMessage.style.color = 'red';
    submitMessage.textContent =
      'Error! There was a problem saving your abbreviations settings. Please try again later.';
    setTimeout(() => {
      submitMessage.textContent = '';
      submitMessage.style.color = '';
      submitMessage.style.fontWeight = '';
      submitMessage.style.display = 'none';
    }, 5000);
    abbreviationInputs = [];
    abbreviationInputAmount = 0;
  }
});
