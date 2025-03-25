document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Stopper skjemaet fra å sende på vanlig måte
    
    // Hent verdiene fra skjemaet
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;

    // Opprett et objekt med skjema-dataene
    const formData = {
        name: name,
        email: email,
        message: message
    };

    // Vis statusmelding om skjemaet sendes
    const formStatus = document.getElementById('form-status');
    formStatus.innerText = '⏳ Sender melding...';

    try {
        // Send POST-forespørsel til backend
        const response = await fetch('http://localhost:3000/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json(); // Hent JSON-respons fra serveren
        formStatus.innerText = data.message; // Vis svar fra backend

        if (data.message === '✅ Meldingen ble sendt og lagret!') {
            // Tøm skjemaet hvis meldingen ble sendt
            document.getElementById('contact-form').reset();
        }
    } catch (error) {
        formStatus.innerText = '❌ Noe gikk galt. Prøv igjen.';
        console.error('Feil:', error);
    }
});
