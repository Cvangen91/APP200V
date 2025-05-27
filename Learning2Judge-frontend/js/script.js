/*Javascript for hamburgermenu */
document.addEventListener('DOMContentLoaded', function () {
  /*waits for the document to run before the script*/
  const menuToggle =
    document.querySelector('.menu-toggle'); /*gets hamburgermenu button */
  const navLinks =
    document.querySelector('.nav-links'); /*gets navigationmenu */
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', function () {
      navLinks.classList.toggle('active'); //switch showcasing the menu
    });
  }
});

/* load username for welcome message */
document.addEventListener('DOMContentLoaded', function () {
  const username = localStorage.getItem('username');
  const welcomeUsername = document.getElementById('welcome-username');
  if (username && welcomeUsername) {
    welcomeUsername.textContent = username;
  }
});
