// ===== Konfiguration och hjälp-funktioner =====
const ARTICLE_NUMBER = 'XXXXX-Black-L';
const MISSING_OPTIONS = [2, 1, 5, 7, 3];
const $ = (s)=>document.querySelector(s);

function randomDigits(n){ let s=''; for(let i=0;i<n;i++) s+=Math.floor(Math.random()*10); return s; }
function roundTo5Min(d){ const ms5=5*60*1000; return new Date(Math.floor(d.getTime()/ms5)*ms5); }
function formatDateTime(d){ return d.toLocaleString(undefined,{year:'2-digit',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}); }
function minutesToHHMM(min){ const h = Math.floor(min/60); const m = min % 60; return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`; }

function generateRandomDeviations(count=30, hoursBack=12){
  const now = new Date(); const arr=[];
  for(let i=0;i<count;i++){
    const minutesBack = Math.floor(Math.random()*hoursBack*60);
    const ts = roundTo5Min(new Date(now.getTime()-minutesBack*60_000));
    arr.push({
      id:`${Date.now()}_${i}_${Math.random().toString(36).slice(2,7)}`,
      article: ARTICLE_NUMBER,
      sscc:`07${randomDigits(16)}`,
      missing: MISSING_OPTIONS[Math.floor(Math.random()*MISSING_OPTIONS.length)],
      createdAt: ts,
      selected:false,
    });
  }
  arr.sort((a,b)=>b.createdAt-a.createdAt);
  return arr;
}

// ===== App-state =====
let rows = generateRandomDeviations(30, 12);
let rangeHours = 12;
let search = '';

// ===== Rendering =====
function updateToggleAllButtonState(filtered){
  const allSelected = filtered.length>0 && filtered.every(r=>r.selected);
  $('#btnToggleAll').textContent = allSelected ? 'Avmarkera alla (visade)' : 'Markera alla (visade)';
}

function updateSummary(){
  const selectedCount = rows.filter(r=>r.selected).length;
  $('#countSelected').textContent = selectedCount;
  const minutes = selectedCount * 5;
  $('#sumMinutes').textContent = minutes;
  const hours = minutes/60;
  $('#sumHours').textContent = (Math.round(hours*100)/100).toFixed(2);
  $('#sumHHMM').textContent = minutesToHHMM(minutes);
  $('#btnExport').disabled = selectedCount===0;
}

function renderList(){
  const list = $('#list'); list.innerHTML='';
  const q = search.trim().toLowerCase();
  const filtered = rows.filter(r => !q || r.article.toLowerCase().includes(q) || r.sscc.toLowerCase().includes(q) || String(r.missing).includes(q));

  for(const r of filtered){
    const div = document.createElement('div'); div.className='row';
    const left = document.createElement('div'); left.className='left';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked=!!r.selected;
    cb.addEventListener('change', ()=>{ r.selected = cb.checked; updateSummary(); updateToggleAllButtonState(filtered); });

    const title = document.createElement('div');
    title.innerHTML = `<div style="font-weight:700">${r.article} <span class="badge mono">${r.sscc}</span></div>
                       <div class="muted" style="font-size:12px">Saknas: <strong>${r.missing}</strong> • ${formatDateTime(r.createdAt)}</div>`;
    left.append(cb, title);

    const right = document.createElement('div');
    right.innerHTML = `<span class="badge">5 min/avvikelse</span>`;

    div.append(left, right);
    list.appendChild(div);
  }

  $('#countTotal').textContent = rows.length;
  $('#countVisible').textContent = filtered.length;
  updateToggleAllButtonState(filtered);
  updateSummary();
}

// ===== Export =====
function exportPDF(){
  const selected = rows.filter(r=>r.selected);
  if(selected.length===0) return;
  const win = window.open('', '_blank');
  const style = `
    body{font-family:Arial,sans-serif;padding:24px;}
    h1{font-size:18px;margin:0 0 8px}
    .muted{color:#555;font-size:12px;margin-bottom:12px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px;font-size:12px}
    thead th{background:#f3f4f6;text-align:left}
  `;
  const rowsHtml = selected.map(r=>`<tr>
    <td>${r.article}</td>
    <td class="mono">${r.sscc}</td>
    <td>${r.missing}</td>
    <td>${formatDateTime(r.createdAt)}</td>
  </tr>`).join('');

  const minutes = selected.length*5;
  const hours = (minutes/60).toFixed(2);
  const hhmm = minutesToHHMM(minutes);

  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Avvikelser (markerade)</title><style>${style}</style></head><body>
    <h1>Avvikelser – markerade</h1>
    <div class="muted">Genererad: ${formatDateTime(new Date())}. Poster: ${selected.length}</div>
    <div style="margin:12px 0;font-size:14px">Totalt: ${minutes} min = ${hours} h = ${hhmm}</div>
    <table><thead><tr><th>Artikel</th><th>SSCC</th><th>Saknas (pcs)</th><th>Tid</th></tr></thead><tbody>${rowsHtml}</tbody></table>
  </body></html>`);
  win.document.close();
  setTimeout(()=>{ win.focus(); win.print(); }, 300);
}

// ===== Event-bindningar =====
document.addEventListener('DOMContentLoaded', () => {
  $('#search').addEventListener('input', e=>{ search = e.target.value; renderList(); });
  $('#range').addEventListener('change', e=>{ rangeHours = Number(e.target.value); rows = generateRandomDeviations(30, rangeHours); renderList(); });
  $('#btnRegenerate').addEventListener('click', ()=>{ rows = generateRandomDeviations(30, rangeHours); renderList(); });
  $('#btnToggleAll').addEventListener('click', ()=>{
    const q = search.trim().toLowerCase();
    const filtered = rows.filter(r => !q || r.article.toLowerCase().includes(q) || r.sscc.toLowerCase().includes(q) || String(r.missing).includes(q));
    const allSelected = filtered.length>0 && filtered.every(r=>r.selected);
    for(const r of filtered){ r.selected = !allSelected; }
    renderList();
  });
  $('#btnExport').addEventListener('click', exportPDF);

  renderList();
});
