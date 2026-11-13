import { categories, questions, slides, topics } from "./content.js";

export const storageKey = "afit-siwes-defense.v1";
export const limits = { response: 5000, note: 4000, question: 320, custom: 100 };
const backupFormat = "afit-siwes-defense";
const categoryIds = new Set(categories.map(({ id }) => id));
const topicIds = new Set(topics.map(({ id }) => id));
const slideIds = new Set(slides.map(({ id }) => id));
const builtIn = new Map(questions.map(question => [question.id, question]));
const noteIds = new Set([
  "training", "project", ...topics.map(topic => `topic/${topic.id}`),
  ...slides.map(slide => `slide/${slide.id}`),
]);
const statuses = new Set(["answered", "timed-out", "skipped"]);

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function timestamp(value) {
  return Number.isSafeInteger(value) && value > 0 && value < 8.64e15 ? value : 0;
}

function boundedNumber(value, min, max, fallback = min) {
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}

function plainText(value, maximum) {
  return typeof value === "string" ? value.slice(0, maximum) : "";
}

function isCustomId(id) {
  return typeof id === "string" && /^custom-[a-z0-9-]{8,70}$/.test(id);
}

function questionId(id) {
  return builtIn.has(id) || isCustomId(id);
}

function normalizedQuestion(value) {
  const { id, category, question, answer, updatedAt } = record(value);
  if (builtIn.has(id)) return builtIn.get(id);
  const clean = plainText(question, limits.question).trim();
  if (!isCustomId(id) || !categoryIds.has(category) || !clean) return null;
  return {
    id, category, question: clean, answer: plainText(answer, limits.response).trim(),
    updatedAt: timestamp(updatedAt),
  };
}

function normalizeActive(value) {
  const active = record(value);
  const seconds = boundedNumber(active.seconds, 15, 180, 60);
  if (!Array.isArray(active.items) || !active.items.length || active.items.length > 8) return null;
  const items = active.items.map(normalizedQuestion);
  const index = boundedNumber(active.index, 0, items.length - 1, -1);
  const deadline = timestamp(active.deadline);
  const questionStartedAt = timestamp(active.questionStartedAt);
  const startedAt = timestamp(active.startedAt);
  if (items.some(item => !item) || index < 0 || !deadline || !startedAt || !questionStartedAt
      || typeof active.id !== "string" || !/^mock-[a-z0-9-]+$/.test(active.id)) return null;
  if (!Array.isArray(active.results) || ![index, index + 1].includes(active.results.length)) return null;
  const results = active.results.map(raw => {
    const result = record(raw);
    return {
      status: statuses.has(result.status) ? result.status : "skipped",
      elapsed: boundedNumber(result.elapsed, 0, seconds),
    };
  });
  return {
    id: active.id, items, index, seconds, deadline, questionStartedAt, startedAt, results,
    draft: plainText(active.draft, limits.response),
  };
}

function normalizeHistory(value) {
  if (!Array.isArray(value)) return [];
  const records = value.flatMap(raw => {
    const item = record(raw);
    const completedAt = timestamp(item.completedAt);
    const total = boundedNumber(item.total, 1, 8, 0);
    if (!completedAt || !total || typeof item.id !== "string" || !/^mock-[a-z0-9-]+$/.test(item.id)) return [];
    return [{
      id: item.id, completedAt, total,
      attempted: boundedNumber(item.attempted, 0, total),
      timedOut: boundedNumber(item.timedOut, 0, total),
      seconds: boundedNumber(item.seconds, 15, 180, 60),
    }];
  });
  return [...new Map(records.map(item => [item.id, item])).values()]
    .sort((a, b) => b.completedAt - a.completedAt);
}

function ids(value, test) {
  return Array.isArray(value) ? [...new Set(value.filter(test))] : [];
}

export function normalizeStudy(value) {
  const study = record(value);
  const custom = Array.isArray(study.custom) ? study.custom.flatMap(item => {
    const question = normalizedQuestion(item);
    return question && isCustomId(question.id) ? [question] : [];
  }) : [];
  const unique = [...new Map(custom.map(item => [item.id, item])).values()].slice(0, limits.custom);
  const answers = Object.entries(record(study.answers)).flatMap(([id, raw]) => {
    const answer = record(raw);
    const text = plainText(answer.text, limits.response).trim();
    if (!questionId(id) || !text) return [];
    const original = builtIn.get(id);
    const category = categoryIds.has(answer.category) ? answer.category : "panel";
    return [[id, {
      text, updatedAt: timestamp(answer.updatedAt), category: original?.category ?? category,
      question: original?.question ?? plainText(answer.question, limits.question).trim(),
    }]];
  });
  const notes = Object.entries(record(study.notes)).flatMap(([id, raw]) => {
    const note = record(raw);
    return noteIds.has(id) ? [[id, { text: plainText(note.text, limits.note), updatedAt: timestamp(note.updatedAt) }]] : [];
  });
  return {
    reviewed: ids(study.reviewed, id => topicIds.has(id)),
    rehearsed: ids(study.rehearsed, id => slideIds.has(id)),
    mastered: ids(study.mastered, questionId),
    answers: Object.fromEntries(answers),
    notes: Object.fromEntries(notes),
    custom: unique,
    history: normalizeHistory(study.history),
    active: normalizeActive(study.active),
  };
}

export function readStudy() {
  try {
    const value = localStorage.getItem(storageKey);
    return normalizeStudy(value ? JSON.parse(value) : {});
  } catch {
    return null;
  }
}

export function writeStudy(state) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function createBackup(state) {
  const { active, ...study } = state;
  return JSON.stringify({ format: backupFormat, version: 1, study }, null, 2);
}

function newerEntries(current, incoming) {
  const merged = { ...current };
  for (const [id, item] of Object.entries(incoming)) {
    if (!merged[id] || item.updatedAt > merged[id].updatedAt) merged[id] = item;
  }
  return merged;
}

export function mergeBackup(state, text) {
  const backup = record(JSON.parse(text));
  if (backup.format !== backupFormat || backup.version !== 1 || !backup.study
      || typeof backup.study !== "object" || Array.isArray(backup.study)) {
    throw new Error("Choose a study backup exported by this workspace.");
  }
  const incoming = normalizeStudy(backup.study);
  const indexById = items => Object.fromEntries(items.map(item => [item.id, item]));
  const custom = Object.values(newerEntries(indexById(state.custom), indexById(incoming.custom)));
  if (custom.length > limits.custom) throw new Error("This backup would exceed the 100 custom question limit.");
  return normalizeStudy({
    ...state,
    reviewed: [...state.reviewed, ...incoming.reviewed],
    rehearsed: [...state.rehearsed, ...incoming.rehearsed],
    mastered: [...state.mastered, ...incoming.mastered],
    notes: newerEntries(state.notes, incoming.notes),
    answers: newerEntries(state.answers, incoming.answers),
    custom,
    history: [...incoming.history, ...state.history],
  });
}
