const CAP_NODE_W        = 110;
const CAP_NODE_H        = 56;
const CAP_COL_W         = 150;  // wider columns since there are fewer bands
const CAP_ROW_H         = 72;
const CAP_ROWS_PER_LANE = 2;
const CAP_LANE_H        = CAP_ROWS_PER_LANE * CAP_ROW_H;
const CAP_LANE_GAP      = 16;
const CAP_HEADER_H      = 48;
const CAP_START_X       = 150;
const CAP_LABEL_X       = 16;

// Band order matches the JSON level keys
const CAP_BAND_ORDER = ["F", "1-2", "3-4", "5-6", "7-8", "9-10"];

const CAP_STRAND_CONFIG = {
  human_endeavour: { color: "#5B3FA0", cssKey: "hend", label: "Science as a Human Endeavour" },
  inquiry:         { color: "#1A6E82", cssKey: "inq",  label: "Science Inquiry" }
};
const CAP_STRAND_ORDER = ["human_endeavour", "inquiry"];

const CAP_BAND_X = {};
CAP_BAND_ORDER.forEach((b, i) => { CAP_BAND_X[b] = CAP_START_X + i * CAP_COL_W; });
const CAP_SVG_W = CAP_START_X + CAP_BAND_ORDER.length * CAP_COL_W + 20;

// Extract band from a code e.g. AC9S7I01 -> "7-8", AC9SFI01 -> "F", AC9S9H01 -> "9-10"
function getCapBand(code) {
  const m = code.match(/AC9S([F\d]+)[HI]/);
  if (!m) return null;
  if (m[1] === "F") return "F";
  const yr = parseInt(m[1]);
  if (yr <= 2)  return "1-2";
  if (yr <= 4)  return "3-4";
  if (yr <= 6)  return "5-6";
  if (yr <= 8)  return "7-8";
  return "9-10";
}

function getCapMeta(code, levels) {
  const band = getCapBand(code);
  if (!band || !levels[band]) return null;
  return levels[band].standards.find(s => s.code === code) || null;
}

function wrapTitleCap(title, maxChars) {
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

function svgElCap(tag, attrs, parent) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}

function showTipCap(e, code, meta, color) {
  const tip = document.getElementById("tooltip");
  document.getElementById("tt-code").textContent  = code;
  document.getElementById("tt-code").style.color  = color;
  document.getElementById("tt-title").textContent = meta ? meta.title : code;
  document.getElementById("tt-goal").textContent  = meta ? (meta.capability_goal || "(no goal found)") : "(no goal found)";
  tip.classList.add("show");
  moveTipCap(e);
}
function moveTipCap(e) {
  const tip = document.getElementById("tooltip");
  tip.style.left = Math.min(e.clientX + 16, window.innerWidth - 320) + "px";
  tip.style.top  = Math.max(10, e.clientY - 10) + "px";
}
function hideTipCap() { document.getElementById("tooltip").classList.remove("show"); }

const activeSubStrands = new Set();

