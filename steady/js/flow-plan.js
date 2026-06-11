// Flow 3: Go or Cancel — plan dread.
// Two gates: capacity first (honoring real limits is a feature), then
// avoidance. Ends in one action. Logs predicted dread/enjoyment so the
// next-day follow-up can build the personal evidence base.

import { el, nav, header, topbar, label, btn, banner, chipGroup, toggleRow, rulerSlider } from "./ui.js";
import { goOrCancel } from "./content.js";
import { db } from "./store.js";
import { scheduleCheckback } from "./notify.js";

export function startGoOrCancel() {
  const plan = {};
  nav.go(whatStep(plan));
}

// ---------- step 1: what's the plan ----------

function whatStep(plan) {
  return (screen) => {
    let category = null;
    const whenChips = chipGroup([
      { value: "tonight", text: "Tonight" },
      { value: "this_week", text: "This week" },
    ], (v) => {
      plan.when = v;
      maybeNext();
    });
    const catChips = chipGroup(goOrCancel.categories, (v) => {
      category = v;
      maybeNext();
    });
    function maybeNext() {
      if (category && plan.when) {
        plan.category = category;
        plan.event_ts = plan.when === "tonight"
          ? new Date().setHours(20, 0, 0, 0)
          : Date.now() + 3 * 86400e3;
        setTimeout(() => nav.go(capacityStep(plan)), 200);
      }
    }
    screen.append(
      topbar({ meta: "1 of 4" }),
      header("The plan", "you're dreading"),
      label("What kind of thing"),
      catChips,
      label("When"),
      whenChips,
    );
  };
}

// ---------- step 2: capacity gate ----------

function capacityStep(plan) {
  return (screen) => {
    const toggles = goOrCancel.capacityQuestions.map(q => toggleRow(q));
    screen.append(
      topbar({ meta: "2 of 4" }),
      header("First, honestly:", "the last few days"),
      el("div", { class: "rows" }, ...toggles),
      el("div", { class: "spacer" }),
      btn("Continue", () => {
        plan.capacity_answers = toggles.map(t => t.isOn());
        const sick = plan.capacity_answers[3];
        const depleted = sick || plan.capacity_answers.filter(Boolean).length >= 2;
        if (depleted) nav.go(verdictStep(plan, "capacity_cancel"));
        else nav.go(avoidanceStep(plan));
      }),
    );
  };
}

// ---------- step 3: avoidance gate ----------

function avoidanceStep(plan) {
  return (screen) => {
    let q1 = null, q2 = null;
    function maybeNext() {
      if (q1 && q2) {
        plan.gate_answers = { still_cancel: q1, enjoyed_before: q2 };
        const genuineNo = q1 === "yes" && q2 === "rarely";
        setTimeout(() => nav.go(verdictStep(plan, genuineNo ? "genuine_no" : "go")), 200);
      }
    }
    screen.append(
      topbar({ meta: "3 of 4" }),
      header("You have the capacity.", "So, two questions"),
      label("If the anxiety vanished right now, would you still want to cancel?"),
      chipGroup([
        { value: "yes", text: "Yes" },
        { value: "no", text: "No" },
        { value: "unsure", text: "Don't know" },
      ], (v) => { q1 = v; maybeNext(); }),
      label("This kind of thing — once you're actually there, how does it usually land?"),
      chipGroup([
        { value: "usually_good", text: "Usually fine, even good" },
        { value: "sometimes", text: "Mixed" },
        { value: "rarely", text: "Rarely works for me" },
      ], (v) => { q2 = v; maybeNext(); }),
    );
  };
}

// ---------- personal history (the killer feature) ----------

function historyLine(category) {
  const similar = db.plans.filter(p =>
    p.category === category && p.followup_done && p.predicted_dread != null
  );
  if (similar.length < 2) return null;
  const dreaded = similar.filter(p => p.predicted_dread >= 6).length;
  const glad = similar.filter(p => p.went && p.actual_enjoyment >= 6).length;
  return `You've logged ${similar.length} plans like this. You dreaded ${dreaded} of them. You were glad you went ${glad} time${glad === 1 ? "" : "s"}.`;
}

// ---------- step 4: verdict ----------

function verdictStep(plan, verdict) {
  return (screen) => {
    const v = goOrCancel.verdicts[verdict];
    const history = verdict === "go" ? historyLine(plan.category) : null;

    if (verdict !== "go") {
      // Cancelling ends the flow: log and release.
      screen.append(
        topbar({ back: false }),
        header(v.kicker, v.title),
        el("p", { class: "body", text: v.body }),
        el("div", { class: "spacer" }),
        banner({
          tag: "One action out",
          text: v.cta,
          onClick: () => {
            db.addPlan({ ...plan, gate_verdict: verdict, went: false, followup_done: true });
            db.addAction({ flow: "go_or_cancel", text: v.cta, accepted: true, completed: false });
            nav.go(closing("Cancelled, guilt-free.", "Send the message now, before you renegotiate with yourself."));
          },
        }),
      );
      return;
    }

    screen.append(
      topbar({ meta: "4 of 4" }),
      header(v.kicker, v.title),
      el("p", { class: "body", text: v.body }),
      history ? el("div", { class: "panel dark" },
        el("div", { class: "label", text: "Your own record" }),
        el("p", { class: "body", text: history }),
      ) : null,
      el("div", { class: "spacer" }),
      btn("Log the prediction", () => nav.go(predictionStep(plan))),
    );
  };
}

