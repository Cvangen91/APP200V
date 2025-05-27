document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const cancelLogin = document.getElementById('cancel-login');
    const loginError = document.getElementById('login-error');

    const API_URL = 'http://localhost:8000';
    const TOKEN_ENDPOINT = '/api/token/pair';

    function isLoggedIn() {
        return localStorage.getItem('access_token') !== null;
    }

    function updateUIState() {
        if (isLoggedIn()) {
            loginButton.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginButton.classList.add('logged-in');
        } else {
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Login';
            loginButton.classList.remove('logged-in');
        }
    }

    if (loginButton) {
        loginButton.addEventListener('click', function(e) {
            e.preventDefault();
            if (isLoggedIn()) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                updateUIState();
                alert('Du har blitt logget ut.');
                window.location.href = 'login.html';
            } else if (loginContainer) {
                loginContainer.style.display = 'flex';
            }
        });
    }

    if (cancelLogin && loginContainer && loginForm && loginError) {
        cancelLogin.addEventListener('click', function() {
            loginContainer.style.display = 'none';
            loginForm.reset();
            loginError.style.display = 'none';
        });
    }

    if (loginForm) {
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
    }

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
            credentials: 'include',  // Include cookies in the request
            body: JSON.stringify({
                username: username,
                password: password
            }),
            mode: 'cors'  // Explicitly set CORS mode
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
            localStorage.setItem('username', data.username || username); // Fallback to entered username if not provided by server
            
            updateUIState();
            loginContainer.style.display = 'none';
            loginForm.reset();
            
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error('Login error:', error);
            showError(error.message);
        });
    }

    function getAccessToken() {
        return localStorage.getItem('access_token');
    }

    function refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        
        if (!refresh) {
            return Promise.reject('No refresh token available');
        }
        
        return fetch(`${API_URL}/api/token/refresh/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',  // Include cookies in the request
            body: JSON.stringify({
                refresh: refresh
            }),
            mode: 'cors'  // Explicitly set CORS mode
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to refresh token');
            }
            return response.json();
        })
        .then(data => {
            localStorage.setItem('access_token', data.access);
            return data.access;
        })
        .catch(error => {
            console.error('Token refresh error:', error);
            throw error;
        });
    }

    function authFetch(url, options = {}) {
        const requestOptions = {
            ...options,
            headers: {
                ...options.headers,
                'Authorization': `Bearer ${getAccessToken()}`,
                'Accept': 'application/json'
            },
            credentials: 'include',  // Include cookies in cross-origin requests
            mode: 'cors'  // Explicitly set CORS mode
        };
        
        return fetch(url, requestOptions)
            .then(response => {
                if (response.status === 401) {
                    return refreshToken()
                        .then(newToken => {
                            requestOptions.headers['Authorization'] = `Bearer ${newToken}`;
                            return fetch(url, requestOptions);
                        })
                        .catch(error => {
                            localStorage.removeItem('access_token');
                            localStorage.removeItem('refresh_token');
                            localStorage.removeItem('username');
                            updateUIState();
                            throw new Error('Session expired. Please log in again.');
                        });
                } else if (!response.ok) {
                    throw new Error(`Request failed with status ${response.status}`);
                }
                return response;
            })
            .catch(error => {
                console.error('Auth fetch error:', error);
                throw error;
            });
    }

    updateUIState();

    window.auth = {
        isLoggedIn,
        getAccessToken,
        authFetch
    };
});