function renderCapabilities(data) {
  const levels  = data.levels;
  const strands = data.capability_threads.strands;
  const svg     = document.getElementById("tree-svg-capabilities");
  svg.innerHTML = "";

  const lanes = [];
  CAP_STRAND_ORDER.forEach(strandKey => {
    if (!strands[strandKey]) return;
    const strand = strands[strandKey];
    const strandColor = CAP_STRAND_CONFIG[strandKey].color;
    Object.entries(strand.sub_strands).forEach(([subKey, sub]) => {
      const laneKey = `${strandKey}/${subKey}`;
      if (!activeSubStrands.has(laneKey)) return;
      const color = sub.color || strandColor;
      lanes.push({ strandKey, subKey, laneKey, sub, color, strandColor });
    });
  });

  if (lanes.length === 0) {
    svg.setAttribute("viewBox", "0 0 400 60");
    svg.setAttribute("width", 400); svg.setAttribute("height", 60);
    const t = svgElCap("text", { x:"20", y:"36", "font-size":"13", fill:"#888", "font-family":"system-ui,sans-serif" }, svg);
    t.textContent = "No sub-strands selected.";
    return;
  }

  const SVG_H = CAP_HEADER_H + lanes.length * (CAP_LANE_H + CAP_LANE_GAP) + 16;
  svg.setAttribute("viewBox", `0 0 ${CAP_SVG_W} ${SVG_H}`);
  svg.setAttribute("width",  CAP_SVG_W);
  svg.setAttribute("height", SVG_H);

  // Band column headers + guide lines
  CAP_BAND_ORDER.forEach(band => {
    const x = CAP_BAND_X[band];
    svgElCap("line", { x1:x, y1:CAP_HEADER_H-8, x2:x, y2:SVG_H-16,
      stroke:"#e8e8e6", "stroke-width":"1", "stroke-dasharray":"3 4" }, svg);
    const lbl = svgElCap("text", { x, y:28, "text-anchor":"middle",
      "font-size":"12", "font-weight":"500", fill:"#888",
      "font-family":"system-ui,sans-serif" }, svg);
    lbl.textContent = band === "F" ? "F" : `Y${band}`;
  });

  lanes.forEach(({ sub, color, strandColor }, laneIndex) => {
    const laneY    = CAP_HEADER_H + laneIndex * (CAP_LANE_H + CAP_LANE_GAP);
    const midLaneY = laneY + CAP_LANE_H / 2;

    svgElCap("rect", { x:CAP_LABEL_X+10, y:laneY+4,
      width:CAP_SVG_W-CAP_LABEL_X-10, height:CAP_LANE_H-8,
      fill:color, opacity:"0.05", rx:"6" }, svg);

    const lbl = svgElCap("text", {
      x: CAP_LABEL_X, y: midLaneY,
      "text-anchor": "middle", "dominant-baseline": "central",
      "font-size": "10", "font-weight": "600",
      fill: strandColor, "font-family": "system-ui,sans-serif",
      transform: `rotate(-90,${CAP_LABEL_X},${midLaneY})`
    }, svg);
    lbl.textContent = sub.short_label || sub.label;

    // Position nodes by band — one per band, row 0
    const nodePos = {};
    sub.sequence.forEach(code => {
      const band = getCapBand(code);
      if (!band || !CAP_BAND_X[band]) return;
      nodePos[code] = {
        x: CAP_BAND_X[band],
        y: laneY + CAP_NODE_H / 2 + 4
      };
    });

    // Connectors
    let prevPos = null;
    sub.sequence.forEach(code => {
      const pos = nodePos[code]; if (!pos) return;
      if (prevPos) {
        const x1 = prevPos.x + CAP_NODE_W/2, x2 = pos.x - CAP_NODE_W/2;
        svgElCap("line", { x1, y1:prevPos.y, x2, y2:pos.y,
          stroke:color, "stroke-width":"1.5", opacity:"0.4" }, svg);
      }
      prevPos = pos;
    });

    // Nodes
    sub.sequence.forEach(code => {
      const pos  = nodePos[code]; if (!pos) return;
      const meta  = getCapMeta(code, levels);
      const lines = wrapTitleCap(meta ? meta.title : code, 13);
      const g  = svgElCap("g", { style:"cursor:pointer" }, svg);
      const rx = pos.x - CAP_NODE_W/2, ry = pos.y - CAP_NODE_H/2;
      svgElCap("rect", { x:rx+2, y:ry+2, width:CAP_NODE_W, height:CAP_NODE_H, rx:"10", fill:"rgba(0,0,0,0.07)" }, g);
      svgElCap("rect", { x:rx, y:ry, width:CAP_NODE_W, height:CAP_NODE_H, rx:"10", fill:color, stroke:"#fff", "stroke-width":"2" }, g);
      const lH = 13, tH = lines.length * lH, sY = pos.y - tH/2 + lH/2;
      lines.forEach((line, i) => {
        const t = svgElCap("text", { x:pos.x, y:sY+i*lH, "text-anchor":"middle",
          "dominant-baseline":"central", "font-size":"10", "font-weight":"500",
          fill:"#fff", "font-family":"system-ui,sans-serif" }, g);
        t.textContent = line;
      });
      g.addEventListener("mouseenter", e => showTipCap(e, code, meta, color));
      g.addEventListener("mousemove",  moveTipCap);
      g.addEventListener("mouseleave", hideTipCap);
    });
  });
}

