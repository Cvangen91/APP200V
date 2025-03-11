// Video-container: sjekker om elementet finnes
const videoId = 'im1s8SLZWLZX9Psp';
const videoContainer = document.getElementById('video-container');

if (videoContainer) {
  videoContainer.innerHTML = `
    <iframe width="1280" height="720" 
      src="https://www.youtube.com/embed/${videoId}" 
      frameborder="0" allowfullscreen>
    </iframe>
  `;
} else {
  console.error('❌ FEIL: Fant ikke #video-container!');
}

// Når DOM er lastet
document.addEventListener('DOMContentLoaded', function () {
  const descriptions = [
    'Innridning, holdt og hilsning',
    'Volte 10m',
    'Vend over banen fra E til B',
    'Volte 10m',
    'Diagonal med økning',
  ]; // Beskrivelsene til vurderingen

  let scores = [];

  function createTable() {
    const container = document.getElementById('give-characters');
    if (!container) {
      console.error('❌ FEIL: Fant ikke #give-characters!');
      return;
    }

    const table = document.createElement('table');
    table.classList.add('character-table');

    let thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Beskrivelse</th>
        <th>Karakter (0-10)</th>
      </tr>
    `;

    let tbody = document.createElement('tbody');

    descriptions.forEach((desc, index) => {
      let row = document.createElement('tr');
      row.classList.add(index === 0 ? 'active' : 'inactive');

      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${desc}</td>
        <td>
          <input type="number" class="score-input" 
            step="0.5" min="0" max="10"
            data-index="${index}">
        </td>
      `;

      tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    container.appendChild(table);

    attachInputListeners();
  }

  function attachInputListeners() {
    let inputs = document.querySelectorAll('.score-input');

    if (inputs.length === 0) {
      console.warn('⚠️ Ingen input-felter funnet! Noe gikk galt.');
      return;
    }

    inputs.forEach((input) => {
      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          event.preventDefault();
          handleInput(this);
        }
      });
    });
  }

  function handleInput(input) {
    let index = parseInt(input.dataset.index);
    let value = parseFloat(input.value);

    if (isNaN(value) || value < 0 || value > 10) {
      alert('Skriv inn en gyldig karakter mellom 0 og 10.');
      console.warn('⚠️ Ugyldig input: ', value);
      return;
    }

    scores[index] = value; // Lagre karakteren
    if (index < descriptions.length - 1) {
      updateRows(index + 1);
    } else {
      showSuccess();
    }
  }

  function updateRows(nextIndex) {
    let rows = document.querySelectorAll('.character-table tbody tr');

    rows.forEach((row, i) => {
      if (i < nextIndex - 1) {
        row.style.display = 'none'; // Skjul tidligere rader
      } else if (i === nextIndex) {
        row.classList.add('active');
        row.classList.remove('inactive');
        row.querySelector('.score-input').focus();
      } else {
        row.classList.add('inactive');
        row.classList.remove('active');
      }
    });
  }

  function showSuccess() {
    console.log('🎉 Alle rader fylt ut! Vurdering fullført.');
    document.getElementById('give-characters').style.display = 'none';
    document.getElementById('success-message').style.display = 'block';
    console.log('💾 Lagrede karakterer:', scores);
  }

  createTable();
});
