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
<script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#060913;font-family:'Inter',-apple-system,sans-serif;color:#cbd5e1}
#cv{position:fixed;inset:0;z-index:1}
#ui{position:fixed;inset:0;z-index:10;pointer-events:none;display:flex;flex-direction:column}
.ui{pointer-events:auto}
#bar{background:rgba(15,23,42,.95);backdrop-filter:blur(16px);border-bottom:1px solid #1e293b;height:52px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;gap:12px;flex-shrink:0}
.logo{display:flex;align-items:center;gap:10px}
.logo-ic{width:32px;height:32px;border-radius:8px;background:#0f172a;border:1px solid #334155;display:flex;align-items:center;justify-content:center;color:#38bdf8;font-size:13px}
.logo-t{font-size:13px;font-weight:700;color:#f8fafc;letter-spacing:-.2px}
.logo-s{font-size:10px;color:#94a3b8;font-family:'JetBrains Mono',monospace}
.stats{display:flex;align-items:center;gap:2px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;padding:4px 12px;font-family:'JetBrains Mono',monospace;font-size:11px}
.si{display:flex;align-items:center;gap:5px;padding:0 8px;color:#94a3b8}
.si b{font-weight:700}
.sv{width:1px;height:14px;background:#1e293b}
.acts{display:flex;gap:8px}
.btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;border:1px solid transparent;font-family:'Inter',sans-serif}
.bg{background:#1e293b;border-color:#334155;color:#cbd5e1}.bg:hover{background:#334155;color:#f8fafc}
.bp{background:#0284c7;border-color:#38bdf8;color:#fff}.bp:hover{background:#0369a1}
.panel{position:fixed;top:64px;bottom:54px;width:290px;background:rgba(15,23,42,.97);backdrop-filter:blur(16px);border:1px solid #334155;border-radius:12px;display:flex;flex-direction:column;overflow:hidden;transition:transform .3s cubic-bezier(.4,0,.2,1)}
#lp{left:12px;transform:translateX(-330px)}#lp.open{transform:translateX(0)}
#rp{right:12px;transform:translateX(350px)}#rp.open{transform:translateX(0)}
.ph{padding:12px 14px;border-bottom:1px solid #1e293b;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}
.ph span:first-child{display:flex;align-items:center;gap:6px;color:#cbd5e1}
.cx{cursor:pointer;color:#64748b;font-size:14px}.cx:hover{color:#f8fafc}
.pb{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px}
.pb::-webkit-scrollbar{width:3px}.pb::-webkit-scrollbar-thumb{background:#334155;border-radius:2px}
.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8;margin-top:4px}
.cr{display:flex;flex-direction:column;gap:4px}
.cl{font-size:10px;font-family:'JetBrains Mono',monospace;color:#94a3b8;display:flex;justify-content:space-between}
.cl span:last-child{color:#38bdf8;font-weight:700}
input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;background:#334155;outline:none;cursor:pointer}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:12px;height:12px;border-radius:50%;background:#38bdf8;cursor:pointer}
.pp{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#0f172a;border:1px solid #1e293b;border-radius:8px;cursor:pointer;transition:all .15s;font-size:11px}
.pp:hover{background:#1e293b;border-color:#38bdf8}
.pd{width:9px;height:9px;border-radius:50%;flex-shrink:0}
.pn{font-weight:600;color:#f8fafc;margin-left:8px;flex:1;font-family:'JetBrains Mono',monospace;font-size:10.5px}
.pc{color:#64748b;font-size:10px;font-family:'JetBrains Mono',monospace}
.di{display:flex;flex-direction:column;gap:4px;max-height:280px;overflow-y:auto}
.dout{display:flex;align-items:center;justify-content:space-between;padding:6px 9px;border-radius:6px;font-size:10px;font-family:'JetBrains Mono',monospace;background:rgba(56,189,248,.08);border:1px solid rgba(56,189,248,.25)}
.dout .dn{color:#38bdf8;font-weight:600}
.din{display:flex;align-items:center;justify-content:space-between;padding:6px 9px;border-radius:6px;font-size:10px;font-family:'JetBrains Mono',monospace;background:rgba(244,63,94,.08);border:1px solid rgba(244,63,94,.25)}
.din .dn{color:#fb7185;font-weight:600}
.db{font-size:9px;color:#64748b}
#dock{position:fixed;bottom:12px;left:50%;transform:translateX(-50%);z-index:20;background:rgba(15,23,42,.96);backdrop-filter:blur(16px);border:1px solid #334155;border-radius:12px;padding:8px 14px;display:flex;align-items:center;gap:8px;pointer-events:auto;box-shadow:0 20px 50px rgba(0,0,0,.7)}
.dk{width:32px;height:32px;border-radius:7px;background:#1e293b;border:1px solid #334155;display:flex;align-items:center;justify-content:center;color:#94a3b8;cursor:pointer;transition:all .15s;font-size:11px}
.dk:hover{background:#334155;color:#f8fafc;border-color:#38bdf8}
.dk.act{background:rgba(56,189,248,.15);border-color:#38bdf8;color:#38bdf8}
.ds{width:1px;height:20px;background:#334155}
.dl{font-size:9.5px;font-family:'JetBrains Mono',monospace;color:#94a3b8;padding:0 4px}
#tt{position:fixed;z-index:30;pointer-events:none;display:none;padding:8px 12px;background:#0f172a;border:1px solid #38bdf8;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.6);font-family:'JetBrains Mono',monospace;font-size:10px;color:#f8fafc;transform:translate(16px,12px);max-width:230px}
#tt .tf{font-size:11px;font-weight:700;color:#38bdf8;margin-bottom:4px}
#tt .tr{display:flex;justify-content:space-between;gap:12px;margin-top:1px}
#tt .tk{color:#64748b}#tt .tv{color:#f8fafc;font-weight:600}
#tt .th{font-size:9px;color:#38bdf8;margin-top:5px;border-top:1px solid #1e293b;padding-top:4px}
</style>
</head>
<body>
<div id="cv"></div>
<div id="tt"><div class="tf" id="tt-n">file.tsx</div><div class="tr"><span class="tk">Tier</span><span class="tv" id="tt-t">components</span></div><div class="tr"><span class="tk">LOC</span><span class="tv" id="tt-s">120</span></div><div class="tr"><span class="tk">Imports</span><span class="tv" id="tt-o">3</span></div><div class="tr"><span class="tk">Used by</span><span class="tv" id="tt-i">2</span></div><div class="th">Double-click anywhere to zoom right into that spot</div></div>
<div id="ui">
  <header id="bar" class="ui">
    <div class="logo"><div class="logo-ic"><i class="fa-solid fa-code-branch"></i></div><div><div class="logo-t">Shadow Arrow — Architecture Graph</div><div class="logo-s">Clean 3D Codebase Dependency Map</div></div></div>
    <div class="stats ui">
      <div class="si"><i class="fa-solid fa-layer-group" style="color:#f59e0b;font-size:9px"></i>Pillars<b id="s-p" style="color:#f59e0b">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-file-code" style="color:#38bdf8;font-size:9px"></i>Files<b id="s-n" style="color:#38bdf8">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-arrows-left-right" style="color:#fb7185;font-size:9px"></i>Deps<b id="s-l" style="color:#fb7185">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-bezier-curve" style="color:#4ade80;font-size:9px"></i>Lines<b id="s-f" style="color:#4ade80">—</b></div><div class="sv"></div>
      <div class="si"><i class="fa-solid fa-gauge-high" style="color:#94a3b8;font-size:9px"></i>FPS<b id="s-fps" style="color:#f8fafc">—</b></div>
    </div>
    <div class="acts ui">
      <button class="btn bg" onclick="togglePanel('lp')"><i class="fa-solid fa-sliders"></i>Settings</button>
      <button class="btn bp" onclick="doTrace()"><i class="fa-solid fa-play"></i>Trace Flow</button>
    </div>
  </header>
  <aside id="lp" class="panel ui">
    <div class="ph"><span><i class="fa-solid fa-sliders"></i>Settings & Controls</span><span class="cx" onclick="togglePanel('lp')">✕</span></div>
    <div class="pb">
      <div class="st">Graph Controls</div>
      <div class="cr"><div class="cl"><span>Lines per Dependency</span><span id="lv-f">2</span></div><input type="range" min="1" max="5" step="1" value="2" oninput="CFG.fibers=+this.value;document.getElementById('lv-f').textContent=this.value;rebuild()"></div>
      <div class="cr"><div class="cl"><span>Line Wave Amplitude</span><span id="lv-wa">12</span></div><input type="range" min="0" max="40" step="2" value="12" oninput="CFG.wave=+this.value;document.getElementById('lv-wa').textContent=this.value"></div>
      <div class="cr"><div class="cl"><span>Wave Animation Speed</span><span id="lv-ws">0.5</span></div><input type="range" min="0.1" max="2.0" step="0.1" value="0.5" oninput="CFG.waveSpeed=+this.value;document.getElementById('lv-ws').textContent=(+this.value).toFixed(1)"></div>
      <div class="cr"><div class="cl"><span>Spline Curvature</span><span id="lv-cu">0.50</span></div><input type="range" min="0.1" max="1.2" step="0.05" value="0.50" oninput="CFG.curv=+this.value;document.getElementById('lv-cu').textContent=(+this.value).toFixed(2);rebuild()"></div>
      <div class="cr"><div class="cl"><span>Node Vertical Spacing</span><span id="lv-ns">28</span></div><input type="range" min="12" max="60" step="2" value="28" oninput="CFG.nodeSpacing=+this.value;document.getElementById('lv-ns').textContent=this.value;rebuild()"></div>
      <div class="cr"><div class="cl"><span>Signal Pulse Speed</span><span id="lv-ps">1.0</span></div><input type="range" min="0.1" max="3.0" step="0.1" value="1.0" oninput="CFG.pulseSpeed=+this.value;document.getElementById('lv-ps').textContent=(+this.value).toFixed(1)"></div>
      <div class="st">Project Pillars</div>
      <div id="pillar-list"></div>
    </div>
  </aside>
  <aside id="rp" class="panel ui">
    <div class="ph"><span><i class="fa-solid fa-file-code"></i>File Inspector</span><span class="cx" onclick="clearSel()">✕</span></div>
    <div class="pb">
      <div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <span id="ib" style="font-size:10px;font-weight:700;font-family:'JetBrains Mono';padding:2px 8px;border-radius:4px;background:rgba(56,189,248,.12);color:#38bdf8;border:1px solid rgba(56,189,248,.25)">TIER</span>
          <span id="il" style="font-size:10px;color:#94a3b8;font-family:'JetBrains Mono'">JS</span>
        </div>
        <div id="in" style="font-size:14px;font-weight:700;color:#f8fafc;font-family:'JetBrains Mono'">file.tsx</div>
        <div id="ip" style="font-size:10px;color:#64748b;font-family:'JetBrains Mono';margin-top:2px;word-break:break-all">/path/to/file</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;border-top:1px solid #1e293b;border-bottom:1px solid #1e293b;padding:10px 0;text-align:center">
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-family:'JetBrains Mono'">LOC</div><div id="ix" style="font-size:13px;font-weight:700;color:#4ade80;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-family:'JetBrains Mono'">Imports</div><div id="io" style="font-size:13px;font-weight:700;color:#38bdf8;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
        <div style="background:#0f172a;border:1px solid #1e293b;border-radius:6px;padding:8px 4px"><div style="font-size:9px;color:#64748b;text-transform:uppercase;font-family:'JetBrains Mono'">Used By</div><div id="ii" style="font-size:13px;font-weight:700;color:#fb7185;font-family:'JetBrains Mono';margin-top:2px">—</div></div>
      </div>
      <div class="st">Connected Dependencies</div>
      <div class="di" id="id-list"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:4px">
        <button class="btn bp" style="justify-content:center;font-size:10px" onclick="zoomToSelected()"><i class="fa-solid fa-magnifying-glass-plus"></i>Zoom In</button>
        <button class="btn bg" style="justify-content:center;font-size:10px" onclick="pulseSel()"><i class="fa-solid fa-bolt"></i>Highlight</button>
      </div>
    </div>
  </aside>
</div>
<div id="dock">
  <button class="dk" id="btn-pp" onclick="togglePause()" title="Play/Pause"><i class="fa-solid fa-pause" id="i-pp"></i></button>
  <div class="ds"></div>
  <button class="dk" onclick="setView('iso')" title="Isometric View"><i class="fa-solid fa-cube"></i></button>
  <button class="dk" onclick="setView('side')" title="Side Projection"><i class="fa-solid fa-table-columns"></i></button>
  <button class="dk" onclick="setView('top')" title="Top Flow"><i class="fa-solid fa-arrows-up-down"></i></button>
  <div class="ds"></div>
  <button class="dk" id="btn-rot" onclick="toggleRot()" title="Auto-orbit"><i class="fa-solid fa-arrows-spin"></i></button>
  <button class="dk act" id="btn-lbl" onclick="toggleLabels()" title="Toggle File Labels"><i class="fa-solid fa-tags"></i></button>
  <button class="dk" onclick="clearSel()" title="Reset View"><i class="fa-solid fa-rotate-left"></i></button>
  <div class="ds"></div>
  <span class="dl">CLICK: Select Node & Focus &middot; DOUBLE-CLICK: Zoom to exact spot &middot; PAN: Right-drag</span>
</div>

<script>
// ════════ REAL PROJECT GRAPH DATA ════════
const GRAPH_DATA = """ + graph_json + """;

// ════════ CONFIG ════════
const CFG = {
  fibers: 2,           // Clean 2 lines per link
  spread: 2.5,
  wave: 12,            
  waveSpeed: 0.5,
  curv: 0.50,
  nodeSpacing: 28,     // COMPACT VERTICAL SPACING FOR DOTS (28px per node)
  pulseSpeed: 1.0,
  paused: false,
  autoRot: false,
  showLabels: true,
};

const TIER_COL = {
  pages:       0xe879f9,
  components:  0x38bdf8,
  backend:     0x4ade80,
  utils:       0xc084fc,
  models:      0xf59e0b,
  scripts:     0x94a3b8,
  services:    0xf43f5e,
  middleware:  0xfbbf24,
  storefront:  0x0284c7,
  lib:         0x0ea5e9,
  context:     0x22c55e,
  database:    0x0284c7,
  config:      0xfde047,
  static:      0x64748b,
  api:         0xef4444,
  hooks:       0xa855f7,
  admin:       0xf97316,
  misc:        0x475569,
};
const TIER_ORDER = ['pages','components','backend','utils','models','services','middleware','lib','context','database','scripts','config','storefront','static','api','hooks','admin','misc'];
function tc(t){ return TIER_COL[t] ?? 0x94a3b8; }

// ════════ THREE.JS SETUP ════════
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x060913, 0.0002);

// near = 0.1 allows zooming infinitely close into any specific spot!
const camera = new THREE.PerspectiveCamera(45, innerWidth/innerHeight, 0.1, 20000);
camera.position.set(-600, 300, 1000);

const renderer = new THREE.WebGLRenderer({antialias:true, powerPreference:'high-performance'});
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('cv').appendChild(renderer.domElement);

// Lighting
const ambLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambLight);
const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight1.position.set(500, 1000, 750);
scene.add(dirLight1);
const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
dirLight2.position.set(-500, -500, -500);
scene.add(dirLight2);

// OrbitControls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.maxDistance = 15000;
controls.minDistance = 0.5; // Infinite close-up zoom!
controls.zoomSpeed = 1.2;
controls.panSpeed = 1.0;

// Invisible plane for raycasting double-clicks anywhere in space
const planeGeo = new THREE.PlaneGeometry(20000, 20000);
const planeMat = new THREE.MeshBasicMaterial({visible: false});
const invisiblePlane = new THREE.Mesh(planeGeo, planeMat);
scene.add(invisiblePlane);

// Grid
const grid = new THREE.GridHelper(8000, 100, 0x1e293b, 0x0f172a);
grid.position.y = -600;
grid.material.opacity = 0.4; grid.material.transparent = true;
scene.add(grid);

// Stars
const sb = new Float32Array(1500*3);
for(let i=0;i<sb.length;i++) sb[i]=(Math.random()-.5)*8000;
const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sb,3));
scene.add(new THREE.Points(sg, new THREE.PointsMaterial({color:0x475569,size:1.8,transparent:true,opacity:.3})));

// ════════ SCENE STATE ════════
const GRP = new THREE.Group(); scene.add(GRP);
let NODES=[], FIBERS=[], PULSE=null;
let SEL=null, HOV=null;

let pPos, pCol, pProg, pSpd, pFIdx, pCIdx;

// Canvas Textures
function glowTex(hex='#38bdf8'){
  const c=document.createElement('canvas'); c.width=c.height=64;
  const x=c.getContext('2d');
  const g=x.createRadialGradient(32,32,0,32,32,32);
  g.addColorStop(0,'#ffffff'); g.addColorStop(0.3,hex); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,64,64);
  return new THREE.CanvasTexture(c);
}

function hdrTex(title,sub,hex){
  const c=document.createElement('canvas'); c.width=512; c.height=104;
  const x=c.getContext('2d'); x.clearRect(0,0,512,104);
  x.fillStyle='rgba(15,23,42,0.94)'; x.strokeStyle=hex; x.lineWidth=2.5;
  x.beginPath(); if(x.roundRect)x.roundRect(8,6,496,88,8); else x.rect(8,6,496,88); x.fill(); x.stroke();
  x.font='bold 22px Inter,sans-serif'; x.fillStyle='#f8fafc'; x.textAlign='center'; x.fillText(title,256,40);
  x.font='bold 13px "JetBrains Mono",monospace'; x.fillStyle=hex; x.fillText(sub,256,68);
  return new THREE.CanvasTexture(c);
}

function lblTex(name){
  const c=document.createElement('canvas'); c.width=260; c.height=48;
  const x=c.getContext('2d'); x.clearRect(0,0,260,48);
  x.fillStyle='rgba(15,23,42,0.9)'; x.strokeStyle='rgba(100,116,139,0.3)'; x.lineWidth=1;
  x.beginPath(); if(x.roundRect)x.roundRect(4,8,252,32,5); else x.rect(4,8,252,32); x.fill(); x.stroke();
  x.font='bold 13px "JetBrains Mono",monospace'; x.fillStyle='#f8fafc'; x.textAlign='center'; x.textBaseline='middle';
  const disp=name.length>22?name.slice(0,21)+'…':name;
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
  const colW=Math.max(240, Math.min(320, 2200/Math.max(pCount-1,1)));
  const totalW=(pCount-1)*colW;
  const startX=-totalW/2;

  const tierMap={}, idMap={};
  tierSet.forEach(t=>tierMap[t]=[]);
  nodes.forEach(n=>{ if(tierMap[n.tier])tierMap[n.tier].push(n); });

  tierSet.forEach((tier,pi)=>{
    const col=tc(tier), hex='#'+col.toString(16).padStart(6,'0');
    const tnodes=tierMap[tier], cx=startX+pi*colW;
    
    // COMPACT NODE SPACING (28px) - Dots are close together
    const spacing=CFG.nodeSpacing;
    const totalH=Math.max(spacing*2, (tnodes.length-1)*spacing);
    const topY=totalH/2;

    // Pillar Header
    const hsp=new THREE.Sprite(new THREE.SpriteMaterial({map:hdrTex(tier.toUpperCase(),`PILLAR ${pi+1} · ${tnodes.length} FILES`,hex),transparent:true,depthTest:false}));
    hsp.position.set(cx, topY+60, 0);
    hsp.scale.set(100, 19, 1);
    GRP.add(hsp);

    // Dashed rail
    const rg=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(cx,topY+14,0),new THREE.Vector3(cx,-topY-14,0)]);
    const rl=new THREE.Line(rg, new THREE.LineDashedMaterial({color:col,dashSize:5,gapSize:5,opacity:.3,transparent:true}));
    rl.computeLineDistances(); GRP.add(rl);

    tnodes.forEach((node,ni)=>{
      const y=tnodes.length>1?topY-ni*spacing:0;
      const z=Math.sin(ni*0.4+pi*1.1)*14;

      // CLEAN SOLID SPHERE NODE (NOT TOO BIG, NICELY PACKED)
      const mat=new THREE.MeshStandardMaterial({
        color: col,
        roughness: 0.35,
        metalness: 0.25,
        emissive: col,
        emissiveIntensity: 0.2
      });
      const mesh=new THREE.Mesh(new THREE.SphereGeometry(3.6, 18, 18), mat);
      mesh.position.set(cx, y, z);
      GRP.add(mesh);

      // Simple clean stroke ring
      const halo=new THREE.Mesh(
        new THREE.RingGeometry(4.8, 6.2, 18),
        new THREE.MeshBasicMaterial({color:col, side:THREE.DoubleSide, transparent:true, opacity:.35})
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

  // ── Build Lines ─────────────────────────────────────────────────────────
  links.forEach(link=>{
    const si=idMap[link.source], ti=idMap[link.target];
    if(si===undefined||ti===undefined)return;
    const from=NODES[si], to=NODES[ti];
    const p0=from.pos, p3=to.pos;
    const dx=p3.x-p0.x, dy=p3.y-p0.y;
    const cpOff=Math.abs(dx)*CFG.curv*0.5;

    const fd={curves:[], lines:[], bases:[], fromIdx:si, toIdx:ti, baseCol:from.color};

    for(let f=0; f<CFG.fibers; f++){
      const angle=(f/CFG.fibers)*Math.PI*2;
      const r=(0.4+Math.random()*0.6)*CFG.spread;
      const oy=Math.cos(angle)*r, oz=Math.sin(angle)*r;
      const phase=Math.random()*Math.PI*2;

      const v1=new THREE.Vector3(p0.x+cpOff, p0.y-dy*0.08+oy, p0.z+oz+12);
      const v2=new THREE.Vector3(p3.x-cpOff, p3.y+dy*0.08+oy, p3.z+oz+12);
      const curve=new THREE.CubicBezierCurve3(p0.clone(), v1, v2, p3.clone());

      const pts=curve.getPoints(36);
      const geo=new THREE.BufferGeometry().setFromPoints(pts);

      const mat=new THREE.LineBasicMaterial({
        color: from.color,
        transparent: true,
        opacity: 0.38,
        depthWrite: false
      });
      const line=new THREE.Line(geo, mat);
      GRP.add(line);

      fd.curves.push(curve);
      fd.lines.push(line);
      fd.bases.push({ v1base:v1.clone(), v2base:v2.clone(), oy, oz, phase });
    }
    from.out.push(fd); to.in.push(fd);
    FIBERS.push(fd);
  });

  buildPulse();

  // Update Stats
  document.getElementById('s-p').textContent=tierSet.length;
  document.getElementById('s-n').textContent=nodes.length;
  document.getElementById('s-l').textContent=links.length;
  document.getElementById('s-f').textContent=(links.length*CFG.fibers).toLocaleString();

  buildPillarList(tierSet, tierMap, startX, colW);

  const midX=(startX+(pCount-1)*colW)/2;
  controls.target.set(midX, 0, 0);
  camera.position.set(midX-600, 300, 1000);
}

// ════════ PULSE DATA PACKETS ════════
function buildPulse(){
  if(PULSE){GRP.remove(PULSE);PULSE.geometry.dispose();PULSE.material.dispose();}
  if(!FIBERS.length)return;
  const COUNT=Math.min(1500, FIBERS.length*CFG.fibers|0);
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
    pSpd[i]=0.002+Math.random()*0.005;
    const c=new THREE.Color(FIBERS[fi].baseCol);
    pCol[i*3]=c.r; pCol[i*3+1]=c.g; pCol[i*3+2]=c.b;
    const pt=FIBERS[fi].curves[ci].getPoint(pProg[i]);
    pPos[i*3]=pt.x; pPos[i*3+1]=pt.y; pPos[i*3+2]=pt.z;
  }

  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pPos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(pCol,3));
  PULSE=new THREE.Points(geo, new THREE.PointsMaterial({
    size: 5.0,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    map: glowTex('#38bdf8'),
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

      const phase1 = t * 0.001 * spd + fi * 0.15 + ci * 0.3 + b.phase;
      const phase2 = t * 0.0014 * spd + fi * 0.10 + ci * 0.4 + b.phase + 1.2;

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

// ════════ RAYCASTING & CLICK / DOUBLE-CLICK ZOOM TO ANY SPOT ════════
const RC = new THREE.Raycaster();
const MV = new THREE.Vector2(-9, -9);
const TT = document.getElementById('tt');

window.addEventListener('mousemove', e => {
  MV.x = (e.clientX/innerWidth)*2 - 1;
  MV.y = -(e.clientY/innerHeight)*2 + 1;
  TT.style.left = e.clientX + 'px';
  TT.style.top  = e.clientY + 'px';
});

// Single-click selects node & smoothly focuses on it
window.addEventListener('click', e => {
  if(e.target.closest('.panel') || e.target.closest('#bar') || e.target.closest('#dock')) return;
  RC.setFromCamera(MV, camera);
  const hits = RC.intersectObjects(NODES.map(o => o.mesh));
  if(hits.length){
    const targetObj = hits[0].object.userData.n;
    selNode(targetObj);
    // Smoothly center orbit target to clicked node
    new TWEEN.Tween(controls.target)
      .to({x: targetObj.pos.x, y: targetObj.pos.y, z: targetObj.pos.z}, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  } else {
    clearSel();
  }
});

// DOUBLE-CLICK ANYWHERE TO ZOOM RIGHT INTO THAT PARTICULAR SPOT IN 3D SPACE
window.addEventListener('dblclick', e => {
  if(e.target.closest('.panel') || e.target.closest('#bar') || e.target.closest('#dock')) return;
  RC.setFromCamera(MV, camera);
  const nodeHits = RC.intersectObjects(NODES.map(o => o.mesh));
  
  let targetPoint;
  if(nodeHits.length > 0){
    targetPoint = nodeHits[0].point;
  } else {
    // Intersect invisible 3D plane at mouse position
    invisiblePlane.quaternion.copy(camera.quaternion);
    const planeHits = RC.intersectObject(invisiblePlane);
    if(planeHits.length > 0){
      targetPoint = planeHits[0].point;
    }
  }

  if(targetPoint){
    // Move OrbitControls target to clicked point
    new TWEEN.Tween(controls.target)
      .to({x: targetPoint.x, y: targetPoint.y, z: targetPoint.z}, 600)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();

    // Zoom camera right in front of that spot
    const camDirection = new THREE.Vector3().subVectors(camera.position, controls.target).normalize();
    const newCamPos = new THREE.Vector3().addVectors(targetPoint, camDirection.multiplyScalar(120));

    new TWEEN.Tween(camera.position)
      .to({x: newCamPos.x, y: newCamPos.y, z: newCamPos.z}, 600)
      .easing(TWEEN.Easing.Cubic.Out)
      .start();
  }
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

// ════════ SELECTION & CLOSE INSPECTION ZOOM ════════
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
    fd.lines.forEach(ln => { 
      ln.material.opacity = act ? 0.88 : 0.04; 
      ln.material.color.setHex(act ? (fd.fromIdx === NODES.indexOf(obj) ? 0x38bdf8 : 0xfb7185) : 0x1e293b); 
    });
  });

  NODES.forEach(n => {
    const dir = obj.out.some(fd => fd.toIdx===NODES.indexOf(n)) || obj.in.some(fd => fd.fromIdx===NODES.indexOf(n));
    if(n === obj){ n.mesh.scale.set(2.4,2.4,2.4); n.mesh.material.emissiveIntensity=0.8; n.halo.material.color.setHex(0xf43f5e); n.halo.scale.set(2.0,2.0,2.0); }
    else if(dir){ n.mesh.scale.set(1.5,1.5,1.5); n.mesh.material.emissiveIntensity=0.5; n.halo.scale.set(1.4,1.4,1.4); n.halo.material.color.setHex(0x38bdf8); }
    else { n.mesh.scale.set(0.6,0.6,0.6); n.mesh.material.emissiveIntensity=0.05; n.halo.scale.set(0.6,0.6,0.6); n.halo.material.color.setHex(0x334155); }
  });
}

function zoomToSelected(){
  if(!SEL) return;
  // Zoom camera directly right in front of the selected node position!
  new TWEEN.Tween(controls.target)
    .to({x: SEL.pos.x, y: SEL.pos.y, z: SEL.pos.z}, 700)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();

  new TWEEN.Tween(camera.position)
    .to({x: SEL.pos.x - 100, y: SEL.pos.y + 30, z: SEL.pos.z + 160}, 700)
    .easing(TWEEN.Easing.Cubic.Out)
    .start();
}

function clearSel(){
  SEL = null;
  document.getElementById('rp').classList.remove('open');
  FIBERS.forEach(fd => fd.lines.forEach(ln => { ln.material.opacity = 0.38; ln.material.color.setHex(fd.baseCol); }));
  NODES.forEach(n => { n.mesh.scale.set(1,1,1); n.mesh.material.emissiveIntensity = 0.2; n.halo.scale.set(1,1,1); n.halo.material.color.setHex(n.color); });
}

function pulseSel(){ if(!SEL) return; new TWEEN.Tween(SEL.mesh.scale).to({x:3.8,y:3.8,z:3.8},140).yoyo(true).repeat(1).easing(TWEEN.Easing.Quadratic.Out).start(); }

// ════════ UI & VIEW HELPERS ════════
function togglePanel(id){ document.getElementById(id).classList.toggle('open'); }
function openPanel(id){ document.getElementById(id).classList.add('open'); }

function setView(v){
  const tx = controls.target.x;
  let p;
  if(v==='iso')      p = {x: tx-600, y: 300, z: 1000};
  else if(v==='side')p = {x: tx-1000, y: 0, z: 0};
  else               p = {x: tx, y: 1200, z: 1};

  new TWEEN.Tween(camera.position).to(p, 800).easing(TWEEN.Easing.Cubic.Out).start();
  new TWEEN.Tween(controls.target).to({x: tx, y: 0, z: 0}, 800).easing(TWEEN.Easing.Cubic.Out).start();
}

function togglePause(){ CFG.paused=!CFG.paused; document.getElementById('i-pp').className = CFG.paused ? 'fa-solid fa-play' : 'fa-solid fa-pause'; }
function toggleRot(){ CFG.autoRot=!CFG.autoRot; controls.autoRotate=CFG.autoRot; document.getElementById('btn-rot').classList.toggle('act', CFG.autoRot); }
function toggleLabels(){ CFG.showLabels=!CFG.showLabels; NODES.forEach(n => n.label.visible=CFG.showLabels); document.getElementById('btn-lbl').classList.toggle('act', CFG.showLabels); }

function doTrace(){
  const tiers = [...new Set(NODES.map(n=>n.node.tier))].sort((a,b)=>(TIER_ORDER.indexOf(a)<0?99:TIER_ORDER.indexOf(a))-(TIER_ORDER.indexOf(b)<0?99:TIER_ORDER.indexOf(b)));
  tiers.forEach((t,i)=>{
    setTimeout(()=>{ NODES.filter(n=>n.node.tier===t).forEach(o=>new TWEEN.Tween(o.mesh.scale).to({x:2.5,y:2.5,z:2.5},160).yoyo(true).repeat(1).easing(TWEEN.Easing.Quadratic.Out).start()); }, i*180);
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
    d.onclick = () => {
      new TWEEN.Tween(controls.target).to({x:cx, y:0, z:0}, 550).easing(TWEEN.Easing.Cubic.Out).start();
    };
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
    animateLineWave(t);
    animatePulse();
    NODES.forEach((o,i) => {
      if(o !== SEL){
        o.halo.rotation.z += 0.008;
      }
    });
  }

  hoverTest();
  renderer.render(scene, camera);

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

    print(f"Successfully generated visualizer index.html with compact spacing & double-click zoom ({os.path.getsize(out_file):,} bytes)")

if __name__ == "__main__":
    build_visualizer()
