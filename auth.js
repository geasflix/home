const API_URL = "https://script.google.com/macros/s/AKfycbyfOXZQQj0rljPiqsg8v79DF4MunEfO-5ngsE9j89Gsc-KheuthVoDDdhYT0_OaT7GN/exec";
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    // Carrega usuário do cache se existir
    const cachedUser = localStorage.getItem('geasflix_user');
    if (cachedUser) {
        currentUser = JSON.parse(cachedUser);
        setupAuthenticatedUI();
    }
    
    // Estilização forçada padrão Netflix
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

// Ajustado para os IDs do index.html (view-login/register)
function toggleAuthMode(mode) {
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-register').classList.add('hidden');
    document.getElementById(`view-${mode}`).classList.remove('hidden');
}

// Handler do Login
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
            alert(res.message || 'Erro no login.');
        }
    })
    .catch(error => {
        hideLoader();
        console.error(error);
        alert('Falha na comunicação com o servidor.');
    });
});

// Handler do Registro
document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const cpf = document.getElementById('reg-cpf').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    
    if (name.split(' ').length < 2 || name.length < 4) return alert('Insira nome e sobrenome.');
    if (cpf.length < 11) return alert('CPF inválido.');
    
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
            alert(res.message || 'Erro no registro.');
        }
    })
    .catch(error => {
        hideLoader();
        alert('Falha na comunicação.');
    });
});

// Função para configurar a tela após logado
function setupAuthenticatedUI() {
    // Esconde as views de auth e mostra o conteúdo principal
    document.getElementById('view-login').classList.add('hidden');
    document.getElementById('view-register').classList.add('hidden');
    
    document.getElementById('main-header').classList.remove('hidden');
    document.getElementById('main-footer').classList.remove('hidden');
    
    // Mostra botão de ADM se for admin
    if (currentUser && currentUser.isAdmin) {
        document.getElementById('adm-btn').classList.remove('hidden');
    }
    
    navigate('home');
}

function logout() {
    localStorage.removeItem('geasflix_user');
    currentUser = null;
    location.reload();
}
