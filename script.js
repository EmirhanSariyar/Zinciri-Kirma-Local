// ─── CONSTANTS ───────────────────────────────────────────────
const COLORS = ['#d4a853','#c4824a','#6aaa6a','#5a9ec4','#a47bc4','#c45a5a','#4ab8b8','#c4b84a'];
const WDAYS  = ['Pzt','Sal','Çar','Per','Cum','Cmt','Paz'];
const MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const QUOTES = [
  { t: 'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.',              a: 'Robert Collier' },
  { t: 'Zinciri kırma. Her gün o halkayı ekle.',                               a: 'Jerry Seinfeld' },
  { t: 'Disiplin, hedeflerinle sevgin arasındaki köprüdür.',                   a: 'Jim Rohn' },
  { t: 'Her yolculuk tek bir adımla başlar.',                                   a: 'Lao Tzu' },
  { t: 'Motivasyon seni başlatır, alışkanlık seni ilerletir.',                 a: 'Jim Ryun' },
  { t: 'Küçük değişiklikler zamanla büyük farklılıklar yaratır.',              a: 'Anonim' },
  { t: 'Kendine iyi alışkanlıklar edin; kötü alışkanlıklar seni edinmeden önce.', a: 'Anonim' },
  { t: 'Kazananlar her gün yapmak istemediklerini de yaparlar.',               a: 'Ed Macauley' },
  { t: 'Bir şeyi sürekli yaparsan o şey kolaylaşmaz; sen güçlenirsin.',        a: 'Anonim' },
  { t: 'Eylem, endişenin en iyi panzehiridir.',                                a: 'Joan Baez' },
  { t: 'İnsanlar değil, alışkanlıklar başarılı ya da başarısız olur.',         a: 'Anonim' },
  { t: 'Bugün acı çekerek çalışmak, yarın ağlamadan yaşamaktır.',              a: 'Anonim' },
  { t: 'Her yeni sabah yeniden başlama fırsatıdır.',                           a: 'Anonim' },
  { t: 'Gelişim mükemmeliyette değil, süreklilikte gizlidir.',                 a: 'Anonim' },
  { t: 'Güç, bedenin yeterliliğinden değil irade gücünden gelir.',             a: 'Mahatma Gandhi' },
  { t: 'Bir hedefin yoksa her rüzgar olumsuz eser.',                           a: 'Montaigne' },
  { t: 'Büyüklük anlık bir eylem değil, alışkanlıkların toplamıdır.',          a: 'Aristoteles' },
  { t: 'Yavaş ilerliyorsan bile durma; hareketsiz duranları geçiyorsun.',      a: 'Konfüçyüs' },
  { t: 'Seninle en çok zaman geçiren kişi sensin — kendine iyi bir arkadaş ol.', a: 'Anonim' },
  { t: 'Yarın yapacaklarını bugün yap, bugün yapacaklarını şimdi yap.',        a: 'Anonim' },
  { t: 'Başarı bir tesadüf değil, doğru alışkanlıkların birikmesidir.',        a: 'Anonim' },
];

const BADGE_DEFS = [
  { id: 's3',   icon: '🌱', name: 'Tohum',      desc: '3 gün serisi',   req: 3   },
  { id: 's7',   icon: '🔥', name: 'Bir Hafta',  desc: '7 gün serisi',   req: 7   },
  { id: 's14',  icon: '⚡', name: 'İki Hafta',  desc: '14 gün serisi',  req: 14  },
  { id: 's21',  icon: '💪', name: 'Alışkanlık', desc: '21 gün serisi',  req: 21  },
  { id: 's30',  icon: '🏅', name: 'Bir Ay',     desc: '30 gün serisi',  req: 30  },
  { id: 's50',  icon: '🎖️', name: 'Elli Gün',   desc: '50 gün serisi',  req: 50  },
  { id: 's100', icon: '🏆', name: 'Yüz Gün',    desc: '100 gün serisi', req: 100 },
  { id: 's365', icon: '👑', name: 'Bir Yıl',    desc: '365 gün serisi', req: 365 },
];

// ─── STATE ───────────────────────────────────────────────────
let S = {
  goals: [],
  completions: {},   // goalId -> Set<"YYYY-MM-DD">
  jokers: {},        // goalId -> Set<"YYYY-MM-DD">
  badges: {},        // goalId -> Set<badgeId>
  selectedGoalId: null,
  currentYear: 2026,
  selectedColor: COLORS[0],
  quoteIdx: 0,
};

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

