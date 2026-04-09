// ─── Layout constants ────────────────────────────────────────────────
const NODE_W          = 110;
const NODE_H          = 56;
const COL_W           = 130;
const ROW_H           = 72;
const STRAND_GAP      = 24;
const ROWS_PER_STRAND = 2;
const BAND_H          = ROWS_PER_STRAND * ROW_H;
const HEADER_H        = 48;
const START_X         = 110;
const LABEL_X         = 16;

const YEAR_ORDER   = ["F","1","2","3","4","5","6","7","8","9","10"];

const STRAND_CONFIG = {
  biological: { color: "#1D9E75", cssKey: "bio"   },
  earth_space:{ color: "#378ADD", cssKey: "earth" },
  physical:   { color: "#BA7517", cssKey: "phys"  },
  chemical:   { color: "#D85A30", cssKey: "chem"  }
};
const STRAND_ORDER = ["biological", "earth_space", "physical", "chemical"];

const YEAR_X_C = {};
YEAR_ORDER.forEach((y, i) => { YEAR_X_C[y] = START_X + i * COL_W; });
const SVG_W_C = START_X + YEAR_ORDER.length * COL_W + 20;

// ─── Helpers ─────────────────────────────────────────────────────────
function getYearC(code) {
  const m = code.match(/AC9S([F\d]+)U/);
  if (!m) return null;
  return m[1] === "F" ? "F" : String(parseInt(m[1]));
}

function getMetaC(code, yearLevels) {
  const yr = getYearC(code);
  if (!yr) return null;
  const yl = yearLevels[yr];
  if (!yl) return null;
  return yl.standards.find(s => s.code === code) || null;
}

function wrapTitleC(title, maxChars) {
  const words = title.split(" ");
  const lines = [];
  let current = "";
  words.forEach(w => {
    const candidate = current ? current + " " + w : w;
    if (candidate.length <= maxChars) { current = candidate; }
    else { if (current) lines.push(current); current = w; }
  });
  if (current) lines.push(current);
  return lines;
}

function elbowPathC(ax, ay, bx, by) {
  const x1 = ax + NODE_W / 2, x2 = bx - NODE_W / 2;
  const gapX = x1 + (x2 - x1) / 2, r = 6;
  if (Math.abs(ay - by) < 4) return `M${x1},${ay} L${x2},${by}`;
  const vDir = by > ay ? 1 : -1;
  return [`M${x1},${ay}`,`L${gapX-r},${ay}`,`Q${gapX},${ay} ${gapX},${ay+vDir*r}`,
          `L${gapX},${by-vDir*r}`,`Q${gapX},${by} ${gapX+r},${by}`,`L${x2},${by}`].join(" ");
}

function svgElC(tag, attrs, parent) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}

// ─── Tooltip (shared) ────────────────────────────────────────────────
const tipC = document.getElementById("tooltip");
function showTipC(e, code, meta, color, goalKey) {
  document.getElementById("tt-code").textContent  = code;
  document.getElementById("tt-code").style.color  = color;
  document.getElementById("tt-title").textContent = meta ? meta.title : code;
  document.getElementById("tt-goal").textContent  = meta ? (meta[goalKey] || "(no goal found)") : "(no goal found)";
  tipC.classList.add("show");
  moveTipC(e);
}
function moveTipC(e) {
  tipC.style.left = Math.min(e.clientX + 16, window.innerWidth - 320) + "px";
  tipC.style.top  = Math.max(10, e.clientY - 10) + "px";
}
function hideTipC() { tipC.classList.remove("show"); }

// ─── State ───────────────────────────────────────────────────────────
const activeStrandsC = new Set(STRAND_ORDER);

