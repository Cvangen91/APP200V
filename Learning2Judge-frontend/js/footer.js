    document.addEventListener('DOMContentLoaded', function() {
        //the header string. all the links
        const headerHTML = `
     <footer>
      <div class="container py-2 text-center">
        <div class="footer-logo">
          <img src="images/logotextny.png" alt="Learning2Judge" style="max-width: 180px;">
        </div>
        <p>&copy; 2025 Learning2Judge - En digital læringsplattform for dressurdommere</p>
        </div>
      </div>
    </footer>
        `;
        document.getElementById('header').innerHTML = headerHTML; //finds element with id 'header' in html and adds html code
    });