// ─── HELPERS ─────────────────────────────────────────────────
function dk(d)          { return `${d.getFullYear()}-${p2(d.getMonth()+1)}-${p2(d.getDate())}`; }
function yk(yr, mo, dy) { return `${yr}-${p2(mo+1)}-${p2(dy)}`; }
function p2(n)          { return String(n).padStart(2, '0'); }
function isFuture(yr, mo, dy) { return new Date(yr, mo, dy) > TODAY; }
function isToday(yr, mo, dy)  { return TODAY.getFullYear()===yr && TODAY.getMonth()===mo && TODAY.getDate()===dy; }
function daysInMonth(yr, mo)  { return new Date(yr, mo+1, 0).getDate(); }
function firstDay(yr, mo)     { let d = new Date(yr, mo, 1).getDay(); return d === 0 ? 6 : d - 1; }

// Shorthand accessors — auto-initialize if missing
function C(id) { return S.completions[id] || (S.completions[id] = new Set()); }
function J(id) { return S.jokers[id]      || (S.jokers[id]      = new Set()); }
function B(id) { return S.badges[id]      || (S.badges[id]      = new Set()); }

function isDone(gid, key) { return C(gid).has(key) || J(gid).has(key); }

function getStreak(gid) {
  let streak = 0, d = new Date(TODAY);
  if (!isDone(gid, dk(d))) d.setDate(d.getDate() - 1);
  while (isDone(gid, dk(d))) {
    streak++;
    d.setDate(d.getDate() - 1);
    if (streak > 3650) break;
  }
  return streak;
}

function getLongest(gid) {
  const all = [...C(gid), ...J(gid)].sort();
  if (!all.length) return 0;
  let max = 1, cur = 1;
  for (let i = 1; i < all.length; i++) {
    const diff = (new Date(all[i]) - new Date(all[i-1])) / 86400000;
    if (diff === 1)      { cur++; max = Math.max(max, cur); }
    else if (diff > 1)   { cur = 1; }
  }
  return max;
}

function totalDone(gid) { return C(gid).size + J(gid).size; }

function canUseJoker(gid) {
  if (isDone(gid, dk(TODAY))) return false;            // already done today
  const yest = new Date(TODAY); yest.setDate(yest.getDate() - 1);
  if (J(gid).has(dk(yest))) return false;              // yesterday was also a joker
  return true;
}

// ─── STORAGE ─────────────────────────────────────────────────
function save() {
  try {
    const d = {
      goals: S.goals,
      selectedGoalId: S.selectedGoalId,
      currentYear: S.currentYear,
      selectedColor: S.selectedColor,
      quoteIdx: S.quoteIdx,
      completions: {}, jokers: {}, badges: {},
    };
    for (const [k, v] of Object.entries(S.completions)) d.completions[k] = [...v];
    for (const [k, v] of Object.entries(S.jokers))      d.jokers[k]      = [...v];
    for (const [k, v] of Object.entries(S.badges))      d.badges[k]      = [...v];
    localStorage.setItem('zkv3', JSON.stringify(d));
  } catch(e) {}
}

function load() {
  try {
    const raw = localStorage.getItem('zkv3');
    if (!raw) return;
    const d = JSON.parse(raw);
    S.goals          = d.goals          || [];
    S.selectedGoalId = d.selectedGoalId || null;
    S.currentYear    = d.currentYear    || 2026;
    S.selectedColor  = d.selectedColor  || COLORS[0];
    S.quoteIdx       = d.quoteIdx       || 0;
    S.completions = {}; S.jokers = {}; S.badges = {};
    for (const [k, v] of Object.entries(d.completions || {})) S.completions[k] = new Set(v);
    for (const [k, v] of Object.entries(d.jokers      || {})) S.jokers[k]      = new Set(v);
    for (const [k, v] of Object.entries(d.badges      || {})) S.badges[k]      = new Set(v);
  } catch(e) {}
}

// ─── BADGE CHECK ─────────────────────────────────────────────
function checkBadges(gid) {
  const streak = getStreak(gid), earned = B(gid);
  let changed = false;
  BADGE_DEFS.forEach(b => {
    if (streak >= b.req && !earned.has(b.id)) {
      earned.add(b.id);
      changed = true;
      setTimeout(() => toast(`${b.icon} Rozet kazandın: ${b.name}!`, 'ok'), 350);
    }
  });
  if (changed) save();
}

