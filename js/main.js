import * as THREE from 'three';

const gsap = window.gsap;
gsap.registerPlugin(window.ScrollTrigger, window.ScrollToPlugin);

/* ============================================================
   Config
   ============================================================ */

const COLORS = {
  paper: 0xedebe4,
  ground: 0xf0eee7,
  shell: 0xfafaf7,      // buildings / structures
  shellDim: 0xe9e7df,
  ink: 0x141412,
  inkSoft: 0x4a4a45,
  accent: 0x0fa36b,
  accentSoft: 0x9be3c4,
  crate: 0xdcdad2,
  crateAlt: 0xcfd6cf,
};

// World zones laid out along the camera's journey
const Z1 = new THREE.Vector3(0, 0, 0);       // depot — assets identified
const Z2 = new THREE.Vector3(64, 0, -18);    // network — shared truth
const Z3 = new THREE.Vector3(128, 0, 10);    // return loop
const Z4 = new THREE.Vector3(190, 0, -6);    // the mark assembles

// Scrub-driven progress values (animated by the GSAP timeline)
const P = {
  route1: 0,   // depot route lines drawing in
  s2: 0,       // network pulses / dot grid strength
  beam: 0,     // light beam sweep across the network
  s3: 0,       // return loop draw + flow
  s4: 0,       // voxel mark assembly
  beam2: 0,    // final beam across the mark
};

/* ============================================================
   Renderer / scene / camera
   ============================================================ */

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(COLORS.paper);
scene.fog = new THREE.Fog(COLORS.paper, 55, 165);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 600);

// Camera rig proxies, tweened by the timeline
const camPos = { x: -34, y: 30, z: 50 };
const camLook = { x: 6, y: 0, z: -2 };

// Pointer parallax
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
window.addEventListener('pointermove', (e) => {
  pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
});

/* ============================================================
   Lights & ground
   ============================================================ */

scene.add(new THREE.HemisphereLight(0xffffff, 0xe7e4da, 1.45));

const sun = new THREE.DirectionalLight(0xfff6e8, 1.15);
sun.position.set(150, 120, 60);
sun.target.position.set(95, 0, 0);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -150;
sun.shadow.camera.right = 150;
sun.shadow.camera.top = 120;
sun.shadow.camera.bottom = -120;
sun.shadow.camera.far = 400;
sun.shadow.bias = -0.0004;
sun.shadow.radius = 6;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(900, 900),
  new THREE.MeshStandardMaterial({ color: COLORS.ground, roughness: 1 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

/* ============================================================
   Small builders
   ============================================================ */

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.92, metalness: 0, ...opts });
}

function box(w, h, d, color, x, y, z, parent = scene) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}

function building(x, z, w, h, d, parent = scene) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  box(w, h, d, COLORS.shell, 0, h / 2, 0, g);
  // roof inset
  box(w * 0.55, 0.5, d * 0.55, 0xffffff, 0, h + 0.25, 0, g);
  parent.add(g);
  return g;
}

function gableBuilding(x, z, w, h, d, ry = 0, parent = scene) {
  // warehouse with a triangular gable roof
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  box(w, h, d, COLORS.shell, 0, h / 2, 0, g);
  const shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0);
  shape.lineTo(0, h * 0.42);
  shape.lineTo(w / 2, 0);
  shape.closePath();
  const roof = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false }),
    mat(0xffffff)
  );
  roof.position.set(0, h, -d / 2);
  roof.castShadow = true;
  g.add(roof);
  parent.add(g);
  return g;
}

function truck(x, z, ry = 0, parent = scene) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = ry;
  box(2.2, 2.2, 5.6, COLORS.shell, 0, 1.55, -0.8, g);          // trailer
  box(1.9, 1.7, 1.6, COLORS.shellDim, 0, 1.25, 2.9, g);        // cab
  for (const dz of [-2.6, -0.6, 2.9]) {
    const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.0, 10), mat(0x3a3a36));
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(0, 0.42, dz);
    wheel.castShadow = true;
    g.add(wheel);
  }
  parent.add(g);
  return g;
}

function person(x, z, parent = scene) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 8), mat(0xc9c7be));
  body.position.y = 0.45;
  body.castShadow = true;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), mat(0xc9c7be));
  head.position.y = 1.06;
  g.add(body, head);
  parent.add(g);
  return g;
}

