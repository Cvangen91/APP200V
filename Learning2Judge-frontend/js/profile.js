// Profile page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const profileContent = document.getElementById('profile-content');
    
    // Load profile data if user is authenticated
    function loadProfileData() {
        // Get username from localStorage to personalize greeting
        const username = localStorage.getItem('username');
        
        // For now, just show a welcome message
        // This will be replaced with real API data in production
        const nameElement = document.getElementById('name');
        if (nameElement && username) {
            // Personalize with the logged-in username
            nameElement.textContent = username;
        }
        
        // Load test results from backend
        loadTestResults();
    }
    
    // Função auxiliar para calcular a idade
    function calculateAge(birthDate) {
        try {
            const today = new Date();
            
            // Verificar se a data é válida
            if (isNaN(birthDate.getTime())) {
                return 'Ugyldig dato';
            }

            // Verificar se a data de nascimento está no futuro
            if (birthDate > today) {
                return 'Fremtidig dato';
            }
            
            // Calcular a idade
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            // Ajustar a idade se o aniversário ainda não ocorreu este ano
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            // Verificar se a idade é razoável
            if (age < 0 || age > 120) {
                return 'Ugyldig alder';
            }
            
            return age;
        } catch (error) {
            return 'Beregningsfeil';
        }
    }
    
    // Load and display test results from backend
    async function loadTestResults() {
        const token = localStorage.getItem('access_token');
        const testsTable = document.getElementById('completeTestsTable');
        if (!testsTable) return;
        
        const tableBody = testsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        try {
            // Show charging indicator
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p style="padding: 20px;">
                            <i class="fas fa-spinner fa-spin"></i> Laster testresultater...
                        </p>
                    </td>
                </tr>
            `;
            
            // Load user sessions from the backend
            const sessionsRes = await fetch(`http://localhost:8000/api/user-sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!sessionsRes.ok) {
                throw new Error(`Error loading session: ${sessionsRes.status} ${sessionsRes.statusText}`);
            }
            
            let sessions = await sessionsRes.json();
            
            // Check if an empty array is returned
            if (!sessions || sessions.length === 0) {
                // There are no results in the database
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <p style="padding: 20px;">
                                <i class="fas fa-info-circle"></i> Ingen testresultater er registrert ennå. 
                                <a href="program.html">Gå til programmer</a> for å starte din første test.
                            </p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            console.log('Session:', sessions);
            
            // Process session results
            const results = [];
            
            // Process each session to extract details
            for (const session of sessions) {
                try {
                    // Check if we have details in the session
                    if (session.details) {
                        const details = JSON.parse(session.details);
                        
                        // Add session information that is not in the details
                        results.push({
                            ...details,
                            sessionId: session.userSessionId,
                            date: new Date(session.timestamp || details.timestamp).toLocaleDateString('no-NO'),
                            timestamp: session.timestamp || details.timestamp
                        });
                    } else {
                        // If we don't have full details, we'll look for individual scores.
                        const scoresRes = await fetch(
                            `http://localhost:8000/api/user-scores/session/${session.userSessionId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (!scoresRes.ok) continue;
                        
                        const scores = await scoresRes.json();
                        if (!scores || scores.length === 0) continue;
                        
                        // Search for program information
                        const programRes = await fetch(
                            `http://localhost:8000/api/programs/${session.programId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (!programRes.ok) continue;
                        
                        const program = await programRes.json();
                        
                        // Calculate the scores
                        let totalUserScore = 0;
                        let totalExpertScore = 0;
                        let totalMatch = 0;
                        
                        scores.forEach(score => {
                            const userScore = parseFloat(score.userScore);
                            const expertScore = parseFloat(score.expertScore);
                            
                            totalUserScore += userScore;
                            totalExpertScore += expertScore;
                            
                            // Calculate and match the scores
                            const match = 100 - (Math.abs(userScore - expertScore) / 10 * 100);
                            totalMatch += match;
                        });
                        
                        const userPercentage = (totalUserScore / (scores.length * 10) * 100).toFixed(1);
                        const expertPercentage = (totalExpertScore / (scores.length * 10) * 100).toFixed(1);
                        const matchPercentage = (totalMatch / scores.length).toFixed(1);
                        
                        results.push({
                            sessionId: session.userSessionId,
                            programId: session.programId,
                            programName: program.name,
                            equipageId: program.equipageId,
                            date: new Date(session.timestamp).toLocaleDateString('no-NO'),
                            timestamp: session.timestamp,
                            userPercentage,
                            expertPercentage,
                            matchPercentage,
                            scores: scores.map(s => parseFloat(s.userScore)),
                            exercises: scores.map(s => s.exerciseName),
                            correctScores: scores.map(s => parseFloat(s.expertScore))
                        });
                    }
                } catch (error) {
                    console.error(`Error ${session.userSessionId}:`, error);
                }
            }
            
            if (results.length === 0) {
                // If we are unable to process any sessions
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <p style="padding: 20px;">
                                <i class="fas fa-exclamation-circle"></i> Kunne ikke behandle testresultatene.
                            </p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            processTestResults(results);
            
        } catch (error) {
            console.error('Error loading the testresults:', error);
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p style="padding: 20px;">
                            <i class="fas fa-exclamation-triangle"></i> Feil ved lasting av testresultater: ${error.message}
                        </p>
                    </td>
                </tr>
            `;
        }
    }
    
    // Function to process test results
    function processTestResults(testResults) {
        const testsTable = document.getElementById('completeTestsTable');
        if (!testsTable) return;
        
        const tableBody = testsTable.querySelector('tbody');
        
        // Check for results
        if (!testResults || testResults.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p style="padding: 20px;">
                            <i class="fas fa-info-circle"></i> Ingen testresultater er registrert ennå. 
                            <a href="program.html">Gå til programmer</a> for å starte din første test.
                        </p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = '';
        
        // Sort results by date, newest first
        testResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Add rows for each result
        testResults.forEach((result, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.date}</td>
                <td>${result.programName}</td>
                <td>${result.equipageId || 'N/A'}</td>
                <td><span class="badge">${result.userPercentage} %</span></td>
                <td>${result.expertPercentage} %</td>
                <td><span class="badge ${getMatchClass(result.matchPercentage)}">${result.matchPercentage} %</span></td>
                <td><button class="btn btn-sm protokollBtn" data-index="${index}" data-session-id="${result.sessionId || ''}">Vis protokoll</button></td>
            `;
            tableBody.appendChild(row);
        });
        
        // Save the index of the current result for reference
        window.currentResults = testResults;
        
        // Update statistics
        updateStatistics(testResults);
        
        addProtocolButtonListeners(testResults);
    }
    
    // Helper function to determine badge class based on match percentage
    function getMatchClass(matchPercentage) {
        const match = parseFloat(matchPercentage);
        if (match >= 95) return 'success';
        if (match >= 85) return 'warning';
        return 'danger';
    }
    
    // Calculate and update statistics
    function updateStatistics(testResults) {
        // Update stats overview
        const statValues = document.querySelectorAll('.stat-value');
        
        if (testResults.length === 0) {
            if (statValues.length >= 3) {
                statValues[0].textContent = '-';
                statValues[1].textContent = '0';
                statValues[2].textContent = '0';
            }
            
            // Clear category table and show message
            const statsTable = document.getElementById('statsTable');
            if (statsTable) {
                const tableBody = statsTable.querySelector('tbody');
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="2" class="text-center">
                            <p style="padding: 15px;"><i class="fas fa-chart-bar"></i> Ingen statistikk tilgjengelig ennå.</p>
                        </td>
                    </tr>
                `;
            }
            
            return;
        }
        
        // Calculate average match
        let totalMatch = 0;
        testResults.forEach(result => {
            totalMatch += parseFloat(result.matchPercentage);
        });
        const averageMatch = (totalMatch / testResults.length).toFixed(1);
        
        if (statValues.length >= 3) {
            statValues[0].textContent = `${averageMatch}%`;
            statValues[1].textContent = testResults.length;
            
            // Calculate total exercises judged
            let totalExercises = 0;
            testResults.forEach(result => {
                totalExercises += result.scores.filter(s => s !== undefined).length;
            });
            statValues[2].textContent = totalExercises;
        }
        
        // Update accuracy table by category
        updateCategoryAccuracy(testResults);
    }
    
    // New function to calculate and display accuracy by category
    function updateCategoryAccuracy(testResults) {
        // Predefined categories (in a real application this would be fetched from the backend)
        const categories = [
            { id: 1, name: 'Skritt' },
            { id: 2, name: 'Trav' },
            { id: 3, name: 'Galopp' },
            { id: 4, name: 'Allment inntrykk' }
        ];
        
        // Initialize counters by category
        const categoryStats = {};
        categories.forEach(cat => {
            categoryStats[cat.name] = {
                totalMatch: 0,
                count: 0
            };
        });
        
        // For demonstration purposes, we will distribute the exercises across categories
        testResults.forEach(result => {
            if (!result.exercises || !result.scores || !result.correctScores) return;
            
            // Distribute the exercises among the categories
            result.exercises.forEach((exerciseName, index) => {
                if (result.scores[index] === undefined) return;
                
                // Determines category based on exercise name (simplified)
                let category = 'Allment inntrykk'; 
                
                if (exerciseName.toLowerCase().includes('skritt')) {
                    category = 'Skritt';
                } else if (exerciseName.toLowerCase().includes('trav')) {
                    category = 'Trav';
                } else if (exerciseName.toLowerCase().includes('galopp')) {
                    category = 'Galopp';
                }
                
                // Calculate the match for this exercise
                const userScore = result.scores[index];
                const correctScore = result.correctScores[index];
                const match = 100 - (Math.abs(userScore - correctScore) / 10 * 100);
                
                // Adds to category totals
                if (categoryStats[category]) {
                    categoryStats[category].totalMatch += match;
                    categoryStats[category].count++;
                }
            });
        });
        
        // Calculate percentages and update the table
        const statsTable = document.getElementById('statsTable');
        if (!statsTable) return;
        
        const tableBody = statsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        categories.forEach(category => {
            const stats = categoryStats[category.name];
            
            // If there is no data for this category, use a default value.
            const accuracy = stats.count > 0 
                ? (stats.totalMatch / stats.count).toFixed(1) 
                : 'N/A';
            
            // Determine the width of the progress bar
            const progressWidth = stats.count > 0 
                ? `${Math.min((stats.totalMatch / stats.count), 100)}%` 
                : '0%';
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.name}</td>
                <td>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${progressWidth}"></div>
                        <span>${accuracy !== 'N/A' ? accuracy + '%' : accuracy}</span>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }
    
    // Update UI with profile data
    function updateProfileUI(data) {
        // Implementation would be used with real backend data
    }
    
    // Add event listeners to protocol buttons
    function addProtocolButtonListeners(testResults) {
        const protocolButtons = document.querySelectorAll('.protokollBtn');
        
        protocolButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sessionId = this.getAttribute('data-session-id');
                
                if (!sessionId) {
                    console.error('No session ID found on button');
                    return;
                }
                
                // Redirect to result page with session ID
                window.location.href = `resultat.html?sessionId=${sessionId}`;
            });
        });
    }
    
    // Função para salvar as alterações do perfil
    async function saveProfileChanges(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const email = document.getElementById('profile-email').value;
        const name = document.getElementById('profile-name').value;
        const newPassword = document.getElementById('profile-password').value;
        const confirmPassword = document.getElementById('profile-password-confirm').value;

        // Validar senha se fornecida
        if (newPassword) {
            if (newPassword !== confirmPassword) {
                alert('As senhas não coincidem');
                return;
            }
            if (newPassword.length < 8) {
                alert('A senha deve ter pelo menos 8 caracteres');
                return;
            }
        }

        try {
            const updateData = {
                email,
                name
            };

            if (newPassword) {
                updateData.password = newPassword;
            }

            const response = await fetch('http://localhost:8000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('Falha ao atualizar perfil');
            }

            // Limpar campos de senha
            document.getElementById('profile-password').value = '';
            document.getElementById('profile-password-confirm').value = '';

            // Atualizar nome na interface
            const nameElement = document.getElementById('name');
            if (nameElement) nameElement.textContent = name;

            alert('Perfil atualizado com sucesso!');
            
        } catch (error) {
            console.error('Erro ao atualizar perfil:', error);
            alert('Erro ao atualizar perfil. Por favor, tente novamente.');
        }
    }
    
    // Initialize the page
    function init() {
        // Verificar se o usuário está autenticado
        const token = localStorage.getItem('access_token');
        if (token) {
            // Carregar dados do perfil
            loadProfileData();
            
            // Configurar listeners para as tabs
            const tabLinks = document.querySelectorAll('.tab-nav li');
            const tabContents = document.querySelectorAll('.tab-pane');
            
            tabLinks.forEach(tab => {
                tab.addEventListener('click', function() {
                    // Remover classe active de todas as tabs
                    tabLinks.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Adicionar classe active na tab clicada
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });

            // Configurar listener para o formulário de configurações
            const profileSettingsForm = document.getElementById('profile-settings-form');
            if (profileSettingsForm) {
                profileSettingsForm.addEventListener('submit', saveProfileChanges);
            }
        }
    }
    
    // Inicializar a página
    init();
});