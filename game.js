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

    // progress / quotas
    totalPicked: 0,
    pickedByGroup: { A: 0, B: 0, C: 0 },
    riskUsedByGroup: { A: 0, B: 0, C: 0 },

    // scoring
    rawScore: 0,
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
    return points / 2; // 50% (100→50...)
  }

  function isFinished() {
    return state.totalPicked >= 10;
  }

  function canPick(points) {
    const g = groupForPoints(points);
    if (!g) return false;
    if (isFinished()) return false;
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

  function init({ teamName, teacherSettings } = {}) {
    state.teamName = (teamName || "Tým").trim() || "Tým";
    state.allowedTopicIds = teacherSettings?.allowedTopicIds || null;

    state.usedIds = new Set();
    state.current = null;

    state.totalPicked = 0;
    state.pickedByGroup = { A: 0, B: 0, C: 0 };
    state.riskUsedByGroup = { A: 0, B: 0, C: 0 };

    state.rawScore = 0;
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

    // rezervuj otázku + zapiš tah (kvóty)
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
  }

  function getResult() {
    const raw = state.rawScore;
    const scaled = (raw / RAW_MAX) * 20;
    const stationPoints = Math.ceil(scaled);
    const ratio = RAW_MAX > 0 ? (raw / RAW_MAX) : 0;

    return { rawScore: raw, rawMax: RAW_MAX, scaled, stationPoints, ratio };
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
      hint: isFinished() ? "Hotovo – zobrazte výsledek." : "",
    };
  }

  function getRulesText() {
    return window.DATA?.RULES || "";
  }

  window.Game = {
    init,
    reset,

    pickQuestion,
    resolveAnswer,

    getBoardView,
    isFinished,
    getResult,

    getRulesText,
  };
})();
