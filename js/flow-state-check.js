// Flow 1: State Check — overwhelm vs understimulation.
// Deterministic. Body scan → discriminator → optional emotions → verdict → one action.

import { el, nav, header, topbar, label, chipGroup, multiChips, btn, banner } from "./ui.js";
import { stateCheck, emotions } from "./content.js";
import { db } from "./store.js";
import { scheduleCheckback } from "./notify.js";

export function startStateCheck() {
  const answers = { signals: {}, discriminator: null, emotions: [] };
  nav.go(bodyStep(answers, 0));
}

function bodyStep(answers, i) {
  return (screen) => {
    const q = stateCheck.bodyQuestions[i];
    screen.append(
      topbar({ meta: `${i + 1} of 5` }),
      header("Right now", "What does your body say?"),
      label(q.label),
      chipGroup(q.options, (value) => {
        answers.signals[q.key] = value;
        setTimeout(() => {
          if (i + 1 < stateCheck.bodyQuestions.length) nav.go(bodyStep(answers, i + 1));
          else nav.go(discriminatorStep(answers));
        }, 160);
      }),
    );
  };
}

function discriminatorStep(answers) {
  return (screen) => {
    const d = stateCheck.discriminator;
    screen.append(
      topbar({ meta: "4 of 5" }),
      header("One more", d.question),
      chipGroup(d.options.map(o => ({ ...o, block: true })), (value) => {
        answers.discriminator = value;
        setTimeout(() => nav.go(emotionStep(answers)), 160);
      }),
    );
  };
}

function emotionStep(answers) {
  return (screen) => {
    const chips = multiChips(emotions);
    screen.append(
      topbar({ meta: "5 of 5" }),
      header("If any fit", "Name what's there"),
      el("p", { class: "body muted", text: "Naming it helps. Skipping is fine too." }),
      chips.node,
      el("div", { class: "spacer" }),
      btn("Continue", () => {
        answers.emotions = [...chips.selected];
        nav.go(verdictStep(answers));
      }),
      btn("Skip this", () => nav.go(verdictStep(answers)), "quiet-link"),
    );
  };
}

function classify(answers) {
  let over = 0, under = 0;
  for (const v of Object.values(answers.signals)) {
    if (v === "over") over++;
    if (v === "under") under++;
  }
  if (answers.discriminator === "over") over += 2;
  if (answers.discriminator === "under") under += 2;
  if (over - under >= 2) return "over";
  if (under - over >= 2) return "under";
  return "mixed";
}

function pickAction(classification) {
  const pool = stateCheck.actions[classification]();
  const n = db.actions.filter(a => a.flow === "state_check").length;
  return pool[n % pool.length];
}

function verdictStep(answers) {
  const classification = classify(answers);
  const verdict = stateCheck.verdicts[classification];
  const action = pickAction(classification);

  db.addCheckin({
    type: "state_check",
    body_signals: answers.signals,
    emotion_tags: answers.emotions,
    classification,
  });

  return (screen) => {
    screen.append(
      topbar(),
      header("This looks like it:", verdict.title),
      el("p", { class: "body", text: verdict.body }),
      el("div", { class: "spacer" }),
      banner({
        tag: "One thing, nothing else",
        text: action,
        onClick: () => {
          const rec = db.addAction({ flow: "state_check", text: action, accepted: true, completed: false });
          nav.go(doneStep(classification, rec.id));
        },
      }),
      btn("Something gentler", () => {
        const fallback = stateCheck.actions.mixed()[0];
        const rec = db.addAction({ flow: "state_check", text: fallback, accepted: true, completed: false });
        nav.go(doneStep("mixed", rec.id, fallback));
      }, "quiet-link"),
    );
  };
}

function doneStep(classification, actionId, overrideText) {
  return (screen) => {
    let reminderSet = false;
    const reminderBtn = btn("Set a 25-minute check-back", async () => {
      const ok = await scheduleCheckback(25, "Steady", "Quick check: how is it now?");
      reminderSet = true;
      reminderBtn.textContent = ok
        ? "Check-back set for 25 minutes"
        : "Will remind you if Steady is still open";
      reminderBtn.disabled = true;
    }, "ghost-btn");

    screen.append(
      topbar({ back: false }),
      header("Logged.", "Go do the thing"),
      el("p", { class: "body", text: overrideText || "Close the app. It'll be here after." }),
      el("div", { class: "spacer" }),
      reminderBtn,
      btn("Done here", () => nav.home()),
    );
    void reminderSet;
  };
}
