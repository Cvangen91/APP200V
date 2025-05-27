import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCX7kC8hSJKEflhRUMVrcUI86o2dElrUgI",
  authDomain: "learning2judge.firebaseapp.com",
  projectId: "learning2judge",
  storageBucket: "learning2judge.appspot.com",
  messagingSenderId: "1040910900631",
  appId: "1:1040910900631:web:ef669f9d13908bd9d138d2",
  measurementId: "G-1XQBFR18SM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status'); 

  form.addEventListener('submit', async function (event) {
    event.preventDefault(); 

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const emne = document.getElementById('emne').value;
    const message = document.getElementById('message').value;

    if (!name || !email || !message) {
      formStatus.innerText = '❌ Alle feltene må fylles ut.'; 
      formStatus.style.color = 'red';  
      formStatus.style.display = 'block'; 
      return;
    }

    formStatus.innerText = '⏳ Sender melding...';
    formStatus.style.color = 'blue'; 
    formStatus.style.display = 'block';

    try {
      const docRef = await addDoc(collection(db, "contactMessages"), {
        name: name,
        email: email,
        message: message,
        emne: emne,
        timestamp: new Date() 
      });

      formStatus.innerText = '✅ Meldingen ble sendt!'; 
      formStatus.style.color = 'green'; 
      formStatus.style.display = 'block'; 
      form.reset(); 

      setTimeout(() => {
        formStatus.innerText = ''; 
        formStatus.style.display = 'none'; 
      }, 5000);

      console.log("Melding sendt med ID:", docRef.id); 

    } catch (error) {
      formStatus.innerText = `❌ Feil: ${error.message}. Prøv igjen senere.`;
      formStatus.style.color = 'red';  
      formStatus.style.display = 'block'; 
      console.error('Feil:', error); 
    }
  });
});
