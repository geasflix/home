let currentSelectedMovie = null;

function loadVotingMovies() {
    showLoader();
    google.script.run.withSuccessHandler(movies => {
        hideLoader();
        const container = document.getElementById('movies-container');
        container.innerHTML = '';
        movies.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <img src="${movie.cover}" alt="${movie.movieName}">
                <p>${movie.movieName}</p>
            `;
            card.onclick = () => showMovieDetails(movie);
            container.appendChild(card);
        });
    }).getMoviesForVoting();
}

function showMovieDetails(movie) {
    currentSelectedMovie = movie;
    document.getElementById('home-section').classList.add('hidden');
    const detailsSection = document.getElementById('movie-details-section');
    detailsSection.classList.remove('hidden');
    
    document.getElementById('detail-cover').src = movie.cover;
    document.getElementById('detail-title').innerText = movie.movieName;
    
    const trailerId = extractYouTubeID(movie.trailer);
    const trailerContainer = document.getElementById('detail-trailer');
    if (trailerId) {
        trailerContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${trailerId}" allowfullscreen></iframe>`;
    } else {
        trailerContainer.innerHTML = '<p>Trailer não disponível</p>';
    }
}

document.getElementById('btn-vote-this').addEventListener('click', () => {
    openModal('vote-modal');
});

document.getElementById('confirm-vote-btn').addEventListener('click', () => {
    closeModal('vote-modal');
    showLoader();
    google.script.run.withSuccessHandler(res => {
        hideLoader();
        if (res.success) {
            alert('Voto computado com sucesso!');
            navigate('home');
        } else {
            alert(res);
        }
    }).voteMovie(currentSelectedMovie.index, currentUser.email);
});

function extractYouTubeID(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}
