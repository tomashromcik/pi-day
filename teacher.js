/* teacher.js
   Učitelský modul (LOCAL)
   - povolená témata (enable/disable)
   - ukládá do localStorage pro dané zařízení
   - bez zabezpečení (zatím)
*/

(function () {
  "use strict";

  const STORAGE_KEY = "pidikviz.teacher.v1";

  // v paměti (single source of truth pro teacher nastavení)
  const state = {
    // allowedTopicIds: null => default = vše povoleno
    allowedTopicIds: null,
    // poslední napojené UI
    ui: {
      container: null,
      hintEl: null,
    },
  };

  // ---------- helpers ----------
  function safeParse(json, fallback) {
    try { return JSON.parse(json); } catch { return fallback; }
  }

  function getAllTopicIds() {
    return (window.DATA?.TOPICS || []).map(t => t.id);
  }

  function normalizeAllowed(ids) {
    if (!Array.isArray(ids)) return null;
    const set = new Set(getAllTopicIds());
    const cleaned = ids.filter(id => set.has(id));
    // když je to stejné jako "vše", ukládej radši null (jednodušší)
    if (cleaned.length === set.size) return null;
    return cleaned;
  }

  // ---------- storage ----------
  function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const data = safeParse(raw, null);
    if (!data || typeof data !== "object") return;

    state.allowedTopicIds = normalizeAllowed(data.allowedTopicIds);
  }

  function saveToStorage() {
    const payload = {
      allowedTopicIds: state.allowedTopicIds, // null nebo array
      savedAt: new Date().toISOString(),
      dataVersion: window.DATA?.VERSION || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  // ---------- public API ----------
  function getSettings() {
    // Vrací vždy explicitní seznam povolených témat (pro game.js)
    const all = getAllTopicIds();
    const allowed = state.allowedTopicIds ? state.allowedTopicIds.slice() : all.slice();
    return { allowedTopicIds: allowed };
  }

  function isTopicAllowed(topicId) {
    if (!topicId) return false;
    if (!state.allowedTopicIds) return true; // default vše povoleno
    return state.allowedTopicIds.includes(topicId);
  }

  // ---------- UI rendering ----------
  function setHint(text) {
    if (!state.ui.hintEl) return;
    state.ui.hintEl.textContent = text || "";
  }

  function ensureUIBound(container, hintEl) {
    state.ui.container = container || state.ui.container;
    state.ui.hintEl = hintEl || state.ui.hintEl;
  }

  function render({ container, hintEl } = {}) {
    ensureUIBound(container, hintEl);
    const root = state.ui.container;
    if (!root) return;

    const topics = window.DATA?.TOPICS || [];
    root.innerHTML = "";

    if (!topics.length) {
      const p = document.createElement("div");
      p.className = "muted";
      p.textContent = "Nenalezena žádná témata (DATA.TOPICS je prázdné).";
      root.appendChild(p);
      setHint("");
      return;
    }

    // nadpisek
    const info = document.createElement("div");
    info.className = "muted";
    info.style.marginBottom = "10px";
    info.textContent = "Přepínačem povolíš/zakážeš téma pro toto zařízení.";
    root.appendChild(info);

    topics.forEach(t => {
      const row = document.createElement("div");
      row.className = "teacher-row";
      row.style.display = "grid";
      row.style.gridTemplateColumns = "1fr auto";
      row.style.alignItems = "center";
      row.style.gap = "10px";
      row.style.padding = "10px 12px";
      row.style.borderRadius = "12px";
      row.style.border = "1px solid rgba(255,255,255,0.10)";
      row.style.background = "rgba(255,255,255,0.02)";

      // levá část (barevný puntík + název)
      const left = document.createElement("div");
      left.style.display = "flex";
      left.style.alignItems = "center";
      left.style.gap = "10px";

      const dot = document.createElement("span");
      dot.style.width = "12px";
      dot.style.height = "12px";
      dot.style.borderRadius = "999px";
      dot.style.background = t.color || "#3b82f6";
      dot.style.boxShadow = "0 0 0 4px rgba(255,255,255,0.06)";
      dot.setAttribute("aria-hidden", "true");

      const name = document.createElement("div");
      name.style.fontWeight = "800";
      name.textContent = t.name;

      left.appendChild(dot);
      left.appendChild(name);

      // pravá část (toggle)
      const toggleWrap = document.createElement("label");
      toggleWrap.style.display = "inline-flex";
      toggleWrap.style.alignItems = "center";
      toggleWrap.style.gap = "8px";
      toggleWrap.style.cursor = "pointer";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.dataset.topicId = t.id;
      checkbox.checked = isTopicAllowed(t.id);
      checkbox.style.width = "18px";
      checkbox.style.height = "18px";

      const labelTxt = document.createElement("span");
      labelTxt.className = "muted";
      labelTxt.style.fontSize = "13px";
      labelTxt.textContent = checkbox.checked ? "povoleno" : "zakázáno";

      on(checkbox, "change", () => {
        labelTxt.textContent = checkbox.checked ? "povoleno" : "zakázáno";
        setHint("Nezapomeň kliknout na Uložit.");
      });

      toggleWrap.appendChild(checkbox);
      toggleWrap.appendChild(labelTxt);

      row.appendChild(left);
      row.appendChild(toggleWrap);

      root.appendChild(row);
    });

    // hint
    const allowed = getSettings().allowedTopicIds.length;
    setHint(`Povoleno témat: ${allowed}/${topics.length}`);
  }

  function saveFromUI() {
    const root = state.ui.container;
    if (!root) return;

    const all = getAllTopicIds();
    const checked = $$("input[type='checkbox'][data-topic-id]", root)
      .filter(ch => ch.checked)
      .map(ch => ch.dataset.topicId);

    // ochrana: nenecháme zakázat všechno (můžeš změnit, pokud chceš)
    if (checked.length === 0) {
      setHint("Musí být povoleno alespoň 1 téma.");
      // vrátíme stav v UI podle aktuálního nastavení
      render({});
      return;
    }

    state.allowedTopicIds = normalizeAllowed(checked);
    saveToStorage();

    const allowedCount = getSettings().allowedTopicIds.length;
    setHint(`Uloženo. Povoleno témat: ${allowedCount}/${all.length}`);
  }

  function reset() {
    state.allowedTopicIds = null; // vše povoleno
    localStorage.removeItem(STORAGE_KEY);
    setHint("Resetováno na výchozí stav (všechna témata povolena).");
  }

  // ---------- tiny DOM helpers (lokální, aby nebyla závislost na main.js) ----------
  function $(sel, root = document) { return root.querySelector(sel); }
  function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }
  function on(el, ev, fn) { if (el) el.addEventListener(ev, fn); }

  // ---------- init ----------
  loadFromStorage();

  // Expose
  window.Teacher = {
    getSettings,
    render,
    saveFromUI,
    reset,
  };
})();
