// ─────────────────────────────────────────────────────────────────────────────
// FSS TRACKER — app.js
// Functional Strength Systems · functionalstrengthsystems.co
// ─────────────────────────────────────────────────────────────────────────────

// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
// Replace with your actual values from Supabase → Settings → API
const SUPABASE_URL = 'https://fxxnychsxqbpaqgtvesg.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4eG55Y2hzeHFicGFxZ3R2ZXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NzE0NDksImV4cCI6MjA5NTM0NzQ0OX0.XLeZTP_DfTml4fa8AbtoN6BedATe3Jk3X2Rb199G-4g'; // ← paste eyJ... key here

// ── SUPABASE CLIENT ──────────────────────────────────────────────────────────
let sb = null;

async function initSupabase() {
  // Load Supabase from CDN
  if (!window.supabase) {
    await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js');
  }
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const COLORS = [
  ['#1C2951','#EEF1F8'],  // navy
  ['#6ea32e','#F0F8E6'],  // green
  ['#B45309','#FFFBEB'],  // amber
  ['#B91C1C','#FEF2F2'],  // red
  ['#1D4ED8','#EFF6FF'],  // blue
  ['#7C3AED','#F5F3FF'],  // violet
  ['#0F766E','#F0FDFA'],  // teal
  ['#BE185D','#FDF2F8'],  // pink
];
const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

// ── LOCAL STATE ──────────────────────────────────────────────────────────────
let clients = [];
let modalCtx = { cid: null, wi: 0, day: '', exercises: [] };

// ── DEFAULT CLIENT DATA ──────────────────────────────────────────────────────
const DEFAULT_CLIENTS = [
  {name:'Danial',      freq:3,pkg:20,price:3360,sessions:12,goal:'Strength & conditioning',  status:'away',  notes:'Away mid-June. 8 sessions left.',         log:[],program:{},color:0},
  {name:'Adam',        freq:2,pkg:10,price:1080,sessions:10,goal:'Humility — renews 1st monthly', status:'active',notes:'',                                  log:[],program:{},color:1},
  {name:'Dhruva',      freq:2,pkg:10,price:1200,sessions:4, goal:'General fitness',           status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:2},
  {name:'Nell',        freq:3,pkg:20,price:2400,sessions:14,goal:'Fat loss & strength',       status:'active',notes:'3×/week. 6 sessions left.',              log:[],program:{},color:3},
  {name:'Paul',        freq:2,pkg:10,price:1320,sessions:8, goal:'Muscle gain',               status:'active',notes:'',                                       log:[],program:{},color:4},
  {name:'Kuhen',       freq:2,pkg:10,price:900, sessions:4, goal:'Mobility & strength',       status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:5},
  {name:'Shirley',     freq:2,pkg:10,price:1440,sessions:8, goal:'Toning & fitness',          status:'active',notes:'',                                       log:[],program:{},color:6},
  {name:'Jo',          freq:1,pkg:10,price:1200,sessions:7, goal:'General health',            status:'active',notes:'',                                       log:[],program:{},color:7},
  {name:'Tasha',       freq:2,pkg:10,price:1200,sessions:4, goal:'Weight loss',               status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:0},
  {name:'Kate',        freq:1,pkg:10,price:800, sessions:8, goal:'Strength',                  status:'active',notes:'',                                       log:[],program:{},color:1},
  {name:'Hannah',      freq:1,pkg:10,price:800, sessions:8, goal:'Fitness & confidence',      status:'active',notes:'',                                       log:[],program:{},color:2},
  {name:'Tuan Syed',   freq:2,pkg:20,price:2240,sessions:18,goal:'Performance',              status:'active',notes:'2 sessions left — finish & invoice now.', log:[],program:{},color:3},
  {name:'Bernice',     freq:2,pkg:10,price:1440,sessions:4, goal:'Body composition',          status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:4},
  {name:'Lynette',     freq:2,pkg:10,price:1440,sessions:4, goal:'Strength',                  status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:5},
  {name:'Dylan & Sara',freq:2,pkg:10,price:800, sessions:8, goal:'Couples training',          status:'active',notes:'Confirm status.',                        log:[],program:{},color:6},
  {name:'Anne Koh',    freq:2,pkg:10,price:1440,sessions:10,goal:'Fitness',                   status:'active',notes:'Paid ✓',                                 log:[],program:{},color:7},
  {name:'Sirraj',      freq:2,pkg:10,price:2000,sessions:4, goal:'Performance',               status:'away',  notes:'Away mid-June.',                         log:[],program:{},color:0},
  {name:'Helen',       freq:2,pkg:10,price:1320,sessions:8, goal:'Strength & health',         status:'active',notes:'',                                       log:[],program:{},color:1},
  {name:'Sirraj Wife', freq:2,pkg:10,price:2000,sessions:0, goal:'General fitness',           status:'new',   notes:'Potential — close this week.',           log:[],program:{},color:2},
];

// ── HELPERS ──────────────────────────────────────────────────────────────────
const rem  = c => Math.max(0, c.pkg - c.sessions);
const att  = c => c.pkg > 0 ? Math.round(c.sessions / c.pkg * 100) : 0;
const col  = i => COLORS[i % COLORS.length];
const fdate= d => d ? new Date(d).toLocaleDateString('en-MY', {day:'numeric', month:'short'}) : '';
const esc  = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');

function pillStatus(c) {
  const r = rem(c);
  if (c.status === 'new')    return {lbl:'New client',  cls:'p-navy'};
  if (r === 0)               return {lbl:'⚡ Invoice now', cls:'p-red'};
  if (c.status === 'away')   return {lbl:`✈ Away · ${r} left`, cls:'p-amber'};
  const thr = c.freq >= 3 ? 3 : 2;
  if (r <= thr)              return {lbl:`${r} left · Renew`, cls:'p-amber'};
  return {lbl:`${r} sessions left`, cls:'p-green'};
}

function toast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.borderLeftColor = isError ? '#EF4444' : 'var(--green)';
  t.style.display = 'block';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.display = 'none', 2400);
}

