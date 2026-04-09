// ─── Layout constants ────────────────────────────────────────────────
const NODE_W      = 110;
const NODE_H      = 56;
const COL_W       = 130;
const ROW_H       = 72;   // vertical spacing between nodes within a strand band
const STRAND_GAP  = 24;   // gap between strand bands
const ROWS_PER_STRAND = 2;
const BAND_H      = ROWS_PER_STRAND * ROW_H;
const HEADER_H    = 48;
const START_X     = 110;  // enough room for rotated strand label left of F column
const LABEL_X     = 16;   // x centre of the rotated strand label

const YEAR_ORDER = ["F","1","2","3","4","5","6","7","8","9","10"];
const STRAND_ORDER = ["biological", "earth_space", "physical", "chemical"];

const YEAR_X = {};
YEAR_ORDER.forEach((y, i) => { YEAR_X[y] = START_X + i * COL_W; });
const SVG_W = START_X + YEAR_ORDER.length * COL_W + 20;

// ─── Helpers ─────────────────────────────────────────────────────────
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
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}

// ─── Tooltip ─────────────────────────────────────────────────────────
const tip = document.getElementById("tooltip");

function showTip(e, code, meta, color) {
  document.getElementById("tt-code").textContent  = code;
  document.getElementById("tt-code").style.color  = color;
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

// ─── State ───────────────────────────────────────────────────────────
const activeStrands = new Set(STRAND_ORDER);

// ─── Main render ─────────────────────────────────────────────────────
function render() {
  // Calculate Y offset for each active strand band
  const strandBandY = {};
  let y = HEADER_H;
  STRAND_ORDER.forEach(key => {
    if (!activeStrands.has(key)) return;
    strandBandY[key] = y;
    y += BAND_H + STRAND_GAP;
  });

  const SVG_H = y + 16;

  const svg = document.getElementById("tree-svg");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${SVG_W} ${SVG_H}`);
  svg.setAttribute("width",   SVG_W);
  svg.setAttribute("height",  SVG_H);

  // Year column headers (always visible)
  const activeYears = new Set();
  STRAND_ORDER.forEach(key => {
    if (!activeStrands.has(key)) return;
    const strand = DATA.strands[key];
    function collectYears(node) {
      const yr = getYear(node.code);
      if (yr) activeYears.add(yr);
      node.children.forEach(collectYears);
    }
    strand.tree.forEach(collectYears);
  });

  YEAR_ORDER.forEach(yr => {
    const x        = YEAR_X[yr];
    const hasNodes = activeYears.has(yr);
    svgEl("line", {
      x1: x, y1: HEADER_H - 8, x2: x, y2: SVG_H - 16,
      stroke: hasNodes ? "#ddd" : "#eee",
      "stroke-width": "1", "stroke-dasharray": "3 4"
    }, svg);
    const lbl = svgEl("text", {
      x, y: 28, "text-anchor": "middle",
      "font-size": "12", "font-weight": hasNodes ? "600" : "400",
      fill: hasNodes ? "#444" : "#ccc",
      "font-family": "system-ui, sans-serif"
    }, svg);
    lbl.textContent = yr === "F" ? "F" : `Y${yr}`;
  });

  // Render each active strand in its own band
  STRAND_ORDER.forEach(key => {
    if (!activeStrands.has(key)) return;
    const strand  = DATA.strands[key];
    const color   = strand.color;
    const bandY   = strandBandY[key];

    // Collect nodes and edges for this strand
    const nodeSet = new Set();
    const edges   = [];
    function walk(node, parent) {
      nodeSet.add(node.code);
      if (parent) edges.push([parent, node.code]);
      node.children.forEach(c => walk(c, node.code));
    }
    strand.tree.forEach(root => walk(root, null));

    // Assign row within this band: bucket by year, up to 2 per column
    const yearBuckets = {};
    nodeSet.forEach(code => {
      const yr = getYear(code);
      if (!yr) return;
      if (!yearBuckets[yr]) yearBuckets[yr] = [];
      if (!yearBuckets[yr].includes(code)) yearBuckets[yr].push(code);
    });

    // Node positions: row 0 or 1 within the band
    const nodePos = {};
    Object.entries(yearBuckets).forEach(([yr, codes]) => {
      const x = YEAR_X[yr];
      codes.forEach((code, i) => {
        const row = Math.min(i, ROWS_PER_STRAND - 1);
        nodePos[code] = {
          x,
          y: bandY + row * ROW_H + NODE_H / 2 + 4
        };
      });
    });

    // Strand label — rotated, sitting in the left margin before the F column
    const midBandY = bandY + BAND_H / 2;
    const strandLbl = svgEl("text", {
      x: LABEL_X, y: midBandY,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": "10", "font-weight": "600",
      fill: color, "font-family": "system-ui, sans-serif",
      transform: `rotate(-90, ${LABEL_X}, ${midBandY})`
    }, svg);
    strandLbl.textContent = strand.label;

    // Faint band background
    svgEl("rect", {
      x: LABEL_X + 10, y: bandY,
      width: SVG_W - LABEL_X - 10, height: BAND_H,
      fill: color, opacity: "0.04", rx: "6"
    }, svg);

    // Edges
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
      const pos   = nodePos[code];
      if (!pos) return;
      const meta  = getMeta(code);
      const title = meta ? meta.title : code;
      const lines = wrapTitle(title, 13);

      const g  = svgEl("g", { style: "cursor:pointer" }, svg);
      const rx = pos.x - NODE_W / 2;
      const ry = pos.y - NODE_H / 2;

      svgEl("rect", { x: rx + 2, y: ry + 2, width: NODE_W, height: NODE_H, rx: "10", fill: "rgba(0,0,0,0.07)" }, g);
      svgEl("rect", { x: rx, y: ry, width: NODE_W, height: NODE_H, rx: "10", fill: color, stroke: "#fff", "stroke-width": "2" }, g);

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

      g.addEventListener("mouseenter", e => showTip(e, code, meta, color));
      g.addEventListener("mousemove",  moveTip);
      g.addEventListener("mouseleave", hideTip);
    });
  });
}

// ─── Strand toggle buttons ────────────────────────────────────────────
function updateButtons() {
  const allOn = STRAND_ORDER.every(k => activeStrands.has(k));
  document.getElementById("btn-all").classList.toggle("active-all", allOn);
  STRAND_ORDER.forEach(key => {
    const s   = DATA.strands[key];
    const btn = document.getElementById(`btn-${key}`);
    btn.classList.toggle(`active-${s.key}`, activeStrands.has(key));
  });
}

const ctrl = document.getElementById("strand-controls");

const allBtn = document.createElement("button");
allBtn.id          = "btn-all";
allBtn.className   = "strand-btn active-all";
allBtn.textContent = "All";
allBtn.onclick = () => {
  const allOn = STRAND_ORDER.every(k => activeStrands.has(k));
  if (allOn) { activeStrands.clear(); }
  else       { STRAND_ORDER.forEach(k => activeStrands.add(k)); }
  updateButtons();
  render();
};
ctrl.appendChild(allBtn);

const sep = document.createElement("span");
sep.style.cssText = "width:1px;background:#ddd;margin:0 4px;align-self:stretch;display:inline-block";
ctrl.appendChild(sep);

STRAND_ORDER.forEach(key => {
  const s   = DATA.strands[key];
  const btn = document.createElement("button");
  btn.id          = `btn-${key}`;
  btn.className   = `strand-btn active-${s.key}`;
  btn.textContent = s.label;
  btn.onclick = () => {
    if (activeStrands.has(key)) { activeStrands.delete(key); }
    else                        { activeStrands.add(key); }
    updateButtons();
    render();
  };
  ctrl.appendChild(btn);
});

render();