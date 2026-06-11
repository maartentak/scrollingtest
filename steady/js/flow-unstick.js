// Flow 2: Unstick — task paralysis.
// Brain dump → forced pick → shrink to smallest step → implementation
// intention → optional timer. Everything not picked is parked, visibly.

import { el, nav, header, topbar, label, btn, banner, chipGroup, listRow } from "./ui.js";
import { unstick } from "./content.js";
import { db } from "./store.js";

export function startUnstick() {
  nav.go(dumpStep);
}

// ---------- step 1: brain dump ----------

function dumpStep(screen) {
  const items = []; // { text, taskId? } — taskId set when it's an existing parked task
  const list = el("div", { class: "rows" });

  function renderList() {
    list.replaceChildren();
    for (const [i, it] of items.entries()) {
      list.append(listRow({
        glyph: String(i + 1).padStart(2, "0"),
        title: it.text,
        meta: it.taskId ? "from parked" : null,
        value: "×",
        onClick: () => { items.splice(i, 1); renderList(); },
      }));
    }
  }

  const input = el("input", {
    class: "text-input",
    type: "text",
    placeholder: "One thing per line. Keep it messy.",
    enterkeyhint: "done",
    autocomplete: "off",
  });
  function add() {
    const text = input.value.trim();
    if (!text) return;
    items.push({ text });
    input.value = "";
    renderList();
    input.focus();
  }
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });

  const parked = db.parkedTasks;
  const parkedSection = parked.length
    ? el("div", { class: "stack" },
        label("Still parked from last time — tap to include"),
        el("div", { class: "chips" },
          ...parked.map(t => {
            const chip = el("button", { class: "chip quiet", text: t.text, "aria-pressed": "false" });
            chip.addEventListener("click", () => {
              const idx = items.findIndex(it => it.taskId === t.id);
              if (idx >= 0) { items.splice(idx, 1); chip.setAttribute("aria-pressed", "false"); }
              else { items.push({ text: t.text, taskId: t.id }); chip.setAttribute("aria-pressed", "true"); }
              renderList();
            });
            return chip;
          }),
        ),
      )
    : null;

  screen.append(
    topbar(),
    header("Get it out", "of your head"),
    el("p", { class: "body muted", text: "Everything that's circling. No order, no priorities." }),
    el("div", { class: "chips" },
      input,
      btn("Add", add, "ghost-btn"),
    ),
    list,
    parkedSection,
    el("div", { class: "spacer" }),
    btn("That's everything", () => {
      add(); // catch unsubmitted text
      if (!items.length) return;
      // Persist every dumped item as a parked task right away.
      const tasks = items.map(it =>
        it.taskId ? db.tasks.find(t => t.id === it.taskId) : db.addTask({ text: it.text })
      );
      if (tasks.length === 1) nav.go(shrinkStep(tasks[0], tasks));
      else if (tasks.length <= 4) nav.go(duelStep(tasks, 0, tasks[0]));
      else nav.go(tapPickStep(tasks));
    }),
  );
  setTimeout(() => input.focus(), 250);
}

// ---------- step 2: forced pick ----------

// Winner-stays pairwise pick for 2–4 tasks (max 3 comparisons).
function duelStep(tasks, nextIdx, current) {
  return (screen) => {
    const challenger = tasks[nextIdx + 1];
    if (!challenger) { nav.replace(shrinkStep(current, tasks)); return; }
    const onPick = (winner) => {
      setTimeout(() => {
        if (nextIdx + 2 < tasks.length) nav.go(duelStep(tasks, nextIdx + 1, winner));
        else nav.go(shrinkStep(winner, tasks));
      }, 160);
    };
    screen.append(
      topbar({ meta: "quick pick" }),
      header("No sorting.", "Which one first?"),
      el("div", { class: "stack" },
        el("button", { class: "card-btn tone-2", onClick: () => onPick(current) },
          el("span", { class: "card-title", text: current.text })),
        el("button", { class: "card-btn tone-3", onClick: () => onPick(challenger) },
          el("span", { class: "card-title", text: challenger.text })),
      ),
      el("p", { class: "footnote", text: "Gut answer. There is no wrong one." }),
    );
  };
}

// 5+ tasks: one tap, done.
function tapPickStep(tasks) {
  return (screen) => {
    screen.append(
      topbar({ meta: "quick pick" }),
      header("No sorting.", "Tap the one that matters most today"),
      el("div", { class: "rows" },
        ...tasks.map((t, i) => listRow({
          glyph: String(i + 1).padStart(2, "0"),
          title: t.text,
          onClick: () => nav.go(shrinkStep(t, tasks)),
        })),
      ),
      el("p", { class: "footnote", text: "The rest gets parked. Nothing is lost." }),
    );
  };
}

// ---------- step 3: shrink it ----------

function suggestSteps(task, smaller = false) {
  if (smaller) return unstick.evenSmallerSteps;
  for (const h of unstick.stepHeuristics) {
    if (h.match.test(task.text)) return [...h.steps, ...unstick.genericSteps.slice(0, 2)];
  }
  return unstick.genericSteps;
}

