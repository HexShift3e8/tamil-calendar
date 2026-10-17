(function () {
  'use strict';
  const TC = window.TC, N = TC.N;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- Storage (guarded) ----------
  const store = {
    get(k) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
  };

  // ---------- Today in IST ----------
  function todayIST() { const p = TC.istParts(new Date()); return { y: p.y, m: p.m, d: p.d }; }
  const today = todayIST();
  const isSame = (a, b) => a.y === b.y && a.m === b.m && a.d === b.d;

  const state = {
    tab: 'month',
    month: { y: today.y, m: today.m },
    day: { ...today },
  };

  // ---------- Year data (Tamil dates + events), cached ----------
  const CACHE_V = 'tc-yd-v3-';
  const yearMem = new Map();
  function yearData(y) {
    if (yearMem.has(y)) return yearMem.get(y);
    let yd = store.get(CACHE_V + y);
    if (!yd) {
      const ev = TC.yearEvents(y);
      const t = {};
      let c = { y, m: 1, d: 1 };
      while (c.y === y) { const di = TC.dayInfo(c.y, c.m, c.d); t[di.key] = [di.tamil.month, di.tamil.day, di.tSR]; c = TC.addDays(c.y, c.m, c.d, 1); }
      const e = {};
      for (const [k, list] of ev) e[k] = list.map((x) => [x.type, x.name, x.holiday ? 1 : 0]);
      yd = { t, e };
      store.set(CACHE_V + y, yd);
    }
    yearMem.set(y, yd);
    return yd;
  }
  const muhurthamMap = () => { const m = {}; for (const x of window.TC_MUHURTHAM || []) m[x.date] = x; return m; };
  function eventsFor(k) {
    const y = +k.slice(0, 4);
    const list = (yearData(y).e[k] || []).map(([type, name, h]) => ({ type, name, holiday: !!h }));
    for (const h of window.TC_EXTRA_HOLIDAYS || []) if (h.date === k) list.push({ type: 'holiday', name: h.name, holiday: true });
    const mu = muhurthamMap()[k];
    if (mu) list.push({ type: 'muhurtham', name: mu.type === 'theipirai' ? 'தேய்பிறை முகூர்த்தம்' : 'வளர்பிறை முகூர்த்தம்', time: mu.time });
    return list;
  }

  // ---------- Icons ----------
  const ICON = {
    amavasai: '<circle cx="8" cy="8" r="6" fill="currentColor"/>',
    pournami: '<circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    muhurtham: '<circle cx="5.8" cy="8.5" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="10.2" cy="8.5" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/>',
    festival: '<path d="M8 1.5c1.8 2.4 2.6 4 2.6 5.2A2.6 2.6 0 0 1 8 9.3a2.6 2.6 0 0 1-2.6-2.6C5.4 5.5 6.2 3.9 8 1.5z" fill="currentColor"/><path d="M2 10.5h12c-.6 2.4-3 4-6 4s-5.4-1.6-6-4z" fill="currentColor"/>',
    karthigai: '<path d="M8 1.2l1.9 4.3 4.7.4-3.6 3.1 1.1 4.6L8 11.2l-4.1 2.4 1.1-4.6L1.4 5.9l4.7-.4z" fill="currentColor"/>',
    ekadasi: '<path d="M3 2.5v4.5a5 5 0 0 0 10 0V2.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 4v8" stroke="currentColor" stroke-width="2"/>',
    pradosham: '<path d="M5 12V7.5a3 3 0 0 1 6 0V12" fill="currentColor"/><rect x="2" y="12" width="12" height="2.4" rx="1" fill="currentColor"/>',
    shivaratri: '<path d="M10.5 2.2A6 6 0 1 0 13.8 11 4.8 4.8 0 0 1 10.5 2.2z" fill="currentColor"/>',
    sashti: '<path d="M8 1l2.4 4.2L8 8.2 5.6 5.2z" fill="currentColor"/><path d="M8 8v7" stroke="currentColor" stroke-width="1.8"/>',
    chaturthi: '<path d="M8 2c3 2.5 5 5 5 7.3A5 5 0 0 1 3 9.3C3 7 5 4.5 8 2z" fill="currentColor"/><path d="M8 5v8M5.6 7.5l1.2 5M10.4 7.5l-1.2 5" stroke="var(--cell-bg)" stroke-width=".9"/>',
    holiday: '<rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor"/>',
  };
  ICON.sankatahara = ICON.chaturthi;
  const icon = (t, cls = '') => `<svg class="ic ic-${t} ${cls}" viewBox="0 0 16 16" aria-hidden="true">${ICON[t] || ''}</svg>`;
  const PRIORITY = ['muhurtham', 'festival', 'amavasai', 'pournami', 'karthigai', 'ekadasi', 'pradosham', 'shivaratri', 'sashti', 'chaturthi', 'sankatahara'];
  const LEGEND = [['amavasai', 'அமாவாசை'], ['pournami', 'பௌர்ணமி'], ['muhurtham', 'முகூர்த்தம்'], ['festival', 'பண்டிகை'], ['karthigai', 'கார்த்திகை'], ['ekadasi', 'ஏகாதசி'], ['pradosham', 'பிரதோஷம்'], ['shivaratri', 'சிவராத்திரி'], ['sashti', 'சஷ்டி'], ['chaturthi', 'சதுர்த்தி']];

  // ---------- Formatting ----------
  const fmt = TC.fmtTime;
  function fmtUntil(date, base) {
    if (!date) return '';
    const p = TC.istParts(date);
    const nextDay = !(p.y === base.y && p.m === base.m && p.d === base.d);
    return `${fmt(date)}${nextDay ? ' (மறுநாள்)' : ''} வரை`;
  }
  const gDate = (o) => `${o.d} ${N.engMonths[o.m - 1]} ${o.y}`;
  const weekday = (o) => N.weekdays[new Date(Date.UTC(o.y, o.m - 1, o.d)).getUTCDay()];

  // ---------- Month view ----------
  function renderMonth() {
    const { y, m } = state.month;
    const view = $('#view-month');
    const yd = yearData(y);
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
    const dim = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const t1 = yd.t[TC.key(y, m, 1)], tN = yd.t[TC.key(y, m, dim)];
    const tamilSpan = t1[0] === tN[0] ? N.tamilMonths[t1[0]] : `${N.tamilMonths[t1[0]]} – ${N.tamilMonths[tN[0]]}`;
    const yearName = TC.tamilDate(y, m, 15).yearName;

    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="cell empty"></span>';
    const holidays = [], specials = [], muhur = [];
    for (let d = 1; d <= dim; d++) {
      const k = TC.key(y, m, d);
      const [tm, td] = yd.t[k];
      const evs = eventsFor(k);
      const dow = (first + d - 1) % 7;
      const isHol = evs.some((e) => e.holiday);
      const types = [...new Set(evs.map((e) => (e.type === 'holiday' ? 'festival' : e.type)))].sort((a, b) => PRIORITY.indexOf(a) - PRIORITY.indexOf(b)).slice(0, 2);
      const cls = ['cell', dow === 0 ? 'sun' : '', isHol ? 'hol' : '', isSame({ y, m, d }, today) ? 'today' : ''].join(' ');
      const tLabel = td === 1 ? `<b>${N.tamilMonthsShort[tm]}</b> 1` : td;
      const label = `${d} ${N.engMonths[m - 1]}, ${N.tamilMonths[tm]} ${td}${evs.length ? ', ' + evs.map((e) => e.name).join(', ') : ''}`;
      cells += `<button class="${cls}" data-d="${d}" aria-label="${esc(label)}"><span class="ics">${types.map((t) => icon(t)).join('')}</span><span class="g">${d}</span><span class="t">${tLabel}</span></button>`;
      for (const e of evs) {
        const row = { d, dow, tm, td, e };
        if (e.holiday) holidays.push(row);
        else if (e.type === 'muhurtham') muhur.push(row);
        else specials.push(row);
      }
    }
    const totalCells = first + dim;
    for (let i = totalCells; i < Math.ceil(totalCells / 7) * 7; i++) cells += '<span class="cell empty"></span>';

    const listRows = (rows, withIcon) => {
      const byDay = new Map();
      for (const r of rows) { if (!byDay.has(r.d)) byDay.set(r.d, { ...r, names: [] }); byDay.get(r.d).names.push(r.e); }
      return [...byDay.values()].map((r) => `
        <button class="row" data-d="${r.d}">
          <span class="row-date"><b>${r.d}</b><small>${N.weekdaysShort[r.dow]}</small></span>
          <span class="row-body">${r.names.map((e) => `<span class="row-name">${withIcon ? icon(e.type === 'holiday' ? 'festival' : e.type) : ''}${esc(e.name)}${e.time ? ` <em>${esc(e.time)}</em>` : ''}</span>`).join('')}</span>
          <span class="row-tamil">${N.tamilMonths[r.tm]} ${r.td}</span>
        </button>`).join('');
    };

    view.innerHTML = `
      <header class="mhead">
        <div class="mhead-title">
          <h1>${N.engMonths[m - 1]} <span>${y}</span></h1>
          <p>${tamilSpan}, ${yearName} வருடம்</p>
        </div>
        <div class="mhead-nav">
          <button class="iconbtn" id="prevM" aria-label="முந்தைய மாதம்"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
          <button class="pill" id="todayM">இன்று</button>
          <button class="iconbtn" id="nextM" aria-label="அடுத்த மாதம்"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
      </header>
      <div class="grid-wrap">
        <div class="wk">${N.weekdaysShort.map((w, i) => `<span class="${i === 0 ? 'sun' : ''}">${w}</span>`).join('')}</div>
        <div class="grid" id="grid">${cells}</div>
      </div>
      <div class="legend">${LEGEND.map(([t, n]) => `<span>${icon(t)}${n}</span>`).join('')}</div>
      ${holidays.length ? `<section class="list"><h2>அரசு விடுமுறை நாட்கள்</h2>${listRows(holidays, false)}</section>` : ''}
      ${muhur.length ? `<section class="list"><h2>சுபமுகூர்த்த நாட்கள்</h2>${listRows(muhur, true)}</section>` : ''}
      ${specials.length ? `<section class="list"><h2>விசேஷ, விரத நாட்கள்</h2>${listRows(specials, true)}</section>` : ''}
    `;
    $('#prevM').onclick = () => shiftMonth(-1);
    $('#nextM').onclick = () => shiftMonth(1);
    $('#todayM').onclick = () => { state.month = { y: today.y, m: today.m }; renderMonth(); };
    view.querySelectorAll('[data-d]').forEach((b) => b.addEventListener('click', () => openDay({ y, m, d: +b.dataset.d })));
    addSwipe($('#grid'), shiftMonth);
  }
  function shiftMonth(n) {
    let { y, m } = state.month; m += n;
    if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; }
    if (y < 1900 || y > 2100) return;
    state.month = { y, m };
    withLoading(() => renderMonth(), !yearMem.has(y));
  }

  // ---------- Day view ----------
  function openDay(o) { state.day = { ...o }; setTab('day'); }
  function renderDay() {
    const o = state.day;
    const p = TC.panchangam(o.y, o.m, o.d);
    const evs = eventsFor(p.key);
    const isToday = isSame(o, today);
    const now = new Date();
    const frac = Math.min(1, Math.max(0, (now - p.rise) / (p.set - p.rise)));
    const showSun = isToday && now > p.rise && now < p.set;
    // Sun position on the arc (quadratic bezier from (16,86) via (160,-6) to (304,86))
    const bx = (t) => (1 - t) * (1 - t) * 16 + 2 * (1 - t) * t * 160 + t * t * 304;
    const by = (t) => (1 - t) * (1 - t) * 86 + 2 * (1 - t) * t * -6 + t * t * 86;

    const spanTxt = (arr) => arr.map((s, i) => `<span class="sp ${i ? 'next' : ''}">${esc(s.name)}${s.end ? ` <small>${fmtUntil(s.end, o)}</small>` : ''}</span>`).join('');
    const range = (r) => `${fmt(r[0])} – ${fmt(r[1])}`;

    $('#view-day').innerHTML = `
      <header class="dhero">
        <div class="dnav">
          <button class="iconbtn light" id="prevD" aria-label="முந்தைய நாள்"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
          <span>${isToday ? 'இன்று' : weekday(o)}</span>
          <button class="iconbtn light" id="nextD" aria-label="அடுத்த நாள்"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>
        </div>
        <div class="dbig">
          <span class="dnum">${p.tamil.day}</span>
          <span class="dmon">${N.tamilMonths[p.tamil.month]}<small>${p.tamil.yearName} வருடம்</small></span>
        </div>
        <p class="dgreg">${gDate(o)}, ${p.weekday}<br><span>${p.paksha}, ${TC.tithiName(p.tSR)}</span></p>
        <svg class="arc" viewBox="0 30 320 76" aria-hidden="true">
          <path d="M16 86 Q160 -6 304 86" fill="none" stroke="currentColor" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 5"/>
          <line x1="0" y1="86" x2="320" y2="86" stroke="currentColor" stroke-opacity=".25"/>
          ${showSun ? `<circle cx="${bx(frac).toFixed(1)}" cy="${by(frac).toFixed(1)}" r="9" fill="#F2C14E"/>` : ''}
          <text x="16" y="102" fill="currentColor" font-size="11">${fmt(p.rise)}</text>
          <text x="304" y="102" fill="currentColor" font-size="11" text-anchor="end">${fmt(p.set)}</text>
          <text x="16" y="74" fill="currentColor" fill-opacity=".7" font-size="10">சூரிய உதயம்</text>
          <text x="304" y="74" fill="currentColor" fill-opacity=".7" font-size="10" text-anchor="end">சூரிய அஸ்தமனம்</text>
        </svg>
      </header>
      ${evs.length ? `<div class="chips">${evs.map((e) => `<span class="chip ${e.holiday ? 'hol' : ''}">${icon(e.type === 'holiday' ? 'festival' : e.type)}${esc(e.name)}${e.time ? ` <em>${esc(e.time)}</em>` : ''}</span>`).join('')}</div>` : ''}
      <section class="card">
        <h2>பஞ்சாங்கம்</h2>
        <dl class="pg">
          <dt>திதி</dt><dd>${spanTxt(p.tithi)}</dd>
          <dt>நட்சத்திரம்</dt><dd>${spanTxt(p.nakshatra)}</dd>
          <dt>யோகம்</dt><dd>${spanTxt(p.yoga)}</dd>
          <dt>கரணம்</dt><dd>${spanTxt(p.karana)}</dd>
        </dl>
      </section>
      <section class="card">
        <h2>தவிர்க்க வேண்டிய நேரம்</h2>
        <dl class="pg times">
          <dt>ராகு காலம்</dt><dd>${range(p.rahu)}</dd>
          <dt>எமகண்டம்</dt><dd>${range(p.yama)}</dd>
          <dt>குளிகை</dt><dd>${range(p.kuligai)}</dd>
        </dl>
      </section>
      <section class="card two">
        <div><h2>சூலம்</h2><p>${p.soolam}<small>பரிகாரம்: ${p.pariharam}</small></p></div>
        <div><h2>சந்திராஷ்டமம்</h2><p>${N.rasis[p.chandrashtamam]}<small>சந்திரன் ${N.rasis[p.moonRasi]} ராசியில்${p.moonRasiEnd ? `, ${fmtUntil(p.moonRasiEnd, o)}` : ''}</small></p></div>
      </section>
      <p class="foot">சென்னை நேரப்படி (IST). திருக்கணித முறை, லஹிரி அயனாம்சம்.</p>
    `;
    $('#prevD').onclick = () => { const n = TC.addDays(o.y, o.m, o.d, -1); state.day = n; renderDay(); };
    $('#nextD').onclick = () => { const n = TC.addDays(o.y, o.m, o.d, 1); state.day = n; renderDay(); };
    addSwipe($('#view-day .dhero'), (n) => { state.day = TC.addDays(state.day.y, state.day.m, state.day.d, n); renderDay(); });
  }

  // ---------- Rasi view ----------
  // South Indian chart: fixed sign positions on a 4×4 ring
  const SI_POS = { 11: [0, 0], 0: [0, 1], 1: [0, 2], 2: [0, 3], 3: [1, 3], 4: [2, 3], 5: [3, 3], 6: [3, 2], 7: [3, 1], 8: [3, 0], 9: [2, 0], 10: [1, 0] };
  function renderRasi() {
    const natal = store.get('tc-natal');
    const now = new Date();
    const o = today;
    const pl = TC.planets(now);
    const pt = TC.panchangam(o.y, o.m, o.d);

    let personalHtml = '';
    if (natal) {
      const ps = TC.personal(now, natal.rasi, natal.nak);
      // Upcoming chandrashtamam windows for this rasi (next 75 days)
      const target = (natal.rasi + 7) % 12;
      const wins = [];
      let t = now;
      for (let i = 0; i < 40 && wins.length < 3; i++) {
        const r = moonRasi(t);
        const end = findRasiChange(t);
        if (r === target) wins.push([t, end]);
        if (!end) break;
        t = new Date(end.getTime() + 60e3);
      }
      const fmtDT = (d) => { const q = TC.istParts(d); return `${q.d} ${N.engMonths[q.m - 1]}, ${fmt(d)}`; };
      personalHtml = `
        <section class="card verdict">
          <h2>இன்று உங்களுக்கு</h2>
          <div class="vrow ${ps.goodHouse ? 'good' : 'bad'}"><span>சந்திர பலம்</span><b>${ps.house}-ஆம் இடம்</b><i>${ps.goodHouse ? 'சாதகம்' : 'சாதகமில்லை'}</i></div>
          <div class="vrow ${ps.goodTara ? 'good' : 'bad'}"><span>தாரா பலம்</span><b>${ps.taraName} தாரை</b><i>${ps.goodTara ? 'சாதகம்' : 'சாதகமில்லை'}</i></div>
          ${ps.chandrashtamam ? '<p class="warn">இன்று உங்கள் ராசிக்கு சந்திராஷ்டமம். முக்கிய முடிவுகளைத் தள்ளிப் போடவும்.</p>' : ''}
        </section>
        <section class="card">
          <h2>வரும் சந்திராஷ்டம நாட்கள்</h2>
          ${wins.map(([a, b]) => `<p class="win"><span><b>${a <= now ? 'இப்போது' : fmtDT(a)}</b> முதல்</span><span><b>${b ? fmtDT(b) : ''}</b> வரை</span></p>`).join('')}
        </section>`;
    }

    // Chart
    const byRasi = {};
    pl.forEach((x) => { (byRasi[x.rasi] = byRasi[x.rasi] || []).push(x); });
    let chart = '';
    for (let r = 0; r < 12; r++) {
      const [row, col] = SI_POS[r];
      const items = (byRasi[r] || []).map((x) => `<span class="pl ${x.idx === 1 ? 'moon' : ''}">${N.planetsShort[x.idx]}${x.retro && x.idx < 7 ? '<sup>(வ)</sup>' : ''}</span>`).join('');
      chart += `<div class="h ${natal && natal.rasi === r ? 'mine' : ''}" style="grid-row:${row + 1};grid-column:${col + 1}"><small>${N.rasis[r]}</small>${items}</div>`;
    }
    chart += `<div class="hc" style="grid-row:2/4;grid-column:2/4"><b>கிரக நிலை</b><span>${gDate(o)}</span><span>${fmt(now)}</span></div>`;

    $('#view-rasi').innerHTML = `
      <header class="phead"><h1>ராசி</h1><p>உங்கள் ராசி, நட்சத்திரத்தைத் தேர்ந்தெடுங்கள்</p></header>
      <section class="card picker">
        <label>ராசி<select id="selR"><option value="">தேர்ந்தெடு</option>${N.rasis.map((n, i) => `<option value="${i}" ${natal && natal.rasi === i ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
        <label>நட்சத்திரம்<select id="selN"><option value="">தேர்ந்தெடு</option>${N.nakshatras.map((n, i) => `<option value="${i}" ${natal && natal.nak === i ? 'selected' : ''}>${n}</option>`).join('')}</select></label>
      </section>
      ${personalHtml || '<p class="empty-hint">தேர்ந்தெடுத்ததும் இன்றைய சந்திர பலம், தாரா பலம், சந்திராஷ்டம நாட்கள் இங்கே தெரியும்.</p>'}
      <section class="card">
        <h2>இன்றைய சந்திராஷ்டமம்: ${N.rasis[pt.chandrashtamam]}</h2>
        <div class="chart">${chart}</div>
        <p class="note">(வ) = வக்கிரம். ராகு, கேது எப்போதும் வக்கிர கதி.</p>
      </section>
    `;
    const save = () => {
      const r = $('#selR').value, n = $('#selN').value;
      if (r !== '' && n !== '') { store.set('tc-natal', { rasi: +r, nak: +n }); renderRasi(); }
    };
    $('#selR').onchange = save; $('#selN').onchange = save;
  }
  function findRasiChange(t) {
    const r0 = moonRasi(t);
    let lo = t, hi = null;
    for (let h = 3; h <= 72; h += 3) { const x = new Date(t.getTime() + h * 3600e3); if (moonRasi(x) !== r0) { hi = x; break; } lo = x; }
    if (!hi) return null;
    while (hi - lo > 60e3) { const mid = new Date((lo.getTime() + hi.getTime()) / 2); if (moonRasi(mid) === r0) lo = mid; else hi = mid; }
    return hi;
  }
  const moonRasi = (d) => TC.moonRasiAt(d);

  // ---------- Shell ----------
  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('on', v.id === 'view-' + tab));
    document.querySelectorAll('.tabbar button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
    document.body.dataset.tab = tab;
    if (tab === 'month') renderMonth();
    if (tab === 'day') renderDay();
    if (tab === 'rasi') renderRasi();
    window.scrollTo(0, 0);
  }
  function withLoading(fn, slow) {
    if (!slow) return fn();
    document.body.classList.add('busy');
    setTimeout(() => { try { fn(); } finally { document.body.classList.remove('busy'); } }, 30);
  }
  function addSwipe(el, cb) {
    if (!el) return;
    let x0 = null, y0 = null;
    el.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) cb(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  }

  document.querySelectorAll('.tabbar button').forEach((b) => b.addEventListener('click', () => {
    if (b.dataset.tab === 'day' && state.tab !== 'day') state.day = { ...today };
    setTab(b.dataset.tab);
  }));
  withLoading(() => setTab('month'), true);

  // Refresh "today" when the app comes back after midnight
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const t = todayIST();
      if (!isSame(t, today)) location.reload();
    }
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
