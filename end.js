const finalScore = document.getElementById('finalScore');
const saveStatus = document.getElementById('saveStatus');
const mostRecentScore = localStorage.getItem('mostRecentScore');

const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const playsLog = JSON.parse(localStorage.getItem('playsLog')) || [];

const MAX_HIGH_SCORES = 5;

finalScore.innerText = mostRecentScore;

// Auto-save using stored player name from home page
(function autoSave() {
    const playerName = localStorage.getItem('playerName') || 'Player';
    const playerPhone = localStorage.getItem('playerPhone') || '';
    if (mostRecentScore == null) {
        saveStatus && (saveStatus.innerText = 'No score to save.');
        return;
    }

    const entry = {
        score: parseInt(mostRecentScore, 10) || 0,
        name: playerName,
    };
    highScores.push(entry);
    highScores.sort((a, b) => b.score - a.score);
    highScores.splice(MAX_HIGH_SCORES);

    localStorage.setItem('highScores', JSON.stringify(highScores));

    // Append to plays log (persistent, separate from highscores)
    const playRecord = {
        name: playerName,
        score: entry.score,
        phone: playerPhone,
        date: new Date().toISOString(),
    };
    playsLog.push(playRecord);
    localStorage.setItem('playsLog', JSON.stringify(playsLog));

    saveStatus && (saveStatus.innerText = `Saved for ${playerName}.`);
    setTimeout(() => {
        window.location.assign('index.html');
    }, 2000);
})();