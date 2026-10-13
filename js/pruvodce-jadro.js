/* =====================================================================
   Průvodce naceněním – výpočetní část (bez UI)
   Z celkových údajů o domě sestaví kandidátní varianty elektrárny,
   každou spočítá jádrem podle Excelu, ohodnotí a doporučí nejlepší.
   ===================================================================== */
(function (root) {
  const N = v => FVE.num(v);

  function vychozi(C) {
    return {
      krok: 0, adresa: '', kontakt: '', funkce: '– předseda SVJ', top: '', pripravar: 'vyber',
      vyska: '', delka: '', sirka: '', vchody: '', podlazi: '', stoupacky: 'ne', rozvadece: 'ano', stareRozvadece: 'ne',
      bj: '', spolMista: '', spotrByty: '', spotrSpol: '', cenaKwh: C.parametry.cenaNakupVychozi / 1000, profil: 'běžný',
      strecha: 'VZ', sklon: 15, azimut: 180, kotveni: 'přitížení dlažbou',
      navrh: [{ strana: '', panely: '' }, { strana: '', panely: '' }, { strana: '', panely: '' }],
      panelyFasada: '', leseni: '', jom: 1,
      produkty: { 'JOM': true, 'Spol. prostory': true, 'Spol. prostory bez baterie': true },
      tuv: 'ne', tuvNaklady: '', tuvM3: '', tuvGJ: '', tuvMWh: '', sdileni: 'ne',
      vykupKwh: C.parametry.cenaVykupu / 1000, dotace: 'ano', horizont: 25, diskont: 4, rustCen: 0, degradace: 0.5, provozni: 0,
      kriterium: 'npv', vybrane: null,
    };
  }

  /* Zpětně naplní průvodce z existující varianty (součty přes FVE). */
  function zVstupu(I, C) {
    const W = vychozi(C), J = I.jednotky.filter(u => FVE.has(u.bj));
    const s = k => J.reduce((a, u) => a + N(u[k]), 0);
    Object.assign(W, { adresa: I.adresa, kontakt: I.kontakt, funkce: I.funkce, top: I.top, pripravar: I.pripravar, vyska: I.vyska, delka: I.delka, sirka: I.sirka, vchody: I.vchody,
      podlazi: N(I.vchody) ? Math.round(N(I.patra) / N(I.vchody)) || '' : '', stoupacky: I.stoupacky, rozvadece: I.rozvadece, stareRozvadece: N(I.rozvadecu) > 0 ? 'ano' : 'ne',
      bj: s('bj') || '', spolMista: s('spol') || '', spotrByty: s('spotrByty') || '', spotrSpol: s('spotrSpol') || '', profil: I.profil,
      cenaKwh: s('bj') ? J.reduce((a, u) => a + N(u.bj) * N(u.cena), 0) / s('bj') / 1000 || W.cenaKwh : W.cenaKwh,
      strecha: FVE.ORIENTACE.includes(I.orientace) ? I.orientace : 'VZ', sklon: I.sklon, azimut: I.azimut, kotveni: I.kotveni,
      navrh: JSON.parse(JSON.stringify(I.navrh)), panelyFasada: I.panelyFasada, leseni: I.leseni, jom: Math.max(1, J.length),
      tuv: I.tuv, tuvNaklady: I.tuvNaklady, tuvM3: I.tuvM3, tuvGJ: I.tuvGJ, tuvMWh: I.tuvMWh, sdileni: I.sdileni, vykupKwh: N(I.vykup) / 1000 });
    if (!W.navrh.some(n => N(n.panely))) { const p = Math.round(J.reduce((a, u) => a + N(u.vykon), 0) / FVE.kwpPanelu(C)); if (p) W.navrh[0] = { strana: W.strecha === 'VZ' ? 'V+Z' : 'J', panely: p }; }
    return W;
  }

  /* Povinné údaje po krocích – vrací seznam chybějících. */
  const KROKY = ['Dům a kontakt', 'Budova', 'Byty a spotřeba', 'Střecha a panely', 'Produkty a přetoky', 'Ekonomika', 'Varianty a doporučení'];
  function chybi(W) {
    const z = [];
    const req = (k, l, krok) => { if (!FVE.has(W[k]) || N(W[k]) <= 0) z.push({ krok, pole: k, text: l }); };
    req('vyska', 'výška budovy', 1); req('delka', 'délka budovy', 1); req('sirka', 'šířka budovy', 1); req('vchody', 'počet vchodů', 1); req('podlazi', 'počet podlaží', 1);
    req('bj', 'počet bytových jednotek', 2); req('spotrSpol', 'spotřeba společných prostor', 2); req('cenaKwh', 'cena elektřiny', 2);
    if (W.produkty['JOM'] || W.sdileni === 'ano') req('spotrByty', 'spotřeba bytů', 2);
    if (!W.navrh.some(n => N(n.panely) > 0)) z.push({ krok: 3, pole: 'navrh', text: 'počet panelů na střeše (ze SolarEdge Designeru)' });
    if (!Object.values(W.produkty).some(Boolean)) z.push({ krok: 4, pole: 'produkty', text: 'alespoň jeden produkt' });
    if (W.tuv === 'ano' && !(N(W.tuvM3) || N(W.tuvGJ) || N(W.tuvMWh))) z.push({ krok: 4, pole: 'tuvM3', text: 'spotřeba na ohřev TUV' });
    return z;
  }

  function vyberStridac(C, panely) {
    const P = C.parametry, str = Math.ceil(panely / P.panelyNaString);
    for (const [k, s] of Object.entries(C.stridace)) if (s.dostupny !== false && panely <= s.panely && str <= s.stringy) return k;
    return null;
  }
  const maxNaStridac = C => Math.max(...Object.values(C.stridace).filter(s => s.dostupny !== false).map(s => s.panely));

  /* Sestaví kompletní vstupy jedné varianty pro výpočetní jádro. */
  function vstupy(W, C, produkt, panelyCelkem) {
    const I = FVE.defaultInputs(C), P = C.parametry;
    const n = Math.max(1, Math.min(15, Math.round(N(W.jom)) || 1));
    const vch = N(W.vchody), pod = N(W.podlazi);
    Object.assign(I, {
      adresa: W.adresa, kontakt: W.kontakt, funkce: W.funkce, top: W.top, pripravar: W.pripravar,
      vyska: W.vyska, delka: W.delka, sirka: W.sirka, vchody: W.vchody, stoupacky: W.stoupacky, rozvadece: W.rozvadece,
      patra: vch * pod || '', vchodyPatra: vch * pod || '', rozvadecu: W.stareRozvadece === 'ano' ? vch * pod : '',
      kotveni: W.kotveni, panelyFasada: W.panelyFasada, vykonFasada: N(W.panelyFasada) ? +(N(W.panelyFasada) * FVE.kwpPanelu(C)).toFixed(2) : '', leseni: W.leseni,
      produkt, orientace: W.strecha, profil: W.profil, sklon: W.sklon, azimut: W.azimut,
      tuv: produkt === 'Spol. prostory bez baterie' ? 'ne' : W.tuv, tuvNaklady: W.tuvNaklady, tuvM3: W.tuvM3, tuvGJ: W.tuvGJ, tuvMWh: W.tuvMWh,
      sdileni: produkt === 'JOM' ? 'ne' : W.sdileni, vykup: Math.round(N(W.vykupKwh) * 1000),
      navrh: JSON.parse(JSON.stringify(W.navrh)),
      zapocistDotaci: W.dotace, horizont: W.horizont, diskont: W.diskont, rustCen: W.rustCen, degradace: W.degradace, provozni: W.provozni,
    });
    // rozdělení domu na sjednocená místa (FVE) rovným dílem
    const rozdel = (celkem, k, cele) => { if (!cele) return +(celkem / n).toFixed(3); const z = Math.floor(celkem / n), r = Math.round(celkem) - z * n; return z + (k < r ? 1 : 0); };
    const varovani = [];
    for (let k = 0; k < n; k++) {
      let pan = rozdel(panelyCelkem, k, true);
      const mx = maxNaStridac(C);
      if (pan > mx) { varovani.push(`Na jednu FVE vychází ${pan} panelů, největší střídač unese ${mx} – zvyš počet sjednocených míst.`); pan = mx; }
      const st = vyberStridac(C, pan);
      Object.assign(I.jednotky[k], {
        bj: rozdel(N(W.bj), k, true), spol: rozdel(N(W.spolMista), k, true), spotrByty: rozdel(N(W.spotrByty), k), spotrSpol: rozdel(N(W.spotrSpol), k),
        cena: Math.round(N(W.cenaKwh) * 1000), vykon: +(pan * FVE.kwpPanelu(C)).toFixed(2), stridac: st || 'vyber', stringy: Math.ceil(pan / P.panelyNaString),
      });
    }
    return { I, varovani };
  }

  /* Kandidáti: každý vybraný produkt × velikost (podle spotřeby / plná střecha). */
  function kandidati(W, C) {
    const P = C.parametry, kP = FVE.kwpPanelu(C);
    const strecha = W.navrh.reduce((a, r) => a + N(r.panely), 0) + N(W.panelyFasada);
    if (!strecha) return [];
    const out = [];
    for (const produkt of FVE.PRODUKTY) {
      if (!W.produkty[produkt]) continue;
      let spotr = produkt === 'JOM' ? N(W.spotrByty) + N(W.spotrSpol) : N(W.spotrSpol) + (W.sdileni === 'ano' ? N(W.spotrByty) * (produkt === 'Spol. prostory' ? P.sdileniPodilSP : P.sdileniPodilOstatni) : 0);
      const podleSpotreby = Math.max(4, Math.ceil(spotr / P.vyrobaNaKwp / kP));
      const velikosti = [];
      if (podleSpotreby < strecha * 0.9) velikosti.push(['podle spotřeby', podleSpotreby]);
      velikosti.push(['plná střecha', strecha]);
      for (const [vel, pan] of velikosti) {
        const nazev = `${produkt === 'Spol. prostory bez baterie' ? 'Spol. prostory bez baterie' : produkt === 'Spol. prostory' ? 'Spol. prostory s baterií' : 'JOM'} – ${vel}`;
        out.push({ id: produkt + '|' + vel, nazev, produkt, velikost: vel, panely: pan });
      }
    }
    return out;
  }

  function ohodnot(W, C, k) {
    let { I, varovani } = vstupy(W, C, k.produkt, k.panely);
    const kwp = I.jednotky.reduce((a, u) => a + N(u.vykon), 0);
    const od = FVESIM.odhadVyroby(I, C, kwp);
    let R = FVE.calc(I, C, { odhadVyroby: od.mwh });
    const omez = R.jednotky.filter(r => r.chybaBat);
    if (omez.length) {
      for (const r of omez) { const s = C.stridace[r.stridac]; I.jednotky[r.i].batRucne = String(Math.floor(s.maxBaterie / r.clanek + 1e-9)); }
      varovani.push(`Baterie podle vzorce z Excelu by překročila maximum střídače – omezena na maximum (${omez.map(r => r.stridac).join(', ')}).`);
      R = FVE.calc(I, C, { odhadVyroby: od.mwh });
    }
    if (W.dotace === 'ano') { I.dotaceRucne = String(Math.round(R.dotace.M80)); R = FVE.calc(I, C, { odhadVyroby: od.mwh }); }
    const S = FVESIM.simuluj(I, C, R);
    const E = FVEEKO.vyhodnot(I, R, null);
    const chyby = R.warn.filter(w => /CHYBA|překračuje|chybí typ|Vyber typ/.test(w));
    return { ...k, I, R, S, E, varovani: [...varovani, ...R.warn], chyby };
  }

  const KRITERIA = {
    npv: { nazev: 'nejvyšší čistá současná hodnota (NPV)', skore: x => x.E.npv },
    navratnost: { nazev: 'nejkratší návratnost', skore: x => x.E.prostaNavratnost == null ? -1e12 : -x.E.prostaNavratnost },
    investice: { nazev: 'nejnižší investice', skore: x => -x.E.investice },
    sobestacnost: { nazev: 'nejvyšší soběstačnost domu', skore: x => x.S.sobestacnost ?? -1 },
  };

  function vyhodnot(W, C) {
    const list = kandidati(W, C).map(k => ohodnot(W, C, k)).filter(x => x.R.vIdx >= 0);
    const kr = KRITERIA[W.kriterium] || KRITERIA.npv;
    list.sort((a, b) => (b.chyby.length ? -1 : 0) - (a.chyby.length ? -1 : 0) || kr.skore(b) - kr.skore(a));
    const ok = list.filter(x => !x.chyby.length);
    const best = ok[0] || null;
    const ext = (f, dir) => ok.reduce((m, x) => (m == null || dir * (f(x) - f(m)) > 0) ? x : m, null);
    const stitky = {};
    const add = (x, t) => { if (x) (stitky[x.id] = stitky[x.id] || []).push(t); };
    add(ext(x => x.E.investice, -1), 'nejnižší investice');
    add(ext(x => x.E.prostaNavratnost ?? 1e9, -1), 'nejrychlejší návratnost');
    add(ext(x => x.E.npv, 1), 'nejvyšší NPV');
    add(ext(x => x.S.sobestacnost ?? 0, 1), 'nejvyšší soběstačnost');
    let duvod = '';
    if (best) {
      const e = best.E, alt = ok.filter(x => x !== best);
      duvod = `Podle kritéria „${kr.nazev}“ vychází nejlépe. Investice ${FVE.fmt(e.investice)} Kč${W.dotace === 'ano' ? ' po dotaci' : ''}, roční přínos ${FVE.fmt(e.usporaNakup + e.vynosPretoky)} Kč, prostá návratnost ${e.prostaNavratnost == null ? '–' : FVE.fmt(e.prostaNavratnost, 1) + ' let'}, NPV za ${e.horizont} let ${FVE.fmt(e.npv)} Kč.`;
      if (alt.length) { const a = alt[0]; duvod += ` Druhá nejlepší je „${a.nazev}“ (NPV ${FVE.fmt(a.E.npv)} Kč, návratnost ${a.E.prostaNavratnost == null ? '–' : FVE.fmt(a.E.prostaNavratnost, 1) + ' let'}).`; }
    }
    return { list, best, stitky, duvod, kriterium: kr.nazev };
  }

  root.FVEPRUVODCE = { vychozi, zVstupu, chybi, kandidati, vyhodnot, vstupy, KROKY, KRITERIA };
})(typeof window !== 'undefined' ? window : globalThis);