// ─── TOAST ───────────────────────────────────────────────────
let _toastTimer;
function toast(msg, type = 'ok') {
  clearTimeout(_toastTimer);
  const t = document.getElementById('toast');
  document.getElementById('toastIco').textContent = type === 'ok' ? '✓' : type === 'joker' ? '★' : 'ℹ';
  document.getElementById('toastMsg').textContent = msg;
  t.className = `toast show ${type}`;
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ─── TAB SWITCHING ───────────────────────────────────────────
function switchTab(tab, btn) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
  if (btn) btn.classList.add('active');
  if (tab === 'stats')   renderStats();
  if (tab === 'heatmap') renderHeatmap();
}

// ─── HEADER ──────────────────────────────────────────────────
function updateHeader() {
  const DAYS = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  document.getElementById('hdrDay').textContent  = TODAY.getDate();
  document.getElementById('hdrDate').textContent = `${DAYS[TODAY.getDay()]} · ${MONTHS[TODAY.getMonth()]} ${TODAY.getFullYear()}`;
}

// ─── QUOTE ───────────────────────────────────────────────────
function renderQuote() {
  const q = QUOTES[S.quoteIdx % QUOTES.length];
  document.getElementById('sideQuote').innerHTML = `
    <div class="quote-card">
      <div class="quote-txt">${q.t}</div>
      <div class="quote-author">— ${q.a}</div>
      <button class="qbtn" onclick="nextQuote()">↻ Farklı Söz</button>
    </div>`;
}

function nextQuote() {
  S.quoteIdx = (S.quoteIdx + 1 + Math.floor(Math.random() * 4)) % QUOTES.length;
  save();
  renderQuote();
}

// ─── COLOR PICKER ────────────────────────────────────────────
function initColorPicker() {
  const cp = document.getElementById('colorPicker');
  cp.innerHTML = '';
  COLORS.forEach(c => {
    const sw = document.createElement('div');
    sw.className = 'swatch' + (c === S.selectedColor ? ' on' : '');
    sw.style.background = c;
    sw.onclick = () => {
      S.selectedColor = c;
      document.querySelectorAll('.swatch').forEach(s => s.classList.remove('on'));
      sw.classList.add('on');
    };
    cp.appendChild(sw);
  });
}

// ─── JOKER ───────────────────────────────────────────────────
function renderJoker() {
  const gid = S.selectedGoalId;
  const sec = document.getElementById('jokerSection');
  if (!gid) { sec.style.display = 'none'; return; }
  sec.style.display = 'block';

  const todayKey  = dk(TODAY);
  const yest      = new Date(TODAY); yest.setDate(yest.getDate() - 1);
  const todayJoker = J(gid).has(todayKey);
  const yestJoker  = J(gid).has(dk(yest));

  document.getElementById('jokerBox').innerHTML = `
    <div class="jt">Joker Durumu</div>
    <div class="jv">${todayJoker ? 'Bugün joker kullanıldı ★' : yestJoker ? 'Dün joker kullanıldı — bugün kullanılamaz' : 'Joker kullanılabilir'}</div>
    <div class="jh">Ardışık 2 joker kullanılamaz</div>`;

  const btn = document.getElementById('jokerBtn');
  btn.disabled    = !canUseJoker(gid);
  btn.textContent = todayJoker ? '★ Bugün Joker Kullanıldı' : '★ Bugün İçin Joker Kullan';
}

function useJoker() {
  const gid = S.selectedGoalId;
  if (!gid) return;
  if (!canUseJoker(gid)) { toast('Joker şu an kullanılamaz!', 'info'); return; }
  J(gid).add(dk(TODAY));
  save();
  checkBadges(gid);
  renderGoalList(); renderCalendar(); renderJoker();
  toast('★ Joker günü kullanıldı! Seri devam ediyor.', 'joker');
}

