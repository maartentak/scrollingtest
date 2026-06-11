// History: parked tasks first (they're the live ones), then a flat quiet log.
// No charts yet — the weekly radial reflection comes with the AI layer.

import { el, nav, header, topbar, label, listRow, btn } from "./ui.js";
import { db } from "./store.js";
import { fmtDate } from "./content.js";

const stateLabels = { over: "overloaded", under: "understimulated", mixed: "unclear" };

export function showHistory() {
  nav.go((screen) => {
    const parked = db.parkedTasks;

    const entries = [
      ...db.checkins.map(c => ({
        ts: c.ts,
        glyph: c.type === "state_check" ? "ST" : "CH",
        title: c.type === "state_check"
          ? `State check — ${stateLabels[c.classification] || "logged"}`
          : (c.emotion_tags?.length ? c.emotion_tags.join(", ") : "Check-in"),
        meta: fmtDate(c.ts),
        value: c.energy ?? null,
        ghost: c.energy != null ? ".0" : null,
      })),
      ...db.plans.map(p => ({
        ts: p.created_ts,
        glyph: "PL",
        title: planTitle(p),
        meta: fmtDate(p.created_ts),
        value: p.actual_enjoyment ?? p.predicted_dread ?? null,
        ghost: (p.actual_enjoyment ?? p.predicted_dread) != null ? ".0" : null,
      })),
      ...db.tasks.filter(t => t.status === "done").map(t => ({
        ts: t.created_ts,
        glyph: "OK",
        title: t.text,
        meta: `done · ${fmtDate(t.created_ts)}`,
      })),
    ].sort((a, b) => b.ts - a.ts).slice(0, 60);

    screen.append(
      topbar(),
      header("Quietly", "kept"),

      parked.length ? label(`Parked — ${parked.length}, safe here`) : null,
      parked.length ? el("div", { class: "rows" },
        ...parked.map(t => listRow({
          glyph: "··",
          title: t.text,
          meta: fmtDate(t.created_ts),
          value: "done?",
          onClick: () => {
            db.updateTask(t.id, { status: "done" });
            showHistoryReplace();
          },
        })),
      ) : null,
      parked.length ? el("p", { class: "footnote", text: "Tap one to mark it done. Or leave them. They don't expire." }) : null,

      entries.length ? label("Log") : null,
      entries.length
        ? el("div", { class: "rows" }, ...entries.map(e => listRow(e)))
        : el("p", { class: "body muted", text: "Nothing here yet. That's fine — it fills up on its own." }),

      el("div", { class: "spacer" }),
      btn("Back home", () => nav.home(), "ghost-btn"),
    );
  });
}

function showHistoryReplace() {
  nav.back();
  setTimeout(showHistory, 0);
}

function planTitle(p) {
  const cat = { call: "a call", one_on_one: "meeting one person", group: "a group event", networking: "networking", family: "family", other: "a plan" }[p.category] || "a plan";
  if (p.gate_verdict === "capacity_cancel") return `Cancelled ${cat} — maintenance`;
  if (p.gate_verdict === "genuine_no") return `Cancelled ${cat} — real no`;
  if (p.went === true) return `Went to ${cat}`;
  if (p.went === false) return `Skipped ${cat}`;
  return `Planned: ${cat}`;
}
