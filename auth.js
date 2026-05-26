const API_URL = "https://script.google.com/macros/s/AKfycbyEzhIKzLqHzHRex2mpIbeYWPFRxBOPYkyNM_JL24LwqLkf3JSwZJjpKtRDoJKmB_Wy/exec";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    const cachedUser = localStorage.getItem('geasflix_user');
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        setupAuthenticatedUI();
    }
    
    // Estilização forçada padrão Netflix para os botões de auth
    const authButtons = document.querySelectorAll('#login-form button, #register-form button');
    authButtons.forEach(btn => {
        btn.style.backgroundColor = '#E50914';
        btn.style.color = '#FFFFFF';
        btn.style.fontWeight = 'bold';
        btn.style.border = 'none';
        btn.style.padding = '12px 24px';
        btn.style.borderRadius = '4px';
        btn.style.cursor = 'pointer';
        btn.style.width = '100%';
        btn.style.fontSize = '16px';
        btn.style.marginTop = '10px';
        btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#b20710');
        btn.addEventListener('mouseout', () => btn.style.backgroundColor = '#E50914');
    });
});

function toggleAuthMode(mode) {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById(`${mode}-section`).classList.remove('hidden');
}

document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showLoader();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ action: 'loginUser', email: email, password: pass })
    })
    .then(response => response.json())
    .then(res => {
        hideLoader();
        if (res.success) {
            currentUser = res;
            localStorage.setItem('geasflix_user', JSON.stringify(res));
            setupAuthenticatedUI();
        } else {
            alert(res.message || res);
        }
    })
    .catch(error => {
        hideLoader();
        alert('ERRO_SINTAXE: Falha na comunicação com o servidor.');
    });
});

document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const cpf = document.getElementById('reg-cpf').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    
    if (name.split(' ').length < 2 || name.length < 4) return alert('Insira nome e sobrenome (min. 4 letras).');
    if (cpf.length < 11 || isNaN(cpf)) return alert('CPF inválido. Use apenas números (mínimo 11).');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Email inválido.');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}/.test(pass)) {
        return alert('Senha deve ter no mínimo 6 caracteres, maiúscula, minúscula, número e caractere especial.');
    }

    showLoader();
    
    fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify({ 
            action: 'registerUser', 
            userData: { fullName: name, cpf: cpf, email: email, password: pass } 
        })
    })
    .then(response => response.json())
    .then(res => {
        hideLoader();
        if (res.success) {
            alert('Registro concluído. Faça login.');
            toggleAuthMode('login');
        } else {
            alert(res.message || res);
        }
    })
    .catch(error => {
        hideLoader();
        alert('ERRO_SINTAXE: Falha na comunicação com o servidor.');
    });
});

function setupAuthenticatedUI() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('register-section').classList.add('hidden');
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('main-footer').classList.remove('hidden');
    
    if (currentUser && currentUser.isAdmin) {
        document.getElementById('btn-adm').classList.remove('hidden');
    }
    navigate('home');
}

function logout() {
    localStorage.removeItem('geasflix_user');
    currentUser = null;
    location.reload();
}
