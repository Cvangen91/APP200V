document.addEventListener('DOMContentLoaded', function () {
  // Verifica se o usuário está autenticado
  const isLoggedIn = localStorage.getItem('access_token') !== null;
  const username = localStorage.getItem('username');

  // Obtém o caminho atual para destacar o link ativo
  const currentPath = window.location.pathname;
  const currentPage = currentPath.split('/').pop() || 'index.html';

  // Header HTML com conteúdo condicional baseado no status de autenticação
  const headerHTML = `
    <header>
      <nav>
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
  
  // Insere o header no elemento com ID 'header'
  const headerElement = document.getElementById('header');
  if (headerElement) {
    headerElement.innerHTML = headerHTML;
    
    // Adiciona evento ao botão de menu hamburguer após inserção do header
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle && navLinks) {
      menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Adiciona efeito de animação ao abrir/fechar o menu
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
  }
});
