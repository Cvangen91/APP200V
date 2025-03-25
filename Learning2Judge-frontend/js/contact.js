document.getElementById('contact-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const formStatus = document.getElementById('form-status');

    // Enkel validering
    if (!name || !email || !message) {
        formStatus.innerText = '❌ Alle feltene må fylles ut.';
        return; // Stoppe innsending
    }

    // Lag formdata
    const formData = { name: name, email: email, message: message };

    // Sett status til sending
    formStatus.innerText = '⏳ Sender melding...';

    try {
        // Send data til backend
        const response = await fetch('http://localhost:3000/submit-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Håndter respons
        const data = await response.json();

        // Vis responsmelding
        if (data.message === '✅ Meldingen ble sendt og lagret!') {
            formStatus.innerText = data.message;
            // Vi fjerner kun innholdet i skjemaet, men holder meldingen stående
            document.getElementById('contact-form').reset();
        } else {
            formStatus.innerText = '❌ ' + data.message;
        }
    } catch (error) {
        formStatus.innerText = `❌ Feil: ${error.message}. Prøv igjen senere.`;
        console.error('Feil:', error);
    }
});
