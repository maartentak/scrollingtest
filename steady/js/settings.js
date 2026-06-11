// Settings: extra calm mode, theme, export, wipe, and the static crisis note.

import { el, nav, header, topbar, label, btn, chipGroup } from "./ui.js";
import { db } from "./store.js";

export function applyAppearance() {
  const s = db.settings;
  const dark = s.theme === "dark" ||
    (s.theme === "auto" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.dataset.calm = s.calm ? "1" : "0";
}

matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyAppearance);

export function showSettings() {
  nav.go((screen) => {
    const calmChips = chipGroup([
      { value: false, text: "Normal" },
      { value: true, text: "Extra calm" },
    ], (v) => { db.setSetting("calm", v); applyAppearance(); });
    preselect(calmChips, db.settings.calm ? 1 : 0);

    const themeChips = chipGroup([
      { value: "auto", text: "Auto" },
      { value: "light", text: "Light" },
      { value: "dark", text: "Dark" },
    ], (v) => { db.setSetting("theme", v); applyAppearance(); });
    preselect(themeChips, ["auto", "light", "dark"].indexOf(db.settings.theme));

    let wipeArmed = false;
    const wipeBtn = btn("Delete all data", () => {
      if (!wipeArmed) {
        wipeArmed = true;
        wipeBtn.textContent = "Tap again to really delete everything";
        return;
      }
      db.wipe();
      applyAppearance();
      nav.home();
    }, "ghost-btn");

    screen.append(
      topbar(),
      header("Settings,", "such as they are"),

      label("Color"),
      calmChips,
      el("p", { class: "footnote", text: "Extra calm removes the two accent colors. Pure tonal greens." }),

      label("Appearance"),
      themeChips,

      label("Your data"),
      el("p", { class: "footnote", text: "Everything you log stays on this device. Nothing is sent anywhere." }),
      btn("Export everything as JSON", exportData, "ghost-btn"),
      wipeBtn,

      el("hr", { class: "divider" }),
      el("p", { class: "footnote", text: "Steady is a self-regulation tool, not therapy, and not for crisis moments. If things are heavy in a way an app shouldn't touch, talk to a person: in the Netherlands call 113 (or 0800-0113, 113.nl). Elsewhere, findahelpline.com." }),

      el("div", { class: "spacer" }),
      btn("Back home", () => nav.home()),
    );
  });
}

function preselect(group, index) {
  const chips = group.querySelectorAll(".chip");
  if (chips[index]) chips[index].setAttribute("aria-pressed", "true");
}

function exportData() {
  const blob = new Blob([db.exportJSON()], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = el("a", { href: url, download: `steady-export-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