function buildCapabilityButtons(data) {
  const strands = data.capability_threads.strands;

  CAP_STRAND_ORDER.forEach(strandKey => {
    if (!strands[strandKey]) return;
    Object.keys(strands[strandKey].sub_strands).forEach(subKey => {
      activeSubStrands.add(`${strandKey}/${subKey}`);
    });
  });

  function updateButtons() {
    CAP_STRAND_ORDER.forEach(strandKey => {
      if (!strands[strandKey]) return;
      const subKeys = Object.keys(strands[strandKey].sub_strands);
      const allOn   = subKeys.every(sk => activeSubStrands.has(`${strandKey}/${sk}`));
      const allBtn  = document.getElementById(`btn-cap-${strandKey}`);
      if (allBtn) allBtn.style.opacity = allOn ? "1" : "0.45";
      subKeys.forEach(subKey => {
        const btn = document.getElementById(`btn-cap-${strandKey}-${subKey}`);
        if (btn) btn.style.opacity = activeSubStrands.has(`${strandKey}/${subKey}`) ? "1" : "0.35";
      });
    });
  }

  const ctrl = document.getElementById("strand-controls-capabilities");

  CAP_STRAND_ORDER.forEach(strandKey => {
    if (!strands[strandKey]) return;
    const strand      = strands[strandKey];
    const cfg         = CAP_STRAND_CONFIG[strandKey];
    const strandColor = cfg.color;
    const subKeys     = Object.keys(strand.sub_strands);

    const strandBtn = document.createElement("button");
    strandBtn.id        = `btn-cap-${strandKey}`;
    strandBtn.className = "strand-btn";
    strandBtn.textContent = cfg.label;
    strandBtn.style.cssText = `background:${strandColor};color:#fff;border-color:transparent;font-weight:500`;
    strandBtn.onclick = () => {
      const allOn = subKeys.every(sk => activeSubStrands.has(`${strandKey}/${sk}`));
      subKeys.forEach(sk => {
        if (allOn) activeSubStrands.delete(`${strandKey}/${sk}`);
        else       activeSubStrands.add(`${strandKey}/${sk}`);
      });
      updateButtons(); renderCapabilities(data);
    };
    ctrl.appendChild(strandBtn);

    subKeys.forEach(subKey => {
      const sub     = strand.sub_strands[subKey];
      const color   = sub.color || strandColor;
      const laneKey = `${strandKey}/${subKey}`;
      const btn     = document.createElement("button");
      btn.id        = `btn-cap-${strandKey}-${subKey}`;
      btn.className = "strand-btn";
      btn.textContent = sub.short_label || sub.label;
      btn.style.cssText = `background:${color};color:#fff;border-color:transparent`;
      btn.onclick = () => {
        if (activeSubStrands.has(laneKey)) activeSubStrands.delete(laneKey);
        else activeSubStrands.add(laneKey);
        updateButtons(); renderCapabilities(data);
      };
      ctrl.appendChild(btn);
    });

    const sep = document.createElement("span");
    sep.style.cssText = "width:1px;background:#ddd;margin:0 4px;align-self:stretch;display:inline-block";
    ctrl.appendChild(sep);
  });
}

fetch('./science_capability_map.json')
  .then(r => r.json())
  .then(data => { buildCapabilityButtons(data); renderCapabilities(data); })
  .catch(err => {
    document.getElementById("tree-svg-capabilities").innerHTML =
      `<text x="20" y="40" font-size="13" fill="#c00">Failed to load capabilities data: ${err.message}</text>`;
  });