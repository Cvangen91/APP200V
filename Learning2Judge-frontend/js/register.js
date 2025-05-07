// Register page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (localStorage.getItem('access_token') !== null) {
        // Already logged in, redirect to home page
        window.location.href = 'index.html';
    }
    
    // DOM Elements
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    // Constants
    const API_URL = 'http://localhost:8000';
    const REGISTER_ENDPOINT = '/api/register';
    
    // Event listener for register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        // Basic validation
        if (!username || !email || !password || !passwordConfirm) {
            showError('Alle påkrevde felt må fylles ut.');
            return;
        }
        
        if (password !== passwordConfirm) {
            showError('Passordene må være like.');
            return;
        }
        
        if (password.length < 8) {
            showError('Passordet må være minst 8 tegn langt.');
            return;
        }
        
        // Send registration request
        register(username, email, password);
    });

    // Function to display error messages
    function showError(message) {
        registerError.textContent = message;
        registerError.style.display = 'block';
        registerSuccess.style.display = 'none';
    }
    
    // Function to display success message
    function showSuccess(message) {
        registerSuccess.textContent = message;
        registerSuccess.style.display = 'block';
        registerError.style.display = 'none';
    }

    // Function to handle registration request
    function register(username, email, password) {
        fetch(`${API_URL}${REGISTER_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            }),
            mode: 'cors'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.error || 'Registrering mislyktes.');
                });
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showSuccess('Registrering vellykket! Du vil bli videresendt til innlogging...');
            
            // Clear the form
            registerForm.reset();
            
            // Redirect to login page after a delay
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        })
        .catch(error => {
            console.error('Registration error:', error);
            showError(error.message);
        });
    }
});