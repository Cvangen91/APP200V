let exercises = [];
let scores = [];
let correctScores = [];
let program;
let videoPath;
let allExercises = [];

let nextToShow = 4;
let visibleCount = 4;

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
      const exerciseDetails = allExercises.find(ex => ex.exerciseId === exerciseId);
      const correctScore = correctScores.find(cs => cs.exerciseId === exerciseId);
      
      return {
        exerciseId: exerciseId,
        correctScoreId: correctScore ? correctScore.programScoreId : null,
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
  if (videoContainer && program && program.videoPath) {
    // Converte o URL do YouTube para o formato de embed
    const videoUrl = program.videoPath.replace('watch?v=', 'embed/');
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

  // Adiciona o elemento para a tabela de resultados se não existir
  if (!document.getElementById('result-table')) {
    const resultTable = document.createElement('div');
    resultTable.id = 'result-table';
    resultTable.style.display = 'none';
    document.body.appendChild(resultTable);
  }
});

function createTable() {
  const container = document.getElementById('give-characters');
  if (!container) return;

  // Limpa o container antes de adicionar a tabela
  container.innerHTML = '';

  const table = document.createElement('table');
  table.classList.add('character-table');

  let thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nr</th>
      <th>Beskrivelse</th>
      <th>Karakter (0-10)</th>
    </tr>
  `;

  let tbody = document.createElement('tbody');
  tbody.id = 'exercise-body';

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${exercise.name}</td>
      <td>
        <input type="number" class="score-input" min="0" max="10" step="0.5" 
               data-exercise-id="${exercise.exerciseId}"
               data-correct-score-id="${exercise.correctScoreId}"
               data-index="${i}">
      </td>
    `;
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  container.appendChild(table);

  attachInputListeners();
}

function attachInputListeners() {
  let inputs = document.querySelectorAll('.score-input');
  inputs.forEach((input, index) => {
    input.dataset.index = index;
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
    alert('Vennligst angi en gyldig karakter mellom 0 og 10.');
    input.value = '';
    input.focus();
    return;
  }

  scores[index] = value;

  const row = input.closest('tr');
  row.remove();
  
  if (nextToShow < exercises.length) {
    const ex = exercises[nextToShow];
    const tbody = document.getElementById('exercise-body');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${nextToShow + 1}</td>
      <td>${ex.name}</td>
      <td>
        <input type="number" class="score-input" min="0" max="10" step="0.5"
               data-exercise-id="${ex.exerciseId}"
               data-correct-score-id="${ex.correctScoreId}"
               data-index="${nextToShow}">
      </td>
    `;
    tbody.appendChild(newRow);
    // gi listener til den nye raden
    newRow.querySelector('input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleInput(this);
      }
    });
    nextToShow++;
  }

  // Flytt fokus til neste input (øverste i tabellen), eller avslutt
  const nextInput = document.querySelector('.score-input');
  if (nextInput) {
    nextInput.focus();
  } else {
    // Verifica se preenchemos todas as notas
    if (scores.length === exercises.length) {
      // Mostra a tela de comparação imediatamente
      showComparison();
      // Também chama showSuccess para salvar os dados
      showSuccess();
    }
  }
}

async function showSuccess() {
  document.getElementById('give-characters').style.display = 'none';
  
  // Primeiro mostramos a comparação
  showComparison();
  
  const token = localStorage.getItem('access_token');
  const programId = getProgramIdFromURL();

  try {
    // Opprett userSession
    const sessionRes = await fetch(`http://localhost:8000/api/user-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ programId: programId }),
    });

    const session = await sessionRes.json();
    const userSessionId = session.userSessionId;

    // Lagre scores
    for (let i = 0; i < scores.length; i++) {
      await fetch(`http://localhost:8000/api/user-scores`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSessionId: userSessionId,
          correctScoreId: exercises[i].correctScoreId,
          userScore: scores[i],
        }),
      });
    }

    console.log('✅ Karakterer lagret:', scores);
    
    // Mostramos a mensagem de sucesso depois de salvar
    document.getElementById('success-message').style.display = 'block';
  } catch (error) {
    console.error('Erro ao salvar dados:', error);
    alert('Erro ao salvar suas notas. Por favor, tente novamente.');
  }
}

function showComparison() {
  const resultDiv = document.getElementById('result-table');
  if (!resultDiv) {
    console.error('Elemento result-table não encontrado!');
    return;
  }
  
  resultDiv.innerHTML = '<h3 class="text-center mb-3">Comparação de Resultados</h3>';

  const table = document.createElement('table');
  table.classList.add('character-table');

  let thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nr</th>
      <th>Beskrivelse</th>
      <th>Sua nota</th>
      <th>Nota correta</th>
      <th>Resultado</th>
    </tr>
  `;

  let tbody = document.createElement('tbody');

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const userScore = scores[i];
    // Busca o score correto pelo correctScoreId
    const correctScoreObj = correctScores.find(cs => cs.programScoreId === exercise.correctScoreId);
    const correctScore = correctScoreObj ? correctScoreObj.score : null;

    // Verifica se acertou (pode ajustar a tolerância se quiser)
    const acertou = userScore === correctScore;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${exercise.name}</td>
      <td>${userScore !== undefined ? userScore : '-'}</td>
      <td>${correctScore !== null ? correctScore : '-'}</td>
      <td style="color:${acertou ? 'green' : 'red'};font-weight:bold">
        ${acertou ? '✔️' : '❌'}
      </td>
    `;
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  resultDiv.appendChild(table);
  resultDiv.style.display = 'block';
  
  // Scroll para a tabela de resultados
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}