function setSyncing(active) {
  const d = document.getElementById('syncDot');
  if (!d) return;
  d.className = 'sync-dot' + (active ? ' syncing' : '');
}

// ── SUPABASE DB OPERATIONS ───────────────────────────────────────────────────
async function dbLoad() {
  if (!sb) return false;
  setSyncing(true);
  try {
    const { data, error } = await sb.from('clients').select('*').order('created_at');
    if (error) throw error;
    if (data && data.length > 0) {
      clients = data.map(r => ({
        ...r,
        log:     Array.isArray(r.log)     ? r.log     : [],
        program: typeof r.program === 'object' ? r.program : {},
      }));
      setSyncing(false);
      return true;
    }
    return false;
  } catch (e) {
    console.error('DB load error:', e);
    setSyncing(false);
    document.getElementById('syncDot').className = 'sync-dot error';
    return false;
  }
}

async function dbSeed() {
  if (!sb) return;
  setSyncing(true);
  try {
    const rows = DEFAULT_CLIENTS.map(c => ({
      name: c.name, freq: c.freq, pkg: c.pkg, price: c.price,
      sessions: c.sessions, goal: c.goal, status: c.status,
      notes: c.notes, color: c.color,
      log: c.log, program: c.program,
    }));
    const { data, error } = await sb.from('clients').insert(rows).select();
    if (error) throw error;
    clients = data.map(r => ({...r, log: r.log||[], program: r.program||{}}));
    setSyncing(false);
    toast('All clients loaded ✓');
  } catch (e) {
    console.error('DB seed error:', e);
    setSyncing(false);
    toast('Seed failed — check Supabase config', true);
  }
}