function shrinkStep(task, allTasks, smaller = false) {
  return (screen) => {
    const custom = el("input", {
      class: "text-input",
      type: "text",
      placeholder: "or type your own tiny step",
      enterkeyhint: "done",
    });
    custom.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && custom.value.trim()) nav.go(intentionStep(task, allTasks, custom.value.trim()));
    });

    screen.append(
      topbar(),
      header(smaller ? "Smaller, then." : "Shrink it.", task.text),
      label(smaller ? "Even smaller first step" : "Smallest first step"),
      chipGroup(
        suggestSteps(task, smaller).map(s => ({ value: s, text: s, block: true })),
        (step) => setTimeout(() => nav.go(intentionStep(task, allTasks, step)), 160),
      ),
      custom,
    );
  };
}

// ---------- step 4: implementation intention ----------

function intentionStep(task, allTasks, step) {
  return (screen) => {
    db.updateTask(task.id, { status: "active", smallest_step: step });
    screen.append(
      topbar(),
      header("Say it once:", "When I close this app,"),
      el("p", { class: "body", style: "font-size:24px; line-height:1.3; font-weight:500;", text: `I will ${lc(step)}.` }),
      el("div", { class: "spacer" }),
      banner({
        tag: "That's the deal",
        text: "Close the app and do it",
        onClick: () => {
          db.addAction({ flow: "unstick", text: step, accepted: true, completed: false });
          nav.go(timerOfferStep(task, allTasks, step));
        },
      }),
    );
  };
}

const lc = (s) => s.charAt(0).toLowerCase() + s.slice(1);

// ---------- step 5: timer ----------

function timerOfferStep(task, allTasks, step) {
  return (screen) => {
    screen.append(
      topbar({ back: false }),
      header("Want a", "timer with that?"),
      el("p", { class: "body muted", text: "When it rings, you report back. That's all it does." }),
      chipGroup([
        { value: 25, text: "25 minutes", block: true },
        { value: 50, text: "50 minutes", block: true },
      ], (mins) => setTimeout(() => nav.go(timerStep(task, allTasks, step, mins)), 160)),
      el("div", { class: "spacer" }),
      parkedNote(allTasks, task),
      btn("No timer, just going", () => nav.go(endStep(task, allTasks, step, "no_timer"))),
    );
  };
}

function timerStep(task, allTasks, step, mins) {
  return (screen) => {
    const endAt = Date.now() + mins * 60e3;
    const face = el("div", { class: "big-fact" });
    const fill = el("div", { class: "qp-fill", style: "width:0%" });
    let interval;

    function tick() {
      const left = Math.max(0, endAt - Date.now());
      const m = Math.floor(left / 60e3);
      const s = Math.floor((left % 60e3) / 1e3);
      face.replaceChildren(
        String(m),
        el("span", { class: "ghost", text: ":" + String(s).padStart(2, "0") }),
      );
      fill.style.width = `${(1 - left / (mins * 60e3)) * 100}%`;
      if (left <= 0) {
        clearInterval(interval);
        nav.replace(endStep(task, allTasks, step, "timer_done"));
      }
    }
    interval = setInterval(tick, 1000);
    tick();

    screen.append(
      topbar({ back: false }),
      header("Timer running.", task.text),
      el("div", { class: "timer-face" },
        face,
        el("div", { class: "quiet-progress" }, fill),
        el("p", { class: "body muted center", text: `First step: ${lc(step)}` }),
      ),
      el("div", { class: "spacer" }),
      btn("Finished early", () => { clearInterval(interval); nav.go(endStep(task, allTasks, step, "early")); }, "ghost-btn"),
      btn("Stop the timer", () => { clearInterval(interval); nav.home(); }, "quiet-link"),
    );
  };
}

// ---------- step 6: report back (no shame state) ----------

function endStep(task, allTasks, step, via) {
  return (screen) => {
    const choice = (status) => {
      if (status === "done") {
        db.updateTask(task.id, { status: "done", completions: [...(task.completions || []), Date.now()] });
        db.addAction({ flow: "unstick", text: step, accepted: true, completed: true });
        nav.go(closingStep("Done. That counts.", allTasks, task));
      } else if (status === "progress") {
        db.updateTask(task.id, { status: "parked", completions: [...(task.completions || []), Date.now()] });
        db.addAction({ flow: "unstick", text: step, accepted: true, completed: true });
        nav.go(closingStep("Progress is the whole point. Logged.", allTasks, task));
      } else {
        // Didn't start: zero shame, shrink further.
        db.updateTask(task.id, { status: "parked" });
        nav.go(shrinkStep(task, allTasks, true));
      }
    };
    screen.append(
      topbar({ back: false }),
      header(via === "timer_done" ? "Time's up." : "Okay.", "How did it go?"),
      chipGroup([
        { value: "done", text: "Done", block: true },
        { value: "progress", text: "Made progress", block: true },
        { value: "none", text: "Didn't start", block: true },
      ], (v) => setTimeout(() => choice(v), 160)),
      el("p", { class: "footnote", text: "“Didn't start” just means the step was too big. We shrink it." }),
    );
  };
}

function closingStep(message, allTasks, task) {
  return (screen) => {
    screen.append(
      topbar({ back: false }),
      header("Logged.", message),
      el("div", { class: "spacer" }),
      parkedNote(allTasks, task),
      btn("Done here", () => nav.home()),
    );
  };
}

function parkedNote(allTasks, current) {
  const n = db.parkedTasks.filter(t => t.id !== current.id).length;
  if (!n) return null;
  return el("div", { class: "panel dark" },
    el("div", { class: "label", text: "Parked" }),
    el("p", { class: "body", text: `${n} task${n === 1 ? "" : "s"} parked. They're safe here.` }),
  );
}
