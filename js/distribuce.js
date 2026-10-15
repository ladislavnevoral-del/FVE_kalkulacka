/* =====================================================================
   Cena elektřiny podle distribuční sazby (přepis listu „Cena zajišťování
   distribuce NN“ ze sešitu Distribuce_2026_verze_1.xlsm).
   Roční cena = (jistič × 12 + distribuce VT/NT + systémové služby + OTE
   + POZE + silová elektřina VT/NT) × DPH; cena za MWh = roční cena ÷ MWh.
   ===================================================================== */
(function (root) {
  const D = () => root.FVE_DISTRIBUCE;
  const N = v => (typeof FVE !== 'undefined' ? FVE.num(v) : (+String(v ?? '').replace(',', '.') || 0));

  function tarify(sazba) { const x = D().distribuce[sazba]; return x ? x.tarify : 1; }
  function jistice(sazba, dist) { const j = D().jistic[sazba] || {}; return Object.keys(j).filter(k => j[k][dist] != null); }

  /* o = { dist, sazba, jistic, mwh, podilNT (0–100 %), silVT, silNT (Kč/MWh), pocetOM, mesicu } */
  function spocti(o) {
    const d = D(), dist = o.dist, s = d.distribuce[o.sazba], j = ((d.jistic[o.sazba] || {})[o.jistic] || {})[dist];
    const chyby = [];
    if (!s) chyby.push('Neznámá sazba ' + o.sazba + '.');
    if (j == null) chyby.push(`Jistič ${o.jistic} pro sazbu ${o.sazba} u ${dist} v tabulce není.`);
    const mwh = N(o.mwh), om = Math.max(1, Math.round(N(o.pocetOM)) || 1), mes = N(o.mesicu) || 12;
    const dvaT = s && s.tarify === 2;
    const nt = dvaT ? mwh * Math.min(100, Math.max(0, N(o.podilNT))) / 100 : 0, vt = mwh - nt;
    const cVT = s ? s.vt[dist] : null, cNT = dvaT ? s.nt[dist] : 0;
    if (s && cVT == null) chyby.push(`Sazba ${o.sazba} u ${dist} v tabulce není.`);
    const silVT = N(o.silVT), silNT = dvaT ? N(o.silNT) : silVT;
    const r = {
      dvaT, vt, nt, om, mwh,
      jistic: (j || 0) * mes * om,                    // K × počet odběrných míst
      distribuce: vt * (cVT || 0) + nt * (cNT || 0),  // P (VT) + P (NT)
      sluzby: mwh * d.systemoveSluzby,                // R
      ote: d.ote * mes * om,                          // T
      poze: mwh * d.poze,                             // V
      silova: vt * silVT + nt * silNT,
      cenaVT: cVT, cenaNT: cNT, chyby,
    };
    r.distribuceCelkem = r.jistic + r.distribuce + r.sluzby + r.ote + r.poze;
    r.bezDph = r.distribuceCelkem + r.silova;
    r.celkem = r.bezDph * d.dph;                      // Y
    const m = x => mwh ? x / mwh : 0;
    r.naMWh = { silova: m(r.silova * d.dph), distribuce: m(r.distribuceCelkem * d.dph), celkem: m(r.celkem), promenna: m((r.distribuce + r.sluzby + r.poze + r.silova) * d.dph), stala: m((r.jistic + r.ote) * d.dph) };
    return r;
  }
  root.FVEDIST = { spocti, tarify, jistice };
})(typeof window !== 'undefined' ? window : globalThis);
