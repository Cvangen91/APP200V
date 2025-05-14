// Profile page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const profileContent = document.getElementById('profile-content');
    
    // Load profile data if user is authenticated
    function loadProfileData() {
        // Get username from localStorage to personalize greeting
        const username = localStorage.getItem('username');
        
        // In a real application, you would fetch the user's profile data
        // from the backend using the authFetch helper
        /*
        window.auth.authFetch('http://localhost:8000/api/profile/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load profile data');
                }
                return response.json();
            })
            .then(data => {
                // Update profile with fetched data
                updateProfileUI(data);
            })
            .catch(error => {
                console.error('Error loading profile data:', error);
                // Show error message in profile content
                profileContent.innerHTML = `
                    <div class="error-message">
                        <h2>Feil ved lasting av profildata</h2>
                        <p>${error.message}</p>
                    </div>
                `;
            });
        */
        
        // For now, just show a welcome message
        // This will be replaced with real API data in production
        const nameElement = document.getElementById('name');
        if (nameElement && username) {
            // Personalize with the logged-in username
            nameElement.textContent = username;
        }
        
        // Load test results from localStorage
        loadTestResults();
    }
    
    // Load and display test results from localStorage
    function loadTestResults() {
        const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
        
        // Update the completed tests table
        const testsTable = document.getElementById('completeTestsTable');
        if (!testsTable) return;
        
        const tableBody = testsTable.querySelector('tbody');
        
        // Clear existing dummy rows
        tableBody.innerHTML = '';
        
        if (testResults.length === 0) {
            console.log('No test results found in localStorage');
            // Exibir mensagem indicando que não há resultados
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
        
        console.log('Found test results:', testResults);
        
        // Sort results by date, newest first
        testResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // Add test result rows
        testResults.forEach((result, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${result.date}</td>
                <td>${result.programName}</td>
                <td>${result.equipageId || 'N/A'}</td>
                <td><span class="badge">${result.userPercentage} %</span></td>
                <td>${result.expertPercentage} %</td>
                <td><span class="badge ${getMatchClass(result.matchPercentage)}">${result.matchPercentage} %</span></td>
                <td><button class="btn btn-sm protokollBtn" data-index="${index}">Vis protokoll</button></td>
            `;
            tableBody.appendChild(row);
        });
        
        // Update statistics if available
        updateStatistics(testResults);
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
            // Se não houver resultados, mostrar traços
            if (statValues.length >= 3) {
                statValues[0].textContent = '-';
                statValues[1].textContent = '0';
                statValues[2].textContent = '0';
            }
            
            // Limpar tabela de categorias e mostrar mensagem
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
        
        // Atualizar a tabela de precisão por categoria
        updateCategoryAccuracy(testResults);
    }
    
    // Nova função para calcular e exibir a precisão por categoria
    function updateCategoryAccuracy(testResults) {
        // Categorias predefinidas (em uma aplicação real, isso seria obtido do backend)
        const categories = [
            { id: 1, name: 'Skritt' },
            { id: 2, name: 'Trav' },
            { id: 3, name: 'Galopp' },
            { id: 4, name: 'Allment inntrykk' }
        ];
        
        // Inicializar contadores por categoria
        const categoryStats = {};
        categories.forEach(cat => {
            categoryStats[cat.name] = {
                totalMatch: 0,
                count: 0
            };
        });
        
        // Para fins de demonstração, vamos distribuir os exercícios pelas categorias
        testResults.forEach(result => {
            if (!result.exercises || !result.scores || !result.correctScores) return;
            
            // Distribuir os exercícios entre as categorias
            result.exercises.forEach((exerciseName, index) => {
                if (result.scores[index] === undefined) return;
                
                // Determina a categoria com base no nome do exercício (simplificado)
                let category = 'Allment inntrykk'; // Padrão
                
                if (exerciseName.toLowerCase().includes('skritt')) {
                    category = 'Skritt';
                } else if (exerciseName.toLowerCase().includes('trav')) {
                    category = 'Trav';
                } else if (exerciseName.toLowerCase().includes('galopp')) {
                    category = 'Galopp';
                }
                
                // Calcula o match para este exercício
                const userScore = result.scores[index];
                const correctScore = result.correctScores[index];
                const match = 100 - (Math.abs(userScore - correctScore) / 10 * 100);
                
                // Adiciona aos totais da categoria
                if (categoryStats[category]) {
                    categoryStats[category].totalMatch += match;
                    categoryStats[category].count++;
                }
            });
        });
        
        // Calcular percentagens e atualizar a tabela
        const statsTable = document.getElementById('statsTable');
        if (!statsTable) return;
        
        const tableBody = statsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        categories.forEach(category => {
            const stats = categoryStats[category.name];
            
            // Se não houver dados para esta categoria, use um valor padrão
            const accuracy = stats.count > 0 
                ? (stats.totalMatch / stats.count).toFixed(1) 
                : 'N/A';
            
            // Determinar a largura da barra de progresso
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
    function addProtocolButtonListeners() {
        const protocolButtons = document.querySelectorAll('.protokollBtn');
        
        protocolButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get test index from data attribute
                const testIndex = this.getAttribute('data-index');
                if (!testIndex) {
                    console.error('No test index found on button');
                    return;
                }
                
                // Save the selected test index to localStorage
                localStorage.setItem('selectedTestIndex', testIndex);
                
                // Redirect to result page
                window.location.href = 'resultat.html';
            });
        });
    }
    
    // Initialize the page
    function init() {
        // If user is logged in, load profile data
        if (localStorage.getItem('access_token') !== null) {
            loadProfileData();
            // Add listeners after data is loaded and table is populated
            setTimeout(addProtocolButtonListeners, 100);
        }
    }
    
    init();
});