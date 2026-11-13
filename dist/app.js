import { profile, slides, topics } from "./content.js";
import { icon } from "./icons.js";
import { createBackup, limits, mergeBackup, normalizeStudy, readStudy, storageKey, writeStudy } from "./storage.js";
import {
  categoryOptions, dateText, escapeHtml, findQuestion, formatClock, getQuestions, navigation,
  renderAnswers, renderFlashcards, renderMock, renderOverview, renderPresentation, renderProject,
  renderQuestionBank, renderQuestionResults, renderTopics, renderTraining,
} from "./views.js";

const main = document.querySelector("#main-content");
const nav = document.querySelector("#navigation");
const shell = document.querySelector("#shell");
const menu = document.querySelector("#menu-toggle");
const dialog = document.querySelector("#editor");
const dialogContent = document.querySelector("#editor-content");
const backupInput = document.querySelector("#backup-file");
const toast = document.querySelector("#toast");
const labels = new Map(navigation.flatMap(group => group.links.map(([id, label]) => [id, label])));
const bankFilter = { search: "", category: "all" };
const deck = { category: "all", index: 0, revealed: false };
const mockSettings = { category: "all", count: 5, seconds: 60 };
const noteDrafts = new Map();

let state = readStudy() ?? normalizeStudy({});
let route = getRoute();
let dirtyMemory = false;
let storageNoticeShown = false;
let toastTimeout;
let mockSummary = null;
let answerPrompt = null;

function getRoute() {
  const [page, id = ""] = location.hash.slice(1).split("/");
  return { page: labels.has(page) ? page : "overview", id };
}

function setupShell() {
  document.querySelector("#brand").innerHTML = `<span class="brand-icon">${icon("cap")}</span>
    <span><strong>SIWES Defense</strong><small>AFIT · Computer Science</small></span>`;
  document.querySelector("#sidebar-profile").innerHTML = `<span class="avatar sidebar-avatar" aria-hidden="true">AA</span>
    <div><strong>${profile.name}</strong><small>400 Level</small></div>`;
  document.querySelector("#topbar-meta").innerHTML = `<span class="level-chip">${icon("cap")} 400 Level</span>
    <span class="avatar header-avatar" aria-hidden="true">AA</span>`;
  menu.innerHTML = icon("menu");
}

function renderShell() {
  const focused = nav.contains(document.activeElement) ? document.activeElement.getAttribute("href") : null;
  nav.innerHTML = navigation.map(group => `<div class="nav-group">
    <p>${group.label}</p>
    ${group.links.map(([id, label, symbol]) => `<a href="#${id}"${route.page === id ? ' aria-current="page"' : ""}>
      ${icon(symbol)}<span>${label}</span>${route.page === id ? '<span class="nav-dot"></span>' : ""}
    </a>`).join("")}
  </div>`).join("");
  if (focused && shell.classList.contains("menu-open")) nav.querySelector(`[href="${focused}"]`)?.focus();
  const detail = route.page === "topics" ? topics.find(item => item.id === route.id)?.title : "";
  document.querySelector("#breadcrumb").innerHTML = `<a href="#overview">SIWES Defense</a>${icon("chevron")}
    <span>${labels.get(route.page)}</span>${detail ? `${icon("chevron")}<span class="breadcrumb-detail">${detail}</span>` : ""}`;
  document.title = `${detail || labels.get(route.page)} · AFIT SIWES Defense Studio`;
}

function openedQuestions() {
  return new Set([...main.querySelectorAll("details[data-question][open]")].map(item => item.dataset.question));
}

function render(focusSelector) {
  const content = {
    overview: () => renderOverview(state),
    training: () => renderTraining(state, noteDrafts),
    topics: () => renderTopics(state, route.id, noteDrafts),
    project: () => renderProject(state, noteDrafts),
    presentation: () => renderPresentation(state, route.id, noteDrafts),
    flashcards: () => renderFlashcards(state, deck),
    mock: () => renderMock(state, mockSummary, mockSettings),
    questions: () => renderQuestionBank(state, bankFilter, openedQuestions()),
    answers: () => renderAnswers(state),
  };
  main.innerHTML = content[route.page]();
  const slideNav = main.querySelector(".slide-nav");
  if (slideNav && slideNav.scrollWidth > slideNav.clientWidth) {
    const activeSlide = slideNav.querySelector('[aria-current="step"]');
    const left = activeSlide.getBoundingClientRect().left - slideNav.getBoundingClientRect().left;
    if (left + activeSlide.offsetWidth > slideNav.clientWidth) slideNav.scrollLeft += left - 7;
  }
  if (focusSelector) main.querySelector(focusSelector)?.focus({ preventScroll: true });
}

