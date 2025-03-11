// Login page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('access_token') !== null) {
        // Already logged in, redirect to home page
        window.location.href = 'index.html';
    }
    
    // DOM Elements
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Constants
    const API_URL = 'http://localhost:8000';
    const TOKEN_ENDPOINT = '/api/token/pair';
    
    // Event listener for login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Basic validation
        if (!username || !password) {
            showError('Skriv inn brukernavn og passord.');
            return;
        }
        
        // Send login request
        login(username, password);
    });

    // Function to display error messages
    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }

    // Function to handle login request
    function login(username, password) {
        fetch(`${API_URL}${TOKEN_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            }),
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Feil brukernavn eller passord.');
                } else if (response.status === 0 || !response.status) {
                    throw new Error('CORS-feil: Kunne ikke koble til serveren. Sjekk at backend-serveren kjører og støtter CORS.');
                } else {
                    throw new Error('En feil oppstod. Vennligst prøv igjen senere.');
                }
            }
            return response.json();
        })
        .then(data => {
            // Store tokens in localStorage
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('username', data.username || username);
            
            // Redirect to home page after successful login
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Login error:', error);
            showError(error.message);
        });
    }
});