async function dbSave(client) {
  if (!sb || !client.id) return;
  setSyncing(true);
  try {
    const { error } = await sb.from('clients').update({
      name: client.name, freq: client.freq, pkg: client.pkg,
      price: client.price, sessions: client.sessions,
      goal: client.goal, status: client.status,
      notes: client.notes, color: client.color,
      log: client.log, program: client.program,
    }).eq('id', client.id);
    if (error) throw error;
    setSyncing(false);
  } catch (e) {
    console.error('DB save error:', e);
    setSyncing(false);
    toast('Save failed — check connection', true);
  }
}

async function dbInsert(clientData) {
  if (!sb) return null;
  setSyncing(true);
  try {
    const { data, error } = await sb.from('clients').insert([clientData]).select().single();
    if (error) throw error;
    setSyncing(false);
    return data;
  } catch (e) {
    console.error('DB insert error:', e);
    setSyncing(false);
    toast('Insert failed', true);
    return null;
  }
}

async function dbDelete(id) {
  if (!sb || !id) return;
  setSyncing(true);
  try {
    const { error } = await sb.from('clients').delete().eq('id', id);
    if (error) throw error;
    setSyncing(false);
  } catch (e) {
    console.error('DB delete error:', e);
    setSyncing(false);
  }
}

// ── NAVIGATION ───────────────────────────────────────────────────────────────
function showScreen(id, btn) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  if (btn) btn.classList.add('active');
  if (id === 'dashboard') renderDash();
  if (id === 'clients')   renderClients();
  if (id === 'report')    renderRepSelector();
}

// ── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDash() {
  const active  = clients.filter(c => c.status === 'active' || c.status === 'away').length;
  const mrr     = clients.filter(c => c.status !== 'new').reduce((s,c) => s + (c.price||0), 0);
  const away    = clients.filter(c => c.status === 'away').length;
  const urgent  = clients.filter(c => {
    const r = rem(c);
    return r === 0 || (c.status === 'away' && r > 0) || (r <= 2 && c.status === 'active');
  }).length;

  document.getElementById('sumStrip').innerHTML = `
    <div class="s-card"><div class="s-val" style="color:var(--navy)">${active}</div><div class="s-label">Active clients</div></div>
    <div class="s-card"><div class="s-val" style="color:var(--green)">RM ${mrr.toLocaleString()}</div><div class="s-label">Monthly pipeline</div></div>
    <div class="s-card"><div class="s-val" style="color:${urgent > 0 ? 'var(--red)' : 'var(--green)'}">${urgent}</div><div class="s-label">Need attention</div></div>
    <div class="s-card"><div class="s-val" style="color:var(--amber)">${away}</div><div class="s-label">Away</div></div>
  `;

  const alerts = [];
  clients.forEach(c => {
    const r = rem(c);
    if (r === 0 && c.status !== 'new')
      alerts.push({t:'a-red',   i:'🔴', title:`${c.name} — block complete`,           sub:`Invoice RM ${(c.price||0).toLocaleString()} now`});
    else if (c.status === 'away' && r > 0)
      alerts.push({t:'a-amber', i:'✈️',  title:`${c.name} away — ${r} sessions left`,  sub:'Ask to pre-pay next block before return'});
    else if (r <= 2 && c.status === 'active')
      alerts.push({t:'a-amber', i:'⏱',  title:`${c.name} — ${r} session${r===1?'':'s'} left`, sub:'Start renewal conversation now'});
    if (c.status === 'new')
      alerts.push({t:'a-navy',  i:'🌱', title:`${c.name} — potential new client`,      sub:'Close this week'});
  });

  const al = document.getElementById('alertList');
  al.innerHTML = alerts.length === 0
    ? '<div class="alert-list"><div class="alert a-green"><div class="alert-icon">✅</div><div class="alert-body"><div class="alert-title">All good — no urgent actions</div></div></div></div>'
    : '<div class="alert-list">' + alerts.map(a => `
        <div class="alert ${a.t}">
          <div class="alert-icon">${a.i}</div>
          <div class="alert-body">
            <div class="alert-title">${esc(a.title)}</div>
            <div class="alert-sub">${esc(a.sub)}</div>
          </div>
        </div>`).join('') + '</div>';

  document.getElementById('dashGrid').innerHTML = clients.map(c => cardHTML(c, false)).join('');
}

