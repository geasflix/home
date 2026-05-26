let pendingTicketData = null;

function loadSessionsForTickets() {
    showLoader();
    google.script.run.withSuccessHandler(sessions => {
        hideLoader();
        const container = document.getElementById('sessions-container');
        container.innerHTML = '';
        sessions.forEach(session => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div style="padding: 20px;">
                    <p>${session.movie}</p>
                    <p style="font-size: 0.8em; color: #aaa;">${session.date} - ${session.time}</p>
                </div>
            `;
            const buyBtn = document.createElement('button');
            buyBtn.className = 'primary-btn hidden';
            buyBtn.innerText = 'Comprar';
            buyBtn.style.width = '100%';
            buyBtn.style.borderRadius = '0 0 8px 8px';
            
            card.onclick = () => {
                document.querySelectorAll('#sessions-container .primary-btn').forEach(b => b.classList.add('hidden'));
                buyBtn.classList.remove('hidden');
            };
            
            buyBtn.onclick = (e) => {
                e.stopPropagation();
                pendingTicketData = {
                    movie: session.movie,
                    date: session.date,
                    sessionCode: session.sessionCode,
                    email: currentUser.email
                };
                openModal('payment-modal');
            };
            
            card.appendChild(buyBtn);
            container.appendChild(card);
        });
    }).getActiveSessions();
}

document.getElementById('confirm-payment-btn').addEventListener('click', () => {
    const key = document.getElementById('payment-key-input').value.trim();
    if (!key) return alert('Insira a chave de pagamento.');
    
    pendingTicketData.paymentKey = key;
    showLoader();
    google.script.run.withSuccessHandler(res => {
        hideLoader();
        closeModal('payment-modal');
        if (res.success) {
            generateTicketPNG(res.qrData);
        } else {
            alert(res);
        }
    }).purchaseTicket(pendingTicketData);
});

function generateTicketPNG(qrData) {
    document.getElementById('tkt-movie-name').innerText = pendingTicketData.movie;
    document.getElementById('tkt-date-time').innerText = `Data: ${pendingTicketData.date}`;
    document.getElementById('tkt-qrcode').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    openModal('ticket-result-modal');
}
