// Local-first persistence. Single versioned localStorage key, JSON export.
// Data is small (taps and short strings); nothing ever leaves the device.

const KEY = "steady.v1";

const empty = () => ({
  version: 1,
  checkins: [], // { id, ts, type, body_signals, emotion_tags, classification, energy, note }
  tasks: [],    // { id, text, created_ts, status: parked|active|done, smallest_step, completions }
  plans: [],    // { id, category, when, event_ts, capacity_answers, gate_verdict,
                //   predicted_dread, predicted_enjoyment, actual_enjoyment, went, followup_done }
  actions: [],  // { id, flow, text, accepted, completed, ts }
  settings: { calm: false, theme: "auto" },
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    return { ...empty(), ...parsed, settings: { ...empty().settings, ...parsed.settings } };
  } catch {
    return empty();
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable: the session still works, it just won't persist.
  }
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export const db = {
  get settings() { return state.settings; },
  setSetting(k, v) { state.settings[k] = v; save(); },

  addCheckin(c) { state.checkins.push({ id: uid(), ts: Date.now(), ...c }); save(); },
  get checkins() { return state.checkins; },

  addAction(a) { const rec = { id: uid(), ts: Date.now(), ...a }; state.actions.push(rec); save(); return rec; },
  updateAction(id, patch) {
    const a = state.actions.find(x => x.id === id);
    if (a) { Object.assign(a, patch); save(); }
  },
  get actions() { return state.actions; },

  addTask(t) { const rec = { id: uid(), created_ts: Date.now(), status: "parked", completions: [], ...t }; state.tasks.push(rec); save(); return rec; },
  updateTask(id, patch) {
    const t = state.tasks.find(x => x.id === id);
    if (t) { Object.assign(t, patch); save(); }
    return t;
  },
  removeTask(id) { state.tasks = state.tasks.filter(t => t.id !== id); save(); },
  get parkedTasks() { return state.tasks.filter(t => t.status === "parked"); },
  get tasks() { return state.tasks; },

  addPlan(p) { const rec = { id: uid(), created_ts: Date.now(), ...p }; state.plans.push(rec); save(); return rec; },
  updatePlan(id, patch) {
    const p = state.plans.find(x => x.id === id);
    if (p) { Object.assign(p, patch); save(); }
    return p;
  },
  get plans() { return state.plans; },

  // Plans whose event has passed, where the user intended to go and hasn't told us how it went.
  get duePlanFollowups() {
    const now = Date.now();
    return state.plans.filter(p =>
      p.gate_verdict === "go" && !p.followup_done && p.event_ts && now > p.event_ts + 3 * 3600e3
    );
  },

  exportJSON() { return JSON.stringify(state, null, 2); },
  wipe() { state = empty(); save(); },
};
