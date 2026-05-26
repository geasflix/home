function renderVotesRanking() {
    showLoader();
    google.script.run.withSuccessHandler(ranks => {
        hideLoader();
        const area = document.getElementById('adm-content-area');
        let html = '<h3>Ranking de Votos</h3><br>';
        ranks.forEach((r, idx) => {
            html += `<div class="adm-card">
                <strong>#${idx + 1} ${r.movieName}</strong> - ${r.votes} votos (${r.status})
            </div>`;
        });
        area.innerHTML = html;
    }).adminGetVotes();
}
