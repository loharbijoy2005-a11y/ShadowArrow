import json
import os

def build_visualizer():
    graph_path = os.path.join(os.path.dirname(__file__), "real_graph.json")
    if not os.path.exists(graph_path):
        print("real_graph.json not found!")
        return

    with open(graph_path, "r", encoding="utf-8") as f:
        graph_data = json.load(f)

    graph_json = json.dumps(graph_data, ensure_ascii=False, separators=(',', ':'))

    html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Shadow Arrow — 3D Architecture Visualizer</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"/>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#020205;font-family:'Inter',-apple-system,sans-serif;color:#cbd5e1}
#cv{position:fixed;inset:0;z-index:1}
#ui{position:fixed;inset:0;z-index:10;pointer-events:none;display:flex;flex-direction:column}
.ui{pointer-events:auto}
#bar{background:rgba(8,12,24,.95);backdrop-filter:blur(16px);border-bottom:1px solid #1e293b;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;gap:12px;flex-shrink:0}
.logo{display:flex;align-items:center;gap:10px}
.logo-ic{width:32px;height:32px;border-radius:8px;background:#0f172a;border:1px solid #1e293b;display:flex;align-items:center;justify-content:center;color:#00d5ff;font-size:13px}
.logo-t{font-size:13px;font-weight:700;color:#f1f5f9;letter-spacing:-.2px}
.logo-s{font-size:10px;color:#64748b;font-family:'JetBrains Mono',monospace}
.stats{display:flex;align-items:center;gap:2px;background:#080c18;border:1px solid #1e293b;border-radius:8px;padding:4px 12px;font-family:'JetBrains Mono',monospace;font-size:11px}
.si{display:flex;align-items:center;gap:5px;padding:0 8px;color:#64748b}
.si b{font-weight:700}
.sv{width:1px;height:14px;background:#1e293b}
.acts{display:flex;gap:8px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid transparent;font-family:'Inter',sans-serif}
.bg{background:#0f172a;border-color:#1e293b;color:#94a3b8}.bg:hover{background:#1e293b;color:#f1f5f9}
.bp{background:#4f46e5;border-color:#6366f1;color:#fff}.bp:hover{background:#4338ca}
.panel{position:fixed;top:64px;bottom:54px;width:280px;background:rgba(8,12,24,.96);backdrop-filter:blur(16px);border:1px solid #1e293b;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;transition:transform .3s cubic-bezier(.4,0,.2,1)}
#lp{left:12px;transform:translateX(-320px)}#lp.open{transform:translateX(0)}
#rp{right:12px;transform:translateX(340px)}#rp.open{transform:translateX(0)}
.ph{padding:12px 14px;border-bottom:1px solid #1e293b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#64748b;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.ph span:first-child{display:flex;align-items:center;gap:6px;color:#94a3b8}
.cx{cursor:pointer;color:#475569;font-size:14px}.cx:hover{color:#f1f5f9}
.pb{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.pb::-webkit-scrollbar{width:3px}.pb::-webkit-scrollbar-thumb{background:#1e293b;border-radius:2px}
.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#475569;margin-top:4px}
.cr{display:flex;flex-direction:column;gap:4px}
.cl{font-size:10px;font-family:'JetBrains Mono',monospace;color:#64748b;display:flex;justify-content:space-between}
.cl span:last-child{color:#00d5ff;font-weight:700}
input[type=range]{-webkit-appearance:none;width:100%;height:3px;border-radius:2px;background:#1e293b;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:11px;height:11px;border-radius:50%;background:#00d5ff;cursor:pointer}
.pp{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#080c18;border:1px solid #1e293b;border-radius:8px;cursor:pointer;transition:all .15s;font-size:11px}
.pp:hover{background:#0f172a;border-color:#334155}
.pd{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.pn{font-weight:600;color:#e2e8f0;margin-left:8px;flex:1;font-family:'JetBrains Mono',monospace;font-size:10.5px}
.pc{color:#475569;font-size:10px;font-family:'JetBrains Mono',monospace}
.di{display:flex;flex-direction:column;gap:4px;max-height:260px;overflow-y:auto}
.dout{display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:6px;font-size:10px;font-family:'JetBrains Mono',monospace;background:rgba(0,213,255,.06);border:1px solid rgba(0,213,255,.2)}
.dout .dn{color:#00d5ff}
.din{display:flex;align-items:center;justify-content:space-between;padding:5px 8px;border-radius:6px;font-size:10px;font-family:'JetBrains Mono',monospace;background:rgba(255,0,85,.06);border:1px solid rgba(255,0,85,.2)}
.din .dn{color:#ff4488}
.db{font-size:9px;color:#334155}
#dock{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:20;background:rgba(8,12,24,.96);backdrop-filter:blur(16px);border:1px solid #1e293b;border-radius:12px;padding:8px 12px;display:flex;align-items:center;gap:6px;pointer-events:auto;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.dk{width:32px;height:32px;border-radius:7px;background:#0f172a;border:1px solid #1e293b;display:flex;align-items:center;justify-content:center;color:#64748b;cursor:pointer;transition:all .15s;font-size:11px}
.dk:hover{background:#1e293b;color:#f1f5f9;border-color:#334155}
.dk.act{background:rgba(0,213,255,.12);border-color:rgba(0,213,255,.4);color:#00d5ff}
.ds{width:1px;height:20px;background:#1e293b}
.dl{font-size:9.5px;font-family:'JetBrains Mono',monospace;color:#475569;padding:0 4px}
#tt{position:fixed;z-index:30;pointer-events:none;display:none;padding:8px 12px;background:#080c18;border:1px solid #00d5ff;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.6);font-family:'JetBrains Mono',monospace;font-size:10px;color:#f8fafc;transform:translate(16px,12px);max-width:220px}
#tt .tf{font-size:11px;font-weight:700;color:#00d5ff;margin-bottom:4px}
#tt .tr{display:flex;justify-content:space-between;gap:12px;margin-top:1px}
#tt .tk{color:#475569}#tt .tv{color:#e2e8f0;font-weight:600}
#tt .th{font-size:9px;color:#334155;margin-top:5px;border-top:1px solid #1e293b;padding-top:4px}
</style>
</head>
<body>
<div id="cv"></div>
<div id="tt"><div class="tf" id="tt-n">file.tsx</div><div class="tr"><span class="tk">Tier</span><span class="tv" id="tt-t">components</span></div><div class="tr"><span class="tk">LOC</span><span class="tv" id="tt-s">120</span></div><div class="tr"><span class="tk">Imports</span><span class="tv" id="tt-o">3</span></div><div class="tr"><span class="tk">Used by</span><span class="tv" id="tt-i">2</span></div><div class="th">Click to isolate chain</div></div>
<div id="ui">
  <header id="bar" class="ui">
    <div class="logo"><div class="logo-ic"><i class="fa-solid fa-code-branch"></i></div><div><div class="logo-t">Shadow Arrow — Architecture Graph</div><div class="logo-s">Real-time WebGL Dependency Topology</div></div></div>
    <div class="stats ui">
      <div class="si"><i class="fa-solid fa-layer-group" style="color:#f59e0b;font-size:9px"></i>Pillars<b id="s-p" style="color:#f59e0b">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-file-code" style="color:#00d5ff;font-size:9px"></i>Files<b id="s-n" style="color:#00d5ff">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-arrows-left-right" style="color:#ff0055;font-size:9px"></i>Deps<b id="s-l" style="color:#ff0055">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-bezier-curve" style="color:#00ff88;font-size:9px"></i>Fibers<b id="s-f" style="color:#00ff88">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-gauge-high" style="color:#94a3b8;font-size:9px"></i>FPS<b id="s-fps" style="color:#f1f5f9">—</b></div>
    </div>
    <div class="acts ui">
      <button class="btn bg" onclick="togglePanel('lp')"><i class="fa-solid fa-sliders"></i>Settings</button>
      <button class="btn bp" onclick="doTrace()"><i class="fa-solid fa-play"></i>Trace Flow</button>
    </div>
  </header>
  <aside id="lp" class="panel ui">
    <div class="ph"><span><i class="fa-solid fa-sliders"></i>Settings</span><span class="cx" onclick="togglePanel('lp')">✕</span></div>
    <div class="pb">
      <div class="st">Fiber Cable Bundles</div>
      <div class="cr"><div class="cl"><span>Fibers per link</span><span id="lv-f">4</span></div><input type="range" min="1" max="10" step="1" value="4" oninput="CFG.fibers=+this.value;document.getElementById('lv-f').textContent=this.value;rebuild()"></div>
      <div class="cr"><div class="cl"><span>Bundle spread radius</span><span id="lv-sp">6.0</span></div><input type="range" min="1" max="15" step="0.5" value="6.0" oninput="CFG.spread=+this.value;document.getElementById('lv-sp').textContent=(+this.value).toFixed(1);rebuild()"></div>
      <div class="cr"><div class="cl"><span>Line Wave Motion (Amp)</span><span id="lv-wa">16</span></div><input type="range" min="0" max="60" step="2" value="16" oninput="CFG.wave=+this.value;document.getElementById('lv-wa').textContent=this.value"></div>
      <div class="cr"><div class="cl"><span>Wave Frequency</span><span id="lv-ws">0.6</span></div><input type="range" min="0.1" max="2.0" step="0.1" value="0.6" oninput="CFG.waveSpeed=+this.value;document.getElementById('lv-ws').textContent=(+this.value).toFixed(1)"></div>
      <div class="cr"><div class="cl"><span>Spline Curvature</span><span id="lv-cu">0.55</span></div><input type="range" min="0.1" max="1.5" step="0.05" value="0.55" oninput="CFG.curv=+this.value;document.getElementById('lv-cu').textContent=(+this.value).toFixed(2);rebuild()"></div>
      <div class="cr"><div class="cl"><span>Node Distance / Spacing</span><span id="lv-ns">48</span></div><input type="range" min="20" max="90" step="2" value="48" oninput="CFG.nodeSpacing=+this.value;document.getElementById('lv-ns').textContent=this.value;rebuild()"></div>
      <div class="cr"><div class="cl"><span>Data Pulse Speed</span><span id="lv-ps">1.0</span></div><input type="range" min="0.1" max="4.0" step="0.1" value="1.0" oninput="CFG.pulseSpeed=+this.value;document.getElementById('lv-ps').textContent=(+this.value).toFixed(1)"></div>
      <div class="st">Canvas Bloom (Subtle Glow)</div>
      <div class="cr"><div class="cl"><span>Strength</span><span id="lv-bs">0.75</span></div><input type="range" min="0.1" max="3.0" step="0.05" value="0.75" oninput="bloomPass.strength=+this.value;document.getElementById('lv-bs').textContent=(+this.value).toFixed(2)"></div>
      <div class="cr"><div class="cl"><span>Radius</span><span id="lv-br">0.40</span></div><input type="range" min="0.1" max="1.5" step="0.05" value="0.40" oninput="bloomPass.radius=+this.value;document.getElementById('lv-br').textContent=(+this.value).toFixed(2)"></div>
      <div class="cr"><div class="cl"><span>Threshold</span><span id="lv-bt">0.30</span></div><input type="range" min="0.0" max="1.0" step="0.05" value="0.30" oninput="bloomPass.threshold=+this.value;document.getElementById('lv-bt').textContent=(+this.value).toFixed(2)"></div>
      <div class="st">Project Pillars</div>
      <div id="pillar-list"></div>
    </div>
  </aside>
  <aside id="rp" class="panel ui">
    <div class="ph"><span><i class="fa-solid fa-file-code"></i>File Inspector</span><span class="cx" onclick="clearSel()">✕</span></div>
    <div class="pb">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span id="ib" style="font-size:10px;font-weight:700;font-family:'JetBrains Mono';padding:2px 8px;border-radius:4px;background:rgba(0,213,255,.12);color:#00d5ff;border:1px solid rgba(0,213,255,.25)">TIER</span>
          <span id="il" style="font-size:10px;color:#64748b;font-family:'JetBrains Mono'">JS</span>
        </div>
        <div id="in" style="font-size:14px;font-weight:700;color:#f1f5f9;font-family:'JetBrains Mono'">file.tsx</div>
        <div id="ip" style="font-size:10px;color:#475569;font-family:'JetBrains Mono';margin-top:2px;word-break:break-all">/path/to/file</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;padding:10px 0;text-align:center">
        <div style="background:#080c18;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#475569;text-transform:uppercase;font-family:'JetBrains Mono'">LOC</div><div id="ix" style="font-size:13px;font-weight:700;color:#00ff88;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
        <div style="background:#080c18;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#475569;text-transform:uppercase;font-family:'JetBrains Mono'">Imports</div><div id="io" style="font-size:13px;font-weight:700;color:#00d5ff;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
        <div style="background:#080c18;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#475569;text-transform:uppercase;font-family:'JetBrains Mono'">Used By</div><div id="ii" style="font-size:13px;font-weight:700;color:#ff4488;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
      </div>
      <div class="st">Dependency Stream</div>
      <div class="di" id="id-list"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
        <button class="btn bp" style="justify-content:center;font-size:10px" onclick="pulseSel()"><i class="fa-solid fa-bolt"></i>Pulse</button>
        <button class="btn bg" style="justify-content:center;font-size:10px" onclick="focusSel()"><i class="fa-solid fa-crosshairs"></i>Focus</button>
      </div>
    </div>
  </aside>
</div>
<div id="dock">
  <button class="dk" id="btn-pp" onclick="togglePause()" title="Play/Pause"><i class="fa-solid fa-pause" id="i-pp"></i></button>
  <div class="ds"></div>
  <button class="dk" onclick="setView('iso')" title="Isometric"><i class="fa-solid fa-cube"></i></button>
  <button class="dk" onclick="setView('side')" title="Side Projection"><i class="fa-solid fa-table-columns"></i></button>
  <button class="dk" onclick="setView('top')" title="Top Flow"><i class="fa-solid fa-arrows-up-down"></i></button>
  <div class="ds"></div>
  <button class="dk" id="btn-rot" onclick="toggleRot()" title="Auto-orbit"><i class="fa-solid fa-arrows-spin"></i></button>
  <button class="dk act" id="btn-lbl" onclick="toggleLabels()" title="Toggle Labels"><i class="fa-solid fa-tags"></i></button>
  <button class="dk" onclick="clearSel()" title="Reset View"><i class="fa-solid fa-rotate-left"></i></button>
  <div class="ds"></div>
  <span class="dl">ORBIT: Left-drag &middot; PAN: Right-drag / Shift-drag &middot; ZOOM: Scroll wheel</span>
</div>

<script>
// ════════ REAL PROJECT GRAPH DATA ════════
const GRAPH_DATA = """ + graph_json + """;

// ════════ CONFIG ════════
const CFG = {
  fibers: 4,           // 4 fibers per link instead of 10 to prevent white blowout
  spread: 6.0,         // Spread fibers wider so they don't overlap into a blob
  wave: 16,            // Smooth line wave motion
  waveSpeed: 0.6,      // Natural frequency
  curv: 0.55,
  nodeSpacing: 48,     // Node Spacing (48px per node)
  pulseSpeed: 1.0,
  paused: false,
  autoRot: false,
  showLabels: true,
};

const TIER_COL = {
  pages:       0xe879f9,
  components:  0x00d5ff,
  backend:     0x00ff88,
  utils:       0xa78bfa,
  models:      0xf59e0b,
  scripts:     0x64748b,
  services:    0xff0055,
  middleware:  0xfbbf24,
  storefront:  0x38bdf8,
  lib:         0x00e5ff,
  context:     0x4ade80,
  database:    0x00d5ff,
  config:      0xfcd34d,
  static:      0x94a3b8,
  api:         0xff6b6b,
  hooks:       0xc084fc,
  admin:       0xf97316,
  misc:        0x475569,
};
const TIER_ORDER = ['pages','components','backend','utils','models','services','middleware','lib','context','database','scripts','config','storefront','static','api','hooks','admin','misc'];
function tc(t){ return TIER_COL[t] ?? 0x94a3b8; }

// ════════ THREE.JS SETUP ════════
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020205, 0.0003);

const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 1, 15000);
camera.position.set(-800, 450, 1400);

const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95; // Crisp dark exposure
document.getElementById('cv').appendChild(renderer.domElement);

// OrbitControls with Pan & Zoom
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.maxDistance = 10000;
controls.minDistance = 20;
controls.zoomSpeed = 1.2;
controls.panSpeed = 1.0;
controls.autoRotateSpeed = 0.4;

// SUBTLE SLEEK BLOOM (No blinding white flares!)
const bloomPass = new THREE.UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.75,  // Strength: 0.75 (down from 2.4!)
  0.40,  // Radius: 0.40 (down from 0.85!)
  0.30   // Threshold: 0.30 (only actual highlights bloom)
);

const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));
composer.addPass(bloomPass);

// Grid
const grid = new THREE.GridHelper(6000, 80, 0x0e172a, 0x070b14);
grid.position.y = -600;
grid.material.opacity = 0.35; grid.material.transparent = true;
scene.add(grid);

// Stars
const sb = new Float32Array(1500*3);
for(let i=0;i<sb.length;i++) sb[i]=(Math.random()-.5)*7000;
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sb,3));
scene.add(new THREE.Points(sg, new THREE.PointsMaterial({color:0x334155,size:1.8,transparent:true,opacity:.3})));

// ════════ SCENE STATE ════════
const GRP = new THREE.Group(); scene.add(GRP);
let NODES=[], FIBERS=[], PULSE=null;
let SEL=null, HOV=null;

let pPos, pCol, pProg, pSpd, pFIdx, pCIdx;

// Canvas Textures
function glowTex(hex='#00d5ff'){
  const c=document.createElement('canvas'); c.width=c.height=128;
  const x=c.getContext('2d');
  const g=x.createRadialGradient(64,64,0,64,64,64);
  g.addColorStop(0,'#ffffff'); g.addColorStop(0.2,hex); g.addColorStop(0.5,'rgba(0,0,0,0.05)'); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,128,128);
  return new THREE.CanvasTexture(c);
}
function hdrTex(title,sub,hex){
  const c=document.createElement('canvas'); c.width=512; c.height=104;
  const x=c.getContext('2d'); x.clearRect(0,0,512,104);
  x.fillStyle='rgba(8,12,24,0.92)'; x.strokeStyle=hex; x.lineWidth=2.5;
  x.beginPath(); if(x.roundRect)x.roundRect(8,6,496,88,8); else x.rect(8,6,496,88); x.fill(); x.stroke();
  x.font='bold 22px Inter,sans-serif'; x.fillStyle='#f1f5f9'; x.textAlign='center'; x.fillText(title,256,40);
  x.font='bold 13px "JetBrains Mono",monospace'; x.fillStyle=hex; x.fillText(sub,256,68);
  return new THREE.CanvasTexture(c);
}
function lblTex(name){
  const c=document.createElement('canvas'); c.width=260; c.height=48;
  const x=c.getContext('2d'); x.clearRect(0,0,260,48);
  x.fillStyle='rgba(8,12,24,0.88)'; x.strokeStyle='rgba(100,116,139,0.28)'; x.lineWidth=1;
  x.beginPath(); if(x.roundRect)x.roundRect(4,8,252,32,5); else x.rect(4,8,252,32); x.fill(); x.stroke();
  x.font='bold 13px "JetBrains Mono",monospace'; x.fillStyle='#f1f5f9'; x.textAlign='center'; x.textBaseline='middle';
  const disp=name.length>21?name.slice(0,20)+'…':name;
  x.fillText(disp,130,24);
  return new THREE.CanvasTexture(c);
}

// ════════ BUILD GRAPH ════════
function buildGraph(){
  while(GRP.children.length){
    const o=GRP.children[0]; GRP.remove(o);
    if(o.geometry)o.geometry.dispose();
    if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material]; ms.forEach(m=>{if(m.map)m.map.dispose();m.dispose()});}
  }
  NODES=[]; FIBERS=[]; SEL=null; HOV=null;

  const nodes=GRAPH_DATA.nodes, links=GRAPH_DATA.links;

  const tierSet=[];
  nodes.forEach(n=>{ if(!tierSet.includes(n.tier))tierSet.push(n.tier); });
  tierSet.sort((a,b)=>(TIER_ORDER.indexOf(a)<0?99:TIER_ORDER.indexOf(a))-(TIER_ORDER.indexOf(b)<0?99:TIER_ORDER.indexOf(b)));

  const pCount=tierSet.length;
  const colW=Math.max(260, Math.min(340, 2200/Math.max(pCount-1,1)));
  const totalW=(pCount-1)*colW;
  const startX=-totalW/2;

  const tierMap={}, idMap={};
  tierSet.forEach(t=>tierMap[t]=[]);
  nodes.forEach(n=>{ if(tierMap[n.tier])tierMap[n.tier].push(n); });

  tierSet.forEach((tier,pi)=>{
    const col=tc(tier), hex='#'+col.toString(16).padStart(6,'0');
    const tnodes=tierMap[tier], cx=startX+pi*colW;
    
    const spacing=CFG.nodeSpacing;
    const totalH=Math.max(spacing*2, (tnodes.length-1)*spacing);
    const topY=totalH/2;

    // Pillar Header
    const hsp=new THREE.Sprite(new THREE.SpriteMaterial({map:hdrTex(tier.toUpperCase(),`PILLAR ${pi+1} · ${tnodes.length} FILES`,hex),transparent:true,depthTest:false}));
    hsp.position.set(cx, topY+64, 0);
    hsp.scale.set(100, 19, 1);
    GRP.add(hsp);

    // Dashed rail
    const rg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx,topY+14,0),new THREE.Vector3(cx,-topY-14,0)]);
    const rl=new THREE.Line(rg, new THREE.LineDashedMaterial({color:col,dashSize:4,gapSize:4,opacity:.2,transparent:true}));
    rl.computeLineDistances(); GRP.add(rl);

    tnodes.forEach((node,ni)=>{
      const y=tnodes.length>1?topY-ni*spacing:0;
      const z=Math.sin(ni*0.4+pi*1.1)*16;

      // CLEAN NORMAL PIN (Clean emissive, crisp non-blinding dot)
      const mat=new THREE.MeshStandardMaterial({
        color: col,
        emissive: col,
        emissiveIntensity: 0.35,  // Low emissive to prevent white flare
        roughness: 0.2,
        metalness: 0.8
      });
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(3.2, 16, 16), mat);
      mesh.position.set(cx, y, z);
      GRP.add(mesh);

      // Sharp halo ring
      const halo=new THREE.Mesh(
        new THREE.RingGeometry(4.4, 6.0, 18),
        new THREE.MeshBasicMaterial({color:col, side:THREE.DoubleSide, transparent:true, opacity:.25, blending:THREE.AdditiveBlending})
      );
      halo.position.set(cx, y, z);
      GRP.add(halo);

      // Label sprite
      const lsp=new THREE.Sprite(new THREE.SpriteMaterial({map:lblTex(node.name), transparent:true, depthTest:false, visible:CFG.showLabels}));
      lsp.position.set(cx, y+9, z);
      lsp.scale.set(24, 6, 1);
      GRP.add(lsp);

      const obj={node, mesh, halo, label:lsp, pos:new THREE.Vector3(cx,y,z), color:col, out:[], in:[]};
      mesh.userData.n=obj;
      idMap[node.id]=NODES.length;
      NODES.push(obj);
    });
  });

  // ── Build Fiber Cables (Low Opacity + Normal Blending to avoid white flare) ──
  links.forEach(link=>{
    const si=idMap[link.source], ti=idMap[link.target];
    if(si===undefined||ti===undefined)return;
    const from=NODES[si], to=NODES[ti];
    const p0=from.pos, p3=to.pos;
    const dx=p3.x-p0.x, dy=p3.y-p0.y;
    const cpOff=Math.abs(dx)*CFG.curv*0.55;

    const fd={curves:[], lines:[], bases:[], fromIdx:si, toIdx:ti, baseCol:from.color};

    for(let f=0; f<CFG.fibers; f++){
      const angle=(f/CFG.fibers)*Math.PI*2;
      const r=(0.4+Math.random()*0.6)*CFG.spread;
      const oy=Math.cos(angle)*r, oz=Math.sin(angle)*r;
      const phase=Math.random()*Math.PI*2;

      const v1=new THREE.Vector3(p0.x+cpOff, p0.y-dy*0.1+oy, p0.z+oz+20);
      const v2=new THREE.Vector3(p3.x-cpOff, p3.y+dy*0.1+oy, p3.z+oz+20);
      const curve=new THREE.CubicBezierCurve3(p0.clone(), v1, v2, p3.clone());

      const pts=curve.getPoints(36);
      const geo=new THREE.BufferGeometry().setFromPoints(pts);

      // CRISP LINE MATERIAL: Low opacity (0.16) + NormalBlending prevents white explosion!
      const mat=new THREE.LineBasicMaterial({
        color: from.color,
        transparent: true,
        opacity: 0.16,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const line=new THREE.Line(geo, mat);
      GRP.add(line);

      fd.curves.push(curve);
      fd.lines.push(line);
      fd.bases.push({ v1base:v1.clone(), v2base:v2.clone(), p0:p0.clone(), p3:p3.clone(), oy, oz, phase });
    }
    from.out.push(fd); to.in.push(fd);
    FIBERS.push(fd);
  });

  buildPulse();

  // Update Stats
  document.getElementById('s-p').textContent=tierSet.length;
  document.getElementById('s-n').textContent=nodes.length;
  document.getElementById('s-l').textContent=links.length;
  document.getElementById('s-f').textContent=(links.length*CFG.fibers).toLocaleString()+'+';

  buildPillarList(tierSet, tierMap, startX, colW);

  const midX=(startX+(pCount-1)*colW)/2;
  controls.target.set(midX, 0, 0);
  camera.position.set(midX-800, 450, 1400);
}

// ════════ PULSE DATA PACKETS ════════
function buildPulse(){
  if(PULSE){GRP.remove(PULSE);PULSE.geometry.dispose();PULSE.material.dispose();}
  if(!FIBERS.length)return;
  const COUNT=Math.min(2200, FIBERS.length*CFG.fibers*1.1|0);
  pPos=new Float32Array(COUNT*3);
  pCol=new Float32Array(COUNT*3);
  pProg=new Float32Array(COUNT);
  pSpd=new Float32Array(COUNT);
  pFIdx=new Int32Array(COUNT);
  pCIdx=new Int32Array(COUNT);

  for(let i=0; i<COUNT; i++){
    const fi=Math.floor(Math.random()*FIBERS.length);
    const ci=Math.floor(Math.random()*FIBERS[fi].curves.length);
    pFIdx[i]=fi; pCIdx[i]=ci;
    pProg[i]=Math.random();
    pSpd[i]=0.002+Math.random()*0.006;
    const c=new THREE.Color(FIBERS[fi].baseCol);
    pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b;
    const pt=FIBERS[fi].curves[ci].getPoint(pProg[i]);
    pPos[i*3]=pt.x; pPos[i*3+1]=pt.y; pPos[i*3+2]=pt.z;
  }

  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(pCol,3));
  PULSE=new THREE.Points(geo, new THREE.PointsMaterial({
    size: 4.5,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    map: glowTex('#00d5ff'),
    depthWrite: false,
    sizeAttenuation: true
  }));
  GRP.add(PULSE);
}

// ════════ CONTINUOUS LINE WAVE ANIMATION ════════
function animateLineWave(t){
  if(CFG.paused || CFG.wave < 0.5) return;
  const amp = CFG.wave;
  const spd = CFG.waveSpeed;

  FIBERS.forEach((fd, fi) => {
    fd.curves.forEach((curve, ci) => {
      const b = fd.bases[ci];
      if(!b) return;

      const phase1 = t * 0.001 * spd + fi * 0.12 + ci * 0.25 + b.phase;
      const phase2 = t * 0.0013 * spd + fi * 0.08 + ci * 0.35 + b.phase + 1.1;

      const dY1 = Math.sin(phase1) * amp;
      const dZ1 = Math.cos(phase1 * 0.85) * amp * 0.7;

      const dY2 = Math.sin(phase2) * amp;
      const dZ2 = Math.cos(phase2 * 0.85) * amp * 0.7;

      curve.v1.x = b.v1base.x;
      curve.v1.y = b.v1base.y + dY1;
      curve.v1.z = b.v1base.z + dZ1;

      curve.v2.x = b.v2base.x;
      curve.v2.y = b.v2base.y + dY2;
      curve.v2.z = b.v2base.z + dZ2;

      const pts = curve.getPoints(36);
      const posArr = fd.lines[ci].geometry.attributes.position.array;
      for(let p=0; p<pts.length; p++){
        posArr[p*3]   = pts[p].x;
        posArr[p*3+1] = pts[p].y;
        posArr[p*3+2] = pts[p].z;
      }
      fd.lines[ci].geometry.attributes.position.needsUpdate = true;
    });
  });
}

// ════════ DATA PULSE ANIMATION ════════
function animatePulse(){
  if(!PULSE || CFG.paused) return;
  const pos = PULSE.geometry.attributes.position.array;
  const n = pProg.length;
  for(let i=0; i<n; i++){
    pProg[i] += pSpd[i] * CFG.pulseSpeed;
    if(pProg[i] > 1.0){
      pProg[i] = 0;
      const fi = Math.floor(Math.random()*FIBERS.length);
      const ci = Math.floor(Math.random()*FIBERS[fi].curves.length);
      pFIdx[i] = fi; pCIdx[i] = ci;
    }
    const fd = FIBERS[pFIdx[i]];
    if(!fd || !fd.curves[pCIdx[i]]) continue;
    const pt = fd.curves[pCIdx[i]].getPoint(pProg[i]);
    pos[i*3]   = pt.x;
    pos[i*3+1] = pt.y;
    pos[i*3+2] = pt.z;
  }
  PULSE.geometry.attributes.position.needsUpdate = true;
}

// ════════ RAYCASTING & INTERACTION ════════
const RC = new THREE.Raycaster();
const MV = new THREE.Vector2(-9, -9);
const TT = document.getElementById('tt');

window.addEventListener('mousemove', e => {
  MV.x = (e.clientX/innerWidth)*2 - 1;
  MV.y = -(e.clientY/innerHeight)*2 + 1;
  TT.style.left = e.clientX + 'px';
  TT.style.top  = e.clientY + 'px';
});

window.addEventListener('click', e => {
  if(e.target.closest('.panel') || e.target.closest('#bar') || e.target.closest('#dock')) return;
  RC.setFromCamera(MV, camera);
  const hits = RC.intersectObjects(NODES.map(o => o.mesh));
  if(hits.length) selNode(hits[0].object.userData.n);
  else clearSel();
});

function hoverTest(){
  RC.setFromCamera(MV, camera);
  const hits = RC.intersectObjects(NODES.map(o => o.mesh));
  if(hits.length){
    const o = hits[0].object.userData.n;
    if(HOV !== o){
      HOV = o;
      document.getElementById('tt-n').textContent = o.node.name;
      document.getElementById('tt-t').textContent = o.node.tier;
      document.getElementById('tt-s').textContent = (o.node.size||'—') + ' LOC';
      document.getElementById('tt-o').textContent = o.out.length;
      document.getElementById('tt-i').textContent = o.in.length;
      TT.style.display = 'block';
    }
  } else { if(HOV){ HOV=null; TT.style.display='none'; } }
}

// ════════ SELECTION ════════
function selNode(obj){
  SEL = obj;
  openPanel('rp');
  const tier = obj.node.tier || '—';
  document.getElementById('ib').textContent = tier.toUpperCase().slice(0,8);
  document.getElementById('in').textContent = obj.node.name;
  document.getElementById('ip').textContent = obj.node.path || ('/' + tier + '/' + obj.node.name);
  document.getElementById('il').textContent = obj.node.ext==='.ts'||obj.node.ext==='.tsx'?'TypeScript':obj.node.ext==='.go'?'Go':obj.node.ext==='.py'?'Python':'JavaScript';
  document.getElementById('ix').textContent = obj.node.size || '—';
  document.getElementById('io').textContent = obj.out.length;
  document.getElementById('ii').textContent = obj.in.length;

  const dl = document.getElementById('id-list'); dl.innerHTML = '';
  obj.out.forEach(fd => { const t = NODES[fd.toIdx]; dl.innerHTML += `<div class="dout"><span class="dn">↳ ${t.node.name}</span><span class="db">${t.node.tier}</span></div>`; });
  obj.in.forEach(fd  => { const f = NODES[fd.fromIdx]; dl.innerHTML += `<div class="din"><span class="dn">↲ ${f.node.name}</span><span class="db">${f.node.tier}</span></div>`; });

  const conn = new Set([...obj.out, ...obj.in]);
  FIBERS.forEach(fd => {
    const act = conn.has(fd);
    fd.lines.forEach(ln => { ln.material.opacity = act ? 0.85 : 0.02; ln.material.color.setHex(act ? 0x00d5ff : 0x050810); });
  });
  NODES.forEach(n => {
    const dir = obj.out.some(fd => fd.toIdx===NODES.indexOf(n)) || obj.in.some(fd => fd.fromIdx===NODES.indexOf(n));
    if(n === obj){ n.mesh.scale.set(3,3,3); n.mesh.material.emissiveIntensity=2.0; n.halo.material.color.setHex(0xff0055); n.halo.scale.set(2.4,2.4,2.4); }
    else if(dir){ n.mesh.scale.set(1.8,1.8,1.8); n.mesh.material.emissiveIntensity=1.2; n.halo.scale.set(1.6,1.6,1.6); n.halo.material.color.setHex(0x00d5ff); }
    else { n.mesh.scale.set(0.55,0.55,0.55); n.mesh.material.emissiveIntensity=0.08; n.halo.scale.set(0.55,0.55,0.55); n.halo.material.color.setHex(0x0f172a); }
  });
}

function clearSel(){
  SEL = null;
  document.getElementById('rp').classList.remove('open');
  FIBERS.forEach(fd => fd.lines.forEach(ln => { ln.material.opacity = 0.16; ln.material.color.setHex(fd.baseCol); }));
  NODES.forEach(n => { n.mesh.scale.set(1,1,1); n.mesh.material.emissiveIntensity = 0.35; n.halo.scale.set(1,1,1); n.halo.material.color.setHex(n.color); });
}

function pulseSel(){ if(!SEL) return; new TWEEN.Tween(SEL.mesh.scale).to({x:4.5,y:4.5,z:4.5},130).yoyo(true).repeat(1).easing(TWEEN.Easing.Quadratic.Out).start(); }
function focusSel(){ if(!SEL) return; new TWEEN.Tween(controls.target).to({x:SEL.pos.x,y:SEL.pos.y,z:SEL.pos.z},700).easing(TWEEN.Easing.Cubic.Out).start(); }

// ════════ UI & VIEW HELPERS ════════
function togglePanel(id){ document.getElementById(id).classList.toggle('open'); }
function openPanel(id){ document.getElementById(id).classList.add('open'); }

function setView(v){
  const tx = controls.target.x;
  let p;
  if(v==='iso')      p = {x: tx-800, y: 450, z: 1400};
  else if(v==='side')p = {x: tx-1400, y: 0, z: 0};
  else               p = {x: tx, y: 1600, z: 1};

  new TWEEN.Tween(camera.position).to(p, 800).easing(TWEEN.Easing.Cubic.Out).start();
  new TWEEN.Tween(controls.target).to({x: tx, y: 0, z: 0}, 800).easing(TWEEN.Easing.Cubic.Out).start();
}

function togglePause(){ CFG.paused=!CFG.paused; document.getElementById('i-pp').className = CFG.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'; }
function toggleRot(){ CFG.autoRot=!CFG.autoRot; controls.autoRotate=CFG.autoRot; document.getElementById('btn-rot').classList.toggle('act', CFG.autoRot); }
function toggleLabels(){ CFG.showLabels=!CFG.showLabels; NODES.forEach(n => n.label.visible=CFG.showLabels); document.getElementById('btn-lbl').classList.toggle('act', CFG.showLabels); }

function doTrace(){
  const tiers = [...new Set(NODES.map(n=>n.node.tier))].sort((a,b)=>(TIER_ORDER.indexOf(a)<0?99:TIER_ORDER.indexOf(a))-(TIER_ORDER.indexOf(b)<0?99:TIER_ORDER.indexOf(b)));
  tiers.forEach((t,i)=>{
    setTimeout(()=>{ NODES.filter(n=>n.node.tier===t).forEach(o=>new TWEEN.Tween(o.mesh.scale).to({x:2.8,y:2.8,z:2.8},160).yoyo(true).repeat(1).easing(TWEEN.Easing.Quadratic.Out).start()); }, i*180);
  });
}

function rebuild(){ buildGraph(); }

function buildPillarList(tiers, tm, sx, cw){
  const el = document.getElementById('pillar-list'); el.innerHTML = '';
  tiers.forEach((t,i)=>{
    const col = tc(t), hex = '#'+col.toString(16).padStart(6,'0');
    const d = document.createElement('div'); d.className = 'pp';
    d.innerHTML = `<span class="pd" style="background:${hex}"></span><span class="pn">${t}</span><span class="pc">${tm[t].length} files</span>`;
    const cx = sx + i*cw;
    d.onclick = () => new TWEEN.Tween(controls.target).to({x:cx, y:0, z:0}, 550).easing(TWEEN.Easing.Cubic.Out).start();
    el.appendChild(d);
  });
}

// ════════ ANIMATE LOOP ════════
let fps0 = performance.now(), fpsC = 0;
function animate(t){
  requestAnimationFrame(animate);
  TWEEN.update();
  controls.update();

  if(!CFG.paused){
    animateLineWave(t);  // ← CONTINUOUS MOVING/WAVY LINE ANIMATION
    animatePulse();     // ← DATA PULSE PACKETS
    NODES.forEach((o,i) => {
      if(o !== SEL){
        o.halo.rotation.z += 0.008;
        const s = 1 + Math.sin(t*0.0025 + i*0.4) * 0.07;
        o.halo.scale.setScalar(s);
      }
    });
  }

  hoverTest();
  composer.render();

  fpsC++;
  if(t-fps0 >= 1000){
    document.getElementById('s-fps').textContent = Math.round(fpsC*1000/(t-fps0));
    fpsC = 0; fps0 = t;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ════════ INIT ════════
buildGraph();
animate(0);
</script>
</body>
</html>
"""

    out_file = os.path.join(os.path.dirname(__file__), "..", "..", "index.html")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(html_content)

    print(f"Successfully generated index.html ({os.path.getsize(out_file):,} bytes)")

if __name__ == "__main__":
    build_visualizer()
