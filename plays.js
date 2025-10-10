const playsBody = document.getElementById('playsBody');
const exportBtn = document.getElementById('exportBtn');
const clearPlaysBtn = document.getElementById('clearPlaysBtn');

function getLog() {
  return JSON.parse(localStorage.getItem('playsLog')) || [];
}

function render() {
  const rows = getLog();
  if (!rows.length) {
    playsBody.innerHTML = '<tr><td colspan="5">No plays recorded yet.</td></tr>';
    return;
  }
  const sorted = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date));
  playsBody.innerHTML = sorted
    .map((r, idx) => {
      const dateStr = new Date(r.date).toLocaleString();
      return `<tr><td>${idx + 1}</td><td>${r.name}</td><td>${r.phone || ''}</td><td>${r.score}</td><td>${dateStr}</td></tr>`;
    })
    .join('');
}

function toCSV(rows) {
  const header = ['#', 'Name', 'Phone', 'Score', 'Date'];
  const data = rows.map((r, i) => [i + 1, r.name, r.phone || '', r.score, r.date]);
  const lines = [header, ...data].map(cols => cols.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','));
  return lines.join('\n');
}

exportBtn.addEventListener('click', () => {
  const rows = getLog();
  const sorted = [...rows].sort((a, b) => new Date(b.date) - new Date(a.date));
  const csv = toCSV(sorted);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plays_log.csv';
  a.click();
  URL.revokeObjectURL(url);
});

clearPlaysBtn.addEventListener('click', () => {
  const ok = window.confirm('Clear the entire plays log? This will NOT affect High Scores.');
  if (!ok) return;
  localStorage.removeItem('playsLog');
  render();
});

render();
