const csvButton = document.getElementById('submit-button');
const input = document.getElementById('input-csv');

csvButton.addEventListener('click', async function (event) {
  const csvName = { val: input.value };
  input.value = '';

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(csvName),
  };

  await fetch('/csv', options);
});
