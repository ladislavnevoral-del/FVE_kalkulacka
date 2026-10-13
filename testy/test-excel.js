/* Porovná výpočetní jádro s hodnotami přepočtenými v Excelu (LibreOffice) pro 4 referenční domy. Spuštění: node testy/test-excel.js */
globalThis.window=globalThis;require('../js/cenik-vychozi.js');require('../js/engine.js');
const C=window.FVE_CENIK_VYCHOZI;const cases=require('./referencni-vstupy.json');const xl=require('./referencni-vysledky-excel.json');
const map={B7:'vyska',C7:'delka',D7:'sirka',K7:'vchody',J7:'rozvadecu',L7:'stoupacky',M7:'patra',N7:'rozvadece',O7:'vchodyPatra',P7:'panelyFasada',Q7:'vykonFasada',R7:'leseni',S7:'kotveni',D15:'produkt',D16:'orientace',D17:'profil',D19:'tuv',D22:'sdileni',D23:'profilSdileni',D34:'tuvNaklady',D35:'tuvM3',E35:'tuvGJ',F35:'tuvMWh',F43:'wallbox',B43:'vlastni1Nazev',D43:'vlastni1Cena',E56:'dotaceRucne'};
let bad=0;
for(const n of Object.keys(cases)){
 const inp=FVE.defaultInputs(C);
 for(const [a,v] of Object.entries(cases[n].cells)) inp[map[a]]=v;
 cases[n].units.forEach((u,i)=>Object.assign(inp.jednotky[i],u));
 const r=FVE.calc(inp,C), x=xl[n], s=r.souhrn, v=r.vysledky;
 const pairs={D9:s.D9,D11:s.D11,D12:s.D12,D26:s.D26,D27:s.D27,D28:s.D28,D29:s.D29,D30:s.D30,D31:s.D31,D38:s.D38,D39:s.D39,
  D47:r.cenik.D47,F47:r.cenik.F47,M46:r.cenik.M46,M45:r.cenik.M45,H54:r.dotace.H54,H55:r.dotace.H55,H56:r.dotace.H56,H57:r.dotace.H57,E53:r.dotace.E53,M80:r.dotace.M80,E57:r.dotace.E57,D59:r.cenik.D59,F59:r.cenik.F59,
  G15:s.G15,E16:s.E16,E17:s.E17,E5x:r.E5,
  VL39:v.vyroba,VL40:v.odberSitProdukt,VL41:v.odberSitTUV,VL42:v.odberSitSdil,VL43:v.odberFVE,VL44:v.pretokPoProduktu,VL46:v.vyuzitiTUV,VL49:v.vyuzitiSdil,VL51:v.spotrProdukt,VL52:v.spotrTUV,VL53:v.spotrSdil,VL57:v.nakladyProdukt,VL60:v.usporyProdukt,VL61:v.usporyTUV,VL62:v.usporySdil,
  VL85:v.cenaSFVEProdukt,OF26:v.podilOdberFVE,OF30:v.podilOdberSit,OF148:v.prostaNavratnost,OF139:r.cenik.kVystup.FVE,OF141:r.cenik.kVystup['PBŘ'],OF142:r.cenik.kVystup.hromosvod,OF140:r.cenik.kVystup.JOM,OF146:r.cenik.kVystup.TUV,OJ154:v.usporaDum};
 if(n!=='C'){const scen={F:['VL79','VL82'],G:['VL80','VL83'],H:['VL81','VL84'],I:['VL81','VL84']}[r.scen];pairs[scen[0]]=v.navratnostVc;pairs[scen[1]]=v.navratnostBez;}
 let cnt=0;
 for(const [k,mine] of Object.entries(pairs)){ const e=x[k]; const ev=(e===null||e===undefined||e==='')?null:+e; const mv=mine==null?null:+mine; cnt++;
   const ok=(ev===null&&(mv===null||mv===0))||(ev!==null&&mv!==null&&Math.abs(ev-mv)<=1e-6*Math.max(1,Math.abs(ev)));
   if(!ok){bad++;console.log(n,k,'excel=',e,'mine=',mine);} }
 for(const [key,[q,cost]] of Object.entries(x.items)){ const [row,a]=key.split('|'); const p=r.cenik.polozky.find(p=>a==='None'?p.nazev==='rozvaděč skříň':p.kod===a); if(!p)continue; cnt++;
   const ev=+cost||0; if(Math.abs(ev-p.nakladVar)>1e-6*Math.max(1,ev)){bad++;console.log(n,'item',row,a,'excel',q,cost,'mine',p.qtyAuto,p.nakladVar);} }
 console.log(n,'porovnáno hodnot:',cnt,'varování:',r.warn);
}
console.log('rozdílů:',bad);
process.exitCode = bad ? 1 : 0;
