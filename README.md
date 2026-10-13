# Kalkulačka FVE pro bytové domy

Webová aplikace podle *Zadávací dokumentace – Webová aplikace pro výpočet úspor FVE (pracovní verze 1.0)*.
Nahrazuje excel „1. Klasická kalkulačka FVE – verze 02.06.2026“ (IP Polná, divize RBD). Běží čistě v prohlížeči, bez serveru – stačí otevřít `index.html` nebo nasadit na GitHub Pages.

> Repozitář obsahuje nákupní ceny a kontakty obchodníků – drž ho **soukromý**.

## Průvodce naceněním

Aplikace se otevře v **průvodci**: jedna otázka na obrazovku (adresa, byty, vchody, rozměry, spotřeba, cena, střecha, panely ze SolarEdge Designeru, řešení, rozvody, TUV, sdílení, dotace a priorita). Vlevo je seznam „Co ještě zadat“, který ukazuje hotové a chybějící údaje. Varianty se zobrazí až po vyplnění všeho potřebného: tři nejlepší vedle sebe, doporučená zvýrazněná s vysvětlením. Tlačítko **Vytvořit nabídku (PDF)** uloží varianty do projektu a otevře tisk; **Doladit v odborném režimu** otevře detailní záložky (rozpočet, baterie, simulace, administrace).

## Co aplikace umí

| Kapitola zadání | Stav |
|---|---|
| 3 Uživatelé a oprávnění | **bez přihlašování** (záměrně); administrace je samostatná záložka |
| 4 Projekty – založení, otevření, úprava, kopie, uložení | ano, v prohlížeči (localStorage) + export/import `.json` a záloha všech projektů |
| 5.1 Všechna pole listu Vstupní data | ano, u každého pole je odkaz na buňku Excelu |
| 5.2 Ruční údaje ze SolarEdge Designeru | počty panelů po světových stranách → návrh střídače; ruční roční výroba |
| 5.3 Produkt JOM a vazby na ceník | ano, 9 sloupců ceníku (orientace × produkt) |
| 6.1 Ceník a rozpočet podle Excelu | ano – 123 položek, pravidla množství, koeficient, sleva 15 % |
| 6.2 Ruční úpravy rozpočtu | ano – zvýrazněné, nepřepisují se, jsou v historii; změny vstupů se ukazují jako seznam rozdílů k potvrzení |
| 6.3 Ochrana uložených projektů | projekt nese kopii svého ceníku; aktualizace na nový ceník je řízená s přehledem dopadů |
| 7 Výroba, zjednodušený a hodinový režim, baterie | Excel 0,9 MWh/kWp / ruční / modelový odhad; měsíční model 1:1 s Excelem; hodinová simulace 8 760 h s baterií (kapacita, DoD, výkon, účinnost, SOC) |
| 8 Společné prostory a sdílení, varianty | ano; varianty v projektu, generátor variant kapacity baterie, porovnání |
| 9 Ekonomika | úspora, výnos z přetoků, provozní náklady, čistá investice, prostá a diskontovaná návratnost, kumulovaný cash flow, NPV, IRR; dotace se odečítá jen na vyžádání |
| 11 Historie a validace | historie změn při každém uložení; kontrola vstupů a hlášky |
| 12 PDF report | tisk do PDF z prohlížeče (volitelné kapitoly), nebo stažení HTML |
| Admin – ceník, číselníky, pravidla | položky, ceny, pravidla množství (výrazy), příznaky variant, střídače, baterie, parametry, dotace, profily, model výroby, kontakty; verze ceníku, export/import |

## Struktura

```
index.html            kostra stránky
css/app.css           vzhled (světlý i tmavý režim, tisk)
js/cenik-vychozi.js   výchozí ceník a číselníky převzaté z Excelu (verze 22_05_2026)
js/engine.js          výpočetní jádro = přepis listů Vstupní data, Ceník, Výpočty, Výstup TOP
js/sim.js             modelová výroba (sklon, azimut, ztráty) a hodinová simulace
js/eko.js             ekonomické vyhodnocení (cash flow, NPV, IRR)
js/pruvodce-jadro.js  průvodce: sestavení kandidátních variant, hodnocení a doporučení
js/store.js           ukládání do prohlížeče, export/import, historie změn
js/app.js             uživatelské rozhraní
testy/                referenční domy a test shody s Excelem
```

## Ověření proti Excelu

`node testy/test-excel.js` – 4 referenční domy (JOM VZ s TUV, Spol. prostory J se sdílením, Spol. prostory bez baterie šikmá, JOM J s TUV i sdílením) vyplněné do původního `.xlsm` a přepočtené. Porovnává se 179 hodnot na dům včetně každé položky rozpočtu. Výsledek: 0 rozdílů.

## Na co dát pozor

- Data jsou jen v prohlížeči, kde se zadala. Pravidelně používej **Projekty → Zálohovat vše**. Kolegovi se projekt předává exportem `.json`.
- Hodinové profily výroby a spotřeby jsou modelové (nejsou naměřené) a přepočítávají se na měsíční hodnoty z Excelu. Hodinová simulace proto dává jinou přímou spotřebu než Excel, který používá koeficient 50–92 %.
- Převzaté zvláštnosti Excelu, které je dobré potvrdit: dělitel 14,5/3 u malých baterií (AG45/AF44), sdílení 60 % / 30 % podle produktu, kontrola dotace E56 ≥ E57.
- Ceník se pravidly množství řídí výrazy v JavaScriptu (`panely - panelyFasada`); seznam proměnných je v administraci i v `engine.js` (`PROMENNE`).
