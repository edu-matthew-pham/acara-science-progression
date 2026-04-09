// ─── Layout constants ───────────────────────────────────────────────
const NODE_W   = 110;
const NODE_H   = 56;
const COL_W    = 130;
const ROW_H    = 80;
const HEADER_H = 48;
const START_X  = 60;

const YEAR_ORDER = ["F","1","2","3","4","5","6","7","8","9","10"];

const YEAR_X = {};
YEAR_ORDER.forEach((y, i) => { YEAR_X[y] = START_X + i * COL_W; });
const SVG_W = START_X + YEAR_ORDER.length * COL_W + 20;

// ─── Helpers ────────────────────────────────────────────────────────
function getYear(code) {
  const m = code.match(/AC9S([F\d]+)U/);
  if (!m) return null;
  return m[1] === "F" ? "F" : String(parseInt(m[1]));
}

function getMeta(code) {
  const yr = getYear(code);
  if (!yr) return null;
  const yl = DATA.year_levels[yr];
  if (!yl) return null;
  return yl.standards.find(s => s.code === code) || null;
}

function wrapTitle(title, maxChars) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  words.forEach(w => {
    const candidate = current ? current + " " + w : w;
    if (candidate.length <= maxChars) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = w;
    }
  });
  if (current) lines.push(current);
  return lines;
}

// Elbow path: exits right edge of source, steps vertically in the
// inter-column gap, enters left edge of target. Never crosses nodes.
function elbowPath(ax, ay, bx, by) {
  const x1   = ax + NODE_W / 2;
  const x2   = bx - NODE_W / 2;
  const gapX = x1 + (x2 - x1) / 2;
  const r    = 6;

  if (Math.abs(ay - by) < 4) {
    return `M${x1},${ay} L${x2},${by}`;
  }

  const vDir = by > ay ? 1 : -1;
  return [
    `M${x1},${ay}`,
    `L${gapX - r},${ay}`,
    `Q${gapX},${ay} ${gapX},${ay + vDir * r}`,
    `L${gapX},${by - vDir * r}`,
    `Q${gapX},${by} ${gapX + r},${by}`,
    `L${x2},${by}`
  ].join(" ");
}

