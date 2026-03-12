/* game.js
   Pí”di kvíz – engine (A/B/C skupiny napříč tématy)
   Skupiny:
   - A: 100–200 (celkem 2 otázky), risk max 2×
   - B: 300–400 (celkem 6 otázek), risk max 2×
   - C: 500     (celkem 2 otázky), risk max 2×

   Bodování:
   - Bez risku: správně +hodnota, špatně 0
   - Riskuj: správně +(hodnota + bonus), špatně -100
   - bonus = 50 % hodnoty (100→50, 200→100, 300→150, 400→200, 500→250)

   Po 10. otázce: výsledkový modal (přepočet na 0–20, zaokrouhlení NAHORU)
   RAW_MAX pro přepočet = 4900
*/

(function () {
  "use strict";

  const LIMITS = { A: 2, B: 6, C: 2 };
  const RISK_LIMITS = { A: 2, B: 2, C: 2 };
  const RAW_MAX = 4900;
  const PENALTY_RISK_WRONG = 100;

  const GROUPS = {
    A: { title: "A (100–200)", points: [100, 200] },
    B: { title: "B (300–400)", points: [300, 400] },
    C: { title: "C (500)", points: [500] },
  };

  const state = {
    teamName: "Tým",
    allowedTopicIds: null,
    usedIds: new Set(),
    current: null,
    totalPicked: 0,
    pickedByGroup: { A: 0, B: 0, C: 0 },
    riskUsedByGroup: { A: 0, B: 0, C: 0 },
    rawScore: 0,
    startedAt: null,
    finishedAt: null,
  };

  function allQuestions() {
    return window.DATA?.QUESTIONS || [];
  }

  function allTopics() {
    return window.DATA?.TOPICS || [];
  }

  function allowedTopics() {
    const topics = allTopics();
    if (!state.allowedTopicIds || !state.allowedTopicIds.length) return topics;
    const set = new Set(state.allowedTopicIds);
    return topics.filter(t => set.has(t.id));
  }

  function topicById(id) {
    return allTopics().find(t => t.id === id) || null;
  }

  function groupForPoints(points) {
    if (points === 500) return "C";
    if (points === 100 || points === 200) return "A";
    if (points === 300 || points === 400) return "B";
    return null;
  }

  function bonusFor(points) {
    return points / 2;
  }

  function isFinished() {
    return state.totalPicked >= 10;
  }

  function canPick(points) {
    const g = groupForPoints(points);
    if (!g || isFinished()) return false;
    return state.pickedByGroup[g] < LIMITS[g];
  }

  function canRisk(points) {
    const g = groupForPoints(points);
    if (!g) return false;
    return state.riskUsedByGroup[g] < RISK_LIMITS[g];
  }

  function remainingFor(topicId, points) {
    return allQuestions().filter(q =>
      q.topicId === topicId &&
      q.points === points &&
      !state.usedIds.has(q.id)
    ).length;
  }

  function pickRandom(arr) {
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function nowMs() {
    return Date.now();
  }

  function getElapsedMs() {
    if (!state.startedAt) return 0;
    const end = state.finishedAt || nowMs();
    return Math.max(0, end - state.startedAt);
  }

  function formatElapsed(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  function init({ teamName, teacherSettings } = {}) {
    state.teamName = (teamName || "Tým").trim() || "Tým";
    state.allowedTopicIds = teacherSettings?.allowedTopicIds || null;
    state.usedIds = new Set();
    state.current = null;
    state.totalPicked = 0;
    state.pickedByGroup = { A: 0, B: 0, C: 0 };
    state.riskUsedByGroup = { A: 0, B: 0, C: 0 };
    state.rawScore = 0;
    state.startedAt = nowMs();
    state.finishedAt = null;
  }

  function reset() {
    init({ teamName: state.teamName, teacherSettings: { allowedTopicIds: state.allowedTopicIds } });
  }

  function pickQuestion({ topicId, points, mode } = {}) {
    const t = topicById(topicId);
    if (!t) return null;

    const g = groupForPoints(points);
    if (!g) return null;
    if (!canPick(points)) return null;
    if (mode === "risk" && !canRisk(points)) return null;

    const pool = allQuestions().filter(q =>
      q.topicId === topicId &&
      q.points === points &&
      !state.usedIds.has(q.id)
    );

    const q = pickRandom(pool);
    if (!q) return null;

    state.usedIds.add(q.id);
    state.totalPicked += 1;
    state.pickedByGroup[g] += 1;
    if (mode === "risk") state.riskUsedByGroup[g] += 1;

    state.current = {
      id: q.id,
      topicId,
      topicName: t.name,
      points,
      group: g,
      mode: mode === "risk" ? "risk" : "safe",
      q: q.q,
      a: q.a,
    };

    return {
      topicName: state.current.topicName,
      points: state.current.points,
      mode: state.current.mode,
      questionText: state.current.q,
      answerText: state.current.a,
    };
  }

  function resolveAnswer({ correct } = {}) {
    if (!state.current) return;

    const pts = state.current.points;
    const mode = state.current.mode;

    if (mode === "safe") {
      if (correct) state.rawScore += pts;
    } else {
      if (correct) state.rawScore += (pts + bonusFor(pts));
      else state.rawScore -= PENALTY_RISK_WRONG;
    }

    state.current = null;

    if (isFinished() && !state.finishedAt) {
      state.finishedAt = nowMs();
    }
  }

  function getResult() {
    const raw = state.rawScore;
    const scaled = (raw / RAW_MAX) * 20;
    const stationPoints = Math.ceil(scaled);
    const ratio = RAW_MAX > 0 ? (raw / RAW_MAX) : 0;
    const elapsedMs = getElapsedMs();

    return {
      teamName: state.teamName,
      rawScore: raw,
      rawMax: RAW_MAX,
      scaled,
      stationPoints,
      ratio,
      elapsedMs,
      elapsedText: formatElapsed(elapsedMs),
      finishedAt: state.finishedAt,
    };
  }

  function getBoardView() {
    const topics = allowedTopics();

    const progressText = `Otázky: ${state.totalPicked}/10`;
    const countersText =
      `A: ${state.pickedByGroup.A}/${LIMITS.A} (risk ${state.riskUsedByGroup.A}/${RISK_LIMITS.A}) • ` +
      `B: ${state.pickedByGroup.B}/${LIMITS.B} (risk ${state.riskUsedByGroup.B}/${RISK_LIMITS.B}) • ` +
      `C: ${state.pickedByGroup.C}/${LIMITS.C} (risk ${state.riskUsedByGroup.C}/${RISK_LIMITS.C})`;

    const groups = {};
    Object.keys(GROUPS).forEach(key => {
      const g = GROUPS[key];
      groups[key] = {
        key,
        title: g.title,
        points: g.points.slice(),
        topics: topics.map(t => {
          const cards = g.points.map(p => {
            const rem = remainingFor(t.id, p);
            const pickOk = canPick(p);
            const riskOk = canRisk(p);
            const disabled = (rem <= 0) || !pickOk;
            return {
              topicId: t.id,
              topicName: t.name,
              topicColor: t.color,
              points: p,
              remaining: rem,
              safeEnabled: !disabled,
              riskEnabled: !disabled && riskOk,
              isDisabled: disabled,
            };
          });

          return {
            topicId: t.id,
            topicName: t.name,
            topicColor: t.color,
            cards,
          };
        }),
      };
    });

    return {
      progressText,
      countersText,
      groups,
      timerText: formatElapsed(getElapsedMs()),
      hint: isFinished() ? "Hotovo – zobrazte výsledek." : "",
    };
  }

  function getRulesData() {
    return [
      {
        title: "Cíl hry",
        text: "Tým postupně vybere 10 otázek a snaží se získat co nejvíce bodů."
      },
      {
        title: "Skupiny otázek",
        text: "Ve hře jsou skupiny A (100–200), B (300–400) a C (500). Během hry odpovíte na 2 otázky ze skupiny A, 6 otázek ze skupiny B a 2 otázky ze skupiny C."
      },
      {
        title: "Bez risku",
        text: "Správná odpověď přidá plnou hodnotu otázky. Špatná odpověď nepřidá nic."
      },
      {
        title: "Riskuj",
        text: "Správná odpověď přidá hodnotu otázky a bonus 50 %. Špatná odpověď odečte 100 bodů."
      },
      {
        title: "Počet risků",
        text: "Riskovat lze maximálně 2× ve skupině A, 2× ve skupině B a 2× ve skupině C."
      },
      {
        title: "Pořadí v žebříčku",
        text: "Po 10. otázce se výsledek přepočítá na body stanoviště 0–20. Do žebříčku se ukládají RAW body, přepočet i celkový čas. Při shodě rozhoduje kratší čas."
      }
    ];
  }

  window.Game = {
    init,
    reset,
    pickQuestion,
    resolveAnswer,
    getBoardView,
    isFinished,
    getResult,
    getElapsedMs,
    formatElapsed,
    getRulesData,
  };
})();

