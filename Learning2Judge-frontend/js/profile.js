document.addEventListener('DOMContentLoaded', function() {
    const profileContent = document.getElementById('profile-content');
    
    async function loadProfileData() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Kunne ikke laste profil: ${response.status} ${response.statusText}`);
            }

            const userData = await response.json();
            console.log('Data received from backend:', userData);
            
            const nameElement = document.getElementById('name');
            const ageElement = document.getElementById('age');
            const degreeElement = document.getElementById('degree');
            const timeElement = document.getElementById('time');
            const emailElement = document.getElementById('profile-email');
            const profileNameElement = document.getElementById('profile-name');
            const birthDateElement = document.getElementById('profile-birthdate');
            const judgeLevelElement = document.getElementById('profile-judge-level');
            const judgeSinceElement = document.getElementById('profile-judge-since');

            if (nameElement) {
                nameElement.textContent = userData.fullName || userData.username || 'Navn ikke definert';
            }
            
            if (ageElement) {
                let age = 'Alder ikke definert';
                if (userData.birthDate) {
                    try {
                        const [year, month, day] = userData.birthDate.split('-');
                        const birthDate = new Date(year, month - 1, day);
                        const today = new Date();
                        
                        if (birthDate > today) {
                            age = 'Fremtidig dato';
                        } else if (!isNaN(birthDate.getTime())) {
                            age = calculateAge(birthDate);
                        } else {
                            age = 'Ugyldig dato';
                        }
                    } catch (error) {
                        console.error('Error calculating age:', error);
                        age = 'Beregningsfeil';
                    }
                }
                ageElement.textContent = age;
            }
            
            if (degreeElement) {
                degreeElement.textContent = userData.judgeLevel || 'Nivå ikke definert';
            }
            
            if (timeElement) {
                timeElement.textContent = userData.judgeSince || 'År ikke definert';
            }
            
            if (emailElement) {
                emailElement.value = userData.email || '';
            }
            
            if (profileNameElement) {
                profileNameElement.value = userData.fullName || userData.username || '';
            }

            if (birthDateElement) {
                birthDateElement.value = userData.birthDate || '';
            }

            if (judgeLevelElement) {
                judgeLevelElement.value = userData.judgeLevel || '';
            }

            if (judgeSinceElement) {
                judgeSinceElement.value = userData.judgeSince || '';
            }

            console.log('Updated interface with new data');
            
        } catch (error) {
            console.error('Error loading profile:', error);
            alert('Kunne ikke laste profil. Vennligst prøv igjen.');
        }
        
        loadTestResults();
    }
    
    function calculateAge(birthDate) {
        try {
            const today = new Date();
            
            if (isNaN(birthDate.getTime())) {
                return 'Ugyldig dato';
            }

            if (birthDate > today) {
                return 'Fremtidig dato';
            }
            
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            
            if (age < 0 || age > 120) {
                return 'Ugyldig alder';
            }
            
            return age;
        } catch (error) {
            return 'Beregningsfeil';
        }
    }
    
    async function loadTestResults() {
        const token = localStorage.getItem('access_token');
        const testsTable = document.getElementById('completeTestsTable');
        if (!testsTable) return;
        
        const tableBody = testsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        try {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <p style="padding: 20px;">
                            <i class="fas fa-spinner fa-spin"></i> Laster testresultater...
                        </p>
                    </td>
                </tr>
            `;
            
            const sessionsRes = await fetch(`http://localhost:8000/api/user-sessions`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (!sessionsRes.ok) {
                throw new Error(`Error loading results: ${sessionsRes.status} ${sessionsRes.statusText}`);
            }
            
            let sessions = await sessionsRes.json();
            
            if (!sessions || sessions.length === 0) {
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
            
            console.log('Backend sessions:', sessions);
            
            const results = [];
            
            for (const session of sessions) {
                try {
                    if (session.details) {
                        const details = JSON.parse(session.details);
                        
                        results.push({
                            ...details,
                            sessionId: session.userSessionId,
                            date: new Date(session.timestamp || details.timestamp).toLocaleDateString('no-NO'),
                            timestamp: session.timestamp || details.timestamp
                        });
                    } else {
                        const scoresRes = await fetch(
                            `http://localhost:8000/api/user-scores/session/${session.userSessionId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (!scoresRes.ok) continue;
                        
                        const scores = await scoresRes.json();
                        if (!scores || scores.length === 0) continue;
                        
                        const programRes = await fetch(
                            `http://localhost:8000/api/programs/${session.programId}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        if (!programRes.ok) continue;
                        
                        const program = await programRes.json();
                        
                        let totalUserScore = 0;
                        let totalExpertScore = 0;
                        let totalMatch = 0;
                        
                        scores.forEach(score => {
                            const userScore = parseFloat(score.userScore);
                            const expertScore = parseFloat(score.expertScore);
                            
                            totalUserScore += userScore;
                            totalExpertScore += expertScore;
                            
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
                    console.error(`Error processing session ${session.userSessionId}:`, error);
                }
            }
            
            if (results.length === 0) {
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
            console.error('Error loading results:', error);
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
    
    function processTestResults(testResults) {
        const testsTable = document.getElementById('completeTestsTable');
        if (!testsTable) return;
        
        const tableBody = testsTable.querySelector('tbody');
        
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
        
        testResults.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
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
        
        window.currentResults = testResults;
        
        updateStatistics(testResults);
        
        addProtocolButtonListeners(testResults);
    }
    
    function getMatchClass(matchPercentage) {
        const match = parseFloat(matchPercentage);
        if (match >= 95) return 'success';
        if (match >= 85) return 'warning';
        return 'danger';
    }
    
    function updateStatistics(testResults) {
        const statValues = document.querySelectorAll('.stat-value');
        
        if (testResults.length === 0) {
            if (statValues.length >= 3) {
                statValues[0].textContent = '-';
                statValues[1].textContent = '0';
                statValues[2].textContent = '0';
            }
            
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
        
        let totalMatch = 0;
        testResults.forEach(result => {
            totalMatch += parseFloat(result.matchPercentage);
        });
        const averageMatch = (totalMatch / testResults.length).toFixed(1);
        
        if (statValues.length >= 3) {
            statValues[0].textContent = `${averageMatch}%`;
            statValues[1].textContent = testResults.length;
            
            let totalExercises = 0;
            testResults.forEach(result => {
                totalExercises += result.scores.filter(s => s !== undefined).length;
            });
            statValues[2].textContent = totalExercises;
        }
        
        updateCategoryAccuracy(testResults);
    }
    
    function updateCategoryAccuracy(testResults) {
        const categories = [
            { id: 1, name: 'Skritt' },
            { id: 2, name: 'Trav' },
            { id: 3, name: 'Galopp' },
            { id: 4, name: 'Allment inntrykk' }
        ];
        
        const categoryStats = {};
        categories.forEach(cat => {
            categoryStats[cat.name] = {
                totalMatch: 0,
                count: 0
            };
        });
        
        testResults.forEach(result => {
            if (!result.exercises || !result.scores || !result.correctScores) return;
            
            result.exercises.forEach((exerciseName, index) => {
                if (result.scores[index] === undefined) return;
                
                let category = 'Allment inntrykk'; 
                
                if (exerciseName.toLowerCase().includes('skritt')) {
                    category = 'Skritt';
                } else if (exerciseName.toLowerCase().includes('trav')) {
                    category = 'Trav';
                } else if (exerciseName.toLowerCase().includes('galopp')) {
                    category = 'Galopp';
                }
                
                const userScore = result.scores[index];
                const correctScore = result.correctScores[index];
                const match = 100 - (Math.abs(userScore - correctScore) / 10 * 100);
                
                if (categoryStats[category]) {
                    categoryStats[category].totalMatch += match;
                    categoryStats[category].count++;
                }
            });
        });
        
        const statsTable = document.getElementById('statsTable');
        if (!statsTable) return;
        
        const tableBody = statsTable.querySelector('tbody');
        tableBody.innerHTML = '';
        
        categories.forEach(category => {
            const stats = categoryStats[category.name];
            
            const accuracy = stats.count > 0 
                ? (stats.totalMatch / stats.count).toFixed(1) 
                : 'N/A';
            
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
    
    function updateProfileUI(data) {
    }
    
    function addProtocolButtonListeners(testResults) {
        const protocolButtons = document.querySelectorAll('.protokollBtn');
        
        protocolButtons.forEach(button => {
            button.addEventListener('click', function() {
                const sessionId = this.getAttribute('data-session-id');
                
                if (!sessionId) {
                    console.error('No session ID found on button');
                    return;
                }
                
                window.location.href = `resultat.html?sessionId=${sessionId}`;
            });
        });
    }
    
    async function saveProfileChanges(event) {
        event.preventDefault();
        
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const submitButton = event.target.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Lagrer...';
        }

        try {
            const email = document.getElementById('profile-email').value;
            const name = document.getElementById('profile-name').value;
            const birthDate = document.getElementById('profile-birthdate').value;
            const judgeLevel = document.getElementById('profile-judge-level').value;
            const judgeSince = document.getElementById('profile-judge-since').value;
            const newPassword = document.getElementById('profile-password').value;
            const confirmPassword = document.getElementById('profile-password-confirm').value;

            console.log('Form data:', {
                email,
                name,
                birthDate,
                judgeLevel,
                judgeSince,
                hasNewPassword: !!newPassword
            });

            if (newPassword) {
                if (newPassword !== confirmPassword) {
                    throw new Error('Passordene stemmer ikke overens');
                }
                if (newPassword.length < 8) {
                    throw new Error('Passordet må være minst 8 tegn');
                }
            }

            const updateData = {
                email: email || null,
                full_name: name || null,
                birth_date: birthDate || null,
                judge_level: judgeLevel || null,
                judge_since: judgeSince ? parseInt(judgeSince) : null
            };

            if (newPassword) {
                updateData.password = newPassword;
            }

            console.log('Data sent to the backend:', updateData);

            const response = await fetch('http://localhost:8000/api/users/me', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            const responseData = await response.json();
            console.log('Backend response:', responseData);

            if (!response.ok) {
                throw new Error(responseData.error || 'Kunne ikke oppdatere profil');
            }

            document.getElementById('profile-password').value = '';
            document.getElementById('profile-password-confirm').value = '';

            const nameElement = document.getElementById('name');
            const ageElement = document.getElementById('age');
            const degreeElement = document.getElementById('degree');
            const timeElement = document.getElementById('time');

            if (nameElement) {
                nameElement.textContent = responseData.fullName || responseData.username || 'Navn ikke definert';
            }

            if (ageElement && responseData.birthDate) {
                try {
                    const [year, month, day] = responseData.birthDate.split('-');
                    const birthDate = new Date(year, month - 1, day);
                    ageElement.textContent = calculateAge(birthDate);
                } catch (error) {
                    console.error('Error calculating:', error);
                    ageElement.textContent = 'Beregningsfeil';
                }
            }

            if (degreeElement) {
                degreeElement.textContent = responseData.judgeLevel || 'Nivå ikke definert';
            }

            if (timeElement) {
                timeElement.textContent = responseData.judgeSince || 'År ikke definert';
            }

            const successMessage = document.createElement('div');
            successMessage.className = 'alert alert-success';
            successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Profil oppdatert!';
            event.target.insertBefore(successMessage, event.target.firstChild);

            setTimeout(() => {
                successMessage.remove();
            }, 3000);

            await loadProfileData();
            
        } catch (error) {
            console.error('Error updating profile:', error);
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'alert alert-danger';
            errorMessage.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${error.message || 'Kunne ikke oppdatere profil. Vennligst prøv igjen.'}`;
            event.target.insertBefore(errorMessage, event.target.firstChild);

            setTimeout(() => {
                errorMessage.remove();
            }, 3000);
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Lagre endringer';
            }
        }
    }
    
    function init() {
        const token = localStorage.getItem('access_token');
        if (token) {
            loadProfileData();
            
            const tabLinks = document.querySelectorAll('.tab-nav li');
            const tabContents = document.querySelectorAll('.tab-pane');
            
            tabLinks.forEach(tab => {
                tab.addEventListener('click', function() {
                    tabLinks.forEach(t => t.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    this.classList.add('active');
                    const tabId = this.getAttribute('data-tab');
                    document.getElementById(tabId).classList.add('active');
                });
            });

            const profileSettingsForm = document.getElementById('profile-settings-form');
            if (profileSettingsForm) {
                profileSettingsForm.addEventListener('submit', saveProfileChanges);
            }
        }
    }
    
    init();
});