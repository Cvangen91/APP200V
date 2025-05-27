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
    
    // Process correct scores to map each exercise
    correctScores = [];
    
    // If no scores found in database, create empty array
    if (!rawCorrectScores || rawCorrectScores.length === 0) {
      console.warn('No correct scores found for this program');
    }
    
    // Map program exercises
    exercises = program.exercises.map((exerciseId, index) => {
      const exerciseDetails = allExercises.find(ex => ex.exerciseId === exerciseId);
      
      // Find correct score for this exercise
      const correctScore = rawCorrectScores.find(cs => cs.exerciseId === exerciseId);
      
      // If found, add to correct scores array
      if (correctScore) {
        correctScores.push(correctScore);
      }
      
      return {
        exerciseId: exerciseId,
        correctScoreId: correctScore ? correctScore.programScoreId : null,
        name: exerciseDetails ? exerciseDetails.name : `Exercise ID ${exerciseId}`
      };
    });

    createTable();
  } catch (error) {
    console.error('🚨 Error cant find scores', error);
  }

  const titleEl = document.getElementById('program-title');
  if (titleEl) {  
    titleEl.innerHTML = `<i class="fas fa-tasks"></i> Program: ${program.name}`;
  }

  const videoContainer = document.getElementById('video-container');
  if (videoContainer && program && program.videoPath) {
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

  // Adds the element to the results table if it does not exist
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

  // Clear container before adding table
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
    
    // Add listener for Tab to ensure all inputs are processed
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

  // Mark input as completed
  input.style.backgroundColor = '#e6ffe6'; // Light green to indicate filled
  // Hides the entire line (tr) of the filled field
  setTimeout(() => {
    const tr = input.closest('tr');
    if (tr) tr.style.display = 'none';
  }, 200); // Small delay for visual feedback
  
  // Move to next input on Enter
  const allInputs = document.querySelectorAll('.score-input');
  const currentIndex = Array.from(allInputs).indexOf(input);
  
  if (currentIndex < allInputs.length - 1) {
    // More inputs to fill, move to next
    allInputs[currentIndex + 1].focus();
  } else {
    // Last input filled, check if all are completed
    const allFilled = Array.from(allInputs).every(inp => inp.value.trim() !== '');
    
    if (allFilled && !document.getElementById('finish-button')) {
      // All exercises evaluated, show finish button
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
  // Hides other main screen elements
  const videoContainer = document.getElementById('video-container');
  if (videoContainer) videoContainer.style.display = 'none';
  const resultTable = document.getElementById('result-table');
  if (resultTable) resultTable.style.display = 'none';
  const titleEl = document.getElementById('program-title');
  if (titleEl) titleEl.style.display = 'none';

  const token = localStorage.getItem('access_token');
  const programId = getProgramIdFromURL();

  try {
    // Calculate percentages before saving
    const { userPercentage, expertPercentage, matchPercentage } = calculateScorePercentages();
    console.log('User Score %:', userPercentage);
    console.log('Expert Score %:', expertPercentage);
    console.log('Match %:', matchPercentage);
    
    // Create object with detailed results
    const testDetails = {
      programId: programId,
      programName: program.name,
      equipageId: program.equipageId || null,
      userPercentage: userPercentage,
      expertPercentage: expertPercentage,
      matchPercentage: matchPercentage,
      exercises: exercises.map(e => e.name),
      correctScores: correctScores.map(cs => cs.score),
      scores: [...scores],
      timestamp: new Date().toISOString()
    };
    
    // Create userSession in backend - using snake_case for API validation compatibility
    const sessionRes = await fetch(`http://localhost:8000/api/user-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        program_id: parseInt(programId),
        details: JSON.stringify(testDetails)
      }),
    });
    
    if (!sessionRes.ok) {
      console.error('Erro ao criar sessão:', sessionRes.status, sessionRes.statusText);
      try {
        const errorText = await sessionRes.text();
        console.error('Resposta de erro:', errorText);
      } catch (e) {}
      throw new Error(`Erro ao criar sessão: ${sessionRes.status} ${sessionRes.statusText}`);
    }

    const session = await sessionRes.json();
    const userSessionId = session.userSessionId;
    
    // Show success message after saving
    const successMsg = document.getElementById('success-message');
    successMsg.innerHTML = `
      <i class=\"fas fa-check-circle fa-4x mb-3\" style=\"color: var(--secondary)\"></i>
      <h3>Program fullført!</h3>
      <p>Din bedømmelse er lagret. Hva vil du gjøre nå?</p>
      <div class=\"mt-3\">
        <button id=\"try-again-btn\" class=\"btn btn-outline\"><i class=\"fas fa-redo\"></i> Prøv igjen</button>
        <button id=\"see-results-btn\" class=\"btn\"><i class=\"fas fa-chart-bar\"></i> Se sammenligning</button>
      </div>
    `;
    successMsg.style.display = 'block';

    // Add listeners to buttons
    document.getElementById('try-again-btn').onclick = function() {
      location.reload();
    };
    document.getElementById('see-results-btn').onclick = function() {
      window.location.href = `resultat.html?sessionId=${userSessionId}`;
    };
  } catch (error) {
    console.error('Error:', error);
    
    let errorMessage = 'Error saving assessment data.';
    
    if (error.message.includes('422')) {
      errorMessage = 'Validation error. Please try again.';
    } else if (error.message.includes('500')) {
      errorMessage = 'Internal server error. Please try again later.';
    }
    
    alert(errorMessage);
    
    // Show error message
    const successMsg = document.getElementById('success-message');
    if (successMsg) {
      successMsg.innerHTML = `
        <i class="fas fa-exclamation-triangle fa-4x mb-3" style="color: var(--danger)"></i>
        <h3>Error saving scores</h3>
        <p>${errorMessage}</p>
        <p>Please try again later.</p>
        <div class="mt-3">
          <a href="myprofile.html" class="btn btn-outline"><i class="fas fa-user"></i> Gå til din profil</a>
          <button onclick="location.reload()" class="btn"><i class="fas fa-sync"></i> Prøv på nytt</button>
        </div>
      `;
      successMsg.style.display = 'block';
    }
  }
}

// Function to calculate the percentages of success
function calculateScorePercentages() {
  let totalUserScore = 0;
  let totalExpertScore = 0;
  let totalPossibleScore = 0;
  let totalMatch = 0;
  let countedExercises = 0;
  
  for (let i = 0; i < exercises.length; i++) {
    const userScore = scores[i];
    if (userScore === undefined) continue;
    
    // Find correct score for this exercise
    const correctScoreObj = correctScores.find(cs => 
      cs.exerciseId === exercises[i].exerciseId
    );
    
    if (!correctScoreObj) continue;
    
    const expertScore = correctScoreObj.score;
    
    // Add to totals
    totalUserScore += userScore;
    totalExpertScore += expertScore;
    totalPossibleScore += 10; // Maximum score per exercise is 10
    
    // Calculate match (closer to 100% is better)
    const match = 100 - (Math.abs(userScore - expertScore) / 10 * 100);
    totalMatch += match;
    
    countedExercises++;
  }
  
  // Calculate percentages
  const userPercentage = (totalUserScore / (countedExercises * 10)) * 100;
  const expertPercentage = (totalExpertScore / (countedExercises * 10)) * 100;
  const matchPercentage = totalMatch / countedExercises;
  
  return {
    userPercentage: userPercentage.toFixed(1),
    expertPercentage: expertPercentage.toFixed(1),
    matchPercentage: matchPercentage.toFixed(1)
  };
}

function showComparison() {
  const resultDiv = document.getElementById('result-table');
  if (!resultDiv) {
    console.error('Result-table element not found!');
    return;
  }
  
  resultDiv.innerHTML = '<h3 class="text-center mb-3">Sammenlinging av resultat</h3>';

  const table = document.createElement('table');
  table.classList.add('character-table');

  let thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Nr</th>
      <th>Beskrivelse</th>
      <th>Din karakter</th>
      <th>Fasit</th>
      <th>Status</th>
    </tr>
  `;

  let tbody = document.createElement('tbody');

  for (let i = 0; i < exercises.length; i++) {
    const exercise = exercises[i];
    const userScore = scores[i];
    
    // Find correct score for this exercise
    const correctScoreObj = correctScores.find(cs => 
      cs.exerciseId === exercise.exerciseId
    );
    
    const correctScore = correctScoreObj ? correctScoreObj.score : null;
    
    // Calculate difference and categorize result
    let assessment = '';
    let assessmentColor = '';
    
    if (correctScore !== null && userScore !== undefined) {
      const difference = Math.abs(userScore - correctScore);
      
      if (difference === 0) {
        assessment = 'Excellent';
        assessmentColor = '#28a745'; // Green - excellent
      } else if (difference <= 0.5) {
        assessment = 'Very Good';
        assessmentColor = '#5cb85c'; // Light green - very good
      } else if (difference <= 1.0) {
        assessment = 'Good';
        assessmentColor = '#17a2b8'; // Blue - good
      } else if (difference <= 1.5) {
        assessment = 'Fair';
        assessmentColor = '#ffc107'; // Yellow - fair
      } else if (difference <= 2.0) {
        assessment = 'Needs Work';
        assessmentColor = '#fd7e14'; // Orange - needs improvement
      } else {
        assessment = 'Significant Difference';
        assessmentColor = '#dc3545'; // Red - significant difference
      }
    } else {
      assessment = 'Not Evaluated';
      assessmentColor = '#6c757d'; // Gray - not evaluated
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
  
  // Add legend to explain categories
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
  
  // Scroll to results table
  resultDiv.scrollIntoView({ behavior: 'smooth' });
}