// ---------- step 5: prediction sliders ----------

function predictionStep(plan) {
  return (screen) => {
    const dread = rulerSlider({ value: 7, labelText: "Dread, right now" });
    const enjoy = rulerSlider({ value: 4, labelText: "How good do you expect it to be" });
    screen.append(
      topbar(),
      header("On the record:", "predict it"),
      dread,
      enjoy,
      el("p", { class: "footnote", text: "Tomorrow you'll log how it actually was. The gap is the lesson." }),
      el("div", { class: "spacer" }),
      btn("Lock it in", () => {
        plan.predicted_dread = dread.getValue();
        plan.predicted_enjoyment = enjoy.getValue();
        nav.go(dealStep(plan));
      }),
    );
  };
}

// ---------- step 6: lower the bar, one action out ----------

function dealStep(plan) {
  return (screen) => {
    const v = goOrCancel.verdicts.go;
    screen.append(
      topbar({ back: false }),
      header("The deal", "is small on purpose"),
      el("p", { class: "body", text: v.ctaSub }),
      el("div", { class: "spacer" }),
      banner({
        tag: "The whole assignment",
        text: v.cta,
        onClick: () => {
          const rec = db.addPlan({ ...plan, gate_verdict: "go", went: null, followup_done: false });
          db.addAction({ flow: "go_or_cancel", text: v.cta, accepted: true, completed: false });
          if (plan.when === "tonight") nav.go(waitingStep(rec));
          else nav.go(closing("Deal logged.", "Steady will ask how it actually went, after."));
        },
      }),
    );
  };
}

// ---------- waiting-mode helper (plan is later today) ----------

function waitingStep(planRec) {
  return (screen) => {
    let alarmBtnDone = false;
    const hoursLeft = Math.max(1, Math.round((planRec.event_ts - Date.now()) / 3600e3));
    const alarm = btn("Get-ready reminder, 45 min before", async () => {
      if (alarmBtnDone) return;
      const mins = Math.max(5, Math.round((planRec.event_ts - Date.now()) / 60e3) - 45);
      const ok = await scheduleCheckback(mins, "Steady", "Time to get ready. The deal is 30 minutes, remember.");
      alarm.textContent = ok ? "Reminder set" : "Will remind you if Steady is still open";
      alarm.disabled = true;
      alarmBtnDone = true;
    }, "ghost-btn");

    screen.append(
      topbar({ back: false }),
      header("Until then", "don't guard the clock"),
      el("p", { class: "body", text: `About ${hoursLeft} hour${hoursLeft === 1 ? "" : "s"} to go. Waiting mode eats focus, so pick something small and interruptible — dishes, a shower, sorting one drawer. Nothing that minds being dropped.` }),
      el("div", { class: "spacer" }),
      alarm,
      btn("Done here", () => nav.home()),
    );
  };
}

// ---------- next-day follow-up (entered from home) ----------

export function followupScreen(plan) {
  return (screen) => {
    screen.append(
      topbar(),
      header("About that plan —", "did you go?"),
      chipGroup([
        { value: true, text: "I went", block: true },
        { value: false, text: "I didn't", block: true },
      ], (went) => {
        if (went) setTimeout(() => nav.go(actualStep(plan)), 160);
        else {
          db.updatePlan(plan.id, { went: false, followup_done: true });
          nav.go(closing("Logged, no judgment.", "Data point taken. That's all it is."));
        }
      }),
    );
  };
}

function actualStep(plan) {
  return (screen) => {
    const slider = rulerSlider({ value: 6, labelText: "How was it, actually" });
    screen.append(
      topbar(),
      header("One slider,", "honest answer"),
      slider,
      el("div", { class: "spacer" }),
      btn("Save", () => {
        const actual = slider.getValue();
        db.updatePlan(plan.id, { went: true, actual_enjoyment: actual, followup_done: true });
        const gap = actual - (plan.predicted_enjoyment ?? actual);
        const note = gap >= 2
          ? `You predicted ${plan.predicted_enjoyment}. It was ${actual}. Worth remembering next time the dread talks.`
          : `You predicted ${plan.predicted_enjoyment ?? "—"}. It was ${actual}. On the record.`;
        nav.go(closing("Logged.", note));
      }),
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
