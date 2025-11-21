// UI Animation Module

// Animate value (percentage skill)
export function animateValue(obj, start, end, duration) {
  if (!obj) return;

  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(progress * (end - start) + start) + '%';
    if (progress < 1) window.requestAnimationFrame(step);
  };
  window.requestAnimationFrame(step);
}

// Show error message to user
export function showError(message) {
  // Create error popup if it doesn't exist
  let errorPopup = document.getElementById('errorPopup');
  if (!errorPopup) {
    errorPopup = document.createElement('div');
    errorPopup.id = 'errorPopup';
    errorPopup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: monospace;
      display: none;
    `;
    document.body.appendChild(errorPopup);
  }

  errorPopup.textContent = message;
  errorPopup.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorPopup.style.display = 'none';
  }, 5000);
}

// Show success message
export function showSuccess(message) {
  let successPopup = document.getElementById('successPopup');
  if (!successPopup) {
    successPopup = document.createElement('div');
    successPopup.id = 'successPopup';
    successPopup.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4caf50;
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      font-family: monospace;
      display: none;
    `;
    document.body.appendChild(successPopup);
  }

  successPopup.textContent = message;
  successPopup.style.display = 'block';

  // Auto-hide after 3 seconds
  setTimeout(() => {
    successPopup.style.display = 'none';
  }, 3000);
}
