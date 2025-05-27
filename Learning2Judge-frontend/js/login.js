document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('access_token') !== null) {
        window.location.href = 'index.html';
    }
    
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    const API_URL = 'http://localhost:8000';
    const TOKEN_ENDPOINT = '/api/token/pair';
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showError('Skriv inn brukernavn og passord.');
            return;
        }
        
        login(username, password);
    });

    function showError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }

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
            localStorage.setItem('access_token', data.access);
            localStorage.setItem('refresh_token', data.refresh);
            localStorage.setItem('username', data.username || username);
            
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Login error:', error);
            showError(error.message);
        });
    }
});