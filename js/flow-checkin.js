// Flow 4: Just Checking In — 30 seconds, tops.
// One slider, mood chips, optional note. Feeds the pattern layer.

import { el, nav, header, topbar, btn, multiChips, rulerSlider, label } from "./ui.js";
import { moods } from "./content.js";
import { db } from "./store.js";

export function startCheckin() {
  nav.go((screen) => {
    const energy = rulerSlider({ value: 5, labelText: "Energy" });
    const chips = multiChips(moods);
    const note = el("textarea", {
      class: "area-input",
      placeholder: "Optional. One line is plenty.",
      rows: "2",
    });
    screen.append(
      topbar(),
      header("Just checking in.", "Thirty seconds"),
      energy,
      label("Anything that fits"),
      chips.node,
      note,
      el("div", { class: "spacer" }),
      btn("Log it", () => {
        db.addCheckin({
          type: "checkin",
          energy: energy.getValue(),
          emotion_tags: [...chips.selected],
          note: note.value.trim() || null,
        });
        nav.go((s) => {
          s.append(
            topbar({ back: false }),
            header("Logged.", "That's all it needs"),
            el("div", { class: "spacer" }),
            btn("Done here", () => nav.home()),
          );
        });
      }),
    );
  });
}
