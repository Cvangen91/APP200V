// Importer nødvendige funksjoner fra Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Firebase-konfigurasjon
const firebaseConfig = {
  apiKey: "AIzaSyCX7kC8hSJKEflhRUMVrcUI86o2dElrUgI",
  authDomain: "learning2judge.firebaseapp.com",
  projectId: "learning2judge",
  storageBucket: "learning2judge.appspot.com",
  messagingSenderId: "1040910900631",
  appId: "1:1040910900631:web:ef669f9d13908bd9d138d2",
  measurementId: "G-1XQBFR18SM"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Vent til DOM er lastet før vi legger til event listener
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');  // Her vises statusmeldingen

  // Når skjemaet blir sendt
  form.addEventListener('submit', async function (event) {
    event.preventDefault(); // Hindrer at skjemaet lastes på nytt

    // Hent verdiene fra inputfeltene
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const emne = document.getElementById('emne').value;
    const message = document.getElementById('message').value;

    // Validere at alle nødvendige felter er fylt ut
    if (!name || !email || !message) {
      formStatus.innerText = '❌ Alle feltene må fylles ut.';  // Feilmelding
      formStatus.style.color = 'red';  // Rød tekst for feil
      formStatus.style.display = 'block';  // Vis statusmelding
      return;
    }

    // Oppdater status til "Sender melding"
    formStatus.innerText = '⏳ Sender melding...';
    formStatus.style.color = 'blue'; // Blå tekst for sending
    formStatus.style.display = 'block';  // Vis statusmelding

    try {
      // Legg til dataene i Firestore
      const docRef = await addDoc(collection(db, "contactMessages"), {
        name: name,
        email: email,
        message: message,
        emne: emne,
        timestamp: new Date()  // Legger til tidsstempel
      });

      // Bekreft at meldingen ble sendt
      formStatus.innerText = '✅ Meldingen ble sendt!';  // Vist suksessmelding
      formStatus.style.color = 'green';  // Grønn tekst for suksess
      formStatus.style.display = 'block';  // Vis statusmelding
      form.reset();  // Tøm skjemaet etter sending

      // Fjern statusmelding etter noen sekunder (valgfritt)
      setTimeout(() => {
        formStatus.innerText = '';  // Tøm statusmelding etter 5 sekunder
        formStatus.style.display = 'none';  // Skjul meldingen
      }, 5000);

      console.log("Melding sendt med ID:", docRef.id);  // Logg dokument-ID for å bekrefte at meldingen ble sendt

    } catch (error) {
      // Hvis det oppstår en feil, vis en feilmelding
      formStatus.innerText = `❌ Feil: ${error.message}. Prøv igjen senere.`;
      formStatus.style.color = 'red';  // Rød tekst for feil
      formStatus.style.display = 'block';  // Vis statusmelding
      console.error('Feil:', error);  // Logg feilmelding i konsollen
    }
  });
});
