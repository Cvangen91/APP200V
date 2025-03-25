const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs'); // Modul for å håndtere filer

const app = express();
const PORT = 3000;
const DATA_FILE = 'messages.json'; // Filen der meldinger lagres

app.use(bodyParser.json());
app.use(cors());

// Håndter POST-forespørsel fra skjemaet
app.post('/submit-contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Alle felt må fylles ut.' });
    }

    // Opprett en ny melding
    const newMessage = { name, email, message };

    // Les eksisterende meldinger fra filen
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        let messages = [];
        if (!err && data) {
            messages = JSON.parse(data); // Konverter JSON-streng til objekt
        }

        // Legg til den nye meldingen
        messages.push(newMessage);

        // Lagre den oppdaterte listen tilbake til filen
        fs.writeFile(DATA_FILE, JSON.stringify(messages, null, 2), (err) => {
            if (err) {
                console.error('Feil ved lagring av meldingen:', err);
                return res.status(500).json({ message: 'Kunne ikke lagre meldingen' });
            }
            console.log('✅ Melding lagret:', newMessage);
            res.json({ message: '✅ Meldingen ble sendt og lagret!' });
        });
    });
});

// Start serveren
app.listen(PORT, () => {
    console.log(`🚀 Server kjører på http://localhost:${PORT}`);
});
