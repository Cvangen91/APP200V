// Authentication check for protected pages
document.addEventListener('DOMContentLoaded', function() {
  // Get current page path
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';

  // List of pages that don't require authentication
  const publicPages = ['index.html', 'contact.html', '', '/', 'login.html'];
  
  // Check if current page requires authentication
  const requiresAuth = !publicPages.includes(fileName);
  
  // Only proceed if this is a protected page (has auth required message)
  const authContent = document.getElementById('auth-required');
  if (!authContent) return;
  
  // Get the appropriate content element based on the page
  const mainContent = fileName === 'myprofile.html' 
    ? document.getElementById('profile-content')
    : document.getElementById('page-content');
  
  if (requiresAuth) {
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    
    if (!isLoggedIn) {
      // Store current page for redirect after login
      localStorage.setItem('redirectAfterLogin', window.location.href);
      
      // Hide content and show auth message
      if (mainContent) mainContent.style.display = 'none';
      authContent.style.display = 'block';
    } else {
      // Show content and hide auth message
      if (mainContent) mainContent.style.display = 'block';
      authContent.style.display = 'none';
    }
  } else {
    // Public page - show content, hide auth message
    if (mainContent) mainContent.style.display = 'block';
    authContent.style.display = 'none';
  }
});