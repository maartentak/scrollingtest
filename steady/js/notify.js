// Best-effort reminders. Without a push server we can only fire while the app
// (or its tab) is alive; pending reminders are re-armed on every app start.

import { db, uid } from "./store.js";

const KEY = "steady.reminders.v1";

function pending() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
}
function setPending(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

function fire(r) {
  setPending(pending().filter(x => x.id !== r.id));
  if ("Notification" in window && Notification.permission === "granted") {
    try { new Notification(r.title, { body: r.body, tag: r.id }); return; } catch { /* fall through */ }
  }
  // Quiet in-app fallback.
  alert(`${r.title}\n\n${r.body}`);
}

function arm(r) {
  const delay = r.at - Date.now();
  if (delay <= 0) { fire(r); return; }
  setTimeout(() => fire(r), Math.min(delay, 2 ** 31 - 1));
}

export async function scheduleCheckback(minutes, title, body) {
  let granted = false;
  if ("Notification" in window) {
    if (Notification.permission === "granted") granted = true;
    else if (Notification.permission !== "denied") {
      granted = (await Notification.requestPermission()) === "granted";
    }
  }
  const r = { id: uid(), at: Date.now() + minutes * 60e3, title, body };
  setPending([...pending(), r]);
  arm(r);
  return granted;
}

export function rearmReminders() {
  const now = Date.now();
  const keep = [];
  for (const r of pending()) {
    if (r.at < now - 12 * 3600e3) continue; // stale, drop silently — no guilt mechanics
    keep.push(r);
    arm(r);
  }
  setPending(keep);
  void db; // (reserved: future reminders may live in the main store)
}