// Instanced stack of crates (the product of the whole story)
function crateStacks(cx, cz, cols, rows, maxH, parent = scene) {
  const count = cols * rows * maxH;
  const geo = new THREE.BoxGeometry(1.35, 1.0, 1.35);
  // white base material: per-instance colors are multiplied with it
  const im = new THREE.InstancedMesh(geo, mat(0xffffff), count);
  im.castShadow = true;
  im.receiveShadow = true;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  let i = 0;
  for (let a = 0; a < cols; a++) {
    for (let b = 0; b < rows; b++) {
      const h = 1 + Math.floor(Math.random() * maxH);
      for (let k = 0; k < h; k++) {
        dummy.position.set(cx + a * 1.55, 0.52 + k * 1.05, cz + b * 1.55);
        dummy.rotation.y = (Math.random() - 0.5) * 0.08;
        dummy.updateMatrix();
        im.setMatrixAt(i, dummy.matrix);
        const tint = Math.random();
        if (tint > 0.86) color.setHex(COLORS.accentSoft);
        else if (tint > 0.5) color.setHex(COLORS.crateAlt);
        else color.setHex(COLORS.crate);
        im.setColorAt(i, color);
        i++;
      }
    }
  }
  im.count = i;
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  parent.add(im);
  return im;
}

/* ============================================================
   Zone 1 — depot: assets get their identity
   ============================================================ */

gableBuilding(Z1.x - 6, Z1.z - 4, 16, 6, 12);
building(Z1.x - 16, Z1.z + 8, 5, 9, 5);
building(Z1.x - 11, Z1.z + 10, 4, 6, 4);
crateStacks(Z1.x + 5, Z1.z + 4, 4, 3, 3);
crateStacks(Z1.x - 20, Z1.z - 10, 3, 2, 2);
truck(Z1.x + 12, Z1.z - 2, Math.PI / 2.3);
person(Z1.x + 3, Z1.z + 10);
person(Z1.x + 8, Z1.z - 7);
person(Z1.x - 2, Z1.z + 7);

// Dotted orbit ellipses around the world (decorative, like a flight path)
function dottedEllipse(cx, cz, rx, rz, rot = 0) {
  const pts = new THREE.EllipseCurve(0, 0, rx, rz, 0, Math.PI * 2).getPoints(220)
    .map((p) => new THREE.Vector3(p.x, 0.06, p.y));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(
    geo,
    new THREE.LineDashedMaterial({ color: COLORS.ink, dashSize: 0.5, gapSize: 1.1, transparent: true, opacity: 0.3 })
  );
  line.computeLineDistances();
  line.position.set(cx, 0, cz);
  line.rotation.y = rot;
  scene.add(line);
}
dottedEllipse(Z1.x + 18, Z1.z - 2, 46, 30, 0.35);
dottedEllipse(Z1.x + 30, Z1.z + 2, 64, 40, 0.2);

/* ============================================================
   Route lines (zone 1 → zone 2), drawn in on scroll
   ============================================================ */

const routeTubes = [];
function makeRoute(points, radius = 0.22, color = COLORS.accent) {
  const curve = new THREE.CatmullRomCurve3(points);
  const geo = new THREE.TubeGeometry(curve, 180, radius, 6, false);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color }));
  m.geometry.setDrawRange(0, 0);
  scene.add(m);
  return { mesh: m, curve, total: geo.index.count };
}

for (const off of [-1.2, 0, 1.2]) {
  routeTubes.push(
    makeRoute([
      new THREE.Vector3(Z1.x - 4, 0.3, Z1.z + 2 + off),
      new THREE.Vector3(Z1.x + 14, 0.3, Z1.z + 4 + off * 1.4),
      new THREE.Vector3(Z1.x + 30, 0.3, Z1.z - 4 + off),
      new THREE.Vector3(Z2.x - 18, 0.3, Z2.z + 10 + off * 1.6),
      new THREE.Vector3(Z2.x - 2 + off, 0.3, Z2.z + 2 + off),
    ])
  );
}