function svgEl(tag, attrs, parent) {
  const ns = "http://www.w3.org/2000/svg";
  const e = document.createElementNS(ns, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}

// ─── Tooltip ────────────────────────────────────────────────────────
const tip = document.getElementById("tooltip");

function showTip(e, code, meta) {
  document.getElementById("tt-code").textContent  = code;
  document.getElementById("tt-title").textContent = meta ? meta.title  : code;
  document.getElementById("tt-goal").textContent  = meta ? meta.y_goal : "(no Y-goal found)";
  tip.classList.add("show");
  moveTip(e);
}
function moveTip(e) {
  tip.style.left = Math.min(e.clientX + 16, window.innerWidth - 320) + "px";
  tip.style.top  = Math.max(10, e.clientY - 10) + "px";
}
function hideTip() { tip.classList.remove("show"); }

// ─── Main render ────────────────────────────────────────────────────
let activeStrand = "biological";

function render() {
  const strand = DATA.strands[activeStrand];
  const color  = strand.color;

  // Collect nodes and edges by walking the tree
  const nodeSet = new Set();
  const edges   = [];

  function walk(node, parent) {
    nodeSet.add(node.code);
    if (parent) edges.push([parent, node.code]);
    node.children.forEach(c => walk(c, node.code));
  }
  strand.tree.forEach(root => walk(root, null));

  // Bucket nodes by year level
  const yearBuckets = {};
  nodeSet.forEach(code => {
    const yr = getYear(code);
    if (!yr) return;
    if (!yearBuckets[yr]) yearBuckets[yr] = [];
    if (!yearBuckets[yr].includes(code)) yearBuckets[yr].push(code);
  });

  let maxRows = 0;
  Object.values(yearBuckets).forEach(b => { if (b.length > maxRows) maxRows = b.length; });

  const SVG_H = HEADER_H + maxRows * ROW_H + 40;

  // Assign (x, y) centre position to each node
  const nodePos = {};
  Object.entries(yearBuckets).forEach(([yr, codes]) => {
    const x = YEAR_X[yr];
    codes.forEach((code, i) => {
      nodePos[code] = { x, y: HEADER_H + i * ROW_H + NODE_H / 2 + 10 };
    });
  });

  // Build SVG
  const svg = document.getElementById("tree-svg");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${SVG_W} ${SVG_H}`);
  svg.setAttribute("width",   SVG_W);
  svg.setAttribute("height",  SVG_H);

  // Year column headers + guide lines
  YEAR_ORDER.forEach(yr => {
    const x        = YEAR_X[yr];
    const hasNodes = !!yearBuckets[yr];

    svgEl("line", {
      x1: x, y1: HEADER_H - 8, x2: x, y2: SVG_H - 16,
      stroke: hasNodes ? "#ddd" : "#eee",
      "stroke-width": "1", "stroke-dasharray": "3 4"
    }, svg);

    const lbl = svgEl("text", {
      x, y: 28,
      "text-anchor": "middle",
      "font-size": "12",
      "font-weight": hasNodes ? "600" : "400",
      fill: hasNodes ? "#444" : "#ccc",
      "font-family": "system-ui, sans-serif"
    }, svg);
    lbl.textContent = yr === "F" ? "F" : `Y${yr}`;
  });

  // Edges (drawn first so nodes render on top)
  edges.forEach(([from, to]) => {
    const a = nodePos[from], b = nodePos[to];
    if (!a || !b) return;
    svgEl("path", {
      d: elbowPath(a.x, a.y, b.x, b.y),
      fill: "none", stroke: color, "stroke-width": "1.5", opacity: "0.5"
    }, svg);
  });

  // Nodes
  nodeSet.forEach(code => {
    const pos = nodePos[code];
    if (!pos) return;
    const meta  = getMeta(code);
    const title = meta ? meta.title : code;
    const lines = wrapTitle(title, 13);

    const g  = svgEl("g", { style: "cursor:pointer" }, svg);
    const rx = pos.x - NODE_W / 2;
    const ry = pos.y - NODE_H / 2;

    // Shadow
    svgEl("rect", { x: rx + 2, y: ry + 2, width: NODE_W, height: NODE_H, rx: "10", fill: "rgba(0,0,0,0.07)" }, g);
    // Body
    svgEl("rect", { x: rx, y: ry, width: NODE_W, height: NODE_H, rx: "10", fill: color, stroke: "#fff", "stroke-width": "2" }, g);

    // Wrapped title, vertically centred
    const lineH  = 13;
    const totalH = lines.length * lineH;
    const startY = pos.y - totalH / 2 + lineH / 2;

    lines.forEach((line, i) => {
      const t = svgEl("text", {
        x: pos.x, y: startY + i * lineH,
        "text-anchor": "middle", "dominant-baseline": "central",
        "font-size": "10", "font-weight": "500", fill: "#fff",
        "font-family": "system-ui, sans-serif"
      }, g);
      t.textContent = line;
    });

    g.addEventListener("mouseenter", e => showTip(e, code, meta));
    g.addEventListener("mousemove",  moveTip);
    g.addEventListener("mouseleave", hideTip);
  });
}

// ─── Strand filter buttons ───────────────────────────────────────────
const ctrl = document.getElementById("strand-controls");
Object.entries(DATA.strands).forEach(([key, s]) => {
  const btn = document.createElement("button");
  btn.className = "strand-btn" + (key === activeStrand ? ` active ${s.key}` : "");
  btn.textContent = s.label;
  btn.onclick = () => {
    activeStrand = key;
    document.querySelectorAll(".strand-btn").forEach(b => { b.className = "strand-btn"; });
    btn.className = `strand-btn active ${s.key}`;
    render();
  };
  ctrl.appendChild(btn);
});

render();
