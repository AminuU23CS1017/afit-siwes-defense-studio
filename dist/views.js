import { categories, profile, questions, scoreExample, slides, topics } from "./content.js";
import { icon, iconTile } from "./icons.js";
import { limits } from "./storage.js";

export const navigation = [
  { label: "Workspace", links: [
    ["overview", "Overview", "home"],
    ["training", "Training at the organisation", "building"],
    ["presentation", "Presentation", "presentation"],
  ] },
  { label: "Study", links: [
    ["topics", "Technical review", "book"],
    ["project", "Project lab", "folder"],
  ] },
  { label: "Practice", links: [
    ["flashcards", "Flashcards", "cards"],
    ["mock", "Mock defense", "timer"],
    ["questions", "Question bank", "messages"],
    ["answers", "My answers", "notebook"],
  ] },
];

const categoryIndex = new Map(categories.map(item => [item.id, item]));
const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos",
});

export function escapeHtml(value) {
  const replacements = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
  return String(value ?? "").replace(/[&<>"']/g, char => replacements[char]);
}

export function getCategory(id) {
  return categoryIndex.get(id) ?? categoryIndex.get("panel");
}

export function dateText(timestamp) {
  return timestamp ? dateFormatter.format(timestamp) : "";
}

export function getQuestions(state, category = "all", flashcards = false) {
  return [...questions, ...state.custom].filter(item =>
    (category === "all" || item.category === category) && (!flashcards || item.answer));
}

export function findQuestion(state, id) {
  return getQuestions(state).find(item => item.id === id);
}

export function formatClock(seconds) {
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function categoryOptions(selected, all = true) {
  const options = all ? [{ id: "all", name: "All topics" }, ...categories] : categories;
  return options.map(item => `<option value="${item.id}"${selected === item.id ? " selected" : ""}>${item.name}</option>`).join("");
}

function categoryBadge(id) {
  const category = getCategory(id);
  return `<span class="tag tone-${category.tone}">${category.name}</span>`;
}

function pageHeader(title, summary, action = "") {
  return `<header class="page-heading">
    <div><h1>${title}</h1><p>${summary}</p></div>${action}
  </header>`;
}

function buttonLink(href, text, symbol = "arrow", style = "secondary") {
  return `<a class="button button-${style}" href="${href}">${icon(symbol)}<span>${text}</span></a>`;
}

function buttonAction(action, text, symbol, style = "secondary", data = "") {
  return `<button class="button button-${style}" type="button" data-action="${action}"${data}>${symbol ? icon(symbol) : ""}<span>${text}</span></button>`;
}

function completeButton(action, id, completed, label, completeLabel) {
  return buttonAction(action, completed ? completeLabel : label, "check", completed ? "success" : "primary",
    ` data-id="${id}" aria-pressed="${completed}"`);
}

function noteForm(state, drafts, id, title, placeholder) {
  const note = state.notes[id];
  const value = drafts.get(id) ?? note?.text ?? "";
  return `<form class="note-form" data-form="note" data-id="${id}">
    <label class="field-label" for="study-note">${title}</label>
    <textarea id="study-note" rows="4" maxlength="${limits.note}" placeholder="${placeholder}">${escapeHtml(value)}</textarea>
    <div class="form-footer">
      <span class="muted small" data-note-status>${note?.updatedAt ? `Saved ${dateText(note.updatedAt)}` : "Saved in this browser"}</span>
      <button class="button button-secondary button-small" type="submit">${icon("pencil")} Save notes</button>
    </div>
  </form>`;
}

function codeBlock(title, language, code) {
  return `<div class="code-shell">
    <div class="code-header"><div><strong>${title}</strong><span>${language}</span></div>
      <button type="button" class="icon-button code-copy" data-action="copy-code" aria-label="Copy ${language} example" title="Copy code">${icon("copy")}</button>
    </div>
    <pre><code>${escapeHtml(code)}</code></pre>
  </div>`;
}

function listOf(items) {
  return `<ul class="content-list">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function sectionBack(href, text) {
  return `<a class="back-link" href="${href}">${icon("arrow-left")}${text}</a>`;
}

function empty(iconName, title, description, action = "") {
  return `<div class="empty-state">${iconTile(iconName)}<h2>${title}</h2><p>${description}</p>${action}</div>`;
}

function progressRow(label, current, max, tone) {
  const progress = max ? Math.round(100 * current / max) : 0;
  return `<div class="progress-row">
    <div><span>${label}</span><strong>${current} <span>/</span> ${max}</strong></div>
    <div class="progress-track" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${current}">
      <span class="progress-fill fill-${tone}" style="width:${progress}%"></span>
    </div>
  </div>`;
}

export function renderOverview(state) {
  const cards = getQuestions(state, "all", true);
  const mastered = cards.filter(item => state.mastered.includes(item.id)).length;
  const answered = Object.keys(state.answers).length;
  const ready = Math.round((state.reviewed.length / topics.length
    + state.rehearsed.length / slides.length + mastered / cards.length) / 3 * 100);
  const stats = [
    ["book", "amber", "Topics reviewed", state.reviewed.length, topics.length, "topics"],
    ["cards", "teal", "Flashcards mastered", mastered, cards.length, "flashcards"],
    ["timer", "lavender", "Mock sessions", state.history.length, null, "mock"],
    ["notebook", "sky", "Saved answers", answered, null, "answers"],
  ];
  const plan = [
    ["training", "building", "amber", "Training at the organisation", "Placement overview, dates, and learning outcomes"],
    ["topics", "book", "teal", "Technical review", "HTML, CSS, Tailwind CSS, Bootstrap, Python, and GitHub"],
    ["project", "folder", "sky", "Project lab", "Fieldwork walkthrough and Python coding exercise"],
    ["presentation", "presentation", "lavender", "Presentation outline", "Seven suggested slides with timings and speaker notes"],
  ];
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-content">
      <p class="hero-kicker">AFIT KADUNA <span></span> COMPUTER SCIENCE</p>
      <h1 id="hero-title">SIWES Defense Prep</h1>
      <p class="hero-summary">Review your training at the training organisation, rehearse your presentation, and practise answering panel questions.</p>
      <div class="hero-actions">
        ${buttonLink("#mock", state.active ? "Resume mock defense" : "Start mock defense", "play", "gold")}
        ${buttonLink("#presentation", "View presentation", "presentation", "on-dark")}
      </div>
    </div>
  </section>
  <div class="metrics" aria-label="Study progress">
    ${stats.map(([symbol, tone, label, current, total, route]) => `<a class="metric panel" href="#${route}">
      ${iconTile(symbol, tone)}<div><p>${label}</p><strong>${current}${total === null ? "" : `<span> / ${total}</span>`}</strong></div>
      ${icon("chevron", "metric-arrow")}
    </a>`).join("")}
  </div>
  <div class="overview-columns">
    <section aria-labelledby="plan-heading">
      <h2 class="section-heading" id="plan-heading">Study plan</h2>
      <div class="panel plan-list">
        ${plan.map(([route, symbol, tone, title, detail]) => `<a class="plan-item" href="#${route}">
          ${iconTile(symbol, tone)}<div><h3>${title}</h3><p>${detail}</p></div>${icon("chevron", "plan-arrow")}
        </a>`).join("")}
      </div>
    </section>
    <section aria-labelledby="progress-heading">
      <h2 class="section-heading" id="progress-heading">Defense readiness</h2>
      <div class="panel readiness">
        <div class="readiness-score">
          <div class="progress-ring" style="--ring-progress:${ready}%" role="img" aria-label="${ready}% study progress">
            <div><strong>${ready}<span>%</span></strong></div>
          </div>
          <div><h3>Study progress</h3><p>Average completion across the three activities below.</p></div>
        </div>
        ${progressRow("Topics reviewed", state.reviewed.length, topics.length, "teal")}
        ${progressRow("Slides rehearsed", state.rehearsed.length, slides.length, "gold")}
        ${progressRow("Flashcards mastered", mastered, cards.length, "lavender")}
      </div>
    </section>
  </div>
  <section class="practice-section" aria-labelledby="practice-heading">
    <h2 class="section-heading" id="practice-heading">Practice tools</h2>
    <div class="practice-links">
      ${[
        ["flashcards", "cards", "teal", "Flashcards", "Test recall by topic"],
        ["questions", "messages", "lavender", "Question bank", "Browse and add panel questions"],
        ["answers", "notebook", "sky", "My answers", "Edit your saved responses"],
      ].map(([route, symbol, tone, title, detail]) => `<a href="#${route}" class="panel practice-link">
        ${iconTile(symbol, tone)}<div><h3>${title}</h3><p>${detail}</p></div>${icon("arrow", "plan-arrow")}
      </a>`).join("")}
    </div>
  </section>`;
}

export function renderTraining(state, drafts) {
  return `${pageHeader("Training at the training organisation", "Prepare a concise account of your SIWES placement and the skills you developed.")}
  <div class="content-columns">
    <div class="stack">
      <section class="panel content-card">
        <div class="card-heading">${iconTile("building", "amber")}<div><h2>Placement overview</h2><p>Students’ Industrial Work Experience Scheme</p></div></div>
        <dl class="fact-list">
          <div><dt>Host organisation</dt><dd>${profile.organisation}</dd></div>
          <div><dt>Location</dt><dd>${profile.address}</dd></div>
          <div><dt>Training period</dt><dd>${profile.dates} · ${profile.duration}</dd></div>
          <div><dt>Academic programme</dt><dd>400 Level Computer Science · Air Force Institute of Technology, Kaduna</dd></div>
        </dl>
      </section>
      <section class="panel content-card">
        <h2>Learning areas</h2>
        <p>Describe your practice in frontend development and introductory programming, then give one concrete example from each area.</p>
        <div class="concept-list">
          <div><h3>HTML, CSS, and Bootstrap</h3><p>Structure content and forms, apply CSS layout rules, and explain how the Bootstrap grid adapts to screen width.</p></div>
          <div><h3>Python programming</h3><p>Trace an example that uses variables, conditions, loops, functions, or a text file. Explain what happens when the input is empty.</p></div>
          <div><h3>Practical evidence</h3><p>Use a logbook entry to support a claim about your training. Introduce the profile page, score analyser, and diary as worked examples from the report.</p></div>
        </div>
        <a class="text-link" href="https://chatgpt.com/library?file_id=libfile_0a880b8e36348191ba5ed7d8a04d16db&amp;account_id=personal" target="_blank" rel="noopener">Open your SIWES technical report ${icon("link")}</a>
      </section>
    </div>
    <div class="stack">
      <section class="panel content-card">
        <div class="card-heading">${iconTile("messages", "lavender")}<div><h2>Opening answer</h2><p>Suggested wording</p></div></div>
        <blockquote>I undertook my SIWES training at the training organisation in the training location, from the agreed training period. My training focused on frontend development with HTML, CSS, and Bootstrap, alongside introductory Python programming.</blockquote>
        ${buttonAction("edit-answer", state.answers["placement-scope"] ? "Edit my answer" : "Write my answer", "pencil", "secondary", ' data-id="placement-scope"')}
      </section>
      <section class="panel content-card">
        ${noteForm(state, drafts, "training", "Placement notes", "Add a verified activity, a skill you gained, or an example from your logbook.")}
      </section>
    </div>
  </div>`;
}

export function renderTopics(state, routeId, drafts) {
  const topic = topics.find(item => item.id === routeId);
  if (!topic) {
    return `${pageHeader("Technical review", "Review the concepts, trace the code examples, and prepare to explain your decisions.")}
      <div class="topic-grid">${topics.map(item => {
        const complete = state.reviewed.includes(item.id);
        return `<a class="panel topic-card" href="#topics/${item.id}">
          <div class="topic-card-top">${iconTile(item.icon, item.tone)}
            ${complete ? `<span class="tag tone-teal">${icon("check")} Reviewed</span>` : ""}
          </div><h2>${item.title}</h2><p>${item.summary}</p>
          <span class="text-link">Review topic ${icon("arrow")}</span>
        </a>`;
      }).join("")}</div>`;
  }
  const complete = state.reviewed.includes(topic.id);
  return `${sectionBack("#topics", "All technical topics")}
    ${pageHeader(topic.title, topic.summary, completeButton("reviewed", topic.id, complete, "Mark reviewed", "Reviewed"))}
    <div class="content-columns">
      <div class="stack">
        <section class="panel content-card">
          <div class="card-heading">${iconTile(topic.icon, topic.tone)}<div><h2>Core concepts</h2><p>${topic.introduction}</p></div></div>
          <div class="concept-list">${topic.points.map(([title, text]) => `<div><h3>${title}</h3><p>${text}</p></div>`).join("")}</div>
        </section>
        ${codeBlock(topic.exampleTitle, topic.language, topic.code)}
        <p class="under-code">${topic.explanation}</p>
      </div>
      <div class="stack">
        <section class="panel content-card">
          <div class="card-heading">${iconTile("messages", "lavender")}<div><h2>Practice question</h2></div></div>
          <p class="strong-copy">${findQuestion(state, topic.question).question}</p>
          ${buttonAction("edit-answer", state.answers[topic.question] ? "Edit my answer" : "Write my answer", "pencil", "secondary", ` data-id="${topic.question}"`)}
        </section>
        <section class="panel content-card">${noteForm(state, drafts, `topic/${topic.id}`, "Revision notes", "Add a reminder, code example, or point you want to explain more clearly.")}</section>
      </div>
    </div>`;
}

export function renderProject(state, drafts) {
  const stages = [
    ["code", "sky", "Interface", "React and TypeScript render the profile, entries, and hours summary."],
    ["shield", "teal", "Server", "Server code reads entries and verifies owner access before accepting changes."],
    ["database", "lavender", "Record store", "Cloudflare D1 stores dates, tracks, titles, notes, and hours."],
  ];
  return `${pageHeader("Project lab", "Prepare your Fieldwork demonstration and practise tracing a Python exercise.")}
    <div class="stack">
      <section class="panel content-card">
        <div class="card-heading">${iconTile("folder", "sky")}<div><h2>Fieldwork digital logbook</h2><p>A demonstration project developed with assistance. Prepare to explain your contribution and the decisions you can verify.</p></div></div>
        <div class="flow-stages" aria-label="Fieldwork request flow">
          ${stages.map(([symbol, tone, title, description], index) => `
            ${index ? icon("arrow", "flow-arrow") : ""}
            <div class="flow-stage">${iconTile(symbol, tone)}<h3>${title}</h3><p>${description}</p></div>`).join("")}
        </div>
        <h3 class="subheading">Demo sequence</h3>
        <ol class="content-list">
          <li>Open the profile and logbook. Point out the entry date, track, title, notes, and hours.</li>
          <li>Explain what a visitor can view and how the server checks owner access before a write.</li>
          <li>Use a clearly identified sample entry in your demo environment. Save it, reload, and check the entry and the change in total hours.</li>
          <li>Describe one validation or persistence test and report the outcome you actually observed.</li>
        </ol>
      </section>
      <section class="panel content-card">
        <div class="card-heading">${iconTile("terminal", "amber")}<div><h2>Python score analyser</h2><p>Trace a function that returns the count, total, and mean of a list. Use the simulator to compare different inputs.</p></div></div>
        <div class="project-code-grid">
          ${codeBlock("Score summary", "Python", scoreExample)}
          <div class="lab-runner">
            <form data-form="scores">
              <label class="field-label" for="sample-scores">Sample scores</label>
              <p class="field-help" id="score-help">Enter comma-separated scores from 0 to 100. An empty field tests the empty-list case.</p>
              <input id="sample-scores" name="scores" type="text" value="35, 48, 41, 52, 26, 28" maxlength="300" aria-describedby="score-help">
              <button class="button button-primary" type="submit">${icon("play")} Run example</button>
            </form>
            <div class="score-output" aria-live="polite" id="score-output"><span>Expected sample output</span><pre>Count: 6\nTotal: 230\nAverage: 38.33</pre></div>
          </div>
        </div>
      </section>
      <section class="panel content-card">${noteForm(state, drafts, "project", "Project notes", "Record your contribution, demo sequence, and the evidence you plan to show.")}</section>
    </div>`;
}

export function renderPresentation(state, routeId, drafts) {
  const slide = slides.find(item => item.id === routeId) ?? slides[0];
  const index = slides.indexOf(slide);
  const complete = state.rehearsed.includes(slide.id);
  return `${pageHeader("Presentation outline", "Rehearse the suggested eight-minute presentation and edit the speaker notes for each slide.",
    `<span class="tag tone-teal">${icon("check")} ${state.rehearsed.length} / ${slides.length} rehearsed</span>`)}
    <div class="presentation-grid">
      <nav class="panel slide-nav" aria-label="Presentation slides">${slides.map((item, i) => `<a class="slide-link" href="#presentation/${item.id}"${item === slide ? ' aria-current="step"' : ""}>
          <span class="slide-number${state.rehearsed.includes(item.id) ? " is-complete" : ""}">${state.rehearsed.includes(item.id) ? icon("check") : i + 1}</span>
          <span>${item.title}<small>${item.time}</small></span>
        </a>`).join("")}</nav>
      <section class="panel content-card slide-content" aria-labelledby="slide-title">
        <div class="slide-top"><span class="tag tone-amber">Slide ${index + 1} of ${slides.length}</span><span class="inline-meta">${icon("clock")} ${slide.time}</span></div>
        <h2 id="slide-title">${slide.title}</h2>
        <p>${slide.purpose}</p>
        ${listOf(slide.points)}
        <div class="callout"><h3>Speaking cue</h3><p>${slide.cue}</p></div>
        ${noteForm(state, drafts, `slide/${slide.id}`, "My speaker notes", "Write how you plan to explain this slide to the panel.")}
        <div class="slide-actions">
          ${completeButton("rehearsed", slide.id, complete, "Mark rehearsed", "Rehearsed")}
          ${index < slides.length - 1 ? `<a class="text-link" href="#presentation/${slides[index + 1].id}">Next slide ${icon("arrow")}</a>` : ""}
        </div>
      </section>
    </div>`;
}

export function renderFlashcards(state, deck) {
  const items = getQuestions(state, deck.category, true);
  const index = Math.max(0, Math.min(deck.index, items.length - 1));
  const item = items[index];
  const mastered = items.filter(question => state.mastered.includes(question.id)).length;
  const filter = `<div class="panel toolbar flash-toolbar">
    <label class="toolbar-field" for="deck-topic"><span>Topic</span><select id="deck-topic" data-filter="deck">${categoryOptions(deck.category)}</select></label>
    <div class="inline-meta">${icon("check")} <strong>${mastered} of ${items.length} mastered</strong></div>
  </div>`;
  const heading = pageHeader("Flashcards", "Say your answer aloud, reveal the suggested response, and mark the cards you know.");
  if (!item) return `${heading}${filter}${empty("cards", "No cards for this topic", "Choose another topic to continue.")}`;
  const complete = state.mastered.includes(item.id);
  return `${heading}
    <div class="practice-width stack">
      ${filter}
      <section class="flashcard panel${deck.revealed ? " is-revealed" : ""}" aria-labelledby="flash-title">
        <div class="flash-top">${categoryBadge(item.category)}<span class="inline-meta">Card ${index + 1} of ${items.length}</span></div>
        <div class="flash-body">
          ${iconTile(deck.revealed ? "messages" : "cards", deck.revealed ? "teal" : "amber")}
          <h2 id="flash-title" tabindex="-1">${escapeHtml(item.question)}</h2>
          ${deck.revealed ? `<div class="flash-answer" id="flash-answer" tabindex="-1"><h3>Suggested answer</h3><p>${escapeHtml(item.answer)}</p></div>`
            : '<p class="muted">Try answering from memory before revealing the card.</p>'}
        </div>
        <div class="flash-actions">
          ${deck.revealed
            ? `${completeButton("mastered", item.id, complete, "Mark mastered", "Mastered")}
               ${buttonAction("reveal-card", "Hide answer", "eye")}`
            : buttonAction("reveal-card", "Reveal answer", "eye", "primary")}
        </div>
      </section>
      <div class="flash-controls">
        <button class="button button-secondary" type="button" data-action="previous-card"${index === 0 ? " disabled" : ""}>${icon("arrow-left")} Previous</button>
        <span>${index + 1} / ${items.length}</span>
        <button class="button button-secondary" type="button" data-action="next-card"${index === items.length - 1 ? " disabled" : ""}>Next ${icon("arrow")}</button>
      </div>
    </div>`;
}

function mockHistory(state) {
  if (!state.history.length) return `<section class="panel content-card history">
    <div class="card-heading">${iconTile("clock", "lavender")}<div><h2>Session history</h2><p>Your completed sessions will appear here.</p></div></div>
  </section>`;
  const row = item => `<li><div><strong>${dateText(item.completedAt)}</strong><span>${item.seconds}s per question</span></div><strong>${item.attempted} / ${item.total}<span> attempted</span></strong></li>`;
  return `<section class="panel content-card history">
    <div class="card-heading">${iconTile("clock", "lavender")}<div><h2>Session history</h2><p>${state.history.length} completed ${state.history.length === 1 ? "session" : "sessions"}</p></div></div>
    <ul class="history-list">${state.history.slice(0, 6).map(row).join("")}</ul>
    ${state.history.length > 6 ? `<details class="older-sessions"><summary>Earlier sessions</summary><ul class="history-list">${state.history.slice(6).map(row).join("")}</ul></details>` : ""}
  </section>`;
}

function mockSetup(state, settings) {
  const available = getQuestions(state, settings.category).length;
  const amounts = [...new Set([3, 5, 8].map(number => Math.min(number, available)))];
  const count = amounts.includes(settings.count) ? settings.count : amounts[amounts.length - 1];
  return `<div class="content-columns">
    <section class="panel content-card">
      <div class="card-heading">${iconTile("timer", "amber")}<div><h2>Set up your practice</h2><p>Answer aloud or type a draft. Review the suggested points after each question.</p></div></div>
      <form class="mock-settings" data-form="start-mock">
        <div class="form-field"><label for="mock-topic">Topic</label><select id="mock-topic" name="topic" data-filter="mock-topic">${categoryOptions(settings.category)}</select></div>
        <div class="form-grid">
          <div class="form-field"><label for="mock-count">Number of questions</label><select id="mock-count" name="count" data-filter="mock-count">${amounts.map(number => `<option value="${number}"${number === count ? " selected" : ""}>${number}</option>`).join("")}</select></div>
          <div class="form-field"><label for="mock-seconds">Time per question</label><select id="mock-seconds" name="seconds" data-filter="mock-seconds">${[30, 60, 90, 120].map(seconds => `<option value="${seconds}"${seconds === settings.seconds ? " selected" : ""}>${seconds} seconds</option>`).join("")}</select></div>
        </div>
        <button class="button button-primary" type="submit">${icon("play")} Start session</button>
      </form>
    </section>
    ${mockHistory(state)}
  </div>`;
}

function mockReview(state, active, question) {
  const result = active.results[active.index];
  const label = { answered: "Answer finished", "timed-out": "Time is up", skipped: "Question skipped" }[result.status];
  const last = active.index + 1 === active.items.length;
  return `<div class="mock-review" id="mock-review" tabindex="-1">
    <div class="review-heading"><h3>${label}</h3><span class="inline-meta">${icon("clock")} ${result.elapsed}s used</span></div>
    <div class="callout"><h3>Suggested answer</h3><p>${escapeHtml(question.answer || "Use your notes to check the accuracy and clarity of your response.")}</p></div>
    <div class="mock-actions">
      ${buttonAction("save-mock", state.answers[question.id] ? "Update saved answer" : "Save to My answers", "notebook", "secondary", active.draft.trim() ? "" : " disabled")}
      ${buttonAction("next-mock", last ? "Finish session" : "Next question", last ? "check" : "arrow", "primary")}
    </div>
  </div>`;
}

export function renderMock(state, summary, settings) {
  const heading = pageHeader("Mock defense", "Practise responding clearly under a time limit.");
  if (summary) return `${heading}<div class="content-columns">
    <section class="panel content-card mock-summary">
      <div class="card-heading">${iconTile("check", "teal")}<div><h2 tabindex="-1" id="session-complete">Session complete</h2><p>Review your attempts and revisit any difficult questions.</p></div></div>
      <dl class="session-totals">
        <div><dt>Attempted</dt><dd>${summary.attempted} / ${summary.total}</dd></div>
        <div><dt>Timed out</dt><dd>${summary.timedOut}</dd></div>
        <div><dt>Skipped</dt><dd>${summary.total - summary.attempted}</dd></div>
      </dl>
      <div class="button-row">${buttonAction("new-mock", "Practise again", "refresh", "primary")}${buttonLink("#answers", "My answers", "notebook")}</div>
    </section>
    ${mockHistory(state)}
  </div>`;
  const active = state.active;
  if (!active) return `${heading}${mockSetup(state, settings)}`;
  const question = active.items[active.index];
  const reviewing = active.results.length > active.index;
  const remaining = Math.max(0, Math.min(active.seconds, Math.ceil((active.deadline - Date.now()) / 1000)));
  return `${heading}
    <section class="panel content-card active-mock practice-width">
      <div class="mock-question-top">
        <div><p class="question-position">Question ${active.index + 1} of ${active.items.length}</p>${categoryBadge(question.category)}</div>
        ${reviewing ? "" : `<div class="timer${remaining <= 10 ? " timer-low" : ""}" id="mock-timer"><span>Time left</span><strong role="timer" aria-live="off" id="timer-value">${formatClock(remaining)}</strong></div>`}
      </div>
      ${reviewing ? "" : `<div class="timer-track" aria-hidden="true"><span id="timer-bar" style="width:${100 * remaining / active.seconds}%"></span></div>`}
      <h2 class="mock-question" id="mock-question" tabindex="-1">${escapeHtml(question.question)}</h2>
      <label class="field-label" for="mock-draft">Response draft <span>(optional)</span></label>
      <textarea id="mock-draft" rows="4" maxlength="${limits.response}" placeholder="Outline your response here or practise speaking aloud.">${escapeHtml(active.draft)}</textarea>
      ${reviewing ? mockReview(state, active, question) : `<div class="mock-actions">
        ${buttonAction("skip-mock", "Skip question", null)}
        ${buttonAction("answer-mock", "Finish answer", "check", "primary")}
      </div>`}
    </section>
    <div class="practice-width end-session"><button type="button" class="plain-button" data-action="end-mock">End session early</button></div>`;
}

export function renderQuestionResults(state, filter, openIds = new Set()) {
  const term = filter.search.trim().toLocaleLowerCase();
  const items = getQuestions(state, filter.category).filter(item =>
    `${item.question} ${item.answer} ${getCategory(item.category).name}`.toLocaleLowerCase().includes(term));
  items.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  if (!items.length) return `<p class="results-count">0 questions</p>
    ${empty("search", "No matching questions", "Try a different search or topic.", buttonAction("clear-bank", "Clear filters", "refresh"))}`;
  return `<p class="results-count" aria-live="polite">${items.length} ${items.length === 1 ? "question" : "questions"}</p>
    <div class="question-list">${items.map(item => {
      const custom = item.id.startsWith("custom-");
      const saved = state.answers[item.id];
      return `<details class="panel question-item" data-question="${item.id}"${openIds.has(item.id) ? " open" : ""}>
        <summary><span class="question-labels">${categoryBadge(item.category)}${custom ? '<span class="custom-label">Custom</span>' : ""}</span>
          <strong>${escapeHtml(item.question)}</strong>${icon("chevron-down", "question-chevron")}</summary>
        <div class="question-details">
          <h3>Suggested answer</h3><p>${escapeHtml(item.answer || "Add suggested points to turn this question into a flashcard.")}</p>
          ${saved ? `<div class="saved-indicator">${icon("check")} Your answer is saved</div>` : ""}
          <div class="button-row">
            ${buttonAction("edit-answer", saved ? "Edit my answer" : "Write my answer", "pencil", "primary", ` data-id="${item.id}"`)}
            ${custom ? buttonAction("edit-question", "Edit question", "pencil", "secondary", ` data-id="${item.id}"`) : ""}
          </div>
        </div>
      </details>`;
    }).join("")}</div>`;
}

export function renderQuestionBank(state, filter, openIds) {
  return `${pageHeader("Question bank", "Study common panel questions, add your own, and save answers in your own words.",
    buttonAction("edit-question", "Add question", "plus", "primary"))}
    <div class="panel toolbar bank-toolbar">
      <label class="search-field" for="question-search">${icon("search")}
        <span class="visually-hidden">Search questions</span>
        <input id="question-search" type="search" value="${escapeHtml(filter.search)}" placeholder="Search questions or answers…" maxlength="160">
      </label>
      <label class="toolbar-field" for="bank-topic"><span>Topic</span><select id="bank-topic" data-filter="bank">${categoryOptions(filter.category)}</select></label>
    </div>
    <div id="question-results">${renderQuestionResults(state, filter, openIds)}</div>`;
}

export function renderAnswers(state) {
  const answers = Object.entries(state.answers).sort((a, b) => b[1].updatedAt - a[1].updatedAt);
  const heading = pageHeader("My answers", "Review and edit the responses you’ve written for your defense.",
    buttonLink("#questions", "Browse question bank", "messages", "primary"));
  const answerCards = answers.map(([id, answer]) => {
    const question = findQuestion(state, id);
    return `<article class="panel content-card answer-card">
      <div class="answer-meta">${categoryBadge(question?.category ?? answer.category)}<span class="muted small">${answer.updatedAt ? `Saved ${dateText(answer.updatedAt)}` : ""}</span></div>
      <h2>${escapeHtml(question?.question ?? (answer.question || "Custom question"))}</h2>
      <p class="answer-preview">${escapeHtml(answer.text)}</p>
      ${buttonAction("edit-answer", "Read or edit answer", "pencil", "secondary", ` data-id="${id}"`)}
    </article>`;
  }).join("");
  return `${heading}
    <div class="content-columns">
      <section class="stack" aria-label="Saved responses">
        ${answers.length ? answerCards : empty("notebook", "No saved answers yet", "Open a question and write your first response.", buttonLink("#questions", "Find a question", "arrow", "primary"))}
      </section>
      <aside class="panel content-card backup-card">
        <div class="card-heading">${iconTile("download", "sky")}<div><h2>Study backup</h2></div></div>
        <p>Your answers, notes, and progress are saved in this browser. Export a backup to keep a copy or import it on another device.</p>
        <div class="button-row">
          ${buttonAction("export-backup", "Export", "download")}
          ${buttonAction("import-backup", "Import", "upload")}
        </div>
      </aside>
    </div>`;
}