// ─── GOALS ───────────────────────────────────────────────────
function addGoal() {
  const name = document.getElementById('gName').value.trim();
  if (!name) { toast('Hedef adı girin!', 'info'); return; }

  const g = {
    id:        'g_' + Date.now(),
    name,
    desc:      document.getElementById('gDesc').value.trim(),
    color:     S.selectedColor,
    createdAt: dk(TODAY),
  };

  S.goals.push(g);
  S.completions[g.id] = new Set();
  S.jokers[g.id]      = new Set();
  S.badges[g.id]      = new Set();
  S.selectedGoalId    = g.id;

  document.getElementById('gName').value = '';
  document.getElementById('gDesc').value = '';

  save(); renderGoalList(); renderCalendar(); renderJoker();
  toast(`"${name}" eklendi!`);
}

function deleteGoal(id) {
  if (!confirm('Bu hedefi silmek istediğinize emin misiniz?')) return;
  S.goals = S.goals.filter(g => g.id !== id);
  delete S.completions[id]; delete S.jokers[id]; delete S.badges[id];
  if (S.selectedGoalId === id) S.selectedGoalId = S.goals[0]?.id || null;
  save(); renderGoalList(); renderCalendar(); renderJoker();
  toast('Hedef silindi.', 'info');
}

function selectGoal(id) {
  S.selectedGoalId = id;
  save(); renderGoalList(); renderCalendar(); renderJoker();
}

function renderGoalList() {
  const list = document.getElementById('goalList');
  if (!S.goals.length) {
    list.innerHTML = `<div style="color:var(--muted);font-size:0.76rem;text-align:center;padding:12px;">Henüz hedef yok.</div>`;
    return;
  }
  list.innerHTML = '';
  S.goals.forEach(g => {
    const streak = getStreak(g.id), total = totalDone(g.id);
    const div = document.createElement('div');
    div.className = 'goal-item' + (g.id === S.selectedGoalId ? ' on' : '');
    div.style.setProperty('--gc', g.color);
    div.innerHTML = `
      <div class="gi-row">
        <div class="gi-name">${g.name}</div>
        <div class="gi-streak">🔥 ${streak}</div>
        <button class="gi-del" onclick="event.stopPropagation();deleteGoal('${g.id}')">✕</button>
      </div>
      ${g.desc ? `<div class="gi-desc">${g.desc}</div>` : ''}
      <div class="prog-bar"><div class="prog-fill" style="width:${Math.min(100,(total/365)*100)}%;background:${g.color};"></div></div>
      <div class="gi-sub">${total} / 365 gün</div>`;
    div.onclick = () => selectGoal(g.id);
    list.appendChild(div);
  });
}

// ─── CALENDAR ────────────────────────────────────────────────
function changeYear(delta) {
  const y = S.currentYear + delta;
  if (y < 2026 || y > 2035) return;
  S.currentYear = y;
  save(); renderCalendar();
}

function toggleDay(yr, mo, dy) {
  const gid = S.selectedGoalId;
  if (!gid) { toast('Önce bir hedef seçin!', 'info'); return; }
  if (isFuture(yr, mo, dy)) return;

  const key = yk(yr, mo, dy);
  if (J(gid).has(key)) { toast('Bu gün joker günü.', 'info'); return; }

  if (C(gid).has(key)) {
    C(gid).delete(key);
    toast('Gün kaldırıldı.', 'info');
  } else {
    C(gid).add(key);
    const st = getStreak(gid);
    if (st > 0 && st % 10 === 0) toast(`🎉 ${st} günlük zincir! Muazzam!`, 'ok');
    else toast('✓ Tamamlandı!');
  }

  checkBadges(gid);
  save(); renderGoalList(); renderCalendar(); renderJoker();
}

