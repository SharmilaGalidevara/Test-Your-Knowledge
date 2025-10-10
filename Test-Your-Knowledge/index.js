// DOM Elements
const usernameInput = document.getElementById('username');
const phoneInput = document.getElementById('phone');
const startBtn = document.getElementById('startBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const adminModal = document.getElementById('adminModal');
const closeBtn = document.querySelector('.close');
const adminLoginForm = document.getElementById('adminLoginForm');

// Error message elements
const usernameError = document.getElementById('usernameError');
const phoneError = document.getElementById('phoneError');

// Form groups for validation states
const usernameGroup = usernameInput?.parentElement;
const phoneGroup = phoneInput?.parentElement;

// Admin credentials
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'bgakl2025';

// Clear any previously stored values for a fresh start
localStorage.removeItem('playerName');
localStorage.removeItem('playerPhone');

// Validation functions
function validateName(name) {
  const nameRegex = /^[A-Za-z\s]{2,30}$/;
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!nameRegex.test(name)) return 'Only letters and spaces are allowed';
  return '';
}

function validatePhone(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (!phone) return 'Phone number is required';
  if (digits.length < 10) return 'Must be at least 10 digits';
  if (digits.length > 15) return 'Maximum 15 digits allowed';
  if (!/^[0-9\s+\-()]+$/.test(phone)) return 'Only numbers, spaces, +, -, and parentheses allowed';
  return '';
}

// Track if user has interacted with the form
let formSubmitted = false;

// Update validation state
function updateValidationState(element, isValid, errorElement, errorMessage = '') {
  const formGroup = element.parentElement;
  
  // Only show errors if form was submitted or field was interacted with
  const showError = formSubmitted || element.value.length > 0;
  
  if (errorMessage && showError) {
    // Show error state
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    errorElement.textContent = errorMessage;
  } else if (isValid && element.value.length > 0) {
    // Show success state only if there's content
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    errorElement.textContent = '';
  } else {
    // Reset state
    formGroup.classList.remove('error', 'success');
    errorElement.textContent = '';
  }
}

// Validate form and update button state
function validateForm() {
  const name = usernameInput.value.trim();
  const phone = phoneInput.value.trim();
  
  // Validate name
  const nameError = validateName(name);
  updateValidationState(usernameInput, !nameError, usernameError, nameError);
  
  // Validate phone
  const phoneErrorMsg = validatePhone(phone);
  updateValidationState(phoneInput, !phoneErrorMsg, phoneError, phoneErrorMsg);
  
  // Enable/disable start button
  startBtn.disabled = !!nameError || !!phoneErrorMsg;
  
  return !nameError && !phoneErrorMsg;
}

// Event listeners for real-time validation
if (usernameInput) {
  usernameInput.addEventListener('input', () => {
    const name = usernameInput.value.trim();
    const error = validateName(name);
    updateValidationState(usernameInput, !error, usernameError, error);
    validateForm();
  });
}

if (phoneInput) {
  phoneInput.addEventListener('input', (e) => {
    // Allow any format but clean for validation
    let phone = e.target.value;
    
    // Store cursor position
    const cursorPosition = e.target.selectionStart;
    const inputLength = phone.length;
    
    // Don't format if user is deleting characters
    if (inputLength < e.target.value.length) {
      const error = validatePhone(phone);
      updateValidationState(phoneInput, !error, phoneError, error);
      validateForm();
      return;
    }
    
    // Auto-format only if user is adding numbers
    const digits = phone.replace(/\D/g, '');
    if (digits.length <= 15) {  // Only format if within max length
      // Add spaces after 3rd and 6th digits only
      let formatted = '';
      for (let i = 0; i < Math.min(digits.length, 15); i++) {
        if (i === 0 && digits[i] === '+') {
          formatted += '+';
          continue;
        }
        // Add space after 3rd and 6th digits (but not after that)
        if ((i === 3 || i === 6) && digits[i] !== ' ') {
          formatted += ' ';
        }
        formatted += digits[i];
      }
      e.target.value = formatted.trim();
      
      // Restore cursor position
      const newCursorPosition = cursorPosition + (e.target.value.length - inputLength);
      e.target.setSelectionRange(newCursorPosition, newCursorPosition);
    } else {
      // If over max length, truncate to 15 digits
      e.target.value = e.target.value.slice(0, -1);
    }
    
    const error = validatePhone(e.target.value);
    updateValidationState(phoneInput, !error, phoneError, error);
    validateForm();
  });
}

// Start button click handler
startBtn.addEventListener('click', (e) => {
  e.preventDefault();
  formSubmitted = true; // Mark form as submitted
  
  // Force validation of all fields
  validateForm();
  
  // Check if form is valid
  const name = usernameInput.value.trim();
  const phone = phoneInput.value.trim();
  const nameError = validateName(name);
  const phoneError = validatePhone(phone);
  
  if (!nameError && !phoneError) {
    // Save player info to localStorage
    const playerInfo = {
      name: name,
      phone: phone
    };
    localStorage.setItem('playerInfo', JSON.stringify(playerInfo));
    
    // Clear any previous player data to prevent duplicates
    localStorage.removeItem('currentPlayer');
    localStorage.removeItem('mostRecentScore');
    
    // Navigate to game with player info in URL
    const playerData = encodeURIComponent(JSON.stringify(playerInfo));
    window.location.href = `game.html?player=${playerData}`;
  }
});

// Admin Login Modal functionality
if (adminLoginBtn) {
  adminLoginBtn.addEventListener('click', () => {
    adminModal.style.display = 'block';
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    adminModal.style.display = 'none';
  });
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === adminModal) {
    adminModal.style.display = 'none';
  }
});

// Handle admin login form submission
if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value;
    
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      // Store admin authentication status in localStorage
      localStorage.setItem('isAdminAuthenticated', 'true');
      // Redirect to admin page
      window.location.href = 'admin.html';
    } else {
      alert('Invalid admin credentials. Please try again.');
      document.getElementById('adminPassword').value = '';
    }
  });
}