// Small pulses traveling along the first route while it's active
const routePulses = [];
{
  const geo = new THREE.SphereGeometry(0.42, 10, 10);
  const m = new THREE.MeshBasicMaterial({ color: COLORS.accent, transparent: true, opacity: 0 });
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Mesh(geo, m.clone());
    scene.add(s);
    routePulses.push({ mesh: s, offset: i / 3 });
  }
}

/* ============================================================
   Zone 2 — the network: one shared truth
   ============================================================ */

building(Z2.x - 2, Z2.z - 2, 6, 7, 6);
building(Z2.x + 8, Z2.z - 8, 5, 10, 5);
building(Z2.x + 13, Z2.z - 3, 4, 5, 4);
building(Z2.x - 10, Z2.z - 12, 5, 8, 5);
gableBuilding(Z2.x + 18, Z2.z + 8, 12, 5, 9, -0.4);
crateStacks(Z2.x - 12, Z2.z + 6, 3, 2, 2);
person(Z2.x + 4, Z2.z + 4);
person(Z2.x - 6, Z2.z + 2);

// Dot grid that lights up under the network
const dotGrid = (() => {
  const COLSN = 26, ROWSN = 18, SPACING = 1.7;
  const geo = new THREE.CircleGeometry(0.22, 10);
  const material = new THREE.MeshBasicMaterial({
    color: COLORS.accentSoft, transparent: true, opacity: 0, depthWrite: false,
  });
  const im = new THREE.InstancedMesh(geo, material, COLSN * ROWSN);
  const dummy = new THREE.Object3D();
  const cells = [];
  let i = 0;
  for (let a = 0; a < COLSN; a++) {
    for (let b = 0; b < ROWSN; b++) {
      const x = Z2.x + (a - COLSN / 2) * SPACING;
      const z = Z2.z + 2 + (b - ROWSN / 2) * SPACING;
      const dist = Math.hypot(x - Z2.x, z - (Z2.z + 2));
      cells.push({ x, z, dist });
      dummy.position.set(x, 0.06, z);
      dummy.rotation.x = -Math.PI / 2;
      dummy.updateMatrix();
      im.setMatrixAt(i++, dummy.matrix);
    }
  }
  scene.add(im);
  return { im, cells, dummy };
})();

// Expanding scan rings at a few network points
const scanRings = [];
{
  const geo = new THREE.RingGeometry(0.62, 0.74, 40);
  const spots = [
    [Z2.x - 2, Z2.z + 3], [Z2.x + 9, Z2.z - 4], [Z2.x - 9, Z2.z - 8], [Z2.x + 16, Z2.z + 7],
  ];
  spots.forEach(([x, z], i) => {
    const m = new THREE.Mesh(
      geo,
      new THREE.MeshBasicMaterial({
        color: COLORS.accent, transparent: true, opacity: 0,
        side: THREE.DoubleSide, depthWrite: false,
      })
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.1, z);
    scene.add(m);
    scanRings.push({ mesh: m, phase: i * 0.27 });
  });
}

/* ============================================================
   Glowing beam (canvas-textured streak, swept by the timeline)
   ============================================================ */

function beamTexture() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 64;
  const ctx = c.getContext('2d');
  const gx = ctx.createLinearGradient(0, 0, 256, 0);
  gx.addColorStop(0, 'rgba(255,255,255,0)');
  gx.addColorStop(0.5, 'rgba(255,255,255,1)');
  gx.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = gx;
  ctx.fillRect(0, 0, 256, 64);
  const gy = ctx.createLinearGradient(0, 0, 0, 64);
  gy.addColorStop(0, 'rgba(0,0,0,0)');
  gy.addColorStop(0.5, 'rgba(255,255,255,1)');
  gy.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'destination-in';
  ctx.fillStyle = gy;
  ctx.fillRect(0, 0, 256, 64);
  return new THREE.CanvasTexture(c);
}

function makeBeam() {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(54, 3.4),
    new THREE.MeshBasicMaterial({
      map: beamTexture(), color: 0xcdfce6, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
    })
  );
  m.rotation.x = -Math.PI / 2;
  scene.add(m);
  return m;
}
const beam = makeBeam();
const beam2 = makeBeam();

/* ============================================================
   Zone 3 — the return loop
   ============================================================ */

