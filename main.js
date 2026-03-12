(() => {
  "use strict";

  const STORAGE_RESULTS_KEY = "pidikviz.results.v1";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn) => el && el.addEventListener(ev, fn);

  const screens = {
    start: $("#screenStart"),
    board: $("#screenBoard"),
    question: $("#screenQuestion"),
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s && s.classList.remove("is-active"));
    screens[name]?.classList.add("is-active");
  }

  const rulesModal = $("#rulesModal");
  const teacherModal = $("#teacherModal");
  const resultModal = $("#resultModal");
  const leaderboardModal = $("#leaderboardModal");

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  function wireModalClose(modalEl) {
    if (!modalEl) return;
    on(modalEl, "click", (e) => {
      const closeHit =
        e.target &&
        (e.target.hasAttribute("data-close-modal") ||
          e.target.closest("[data-close-modal]"));
      if (closeHit) closeModal(modalEl);
    });
  }

  wireModalClose(rulesModal);
  wireModalClose(teacherModal);
  wireModalClose(resultModal);
  wireModalClose(leaderboardModal);

  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    if (rulesModal && !rulesModal.classList.contains("is-hidden")) closeModal(rulesModal);
    if (teacherModal && !teacherModal.classList.contains("is-hidden")) closeModal(teacherModal);
    if (resultModal && !resultModal.classList.contains("is-hidden")) closeModal(resultModal);
    if (leaderboardModal && !leaderboardModal.classList.contains("is-hidden")) closeModal(leaderboardModal);
  });

  const AppState = {
    teamName: "",
    timerId: null,
    resultSavedForRun: false,
  };

  const el = {
    // start
    teamName: $("#teamName"),
    btnStartGame: $("#btnStartGame"),
    btnShowRules: $("#btnShowRules"),
    btnOpenLeaderboard: $("#btnOpenLeaderboard"),
    startHint: $("#startHint"),

    // board
    btnBackToStart: $("#btnBackToStart"),
    boardColumns: $("#boardColumns"),
    boardProgress: $("#boardProgress"),
    boardCounters: $("#boardCounters"),
    boardHint: $("#boardHint"),
    boardTimer: $("#boardTimer"),

    // question
    btnCloseQuestion: $("#btnCloseQuestion"),
    qStatus: $("#qStatus"),
    qText: $("#qText"),
    btnReveal: $("#btnReveal"),
    qAnswerBox: $("#qAnswerBox"),
    qAnswer: $("#qAnswer"),
    btnMarkCorrect: $("#btnMarkCorrect"),
    btnMarkWrong: $("#btnMarkWrong"),

    // rules
    btnCloseRules: $("#btnCloseRules"),
    rulesText: $("#rulesText"),

    // teacher
    btnOpenTeacher: $("#btnOpenTeacher"),
    btnCloseTeacher: $("#btnCloseTeacher"),
    btnTeacherReset: $("#btnTeacherReset"),
    btnTeacherSave: $("#btnTeacherSave"),
    teacherTopicsList: $("#teacherTopicsList"),
    teacherHint: $("#teacherHint"),

    // result
    btnCloseResult: $("#btnCloseResult"),
    resultBody: $("#resultBody"),
    btnNewGame: $("#btnNewGame"),
    btnBackHome: $("#btnBackHome"),
    btnResultExportCsv: $("#btnResultExportCsv"),

    // leaderboard modal
    btnCloseLeaderboard: $("#btnCloseLeaderboard"),
    leaderboardBody: $("#leaderboardBody"),
    leaderboardTable: $("#leaderboardTable"),
    leaderboardEmpty: $("#leaderboardEmpty"),
    btnExportCsv: $("#btnExportCsv"),
    btnClearLeaderboard: $("#btnClearLeaderboard"),
  };

  const hasGame = typeof window.Game !== "undefined";
  const hasTeacher = typeof window.Teacher !== "undefined";

  function clear(node) {
    if (node) node.innerHTML = "";
  }

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch {
      return fallback;
    }
  }

  function tintForPoints(points) {
    if (points === 100) return 0.12;
    if (points === 200) return 0.16;
    if (points === 300) return 0.20;
    if (points === 400) return 0.24;
    if (points === 500) return 0.30;
    return 0.14;
  }

  function formatTime(ms) {
    return window.Game?.formatElapsed ? window.Game.formatElapsed(ms) : "00:00";
  }

  function getStoredResults() {
    const raw = localStorage.getItem(STORAGE_RESULTS_KEY);
    const parsed = safeParse(raw, []);
    return Array.isArray(parsed) ? parsed : [];
  }

  function sortResults(items) {
    return items.slice().sort((a, b) => {
      if ((b.stationPoints || 0) !== (a.stationPoints || 0)) {
        return (b.stationPoints || 0) - (a.stationPoints || 0);
      }
      if ((b.scaled || 0) !== (a.scaled || 0)) {
        return (b.scaled || 0) - (a.scaled || 0);
      }
      if ((b.rawScore || 0) !== (a.rawScore || 0)) {
        return (b.rawScore || 0) - (a.rawScore || 0);
      }
      return (a.elapsedMs || 0) - (b.elapsedMs || 0);
    });
  }

  function saveStoredResults(items) {
    localStorage.setItem(STORAGE_RESULTS_KEY, JSON.stringify(sortResults(items)));
  }

  function addResultToLeaderboard(result) {
    const items = getStoredResults();
    items.push({
      teamName: result.teamName,
      rawScore: result.rawScore,
      rawMax: result.rawMax,
      scaled: Number(result.scaled.toFixed(2)),
      stationPoints: result.stationPoints,
      elapsedMs: result.elapsedMs,
      elapsedText: result.elapsedText,
      playedAt: new Date().toISOString(),
    });
    saveStoredResults(items);
  }

  function clearLeaderboard() {
    localStorage.removeItem(STORAGE_RESULTS_KEY);
    renderLeaderboard();
  }

  function renderLeaderboard() {
    if (!el.leaderboardBody || !el.leaderboardTable || !el.leaderboardEmpty) return;

    const items = sortResults(getStoredResults());
    clear(el.leaderboardBody);

    const hasRows = items.length > 0;
    el.leaderboardEmpty.classList.toggle("is-hidden", hasRows);
    el.leaderboardTable.classList.toggle("is-hidden", !hasRows);

    if (!hasRows) return;

    items.forEach((item, idx) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${escapeHtml(item.teamName || "Tým")}</td>
        <td><strong>${item.stationPoints ?? "-"}</strong></td>
        <td>${Number(item.scaled || 0).toFixed(2)}</td>
        <td>${item.rawScore ?? 0}</td>
        <td>${escapeHtml(item.elapsedText || formatTime(item.elapsedMs || 0))}</td>
      `;
      el.leaderboardBody.appendChild(tr);
    });
  }

  function exportResultsCsv() {
    const items = sortResults(getStoredResults());
    if (!items.length) {
      alert("V žebříčku zatím nejsou žádné výsledky.");
      return;
    }

    const header = [
      "poradi",
      "tym",
      "body_stanoviste",
      "prepocet",
      "raw_body",
      "raw_max",
      "cas",
      "odehrano",
    ];

    const rows = items.map((item, idx) => [
      idx + 1,
      item.teamName || "Tým",
      item.stationPoints ?? 0,
      Number(item.scaled || 0).toFixed(2),
      item.rawScore ?? 0,
      item.rawMax ?? 4900,
      item.elapsedText || formatTime(item.elapsedMs || 0),
      item.playedAt || "",
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(";"))
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pi-day-zebricek-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(value) {
    const text = String(value ?? "").replace(/"/g, '""');
    return `"${text}"`;
  }

  function escapeHtml(text) {
    return String(text ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderQuestionView(payload) {
    if (!payload) return;
    const modeLabel = payload.mode === "risk" ? "Riskuj" : "Bez risku";
    if (el.qStatus) el.qStatus.textContent = `${payload.topicName} • ${payload.points} b • ${modeLabel}`;
    if (el.qText) el.qText.textContent = payload.questionText || "";
    if (el.qAnswerBox) el.qAnswerBox.classList.add("is-hidden");
    if (el.qAnswer) el.qAnswer.textContent = payload.answerText || "";
  }

  function renderRules() {
    const items = window.Game?.getRulesData?.() || [];
    if (!el.rulesText) return;

    el.rulesText.innerHTML = `
      <div class="rules__list">
        ${items
          .map(
            (item) => `
          <div class="rules__item">
            <strong>${escapeHtml(item.title)}</strong>
            <div>${escapeHtml(item.text)}</div>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  function renderBoardAll(view) {
    if (!view || !el.boardColumns) return;

    if (el.boardProgress) el.boardProgress.textContent = view.progressText || "Otázky: 0/10";
    if (el.boardCounters) el.boardCounters.textContent = view.countersText || "";
    if (el.boardHint) el.boardHint.textContent = view.hint || "";
    if (el.boardTimer) el.boardTimer.textContent = `Čas: ${view.timerText || "00:00"}`;

    clear(el.boardColumns);

    const groups = view.groups;
    if (!groups?.A?.topics?.length) return;

    const topicCount = groups.A.topics.length;

    for (let i = 0; i < topicCount; i++) {
      const tA = groups.A.topics[i];
      const tB = groups.B.topics[i];
      const tC = groups.C.topics[i];

      const row = document.createElement("div");
      row.className = "topic-row";
      row.style.setProperty("--topic", tA.topicColor || "#3b82f6");

      const topicCard = document.createElement("div");
      topicCard.className = "topic-row__topic";
      topicCard.style.setProperty("--topic", tA.topicColor || "#3b82f6");

      const nm = document.createElement("div");
      nm.className = "topic-row__topicName";
      nm.textContent = tA.topicName;

      const mini = document.createElement("div");
      mini.className = "topic-row__topicMini";
      const remaining =
        tA.cards.filter((c) => !c.isDisabled).length +
        tB.cards.filter((c) => !c.isDisabled).length +
        tC.cards.filter((c) => !c.isDisabled).length;
      mini.textContent = `zbývá: ${remaining}`;

      topicCard.appendChild(nm);
      topicCard.appendChild(mini);

      const groupsWrap = document.createElement("div");
      groupsWrap.className = "topic-row__groups";

      ["A", "B", "C"].forEach((key) => {
        const group = groups[key];
        const topic = group.topics[i];

        const box = document.createElement("div");
        box.className = "group-box";
        box.dataset.group = key;

        const title = document.createElement("div");
        title.className = "group-box__title";
        title.textContent =
          key === "A" ? "A (100–200)" : key === "B" ? "B (300–400)" : "C (500)";

        const cardsWrap = document.createElement("div");
        cardsWrap.className = "group-box__cards";

        topic.cards.forEach((c) => {
          const art = document.createElement("article");
          art.className = "qcard";
          if (c.isDisabled) art.classList.add("is-disabled");

          art.dataset.topicId = c.topicId;
          art.dataset.points = String(c.points);
          art.style.setProperty("--topic", tA.topicColor || "#3b82f6");
          art.style.setProperty("--tint", String(tintForPoints(c.points)));

          const pts = document.createElement("div");
          pts.className = "qcard__points";
          pts.textContent = String(c.points);

          const actions = document.createElement("div");
          actions.className = "qcard__actions";

          const btnSafe = document.createElement("button");
          btnSafe.type = "button";
          btnSafe.className = "btn btn--small";
          btnSafe.textContent = "Bez risku";
          btnSafe.dataset.action = "safe";
          btnSafe.disabled = !c.safeEnabled;

          const btnRisk = document.createElement("button");
          btnRisk.type = "button";
          btnRisk.className = "btn btn--small btn--primary";
          btnRisk.textContent = "Riskuj";
          btnRisk.dataset.action = "risk";
          btnRisk.disabled = !c.riskEnabled;

          actions.appendChild(btnSafe);
          actions.appendChild(btnRisk);
          art.appendChild(pts);
          art.appendChild(actions);
          cardsWrap.appendChild(art);
        });

        box.appendChild(title);
        box.appendChild(cardsWrap);
        groupsWrap.appendChild(box);
      });

      row.appendChild(topicCard);
      row.appendChild(groupsWrap);
      el.boardColumns.appendChild(row);
    }
  }

  function refreshBoardFromGame() {
    if (!hasGame || typeof window.Game.getBoardView !== "function") return;
    const view = window.Game.getBoardView();
    renderBoardAll(view);
  }

  function startBoardTimer() {
    stopBoardTimer();
    AppState.timerId = window.setInterval(() => {
      if (screens.board?.classList.contains("is-active")) refreshBoardFromGame();
    }, 1000);
  }

  function stopBoardTimer() {
    if (AppState.timerId) {
      window.clearInterval(AppState.timerId);
      AppState.timerId = null;
    }
  }

  function handleStartGame() {
    AppState.teamName = (el.teamName?.value || "").trim() || "Tým";
    AppState.resultSavedForRun = false;

    const teacherSettings =
      hasTeacher && typeof window.Teacher.getSettings === "function"
        ? window.Teacher.getSettings()
        : null;

    window.Game?.init?.({ teamName: AppState.teamName, teacherSettings });
    renderRules();
    refreshBoardFromGame();
    startBoardTimer();
    showScreen("board");
  }

  function handleCardAction(topicId, points, mode) {
    const q = window.Game?.pickQuestion?.({ topicId, points, mode });
    if (!q) return;

    renderQuestionView(q);
    showScreen("question");
  }

  function handleRevealAnswer() {
    el.qAnswerBox?.classList.remove("is-hidden");
  }

  function showResultModal() {
    const r = window.Game?.getResult?.();
    if (!r) return;

    if (!AppState.resultSavedForRun) {
      addResultToLeaderboard(r);
      AppState.resultSavedForRun = true;
      renderLeaderboard();
    }

    const percent = Math.round(r.ratio * 100 * 10) / 10;

    el.resultBody.innerHTML = `
      <div class="result-grid">
        <div class="result-stat">
          <div class="result-stat__label">Tým</div>
          <div class="result-stat__value">${escapeHtml(r.teamName)}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat__label">RAW skóre</div>
          <div class="result-stat__value">${r.rawScore} / ${r.rawMax}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat__label">Přepočet</div>
          <div class="result-stat__value">${r.scaled.toFixed(2)}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat__label">Body stanoviště</div>
          <div class="result-stat__value">${r.stationPoints}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat__label">Celkový čas</div>
          <div class="result-stat__value">${escapeHtml(r.elapsedText)}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat__label">Úspěšnost</div>
          <div class="result-stat__value">${percent}%</div>
        </div>
      </div>
      <p class="muted">Výsledek byl uložen do lokálního žebříčku v tomto zařízení.</p>
    `;

    stopBoardTimer();
    openModal(resultModal);
  }

  function handleMarkAnswer(isCorrect) {
    window.Game?.resolveAnswer?.({ correct: isCorrect });

    if (window.Game?.isFinished?.()) {
      refreshBoardFromGame();
      showResultModal();
      return;
    }

    refreshBoardFromGame();
    showScreen("board");
  }

  function resetToBoard() {
    AppState.resultSavedForRun = false;
    window.Game?.reset?.();
    refreshBoardFromGame();
    startBoardTimer();
    showScreen("board");
  }

  function wireEvents() {
    on(el.btnOpenLeaderboard, "click", () => {
      renderLeaderboard();
      openModal(leaderboardModal);
    });

    on(el.btnCloseLeaderboard, "click", () => closeModal(leaderboardModal));

    on(el.btnStartGame, "click", handleStartGame);

    on(el.btnShowRules, "click", () => {
      renderRules();
      openModal(rulesModal);
    });

    on(el.btnCloseRules, "click", () => closeModal(rulesModal));

    on(el.btnBackToStart, "click", () => {
      stopBoardTimer();
      window.Game?.reset?.();
      showScreen("start");
      refreshBoardFromGame();
    });

    on(el.boardColumns, "click", (e) => {
      const btn = e.target?.closest?.("button[data-action]");
      if (!btn) return;

      const card = btn.closest(".qcard");
      if (!card || card.classList.contains("is-disabled")) return;

      const mode = btn.dataset.action;
      const topicId = card.dataset.topicId;
      const points = Number(card.dataset.points || "0");
      if (!topicId || !points) return;

      handleCardAction(topicId, points, mode);
    });

    on(el.btnCloseQuestion, "click", () => showScreen("board"));
    on(el.btnReveal, "click", handleRevealAnswer);
    on(el.btnMarkCorrect, "click", () => handleMarkAnswer(true));
    on(el.btnMarkWrong, "click", () => handleMarkAnswer(false));

    on(el.btnOpenTeacher, "click", () => {
      window.Teacher?.render?.({
        container: el.teacherTopicsList,
        hintEl: el.teacherHint,
      });
      openModal(teacherModal);
    });

    on(el.btnCloseTeacher, "click", () => closeModal(teacherModal));

    on(el.btnTeacherReset, "click", () => {
      window.Teacher?.reset?.();
      window.Teacher?.render?.({
        container: el.teacherTopicsList,
        hintEl: el.teacherHint,
      });
    });

    on(el.btnTeacherSave, "click", () => {
      window.Teacher?.saveFromUI?.();
      window.Teacher?.render?.({
        container: el.teacherTopicsList,
        hintEl: el.teacherHint,
      });
    });

    on(el.btnCloseResult, "click", () => closeModal(resultModal));

    on(el.btnNewGame, "click", () => {
      closeModal(resultModal);
      resetToBoard();
    });

    on(el.btnBackHome, "click", () => {
      closeModal(resultModal);
      stopBoardTimer();
      window.Game?.reset?.();
      showScreen("start");
    });

    on(el.btnExportCsv, "click", exportResultsCsv);
    on(el.btnResultExportCsv, "click", exportResultsCsv);

    on(el.btnClearLeaderboard, "click", () => {
      const ok = window.confirm("Opravdu smazat celý lokální žebříček?");
      if (ok) clearLeaderboard();
    });
  }

  function init() {
    wireEvents();
    renderRules();
    refreshBoardFromGame();
    showScreen("start");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