function renderBankResults() {
  const results = document.querySelector("#question-results");
  if (results) results.innerHTML = renderQuestionResults(state, bankFilter, openedQuestions());
}

function showToast(message) {
  clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.hidden = false;
  toastTimeout = setTimeout(() => { toast.hidden = true; }, 3700);
}

function changeStudy(mutate) {
  const latest = dirtyMemory ? null : readStudy();
  if (latest) state = latest;
  if (mutate(state) === false) return false;
  dirtyMemory = !writeStudy(state);
  if (dirtyMemory && !storageNoticeShown) {
    storageNoticeShown = true;
    showToast("Browser storage is unavailable. Export a study backup to keep your changes.");
  }
  return true;
}

function showSaved(message) {
  showToast(dirtyMemory ? "Kept for this tab. Export a backup to keep your changes." : message);
}

function toggleMenu(open, focus = true) {
  shell.classList.toggle("menu-open", open);
  menu.setAttribute("aria-expanded", String(open));
  menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menu.innerHTML = icon(open ? "close" : "menu");
  if (focus && open) nav.querySelector('[aria-current="page"]')?.focus();
  if (focus && !open) menu.focus();
}

function handleRoute() {
  const previousPage = route.page;
  route = getRoute();
  if (previousPage !== route.page) mockSummary = null;
  if (dialog.open) dialog.close();
  toggleMenu(false, false);
  renderShell();
  render();
  window.scrollTo(0, 0);
  main.focus({ preventScroll: true });
  tick();
}

function toggleProgress(collection, id, action) {
  changeStudy(current => {
    const list = current[collection];
    current[collection] = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
  });
  render(`[data-action="${action}"][data-id="${id}"]`);
}

function jumpCard(offset) {
  const total = getQuestions(state, deck.category, true).length;
  deck.index = Math.max(0, Math.min(total - 1, deck.index + offset));
  deck.revealed = false;
  render("#flash-title");
}

