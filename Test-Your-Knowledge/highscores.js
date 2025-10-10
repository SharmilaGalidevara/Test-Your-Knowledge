const highScoresList = document.getElementById('highScoresList');
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];
const clearBtn = document.getElementById('clearBtn');

function render() {
  if (!highScores.length) {
    highScoresList.innerHTML = '<li>No high scores yet. Play a game!</li>';
    return;
  }
  highScoresList.innerHTML = highScores
    .map(({ name, score }) => `<li class="high-score">${name} - ${score}</li>`) 
    .join('');
}

render();

if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    const ok = window.confirm('Clear all saved high scores?');
    if (!ok) return;
    localStorage.removeItem('highScores');
    // Also clear in-memory array
    while (highScores.length) highScores.pop();
    render();
  });
}
