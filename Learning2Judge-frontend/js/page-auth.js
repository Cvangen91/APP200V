document.addEventListener('DOMContentLoaded', function() {
  const currentPath = window.location.pathname;
  const fileName = currentPath.split('/').pop() || 'index.html';

  const publicPages = ['index.html', 'contact.html', '', '/', 'login.html'];
  
  const requiresAuth = !publicPages.includes(fileName);
  
  const authContent = document.getElementById('auth-required');
  if (!authContent) return;
  
  const mainContent = fileName === 'myprofile.html' 
    ? document.getElementById('profile-content')
    : document.getElementById('page-content');
  
  if (requiresAuth) {
    const isLoggedIn = localStorage.getItem('access_token') !== null;
    
    if (!isLoggedIn) {
      localStorage.setItem('redirectAfterLogin', window.location.href);
      
      if (mainContent) mainContent.style.display = 'none';
      authContent.style.display = 'block';
    } else {
      if (mainContent) mainContent.style.display = 'block';
      authContent.style.display = 'none';
    }
  } else {
    if (mainContent) mainContent.style.display = 'block';
    authContent.style.display = 'none';
  }
});