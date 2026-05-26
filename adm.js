let html5QrcodeScanner = null;

function showAdmPanel(panelType) {
    const area = document.getElementById('adm-content-area');
    area.innerHTML = '';
    if (html5QrcodeScanner) {
        html5QrcodeScanner.clear().catch(e => console.error(e));
        html5QrcodeScanner = null;
    }

    if (panelType === 'adm-add-session') {
        showLoader();
        google.script.run.withSuccessHandler(movies => {
            hideLoader();
            let options = movies.map(m => `<option value="${m}">${m}</option>`).join('');
            area.innerHTML = `
                <h3>Nova Sessão</h3>
                <form id="adm-session-form" class="form-container" style="margin: 20px 0;">
                    <select id="adm-ses-movie" style="width:100%; padding:12px; margin-bottom:15px; background:#333; color:#fff;" required>
                        ${options}
                    </select>
                    <input type="date" id="adm-ses-date" required>
                    <input type="time" id="adm-ses-time" required>
                    <input type="text" id="adm-ses-code" placeholder="Código da Sessão (Ex: S1)" required>
                    <button type="submit" class="primary-btn">Criar Sessão</button>
                </form>
            `;
            document.getElementById('adm-session-form').onsubmit = (e) => {
                e.preventDefault();
                showLoader();
                const data = {
                    movie: document.getElementById('adm-ses-movie').value,
                    date: document.getElementById('adm-ses-date').value,
                    time: document.getElementById('adm-ses-time').value,
                    sessionCode: document.getElementById('adm-ses-code').value
                };
                google.script.run.withSuccessHandler(r => { hideLoader(); alert('Sessão criada!'); area.innerHTML=''; }).adminAddSession(data);
            };
        }).getMoviesDropdown();
    }
    
    if (panelType === 'adm-view-suggestions') {
        showLoader();
        google.script.run.withSuccessHandler(suggs => {
            hideLoader();
            let html = '<h3>Sugestões</h3><br>';
            suggs.forEach(s => {
                html += `<div class="adm-card">
                    <p><strong>Filme:</strong> ${s.movieName}</p>
                    <p><strong>Trailer:</strong> <a href="${s.trailer}" target="_blank">${s.trailer || 'N/A'}</a></p>
                    <p style="font-size:0.8em; color:#aaa;">Sugerido por: ${s.email}</p>
                </div>`;
            });
            area.innerHTML = html;
        }).adminGetSuggestions();
    }

    if (panelType === 'adm-view-votes') {
        renderVotesRanking(); // calls from results.js
    }

    if (panelType === 'adm-scan-ticket') {
        area.innerHTML = `
            <h3>Escanear QR Code</h3>
            <div id="qr-reader" style="width:100%; max-width:400px; margin:20px auto;"></div>
        `;
        html5QrcodeScanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: 250 });
        html5QrcodeScanner.render((decodedText) => {
            html5QrcodeScanner.clear();
            showLoader();
            google.script.run.withSuccessHandler(res => {
                hideLoader();
                if (res.success) {
                    alert(`Ticket Confirmado!\nFilme: ${res.movie}`);
                } else {
                    alert(res);
                }
            }).adminConfirmTicket(decodedText);
        }, (err) => {});
    }

    if (panelType === 'adm-add-movie') {
        area.innerHTML = `
            <h3>Novo Filme</h3>
            <form id="adm-movie-form" class="form-container" style="margin: 20px 0;">
                <input type="text" id="adm-mov-name" placeholder="Nome do Filme" required>
                <input type="url" id="adm-mov-trailer" placeholder="Link do Trailer" required>
                <label>Capa (Drive URL):</label>
                <input type="url" id="adm-mov-cover" placeholder="Link da imagem no Drive" required>
                <input type="text" id="adm-mov-session" placeholder="Código da Sessão (Ex: S1)" required>
                <label>Data Limite Votação:</label>
                <input type="date" id="adm-mov-limit" required>
                <button type="submit" class="primary-btn">Adicionar Filme</button>
            </form>
        `;
        document.getElementById('adm-movie-form').onsubmit = (e) => {
            e.preventDefault();
            showLoader();
            const data = {
                movieName: document.getElementById('adm-mov-name').value,
                trailer: document.getElementById('adm-mov-trailer').value,
                cover: document.getElementById('adm-mov-cover').value,
                sessionCode: document.getElementById('adm-mov-session').value,
                limite: document.getElementById('adm-mov-limit').value
            };
            google.script.run.withSuccessHandler(r => { hideLoader(); alert('Filme adicionado!'); area.innerHTML=''; }).adminAddMovie(data);
        };
    }
}
