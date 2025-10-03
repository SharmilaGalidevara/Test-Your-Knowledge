const usernameInput = document.getElementById('username');
const phoneInput = document.getElementById('phone');
const startBtn = document.getElementById('startBtn');

// Prefill from previous session
const existingName = localStorage.getItem('playerName');
const existingPhone = localStorage.getItem('playerPhone');
if (existingName) usernameInput.value = existingName;
if (existingPhone) phoneInput.value = existingPhone;

function validPhone(v) {
  // Simple validation: at least 7 digits; strip non-digits
  const digits = (v || '').replace(/\D/g, '');
  return digits.length >= 7;
}

function refreshButton() {
  const nameOk = usernameInput.value.trim().length > 0;
  const phoneOk = validPhone(phoneInput.value);
  startBtn.disabled = !(nameOk && phoneOk);
}

usernameInput.addEventListener('input', refreshButton);
phoneInput.addEventListener('input', refreshButton);
refreshButton();

startBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  const phone = phoneInput.value.trim();
  if (!name || !validPhone(phone)) return;
  localStorage.setItem('playerName', name);
  localStorage.setItem('playerPhone', phone);
  // Reset last score before starting
  localStorage.removeItem('mostRecentScore');
  window.location.assign('game.html');
});
