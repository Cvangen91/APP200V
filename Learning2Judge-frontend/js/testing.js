let exercises = [];
let scores = [];
let correctScores = [];
let program;
let videoPath;
let allExercises = [];

function getProgramIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('programId');
}

document.addEventListener('DOMContentLoaded', async function () {
  const programId = getProgramIdFromURL();
  if (!programId) {
    alert('❌ Mangler programId i URL');
    return;
  }

  const token = localStorage.getItem('access_token');
  if (!token) return;

  console.log('TOKEN:', token);

  try {
    const programRes = await fetch(
      `http://localhost:8000/api/programs/${programId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    program = await programRes.json();
    console.log('Programa:', program);

    const exercisesRes = await fetch(
      `http://localhost:8000/api/exercises`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    allExercises = await exercisesRes.json();
    console.log('Todos os exercícios:', allExercises);

    const correctRes = await fetch(
      `http://localhost:8000/api/program-scores/program/${programId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    correctScores = await correctRes.json();
    console.log('Scores corretos:', correctScores);

    exercises = program.exercises.map(exerciseId => {
      const exerciseDetails = allExercises.find(ex => ex.exercise_id === exerciseId);
      const correctScore = correctScores.find(cs => cs.exercise_id === exerciseId);
      
      return {
        exercise_id: exerciseId,
        correct_score_id: correctScore ? correctScore.program_score_id : null,
        name: exerciseDetails ? exerciseDetails.name : `Exercício ID ${exerciseId}`
      };
    });

    console.log('Exercícios correlacionados:', exercises);
    createTable();
  } catch (error) {
    console.error('🚨 Erro ao carregar dados:', error);
  }

  const titleEl = document.getElementById('program-title');
  if (titleEl) {  
    titleEl.innerHTML = `<i class="fas fa-tasks"></i> Dressurtest: ${program.name}`;
  }

  const videoContainer = document.getElementById('video-container');
  if (videoContainer && program && program.video_path) {
    // Converte o URL do YouTube para o formato de embed
    const videoUrl = program.video_path.replace('watch?v=', 'embed/');
    videoContainer.innerHTML = `
    <iframe width="100%" height="450"
      src="${videoUrl}"
      title="Programvideo"
      frameborder="0" style="border:0;"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowfullscreen>
    </iframe>
  `;
  } else {
    videoContainer.innerHTML = `<p style="color: red">❌ Video ikke tilgjengelig</p>`;
  }
});

function createTable() {
  const container = document.getElementById('give-characters');
  if (!container) return;

  const table = document.createElement('table');
  table.classList.add('character-table');

  let thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>#</th>
      <th>Exercício</th>
      <th>Karakter (0-10)</th>
    </tr>
  `;

  let tbody = document.createElement('tbody');

  exercises.forEach((exercise, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${exercise.name}</td>
      <td>
        <input type="number" class="score-input" min="0" max="10" step="0.5" 
               data-exercise-id="${exercise.exercise_id}"
               data-correct-score-id="${exercise.correct_score_id}">
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
    return;
  }

  scores[index] = value;
  if (index < exercises.length - 1) {
    updateRows(index + 1);
  } else {
    showSuccess();
  }
}

function updateRows(nextIndex) {
  let rows = document.querySelectorAll('.character-table tbody tr');

  rows.forEach((row, i) => {
    if (i < nextIndex - 1) {
      row.style.display = 'none';
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

async function showSuccess() {
  document.getElementById('give-characters').style.display = 'none';
  document.getElementById('success-message').style.display = 'block';

  const token = localStorage.getItem('access_token');

  // Opprett userSession
  const sessionRes = await fetch(`https://localhost:8000/api/user-sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ program_id: programId }),
  });

  const session = await sessionRes.json();
  const userSessionId = session.user_session_id;

  // Lagre scores
  for (let i = 0; i < scores.length; i++) {
    await fetch(`https://localhost:8000/api/user-scores`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_session_id: userSessionId,
        correct_score_id: exercises[i].correct_score_id,
        user_score: scores[i],
      }),
    });
  }

  console.log('✅ Karakterer lagret:', scores);
}
