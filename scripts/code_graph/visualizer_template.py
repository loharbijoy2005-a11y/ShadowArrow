# -*- coding: utf-8 -*-
"""
HTML template for the codebase dependency graph visualization and 3D Neural Network Visualizer.
Uses Vis.js Network library, Tailwind CSS, Three.js, UnrealBloomPass, and OrbitControls.
High-density cinematic ML architecture visualization with hundreds of bundled Bezier splines.
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Knowledge Graph & Cinematic 3D Neural Visualizer</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:ital,wght@0,300;0,400;0,600;0,800;1,400&family=Orbitron:wght@400;600;800;900&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

    <!-- Vis.js Network for 2D Codebase Graph -->
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>

    <!-- Three.js r128 Core & Controls -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>

    <!-- Three.js Postprocessing: Unreal Bloom Pass & Shaders -->
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/CopyShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/shaders/LuminosityHighPassShader.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/EffectComposer.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/RenderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/ShaderPass.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/postprocessing/UnrealBloomPass.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js"></script>
    
    <style>
        :root {
            --bg-pitch: #030308;
            --laser-cyan: #00e5ff;
            --electric-mint: #00ffaa;
            --hot-magenta: #ff0055;
            --hyper-violet: #9d4edd;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #080c14;
            color: #e2e8f0;
        }
        #network-container {
            width: 100%;
            height: 100%;
            background-color: #080c14;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.5);
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.4);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(99, 102, 241, 0.4);
        }

        /* 3D Neural View Styling */
        #neural-webgl-canvas {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            cursor: grab;
            background: radial-gradient(circle at center, #070914 0%, #030308 100%);
        }
        #neural-webgl-canvas:active {
            cursor: grabbing;
        }

        .hud-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            pointer-events: none;
        }

        .interactive {
            pointer-events: auto;
        }

        .glass-deck {
            background: rgba(8, 11, 20, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: 8px;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8), inset 0 0 15px rgba(0, 229, 255, 0.05);
        }

        .status-pulse {
            width: 7px;
            height: 7px;
            background: var(--electric-mint);
            border-radius: 50%;
            box-shadow: 0 0 10px var(--electric-mint);
            animation: blinkStatus 1.2s infinite ease-in-out;
        }

        @keyframes blinkStatus {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.85); }
        }

        .custom-range {
            -webkit-appearance: none;
            appearance: none;
            width: 100%;
            height: 3px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.12);
            outline: none;
        }

        .custom-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 13px;
            height: 13px;
            border-radius: 50%;
            background: var(--laser-cyan);
            cursor: pointer;
            box-shadow: 0 0 10px var(--laser-cyan);
            transition: 0.15s;
        }

        .custom-range::-webkit-slider-thumb:hover {
            transform: scale(1.3);
            box-shadow: 0 0 16px var(--laser-cyan);
        }

        #neural-hover-tooltip {
            position: absolute;
            z-index: 100;
            pointer-events: none;
            display: none;
            padding: 10px 14px;
            background: rgba(4, 6, 14, 0.95);
            border: 1px solid var(--laser-cyan);
            border-radius: 6px;
            box-shadow: 0 0 25px rgba(0, 229, 255, 0.4), inset 0 0 10px rgba(0, 229, 255, 0.1);
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            color: #fff;
            backdrop-filter: blur(12px);
            transform: translate(16px, 16px);
        }

        #neural-hover-tooltip .node-title {
            font-family: 'Orbitron', monospace;
            font-size: 11px;
            font-weight: 800;
            color: var(--laser-cyan);
            letter-spacing: 1px;
            margin-bottom: 4px;
        }

        .btn-fire-pulse {
            background: linear-gradient(135deg, rgba(0, 229, 255, 0.9), rgba(255, 0, 85, 0.85));
            border: 1px solid #00e5ff;
            color: #fff;
            font-family: 'Orbitron', monospace;
            font-weight: 900;
            letter-spacing: 1px;
            text-transform: uppercase;
            box-shadow: 0 0 20px rgba(0, 229, 255, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3);
            transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-fire-pulse:hover {
            background: linear-gradient(135deg, #00e5ff, #ff0055);
            box-shadow: 0 0 35px rgba(0, 229, 255, 0.85), 0 0 20px rgba(255, 0, 85, 0.6);
            transform: translateY(-2px);
        }
    </style>
</head>
<body class="h-full overflow-hidden flex flex-col relative">
    <!-- Header -->
    <header class="glass-panel z-50 px-6 py-3 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/30">G</div>
            <div>
                <h1 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
                    Codebase Knowledge Graph
                    <span id="view-mode-indicator" class="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-500/30">2D Graph View</span>
                </h1>
                <p class="text-xs text-slate-400">Interactive dependency visualizer, AST context search & 3D Neural Flow</p>
            </div>
        </div>
        <div class="flex gap-4 items-center text-sm text-slate-400">
            <div class="hidden sm:block">Files: <span id="stat-files" class="font-semibold text-indigo-400">0</span></div>
            <div class="hidden sm:block h-4 w-px bg-slate-800"></div>
            <div class="hidden sm:block">Dependencies: <span id="stat-deps" class="font-semibold text-indigo-400">0</span></div>
            <div class="hidden sm:block h-4 w-px bg-slate-800"></div>
            <div class="hidden sm:block">Languages: <span id="stat-langs" class="font-semibold text-indigo-400">0</span></div>
            
            <!-- View Toggle Button (Switches between 2D Codebase Graph & 3D Neural Flow) -->
            <button id="view-toggle-btn" title="Toggle 2D Graph / 3D Neural Flow" class="ml-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-lg border border-indigo-400/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 text-xs font-semibold font-mono" aria-label="Toggle View">
                <!-- Flow icon -->
                <svg id="toggle-icon-flow" class="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
                <!-- Graph icon - Hidden by default -->
                <svg id="toggle-icon-graph" class="w-4 h-4 text-white hidden" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2v-9a2 2 0 00-2-2H8a2 2 0 00-2 2v9a2 2 0 002 2z"></path>
                </svg>
                <span id="toggle-btn-label">3D Neural Flow</span>
            </button>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
        
        <!-- 2D Network Vis.js Container -->
        <div id="network-container" class="absolute inset-0"></div>

        <!-- 3D Neural Flow Container (Cinematic Density & Bloom) -->
        <div id="architecture-container" class="absolute inset-0 z-40 bg-[#030308] hidden overflow-hidden select-none">
            <!-- WebGL Canvas for Three.js -->
            <div id="neural-webgl-canvas"></div>

            <!-- Floating Holographic Tooltip -->
            <div id="neural-hover-tooltip">
                <div class="node-title" id="neural-tt-title">TENSOR PIN [L2:18]</div>
                <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Layer:</span>
                    <span id="neural-tt-layer" class="text-cyan-300 font-semibold">HL 2 (Feldkoppelung)</span>
                </div>
                <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Scalar a:</span>
                    <span id="neural-tt-act" class="text-emerald-400 font-bold font-mono">0.8942</span>
                </div>
                <div class="flex justify-between gap-4">
                    <span class="text-slate-400">Weight Σ:</span>
                    <span id="neural-tt-weight" class="text-pink-400 font-bold font-mono">+2.148</span>
                </div>
                <div class="text-[9px] text-slate-500 mt-1.5 border-t border-slate-800 pt-1">Click to trace Bezier pathways</div>
            </div>

            <!-- HUD Overlay Layer -->
            <div class="hud-overlay flex flex-col justify-between p-4 sm:p-6">
                
                <!-- Top Status Banner & Config Button -->
                <div class="flex justify-between items-center w-full">
                    <button id="neural-config-toggle-btn" class="interactive glass-deck px-3.5 py-1.5 rounded-lg text-xs font-semibold text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-2 transition cursor-pointer font-mono">
                        <i class="fa-solid fa-sliders"></i>
                        <span>Topology & Controls</span>
                    </button>

                    <!-- Top Telemetry Stats -->
                    <div class="hidden sm:flex items-center gap-2.5 interactive font-mono text-xs">
                        <div class="glass-deck px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-800">
                            <span class="status-pulse"></span>
                            <span class="text-slate-400 uppercase text-[10px]">Arch:</span>
                            <span id="neural-arch-badge" class="text-cyan-300 font-bold">TRANSFORMER</span>
                        </div>
                        <div class="glass-deck px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-800">
                            <i class="fa-solid fa-circle-nodes text-cyan-400"></i>
                            <span class="text-slate-400 uppercase text-[10px]">Pins:</span>
                            <span id="neural-stat-nodes" class="text-white font-bold">232 PINS</span>
                        </div>
                        <div class="glass-deck px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-800">
                            <i class="fa-solid fa-bolt text-pink-400"></i>
                            <span class="text-slate-400 uppercase text-[10px]">Splines:</span>
                            <span id="neural-stat-edges" class="text-pink-400 font-bold">1,840 PATHS</span>
                        </div>
                        <div class="glass-deck px-3 py-1.5 rounded-lg flex items-center gap-2 border border-slate-800">
                            <i class="fa-solid fa-gauge-high text-amber-400"></i>
                            <span class="text-slate-400 uppercase text-[10px]">FPS:</span>
                            <span id="neural-stat-fps" class="text-amber-400 font-bold">60.0</span>
                        </div>
                    </div>
                </div>

                <!-- Left Sliding Drawer: Architecture & Parameter Config (Hidden off-screen by default) -->
                <aside id="neural-config-panel" class="absolute left-6 top-20 bottom-24 w-84 glass-deck rounded-xl flex flex-col p-5 gap-4 z-20 transition-transform duration-300 ease-in-out -translate-x-[450px] interactive border border-cyan-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-y-auto">
                    <div class="flex items-center justify-between pb-3 border-b border-slate-800">
                        <span class="text-xs font-bold uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2">
                            <i class="fa-solid fa-sliders"></i> Architecture Config
                        </span>
                        <span id="neural-close-config-btn" class="text-slate-400 hover:text-white cursor-pointer text-xs font-mono">✕ Close</span>
                    </div>

                    <div>
                        <label class="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block mb-2">Topology Preset</label>
                        <div class="grid grid-cols-2 gap-2">
                            <button class="neural-preset-btn bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-cyan-900/60 transition flex items-center justify-center gap-1.5 active" id="btn-preset-transformer" onclick="loadNeuralArchitecture('transformer')">
                                <i class="fa-solid fa-network-wired text-[10px]"></i> Transformer
                            </button>
                            <button class="neural-preset-btn bg-slate-900 border border-slate-700/80 text-slate-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5" id="btn-preset-mlp" onclick="loadNeuralArchitecture('mlp')">
                                <i class="fa-solid fa-diagram-project text-[10px]"></i> Dense MLP
                            </button>
                            <button class="neural-preset-btn bg-slate-900 border border-slate-700/80 text-slate-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5" id="btn-preset-cnn" onclick="loadNeuralArchitecture('cnn')">
                                <i class="fa-solid fa-eye text-[10px]"></i> Vision CNN
                            </button>
                            <button class="neural-preset-btn bg-slate-900 border border-slate-700/80 text-slate-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5" id="btn-preset-recurrent" onclick="loadNeuralArchitecture('recurrent')">
                                <i class="fa-solid fa-repeat text-[10px]"></i> Recurrent / LSTM
                            </button>
                        </div>
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs text-slate-300 font-mono">
                            <span>Signal Stream Velocity</span>
                            <span id="neural-val-speed" class="text-cyan-400 font-bold">1.2x</span>
                        </div>
                        <input type="range" class="custom-range" id="neural-slider-speed" min="0.2" max="3.5" step="0.1" value="1.2" oninput="updateNeuralSpeed(this.value)">
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs text-slate-300 font-mono">
                            <span>Pulse Packet Density</span>
                            <span id="neural-val-density" class="text-cyan-400 font-bold">2400</span>
                        </div>
                        <input type="range" class="custom-range" id="neural-slider-density" min="500" max="5000" step="100" value="2400" oninput="updateNeuralDensity(this.value)">
                    </div>

                    <div class="flex flex-col gap-1.5">
                        <div class="flex justify-between text-xs text-slate-300 font-mono">
                            <span>Bezier Flaring Curvature</span>
                            <span id="neural-val-curvature" class="text-cyan-400 font-bold">0.75</span>
                        </div>
                        <input type="range" class="custom-range" id="neural-slider-curvature" min="0.2" max="1.8" step="0.05" value="0.75" oninput="updateNeuralCurvature(this.value)">
                    </div>

                    <div class="border-t border-slate-800 pt-3">
                        <div class="flex justify-between items-center mb-2 font-mono">
                            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Columns</span>
                            <span id="neural-layer-count-badge" class="text-[10px] text-cyan-400">6 Layers</span>
                        </div>
                        <div class="flex flex-col gap-2 overflow-y-auto max-h-40" id="neural-layer-cards-container">
                            <!-- Injected layer cards -->
                        </div>
                    </div>
                </aside>

                <!-- Right Sliding Drawer: Node & Tensor Inspector (HIDDEN BY DEFAULT, OPENS ON NODE CLICK) -->
                <aside id="neural-node-inspector" class="absolute right-6 top-20 bottom-24 w-84 sm:w-96 glass-deck rounded-xl flex flex-col z-20 transition-transform duration-300 ease-in-out translate-x-[460px] interactive border border-cyan-500/30 shadow-[0_16px_40px_rgba(0,0,0,0.9)] overflow-hidden">
                    <div class="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
                        <span class="text-xs font-bold uppercase tracking-widest font-mono text-cyan-400 flex items-center gap-2">
                            <i class="fa-solid fa-microchip"></i> Tensor Node Inspector
                        </span>
                        <span id="neural-close-inspector-btn" class="text-slate-400 hover:text-white cursor-pointer text-xs font-mono">✕ Close</span>
                    </div>

                    <div class="flex-1 overflow-y-auto p-5 space-y-4 font-mono text-xs">
                        <div>
                            <div class="flex items-center justify-between">
                                <span id="neural-insp-badge" class="px-2 py-0.5 rounded bg-pink-950/80 border border-pink-500/50 text-pink-300 text-[10px] font-bold uppercase">L2 : 18</span>
                                <span id="neural-insp-act-func" class="text-cyan-300 text-xs">GELU / Softmax</span>
                            </div>
                            <h2 id="neural-insp-node-id" class="text-sm font-bold text-white mt-1 font-sans">HL 2 (Feldkoppelung) — Pin #18</h2>
                            <p id="neural-insp-layer-type" class="text-[11px] text-slate-400 font-sans mt-0.5">Multi-Head Cross Attention Core</p>
                        </div>

                        <div class="grid grid-cols-3 gap-2 border-y border-slate-800 py-3 text-center">
                            <div class="bg-slate-950/80 p-2 rounded border border-slate-800">
                                <div class="text-[9px] text-slate-400 uppercase">Scalar a</div>
                                <div id="neural-insp-act-val" class="text-emerald-400 font-bold mt-0.5">0.8942</div>
                            </div>
                            <div class="bg-slate-950/80 p-2 rounded border border-slate-800">
                                <div class="text-[9px] text-slate-400 uppercase">Bias b</div>
                                <div id="neural-insp-bias-val" class="text-slate-200 font-bold mt-0.5">+0.0512</div>
                            </div>
                            <div class="bg-slate-950/80 p-2 rounded border border-slate-800">
                                <div class="text-[9px] text-slate-400 uppercase">∂L/∂w</div>
                                <div id="neural-insp-grad-val" class="text-amber-400 font-bold mt-0.5">0.00318</div>
                            </div>
                        </div>

                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-sans">Real-time Activation Waveform</span>
                            <canvas id="neural-activation-canvas" class="w-full h-11 bg-slate-950 rounded border border-slate-800 shadow-inner" width="300" height="44"></canvas>
                        </div>

                        <div>
                            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-sans">Tensor Memory Slice (Float32[1, 16])</span>
                            <div id="neural-insp-tensor-box" class="bg-slate-950 border border-slate-800 rounded p-2.5 text-[10px] text-emerald-400 break-all leading-relaxed max-h-24 overflow-y-auto">
[+0.894, -0.124, +0.982, +0.315, +0.641, -0.420, +0.871, +0.052, -0.718, +0.941]
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 pt-2 font-sans">
                            <button class="bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5" onclick="stimulateSelectedNeuralNode()">
                                <i class="fa-solid fa-bolt text-cyan-400"></i> Stimulate
                            </button>
                            <button class="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5" onclick="isolateSelectedNeuralNode()">
                                <i class="fa-solid fa-crosshairs text-pink-400"></i> Isolate & Zoom
                            </button>
                        </div>
                    </div>
                </aside>

                <!-- Bottom Floating Console Dock -->
                <div class="flex justify-center items-center w-full">
                    <div class="glass-deck px-4 py-2 rounded-xl flex items-center gap-3 interactive border border-cyan-500/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                        <button class="btn-fire-pulse px-4 py-2 rounded-lg text-xs flex items-center gap-2 cursor-pointer active:scale-95" id="btn-forward-pass" onclick="triggerNeuralForwardPass()">
                            <i class="fa-solid fa-forward-fast"></i>
                            <span>TRIGGER FORWARD PASS</span>
                        </button>

                        <div class="h-5 w-px bg-slate-800"></div>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" id="btn-play-pause" title="Play/Pause Signal Pulses" onclick="toggleNeuralPlayPause()">
                            <i class="fa-solid fa-pause text-xs" id="icon-play-pause"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" title="Cinematic Isometric 3D View" onclick="resetNeuralCamera('iso')">
                            <i class="fa-solid fa-cube text-xs"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" title="Side Column Projection" onclick="resetNeuralCamera('side')">
                            <i class="fa-solid fa-table-columns text-xs"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" title="Top-Down Flow" onclick="resetNeuralCamera('top')">
                            <i class="fa-solid fa-arrows-up-down text-xs"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" id="btn-toggle-audio" title="Synthesizer Sound Effects" onclick="toggleNeuralAudio()">
                            <i class="fa-solid fa-volume-high text-xs" id="icon-neural-audio"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" id="btn-auto-rotate" title="Auto Orbit Camera" onclick="toggleNeuralAutoRotate()">
                            <i class="fa-solid fa-arrows-spin text-xs"></i>
                        </button>

                        <button class="p-2 text-slate-300 hover:text-cyan-300 hover:bg-slate-800/80 rounded-lg transition" title="Randomize Synaptic Weights" onclick="randomizeNeuralWeights()">
                            <i class="fa-solid fa-shuffle text-xs"></i>
                        </button>
                    </div>
                </div>

            </div>
        </div>

        <!-- Left Controls Panel for 2D Graph -->
        <div id="left-controls-panel" class="absolute left-2 top-2 bottom-2 w-[14rem] sm:left-6 sm:top-6 sm:bottom-6 sm:w-80 flex flex-col gap-3 sm:gap-4 pointer-events-none z-10 transition-all duration-300 sm:translate-x-0 -translate-x-[120%]">
            
            <button id="mobile-panel-toggle" class="absolute -right-8 top-0 pointer-events-auto sm:hidden bg-slate-800 text-slate-300 border border-slate-700 p-1.5 rounded shadow-lg text-xs">
                🔍
            </button>

            <!-- Search & Filter Card -->
            <div class="glass-panel rounded-xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 pointer-events-auto shadow-2xl overflow-y-auto max-h-full">
                <div class="pb-2 border-b border-slate-800">
                    <label class="text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Browse Files & Folders</label>
                    <select id="file-browser-dropdown" class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                        <option value="">-- Select a file --</option>
                    </select>
                </div>

                <div>
                    <label class="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">Search Node</label>
                    <div class="mt-1 relative rounded-md shadow-sm">
                        <input type="text" id="search-input" 
                               class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                               placeholder="Type file name or symbol...">
                    </div>
                </div>

                <div>
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Filter Clusters</label>
                    <div id="cluster-filters" class="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1"></div>
                </div>

                <div class="border-t border-slate-800 pt-3">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Analysis Modes</label>
                    <div class="flex flex-col gap-2">
                        <div>
                            <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Coloring Mode</span>
                            <select id="color-mode-select" class="w-full mt-1 bg-slate-900 border border-slate-700 rounded py-1.5 px-2 text-xs text-white focus:outline-none">
                                <option value="cluster">Cluster Categories</option>
                                <option value="hotspot">Git Commit Hotspots</option>
                                <option value="lang">Programming Language</option>
                            </select>
                        </div>
                        <div class="flex items-center gap-2 mt-1">
                            <input type="checkbox" id="orphan-toggle" 
                                   class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                            <label for="orphan-toggle" class="text-xs text-slate-300 cursor-pointer">Highlight Dead/Orphan Files</label>
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-800 pt-3">
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Dependency Path Tracer</label>
                    <div class="flex flex-col gap-2">
                        <div class="flex items-center gap-1">
                            <input type="text" id="path-start" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-[11px] text-white placeholder-slate-500" placeholder="Start File Path" readonly>
                            <button id="set-start-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-1 rounded shrink-0 transition" title="Set to selected node">Set</button>
                        </div>
                        <div class="flex items-center gap-1">
                            <input type="text" id="path-end" class="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-[11px] text-white placeholder-slate-500" placeholder="End File Path" readonly>
                            <button id="set-end-btn" class="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] px-2 py-1 rounded shrink-0 transition" title="Set to selected node">Set</button>
                        </div>
                        <div class="flex gap-2 mt-1">
                            <button id="trace-path-btn" class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-1.5 rounded transition">Trace Path</button>
                            <button id="clear-trace-btn" class="bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs px-2 py-1.5 rounded transition">Clear</button>
                        </div>
                    </div>
                </div>

                <div class="border-t border-slate-800 pt-3 flex flex-col gap-2">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <input type="checkbox" id="physics-toggle" checked 
                                   class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                            <label for="physics-toggle" class="text-xs text-slate-300 cursor-pointer">Enable Physics</label>
                        </div>
                        <button id="reset-btn" class="text-xs bg-slate-850 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 font-medium px-2 py-1 rounded transition-colors">
                            Reset View
                        </button>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="particles-toggle" checked 
                               class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4">
                        <label for="particles-toggle" class="text-xs text-slate-300 cursor-pointer">Show Glow Particles</label>
                    </div>
                </div>
            </div>

            <!-- Language Legend -->
            <div class="glass-panel rounded-xl p-4 pointer-events-auto shadow-2xl mt-auto">
                <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Languages</label>
                <div id="lang-legend" class="grid grid-cols-2 gap-2 text-xs"></div>
            </div>
        </div>

        <!-- Right Detail Panel (Sidebar) for 2D Graph -->
        <div id="inspector-sidebar" class="absolute right-6 top-6 bottom-6 w-96 glass-panel rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 border border-slate-800/80 transition-transform duration-300 ease-in-out translate-x-[500px]">
            <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">Node Inspector</span>
                <span id="close-inspector-btn" class="text-slate-400 hover:text-white cursor-pointer text-xs font-medium">Clear Selection</span>
            </div>
            
            <div id="inspector-content" class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <div id="inspector-default" class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                    </svg>
                    <p class="font-medium text-sm text-slate-400">No node selected</p>
                    <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Click a file in the network to inspect its exports, classes, imports, and dependencies.</p>
                </div>

                <div id="inspector-details" class="hidden space-y-5">
                    <div>
                        <div class="flex items-center justify-between gap-2">
                            <span id="node-badge" class="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider">UNKNOWN</span>
                            <span id="node-lang" class="text-xs font-semibold text-slate-400">JavaScript</span>
                        </div>
                        <h2 id="node-name" class="text-lg font-bold text-white mt-1 break-all">index.js</h2>
                        <p id="node-path" class="text-xs text-slate-400 font-mono mt-1 break-all cursor-pointer hover:text-indigo-400 transition-colors" title="Click to copy path"></p>
                    </div>

                    <div class="grid grid-cols-3 gap-2 text-xs border-y border-slate-800 py-3">
                        <div class="bg-slate-900/50 p-2 text-center rounded border border-slate-800/40">
                            <div class="text-slate-400 font-medium text-[10px] uppercase truncate">Functions</div>
                            <div id="stat-node-funcs" class="text-xs font-bold text-white mt-0.5">0</div>
                        </div>
                        <div class="bg-slate-900/50 p-2 text-center rounded border border-slate-800/40">
                            <div class="text-slate-400 font-medium text-[10px] uppercase truncate">Classes</div>
                            <div id="stat-node-classes" class="text-xs font-bold text-white mt-0.5">0</div>
                        </div>
                        <div class="bg-slate-900/50 p-2 text-center rounded border border-slate-800/40">
                            <div class="text-slate-400 font-medium text-[10px] uppercase truncate">Commits</div>
                            <div id="stat-node-churn" class="text-xs font-bold text-white mt-0.5">0</div>
                        </div>
                    </div>

                    <div id="section-classes" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Classes & Structs</h3>
                        <div id="node-classes" class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto"></div>
                    </div>

                    <div id="section-funcs" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Functions</h3>
                        <div id="node-funcs" class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1"></div>
                    </div>

                    <div id="section-imports" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imported Packages</h3>
                        <div id="node-imports" class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1"></div>
                    </div>

                    <div>
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Depends On (Outgoing)</h3>
                        <div id="node-dependencies" class="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1"></div>
                    </div>

                    <div>
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required By (Incoming)</h3>
                        <div id="node-dependents" class="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1"></div>
                    </div>

                    <div id="section-code" class="hidden border-t border-slate-800 pt-3">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Code Preview</h3>
                        <pre id="node-code" class="bg-slate-950/90 border border-slate-800 rounded p-3 text-[10px] font-mono text-slate-300 overflow-auto max-h-60 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800"></pre>
                    </div>
                </div>
            </div>
            
            <div id="sidebar-footer" class="px-5 py-3 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-500 text-center">
                Press Esc to clear selection. Hold click to drag.
            </div>
        </div>
    </div>

    <script type="text/javascript">
        const graphData = /* {{GRAPH_DATA}} */;
    </script>

    <!-- Main Logic Script: 2D Knowledge Graph + 3D Neural Engine -->
    <script type="text/javascript">
        // --- 1. INITIALIZE 2D VIS.JS GRAPH ---
        let network = null;
        let nodesDataset = new vis.DataSet([]);
        let edgesDataset = new vis.DataSet([]);
        let allNodes = [];
        let allEdges = [];
        let clusterFilters = {};

        let fileCount = 0;
        let depCount = 0;
        let langSet = new Set();
        let clusterSet = new Set();
        let langCount = {};

        if (graphData && graphData.nodes) {
            allNodes = graphData.nodes.map(n => ({ ...n }));
            allEdges = graphData.edges.map(e => ({ ...e }));
            
            fileCount = allNodes.length;
            depCount = allEdges.length;

            allNodes.forEach(n => {
                if (n.language) {
                    langSet.add(n.language);
                    langCount[n.language] = (langCount[n.language] || 0) + 1;
                }
                if (n.group) clusterSet.add(n.group);
            });

            document.getElementById('stat-files').innerText = fileCount;
            document.getElementById('stat-deps').innerText = depCount;
            document.getElementById('stat-langs').innerText = langSet.size;

            nodesDataset.add(allNodes);
            edgesDataset.add(allEdges);
        }

        const container = document.getElementById('network-container');
        const data = { nodes: nodesDataset, edges: edgesDataset };
        const options = {
            nodes: {
                borderWidth: 2,
                shadow: true,
                font: { color: '#f8fafc', face: 'Inter', size: 12 }
            },
            edges: {
                width: 1.5,
                color: { color: 'rgba(99, 102, 241, 0.4)', highlight: '#818cf8', hover: '#a5b4fc' },
                smooth: { type: 'continuous', roundness: 0.5 },
                arrows: { to: { enabled: true, scaleFactor: 0.6 } }
            },
            physics: {
                enabled: true,
                barnesHut: {
                    gravitationalConstant: -3500,
                    centralGravity: 0.35,
                    springLength: 95,
                    springConstant: 0.04,
                    damping: 0.09,
                    avoidOverlap: 0.2
                },
                stabilization: { iterations: 120 }
            },
            interaction: { hover: true, tooltipDelay: 200 }
        };

        if (container && graphData && graphData.nodes) {
            network = new vis.Network(container, data, options);
        }

        // Populate 2D Filter UI
        const clusterContainer = document.getElementById('cluster-filters');
        if (clusterContainer) {
            Array.from(clusterSet).sort().forEach(cluster => {
                clusterFilters[cluster] = true;
                const div = document.createElement('div');
                div.className = 'flex items-center gap-2';
                div.innerHTML = `
                    <input type="checkbox" id="cluster-${cluster}" checked class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer">
                    <label for="cluster-${cluster}" class="text-xs text-slate-300 capitalize cursor-pointer select-none truncate">${cluster}</label>
                `;
                div.querySelector('input').addEventListener('change', (e) => {
                    clusterFilters[cluster] = e.target.checked;
                    applyFilters();
                });
                clusterContainer.appendChild(div);
            });
        }

        const langLegend = document.getElementById('lang-legend');
        if (langLegend) {
            Array.from(langSet).sort().forEach(lang => {
                const div = document.createElement('div');
                div.className = 'flex items-center gap-1.5';
                div.innerHTML = `
                    <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                    <span class="text-slate-300 truncate">${lang} (${langCount[lang] || 0})</span>
                `;
                langLegend.appendChild(div);
            });
        }

        const fileBrowserDropdown = document.getElementById('file-browser-dropdown');
        if (fileBrowserDropdown && allNodes.length > 0) {
            allNodes.slice().sort((a, b) => a.id.localeCompare(b.id)).forEach(n => {
                const opt = document.createElement('option');
                opt.value = n.id;
                opt.innerText = n.id;
                fileBrowserDropdown.appendChild(opt);
            });
            fileBrowserDropdown.addEventListener('change', (e) => {
                if (e.target.value) select2DNode(e.target.value);
            });
        }

        function applyFilters() {
            const query = (document.getElementById('search-input')?.value || '').toLowerCase();
            const filteredNodes = allNodes.filter(n => {
                const matchCluster = clusterFilters[n.group] !== false;
                const matchQuery = !query || n.id.toLowerCase().includes(query) || (n.label && n.label.toLowerCase().includes(query));
                return matchCluster && matchQuery;
            });
            const validIds = new Set(filteredNodes.map(n => n.id));
            const filteredEdges = allEdges.filter(e => validIds.has(e.from) && validIds.has(e.to));
            nodesDataset.clear();
            edgesDataset.clear();
            nodesDataset.add(filteredNodes);
            edgesDataset.add(filteredEdges);
        }

        document.getElementById('search-input')?.addEventListener('input', applyFilters);

        if (network) {
            network.on('click', (params) => {
                if (params.nodes.length > 0) select2DNode(params.nodes[0]);
                else clear2DSelection();
            });
        }

        function select2DNode(nodeId) {
            const node = allNodes.find(n => n.id === nodeId);
            if (!node) return;
            const details = (graphData && graphData.details) ? graphData.details[nodeId] : null;

            document.getElementById('inspector-default').classList.add('hidden');
            document.getElementById('inspector-details').classList.remove('hidden');
            document.getElementById('inspector-sidebar').classList.remove('translate-x-[500px]');

            document.getElementById('node-name').innerText = node.label || nodeId.split('/').pop();
            document.getElementById('node-path').innerText = nodeId;
            document.getElementById('node-lang').innerText = node.language || 'Unknown';
            document.getElementById('node-badge').innerText = node.group || 'GENERAL';

            if (details) {
                document.getElementById('stat-node-funcs').innerText = (details.functions || []).length;
                document.getElementById('stat-node-classes').innerText = (details.classes_structs || []).length;
                document.getElementById('stat-node-churn').innerText = details.commit_count || '1';
            }

            if (network) network.focus(nodeId, { scale: 1.2, animation: { duration: 600 } });
        }

        function clear2DSelection() {
            document.getElementById('inspector-default')?.classList.remove('hidden');
            document.getElementById('inspector-details')?.classList.add('hidden');
            document.getElementById('inspector-sidebar')?.classList.add('translate-x-[500px]');
        }

        document.getElementById('close-inspector-btn')?.addEventListener('click', clear2DSelection);
        document.getElementById('reset-btn')?.addEventListener('click', () => { if (network) network.fit({ animation: true }); });
        document.getElementById('physics-toggle')?.addEventListener('change', (e) => { if (network) network.setOptions({ physics: { enabled: e.target.checked } }); });


        // =========================================================================
        // --- 2. HIGH-DENSITY CINEMATIC 3D NEURAL VISUALIZER ENGINE ---
        // =========================================================================

        class NeuralAudioEngine {
            constructor() {
                this.ctx = null;
                this.enabled = true;
            }
            init() {
                if (!this.ctx) {
                    const AC = window.AudioContext || window.webkitAudioContext;
                    if (AC) this.ctx = new AC();
                }
                if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
            }
            playBlip(freq = 600, duration = 0.08, type = 'sine') {
                if (!this.enabled) return;
                this.init();
                if (!this.ctx) return;
                try {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + duration);
                    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
                    osc.connect(gain);
                    gain.connect(this.ctx.destination);
                    osc.start();
                    osc.stop(this.ctx.currentTime + duration);
                } catch(e) {}
            }
            playCascade() {
                if (!this.enabled) return;
                this.init();
                const freqs = [320, 440, 580, 720, 960, 1280];
                freqs.forEach((f, idx) => {
                    setTimeout(() => this.playBlip(f, 0.1, 'triangle'), idx * 55);
                });
            }
        }
        const neuralAudio = new NeuralAudioEngine();

        const NEURAL_ARCHITECTURES = {
            transformer: {
                name: "Transformer Encoder-Decoder",
                layers: [
                    { name: "INPUT [x: 784-DIM]", count: 32, type: "Embedding Stacks", act: "Linear" },
                    { name: "HL 1 (Encoder Stacks)", count: 42, type: "Self-Attention Block", act: "Softmax" },
                    { name: "HL 2 (Feldkoppelung) [GELU]", count: 48, type: "Multi-Head Cross Attention", act: "GELU" },
                    { name: "HL 3 (Cross-Attention)", count: 44, type: "Residual Dense Fusion", act: "LayerNorm" },
                    { name: "HL 4 (Feed-Forward) [FFN]", count: 36, type: "Intermediate Projections", act: "Swish" },
                    { name: "OUTPUT (Antwort Logits)", count: 24, type: "Softmax Class Probabilities", act: "Softmax" }
                ]
            },
            mlp: {
                name: "Deep Multi-Layer Perceptron",
                layers: [
                    { name: "INPUT [x0...x32]", count: 32, type: "Dense Raw Input", act: "Linear" },
                    { name: "HL 1 (Feature Map 64)", count: 44, type: "Dense Linear L1", act: "ReLU" },
                    { name: "HL 2 (Non-linear GELU)", count: 48, type: "Dense Linear L2", act: "GELU" },
                    { name: "HL 3 (Dropout Latent)", count: 40, type: "Dense Linear L3", act: "Swish" },
                    { name: "OUTPUT (y: Prediction)", count: 20, type: "Sigmoid Probability", act: "Sigmoid" }
                ]
            },
            cnn: {
                name: "Vision Feature Extractor",
                layers: [
                    { name: "INPUT [Pixel Tensor]", count: 30, type: "Spatial 2D Channels", act: "Raw" },
                    { name: "HL 1 (Conv2D Stacks)", count: 46, type: "3x3 Kernel Convolutions", act: "ReLU" },
                    { name: "HL 2 (Spatial Pooling)", count: 40, type: "Max-Pooling & Downsample", act: "Max" },
                    { name: "HL 3 (Dense Projections)", count: 36, type: "Flattened Hidden State", act: "GELU" },
                    { name: "OUTPUT (10 Classes)", count: 18, type: "ArgMax Classification", act: "Softmax" }
                ]
            },
            recurrent: {
                name: "LSTM / Recurrent Cell",
                layers: [
                    { name: "INPUT [Seq x_t]", count: 28, type: "Sequential State", act: "Linear" },
                    { name: "HL 1 (Forget Gate f_t)", count: 42, type: "Gating Unit", act: "Sigmoid" },
                    { name: "HL 2 (Candidate State i_t)", count: 48, type: "State Activation", act: "Tanh" },
                    { name: "HL 3 (Cell State C_t)", count: 38, type: "Long-term Memory", act: "Linear" },
                    { name: "OUTPUT [Hidden Output h_t]", count: 22, type: "Recurrent Prediction", act: "Tanh" }
                ]
            }
        };

        let currentNeuralArch = 'transformer';
        let neuralSimRunning = true;
        let neuralSpeed = 1.2;
        let neuralDensity = 2400;
        let neuralCurvature = 0.75;
        let selectedNeuralNode = null;
        let hoveredNeuralNode = null;
        let neuralInitialized = false;

        let neuralScene, neuralCamera, neuralRenderer, neuralControls, neuralComposer, neuralBloomPass;
        let neuralGroup = new THREE.Group();
        let neuralNodes = [];
        let neuralConnections = [];
        let neuralPulseParticles;
        let neuralPulsePositions, neuralPulseColors, neuralPulseProgress, neuralPulseSpeeds, neuralPulseIndices;
        let neuralLayerCols = [];
        let neuralStarField;

        const pinGeo = new THREE.SphereGeometry(2.4, 16, 16);
        const pinHaloGeo = new THREE.RingGeometry(3.2, 4.4, 16);

        function createGlowSprite(colorHex = '#00e5ff') {
            const cv = document.createElement('canvas');
            cv.width = 128; cv.height = 128;
            const ctx = cv.getContext('2d');
            const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.25, colorHex);
            grad.addColorStop(0.65, 'rgba(0, 229, 255, 0.25)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 128, 128);
            return new THREE.CanvasTexture(cv);
        }

        function createHeaderSprite(title, countText) {
            const cv = document.createElement('canvas');
            cv.width = 512; cv.height = 128;
            const ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, 512, 128);
            ctx.fillStyle = 'rgba(8, 14, 28, 0.85)';
            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(10, 20, 492, 88, 8);
            ctx.fill();
            ctx.stroke();
            ctx.fillStyle = '#ff0055';
            ctx.fillRect(10, 20, 24, 4);
            ctx.font = 'bold 26px "Orbitron", monospace';
            ctx.fillStyle = '#00e5ff';
            ctx.textAlign = 'center';
            ctx.fillText(title, 256, 60);
            ctx.font = 'bold 16px "JetBrains Mono", monospace';
            ctx.fillStyle = '#00ffaa';
            ctx.fillText(countText, 256, 92);
            return new THREE.CanvasTexture(cv);
        }

        function createRulerSprite(count) {
            const cv = document.createElement('canvas');
            cv.width = 64; cv.height = 512;
            const ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, 64, 512);
            ctx.fillStyle = '#00e5ff';
            ctx.font = 'bold 10px "JetBrains Mono", monospace';
            ctx.textAlign = 'right';
            const step = 512 / count;
            for (let i = 0; i < count; i += (count > 30 ? 4 : 2)) {
                const y = i * step + 8;
                ctx.fillText(String(i + 1).padStart(2, '0'), 44, y);
                ctx.fillRect(48, y - 3, 10, 1.5);
            }
            return new THREE.CanvasTexture(cv);
        }

        function init3DNeuralVisualizer() {
            if (neuralInitialized) return;
            const container3D = document.getElementById('neural-webgl-canvas');
            if (!container3D) return;

            neuralScene = new THREE.Scene();
            neuralScene.fog = new THREE.FogExp2(0x030308, 0.0025);

            neuralCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000);
            neuralCamera.position.set(-240, 190, 420);

            neuralRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
            neuralRenderer.setSize(window.innerWidth, window.innerHeight);
            neuralRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            neuralRenderer.toneMapping = THREE.ACESFilmicToneMapping;
            neuralRenderer.toneMappingExposure = 1.35;
            container3D.appendChild(neuralRenderer.domElement);

            neuralControls = new THREE.OrbitControls(neuralCamera, neuralRenderer.domElement);
            neuralControls.enableDamping = true;
            neuralControls.dampingFactor = 0.05;
            neuralControls.maxDistance = 1500;
            neuralControls.minDistance = 80;
            neuralControls.target.set(0, 10, 0);

            // Unreal Bloom Postprocessing Pass
            const renderPass = new THREE.RenderPass(neuralScene, neuralCamera);
            neuralBloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.6, 0.45, 0.15
            );
            neuralComposer = new THREE.EffectComposer(neuralRenderer);
            neuralComposer.addPass(renderPass);
            neuralComposer.addPass(neuralBloomPass);

            // Lights
            neuralScene.add(new THREE.AmbientLight(0xffffff, 0.5));
            const dl1 = new THREE.DirectionalLight(0x00e5ff, 1.8);
            dl1.position.set(300, 400, 300);
            neuralScene.add(dl1);
            const dl2 = new THREE.DirectionalLight(0xff0055, 1.4);
            dl2.position.set(-300, -200, -300);
            neuralScene.add(dl2);

            // Grid & Stars
            const grid = new THREE.GridHelper(1200, 40, 0x00e5ff, 0x151b2e);
            grid.position.y = -160;
            grid.material.opacity = 0.25;
            grid.material.transparent = true;
            neuralScene.add(grid);

            const starsGeo = new THREE.BufferGeometry();
            const starPos = new Float32Array(1000 * 3);
            for (let i = 0; i < 3000; i += 3) {
                starPos[i] = (Math.random() - 0.5) * 2500;
                starPos[i+1] = (Math.random() - 0.5) * 1500;
                starPos[i+2] = (Math.random() - 0.5) * 2500;
            }
            starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
            neuralStarField = new THREE.Points(starsGeo, new THREE.PointsMaterial({ color: 0x00e5ff, size: 2.2, transparent: true, opacity: 0.35 }));
            neuralScene.add(neuralStarField);

            neuralScene.add(neuralGroup);

            setupNeuralRaycaster();
            setupNeuralDrawers();

            buildNeuralNetwork(currentNeuralArch);
            neuralInitialized = true;
            requestAnimationFrame(animateNeuralScene);
        }

        function setupNeuralDrawers() {
            const configBtn = document.getElementById('neural-config-toggle-btn');
            const configPanel = document.getElementById('neural-config-panel');
            const closeConfigBtn = document.getElementById('neural-close-config-btn');
            const closeInspBtn = document.getElementById('neural-close-inspector-btn');

            if (configBtn && configPanel) {
                configBtn.addEventListener('click', () => {
                    configPanel.classList.toggle('-translate-x-[450px]');
                });
            }
            if (closeConfigBtn && configPanel) {
                closeConfigBtn.addEventListener('click', () => {
                    configPanel.classList.add('-translate-x-[450px]');
                });
            }
            if (closeInspBtn) {
                closeInspBtn.addEventListener('click', clearNeuralSelection);
            }
        }

        function buildNeuralNetwork(archKey) {
            while (neuralGroup.children.length > 0) {
                const obj = neuralGroup.children[0];
                neuralGroup.remove(obj);
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
            }

            neuralNodes = [];
            neuralConnections = [];
            neuralLayerCols = [];
            selectedNeuralNode = null;
            hoveredNeuralNode = null;

            const arch = NEURAL_ARCHITECTURES[archKey];
            const layerCount = arch.layers.length;
            const totalWidth = 520;
            const layerSpacing = totalWidth / (layerCount - 1);
            const startX = -totalWidth / 2;
            const neonLayerColors = [0x00e5ff, 0x00ffaa, 0xff0055, 0x9d4edd, 0x00e5ff, 0xffb700];

            // 1. Build Layer Columns with dense micro-pins & vertical rails
            arch.layers.forEach((layerDef, lIdx) => {
                const x = startX + lIdx * layerSpacing;
                neuralLayerCols.push(x);
                const count = layerDef.count;
                const totalHeight = 260;
                const stepY = totalHeight / (count - 1);
                const startY = totalHeight / 2;
                const colColor = neonLayerColors[lIdx % neonLayerColors.length];

                // Rail Wire
                const railGeo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(x, startY + 14, 0),
                    new THREE.Vector3(x, -startY - 14, 0)
                ]);
                const railMat = new THREE.LineDashedMaterial({ color: colColor, dashSize: 4, gapSize: 4, opacity: 0.35, transparent: true });
                const railLine = new THREE.Line(railGeo, railMat);
                railLine.computeLineDistances();
                neuralGroup.add(railLine);

                // Overhead Header
                const headerSprite = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: createHeaderSprite(layerDef.name, `${count} PINS // ${layerDef.act}`),
                    transparent: true, depthTest: false
                }));
                headerSprite.position.set(x, startY + 38, 0);
                headerSprite.scale.set(70, 18, 1);
                neuralGroup.add(headerSprite);

                // Ruler
                const rulerSprite = new THREE.Sprite(new THREE.SpriteMaterial({
                    map: createRulerSprite(count), transparent: true, opacity: 0.7, depthTest: false
                }));
                rulerSprite.position.set(x - 12, 0, 0);
                rulerSprite.scale.set(12, totalHeight + 10, 1);
                neuralGroup.add(rulerSprite);

                // Micro Pins
                for (let nIdx = 0; nIdx < count; nIdx++) {
                    const y = startY - nIdx * stepY;
                    const z = Math.sin(nIdx * 0.4 + lIdx) * 14;

                    const coreMat = new THREE.MeshStandardMaterial({
                        color: colColor, emissive: colColor, emissiveIntensity: 0.95, roughness: 0.1, metalness: 0.9
                    });
                    const nodeMesh = new THREE.Mesh(pinGeo, coreMat);
                    nodeMesh.position.set(x, y, z);
                    neuralGroup.add(nodeMesh);

                    const haloMesh = new THREE.Mesh(pinHaloGeo, new THREE.MeshBasicMaterial({
                        color: colColor, side: THREE.DoubleSide, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending
                    }));
                    haloMesh.position.set(x, y, z);
                    neuralGroup.add(haloMesh);

                    const nodeData = {
                        id: `L${lIdx}:${String(nIdx + 1).padStart(2, '0')}`,
                        layerIndex: lIdx,
                        nodeIndex: nIdx,
                        layerName: layerDef.name,
                        layerType: layerDef.type,
                        actFunc: layerDef.act,
                        position: new THREE.Vector3(x, y, z),
                        mesh: nodeMesh,
                        halo: haloMesh,
                        baseColor: colColor,
                        activationValue: (Math.random() * 0.7 + 0.3).toFixed(4),
                        bias: ((Math.random() - 0.5) * 0.2).toFixed(4),
                        gradientNorm: (Math.random() * 0.01).toFixed(5),
                        incomingEdges: [],
                        outgoingEdges: [],
                        tensorSlice: Array.from({ length: 12 }, () => (Math.random() * 2 - 1).toFixed(3))
                    };
                    nodeMesh.userData = { nodeData };
                    neuralNodes.push(nodeData);
                }
            });

            // 2. Dense Cubic Bezier Splines
            for (let lIdx = 0; lIdx < layerCount - 1; lIdx++) {
                const fromNodes = neuralNodes.filter(n => n.layerIndex === lIdx);
                const toNodes = neuralNodes.filter(n => n.layerIndex === lIdx + 1);

                fromNodes.forEach((fromNode, fIdx) => {
                    toNodes.forEach((toNode, tIdx) => {
                        if ((fIdx + tIdx) % 2 === 0 || Math.abs(fIdx - tIdx) < 8) {
                            const weight = Math.random() * 2 - 1;
                            const isPositive = weight >= 0;
                            const synapseColor = isPositive ? 0x00e5ff : 0xff0055;

                            const p0 = fromNode.position;
                            const p3 = toNode.position;
                            const dx = p3.x - p0.x;
                            const dy = p3.y - p0.y;
                            const cpOffset = dx * neuralCurvature * 0.55;
                            const flareZ = (Math.sin(fIdx * 0.3) + Math.cos(tIdx * 0.3)) * 25;
                            const p1 = new THREE.Vector3(p0.x + cpOffset, p0.y - dy * 0.12, p0.z + flareZ);
                            const p2 = new THREE.Vector3(p3.x - cpOffset, p3.y + dy * 0.12, p3.z + flareZ);

                            const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);
                            const points = curve.getPoints(20);
                            const curveGeo = new THREE.BufferGeometry().setFromPoints(points);
                            const curveMat = new THREE.LineBasicMaterial({
                                color: synapseColor,
                                transparent: true,
                                opacity: Math.max(0.18, Math.abs(weight) * 0.55),
                                blending: THREE.AdditiveBlending,
                                depthWrite: false
                            });

                            const lineMesh = new THREE.Line(curveGeo, curveMat);
                            neuralGroup.add(lineMesh);

                            const edgeData = {
                                fromNode,
                                toNode,
                                curve,
                                lineMesh,
                                weight: weight.toFixed(4),
                                isPositive,
                                baseColor: synapseColor,
                                baseOpacity: Math.max(0.18, Math.abs(weight) * 0.55)
                            };

                            neuralConnections.push(edgeData);
                            fromNode.outgoingEdges.push(edgeData);
                            toNode.incomingEdges.push(edgeData);
                        }
                    });
                });
            }

            initNeuralParticles();
            updateNeuralHudStats();
            renderNeuralLayerCards();
        }

        function initNeuralParticles() {
            if (neuralPulseParticles) {
                neuralGroup.remove(neuralPulseParticles);
                neuralPulseParticles.geometry.dispose();
                neuralPulseParticles.material.dispose();
            }
            if (neuralConnections.length === 0) return;

            const count = neuralDensity;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            neuralPulseProgress = new Float32Array(count);
            neuralPulseSpeeds = new Float32Array(count);
            neuralPulseIndices = new Int32Array(count);

            for (let i = 0; i < count; i++) {
                const cIdx = Math.floor(Math.random() * neuralConnections.length);
                neuralPulseIndices[i] = cIdx;
                neuralPulseProgress[i] = Math.random();
                neuralPulseSpeeds[i] = 0.004 + Math.random() * 0.009;

                const edge = neuralConnections[cIdx];
                const pt = edge.curve.getPoint(neuralPulseProgress[i]);
                positions[i * 3] = pt.x;
                positions[i * 3 + 1] = pt.y;
                positions[i * 3 + 2] = pt.z;

                const col = new THREE.Color(edge.isPositive ? 0x00e5ff : 0x00ffaa);
                colors[i * 3] = col.r;
                colors[i * 3 + 1] = col.g;
                colors[i * 3 + 2] = col.b;
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const mat = new THREE.PointsMaterial({
                size: 4.8,
                vertexColors: true,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                map: createGlowSprite('#00e5ff'),
                depthWrite: false
            });

            neuralPulseParticles = new THREE.Points(geo, mat);
            neuralGroup.add(neuralPulseParticles);
        }

        function setupNeuralRaycaster() {
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2(-1000, -1000);
            const tooltip = document.getElementById('neural-hover-tooltip');

            window.addEventListener('mousemove', (e) => {
                if (!isNeuralView) return;
                mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
                mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                if (tooltip) {
                    tooltip.style.left = `${e.clientX}px`;
                    tooltip.style.top = `${e.clientY}px`;
                }
            });

            window.addEventListener('click', (e) => {
                if (!isNeuralView || e.target.closest('.interactive') || e.target.closest('header')) return;
                raycaster.setFromCamera(mouse, neuralCamera);
                const meshes = neuralNodes.map(n => n.mesh);
                const intersects = raycaster.intersectObjects(meshes);

                if (intersects.length > 0) {
                    selectNeuralNode(intersects[0].object.userData.nodeData);
                    neuralAudio.playBlip(780, 0.15, 'sine');
                } else {
                    clearNeuralSelection();
                }
            });

            window.neuralHoverCheck = () => {
                if (!isNeuralView) return;
                raycaster.setFromCamera(mouse, neuralCamera);
                const meshes = neuralNodes.map(n => n.mesh);
                const intersects = raycaster.intersectObjects(meshes);
                if (intersects.length > 0) {
                    const node = intersects[0].object.userData.nodeData;
                    if (hoveredNeuralNode !== node) {
                        hoveredNeuralNode = node;
                        document.getElementById('neural-tt-title').innerText = `TENSOR PIN [${node.id}]`;
                        document.getElementById('neural-tt-layer').innerText = node.layerName;
                        document.getElementById('neural-tt-act').innerText = node.activationValue;
                        let tw = 0;
                        node.incomingEdges.forEach(e => tw += parseFloat(e.weight));
                        document.getElementById('neural-tt-weight').innerText = (tw >= 0 ? '+' : '') + tw.toFixed(3);
                        tooltip.style.display = 'block';
                    }
                } else {
                    if (hoveredNeuralNode) {
                        hoveredNeuralNode = null;
                        tooltip.style.display = 'none';
                    }
                }
            };
        }

        function selectNeuralNode(node) {
            selectedNeuralNode = node;
            const inspector = document.getElementById('neural-node-inspector');
            if (inspector) inspector.classList.remove('translate-x-[460px]');

            document.getElementById('neural-insp-badge').innerText = node.id;
            document.getElementById('neural-insp-node-id').innerText = `${node.layerName} — Pin #${node.nodeIndex + 1}`;
            document.getElementById('neural-insp-layer-type').innerText = node.layerType;
            document.getElementById('neural-insp-act-func').innerText = node.actFunc;
            document.getElementById('neural-insp-act-val').innerText = node.activationValue;
            document.getElementById('neural-insp-bias-val').innerText = (parseFloat(node.bias) >= 0 ? '+' : '') + node.bias;
            document.getElementById('neural-insp-grad-val').innerText = node.gradientNorm;
            document.getElementById('neural-insp-tensor-box').innerText = `[${node.tensorSlice.join(', ')}]`;

            drawNeuralSparkline(node);

            neuralConnections.forEach(edge => {
                if (edge.fromNode === node || edge.toNode === node) {
                    edge.lineMesh.material.opacity = 1.0;
                    edge.lineMesh.material.color.setHex(0x00e5ff);
                } else {
                    edge.lineMesh.material.opacity = 0.03;
                    edge.lineMesh.material.color.setHex(0x0d1424);
                }
            });

            neuralNodes.forEach(n => {
                if (n === node) {
                    n.mesh.scale.set(2.2, 2.2, 2.2);
                    n.mesh.material.emissiveIntensity = 2.5;
                    n.halo.scale.set(2.0, 2.0, 2.0);
                    n.halo.material.color.setHex(0xff0055);
                } else if (node.incomingEdges.some(e => e.fromNode === n) || node.outgoingEdges.some(e => e.toNode === n)) {
                    n.mesh.scale.set(1.4, 1.4, 1.4);
                    n.mesh.material.emissiveIntensity = 1.2;
                    n.halo.scale.set(1.2, 1.2, 1.2);
                    n.halo.material.color.setHex(0x00e5ff);
                } else {
                    n.mesh.scale.set(0.75, 0.75, 0.75);
                    n.mesh.material.emissiveIntensity = 0.2;
                    n.halo.scale.set(0.75, 0.75, 0.75);
                    n.halo.material.color.setHex(0x151f33);
                }
            });
        }

        function clearNeuralSelection() {
            selectedNeuralNode = null;
            const inspector = document.getElementById('neural-node-inspector');
            if (inspector) inspector.classList.add('translate-x-[460px]');

            neuralConnections.forEach(edge => {
                edge.lineMesh.material.opacity = edge.baseOpacity;
                edge.lineMesh.material.color.setHex(edge.baseColor);
            });
            neuralNodes.forEach(n => {
                n.mesh.scale.set(1, 1, 1);
                n.mesh.material.emissiveIntensity = 0.95;
                n.halo.scale.set(1, 1, 1);
                n.halo.material.color.setHex(n.baseColor);
            });
        }

        function drawNeuralSparkline(node) {
            const cv = document.getElementById('neural-activation-canvas');
            if (!cv) return;
            const ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, cv.width, cv.height);
            const w = cv.width, h = cv.height, pts = 24;

            ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, h/2); ctx.lineTo(w, h/2);
            ctx.stroke();

            ctx.strokeStyle = '#00e5ff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let i = 0; i < pts; i++) {
                const px = (i / (pts - 1)) * w;
                const val = Math.sin(i * 0.45 + parseFloat(node.activationValue) * 3) * 0.4 + 0.5;
                const py = h - val * (h - 8) - 4;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.stroke();
            ctx.lineTo(w, h); ctx.lineTo(0, h);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.fill();
        }

        function stimulateSelectedNeuralNode() {
            if (!selectedNeuralNode) return;
            neuralAudio.playBlip(960, 0.2, 'sawtooth');
            new TWEEN.Tween(selectedNeuralNode.mesh.scale)
                .to({ x: 3.2, y: 3.2, z: 3.2 }, 150)
                .yoyo(true).repeat(1)
                .easing(TWEEN.Easing.Quadratic.Out).start();
            selectedNeuralNode.activationValue = (Math.random() * 0.4 + 0.6).toFixed(4);
            document.getElementById('neural-insp-act-val').innerText = selectedNeuralNode.activationValue;
            drawNeuralSparkline(selectedNeuralNode);
        }

        function isolateSelectedNeuralNode() {
            if (!selectedNeuralNode) return;
            new TWEEN.Tween(neuralControls.target)
                .to({ x: selectedNeuralNode.position.x, y: selectedNeuralNode.position.y, z: selectedNeuralNode.position.z }, 800)
                .easing(TWEEN.Easing.Cubic.Out).start();
        }

        function loadNeuralArchitecture(archKey) {
            currentNeuralArch = archKey;
            document.querySelectorAll('.neural-preset-btn').forEach(btn => {
                btn.className = 'neural-preset-btn bg-slate-900 border border-slate-700/80 text-slate-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-slate-800 transition flex items-center justify-center gap-1.5';
            });
            const activeBtn = document.getElementById(`btn-preset-${archKey}`);
            if (activeBtn) {
                activeBtn.className = 'neural-preset-btn bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 text-xs py-2 px-2.5 rounded-lg font-bold hover:bg-cyan-900/60 transition flex items-center justify-center gap-1.5 active';
            }
            document.getElementById('neural-arch-badge').innerText = NEURAL_ARCHITECTURES[archKey].name.split(' ')[0].toUpperCase();
            neuralAudio.playCascade();
            buildNeuralNetwork(archKey);
        }

        function triggerNeuralForwardPass() {
            neuralAudio.playCascade();
            const btn = document.getElementById('btn-forward-pass');
            if (btn) {
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = 'scale(1)', 150);
            }
            const arch = NEURAL_ARCHITECTURES[currentNeuralArch];
            arch.layers.forEach((_, lIdx) => {
                setTimeout(() => {
                    const layerNodes = neuralNodes.filter(n => n.layerIndex === lIdx);
                    layerNodes.forEach(node => {
                        new TWEEN.Tween(node.mesh.scale)
                            .to({ x: 2.2, y: 2.2, z: 2.2 }, 200)
                            .yoyo(true).repeat(1)
                            .easing(TWEEN.Easing.Quadratic.Out).start();
                        node.activationValue = (Math.random() * 0.85 + 0.15).toFixed(4);
                    });
                    if (selectedNeuralNode && selectedNeuralNode.layerIndex === lIdx) {
                        document.getElementById('neural-insp-act-val').innerText = selectedNeuralNode.activationValue;
                        drawNeuralSparkline(selectedNeuralNode);
                    }
                }, lIdx * 150);
            });
        }

        function toggleNeuralPlayPause() {
            neuralSimRunning = !neuralSimRunning;
            const icon = document.getElementById('icon-play-pause');
            if (icon) icon.className = neuralSimRunning ? 'fa-solid fa-pause text-xs' : 'fa-solid fa-play text-xs';
        }

        function resetNeuralCamera(viewMode = 'iso') {
            let targetPos = { x: -240, y: 190, z: 420 };
            if (viewMode === 'side') targetPos = { x: -440, y: 0, z: 0 };
            else if (viewMode === 'top') targetPos = { x: 0, y: 520, z: 0 };

            new TWEEN.Tween(neuralCamera.position).to(targetPos, 900).easing(TWEEN.Easing.Cubic.Out).start();
            new TWEEN.Tween(neuralControls.target).to({ x: 0, y: 10, z: 0 }, 900).easing(TWEEN.Easing.Cubic.Out).start();
        }

        function toggleNeuralAudio() {
            neuralAudio.enabled = !neuralAudio.enabled;
            const icon = document.getElementById('icon-neural-audio');
            if (icon) icon.className = neuralAudio.enabled ? 'fa-solid fa-volume-high text-xs' : 'fa-solid fa-volume-xmark text-xs';
        }

        function toggleNeuralAutoRotate() {
            if (!neuralControls) return;
            neuralControls.autoRotate = !neuralControls.autoRotate;
            document.getElementById('btn-auto-rotate')?.classList.toggle('text-cyan-300', neuralControls.autoRotate);
        }

        function randomizeNeuralWeights() {
            neuralAudio.playBlip(650, 0.15, 'sawtooth');
            neuralConnections.forEach(edge => {
                const weight = Math.random() * 2 - 1;
                edge.weight = weight.toFixed(4);
                edge.isPositive = weight >= 0;
                edge.baseColor = edge.isPositive ? 0x00e5ff : 0xff0055;
                edge.baseOpacity = Math.max(0.18, Math.abs(weight) * 0.55);
                edge.lineMesh.material.color.setHex(edge.baseColor);
                edge.lineMesh.material.opacity = edge.baseOpacity;
            });
        }

        function updateNeuralSpeed(val) {
            neuralSpeed = parseFloat(val);
            document.getElementById('neural-val-speed').innerText = `${neuralSpeed.toFixed(1)}x`;
        }

        function updateNeuralDensity(val) {
            neuralDensity = parseInt(val);
            document.getElementById('neural-val-density').innerText = val;
            initNeuralParticles();
        }

        function updateNeuralCurvature(val) {
            neuralCurvature = parseFloat(val);
            document.getElementById('neural-val-curvature').innerText = neuralCurvature.toFixed(2);
            buildNeuralNetwork(currentNeuralArch);
        }

        function updateNeuralHudStats() {
            document.getElementById('neural-stat-nodes').innerText = `${neuralNodes.length} PINS`;
            document.getElementById('neural-stat-edges').innerText = `${neuralConnections.length} PATHS`;
            document.getElementById('neural-layer-count-badge').innerText = `${NEURAL_ARCHITECTURES[currentNeuralArch].layers.length} Layers`;
        }

        function renderNeuralLayerCards() {
            const container = document.getElementById('neural-layer-cards-container');
            if (!container) return;
            container.innerHTML = '';
            NEURAL_ARCHITECTURES[currentNeuralArch].layers.forEach((layer, idx) => {
                const card = document.createElement('div');
                card.className = 'bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-lg p-2.5 cursor-pointer transition';
                card.onclick = () => {
                    const colX = neuralLayerCols[idx];
                    new TWEEN.Tween(neuralControls.target).to({ x: colX, y: 0, z: 0 }, 600).easing(TWEEN.Easing.Cubic.Out).start();
                };
                card.innerHTML = `
                    <div class="flex justify-between items-center text-xs font-bold text-white">
                        <span>Layer ${idx + 1}: ${layer.name.split(' ')[0]}</span>
                        <span class="text-[10px] font-mono text-cyan-300 font-normal">${layer.act}</span>
                    </div>
                    <div class="flex justify-between items-center text-[10px] text-slate-400 mt-1 font-mono">
                        <span>${layer.type}</span>
                        <span class="text-emerald-400 font-bold">${layer.count} Pins</span>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        let neuralLastTime = performance.now();
        let neuralFrameCount = 0;

        function animateNeuralScene(time) {
            requestAnimationFrame(animateNeuralScene);
            if (!isNeuralView) return;

            TWEEN.update();
            if (neuralControls) neuralControls.update();

            if (neuralSimRunning) {
                const haloScale = 1 + Math.sin(time * 0.0035) * 0.12;
                neuralNodes.forEach(n => {
                    if (n !== selectedNeuralNode) {
                        n.halo.rotation.z += 0.012;
                        n.halo.scale.set(haloScale, haloScale, haloScale);
                    }
                });
                if (neuralStarField) neuralStarField.rotation.y += 0.0003;

                // Animate Pulses along curves
                if (neuralPulseParticles) {
                    const posAttr = neuralPulseParticles.geometry.attributes.position;
                    const positions = posAttr.array;
                    const count = neuralPulseProgress.length;

                    for (let i = 0; i < count; i++) {
                        neuralPulseProgress[i] += neuralPulseSpeeds[i] * neuralSpeed;
                        if (neuralPulseProgress[i] > 1.0) {
                            neuralPulseProgress[i] = 0;
                            neuralPulseIndices[i] = Math.floor(Math.random() * neuralConnections.length);
                        }
                        const edge = neuralConnections[neuralPulseIndices[i]];
                        if (edge && edge.curve) {
                            const pt = edge.curve.getPoint(neuralPulseProgress[i]);
                            positions[i * 3] = pt.x;
                            positions[i * 3 + 1] = pt.y;
                            positions[i * 3 + 2] = pt.z;
                        }
                    }
                    posAttr.needsUpdate = true;
                }
            }

            if (window.neuralHoverCheck) window.neuralHoverCheck();
            if (neuralComposer) {
                neuralComposer.render();
            }

            neuralFrameCount++;
            if (time - neuralLastTime >= 1000) {
                const fps = Math.round((neuralFrameCount * 1000) / (time - neuralLastTime));
                document.getElementById('neural-stat-fps').innerText = `${fps.toFixed(1)}`;
                neuralFrameCount = 0;
                neuralLastTime = time;
            }
        }

        // =========================================================================
        // --- 3. VIEW TOGGLE: 2D GRAPH <-> 3D NEURAL FLOW ---
        // =========================================================================
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        const architectureContainer = document.getElementById('architecture-container');
        const leftPanel = document.getElementById('left-controls-panel');
        const inspectorSidebar = document.getElementById('inspector-sidebar');
        const viewModeIndicator = document.getElementById('view-mode-indicator');
        const toggleBtnLabel = document.getElementById('toggle-btn-label');
        const toggleIconFlow = document.getElementById('toggle-icon-flow');
        const toggleIconGraph = document.getElementById('toggle-icon-graph');

        let isNeuralView = false;

        if (viewToggleBtn && architectureContainer) {
            viewToggleBtn.addEventListener('click', () => {
                isNeuralView = !isNeuralView;
                if (isNeuralView) {
                    architectureContainer.classList.remove('hidden');
                    if (leftPanel) leftPanel.classList.add('hidden');
                    if (inspectorSidebar) inspectorSidebar.classList.add('hidden');
                    if (viewModeIndicator) {
                        viewModeIndicator.innerText = '3D Neural Flow';
                        viewModeIndicator.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30';
                    }
                    if (toggleBtnLabel) toggleBtnLabel.innerText = '2D Code Graph';
                    if (toggleIconFlow) toggleIconFlow.classList.add('hidden');
                    if (toggleIconGraph) toggleIconGraph.classList.remove('hidden');

                    init3DNeuralVisualizer();

                    setTimeout(() => {
                        if (neuralRenderer && neuralCamera && neuralComposer) {
                            neuralCamera.aspect = window.innerWidth / window.innerHeight;
                            neuralCamera.updateProjectionMatrix();
                            neuralRenderer.setSize(window.innerWidth, window.innerHeight);
                            neuralComposer.setSize(window.innerWidth, window.innerHeight);
                        }
                    }, 50);

                    neuralAudio.playCascade();
                } else {
                    architectureContainer.classList.add('hidden');
                    if (leftPanel) leftPanel.classList.remove('hidden');
                    if (inspectorSidebar) inspectorSidebar.classList.remove('hidden');
                    if (viewModeIndicator) {
                        viewModeIndicator.innerText = '2D Graph View';
                        viewModeIndicator.className = 'text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-400 border border-indigo-500/30';
                    }
                    if (toggleBtnLabel) toggleBtnLabel.innerText = '3D Neural Flow';
                    if (toggleIconFlow) toggleIconFlow.classList.remove('hidden');
                    if (toggleIconGraph) toggleIconGraph.classList.add('hidden');
                }
            });
        }

        window.addEventListener('resize', () => {
            if (neuralRenderer && neuralCamera && neuralComposer) {
                neuralCamera.aspect = window.innerWidth / window.innerHeight;
                neuralCamera.updateProjectionMatrix();
                neuralRenderer.setSize(window.innerWidth, window.innerHeight);
                neuralComposer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    </script>
</body>
</html>
"""