function renderCalendar() {
  document.getElementById('yearLbl').textContent = S.currentYear;
  const container = document.getElementById('calContainer');

  if (!S.selectedGoalId || !S.goals.length) {
    container.innerHTML = `<div class="no-goal"><div style="font-size:2rem;opacity:.2;margin-bottom:10px;">🎯</div>Soldan bir hedef seç ya da yeni hedef ekle.</div>`;
    return;
  }

  const goal = S.goals.find(g => g.id === S.selectedGoalId);
  if (!goal) return;

  // Read directly from state — single source of truth
  const c = C(S.selectedGoalId), j = J(S.selectedGoalId);
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'year-cal fade-up';

  for (let m = 0; m < 12; m++) {
    const dim = daysInMonth(S.currentYear, m);
    const fd  = firstDay(S.currentYear, m);

    let cnt = 0;
    for (let d = 1; d <= dim; d++) {
      if (c.has(yk(S.currentYear, m, d)) || j.has(yk(S.currentYear, m, d))) cnt++;
    }

    const mb = document.createElement('div');
    mb.className = 'month-block';
    mb.innerHTML = `
      <div class="month-hdr">
        <div class="month-name">${MONTHS[m]}</div>
        <div class="month-stat">${cnt > 0 ? `✓ ${cnt}/${dim}` : ''}</div>
      </div>
      <div class="wday-row">${WDAYS.map(w => `<div class="wday">${w}</div>`).join('')}</div>`;

    const dg = document.createElement('div');
    dg.className = 'days-grid';

    // Empty offset cells
    for (let i = 0; i < fd; i++) {
      const e = document.createElement('div'); e.className = 'dc empty'; dg.appendChild(e);
    }

    for (let d = 1; d <= dim; d++) {
      const key   = yk(S.currentYear, m, d);
      const fut   = isFuture(S.currentYear, m, d);
      const tod   = isToday(S.currentYear, m, d);
      const done  = c.has(key);
      const joker = j.has(key);

      const dc = document.createElement('div');
      dc.className = 'dc'
        + (fut   ? ' fut'       : '')
        + (tod   ? ' today'     : '')
        + (done  ? ' done'      : '')
        + (joker ? ' joker-day' : '');
      dc.textContent = d;
      if (done) dc.style.background = goal.color;
      if (!fut) dc.onclick = () => toggleDay(S.currentYear, m, d);
      dc.title = `${d} ${MONTHS[m]} ${S.currentYear}` + (done ? ' ✓' : '') + (joker ? ' ★' : '');
      dg.appendChild(dc);
    }

    mb.appendChild(dg);
    grid.appendChild(mb);
  }

  container.appendChild(grid);
}

// ─── STATS ───────────────────────────────────────────────────
function renderStats() {
  const content = document.getElementById('statsContent');
  if (!S.goals.length) {
    content.innerHTML = `<div class="empty-state"><div class="icon">📊</div><h3>Henüz hedef yok</h3><p>Hedef ekleyince istatistikler burada görünür.</p></div>`;
    return;
  }

  let html = '';
  S.goals.forEach(g => {
    const streak  = getStreak(g.id);
    const longest = getLongest(g.id);
    const total   = totalDone(g.id);
    const created = new Date(g.createdAt || dk(TODAY));
    const days    = Math.max(1, Math.ceil((TODAY - created) / 86400000) + 1);
    const rate    = Math.round((total / days) * 100);
    const earned  = B(g.id);

    html += `
      <div style="margin-bottom:32px;">
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px;">
          <div style="width:9px;height:9px;border-radius:50%;background:${g.color};flex-shrink:0;"></div>
          <div style="font-family:'Playfair Display',serif;font-size:1.15rem;font-weight:700;">${g.name}</div>
          ${g.desc ? `<div style="font-size:0.7rem;color:var(--muted);">— ${g.desc}</div>` : ''}
        </div>
        <div class="stats-grid">
          <div class="stat-card"><div class="slbl">Mevcut Seri</div><div class="sval" style="color:${g.color}">${streak}</div><div class="ssub">gün üst üste</div></div>
          <div class="stat-card"><div class="slbl">En Uzun Seri</div><div class="sval" style="color:${g.color}">${longest}</div><div class="ssub">günlük rekor</div></div>
          <div class="stat-card"><div class="slbl">Toplam Gün</div><div class="sval" style="color:${g.color}">${total}</div><div class="ssub">tamamlandı</div></div>
          <div class="stat-card"><div class="slbl">Tamamlanma</div><div class="sval" style="color:${g.color}">${rate}%</div><div class="ssub">başlangıçtan beri</div></div>
        </div>
        <div style="font-family:'Playfair Display',serif;font-size:0.95rem;font-weight:700;margin-bottom:9px;display:flex;align-items:center;gap:7px;">
          Rozetler
          <span style="font-size:0.62rem;font-weight:300;color:var(--muted);font-family:'DM Sans',sans-serif;">${earned.size} / ${BADGE_DEFS.length}</span>
        </div>
        <div class="badges-row">
          ${BADGE_DEFS.map(b => `
            <div class="badge ${earned.has(b.id) ? 'earned' : 'locked'}">
              <div class="badge-icon">${b.icon}</div>
              <div><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div></div>
            </div>`).join('')}
        </div>
        <div style="height:1px;background:var(--border);margin-top:2px;"></div>
      </div>`;
  });

  content.innerHTML = html;
}