// Wash / return hub
const hub = new THREE.Group();
hub.position.set(Z3.x, 0, Z3.z);
box(12, 5, 9, COLORS.shell, 0, 2.5, 0, hub);
box(12.4, 0.5, 9.4, 0xffffff, 0, 5.25, 0, hub);
box(1.4, 7.5, 1.4, COLORS.shellDim, -4.2, 3.75, -2.6, hub);  // chimney
box(12, 0.6, 0.3, COLORS.accent, 0, 3.6, 4.56, hub);          // accent stripe
scene.add(hub);
crateStacks(Z3.x + 9, Z3.z - 6, 3, 2, 2);
person(Z3.x - 4, Z3.z + 7);
person(Z3.x + 8, Z3.z + 3);

// Closed circulation loop around the hub
const loopCurve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(Z3.x - 16, 0.35, Z3.z + 2),
    new THREE.Vector3(Z3.x - 6, 0.35, Z3.z + 14),
    new THREE.Vector3(Z3.x + 12, 0.35, Z3.z + 12),
    new THREE.Vector3(Z3.x + 18, 0.35, Z3.z - 2),
    new THREE.Vector3(Z3.x + 6, 0.35, Z3.z - 12),
    new THREE.Vector3(Z3.x - 10, 0.35, Z3.z - 9),
  ],
  true, 'catmullrom', 0.8
);
const loopGeo = new THREE.TubeGeometry(loopCurve, 240, 0.2, 6, true);
const loopMesh = new THREE.Mesh(loopGeo, new THREE.MeshBasicMaterial({ color: COLORS.accent }));
loopMesh.geometry.setDrawRange(0, 0);
scene.add(loopMesh);
const loopTotal = loopGeo.index.count;

// Crates circulating on the loop
const loopCrates = [];
{
  const geo = new THREE.BoxGeometry(1.1, 0.9, 1.1);
  for (let i = 0; i < 9; i++) {
    const m = new THREE.Mesh(geo, mat(i % 3 === 0 ? COLORS.accentSoft : COLORS.crate));
    m.castShadow = true;
    m.visible = false;
    scene.add(m);
    loopCrates.push({ mesh: m, offset: i / 9 });
  }
}

/* ============================================================
   Zone 4 — blocks assemble into the Rotion mark
   ============================================================ */

// 12×12 voxel readout of the mark ('1' = block). Mirrors assets/rotion-mark.svg.
const MARK_ROWS = [
  '111111111...',
  '11111111111.',
  '111111111111',
  '111111111111',
  '111111111111',
  '............',
  '.........111',
  '1.......1111',
  '11.....11111',
  '111...111111',
  '1111..111111',
  '11111.111111',
];

const voxels = [];
{
  const SP = 1.6, SIZE = 1.34;
  const rows = MARK_ROWS.length;
  const wallY = 2.4;                       // bottom of the wall above ground
  const geoB = new THREE.BoxGeometry(SIZE, SIZE, SIZE);
  const inkMat = mat(COLORS.ink, { roughness: 0.55 });

  MARK_ROWS.forEach((row, r) => {
    [...row].forEach((ch, c) => {
      if (ch !== '1') return;
      const mesh = new THREE.Mesh(geoB, inkMat);
      mesh.castShadow = true;
      const target = new THREE.Vector3(
        Z4.x + (c - 5.5) * SP,
        wallY + (rows - 1 - r) * SP,
        Z4.z
      );
      const scatter = new THREE.Vector3(
        Z4.x + (Math.random() - 0.5) * 46,
        SIZE / 2,
        Z4.z + 6 + Math.random() * 22
      );
      mesh.position.copy(scatter);
      mesh.rotation.y = Math.random() * Math.PI;
      scene.add(mesh);
      voxels.push({
        mesh, target, scatter,
        rot: mesh.rotation.y,
        delay: Math.random() * 0.55,
      });
    });
  });
}

// scenery behind the mark
building(Z4.x - 22, Z4.z - 14, 5, 8, 5);
building(Z4.x + 20, Z4.z - 16, 6, 6, 6);
crateStacks(Z4.x - 26, Z4.z + 10, 3, 2, 2);

/* ============================================================
   Scattered far scenery, so the flight never feels empty
   ============================================================ */

