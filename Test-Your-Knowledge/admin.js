// Check if user is authenticated
function checkAuth() {
    const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
    if (!isAuthenticated) {
        // If not authenticated, redirect to home page
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Load high scores
function loadHighScores() {
    const scoresList = document.getElementById('scoresList');
    if (!scoresList) return;
    
    const highScores = JSON.parse(localStorage.getItem('highScores') || '[]');
    
    if (highScores.length === 0) {
        scoresList.innerHTML = '<p>No high scores recorded yet.</p>';
        return;
    }
    
    const scoresHTML = `
        <div style="width: 100%; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <colgroup>
                    <col style="width: 20%;">  <!-- Rank -->
                    <col style="width: 60%;">  <!-- Name -->
                    <col style="width: 20%;">  <!-- Score -->
                </colgroup>
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 0.8rem; text-align: center; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Rank</th>
                        <th style="padding: 0.8rem; text-align: left; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Name</th>
                        <th style="padding: 0.8rem; text-align: right; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${highScores.map((score, index) => `
                        <tr>
                            <td style="padding: 0.8rem; text-align: center; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${index + 1}</td>
                            <td style="padding: 0.8rem; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${(score.name || 'Guest').replace(/"/g, '&quot;')}">
                                ${score.name || 'Guest'}
                            </td>
                            <td style="padding: 0.8rem; text-align: right; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${score.score}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    scoresList.innerHTML = scoresHTML;
}

// Export player logs to CSV
function exportToCSV() {
    const plays = JSON.parse(localStorage.getItem('playsLog') || '[]');
    if (plays.length === 0) {
        alert('No player logs available to export.');
        return;
    }

    // CSV header
    let csvContent = 'No.,Date & Time,Player Name,Phone,Score\n';
    
    // Add rows
    plays.forEach((play, index) => {
        const date = play.timestamp ? new Date(play.timestamp) : new Date();
        const formattedDate = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Escape quotes and handle special characters
        const playerName = (play.playerName || 'Name Not Provided').replace(/"/g, '""');
        const phone = (play.phone || 'N/A').replace(/"/g, '""');
        
        csvContent += `"${index + 1}","${formattedDate}","${playerName}","${phone}",${play.score || 0}\n`;
    });

    // Create download link
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `quiz_results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }, 100);
}

// Clear high scores with confirmation
function clearHighScores() {
    if (confirm('Are you sure you want to clear all high scores? This cannot be undone.')) {
        localStorage.removeItem('highScores');
        loadHighScores();
        alert('High scores have been cleared.');
    }
}

// Clear player logs with confirmation
function clearPlayerLogs() {
    if (confirm('Are you sure you want to clear all player logs? This cannot be undone.')) {
        localStorage.removeItem('playsLog');
        loadPlayerLogs();
        alert('Player logs have been cleared.');
    }
}

// Load player logs
function loadPlayerLogs() {
    const playsList = document.getElementById('playsList');
    const exportBtn = document.getElementById('exportBtn');
    const clearBtn = document.getElementById('clearBtn');
    
    if (!playsList) return;
    
    const plays = JSON.parse(localStorage.getItem('playsLog') || '[]');
    
    if (plays.length === 0) {
        playsList.innerHTML = '<p>No player logs available.</p>';
        if (exportBtn) exportBtn.style.display = 'none';
        if (clearBtn) clearBtn.style.display = 'none';
        return;
    }
    
    // Show buttons when there's data
    if (exportBtn) exportBtn.style.display = 'inline-block';
    if (clearBtn) clearBtn.style.display = 'inline-block';
    
    // Get storage usage
    const storageInfo = getStorageInfo();
    
    const logsHTML = `
        <div style="margin-bottom: 1rem; color: #666; font-size: 0.9em;">
            Total entries: ${plays.length} | Storage used: ${storageInfo.usedKB} KB (${storageInfo.percentage}% of ${storageInfo.maxSizeMB} MB)
        </div>
        <div style="width: 100%; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
                <colgroup>
                    <col style="width: 10%;">  <!-- # -->
                    <col style="width: 45%;"> <!-- Player Name -->
                    <col style="width: 25%;"> <!-- Phone -->
                    <col style="width: 20%;"> <!-- Score -->
                </colgroup>
                <thead>
                    <tr style="background-color: #f2f2f2;">
                        <th style="padding: 0.8rem; text-align: center; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">#</th>
                        <th style="padding: 0.8rem; text-align: left; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Player Name</th>
                        <th style="padding: 0.8rem; text-align: left; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Phone</th>
                        <th style="padding: 0.8rem; text-align: right; border: 1px solid #ddd; position: sticky; top: 0; background: #f2f2f2;">Score</th>
                    </tr>
                </thead>
                <tbody>
                    ${plays.map((play, index) => {
                        return `
                            <tr>
                                <td style="padding: 0.8rem; text-align: center; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${index + 1}</td>
                                <td style="padding: 0.8rem; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${(play.name || play.playerName || 'Guest').replace(/"/g, '&quot;')}">
                                    ${play.name || play.playerName || 'Guest'}
                                </td>
                                <td style="padding: 0.8rem; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${(play.phone || 'N/A').replace(/"/g, '&quot;')}">
                                    ${play.phone || 'N/A'}
                                </td>
                                <td style="padding: 0.8rem; text-align: right; border: 1px solid #eee; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${play.score || 0}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    playsList.innerHTML = logsHTML;
}

// Get storage usage information
function getStorageInfo() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        const value = localStorage.getItem(key);
        total += key.length + value.length;
    }
    
    // Convert to KB and MB
    const usedKB = (total / 1024).toFixed(2);
    const maxSizeMB = 5; // Standard localStorage limit is 5MB
    const percentage = ((total / (maxSizeMB * 1024 * 1024)) * 100).toFixed(2);
    
    return { usedKB, maxSizeMB, percentage };
}

// Initialize admin page
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;
    
    // Load data
    loadHighScores();
    loadPlayerLogs();
    
    // Add event listeners
    const exportBtn = document.getElementById('exportBtn');
    const clearScoresBtn = document.getElementById('clearScoresBtn');
    const clearLogsBtn = document.getElementById('clearLogsBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (exportBtn) exportBtn.addEventListener('click', exportToCSV);
    if (clearScoresBtn) clearScoresBtn.addEventListener('click', clearHighScores);
    if (clearLogsBtn) clearLogsBtn.addEventListener('click', clearPlayerLogs);
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAdminAuthenticated');
            window.location.href = 'index.html';
        });
    }
});
