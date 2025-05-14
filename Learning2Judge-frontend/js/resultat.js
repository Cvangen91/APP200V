// Results page specific JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    // Get test index and session ID from localStorage
    const testIndex = localStorage.getItem('selectedTestIndex');
    const sessionId = localStorage.getItem('selectedSessionId');
    
    try {
        let testResult;
        
        // Se temos um sessionId, tentamos buscar do backend primeiro
        if (sessionId) {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) throw new Error('Usuário não autenticado');
                
                // Buscar a sessão do backend
                const sessionRes = await fetch(`http://localhost:8000/api/user-sessions/${sessionId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (!sessionRes.ok) {
                    throw new Error(`Erro ao buscar sessão: ${sessionRes.status}`);
                }
                
                const session = await sessionRes.json();
                
                // Verificar se temos detalhes na sessão
                if (session.details) {
                    // Temos os detalhes completos
                    const details = JSON.parse(session.details);
                    testResult = {
                        ...details,
                        sessionId,
                        date: new Date(session.timestamp || details.timestamp).toLocaleDateString('no-NO')
                    };
                } else {
                    // Buscar os scores individualmente
                    const scoresRes = await fetch(`http://localhost:8000/api/user-scores/session/${sessionId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (!scoresRes.ok) {
                        throw new Error(`Erro ao buscar scores: ${scoresRes.status}`);
                    }
                    
                    const scores = await scoresRes.json();
                    
                    if (!scores || scores.length === 0) {
                        throw new Error('Nenhum score encontrado para esta sessão');
                    }
                    
                    // Buscar informações do programa
                    const programRes = await fetch(`http://localhost:8000/api/programs/${session.programId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (!programRes.ok) {
                        throw new Error(`Erro ao buscar programa: ${programRes.status}`);
                    }
                    
                    const program = await programRes.json();
                    
                    // Calcular as porcentagens
                    let totalUserScore = 0;
                    let totalExpertScore = 0;
                    let totalMatch = 0;
                    
                    scores.forEach(score => {
                        const userScore = parseFloat(score.userScore);
                        const expertScore = parseFloat(score.expertScore);
                        
                        totalUserScore += userScore;
                        totalExpertScore += expertScore;
                        
                        // Calcular o match
                        const match = 100 - (Math.abs(userScore - expertScore) / 10 * 100);
                        totalMatch += match;
                    });
                    
                    const userPercentage = (totalUserScore / (scores.length * 10) * 100).toFixed(1);
                    const expertPercentage = (totalExpertScore / (scores.length * 10) * 100).toFixed(1);
                    const matchPercentage = (totalMatch / scores.length).toFixed(1);
                    
                    testResult = {
                        sessionId,
                        programId: session.programId,
                        programName: program.name,
                        equipageId: program.equipageId,
                        date: new Date(session.timestamp).toLocaleDateString('no-NO'),
                        userPercentage,
                        expertPercentage,
                        matchPercentage,
                        scores: scores.map(s => parseFloat(s.userScore)),
                        exercises: scores.map(s => s.exerciseName),
                        correctScores: scores.map(s => parseFloat(s.expertScore))
                    };
                }
                
                console.log('Dados recuperados do backend:', testResult);
            } catch (error) {
                console.error('Erro ao buscar do backend, tentando backup:', error);
                // Falha ao buscar do backend, tentamos o backup do localStorage
                testResult = null;
            }
        }
        
        // Se não conseguimos do backend, usamos os dados do localStorage
        if (!testResult) {
            console.log('Usando dados do localStorage');
            
            // Tentar usar os resultados processados primeiro
            const processedResults = JSON.parse(localStorage.getItem('processedResults') || '[]');
            
            if (processedResults.length > 0 && testIndex < processedResults.length) {
                testResult = processedResults[testIndex];
            } else {
                // Tentar usar os resultados brutos
                const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
                
                if (testResults.length === 0 || testIndex >= testResults.length) {
                    showError('Test data not found');
                    return;
                }
                
                testResult = testResults[testIndex];
            }
        }
        
        // Display test information
        displayTestInfo(testResult);
        
        // Create detailed comparison table
        createComparisonTable(testResult);
    } catch (error) {
        console.error('Error loading test result:', error);
        showError(`Error loading test result: ${error.message}`);
    }
});

// Display error message
function showError(message) {
    const container = document.getElementById('result-container');
    container.innerHTML = `
        <div class="card text-center" style="padding: 30px; margin: 30px auto">
            <i class="fas fa-exclamation-triangle fa-3x mb-3" style="color: var(--danger)"></i>
            <h3>Error Loading Results</h3>
            <p>${message}</p>
            <a href="myprofile.html" class="btn mt-3"><i class="fas fa-arrow-left"></i> Back to Profile</a>
        </div>
    `;
}

// Display test information (program, date, percentages)
function displayTestInfo(testResult) {
    document.getElementById('program-name').textContent = testResult.programName;
    document.getElementById('test-date').textContent = testResult.date;
    document.getElementById('equipage-id').textContent = testResult.equipageId || 'N/A';
    
    const userPercentageElement = document.getElementById('user-percentage');
    const expertPercentageElement = document.getElementById('expert-percentage');
    const matchPercentageElement = document.getElementById('match-percentage');
    
    userPercentageElement.textContent = `${testResult.userPercentage}%`;
    expertPercentageElement.textContent = `${testResult.expertPercentage}%`;
    matchPercentageElement.textContent = `${testResult.matchPercentage}%`;
    
    // Add color classes based on match percentage
    const matchPercentage = parseFloat(testResult.matchPercentage);
    if (matchPercentage >= 95) {
        matchPercentageElement.classList.add('success');
    } else if (matchPercentage >= 85) {
        matchPercentageElement.classList.add('warning');
    } else {
        matchPercentageElement.classList.add('danger');
    }
}

// Create the detailed comparison table
function createComparisonTable(testResult) {
    const resultTableDiv = document.getElementById('result-table');
    
    // Create table element
    const table = document.createElement('table');
    table.classList.add('character-table');
    
    // Create table header
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nr</th>
            <th>Description</th>
            <th>Your Score</th>
            <th>Expert Score</th>
            <th>Assessment</th>
        </tr>
    `;
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Get the exercises, user scores, and correct scores
    const exercises = testResult.exercises || [];
    const userScores = testResult.scores || [];
    const correctScores = testResult.correctScores || [];
    
    // Add rows for each exercise
    for (let i = 0; i < exercises.length; i++) {
        if (userScores[i] === undefined) continue;
        
        const row = document.createElement('tr');
        
        // Calculate assessment
        const userScore = userScores[i];
        const correctScore = correctScores[i];
        const difference = Math.abs(userScore - correctScore);
        
        let assessment = '';
        let assessmentColor = '';
        
        if (difference === 0) {
            assessment = 'Excellent';
            assessmentColor = '#28a745';
        } else if (difference <= 0.5) {
            assessment = 'Very Good';
            assessmentColor = '#5cb85c';
        } else if (difference <= 1.0) {
            assessment = 'Good';
            assessmentColor = '#17a2b8';
        } else if (difference <= 1.5) {
            assessment = 'Fair';
            assessmentColor = '#ffc107';
        } else if (difference <= 2.0) {
            assessment = 'Needs Work';
            assessmentColor = '#fd7e14';
        } else {
            assessment = 'Significant Difference';
            assessmentColor = '#dc3545';
        }
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${exercises[i]}</td>
            <td>${userScore.toFixed(1)}</td>
            <td>${correctScore.toFixed(1)}</td>
            <td style="color:${assessmentColor};font-weight:bold">
                ${assessment}
            </td>
        `;
        
        tbody.appendChild(row);
    }
    
    // Add table to page
    table.appendChild(thead);
    table.appendChild(tbody);
    
    // Clear existing content and add table
    resultTableDiv.innerHTML = '<h3 class="text-center mb-3">Detailed Score Comparison</h3>';
    resultTableDiv.appendChild(table);
    
    // Add assessment legend
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
    resultTableDiv.appendChild(legend);
} 