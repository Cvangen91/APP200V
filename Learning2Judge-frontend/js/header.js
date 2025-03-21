document.addEventListener('DOMContentLoaded', function() {
    //the header string. all the links
    const headerHTML = `
        <header>
            <nav>
                <div class="logo">
                    <img src="images/logotextny.png" alt="logo">
                </div>
                <div class="menu-toggle">&#9776;</div>
                <ul class="nav-links">
                    <li><a href="index.html">Hjem</a></li>
                    <li><a href="contact.html">Kontakt oss</a></li>
                    <li><a href="program.html">Program</a></li>
                    <li><a href="myprofile.html">Min side</a></li>
                    <li><a href="side5.html">Side 5</a></li>
                    <li><a href="#" id="login-button"><i class="fas fa-sign-in-alt"></i> Login</a></li>
                </ul>
            </nav>
        </header>
    `;
    document.getElementById('header').innerHTML = headerHTML; //finds element with id 'header' in html and adds html code
});
