// Flow 5: Self-sabotage — the knowing-doing gap.
// "I should X but don't" almost never means weak willpower. The flow names
// the actual blocker (missing cue, empty tank, me-time protest, habit pull,
// start friction, hidden no) and matches the plan to it: implementation
// intentions and environment design, never discipline. One prep action out.

import { el, nav, header, topbar, label, chipGroup, btn, banner } from "./ui.js";
import { sabotage } from "./content.js";
import { db } from "./store.js";

export function startSabotage(prefill = null) {
  const h = prefill ? { target: prefill.target, target_text: prefill.target_text } : {};
  nav.go(prefill ? barrierStep(h) : targetStep(h));
}

// ---------- step 1: the thing ----------

function targetStep(h) {
  return (screen) => {
    const custom = el("input", {
      class: "text-input",
      type: "text",
      placeholder: "name it in a few words",
      enterkeyhint: "done",
      style: "display:none",
    });
    custom.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && custom.value.trim()) {
        h.target = "other";
        h.target_text = custom.value.trim();
        nav.go(contextStep(h));
      }
    });
    screen.append(
      topbar({ meta: "1 of 3" }),
      header("The thing", "you keep not doing"),
      chipGroup(sabotage.targets, (value, chipEl) => {
        if (value === "other") {
          custom.style.display = "";
          custom.focus();
          return;
        }
        h.target = value;
        h.target_text = sabotage.targets.find(t => t.value === value).text;
        setTimeout(() => nav.go(contextStep(h)), 160);
      }),
      custom,
      el("p", { class: "footnote", text: "Knowing and not doing is not a character verdict. It's a mechanism, and mechanisms have fixes." }),
    );
  };
}

// ---------- step 2: when it falls apart ----------

function contextStep(h) {
  return (screen) => {
    screen.append(
      topbar({ meta: "2 of 3" }),
      header("When does it", "usually fall apart?"),
      chipGroup(sabotage.contexts, (value) => {
        h.context = value;
        setTimeout(() => nav.go(barrierStep(h)), 160);
      }),
    );
  };
}

// ---------- step 3: the real blocker ----------

function barrierStep(h) {
  return (screen) => {
    screen.append(
      topbar({ meta: "3 of 3" }),
      header("Right before it doesn't happen —", "what's actually there?"),
      label("Pick the loudest one"),
      chipGroup(sabotage.barriers.map(b => ({ ...b, block: true })), (value) => {
        h.barrier = value;
        setTimeout(() => nav.go(verdictStep(h)), 160);
      }),
    );
  };
}

// ---------- step 4: name the mechanism ----------

function verdictStep(h) {
  const strat = sabotage.strategies[h.barrier];
  return (screen) => {
    screen.append(
      topbar(),
      header("Named:", strat.title),
      el("p", { class: "body", text: strat.body }),
      el("div", { class: "spacer" }),
      btn("Show me the plan", () => nav.go(planStep(h))),
    );
  };
}

// ---------- step 5: the plan + one prep action now ----------

function planStep(h) {
  const strat = sabotage.strategies[h.barrier];
  const plan = strat.plans[h.target] || strat.plans.generic;
  return (screen) => {
    screen.append(
      topbar(),
      header("The plan", "runs on rails, not willpower"),
      el("div", { class: "panel dark" },
        el("div", { class: "label", text: h.target_text || "The deal" }),
        el("p", { class: "body", text: plan.ifthen }),
      ),
      el("p", { class: "footnote", text: "Steady asks tomorrow whether it happened. No score, no streak — just a data point." }),
      el("div", { class: "spacer" }),
      banner({
        tag: "Right now, one minute",
        text: plan.prep,
        onClick: () => {
          db.addHabit({
            target: h.target,
            target_text: h.target_text,
            context: h.context || null,
            barrier: h.barrier,
            ifthen: plan.ifthen,
            prep: plan.prep,
            followup_due: nextMorning(),
            outcome: null,
          });
          db.addAction({ flow: "sabotage", text: plan.prep, accepted: true, completed: false });
          nav.go(closing("Plan logged.", "The prep is the plan starting. Go do that one minute."));
        },
      }),
    );
  };
}

function nextMorning() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  return d.getTime();
}

// ---------- next-day follow-up (entered from home) ----------

export function habitFollowupScreen(habit) {
  return (screen) => {
    screen.append(
      topbar(),
      header(habit.target_text || "That plan —", "did it happen?"),
      el("p", { class: "body muted", text: habit.ifthen }),
      chipGroup([
        { value: "did", text: "It happened", block: true },
        { value: "partly", text: "Partly", block: true },
        { value: "not", text: "Not this time", block: true },
      ], (outcome) => {
        db.updateHabit(habit.id, { outcome });
        setTimeout(() => nav.go(outcomeStep(habit, outcome)), 160);
      }),
    );
  };
}

function outcomeStep(habit, outcome) {
  return (screen) => {
    screen.append(
      topbar({ back: false }),
      header("Logged.", sabotage.outcomes[outcome]),
      el("div", { class: "spacer" }),
      outcome === "not"
        ? btn("Rework the plan, smaller", () => startSabotage(habit), "ghost-btn")
        : null,
      btn("Done here", () => nav.home()),
    );
  };
}

function closing(title, body) {
  return (screen) => {
    screen.append(
      topbar({ back: false }),
      header(title, body),
      el("div", { class: "spacer" }),
      btn("Done here", () => nav.home()),
    );
  };
}
