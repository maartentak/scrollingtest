// Steady — entry point and home screen.
// Four cards, nothing else. Recognition over recall: the cards ARE the prompt.

import { el, nav, listRow } from "./ui.js";
import { db } from "./store.js";
import { startStateCheck } from "./flow-state-check.js";
import { startUnstick } from "./flow-unstick.js";
import { startGoOrCancel, followupScreen } from "./flow-plan.js";
import { startCheckin } from "./flow-checkin.js";
import { showHistory } from "./history.js";
import { showSettings, applyAppearance } from "./settings.js";
import { rearmReminders } from "./notify.js";

const cards = [
  { title: "I feel off and don't know why", sub: "State check", tone: 1, go: startStateCheck },
  { title: "I'm stuck and can't start", sub: "Unstick", tone: 2, go: startUnstick },
  { title: "There's a plan I'm dreading", sub: "Go or cancel", tone: 3, go: startGoOrCancel },
  { title: "Just checking in", sub: "Thirty seconds", tone: 1, go: startCheckin },
];

function home(screen) {
  const followups = db.duePlanFollowups;

  screen.append(
    el("h1", { class: "h2line", style: "margin-top:18px" },
      el("span", { class: "kicker", text: "Right now," }),
      el("span", { class: "title", text: "what's going on?" }),
    ),

    // Quiet follow-up row (next-day predicted-vs-actual). Tonal, never loud.
    ...followups.slice(0, 1).map(p => listRow({
      glyph: "?",
      title: "That plan you logged — how did it actually go?",
      meta: "One slider, ten seconds",
      onClick: () => nav.go(followupScreen(p)),
    })),

    el("div", { class: "stack" },
      ...cards.map(c =>
        el("button", { class: `card-btn tone-${c.tone}`, onClick: c.go },
          el("span", { class: "card-title", text: c.title }),
          el("span", { class: "card-sub", text: c.sub }),
        ),
      ),
    ),

    el("div", { class: "home-foot" },
      el("button", { text: "history", onClick: showHistory }),
      el("button", { text: "settings", onClick: showSettings }),
    ),
  );
}

applyAppearance();
rearmReminders();
nav.start(home);

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
