// render-width.js
// Width side panel for ACARA Progressions Visualiser.

(function () {

// With this:
const WIDTH_FILES = (window.WIDTH_CONFIG && window.WIDTH_CONFIG.files)
  ? window.WIDTH_CONFIG.files
  : ['./width.json'];

  // --- State ---
  const widthData = {};
  let panelOpen = false;

  // --- Load width data ---
  Promise.all(
    WIDTH_FILES.map(url =>
      fetch(url).then(r => r.json()).catch(() => null)
    )
  ).then(results => {
    results.forEach(data => {
      if (!data || !data.standards) return;
      Object.entries(data.standards).forEach(([code, fields]) => {
        widthData[code] = fields;
      });
    });
  });

  // --- Inject styles ---
  const style = document.createElement('style');
  style.textContent = `
    #width-panel {
      position: fixed;
      top: 0;
      right: 0;
      width: 340px;
      height: 100%;
      background: #fff;
      border-left: 1px solid #e0e0de;
      box-shadow: -4px 0 24px rgba(0,0,0,0.08);
      transform: translateX(100%);
      transition: transform .25s cubic-bezier(.4,0,.2,1);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    #width-panel.open {
      transform: translateX(0);
    }

    #width-panel-header {
      padding: 16px 16px 12px;
      border-bottom: 1px solid #f0f0ee;
      position: relative;
      flex-shrink: 0;
    }

    #width-panel-code {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .04em;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    #width-panel-title {
      font-size: 14px;
      font-weight: 600;
      color: #1a1a18;
      line-height: 1.4;
      padding-right: 36px;
    }

    #width-panel-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 28px;
      height: 28px;
      border: none;
      background: #f0f0ee;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      line-height: 28px;
      text-align: center;
      color: #666;
      transition: background .15s;
    }

    #width-panel-close:hover {
      background: #e4e4e2;
    }

    #width-panel-body {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    #width-panel-body::-webkit-scrollbar {
      width: 4px;
    }

    #width-panel-body::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 2px;
    }

    .wp-section {
      margin-bottom: 14px;
    }

    .wp-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: .06em;
      text-transform: uppercase;
      color: #999;
      margin-bottom: 5px;
    }

    .wp-content {
      font-size: 12.5px;
      line-height: 1.6;
      color: #333;
    }

    .wp-wider-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .wp-wider-list li {
      font-size: 12.5px;
      line-height: 1.55;
      color: #333;
      padding: 5px 0 5px 14px;
      border-bottom: 1px solid #f4f4f2;
      position: relative;
    }

    .wp-wider-list li:last-child {
      border-bottom: none;
    }

    .wp-wider-list li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #aaa;
      font-size: 11px;
      top: 6px;
    }

    .wp-divider {
      border: none;
      border-top: 1px solid #ebebea;
      margin: 12px 0;
    }

    .wp-disclosure {
      width: 100%;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 8px;
      text-align: left;
    }

    .wp-disclosure-label {
      font-size: 11px;
      font-weight: 600;
      color: #aaa;
    }

    .wp-disclosure-arrow {
      font-size: 10px;
      color: #bbb;
      transition: transform .2s;
    }

    .wp-disclosure.open .wp-disclosure-arrow {
      transform: rotate(90deg);
    }

    .wp-elab-list {
      display: none;
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .wp-elab-list.open {
      display: block;
    }

    .wp-elab-list li {
      font-size: 11.5px;
      line-height: 1.6;
      color: #666;
      padding: 6px 0;
      border-bottom: 1px solid #f4f4f2;
    }

    .wp-elab-list li:last-child {
      border-bottom: none;
    }

    .wp-no-data {
      font-size: 12.5px;
      color: #aaa;
      text-align: center;
      padding: 32px 0;
      line-height: 1.6;
    }
  `;
  document.head.appendChild(style);

  // --- Build panel ---
  const panel = document.createElement('div');
  panel.id = 'width-panel';
  panel.innerHTML = `
    <div id="width-panel-header">
      <div id="width-panel-code"></div>
      <div id="width-panel-title"></div>
      <button id="width-panel-close" title="Close">×</button>
    </div>
    <div id="width-panel-body"></div>
  `;
  document.body.appendChild(panel);

  // --- Close logic ---
  function closePanel() {
    panel.classList.remove('open');
    panelOpen = false;
    document.body.classList.remove('width-panel-open');
    document.querySelectorAll('.node-selected').forEach(n => n.classList.remove('node-selected'));
  }

  document.getElementById('width-panel-close').addEventListener('click', closePanel);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && panelOpen) closePanel();
  });

  // Click outside without blocking SVG interaction
  document.addEventListener('click', (e) => {
    if (!panelOpen) return;

    const clickedInsidePanel = panel.contains(e.target);
    const clickedNode = e.target.closest('svg');

    if (!clickedInsidePanel && !clickedNode) {
      closePanel();
    }
  });

  // --- Render panel ---
  function renderPanel(code, meta, color) {
    const data = widthData[code];
    const description = meta?.y_goal || meta?.capability_goal || meta?.goal || '';

    document.getElementById('width-panel-code').textContent = code;
    document.getElementById('width-panel-code').style.color = color || '#888';
    document.getElementById('width-panel-title').textContent = meta ? meta.title : code;

    const body = document.getElementById('width-panel-body');

    let html = '';

    if (description) {
      html += `
        <div class="wp-section">
          <div class="wp-content">${description}</div>
        </div>
        <hr class="wp-divider">
      `;
    }

    if (!data) {
      html += `<div class="wp-no-data">Width data not yet available</div>`;
      body.innerHTML = html;
      body.scrollTop = 0;
      return;
    }

    html += `
      <div class="wp-section">
        <div class="wp-label">Minimum width</div>
        <div class="wp-content">${data.minimum_width || '—'}</div>
      </div>

      <div class="wp-section">
        <div class="wp-label">Typical width</div>
        <div class="wp-content">${data.typical_width || '—'}</div>
      </div>
    `;

    if (data.wider?.length) {
      html += `
        <div class="wp-section">
          <div class="wp-label">Wider</div>
          <ul class="wp-wider-list">
            ${data.wider.map(w => `<li>${w}</li>`).join('')}
          </ul>
        </div>
      `;
    }

    if (data.elaborations?.length) {
      html += `
        <hr class="wp-divider">
        <button class="wp-disclosure" id="wp-elab-toggle">
          <span class="wp-disclosure-arrow">▶</span>
          <span class="wp-disclosure-label">Show elaborations (${data.elaborations.length})</span>
        </button>
        <ul class="wp-elab-list" id="wp-elab-list">
          ${data.elaborations.map(e => `<li>${e}</li>`).join('')}
        </ul>
      `;
    }

    body.innerHTML = html;
    body.scrollTop = 0;

    const toggle = document.getElementById('wp-elab-toggle');
    const list = document.getElementById('wp-elab-list');

    if (toggle && list) {
      toggle.addEventListener('click', () => {
        const open = list.classList.toggle('open');
        toggle.classList.toggle('open', open);
        toggle.querySelector('.wp-disclosure-label').textContent =
          open
            ? `Hide elaborations (${data.elaborations.length})`
            : `Show elaborations (${data.elaborations.length})`;
      });
    }
  }

  // --- Public API ---
  window.showWidthPanel = function (code, meta, color) {
    document.querySelectorAll('.node-selected').forEach(n => n.classList.remove('node-selected'));

    renderPanel(code, meta, color);
    panel.classList.add('open');
    panelOpen = true;
    document.body.classList.add('width-panel-open');
  };

})();