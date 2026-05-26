document.getElementById('suggestion-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showLoader();
    const data = {
        movieName: document.getElementById('sug-movie').value,
        trailer: document.getElementById('sug-trailer').value,
        email: currentUser.email
    };
    
    google.script.run.withSuccessHandler(res => {
        hideLoader();
        if (res.success) {
            alert('Sugestão enviada com sucesso!');
            document.getElementById('suggestion-form').reset();
        } else {
            alert(res);
        }
    }).submitSuggestion(data);
});
