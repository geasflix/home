window.AppConfig = {
    WEB_APP_URL: "https://script.google.com/macros/s/AKfycbwAf9iY7q7GgzJwAQ4kS50nuyLscFeojVHLTy2wwTDcLB6OrRV0Ea3ywVHGQVkMR-sb/exec"
};

document.addEventListener("DOMContentLoaded", () => {
    const loginSection = document.getElementById("login-section");
    const registerSection = document.getElementById("register-section");
    const mainContent = document.getElementById("main-content");
    const profileContainer = document.getElementById("user-profile-container");
    const userAvatar = document.getElementById("user-avatar");

    document.getElementById("go-to-register").addEventListener("click", () => {
        loginSection.classList.add("hidden");
        registerSection.classList.remove("hidden");
    });

    document.getElementById("go-to-login").addEventListener("click", () => {
        registerSection.classList.add("hidden");
        loginSection.classList.remove("hidden");
    });

    userAvatar.addEventListener("click", () => {
        if(confirm("Deseja realmente sair da conta?")) {
            localStorage.removeItem("loggedUser");
            location.reload();
        }
    });

    // Check cached session
    const cachedUser = localStorage.getItem("loggedUser");
    if (cachedUser) {
        window.currentUser = JSON.parse(cachedUser);
        showMainScreen();
    }

    // Handle Login
    document.getElementById("login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        const res = await makeRequest({ action: "login", email, password });
        if (res.success) {
            window.currentUser = res.user;
            localStorage.setItem("loggedUser", JSON.stringify(res.user));
            showMainScreen();
        } else {
            alert(res.message);
        }
    });

    // Handle Registration
    document.getElementById("register-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = document.getElementById("reg-name").value.trim();
        const cpf = document.getElementById("reg-cpf").value.trim();
        const email = document.getElementById("reg-email").value.trim();
        const password = document.getElementById("reg-password").value;

        // Validation Rules
        if (fullName.length < 4 || !fullName.includes(" ")) {
            alert("Nome completo deve ter pelo menos 4 caracteres e conter pelo menos um espaço.");
            return;
        }
        if (!/^\d{11}$/.test(cpf)) {
            alert("CPF deve conter exatamente 11 dígitos numéricos.");
            return;
        }
        if (!/^[\w\.-]+@[\w\.-]+\.\w+$/.test(email)) {
            alert("Padrão de e-mail inválido.");
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#\$%\^&\*_\-\+\=\?\/\.\,]).{6,}$/.test(password)) {
            alert("A senha deve conter pelo menos 6 caracteres, incluindo 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.");
            return;
        }

        const userCode = "USR-" + Math.random().toString(36).substr(2, 9).toUpperCase();

        const res = await makeRequest({
            action: "register",
            fullName,
            cpf,
            email,
            password,
            userCode
        });

        alert(res.message);
        if (res.success) {
            registerSection.classList.add("hidden");
            loginSection.classList.remove("hidden");
        }
    });

    function showMainScreen() {
        loginSection.classList.add("hidden");
        registerSection.classList.add("hidden");
        mainContent.classList.remove("hidden");
        profileContainer.classList.remove("hidden");
        userAvatar.innerText = window.currentUser.fullName.charAt(0).toUpperCase();
        userAvatar.title = `${window.currentUser.fullName} (Sair)`;
        
        if(window.initMoviesModule) {
            window.initMoviesModule();
        }
    }
});

async function makeRequest(data) {
    // Exibe o loader na tela antes de iniciar a busca
    document.getElementById("loader").classList.remove("hidden");
    
    try {
        const response = await fetch(window.AppConfig.WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(data)
        });
        return await response.json();
    } catch (error) {
        console.error("Erro na requisição:", error);
        return { success: false, message: "Erro de comunicação com o servidor." };
    } finally {
        // Garante que o loader será ocultado ao terminar, com sucesso ou erro
        document.getElementById("loader").classList.add("hidden");
    }
}
