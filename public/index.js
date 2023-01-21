const securityButton = document.querySelector('.security-button');
const securityParagraph = document.querySelector('.security-paragraph');
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
