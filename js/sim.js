/* =====================================================================
   Modelová výroba FVE a hodinová simulace energetické bilance
   (zadávací dokumentace kap. 7). Nejde o naměřená data: hodinové tvary
   výroby i spotřeby jsou modelové a každý měsíc se přepočítají tak, aby
   seděly na měsíční hodnoty z výpočtu podle Excelu.
   ===================================================================== */
(function (root) {
  const DEG = Math.PI / 180;
  const DNY_V_MESICI = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const MES_ZAC = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

  // Modelové hodinové tvary spotřeby (relativní, průměr ≈ 1)
  const TVARY = {
    byty_prac: [0.55, 0.45, 0.4, 0.38, 0.38, 0.45, 0.75, 1.0, 0.9, 0.75, 0.7, 0.75, 0.85, 0.8, 0.75, 0.8, 0.95, 1.2, 1.45, 1.55, 1.45, 1.25, 1.0, 0.75],
    byty_vikend: [0.6, 0.5, 0.45, 0.4, 0.4, 0.42, 0.5, 0.7, 0.95, 1.1, 1.15, 1.2, 1.25, 1.1, 1.0, 1.0, 1.05, 1.25, 1.45, 1.5, 1.4, 1.2, 0.95, 0.75],
    spolecne: [0.7, 0.65, 0.65, 0.65, 0.7, 0.85, 1.1, 1.2, 1.1, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.05, 1.15, 1.3, 1.35, 1.3, 1.2, 1.0, 0.85, 0.75],
    tc: [1.1, 1.1, 1.1, 1.1, 1.15, 1.2, 1.15, 1.05, 0.95, 0.9, 0.85, 0.85, 0.85, 0.85, 0.85, 0.9, 0.95, 1.0, 1.05, 1.05, 1.05, 1.05, 1.05, 1.1],
  };

  // měsíční podíl difúzního záření podle průměrného indexu jasnosti (Page / Liu-Jordan)
  function erbs(kt) { return Math.min(0.95, Math.max(0.2, 1.391 - 3.56 * kt + 4.189 * kt * kt - 2.137 * kt ** 3)); }

  /* Hodinová výroba na 1 kWp (kWh) pro rovinu se sklonem a azimutem (180 = jih), bez ztrát. 8760 hodnot. */
  function poaRok(C, sklon, azimut) {
    const M = C.model, phi = M.zemepisnaSirka * DEG, b = sklon * DEG, g = azimut * DEG;
    const ne = Math.sin(b) * Math.sin(g), nn = Math.sin(b) * Math.cos(g), nu = Math.cos(b);
    const out = new Float64Array(8760);
    for (let d = 0; d < 365; d++) {
      const m = MES_ZAC.findIndex((z, i) => d >= z && d < z + DNY_V_MESICI[i]);
      const kt = M.mesicniKt[m], kd = erbs(kt);
      const dec = 23.45 * DEG * Math.sin(2 * Math.PI * (284 + d + 1) / 365);
      const e0 = 1367 * (1 + 0.033 * Math.cos(2 * Math.PI * (d + 1) / 365));
      for (let h = 0; h < 24; h++) {
        const ts = h + 0.5 - 1 + 15.6 / 15; // středoevropský čas → sluneční čas (Polná ~15,6° v. d.)
        const w = 15 * (ts - 12) * DEG;
        const cz = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(w);
        if (cz <= 0.02) continue;
        const ghi = kt * e0 * cz, dhi = kd * ghi, dni = (ghi - dhi) / cz;
        const se = -Math.cos(dec) * Math.sin(w), sn = Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.cos(w) * Math.sin(phi);
        const ct = se * ne + sn * nn + cz * nu;
        const poa = dni * Math.max(0, ct) + dhi * (1 + Math.cos(b)) / 2 + ghi * M.albedo * (1 - Math.cos(b)) / 2;
        out[d * 24 + h] = poa / 1000;
      }
    }
    return out;
  }
  const cachePoa = new Map();
  function poa(C, sklon, azimut) { const k = `${C.model.zemepisnaSirka}|${C.model.mesicniKt}|${sklon}|${azimut}`; if (!cachePoa.has(k)) cachePoa.set(k, poaRok(C, sklon, azimut)); return cachePoa.get(k); }
  const soucet = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s; };

  /* Roviny panelů podle orientace z Excelu: VZ = půl východ, půl západ; J = jih; šikmá = zadaný sklon a azimut; fasáda = svislá. */
  function roviny(inp, kwpStrecha, kwpFasada) {
    const sklon = FVE.num(inp.sklon) || 15, az = FVE.has(inp.azimut) ? FVE.num(inp.azimut) : 180;
    const r = [];
    if (inp.orientace === 'VZ') { r.push({ sklon, azimut: 90, kwp: kwpStrecha / 2 }, { sklon, azimut: 270, kwp: kwpStrecha / 2 }); }
    else if (inp.orientace === 'J') r.push({ sklon, azimut: 180, kwp: kwpStrecha });
    else r.push({ sklon, azimut: az, kwp: kwpStrecha });
    if (kwpFasada > 0) r.push({ sklon: 90, azimut: inp.orientace === 'šikmá' ? az : 180, kwp: kwpFasada });
    return r;
  }

  /* Odhad roční výroby v MWh: kalibrace na zadanou výrobu optimálně orientované plochy (kWh/kWp brutto) a ztráty. */
  function odhadVyroby(inp, C, kwp) {
    const fas = Math.min(FVE.num(inp.vykonFasada), kwp);
    const R = roviny(inp, kwp - fas, fas);
    const opt = soucet(poa(C, 35, 180));
    let kwh = 0; for (const p of R) kwh += p.kwp * C.model.vyrobaOptimalniBrutto * soucet(poa(C, p.sklon, p.azimut)) / opt;
    const ztraty = Math.min(60, Math.max(0, FVE.num(inp.ztraty)));
    const mwh = kwh * (1 - ztraty / 100) / 1000;
    return { mwh, naKwp: kwp ? mwh * 1000 / kwp : 0, roviny: R };
  }

  function tvarSpotreby(typ, d) { const vikend = (d % 7) >= 5; return typ === 'byty' ? (vikend ? TVARY.byty_vikend : TVARY.byty_prac) : typ === 'tc' ? TVARY.tc : TVARY.spolecne; }

  /* Hodinová simulace. R = výsledek FVE.calc (měsíční model), vrací roční a měsíční součty v MWh. */
  function simuluj(inp, C, R) {
    const s = R.souhrn, P = inp.produkt, SPbB = P === 'Spol. prostory bez baterie', isJOM = P === 'JOM', isSP = P === 'Spol. prostory';
    const U = C.parametry.vyuzitiPretoku;
    const fas = Math.min(FVE.num(inp.vykonFasada), s.D26);
    const R0 = roviny(inp, s.D26 - fas, fas);
    // hodinový tvar výroby (kWh) a jeho přepočet na měsíční výrobu modelu
    const pv = new Float64Array(8760);
    for (const p of R0) { const a = poa(C, p.sklon, p.azimut); for (let i = 0; i < 8760; i++) pv[i] += a[i] * p.kwp; }
    for (let m = 0; m < 12; m++) {
      const z = MES_ZAC[m] * 24, k = DNY_V_MESICI[m] * 24; let t = 0; for (let i = z; i < z + k; i++) t += pv[i];
      const cil = R.mesice[m].F * 1000; const f = t ? cil / t : 0; for (let i = z; i < z + k; i++) pv[i] *= f;
    }
    // spotřeba produktu: byty + společné prostory (JOM) nebo jen společné prostory, přepočet na měsíční E z modelu
    const tc = inp.profil === 'TČ/el. topení';
    const podilByty = isJOM && s.E16 ? s.G11 / s.E16 : 0;
    const load = new Float64Array(8760), share = new Float64Array(8760);
    for (let d = 0; d < 365; d++) {
      const tb = tc ? TVARY.tc : tvarSpotreby('byty', d), tsp = tc ? TVARY.tc : TVARY.spolecne;
      const ts = inp.profilSdileni === 'TČ/el. topení' ? TVARY.tc : tvarSpotreby('byty', d);
      for (let h = 0; h < 24; h++) { load[d * 24 + h] = podilByty * tb[h] + (1 - podilByty) * tsp[h]; share[d * 24 + h] = ts[h]; }
    }
    const sdilOn = R.scen === 'H' || R.scen === 'I', tuvOn = R.scen === 'G' || R.scen === 'H';
    for (let m = 0; m < 12; m++) {
      const z = MES_ZAC[m] * 24, k = DNY_V_MESICI[m] * 24; let a = 0, b = 0;
      for (let i = z; i < z + k; i++) { a += load[i]; b += share[i]; }
      const fa = a ? R.mesice[m].E * 1000 / a : 0, fb = (b && sdilOn) ? R.mesice[m].W * 1000 / b : 0;
      for (let i = z; i < z + k; i++) { load[i] *= fa; share[i] *= fb; }
    }
    // baterie
    const capNom = SPbB ? 0 : s.D28;
    const cap = capNom * Math.min(100, Math.max(10, FVE.num(inp.batDod) || 90)) / 100;
    const eta = Math.min(100, Math.max(50, FVE.num(inp.batUcinnost) || 90)) / 100, e1 = Math.sqrt(eta);
    const vykonStridacu = R.jednotky.reduce((a, r) => a + (r.stridac !== 'vyber' ? (parseFloat(r.stridac.replace(/\D+/g, '')) || 0) : 0), 0);
    const pBat = Math.min(capNom * (FVE.num(inp.batCRate) || 0.5), vykonStridacu || Infinity);
    const tuvDen = tuvOn ? s.D36 * 1000 / 365 : 0, pTuv = Math.max(0, FVE.num(inp.tuvVykon));
    const podilSdil = inp.profilSdileni === 'TČ/el. topení' ? U : (isSP ? C.parametry.sdileniPodilSP : C.parametry.sdileniPodilOstatni);
    let soc = cap / 2, tuvZbyva = 0;
    const tot = { pv: 0, load: 0, direct: 0, nabijeni: 0, vybijeni: 0, ztratyBat: 0, tuv: 0, sdileni: 0, sdileniSpotreba: 0, export: 0, import: 0 };
    const mes = Array.from({ length: 12 }, () => ({ pv: 0, load: 0, direct: 0, vybijeni: 0, tuv: 0, sdileni: 0, export: 0, import: 0 }));
    const dnyUkazka = { cerven: 171, prosinec: 354, brezen: 79 }, ukazky = {};
    for (const k in dnyUkazka) ukazky[k] = [];
    for (let d = 0; d < 365; d++) {
      const m = MES_ZAC.findIndex((z, i) => d >= z && d < z + DNY_V_MESICI[i]);
      tuvZbyva = tuvDen;
      for (let h = 0; h < 24; h++) {
        const i = d * 24 + h, g = pv[i], L = load[i];
        const direct = Math.min(g, L); let surplus = g - direct, deficit = L - direct;
        let ch = 0, dis = 0;
        if (cap > 0) {
          ch = Math.min(surplus, pBat, (cap - soc) / e1); soc += ch * e1; surplus -= ch;
          dis = Math.min(deficit, pBat, soc * e1); soc -= dis / e1; deficit -= dis;
        }
        let tu = 0; if (tuvZbyva > 0) { tu = Math.min(surplus, tuvZbyva, pTuv || Infinity); tuvZbyva -= tu; surplus -= tu; }
        let sh = 0; if (sdilOn) { sh = Math.min(surplus, share[i] * podilSdil); surplus -= sh; }
        tot.pv += g; tot.load += L; tot.direct += direct; tot.nabijeni += ch; tot.vybijeni += dis; tot.tuv += tu; tot.sdileni += sh; tot.sdileniSpotreba += share[i]; tot.export += surplus; tot.import += deficit;
        const mm = mes[m]; mm.pv += g; mm.load += L; mm.direct += direct; mm.vybijeni += dis; mm.tuv += tu; mm.sdileni += sh; mm.export += surplus; mm.import += deficit;
        for (const k in dnyUkazka) if (dnyUkazka[k] === d) ukazky[k].push({ h, pv: g, load: L, direct, dis, ch, soc: cap ? soc / cap : 0, export: surplus, import: deficit });
      }
    }
    tot.ztratyBat = tot.nabijeni - tot.vybijeni - (soc - cap / 2) * 1; // přibližně, kWh
    const k = x => x / 1000; // kWh → MWh
    const r = {};
    for (const key in tot) r[key] = k(tot[key]);
    r.mesice = mes.map(o => { const q = {}; for (const key in o) q[key] = k(o[key]); return q; });
    r.ukazky = ukazky; r.cap = capNom; r.capUsable = cap; r.pBat = isFinite(pBat) ? pBat : 0; r.cykly = cap ? tot.vybijeni / cap : 0;
    r.vlastniSpotreba = r.pv ? (r.direct + r.vybijeni + r.tuv + r.sdileni) / r.pv : null;
    r.sobestacnost = r.load ? (r.direct + r.vybijeni) / r.load : null;
    r.odberFVEProdukt = r.direct + r.vybijeni;
    r.roviny = R0; r.tuvOn = tuvOn; r.sdilOn = sdilOn; r.tuvDenKwh = tuvDen;
    return r;
  }

  root.FVESIM = { odhadVyroby, simuluj, poa, roviny, DNY_V_MESICI };
})(typeof window !== 'undefined' ? window : globalThis);
