/* game.js
   Minimal engine pro Pí”di kvíz (RISKuj)
   - vykreslí témata a grid bodů
   - výběr otázky podle (téma + body)
   - evidence použitých otázek => vyčerpání => disable
   - základní skóre (zatím jednoduché; upravíme dle vašich domluvených pravidel)
*/

(function () {
  "use strict";

  // ------- interní stav -------
  const state = {
    teamName: "Tým",
    allowedTopicIds: null,     // z Teacher settings
    activeTopicId: null,

    usedIds: new Set(),        // už použité otázky
    current: null,             // aktuálně zobrazená otázka
    score: 0,
  };

  // ------- helpers -------
  function byId(arr, id) {
    return arr.find(x => x.id === id) || null;
  }

  function topicById(id) {
    return byId(window.DATA?.TOPICS || [], id);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function pickRandom(arr) {
    if (!arr.length) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // tint podle bodů (jen vizuál; 0..0.35)
  function tintForPoints(points) {
    const pts = window.DATA?.POINTS || [100,200,300,400,500];
    const idx = Math.max(0, pts.indexOf(points));
    const t = 0.12 + idx * 0.05;     // 100→0.12, 500→0.32
    return clamp(t, 0.10, 0.35);
  }

  function allQuestions() {
    return window.DATA?.QUESTIONS || [];
  }

  function allowedTopics() {
    const topics = window.DATA?.TOPICS || [];
    if (!state.allowedTopicIds || !state.allowedTopicIds.length) return topics;
    const set = new Set(state.allowedTopicIds);
    return topics.filter(t => set.has(t.id));
  }

  function remainingCount(topicId, points) {
    const qs = allQuestions().filter(q =>
      q.topicId === topicId &&
      q.points === points &&
      !state.usedIds.has(q.id)
    );
    return qs.length;
  }

  function anyRemainingInTopic(topicId) {
    const qs = allQuestions().filter(q =>
      q.topicId === topicId &&
      !state.usedIds.has(q.id)
    );
    return qs.length;
  }

  // ------- API pro main.js -------
  function init({ teamName, teacherSettings } = {}) {
    state.teamName = (teamName || "Tým").trim() || "Tým";
    state.usedIds = new Set();
    state.current = null;
    state.score = 0;

    // teacher settings
    state.allowedTopicIds = teacherSettings?.allowedTopicIds || null;

    // default active topic = první povolené
    const topics = allowedTopics();
    state.activeTopicId = topics[0]?.id || null;
  }

  function reset() {
    // jednoduchý reset celé hry
    init({ teamName: state.teamName, teacherSettings: { allowedTopicIds: state.allowedTopicIds } });
  }

  function selectTopic(topicId) {
    // ignoruj nepovolené
    const allowed = new Set(allowedTopics().map(t => t.id));
    if (!allowed.has(topicId)) return;
    state.activeTopicId = topicId;
  }

  function getBoardView() {
    const pts = window.DATA?.POINTS || [100,200,300,400,500];
    const topics = allowedTopics();

    // pokud aktivní téma už není povolené, přepni na první
    if (!topics.find(t => t.id === state.activeTopicId)) {
      state.activeTopicId = topics[0]?.id || null;
    }

    // topics view (vlevo)
    const topicViews = topics.map(t => {
      const rem = anyRemainingInTopic(t.id);
      return {
        id: t.id,
        name: t.name,
        color: t.color,
        remainingText: `Zbývá: ${rem}`,
        isDisabled: rem === 0,
        isActive: t.id === state.activeTopicId,
      };
    });

    // cards view (vpravo) – jen pro active topic
    const active = state.activeTopicId;
    const activeTopic = active ? topicById(active) : null;

    const cards = (!activeTopic ? [] : pts.map(p => {
      const rem = remainingCount(activeTopic.id, p);
      const disabled = rem === 0;

      return {
        topicId: activeTopic.id,
        points: p,
        color: activeTopic.color,
        tint: tintForPoints(p),
        safeEnabled: !disabled,  // zatím stejné
        riskEnabled: !disabled,  // později tu doplníme vaše “kolikrát jde kliknout”
        isDisabled: disabled,
      };
    }));

    const topicTotalRemaining = topics.reduce((sum, t) => sum + anyRemainingInTopic(t.id), 0);
    const gridRemaining = activeTopic
      ? pts.reduce((sum, p) => sum + remainingCount(activeTopic.id, p), 0)
      : 0;

    return {
      activeTopicId: state.activeTopicId,
      topics: topicViews,
      cards,
      meta: {
        topicMeta: `Zbývá celkem: ${topicTotalRemaining}`,
        gridTitle: "Otázky",
        gridMeta: activeTopic
          ? `Téma: ${activeTopic.name} • zbývá: ${gridRemaining}`
          : "Vyber téma vlevo",
        hint: "",
      },
    };
  }

  function pickQuestion({ topicId, points, mode } = {}) {
    const t = topicById(topicId);
    if (!t) return null;

    // vyber nepoužitou otázku pro (topicId + points)
    const pool = allQuestions().filter(q =>
      q.topicId === topicId &&
      q.points === points &&
      !state.usedIds.has(q.id)
    );

    const q = pickRandom(pool);
    if (!q) return null;

    // označ jako použitou hned při výběru (aby nešla otevřít znovu)
    state.usedIds.add(q.id);

    state.current = {
      id: q.id,
      topicId,
      topicName: t.name,
      topicColor: t.color,
      points,
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

    // ⚠️ TADY SI POZDĚJI DOSADÍME VAŠE PŘESNÉ PRAVIDLO “bez risku/riskuj”
    // pro teď:
    // - safe: správně +pts, špatně +0
    // - risk: správně +2*pts, špatně -pts
    if (mode === "safe") {
      if (correct) state.score += pts;
    } else {
      if (correct) state.score += 2 * pts;
      else state.score -= pts;
    }

    state.current = null;
  }

  function getScoreView() {
    return {
      lines: [`${state.teamName}: ${state.score} b`],
    };
  }

  function getRulesText() {
    return window.DATA?.RULES || "";
  }

  // expose
  window.Game = {
    init,
    reset,
    selectTopic,
    getBoardView,
    pickQuestion,
    resolveAnswer,
    getScoreView,
    getRulesText,
  };
})();