function uniqueId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function shuffled(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startMock(form) {
  const inputs = new FormData(form);
  const seconds = Number(inputs.get("seconds"));
  const count = Number(inputs.get("count"));
  const category = String(inputs.get("topic"));
  const now = Date.now();
  const started = changeStudy(current => {
    if (current.active) return false;
    const items = shuffled(getQuestions(current, category)).slice(0, count);
    if (!items.length) return false;
    current.active = {
      id: uniqueId("mock"), items, index: 0, seconds, startedAt: now, questionStartedAt: now,
      deadline: now + seconds * 1000, draft: "", results: [],
    };
  });
  mockSummary = null;
  render("#mock-question");
  if (started) showToast("Mock defense started.");
}

function changeActive(mutate) {
  const expected = state.active;
  if (!expected) return false;
  return changeStudy(current => {
    const active = current.active;
    if (!active || active.id !== expected.id || active.index !== expected.index) return false;
    return mutate(active, current);
  });
}

function settleQuestion(status) {
  const changed = changeActive(active => {
    if (active.results.length > active.index) return false;
    const now = Date.now();
    const elapsed = Math.max(0, Math.min(active.seconds, Math.ceil((now - active.questionStartedAt) / 1000)));
    active.results.push({ status: now >= active.deadline ? "timed-out" : status, elapsed });
  });
  if (changed && route.page === "mock") {
    const wasDrafting = document.activeElement?.id === "mock-draft";
    const cursor = wasDrafting ? document.activeElement.selectionStart : null;
    render(wasDrafting ? "#mock-draft" : "#mock-review");
    if (wasDrafting) {
      document.querySelector("#mock-draft")?.setSelectionRange(cursor, cursor);
      showToast("Time is up. Review the suggested answer.");
    }
  }
}

function nextQuestion() {
  const changed = changeActive((active, current) => {
    if (active.results.length <= active.index) return false;
    if (active.index + 1 === active.items.length) {
      mockSummary = {
        id: active.id, completedAt: Date.now(), total: active.items.length, seconds: active.seconds,
        attempted: active.results.filter(result => result.status !== "skipped").length,
        timedOut: active.results.filter(result => result.status === "timed-out").length,
      };
      current.history.unshift(mockSummary);
      current.active = null;
    } else {
      active.index += 1;
      active.draft = "";
      active.questionStartedAt = Date.now();
      active.deadline = active.questionStartedAt + active.seconds * 1000;
    }
  });
  if (changed) render(mockSummary ? "#session-complete" : "#mock-question");
}

function tick() {
  const active = state.active;
  if (!active || active.results.length > active.index) return;
  const remaining = Math.max(0, Math.min(active.seconds, Math.ceil((active.deadline - Date.now()) / 1000)));
  if (!remaining) {
    settleQuestion("timed-out");
    return;
  }
  if (route.page !== "mock") return;
  const label = document.querySelector("#timer-value");
  if (label && label.textContent !== formatClock(remaining)) {
    label.textContent = formatClock(remaining);
    document.querySelector("#timer-bar").style.width = `${100 * remaining / active.seconds}%`;
    document.querySelector("#mock-timer").classList.toggle("timer-low", remaining <= 10);
  }
}

function showEditor(markup, focusSelector) {
  dialogContent.innerHTML = markup;
  if (!dialog.open) dialog.showModal();
  dialogContent.querySelector(focusSelector)?.focus();
}

function editorHeader(title, description = "") {
  return `<div class="editor-header">
    <div><h2 id="editor-title">${title}</h2>${description ? `<p>${escapeHtml(description)}</p>` : ""}</div>
    <button class="icon-button editor-close" type="button" data-action="close-editor" aria-label="Close dialog">${icon("close")}</button>
  </div>`;
}

function removeSection(label, body, action, id) {
  return `<details class="remove-section"><summary>${label}</summary><p>${body}</p>
    <button class="button button-danger button-small" type="button" data-action="${action}" data-id="${id}">${icon("trash")} ${label}</button>
  </details>`;
}

function openAnswer(id, draft, snapshot) {
  const saved = state.answers[id];
  const prompt = findQuestion(state, id) ?? snapshot ?? (saved && {
    id, question: saved.question || "Custom question", category: saved.category, answer: "",
  });
  if (!prompt) return;
  answerPrompt = prompt;
  showEditor(`${editorHeader(saved ? "Edit my answer" : "Write my answer", prompt.question)}
    <form data-form="answer">
      ${prompt.answer ? `<details class="dialog-guidance"><summary>Show suggested answer</summary><p>${escapeHtml(prompt.answer)}</p></details>` : ""}
      <label class="field-label" for="answer-text">Your answer</label>
      <textarea id="answer-text" rows="7" maxlength="${limits.response}" required placeholder="Write the response you would give to the panel.">${escapeHtml(draft ?? saved?.text ?? "")}</textarea>
      <div class="editor-actions">
        <button class="button button-secondary" type="button" data-action="close-editor">Cancel</button>
        <button class="button button-primary" type="submit">${icon("check")} Save answer</button>
      </div>
    </form>
    ${saved ? removeSection("Remove saved answer", "This deletes the response from My answers.", "remove-answer", id) : ""}`,
  "#answer-text");
}

function openQuestion(id) {
  const item = state.custom.find(question => question.id === id);
  if (!item && state.custom.length >= limits.custom) {
    showToast("The question bank can hold up to 100 custom questions.");
    return;
  }
  const category = item?.category ?? (bankFilter.category === "all" ? "panel" : bankFilter.category);
  showEditor(`${editorHeader(item ? "Edit custom question" : "Add a question")}
    <form data-form="custom-question"${item ? ` data-id="${item.id}"` : ""}>
      <div class="form-field"><label for="custom-topic">Topic</label><select id="custom-topic" name="category">${categoryOptions(category, false)}</select></div>
      <div class="form-field"><label for="custom-prompt">Question</label>
        <textarea id="custom-prompt" name="question" rows="2" maxlength="${limits.question}" required placeholder="What might the panel ask?">${escapeHtml(item?.question ?? "")}</textarea></div>
      <div class="form-field"><label for="custom-suggestion">Suggested answer <span>(optional)</span></label>
        <textarea id="custom-suggestion" name="answer" rows="4" maxlength="${limits.response}" placeholder="Add key points to use this question as a flashcard.">${escapeHtml(item?.answer ?? "")}</textarea></div>
      <div class="editor-actions">
        <button class="button button-secondary" type="button" data-action="close-editor">Cancel</button>
        <button class="button button-primary" type="submit">${icon("check")} Save question</button>
      </div>
    </form>
    ${item ? removeSection("Remove custom question", "This removes the question from the bank and practice modes.", "remove-question", id) : ""}`,
  "#custom-prompt");
}

function confirmEnd() {
  showEditor(`${editorHeader("End mock session?", "Only completed sessions appear in your history.")}
    <div class="editor-actions">
      <button class="button button-secondary" type="button" data-action="close-editor">Continue session</button>
      <button class="button button-danger" type="button" data-action="confirm-end">End session</button>
    </div>`, '[data-action="close-editor"].button');
}

function saveAnswer(form) {
  if (!answerPrompt) return;
  const field = form.querySelector("textarea");
  const text = field.value.trim();
  if (!text) {
    field.setCustomValidity("Enter a response before saving.");
    field.reportValidity();
    return;
  }
  const { id, question, category } = answerPrompt;
  changeStudy(current => {
    current.answers[id] = { text, question, category, updatedAt: Date.now() };
  });
  dialog.close();
  render(route.page === "mock" ? '[data-action="save-mock"]' : `[data-action="edit-answer"][data-id="${id}"]`);
  showSaved("Answer saved to My answers.");
}

function saveQuestion(form) {
  const fields = new FormData(form);
  const question = String(fields.get("question")).trim();
  const answer = String(fields.get("answer")).trim();
  const category = String(fields.get("category"));
  const id = form.dataset.id ?? uniqueId("custom");
  if (!question) {
    const field = form.querySelector("#custom-prompt");
    field.setCustomValidity("Enter a question before saving.");
    field.reportValidity();
    return;
  }
  const changed = changeStudy(current => {
    const index = current.custom.findIndex(item => item.id === id);
    if (index < 0 && current.custom.length >= limits.custom) return false;
    const item = { id, category, question, answer, updatedAt: Date.now() };
    if (index < 0) current.custom.unshift(item);
    else {
      if (current.custom[index].answer !== answer) current.mastered = current.mastered.filter(card => card !== id);
      current.custom[index] = item;
    }
  });
  if (!changed) {
    showToast("The question bank can hold up to 100 custom questions.");
    return;
  }
  dialog.close();
  bankFilter.search = "";
  if (bankFilter.category !== "all") bankFilter.category = category;
  render();
  const saved = main.querySelector(`[data-question="${id}"]`);
  if (saved) {
    saved.open = true;
    saved.querySelector("summary").focus();
  }
  showSaved("Custom question saved.");
}

function saveNote(form) {
  const id = form.dataset.id;
  const field = form.querySelector("textarea");
  const text = field.value;
  const updatedAt = Date.now();
  changeStudy(current => { current.notes[id] = { text, updatedAt }; });
  noteDrafts.delete(id);
  form.querySelector("[data-note-status]").textContent = dirtyMemory ? "Kept for this tab" : `Saved ${dateText(updatedAt)}`;
  showSaved("Notes saved.");
}

function runScores(form) {
  const raw = String(new FormData(form).get("scores")).trim();
  const parts = raw ? raw.split(",").map(part => part.trim()) : [];
  const values = parts.map(Number);
  const valid = values.every((value, index) => /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(parts[index]) && value >= 0 && value <= 100);
  const output = document.querySelector("#score-output");
  const title = output.querySelector("span");
  const body = output.querySelector("pre");
  output.classList.toggle("score-error", !valid);
  title.textContent = valid ? "Simulated output" : "Check your input";
  if (!valid) {
    body.textContent = "Enter comma-separated numbers between 0 and 100.";
  } else if (!values.length) {
    body.textContent = "No scores to summarise.";
  } else {
    const total = values.reduce((sum, value) => sum + value, 0);
    const displayTotal = new Intl.NumberFormat("en-NG", { useGrouping: false, maximumFractionDigits: 8 }).format(total);
    body.textContent = `Count: ${values.length}\nTotal: ${displayTotal}\nAverage: ${(total / values.length).toFixed(2)}`;
  }
}

function exportBackup() {
  const file = new Blob([createBackup(state)], { type: "application/json" });
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = "afit-siwes-study-backup.json";
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importBackup() {
  const file = backupInput.files?.[0];
  backupInput.value = "";
  if (!file) return;
  if (file.size > 4_000_000) {
    showToast("Choose a study backup under 4 MB.");
    return;
  }
  try {
    const data = await file.text();
    changeStudy(current => { state = mergeBackup(current, data); });
    render('[data-action="import-backup"]');
    showSaved("Study backup imported.");
  } catch (error) {
    showToast(error instanceof SyntaxError ? "This file is not a valid study backup." : error.message);
  }
}

async function copyCode(button) {
  const code = button.closest(".code-shell").querySelector("code").textContent;
  try {
    await navigator.clipboard.writeText(code);
    showToast("Code copied.");
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(button.closest(".code-shell").querySelector("code"));
    selection.removeAllRanges();
    selection.addRange(range);
    showToast("Code selected. Use your browser’s copy command.");
  }
}

document.addEventListener("click", event => {
  if (event.target.closest(".skip-link")) {
    event.preventDefault();
    main.focus();
    return;
  }
  if (shell.classList.contains("menu-open") && event.target.closest(".sidebar a")) toggleMenu(false, false);
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  switch (action) {
    case "menu": toggleMenu(!shell.classList.contains("menu-open")); break;
    case "close-menu": toggleMenu(false); break;
    case "reviewed": toggleProgress("reviewed", id, action); break;
    case "rehearsed": toggleProgress("rehearsed", id, action); break;
    case "mastered": toggleProgress("mastered", id, action); break;
    case "reveal-card":
      deck.revealed = !deck.revealed;
      render(deck.revealed ? "#flash-answer" : '[data-action="reveal-card"]');
      break;
    case "previous-card": jumpCard(-1); break;
    case "next-card": jumpCard(1); break;
    case "answer-mock": settleQuestion("answered"); break;
    case "skip-mock": settleQuestion("skipped"); break;
    case "next-mock": nextQuestion(); break;
    case "new-mock": mockSummary = null; render("#mock-topic"); break;
    case "save-mock": {
      const active = state.active;
      const question = active?.items[active.index];
      if (question && active.draft.trim()) openAnswer(question.id, active.draft, question);
      break;
    }
    case "end-mock": confirmEnd(); break;
    case "confirm-end":
      changeActive((active, current) => { current.active = null; });
      dialog.close();
      render("#mock-topic");
      showToast("Session ended.");
      break;
    case "edit-answer": openAnswer(id); break;
    case "edit-question": openQuestion(id); break;
    case "remove-answer":
      changeStudy(current => { delete current.answers[id]; });
      dialog.close();
      render(route.page === "mock" ? '[data-action="save-mock"]' : '[data-action="edit-answer"]');
      showSaved("Saved answer removed.");
      break;
    case "remove-question":
      changeStudy(current => {
        current.custom = current.custom.filter(item => item.id !== id);
        current.mastered = current.mastered.filter(item => item !== id);
      });
      dialog.close();
      render('[data-action="edit-question"]');
      showSaved("Custom question removed.");
      break;
    case "close-editor": dialog.close(); break;
    case "clear-bank":
      bankFilter.search = "";
      bankFilter.category = "all";
      render("#question-search");
      break;
    case "export-backup": exportBackup(); break;
    case "import-backup": backupInput.click(); break;
    case "copy-code": void copyCode(button); break;
  }
});

document.addEventListener("submit", event => {
  const form = event.target;
  if (!form.dataset.form) return;
  event.preventDefault();
  switch (form.dataset.form) {
    case "note": saveNote(form); break;
    case "scores": runScores(form); break;
    case "start-mock": startMock(form); break;
    case "answer": saveAnswer(form); break;
    case "custom-question": saveQuestion(form); break;
  }
});

document.addEventListener("input", event => {
  const field = event.target;
  if (field.id === "question-search") {
    bankFilter.search = field.value;
    renderBankResults();
  } else if (field.id === "study-note") {
    noteDrafts.set(field.form.dataset.id, field.value);
    field.form.querySelector("[data-note-status]").textContent = "Unsaved changes";
  } else if (field.id === "mock-draft") {
    changeActive(active => { active.draft = field.value; });
    const save = main.querySelector('[data-action="save-mock"]');
    if (save) save.disabled = !field.value.trim();
  } else if (field.id === "answer-text" || field.id === "custom-prompt") {
    field.setCustomValidity("");
  }
});

document.addEventListener("change", event => {
  const field = event.target;
  switch (field.dataset.filter) {
    case "deck":
      deck.category = field.value;
      deck.index = 0;
      deck.revealed = false;
      render("#deck-topic");
      break;
    case "bank":
      bankFilter.category = field.value;
      renderBankResults();
      break;
    case "mock-topic":
      mockSettings.category = field.value;
      render("#mock-topic");
      break;
    case "mock-count": mockSettings.count = Number(field.value); break;
    case "mock-seconds": mockSettings.seconds = Number(field.value); break;
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && shell.classList.contains("menu-open") && !dialog.open) toggleMenu(false);
});
backupInput.addEventListener("change", () => { void importBackup(); });
dialog.addEventListener("close", () => { answerPrompt = null; });
window.addEventListener("hashchange", handleRoute);
window.addEventListener("storage", event => {
  if (event.key !== storageKey || dirtyMemory) return;
  const latest = readStudy();
  if (!latest) return;
  const previous = state.active;
  state = latest;
  if (route.page === "overview" || (route.page === "mock" && !dialog.open
      && (previous?.id !== state.active?.id || previous?.index !== state.active?.index
      || previous?.results.length !== state.active?.results.length))) {
    render();
  }
});
document.addEventListener("visibilitychange", tick);
setupShell();
renderShell();
render();
tick();
setInterval(tick, 250);
