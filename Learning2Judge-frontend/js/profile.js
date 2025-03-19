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
    }
    
    // Update UI with profile data
    function updateProfileUI(data) {
        // Update profile fields with data from API
        // Example implementation that would be used with real backend data:
        /*
        document.getElementById('name').textContent = data.fullName;
        document.getElementById('age').textContent = data.age;
        document.getElementById('degree').textContent = data.judgeLevel;
        document.getElementById('time').textContent = data.judgeSince;
        
        // Update completed tests table
        const testsTable = document.getElementById('completeTestsTable');
        const tableBody = testsTable.querySelector('tbody') || testsTable;
        
        // Clear existing rows except header
        while (tableBody.rows.length > 1) {
            tableBody.deleteRow(1);
        }
        
        // Add test data rows
        data.completedTests.forEach(test => {
            const row = tableBody.insertRow();
            row.innerHTML = `
                <td>${test.date}</td>
                <td>${test.program}</td>
                <td>${test.team}</td>
                <td>${test.result}%</td>
                <td>${test.expected}%</td>
                <td>${test.match}%</td>
                <td><button class="protokollBtn" data-id="${test.id}">Protokoll</button></td>
            `;
        });
        
        // Update statistics
        document.querySelector('#statsTable tr:nth-child(1) td').textContent = `${data.stats.walk}% match`;
        document.querySelector('#statsTable tr:nth-child(2) td').textContent = `${data.stats.trot}% match`;
        document.querySelector('#statsTable tr:nth-child(3) td').textContent = `${data.stats.canter}% match`;
        document.querySelector('#statsTable tr:nth-child(4) td').textContent = `${data.stats.impression}% match`;
        */
    }
    
    // Add event listeners to protocol buttons
    function addProtocolButtonListeners() {
        const protocolButtons = document.querySelectorAll('.protokollBtn');
        
        protocolButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Get test ID from data attribute if available
                const testId = this.getAttribute('data-id');
                
                // Redirect to protocol page or open modal
                window.location.href = `resultat.html?id=${testId || '1'}`;
            });
        });
    }
    
    // Initialize the page
    function init() {
        // If user is logged in, load profile data
        if (localStorage.getItem('access_token') !== null) {
            loadProfileData();
            addProtocolButtonListeners();
        }
    }
    
    init();
});