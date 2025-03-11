// Index page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // Display username in welcome message if logged in
  const username = localStorage.getItem('username');
  const welcomeUsername = document.getElementById('welcome-username');
  const loggedInMessage = document.getElementById('logged-in-message');
  const notLoggedInMessage = document.getElementById('not-logged-in-message');
  
  if (username && welcomeUsername) {
    welcomeUsername.textContent = username;
    loggedInMessage.style.display = 'block';
    notLoggedInMessage.style.display = 'none';
  }
});