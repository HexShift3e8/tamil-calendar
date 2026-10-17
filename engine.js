/* Tamil calendar engine — Chennai, Lahiri ayanamsa, IST.
   Pure calculations: no DOM. Works in browser (window.TC) and Node (tests). */
(function (root) {
  'use strict';
  const A = root.Astronomy || (typeof require !== 'undefined' ? require('astronomy-engine') : null);

  const LAT = 13.0827, LON = 80.2707;
  const IST_MS = 5.5 * 3600e3;
  const DAY_MS = 86400e3;
  const OBS = new A.Observer(LAT, LON, 6);
  const NAK_SPAN = 360 / 27;

  // ---------- Names ----------
  const N = {
    weekdays: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
    weekdaysShort: ['ஞாயி', 'திங்', 'செவ்', 'புத', 'வியா', 'வெள்', 'சனி'],
    tamilMonths: ['சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி', 'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'],
    tamilMonthsShort: ['சித்', 'வைகா', 'ஆனி', 'ஆடி', 'ஆவ', 'புர', 'ஐப்', 'கார்', 'மார்', 'தை', 'மாசி', 'பங்'],
    engMonths: ['ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'],
    engMonthsEn: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    tithis: ['பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி', 'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி', 'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்த்தசி'],
    nakshatras: ['அசுவினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்', 'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி', 'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'],
    rasis: ['மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'],
    yogas: ['விஷ்கம்பம்', 'ப்ரீதி', 'ஆயுஷ்மான்', 'சௌபாக்யம்', 'சோபனம்', 'அதிகண்டம்', 'சுகர்மம்', 'திருதி', 'சூலம்', 'கண்டம்', 'விருத்தி', 'துருவம்', 'வியாகாதம்', 'ஹர்ஷணம்', 'வஜ்ரம்', 'சித்தி', 'வியதீபாதம்', 'வரியான்', 'பரிகம்', 'சிவம்', 'சித்தம்', 'சாத்தியம்', 'சுபம்', 'சுப்பிரம்', 'பிராம்மம்', 'ஐந்திரம்', 'வைதிருதி'],
    karanasMovable: ['பவம்', 'பாலவம்', 'கௌலவம்', 'தைதுலம்', 'கரசை', 'வணிசை', 'பத்திரை'],
    years: ['பிரபவ', 'விபவ', 'சுக்ல', 'பிரமோதூத', 'பிரசோற்பத்தி', 'ஆங்கீரச', 'ஸ்ரீமுக', 'பவ', 'யுவ', 'தாது', 'ஈஸ்வர', 'வெகுதானிய', 'பிரமாதி', 'விக்கிரம', 'விஷு', 'சித்திரபானு', 'சுபானு', 'தாரண', 'பார்த்திப', 'விய', 'சர்வசித்து', 'சர்வதாரி', 'விரோதி', 'விக்ருதி', 'கர', 'நந்தன', 'விஜய', 'ஜய', 'மன்மத', 'துன்முகி', 'ஹேவிளம்பி', 'விளம்பி', 'விகாரி', 'சார்வரி', 'பிலவ', 'சுபகிருது', 'சோபகிருது', 'குரோதி', 'விசுவாவசு', 'பராபவ', 'பிலவங்க', 'கீலக', 'சௌமிய', 'சாதாரண', 'விரோதகிருது', 'பரிதாபி', 'பிரமாதீச', 'ஆனந்த', 'ராட்சச', 'நள', 'பிங்கள', 'காளயுக்தி', 'சித்தார்த்தி', 'ரௌத்திரி', 'துன்மதி', 'துந்துபி', 'ருத்ரோத்காரி', 'ரக்தாட்சி', 'குரோதன', 'அட்சய'],
    planets: ['சூரியன்', 'சந்திரன்', 'செவ்வாய்', 'புதன்', 'குரு', 'சுக்கிரன்', 'சனி', 'ராகு', 'கேது'],
    planetsShort: ['சூரி', 'சந்', 'செவ்', 'புத', 'குரு', 'சுக்', 'சனி', 'ராகு', 'கேது'],
    // Soolam direction + pariharam by weekday (Sun..Sat)
    soolam: ['மேற்கு', 'கிழக்கு', 'வடக்கு', 'வடக்கு', 'தெற்கு', 'மேற்கு', 'கிழக்கு'],
    pariharam: ['வெல்லம்', 'தயிர்', 'பால்', 'பால்', 'தைலம்', 'வெல்லம்', 'தைலம்'],
    taras: ['ஜென்ம', 'சம்பத்', 'விபத்', 'க்ஷேம', 'பிரத்யக்', 'சாதக', 'வதை', 'மைத்ர', 'பரம மைத்ர'],
  };

  // ---------- Helpers ----------
  const norm = (x) => ((x % 360) + 360) % 360;
  const key = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  // IST civil midnight of y-m-d as a real instant
  const istMidnight = (y, m, d) => new Date(Date.UTC(y, m - 1, d) - IST_MS);
  // Break an instant into IST civil fields
  function istParts(date) {
    const t = new Date(date.getTime() + IST_MS);
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), h: t.getUTCHours(), min: t.getUTCMinutes(), dow: t.getUTCDay() };
  }
  function addDays(y, m, d, n) {
    const t = new Date(Date.UTC(y, m - 1, d + n));
    return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
  }
  function fmtTime(date) {
    if (!date) return '—';
    const p = istParts(date);
    const h12 = ((p.h + 11) % 12) + 1;
    return `${String(h12).padStart(2, '0')}:${String(p.min).padStart(2, '0')} ${p.h < 12 ? 'AM' : 'PM'}`;
  }

  // Lahiri ayanamsa: 23.857092° at J2000 + general precession in longitude
  function ayanamsa(date) {
    const T = A.MakeTime(date).tt / 36525;
    return 23.857092 + (5028.796195 * T + 1.1054348 * T * T) / 3600;
  }
  const sunTrop = (date) => A.SunPosition(date).elon;
  const moonTrop = (date) => A.EclipticGeoMoon(date).lon;
  const sunSid = (date) => norm(sunTrop(date) - ayanamsa(date));
  const moonSid = (date) => norm(moonTrop(date) - ayanamsa(date));
  const elong = (date) => norm(moonTrop(date) - sunTrop(date));

  // 1..30 (1–15 valarpirai, 15 = pournami, 16–30 theipirai, 30 = amavasai)
  const tithiAt = (date) => Math.floor(elong(date) / 12) + 1;
  const nakAt = (date) => Math.floor(moonSid(date) / NAK_SPAN);            // 0..26
  const yogaAt = (date) => Math.floor(norm(sunSid(date) + moonSid(date)) / NAK_SPAN);
  const karanaAt = (date) => Math.floor(elong(date) / 6);                   // 0..59
  const rasiAt = (date) => Math.floor(moonSid(date) / 30);

  function tithiName(t) {
    if (t === 15) return 'பௌர்ணமி';
    if (t === 30) return 'அமாவாசை';
    return N.tithis[(t - 1) % 15];
  }
  function karanaName(k) {
    if (k === 0) return 'கிம்ஸ்துக்னம்';
    if (k === 57) return 'சகுனி';
    if (k === 58) return 'சதுஷ்பாதம்';
    if (k === 59) return 'நாகவம்';
    return N.karanasMovable[(k - 1) % 7];
  }

  // Find when fn(date) changes value after `start`, within maxHours. Returns Date or null.
  function findChange(fn, start, maxHours = 36) {
    const v0 = fn(start);
    let lo = start, hi = null;
    for (let h = 1; h <= maxHours; h++) {
      const t = new Date(start.getTime() + h * 3600e3);
      if (fn(t) !== v0) { hi = t; break; }
      lo = t;
    }
    if (!hi) return null;
    while (hi - lo > 30e3) {
      const mid = new Date((lo.getTime() + hi.getTime()) / 2);
      if (fn(mid) === v0) lo = mid; else hi = mid;
    }
    return hi;
  }

  // ---------- Sun rise/set (cached per day) ----------
  const riseCache = new Map();
  function sunTimes(y, m, d) {
    const k = key(y, m, d);
    if (riseCache.has(k)) return riseCache.get(k);
    const mid = istMidnight(y, m, d);
    const rise = A.SearchRiseSet(A.Body.Sun, OBS, +1, mid, 1);
    const set = A.SearchRiseSet(A.Body.Sun, OBS, -1, mid, 1);
    const r = { rise: rise ? rise.date : new Date(mid.getTime() + 6 * 3600e3), set: set ? set.date : new Date(mid.getTime() + 18 * 3600e3) };
    riseCache.set(k, r);
    return r;
  }

  // ---------- Tamil (solar) date ----------
  // Time the Sun's sidereal longitude reaches `target`, searching around `guess`.
  function sankrantiTime(target, guess) {
    const f = (t) => { let x = sunSid(t) - target; if (x > 180) x -= 360; if (x < -180) x += 360; return x; };
    let lo = new Date(guess.getTime() - 3 * DAY_MS), hi = new Date(guess.getTime() + 3 * DAY_MS);
    for (let i = 0; i < 40; i++) {
      const mid = new Date((lo.getTime() + hi.getTime()) / 2);
      if (f(mid) < 0) lo = mid; else hi = mid;
    }
    return hi;
  }
  const monthStartCache = new Map();
  // Rule: if the Sun enters the new sign before sunset, that day is day 1; otherwise the next day.
  function tamilMonthStart(signIdx, approx) {
    const k = signIdx + ':' + istParts(approx).y + ':' + istParts(approx).m;
    if (monthStartCache.has(k)) return monthStartCache.get(k);
    const st = sankrantiTime(signIdx * 30, approx);
    const p = istParts(st);
    const set = sunTimes(p.y, p.m, p.d).set;
    const day = st < set ? { y: p.y, m: p.m, d: p.d } : addDays(p.y, p.m, p.d, 1);
    const res = { ...day, sankranti: st };
    monthStartCache.set(k, res);
    return res;
  }
  function tamilDate(y, m, d) {
    const set = sunTimes(y, m, d).set;
    const lon = sunSid(set);
    const sign = Math.floor(lon / 30);
    const degIn = lon - sign * 30;
    const approx = new Date(set.getTime() - (degIn / 0.9856) * DAY_MS);
    const start = tamilMonthStart(sign, approx);
    const day = Math.round((Date.UTC(y, m - 1, d) - Date.UTC(start.y, start.m - 1, start.d)) / DAY_MS) + 1;
    // Tamil year begins on Chithirai 1 (mid-April)
    const ty = m < 4 || (m === 4 && sign === 11) ? y - 1 : y;
    const yearIdx = (((ty - 1987) % 60) + 60) % 60;
    return { month: sign, day, yearName: N.years[yearIdx] };
  }

  // ---------- Lunar (amanta) month ----------
  // Month index 0=Chaitra … 11=Phalguna. Named after the sign the Sun is in at the closing new moon.
  const lunarCache = new Map();
  function lunarMonth(date) {
    const prev = A.SearchMoonPhase(0, date, -32).date;
    const k = prev.toISOString().slice(0, 13);
    if (lunarCache.has(k)) return lunarCache.get(k);
    const next = A.SearchMoonPhase(0, new Date(prev.getTime() + DAY_MS), 32).date;
    const s1 = Math.floor(sunSid(prev) / 30), s2 = Math.floor(sunSid(next) / 30);
    const res = { index: s2, adhika: s1 === s2, start: prev, end: next };
    lunarCache.set(k, res);
    return res;
  }

  // ---------- Per-day panchangam snapshot (cheap version for grids) ----------
  const dayCache = new Map();
  function dayInfo(y, m, d) {
    const k = key(y, m, d);
    if (dayCache.has(k)) return dayCache.get(k);
    const { rise, set } = sunTimes(y, m, d);
    const midday = new Date((rise.getTime() + set.getTime()) / 2);
    const nextMid = istMidnight(y, m, d + 1); // the midnight that ends this day
    const info = {
      y, m, d, key: k,
      dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay(),
      rise, set,
      tSR: tithiAt(rise), tSS: tithiAt(set), tNoon: tithiAt(midday), tMidnight: tithiAt(nextMid),
      tEve: tithiAt(new Date(set.getTime() + 2.5 * 3600e3)),
      nSR: nakAt(rise), nSS: nakAt(set),
      tamil: tamilDate(y, m, d),
      lunar: lunarMonth(rise),
    };
    dayCache.set(k, info);
    return info;
  }

  // ---------- Full daily panchangam ----------
  function panchangam(y, m, d) {
    const di = dayInfo(y, m, d);
    const { rise, set } = di;
    const nextRise = sunTimes(...Object.values(addDays(y, m, d, 1))).rise;
    const seg = (set - rise) / 8;
    const slot = (i) => [new Date(rise.getTime() + (i - 1) * seg), new Date(rise.getTime() + i * seg)];
    // Day-part number (1–8) per weekday Sun..Sat
    const RAHU = [8, 2, 7, 5, 6, 4, 3], YAMA = [5, 4, 3, 2, 1, 7, 6], KULI = [7, 6, 5, 4, 3, 2, 1];

    function spans(fn, nameFn) {
      const out = [];
      let t = rise;
      for (let i = 0; i < 3; i++) {
        const v = fn(t);
        const end = findChange(fn, t, 30);
        out.push({ name: nameFn(v), value: v, end });
        if (!end || end >= nextRise) break;
        t = new Date(end.getTime() + 60e3);
      }
      return out;
    }
    const moonR = rasiAt(rise);
    const moonRasiEnd = findChange(rasiAt, rise, 60);
    return {
      ...di,
      weekday: N.weekdays[di.dow],
      tithi: spans(tithiAt, tithiName),
      nakshatra: spans(nakAt, (v) => N.nakshatras[v]),
      yoga: spans(yogaAt, (v) => N.yogas[v]),
      karana: spans(karanaAt, karanaName),
      paksha: di.tSR <= 15 ? 'வளர்பிறை' : 'தேய்பிறை',
      rahu: slot(RAHU[di.dow]), yama: slot(YAMA[di.dow]), kuligai: slot(KULI[di.dow]),
      soolam: N.soolam[di.dow], pariharam: N.pariharam[di.dow],
      moonRasi: moonR, moonRasiEnd,
      chandrashtamam: (moonR + 5) % 12, // the rasi whose 8th house the Moon is in
    };
  }

  // ---------- Planet positions (rasi kattam) ----------
  function meanRahu(date) {
    const T = A.MakeTime(date).tt / 36525;
    return norm(125.0445479 - 1934.1362891 * T + 0.0020754 * T * T - ayanamsa(date));
  }
  function planets(date) {
    const bodies = [A.Body.Sun, A.Body.Moon, A.Body.Mars, A.Body.Mercury, A.Body.Jupiter, A.Body.Venus, A.Body.Saturn];
    const ay = ayanamsa(date);
    const later = new Date(date.getTime() + DAY_MS);
    const lonOf = (b, t) => norm(A.Ecliptic(A.GeoVector(b, t, true)).elon - ayanamsa(t));
    const out = bodies.map((b, i) => {
      const lon = norm(A.Ecliptic(A.GeoVector(b, date, true)).elon - ay);
      let retro = false;
      if (i >= 2) { let dl = lonOf(b, later) - lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360; retro = dl < 0; }
      return { idx: i, lon, rasi: Math.floor(lon / 30), retro };
    });
    const r = meanRahu(date);
    out.push({ idx: 7, lon: r, rasi: Math.floor(r / 30), retro: true });
    out.push({ idx: 8, lon: norm(r + 180), rasi: Math.floor(norm(r + 180) / 30), retro: true });
    return out;
  }

  // ---------- Personal: chandrabalam & tarabalam ----------
  function personal(date, natalRasi, natalNak) {
    const mr = rasiAt(date), mn = nakAt(date);
    const house = ((mr - natalRasi + 12) % 12) + 1;
    const goodHouse = [1, 3, 6, 7, 10, 11].includes(house);
    const count = ((mn - natalNak + 27) % 27) + 1;
    const tara = ((count - 1) % 9) + 1;
    const goodTara = [2, 4, 6, 8, 9].includes(tara);
    return { house, goodHouse, tara, taraName: N.taras[tara - 1], goodTara, chandrashtamam: house === 8 };
  }

  // ---------- Festivals & observances ----------
  // Lunar month indices: 0 Chaitra,1 Vaishakha,2 Jyeshtha,3 Ashadha,4 Shravana,5 Bhadrapada,6 Ashvina,7 Kartika,8 Margashira,9 Pausha,10 Magha,11 Phalguna
  const yearCache = new Map();
  function yearEvents(year) {
    if (yearCache.has(year)) return yearCache.get(year);
    const ev = new Map(); // key -> [{type, name, holiday}]
    const add = (k, e) => { if (!ev.has(k)) ev.set(k, []); const arr = ev.get(k); if (!arr.some((x) => x.name === e.name)) arr.push(e); };

    // Walk from Dec 31 of previous year to Jan 1 of next year so neighbours exist.
    const days = [];
    let c = { y: year - 1, m: 12, d: 31 };
    while (!(c.y === year + 1 && c.m === 1 && c.d === 2)) { days.push(dayInfo(c.y, c.m, c.d)); c = addDays(c.y, c.m, c.d, 1); }
    const inYear = (di) => di.y === year;

    // Tithi "owned" by a day = tithis that begin at/after its sunrise and before the next sunrise.
    const owned = (i) => {
      const t0 = days[i].tSR, t1 = days[i + 1] ? days[i + 1].tSR : t0;
      if (i > 0 && days[i - 1].tSR === t0) return []; // second sunrise of the same tithi
      const out = []; let t = t0;
      while (t !== t1 && out.length < 3) { out.push(t); t = (t % 30) + 1; }
      if (t0 === t1) out.push(t0);
      return out;
    };
    const ownedNak = (i) => {
      const a = days[i].nSR, b = days[i + 1] ? days[i + 1].nSR : a;
      if (i > 0 && days[i - 1].nSR === a) return [];
      const out = []; let t = a;
      while (t !== b && out.length < 3) { out.push(t); t = (t + 1) % 27; }
      if (a === b) out.push(a);
      return out;
    };

    // Solar-month nakshatra festivals: the day the star is up at sunset, closest to pournami if it occurs twice.
    const solarNak = []; // collect candidates
    for (let i = 1; i < days.length - 1; i++) {
      const di = days[i];
      const ow = owned(i), on = ownedNak(i);
      const k = di.key;
      const lm = di.lunar;

      if (ow.includes(30)) add(k, { type: 'amavasai', name: 'அமாவாசை' });
      if (ow.includes(15)) add(k, { type: 'pournami', name: 'பௌர்ணமி' });
      if (ow.includes(11) || ow.includes(26)) add(k, { type: 'ekadasi', name: 'ஏகாதசி' });
      if (ow.includes(6) || ow.includes(21)) add(k, { type: 'sashti', name: 'சஷ்டி விரதம்' });
      if (ow.includes(4)) add(k, { type: 'chaturthi', name: 'சதுர்த்தி' });
      if (di.tEve === 19 && days[i - 1].tEve !== 19) add(k, { type: 'sankatahara', name: 'சங்கடஹர சதுர்த்தி' });
      if ((di.tSS === 13 || di.tSS === 28) && days[i - 1].tSS !== di.tSS) add(k, { type: 'pradosham', name: 'பிரதோஷம்' });
      if (ow.includes(29)) add(k, { type: 'shivaratri', name: 'மாத சிவராத்திரி' });
      if (di.nSS === 2 && days[i - 1].nSS !== 2) add(k, { type: 'karthigai', name: 'கார்த்திகை விரதம்' });

      // Solar dates
      const tm = di.tamil.month, td = di.tamil.day;
      if (tm === 0 && td === 1) add(k, { type: 'festival', name: 'தமிழ்ப் புத்தாண்டு', holiday: true });
      if (tm === 9 && td === 1) { add(k, { type: 'festival', name: 'தைப் பொங்கல்', holiday: true }); }
      if (tm === 9 && td === 2) add(k, { type: 'festival', name: 'மாட்டுப் பொங்கல் / திருவள்ளுவர் தினம்', holiday: true });
      if (tm === 9 && td === 3) add(k, { type: 'festival', name: 'காணும் பொங்கல் / உழவர் திருநாள்', holiday: true });
      if (tm === 8 && days[i + 1] && days[i + 1].tamil.month === 9) add(k, { type: 'festival', name: 'போகிப் பண்டிகை' });
      if (tm === 3 && td === 18) add(k, { type: 'festival', name: 'ஆடிப் பெருக்கு' });
      if (tm === 11 && td === 1) add(k, { type: 'festival', name: 'காரடையான் நோன்பு' });

      // Amavasai specials by solar month
      if (ow.includes(30)) {
        if (tm === 9) add(k, { type: 'festival', name: 'தை அமாவாசை' });
        if (tm === 3) add(k, { type: 'festival', name: 'ஆடி அமாவாசை' });
        if (lm.index === 5 && !lm.adhika) add(k, { type: 'festival', name: 'மகாளய அமாவாசை' });
        if (tm === 8) add(k, { type: 'festival', name: 'அனுமன் ஜெயந்தி' });
      }
      if (ow.includes(15) && tm === 0) add(k, { type: 'festival', name: 'சித்ரா பௌர்ணமி' });
      if (ow.includes(11) && tm === 8) add(k, { type: 'festival', name: 'வைகுண்ட ஏகாதசி' });

      // Lunar-calendar festivals (skip adhika months)
      if (!lm.adhika) {
        if (lm.index === 5 && di.tNoon === 4 && days[i - 1].tNoon !== 4) add(k, { type: 'festival', name: 'விநாயகர் சதுர்த்தி', holiday: true });
        if (lm.index === 6 && ow.includes(1)) add(k, { type: 'festival', name: 'நவராத்திரி ஆரம்பம்' });
        if (lm.index === 6 && di.tNoon === 9 && days[i - 1].tNoon !== 9) {
          add(k, { type: 'festival', name: 'சரஸ்வதி பூஜை, ஆயுத பூஜை', holiday: true });
          add(days[i + 1].key, { type: 'festival', name: 'விஜயதசமி', holiday: true });
        }
        if (lm.index === 6 && ow.includes(29)) add(k, { type: 'festival', name: 'தீபாவளி', holiday: true });
        if (lm.index === 7 && ow.includes(6)) add(k, { type: 'festival', name: 'கந்த சஷ்டி (சூரசம்ஹாரம்)' });
        if (lm.index === 4 && di.tMidnight === 23 && days[i - 1].tMidnight !== 23) add(k, { type: 'festival', name: 'கிருஷ்ண ஜெயந்தி', holiday: true });
        if (lm.index === 4 && ow.includes(15)) add(k, { type: 'festival', name: 'ஆவணி அவிட்டம்' });
        if (lm.index === 0 && di.tNoon === 9 && days[i - 1].tNoon !== 9) add(k, { type: 'festival', name: 'ஸ்ரீ ராம நவமி' });
        if (lm.index === 10 && di.tMidnight === 29 && days[i - 1].tMidnight !== 29) add(k, { type: 'festival', name: 'மகா சிவராத்திரி' });
        if (lm.index === 4 && di.dow === 5 && di.tSR < 15 && di.tSR >= 8) add(k, { type: 'festival', name: 'வரலட்சுமி விரதம்' });
      }

      // Candidates for nakshatra-in-solar-month festivals (star at sunset)
      const NF = [[9, 7, 'தைப்பூசம்'], [11, 11, 'பங்குனி உத்திரம்'], [1, 15, 'வைகாசி விசாகம்'], [10, 9, 'மாசி மகம்'], [7, 2, 'திருக்கார்த்திகை தீபம்'], [8, 5, 'ஆருத்ரா தரிசனம்'], [2, 11, 'ஆனி திருமஞ்சனம்']];
      for (const [mon, nak, name] of NF) {
        if (tm === mon && di.nSS === nak && days[i - 1].nSS !== nak) {
          const fromFull = Math.abs(((di.tSS - 15 + 45) % 30) - 15);
          solarNak.push({ k, name, mon, ty: di.y + (mon >= 9 ? 0 : 0), fromFull, yIdx: i });
        }
      }
    }
    // Pick the occurrence closest to pournami within each solar month instance
    const groups = new Map();
    for (const c of solarNak) {
      const g = c.name + ':' + days[c.yIdx].y + ':' + (days[c.yIdx].m > 6 ? 'H2' : 'H1');
      if (!groups.has(g) || groups.get(g).fromFull > c.fromFull) groups.set(g, c);
    }
    for (const c of groups.values()) add(c.k, { type: 'festival', name: c.name });

    // Fixed civil holidays
    const fixed = [[1, 1, 'ஆங்கிலப் புத்தாண்டு'], [1, 26, 'குடியரசு தினம்'], [4, 14, 'அம்பேத்கர் ஜெயந்தி'], [5, 1, 'மே தினம்'], [8, 15, 'சுதந்திர தினம்'], [10, 2, 'காந்தி ஜெயந்தி'], [12, 25, 'கிறிஸ்துமஸ்']];
    for (const [mm, dd, name] of fixed) add(key(year, mm, dd), { type: 'holiday', name, holiday: true });
    // Good Friday (Gregorian Easter − 2)
    const e = easter(year); const gf = addDays(year, e.m, e.d, -2);
    add(key(gf.y, gf.m, gf.d), { type: 'holiday', name: 'புனித வெள்ளி', holiday: true });

    // Keep only this year's dates
    for (const k of [...ev.keys()]) if (!k.startsWith(year + '-')) ev.delete(k);
    yearCache.set(year, ev);
    return ev;
  }
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31), day = ((h + l - 7 * m + 114) % 31) + 1;
    return { m: month, d: day };
  }

  const api = { N, key, istMidnight, istParts, addDays, fmtTime, dayInfo, panchangam, planets, personal, yearEvents, tamilDate, sunTimes, tithiName, moonRasiAt: rasiAt, LAT, LON };
  root.TC = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
