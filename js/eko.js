/* =====================================================================
   Ekonomické vyhodnocení (zadávací dokumentace kap. 9)
   Peněžní tok po letech, prostá a diskontovaná návratnost, NPV, IRR.
   Přínosy bere buď z měsíčního modelu podle Excelu, nebo z hodinové simulace.
   ===================================================================== */
(function (root) {
  const N = v => FVE.num(v);

  function prinosy(inp, R, S) {
    const v = R.vysledky, s = R.souhrn;
    const J6 = s.E17, J7 = s.D37, J8 = N(inp.cenaSdileni), N6 = N(inp.vykup);
    if (inp.ekoRezim === 'hodinovy' && S) {
      return {
        zdroj: 'hodinová simulace',
        usporaNakup: S.odberFVEProdukt * J6 + (S.tuvOn ? S.tuv * J7 : 0) + (S.sdilOn ? S.sdileni * J8 : 0),
        vynosPretoky: S.export * N6,
        detail: { produkt: S.odberFVEProdukt * J6, tuv: S.tuvOn ? S.tuv * J7 : 0, sdileni: S.sdilOn ? S.sdileni * J8 : 0 },
        energie: { odberFVE: S.odberFVEProdukt, tuv: S.tuv, sdileni: S.sdileni, export: S.export },
      };
    }
    return {
      zdroj: 'měsíční model podle Excelu',
      usporaNakup: v.usporyBezProdeje, vynosPretoky: v.prodejCelkem,
      detail: { produkt: v.usporyProdukt, tuv: v.usporyTUV, sdileni: v.usporySdil },
      energie: { odberFVE: v.odberFVE, tuv: v.vyuzitiTUV, sdileni: v.vyuzitiSdil, export: v.pretokDoSite },
    };
  }

  function irr(cf) {
    const npv = r => cf.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0);
    let lo = -0.99, hi = 1, flo = npv(lo), fhi = npv(hi);
    if (!isFinite(flo) || flo * fhi > 0) return null;
    for (let k = 0; k < 200; k++) { const mid = (lo + hi) / 2, f = npv(mid); if (Math.abs(f) < 1e-6) return mid; if (f * flo < 0) { hi = mid; fhi = f; } else { lo = mid; flo = f; } }
    return (lo + hi) / 2;
  }

  function vyhodnot(inp, R, S) {
    const pr = prinosy(inp, R, S);
    const H = Math.max(1, Math.min(40, Math.round(N(inp.horizont) || 25)));
    const r = N(inp.diskont) / 100, g = N(inp.rustCen) / 100, deg = N(inp.degradace) / 100, op = N(inp.provozni);
    const cenaSDph = FVE.has(inp.investiceRucne) ? N(inp.investiceRucne) : R.cenik.F47;
    const dotace = inp.zapocistDotaci === 'ano' ? R.dotace.E56 : 0;
    const investice = cenaSDph - dotace;
    const roky = [];
    let kum = -investice, kumD = -investice, navrat = null, navratD = null;
    const cf = [-investice];
    for (let t = 1; t <= H; t++) {
      const f = Math.pow(1 + g, t - 1) * Math.pow(1 - deg, t - 1);
      const uspora = pr.usporaNakup * f, vynos = pr.vynosPretoky * f, cist = uspora + vynos - op;
      const disk = cist / Math.pow(1 + r, t);
      const pk = kum, pkd = kumD; kum += cist; kumD += disk;
      if (navrat == null && kum >= 0 && cist > 0) navrat = t - 1 + (-pk) / cist;
      if (navratD == null && kumD >= 0 && disk > 0) navratD = t - 1 + (-pkd) / disk;
      cf.push(cist);
      roky.push({ t, uspora, vynos, provozni: op, cist, kum, kumD });
    }
    const prvni = pr.usporaNakup + pr.vynosPretoky - op;
    const npv = cf.reduce((a, c, t) => a + c / Math.pow(1 + r, t), 0);
    return {
      ...pr, horizont: H, cenaSDph, dotace, investice, provozni: op, rocniCisty: prvni,
      prostaNavratnost: prvni > 0 ? investice / prvni : null,
      navratnostZCashflow: navrat, diskontovanaNavratnost: navratD, npv, irr: irr(cf), roky,
      predpoklady: { diskont: r, rustCen: g, degradace: deg },
    };
  }
  root.FVEEKO = { vyhodnot, irr };
})(typeof window !== 'undefined' ? window : globalThis);