// ── CLIENTS SCREEN ───────────────────────────────────────────────────────────
function renderClients() {
  document.getElementById('clientGrid').innerHTML = clients.map(c => cardHTML(c, true)).join('');
}

function filterClients() {
  const q = (document.getElementById('clientSearch')?.value || '').toLowerCase();
  const filtered = q ? clients.filter(c => c.name.toLowerCase().includes(q)) : clients;
  document.getElementById('clientGrid').innerHTML = filtered.map(c => cardHTML(c, true)).join('');
}

// ── CARD HTML ────────────────────────────────────────────────────────────────
function cardHTML(c, detailed) {
  const r   = rem(c);
  const pct = Math.round(c.sessions / c.pkg * 100);
  const ps  = pillStatus(c);
  const [fg, bg] = col(c.color || 0);

  const dots = Array.from({length: c.pkg}, (_, i) => {
    if (i < c.sessions)       return `<div class="dot dot-done"></div>`;
    if (c.status === 'away')  return `<div class="dot dot-away"></div>`;
    return `<div class="dot dot-left"></div>`;
  }).join('');

  let detail = '';
  if (detailed) {
    const logHTML = c.log && c.log.length
      ? `<div class="log-list">${c.log.slice().reverse().slice(0,10).map((l,i) => `
          <div class="log-entry">
            <div class="log-num">#${c.log.length - i}</div>
            <div class="log-text">${esc(l.note||'—')}</div>
            <div class="log-date">${fdate(l.date)}</div>
          </div>`).join('')}</div>`
      : '<div class="empty-state" style="padding:10px 0;">No sessions logged yet. Log your first session above.</div>';

    detail = `
      <div class="etabs-bar" id="etabs-${c.id}">
        <button class="etab active" onclick="switchEtab('${c.id}','overview',this)">Overview</button>
        <button class="etab" onclick="switchEtab('${c.id}','program',this)">Program</button>
        <button class="etab" onclick="switchEtab('${c.id}','log',this)">Log</button>
      </div>

      <div class="etab-content active" id="et-overview-${c.id}">
        <div class="form-grid">
          <div class="field">
            <div class="fl">Session note (today)</div>
            <input class="fi" id="note-${c.id}" placeholder="e.g. Hit 60kg deadlift, great depth">
          </div>
          <div class="field">
            <div class="fl">Primary goal</div>
            <input class="fi" id="goal-${c.id}" value="${esc(c.goal||'')}">
          </div>
          <div class="field">
            <div class="fl">Package price (RM)</div>
            <input class="fi" id="price-${c.id}" type="number" value="${c.price||0}">
          </div>
          <div class="field">
            <div class="fl">Status</div>
            <select class="fi" id="status-${c.id}">
              <option value="active" ${c.status==='active'?'selected':''}>Active</option>
              <option value="away"   ${c.status==='away'  ?'selected':''}>Away</option>
              <option value="new"    ${c.status==='new'   ?'selected':''}>New / potential</option>
              <option value="paused" ${c.status==='paused'?'selected':''}>Paused</option>
            </select>
          </div>
        </div>
        <div class="field" style="margin-bottom:12px;">
          <div class="fl">Notes</div>
          <textarea class="fi ta" id="notes-${c.id}">${esc(c.notes||'')}</textarea>
        </div>
        <div class="btn-row">
          <button class="btn btn-green" onclick="logSession('${c.id}')">✓ Log session</button>
          <button class="btn btn-ghost" onclick="saveClient('${c.id}')">Save</button>
          <button class="btn btn-amber" onclick="renewClient('${c.id}')">↻ New block</button>
          <button class="btn btn-red"   onclick="removeClient('${c.id}')">Remove</button>
        </div>
      </div>

      <div class="etab-content" id="et-program-${c.id}">
        ${buildProgHTML(c)}
      </div>

      <div class="etab-content" id="et-log-${c.id}">
        ${logHTML}
      </div>`;
  }

  return `
    <div class="client-card" id="card-${c.id}">
      <div class="card-top" onclick="toggleCard('${c.id}')">
        <div class="avatar" style="background:${bg};color:${fg}">${c.name[0].toUpperCase()}</div>
        <div class="card-info">
          <div class="card-name">${esc(c.name)}</div>
          <div class="card-meta">${c.freq}×/week · ${c.pkg} sessions · RM ${(c.price||0).toLocaleString()}</div>
        </div>
        <div class="card-right">
          <span class="pill ${ps.cls}">${ps.lbl}</span>
          <span class="chev">›</span>
        </div>
      </div>
      <div class="dots-wrap">
        <div class="dots-row">${dots}</div>
        <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      </div>
      ${detail}
    </div>`;
}

