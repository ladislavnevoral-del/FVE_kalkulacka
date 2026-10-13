/* =====================================================================
   Výpočetní jádro kalkulačky FVE
   Přepis listů Vstupní data, Ceník, Výpočty a Výstup TOP ze sešitu
   „1. Klasická kalkulačka FVE – verze 02.06.2026.xlsm“.
   Všechny ceny, koeficienty a pravidla množství bere z objektu ceníku (C),
   takže je lze spravovat v administraci bez zásahu do kódu.
   Odkazy v komentářích (D26, H29 …) jsou buňky původního sešitu.
   ===================================================================== */
(function (root) {
  const PRODUKTY = ['JOM', 'Spol. prostory', 'Spol. prostory bez baterie'];
  const ORIENTACE = ['VZ', 'J', 'šikmá'];
  const VARIANTY = []; // pořadí sloupců I K M O Q S U W Y v listu Ceník
  for (const p of PRODUKTY) for (const o of ORIENTACE) VARIANTY.push(o + ' ' + p);
  const MESICE = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
  const SOUCTOVE_TYPY = ['FVE', 'JOM', 'PBŘ', 'hromosvod', 'Rekonstrukce rozvodů', 'Chytré řízení přetoků', 'Nabíječka', 'TUV', 'Ostatní'];

  /* Proměnné, které smí používat pravidla množství v ceníku (řádek 4 listu Ceník). */
  const PROMENNE = {
    vchody: 'počet vchodů (K7)', kwp: 'výkon FVE kWp (D26)', stringy: 'počet stringů (D30)', panely: 'počet panelů (D27)', stridacu: 'počet střídačů (D31)',
    vyska: 'výška budovy bm (B7)', delka: 'délka budovy bm (C7)', sirka: 'šířka budovy bm (D7)', jadroveVrtani: 'jádrové vrtání ks (E7)', jom: 'počet JOM (G7)',
    bytySpol: 'byty + společné prostory (H7)', mistnostiTech: 'místnosti technologie (I7)', tuv: "TUV 'ano'/'ne' (F19)", bj: 'počet BJ (D9)', rozvadecu: 'počet rozvaděčů (J7)',
    sdileni: "sdílení 'ano'/'ne' (D22)", deye10: 'počet DEYE 10', deye12: 'počet DEYE 12', deye20: 'počet DEYE 20', deye30: 'počet DEYE 30', deye40: 'počet DEYE 40', deye50: 'počet DEYE 50',
    stridaceCelkem: 'střídače celkem', batBos: 'baterie BOS ks', sloupceBos: 'sloupce (racky) BOS', bmsBos: 'BMS BOS', batGbl: 'baterie GB-L ks', bmsGbl: 'BMS GB-L',
    panelyFasada: 'panely na fasádě (P7)', vykonFasada: 'výkon na fasádě kWp (Q7)', leseni: 'lešení m² (R7)', stoupacky: "nové stoupačky 'ano'/'ne' (L7)", patra: 'počet pater (M7)',
    rozvadece: "nové rozvaděče 'ano'/'ne' (N7)", vchodyPatra: 'vchody × patra (O7)', kotveni: 'kotvení panelů (S7)', pretokTUV: 'průměrný přetok březen–říjen MWh/měs. (Ceník E5)',
    vchoduNaJom: 'vchodů na 1 JOM (K8)', wallbox: 'počet wallboxů (F43)', produkt: 'typ produktu (D15)',
  };
  const PROM_KLICE = Object.keys(PROMENNE);
  const fnCache = new Map();
  function pravidlo(expr) {
    if (expr == null || String(expr).trim() === '') return null;
    let f = fnCache.get(expr);
    if (!f) {
      try { f = new Function(...PROM_KLICE, '"use strict"; return (' + expr + ');'); }
      catch (e) { f = () => { throw new Error('Chybné pravidlo: ' + e.message); }; }
      fnCache.set(expr, f);
    }
    return f;
  }
  function testPravidla(expr) {
    try { const f = pravidlo(expr); if (!f) return null; const v = f(...PROM_KLICE.map(k => (k === 'produkt' ? 'JOM' : ['tuv', 'sdileni', 'stoupacky', 'rozvadece'].includes(k) ? 'ne' : k === 'kotveni' ? 'přitížení dlažbou' : 1))); return isFinite(+v) ? null : 'výsledek není číslo'; }
    catch (e) { return e.message; }
  }

  const toN = v => (typeof v === 'number') ? v : +String(v).replace(/\s| /g, '').replace(',', '.');
  const has = v => !(v === '' || v == null || isNaN(toN(v)));
  const num = v => has(v) ? toN(v) : 0;
  const ceil = x => Math.ceil(x - 1e-12) || 0;
  const floor = x => Math.floor(x + 1e-12) || 0;
  const fmt = (x, d = 0) => (x == null || !isFinite(x)) ? '–' : x.toLocaleString('cs-CZ', { minimumFractionDigits: d, maximumFractionDigits: d });
  const kwpPanelu = C => C.parametry.panelWp / 1000;

  function defaultInputs(C) {
    const p = C.parametry;
    return {
      pripravar: 'vyber', top: '', adresa: '', kontakt: '', funkce: '– předseda SVJ',
      vyska: '', delka: '', sirka: '', vchody: '', rozvadecu: '', stoupacky: 'ne', patra: '', rozvadece: 'ano', vchodyPatra: '',
      panelyFasada: '', vykonFasada: '', leseni: '', kotveni: 'přitížení dlažbou',
      produkt: 'JOM', orientace: 'VZ', profil: 'běžný', tuv: 'ne', sdileni: 'ne', profilSdileni: 'běžný', cenaSdileni: p.cenaSdileni,
      spotrebaSdileniRucne: '', vykup: p.cenaVykupu, koefBaterie: p.koefBaterie,
      tuvNaklady: '', tuvM3: '', tuvGJ: '', tuvMWh: '',
      vlastni1Nazev: 'Vlastní položka 1', vlastni1Cena: '', vlastni2Nazev: 'Vlastní položka 2', vlastni2Cena: '', wallbox: '',
      dph: p.dph, dotaceVykon: C.dotace.vykon, dotaceBaterie: C.dotace.baterie, dotaceByt: C.dotace.byt, dotaceWallbox: C.dotace.wallbox, dotaceRucne: '',
      navrh: [{ strana: '', panely: '' }, { strana: '', panely: '' }, { strana: '', panely: '' }],
      jednotky: Array.from({ length: 15 }, () => ({ bj: '', spol: '', spotrByty: '', spotrSpol: '', cena: '', vykon: '', stridac: 'vyber', stringy: '', batRucne: '' })),
      upravy: {},
      // výroba (rozšíření oproti Excelu – zadávací dokumentace 7.2)
      vyrobaRezim: 'excel', vyrobaRucne: '', sklon: 15, azimut: 180, ztraty: C.model.ztratyVychozi,
      // simulace baterie (7.4)
      batDod: 90, batUcinnost: 90, batCRate: 0.5, tuvVykon: 6,
      // ekonomika (9)
      ekoRezim: 'mesicni', horizont: 25, diskont: 4, rustCen: 0, degradace: 0.5, provozni: 0, zapocistDotaci: 'ne', investiceRucne: '',
    };
  }

  function navrhStridace(navrh, C) {
    const P = C.parametry, k = kwpPanelu(C);
    const panely = navrh.map(n => num(n.panely));
    const stringy = panely.map(p => ceil(p / P.panelyNaString));
    const trackery = stringy.map(s => ceil(s / P.stringyNaTracker));
    const sumStr = stringy.reduce((a, b) => a + b, 0), sumTr = trackery.reduce((a, b) => a + b, 0);
    const vykon = panely.reduce((a, b) => a + b, 0) * k;
    let doporuceny = null;
    const tabulka = Object.entries(C.stridace).filter(([, s]) => s.dostupny !== false).map(([nazev, s]) => {
      const kwp = s.panely * k;
      const ok = vykon <= kwp + 1e-9 && sumStr <= s.stringy && sumTr <= s.trackery;
      if (ok && !doporuceny) doporuceny = nazev;
      return { nazev, ...s, kwp, okVykon: vykon <= kwp + 1e-9, okStringy: sumStr <= s.stringy, okTrackery: sumTr <= s.trackery, ok };
    });
    return { panely, stringy, trackery, sumStr, sumTr, vykon, doporuceny, tabulka };
  }

  function calc(inp, C, opts = {}) {
    const PAR = C.parametry, B = C.baterie, DOT = C.dotace, KOEF = PAR.koeficient, PK = kwpPanelu(C);
    const P = inp.produkt, SPbB = P === 'Spol. prostory bez baterie', isSP = P === 'Spol. prostory', isJOM = P === 'JOM';
    const sdil = inp.sdileni === 'ano';
    const F19 = SPbB ? 'ne' : inp.tuv;
    const warn = [];

    // ---- jednotky (sloupce H:V listu Vstupní data) ----
    const J = inp.jednotky.map((u, i) => {
      const r = { i, aktivni: has(u.bj), bj: num(u.bj), spol: num(u.spol), byty: num(u.spotrByty), sp: num(u.spotrSpol), cena: num(u.cena), vykon: num(u.vykon), stridac: u.stridac || 'vyber', stringy: num(u.stringy) };
      const s = C.stridace[r.stridac];
      r.H13 = (r.byty + r.sp === 0) ? null : ((isJOM || sdil) ? r.byty + r.sp : (isSP ? r.sp : null));
      r.koef = r.H13 == null ? null : r.vykon / r.H13 * num(inp.koefBaterie);
      r.batVypocet = r.H13 == null ? null : ((isSP || isJOM) ? r.koef * r.vykon : null);
      r.batKs = (r.H13 == null || !s || r.batVypocet == null) ? null : r.batVypocet / (r.batVypocet <= B.hraniceGbl ? B.delitelPodHranici : B.bos);
      r.clanek = (r.batVypocet != null && r.batVypocet <= B.hraniceGbl && r.batVypocet > 0) ? B.gbl : (r.batVypocet == null ? null : B.bos);
      r.batRucne = has(u.batRucne) && s && !SPbB;
      if (r.batRucne) { // ruční počet baterií (rozšíření – varianty kapacity)
        r.pocetBat = Math.max(0, Math.round(num(u.batRucne)));
        if (r.clanek == null) r.clanek = B.bos;
        r.kapacita = r.pocetBat * r.clanek;
        r.chybaBat = r.kapacita > s.maxBaterie + 1e-9;
      } else if (r.batKs != null) {
        const c = ceil(r.batKs);
        r.pocetBat = (r.clanek === B.bos && c <= B.minBos - 1) ? B.minBos : c;
        r.kapacita = r.pocetBat * r.clanek;
        r.chybaBat = r.kapacita > s.maxBaterie + 1e-9;
      } else { r.pocetBat = null; r.kapacita = null; r.chybaBat = false; }
      if (r.chybaBat) warn.push(`${i + 1}. FVE: kapacita baterií ${fmt(r.kapacita, 2)} kWh překračuje maximum střídače ${r.stridac} (${s.maxBaterie} kWh).`);
      r.panely = s ? r.vykon / PK : null;
      r.chybaPanely = s ? r.panely > s.panely + 1e-9 : false;
      if (r.chybaPanely) warn.push(`${i + 1}. FVE: ${fmt(r.panely, 1)} panelů je víc, než unese ${r.stridac} (max. ${s.panely}).`);
      if (s && s.dostupny === false) warn.push(`${i + 1}. FVE: střídač ${r.stridac} se aktuálně nedodává.`);
      if (r.aktivni && r.stridac === 'vyber' && r.vykon) warn.push(`${i + 1}. FVE: chybí typ střídače.`);
      if (!r.aktivni && (r.vykon || r.stridac !== 'vyber')) warn.push(`${i + 1}. FVE: vyplň počet BJ, jinak se FVE nezapočítá do počtu sjednocených míst.`);
      r.stridacu = s ? 1 : 0;
      const pb = r.pocetBat || 0;
      r.sloupce = (!s || SPbB || r.clanek === B.gbl || r.pocetBat == null) ? 0 : ceil(pb / B.clankuVeSloupci);
      r.bmsBos = (!s || SPbB || r.clanek !== B.bos) ? 0 : ceil(pb / B.clankuNaBms);
      r.batBos = r.clanek === B.bos ? pb : 0;
      r.batGbl = r.clanek === B.gbl ? pb : 0;
      r.bmsGbl = (!s || SPbB || r.clanek !== B.gbl) ? 0 : ceil(pb / B.clankuNaBms);
      r.pomerBat = (r.kapacita != null && !r.chybaBat && r.vykon) ? r.kapacita / r.vykon : null;
      return r;
    });
    const sum = f => J.reduce((a, r) => a + (f(r) || 0), 0);
    const D9 = sum(r => r.bj), D10 = sum(r => r.spol), D12 = J.filter(r => r.aktivni).length;
    const G11 = sum(r => r.byty), G12 = sum(r => r.sp);
    const D26 = sum(r => r.vykon), D27 = sum(r => r.chybaPanely ? 0 : r.panely), D30 = sum(r => r.stringy), D31 = sum(r => r.stridacu);
    const D28 = SPbB ? 0 : sum(r => r.chybaBat ? 0 : r.kapacita), D29 = SPbB ? 0 : sum(r => r.pocetBat);
    const W33 = sum(r => r.sloupce), W34 = sum(r => r.bmsBos), W35 = sum(r => r.batBos), W36 = sum(r => r.batGbl), W37 = sum(r => r.bmsGbl);
    const pomery = J.filter(r => r.pomerBat != null).map(r => r.pomerBat);
    const W22 = pomery.length ? pomery.reduce((a, b) => a + b, 0) / pomery.length : 0;
    const G15 = D9 ? sum(r => r.bj * r.cena) / D9 : 0;
    const E16 = isJOM ? G12 + G11 : G12;
    const E17 = G15 > 0 ? G15 : PAR.cenaNakupVychozi;
    const D11excel = PAR.vyrobaNaKwp * D26;
    let D11 = D11excel, vyrobaZdroj = `Excel: ${fmt(PAR.vyrobaNaKwp, 2)} MWh na kWp`;
    if (inp.vyrobaRezim === 'rucne' && has(inp.vyrobaRucne)) { D11 = num(inp.vyrobaRucne); vyrobaZdroj = 'ruční zadání roční výroby'; }
    else if (inp.vyrobaRezim === 'odhad' && opts.odhadVyroby) { D11 = opts.odhadVyroby; vyrobaZdroj = 'modelový odhad z orientace, sklonu a ztrát'; }
    const strCount = {}; for (const k of Object.keys(C.stridace)) strCount[k] = sum(r => r.stridac === k ? 1 : 0);

    // TUV a sdílení
    const D35 = num(inp.tuvM3), E35 = num(inp.tuvGJ), F35 = num(inp.tuvMWh);
    const D36 = D35 > 0 ? D35 * PAR.prevodM3 : (E35 > 0 ? E35 * PAR.prevodGJ : (F35 > 0 ? F35 : 0));
    const D34 = num(inp.tuvNaklady);
    const D37 = D36 ? D34 / D36 : 0;
    if (inp.tuv === 'ano' && !SPbB && !D36) warn.push('TUV je zapnuté, ale chybí spotřeba na ohřev TUV (m³, GJ nebo MWh).');
    if (inp.tuv === 'ano' && SPbB) warn.push('Spol. prostory bez baterie nemají variantu s TUV – TUV se do ceny nepočítá.');
    const E22auto = sdil ? (inp.profilSdileni === 'běžný' ? G11 : null) : null;
    const E22 = sdil ? (has(inp.spotrebaSdileniRucne) ? num(inp.spotrebaSdileniRucne) : (E22auto || 0)) : 0;
    if (sdil && inp.profilSdileni !== 'běžný' && !has(inp.spotrebaSdileniRucne)) warn.push('Sdílení s profilem TČ/el. topení – zadej spotřebu sdílení ručně (záložka Energie a ceny).');

    // ---- Výpočty – měsíční bilance ----
    const pMin = PAR.primySpotrebaMin, pMax = PAR.primySpotrebaMax, U = PAR.vyuzitiPretoku;
    const I = SPbB ? pMin : Math.min(pMax, Math.max(pMin, pMin + (pMax - pMin) * W22));
    const W7 = inp.tuv;
    const prof = n => C.profily[n] || C.profily['běžný'];
    const mes = MESICE.map((m, k) => {
      const Cc = E16 / 12, D = prof(inp.profil)[k], E = Cc * D, F = C.podilVyroby[k] * D11;
      const H = Math.min(E, F) * I, Jx = E - H, K = F - H;
      const L = D36 / 12, N = L * prof('TUV')[k], Pp = K * U, Q = N > Pp ? Pp : N * U, R = N - Q, S = K - Q;
      const Uu = E22 / 12, W = Uu * prof(inp.profilSdileni)[k], X = isSP ? W * PAR.sdileniPodilSP : W * PAR.sdileniPodilOstatni;
      const Y = W7 === 'ano' ? S : K, AA = Y * U;
      const AB = inp.profilSdileni === 'TČ/el. topení' ? (AA > W ? W * U : AA) : (AA > X ? X : AA);
      return { mesic: m, C: Cc, D, E, F, H, I, J: Jx, K, L, N, P: Pp, Q, R, S, U: Uu, W, X, Y, AA, AB, AC: W - AB, AD: Y - AB };
    });
    const T = {}; for (const k of ['C', 'E', 'F', 'H', 'J', 'K', 'N', 'P', 'Q', 'R', 'S', 'U', 'W', 'X', 'Y', 'AA', 'AB', 'AC', 'AD']) T[k] = mes.reduce((a, r) => a + r[k], 0);
    const E5 = mes.slice(2, 10).reduce((a, r) => a + r.K, 0) / 8;

    const W6 = P !== 'vyber', W8 = inp.sdileni;
    const scen = (W6 && W7 === 'ne' && W8 === 'ne') ? 'F' : (W6 && W7 === 'ano' && W8 === 'ne') ? 'G' : (W6 && W7 === 'ano' && W8 === 'ano') ? 'H' : (W6 && W7 === 'ne' && W8 === 'ano') ? 'I' : null;
    const nazevScen = [P === 'vyber' ? '' : P, F19 === 'ano' ? 'TUV' : '', sdil ? 'SDÍLENÍ' : ''].filter(Boolean).join(' ⇒ ');

    // ---- Ceník ----
    const nazevVar = inp.orientace + ' ' + P;
    const vIdx = VARIANTY.indexOf(nazevVar);
    if (vIdx < 0) warn.push('Vyber typ produktu a orientaci – bez nich nelze sestavit rozpočet.');
    const pocet = n => strCount[n] || 0;
    const ctx = {
      produkt: P, vchody: num(inp.vchody), kwp: D26, stringy: D30, panely: D27, stridacu: D31, vyska: num(inp.vyska), delka: num(inp.delka), sirka: num(inp.sirka),
      jadroveVrtani: D12, jom: D12, bytySpol: D9 + D10, mistnostiTech: D12, tuv: F19, bj: D9, rozvadecu: num(inp.rozvadecu), sdileni: inp.sdileni,
      deye10: pocet('DEYE 10'), deye12: pocet('DEYE 12'), deye20: pocet('DEYE 20'), deye30: pocet('DEYE 30'), deye40: pocet('DEYE 40'), deye50: pocet('DEYE 50'),
      batBos: SPbB ? 0 : W35, sloupceBos: W33, bmsBos: W34, batGbl: SPbB ? 0 : W36, bmsGbl: W37,
      panelyFasada: num(inp.panelyFasada), vykonFasada: num(inp.vykonFasada), leseni: num(inp.leseni), stoupacky: inp.stoupacky, patra: num(inp.patra),
      rozvadece: inp.rozvadece, vchodyPatra: num(inp.vchodyPatra), kotveni: inp.kotveni, pretokTUV: E5, vchoduNaJom: D12 ? num(inp.vchody) / D12 : 0, wallbox: num(inp.wallbox),
    };
    ctx.stridaceCelkem = Object.values(strCount).reduce((a, b) => a + b, 0);
    const ctxArr = PROM_KLICE.map(k => ctx[k]);
    const upravy = inp.upravy || {};
    const chybyPravidel = [];
    const polozky = C.polozky.map(p => {
      const nazev = p.nazev === '@vlastni1' ? (inp.vlastni1Nazev || 'Vlastní položka 1') : p.nazev === '@vlastni2' ? (inp.vlastni2Nazev || 'Vlastní položka 2') : p.nazev;
      const cenaAuto = p.cena === '@vlastni1' ? num(inp.vlastni1Cena) : p.cena === '@vlastni2' ? num(inp.vlastni2Cena) : num(p.cena);
      let qtyAuto = 0;
      const f = pravidlo(p.mnozstvi);
      if (f) { try { qtyAuto = +f(...ctxArr); } catch (e) { chybyPravidel.push(`${p.kod || p.id} ${nazev}: ${e.message}`); qtyAuto = 0; } }
      if (!isFinite(qtyAuto)) qtyAuto = 0;
      const u = upravy[p.id] || {};
      const qty = has(u.qty) ? num(u.qty) : qtyAuto, cena = has(u.cena) ? num(u.cena) : cenaAuto;
      const vVariante = vIdx >= 0 && (p.varianty || '')[vIdx] === '1';
      const naklad = qty * cena;
      return { ...p, nazev, rucniMnozstvi: !p.mnozstvi, qtyAuto, cenaAuto, qtyRucne: has(u.qty), cenaRucne: has(u.cena), qty, cena, vVariante, naklad, nakladVar: vVariante ? naklad : 0, prodej: (vVariante ? naklad : 0) * KOEF };
    });
    const kat = {}; for (const k of SOUCTOVE_TYPY) kat[k] = 0;
    for (const p of polozky) kat[p.typ] = (kat[p.typ] || 0) + p.nakladVar;
    if (P !== 'JOM') { kat.FVE += kat.JOM; kat.JOM = 0; }
    const vse = polozky.reduce((a, p) => a + p.nakladVar, 0);
    const puvodni = kat.FVE + kat['PBŘ'];
    const slevaNakup = puvodni * PAR.slevaFvePbr;
    const nakupCelkem = vIdx >= 0 ? vse - slevaNakup : 0;
    const D47 = vIdx >= 0 ? nakupCelkem * KOEF : 0;
    const M46 = vIdx >= 0 ? slevaNakup * KOEF : 0;
    const DPH = num(inp.dph);
    const F47 = D47 * DPH;
    const D50 = D47, F50 = F47;

    // ---- Dotace ----
    const H54 = floor(D26) * num(inp.dotaceVykon);
    const N88 = D26 * DOT.bateriePomerMin, N90 = D26 * DOT.bateriePomerMax, M87 = D28;
    const P91 = SPbB ? 0 : ((M87 <= N88) ? 0 : (M87 < N90 ? D28 : N90));
    const H55 = SPbB ? 0 : floor(P91) * num(inp.dotaceBaterie);
    const bytuSDotaciSdil = D9 ? (D26 / D9 < DOT.kwpNaByt ? D26 / DOT.kwpNaByt : D9) : 0;
    const bytuSDotaciJom = D9 ? (D26 / D9 < DOT.kwpNaByt ? floor(D26 / DOT.kwpNaByt) : D9) : 0;
    const bytuSDotaci = isJOM ? bytuSDotaciJom : (sdil ? bytuSDotaciSdil : 0);
    const H56 = bytuSDotaci * num(inp.dotaceByt);
    const H57 = num(inp.wallbox) > 0 ? num(inp.wallbox) * num(inp.dotaceWallbox) : 0;
    const E53 = H54 + H55 + H56 + H57;
    const M80 = Math.min(E53, F47 * DOT.limitPodilCeny);
    const E57 = M80 * DOT.kontrola;
    const E56 = has(inp.dotaceRucne) ? num(inp.dotaceRucne) : 0;
    const dotaceHlasky = [];
    if (E53 > F47 * DOT.limitPodilCeny) dotaceHlasky.push('Nárok na dotaci je vyšší než polovina ceny s DPH – dotace je omezena na 50 % ceny.');
    if (floor(D28 * num(inp.dotaceBaterie) / 10000) * 10000 > H55 + 1e-9) dotaceHlasky.push('Dotace neodpovídá kapacitě baterie (baterie mimo rozsah 0,5–1,5× výkonu FVE).');
    if (E56 > 0 && E56 >= E57) dotaceHlasky.push('Přepiš dotaci – překročeno 30 % (kontrola E56 ≥ E57 z Excelu).');
    const D59 = D50 - E56, F59 = F50 - E56;

    // ---- Výpočty – souhrny podle scénáře ----
    const J6 = E17, J7 = D37, J8 = num(inp.cenaSdileni), N6 = num(inp.vykup);
    const inG = scen === 'G' || scen === 'H', inS = scen === 'H' || scen === 'I';
    const v = {
      vyroba: T.F, odberSitProdukt: T.J, odberSitTUV: inG ? T.R : 0, odberSitSdil: inS ? T.AC : 0,
      odberFVE: T.H, pretokPoProduktu: T.K, vyuzitiTUV: inG ? T.Q : 0, pretokPoTUV: inG ? T.S : 0,
      vyuzitiSdil: inS ? T.AB : 0, pretokPoSdil: inS ? T.AD : 0,
      spotrProdukt: T.E, spotrTUV: inG ? T.N : 0, spotrSdil: inS ? T.W : 0,
      cenaProdukt: J6, cenaTUV: inG ? J7 : 0, cenaSdil: inS ? J8 : 0, vykup: N6,
    };
    v.pretokDoSite = scen === 'F' ? T.K : scen === 'G' ? T.S : inS ? T.AD : T.K;
    v.nakladyProdukt = T.E * J6; v.nakladyTUV = inG ? T.N * J7 : 0; v.nakladySdil = inS ? T.W * J8 : 0;
    v.usporyProdukt = T.H * J6; v.usporyTUV = inG ? T.Q * J7 : 0; v.usporySdil = inS ? T.AB * J8 : 0;
    v.prodejProdukt = scen === 'F' ? T.K * N6 : 0; v.prodejTUV = scen === 'G' ? T.S * N6 : 0; v.prodejSdil = inS ? T.AD * N6 : 0;
    const uspory = v.usporyProdukt + v.usporyTUV + v.usporySdil;
    v.prodejCelkem = v.prodejProdukt + v.prodejTUV + v.prodejSdil;
    v.usporyVcProdeje = uspory + v.prodejCelkem;
    v.usporyBezProdeje = uspory;
    v.cenaDum = F50; v.dotace = E56; v.investiceDum = F59;
    v.cenaByt = D9 ? F50 / D9 : 0; v.dotaceByt = D9 ? E56 / D9 : 0; v.investiceByt = v.cenaByt - v.dotaceByt;
    v.navratnostVc = v.usporyVcProdeje ? F59 / v.usporyVcProdeje : null;
    v.navratnostBez = uspory ? F59 / uspory : null;
    v.cenaSFVEProdukt = T.E ? (T.J / T.E) * J6 : 0; v.cenaSFVETUV = (inG && T.N) ? (T.R / T.N) * J7 : 0; v.cenaSFVESdil = (inS && T.W) ? (T.AC / T.W) * J8 : 0;
    v.usporaDum = uspory; v.usporaByt = D9 ? uspory / D9 : 0;
    const spotrCelk = v.spotrProdukt + v.spotrTUV + v.spotrSdil;
    v.podilOdberFVE = spotrCelk ? (v.odberFVE + v.vyuzitiTUV + v.vyuzitiSdil) / spotrCelk : null;
    v.podilOdberSit = spotrCelk ? (v.odberSitProdukt + v.odberSitTUV + v.odberSitSdil) / spotrCelk : null;
    const kVystup = {}; for (const k of SOUCTOVE_TYPY) kVystup[k] = KOEF * DPH * kat[k] * ((k === 'FVE' || k === 'PBŘ') ? (1 - PAR.slevaFvePbr) : 1);
    const K148 = kVystup.FVE + kVystup['PBŘ'], M148 = K148 - E56, N148 = T.H * J6;
    v.prostaNavratnost = N148 ? M148 / N148 : null;

    const boj = polozky.find(p => p.kusy && p.qtyAuto === 1);
    const D38 = (F19 === 'ano' && boj) ? boj.litry : null, D39 = (F19 === 'ano' && boj) ? boj.kusy : null;
    if (D26 === 0 && W6) warn.push('Zadej výkon FVE alespoň u jedné FVE (záložka Návrh FVE).');
    for (const e of chybyPravidel) warn.push('Ceník – ' + e);

    return {
      produkt: P, varianta: nazevVar, vIdx, scen, nazevScen, warn, jednotky: J, mesice: mes, T, E5, ctx,
      souhrn: { D9, D10, D11, D11excel, vyrobaZdroj, D12, G11, G12, D26, D27, D28, D29, D30, D31, W22, G15, E16, E17, I, D34, D36, D37, E22, E22auto, strCount, W33, W34, W35, W36, W37, D38, D39, F19 },
      cenik: { polozky, kat, vse, puvodni, slevaNakup, nakupCelkem, D47, M46, F47, D50, F50, D59, F59, kVystup, M45: D47 + M46, DPH },
      dotace: { H54, H55, H56, H57, E53, M80, E57, E56, P91, hlasky: dotaceHlasky, bytuSDotaci },
      vysledky: v,
    };
  }

  root.FVE = { calc, defaultInputs, navrhStridace, pravidlo, testPravidla, PROMENNE, VARIANTY, PRODUKTY, ORIENTACE, MESICE, SOUCTOVE_TYPY, num, has, fmt, ceil, floor, kwpPanelu };
})(typeof window !== 'undefined' ? window : globalThis);
