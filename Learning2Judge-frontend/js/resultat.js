// Results page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Get test index from localStorage
    const testIndex = localStorage.getItem('selectedTestIndex');
    
    if (!testIndex) {
        showError('No test selected');
        return;
    }
    
    // Load test results from localStorage
    const testResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    
    if (testResults.length === 0 || testIndex >= testResults.length) {
        showError('Test data not found');
        return;
    }
    
    // Get the specific test result
    const testResult = testResults[testIndex];
    
    // Display test information
    displayTestInfo(testResult);
    
    // Create detailed comparison table
    createComparisonTable(testResult);
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