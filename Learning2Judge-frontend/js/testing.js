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
    let rawCorrectScores = await correctRes.json();
    console.log('Scores corretos (raw):', rawCorrectScores);
    
    // Processar os scores corretos para mapear cada exercício
    correctScores = [];
    
    // Se não temos scores no banco ainda, criamos um array vazio
    if (!rawCorrectScores || rawCorrectScores.length === 0) {
      console.warn('Nenhum score correto encontrado para este programa');
    }
    
    // Mapeia os exercícios do programa
    exercises = program.exercises.map((exerciseId, index) => {
      const exerciseDetails = allExercises.find(ex => ex.exerciseId === exerciseId);
      
      // Procura o score correto para este exercício
      const correctScore = rawCorrectScores.find(cs => cs.exerciseId === exerciseId);
      
      // Se encontrou, adiciona ao array de scores corretos
      if (correctScore) {
        correctScores.push(correctScore);
      }
      
      return {
        exerciseId: exerciseId,
        correctScoreId: correctScore ? correctScore.programScoreId : null,
        name: exerciseDetails ? exerciseDetails.name : `Exercício ID ${exerciseId}`
      };
    });

    console.log('Exercícios correlacionados:', exercises);
    console.log('Scores corretos processados:', correctScores);
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
    
    // Adiciona listener para Tab para garantir que todos os inputs sejam processados
    input.addEventListener('blur', function() {
      if (this.value.trim() !== '') {
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
  console.log(`Score ${index + 1} definido como ${value}`);

  // Marca o input como preenchido
  input.style.backgroundColor = '#e6ffe6'; // Verde claro para indicar preenchido
  
  // Move para o próximo input quando pressiona Enter
  const allInputs = document.querySelectorAll('.score-input');
  const currentIndex = Array.from(allInputs).indexOf(input);
  
  if (currentIndex < allInputs.length - 1) {
    // Ainda há inputs para preencher, move para o próximo
    allInputs[currentIndex + 1].focus();
  } else {
    // Último input preenchido, verificamos se todos foram preenchidos
    const allFilled = Array.from(allInputs).every(inp => inp.value.trim() !== '');
    
    if (allFilled && !document.getElementById('finish-button')) {
      // Todos os exercícios foram avaliados, mostra o botão de finalizar
      const container = document.getElementById('give-characters');
      
      const finishButton = document.createElement('button');
      finishButton.id = 'finish-button';
      finishButton.className = 'btn btn-lg';
      finishButton.innerHTML = '<i class="fas fa-check-circle"></i> Complete Evaluation';
      finishButton.style.margin = '20px auto';
      finishButton.style.display = 'block';
      
      finishButton.addEventListener('click', function() {
        showComparison();
        showSuccess();
      });
      
      container.appendChild(finishButton);
    }
  }
}

async function showSuccess() {
  document.getElementById('give-characters').style.display = 'none';
  
  const token = localStorage.getItem('access_token');
  const programId = getProgramIdFromURL();

  try {
    // Calcular as porcentagens antes de salvar
    const { userPercentage, expertPercentage, matchPercentage } = calculateScorePercentages();
    console.log('User Score %:', userPercentage);
    console.log('Expert Score %:', expertPercentage);
    console.log('Match %:', matchPercentage);
    
    // Salvar as porcentagens no localStorage para uso posterior
    saveTestResults(programId, userPercentage, expertPercentage, matchPercentage);
    
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
      if (scores[i] === undefined) continue; // Pula scores não preenchidos
      
      const exercise = exercises[i];
      if (!exercise.correctScoreId) continue; // Pula exercícios sem score correto
      
      await fetch(`http://localhost:8000/api/user-scores`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSessionId: userSessionId,
          correctScoreId: exercise.correctScoreId,
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

// Função para calcular as porcentagens de acerto
function calculateScorePercentages() {
  let totalUserScore = 0;
  let totalExpertScore = 0;
  let totalPossibleScore = 0;
  let totalMatch = 0;
  let countedExercises = 0;
  
  for (let i = 0; i < exercises.length; i++) {
    const userScore = scores[i];
    if (userScore === undefined) continue;
    
    // Busca o score correto para este exercício
    const correctScoreObj = correctScores.find(cs => 
      cs.exerciseId === exercises[i].exerciseId
    );
    
    if (!correctScoreObj) continue;
    
    const expertScore = correctScoreObj.score;
    
    // Adiciona aos totais
    totalUserScore += userScore;
    totalExpertScore += expertScore;
    totalPossibleScore += 10; // Pontuação máxima por exercício é 10
    
    // Calcula o match (quanto mais próximo de 100%, melhor)
    const match = 100 - (Math.abs(userScore - expertScore) / 10 * 100);
    totalMatch += match;
    
    countedExercises++;
  }
  
  // Calcula as porcentagens
  const userPercentage = (totalUserScore / (countedExercises * 10)) * 100;
  const expertPercentage = (totalExpertScore / (countedExercises * 10)) * 100;
  const matchPercentage = totalMatch / countedExercises;
  
  return {
    userPercentage: userPercentage.toFixed(1),
    expertPercentage: expertPercentage.toFixed(1),
    matchPercentage: matchPercentage.toFixed(1)
  };
}

// Função para salvar os resultados no localStorage
function saveTestResults(programId, userPercentage, expertPercentage, matchPercentage) {
  // Busca o objeto do programa para obter o nome
  const programName = program.name;
  const equipageId = program.equipageId;
  
  // Criar objeto com os resultados
  const testResult = {
    date: new Date().toLocaleDateString('no-NO'),
    programId: programId,
    programName: programName,
    equipageId: equipageId,
    userPercentage: userPercentage,
    expertPercentage: expertPercentage,
    matchPercentage: matchPercentage,
    scores: [...scores],
    exercises: exercises.map(e => e.name),
    correctScores: correctScores.map(cs => cs.score),
    timestamp: new Date().toISOString()
  };
  
  // Obter resultados existentes ou iniciar um array vazio
  const existingResults = JSON.parse(localStorage.getItem('testResults') || '[]');
  
  // Adicionar o novo resultado
  existingResults.push(testResult);
  
  // Salvar de volta no localStorage
  localStorage.setItem('testResults', JSON.stringify(existingResults));
}

function showComparison() {
  const resultDiv = document.getElementById('result-table');
  if (!resultDiv) {
    console.error('Elemento result-table não encontrado!');
    return;
  }
  
  resultDiv.innerHTML = '<h3 class="text-center mb-3">Score Comparison</h3>';

  const table = document.createElement('table');
  table.classList.add('character-table');

  let thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nr</th>
      <th>Description</th>
      <th>Your Score</th>
      <th>Expert Score</th>
      <th>Assessment</th>
    </tr>
  `;

  let tbody = document.createElement('tbody');

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const userScore = scores[i];
    
    // Busca o score correto para este exercício
    const correctScoreObj = correctScores.find(cs => 
      cs.exerciseId === exercise.exerciseId
    );
    
    const correctScore = correctScoreObj ? correctScoreObj.score : null;
    
    // Calcula a diferença e categoriza o resultado
    let assessment = '';
    let assessmentColor = '';
    
    if (correctScore !== null && userScore !== undefined) {
      const difference = Math.abs(userScore - correctScore);
      
      if (difference === 0) {
        assessment = 'Excellent';
        assessmentColor = '#28a745'; // Verde - excelente
      } else if (difference <= 0.5) {
        assessment = 'Very Good';
        assessmentColor = '#5cb85c'; // Verde claro - muito bom
      } else if (difference <= 1.0) {
        assessment = 'Good';
        assessmentColor = '#17a2b8'; // Azul - bom
      } else if (difference <= 1.5) {
        assessment = 'Fair';
        assessmentColor = '#ffc107'; // Amarelo - razoável
      } else if (difference <= 2.0) {
        assessment = 'Needs Work';
        assessmentColor = '#fd7e14'; // Laranja - precisa melhorar
      } else {
        assessment = 'Significant Difference';
        assessmentColor = '#dc3545'; // Vermelho - grande diferença
      }
    } else {
      assessment = 'Not Evaluated';
      assessmentColor = '#6c757d'; // Cinza - não avaliado
    }

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${exercise.name}</td>
      <td>${userScore !== undefined ? userScore.toFixed(1) : '-'}</td>
      <td>${correctScore !== null ? correctScore.toFixed(1) : '-'}</td>
      <td style="color:${assessmentColor};font-weight:bold">
        ${assessment}
      </td>
    `;
    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  resultDiv.appendChild(table);
  
  // Adiciona uma legenda para explicar as categorias
  const legend = document.createElement('div');
  legend.className = 'assessment-legend';
  legend.style.marginTop = '20px';
  legend.style.padding = '10px';
  legend.style.backgroundColor = '#f8f9fa';
  legend.style.borderRadius = '5px';
  legend.innerHTML = `
    <h4>Assessment Guide</h4>
    <ul style="list-style: none; padding-left: 0;">
      <li><span style="color:#28a745;font-weight:bold">Excellent:</span> Perfect match with expert score</li>
      <li><span style="color:#5cb85c;font-weight:bold">Very Good:</span> Within 0.5 points of expert score</li>
      <li><span style="color:#17a2b8;font-weight:bold">Good:</span> Within 1.0 point of expert score</li>
      <li><span style="color:#ffc107;font-weight:bold">Fair:</span> Within 1.5 points of expert score</li>
      <li><span style="color:#fd7e14;font-weight:bold">Needs Work:</span> Within 2.0 points of expert score</li>
      <li><span style="color:#dc3545;font-weight:bold">Significant Difference:</span> More than 2.0 points difference</li>
    </ul>
  `;
  resultDiv.appendChild(legend);
  
  resultDiv.style.display = 'block';
  
  // Scroll para a tabela de resultados
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}
