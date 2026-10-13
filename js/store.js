/* =====================================================================
   Ukládání do prohlížeče (localStorage): projekty, verze ceníku, stav.
   Projekt nese vlastní kopii ceníku, se kterým byl naceněn (kap. 6.3).
   ===================================================================== */
(function (root) {
  const K_PROJ = 'fve2-projekty', K_CEN = 'fve2-ceniky', K_STAV = 'fve2-stav', K_KONCEPT = 'fve2-koncept';
  const ls = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  };
  const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const clone = o => JSON.parse(JSON.stringify(o));

  // ---- ceníky ----
  function ceniky() {
    const v = ls.get(K_CEN, null);
    if (v && Array.isArray(v.seznam) && v.seznam.length) return v;
    const zakl = clone(root.FVE_CENIK_VYCHOZI); zakl.vestaveny = true; zakl.ulozeno = null;
    return { aktivni: zakl.id, seznam: [zakl] };
  }
  function ulozCeniky(c) { return ls.set(K_CEN, c); }
  function aktivniCenik() { const c = ceniky(); return clone(c.seznam.find(x => x.id === c.aktivni) || c.seznam[0]); }
  function otiskCeniku(c) { const x = clone(c); delete x.ulozeno; delete x.vestaveny; delete x.poznamka; return JSON.stringify(x); }

  // ---- projekty ----
  function projekty() { return ls.get(K_PROJ, {}); }
  function ulozProjekt(p) {
    const all = projekty(); all[p.id] = p;
    if (!ls.set(K_PROJ, all)) return 'Prohlížeč nepovolil uložení (plné úložiště nebo soukromé okno). Zálohuj projekty do souboru a smaž staré.';
    return null;
  }
  function smazProjekt(id) { const all = projekty(); delete all[id]; ls.set(K_PROJ, all); }
  function novyProjekt(C, inputs, nazev) {
    const t = Date.now();
    const v = { id: uid('v'), nazev: 'Varianta A', inputs, rozpPotvrzeno: null };
    return { id: uid('p'), nazev: nazev || '', vytvoreno: t, upraveno: null, cenik: clone(C), varianty: [v], aktivni: v.id, log: [{ t, akce: 'Projekt založen', detail: `ceník ${C.id}` }], ulozeneVstupy: {} };
  }

  // ---- stav a koncept ----
  const stav = { get: () => ls.get(K_STAV, {}), set: s => ls.set(K_STAV, s) };
  const koncept = { get: () => ls.get(K_KONCEPT, null), set: p => ls.set(K_KONCEPT, p), clear: () => { try { localStorage.removeItem(K_KONCEPT); } catch (e) {} } };

  // ---- rozdíly vstupů pro historii změn ----
  function zplostit(o, pre = '', out = {}) {
    if (o && typeof o === 'object') { for (const k of Object.keys(o)) zplostit(o[k], pre ? pre + '.' + k : k, out); }
    else out[pre] = o == null ? '' : String(o);
    return out;
  }
  function rozdily(stare, nove) {
    const a = zplostit(stare || {}), b = zplostit(nove || {}), z = [];
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if ((a[k] ?? '') !== (b[k] ?? '')) z.push({ k, z: a[k] ?? '', na: b[k] ?? '' });
    return z;
  }

  // ---- soubory ----
  function stahni(nazev, text, typ = 'application/json') {
    const blob = new Blob([text], { type: typ }), u = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = u; a.download = nazev; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 3000);
  }
  const bezpecneJmeno = s => (s || 'projekt').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').slice(0, 60);

  root.FVESTORE = { ceniky, ulozCeniky, aktivniCenik, otiskCeniku, projekty, ulozProjekt, smazProjekt, novyProjekt, stav, koncept, rozdily, stahni, bezpecneJmeno, uid, clone };
})(window);
