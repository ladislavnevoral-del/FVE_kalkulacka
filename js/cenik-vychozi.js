/* Výchozí ceník a číselníky – převzato ze sešitu „1. Klasická kalkulačka FVE – verze 02.06.2026.xlsm“ (list Ceník, Vstupní data, Výpočty).
   Pravidla množství jsou výrazy nad proměnnými projektu (viz FVE_PROMENNE v engine.js). */
window.FVE_CENIK_VYCHOZI = {
 "id": "22_05_2026",
 "nazev": "ceník FVE verze 22_05_2026",
 "rbd": "ceník 6.4",
 "zdroj": "1. Klasická kalkulačka FVE - verze 02.06.2026.xlsm",
 "parametry": {
  "koeficient": 1.632,
  "slevaFvePbr": 0.15,
  "dph": 1.12,
  "panelWp": 490,
  "vyrobaNaKwp": 0.9,
  "cenaNakupVychozi": 9000,
  "cenaVykupu": 500,
  "cenaSdileni": 9000,
  "koefBaterie": 2,
  "primySpotrebaMin": 0.5,
  "primySpotrebaMax": 0.92,
  "vyuzitiPretoku": 0.92,
  "sdileniPodilSP": 0.6,
  "sdileniPodilOstatni": 0.3,
  "prevodM3": 0.01079,
  "prevodGJ": 0.27777777777778,
  "panelyNaString": 16,
  "stringyNaTracker": 2
 },
 "baterie": {
  "bos": 5.12,
  "gbl": 4.09,
  "gblMax": 12.27,
  "hraniceGbl": 14.5,
  "delitelPodHranici": 4.833333333333333,
  "minBos": 4,
  "clankuNaBms": 12,
  "clankuVeSloupci": 12
 },
 "dotace": {
  "vykon": 15000,
  "baterie": 10000,
  "byt": 10000,
  "wallbox": 25000,
  "limitPodilCeny": 0.5,
  "kontrola": 0.85,
  "bateriePomerMin": 0.5,
  "bateriePomerMax": 1.5,
  "kwpNaByt": 0.5
 },
 "stridace": {
  "DEYE 10": {
   "panely": 28,
   "stringy": 2,
   "trackery": 1,
   "maxBaterie": 61.44,
   "sloupcuMax": 1,
   "dostupny": true
  },
  "DEYE 12": {
   "panely": 33,
   "stringy": 3,
   "trackery": 2,
   "maxBaterie": 61.44,
   "sloupcuMax": 1,
   "dostupny": true
  },
  "DEYE 20": {
   "panely": 56,
   "stringy": 4,
   "trackery": 2,
   "maxBaterie": 61.44,
   "sloupcuMax": 1,
   "dostupny": true
  },
  "DEYE 30": {
   "panely": 84,
   "stringy": 6,
   "trackery": 3,
   "maxBaterie": 122.88,
   "sloupcuMax": 2,
   "dostupny": true
  },
  "DEYE 40": {
   "panely": 113,
   "stringy": 8,
   "trackery": 4,
   "maxBaterie": 122.88,
   "sloupcuMax": 2,
   "dostupny": false
  },
  "DEYE 50": {
   "panely": 141,
   "stringy": 8,
   "trackery": 4,
   "maxBaterie": 122.88,
   "sloupcuMax": 2,
   "dostupny": true
  }
 },
 "podilVyroby": [
  0.028169014084507043,
  0.04753521126760563,
  0.0747464788732394,
  0.11971830985915492,
  0.131239436619718,
  0.125,
  0.12852112676056338,
  0.11971830985915492,
  0.09683098591549295,
  0.06690140845070422,
  0.03169014084507042,
  0.02992957746478873
 ],
 "profily": {
  "běžný": [
   1.1,
   1.1,
   1.05,
   0.95,
   0.9,
   0.9,
   0.9,
   0.9,
   0.95,
   1.05,
   1.1,
   1.1
  ],
  "TČ/el. topení": [
   1.8,
   1.5,
   1.3,
   1,
   0.6,
   0.24,
   0.23,
   0.23,
   0.8,
   1.2,
   1.4,
   1.7
  ],
  "TUV": [
   1,
   1,
   1,
   1,
   1,
   1,
   1,
   1,
   1,
   1,
   1,
   1
  ]
 },
 "model": {
  "zemepisnaSirka": 49.4,
  "vyrobaOptimalniBrutto": 1180,
  "ztratyVychozi": 14,
  "mesicniKt": [
   0.33,
   0.38,
   0.43,
   0.46,
   0.48,
   0.5,
   0.5,
   0.5,
   0.46,
   0.4,
   0.32,
   0.29
  ],
  "albedo": 0.2
 },
 "kontakty": {
  "top": [
   [
    "Bc. Jakub Král",
    "725260939",
    "jakub.kral@ippolna.cz"
   ],
   [
    "Daniel Králík",
    "725260979",
    "daniel.kralik@ippolna.cz"
   ],
   [
    "Jakub Zeman",
    "725260953",
    "jakub.zeman@ippolna.cz"
   ],
   [
    "Jan Hanzal",
    "725260973",
    "jan.hanzal@ippolna.cz"
   ],
   [
    "Jan Keclík",
    "725260937",
    "jan.keclik@ippolna.cz"
   ],
   [
    "Jan Kudrna",
    "725260902",
    "jan.kudrna@ippolna.cz"
   ],
   [
    "Jan Pavlík",
    "725260982",
    "jan.pavlik@ippolna.cz"
   ],
   [
    "Jaroslav Esterka",
    "725260989",
    "jaroslav.esterka@ippolna.cz"
   ],
   [
    "Jiří Holý, DiS.",
    "725260922",
    "jiri.holy@ippolna.cz"
   ],
   [
    "Josef Chadraba",
    "725260885",
    "josef.chadraba@ippolna.cz"
   ],
   [
    "Ladislav Nevoral",
    "725260916",
    "ladislav.nevoral@ippolna.cz"
   ],
   [
    "Leoš Štryncl",
    "725260956",
    "leos.stryncl@ippolna.cz"
   ],
   [
    "Lukáš Apfelthaler",
    "777760209",
    "lukas.apfelthaler@ippolna.cz"
   ],
   [
    "Lukáš Hilpert",
    "725260899",
    "lukas.hilpert@ippolna.cz"
   ],
   [
    "Marek Novák",
    "725260942",
    "marek.novak@ippolna.cz"
   ],
   [
    "Marek Přikryl",
    "725260912",
    "marek.prikryl@ippolna.cz"
   ],
   [
    "Mgr. David Hájek",
    "725260968",
    "david.hajek@ippolna.cz"
   ],
   [
    "Michal Smolík",
    "725260978",
    "michal.smolik@ippolna.cz"
   ],
   [
    "Michal Sodomka",
    "725260913",
    "michal.sodomka@ippolna.cz"
   ],
   [
    "Ondřej Kupský",
    "725260999",
    "ondrej.kupsky@ippolna.cz"
   ],
   [
    "Pavel Pánek",
    "725260909",
    "pavel.panek@ippolna.cz"
   ],
   [
    "Petr Militký",
    "725260914",
    "petr.militky@ippolna.cz"
   ],
   [
    "Radim Rzyman",
    "725260890",
    "radim.rzyman@ippolna.cz"
   ],
   [
    "Robin Hanák",
    "725260959",
    "robin.hanak@ippolna.cz"
   ],
   [
    "Roman Novotný",
    "725260977",
    "roman.novotny@ippolna.cz"
   ],
   [
    "Rostislav Truhlář",
    "725260990",
    "rostislav.truhlar@ippolna.cz"
   ]
  ],
  "pripravari": [
   "Čaloud",
   "Dvořáková",
   "Jechníček",
   "Křivan",
   "Smejkal",
   "Šumpich",
   "Vaněk",
   "Vlk"
  ]
 },
 "polozky": [
  {
   "id": "1",
   "kod": "1",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "konstrukce plochá VZ střecha 15°",
   "mj": "ks",
   "cena": 1900,
   "mnozstvi": "panely - panelyFasada",
   "varianty": "1..1..1.."
  },
  {
   "id": "2",
   "kod": "2",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "konstrukce plochá J střecha 15°",
   "mj": "ks",
   "cena": 2100,
   "mnozstvi": "panely - panelyFasada",
   "varianty": ".1..1..1."
  },
  {
   "id": "3",
   "kod": "3",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "přitížení plochá střecha",
   "mj": "ks",
   "cena": 400,
   "mnozstvi": "(kotveni == 'přitížení dlažbou' ? panely : 0) - panelyFasada",
   "varianty": "11.11.11."
  },
  {
   "id": "4",
   "kod": "4",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "fix profil",
   "mj": "bm",
   "cena": 436,
   "mnozstvi": "kotveni == 'fix profily' ? panely : 0",
   "varianty": "11.11.11."
  },
  {
   "id": "5",
   "kod": "5",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "kladečský plán fixprofilu",
   "mj": "projekt",
   "cena": 9000,
   "mnozstvi": "kotveni == 'fix profily' ? 1 : 0",
   "varianty": "11.11.11."
  },
  {
   "id": "6",
   "kod": "6",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "montáž fix profilu",
   "mj": "ks",
   "cena": 870,
   "mnozstvi": "kotveni == 'fix profily' ? panely : 0",
   "varianty": "11.11.11."
  },
  {
   "id": "7",
   "kod": "7",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "solatech",
   "mj": "ks",
   "cena": 1319,
   "mnozstvi": "kotveni == 'solatech' ? panely * 2.6 : 0",
   "varianty": "11.11.11."
  },
  {
   "id": "8",
   "kod": "8",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "montáž solatech",
   "mj": "ks",
   "cena": 1280,
   "mnozstvi": "kotveni == 'solatech' ? panely * 2.6 : 0",
   "varianty": "11.11.11."
  },
  {
   "id": "9",
   "kod": "9",
   "typ": "FVE",
   "kat": "plochá střecha",
   "nazev": "montáž plochá střecha (včetně výškové techniky a práce)",
   "mj": "kWp",
   "cena": 5300,
   "mnozstvi": "kwp - vykonFasada",
   "varianty": "11.11.11."
  },
  {
   "id": "10",
   "kod": "10",
   "typ": "FVE",
   "kat": "šikmá střecha",
   "nazev": "konstrukce šikmé střechy jedna rovina",
   "mj": "ks",
   "cena": 1700,
   "mnozstvi": "panely - panelyFasada",
   "varianty": "..1..1..1"
  },
  {
   "id": "11",
   "kod": "11",
   "typ": "FVE",
   "kat": "šikmá střecha",
   "nazev": "montáž šikmá střecha (včetně výškové techniky a práce)",
   "mj": "kWp",
   "cena": 5300,
   "mnozstvi": "kwp - vykonFasada",
   "varianty": "..1..1..1"
  },
  {
   "id": "12",
   "kod": "12",
   "typ": "FVE",
   "kat": "fasáda",
   "nazev": "konstrukce fasády",
   "mj": "ks",
   "cena": 6840,
   "mnozstvi": "panelyFasada",
   "varianty": "111111111"
  },
  {
   "id": "13",
   "kod": "13",
   "typ": "FVE",
   "kat": "fasáda",
   "nazev": "montáž fasáda (včetně výškové techniky a práce)",
   "mj": "kWp",
   "cena": 3800,
   "mnozstvi": "vykonFasada",
   "varianty": "111111111"
  },
  {
   "id": "14",
   "kod": "14",
   "typ": "FVE",
   "kat": "fasáda",
   "nazev": "lešení fasáda",
   "mj": "m2",
   "cena": 996,
   "mnozstvi": "leseni",
   "varianty": "111111111"
  },
  {
   "id": "15",
   "kod": "15",
   "typ": "FVE",
   "kat": "panel",
   "nazev": "panel AIKO-A490-MAH-54 DW 2P+  490 Wp",
   "mj": "ks",
   "cena": 2352,
   "mnozstvi": "panely",
   "varianty": "111111111"
  },
  {
   "id": "16",
   "kod": "16",
   "typ": "FVE",
   "kat": "vedení střecha",
   "nazev": "kabelový žlab víko",
   "mj": "bm",
   "cena": 680,
   "mnozstvi": "delka + sirka",
   "varianty": "111111111"
  },
  {
   "id": "17",
   "kod": "17",
   "typ": "FVE",
   "kat": "vedení střecha",
   "nazev": "kabelový žlab: 20 % délky  120/50 + 80 % délky 50/62",
   "mj": "bm",
   "cena": 380,
   "mnozstvi": "delka + sirka",
   "varianty": "111111111"
  },
  {
   "id": "18",
   "kod": "18",
   "typ": "FVE",
   "kat": "rozvaděč střecha",
   "nazev": "montáž rozvaděče DC na střeše",
   "mj": "ks",
   "cena": 10000,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "19",
   "kod": "19",
   "typ": "FVE",
   "kat": "rozvaděč střecha",
   "nazev": "konstrukce pro rozvaděč - střecha",
   "mj": "ks",
   "cena": 5775,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "20",
   "kod": "20",
   "typ": "FVE",
   "kat": "rozvaděč střecha",
   "nazev": "rozvaděč R-DC dle ČSN",
   "mj": "kWp",
   "cena": 2000,
   "mnozstvi": "kwp",
   "varianty": "111111111"
  },
  {
   "id": "x20",
   "kod": "",
   "typ": "FVE",
   "kat": "rozvaděč střecha",
   "nazev": "rozvaděč skříň",
   "mj": "ks",
   "cena": 10500,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "21",
   "kod": "21",
   "typ": "hromosvod",
   "kat": "zemnění panelů",
   "nazev": "zemnění od panelů pospojení s hromosvodem ALMgSi",
   "mj": "ks",
   "cena": 150,
   "mnozstvi": "panely",
   "varianty": "111111111"
  },
  {
   "id": "22",
   "kod": "22",
   "typ": "hromosvod",
   "kat": "zemnění panelů",
   "nazev": "zemnění mění - propojení konstrukce (panely) CYA 16",
   "mj": "ks",
   "cena": 50,
   "mnozstvi": "panely",
   "varianty": "........."
  },
  {
   "id": "23",
   "kod": "23",
   "typ": "hromosvod",
   "kat": "hromosvod",
   "nazev": "úprava hromosvodu",
   "mj": "kplt",
   "cena": 50000,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "24",
   "kod": "24",
   "typ": "FVE",
   "kat": "DC vedení",
   "nazev": "DC vodič D 6 mm string",
   "mj": "bm",
   "cena": 28,
   "mnozstvi": "(vyska + delka * 2 + sirka) * stringy * 2",
   "varianty": "111111111"
  },
  {
   "id": "25",
   "kod": "25",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "svod = DC vodič ( počet stringu) ; cyky 3x 1,5 ; uv chránička 63/110 ; úvazek čerpadla ; svod trubka + kotvení",
   "mj": "bm",
   "cena": 775,
   "mnozstvi": "vyska",
   "varianty": "111111111"
  },
  {
   "id": "26",
   "kod": "26",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "cyky 3x1,5",
   "mj": "bm",
   "cena": 25,
   "mnozstvi": "1.5 * vyska",
   "varianty": "111111111"
  },
  {
   "id": "27",
   "kod": "27",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "zemnění k rozvaděči CYA 16",
   "mj": "bm",
   "cena": 55,
   "mnozstvi": "1.5 * vyska",
   "varianty": "111111111"
  },
  {
   "id": "28",
   "kod": "28",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "montáž svod (včetně výškové techniky a práce) - výška budovy",
   "mj": "bm",
   "cena": 1000,
   "mnozstvi": "vyska",
   "varianty": "111111111"
  },
  {
   "id": "29",
   "kod": "29",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "jádrové vrtání - obvodová stěna",
   "mj": "ks",
   "cena": 2500,
   "mnozstvi": "jadroveVrtani",
   "varianty": "111111111"
  },
  {
   "id": "30",
   "kod": "30",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "svod okap trubka",
   "mj": "bm",
   "cena": 0,
   "mnozstvi": "vyska",
   "varianty": "........."
  },
  {
   "id": "31",
   "kod": "31",
   "typ": "FVE",
   "kat": "svod",
   "nazev": "žlab ve fasádě",
   "mj": "bm",
   "cena": 0,
   "mnozstvi": "vyska",
   "varianty": "........."
  },
  {
   "id": "32",
   "kod": "32",
   "typ": "FVE",
   "kat": "technická místnost",
   "nazev": "rozvaděč R-FVE-DC dle ČSN",
   "mj": "kWp",
   "cena": 1500,
   "mnozstvi": "kwp",
   "varianty": "111111111"
  },
  {
   "id": "33",
   "kod": "33",
   "typ": "FVE",
   "kat": "technická místnost",
   "nazev": "R-FVE-AC rozvaděč střídače + rozpad bod (na kW),  dle ČSN (plechová bedna)",
   "mj": "kWp",
   "cena": 1400,
   "mnozstvi": "kwp",
   "varianty": "111111111"
  },
  {
   "id": "34",
   "kod": "34",
   "typ": "FVE",
   "kat": "technická místnost",
   "nazev": "montáž technologie",
   "mj": "ks",
   "cena": 60000,
   "mnozstvi": "jom",
   "varianty": "111111111"
  },
  {
   "id": "35",
   "kod": "35",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 10 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 36362.718,
   "mnozstvi": "deye10",
   "varianty": "111111111"
  },
  {
   "id": "36",
   "kod": "36",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 12 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 39747.666,
   "mnozstvi": "deye12",
   "varianty": "111111111"
  },
  {
   "id": "37",
   "kod": "37",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 20 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 56919.681,
   "mnozstvi": "deye20",
   "varianty": "111111111"
  },
  {
   "id": "38",
   "kod": "38",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 30 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 102844.0665,
   "mnozstvi": "deye30",
   "varianty": "111111111"
  },
  {
   "id": "39",
   "kod": "39",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 40 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 121209.081,
   "mnozstvi": "deye40",
   "varianty": "111111111"
  },
  {
   "id": "40",
   "kod": "40",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Deye 50 - Hybrid HV Inverter - střídač",
   "mj": "ks",
   "cena": 135901.0905,
   "mnozstvi": "deye50",
   "varianty": "111111111"
  },
  {
   "id": "41",
   "kod": "41",
   "typ": "FVE",
   "kat": "střídač",
   "nazev": "Energy Meter",
   "mj": "ks",
   "cena": 2656,
   "mnozstvi": "stridaceCelkem",
   "varianty": "111111111"
  },
  {
   "id": "42",
   "kod": "42",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye HV Battery BOS-G-PACK 5.1 - počet článků baterií",
   "mj": "ks",
   "cena": 31000,
   "mnozstvi": "stridaceCelkem > 0 ? batBos : 0",
   "varianty": "111111111"
  },
  {
   "id": "43",
   "kod": "43",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye HV Control Box BOS-G-PDU-2 - BMS",
   "mj": "ks",
   "cena": 17000,
   "mnozstvi": "stridaceCelkem > 0 ? bmsBos : 0",
   "varianty": "111111111"
  },
  {
   "id": "44",
   "kod": "44",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye HV-Rack for BOS-G (9 nebo 13 layers) - box na baterie",
   "mj": "ks",
   "cena": 5389.314,
   "mnozstvi": "stridaceCelkem > 0 ? sloupceBos : 0",
   "varianty": "111111111"
  },
  {
   "id": "45",
   "kod": "45",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye HV Battery GB-L - počet článků baterií",
   "mj": "ks",
   "cena": 26714.5515,
   "mnozstvi": "batGbl",
   "varianty": "111111111"
  },
  {
   "id": "46",
   "kod": "46",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye HV Control Box GB-LB + Base - BMS",
   "mj": "ks",
   "cena": 16383.255,
   "mnozstvi": "bmsGbl",
   "varianty": "111111111"
  },
  {
   "id": "47",
   "kod": "47",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye - BOS-G EP Cable  5.0",
   "mj": "kplt",
   "cena": 1e-8,
   "mnozstvi": "batBos > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "48",
   "kod": "48",
   "typ": "FVE",
   "kat": "baterie",
   "nazev": "Deye - BOS-G EN Cable  5.0",
   "mj": "kplt",
   "cena": 1e-8,
   "mnozstvi": "batBos > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "49",
   "kod": "49",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "sněhový hasící přístroj s minimální hasící schopností 55B",
   "mj": "ks",
   "cena": 1200,
   "mnozstvi": "mistnostiTech > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "50",
   "kod": "50",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "dveře do místnosti s technologií FVE, s požární odolností min. El 30 DP3",
   "mj": "ks",
   "cena": 35000,
   "mnozstvi": "mistnostiTech > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "51",
   "kod": "51",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "požární ucpávky",
   "mj": "ks",
   "cena": 14000,
   "mnozstvi": "mistnostiTech > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "52",
   "kod": "52",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "protipožární hasicí koule Fireball",
   "mj": "ks",
   "cena": 386,
   "mnozstvi": "mistnostiTech > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "53",
   "kod": "53",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "požarní prostup roxtex",
   "mj": "ks",
   "cena": 9000,
   "mnozstvi": "mistnostiTech > 0 ? 1 : 0",
   "varianty": "111111111"
  },
  {
   "id": "54",
   "kod": "54",
   "typ": "PBŘ",
   "kat": "PBŘ",
   "nazev": "stop tačítko, montáž, vedení",
   "mj": "vchod",
   "cena": 2300,
   "mnozstvi": "vchody",
   "varianty": "111111111"
  },
  {
   "id": "55",
   "kod": "55",
   "typ": "JOM",
   "kat": "Rozvaděč byt nový jistič bytu, včetně vedení",
   "nazev": "rozvaděč podružný bytový ",
   "mj": "byt",
   "cena": 5000,
   "mnozstvi": "rozvadece == 'ano' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "56",
   "kod": "56",
   "typ": "JOM",
   "kat": "Rozvaděč byt nový jistič bytu, včetně vedení",
   "nazev": "montáž podružný rozvaděču",
   "mj": "byt",
   "cena": 1800,
   "mnozstvi": "rozvadece == 'ano' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "57",
   "kod": "57",
   "typ": "JOM",
   "kat": "Rozvaděč byt nový jistič bytu, včetně vedení",
   "nazev": " výměna svorkovnice bytu",
   "mj": "byt",
   "cena": 400,
   "mnozstvi": "rozvadece == 'ano' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "58",
   "kod": "58",
   "typ": "JOM",
   "kat": "Rozvaděč byt nový jistič bytu, včetně vedení",
   "nazev": "výměna stoupačkové svorkovnice",
   "mj": "počet pater",
   "cena": 1620,
   "mnozstvi": "rozvadece == 'ano' ? vchodyPatra : 0",
   "varianty": "111......"
  },
  {
   "id": "59",
   "kod": "59",
   "typ": "JOM",
   "kat": "Rozvaděč byt nový jistič bytu, včetně vedení",
   "nazev": "datový kabel  UTP pro podružné elektroměry",
   "mj": "bm",
   "cena": 20,
   "mnozstvi": "rozvadece == 'ano' ? (vyska + sirka) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "60",
   "kod": "60",
   "typ": "JOM",
   "kat": "ELM byt  pro nové rozvody",
   "nazev": "elektroměr spodní vývody",
   "mj": "byt",
   "cena": 3300,
   "mnozstvi": "rozvadece == 'ne' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "61",
   "kod": "61",
   "typ": "JOM",
   "kat": "ELM byt  pro nové rozvody",
   "nazev": "kryt jističe",
   "mj": "byt",
   "cena": 170,
   "mnozstvi": "rozvadece == 'ne' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "62",
   "kod": "62",
   "typ": "JOM",
   "kat": "ELM byt  pro nové rozvody",
   "nazev": "montáž ",
   "mj": "byt",
   "cena": 1000,
   "mnozstvi": "rozvadece == 'ne' ? bytySpol : 0",
   "varianty": "111......"
  },
  {
   "id": "63",
   "kod": "63",
   "typ": "JOM",
   "kat": "ELM byt  pro nové rozvody",
   "nazev": "datový kabel  UTP pro podružné elektroměry",
   "mj": "bm",
   "cena": 20,
   "mnozstvi": "rozvadece == 'ne' ? (vyska + sirka) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "64",
   "kod": "64",
   "typ": "Rekonstrukce rozvodů",
   "kat": "statní model",
   "nazev": "úprava rozvaděče pro státní model, měření B ",
   "mj": "ks",
   "cena": 40000,
   "mnozstvi": "sdileni == 'ano' ? rozvadecu : ((produkt == 'Spol. prostory bez baterie' || produkt == 'Spol. prostory') ? 1 : 0)",
   "varianty": "........."
  },
  {
   "id": "65",
   "kod": "65",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení HDS - JOM AYKY 4x95 - 5 bm (materiál)",
   "mj": "JOM",
   "cena": 2800,
   "mnozstvi": "jom",
   "varianty": "111......"
  },
  {
   "id": "66",
   "kod": "66",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "trasa HDS - JOM - 5 bm (práce)",
   "mj": "JOM",
   "cena": 6000,
   "mnozstvi": "jom",
   "varianty": "111......"
  },
  {
   "id": "67",
   "kod": "67",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení FVE AYKY 4x50 (propojení FVE a JOM) + FTP CAT 5 + 5x1,5 CYKY J + UTP",
   "mj": "bm",
   "cena": 280,
   "mnozstvi": "delka * jom",
   "varianty": "111111111"
  },
  {
   "id": "68",
   "kod": "68",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení JOM-FVE trasa",
   "mj": "bm",
   "cena": 780,
   "mnozstvi": "delka * jom",
   "varianty": "111111111"
  },
  {
   "id": "69",
   "kod": "69",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "vedení AC kabel H07RN-F 5Gx25",
   "mj": "bm",
   "cena": 775,
   "mnozstvi": "5 * jom",
   "varianty": "111111111"
  },
  {
   "id": "70",
   "kod": "70",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení HDV1 AYKY 4x25 (propojení HDV vchodu JOM) + FTP CAT 5 + 5x1,5 CYKY J + UTP (materiál)",
   "mj": "bm",
   "cena": 250,
   "mnozstvi": "vchoduNaJom >= 1 ? sirka * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "71",
   "kod": "71",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení JOM-HDV1  trasa (práce)",
   "mj": "bm",
   "cena": 780,
   "mnozstvi": "vchoduNaJom >= 1 ? sirka * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "72",
   "kod": "72",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení HDV2 AYKY 4x25 (propojení HDV vchodu JOM) + FTP CAT 5 + 5x1,5 CYKY J + UTP (materiál)",
   "mj": "bm",
   "cena": 250,
   "mnozstvi": "vchoduNaJom >= 2 ? ((delka / vchody / jom) * 2 + sirka) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "73",
   "kod": "73",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení JOM-HDV2 trasa (práce)",
   "mj": "bm",
   "cena": 780,
   "mnozstvi": "vchoduNaJom >= 2 ? ((delka / vchody / jom) * 2) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "74",
   "kod": "74",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení HDV3 AYKY 4x25 (propojení HDV vchodu JOM) + FTP CAT 5 + 5x1,5 CYKY J + UTP (materiál)",
   "mj": "bm",
   "cena": 250,
   "mnozstvi": "vchoduNaJom >= 3 ? ((delka / vchody / jom) * 3 + sirka) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "75",
   "kod": "75",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení JOM-HDV3 trasa (práce)",
   "mj": "bm",
   "cena": 780,
   "mnozstvi": "vchoduNaJom >= 3 ? (delka / vchody / jom) : 0",
   "varianty": "111......"
  },
  {
   "id": "76",
   "kod": "76",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení HDV4 AYKY 4x25 (propojení HDV vchodu JOM) + FTP CAT 5 + 5x1,5 CYKY J + UTP (materiál)",
   "mj": "bm",
   "cena": 250,
   "mnozstvi": "vchoduNaJom >= 4 ? ((delka / vchody / jom) * 4 + sirka) * jom : 0",
   "varianty": "111......"
  },
  {
   "id": "77",
   "kod": "77",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "propojení JOM-HDV4 trasa (práce)",
   "mj": "bm",
   "cena": 780,
   "mnozstvi": "vchoduNaJom >= 4 ? (delka / vchody / jom) : 0",
   "varianty": "111......"
  },
  {
   "id": "78",
   "kod": "78",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "průraz - vnitřní stěny",
   "mj": "ks",
   "cena": 200,
   "mnozstvi": "jom * 4",
   "varianty": "111111111"
  },
  {
   "id": "79",
   "kod": "79",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "stoupačkové vedení do AYKY 4x50, do 5 m / patro",
   "mj": "bm",
   "cena": 1000,
   "mnozstvi": "stoupacky == 'ano' ? patra * 5 : 0",
   "varianty": "111......"
  },
  {
   "id": "80",
   "kod": "80",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "montáž stoupačkového vedení do AYKY 4x50 ",
   "mj": "patro",
   "cena": 1200,
   "mnozstvi": "stoupacky == 'ano' ? patra : 0",
   "varianty": "111......"
  },
  {
   "id": "81",
   "kod": "81",
   "typ": "JOM",
   "kat": "JOM vedení propoj stoupaček",
   "nazev": "demontáž staré elektroinstalace",
   "mj": "bm",
   "cena": 100,
   "mnozstvi": "stoupacky == 'ano' ? patra * 5 : 0",
   "varianty": "111......"
  },
  {
   "id": "82",
   "kod": "82",
   "typ": "JOM",
   "kat": "JOM rozvaděč",
   "nazev": "JOM rozvaděč, dle ČSN, PPDS",
   "mj": "JOM",
   "cena": 65000,
   "mnozstvi": "jom",
   "varianty": "111......"
  },
  {
   "id": "83",
   "kod": "83",
   "typ": "JOM",
   "kat": "JOM rozvaděč",
   "nazev": "montáž JOM",
   "mj": "ks",
   "cena": 20000,
   "mnozstvi": "jom",
   "varianty": "111......"
  },
  {
   "id": "84",
   "kod": "84",
   "typ": "JOM",
   "kat": "separatista",
   "nazev": "separatista paušál",
   "mj": "bj",
   "cena": 560,
   "mnozstvi": "bj",
   "varianty": "111......"
  },
  {
   "id": "85",
   "kod": "85",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby Chytrá zásuvka ",
   "mj": "bj",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? bj : 0",
   "varianty": "111111111"
  },
  {
   "id": "86",
   "kod": "86",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby Brána",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? jom : 0",
   "varianty": "111111111"
  },
  {
   "id": "87",
   "kod": "87",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby Relé",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? 5 : 0",
   "varianty": "111111111"
  },
  {
   "id": "88",
   "kod": "88",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby detektor kouře",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? jom : 0",
   "varianty": "111111111"
  },
  {
   "id": "89",
   "kod": "89",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby spuštění ",
   "mj": "byt",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? bj : 0",
   "varianty": "111111111"
  },
  {
   "id": "90",
   "kod": "90",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby zřízení přístupů",
   "mj": "byt",
   "cena": 0,
   "mnozstvi": "(produkt == 'JOM' || sdileni == 'ano') ? bj : 0",
   "varianty": "111111111"
  },
  {
   "id": "91",
   "kod": "91",
   "typ": "Chytré řízení přetoků",
   "kat": "optimalizace",
   "nazev": "optimalizace spotřeby Opakovač",
   "mj": "",
   "cena": 0,
   "mnozstvi": null,
   "varianty": "........."
  },
  {
   "id": "92",
   "kod": "92",
   "typ": "Nabíječka",
   "kat": "nabíječka",
   "nazev": "wallbox",
   "mj": "ks",
   "cena": 75000,
   "mnozstvi": "wallbox",
   "varianty": "111111111"
  },
  {
   "id": "93",
   "kod": "93",
   "typ": "JOM",
   "kat": "revize",
   "nazev": "revize JOM",
   "mj": "JOM",
   "cena": 3640,
   "mnozstvi": "jom",
   "varianty": "111......"
  },
  {
   "id": "94",
   "kod": "94",
   "typ": "FVE",
   "kat": "revize",
   "nazev": "revize FVE",
   "mj": "JOM",
   "cena": 19760,
   "mnozstvi": "jom",
   "varianty": "111111111"
  },
  {
   "id": "95",
   "kod": "95",
   "typ": "JOM",
   "kat": "revize",
   "nazev": "revize HDV",
   "mj": "ks",
   "cena": 11600,
   "mnozstvi": "1",
   "varianty": "111......"
  },
  {
   "id": "96",
   "kod": "96",
   "typ": "hromosvod",
   "kat": "revize",
   "nazev": "revize hromosvodu",
   "mj": "ks",
   "cena": 6300,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "97",
   "kod": "97",
   "typ": "FVE",
   "kat": "revize",
   "nazev": "servisní prohlídka",
   "mj": "ks",
   "cena": 13000,
   "mnozstvi": "1",
   "varianty": "........."
  },
  {
   "id": "98",
   "kod": "98",
   "typ": "FVE",
   "kat": "it",
   "nazev": "spuštění, nastavení systému FVE",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "99",
   "kod": "99",
   "typ": "JOM",
   "kat": "it",
   "nazev": "zřízení řístupupových údaju a nastavení app odečty",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111......"
  },
  {
   "id": "100",
   "kod": "100",
   "typ": "FVE",
   "kat": "it",
   "nazev": "spuštění, nastavení systému",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "11111111."
  },
  {
   "id": "101",
   "kod": "101",
   "typ": "JOM",
   "kat": "it",
   "nazev": "servis app",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111......"
  },
  {
   "id": "102",
   "kod": "102",
   "typ": "FVE",
   "kat": "administrativa",
   "nazev": "projekt FVE",
   "mj": "kplt",
   "cena": 76593.1372549,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "103",
   "kod": "103",
   "typ": "FVE",
   "kat": "administrativa",
   "nazev": "administrace NZÚ",
   "mj": "kplt",
   "cena": 22977.94117647,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "104",
   "kod": "104",
   "typ": "JOM",
   "kat": "administrativa",
   "nazev": "administrace JOM",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111......"
  },
  {
   "id": "105",
   "kod": "105",
   "typ": "FVE",
   "kat": "administrativa",
   "nazev": "administrace FVE",
   "mj": "ks",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "106",
   "kod": "106",
   "typ": "FVE",
   "kat": "management zakázky",
   "nazev": "zřízení staveniště",
   "mj": "kplt",
   "cena": 0,
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "107",
   "kod": "107",
   "typ": "Ostatní",
   "kat": "vlastní položky",
   "nazev": "@vlastni1",
   "mj": "kplt",
   "cena": "@vlastni1",
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "108",
   "kod": "108",
   "typ": "Ostatní",
   "kat": "vlastní položky",
   "nazev": "@vlastni2",
   "mj": "kplt",
   "cena": "@vlastni2",
   "mnozstvi": "1",
   "varianty": "111111111"
  },
  {
   "id": "109",
   "kod": "109",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 750 litrů instalaterská část",
   "mj": "ks",
   "cena": 142000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 2.2 && pretokTUV >= 0) ? 1 : 0",
   "varianty": "111111...",
   "litry": 750,
   "kusy": 1
  },
  {
   "id": "110",
   "kod": "110",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 750 litrů Elektro část s WATTROUTEREM na počet jomek",
   "mj": "JOM",
   "cena": 37000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 2.2 && pretokTUV >= 0) ? jom : 0",
   "varianty": "111111..."
  },
  {
   "id": "111",
   "kod": "111",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 750 litrů Elektro část na střídač ",
   "mj": "JOM",
   "cena": 18650,
   "mnozstvi": null,
   "varianty": "111111..."
  },
  {
   "id": "112",
   "kod": "112",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 1 500 litrů",
   "mj": "ks",
   "cena": 264000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 4.4 && pretokTUV > 2.2) ? 1 : 0",
   "varianty": "111111...",
   "litry": 1500,
   "kusy": 2
  },
  {
   "id": "113",
   "kod": "113",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 1500 litrů Elektro část s WATTROUTEREM",
   "mj": "JOM",
   "cena": 52000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 4.4 && pretokTUV > 2.2) ? jom : 0",
   "varianty": "111111..."
  },
  {
   "id": "114",
   "kod": "114",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 1500 litrů Elektro část na střídač",
   "mj": "JOM",
   "cena": 32720,
   "mnozstvi": null,
   "varianty": "111111..."
  },
  {
   "id": "115",
   "kod": "115",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 2250 litrů instalaterská část",
   "mj": "ks",
   "cena": 386000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 6.6 && pretokTUV > 4.4) ? 1 : 0",
   "varianty": "111111...",
   "litry": 2250,
   "kusy": 3
  },
  {
   "id": "116",
   "kod": "116",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 2250 litrů Elektro část s WATTROUTEREM",
   "mj": "JOM",
   "cena": 67000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 6.6 && pretokTUV > 4.4) ? jom : 0",
   "varianty": "111111..."
  },
  {
   "id": "117",
   "kod": "117",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 2250 litrů Elektro část na střídač",
   "mj": "JOM",
   "cena": 46790,
   "mnozstvi": null,
   "varianty": "111111..."
  },
  {
   "id": "118",
   "kod": "118",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3000 litrů instalaterská část",
   "mj": "ks",
   "cena": 508000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 8.8 && pretokTUV > 6.6) ? 1 : 0",
   "varianty": "111111...",
   "litry": 3000,
   "kusy": 4
  },
  {
   "id": "119",
   "kod": "119",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3000 litrů Elektro část s WATTROUTEREM",
   "mj": "JOM",
   "cena": 82000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV <= 8.8 && pretokTUV > 6.6) ? jom : 0",
   "varianty": "111111..."
  },
  {
   "id": "120",
   "kod": "120",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3000 litrů Elektro část na střídač",
   "mj": "JOM",
   "cena": 60860,
   "mnozstvi": null,
   "varianty": "111111..."
  },
  {
   "id": "121",
   "kod": "121",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3750 litrů instalaterská část",
   "mj": "ks",
   "cena": 630000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV > 8.8) ? 1 : 0",
   "varianty": "111111...",
   "litry": 3750,
   "kusy": 5
  },
  {
   "id": "122",
   "kod": "122",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3750 litrů Elektro část s WATTROUTEREM",
   "mj": "JOM",
   "cena": 97000,
   "mnozstvi": "(tuv == 'ano' && pretokTUV > 8.8) ? jom : 0",
   "varianty": "111111..."
  },
  {
   "id": "123",
   "kod": "123",
   "typ": "TUV",
   "kat": "TUV",
   "nazev": "TUV 3750 litrů Elektro část na střídač",
   "mj": "JOM",
   "cena": 74930,
   "mnozstvi": null,
   "varianty": "111111..."
  }
 ]
};