for (let i = 0; i < 26; i++) {
  const x = -40 + Math.random() * 280;
  const z = (Math.random() > 0.5 ? 1 : -1) * (26 + Math.random() * 42);
  if (Math.random() > 0.55) building(x, z, 3 + Math.random() * 4, 3 + Math.random() * 7, 3 + Math.random() * 4);
  else crateStacks(x, z, 2, 2, 2);
}

/* ============================================================
   GSAP — pinned, scrubbed master timeline
   ============================================================ */

const stepsEl = document.getElementById('steps');
const stepEls = [...document.querySelectorAll('.step')];

// progress window for each step (used for both UI state and click-to-scroll)
const STEP_RANGES = [
  [0.06, 0.36],
  [0.36, 0.60],
  [0.60, 0.82],
  [0.82, 1.001],
];

function setActiveStep(progress) {
  let active = -1;
  STEP_RANGES.forEach(([a, b], i) => { if (progress >= a && progress < b) active = i; });
  stepsEl.classList.toggle('is-visible', active >= 0);
  stepEls.forEach((el, i) => el.classList.toggle('is-active', i === active));
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const tl = gsap.timeline({
  defaults: { ease: 'none' },
  scrollTrigger: {
    trigger: '#experience',
    start: 'top top',
    end: '+=520%',
    scrub: prefersReduced ? false : 1,
    pin: true,
    anticipatePin: 1,
    onUpdate: (self) => setActiveStep(self.progress),
  },
});

// Timeline uses absolute positions on a 0–100 scale.
tl.to('#heroOverlay', { autoAlpha: 0, y: -50, duration: 7, ease: 'power1.in' }, 0);

// — step 1: settle on the depot, draw the identity routes
tl.to(camPos, { x: -26, y: 22, z: 30, duration: 10, ease: 'power1.inOut' }, 0);
tl.to(camLook, { x: 2, y: 0, z: 0, duration: 10, ease: 'power1.inOut' }, 0);
tl.to(P, { route1: 1, duration: 18, ease: 'power1.inOut' }, 8);
tl.to(camPos, { x: -18, y: 20, z: 36, duration: 16, ease: 'sine.inOut' }, 10);

// — fly to the network
tl.to(camPos, { x: 38, y: 27, z: 8, duration: 12, ease: 'power1.inOut' }, 28);
tl.to(camLook, { x: Z2.x, y: 0, z: Z2.z, duration: 12, ease: 'power1.inOut' }, 28);

// — step 2: dot grid, scan rings, beam sweep
tl.to(P, { s2: 1, duration: 6, ease: 'power1.out' }, 36);
tl.fromTo(beam.position, { x: Z2.x - 44, y: 0.5, z: Z2.z + 2 }, { x: Z2.x + 44, duration: 18 }, 38);
tl.to(P, { beam: 1, duration: 18 }, 38);
tl.to(camPos, { x: 46, y: 24, z: 4, duration: 14, ease: 'sine.inOut' }, 40);
tl.to(P, { s2: 0, duration: 5, ease: 'power1.in' }, 57);

// — fly to the return loop
tl.to(camPos, { x: 102, y: 26, z: 38, duration: 11, ease: 'power1.inOut' }, 58);
tl.to(camLook, { x: Z3.x, y: 0, z: Z3.z, duration: 11, ease: 'power1.inOut' }, 58);

// — step 3: loop draws and starts circulating
tl.to(P, { s3: 1, duration: 16, ease: 'power1.inOut' }, 64);
tl.to(camPos, { x: 112, y: 23, z: 42, duration: 14, ease: 'sine.inOut' }, 66);

// — fly to the mark
tl.to(camPos, { x: Z4.x, y: 15, z: 50, duration: 11, ease: 'power1.inOut' }, 80);
tl.to(camLook, { x: Z4.x, y: 11.5, z: Z4.z, duration: 11, ease: 'power1.inOut' }, 80);

// — step 4: blocks assemble, final beam crosses the mark
tl.to(P, { s4: 1, duration: 14, ease: 'power1.inOut' }, 84);
tl.fromTo(beam2.position, { x: Z4.x - 48, y: 11, z: Z4.z + 1.2 }, { x: Z4.x + 48, duration: 8 }, 92);
tl.to(P, { beam2: 1, duration: 8 }, 92);
tl.to(camPos, { y: 13.5, z: 45, duration: 12, ease: 'sine.inOut' }, 86);

// beam2 stands upright (it crosses the vertical mark, not the ground)
beam2.rotation.x = 0;

// Click a step → scroll to the middle of its range
stepEls.forEach((el, i) => {
  el.querySelector('.step-head').addEventListener('click', () => {
    const st = tl.scrollTrigger;
    const target = st.start + (st.end - st.start) * (STEP_RANGES[i][0] + 0.07);
    gsap.to(window, { scrollTo: target, duration: 1.2, ease: 'power2.inOut' });
  });
});

/* ============================================================
   Render loop — applies the scrubbed progress values
   ============================================================ */

const clock = new THREE.Clock();
const lookTarget = new THREE.Vector3();

function smoothstep(t) {
  t = Math.min(1, Math.max(0, t));
  return t * t * (3 - 2 * t);
}

function render() {
  const t = clock.getElapsedTime();

  // routes drawing in
  for (const r of routeTubes) {
    r.mesh.geometry.setDrawRange(0, Math.floor(r.total * P.route1));
  }
  for (const p of routePulses) {
    const visible = P.route1 > 0.15 && P.route1 <= 1 && P.s2 < 0.5;
    p.mesh.material.opacity = visible ? 0.85 : 0;
    if (visible) {
      const u = ((t * 0.07 + p.offset) % 1) * P.route1;
      routeTubes[1].curve.getPointAt(u, p.mesh.position);
      p.mesh.position.y = 0.5;
    }
  }

  // network dots: radial pulse wave
  if (P.s2 > 0.01) {
    dotGrid.im.material.opacity = 0.65 * P.s2;
    const { im, cells, dummy } = dotGrid;
    cells.forEach((cell, i) => {
      const s = 0.6 + 0.55 * Math.sin(t * 2.2 - cell.dist * 0.45);
      dummy.position.set(cell.x, 0.06, cell.z);
      dummy.rotation.x = -Math.PI / 2;
      dummy.scale.setScalar(Math.max(0.05, s * P.s2));
      dummy.updateMatrix();
      im.setMatrixAt(i, dummy.matrix);
    });
    im.instanceMatrix.needsUpdate = true;
  } else {
    dotGrid.im.material.opacity = 0;
  }

  // scan rings
  for (const ring of scanRings) {
    const phase = (t * 0.5 + ring.phase) % 1;
    ring.mesh.scale.setScalar(0.4 + phase * 5.5);
    ring.mesh.material.opacity = (1 - phase) * 0.7 * P.s2;
  }

  // beams (bell-curve opacity over their sweep)
  beam.material.opacity = Math.sin(Math.PI * Math.min(1, P.beam)) * 0.9;
  beam2.material.opacity = Math.sin(Math.PI * Math.min(1, P.beam2)) * 0.95;

  // return loop
  loopMesh.geometry.setDrawRange(0, Math.floor(loopTotal * Math.min(1, P.s3 * 1.6)));
  for (const c of loopCrates) {
    const show = P.s3 > 0.12;
    c.mesh.visible = show;
    if (show) {
      const u = (c.offset + t * 0.03 + P.s3 * 0.25) % 1;
      loopCurve.getPointAt(u, c.mesh.position);
      c.mesh.position.y = 0.8;
      const ahead = loopCurve.getPointAt((u + 0.01) % 1);
      c.mesh.lookAt(ahead.x, 0.8, ahead.z);
      const appear = smoothstep((P.s3 - 0.12) / 0.25);
      c.mesh.scale.setScalar(appear);
    }
  }

  // voxel mark assembly
  for (const v of voxels) {
    const k = smoothstep((P.s4 - v.delay) / 0.45);
    v.mesh.position.lerpVectors(v.scatter, v.target, k);
    v.mesh.rotation.y = v.rot * (1 - k);
  }

  // camera: rig position + pointer parallax
  pointer.x += (pointer.tx - pointer.x) * 0.05;
  pointer.y += (pointer.ty - pointer.y) * 0.05;
  camera.position.set(
    camPos.x + pointer.x * 2.2,
    camPos.y - pointer.y * 1.2,
    camPos.z
  );
  lookTarget.set(camLook.x + pointer.x * 1.2, camLook.y, camLook.z);
  camera.lookAt(lookTarget);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

/* ============================================================
   Resize
   ============================================================ */

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