// ─── Render ──────────────────────────────────────────────────────────
function renderConcepts(data) {
  const yearLevels = data.year_levels;
  const strands    = data.progression_threads.strands;

  const strandBandY = {};
  let y = HEADER_H;
  STRAND_ORDER.forEach(key => {
    if (!activeStrandsC.has(key)) return;
    strandBandY[key] = y;
    y += BAND_H + STRAND_GAP;
  });

  const SVG_H = y + 16;
  const svg   = document.getElementById("tree-svg-concepts");
  svg.innerHTML = "";
  svg.setAttribute("viewBox", `0 0 ${SVG_W_C} ${SVG_H}`);
  svg.setAttribute("width", SVG_W_C);
  svg.setAttribute("height", SVG_H);

  const activeYears = new Set();
  STRAND_ORDER.forEach(key => {
    if (!activeStrandsC.has(key) || !strands[key]) return;
    function cy(node) { const yr = getYearC(node.code); if (yr) activeYears.add(yr); node.children.forEach(cy); }
    strands[key].tree.forEach(cy);
  });

  YEAR_ORDER.forEach(yr => {
    const x = YEAR_X_C[yr], hasNodes = activeYears.has(yr);
    svgElC("line", { x1:x, y1:HEADER_H-8, x2:x, y2:SVG_H-16, stroke: hasNodes?"#ddd":"#eee", "stroke-width":"1", "stroke-dasharray":"3 4" }, svg);
    const lbl = svgElC("text", { x, y:28, "text-anchor":"middle", "font-size":"12", "font-weight": hasNodes?"600":"400", fill: hasNodes?"#444":"#ccc", "font-family":"system-ui,sans-serif" }, svg);
    lbl.textContent = yr === "F" ? "F" : `Y${yr}`;
  });

  STRAND_ORDER.forEach(key => {
    if (!activeStrandsC.has(key) || !strands[key]) return;
    const strand = strands[key], cfg = STRAND_CONFIG[key], color = cfg.color, bandY = strandBandY[key];

    const nodeSet = new Set(), edges = [];
    function walk(node, parent) {
      nodeSet.add(node.code);
      if (parent) edges.push([parent, node.code]);
      node.children.forEach(c => walk(c, node.code));
    }
    strand.tree.forEach(root => walk(root, null));

    const yearBuckets = {};
    nodeSet.forEach(code => {
      const yr = getYearC(code); if (!yr) return;
      if (!yearBuckets[yr]) yearBuckets[yr] = [];
      if (!yearBuckets[yr].includes(code)) yearBuckets[yr].push(code);
    });

    const nodePos = {};
    Object.entries(yearBuckets).forEach(([yr, codes]) => {
      const x = YEAR_X_C[yr];
      codes.forEach((code, i) => { nodePos[code] = { x, y: bandY + Math.min(i, ROWS_PER_STRAND-1) * ROW_H + NODE_H/2 + 4 }; });
    });

    const midBandY = bandY + BAND_H / 2;
    const lbl = svgElC("text", { x:LABEL_X, y:midBandY, "text-anchor":"middle", "dominant-baseline":"central", "font-size":"10", "font-weight":"600", fill:color, "font-family":"system-ui,sans-serif", transform:`rotate(-90,${LABEL_X},${midBandY})` }, svg);
    lbl.textContent = strand.label;

    svgElC("rect", { x:LABEL_X+10, y:bandY, width:SVG_W_C-LABEL_X-10, height:BAND_H, fill:color, opacity:"0.04", rx:"6" }, svg);

    edges.forEach(([from, to]) => {
      const a = nodePos[from], b = nodePos[to]; if (!a || !b) return;
      svgElC("path", { d:elbowPathC(a.x,a.y,b.x,b.y), fill:"none", stroke:color, "stroke-width":"1.5", opacity:"0.5" }, svg);
    });

    nodeSet.forEach(code => {
      const pos = nodePos[code]; if (!pos) return;
      const meta = getMetaC(code, yearLevels);
      const lines = wrapTitleC(meta ? meta.title : code, 13);
      const g = svgElC("g", { style:"cursor:pointer" }, svg);
      const rx = pos.x - NODE_W/2, ry = pos.y - NODE_H/2;
      svgElC("rect", { x:rx+2, y:ry+2, width:NODE_W, height:NODE_H, rx:"10", fill:"rgba(0,0,0,0.07)" }, g);
      svgElC("rect", { x:rx, y:ry, width:NODE_W, height:NODE_H, rx:"10", fill:color, stroke:"#fff", "stroke-width":"2" }, g);
      const lineH = 13, totalH = lines.length * lineH, startY = pos.y - totalH/2 + lineH/2;
      lines.forEach((line, i) => {
        const t = svgElC("text", { x:pos.x, y:startY+i*lineH, "text-anchor":"middle", "dominant-baseline":"central", "font-size":"10", "font-weight":"500", fill:"#fff", "font-family":"system-ui,sans-serif" }, g);
        t.textContent = line;
      });
      g.addEventListener("mouseenter", e => showTipC(e, code, meta, color, "y_goal"));
      g.addEventListener("mousemove", moveTipC);
      g.addEventListener("mouseleave", hideTipC);
    });
  });
}

// ─── Buttons ─────────────────────────────────────────────────────────
function buildConceptButtons(data) {
  const strands = data.progression_threads.strands;

  function updateButtons() {
    const allOn = STRAND_ORDER.every(k => activeStrandsC.has(k));
    document.getElementById("btn-c-all").classList.toggle("active-all", allOn);
    STRAND_ORDER.forEach(key => {
      const btn = document.getElementById(`btn-c-${key}`);
      if (btn) btn.classList.toggle(`active-${STRAND_CONFIG[key].cssKey}`, activeStrandsC.has(key));
    });
  }

  const ctrl = document.getElementById("strand-controls-concepts");
  const allBtn = document.createElement("button");
  allBtn.id = "btn-c-all"; allBtn.className = "strand-btn active-all"; allBtn.textContent = "All";
  allBtn.onclick = () => {
    const allOn = STRAND_ORDER.every(k => activeStrandsC.has(k));
    if (allOn) activeStrandsC.clear(); else STRAND_ORDER.forEach(k => activeStrandsC.add(k));
    updateButtons(); renderConcepts(data);
  };
  ctrl.appendChild(allBtn);
  const sep = document.createElement("span");
  sep.style.cssText = "width:1px;background:#ddd;margin:0 4px;align-self:stretch;display:inline-block";
  ctrl.appendChild(sep);

  STRAND_ORDER.forEach(key => {
    if (!strands[key]) return;
    const cfg = STRAND_CONFIG[key];
    const btn = document.createElement("button");
    btn.id = `btn-c-${key}`; btn.className = `strand-btn active-${cfg.cssKey}`;
    btn.textContent = strands[key].label;
    btn.onclick = () => {
      if (activeStrandsC.has(key)) activeStrandsC.delete(key); else activeStrandsC.add(key);
      updateButtons(); renderConcepts(data);
    };
    ctrl.appendChild(btn);
  });
}

// ─── Bootstrap ───────────────────────────────────────────────────────
fetch('./science_y_goals_map.json')
  .then(r => r.json())
  .then(data => { buildConceptButtons(data); renderConcepts(data); })
  .catch(err => {
    document.getElementById("tree-svg-concepts").innerHTML =
      `<text x="20" y="40" font-size="13" fill="#c00">Failed to load concepts data: ${err.message}</text>`;
  });
