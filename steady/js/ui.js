// Tiny DOM helpers + the shared components: header, chips, ruler slider, banner.

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v == null) continue;
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === "style") node.style.cssText = v;
    else node.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.append(c.nodeType ? c : document.createTextNode(c));
  }
  return node;
}

// ---------- navigation: simple screen stack, hardware-back friendly ----------

const root = () => document.getElementById("app");
const stack = [];

function render() {
  const top = stack[stack.length - 1];
  root().replaceChildren();
  const screen = el("div", { class: "screen" });
  root().append(screen);
  top(screen);
  window.scrollTo(0, 0);
}

export const nav = {
  go(screenFn) {
    stack.push(screenFn);
    history.pushState({ depth: stack.length }, "");
    render();
  },
  replace(screenFn) {
    stack[stack.length - 1] = screenFn;
    render();
  },
  back() { history.back(); },
  home() {
    // Pop everything back to the root screen.
    if (stack.length > 1) history.go(-(stack.length - 1));
    else render();
  },
  start(screenFn) {
    stack.length = 0;
    stack.push(screenFn);
    history.replaceState({ depth: 1 }, "");
    render();
  },
};

window.addEventListener("popstate", (e) => {
  const depth = (e.state && e.state.depth) || 1;
  while (stack.length > depth && stack.length > 1) stack.pop();
  render();
});

// ---------- components ----------

// Two-line header: first line muted, second line ink.
export function header(kicker, title) {
  return el("h1", { class: "h2line" },
    el("span", { class: "kicker", text: kicker }),
    el("span", { class: "title", text: title }),
  );
}

export function topbar({ back = true, meta = "" } = {}) {
  return el("div", { class: "topbar" },
    back
      ? el("button", { class: "back", onClick: () => nav.back(), "aria-label": "Back", text: "← back" })
      : el("span"),
    meta ? el("span", { class: "step-dots", text: meta }) : null,
  );
}

export function label(text) {
  return el("div", { class: "label", text });
}

// Single-select chip group. onPick fires immediately on tap.
export function chipGroup(options, onPick, { quiet = false } = {}) {
  const wrap = el("div", { class: "chips", role: "group" });
  for (const opt of options) {
    const o = typeof opt === "string" ? { value: opt, text: opt } : opt;
    wrap.append(el("button", {
      class: "chip" + (quiet ? " quiet" : "") + (o.block ? " block" : ""),
      "aria-pressed": "false",
      text: o.text,
      onClick: (e) => {
        for (const b of wrap.querySelectorAll(".chip")) b.setAttribute("aria-pressed", "false");
        e.currentTarget.setAttribute("aria-pressed", "true");
        onPick(o.value, e.currentTarget);
      },
    }));
  }
  return wrap;
}

// Multi-select chip group; returns { node, selected:Set }.
export function multiChips(options) {
  const selected = new Set();
  const node = el("div", { class: "chips", role: "group" });
  for (const opt of options) {
    node.append(el("button", {
      class: "chip",
      "aria-pressed": "false",
      text: opt,
      onClick: (e) => {
        const on = !selected.has(opt);
        if (on) selected.add(opt); else selected.delete(opt);
        e.currentTarget.setAttribute("aria-pressed", String(on));
      },
    }));
  }
  return { node, selected };
}

// Big number readout with the ghost trailing ".0" (signature detail).
export function ghostNumber(value, ghost = ".0") {
  return el("div", { class: "big-fact" },
    String(value),
    el("span", { class: "ghost", text: ghost }),
  );
}

// Ruler slider: thin-line aesthetic, integers min..max, tap/drag/keys.
export function rulerSlider({ min = 1, max = 10, value = 5, labelText = "", onChange = () => {} }) {
  let val = value;
  const readout = ghostNumber(val);

  const fill = el("div", { class: "fill" });
  const thumb = el("div", { class: "thumb" });
  const ruler = el("div", {
    class: "ruler",
    tabindex: "0",
    role: "slider",
    "aria-valuemin": String(min),
    "aria-valuemax": String(max),
    "aria-valuenow": String(val),
    "aria-label": labelText || "value",
  }, el("div", { class: "ticks" }), fill, thumb);

  function paint() {
    const pct = (val - min) / (max - min);
    const pad = 16;
    const w = ruler.clientWidth - pad * 2;
    const x = pad + pct * w;
    thumb.style.left = `${x - 2}px`;
    fill.style.width = `${pct * w}px`;
    readout.replaceChildren(String(val), el("span", { class: "ghost", text: ".0" }));
    ruler.setAttribute("aria-valuenow", String(val));
  }

  function setFromX(clientX) {
    const r = ruler.getBoundingClientRect();
    const pad = 16;
    const pct = Math.min(1, Math.max(0, (clientX - r.left - pad) / (r.width - pad * 2)));
    const next = Math.round(min + pct * (max - min));
    if (next !== val) { val = next; paint(); onChange(val); }
  }

  ruler.addEventListener("pointerdown", (e) => {
    ruler.setPointerCapture(e.pointerId);
    setFromX(e.clientX);
  });
  ruler.addEventListener("pointermove", (e) => {
    if (e.buttons) setFromX(e.clientX);
  });
  ruler.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowUp") { val = Math.min(max, val + 1); paint(); onChange(val); }
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") { val = Math.max(min, val - 1); paint(); onChange(val); }
  });

  const node = el("div", { class: "slider-wrap" },
    labelText ? label(labelText) : null,
    readout,
    ruler,
  );
  requestAnimationFrame(paint);
  new ResizeObserver(paint).observe(ruler);
  node.getValue = () => val;
  return node;
}

// The one loud element: full-width warm banner, uppercase label + arrow.
export function banner({ tag, text, onClick }) {
  return el("button", { class: "banner", onClick },
    el("span", { class: "label", text: tag }),
    el("span", { class: "banner-main" },
      el("span", { text }),
      el("span", { class: "arrow", text: "→" }),
    ),
  );
}

export function btn(text, onClick, variant = "") {
  return el("button", { class: `btn ${variant}`.trim(), text, onClick });
}

export function listRow({ glyph, title, meta, value, ghost, onClick }) {
  const children = [
    el("span", { class: "icon-chip", text: glyph }),
    el("div", { class: "row-main" },
      el("div", { class: "row-title", text: title }),
      meta ? el("div", { class: "row-meta", text: meta }) : null,
    ),
    value != null
      ? el("span", { class: "row-value" }, String(value), ghost ? el("span", { class: "ghost", text: ghost }) : null)
      : null,
  ];
  return onClick
    ? el("button", { class: "row", onClick }, ...children)
    : el("div", { class: "row" }, ...children);
}

export function toggleRow(text, initial = false) {
  const node = el("button", { class: "toggle-row", "aria-pressed": String(initial) },
    el("span", { text }),
    el("span", { class: "pip", text: "" }),
  );
  node.addEventListener("click", () => {
    const on = node.getAttribute("aria-pressed") !== "true";
    node.setAttribute("aria-pressed", String(on));
    node.querySelector(".pip").textContent = on ? "✓" : "";
  });
  node.isOn = () => node.getAttribute("aria-pressed") === "true";
  return node;
}
