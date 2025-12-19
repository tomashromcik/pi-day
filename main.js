/* main.js
   - přepínání obrazovek
   - modaly (rules + teacher + result)
   - board: 3 sloupce A/B/C, všechna témata najednou
*/

(() => {
  "use strict";

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

  // Modals
  const rulesModal = $("#rulesModal");
  const teacherModal = $("#teacherModal");
  const resultModal = $("#resultModal");

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
      const closeHit = e.target && (e.target.hasAttribute("data-close-modal") || e.target.closest("[data-close-modal]"));
      if (closeHit) closeModal(modalEl);
    });
  }

  wireModalClose(rulesModal);
  wireModalClose(teacherModal);
  wireModalClose(resultModal);

  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    if (rulesModal && !rulesModal.classList.contains("is-hidden")) closeModal(rulesModal);
    if (teacherModal && !teacherModal.classList.contains("is-hidden")) closeModal(teacherModal);
    if (resultModal && !resultModal.classList.contains("is-hidden")) closeModal(resultModal);
  });

  const AppState = { teamName: "" };

  const el = {
    // start
    teamName: $("#teamName"),
    btnStartGame: $("#btnStartGame"),
    btnShowRules: $("#btnShowRules"),
    startHint: $("#startHint"),

    // board
    btnBackToStart: $("#btnBackToStart"),
    boardColumns: $("#boardColumns"),
    boardProgress: $("#boardProgress"),
    boardCounters: $("#boardCounters"),
    boardHint: $("#boardHint"),

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
  };

  const hasGame = typeof window.Game !== "undefined";
  const hasTeacher = typeof window.Teacher !== "undefined";

  function renderQuestionView(payload) {
    if (!payload) return;
    const modeLabel = payload.mode === "risk" ? "Riskuj" : "Bez risku";
    if (el.qStatus) el.qStatus.textContent = `${payload.topicName} • ${payload.points} b • ${modeLabel}`;
    if (el.qText) el.qText.textContent = payload.questionText || "";
    if (el.qAnswerBox) el.qAnswerBox.classList.add("is-hidden");
    if (el.qAnswer) el.qAnswer.textContent = payload.answerText || "";
  }

  function clear(node) { if (node) node.innerHTML = ""; }

  function tintForPoints(points) {
    // jen vizuál (A/B/C působí hezky i bez dalších barev)
    if (points === 100) return 0.12;
    if (points === 200) return 0.16;
    if (points === 300) return 0.20;
    if (points === 400) return 0.24;
    if (points === 500) return 0.30;
    return 0.14;
  }

  function renderBoardAll(view) {
    if (!view || !el.boardColumns) return;

    if (el.boardProgress) el.boardProgress.textContent = view.progressText || "Otázky: 0/10";
    if (el.boardCounters) el.boardCounters.textContent = view.countersText || "";
    if (el.boardHint) el.boardHint.textContent = view.hint || "";

    clear(el.boardColumns);

    // pořadí sloupců A, B, C
    const order = ["A", "B", "C"];
    order.forEach(groupKey => {
      const g = view.groups?.[groupKey];
      if (!g) return;

      const col = document.createElement("div");
      col.className = "group-col";

      const title = document.createElement("h3");
      title.className = "group-col__title";
      title.textContent = g.title;
      col.appendChild(title);

      g.topics.forEach(t => {
        const box = document.createElement("section");
        box.className = "topic-box";
        box.style.setProperty("--topic", t.topicColor || "#3b82f6");

        const head = document.createElement("div");
        head.className = "topic-box__head";

        const name = document.createElement("div");
        name.className = "topic-box__name";
        name.textContent = t.topicName;

        const mini = document.createElement("div");
        mini.className = "topic-box__mini";
        mini.textContent = ""; // můžeš sem dát třeba "zbývá …"

        head.appendChild(name);
        head.appendChild(mini);

        const cardsWrap = document.createElement("div");
        cardsWrap.className = "topic-box__cards";

        t.cards.forEach(c => {
          const art = document.createElement("article");
          art.className = "qcard";
          if (c.isDisabled) art.classList.add("is-disabled");
          art.dataset.topicId = c.topicId;
          art.dataset.points = String(c.points);

          art.style.setProperty("--topic", t.topicColor || "#3b82f6");
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

        box.appendChild(head);
        box.appendChild(cardsWrap);
        col.appendChild(box);
      });

      el.boardColumns.appendChild(col);
    });
  }

  function refreshBoardFromGame() {
    if (!hasGame || typeof window.Game.getBoardView !== "function") return;
    const view = window.Game.getBoardView();
    renderBoardAll(view);
  }

  function handleStartGame() {
    AppState.teamName = (el.teamName?.value || "").trim() || "Tým";

    const teacherSettings = (hasTeacher && typeof window.Teacher.getSettings === "function")
      ? window.Teacher.getSettings()
      : null;

    window.Game?.init?.({ teamName: AppState.teamName, teacherSettings });
    refreshBoardFromGame();
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

    const percent = Math.round((r.ratio * 100) * 10) / 10;

    el.resultBody.innerHTML = `
      <p><b>RAW skóre:</b> ${r.rawScore} / ${r.rawMax}</p>
      <p><b>Přepočet:</b> (${r.rawScore} / ${r.rawMax}) × 20 = ${r.scaled.toFixed(2)}</p>
      <p><b>Zaokrouhleno nahoru:</b> <span style="font-size:18px;font-weight:900;">${r.stationPoints} bodů</span></p>
      <p class="muted">Úspěšnost: ${percent}%</p>
    `;

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

  function wireEvents() {
    // start
    on(el.btnStartGame, "click", handleStartGame);
    on(el.btnShowRules, "click", () => openModal(rulesModal));
    on(el.btnCloseRules, "click", () => closeModal(rulesModal));

    // board
    on(el.btnBackToStart, "click", () => {
      window.Game?.reset?.();
      showScreen("start");
    });

    // delegace kliků na kartách (vše v boardColumns)
    on(el.boardColumns, "click", (e) => {
      const btn = e.target?.closest?.("button[data-action]");
      if (!btn) return;

      const card = btn.closest(".qcard");
      if (!card || card.classList.contains("is-disabled")) return;

      const mode = btn.dataset.action; // safe | risk
      const topicId = card.dataset.topicId;
      const points = Number(card.dataset.points || "0");
      if (!topicId || !points) return;

      handleCardAction(topicId, points, mode);
    });

    // question
    on(el.btnCloseQuestion, "click", () => showScreen("board"));
    on(el.btnReveal, "click", handleRevealAnswer);
    on(el.btnMarkCorrect, "click", () => handleMarkAnswer(true));
    on(el.btnMarkWrong, "click", () => handleMarkAnswer(false));

    // teacher
    on(el.btnOpenTeacher, "click", () => {
      window.Teacher?.render?.({ container: el.teacherTopicsList, hintEl: el.teacherHint });
      openModal(teacherModal);
    });
    on(el.btnCloseTeacher, "click", () => closeModal(teacherModal));
    on(el.btnTeacherReset, "click", () => {
      window.Teacher?.reset?.();
      window.Teacher?.render?.({ container: el.teacherTopicsList, hintEl: el.teacherHint });
    });
    on(el.btnTeacherSave, "click", () => {
      window.Teacher?.saveFromUI?.();
      window.Teacher?.render?.({ container: el.teacherTopicsList, hintEl: el.teacherHint });
    });

    // result modal
    on(el.btnCloseResult, "click", () => closeModal(resultModal));
    on(el.btnNewGame, "click", () => {
      closeModal(resultModal);
      window.Game?.reset?.();
      refreshBoardFromGame();
      showScreen("board");
    });
    on(el.btnBackHome, "click", () => {
      closeModal(resultModal);
      window.Game?.reset?.();
      showScreen("start");
    });
  }

  function init() {
    wireEvents();
    showScreen("start");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
