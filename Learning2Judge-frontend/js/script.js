
/*Javascript for hamburgermenyen */
document.addEventListener("DOMContentLoaded", function() {
    /*venter til dokumentet kjører før scriptet kjører */
    const menuToggle = document.querySelector(".menu-toggle"); /*henter hemburgermeny knappen */
    const navLinks = document.querySelector(".nav-links"); /*henter navigasjonsmenyen */
/*legger til en klikkhendelse på hamburgermenyen */
    menuToggle.addEventListener("click", function() {
        navLinks.classList.toggle("active"); //veksle mellom å vise/skjule menyen
    });
});
