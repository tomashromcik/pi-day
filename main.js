/* main.js
   Pí”di kvíz – starter controller (bez frameworků)
   - přepínání obrazovek
   - modaly (rules + teacher)
   - skeleton eventů pro hru
*/

(() => {
  "use strict";

  // ---------- DOM helpers ----------
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function on(el, ev, fn) {
    if (!el) return;
    el.addEventListener(ev, fn);
  }

  // ---------- Screens ----------
  const screens = {
    start: $("#screenStart"),
    board: $("#screenBoard"),
    question: $("#screenQuestion"),
  };

  function showScreen(name) {
    Object.values(screens).forEach(s => s && s.classList.remove("is-active"));
    if (!screens[name]) {
      console.warn("Unknown screen:", name);
      return;
    }
    screens[name].classList.add("is-active");
  }

  // ---------- Modals ----------
  const rulesModal = $("#rulesModal");
  const teacherModal = $("#teacherModal");

  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove("is-hidden");
    // jednoduchý "focus trap" zatím neděláme, jen UX minimum:
    document.body.style.overflow = "hidden";
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add("is-hidden");
    document.body.style.overflow = "";
  }

  function wireModalClose(modalEl) {
    if (!modalEl) return;
    // klik na backdrop (data-close-modal)
    on(modalEl, "click", (e) => {
      const closeHit = e.target && (e.target.hasAttribute("data-close-modal") || e.target.closest("[data-close-modal]"));
      if (closeHit) closeModal(modalEl);
    });
  }

  wireModalClose(rulesModal);
  wireModalClose(teacherModal);

  // ESC zavírá modaly
  on(document, "keydown", (e) => {
    if (e.key !== "Escape") return;
    if (rulesModal && !rulesModal.classList.contains("is-hidden")) closeModal(rulesModal);
    if (teacherModal && !teacherModal.classList.contains("is-hidden")) closeModal(teacherModal);
  });

  // ---------- State (starter) ----------
  const AppState = {
    teamName: "",
    activeTopicId: null, // zvolené téma v levém sloupci
    lastSelection: null, // např. { topicId, points, mode: "safe"|"risk" }
  };

  // ---------- Elements ----------
  const el = {
    // start
    teamName: $("#teamName"),
    btnStartGame: $("#btnStartGame"),
    btnShowRules: $("#btnShowRules"),
    startHint: $("#startHint"),

    // board
    btnBackToStart: $("#btnBackToStart"),
    topicsList: $("#topicsList"),
    questionGrid: $("#questionGrid"),
    topicMeta: $("#topicMeta"),
    gridMeta: $("#gridMeta"),
    gridTitle: $("#gridTitle"),
    boardHint: $("#boardHint"),

    // question view
    btnCloseQuestion: $("#btnCloseQuestion"),
    qStatus: $("#qStatus"),
    qTitle: $("#qTitle"),
    qText: $("#qText"),
    btnReveal: $("#btnReveal"),
    qAnswerBox: $("#qAnswerBox"),
    qAnswer: $("#qAnswer"),
    btnMarkCorrect: $("#btnMarkCorrect"),
    btnMarkWrong: $("#btnMarkWrong"),
    scoreBoard: $("#scoreBoard"),

    // modals
    btnCloseRules: $("#btnCloseRules"),
    rulesText: $("#rulesText"),

    btnOpenTeacher: $("#btnOpenTeacher"),
    btnCloseTeacher: $("#btnCloseTeacher"),
    btnTeacherReset: $("#btnTeacherReset"),
    btnTeacherSave: $("#btnTeacherSave"),
    teacherTopicsList: $("#teacherTopicsList"),
    teacherHint: $("#teacherHint"),
  };

  // ---------- External modules (placeholders) ----------
  // (v dalších krocích dodáme konkrétní implementace)
  const hasGame = typeof window.Game !== "undefined";
  const hasTeacher = typeof window.Teacher !== "undefined";

  // ---------- UI render skeleton ----------
  function renderStart() {
    if (el.teamName) el.teamName.value = AppState.teamName || "";
    if (el.startHint) el.startHint.textContent = "";
  }

  function renderBoard() {
    // Témata + grid budou renderovat data z Game/Teacher (zatím placeholder)
    // - renderTopics()
    // - renderGrid()
    if (el.boardHint) el.boardHint.textContent = "";
  }

  function renderQuestionView(payload) {
    // payload: { topicName, points, mode, questionText, answerText }
    if (!payload) return;

    if (el.qStatus) {
      const modeLabel = payload.mode === "risk" ? "Riskuj" : "Bez risku";
      el.qStatus.textContent = `${payload.topicName} • ${payload.points} b • ${modeLabel}`;
    }
    if (el.qTitle) el.qTitle.textContent = "Otázka";
    if (el.qText) el.qText.textContent = payload.questionText || "";

    if (el.qAnswerBox) el.qAnswerBox.classList.add("is-hidden");
    if (el.qAnswer) el.qAnswer.textContent = payload.answerText || "";
  }

  // ---------- Topics / grid rendering (skeleton) ----------
  function clear(node) {
    if (!node) return;
    node.innerHTML = "";
  }

  function renderTopics(topics) {
    // topics: [{id, name, color, remainingText, isDisabled, isActive}]
    clear(el.topicsList);
    if (!el.topicsList) return;

    topics.forEach(t => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "topic-card";
      if (t.isActive) btn.classList.add("is-active");
      if (t.isDisabled) btn.classList.add("is-disabled");
      if (t.color) btn.style.setProperty("--topic", t.color);

      btn.dataset.topicId = t.id;

      const name = document.createElement("span");
      name.className = "topic-card__name";
      name.textContent = t.name;

      const state = document.createElement("span");
      state.className = "topic-card__state";
      state.textContent = t.remainingText || "";

      btn.appendChild(name);
      btn.appendChild(state);
      el.topicsList.appendChild(btn);
    });
  }

  function renderGrid(cards) {
    // cards: [{topicId, points, tint, color, safeEnabled, riskEnabled, isDisabled}]
    clear(el.questionGrid);
    if (!el.questionGrid) return;

    cards.forEach(c => {
      const art = document.createElement("article");
      art.className = "qcard";
      if (c.isDisabled) art.classList.add("is-disabled");
      art.dataset.topicId = c.topicId;
      art.dataset.points = String(c.points);

      if (c.color) art.style.setProperty("--topic", c.color);
      if (typeof c.tint === "number") art.style.setProperty("--tint", String(c.tint));

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
      if (!c.safeEnabled) btnSafe.disabled = true;

      const btnRisk = document.createElement("button");
      btnRisk.type = "button";
      btnRisk.className = "btn btn--small btn--primary";
      btnRisk.textContent = "Riskuj";
      btnRisk.dataset.action = "risk";
      if (!c.riskEnabled) btnRisk.disabled = true;

      actions.appendChild(btnSafe);
      actions.appendChild(btnRisk);

      art.appendChild(pts);
      art.appendChild(actions);

      el.questionGrid.appendChild(art);
    });
  }

  // ---------- Event handlers ----------
  function handleStartGame() {
    AppState.teamName = (el.teamName?.value || "").trim();
    if (!AppState.teamName) AppState.teamName = "Tým";

    // Init game
    if (hasGame && typeof window.Game.init === "function") {
      // Teacher settings (povolená témata apod.)
      const teacherSettings = (hasTeacher && typeof window.Teacher.getSettings === "function")
        ? window.Teacher.getSettings()
        : null;

      window.Game.init({
        teamName: AppState.teamName,
        teacherSettings,
      });
    }

    // Render board with data from Game (zatím placeholder)
    refreshBoardFromGame();
    showScreen("board");
  }

  function refreshBoardFromGame() {
    // Tady bude jediný bod “překresli herní plochu”
    // 1) topics
    // 2) grid
    // 3) meta texty
    if (hasGame && typeof window.Game.getBoardView === "function") {
      const view = window.Game.getBoardView();
      // očekávání (můžeme upravit): { topics, cards, activeTopicId, meta }
      if (view?.topics) renderTopics(view.topics);
      if (view?.cards) renderGrid(view.cards);

      if (view?.meta?.topicMeta && el.topicMeta) el.topicMeta.textContent = view.meta.topicMeta;
      if (view?.meta?.gridMeta && el.gridMeta) el.gridMeta.textContent = view.meta.gridMeta;
      if (view?.meta?.gridTitle && el.gridTitle) el.gridTitle.textContent = view.meta.gridTitle;
      if (el.boardHint) el.boardHint.textContent = view?.meta?.hint || "";
      AppState.activeTopicId = view?.activeTopicId ?? AppState.activeTopicId;
      return;
    }

    // fallback, když Game ještě není: zobrazíme demo prázdno
    if (el.topicMeta) el.topicMeta.textContent = "";
    if (el.gridMeta) el.gridMeta.textContent = "Vyber téma vlevo";
    if (el.gridTitle) el.gridTitle.textContent = "Otázky";
    if (el.boardHint) el.boardHint.textContent = "";
    renderTopics([]);
    renderGrid([]);
  }

  function handleTopicClick(topicId) {
    AppState.activeTopicId = topicId;

    if (hasGame && typeof window.Game.selectTopic === "function") {
      window.Game.selectTopic(topicId);
    }
    refreshBoardFromGame();
  }

  function handleGridAction(topicId, points, mode) {
    // mode: "safe" | "risk"
    AppState.lastSelection = { topicId, points, mode };

    if (hasGame && typeof window.Game.pickQuestion === "function") {
      const q = window.Game.pickQuestion({ topicId, points, mode });
      // q: { topicName, points, mode, questionText, answerText }
      if (q) {
        renderQuestionView(q);
        showScreen("question");
      }
      return;
    }

    // fallback: bez Game modulu
    renderQuestionView({
      topicName: "Téma",
      points,
      mode,
      questionText: "Tady bude otázka… (game.js ještě není hotové)",
      answerText: "Tady bude odpověď…",
    });
    showScreen("question");
  }

  function handleRevealAnswer() {
    el.qAnswerBox?.classList.remove("is-hidden");
  }

  function handleMarkAnswer(isCorrect) {
    // předání výsledku do Game (bodování, vyčerpání, disable)
    if (hasGame && typeof window.Game.resolveAnswer === "function") {
      window.Game.resolveAnswer({ correct: isCorrect });
    }

    // update scoreboard + návrat na plochu
    if (hasGame && typeof window.Game.getScoreView === "function") {
      renderScore(window.Game.getScoreView());
    }
    refreshBoardFromGame();
    showScreen("board");
  }

  function renderScore(scoreView) {
    // scoreView: { lines: ["Tým: 120 b", ...] } nebo rovnou array stringů
    if (!el.scoreBoard) return;
    el.scoreBoard.innerHTML = "";

    const lines = Array.isArray(scoreView) ? scoreView : (scoreView?.lines || []);
    if (!lines.length) {
      const d = document.createElement("div");
      d.className = "muted";
      d.textContent = "Zatím žádné skóre.";
      el.scoreBoard.appendChild(d);
      return;
    }

    lines.forEach(txt => {
      const row = document.createElement("div");
      row.className = "panel";
      row.style.padding = "10px 12px";
      row.textContent = txt;
      el.scoreBoard.appendChild(row);
    });
  }

  // ---------- Wiring ----------
  function wireEvents() {
    // Start screen
    on(el.btnStartGame, "click", handleStartGame);
    on(el.btnShowRules, "click", () => openModal(rulesModal));
    on(el.btnCloseRules, "click", () => closeModal(rulesModal));

    // Board
    on(el.btnBackToStart, "click", () => {
      // zatím "ukončit" = zpět na start (reset hry se řeší v Game)
      if (hasGame && typeof window.Game.reset === "function") window.Game.reset();
      showScreen("start");
      renderStart();
    });

    // Delegace kliků: topics list
    on(el.topicsList, "click", (e) => {
      const btn = e.target?.closest?.(".topic-card");
      if (!btn) return;
      if (btn.classList.contains("is-disabled")) return;

      const topicId = btn.dataset.topicId;
      if (topicId) handleTopicClick(topicId);
    });

    // Delegace kliků: question grid (Bez risku / Riskuj)
    on(el.questionGrid, "click", (e) => {
      const actionBtn = e.target?.closest?.("button[data-action]");
      if (!actionBtn) return;

      const card = actionBtn.closest(".qcard");
      if (!card || card.classList.contains("is-disabled")) return;

      const mode = actionBtn.dataset.action; // "safe" | "risk"
      const topicId = card.dataset.topicId;
      const points = Number(card.dataset.points || "0");

      if (!topicId || !points || (mode !== "safe" && mode !== "risk")) return;

      handleGridAction(topicId, points, mode);
    });

    // Question screen
    on(el.btnCloseQuestion, "click", () => {
      // návrat bez vyhodnocení (pokud chcete zakázat, vyřešíme později)
      showScreen("board");
    });
    on(el.btnReveal, "click", handleRevealAnswer);
    on(el.btnMarkCorrect, "click", () => handleMarkAnswer(true));
    on(el.btnMarkWrong, "click", () => handleMarkAnswer(false));

    // Teacher modal
    on(el.btnOpenTeacher, "click", () => {
      // před otevřením načti aktuální nastavení
      if (hasTeacher && typeof window.Teacher.render === "function") {
        window.Teacher.render({
          container: el.teacherTopicsList,
          hintEl: el.teacherHint,
        });
      }
      openModal(teacherModal);
    });

    on(el.btnCloseTeacher, "click", () => closeModal(teacherModal));
    on(el.btnTeacherReset, "click", () => {
      if (hasTeacher && typeof window.Teacher.reset === "function") {
        window.Teacher.reset();
        window.Teacher.render({ container: el.teacherTopicsList, hintEl: el.teacherHint });
      }
    });
    on(el.btnTeacherSave, "click", () => {
      if (hasTeacher && typeof window.Teacher.saveFromUI === "function") {
        window.Teacher.saveFromUI();
        window.Teacher.render({ container: el.teacherTopicsList, hintEl: el.teacherHint });
      }
    });
  }

  // ---------- Init ----------
  function init() {
    wireEvents();
    renderStart();
    showScreen("start");

    // kdybychom chtěli hned načíst pravidla z Game/Data:
    // if (hasGame && typeof window.Game.getRulesText === "function") { ... }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
