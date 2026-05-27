window.moviesData = [
    {
        id: "michael",
        title: "Michael",
        embedId: "14YXeHKOBUY"
    },
    {
        id: "DVP2",
        title: "O Diabo Veste Prada 2",
        embedId: "HqFn4ufrI7Y"
    },
    {
        id: "AvatarFC",
        title: "Avatar: Fogo e Cinzas",
        embedId: "yXPWsdT43YE"
    },
    {
        id: "telefonepreto2",
        title: "Telefone Preto 2",
        embedId: "yMZLeFcftyM"
    },
    {
        id: "aempregada",
        title: "A Empregada",
        embedId: "taxn4aqWts0"
    }
];

window.initMoviesModule = function() {
    renderMoviesGrid();
    updateRankingsTable();
};

function renderMoviesGrid() {
    const grid = document.getElementById("movies-grid");
    grid.innerHTML = "";

    window.moviesData.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        card.innerHTML = `
            <img src="movies/${movie.id}/${movie.id}_capa.png" alt="${movie.title}">
            <div class="movie-title">${movie.title}</div>
        `;
        card.addEventListener("click", () => showMovieDetails(movie));
        grid.appendChild(card);
    });
}

async function showMovieDetails(movie) {
    document.getElementById("movie-list-view").classList.add("hidden");
    const detailView = document.getElementById("movie-detail-view");
    detailView.classList.remove("hidden");

    document.getElementById("detail-cover").src = `movies/${movie.id}/${movie.id}_capa.png`;
    document.getElementById("detail-player").innerHTML = `
        <iframe src="https://www.youtube.com/embed/${movie.embedId}" allowfullscreen></iframe>
    `;

    const synopsisBox = document.getElementById("detail-synopsis");
    synopsisBox.innerHTML = "Carregando sinopse...";

    try {
        const res = await fetch(`movies/${movie.id}/${movie.id}_description.txt`);
        if (res.ok) {
            const text = await res.text();
            synopsisBox.innerHTML = parseMarkdown(text);
        } else {
            synopsisBox.innerHTML = "Sinopse indisponível.";
        }
    } catch {
        synopsisBox.innerHTML = "Sinopse indisponível.";
    }

    const voteBtn = document.getElementById("btn-vote");
    if (window.currentUser && window.currentUser.vote) {
        voteBtn.innerText = "Já votado";
        voteBtn.disabled = true;
        voteBtn.style.backgroundColor = "#555";
    } else {
        voteBtn.innerText = "Votar";
        voteBtn.disabled = false;
        voteBtn.style.backgroundColor = "#E50914";
        
        voteBtn.onclick = () => {
            const dialog = document.getElementById("vote-dialog");
            dialog.showModal();

            document.getElementById("confirm-vote").onclick = async () => {
                dialog.close();
                await executeVote(movie.id);
            };

            document.getElementById("cancel-vote").onclick = () => {
                dialog.close();
                backToListView();
            };
        };
    }
}

document.getElementById("back-to-list").addEventListener("click", backToListView);

function backToListView() {
    document.getElementById("movie-detail-view").classList.add("hidden");
    document.getElementById("movie-list-view").classList.remove("hidden");
    document.getElementById("detail-player").innerHTML = "";
}

async function executeVote(movieId) {
    const res = await makeRequest({
        action: "vote",
        userCode: window.currentUser.userCode,
        movie: movieId
    });

    alert(res.message);
    if (res.success) {
        window.currentUser.vote = movieId;
        localStorage.setItem("loggedUser", JSON.stringify(window.currentUser));
        showMovieDetails(window.moviesData.find(m => m.id === movieId));
        updateRankingsTable();
    }
}

async function updateRankingsTable() {
    const res = await makeRequest({ action: "getRankings" });
    const tbody = document.getElementById("ranking-body");
    tbody.innerHTML = "";

    if (res.success && res.rankings) {
        res.rankings.forEach((item, index) => {
            const movieObj = window.moviesData.find(m => m.id === item.movie);
            const title = movieObj ? movieObj.title : item.movie;
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${index + 1}º</td>
                <td>${title}</td>
                <td>${item.votes}</td>
            `;
            tbody.appendChild(tr);
        });
    } else {
        tbody.innerHTML = "<tr><td colspan='3'>Não foi possível carregar a classificação.</td></tr>";
    }
}

function parseMarkdown(text) {
    // Basic formatting for presentation without importing extra heavy packages
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/\n/g, '<br>');
}
