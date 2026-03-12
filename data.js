/* data.js
   Pí”di kvíz – pevná témata + pevné body + otázky
   Bez frameworků, globální DATA pro GitHub Pages
*/

(function () {
  "use strict";

  const POINTS = [100, 200, 300, 400, 500];

  const TOPICS = [
    { id: "pi",      name: "π & kružnice",        color: "#60a5fa" },
    { id: "geom",    name: "Historie čísla π",    color: "#f59e0b" },
    { id: "algebra", name: "π v přírodě a vědě",  color: "#34d399" },
    { id: "logic",   name: "Zajímavosti o π",     color: "#a78bfa" },
    { id: "trivia",  name: "Výpočty s π",         color: "#f472b6" },
  ];

  const QUESTIONS = [
    // π & kružnice
    {
      id: "PI_100_001",
      topicId: "pi",
      points: 100,
      q: "Co vyjadřuje číslo π?",
      a: "Poměr obvodu kružnice k jejímu průměru.\nπ = O / d",
      tags: ["definice"],
    },
    {
      id: "PI_200_001",
      topicId: "pi",
      points: 200,
      q: "Na kolik desetinných míst je přibližně rovno číslo π, pokud ho zaokrouhlíme na dvě desetinná místa?",
      a: "3,14\nπ ≈ 3,14",
      tags: ["priblizeni"],
    },
    {
      id: "PI_300_001",
      topicId: "pi",
      points: 300,
      q: "Jaký vzorec používáme pro výpočet obvodu kružnice pomocí čísla π?",
      a: "O = π · d\nTaké lze použít O = 2 · π · r.",
      tags: ["vzorec", "obvod"],
    },
    {
      id: "PI_400_001",
      topicId: "pi",
      points: 400,
      q: "Kruh má obvod 20π cm. Jaký má poloměr, pokud platí vzorec O = 2 · π · r?",
      a: "r = 10 cm\nO = 2 · π · r\n20π = 2 · π · r\nr = 10 cm",
      tags: ["vypocet", "obvod"],
    },
    {
      id: "PI_500_001",
      topicId: "pi",
      points: 500,
      q: "Ve kterém století se začal pro Ludolfovo číslo používat symbol π?",
      a: "V 18. století.\nSymbol π začal používat William Jones (1706) a rozšířil ho Leonhard Euler.",
      tags: ["historie", "symbol"],
    },

    // Historie čísla π
    {
      id: "GEOM_100_001",
      topicId: "geom",
      points: 100,
      q: "Jak se nazývá číslo π jiným tradičním názvem používaným v češtině?",
      a: "Ludolfovo číslo.",
      tags: ["nazev"],
    },
    {
      id: "GEOM_200_001",
      topicId: "geom",
      points: 200,
      q: "Který starověký řecký matematik jako jeden z prvních přesněji odhadl hodnotu čísla π pomocí mnohoúhelníků vepsaných a opsaných kružnici?",
      a: "Archimédés ze Syrakus.\nStanovil, že π je mezi 3 1/7 a 3 10/71.",
      tags: ["archimedes"],
    },
    {
      id: "GEOM_300_001",
      topicId: "geom",
      points: 300,
      q: "Který matematik vypočítal číslo π na 35 desetinných míst a dal mu přezdívku Ludolfovo číslo?\nA) Ludolf van Ceulen\nB) Johannes Kepler\nC) René Descartes\nD) Pierre de Fermat",
      a: "A) Ludolf van Ceulen\nJeho výpočet byl dokonce vyryt na jeho náhrobku.",
      tags: ["ludolf", "vyber"],
    },
    {
      id: "GEOM_400_001",
      topicId: "geom",
      points: 400,
      q: "Která starověká civilizace už přibližně znala hodnotu π a používala ji při stavbách a výpočtech, například při konstrukci pyramid?",
      a: "Staří Egypťané.\nNapříklad v Rhindově matematickém papyru je hodnota π přibližně 3,16.",
      tags: ["egypt"],
    },
    {
      id: "GEOM_500_001",
      topicId: "geom",
      points: 500,
      q: "Kdy se slaví Mezinárodní den čísla π (Pi Day)?",
      a: "14. března.\nDatum 14. 3. odpovídá přibližné hodnotě čísla π: 3,14.",
      tags: ["pi-day"],
    },

    // π v přírodě a vědě
    {
      id: "ALG_100_001",
      topicId: "algebra",
      points: 100,
      q: "V jakém geometrickém tvaru se číslo π přirozeně objevuje nejčastěji?",
      a: "V kruhu (resp. v kružnici).",
      tags: ["kruh"],
    },
    {
      id: "ALG_200_001",
      topicId: "algebra",
      points: 200,
      q: "Jaký geometrický tvar má útvar, při jehož výpočtech se velmi často používá číslo π?",
      a: "Kruh (resp. kružnice).",
      tags: ["tvar"],
    },
    {
      id: "ALG_300_001",
      topicId: "algebra",
      points: 300,
      q: "Jak se nazývá kruhový útvar ve středu slunečnice nebo jiných květů, ve kterém jsou semena uspořádána do spirál?",
      a: "Spirály / spirálové uspořádání semen.",
      tags: ["priroda", "spiraly"],
    },
    {
      id: "ALG_400_001",
      topicId: "algebra",
      points: 400,
      q: "Jaký je přibližný obvod kruhu, pokud má průměr 10 cm?\nPoužijte vzorec O = π · d a π ≈ 3,14.",
      a: "Přibližně 31,4 cm.\nO = π · d\nO = 3,14 · 10 = 31,4 cm",
      tags: ["vypocet", "obvod"],
    },
    {
      id: "ALG_500_001",
      topicId: "algebra",
      points: 500,
      q: "Na jaký řád desetinných míst dnes dokážou počítače vypočítat číslo π?\nA) stovky\nB) tisíce\nC) miliony\nD) biliony",
      a: "D) biliony\nDíky superpočítačům dnes známe více než 100 bilionů desetinných míst čísla π.",
      tags: ["pocitace", "vyber"],
    },

    // Zajímavosti o π
    {
      id: "LOG_100_001",
      topicId: "logic",
      points: 100,
      q: "Jak se nazývá svátek věnovaný číslu π, který se slaví 14. března?",
      a: "Pi Day (Den π).",
      tags: ["svatek"],
    },
    {
      id: "LOG_200_001",
      topicId: "logic",
      points: 200,
      q: "Kolik přibližně prvních číslic čísla π si většina lidí pamatuje bez zvláštního tréninku?\nA) asi 3\nB) asi 5\nC) asi 10\nD) asi 50",
      a: "C) asi 10\nMnoho lidí si pamatuje např. 3,1415926535.",
      tags: ["pameti", "vyber"],
    },
    {
      id: "LOG_300_001",
      topicId: "logic",
      points: 300,
      q: "Jak se nazývá soutěž, při které lidé zpaměti recitují co nejvíce desetinných míst čísla π?",
      a: "Recitování / memorování číslic π.\nÚčastníci se snaží odříkat co nejvíce desetinných míst π zpaměti.",
      tags: ["soutez"],
    },
    {
      id: "LOG_400_001",
      topicId: "logic",
      points: 400,
      q: "Kolik přibližně číslic čísla π stačí k výpočtu obvodu Země s přesností na několik milimetrů?\nA) 9\nB) 19\nC) 39\nD) 99",
      a: "C) 39\nI pro velmi přesné výpočty ve skutečnosti stačí jen několik desítek číslic π.",
      tags: ["zeme", "vyber"],
    },
    {
      id: "LOG_500_001",
      topicId: "logic",
      points: 500,
      q: "Kolik číslic čísla π si zapamatoval držitel světového rekordu při recitování zpaměti?\nA) asi 1 000\nB) asi 10 000\nC) asi 70 000\nD) asi 1 000 000",
      a: "C) asi 70 000\nJeden z rekordů v zapamatování π je více než 70 000 číslic, které byly recitovány zpaměti během několika hodin.",
      tags: ["rekord", "vyber"],
    },

    // Výpočty s π
    {
      id: "TRI_100_001",
      topicId: "trivia",
      points: 100,
      q: "Jaký je přibližný obsah kruhu o poloměru 1, pokud platí vzorec pro obsah kruhu S = π · r²?\nA) π\nB) 2π\nC) 3,14²\nD) 6,28",
      a: "A) π (přibližně 3,14)\nPro r = 1:\nS = π · 1² = π",
      tags: ["vypocet", "obsah", "vyber"],
    },
    {
      id: "TRI_200_001",
      topicId: "trivia",
      points: 200,
      q: "Jaký je přibližný obvod kruhu o průměru 8 cm, pokud platí vzorec pro obvod kruhu O = π · d a použijeme přibližnou hodnotu π ≈ 3,14?\nA) asi 12,6 cm\nB) asi 25,1 cm\nC) asi 50,2 cm\nD) asi 78,5 cm",
      a: "B) asi 25,1 cm\nO = π · d\nO = 3,14 × 8 ≈ 25,1 cm",
      tags: ["vypocet", "obvod", "vyber"],
    },
    {
      id: "TRI_300_001",
      topicId: "trivia",
      points: 300,
      q: "Jaký je přibližný obsah kruhu o poloměru 5 cm, pokud platí vzorec S = π · r² a použijeme π ≈ 3,14?\nA) asi 31,4 cm²\nB) asi 78,5 cm²\nC) asi 157 cm²\nD) asi 314 cm²",
      a: "B) asi 78,5 cm²\nS = π · r²\nS = 3,14 × 5²\nS = 3,14 × 25 ≈ 78,5 cm²",
      tags: ["vypocet", "obsah", "vyber"],
    },
    {
      id: "TRI_400_001",
      topicId: "trivia",
      points: 400,
      q: "Jaký je přibližný obvod kruhu o poloměru 6 cm, pokud platí vzorec O = 2 · π · r a použijeme π ≈ 3,14?",
      a: "Přibližně 37,7 cm\nO = 2 · π · r\nO = 2 × 3,14 × 6 ≈ 37,7 cm",
      tags: ["vypocet", "obvod"],
    },
    {
      id: "TRI_500_001",
      topicId: "trivia",
      points: 500,
      q: "Jaký je přibližný obsah kruhu o průměru 10 cm, pokud platí vzorec S = π · r² a použijeme π ≈ 3,14?\n(Nezapomeňte, že r = d / 2.)",
      a: "Přibližně 78,5 cm²\nr = 10 / 2 = 5\nS = π · r²\nS = 3,14 × 5²\nS = 3,14 × 25 ≈ 78,5 cm²",
      tags: ["vypocet", "obsah"],
    },
  ];

  const RULES = [
    "🎯 Cíl hry",
    "Tým postupně vybere 10 otázek a snaží se získat co nejvíce bodů.",
    "",
    "📂 Kategorie otázek",
    "A – otázky za 100 a 200 bodů",
    "B – otázky za 300 a 400 bodů",
    "C – otázky za 500 bodů",
    "",
    "🎲 Režimy odpovědi",
    "",
    "Bez risku:",
    "✔ správně = získáte plný počet bodů",
    "✖ špatně = 0 bodů",
    "",
    "Riskuj:",
    "✔ správně = body za otázku + bonus 50 %",
    "✖ špatně = −100 bodů",
    "",
    "📊 Příklad (otázka za 500 bodů)",
    "",
    "Riskuj:",
    "✔ správně = 750 bodů",
    "✖ špatně = −100 bodů",
    "",
    "Bez risku:",
    "✔ správně = 500 bodů",
    "✖ špatně = 0 bodů",
    "",
    "📌 Ve hře odpovíte na 10 otázek:",
    "2× skupina A",
    "6× skupina B",
    "2× skupina C",
    "",
    "⚠ Riskovat lze maximálně 2× v každé skupině."
  ].join("\n");

  window.DATA = {
    VERSION: "0.2.0",
    POINTS,
    TOPICS,
    QUESTIONS,
    RULES,
  };
})();
