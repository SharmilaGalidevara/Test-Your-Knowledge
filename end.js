const finalScore = document.getElementById('finalScore');
const saveStatus = document.getElementById('saveStatus');
const mostRecentScore = localStorage.getItem('mostRecentScore');

const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const playsLog = JSON.parse(localStorage.getItem('playsLog')) || [];

const MAX_HIGH_SCORES = 5;

finalScore.innerText = mostRecentScore;

// Auto-save score
(function autoSave() {
    if (mostRecentScore == null) {
        saveStatus && (saveStatus.innerText = 'No score to save');
        return;
    }

    // Get player info from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const playerParam = urlParams.get('player');
    let playerInfo = null;

    if (playerParam) {
        try {
            playerInfo = JSON.parse(decodeURIComponent(playerParam));
        } catch (e) {
            console.error('Error parsing player data:', e);
        }
    }

    if (!playerInfo) {
        try {
            const savedPlayer = localStorage.getItem('playerInfo');
            if (savedPlayer) {
                playerInfo = JSON.parse(savedPlayer);
            }
        } catch (e) {
            console.error('Error loading player info:', e);
        }
    }

    // Only proceed if we have valid player info
    if (playerInfo && playerInfo.name && playerInfo.name !== 'Guest') {
        const entry = {
            score: parseInt(mostRecentScore, 10) || 0,
            name: playerInfo.name,
            phone: playerInfo.phone || '',
            timestamp: new Date().toISOString()
        };

        // Update high scores
        const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
        
        // Check if player already has a score
        const existingScoreIndex = highScores.findIndex(s => 
            (s.phone && s.phone === playerInfo.phone) || s.name === playerInfo.name
        );

        if (existingScoreIndex !== -1) {
            // Update if new score is higher
            if (entry.score > highScores[existingScoreIndex].score) {
                highScores[existingScoreIndex] = entry;
            }
        } else {
            highScores.push(entry);
        }

        // Sort and keep top scores
        highScores.sort((a, b) => b.score - a.score);
        highScores.splice(MAX_HIGH_SCORES);
        localStorage.setItem('highScores', JSON.stringify(highScores));

        // Add to plays log
        const playsLog = JSON.parse(localStorage.getItem('playsLog') || '[]');
        playsLog.push(entry);
        localStorage.setItem('playsLog', JSON.stringify(playsLog));
    }

    // Show success message without player name
    saveStatus && (saveStatus.innerText = 'Score saved');
    
    // Redirect after a short delay
    setTimeout(() => {
        window.location.assign('index.html');
    }, 2000);
})();