// ── TOGGLE / TABS ─────────────────────────────────────────────────────────────
function toggleCard(id) {
  const card = document.getElementById('card-' + id);
  if (!card) return;
  const wasOpen = card.classList.contains('expanded');
  document.querySelectorAll('.client-card').forEach(c => c.classList.remove('expanded'));
  if (!wasOpen) card.classList.add('expanded');
}

function switchEtab(cid, tab, btn) {
  document.querySelectorAll(`#etabs-${cid} .etab`).forEach(b => b.classList.remove('active'));
  ['overview','program','log'].forEach(t => {
    const el = document.getElementById(`et-${t}-${cid}`);
    if (el) el.classList.toggle('active', t === tab);
  });
  btn.classList.add('active');
}

// ── PROGRAM BUILDER ───────────────────────────────────────────────────────────
function buildProgHTML(c) {
  const prog  = c.program || {};
  const weeks = Array.isArray(prog.weeks) && prog.weeks.length ? prog.weeks : [{days:{}}];

  let html = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
      <div style="font-size:13px;font-weight:800;color:var(--navy);">Weekly program</div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost" style="font-size:11px;padding:5px 12px;" onclick="addWeek('${c.id}')">+ Week</button>
        <button class="btn btn-navy"  style="font-size:11px;padding:5px 12px;" onclick="saveProg('${c.id}')">Save</button>
      </div>
    </div>`;

  weeks.forEach((week, wi) => {
    html += `<div class="week-block">
      <div class="week-head">
        <span class="week-label">Week ${wi + 1}</span>
        ${weeks.length > 1 ? `<button class="btn btn-red" style="font-size:10px;padding:3px 8px;" onclick="removeWeek('${c.id}',${wi})">Remove</button>` : ''}
      </div>
      <div class="day-grid">`;

    DAYS.forEach(day => {
      const d = week.days && week.days[day];
      if (d && d.focus) {
        html += `<div class="day-cell active-day" onclick="openDayModal('${c.id}',${wi},'${day}')">
          <div class="day-name">${day}</div>
          <div class="workout-chip">${esc(d.focus)}</div>
          <div class="ex-count">${(d.exercises||[]).length} ex</div>
        </div>`;
      } else {
        html += `<div class="day-cell" onclick="openDayModal('${c.id}',${wi},'${day}')">
          <div class="day-name">${day}</div>
          <div style="font-size:18px;color:var(--border2);margin-top:4px;">+</div>
        </div>`;
      }
    });

    html += `</div></div>`;
  });

  return html;
}

function addWeek(cid) {
  const c = clients.find(x => x.id == cid); if (!c) return;
  if (!c.program) c.program = {};
  if (!Array.isArray(c.program.weeks)) c.program.weeks = [{days:{}}];
  c.program.weeks.push({days:{}});
  renderClients();
}

function removeWeek(cid, wi) {
  const c = clients.find(x => x.id == cid); if (!c) return;
  if (!c.program?.weeks || c.program.weeks.length <= 1) return;
  c.program.weeks.splice(wi, 1);
  renderClients();
}

async function saveProg(cid) {
  const c = clients.find(x => x.id == cid); if (!c) return;
  await dbSave(c);
  toast('Program saved ✓');
}

// ── DAY MODAL ─────────────────────────────────────────────────────────────────
function openDayModal(cid, wi, day) {
  const c = clients.find(x => x.id == cid); if (!c) return;
  if (!c.program) c.program = {};
  if (!Array.isArray(c.program.weeks)) c.program.weeks = [{days:{}}];
  while (c.program.weeks.length <= wi) c.program.weeks.push({days:{}});
  if (!c.program.weeks[wi].days) c.program.weeks[wi].days = {};

  const existing = c.program.weeks[wi].days[day];
  modalCtx = {
    cid, wi, day,
    exercises: existing?.exercises ? JSON.parse(JSON.stringify(existing.exercises)) : []
  };

  document.getElementById('modalTitle').textContent = `${day} — Week ${wi+1} · ${c.name}`;
  document.getElementById('mFocus').value   = existing?.focus || '';
  document.getElementById('mCustom').value  = existing?.label || '';
  renderModalExList();
  document.getElementById('dayModal').classList.add('open');
}

function closeDayModal(e) {
  if (e && e.target !== document.getElementById('dayModal')) return;
  document.getElementById('dayModal').classList.remove('open');
}

function renderModalExList() {
  const el = document.getElementById('mExList');
  if (!el) return;
  if (!modalCtx.exercises.length) {
    el.innerHTML = '<div class="empty-state" style="padding:8px 0;">No exercises yet — add below.</div>';
    return;
  }
  el.innerHTML = '<div class="ex-list">' + modalCtx.exercises.map((e, i) => `
    <div class="ex-row">
      <div class="ex-num">${i+1}</div>
      <div class="ex-name">${esc(e.name)}</div>
      <div class="ex-sets">${esc(e.sets||'')}</div>
      <button class="ex-del" onclick="delModalEx(${i})">×</button>
    </div>`).join('') + '</div>';
}

function addModalEx() {
  const n = document.getElementById('mExName');
  const s = document.getElementById('mExSets');
  if (!n?.value.trim()) return;
  modalCtx.exercises.push({name: n.value.trim(), sets: s?.value.trim() || ''});
  n.value = ''; if(s) s.value = '';
  renderModalExList();
  n.focus();
}

function delModalEx(i) {
  modalCtx.exercises.splice(i, 1);
  renderModalExList();
}

async function saveModalDay() {
  const c = clients.find(x => x.id == modalCtx.cid); if (!c) return;
  const focus  = document.getElementById('mFocus')?.value || '';
  const custom = document.getElementById('mCustom')?.value.trim() || '';

  if (!c.program) c.program = {};
  if (!Array.isArray(c.program.weeks)) c.program.weeks = [{days:{}}];
  while (c.program.weeks.length <= modalCtx.wi) c.program.weeks.push({days:{}});
  if (!c.program.weeks[modalCtx.wi].days) c.program.weeks[modalCtx.wi].days = {};

  if (focus) {
    c.program.weeks[modalCtx.wi].days[modalCtx.day] = {
      focus:      custom || focus,
      exercises:  modalCtx.exercises,
    };
  } else {
    delete c.program.weeks[modalCtx.wi].days[modalCtx.day];
  }

  await dbSave(c);
  toast(`${modalCtx.day} saved ✓`);
  document.getElementById('dayModal').classList.remove('open');
  renderClients();
}

// ── CLIENT ACTIONS ────────────────────────────────────────────────────────────
async function logSession(id) {
  const c = clients.find(x => x.id == id); if (!c) return;
  const noteEl = document.getElementById('note-' + id);
  const note   = noteEl?.value.trim() || '';
  if (c.sessions >= c.pkg) { toast('Block complete — start new block first', true); return; }
  c.sessions++;
  if (!Array.isArray(c.log)) c.log = [];
  c.log.push({date: new Date().toISOString(), note: note || `Session ${c.sessions} completed`});
  if (noteEl) noteEl.value = '';
  await dbSave(c);
  toast(`Session ${c.sessions}/${c.pkg} logged for ${c.name} ✓`);
  renderClients();
}

async function saveClient(id) {
  const c = clients.find(x => x.id == id); if (!c) return;
  c.goal   = document.getElementById('goal-'  + id)?.value   || c.goal;
  c.price  = parseInt(document.getElementById('price-'  + id)?.value) || c.price;
  c.status = document.getElementById('status-' + id)?.value  || c.status;
  c.notes  = document.getElementById('notes-'  + id)?.value  || '';
  await dbSave(c);
  toast(`${c.name} saved ✓`);
  renderClients();
}

async function renewClient(id) {
  const c = clients.find(x => x.id == id); if (!c) return;
  if (!confirm(`Start new ${c.pkg}-session block for ${c.name}?`)) return;
  c.sessions = 0;
  c.status   = 'active';
  if (!Array.isArray(c.log)) c.log = [];
  c.log.push({date: new Date().toISOString(), note: '— New block started —'});
  await dbSave(c);
  toast(`New block started for ${c.name} ✓`);
  renderClients();
  renderDash();
}

async function removeClient(id) {
  const c = clients.find(x => x.id == id); if (!c) return;
  if (!confirm(`Remove ${c.name} from FSS Tracker?`)) return;
  await dbDelete(id);
  clients = clients.filter(x => x.id != id);
  toast(`${c.name} removed`);
  renderClients();
  renderDash();
}

async function addClient() {
  const name   = document.getElementById('nName')?.value.trim();
  const freq   = parseInt(document.getElementById('nFreq')?.value);
  const pkg    = parseInt(document.getElementById('nPkg')?.value);
  const price  = parseInt(document.getElementById('nPrice')?.value) || 0;
  const goal   = document.getElementById('nGoal')?.value.trim()   || '';
  const status = document.getElementById('nStatus')?.value        || 'active';
  const notes  = document.getElementById('nNotes')?.value.trim()  || '';
  if (!name) { toast('Enter a client name', true); return; }

  const data = {
    name, freq, pkg, price, sessions: 0, goal, status, notes,
    color: clients.length % COLORS.length, log: [], program: {},
  };
  const inserted = await dbInsert(data);
  if (inserted) {
    clients.push({...inserted, log: inserted.log||[], program: inserted.program||{}});
    toast(`${name} added ✓`);
    ['nName','nPrice','nGoal','nNotes'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    showScreen('clients', document.querySelectorAll('.nav-btn')[1]);
  }
}

// ── REPORTS ───────────────────────────────────────────────────────────────────
function renderRepSelector() {
  document.getElementById('repSelector').innerHTML =
    clients.filter(c => c.status !== 'new').map(c =>
      `<button class="rclient-btn" onclick="genReport('${c.id}',this)">${esc(c.name)}</button>`
    ).join('');
  document.getElementById('repOutput').innerHTML =
    '<div class="empty-state">Select a client above to generate their report and WhatsApp message.</div>';
}

function genReport(id, btn) {
  document.querySelectorAll('.rclient-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const c = clients.find(x => x.id == id); if (!c) return;

  const a   = att(c), r = rem(c);
  const [fg, bg] = col(c.color || 0);
  const attColor = a >= 90 ? 'var(--green)' : a >= 70 ? 'var(--amber)' : 'var(--red)';
  const month    = new Date().toLocaleString('en-MY', {month:'long', year:'numeric'});
  const hi       = (c.log||[]).filter(l => l.note && l.note !== '— New block started —').slice(-5);

  const waMsg = `Hey ${c.name}! 🙌

Here's your end-of-block summary — ${month}:

✅ Sessions completed: ${c.sessions}/${c.pkg}
📊 Attendance: ${a}%
💪 Goal this block: ${c.goal||'—'}
${hi.length ? '\n🏆 Highlights:\n' + hi.map(h => `• ${h.note}`).join('\n') : ''}
${c.notes ? '\n📝 ' + c.notes : ''}

You've been putting in real work — it shows. Let's keep this going 🔥

Invoice for your next ${c.pkg}-session block: RM ${(c.price||0).toLocaleString()}
Once settled I'll lock in your schedule. Let me know if you need to adjust days or times! 💪

— Mush | Functional Strength Systems`;

  document.getElementById('repOutput').innerHTML = `
    <div class="report-card">
      <div class="rep-head">
        <div style="display:flex;align-items:center;gap:14px;">
          <div class="avatar" style="background:rgba(255,255,255,.2);color:#fff;width:46px;height:46px;font-size:20px;font-weight:900;">
            ${c.name[0].toUpperCase()}
          </div>
          <div>
            <div class="rep-name">${esc(c.name)}</div>
            <div class="rep-sub">End of block · ${month} · ${c.pkg} sessions · ${c.freq}×/week</div>
          </div>
        </div>
      </div>
      <div class="rep-body">
        <div class="stat-row">
          <div class="stat-box"><div class="stat-val" style="color:${attColor}">${c.sessions}/${c.pkg}</div><div class="stat-lbl">Done</div></div>
          <div class="stat-box"><div class="stat-val" style="color:${attColor}">${a}%</div><div class="stat-lbl">Attendance</div></div>
          <div class="stat-box"><div class="stat-val" style="color:var(--amber)">${r}</div><div class="stat-lbl">Remaining</div></div>
        </div>

        <div class="rsec">Goal this block</div>
        <div class="goal-item"><span>🎯</span><span>${esc(c.goal||'Not set')}</span></div>

        ${hi.length ? `<div class="rsec">Session highlights</div>${hi.map(h=>`
          <div class="goal-item"><span>💪</span>
            <span>${esc(h.note)} <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--text3);margin-left:6px;">${fdate(h.date)}</span></span>
          </div>`).join('')}` : ''}

        ${c.notes ? `<div class="rsec">Trainer notes</div><div class="goal-item"><span>📝</span><span>${esc(c.notes)}</span></div>` : ''}

        <div class="rsec">Invoice — next block</div>
        <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;">
          <div class="inv-row"><span>Client</span><span>${esc(c.name)}</span></div>
          <div class="inv-row"><span>Package</span><span>${c.pkg} sessions · ${c.freq}×/week</span></div>
          <div class="inv-row"><span>Per session</span><span>RM ${Math.round((c.price||0)/c.pkg)}</span></div>
          <div class="inv-row"><span>Total</span><span>RM ${(c.price||0).toLocaleString()}</span></div>
        </div>

        <div class="rsec">WhatsApp message — copy &amp; send</div>
        <div class="msg-box">${waMsg.replace(/\n/g,'<br>')}</div>
        <button class="btn btn-navy btn-full" style="margin-top:12px;" onclick="copyReport(\`${waMsg.replace(/`/g,"'").replace(/\n/g,'\\n')}\`)">
          📋 Copy WhatsApp message
        </button>
      </div>
    </div>`;
}

function copyReport(msg) {
  const decoded = msg.replace(/\\n/g, '\n');
  navigator.clipboard.writeText(decoded)
    .then(() => toast('Message copied ✓'))
    .catch(() => toast('Select and copy the message text'));
}

// ── INIT ─────────────────────────────────────────────────────────────────────
async function init() {
  document.getElementById('curMonth').textContent =
    new Date().toLocaleString('en-MY', {month:'long', year:'numeric'});

  try {
    await initSupabase();
    const loaded = await dbLoad();
    if (!loaded) {
      // First time — seed the database with default clients
      await dbSeed();
    }
  } catch (e) {
    console.error('Init error:', e);
    // Fall back to defaults so UI still works
    clients = JSON.parse(JSON.stringify(DEFAULT_CLIENTS));
    document.getElementById('syncDot').className = 'sync-dot error';
    toast('Running offline — check Supabase config', true);
  }

  renderDash();

  // Hide loading screen
  const ls = document.getElementById('loadingScreen');
  ls.style.opacity = '0';
  setTimeout(() => {
    ls.style.display = 'none';
    document.getElementById('app').style.display = 'block';
  }, 400);
}

document.addEventListener('DOMContentLoaded', init);
