/* =====================================================================
   Kalkulačka FVE – uživatelské rozhraní
   ===================================================================== */
(() => {
'use strict';
const { fmt, num, has } = FVE;
const ST = FVESTORE;
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const kc = x => fmt(x, 0) + ' Kč';
const n2 = (x, d = 2) => fmt(x, d);
const pct = x => x == null ? '–' : fmt(x * 100, 1) + ' %';
const yrs = x => x == null || !isFinite(x) ? '–' : n2(x, 1) + ' let';
const dt = t => t ? new Date(t).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '–';
const yn = ['ano', 'ne'];

// ---------------- stav ----------------
let P = null, V = null, C = null, I = null;
let R = null, OD = null, Scache = null, Ekey = null, E = null;
let dirty = false, tab = 'vstupy', showOff = false, confirmDel = null, admSub = 'parametry', admDraft = null, admSel = null, upgradeView = false, repOpts = null, simDen = 'cerven', psearch = '';
const LABELS = {};

function exampleInputs(Cn) {
  const i = FVE.defaultInputs(Cn);
  Object.assign(i, {
    pripravar: 'Vaněk', top: 'Daniel Králík', adresa: 'Ukázková 1, Polná', kontakt: 'Jan Příklad',
    vyska: 25, delka: 60, sirka: 12, vchody: 4, rozvadecu: 4, stoupacky: 'ano', patra: 32, rozvadece: 'ano', vchodyPatra: 32, panelyFasada: 0, vykonFasada: 0, leseni: 0,
    produkt: 'JOM', orientace: 'VZ', tuv: 'ano', tuvNaklady: 90000, tuvM3: 5000, wallbox: 1, vlastni1Nazev: 'test položka', vlastni1Cena: 10000, dotaceRucne: 800000,
  });
  Object.assign(i.jednotky[0], { bj: 40, spol: 2, spotrByty: 80, spotrSpol: 15, cena: 6500, vykon: 27.44, stringy: 4, stridac: 'DEYE 20' });
  Object.assign(i.jednotky[1], { bj: 30, spol: 1, spotrByty: 60, spotrSpol: 10, cena: 6000, vykon: 13.72, stringy: 2, stridac: 'DEYE 10' });
  i.navrh = [{ strana: 'V', panely: 28 }, { strana: 'Z', panely: 28 }, { strana: '', panely: '' }];
  return i;
}
function normInputs(x, Cn) {
  const b = FVE.defaultInputs(Cn); const o = Object.assign(b, x || {});
  o.jednotky = b.jednotky.map((u, k) => Object.assign({}, u, ((x || {}).jednotky || [])[k] || {}));
  o.navrh = [0, 1, 2].map(k => Object.assign({ strana: '', panely: '' }, ((x || {}).navrh || [])[k] || {}));
  o.upravy = (x || {}).upravy || {};
  return o;
}
function setProject(p) {
  P = p; C = P.cenik;
  for (const v of P.varianty) v.inputs = normInputs(v.inputs, C);
  V = P.varianty.find(v => v.id === P.aktivni) || P.varianty[0]; P.aktivni = V.id; I = V.inputs;
  recompute();
}
function newExample() { const Cn = ST.aktivniCenik(); return ST.novyProjekt(Cn, exampleInputs(Cn), 'Ukázkový dům – příklad'); }
function newBlank() { const Cn = ST.aktivniCenik(); return ST.novyProjekt(Cn, FVE.defaultInputs(Cn), ''); }

// ---------------- výpočty ----------------
function calcVariant(inp, Cn) {
  const kwp = inp.jednotky.reduce((a, u) => a + num(u.vykon), 0);
  const od = FVESIM.odhadVyroby(inp, Cn, kwp);
  const r = FVE.calc(inp, Cn, { odhadVyroby: od.mwh });
  return { R: r, OD: od };
}
function recompute() { const x = calcVariant(I, C); R = x.R; OD = x.OD; Scache = null; E = null; }
function getS() { if (!Scache) Scache = FVESIM.simuluj(I, C, R); return Scache; }
function getE() { if (!E) E = FVEEKO.vyhodnot(I, R, I.ekoRezim === 'hodinovy' ? getS() : null); return E; }
function fullVariant(v) {
  const x = calcVariant(v.inputs, C); const S = FVESIM.simuluj(v.inputs, C, x.R);
  return { ...x, S, E: FVEEKO.vyhodnot(v.inputs, x.R, v.inputs.ekoRezim === 'hodinovy' ? S : null) };
}

// ---------------- pole formuláře ----------------
function fld(key, label, opt = {}) {
  LABELS[key] = label;
  const v = I[key] ?? '';
  const ref = opt.ref ? `<span class="ref">${opt.ref}</span>` : '';
  const numeric = !opt.text && !opt.options;
  const bad = numeric && v !== '' && !has(v);
  let ctl;
  if (opt.options) ctl = `<select id="f-${key}" data-k="${key}">${opt.options.map(o => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}"${String(val) === String(v) ? ' selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
  else ctl = `<input id="f-${key}" data-k="${key}" type="text" inputmode="${opt.text ? 'text' : 'decimal'}" class="${opt.text ? 'txt' : ''}" value="${esc(v)}" placeholder="${esc(opt.ph || '')}" ${bad ? 'aria-invalid="true"' : ''}>`;
  return `<div class="f"><label for="f-${key}">${label}${ref}</label><div class="inp"${bad ? ' style="border-color:var(--bad)"' : ''}>${ctl}${opt.u ? `<span class="u">${opt.u}</span>` : ''}</div>${bad ? '<div class="small" style="color:var(--bad)">Zadej číslo (desetinná čárka je v pořádku).</div>' : opt.hint ? `<div class="small muted">${opt.hint}</div>` : ''}</div>`;
}
function out(label, val, ref, u = '') { return `<div class="f"><label>${label}${ref ? `<span class="ref">${ref}</span>` : ''}</label><div class="calc"><span>${val}</span><span class="u">${u}</span></div></div>`; }
function kv(rows) { return `<div class="kv">${rows.map(([k, v, cls = '']) => `<div class="k ${cls}">${k}</div><div class="v ${cls}">${v}</div>`).join('')}</div>`; }
function sec(title, desc, body, extra = '') { return `<section class="sec"><div class="sechead"><h2>${title}</h2>${desc ? `<p>${desc}</p>` : ''}${extra}</div>${body}</section>`; }
function notes(list, cls = 'warn') { return list.length ? `<div class="notes">${list.map(w => `<div class="note ${cls}">${esc(w)}</div>`).join('')}</div>` : ''; }

// ---------------- grafy ----------------
function niceStep(x) { if (x <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(x))); const m = x / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
function bars(series, colors, labels, h = 210, unit = 'MWh') {
  const W = 560, padL = 44, padB = 22, padT = 8, n = labels.length;
  const max = Math.max(0.0001, ...labels.map((_, k) => series.reduce((a, s) => a + Math.max(0, s[k]), 0)));
  const step = niceStep(max / 4), top = Math.ceil(max / step) * step, y = vv => padT + (h - padT - padB) * (1 - vv / top);
  const slot = (W - padL - 6) / n, bw = slot * 0.68, gx = k => padL + slot * k + slot * 0.16;
  let g = '<g class="grid">'; for (let vv = 0; vv <= top + 1e-9; vv += step) g += `<line x1="${padL}" x2="${W - 4}" y1="${y(vv)}" y2="${y(vv)}"/><text x="${padL - 6}" y="${y(vv) + 4}" text-anchor="end">${fmt(vv, step < 1 ? 1 : 0)}</text>`; g += '</g>';
  let b = ''; for (let k = 0; k < n; k++) { let acc = 0; series.forEach((sr, j) => { const val = Math.max(0, sr[k]); b += `<rect x="${gx(k)}" y="${y(acc + val)}" width="${bw}" height="${Math.max(0, y(acc) - y(acc + val))}" fill="${colors[j]}" rx="1.5"><title>${labels[k]}: ${n2(val, 2)} ${unit}</title></rect>`; acc += val; }); if (n <= 12 || k % 2 === 0) b += `<text x="${gx(k) + bw / 2}" y="${h - 6}" text-anchor="middle">${labels[k]}</text>`; }
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Graf v ${unit}">${g}${b}</svg>`;
}
function lineChart(vals, h = 200) {
  const W = 560, padL = 64, padB = 22, padT = 10, n = vals.length;
  const mn = Math.min(0, ...vals), mx = Math.max(0, ...vals); const span = mx - mn || 1; const step = niceStep(span / 4);
  const lo = Math.floor(mn / step) * step, hi = Math.ceil(mx / step) * step;
  const y = v => padT + (h - padT - padB) * (1 - (v - lo) / (hi - lo || 1)), x = k => padL + (W - padL - 8) * (k / Math.max(1, n - 1));
  let g = '<g class="grid">'; for (let v = lo; v <= hi + 1e-9; v += step) g += `<line x1="${padL}" x2="${W - 4}" y1="${y(v)}" y2="${y(v)}"/><text x="${padL - 6}" y="${y(v) + 4}" text-anchor="end">${fmt(v / 1e6, Math.abs(step) < 1e6 ? 1 : 0)} mil.</text>`; g += '</g>';
  const pts = vals.map((v, k) => `${x(k)},${y(v)}`).join(' ');
  let lab = ''; for (let k = 0; k < n; k += Math.max(1, Math.round(n / 8))) lab += `<text x="${x(k)}" y="${h - 6}" text-anchor="middle">${k}</text>`;
  const zero = `<line x1="${padL}" x2="${W - 4}" y1="${y(0)}" y2="${y(0)}" stroke="var(--ink-3)" stroke-width="1.2"/>`;
  const area = `<polygon points="${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}" fill="var(--c-fve)" opacity=".12"/>`;
  const end = vals.length ? `<circle cx="${x(n - 1)}" cy="${y(vals[n - 1])}" r="4" fill="var(--c-fve)"/>` : '';
  return `<svg class="chart" viewBox="0 0 ${W} ${h}" role="img" aria-label="Kumulovaný peněžní tok">${g}${zero}${area}<polyline points="${pts}" fill="none" stroke="var(--c-fve)" stroke-width="2"/>${end}${lab}</svg>`;
}
const MES3 = FVE.MESICE.map(m => m.slice(0, 3));

// ---------------- záložky ----------------
const TABS = [['projekt', 'Projekt'], ['vstupy', 'Vstupní data'], ['fve', 'Návrh FVE'], ['energie', 'Energie a ceny'], ['rozpocet', 'Rozpočet'], ['dotace', 'Dotace'], ['vyroba', 'Výroba a simulace'], ['eko', 'Ekonomika'], ['varianty', 'Porovnání variant'], ['report', 'Report / PDF'], ['admin', 'Administrace']];
function tabDot(k) {
  if (k === 'fve' && R.warn.length) return true;
  if (k === 'rozpocet' && rozpZmeny().length) return true;
  if (k === 'projekt' && cenikZastaraly()) return true;
  return false;
}
function renderTabs() { $('#tabs').innerHTML = TABS.map(([k, l]) => `<button class="tab" role="tab" id="tab-${k}" aria-selected="${k === tab}" data-tab="${k}">${l}${tabDot(k) ? '<span class="dot" aria-label="vyžaduje pozornost"></span>' : ''}</button>`).join(''); }

function renderHeader() {
  $('#verze').textContent = `${C.nazev} · ${C.rbd} · koef. ${fmt(C.parametry.koeficient, 3)}`;
  if (document.activeElement !== $('#projname')) $('#projname').value = P.nazev || '';
  $('#varSel').innerHTML = P.varianty.map(v => `<option value="${v.id}"${v.id === V.id ? ' selected' : ''}>${esc(v.nazev)}</option>`).join('');
  const c = R.cenik, s = R.souhrn;
  const nav = R.vysledky.navratnostVc;
  $('#strip').innerHTML = [
    ['Výkon FVE', n2(s.D26), 'kWp'], ['Panely', fmt(s.D27, 0), 'ks'], ['Baterie', n2(s.D28), 'kWh'], ['Výroba', n2(s.D11, 1), 'MWh/rok'],
    ['Cena bez DPH', fmt(c.D47, 0), 'Kč', 1], ['Cena s DPH', fmt(c.F47, 0), 'Kč'], ['Dotace', fmt(R.dotace.E56, 0), 'Kč'], ['Návratnost (Excel)', nav == null ? '–' : n2(nav, 1), 'let'],
  ].map(([l, val, u, hi]) => `<div class="kf${hi ? ' hi' : ''}"><div class="l">${l}</div><div class="v">${val}<small>${u}</small></div></div>`).join('');
  $('#foot').textContent = `Projekt naceněn ceníkem ${C.id}${cenikZastaraly() ? ' · aktivní ceník je jiný – viz záložka Projekt' : ''} · data se ukládají jen v tomto prohlížeči`;
  setStatus();
}

function render() {
  renderHeader(); renderTabs();
  const ae = document.activeElement, id = ae && ae.id, ss = ae && ae.selectionStart, se = ae && ae.selectionEnd;
  const sy = window.scrollY;
  $('#panel').innerHTML = (PANELS[tab] || PANELS.vstupy)();
  if (id && id !== 'projname' && id !== 'varSel') { const el = document.getElementById(id); if (el && el !== document.activeElement) { el.focus({ preventScroll: true }); try { if (ss != null && el.setSelectionRange) el.setSelectionRange(ss, se); } catch (e) {} } }
  window.scrollTo(0, sy);
}

// ---------------- panely ----------------
const PANELS = {};

PANELS.projekt = () => {
  const Ca = ST.aktivniCenik();
  const zast = cenikZastaraly();
  const varRows = P.varianty.map(v => { const x = v.id === V.id ? { R } : calcVariant(v.inputs, C); return `<tr${v.id === V.id ? ' class="best"' : ''}><td><input class="ci" style="text-align:left;font-family:var(--f-body);min-width:160px" id="vn-${v.id}" data-vname="${v.id}" value="${esc(v.nazev)}" aria-label="Název varianty"></td><td>${esc(x.R.nazevScen || '–')}</td><td class="n">${n2(x.R.souhrn.D26)}</td><td class="n">${n2(x.R.souhrn.D28)}</td><td class="n">${fmt(x.R.cenik.D47, 0)}</td><td class="btnrow">${v.id === V.id ? '<span class="chip ok">otevřená</span>' : `<button class="btn sm" data-vopen="${v.id}">Otevřít</button>`}<button class="btn sm" data-vdup="${v.id}">Kopie</button>${P.varianty.length > 1 ? (confirmDel === 'v' + v.id ? `<span class="confirm">Smazat?<button class="btn sm danger" data-vdelyes="${v.id}">Ano</button><button class="btn sm" data-cancel="1">Ne</button></span>` : `<button class="btn sm ghost" data-vdel="${v.id}">Smazat</button>`) : ''}</td></tr>`; }).join('');
  const valid = R.warn;
  return `
  ${zast ? `<div class="banner warn"><span>Projekt je naceněn ceníkem <b>${esc(C.id)}</b>, aktivní ceník je <b>${esc(Ca.id)}</b>. Starý projekt se sám nemění.</span><button class="btn" id="btnUpgrade">${upgradeView ? 'Skrýt porovnání' : 'Porovnat a aktualizovat'}</button></div>` : ''}
  ${zast && upgradeView ? upgradePanel(Ca) : ''}
  ${sec('Projekt', 'Projekt se ukládá do tohoto prohlížeče. Pro předání kolegovi nebo zálohu ho exportuj do souboru a kolega ho importuje v Projektech.', `
    <div class="grid">${out('Založen', dt(P.vytvoreno))}${out('Naposledy uložen', dt(P.upraveno))}${out('Ceník projektu', esc(C.nazev))}${out('Počet variant', P.varianty.length)}</div>
    <div class="btnrow"><button class="btn" id="btnExportProj">Exportovat projekt (.json)</button><button class="btn" id="btnBatVar">Vytvořit varianty kapacity baterie</button></div>`)}
  ${sec('Varianty', 'Každá varianta má vlastní vstupy, rozpočet i předpoklady. Porovnání je na záložce Porovnání variant.', `<div class="tw"><table><thead><tr><th>Varianta</th><th>Produkt</th><th class="n">kWp</th><th class="n">Baterie kWh</th><th class="n">Cena bez DPH</th><th></th></tr></thead><tbody>${varRows}</tbody></table></div>`)}
  ${sec('Kontrola vstupů', '', valid.length ? notes(valid) : '<div class="note ok">Vstupy aktivní varianty jsou v pořádku.</div>')}
  ${sec('Historie změn', 'Při každém uložení se zapíše, která pole se změnila, včetně ručních úprav rozpočtu.', `<div class="log">${P.log.slice().reverse().map(l => `<div><span class="mono small">${dt(l.t)}</span><span><b>${esc(l.akce)}</b>${l.detail ? ' – ' + esc(l.detail) : ''}</span></div>`).join('') || '<div>Zatím bez záznamů.</div>'}</div>`)}`;
};

PANELS.vstupy = () => {
  const s = R.souhrn, t = C.kontakty.top.find(x => x[0] === I.top);
  return `
  ${sec('Projekt a kontakty', 'Hlavička listu Vstupní data. Modře podbarvená pole se vyplňují, čárkovaná se počítají.', `<div class="grid">
    ${fld('pripravar', 'Přípravář', { options: ['vyber', ...C.kontakty.pripravari], ref: 'C2' })}
    ${fld('top', 'Technicko obchodní poradce', { options: ['', ...C.kontakty.top.map(x => x[0])], ref: 'H2' })}
    ${out('Telefon / e-mail TOP', t ? `${esc(t[1])} · ${esc(t[2])}` : '–', 'K2, N2')}
    ${fld('adresa', 'Adresa domu', { text: 1, ref: 'C3' })}
    ${fld('kontakt', 'Kontaktní osoba', { text: 1, ref: 'I3' })}
    ${fld('funkce', 'Funkce kontaktní osoby', { text: 1, ref: 'L3' })}</div>`)}
  ${sec('Budova', 'Rozměry a rozvody domu. Z nich ceník počítá délky vedení, svodů, žlabů a propojení JOM.', `<div class="grid">
    ${fld('vyska', 'Výška budovy', { u: 'bm', ref: 'B7' })}${fld('delka', 'Délka budovy', { u: 'bm', ref: 'C7' })}${fld('sirka', 'Šířka budovy', { u: 'bm', ref: 'D7' })}
    ${fld('vchody', 'Počet vchodů', { u: 'ks', ref: 'K7' })}
    ${fld('rozvadecu', 'Počet rozvaděčů', { u: 'ks', ref: 'J7', hint: 'počet pater × počet vchodů – jen u nevyhovujících stávajících rozvaděčů' })}
    ${fld('stoupacky', 'Nové stoupačky', { options: yn, ref: 'L7', hint: 'ano = nové stoupačky děláme my' })}
    ${fld('patra', 'Počet pater', { u: 'ks', ref: 'M7', hint: 'počet vchodů × počet pater' })}
    ${fld('rozvadece', 'Nové bytové rozvaděče', { options: yn, ref: 'N7', hint: 'ano = nové bytové rozvaděče děláme my' })}
    ${fld('vchodyPatra', 'Počet vchodů × počet pater', { u: 'ks', ref: 'O7' })}
    ${fld('kotveni', 'Plochá střecha – kotvení panelů', { options: ['přitížení dlažbou', 'fix profily', 'solatech'], ref: 'S7' })}
    ${fld('panelyFasada', 'Počet panelů na fasádu', { u: 'ks', ref: 'P7', hint: 'z celkového počtu panelů' })}
    ${fld('vykonFasada', 'Výkon panelů na fasádě', { u: 'kWp', ref: 'Q7' })}
    ${fld('leseni', 'Plocha lešení na fasádu', { u: 'm²', ref: 'R7' })}</div>
    <div class="grid">${out('Jádrové vrtání', fmt(s.D12), 'E7', 'ks')}${out('Vzdálenost JOM / technologie', n2(num(I.delka) + num(I.sirka) * s.D12, 1), 'F7', 'bm')}${out('Počet JOM', fmt(s.D12), 'G7', 'ks')}${out('Byty + společné prostory', fmt(s.D9 + s.D10), 'H7', 'ks')}${out('Místnosti technologie', fmt(s.D12), 'I7', 'ks')}${out('Vchodů na 1 JOM', s.D12 ? n2(num(I.vchody) / s.D12) : '–', 'K8')}</div>`)}
  ${sec('Produkt', 'Typ produktu a orientace vybírají sloupec ceníku (9 variant). JOM = sjednocení odběrných míst do jednoho odběrného místa.', `<div class="grid">
    ${fld('produkt', 'Typ produktu', { options: ['vyber', ...FVE.PRODUKTY], ref: 'D15', hint: 'Spol. prostory bez baterie nemají variantu s TUV' })}
    ${fld('orientace', 'Orientace', { options: ['vyber', ...FVE.ORIENTACE], ref: 'D16' })}
    ${out('Sloupec ceníku', R.vIdx >= 0 ? esc(R.varianta) : 'vyber produkt a orientaci', 'D4')}
    ${fld('tuv', 'Práce s přetoky 1 – TUV (hardwarově)', { options: yn, ref: 'D19' })}
    ${fld('sdileni', 'Práce s přetoky 2 – sdílení (fakturačně)', { options: yn, ref: 'D22' })}
    ${out('Scénář výpočtu', esc(R.nazevScen || '–'), 'Výpočty C2')}</div>`)}
  ${sec('Vlastní položky a nabíječka', '', `<div class="grid">
    ${fld('vlastni1Nazev', 'Vlastní položka 1 – název', { text: 1, ref: 'B43' })}${fld('vlastni1Cena', 'Vlastní položka 1 – nákupní cena', { u: 'Kč', ref: 'D43' })}
    ${fld('vlastni2Nazev', 'Vlastní položka 2 – název', { text: 1, ref: 'B44' })}${fld('vlastni2Cena', 'Vlastní položka 2 – nákupní cena', { u: 'Kč', ref: 'D44' })}
    ${fld('wallbox', 'Wallbox', { u: 'ks', ref: 'F43' })}${fld('dph', 'Koeficient DPH', { ref: 'E47', hint: '1,12 = 12 % DPH' })}</div>`)}`;
};

PANELS.fve = () => {
  const head = ['Počet BJ', 'El. spol. prostor', 'Spotřeba byty', 'Spotřeba spol. pr.', 'Jedn. cena', 'Výkon FVE', 'Počet stringů', 'Typ střídače', 'Baterie ručně'];
  const units = ['ks', 'ks', 'MWh/rok', 'MWh/rok', 'Kč/MWh', 'kWp', 'ks', '', 'ks'];
  const keys = ['bj', 'spol', 'spotrByty', 'spotrSpol', 'cena', 'vykon', 'stringy', 'stridac', 'batRucne'];
  const refs = ['9', '10', '11', '12', '14', '26', '30', '32', 'nové'];
  const strOpts = ['vyber', ...Object.entries(C.stridace).filter(([, s]) => s.dostupny !== false).map(([k]) => k)];
  const filled = I.jednotky.map((u, k) => (u.bj !== '' || u.vykon !== '' || u.stridac !== 'vyber') ? k + 1 : 0);
  const nShow = Math.min(15, Math.max(2, ...filled) + (I._extra || 0));
  const rows = R.jednotky.slice(0, nShow).map(r => {
    const k = r.i, u = I.jednotky[k];
    const st = (r.chybaPanely || r.chybaBat) ? '<span class="chip bad">chyba</span>' : (!(r.aktivni || r.vykon || r.stridac !== 'vyber') ? '' : r.stridac === 'vyber' ? '<span class="chip warn">vyber střídač</span>' : !r.aktivni ? '<span class="chip warn">chybí BJ</span>' : '<span class="chip ok">OK</span>');
    return `<tr><td class="hd">${k + 1}. FVE</td>${keys.map((key, j) => key === 'stridac'
      ? `<td><select class="ci" id="u-${k}-${key}" data-u="${k}" data-uk="${key}" aria-label="${k + 1}. FVE ${head[j]}">${strOpts.map(o => `<option${o === u[key] ? ' selected' : ''}>${o}</option>`).join('')}</select></td>`
      : `<td><input class="ci${key === 'batRucne' && has(u[key]) ? ' ed' : ''}" id="u-${k}-${key}" data-u="${k}" data-uk="${key}" inputmode="decimal" value="${esc(u[key])}" aria-label="${k + 1}. FVE ${head[j]}"${key === 'batRucne' ? ' placeholder="auto"' : ''}></td>`).join('')}
      <td class="n">${r.panely == null ? '' : r.chybaPanely ? '<span class="chip bad">CHYBA</span>' : n2(r.panely, 1)}</td><td class="n">${r.koef == null ? '' : n2(r.koef, 3)}</td><td class="n">${r.batVypocet == null ? '' : n2(r.batVypocet, 2)}</td>
      <td class="n">${r.pocetBat == null ? '' : fmt(r.pocetBat) + (r.batRucne ? ' <span class="chip ed">ručně</span>' : '')}</td><td class="n">${r.pocetBat == null ? '' : r.clanek === C.baterie.gbl ? 'GB-L ' + n2(r.clanek) : 'BOS ' + n2(r.clanek)}</td>
      <td class="n">${r.kapacita == null ? '' : r.chybaBat ? '<span class="chip bad">CHYBA</span>' : n2(r.kapacita, 2)}</td><td class="n">${r.pocetBat == null ? '' : r.clanek === C.baterie.gbl ? `– / ${r.bmsGbl}` : `${r.sloupce} / ${r.bmsBos}`}</td><td>${st}</td></tr>`;
  }).join('');
  const s = R.souhrn;
  const tot = `<tr class="tot"><td class="hd">Celkem</td><td class="n">${fmt(s.D9)}</td><td class="n">${fmt(s.D10)}</td><td class="n">${n2(s.G11, 1)}</td><td class="n">${n2(s.G12, 1)}</td><td class="n">${fmt(s.G15)}</td><td class="n">${n2(s.D26)}</td><td class="n">${fmt(s.D30)}</td><td>${fmt(s.D31)} ks</td><td></td><td class="n">${n2(s.D27, 1)}</td><td></td><td></td><td class="n">${fmt(s.D29)}</td><td></td><td class="n">${n2(s.D28)}</td><td class="n">${s.W33} / ${s.W34 + s.W37}</td><td></td></tr>`;
  const nv = FVE.navrhStridace(I.navrh, C), totP = nv.panely.reduce((a, b) => a + b, 0);
  return `
  ${sec('Návrh FVE po sjednocených místech', `Každý řádek je jedna FVE / JOM (sloupce H–V listu Vstupní data). Řádek se počítá, když je vyplněn počet BJ. Baterii navrhuje Excel vzorcem koef. × výkon (koef. = výkon ÷ spotřeba × ${esc(String(I.koefBaterie))}); sloupec „Baterie ručně“ ji přepíše počtem článků – slouží pro varianty kapacity.`, `
    <div class="tw"><table class="units"><thead><tr><th></th>${head.map((h, j) => `<th>${h}<br><span class="muted small mono">${units[j]}${units[j] ? ' · ' : ''}ř.${refs[j]}</span></th>`).join('')}
      <th class="n">Panely<br><span class="muted small mono">ks</span></th><th class="n">Koef. bat.</th><th class="n">Baterie návrh<br><span class="muted small mono">kWh</span></th><th class="n">Počet baterií<br><span class="muted small mono">ks</span></th><th class="n">Článek<br><span class="muted small mono">kWh</span></th><th class="n">Kapacita<br><span class="muted small mono">kWh</span></th><th class="n">Sloupce / BMS</th><th>Kontrola</th></tr></thead>
      <tbody>${rows}</tbody><tfoot>${tot}</tfoot></table></div>
    <div class="btnrow">${nShow < 15 ? '<button class="btn" id="btnAddUnit">Přidat další FVE</button>' : ''}</div>
    ${notes(R.warn, 'bad')}
    ${R.produkt === 'Spol. prostory bez baterie' ? '<div class="note info">Produkt bez baterie – baterie se do ceny ani dotace nepočítají.</div>' : ''}
    <div class="grid">${fld('koefBaterie', 'Výchozí koeficient baterie', { ref: 'H16' })}</div>`)}
  ${sec('Návrh střídače z rozložení panelů (SolarEdge Designer)', `Přepiš počty panelů po světových stranách z návrhu v SolarEdge Designeru. Nástroj spočítá stringy (${C.parametry.panelyNaString} panelů na string), trackery (${C.parametry.stringyNaTracker} stringy na tracker) a najde nejmenší vyhovující střídač.`, `
    <div class="two"><div class="tw"><table><thead><tr><th>Světová strana</th><th class="n">Počet panelů</th><th class="n">Stringy</th><th class="n">Trackery</th></tr></thead><tbody>
      ${I.navrh.map((n, k) => `<tr><td><input class="ci" style="text-align:left;font-family:var(--f-body)" id="nv-${k}-strana" data-nv="${k}" data-nk="strana" value="${esc(n.strana)}" aria-label="Světová strana ${k + 1}" placeholder="např. J"></td><td><input class="ci" id="nv-${k}-panely" data-nv="${k}" data-nk="panely" inputmode="numeric" value="${esc(n.panely)}" aria-label="Počet panelů ${k + 1}"></td><td class="n">${fmt(nv.stringy[k])}</td><td class="n">${fmt(nv.trackery[k])}</td></tr>`).join('')}
      </tbody><tfoot><tr class="tot"><td>Celkem · ${n2(nv.vykon)} kWp</td><td class="n">${fmt(totP)}</td><td class="n">${nv.sumStr}</td><td class="n">${nv.sumTr}</td></tr></tfoot></table></div>
      <div class="tw"><table><thead><tr><th>Střídač</th><th class="n">Max. panelů</th><th class="n">Max. kWp</th><th class="n">Stringy</th><th class="n">Trackery</th><th>Vyhovuje</th></tr></thead><tbody>
      ${nv.tabulka.map(x => `<tr${x.nazev === nv.doporuceny ? ' class="best"' : ''}><td>${x.nazev}</td><td class="n">${x.panely}</td><td class="n">${n2(x.kwp)}</td><td class="n">${x.stringy}</td><td class="n">${x.trackery}</td><td>${x.ok ? '<span class="chip ok">ano</span>' : `<span class="chip warn">${!x.okVykon ? 'výkon' : !x.okStringy ? 'stringy' : 'trackery'}</span>`}</td></tr>`).join('')}</tbody></table></div></div>
    ${!totP ? '' : nv.doporuceny ? `<div class="note ok">Navržený střídač: <b>${nv.doporuceny}</b> · ${fmt(totP)} panelů, ${n2(nv.vykon)} kWp. <button class="btn ghost" id="btnUseNv">Doplnit do první volné FVE</button></div>` : '<div class="note warn">Žádný jeden střídač nevyhoví – rozděl panely na více FVE.</div>'}`)}`;
};

PANELS.energie = () => {
  const s = R.souhrn;
  return `
  ${sec('Spotřeba a ceny elektřiny', 'Spotřeby a jednotkové ceny se zadávají po FVE na záložce Návrh FVE.', `<div class="grid">
    ${fld('profil', 'Profil spotřeby produktu', { options: ['běžný', 'TČ/el. topení'], ref: 'D17' })}
    ${out('Spotřeba produktu', n2(s.E16, 1), 'E16', 'MWh/rok')}${out('Průměrná cena nákupu', fmt(s.E17, 0), 'E17', 'Kč/MWh')}
    ${fld('vykup', 'Cena výkupu přetoků', { u: 'Kč/MWh', ref: 'F17' })}${out('Roční výroba FVE', n2(s.D11, 2), 'D11', 'MWh/rok')}</div>
    <div class="small muted">Zdroj roční výroby: ${esc(s.vyrobaZdroj)} – mění se na záložce Výroba a simulace.</div>`)}
  ${sec('Ohřev TUV', 'Stávající náklady a spotřeba na ohřev teplé vody. Vyplň jednu z jednotek spotřeby – přednost má m³ plynu, pak GJ, pak MWh.', `<div class="grid">
    ${fld('tuvNaklady', 'Náklady na ohřev TUV', { u: 'Kč/rok', ref: 'D34' })}${fld('tuvM3', 'Spotřeba na ohřev TUV', { u: 'm³/rok', ref: 'D35' })}${fld('tuvGJ', '… nebo v GJ', { u: 'GJ/rok', ref: 'E35' })}${fld('tuvMWh', '… nebo v MWh', { u: 'MWh/rok', ref: 'F35' })}
    ${out('Spotřeba na ohřev TUV', s.D36 ? n2(s.D36, 2) : '–', 'D36', 'MWh/rok')}${out('Jednotková cena TUV', s.D36 ? fmt(s.D37, 0) : '–', 'D37', 'Kč/MWh')}${out('Průměrný přetok březen–říjen', n2(R.E5, 3), 'Ceník E5', 'MWh/měs.')}${out('Navržené bojlery (celkem)', s.D38 ? `${fmt(s.D38)} l · ${s.D39} ks` : '–', 'D38, D39')}</div>`)}
  ${sec('Sdílení', 'Práce s přetoky 2 – sdílení fakturačně. U profilu „běžný“ se bere spotřeba bytů; u TČ/el. topení zadej spotřebu ručně.', `<div class="grid">
    ${fld('profilSdileni', 'Profil spotřeby sdílení', { options: ['běžný', 'TČ/el. topení'], ref: 'D23' })}${fld('cenaSdileni', 'Cena elektřiny pro sdílení', { u: 'Kč/MWh', ref: 'E23' })}
    ${out('Spotřeba sdílení z bytů', s.E22auto != null ? n2(s.E22auto, 1) : '–', 'E22', 'MWh/rok')}${fld('spotrebaSdileniRucne', 'Spotřeba sdílení – ruční zadání', { u: 'MWh/rok', ref: 'E22', hint: 'prázdné = převezme se spotřeba bytů' })}</div>`)}`;
};

// ---- rozpočet ----
function rozpAktualni() { const o = {}; for (const p of R.cenik.polozky) if (p.vVariante && (p.qty !== 0)) o[p.id] = [Math.round(p.qty * 1e4) / 1e4, Math.round(p.cena * 100) / 100, p.nazev]; return o; }
function rozpZmeny() {
  const snap = V.rozpPotvrzeno; if (!snap) return R.vIdx >= 0 ? [{ nove: true }] : [];
  const cur = rozpAktualni(), z = [];
  for (const id of new Set([...Object.keys(snap), ...Object.keys(cur)])) {
    const a = snap[id], b = cur[id];
    if (!a) z.push({ id, nazev: b[2], typ: 'přibyla', z: '', na: `${fmt(b[0], 2)} × ${fmt(b[1], 2)}` });
    else if (!b) z.push({ id, nazev: a[2], typ: 'odpadla', z: `${fmt(a[0], 2)} × ${fmt(a[1], 2)}`, na: '' });
    else if (a[0] !== b[0] || a[1] !== b[1]) z.push({ id, nazev: b[2], typ: a[0] !== b[0] ? 'množství' : 'cena', z: `${fmt(a[0], 2)} × ${fmt(a[1], 2)}`, na: `${fmt(b[0], 2)} × ${fmt(b[1], 2)}` });
  }
  return z;
}
PANELS.rozpocet = () => {
  const c = R.cenik, zm = rozpZmeny();
  const rows = []; let last = null;
  for (const p of c.polozky) {
    const show = showOff || (p.vVariante && (p.qty !== 0 || p.qtyRucne || p.cenaRucne || (p.rucniMnozstvi && p.typ === 'TUV' && R.souhrn.F19 === 'ano')));
    if (!show) continue;
    if (p.kat !== last) { rows.push(`<tr class="grp"><td colspan="8">${esc(p.kat)}</td></tr>`); last = p.kat; }
    rows.push(`<tr class="${p.vVariante ? '' : 'off'}"><td class="mono small">${esc(p.kod)}</td><td class="nm">${esc(p.nazev)}${p.vVariante ? '' : ' <span class="chip info">mimo variantu</span>'}${p.rucniMnozstvi ? ' <span class="chip warn">ruční množství</span>' : ''}</td><td class="small">${esc(p.mj)}</td>
      <td class="n"><span style="display:inline-flex;align-items:center"><input class="ci${p.qtyRucne ? ' ed' : ''}" id="pq-${p.id}" data-pq="${p.id}" inputmode="decimal" value="${p.qtyRucne ? esc(I.upravy[p.id].qty) : fmt(p.qtyAuto, 2)}" aria-label="Množství ${esc(p.nazev)}">${p.qtyRucne ? `<button class="reset" data-rq="${p.id}" title="Vrátit množství z ceníku (${fmt(p.qtyAuto, 2)})" aria-label="Vrátit množství">↺</button>` : ''}</span></td>
      <td class="n"><span style="display:inline-flex;align-items:center"><input class="ci${p.cenaRucne ? ' ed' : ''}" id="pc-${p.id}" data-pc="${p.id}" inputmode="decimal" value="${p.cenaRucne ? esc(I.upravy[p.id].cena) : fmt(p.cenaAuto, 2)}" aria-label="Nákupní cena ${esc(p.nazev)}">${p.cenaRucne ? `<button class="reset" data-rc="${p.id}" title="Vrátit cenu z ceníku (${fmt(p.cenaAuto, 2)})" aria-label="Vrátit cenu">↺</button>` : ''}</span></td>
      <td class="n">${fmt(p.naklad, 0)}</td><td class="n">${p.vVariante ? fmt(p.prodej, 0) : '–'}</td><td class="small muted">${esc(p.typ)}</td></tr>`);
  }
  const zmBox = !zm.length ? `<div class="banner ok"><span>Rozpočet odpovídá potvrzenému stavu${V.rozpPotvrzeno ? '' : ''}.</span></div>`
    : zm[0].nove ? `<div class="banner info"><span>Rozpočet této varianty ještě nebyl potvrzen. Po kontrole ho potvrď – další změny vstupů pak uvidíš jako seznam rozdílů.</span><button class="btn primary" id="btnRozpOk">Potvrdit rozpočet</button></div>`
    : `<div class="banner warn"><span>Od posledního potvrzení se změnilo ${zm.length} ${zm.length === 1 ? 'položka' : zm.length < 5 ? 'položky' : 'položek'}. Zkontroluj je a potvrď.</span><button class="btn primary" id="btnRozpOk">Potvrdit změny</button></div>
       <div class="tw"><table><thead><tr><th>Položka</th><th>Změna</th><th class="n">Bylo (množství × cena)</th><th class="n">Nově</th></tr></thead><tbody>${zm.map(z => `<tr><td>${esc(z.nazev)}</td><td><span class="chip ${z.typ === 'odpadla' ? 'bad' : z.typ === 'přibyla' ? 'ok' : 'warn'}">${z.typ}</span></td><td class="n">${z.z}</td><td class="n">${z.na}</td></tr>`).join('')}</tbody></table></div>`;
  return `
  ${sec('Položkový rozpočet', `Množství a nákupní ceny se počítají z ceníku ${esc(C.id)} (koeficient ${fmt(C.parametry.koeficient, 3)}). Ruční úprava se zvýrazní fialově, přepočet ji nepřepíše a zapíše se do historie; ↺ vrátí hodnotu z ceníku.`, `
    ${zmBox}
    <div class="legend"><span><span class="chip ed">upraveno</span> ruční hodnota</span><span><span class="chip info">mimo variantu</span> do zvolené varianty se nepočítá</span>
      <label class="chk"><input type="checkbox" id="showOff" ${showOff ? 'checked' : ''}> zobrazit i položky mimo variantu a nulové</label>
      <button class="btn ghost" id="btnResetAll">Zrušit všechny ruční úpravy</button><button class="btn ghost" id="btnCsv">Stáhnout rozpočet (CSV)</button></div>
    <div class="tw"><table id="rozp"><thead><tr><th>Kód</th><th>Položka</th><th>MJ</th><th class="n">Množství</th><th class="n">Nákup Kč/MJ</th><th class="n">Nákup celkem</th><th class="n">Prodej bez DPH</th><th>Typ</th></tr></thead>
    <tbody>${rows.join('') || '<tr><td colspan="8" class="muted">Vyber typ produktu a orientaci.</td></tr>'}</tbody>
    <tfoot><tr class="tot"><td></td><td colspan="4">Nákup celkem ve variantě ${esc(R.varianta)}</td><td class="n">${fmt(c.vse, 0)}</td><td class="n">${fmt(c.vse * C.parametry.koeficient, 0)}</td><td></td></tr></tfoot></table></div>`)}
  <section class="sec two">
    <div class="sec"><h3>Cena</h3>${kv([['Nákup – součet položek', kc(c.vse)], [`Sleva ${fmt(C.parametry.slevaFvePbr * 100)} % na FVE a PBŘ (nákup)`, '− ' + kc(c.slevaNakup)], ['Nákup po slevě', kc(c.nakupCelkem), 'strong'], ['× koeficient ceníku', fmt(C.parametry.koeficient, 3)], ['Prodejní cena bez DPH', kc(c.D47), 'strong sep'], ['DPH', kc(c.F47 - c.D47)], ['Prodejní cena s DPH', kc(c.F47), 'strong'], ['Prodejní cena do rozpočtu (před slevou)', kc(c.M45)], ['Sleva IP na FVE a PBŘ', kc(c.M46)]])}</div>
    <div class="sec"><h3>Rozpad prodejní ceny s DPH (Výstup TOP)</h3>${kv(FVE.SOUCTOVE_TYPY.map(k => [k + ((k === 'FVE' || k === 'PBŘ') ? ' (po slevě)' : ''), kc(c.kVystup[k])]))}</div>
  </section>`;
};

PANELS.dotace = () => {
  const d = R.dotace, s = R.souhrn, c = R.cenik;
  return sec('Dotace NZÚ', 'Podle zadávací dokumentace se v ekonomice standardně počítá plná cena bez dotace. Dotace se odečte jen tam, kde je to výslovně zapnuté. Do rozpočtu jde částka v poli „Celková výše dotace“ – přípravář ji přepíše z vypočtené hodnoty.', `
    <div class="grid">${fld('dotaceVykon', 'Dotace na výkon FVE', { u: 'Kč/kWp', ref: 'K54' })}${fld('dotaceBaterie', 'Dotace na baterii', { u: 'Kč/kWh', ref: 'K55' })}${fld('dotaceByt', 'Dotace na připojení bytu', { u: 'Kč/byt', ref: 'K56' })}${fld('dotaceWallbox', 'Dotace na wallbox', { u: 'Kč/ks', ref: 'K57' })}</div>
    <div class="two"><div class="sec"><h3>Výpočet nároku</h3>${kv([
      [`Výkon FVE ${fmt(FVE.floor(s.D26))} kWp × ${fmt(num(I.dotaceVykon))}`, kc(d.H54)], [`Baterie (započteno ${fmt(FVE.floor(d.P91))} kWh z ${n2(s.D28)} kWh)`, kc(d.H55)],
      [`Připojení bytů (${n2(d.bytuSDotaci, 1)} bytů)`, kc(d.H56)], ['Wallbox', kc(d.H57)], ['Nárok celkem', kc(d.E53), 'strong sep'], ['Max. 50 % ceny s DPH', kc(c.F47 * C.dotace.limitPodilCeny)], ['Vypočtená dotace do rozpočtu', kc(d.M80), 'strong']])}</div>
      <div class="sec"><h3>Do rozpočtu</h3><div class="grid" style="grid-template-columns:1fr">${fld('dotaceRucne', 'Celková výše dotace', { u: 'Kč', ref: 'E56', hint: 'prázdné = bez dotace' })}</div>
        <div class="btnrow"><button class="btn" id="btnTakeDot">Převzít vypočtenou dotaci (${kc(d.M80)})</button></div>
        ${kv([['Dotace v rozpočtu', kc(d.E56), 'strong'], ['Cena po odečtu dotace bez DPH', kc(c.D59)], ['Cena po odečtu dotace s DPH', kc(c.F59), 'strong'], ['Kontrolní hranice (85 % z limitu)', kc(d.E57)]])}
        ${notes(d.hlasky)}</div></div>`);
};

PANELS.vyroba = () => {
  const s = R.souhrn, S = getS(), m = R.mesice;
  const ukazka = S.ukazky[simDen] || [];
  const dayChart = bars([ukazka.map(x => x.direct + x.dis), ukazka.map(x => x.export), ukazka.map(x => x.ch)], ['var(--c-fve)', 'var(--c-pretok)', 'var(--sun)'], ukazka.map(x => String(x.h)), 190, 'kWh');
  return `
  ${sec('Výroba FVE', 'Excel počítá 0,9 MWh na kWp. Roční výrobu lze zadat ručně (např. ze SolarEdge Designeru) nebo modelově odhadnout z orientace, sklonu a ztrát. Zvolená výroba se promítne do bilance, TUV, návratnosti i simulace.', `<div class="grid">
    ${fld('vyrobaRezim', 'Zdroj roční výroby', { options: [['excel', 'Excel (0,9 MWh/kWp)'], ['rucne', 'Ruční zadání'], ['odhad', 'Modelový odhad']] })}
    ${I.vyrobaRezim === 'rucne' ? fld('vyrobaRucne', 'Roční výroba – ruční zadání', { u: 'MWh/rok', hint: 'např. hodnota ze SolarEdge Designeru' }) : ''}
    ${fld('sklon', 'Sklon panelů', { u: '°', hint: 'plochá střecha VZ / J = 15°' })}
    ${I.orientace === 'šikmá' ? fld('azimut', 'Azimut', { u: '°', hint: '180 = jih, 90 = východ, 270 = západ' }) : ''}
    ${fld('ztraty', 'Systémové ztráty', { u: '%' })}
    ${out('Odhad roční výroby', n2(OD.mwh, 2), '', 'MWh/rok')}${out('Měrná výroba odhadu', fmt(OD.naKwp, 0), '', 'kWh/kWp')}${out('Výroba podle Excelu', n2(s.D11excel, 2), 'D11', 'MWh/rok')}${out('Použitá výroba', n2(s.D11, 2), '', 'MWh/rok')}</div>
    <div class="small muted">Odhad je modelový (jasnost oblohy pro Vysočinu, ${esc(String(C.model.vyrobaOptimalniBrutto))} kWh/kWp brutto pro optimálně orientovanou plochu), nejde o naměřená data. Roviny: ${OD.roviny.map(r => `${n2(r.kwp, 1)} kWp ${r.sklon}°/${r.azimut}°`).join(', ') || '–'}.</div>`)}
  ${sec('Měsíční bilance podle Excelu', `Scénář: ${esc(R.nazevScen || '–')}. Koeficient přímé spotřeby ${pct(s.I)} (bez baterie 50 %, s baterií až 92 % podle poměru kapacita/výkon).`, `
    <div class="two"><div class="sec"><h3>Výroba FVE po měsících</h3>${bars([m.map(r => r.H), m.map(r => r.K)], ['var(--c-fve)', 'var(--c-pretok)'], MES3)}<div class="legend"><span><span class="sw" style="background:var(--c-fve)"></span>odběr z FVE</span><span><span class="sw" style="background:var(--c-pretok)"></span>přetok po produktu</span></div></div>
      <div class="sec"><h3>Spotřeba produktu po měsících</h3>${bars([m.map(r => r.H), m.map(r => r.J)], ['var(--c-fve)', 'var(--c-sit)'], MES3)}<div class="legend"><span><span class="sw" style="background:var(--c-fve)"></span>odběr z FVE</span><span><span class="sw" style="background:var(--c-sit)"></span>odběr ze sítě</span></div></div></div>
    ${mesTable()}`)}
  ${sec('Hodinová simulace', 'Podrobný režim: 8 760 hodin s modelovými profily výroby a spotřeby přepočtenými na měsíční hodnoty výše. V každé hodině se nejdřív kryje spotřeba produktu, přebytek nabíjí baterii (jen z FVE, ne ze sítě), pak ohřívá TUV, pak jde do sdílení a zbytek do sítě; baterie v deficitu vybíjí do spotřeby.', `
    <div class="grid">${fld('batDod', 'Využitelná kapacita baterie (DoD)', { u: '%' })}${fld('batUcinnost', 'Účinnost baterie (nabití + vybití)', { u: '%' })}${fld('batCRate', 'Nabíjecí / vybíjecí výkon', { u: '× kapacita', hint: 'omezeno i výkonem střídačů' })}${fld('tuvVykon', 'Výkon ohřevu TUV z přetoků', { u: 'kW' })}</div>
    <div class="two"><div class="sec">${kv([['Výroba FVE', n2(S.pv) + ' MWh'], ['Spotřeba produktu', n2(S.load) + ' MWh'], ['Přímá spotřeba', n2(S.direct) + ' MWh'], ['Nabito do baterie', n2(S.nabijeni) + ' MWh'], ['Vybito z baterie', n2(S.vybijeni) + ' MWh'], ['Ohřev TUV z přetoků', n2(S.tuv) + ' MWh'], ['Sdílení', n2(S.sdileni) + ' MWh'], ['Dodávka do sítě', n2(S.export) + ' MWh', 'strong'], ['Nákup ze sítě', n2(S.import) + ' MWh', 'strong']])}</div>
      <div class="sec">${kv([['Kapacita baterie (nominální / využitelná)', `${n2(S.cap)} / ${n2(S.capUsable)} kWh`], ['Výkon baterie', n2(S.pBat, 1) + ' kW'], ['Ekvivalentní cykly za rok', fmt(S.cykly, 0)], ['Míra vlastní spotřeby výroby', pct(S.vlastniSpotreba), 'strong'], ['Soběstačnost produktu', pct(S.sobestacnost), 'strong'], ['Odběr z FVE produktem – simulace', n2(S.odberFVEProdukt) + ' MWh'], ['Odběr z FVE produktem – Excel', n2(R.vysledky.odberFVE) + ' MWh']])}</div></div>
    <div class="sechead"><h3>Ukázkový den</h3><div class="subtabs">${[['brezen', '20. března'], ['cerven', '21. června'], ['prosinec', '21. prosince']].map(([k, l]) => `<button data-simden="${k}" aria-pressed="${simDen === k}">${l}</button>`).join('')}</div></div>
    <div style="max-width:720px">${dayChart}</div><div class="legend"><span><span class="sw" style="background:var(--c-fve)"></span>spotřeba kryta z FVE a baterie</span><span><span class="sw" style="background:var(--sun)"></span>nabíjení baterie</span><span><span class="sw" style="background:var(--c-pretok)"></span>přetok</span><span class="muted">Spotřeba v ten den: ${n2(ukazka.reduce((a, x) => a + x.load, 0), 0)} kWh, výroba ${n2(ukazka.reduce((a, x) => a + x.pv, 0), 0)} kWh</span></div>
    <div class="tw"><table><thead><tr><th>Měsíc</th><th class="n">Výroba</th><th class="n">Spotřeba</th><th class="n">Přímá</th><th class="n">Z baterie</th><th class="n">TUV</th><th class="n">Sdílení</th><th class="n">Do sítě</th><th class="n">Ze sítě</th></tr></thead><tbody>
      ${S.mesice.map((r, k) => `<tr><td>${FVE.MESICE[k]}</td><td class="n">${n2(r.pv)}</td><td class="n">${n2(r.load)}</td><td class="n">${n2(r.direct)}</td><td class="n">${n2(r.vybijeni)}</td><td class="n">${n2(r.tuv)}</td><td class="n">${n2(r.sdileni)}</td><td class="n">${n2(r.export)}</td><td class="n">${n2(r.import)}</td></tr>`).join('')}</tbody></table></div>
    <div class="small muted">MWh. Profily spotřeby i výroby jsou modelové, ne naměřené. Spotřeba se dělí na byty a společné prostory podle zadaných ročních spotřeb.</div>`)}`;
};
function mesTable() {
  const m = R.mesice, sc = R.scen, tuvOn = sc === 'G' || sc === 'H', sdOn = sc === 'H' || sc === 'I';
  const fin = r => sdOn ? r.AD : (tuvOn ? r.S : r.K);
  return `<div class="tw"><table><thead><tr><th>Měsíc</th><th class="n">Spotřeba</th><th class="n">Výroba FVE</th><th class="n">Odběr z FVE</th><th class="n">Odběr ze sítě</th><th class="n">Přetok po produktu</th><th class="n">Využito TUV</th><th class="n">Využito sdílení</th><th class="n">Přetok do sítě</th></tr></thead><tbody>
  ${m.map(r => `<tr><td>${r.mesic}</td><td class="n">${n2(r.E)}</td><td class="n">${n2(r.F)}</td><td class="n">${n2(r.H)}</td><td class="n">${n2(r.J)}</td><td class="n">${n2(r.K)}</td><td class="n">${tuvOn ? n2(r.Q) : '–'}</td><td class="n">${sdOn ? n2(r.AB) : '–'}</td><td class="n">${n2(fin(r))}</td></tr>`).join('')}
  <tr class="tot"><td>Rok</td><td class="n">${n2(R.T.E)}</td><td class="n">${n2(R.T.F)}</td><td class="n">${n2(R.T.H)}</td><td class="n">${n2(R.T.J)}</td><td class="n">${n2(R.T.K)}</td><td class="n">${tuvOn ? n2(R.T.Q) : '–'}</td><td class="n">${sdOn ? n2(R.T.AB) : '–'}</td><td class="n">${n2(m.reduce((a, r) => a + fin(r), 0))}</td></tr></tbody></table></div>`;
}

PANELS.eko = () => {
  const Ee = getE(), v = R.vysledky;
  const cum = [-Ee.investice, ...Ee.roky.map(r => r.kum)];
  return `
  ${sec('Ekonomické předpoklady', 'Výchozí je plná investiční cena s DPH bez odečtení dotace. Všechny předpoklady jsou editovatelné a uloží se s variantou.', `<div class="grid">
    ${fld('ekoRezim', 'Zdroj energetických přínosů', { options: [['mesicni', 'Měsíční model podle Excelu'], ['hodinovy', 'Hodinová simulace']] })}
    ${fld('investiceRucne', 'Investice s DPH – ruční zadání', { u: 'Kč', hint: `prázdné = cena z rozpočtu ${kc(R.cenik.F47)}` })}
    ${fld('zapocistDotaci', 'Odečíst dotaci z investice', { options: yn, hint: `dotace v rozpočtu: ${kc(R.dotace.E56)}` })}
    ${fld('provozni', 'Provozní náklady', { u: 'Kč/rok', hint: 'servis, revize, pojištění' })}
    ${fld('horizont', 'Ekonomický horizont', { u: 'let' })}${fld('diskont', 'Diskontní sazba', { u: '%' })}${fld('rustCen', 'Růst cen elektřiny', { u: '%/rok' })}${fld('degradace', 'Degradace výroby', { u: '%/rok' })}
    ${fld('vykup', 'Cena výkupu přetoků', { u: 'Kč/MWh', ref: 'F17' })}${out('Průměrná cena nákupu elektřiny', fmt(R.souhrn.E17 / 1000, 2), 'E17', 'Kč/kWh')}</div>`)}
  <section class="sec two">
    <div class="sec"><h3>Výsledky – 1. rok</h3>${kv([['Úspora za nakoupenou elektřinu', kc(Ee.usporaNakup)], ['… z toho produkt', kc(Ee.detail.produkt)], ['… z toho TUV', kc(Ee.detail.tuv)], ['… z toho sdílení', kc(Ee.detail.sdileni)], ['Výnos z přetoků', kc(Ee.vynosPretoky)], ['Provozní náklady', '− ' + kc(Ee.provozni)], ['Čistý roční přínos', kc(Ee.rocniCisty), 'strong sep'], ['Investice s DPH', kc(Ee.cenaSDph)], ['Odečtená dotace', kc(Ee.dotace)], ['Čistá investice', kc(Ee.investice), 'strong']])}</div>
    <div class="sec"><h3>Návratnost a hodnota za ${Ee.horizont} let</h3>${kv([['Prostá doba návratnosti', yrs(Ee.prostaNavratnost), 'strong'], ['Návratnost z peněžního toku', yrs(Ee.navratnostZCashflow)], ['Diskontovaná návratnost', Ee.diskontovanaNavratnost == null ? 'nad horizont' : yrs(Ee.diskontovanaNavratnost)], ['Čistá současná hodnota (NPV)', kc(Ee.npv), 'strong sep'], ['Vnitřní výnosové procento (IRR)', Ee.irr == null ? '–' : pct(Ee.irr)], ['Kumulovaný tok na konci', kc(cum[cum.length - 1])], ['Zdroj přínosů', esc(Ee.zdroj)]])}
      <div class="small muted">Pro srovnání – Excel: návratnost vč. prodeje přetoků ${yrs(v.navratnostVc)}, bez prodeje ${yrs(v.navratnostBez)}, prostá (Výstup TOP) ${yrs(v.prostaNavratnost)}. Excel počítá s cenou po odečtu dotace.</div></div>
  </section>
  ${sec('Kumulovaný peněžní tok', '', `${lineChart(cum)}<div class="small muted">Kč, osa x = roky od investice.</div>
    <div class="tw"><table><thead><tr><th>Rok</th><th class="n">Úspora</th><th class="n">Výnos z přetoků</th><th class="n">Provozní náklady</th><th class="n">Čistý tok</th><th class="n">Kumulovaně</th><th class="n">Kumulovaně diskontovaně</th></tr></thead><tbody>
    ${Ee.roky.map(r => `<tr><td>${r.t}</td><td class="n">${fmt(r.uspora)}</td><td class="n">${fmt(r.vynos)}</td><td class="n">${fmt(r.provozni)}</td><td class="n">${fmt(r.cist)}</td><td class="n"${r.kum >= 0 ? ' style="color:var(--ok)"' : ''}>${fmt(r.kum)}</td><td class="n">${fmt(r.kumD)}</td></tr>`).join('')}</tbody></table></div>`)}`;
};

PANELS.varianty = () => {
  const data = P.varianty.map(v => ({ v, x: fullVariant(v) }));
  const rows = [
    ['Produkt / scénář', d => esc(d.x.R.nazevScen || '–')],
    ['Výkon FVE', d => n2(d.x.R.souhrn.D26) + ' kWp', d => d.x.R.souhrn.D26],
    ['Panely', d => fmt(d.x.R.souhrn.D27) + ' ks'],
    ['Kapacita baterií', d => n2(d.x.R.souhrn.D28) + ' kWh'],
    ['Roční výroba', d => n2(d.x.R.souhrn.D11, 1) + ' MWh'],
    ['Cena bez DPH', d => kc(d.x.R.cenik.D47), d => -d.x.R.cenik.D47],
    ['Cena s DPH', d => kc(d.x.R.cenik.F47)],
    ['Dotace v rozpočtu', d => kc(d.x.R.dotace.E56)],
    ['Vlastní spotřeba výroby (simulace)', d => pct(d.x.S.vlastniSpotreba), d => d.x.S.vlastniSpotreba],
    ['Soběstačnost produktu (simulace)', d => pct(d.x.S.sobestacnost), d => d.x.S.sobestacnost],
    ['Dodávka do sítě (simulace)', d => n2(d.x.S.export, 1) + ' MWh'],
    ['Cykly baterie / rok', d => fmt(d.x.S.cykly)],
    ['Roční úspora + výnos', d => kc(d.x.E.usporaNakup + d.x.E.vynosPretoky), d => d.x.E.usporaNakup + d.x.E.vynosPretoky],
    ['Čistá investice', d => kc(d.x.E.investice)],
    ['Prostá návratnost', d => yrs(d.x.E.prostaNavratnost), d => d.x.E.prostaNavratnost == null ? -1e9 : -d.x.E.prostaNavratnost],
    ['NPV', d => kc(d.x.E.npv), d => d.x.E.npv],
    ['IRR', d => d.x.E.irr == null ? '–' : pct(d.x.E.irr), d => d.x.E.irr ?? -1e9],
    ['Návratnost podle Excelu', d => yrs(d.x.R.vysledky.navratnostVc)],
    ['Zdroj přínosů', d => esc(d.x.E.zdroj)],
  ];
  const body = rows.map(([l, f, score]) => { let best = -1; if (score && data.length > 1) { const sc = data.map(score); const fin = sc.filter(isFinite); if (fin.length && Math.max(...fin) - Math.min(...fin) > 1e-9) { const mx = Math.max(...fin); if (sc.filter(x => Math.abs(x - mx) < 1e-9).length === 1) best = sc.findIndex(x => Math.abs(x - mx) < 1e-9); } } return `<tr><td>${l}</td>${data.map((d, k) => `<td class="n${k === best ? ' best' : ''}">${f(d)}</td>`).join('')}</tr>`; }).join('');
  return sec('Porovnání variant', 'Každá varianta se počítá se svými vstupy i ekonomickými předpoklady. Zeleně je nejlepší hodnota v řádku. Varianty se přidávají tlačítkem + varianta nahoře nebo „Vytvořit varianty kapacity baterie“.', `
    <div class="btnrow"><button class="btn" id="btnBatVar">Vytvořit varianty kapacity baterie</button></div>
    <div class="tw"><table class="cmp"><thead><tr><th>Ukazatel</th>${data.map(d => `<th class="n">${esc(d.v.nazev)}${d.v.id === V.id ? ' · otevřená' : ''}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`);
};

// ---- report ----
function defaultRepOpts() { return { zakaznik: true, technika: true, predpoklady: true, bilance: true, rozpocet: true, nakup: false, dotace: true, ekonomika: true, varianty: P.varianty.length > 1 }; }
function reportHTML() {
  const o = repOpts || (repOpts = defaultRepOpts());
  const s = R.souhrn, c = R.cenik, v = R.vysledky, t = C.kontakty.top.find(x => x[0] === I.top), S = getS(), Ee = getE();
  const tile = (l, val, u = '') => `<div class="tile"><div class="l">${l}</div><div class="v">${val} <span class="small muted">${u}</span></div></div>`;
  const today = new Date().toLocaleDateString('cs-CZ');
  const foot = `<div class="small muted">Projekt „${esc(P.nazev || '')}“ · varianta ${esc(V.nazev)} · ${esc(C.nazev)} · výpočet ${today} · výpočetní model kalkulačky v2 (Excel 02.06.2026 + hodinová simulace)</div>`;
  let h = `<div class="report">
    <div class="rh"><div><div class="small muted">Návrh fotovoltaické elektrárny</div><h2>${esc(I.adresa || P.nazev || 'Bytový dům')}</h2><div class="muted">${esc(I.kontakt || '')} ${esc(I.funkce || '')}</div><div class="small muted">Varianta: ${esc(V.nazev)} · ${today}</div></div>
      <div class="small" style="text-align:right">Technicko obchodní poradce<br><b>${esc(I.top || '–')}</b><br><span class="mono">${t ? esc(t[1]) : ''}</span><br><span class="mono">${t ? esc(t[2]) : ''}</span>${I.pripravar && I.pripravar !== 'vyber' ? `<br>Přípravář: ${esc(I.pripravar)}` : ''}</div></div>`;
  if (o.zakaznik) h += `<div class="tiles">${tile('Produkt', esc(R.nazevScen || '–'))}${tile('Výkon FVE', n2(s.D26), 'kWp')}${tile('Kapacita baterií', n2(s.D28), 'kWh')}${tile('Počet panelů', fmt(s.D27), 'ks')}${tile('Počet baterií', fmt(s.D29), 'ks')}${tile('Počet střídačů', fmt(s.D31), 'ks')}${tile('Sjednocená místa', fmt(s.D12), 'ks')}${s.F19 === 'ano' ? tile('Bojlery', fmt(s.D39), 'ks') : ''}${tile('Roční výroba', n2(s.D11, 1), 'MWh')}${tile('Odběr z FVE', v.podilOdberFVE == null ? '–' : fmt(v.podilOdberFVE * 100, 1), '%')}</div>
    <div class="two"><div class="sec"><h3>Dům</h3>${kv([['Cena systému FVE s DPH', kc(v.cenaDum)], ['Výše dotace', kc(v.dotace)], ['Investice po odečtu dotace', kc(v.investiceDum), 'strong'], ['Aktuální cena za energii', kc(v.nakladyProdukt)], ['Úspora spotřeby s FVE / rok', kc(v.usporaDum), 'strong'], ['Prostá návratnost (Výstup TOP)', yrs(v.prostaNavratnost), 'strong sep']])}</div>
      <div class="sec"><h3>Byt (${fmt(s.D9)} BJ)</h3>${kv([['Cena za byt', kc(v.cenaByt)], ['Investice po dotaci na byt', kc(v.investiceByt)], ['Aktuální cena za energii na byt', kc(s.D9 ? v.nakladyProdukt / s.D9 : 0)], ['Úspora na byt / rok', kc(v.usporaByt), 'strong'], ['Aktuální cena kWh', n2(v.cenaProdukt / 1000) + ' Kč'], ['Cena kWh s FVE', n2(v.cenaSFVEProdukt / 1000) + ' Kč'], ['Výkupní cena kWh', n2(v.vykup / 1000) + ' Kč']])}</div></div>`;
  if (o.technika) h += `<div class="sec pb"><h3>Technické parametry</h3>${kv([['Adresa', esc(I.adresa || '–')], ['Budova (výška × délka × šířka)', `${n2(num(I.vyska), 1)} × ${n2(num(I.delka), 1)} × ${n2(num(I.sirka), 1)} m`], ['Vchody / patra', `${fmt(num(I.vchody))} / ${fmt(num(I.patra))}`], ['Počet BJ + společné prostory', `${fmt(s.D9)} + ${fmt(s.D10)}`], ['Orientace a kotvení', `${esc(I.orientace)} · ${esc(I.kotveni)}`], ['Panely na fasádě', `${fmt(num(I.panelyFasada))} ks / ${n2(num(I.vykonFasada))} kWp`]])}
    <div class="tw"><table><thead><tr><th>FVE</th><th class="n">BJ</th><th class="n">Výkon kWp</th><th class="n">Panely</th><th>Střídač</th><th class="n">Stringy</th><th class="n">Baterie ks</th><th class="n">Kapacita kWh</th></tr></thead><tbody>${R.jednotky.filter(r => r.aktivni || r.vykon).map(r => `<tr><td>${r.i + 1}. FVE</td><td class="n">${fmt(r.bj)}</td><td class="n">${n2(r.vykon)}</td><td class="n">${r.panely == null ? '–' : n2(r.panely, 0)}</td><td>${esc(r.stridac)}</td><td class="n">${fmt(r.stringy)}</td><td class="n">${r.pocetBat == null ? '–' : fmt(r.pocetBat)}</td><td class="n">${r.kapacita == null ? '–' : n2(r.kapacita)}</td></tr>`).join('')}</tbody></table></div></div>`;
  if (o.predpoklady) h += `<div class="sec"><h3>Použité předpoklady</h3>${kv([['Roční výroba', `${n2(s.D11, 2)} MWh (${esc(s.vyrobaZdroj)})`], ['Spotřeba produktu', `${n2(s.E16, 1)} MWh/rok, profil ${esc(I.profil)}`], ['Cena nákupu elektřiny', fmt(s.E17 / 1000, 2) + ' Kč/kWh'], ['Cena výkupu', fmt(num(I.vykup) / 1000, 2) + ' Kč/kWh'], ['TUV', I.tuv === 'ano' ? `${n2(s.D36, 1)} MWh/rok, ${fmt(s.D37 / 1000, 2)} Kč/kWh` : 'ne'], ['Sdílení', I.sdileni === 'ano' ? `${n2(s.E22, 1)} MWh/rok, ${fmt(num(I.cenaSdileni) / 1000, 2)} Kč/kWh` : 'ne'], ['Baterie v simulaci', `DoD ${fmt(num(I.batDod))} %, účinnost ${fmt(num(I.batUcinnost))} %, výkon ${n2(num(I.batCRate), 2)} C`], ['Ekonomika', `${Ee.zdroj}; horizont ${Ee.horizont} let, diskont ${fmt(num(I.diskont), 1)} %, růst cen ${fmt(num(I.rustCen), 1)} %, degradace ${fmt(num(I.degradace), 1)} %`]])}<div class="small muted">Hodinové profily výroby a spotřeby jsou modelové a přepočtené na zadané roční hodnoty – nejde o naměřená data.</div></div>`;
  if (o.bilance) h += `<div class="sec pb"><h3>Energetická bilance</h3><div class="two"><div>${bars([R.mesice.map(r => r.H), R.mesice.map(r => r.K)], ['var(--c-fve)', 'var(--c-pretok)'], MES3, 170)}<div class="legend"><span><span class="sw" style="background:var(--c-fve)"></span>odběr z FVE</span><span><span class="sw" style="background:var(--c-pretok)"></span>přetok</span></div></div><div>${kv([['Výroba FVE', n2(S.pv, 1) + ' MWh'], ['Přímá spotřeba', n2(S.direct, 1) + ' MWh'], ['Z baterie', n2(S.vybijeni, 1) + ' MWh'], ['TUV z přetoků', n2(S.tuv, 1) + ' MWh'], ['Sdílení', n2(S.sdileni, 1) + ' MWh'], ['Do sítě', n2(S.export, 1) + ' MWh'], ['Vlastní spotřeba výroby', pct(S.vlastniSpotreba), 'strong'], ['Soběstačnost', pct(S.sobestacnost), 'strong']])}<div class="small muted">Hodnoty z hodinové simulace.</div></div></div>${mesTable()}</div>`;
  if (o.rozpocet) {
    const pol = c.polozky.filter(p => p.vVariante && p.qty !== 0); let last = null;
    h += `<div class="sec pb"><h3>Položkový rozpočet a investiční náklady</h3><div class="tw"><table><thead><tr><th>Položka</th><th>MJ</th><th class="n">Množství</th>${o.nakup ? '<th class="n">Nákup Kč/MJ</th><th class="n">Nákup</th>' : ''}<th class="n">Cena bez DPH</th></tr></thead><tbody>
      ${pol.map(p => { let g = ''; if (p.kat !== last) { g = `<tr class="grp"><td colspan="${o.nakup ? 6 : 4}">${esc(p.kat)}</td></tr>`; last = p.kat; } return g + `<tr><td>${esc(p.nazev)}${p.qtyRucne || p.cenaRucne ? ' *' : ''}</td><td>${esc(p.mj)}</td><td class="n">${fmt(p.qty, 2)}</td>${o.nakup ? `<td class="n">${fmt(p.cena, 2)}</td><td class="n">${fmt(p.naklad)}</td>` : ''}<td class="n">${fmt(p.prodej)}</td></tr>`; }).join('')}
      </tbody></table></div>${kv([[`Sleva ${fmt(C.parametry.slevaFvePbr * 100)} % na FVE a PBŘ`, '− ' + kc(c.M46)], ['Cena bez DPH', kc(c.D47), 'strong'], ['DPH', kc(c.F47 - c.D47)], ['Cena s DPH', kc(c.F47), 'strong']])}
      <div class="small muted">* ručně upravená položka. ${V.rozpPotvrzeno ? (rozpZmeny().length ? 'Rozpočet obsahuje nepotvrzené změny.' : 'Rozpočet potvrzen přípravářem.') : 'Rozpočet zatím nebyl potvrzen.'}</div></div>`;
  }
  if (o.dotace) h += `<div class="sec"><h3>Dotace</h3>${kv([['Nárok celkem (výkon, baterie, byty, wallbox)', kc(R.dotace.E53)], ['Dotace v rozpočtu', kc(R.dotace.E56), 'strong'], ['Cena po odečtu dotace s DPH', kc(c.F59)]])}</div>`;
  if (o.ekonomika) { const cum = [-Ee.investice, ...Ee.roky.map(r => r.kum)]; h += `<div class="sec pb"><h3>Ekonomické vyhodnocení</h3><div class="two"><div>${kv([['Čistá investice', kc(Ee.investice), 'strong'], ['Úspora za nakoupenou elektřinu / rok', kc(Ee.usporaNakup)], ['Výnos z přetoků / rok', kc(Ee.vynosPretoky)], ['Provozní náklady / rok', kc(Ee.provozni)], ['Prostá doba návratnosti', yrs(Ee.prostaNavratnost), 'strong'], ['Diskontovaná návratnost', Ee.diskontovanaNavratnost == null ? 'nad horizont' : yrs(Ee.diskontovanaNavratnost)], ['NPV', kc(Ee.npv)], ['IRR', Ee.irr == null ? '–' : pct(Ee.irr)]])}</div><div>${lineChart(cum, 190)}<div class="small muted">Kumulovaný peněžní tok v Kč za ${Ee.horizont} let.</div></div></div></div>`; }
  if (o.varianty && P.varianty.length > 1) { const d = P.varianty.map(vv => ({ vv, x: fullVariant(vv) })); h += `<div class="sec"><h3>Porovnání variant</h3><div class="tw"><table><thead><tr><th>Varianta</th><th class="n">kWp</th><th class="n">Baterie kWh</th><th class="n">Cena s DPH</th><th class="n">Úspora + výnos / rok</th><th class="n">Prostá návratnost</th><th class="n">NPV</th></tr></thead><tbody>${d.map(({ vv, x }) => `<tr><td>${esc(vv.nazev)}</td><td class="n">${n2(x.R.souhrn.D26)}</td><td class="n">${n2(x.R.souhrn.D28)}</td><td class="n">${fmt(x.R.cenik.F47)}</td><td class="n">${fmt(x.E.usporaNakup + x.E.vynosPretoky)}</td><td class="n">${yrs(x.E.prostaNavratnost)}</td><td class="n">${fmt(x.E.npv)}</td></tr>`).join('')}</tbody></table></div></div>`; }
  return h + foot + '</div>';
}
PANELS.report = () => {
  const o = repOpts || (repOpts = defaultRepOpts());
  const opts = [['zakaznik', 'Výstup pro zákazníka'], ['technika', 'Technické parametry'], ['predpoklady', 'Předpoklady'], ['bilance', 'Energetická bilance'], ['rozpocet', 'Položkový rozpočet'], ['nakup', 'včetně nákupních cen'], ['dotace', 'Dotace'], ['ekonomika', 'Ekonomika'], ['varianty', 'Porovnání variant']];
  return `<div class="sechead"><div class="btnrow">${opts.map(([k, l]) => `<label class="chk"><input type="checkbox" id="ro-${k}" data-ro="${k}" ${o[k] ? 'checked' : ''}> ${l}</label>`).join('')}</div>
    <div class="btnrow"><button class="btn primary" id="btnPrint">Tisk / uložit jako PDF</button><button class="btn" id="btnRepHtml">Stáhnout jako HTML</button></div></div>
    <div class="small muted">V dialogu tisku zvol „Uložit jako PDF“. Report se generuje z aktuálních vstupů otevřené varianty${dirty ? ' – projekt má neuložené změny' : ''}.</div>${reportHTML()}`;
};

// ---- administrace ----
function admLoad(id) { const cs = ST.ceniky(); const c = cs.seznam.find(x => x.id === id) || cs.seznam[0]; admDraft = ST.clone(c); admSel = c.id; admDraft._puvodniId = c.id; }
function admGet(path) { return path.split('.').reduce((o, k) => o == null ? o : o[k], admDraft); }
function admSet(path, val) { const ks = path.split('.'); let o = admDraft; for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = val; }
function aIn(path, opt = {}) { const v = admGet(path); const id = 'a-' + path.replace(/[^\w]/g, '_'); return `<input class="ci${opt.cls ? ' ' + opt.cls : ''}" id="${id}" data-a="${path}" data-t="${opt.text ? 's' : 'n'}" value="${esc(v ?? '')}" ${opt.text ? '' : 'inputmode="decimal"'} aria-label="${esc(opt.label || path)}">`; }
function aFld(path, label, u = '', text = false) { return `<div class="f"><label for="a-${path.replace(/[^\w]/g, '_')}">${label}</label><div class="inp">${aIn(path, { text, label }).replace('class="ci', 'style="border:0;background:transparent;text-align:left" class="ci')}${u ? `<span class="u">${u}</span>` : ''}</div></div>`; }
PANELS.admin = () => {
  const cs = ST.ceniky();
  if (!admDraft) admLoad(cs.aktivni);
  const D = admDraft;
  const subs = [['parametry', 'Parametry a dotace'], ['polozky', 'Položky a pravidla'], ['stridace', 'Střídače a baterie'], ['profily', 'Profily a model výroby'], ['kontakty', 'Kontakty'], ['verze', 'Verze ceníku']];
  let body = '';
  if (admSub === 'parametry') {
    const p = 'parametry.', d = 'dotace.';
    body = `<div class="grid">${aFld(p + 'koeficient', 'Koeficient ceníku (nákup → prodej)')}${aFld(p + 'slevaFvePbr', 'Sleva na FVE a PBŘ', 'podíl')}${aFld(p + 'dph', 'Koeficient DPH')}${aFld(p + 'panelWp', 'Výkon panelu', 'Wp')}${aFld(p + 'vyrobaNaKwp', 'Výroba na kWp (Excel)', 'MWh')}
      ${aFld(p + 'cenaNakupVychozi', 'Výchozí cena nákupu', 'Kč/MWh')}${aFld(p + 'cenaVykupu', 'Výchozí cena výkupu', 'Kč/MWh')}${aFld(p + 'cenaSdileni', 'Výchozí cena sdílení', 'Kč/MWh')}${aFld(p + 'koefBaterie', 'Výchozí koeficient baterie')}
      ${aFld(p + 'primySpotrebaMin', 'Přímá spotřeba bez baterie', 'podíl')}${aFld(p + 'primySpotrebaMax', 'Přímá spotřeba max. s baterií', 'podíl')}${aFld(p + 'vyuzitiPretoku', 'Využití přetoku (TUV, sdílení)', 'podíl')}${aFld(p + 'sdileniPodilSP', 'Sdílení – podíl spotřeby bytů u Spol. prostor', 'podíl')}${aFld(p + 'sdileniPodilOstatni', 'Sdílení – podíl u ostatních produktů', 'podíl')}
      ${aFld(p + 'prevodM3', 'Převod plyn m³ → MWh')}${aFld(p + 'prevodGJ', 'Převod GJ → MWh')}${aFld(p + 'panelyNaString', 'Panelů na string', 'ks')}${aFld(p + 'stringyNaTracker', 'Stringů na tracker', 'ks')}</div>
      <h3>Dotace</h3><div class="grid">${aFld(d + 'vykon', 'Dotace na výkon', 'Kč/kWp')}${aFld(d + 'baterie', 'Dotace na baterii', 'Kč/kWh')}${aFld(d + 'byt', 'Dotace na byt', 'Kč/byt')}${aFld(d + 'wallbox', 'Dotace na wallbox', 'Kč/ks')}${aFld(d + 'limitPodilCeny', 'Limit dotace z ceny s DPH', 'podíl')}${aFld(d + 'kontrola', 'Kontrolní hranice', 'podíl')}${aFld(d + 'bateriePomerMin', 'Baterie min. × výkon FVE')}${aFld(d + 'bateriePomerMax', 'Baterie max. × výkon FVE')}${aFld(d + 'kwpNaByt', 'Min. kWp na byt pro dotaci')}</div>`;
  } else if (admSub === 'polozky') {
    const typy = FVE.SOUCTOVE_TYPY;
    body = `<div class="small muted">Pravidlo množství je výraz nad proměnnými projektu, např. <span class="mono">panely - panelyFasada</span> nebo <span class="mono">kotveni == 'fix profily' ? panely : 0</span>. Prázdné pravidlo = množství zadává přípravář ručně. Políčka VZ/J/Š určují, ve kterých z 9 variant se položka počítá.</div>
      <details><summary class="small">Dostupné proměnné</summary><div class="tw"><table><tbody>${Object.entries(FVE.PROMENNE).map(([k, l]) => `<tr><td class="mono small">${k}</td><td class="small">${esc(l)}</td></tr>`).join('')}</tbody></table></div></details>
      <div class="tw"><table class="adm"><thead><tr><th>Kód</th><th>Typ (součet)</th><th>Kategorie</th><th>Název</th><th>MJ</th><th class="n">Nákup Kč/MJ</th><th>Pravidlo množství</th><th>JOM · VZ J Š</th><th>Spol. pr. · VZ J Š</th><th>Bez bat. · VZ J Š</th><th></th></tr></thead><tbody>
      ${D.polozky.map((p, k) => { const err = p.mnozstvi ? FVE.testPravidla(p.mnozstvi) : null; const fl = (p.varianty || '.........').split(''); const grp = g => `<div class="flags">${[0, 1, 2].map(j => { const idx = g * 3 + j; return `<label title="${FVE.VARIANTY[idx]}"><input type="checkbox" id="af-${k}-${idx}" data-aflag="${k}" data-fi="${idx}" ${fl[idx] === '1' ? 'checked' : ''}>${['VZ', 'J', 'Š'][j]}</label>`; }).join('')}</div>`;
        const special = String(p.cena).startsWith('@');
        return `<tr><td>${aIn(`polozky.${k}.kod`, { text: 1, label: 'kód' }).replace('class="ci', 'style="min-width:46px;width:56px;text-align:left" class="ci')}</td>
        <td><select class="ci" id="a-pt-${k}" data-a="polozky.${k}.typ" data-t="s">${typy.map(t => `<option${t === p.typ ? ' selected' : ''}>${t}</option>`).join('')}</select></td>
        <td>${aIn(`polozky.${k}.kat`, { text: 1, cls: 'wide', label: 'kategorie' }).replace('wide', '').replace('class="ci', 'style="min-width:130px;text-align:left;font-family:var(--f-body)" class="ci')}</td>
        <td>${special ? `<span class="muted small">${esc(p.nazev)} (ze vstupů)</span>` : aIn(`polozky.${k}.nazev`, { text: 1, cls: 'wide', label: 'název' })}</td>
        <td>${aIn(`polozky.${k}.mj`, { text: 1, label: 'MJ' }).replace('class="ci', 'style="min-width:50px;width:64px;text-align:left" class="ci')}</td>
        <td class="n">${special ? '<span class="muted small">ze vstupů</span>' : aIn(`polozky.${k}.cena`, { label: 'cena' })}</td>
        <td>${aIn(`polozky.${k}.mnozstvi`, { text: 1, cls: 'expr' + (err ? ' err' : ''), label: 'pravidlo' })}${err ? `<div class="small" style="color:var(--bad)">${esc(err)}</div>` : ''}</td>
        <td>${grp(0)}</td><td>${grp(1)}</td><td>${grp(2)}</td><td>${special ? '' : `<button class="btn sm ghost" data-adel="${k}" aria-label="Smazat položku">✕</button>`}</td></tr>`; }).join('')}
      </tbody></table></div><div class="btnrow"><button class="btn" id="btnAdmAdd">Přidat položku</button></div>`;
  } else if (admSub === 'stridace') {
    body = `<div class="tw"><table class="adm"><thead><tr><th>Střídač</th><th class="n">Max. panelů</th><th class="n">Stringy</th><th class="n">Trackery</th><th class="n">Max. baterie kWh</th><th class="n">Max. sloupců</th><th>Dodává se</th></tr></thead><tbody>
      ${Object.keys(D.stridace).map(k => `<tr><td>${esc(k)}</td><td class="n">${aIn(`stridace.${k}.panely`)}</td><td class="n">${aIn(`stridace.${k}.stringy`)}</td><td class="n">${aIn(`stridace.${k}.trackery`)}</td><td class="n">${aIn(`stridace.${k}.maxBaterie`)}</td><td class="n">${aIn(`stridace.${k}.sloupcuMax`)}</td><td><input type="checkbox" id="a-sd-${k.replace(/\W/g, '')}" data-sdost="${esc(k)}" ${D.stridace[k].dostupny !== false ? 'checked' : ''} aria-label="Dodává se"></td></tr>`).join('')}</tbody></table></div>
      <div class="small muted">Ceny střídačů jsou v položkách ceníku (kategorie střídač). Nový typ střídače vyžaduje i položku a proměnnou v pravidlech – to je zásah pro vývojáře.</div>
      <h3>Baterie</h3><div class="grid">${aFld('baterie.bos', 'Článek BOS', 'kWh')}${aFld('baterie.gbl', 'Článek GB-L', 'kWh')}${aFld('baterie.gblMax', 'Max. kapacita GB-L', 'kWh')}${aFld('baterie.hraniceGbl', 'Hranice GB-L / BOS', 'kWh')}${aFld('baterie.delitelPodHranici', 'Dělitel pod hranicí (Excel AG45/AF44)')}${aFld('baterie.minBos', 'Min. počet článků BOS', 'ks')}${aFld('baterie.clankuNaBms', 'Článků na 1 BMS', 'ks')}${aFld('baterie.clankuVeSloupci', 'Článků ve sloupci', 'ks')}</div>`;
  } else if (admSub === 'profily') {
    const row = (path, label) => `<tr><td>${label}</td>${FVE.MESICE.map((m, k) => `<td>${aIn(`${path}.${k}`, { label: label + ' ' + m })}</td>`).join('')}</tr>`;
    const sumPod = D.podilVyroby.reduce((a, b) => a + num(b), 0);
    body = `<div class="tw"><table class="adm"><thead><tr><th></th>${MES3.map(m => `<th class="n">${m}</th>`).join('')}</tr></thead><tbody>
      ${row('podilVyroby', 'Podíl výroby v měsíci')}${Object.keys(D.profily).map(k => row('profily.' + k, 'Profil ' + k)).join('')}${row('model.mesicniKt', 'Index jasnosti (model)')}</tbody></table></div>
      <div class="small ${Math.abs(sumPod - 1) > 0.001 ? '' : 'muted'}" ${Math.abs(sumPod - 1) > 0.001 ? 'style="color:var(--bad)"' : ''}>Součet podílů výroby: ${n2(sumPod, 4)} (má být 1).</div>
      <h3>Model výroby</h3><div class="grid">${aFld('model.zemepisnaSirka', 'Zeměpisná šířka', '°')}${aFld('model.vyrobaOptimalniBrutto', 'Výroba optimální plochy brutto', 'kWh/kWp')}${aFld('model.ztratyVychozi', 'Výchozí ztráty', '%')}${aFld('model.albedo', 'Albedo')}</div>`;
  } else if (admSub === 'kontakty') {
    body = `<div class="tw"><table class="adm"><thead><tr><th>Technicko obchodní poradce</th><th>Telefon</th><th>E-mail</th><th></th></tr></thead><tbody>
      ${D.kontakty.top.map((t, k) => `<tr><td>${aIn(`kontakty.top.${k}.0`, { text: 1, cls: 'wide', label: 'jméno' })}</td><td>${aIn(`kontakty.top.${k}.1`, { text: 1, label: 'telefon' })}</td><td>${aIn(`kontakty.top.${k}.2`, { text: 1, cls: 'wide', label: 'e-mail' })}</td><td><button class="btn sm ghost" data-topdel="${k}" aria-label="Smazat">✕</button></td></tr>`).join('')}</tbody></table></div>
      <div class="btnrow"><button class="btn" id="btnTopAdd">Přidat TOP</button></div>
      <div class="f"><label for="a-prip">Přípraváři (jeden na řádek)</label><textarea id="a-prip" data-prip="1" rows="8" class="search">${esc(D.kontakty.pripravari.join('\n'))}</textarea></div>`;
  } else {
    body = `<div class="tw"><table><thead><tr><th>Verze</th><th>Název</th><th>Uloženo</th><th></th></tr></thead><tbody>${cs.seznam.map(c => `<tr${c.id === admSel ? ' class="best"' : ''}><td class="mono">${esc(c.id)}</td><td>${esc(c.nazev)}${c.vestaveny ? ' <span class="chip info">vestavěný</span>' : ''}${c.id === cs.aktivni ? ' <span class="chip ok">aktivní</span>' : ''}</td><td>${c.ulozeno ? dt(c.ulozeno) : '–'}</td>
      <td class="btnrow"><button class="btn sm" data-aload="${esc(c.id)}">Upravit</button>${c.id !== cs.aktivni ? `<button class="btn sm" data-aact="${esc(c.id)}">Nastavit aktivní</button>` : ''}${!c.vestaveny && c.id !== cs.aktivni ? `<button class="btn sm ghost" data-arem="${esc(c.id)}">Smazat</button>` : ''}</td></tr>`).join('')}</tbody></table></div>
      <div class="btnrow"><button class="btn" id="btnCenExport">Exportovat upravovaný ceník (.json)</button><label class="btn" for="fileCenik">Importovat ceník…</label><input type="file" id="fileCenik" accept=".json" hidden></div>`;
  }
  const test = (() => { try { const x = calcVariant(I, D); return x.R.cenik.D47; } catch (e) { return null; } })();
  return `
  <div class="banner info"><span>Administrace upravuje kopii ceníku <b>${esc(admSel)}</b>. Změny se projeví až po uložení jako verze a nastavení jako aktivní; uložené projekty se mění jen řízenou aktualizací na záložce Projekt.</span></div>
  <section class="sec"><div class="grid">${aFld('id', 'Označení verze', '', true)}${aFld('nazev', 'Název ceníku', '', true)}${aFld('rbd', 'Ceník RBD', '', true)}
    ${out('Test na otevřené variantě', test == null ? 'chyba v ceníku' : kc(test), '', 'bez DPH')}${out('Současný ceník projektu', kc(R.cenik.D47), '', 'bez DPH')}</div>
    <div class="btnrow"><button class="btn primary" id="btnAdmSave">Uložit verzi</button><button class="btn" id="btnAdmSaveAct">Uložit a nastavit jako aktivní</button><button class="btn ghost" id="btnAdmReset">Zahodit úpravy</button></div></section>
  <div class="subtabs">${subs.map(([k, l]) => `<button data-asub="${k}" aria-pressed="${admSub === k}">${l}</button>`).join('')}</div>
  <section class="sec">${body}</section>`;
};

// ---- aktualizace ceníku projektu ----
function cenikZastaraly() { try { return ST.otiskCeniku(C) !== ST.otiskCeniku(ST.aktivniCenik()); } catch (e) { return false; } }
function upgradePanel(Ca) {
  const rows = P.varianty.map(v => { const a = calcVariant(v.inputs, C).R.cenik, b = calcVariant(v.inputs, Ca).R.cenik; return `<tr><td>${esc(v.nazev)}</td><td class="n">${fmt(a.D47)}</td><td class="n">${fmt(b.D47)}</td><td class="n" style="color:${b.D47 - a.D47 > 0 ? 'var(--bad)' : 'var(--ok)'}">${b.D47 - a.D47 >= 0 ? '+' : ''}${fmt(b.D47 - a.D47)}</td></tr>`; }).join('');
  const old = new Map(C.polozky.map(p => [p.id, p])), zm = [];
  for (const p of Ca.polozky) { const o = old.get(p.id); if (!o) zm.push(['nová položka', p.nazev, '', '']); else { if (String(o.cena) !== String(p.cena)) zm.push(['cena', p.nazev, fmt(num(o.cena), 2), fmt(num(p.cena), 2)]); if ((o.mnozstvi || '') !== (p.mnozstvi || '')) zm.push(['pravidlo', p.nazev, o.mnozstvi || '', p.mnozstvi || '']); if (o.varianty !== p.varianty) zm.push(['varianty', p.nazev, o.varianty, p.varianty]); old.delete(p.id); } }
  for (const o of old.values()) zm.push(['odebraná položka', o.nazev, '', '']);
  const par = []; for (const g of ['parametry', 'dotace', 'baterie']) for (const k of Object.keys(Ca[g] || {})) if (String((C[g] || {})[k]) !== String(Ca[g][k])) par.push([g + '.' + k, (C[g] || {})[k], Ca[g][k]]);
  return sec('Dopad aktualizace ceníku', `Z ${esc(C.id)} na ${esc(Ca.id)}. Ruční úpravy rozpočtu zůstanou zachované.`, `
    <div class="tw"><table><thead><tr><th>Varianta</th><th class="n">Teď bez DPH</th><th class="n">Po aktualizaci</th><th class="n">Rozdíl</th></tr></thead><tbody>${rows}</tbody></table></div>
    ${zm.length || par.length ? `<div class="tw"><table><thead><tr><th>Změna</th><th>Položka / parametr</th><th>Bylo</th><th>Nově</th></tr></thead><tbody>${par.map(p => `<tr><td>parametr</td><td class="mono small">${esc(p[0])}</td><td>${esc(p[1])}</td><td>${esc(p[2])}</td></tr>`).join('')}${zm.map(z => `<tr><td>${z[0]}</td><td>${esc(z[1])}</td><td class="mono small">${esc(z[2])}</td><td class="mono small">${esc(z[3])}</td></tr>`).join('')}</tbody></table></div>` : '<div class="note info">Ceníky se liší jen v popisných údajích.</div>'}
    <div class="btnrow"><button class="btn primary" id="btnUpgradeOk">Aktualizovat projekt na ${esc(Ca.id)}</button></div>`);
}

// ---------------- akce ----------------
function setStatus(msg) { $('#status').textContent = msg || (dirty ? 'Neuložené změny' : (P && P.upraveno ? 'Uloženo ' + dt(P.upraveno) : 'Projekt zatím není uložený')); }
function persistDraft() { ST.koncept.set(P); ST.stav.set({ tab }); }
let tmr = null;
function changed(immediate = false) {
  dirty = true; recompute(); persistDraft(); setStatus();
  clearTimeout(tmr);
  if (immediate) render(); else tmr = setTimeout(render, 350);
}
function logAdd(akce, detail) { P.log.push({ t: Date.now(), akce, detail }); if (P.log.length > 500) P.log.splice(0, P.log.length - 500); }
function labelKlice(k) {
  const parts = k.split('.');
  if (parts[0] === 'jednotky') return `${+parts[1] + 1}. FVE – ${({ bj: 'počet BJ', spol: 'el. spol. prostor', spotrByty: 'spotřeba byty', spotrSpol: 'spotřeba spol. pr.', cena: 'jedn. cena', vykon: 'výkon FVE', stridac: 'střídač', stringy: 'stringy', batRucne: 'baterie ručně' })[parts[2]] || parts[2]}`;
  if (parts[0] === 'upravy') { const p = C.polozky.find(x => x.id === parts[1]); return `rozpočet – ${p ? p.nazev : parts[1]} (${parts[2] === 'qty' ? 'množství' : 'cena'})`; }
  if (parts[0] === 'navrh') return `návrh střídače – strana ${+parts[1] + 1} ${parts[2]}`;
  return LABELS[k] || k;
}
function save() {
  if (!P.nazev) { P.nazev = I.adresa || 'Projekt ' + new Date().toLocaleDateString('cs-CZ'); }
  const t = Date.now();
  for (const v of P.varianty) {
    const zm = ST.rozdily(P.ulozeneVstupy[v.id], v.inputs).filter(z => z.k !== '_extra');
    if (P.ulozeneVstupy[v.id] && zm.length) {
      const txt = zm.slice(0, 25).map(z => `${labelKlice(z.k)}: ${z.z || '∅'} → ${z.na || '∅'}`).join('; ') + (zm.length > 25 ? `; … a dalších ${zm.length - 25}` : '');
      logAdd(`Uloženo – ${v.nazev}`, txt);
    }
    P.ulozeneVstupy[v.id] = ST.clone(v.inputs);
  }
  if (!P.upraveno) logAdd('Projekt poprvé uložen', P.nazev);
  P.upraveno = t;
  const err = ST.ulozProjekt(P);
  if (err) { setStatus(err); return; }
  dirty = false; persistDraft(); render(); setStatus('Uloženo ' + dt(t));
}
function openProject(id) { const p = ST.projekty()[id]; if (!p) return; setProject(ST.clone(p)); dirty = false; persistDraft(); $('#drawer').hidden = true; render(); setStatus('Otevřeno: ' + (P.nazev || '')); }
function renderProjects() {
  const all = Object.values(ST.projekty()).sort((a, b) => (b.upraveno || 0) - (a.upraveno || 0));
  const q = psearch.toLowerCase();
  const list = all.filter(p => !q || (p.nazev || '').toLowerCase().includes(q) || ((p.varianty[0] || {}).inputs || {}).adresa?.toLowerCase().includes(q));
  $('#plist').innerHTML = !all.length ? '<div class="muted small">Zatím žádný uložený projekt. Vyplň vstupy a klikni na Uložit. Projekty se ukládají v tomto prohlížeči – pro jistotu je občas zálohuj do souboru.</div>'
    : list.map(p => { const v0 = (p.varianty.find(v => v.id === p.aktivni) || p.varianty[0] || {}).inputs || {}; const kwp = (v0.jednotky || []).reduce((a, u) => a + num(u.vykon), 0);
      return `<div class="pitem${p.id === P.id ? ' cur' : ''}"><div><div class="nm">${esc(p.nazev || 'bez názvu')}</div><div class="small muted">${esc(v0.adresa || '')} · ${esc(v0.produkt || '')} · ${n2(kwp)} kWp · ${p.varianty.length} ${p.varianty.length === 1 ? 'varianta' : p.varianty.length < 5 ? 'varianty' : 'variant'} · ceník ${esc(p.cenik.id)} · ${dt(p.upraveno)}</div></div>
      <div class="btnrow">${confirmDel === p.id ? `<span class="confirm">Opravdu smazat?<button class="btn sm danger" data-delyes="${p.id}">Smazat</button><button class="btn sm" data-cancel="1">Ne</button></span>` : `<button class="btn sm" data-open="${p.id}">Otevřít</button><button class="btn sm" data-pexp="${p.id}">Export</button><button class="btn sm ghost" data-del="${p.id}">Smazat</button>`}</div></div>`; }).join('') || '<div class="muted small">Nic nenalezeno.</div>';
}
function exportProject(p) { ST.stahni(`FVE_${ST.bezpecneJmeno(p.nazev)}.json`, JSON.stringify({ typ: 'fve-projekt', verze: 2, projekt: p }, null, 1)); }
function importFile(file) {
  const rd = new FileReader();
  rd.onload = () => {
    try {
      const d = JSON.parse(rd.result);
      const list = d.typ === 'fve-zaloha' ? d.projekty : d.typ === 'fve-projekt' ? [d.projekt] : d.varianty ? [d] : null;
      if (!list) throw new Error('Soubor není projekt ani záloha z této kalkulačky.');
      const all = ST.projekty(); let n = 0;
      for (const p of list) { if (!p || !p.varianty || !p.cenik) continue; if (all[p.id]) p.id = ST.uid('p'); p.log = p.log || []; p.log.push({ t: Date.now(), akce: 'Importováno ze souboru', detail: file.name }); p.ulozeneVstupy = p.ulozeneVstupy || {}; if (ST.ulozProjekt(p)) throw new Error('Úložiště prohlížeče je plné.'); n++; }
      if (d.typ === 'fve-zaloha' && d.ceniky) { const cs = ST.ceniky(); for (const c of d.ceniky.seznam || []) if (!cs.seznam.some(x => x.id === c.id)) cs.seznam.push(c); ST.ulozCeniky(cs); }
      renderProjects(); setStatus(`Importováno projektů: ${n}`);
      if (n === 1 && list.length === 1) openProject(Object.values(ST.projekty()).find(p => p.id === list[0].id)?.id || list[0].id);
    } catch (e) { setStatus('Import se nepovedl: ' + e.message); }
  };
  rd.readAsText(file);
}
function csvRozpocet() {
  const rows = [['kód', 'kategorie', 'položka', 'MJ', 'množství', 'nákup Kč/MJ', 'nákup celkem', 'prodej bez DPH', 've variantě', 'ručně upraveno']];
  R.cenik.polozky.forEach(p => rows.push([p.kod, p.kat, p.nazev, p.mj, p.qty, p.cena, p.naklad, p.vVariante ? p.prodej : 0, p.vVariante ? 'ano' : 'ne', (p.qtyRucne || p.cenaRucne) ? 'ano' : '']));
  return '﻿' + rows.map(r => r.map(x => typeof x === 'number' ? String(Math.round(x * 100) / 100).replace('.', ',') : '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\r\n');
}
function batteryVariants() {
  const base = V; const k0 = R.jednotky;
  const mk = (nazev, f) => { const v = { id: ST.uid('v'), nazev, inputs: ST.clone(base.inputs), rozpPotvrzeno: null }; v.inputs.jednotky.forEach((u, i) => { const r = k0[i]; if (r && r.pocetBat != null) u.batRucne = String(f(r.pocetBat)); }); return v; };
  if (!k0.some(r => r.pocetBat != null)) { setStatus('Otevřená varianta nemá baterie – nejdřív vyplň FVE a střídače.'); return; }
  const nov = [mk(base.nazev + ' – bez baterie', () => 0), mk(base.nazev + ' – baterie ×1,5', n => Math.ceil(n * 1.5)), mk(base.nazev + ' – baterie ×2', n => n * 2)];
  P.varianty.push(...nov); logAdd('Vytvořeny varianty kapacity baterie', nov.map(v => v.nazev).join(', '));
  tab = 'varianty'; changed(true);
}
function doPrint() {
  const root = $('#printRoot'); root.innerHTML = reportHTML();
  const prev = document.documentElement.getAttribute('data-theme'); document.documentElement.setAttribute('data-theme', 'light');
  const restore = () => { if (prev == null) document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', prev); window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  setTimeout(() => { window.print(); setTimeout(restore, 1500); }, 50);
}

// ---------------- události ----------------
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'projname') { P.nazev = el.value; dirty = true; persistDraft(); setStatus(); return; }
  if (el.id === 'psearch') { psearch = el.value; renderProjects(); return; }
  if (el.dataset.k) { I[el.dataset.k] = el.value; changed(el.tagName === 'SELECT'); }
  else if (el.dataset.u != null) { I.jednotky[+el.dataset.u][el.dataset.uk] = el.value; changed(el.tagName === 'SELECT'); }
  else if (el.dataset.nv != null) { I.navrh[+el.dataset.nv][el.dataset.nk] = el.value; changed(); }
  else if (el.dataset.pq || el.dataset.pc) {
    const id = el.dataset.pq || el.dataset.pc, key = el.dataset.pq ? 'qty' : 'cena';
    I.upravy[id] = Object.assign({}, I.upravy[id], { [key]: el.value });
    if (el.value === '') delete I.upravy[id][key];
    if (!Object.keys(I.upravy[id]).length) delete I.upravy[id];
    changed();
  }
  else if (el.dataset.vname) { const v = P.varianty.find(x => x.id === el.dataset.vname); if (v) { v.nazev = el.value || 'Varianta'; dirty = true; persistDraft(); renderHeader(); } }
  else if (el.dataset.a) { admSet(el.dataset.a, el.dataset.t === 'n' ? (el.value === '' ? '' : (has(el.value) ? num(el.value) : el.value)) : el.value); clearTimeout(tmr); tmr = setTimeout(render, 500); }
  else if (el.dataset.aflag) { const p = admDraft.polozky[+el.dataset.aflag]; const f = (p.varianty || '.........').split(''); f[+el.dataset.fi] = el.checked ? '1' : '.'; p.varianty = f.join(''); }
  else if (el.dataset.sdost) { admDraft.stridace[el.dataset.sdost].dostupny = el.checked; }
  else if (el.dataset.prip) { admDraft.kontakty.pripravari = el.value.split('\n').map(x => x.trim()).filter(Boolean); }
  else if (el.dataset.ro) { repOpts[el.dataset.ro] = el.checked; render(); }
  else if (el.id === 'showOff') { showOff = el.checked; render(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'varSel') { P.aktivni = el.value; V = P.varianty.find(v => v.id === el.value); I = V.inputs; recompute(); persistDraft(); render(); return; }
  if (el.id === 'fileImport' && el.files[0]) { importFile(el.files[0]); el.value = ''; return; }
  if (el.id === 'fileCenik' && el.files[0]) { const rd = new FileReader(); rd.onload = () => { try { const c = JSON.parse(rd.result); if (!c.polozky || !c.parametry) throw new Error('chybí položky nebo parametry'); admDraft = c; admSel = c.id; render(); setStatus('Ceník načten – ulož ho jako verzi.'); } catch (er) { setStatus('Ceník se nepodařilo načíst: ' + er.message); } }; rd.readAsText(el.files[0]); el.value = ''; return; }
  if (el.dataset.k || el.dataset.u != null || el.dataset.nv != null || el.dataset.pq || el.dataset.pc) { clearTimeout(tmr); render(); }
  if (el.dataset.a) { clearTimeout(tmr); render(); }
});
$('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; persistDraft(); render(); });
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const d = b.dataset;
  if (d.rq) { delete (I.upravy[d.rq] || {}).qty; if (I.upravy[d.rq] && !Object.keys(I.upravy[d.rq]).length) delete I.upravy[d.rq]; changed(true); }
  else if (d.rc) { delete (I.upravy[d.rc] || {}).cena; if (I.upravy[d.rc] && !Object.keys(I.upravy[d.rc]).length) delete I.upravy[d.rc]; changed(true); }
  else if (d.simden) { simDen = d.simden; render(); }
  else if (d.asub) { admSub = d.asub; render(); }
  else if (d.aload) { admLoad(d.aload); admSub = 'parametry'; render(); }
  else if (d.aact) { const cs = ST.ceniky(); cs.aktivni = d.aact; ST.ulozCeniky(cs); render(); setStatus('Aktivní ceník: ' + d.aact); }
  else if (d.arem) { const cs = ST.ceniky(); cs.seznam = cs.seznam.filter(c => c.id !== d.arem); ST.ulozCeniky(cs); if (admSel === d.arem) admDraft = null; render(); }
  else if (d.adel) { admDraft.polozky.splice(+d.adel, 1); render(); }
  else if (d.topdel) { admDraft.kontakty.top.splice(+d.topdel, 1); render(); }
  else if (d.open) openProject(d.open);
  else if (d.pexp) exportProject(ST.projekty()[d.pexp]);
  else if (d.del) { confirmDel = d.del; renderProjects(); }
  else if (d.cancel) { confirmDel = null; renderProjects(); render(); }
  else if (d.delyes) { ST.smazProjekt(d.delyes); confirmDel = null; renderProjects(); setStatus('Projekt smazán'); }
  else if (d.vopen) { P.aktivni = d.vopen; V = P.varianty.find(v => v.id === d.vopen); I = V.inputs; recompute(); persistDraft(); render(); }
  else if (d.vdup) { const src = P.varianty.find(v => v.id === d.vdup); const nv = { id: ST.uid('v'), nazev: src.nazev + ' – kopie', inputs: ST.clone(src.inputs), rozpPotvrzeno: src.rozpPotvrzeno ? ST.clone(src.rozpPotvrzeno) : null }; P.varianty.push(nv); logAdd('Nová varianta', nv.nazev); changed(true); }
  else if (d.vdel) { confirmDel = 'v' + d.vdel; render(); }
  else if (d.vdelyes) { const v = P.varianty.find(x => x.id === d.vdelyes); P.varianty = P.varianty.filter(x => x.id !== d.vdelyes); delete P.ulozeneVstupy[d.vdelyes]; logAdd('Smazána varianta', v ? v.nazev : ''); if (V.id === d.vdelyes) { V = P.varianty[0]; P.aktivni = V.id; I = V.inputs; } confirmDel = null; changed(true); }
  switch (b.id) {
    case 'btnSave': save(); break;
    case 'btnProjects': { const dr = $('#drawer'); dr.hidden = !dr.hidden; renderProjects(); break; }
    case 'btnNew': setProject(newBlank()); dirty = false; persistDraft(); $('#drawer').hidden = true; tab = 'vstupy'; render(); setStatus('Nový projekt – nezapomeň ho uložit.'); break;
    case 'btnExample': setProject(newExample()); dirty = true; persistDraft(); $('#drawer').hidden = true; render(); setStatus('Načten ukázkový dům (příklad) – není uložený.'); break;
    case 'btnDup': { const p = ST.clone(P); p.id = ST.uid('p'); p.nazev = (P.nazev || 'Projekt') + ' – kopie'; p.vytvoreno = Date.now(); p.upraveno = null; p.log = [{ t: Date.now(), akce: 'Projekt zkopírován', detail: 'z ' + (P.nazev || '') }]; setProject(p); save(); renderProjects(); break; }
    case 'btnBackup': ST.stahni(`FVE_zaloha_${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify({ typ: 'fve-zaloha', verze: 2, datum: new Date().toISOString(), projekty: Object.values(ST.projekty()), ceniky: ST.ceniky() })); break;
    case 'btnVarNew': { const nv = { id: ST.uid('v'), nazev: 'Varianta ' + String.fromCharCode(65 + P.varianty.length), inputs: ST.clone(I), rozpPotvrzeno: V.rozpPotvrzeno ? ST.clone(V.rozpPotvrzeno) : null }; P.varianty.push(nv); P.aktivni = nv.id; V = nv; I = nv.inputs; logAdd('Nová varianta', nv.nazev); changed(true); setStatus('Vytvořena ' + nv.nazev + ' jako kopie – můžeš ji upravit.'); break; }
    case 'btnAddUnit': I._extra = (I._extra || 0) + 1; render(); break;
    case 'btnUseNv': { const nv = FVE.navrhStridace(I.navrh, C); const k = I.jednotky.findIndex(u => u.vykon === '' && u.stridac === 'vyber'); if (k >= 0) { Object.assign(I.jednotky[k], { vykon: String(+nv.vykon.toFixed(2)), stridac: nv.doporuceny, stringy: String(nv.sumStr) }); changed(true); } break; }
    case 'btnTakeDot': I.dotaceRucne = String(Math.round(R.dotace.M80)); changed(true); break;
    case 'btnResetAll': I.upravy = {}; changed(true); break;
    case 'btnRozpOk': { const zm = rozpZmeny(); V.rozpPotvrzeno = rozpAktualni(); logAdd(`Rozpočet potvrzen – ${V.nazev}`, zm[0] && zm[0].nove ? `cena bez DPH ${kc(R.cenik.D47)}` : `${zm.length} změn: ` + zm.slice(0, 15).map(z => `${z.nazev} (${z.typ})`).join(', ')); changed(true); break; }
    case 'btnCsv': ST.stahni(`rozpocet_${ST.bezpecneJmeno(P.nazev)}_${ST.bezpecneJmeno(V.nazev)}.csv`, csvRozpocet(), 'text/csv'); break;
    case 'btnExportProj': exportProject(P); break;
    case 'btnBatVar': batteryVariants(); break;
    case 'btnUpgrade': upgradeView = !upgradeView; render(); break;
    case 'btnUpgradeOk': { const Ca = ST.aktivniCenik(); const z = C.id; P.cenik = Ca; C = Ca; logAdd('Ceník projektu aktualizován', `${z} → ${Ca.id}`); upgradeView = false; recompute(); changed(true); break; }
    case 'btnPrint': doPrint(); break;
    case 'btnRepHtml': { const css = [...document.styleSheets].map(s => { try { return [...s.cssRules].map(r => r.cssText).join('\n'); } catch (er) { return ''; } }).join('\n'); ST.stahni(`report_${ST.bezpecneJmeno(P.nazev)}.html`, `<!doctype html><html lang="cs" data-theme="light"><head><meta charset="utf-8"><title>Report FVE – ${esc(P.nazev)}</title><style>${css} body{padding:24px;background:#fff}</style></head><body>${reportHTML()}</body></html>`, 'text/html'); break; }
    case 'btnAdmAdd': admDraft.polozky.push({ id: ST.uid('i'), kod: '', typ: 'FVE', kat: 'nová kategorie', nazev: 'Nová položka', mj: 'ks', cena: 0, mnozstvi: '1', varianty: '111111111' }); render(); break;
    case 'btnTopAdd': admDraft.kontakty.top.push(['', '', '']); render(); break;
    case 'btnAdmReset': admLoad(admSel); render(); break;
    case 'btnCenExport': { const c = ST.clone(admDraft); delete c._puvodniId; ST.stahni(`cenik_${ST.bezpecneJmeno(c.id)}.json`, JSON.stringify(c, null, 1)); break; }
    case 'btnAdmSave': case 'btnAdmSaveAct': {
      const cs = ST.ceniky(); const c = ST.clone(admDraft); delete c._puvodniId;
      c.id = String(c.id || '').trim();
      if (!c.id) { setStatus('Vyplň označení verze.'); break; }
      const ex = cs.seznam.find(x => x.id === c.id);
      if (ex && ex.vestaveny) { setStatus('Vestavěný ceník nejde přepsat – změň označení verze (např. 01_11_2026).'); break; }
      const chyby = c.polozky.filter(p => p.mnozstvi && FVE.testPravidla(p.mnozstvi)); if (chyby.length) { setStatus(`Opravit pravidla: ${chyby.map(p => p.nazev).slice(0, 3).join(', ')}`); break; }
      c.vestaveny = false; c.ulozeno = Date.now();
      if (ex) cs.seznam[cs.seznam.indexOf(ex)] = c; else cs.seznam.push(c);
      if (b.id === 'btnAdmSaveAct') cs.aktivni = c.id;
      if (!ST.ulozCeniky(cs)) { setStatus('Ceník se nepodařilo uložit (plné úložiště).'); break; }
      admSel = c.id; admDraft._puvodniId = c.id; render(); setStatus(`Ceník ${c.id} uložen${b.id === 'btnAdmSaveAct' ? ' a nastaven jako aktivní' : ''}.`); break;
    }
  }
});
window.addEventListener('beforeunload', e => { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

// ---------------- start ----------------
(function start() {
  const st = ST.stav.get(); if (st.tab && TABS.some(t => t[0] === st.tab)) tab = st.tab;
  const k = ST.koncept.get();
  if (k && k.varianty && k.cenik) { setProject(k); const saved = ST.projekty()[k.id]; dirty = !saved || JSON.stringify(saved.varianty) !== JSON.stringify(k.varianty) || saved.nazev !== k.nazev; }
  else { setProject(newExample()); dirty = true; }
  render();
})();
})();
