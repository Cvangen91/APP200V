document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('access_token') !== null) {
        window.location.href = 'index.html';
    }
    
    const registerForm = document.getElementById('register-form');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    const API_URL = 'http://localhost:8000';
    const REGISTER_ENDPOINT = '/api/register';
    
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const fullName = document.getElementById('full-name').value;
        const birthDate = document.getElementById('birth-date').value;
        const judgeLevel = document.getElementById('judge-level').value;
        const judgeSince = document.getElementById('judge-since').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        
        if (!username || !fullName || !birthDate || !judgeLevel || !judgeSince || !email || !password || !passwordConfirm) {
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
        
        register(username, fullName, birthDate, judgeLevel, judgeSince, email, password);
    });

    function showError(message) {
        registerError.textContent = message;
        registerError.style.display = 'block';
        registerSuccess.style.display = 'none';
    }
    
    function showSuccess(message) {
        registerSuccess.textContent = message;
        registerSuccess.style.display = 'block';
        registerError.style.display = 'none';
    }

    function register(username, fullName, birthDate, judgeLevel, judgeSince, email, password) {
        fetch(`${API_URL}${REGISTER_ENDPOINT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                full_name: fullName,
                birth_date: birthDate,
                judge_level: judgeLevel,
                judge_since: parseInt(judgeSince),
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
            showSuccess('Registrering vellykket! Du vil bli videresendt til innlogging...');
            
            registerForm.reset();
            
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