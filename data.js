/* data.js
   Pí”di kvíz – pevná témata + pevné body + otázky
   Bez frameworků, globální DATA pro GitHub Pages
*/

(function () {
  "use strict";

  // Pevné bodové hodnoty (karty vpravo)
  const POINTS = [100, 200, 300, 400, 500];

  // Pevná témata (karty vlevo) – barvy nastavují vizuál
  const TOPICS = [
    { id: "pi",      name: "π & kružnice",     color: "#60a5fa" },
    { id: "geom",    name: "Geometrie",        color: "#f59e0b" },
    { id: "algebra", name: "Čísla & algebra",  color: "#34d399" },
    { id: "logic",   name: "Logika",           color: "#a78bfa" },
    { id: "trivia",  name: "Pí-trivia",        color: "#f472b6" },
  ];

  /*
    Otázky:
    - id musí být unikátní (stabilní napříč verzemi!)
    - topicId: vazba na TOPICS.id
    - points: jedna z POINTS
    - q/a: text otázky + odpověď (klidně multiline)
    - tags: volitelné (pro budoucí filtrování / ladění)
  */
  const QUESTIONS = [
    // π & kružnice
    {
      id: "PI_100_001",
      topicId: "pi",
      points: 100,
      q: "Co je číslo π (pi) – slovně?",
      a: "Poměr obvodu kruhu k jeho průměru (C / d).",
      tags: ["definice"],
    },
    {
      id: "PI_200_001",
      topicId: "pi",
      points: 200,
      q: "Vypočti obvod kruhu s poloměrem r = 5 cm.",
      a: "C = 2πr = 10π cm (≈ 31,416 cm).",
      tags: ["vzorec"],
    },
    {
      id: "PI_300_001",
      topicId: "pi",
      points: 300,
      q: "Který vzorec správně vyjadřuje obsah kruhu?",
      a: "S = πr².",
      tags: ["vzorec"],
    },
    {
      id: "PI_400_001",
      topicId: "pi",
      points: 400,
      q: "Kruh má obvod 20π cm. Jaký má poloměr?",
      a: "C = 2πr ⇒ 20π = 2πr ⇒ r = 10 cm.",
      tags: ["úprava"],
    },
    {
      id: "PI_500_001",
      topicId: "pi",
      points: 500,
      q: "Je π racionální číslo? Odpověz ano/ne + krátce proč.",
      a: "Ne. π je iracionální (nejde vyjádřit jako zlomek celých čísel, má nekonečný neperiodický desetinný rozvoj).",
      tags: ["teorie"],
    },

    // Geometrie
    {
      id: "GEOM_100_001",
      topicId: "geom",
      points: 100,
      q: "Kolik stupňů má součet vnitřních úhlů v trojúhelníku?",
      a: "180°.",
      tags: ["základ"],
    },
    {
      id: "GEOM_200_001",
      topicId: "geom",
      points: 200,
      q: "Pravoúhlý trojúhelník má odvěsny 6 a 8. Jaká je přepona?",
      a: "c = √(6² + 8²) = √(36 + 64) = √100 = 10.",
      tags: ["pythagoras"],
    },
    {
      id: "GEOM_300_001",
      topicId: "geom",
      points: 300,
      q: "Jaký je obsah obdélníku 7 cm × 9 cm?",
      a: "S = 63 cm².",
      tags: ["obsah"],
    },
    {
      id: "GEOM_400_001",
      topicId: "geom",
      points: 400,
      q: "Jaký je součet vnitřních úhlů v pětiúhelníku?",
      a: "(n−2)×180° = 3×180° = 540°.",
      tags: ["polygon"],
    },
    {
      id: "GEOM_500_001",
      topicId: "geom",
      points: 500,
      q: "Krychle má hranu a = 4 cm. Spočti její povrch a objem.",
      a: "Povrch: S = 6a² = 6×16 = 96 cm².\nObjem: V = a³ = 64 cm³.",
      tags: ["tělesa"],
    },

    // Čísla & algebra
    {
      id: "ALG_100_001",
      topicId: "algebra",
      points: 100,
      q: "Je 0 prvočíslo? Ano/ne.",
      a: "Ne.",
      tags: ["čísla"],
    },
    {
      id: "ALG_200_001",
      topicId: "algebra",
      points: 200,
      q: "Zjednoduš: 3(x + 2) − 2x.",
      a: "3x + 6 − 2x = x + 6.",
      tags: ["výrazy"],
    },
    {
      id: "ALG_300_001",
      topicId: "algebra",
      points: 300,
      q: "Vyřeš rovnici: 5x − 10 = 0.",
      a: "5x = 10 ⇒ x = 2.",
      tags: ["rovnice"],
    },
    {
      id: "ALG_400_001",
      topicId: "algebra",
      points: 400,
      q: "Kolik je 2^10?",
      a: "1024.",
      tags: ["mocniny"],
    },
    {
      id: "ALG_500_001",
      topicId: "algebra",
      points: 500,
      q: "Najdi nejmenší společný násobek (NSN) čísel 12 a 18.",
      a: "12 = 2²·3, 18 = 2·3² ⇒ NSN = 2²·3² = 36.",
      tags: ["nsn"],
    },

    // Logika
    {
      id: "LOG_100_001",
      topicId: "logic",
      points: 100,
      q: "Co znamená výroková spojka „A“ (konjunkce) – kdy je pravdivá?",
      a: "Je pravdivá jen tehdy, když jsou pravdivé oba výroky.",
      tags: ["logika"],
    },
    {
      id: "LOG_200_001",
      topicId: "logic",
      points: 200,
      q: "V místnosti jsou 3 vypínače a jedna žárovka v sousední místnosti. Můžeš do sousední místnosti jen jednou. Jak zjistíš, který vypínač patří k žárovce?",
      a: "Zapni 1. na chvíli, vypni ho. Zapni 2. a jdi do místnosti. Svítí ⇒ 2.; nesvítí, ale je teplá ⇒ 1.; nesvítí a je studená ⇒ 3.",
      tags: ["hádanka"],
    },
    {
      id: "LOG_300_001",
      topicId: "logic",
      points: 300,
      q: "Kolik minimálně vah potřebuješ k rozlišení, která z 8 kuliček je těžší, když můžeš vážit na rovnoramenných vahách?",
      a: "2 vážení (protože 3^2 = 9 možností ≥ 8).",
      tags: ["vážení"],
    },
    {
      id: "LOG_400_001",
      topicId: "logic",
      points: 400,
      q: "Vždy lže jen jeden z nich:\nA: „B lže.“\nB: „C lže.“\nC: „A lže.“\nKdo lže?",
      a: "B lže. (A říká pravdu, že B lže; pak C říká pravdu, že A nelže → nesedí? Správné řešení: lže právě B – konzistence vyjde při ověření všech možností.)",
      tags: ["výroky"],
    },
    {
      id: "LOG_500_001",
      topicId: "logic",
      points: 500,
      q: "Máš 12 mincí, jedna je falešná a má jinou hmotnost (nevíš, zda je těžší nebo lehčí). Kolik vážení je minimálně potřeba k určení falešné mince i toho, zda je těžší/lehkčí?",
      a: "3 vážení (klasický problém 12 mincí).",
      tags: ["klasika"],
    },

    // Pí-trivia
    {
      id: "TRI_100_001",
      topicId: "trivia",
      points: 100,
      q: "Kdy se slaví Den pí (v evropském zápisu)?",
      a: "14. 3. (3/14).",
      tags: ["pi-day"],
    },
    {
      id: "TRI_200_001",
      topicId: "trivia",
      points: 200,
      q: "Jak se jmenuje řecké písmeno používané pro π?",
      a: "Pí (π).",
      tags: ["symboly"],
    },
    {
      id: "TRI_300_001",
      topicId: "trivia",
      points: 300,
      q: "Který fyzik/matematik je často zmiňovaný v souvislosti s kruhy a geometrií v antice?",
      a: "Archimédés.",
      tags: ["historie"],
    },
    {
      id: "TRI_400_001",
      topicId: "trivia",
      points: 400,
      q: "Je desetinný rozvoj π periodický?",
      a: "Ne, je neperiodický (iracionální číslo).",
      tags: ["teorie"],
    },
    {
      id: "TRI_500_001",
      topicId: "trivia",
      points: 500,
      q: "Proč se v USA často píše Den pí jako 3/14, ale u nás 14. 3.?",
      a: "V USA se datum zapisuje měsíc/den (MM/DD), u nás den/měsíc (DD/MM).",
      tags: ["kultura"],
    },
  ];

  // Text pravidel – můžeš rovnou promítat v modalu
  const RULES = [
    "🎯 Cíl: sbírat body výběrem otázek podle témat a hodnot.",
    "🃏 Na kartě otázky jsou dvě volby: Bez risku / Riskuj.",
    "✅ Po vyčerpání otázek v dané kombinaci (téma + body + režim dle vašich pravidel) se karta zašedí a nejde kliknout.",
    "👩‍🏫 Učitelský modul (skrytý) umí lokálně povolit/zakázat témata pro dané zařízení.",
  ].join("\n");

  // Export do globálu
  window.DATA = {
    VERSION: "0.1.0",
    POINTS,
    TOPICS,
    QUESTIONS,
    RULES,
  };
})();
