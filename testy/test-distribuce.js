/* Porovná výpočet ceny elektřiny podle sazby s listem „Cena zajišťování distribuce NN“ (Distribuce_2026_verze_1.xlsm). Spuštění: node testy/test-distribuce.js */
globalThis.window=globalThis;require('../js/distribuce-2026.js');require('../js/distribuce.js');
const t=require('./referencni-distribuce-excel.json').filter(x=>x.sazba!=='sazba');let bad=0;
for(const x of t){const mwh=x.vt+x.nt;const r=FVEDIST.spocti({dist:x.dist,sazba:x.sazba,jistic:x.jistic,mwh,podilNT:mwh?x.nt/mwh*100:0,silVT:x.silVT,silNT:x.silNT??x.silVT,pocetOM:1});
 const ok=Math.abs(r.celkem-x.Y)<1e-6*x.Y&&Math.abs(r.naMWh.celkem-x.Z)<1e-6*x.Z; if(!ok)bad++;
 console.log(x.sazba,x.jistic,x.dist,mwh,'excel',x.Z.toFixed(2),'moje',r.naMWh.celkem.toFixed(2),ok?'OK':'ROZDÍL',r.chyby);}
console.log('rozdílů',bad);
