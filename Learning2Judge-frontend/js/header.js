document.addEventListener('DOMContentLoaded', function () {
  function updateHeader() {
    // Check if user is authenticated
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    const username = localStorage.getItem('username');

    // Get current path to highlight active link
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';

    // Header HTML with conditional content based on authentication status
    const headerHTML = `
      <header>
        <nav>
        <a href="#maincontent" class="skiplink">Hopp til hovedinnhold</a>
          <div class="logo">
            <img src="images/logotextny.png" alt="Learning2Judge">
          </div>
          <div class="menu-toggle" aria-label="Menu">&#9776;</div>
          <ul class="nav-links">
            <li><a href="index.html" class="${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}">
              <i class="fas fa-home"></i> Hjem
            </a></li>
            <li><a href="myprofile.html" class="${currentPage === 'myprofile.html' ? 'active' : ''}">
              <i class="fas fa-user"></i> Min side
            </a></li>
            <li><a href="program.html" class="${currentPage === 'program.html' ? 'active' : ''}">
              <i class="fas fa-horse"></i> Program
            </a></li>
            <li><a href="contact.html" class="${currentPage === 'contact.html' ? 'active' : ''}">
              <i class="fas fa-envelope"></i> Kontakt oss
            </a></li>
            ${isLoggedIn ? 
            `<li class="user-greeting">Hei, <strong>${username || 'bruker'}</strong>!</li>
             <li><a href="#" id="login-button" class="logout-btn">
               <i class="fas fa-sign-out-alt"></i> Logg ut
             </a></li>` 
            : 
            `<li><a href="#" id="login-button" class="login-btn">
               <i class="fas fa-sign-in-alt"></i> Logg inn
             </a></li>
             <li><a href="register.html" class="${currentPage === 'register.html' ? 'active' : ''}">
               <i class="fas fa-user-plus"></i> Registrer
             </a></li>`
            }
          </ul>
        </nav>
      </header>
    `;
    
    // Insert header into element with ID 'header'
    const headerElement = document.getElementById('header');
    if (headerElement) {
      headerElement.innerHTML = headerHTML;
      
      // Add event to hamburger menu button after header insertion
      const menuToggle = document.querySelector('.menu-toggle');
      const navLinks = document.querySelector('.nav-links');
      
      if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
          navLinks.classList.toggle('active');
          
          // Add animation effect when opening/closing menu
          if (navLinks.classList.contains('active')) {
            const links = navLinks.querySelectorAll('li');
            links.forEach((link, index) => {
              link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
            });
          } else {
            const links = navLinks.querySelectorAll('li');
            links.forEach((link) => {
              link.style.animation = '';
            });
          }
        });
      }
      
      // Add logout event to button after DOM insertion
      const loginButton = document.getElementById('login-button');
      if (loginButton) {
        loginButton.addEventListener('click', function(e) {
          e.preventDefault();
          
          // If logged in, do logout
          if (isLoggedIn) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('username');
            alert('Du har blitt logget ut.');
            // Update header after logout
            updateHeader();
            // Redirect to home page
            window.location.href = 'index.html';
          } else {
            // If not logged in, show login form
            const loginContainer = document.getElementById('login-container');
            if (loginContainer) {
              loginContainer.style.display = 'flex';
            }
          }
        });
      }
    }
  }
  
  // Update header immediately when page loads
  updateHeader();

  // Watch for changes in localStorage to update header when login status changes
  window.addEventListener('storage', function(e) {
    if (e.key === 'access_token' || e.key === 'username') {
      updateHeader();
    }
  });
});