// ─── HEATMAP ─────────────────────────────────────────────────
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function renderHeatmap() {
  const content = document.getElementById('heatmapContent');
  if (!S.goals.length) {
    content.innerHTML = `<div class="empty-state"><div class="icon">🔥</div><h3>Hedef Yok</h3><p>Önce bir hedef ekleyin.</p></div>`;
    return;
  }

  // Count completed days per date across all goals
  const dayMap = {};
  S.goals.forEach(g => {
    [...C(g.id), ...J(g.id)].forEach(k => { dayMap[k] = (dayMap[k] || 0) + 1; });
  });
  const maxGoals = S.goals.length || 1;

  // Base color from selected goal
  const ref = S.goals.find(g => g.id === S.selectedGoalId) || S.goals[0];
  const [r, g, b] = hexToRgb(ref.color);

  function intensityBg(count) {
    if (!count) return '#1a1916';
    const ratio = count / maxGoals;
    const a = ratio <= 0.25 ? 0.15 : ratio <= 0.5 ? 0.35 : ratio <= 0.75 ? 0.6 : 0.9;
    return `rgba(${r},${g},${b},${a})`;
  }

  let html = `
    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
      <div class="sec" style="margin-bottom:0;">Tüm Hedefler — ${S.currentYear}</div>
    </div>
    <div style="display:flex;align-items:center;gap:5px;margin-bottom:14px;font-size:0.68rem;color:var(--muted);">
      Az
      ${[0.15, 0.35, 0.6, 0.9].map(a => `<div style="width:11px;height:11px;border-radius:2px;background:rgba(${r},${g},${b},${a});display:inline-block;"></div>`).join('')}
      Çok &nbsp;·&nbsp; Renk = tamamlanan hedef sayısı
    </div>
    <div class="heatmap-wrap"><div class="heatmap-grid">`;

  // Build week columns
  let cur = new Date(S.currentYear, 0, 1);
  const off = cur.getDay() === 0 ? 6 : cur.getDay() - 1;
  cur.setDate(cur.getDate() - off);
  const end = new Date(S.currentYear, 11, 31);

  while (cur <= end) {
    html += `<div class="hm-week">`;
    for (let w = 0; w < 7; w++) {
      const key    = dk(cur);
      const inYear = cur.getFullYear() === S.currentYear;
      const fut    = cur > TODAY;
      const count  = dayMap[key] || 0;

      if (!inYear) {
        html += `<div class="hmc" style="background:transparent;cursor:default;"></div>`;
      } else if (fut) {
        html += `<div class="hmc" style="background:#1a1916;opacity:0.25;" title="${key}"></div>`;
      } else {
        const bg  = intensityBg(count);
        const tip = `${key}${count ? ` — ${count} hedef tamamlandı` : ''}`;
        html += `<div class="hmc" style="background:${bg};" title="${tip}"></div>`;
      }

      const nx = new Date(cur); nx.setDate(nx.getDate() + 1); cur = nx;
    }
    html += `</div>`;
    if (cur > end && (cur.getDay() === 1 || cur.getDay() === 0)) break;
  }

  html += `</div></div>`;

  // Month labels
  html += `<div style="display:flex;gap:0;margin-top:7px;">`;
  MONTHS.forEach((mn, i) => {
    const dim = daysInMonth(S.currentYear, i);
    const w   = Math.ceil(dim / 7) * 15;
    html += `<div style="min-width:${w}px;font-size:0.58rem;color:var(--muted);letter-spacing:0.04em;">${mn}</div>`;
  });
  html += `</div>`;

  content.innerHTML = html;
}

// ─── INIT ────────────────────────────────────────────────────
function init() {
  load();
  updateHeader();
  initColorPicker();
  renderQuote();
  renderGoalList();
  renderCalendar();
  renderJoker();

  // First-run: add a sample goal
  if (!S.goals.length) {
    const g = { id: 'g_welcome', name: 'Günlük Alışkanlık', desc: 'Zinciri kırma!', color: COLORS[0], createdAt: dk(TODAY) };
    S.goals.push(g);
    S.completions[g.id] = new Set();
    S.jokers[g.id]      = new Set();
    S.badges[g.id]      = new Set();
    S.selectedGoalId    = g.id;
    save(); renderGoalList(); renderCalendar(); renderJoker();
  }
}

init();
