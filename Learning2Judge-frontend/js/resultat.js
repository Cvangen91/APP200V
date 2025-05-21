// Function to get sessionId from URL
function getSessionIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('sessionId');
}

// Results page specific JavaScript
document.addEventListener('DOMContentLoaded', async function() {
    const sessionId = getSessionIdFromURL();
    if (!sessionId) {
        alert('❌ Mangler sessionId i URL');
        return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
        const sessionRes = await fetch(
            `http://localhost:8000/api/user-sessions/${sessionId}`,
            {
                headers: { Authorization: `Bearer ${token}` },
            }
        );
        
        if (!sessionRes.ok) {
            throw new Error(`Erro ao carregar sessão: ${sessionRes.status}`);
        }

        const session = await sessionRes.json();
        const details = JSON.parse(session.details);

        // Atualiza os elementos da página com os dados da sessão
        document.getElementById('program-name').textContent = details.programName;
        document.getElementById('test-date').textContent = new Date(details.timestamp).toLocaleDateString('no-NO');
        document.getElementById('equipage-id').textContent = details.equipageId || 'N/A';
        
        // Atualiza as porcentagens
        document.getElementById('user-percentage').textContent = `${details.userPercentage}%`;
        document.getElementById('expert-percentage').textContent = `${details.expertPercentage}%`;
        document.getElementById('match-percentage').textContent = `${details.matchPercentage}%`;

        // Cria a tabela de comparação
        createComparisonTable(details);

    } catch (error) {
        console.error('🚨 Erro ao carregar dados:', error);
        alert('Kunne ikke laste inn resultatene. Vennligst prøv igjen senere.');
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
function createComparisonTable(details) {
    const resultDiv = document.getElementById('result-table');
    if (!resultDiv) return;

    const table = document.createElement('table');
    table.classList.add('character-table');

    let thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nr</th>
            <th>Beskrivelse</th>
            <th>Din Karakter</th>
            <th>Ekspert Karakter</th>
            <th>Vurdering</th>
        </tr>
    `;

    let tbody = document.createElement('tbody');

    for (let i = 0; i < details.exercises.length; i++) {
        const exercise = details.exercises[i];
        const userScore = details.scores[i];
        const expertScore = details.correctScores[i];
        
        // Calculate difference and categorize result
        let assessment = '';
        let assessmentColor = '';
        
        if (expertScore !== null && userScore !== undefined) {
            const difference = Math.abs(userScore - expertScore);
            
            if (difference === 0) {
                assessment = 'Utmerket';
                assessmentColor = '#28a745'; // Green - excellent
            } else if (difference <= 0.5) {
                assessment = 'Veldig God';
                assessmentColor = '#5cb85c'; // Light green - very good
            } else if (difference <= 1.0) {
                assessment = 'God';
                assessmentColor = '#17a2b8'; // Blue - good
            } else if (difference <= 1.5) {
                assessment = 'Gjennomsnittlig';
                assessmentColor = '#ffc107'; // Yellow - fair
            } else if (difference <= 2.0) {
                assessment = 'Trenger Forbedring';
                assessmentColor = '#fd7e14'; // Orange - needs improvement
            } else {
                assessment = 'Betydelig Forskjell';
                assessmentColor = '#dc3545'; // Red - significant difference
            }
        } else {
            assessment = 'Ikke Evaluert';
            assessmentColor = '#6c757d'; // Gray - not evaluated
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${exercise}</td>
            <td>${userScore !== undefined ? userScore.toFixed(1) : '-'}</td>
            <td>${expertScore !== null ? expertScore.toFixed(1) : '-'}</td>
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
        <h4>Vurderingsguide</h4>
        <ul style="list-style: none; padding-left: 0;">
            <li><span style="color:#28a745;font-weight:bold">Utmerket:</span> Perfekt samsvar med ekspertkarakter</li>
            <li><span style="color:#5cb85c;font-weight:bold">Veldig God:</span> Innen 0.5 poeng av ekspertkarakter</li>
            <li><span style="color:#17a2b8;font-weight:bold">God:</span> Innen 1.0 poeng av ekspertkarakter</li>
            <li><span style="color:#ffc107;font-weight:bold">Gjennomsnittlig:</span> Innen 1.5 poeng av ekspertkarakter</li>
            <li><span style="color:#fd7e14;font-weight:bold">Trenger Forbedring:</span> Innen 2.0 poeng av ekspertkarakter</li>
            <li><span style="color:#dc3545;font-weight:bold">Betydelig Forskjell:</span> Mer enn 2.0 poeng forskjell</li>
        </ul>
    `;
    resultDiv.appendChild(legend);
}

// Função para mostrar resultados do teste
function displayTestResults(testResult) {
    // Esconder mensagem de carregamento
    const loadingEl = document.getElementById('loading');
    if (loadingEl) loadingEl.style.display = 'none';
    
    // Mostrar contêiner de resultados
    const resultContainer = document.getElementById('result-container');
    if (resultContainer) resultContainer.style.display = 'block';
    
    // Preencher cabeçalho
    const testDate = document.getElementById('test-date');
    if (testDate) testDate.textContent = testResult.date;
    const testProgram = document.getElementById('test-program');
    if (testProgram) testProgram.textContent = testResult.programName;
    
    // Preencher porcentagens
    const userPercentage = document.getElementById('user-percentage');
    if (userPercentage) userPercentage.textContent = `${testResult.userPercentage}%`;
    const expertPercentage = document.getElementById('expert-percentage');
    if (expertPercentage) expertPercentage.textContent = `${testResult.expertPercentage}%`;
    const matchPercentage = document.getElementById('match-percentage');
    if (matchPercentage) matchPercentage.textContent = `${testResult.matchPercentage}%`;
    
    // Definir classe para match percentage
    if (matchPercentage) {
      if (parseFloat(testResult.matchPercentage) >= 95) {
          matchPercentage.className = 'score-excellent percentage';
      } else if (parseFloat(testResult.matchPercentage) >= 85) {
          matchPercentage.className = 'score-good percentage';
      } else {
          matchPercentage.className = 'score-needs-work percentage';
      }
    }
    
    // Criar tabela de comparação
    const resultTableDiv = document.getElementById('result-table');
    if (!resultTableDiv) return;
    // Limpa apenas o conteúdo dinâmico, mantendo o h3
    resultTableDiv.querySelectorAll('table, .legend, .assessment-legend').forEach(el => el.remove());
    
    // Criar tabela
    const table = document.createElement('table');
    table.className = 'comparison-table character-table';
    
    // Adicionar cabeçalho da tabela
    const thead = document.createElement('thead');
    thead.innerHTML = `
        <tr>
            <th>Nr</th>
            <th>Øvelse</th>
            <th>Din karakter</th>
            <th>Ekspertens karakter</th>
            <th>Forskjell</th>
            <th>Vurdering</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Criar corpo da tabela
    const tbody = document.createElement('tbody');
    
    // Adicionar linhas para cada exercício
    for (let i = 0; i < testResult.exercises.length; i++) {
        const row = document.createElement('tr');
        
        const userScore = testResult.scores[i];
        const expertScore = testResult.correctScores[i];
        const diff = Math.abs(userScore - expertScore);
        
        // Determinar a classe da avaliação
        let assessmentClass = '';
        let assessment = '';
        
        if (diff === 0) {
            assessment = 'Perfekt';
            assessmentClass = 'excellent';
        } else if (diff <= 0.5) {
            assessment = 'Veldig bra';
            assessmentClass = 'very-good';
        } else if (diff <= 1.0) {
            assessment = 'Bra';
            assessmentClass = 'good';
        } else if (diff <= 1.5) {
            assessment = 'Ok';
            assessmentClass = 'fair';
        } else if (diff <= 2.0) {
            assessment = 'Trenger forbedring';
            assessmentClass = 'needs-work';
        } else {
            assessment = 'Stor forskjell';
            assessmentClass = 'significant-diff';
        }
        
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${testResult.exercises[i]}</td>
            <td>${userScore.toFixed(1)}</td>
            <td>${expertScore.toFixed(1)}</td>
            <td>${diff.toFixed(1)}</td>
            <td class="${assessmentClass}">${assessment}</td>
        `;
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    resultTableDiv.appendChild(table);
    
    // Adicionar legenda
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = `
        <h4>Vurderingsguide</h4>
        <ul>
            <li><span class="excellent">Perfekt:</span> Samme karakter som ekspert</li>
            <li><span class="very-good">Veldig bra:</span> Forskjell på maks 0,5 poeng</li>
            <li><span class="good">Bra:</span> Forskjell på maks 1,0 poeng</li>
            <li><span class="fair">Ok:</span> Forskjell på maks 1,5 poeng</li>
            <li><span class="needs-work">Trenger forbedring:</span> Forskjell på maks 2,0 poeng</li>
            <li><span class="significant-diff">Stor forskjell:</span> Mer enn 2,0 poeng forskjell</li>
        </ul>
    `;
    resultTableDiv.appendChild(legend);
} 