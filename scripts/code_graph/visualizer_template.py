# -*- coding: utf-8 -*-
"""
HTML template for the codebase dependency graph visualization.
Uses Vis.js Network library and Tailwind CSS for styling.
"""

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Codebase Knowledge Graph</title>
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts - Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <!-- Vis.js Network -->
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background-color: #0b0f19;
            color: #e2e8f0;
        }
        #network-container {
            width: 100%;
            height: 100%;
            background-color: #080c14;
        }
        .glass-panel {
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
        }
        /* Custom Scrollbar */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: rgba(15, 23, 42, 0.5);
        }
        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 3px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        /* Flow Simulation Animations */
        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.2); transform: scale(1); }
            50% { box-shadow: 0 0 25px rgba(99, 102, 241, 0.8); transform: scale(1.05); }
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            20%, 60% { transform: translateX(-6px); }
            40%, 80% { transform: translateX(6px); }
        }
        @keyframes flash-red {
            0%, 100% { border-color: rgba(239, 68, 68, 0.4); background-color: rgba(220, 38, 38, 0.2); }
            50% { border-color: rgba(239, 68, 68, 1); background-color: rgba(220, 38, 38, 0.6); }
        }
        .animate-glow {
            animation: pulse-glow 1.2s infinite ease-in-out;
        }
        .animate-shake {
            animation: shake 0.4s ease-in-out;
        }
        .animate-flash-red {
            animation: flash-red 0.6s infinite alternate;
        }

        /* Dynamic Box and Arrow Locking */
        .locked-node {
            opacity: 0.08 !important;
            transform: scale(0.8) !important;
            filter: grayscale(100%) blur(1px) !important;
            pointer-events: none !important;
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .unlocked-node {
            opacity: 1 !important;
            transform: scale(1) !important;
            filter: none !important;
            pointer-events: auto !important;
            transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
            box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.3) !important;
        }
        .locked-arrow {
            opacity: 0.05 !important;
            filter: blur(1.5px) !important;
            transition: all 0.5s ease !important;
        }
        .unlocked-arrow {
            opacity: 1 !important;
            filter: none !important;
            transition: all 0.5s ease !important;
        }

        /* Stickman walk and swing keyframes */
        @keyframes swing-leg-l {
            0% { transform: rotate(-25deg); }
            100% { transform: rotate(25deg); }
        }
        @keyframes swing-leg-r {
            0% { transform: rotate(25deg); }
            100% { transform: rotate(-25deg); }
        }
        @keyframes swing-arm-l {
            0% { transform: rotate(-20deg); }
            100% { transform: rotate(20deg); }
        }
        @keyframes swing-arm-r {
            0% { transform: rotate(20deg); }
            100% { transform: rotate(-20deg); }
        }
        @keyframes phone-pulse {
            0%, 100% { transform: scale(1); opacity: 0.3; }
            50% { transform: scale(1.3); opacity: 0.8; }
        }

        /* Walking Animation Classes */
        .stickman-walking #leg-left {
            animation: swing-leg-l 0.25s infinite alternate ease-in-out;
        }
        .stickman-walking #leg-right {
            animation: swing-leg-r 0.25s infinite alternate ease-in-out;
        }
        .stickman-walking #arm-left {
            animation: swing-arm-l 0.25s infinite alternate ease-in-out;
        }
        .stickman-walking #arm-right {
            animation: swing-arm-r 0.25s infinite alternate ease-in-out;
        }
        
        #leg-left { transform-origin: 50px 80px; }
        #leg-right { transform-origin: 50px 80px; }
        #arm-left { transform-origin: 50px 55px; }
        #arm-right { transform-origin: 50px 55px; }
        
        .phone-glow-active {
            animation: phone-pulse 1s infinite alternate ease-in-out;
        }
    </style>
</head>
<body class="h-full overflow-hidden flex flex-col relative">
    <!-- Header -->
    <header class="glass-panel z-50 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/30">G</div>
            <div>
                <h1 class="text-lg font-bold tracking-tight text-white">Codebase Knowledge Graph</h1>
                <p class="text-xs text-slate-400">Interactive dependency visualizer & context search index</p>
            </div>
        </div>
        <div class="flex gap-4 items-center text-sm text-slate-400">
            <div class="hidden sm:block">Files: <span id="stat-files" class="font-semibold text-indigo-400">0</span></div>
            <div class="hidden sm:block h-4 w-px bg-slate-800"></div>
            <div class="hidden sm:block">Dependencies: <span id="stat-deps" class="font-semibold text-indigo-400">0</span></div>
            <div class="hidden sm:block h-4 w-px bg-slate-800"></div>
            <div class="hidden sm:block">Languages: <span id="stat-langs" class="font-semibold text-indigo-400">0</span></div>
            <!-- View Toggle Button -->
            <button id="view-toggle-btn" class="ml-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-4 py-2 rounded shadow-lg font-bold border border-indigo-400/50 transition-colors animate-pulse">
                🔄 Show Flow
            </button>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
        
        <!-- Network Background Container -->
        <div id="network-container" class="absolute inset-0"></div>

        <!-- Architecture Flow Container -->
        <div id="architecture-container" class="absolute inset-0 z-40 bg-[#0b0f19] hidden flex-col items-center justify-start sm:justify-center p-4 sm:p-8 overflow-y-auto pt-16 sm:pt-8">
            <div class="max-w-5xl w-full flex flex-col items-center text-center pb-10">
                <h2 class="text-xl sm:text-2xl font-bold text-white mb-4">System Architecture Flow</h2>
                
                <!-- Attack Simulator Dropdown -->
                <div class="mb-8 w-full max-w-sm">
                    <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Simulate Purchase & Attack Flow</label>
                    <select id="attack-simulator" class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all cursor-pointer">
                        <option value="select">-- Choose a Scenario to Simulate --</option>
                        <option value="none">🟢 Normal Secure Flow (Online Payment)</option>
                        <option value="cod">🟢 Normal Secure Flow (Cash On Delivery - COD)</option>
                        <option value="price_hack">🔴 Simulate Price Tampering (Proxy Hack)</option>
                        <option value="ddos">🔴 Simulate DDoS / Bot Attack</option>
                        <option value="path_traversal">🔴 Simulate Sensitive File Hack (.env)</option>
                    </select>
                </div>

                <!-- Stickman Interactive Simulation Area -->
                <div id="stickman-stage" class="w-full max-w-xl bg-slate-950/60 border border-slate-800 rounded-2xl p-4 mb-8 relative overflow-hidden hidden flex-col items-center justify-center shadow-inner min-h-[220px]">
                    <div id="stickman-bubble" class="absolute bg-indigo-950/90 border border-indigo-500/40 text-white rounded-xl p-3 text-xs shadow-lg max-w-[280px] transition-all duration-300 opacity-0 scale-90 pointer-events-none z-10 top-[20px] left-[50%] -translate-x-[50%]">
                        <!-- Storefront content injected dynamically -->
                    </div>
                    
                    <svg id="stickman-svg" class="w-full h-28 mt-4" viewBox="0 0 600 120" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="110" x2="600" y2="110" stroke="#1e293b" stroke-width="2" stroke-dasharray="4 4" />
                        
                        <g id="stick-character" transform="translate(-100, 0)">
                            <circle cx="50" cy="40" r="10" stroke="#818cf8" stroke-width="3" fill="#0f172a" />
                            <line x1="50" y1="50" x2="50" y2="80" stroke="#818cf8" stroke-width="3" />
                            <line id="arm-left" x1="50" y1="55" x2="35" y2="70" stroke="#818cf8" stroke-width="3" stroke-linecap="round" />
                            <line id="arm-right" x1="50" y1="55" x2="65" y2="70" stroke="#818cf8" stroke-width="3" stroke-linecap="round" />
                            <line id="leg-left" x1="50" y1="80" x2="40" y2="110" stroke="#818cf8" stroke-width="3" stroke-linecap="round" />
                            <line id="leg-right" x1="50" y1="80" x2="60" y2="110" stroke="#818cf8" stroke-width="3" stroke-linecap="round" />
                            
                            <rect id="phone-device" x="65" y="55" width="10" height="18" rx="2" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" class="opacity-0 transition-opacity duration-300" />
                            <circle id="phone-glow" cx="70" cy="64" r="8" fill="#38bdf8" opacity="0" />
                        </g>
                    </svg>
                    <div id="stickman-status-label" class="text-[11px] font-mono tracking-wider font-semibold text-indigo-400 mt-2 select-none uppercase">Waiting for simulation...</div>
                </div>

                <!-- ROW 1 -->
                <div class="flex flex-col sm:flex-row items-center justify-center w-full gap-2 sm:gap-4">
                    <div id="node-client" class="flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
                        <div class="text-xs sm:text-sm font-semibold text-white">Client</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Sends Request</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-1 locked-arrow">➔</div>
                    
                    <div id="node-firewall" class="flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-rose-900/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        <div class="text-xs sm:text-sm font-semibold text-rose-400">Security Firewall</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Rate Limit & DDoS Check</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-2 locked-arrow">➔</div>
 
                    <div id="node-backend" class="flex flex-col items-center bg-indigo-900/50 p-3 sm:p-4 rounded-xl border border-indigo-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-indigo-350" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <div class="text-xs sm:text-sm font-semibold text-indigo-300">Go Backend</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Validates Order</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-3 locked-arrow">➔</div>
 
                    <div id="node-mongo" class="flex flex-col items-center bg-emerald-900/50 p-3 sm:p-4 rounded-xl border border-emerald-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-emerald-350" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path></svg>
                        <div class="text-xs sm:text-sm font-semibold text-emerald-300">MongoDB</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Verifies Real Price</div>
                    </div>
                </div>
                
                <div class="my-4 sm:my-6 text-indigo-500 text-xl sm:text-2xl arrow-4 locked-arrow">⬇</div>
 
                <!-- ROW 2 -->
                <div class="flex flex-col sm:flex-row items-center justify-center w-full gap-2 sm:gap-4">
                    <div id="node-razorpay" class="flex flex-col items-center bg-blue-900/50 p-3 sm:p-4 rounded-xl border border-blue-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                        <div class="text-xs sm:text-sm font-semibold text-blue-300">Razorpay</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Creates Payment Link</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-5 locked-arrow">➔</div>
                    
                    <div id="node-success" class="flex flex-col items-center bg-green-900/50 p-3 sm:p-4 rounded-xl border border-green-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <div class="text-xs sm:text-sm font-semibold text-green-300">Success</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Order PAID</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-6 locked-arrow">➔</div>
 
                    <div id="node-shiprocket" class="flex flex-col items-center bg-orange-900/50 p-3 sm:p-4 rounded-xl border border-orange-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-orange-350" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                        <div class="text-xs sm:text-sm font-semibold text-orange-300">Shiprocket</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Auto Dispatched</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-7 locked-arrow">➔</div>
 
                    <div id="node-customer" class="flex flex-col items-center bg-purple-900/50 p-3 sm:p-4 rounded-xl border border-purple-500/50 w-full sm:w-36 shadow-lg transition-all locked-node">
                        <svg class="w-8 h-8 mb-1 sm:mb-2 text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        <div class="text-xs sm:text-sm font-semibold text-purple-300">Customer</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Delivered Safely</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Left Controls Panel -->
        <div id="left-controls-panel" class="absolute left-2 top-2 bottom-2 w-[14rem] sm:left-6 sm:top-6 sm:bottom-6 sm:w-80 flex flex-col gap-3 sm:gap-4 pointer-events-none z-10 transition-all duration-300 sm:translate-x-0 -translate-x-[120%]">
            
            <!-- Mobile Toggle Button (Only visible on small screens to un-hide the panel) -->
            <button id="mobile-panel-toggle" class="absolute -right-8 top-0 pointer-events-auto sm:hidden bg-slate-800 text-slate-300 border border-slate-700 p-1.5 rounded shadow-lg text-xs">
                🔍
            </button>

            <!-- Search & Filter Card -->
            <div class="glass-panel rounded-xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 pointer-events-auto shadow-2xl overflow-y-auto max-h-full">
                <!-- NEW: File Browser Dropdown -->
                <div class="pb-2 border-b border-slate-800">
                    <label class="text-[10px] sm:text-xs font-semibold text-indigo-400 uppercase tracking-wider block mb-1">Browse Files & Folders</label>
                    <select id="file-browser-dropdown" class="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                        <option value="">-- Select a file --</option>
                        <!-- Options injected by JS -->
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
                    <div id="cluster-filters" class="flex flex-col gap-2 max-h-36 overflow-y-auto pr-1">
                        <!-- Cluster checkboxes injected here -->
                    </div>
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
                <div id="lang-legend" class="grid grid-cols-2 gap-2 text-xs">
                    <!-- Legend entries injected here -->
                </div>
            </div>
        </div>

        <!-- Right Detail Panel (Sidebar) -->
        <div id="inspector-sidebar" class="absolute right-6 top-6 bottom-6 w-96 glass-panel rounded-xl shadow-2xl flex flex-col overflow-hidden z-10 border border-slate-800/80 transition-transform duration-300 ease-in-out translate-x-[500px]">
            <!-- Sidebar Header -->
            <div class="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <span class="text-xs font-bold uppercase tracking-widest text-indigo-400">Node Inspector</span>
                <span id="close-inspector-btn" class="text-slate-400 hover:text-white cursor-pointer text-xs font-medium">Clear Selection</span>
            </div>
            
            <!-- Sidebar Scrollable Info -->
            <div id="inspector-content" class="flex-1 overflow-y-auto px-5 py-4 space-y-5">
                <!-- Selection State Default -->
                <div id="inspector-default" class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                    <svg class="w-12 h-12 mb-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path>
                    </svg>
                    <p class="font-medium text-sm text-slate-400">No node selected</p>
                    <p class="text-xs text-slate-500 mt-1 max-w-[200px]">Click a file in the network to inspect its exports, classes, imports, and dependencies.</p>
                </div>

                <!-- Inspector Real Content (Hidden by default) -->
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

                    <!-- Classes / Structs -->
                    <div id="section-classes" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Classes & Structs</h3>
                        <div id="node-classes" class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                            <!-- Injected classes -->
                        </div>
                    </div>

                    <!-- Functions -->
                    <div id="section-funcs" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Functions</h3>
                        <div id="node-funcs" class="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                            <!-- Injected functions -->
                        </div>
                    </div>

                    <!-- Imports -->
                    <div id="section-imports" class="hidden">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Imported Packages</h3>
                        <div id="node-imports" class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                            <!-- Injected imports -->
                        </div>
                    </div>

                    <!-- Dependencies (Imports file) -->
                    <div>
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Depends On (Outgoing)</h3>
                        <div id="node-dependencies" class="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                            <!-- Outgoing files -->
                        </div>
                    </div>

                    <!-- Dependents (Imported by) -->
                    <div>
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required By (Incoming)</h3>
                        <div id="node-dependents" class="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                            <!-- Incoming files -->
                        </div>
                    </div>

                    <!-- Code Preview Section -->
                    <div id="section-code" class="hidden border-t border-slate-800 pt-3">
                        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Code Preview</h3>
                        <pre id="node-code" class="bg-slate-950/90 border border-slate-800 rounded p-3 text-[10px] font-mono text-slate-300 overflow-auto max-h-60 whitespace-pre scrollbar-thin scrollbar-thumb-slate-800"></pre>
                    </div>
                </div>
            </div>
            
            <!-- Sidebar Footer Info -->
            <div id="sidebar-footer" class="px-5 py-3 border-t border-slate-800 bg-slate-950/20 text-[10px] text-slate-500 text-center">
                Press Esc to clear selection. Hold click to drag.
            </div>
        </div>
    </div>

    <!-- Graph Data Injection point -->
    <script type="text/javascript">
        // Inject data structure
        // nodes: [{id: string, label: string, group: string, shape: string, font: {color: string}, ...}]
        // edges: [{from: string, to: string, arrows: 'to', ...}]
        // details: {file_path: {language, cluster, functions, classes_structs, imports, dependencies, dependents}}
        const graphData = /* {{GRAPH_DATA}} */;
    </script>

    <!-- Main Logic Script -->
    <script type="text/javascript">
        let network = null;
        let nodesDataset = null;
        let edgesDataset = null;
        let originalNodes = [];
        let originalEdges = [];
        
        // Setup visual options mapping for Clusters
        const CLUSTER_STYLES = {
            'Routes/Endpoints': { color: { background: '#2563eb', border: '#3b82f6', highlight: { background: '#1d4ed8', border: '#60a5fa' } }, labelColor: '#ffffff' },
            'Controllers/Handlers': { color: { background: '#059669', border: '#10b981', highlight: { background: '#047857', border: '#34d399' } }, labelColor: '#ffffff' },
            'DB Models': { color: { background: '#7c3aed', border: '#8b5cf6', highlight: { background: '#6d28d9', border: '#a78bfa' } }, labelColor: '#ffffff' },
            'Utilities/Config': { color: { background: '#db2777', border: '#ec4899', highlight: { background: '#c11574', border: '#f472b6' } }, labelColor: '#ffffff' },
            'Components/Context': { color: { background: '#d97706', border: '#f59e0b', highlight: { background: '#b45309', border: '#fbbf24' } }, labelColor: '#ffffff' },
            'Services/Middleware': { color: { background: '#0891b2', border: '#06b6d4', highlight: { background: '#0e7490', border: '#22d3ee' } }, labelColor: '#ffffff' },
            'Main/Entry': { color: { background: '#dc2626', border: '#ef4444', highlight: { background: '#b91c1c', border: '#f87171' } }, labelColor: '#ffffff' },
            'Other': { color: { background: '#4b5563', border: '#6b7280', highlight: { background: '#374151', border: '#9ca3af' } }, labelColor: '#ffffff' }
        };

        const LANG_COLORS = {
            'Go': '#00ADD8',
            'Python': '#3572A5',
            'TypeScript': '#3178C6',
            'JavaScript': '#F1E05A',
            'HTML': '#E34C26',
            'CSS': '#563D7C',
            'Other': '#8B949E'
        };

        // DOM elements
        const searchInput = document.getElementById('search-input');
        const clusterFilters = document.getElementById('cluster-filters');
        const langLegend = document.getElementById('lang-legend');
        const physicsToggle = document.getElementById('physics-toggle');
        const resetBtn = document.getElementById('reset-btn');
        
        const statFiles = document.getElementById('stat-files');
        const statDeps = document.getElementById('stat-deps');
        const statLangs = document.getElementById('stat-langs');

        const inspectorSidebar = document.getElementById('inspector-sidebar');
        const inspectorDefault = document.getElementById('inspector-default');
        const inspectorDetails = document.getElementById('inspector-details');
        const closeInspectorBtn = document.getElementById('close-inspector-btn');

        const nodeBadge = document.getElementById('node-badge');
        const nodeLang = document.getElementById('node-lang');
        const nodeName = document.getElementById('node-name');
        const nodePath = document.getElementById('node-path');
        const statNodeFuncs = document.getElementById('stat-node-funcs');
        const statNodeClasses = document.getElementById('stat-node-classes');
        const nodeClasses = document.getElementById('node-classes');
        const nodeFuncs = document.getElementById('node-funcs');
        const nodeImports = document.getElementById('node-imports');
        const nodeDependencies = document.getElementById('node-dependencies');
        const nodeDependents = document.getElementById('node-dependents');

        // New DOM elements for analysis & code viewer
        const colorModeSelect = document.getElementById('color-mode-select');
        const orphanToggle = document.getElementById('orphan-toggle');
        const pathStartInput = document.getElementById('path-start');
        const pathEndInput = document.getElementById('path-end');
        const setStartBtn = document.getElementById('set-start-btn');
        const setEndBtn = document.getElementById('set-end-btn');
        const tracePathBtn = document.getElementById('trace-path-btn');
        const clearTraceBtn = document.getElementById('clear-trace-btn');
        const statNodeChurn = document.getElementById('stat-node-churn');
        const sectionCode = document.getElementById('section-code');
        const nodeCode = document.getElementById('node-code');
        const particlesToggle = document.getElementById('particles-toggle');

        // State variables
        let selectedNodeId = null;
        let activeClusterFilters = new Set();
        let allClusters = new Set();
        let allLangs = new Set();

        // Initialize App
        window.addEventListener('DOMContentLoaded', () => {
            initData();
            initFilters();
            renderLegend();
            renderStats();
            buildNetwork();
            setupEventListeners();
        });

        function initData() {
            // Read clusters and languages from raw data
            graphData.nodes.forEach(node => {
                allClusters.add(node.group || 'Other');
                if (graphData.details[node.id]) {
                    allLangs.add(graphData.details[node.id].language || 'Other');
                }
            });
            activeClusterFilters = new Set(allClusters);
            originalNodes = graphData.nodes.map(n => {
                const style = CLUSTER_STYLES[n.group] || CLUSTER_STYLES['Other'];
                return {
                    ...n,
                    color: style.color,
                    font: { color: style.labelColor, size: 12, face: 'Inter' },
                    shape: 'dot',
                    size: 16 + (graphData.details[n.id]?.dependents?.length || 0) * 1.5 // Size based on popularity
                };
            });
            originalEdges = graphData.edges.map(e => ({
                ...e,
                arrows: 'to',
                color: { color: '#334155', highlight: '#6366f1', hover: '#475569' },
                width: 1.2
            }));
            
            nodesDataset = new vis.DataSet(originalNodes);
            edgesDataset = new vis.DataSet(originalEdges);
        }

        function initFilters() {
            clusterFilters.innerHTML = '';
            Array.from(allClusters).sort().forEach(cluster => {
                const isChecked = activeClusterFilters.has(cluster);
                const color = (CLUSTER_STYLES[cluster] || CLUSTER_STYLES['Other']).color.border;
                
                const filterItem = document.createElement('div');
                filterItem.className = 'flex items-center justify-between text-xs text-slate-350 hover:text-white transition-colors';
                filterItem.innerHTML = `
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="filter-${cluster}" checked class="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5" data-cluster="${cluster}">
                        <span class="flex items-center gap-1.5 cursor-pointer" onclick="document.getElementById('filter-${cluster}').click()">
                            <span class="w-2.5 h-2.5 rounded-full inline-block" style="background-color: ${color}"></span>
                            ${cluster}
                        </span>
                    </div>
                    <span class="text-[10px] text-slate-500 font-mono">${graphData.nodes.filter(n => n.group === cluster).length}</span>
                `;
                clusterFilters.appendChild(filterItem);
                
                document.getElementById(`filter-${cluster}`).addEventListener('change', (e) => {
                    if (e.target.checked) {
                        activeClusterFilters.add(cluster);
                    } else {
                        activeClusterFilters.delete(cluster);
                    }
                    filterGraph();
                });
            });
        }

        function renderLegend() {
            langLegend.innerHTML = '';
            Array.from(allLangs).sort().forEach(lang => {
                const color = LANG_COLORS[lang] || LANG_COLORS['Other'];
                const item = document.createElement('div');
                item.className = 'flex items-center gap-1.5';
                item.innerHTML = `
                    <span class="w-2.5 h-2.5 rounded-sm inline-block" style="background-color: ${color}"></span>
                    <span class="text-slate-400 font-medium">${lang}</span>
                `;
                langLegend.appendChild(item);
            });
        }

        function renderStats() {
            statFiles.innerText = graphData.nodes.length;
            statDeps.innerText = graphData.edges.length;
            statLangs.innerText = allLangs.size;
        }

        function filterGraph() {
            const searchQuery = searchInput.value.toLowerCase().trim();
            
            const filteredNodes = originalNodes.filter(node => {
                const matchesCluster = activeClusterFilters.has(node.group || 'Other');
                let matchesSearch = true;
                
                if (searchQuery) {
                    const labelMatches = node.label.toLowerCase().includes(searchQuery);
                    const pathMatches = node.id.toLowerCase().includes(searchQuery);
                    let symbolMatches = false;
                    
                    const details = graphData.details[node.id];
                    if (details) {
                        symbolMatches = (details.functions || []).some(f => f.toLowerCase().includes(searchQuery)) ||
                                        (details.classes_structs || []).some(c => c.toLowerCase().includes(searchQuery));
                    }
                    matchesSearch = labelMatches || pathMatches || symbolMatches;
                }
                
                return matchesCluster && matchesSearch;
            });
            
            const filteredNodeIds = new Set(filteredNodes.map(n => n.id));
            const filteredEdges = originalEdges.filter(edge => {
                return filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to);
            });

            // Re-fill dataset
            nodesDataset.clear();
            nodesDataset.add(filteredNodes);
            edgesDataset.clear();
            edgesDataset.add(filteredEdges);
            
            // Re-apply selection state if node still visible
            if (selectedNodeId && filteredNodeIds.has(selectedNodeId)) {
                highlightDependencies(selectedNodeId);
            } else {
                clearHighlight();
            }
        }

        function buildNetwork() {
            const container = document.getElementById('network-container');
            const data = {
                nodes: nodesDataset,
                edges: edgesDataset
            };
            
            const options = {
                interaction: {
                    hover: true,
                    dragNodes: true,
                    dragView: true,
                    zoomView: true
                },
                physics: {
                    enabled: physicsToggle.checked,
                    solver: 'forceAtlas2Based',
                    forceAtlas2Based: {
                        gravitationalConstant: -26,
                        centralGravity: 0.005,
                        springLength: 120,
                        springConstant: 0.08,
                        damping: 0.4,
                        avoidOverlap: 0.6
                    },
                    stabilization: {
                        iterations: 150,
                        updateInterval: 25
                    }
                },
                edges: {
                    smooth: false,
                    color: {
                        inherit: 'both',
                        opacity: 0.35
                    },
                    width: 1.0
                }
            };
            
            network = new vis.Network(container, data, options);
            
            // Fit screen after animation/layout
            network.once('stabilized', () => {
                network.fit();
                
                // Continuous gentle breathing/floating motion
                let step = 0;
                setInterval(() => {
                    if (physicsToggle && physicsToggle.checked) {
                        step += 0.04;
                        // Slightly oscillate central gravity to keep nodes swaying gently
                        network.setOptions({
                            physics: {
                                forceAtlas2Based: {
                                    centralGravity: 0.005 + Math.sin(step) * 0.0012
                                }
                            }
                        });
                        network.startSimulation();
                    }
                }, 100);
            });

            // Network event handlers
            network.on('click', (params) => {
                if (params.nodes.length > 0) {
                    selectNode(params.nodes[0]);
                } else {
                    deselectNode();
                }
            });

            // Real-time canvas particle flow and pulsing neon halo animations
            let pulseStep = 0;
            let slowPulseStep = 0;
            let fastPulseStep = 0;

            network.on('afterDrawing', (ctx) => {
                if (!particlesToggle || !particlesToggle.checked) return;

                const nodes = nodesDataset.get();
                const nodePositions = network.getPositions(nodes.map(n => n.id));

                // 1. Draw glowing heartbeat halos on nodes
                slowPulseStep = (slowPulseStep + 0.015) % (2 * Math.PI);
                fastPulseStep = (fastPulseStep + 0.07) % (2 * Math.PI);

                ctx.save();
                nodes.forEach(node => {
                    const pos = nodePositions[node.id];
                    if (!pos) return;

                    const isSelected = node.id === selectedNodeId;
                    const details = graphData.details[node.id] || {};
                    const baseStyle = CLUSTER_STYLES[node.group] || CLUSTER_STYLES['Other'];

                    // Hash node id to calculate a unique phase offset so they pulse out of sync
                    let phaseOffset = 0;
                    for (let i = 0; i < node.id.length; i++) {
                        phaseOffset += node.id.charCodeAt(i);
                    }

                    let scale = 1.0;
                    let opacity = 0.35;
                    let lineWidth = 1.2;
                    let shadowBlur = 8;

                    if (isSelected) {
                        scale = 1.1 + Math.sin(fastPulseStep) * 0.4; // Fast, intense pulse when selected
                        opacity = 1.0;
                        lineWidth = 3.0;
                        shadowBlur = 25;
                    } else {
                        scale = 1.0 + Math.sin(slowPulseStep + phaseOffset) * 0.15; // Slow, breathing idle pulse
                        opacity = 0.35;
                        lineWidth = 1.2;
                        shadowBlur = 8;
                    }

                    const size = 16 + (details.dependents || []).length * 1.5;

                    ctx.beginPath();
                    ctx.arc(pos.x, pos.y, size * scale, 0, 2 * Math.PI);
                    ctx.strokeStyle = baseStyle.color.border;
                    ctx.lineWidth = lineWidth;
                    ctx.globalAlpha = opacity;
                    ctx.shadowBlur = shadowBlur;
                    ctx.shadowColor = baseStyle.color.border;
                    ctx.stroke();
                });
                ctx.restore();

                // 2. Draw particle streams flowing on edges (straight lines)
                pulseStep = (pulseStep + 0.5) % 100;
                const edges = edgesDataset.get();
                
                ctx.save();
                edges.forEach(edge => {
                    const isSelectedEdge = selectedNodeId && (edge.from === selectedNodeId || edge.to === selectedNodeId);
                    const isPath = activeHighlightedPath && activeHighlightedPath.has(edge.from) && activeHighlightedPath.has(edge.to);
                    
                    let opacity = 0.2;
                    let particleColor = '#6366f1';
                    let size = 2.5;
                    
                    if (isPath) {
                        opacity = 1.0;
                        particleColor = '#f43f5e'; // Highlighted path gets red particle
                        size = 4.5;
                    } else if (isSelectedEdge) {
                        opacity = 0.8;
                        particleColor = '#38bdf8'; // Direct neighbors get cyan particle
                        size = 3.5;
                    } else if (activeHighlightedPath) {
                        return; // Skip other edges entirely in path trace mode
                    } else if (selectedNodeId) {
                        return; // Skip other edges entirely if node selected
                    }

                    const edgePositions = network.getPositions([edge.from, edge.to]);
                    const fromPos = edgePositions[edge.from];
                    const toPos = edgePositions[edge.to];
                    if (!fromPos || !toPos) return;

                    const t = (pulseStep / 100);
                    const x = fromPos.x + (toPos.x - fromPos.x) * t;
                    const y = fromPos.y + (toPos.y - fromPos.y) * t;

                    ctx.beginPath();
                    ctx.arc(x, y, size, 0, 2 * Math.PI);
                    ctx.fillStyle = particleColor;
                    ctx.globalAlpha = opacity;
                    ctx.shadowBlur = isPath ? 8 : 4;
                    ctx.shadowColor = particleColor;
                    ctx.fill();
                });
                ctx.restore();

                // Keep network rendering frame-by-frame smoothly
                network.requestRedraw();
            });
        }

        function setupEventListeners() {
            // Search Input
            searchInput.addEventListener('input', () => {
                filterGraph();
            });

            // Physics Toggle
            physicsToggle.addEventListener('change', (e) => {
                network.setOptions({ physics: { enabled: e.target.checked } });
            });

            // Reset Button
            resetBtn.addEventListener('click', () => {
                searchInput.value = '';
                physicsToggle.checked = true;
                network.setOptions({ physics: { enabled: true } });
                activeClusterFilters = new Set(allClusters);
                initFilters();
                filterGraph();
                deselectNode();
                network.fit({ animation: true });
                if (colorModeSelect) colorModeSelect.value = 'cluster';
                if (orphanToggle) orphanToggle.checked = false;
                if (pathStartInput) pathStartInput.value = '';
                if (pathEndInput) pathEndInput.value = '';
                applyColorAndStyleModes();
            });

            // Close Inspector
            closeInspectorBtn.addEventListener('click', () => {
                deselectNode();
            });

            // ESC Key Support
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    deselectNode();
                }
            });

            // Copy Path Click
            nodePath.addEventListener('click', () => {
                const pathText = nodePath.innerText;
                navigator.clipboard.writeText(pathText).then(() => {
                    const originalText = nodePath.innerText;
                    nodePath.innerText = 'Copied to Clipboard!';
                    nodePath.style.color = '#34d399';
                    setTimeout(() => {
                        nodePath.innerText = pathText;
                        nodePath.style.color = '';
                    }, 1200);
                });
            });

            // Color Mode Select
            colorModeSelect.addEventListener('change', () => {
                applyColorAndStyleModes();
            });

            // Orphan/Dead Code Toggle
            orphanToggle.addEventListener('change', () => {
                applyColorAndStyleModes();
            });

            // Set Start Node for Path Tracer
            setStartBtn.addEventListener('click', () => {
                if (selectedNodeId) {
                    pathStartInput.value = selectedNodeId;
                } else {
                    alert('Please click on a node in the graph first!');
                }
            });

            // Set End Node for Path Tracer
            setEndBtn.addEventListener('click', () => {
                if (selectedNodeId) {
                    pathEndInput.value = selectedNodeId;
                } else {
                    alert('Please click on a node in the graph first!');
                }
            });

            // Trace Path Button
            tracePathBtn.addEventListener('click', () => {
                const start = pathStartInput.value;
                const end = pathEndInput.value;
                if (!start || !end) {
                    alert('Please specify both Start and End files!');
                    return;
                }
                const path = findShortestPath(start, end);
                if (path) {
                    highlightPath(path);
                } else {
                    alert('No dependency path found between these files!');
                }
            });

            // Clear Trace Button
            clearTraceBtn.addEventListener('click', () => {
                pathStartInput.value = '';
                pathEndInput.value = '';
                applyColorAndStyleModes();
            });

            // Particles Toggle Change
            particlesToggle.addEventListener('change', () => {
                applyColorAndStyleModes();
            });
        }

        function selectNode(nodeId) {
            selectedNodeId = nodeId;
            highlightDependencies(nodeId);
            populateInspector(nodeId);
            inspectorSidebar.classList.remove('translate-x-[500px]');
            inspectorSidebar.classList.add('translate-x-0');
        }

        function deselectNode() {
            selectedNodeId = null;
            clearHighlight();
            inspectorSidebar.classList.remove('translate-x-0');
            inspectorSidebar.classList.add('translate-x-[500px]');
            inspectorDefault.classList.remove('hidden');
            inspectorDetails.classList.add('hidden');
        }

        function highlightDependencies(nodeId) {
            // Find all connected nodes
            const connectedEdges = edgesDataset.get({
                filter: (edge) => edge.from === nodeId || edge.to === nodeId
            });
            
            const neighborNodeIds = new Set([nodeId]);
            connectedEdges.forEach(edge => {
                neighborNodeIds.add(edge.from);
                neighborNodeIds.add(edge.to);
            });

            // Update all nodes opacity
            const nodesToUpdate = nodesDataset.get().map(node => {
                const isNeighbor = neighborNodeIds.has(node.id);
                const isSelected = node.id === nodeId;
                const baseStyle = CLUSTER_STYLES[node.group] || CLUSTER_STYLES['Other'];
                
                return {
                    id: node.id,
                    opacity: isNeighbor ? 1 : 0.15,
                    borderWidth: isSelected ? 4 : 1,
                    color: isSelected ? baseStyle.color.highlight : baseStyle.color
                };
            });
            nodesDataset.update(nodesToUpdate);

            // Update edges opacity
            const edgesToUpdate = edgesDataset.get().map(edge => {
                const isSelectedEdge = edge.from === nodeId || edge.to === nodeId;
                return {
                    id: edge.id,
                    color: isSelectedEdge ? { inherit: 'both', opacity: 1.0 } : { inherit: 'both', opacity: 0.08 },
                    width: isSelectedEdge ? 2.5 : 0.8
                };
            });
            edgesDataset.update(edgesToUpdate);
        }

        function clearHighlight() {
            // Reset opacity and styling
            const nodesToUpdate = nodesDataset.get().map(node => {
                const style = CLUSTER_STYLES[node.group] || CLUSTER_STYLES['Other'];
                return {
                    id: node.id,
                    opacity: 1.0,
                    borderWidth: 1,
                    color: style.color
                };
            });
            nodesDataset.update(nodesToUpdate);

            const edgesToUpdate = edgesDataset.get().map(edge => ({
                id: edge.id,
                color: { inherit: 'both', opacity: 0.35 },
                width: 1.0
            }));
            edgesDataset.update(edgesToUpdate);
        }

        function populateInspector(nodeId) {
            const details = graphData.details[nodeId];
            if (!details) return;

            inspectorDefault.classList.add('hidden');
            inspectorDetails.classList.remove('hidden');

            // Name & Path
            nodeName.innerText = nodeId.split('/').pop();
            nodePath.innerText = nodeId;
            nodeLang.innerText = details.language;
            
            // Cluster Badge
            const cluster = details.cluster || 'Other';
            nodeBadge.innerText = cluster;
            const clusterStyle = CLUSTER_STYLES[cluster] || CLUSTER_STYLES['Other'];
            nodeBadge.style.backgroundColor = clusterStyle.color.background;
            nodeBadge.style.borderColor = clusterStyle.color.border;
            nodeBadge.style.borderWidth = '1px';
            
            // Stats
            statNodeFuncs.innerText = (details.functions || []).length;
            statNodeClasses.innerText = (details.classes_structs || []).length;
            statNodeChurn.innerText = details.churn || 0;

            // Classes & Structs list
            const sectionClasses = document.getElementById('section-classes');
            if (details.classes_structs && details.classes_structs.length > 0) {
                sectionClasses.classList.remove('hidden');
                nodeClasses.innerHTML = details.classes_structs.map(c => 
                    `<span class="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-indigo-300" title="Class/Struct: ${c}">${c}</span>`
                ).join('');
            } else {
                sectionClasses.classList.add('hidden');
            }

            // Functions list
            const sectionFuncs = document.getElementById('section-funcs');
            if (details.functions && details.functions.length > 0) {
                sectionFuncs.classList.remove('hidden');
                nodeFuncs.innerHTML = details.functions.map(f => 
                    `<span class="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-mono text-[10px] text-emerald-300" title="Function: ${f}">${f}</span>`
                ).join('');
            } else {
                sectionFuncs.classList.add('hidden');
            }

            // Imports list
            const sectionImports = document.getElementById('section-imports');
            const localImportsPattern = new RegExp(`shadow-arrow|\.\./|\./|@/`);
            const thirdPartyImports = (details.imports || []).filter(imp => !localImportsPattern.test(imp));
            
            if (thirdPartyImports.length > 0) {
                sectionImports.classList.remove('hidden');
                nodeImports.innerHTML = thirdPartyImports.map(imp => 
                    `<span class="px-2 py-1 bg-slate-900/50 border border-slate-800/80 rounded font-mono text-[10px] text-slate-400" title="Import: ${imp}">${imp.split('/').pop()}</span>`
                ).join('');
            } else {
                sectionImports.classList.add('hidden');
            }

            // Outgoing dependencies files
            if (details.dependencies && details.dependencies.length > 0) {
                nodeDependencies.innerHTML = details.dependencies.map(dep => {
                    const depName = dep.split('/').pop();
                    const depDetails = graphData.details[dep] || {};
                    const depColor = (CLUSTER_STYLES[depDetails.cluster] || CLUSTER_STYLES['Other']).color.border;
                    return `
                        <div class="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-indigo-500 cursor-pointer transition-colors" onclick="selectNodeAndScroll('${dep}')">
                            <span class="flex items-center gap-1.5 truncate">
                                <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: ${depColor}"></span>
                                <span class="font-medium text-slate-300 truncate" title="${dep}">${depName}</span>
                            </span>
                            <span class="text-[10px] text-slate-500 font-mono font-semibold">${depDetails.language || ''}</span>
                        </div>
                    `;
                }).join('');
            } else {
                nodeDependencies.innerHTML = `<span class="text-xs text-slate-500 italic px-1">None</span>`;
            }

            // Incoming dependents files
            if (details.dependents && details.dependents.length > 0) {
                nodeDependents.innerHTML = details.dependents.map(dep => {
                    const depName = dep.split('/').pop();
                    const depDetails = graphData.details[dep] || {};
                    const depColor = (CLUSTER_STYLES[depDetails.cluster] || CLUSTER_STYLES['Other']).color.border;
                    return `
                        <div class="flex items-center justify-between text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded hover:border-indigo-500 cursor-pointer transition-colors" onclick="selectNodeAndScroll('${dep}')">
                            <span class="flex items-center gap-1.5 truncate">
                                <span class="w-1.5 h-1.5 rounded-full inline-block" style="background-color: ${depColor}"></span>
                                <span class="font-medium text-slate-300 truncate" title="${dep}">${depName}</span>
                            </span>
                            <span class="text-[10px] text-slate-500 font-mono font-semibold">${depDetails.language || ''}</span>
                        </div>
                    `;
                }).join('');
            } else {
                nodeDependents.innerHTML = `<span class="text-xs text-slate-500 italic px-1">None</span>`;
            }

            // Safe Code Preview Fetcher
            sectionCode.classList.add('hidden');
            nodeCode.innerText = 'Loading code preview...';
            
            fetch(`/api/code?path=${encodeURIComponent(nodeId)}`)
                .then(res => {
                    if (!res.ok) throw new Error('File not loadable');
                    return res.json();
                })
                .then(data => {
                    if (data.content) {
                        sectionCode.classList.remove('hidden');
                        nodeCode.innerText = data.content;
                    } else {
                        nodeCode.innerText = 'File content is empty';
                    }
                })
                .catch(err => {
                    console.warn('Could not retrieve file preview:', err);
                    nodeCode.innerText = 'Live code preview is unavailable for this node type';
                });
        }

        let activeHighlightedPath = null;

        function findShortestPath(startNode, endNode) {
            let queue = [[startNode]];
            let visited = new Set([startNode]);
            while (queue.length > 0) {
                let path = queue.shift();
                let node = path[path.length - 1];
                if (node === endNode) return path;
                
                let neighbors = graphData.details[node]?.dependencies || [];
                for (let neighbor of neighbors) {
                    if (!visited.has(neighbor)) {
                        visited.add(neighbor);
                        queue.push([...path, neighbor]);
                    }
                }
            }
            return null;
        }

        function highlightPath(path) {
            activeHighlightedPath = new Set(path);
            
            const nodesToUpdate = nodesDataset.get().map(node => {
                const isPathNode = activeHighlightedPath.has(node.id);
                const baseStyle = CLUSTER_STYLES[node.group] || CLUSTER_STYLES['Other'];
                
                return {
                    id: node.id,
                    color: isPathNode ? { background: '#fb7185', border: '#e11d48' } : { background: '#1e293b', border: '#334155' },
                    size: isPathNode ? 24 : 10,
                    opacity: isPathNode ? 1.0 : 0.25,
                    font: { color: isPathNode ? '#ffffff' : 'rgba(255,255,255,0.2)' }
                };
            });
            nodesDataset.update(nodesToUpdate);

            const edgesToUpdate = edgesDataset.get().map(edge => {
                const isPathEdge = activeHighlightedPath.has(edge.from) && activeHighlightedPath.has(edge.to) && 
                                   path.indexOf(edge.to) === path.indexOf(edge.from) + 1;
                return {
                    id: edge.id,
                    color: isPathEdge ? { color: '#e11d48', opacity: 1.0 } : { color: '#1e293b', opacity: 0.15 },
                    width: isPathEdge ? 3.5 : 0.8
                };
            });
            edgesDataset.update(edgesToUpdate);
        }

        function applyColorAndStyleModes() {
            activeHighlightedPath = null;
            const mode = colorModeSelect.value;
            const highlightOrphans = orphanToggle.checked;
            
            let maxChurn = 1;
            Object.values(graphData.details).forEach(d => {
                if (d.churn && d.churn > maxChurn) maxChurn = d.churn;
            });

            function getHotspotColor(churn) {
                if (churn === 0) return { background: '#1e293b', border: '#334155' };
                const ratio = Math.min(1.0, churn / maxChurn);
                if (ratio < 0.3) {
                    return { background: '#d97706', border: '#fbbf24' };
                } else if (ratio < 0.7) {
                    return { background: '#ea580c', border: '#f97316' };
                } else {
                    return { background: '#dc2626', border: '#f87171' };
                }
            }

            const nodesToUpdate = nodesDataset.get().map(node => {
                const details = graphData.details[node.id] || {};
                let color = { background: '#1e293b', border: '#334155' };
                let size = 16 + (details.dependents?.length || 0) * 1.5;
                let labelColor = '#ffffff';
                let opacity = 1.0;

                if (mode === 'cluster') {
                    const style = CLUSTER_STYLES[node.group] || CLUSTER_STYLES['Other'];
                    color = style.color;
                    labelColor = style.labelColor;
                } else if (mode === 'hotspot') {
                    const churn = details.churn || 0;
                    color = getHotspotColor(churn);
                    size = 14 + (churn > 0 ? Math.log(churn + 1) * 6 : 0) + (details.dependents?.length || 0) * 1.0;
                    labelColor = '#ffffff';
                } else if (mode === 'lang') {
                    const lang = details.language || 'Other';
                    const hex = LANG_COLORS[lang] || LANG_COLORS['Other'];
                    color = { background: hex, border: hex };
                    labelColor = '#ffffff';
                }

                if (highlightOrphans) {
                    const isMainEntry = ['main.go', 'page.tsx', 'route.ts', 'layout.tsx', 'next.config.js', 'visualizer.html'].some(entry => 
                        node.id.endsWith(entry)
                    );
                    const isOrphan = (details.dependents || []).length === 0 && !isMainEntry;
                    if (isOrphan) {
                        color = { background: '#ef4444', border: '#f87171' };
                        size = 20;
                    } else {
                        opacity = 0.25;
                    }
                }

                return {
                    id: node.id,
                    color: color,
                    size: size,
                    opacity: opacity,
                    font: { color: labelColor }
                };
            });
            nodesDataset.update(nodesToUpdate);

            const edgesToUpdate = edgesDataset.get().map(edge => ({
                id: edge.id,
                color: { inherit: 'both', opacity: 0.35 },
                width: 1.0
            }));
            edgesDataset.update(edgesToUpdate);
        }

        // Navigate via dependency list
        window.selectNodeAndScroll = function(nodeId) {
            // Focus on node visually in network
            network.selectNodes([nodeId]);
            selectNode(nodeId);
            network.focus(nodeId, {
                scale: 1.0,
                animation: { duration: 600, easingFunction: 'easeInOutQuad' }
            });
            // Scroll inspector header to top
            document.getElementById('inspector-content').scrollTop = 0;
        };

        // File Browser Dropdown Logic
        const fileBrowserDropdown = document.getElementById('file-browser-dropdown');
        if (fileBrowserDropdown && graphData && graphData.details) {
            const files = Object.keys(graphData.details).sort();
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                // Only show filename for cleaner look, or full path if preferred. Using full path since it can be deeply nested.
                option.text = file;
                fileBrowserDropdown.appendChild(option);
            });

            fileBrowserDropdown.addEventListener('change', (e) => {
                const selectedFile = e.target.value;
                if (selectedFile) {
                    window.selectNodeAndScroll(selectedFile);
                }
            });
        }


        // Architecture Flow & Mobile Panel Toggles
        const viewToggleBtn = document.getElementById('view-toggle-btn');
        const architectureContainer = document.getElementById('architecture-container');
        const leftPanel = document.getElementById('left-controls-panel');
        const mobileToggleBtn = document.getElementById('mobile-panel-toggle');

        let isFlowView = false;
        if (viewToggleBtn && architectureContainer) {
            viewToggleBtn.addEventListener('click', () => {
                isFlowView = !isFlowView;
                if (isFlowView) {
                    viewToggleBtn.innerText = 'Show Graph';
                    architectureContainer.classList.remove('hidden');
                    architectureContainer.classList.add('flex');
                } else {
                    viewToggleBtn.innerText = 'Show Flow';
                    architectureContainer.classList.add('hidden');
                    architectureContainer.classList.remove('flex');
                }
            });
        }

        if (mobileToggleBtn && leftPanel) {
            mobileToggleBtn.addEventListener('click', () => {
                if (leftPanel.classList.contains('-translate-x-[120%]')) {
                    leftPanel.classList.remove('-translate-x-[120%]');
                    leftPanel.classList.add('translate-x-0');
                } else {
                    leftPanel.classList.add('-translate-x-[120%]');
                    leftPanel.classList.remove('translate-x-0');
                }
            });
        }

        // Attack Simulator Sound Effects using Web Audio API (Synthesizer)
        let audioCtx = null;

        function initAudio() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
        }

        function playTone(freq, type, duration, delay = 0) {
            initAudio();
            if (!audioCtx) return;
            
            setTimeout(() => {
                try {
                    if (audioCtx.state === 'suspended') {
                        audioCtx.resume();
                    }
                    const osc = audioCtx.createOscillator();
                    const gainNode = audioCtx.createGain();
                    
                    osc.connect(gainNode);
                    gainNode.connect(audioCtx.destination);

                    osc.type = type;
                    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                    
                    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

                    osc.start(audioCtx.currentTime);
                    osc.stop(audioCtx.currentTime + duration);
                } catch(e) {
                    console.log("Audio play blocked/failed:", e);
                }
            }, delay);
        }

        function playClick() {
            playTone(600, 'sine', 0.08);
        }

        function playSuccessSound() {
            playTone(523.25, 'sine', 0.1, 0);   // C5
            playTone(659.25, 'sine', 0.1, 80);  // E5
            playTone(783.99, 'sine', 0.1, 160); // G5
            playTone(1046.5, 'sine', 0.3, 240); // C6
        }

        function playErrorSound() {
            playTone(150, 'sawtooth', 0.3, 0);
            playTone(100, 'sawtooth', 0.4, 100);
        }

        // Simulator Timeline & Packet Animation Logic
        const simulatorDropdown = document.getElementById('attack-simulator');
        let activeTimeouts = [];
        
        function clearAllTimeouts() {
            activeTimeouts.forEach(id => {
                clearTimeout(id);
                cancelAnimationFrame(id);
            });
            activeTimeouts = [];
            // Remove any floating packets
            const packets = document.querySelectorAll('.flow-packet');
            packets.forEach(p => p.remove());
        }

        function resetNodes() {
            clearAllTimeouts();
            
            // Hide stickman stage by default
            const stage = document.getElementById('stickman-stage');
            if (stage) stage.classList.add('hidden');
            
            const allNodes = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-razorpay', 'node-success', 'node-shiprocket', 'node-customer'];
            const allArrows = ['arrow-1', 'arrow-2', 'arrow-3', 'arrow-4', 'arrow-5', 'arrow-6', 'arrow-7'];
            
            allNodes.forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.style.opacity = '';
                    el.classList.remove('animate-glow', 'animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50', 'unlocked-node');
                    el.classList.add('locked-node');
                    
                    // restore original classes and text
                    if(id === 'node-client') { 
                        el.className = "flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Sends Request'; 
                    }
                    if(id === 'node-firewall') { 
                        el.className = "flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-rose-900/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Rate Limit & DDoS Check'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-backend') { 
                        el.className = "flex flex-col items-center bg-indigo-900/50 p-3 sm:p-4 rounded-xl border border-indigo-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Validates Order'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-mongo') { 
                        el.className = "flex flex-col items-center bg-emerald-900/50 p-3 sm:p-4 rounded-xl border border-emerald-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Verifies Real Price'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-razorpay') { 
                        el.className = "flex flex-col items-center bg-blue-900/50 p-3 sm:p-4 rounded-xl border border-blue-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Creates Payment Link'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-success') { 
                        el.className = "flex flex-col items-center bg-green-900/50 p-3 sm:p-4 rounded-xl border border-green-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Order PAID'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-shiprocket') { 
                        el.className = "flex flex-col items-center bg-orange-900/50 p-3 sm:p-4 rounded-xl border border-orange-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Auto Dispatched'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-customer') { 
                        el.className = "flex flex-col items-center bg-purple-900/50 p-3 sm:p-4 rounded-xl border border-purple-500/50 w-full sm:w-36 shadow-lg transition-all locked-node"; 
                        el.querySelector('.status-text').innerText = 'Delivered Safely'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                }
            });
            allArrows.forEach(cls => {
                const els = document.querySelectorAll('.' + cls);
                els.forEach(el => {
                    el.style.opacity = '';
                    el.classList.remove('animate-pulse', 'text-indigo-400', 'text-rose-500', 'text-red-500', 'unlocked-arrow');
                    el.classList.add('locked-arrow', 'text-indigo-500');
                });
            });
        }

        function grayOutFrom(nodeIndex) {
            const allNodes = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-razorpay', 'node-success', 'node-shiprocket', 'node-customer'];
            const allArrows = ['arrow-1', 'arrow-2', 'arrow-3', 'arrow-4', 'arrow-5', 'arrow-6', 'arrow-7'];
            
            allNodes.forEach((id, idx) => {
                if (idx >= nodeIndex) {
                    const el = document.getElementById(id);
                    if (el) {
                        el.classList.remove('unlocked-node');
                        el.classList.add('locked-node');
                        el.style.opacity = '0.08';
                    }
                }
            });
            allArrows.forEach((cls, idx) => {
                if (idx >= (nodeIndex - 1)) {
                    const els = document.querySelectorAll('.' + cls);
                    els.forEach(el => {
                        el.classList.remove('unlocked-arrow');
                        el.classList.add('locked-arrow');
                        el.style.opacity = '0.05';
                    });
                }
            });
        }

        // Animates a traveling packet (emoji) along the nodes and unlocks them sequentially
        function animateFlowPacket(path, emoji, onReachNode, onBlock, onComplete) {
            const container = document.getElementById('architecture-container');
            if (!container) return;

            const packet = document.createElement('div');
            packet.className = 'flow-packet absolute z-[100] text-2xl transition-all duration-[600ms] ease-out pointer-events-none';
            packet.innerText = emoji;
            packet.style.filter = 'drop-shadow(0 0 8px rgba(255,255,255,0.8))';
            container.appendChild(packet);

            let currentStep = 0;

            function moveToNext() {
                if (currentStep >= path.length - 1) {
                    packet.remove();
                    if (onComplete) onComplete();
                    return;
                }

                const fromId = path[currentStep];
                const toId = path[currentStep + 1];

                const fromEl = document.getElementById(fromId);
                const toEl = document.getElementById(toId);
                const containerRect = container.getBoundingClientRect();

                if (fromEl && toEl) {
                    const fromRect = fromEl.getBoundingClientRect();
                    const toRect = toEl.getBoundingClientRect();

                    // Initial position inside container
                    if (currentStep === 0) {
                        packet.style.left = `${fromRect.left - containerRect.left + fromRect.width / 2 - 12}px`;
                        packet.style.top = `${fromRect.top - containerRect.top + fromRect.height / 2 - 12}px`;
                    }

                    // Animate to target node
                    activeTimeouts.push(setTimeout(() => {
                        packet.style.left = `${toRect.left - containerRect.left + toRect.width / 2 - 12}px`;
                        packet.style.top = `${toRect.top - containerRect.top + toRect.height / 2 - 12}px`;
                        
                        // Unlock the arrow pointing to the next node!
                        const arrowClass = 'arrow-' + (currentStep + 1);
                        document.querySelectorAll('.' + arrowClass).forEach(el => {
                            el.classList.remove('locked-arrow');
                            el.classList.add('unlocked-arrow', 'animate-pulse');
                        });
                    }, 50));

                    // Once reached (after transition of 600ms)
                    activeTimeouts.push(setTimeout(() => {
                        // Unlock target node!
                        const targetNode = document.getElementById(toId);
                        if (targetNode) {
                            targetNode.classList.remove('locked-node');
                            targetNode.classList.add('unlocked-node');
                        }
                        
                        // Check if block occurs at this node
                        if (onBlock && onBlock(toId)) {
                            packet.remove(); // Destroy packet on block
                            return;
                        }

                        if (onReachNode) {
                            onReachNode(toId);
                        }

                        currentStep++;
                        moveToNext();
                    }, 650));
                } else {
                    packet.remove();
                }
            }

            moveToNext();
        }

        function runStickmanAnimation(scenario, callback) {
            const char = document.getElementById('stick-character');
            const armLeft = document.getElementById('arm-left');
            const armRight = document.getElementById('arm-right');
            const legLeft = document.getElementById('leg-left');
            const legRight = document.getElementById('leg-right');
            const phoneDevice = document.getElementById('phone-device');
            const phoneGlow = document.getElementById('phone-glow');
            const bubble = document.getElementById('stickman-bubble');
            const statusLabel = document.getElementById('stickman-status-label');

            // Reset character elements
            char.setAttribute('transform', 'translate(-100, 0)');
            char.className = '';
            armLeft.setAttribute('x2', '35');
            armLeft.setAttribute('y2', '70');
            armRight.setAttribute('x2', '65');
            armRight.setAttribute('y2', '70');
            phoneDevice.setAttribute('class', 'opacity-0 transition-opacity duration-300');
            phoneGlow.setAttribute('opacity', '0');
            bubble.style.opacity = '0';
            bubble.style.transform = 'translate(-50%, 0) scale(0.9)';
            
            // Set status
            statusLabel.innerText = "Customer entering the shop...";

            // 1. Walk in from left
            char.classList.add('stickman-walking');
            let startX = -100;
            let targetX = 250;
            if (scenario === 'ddos') {
                targetX = 220; // Position differently for DDoS setup
            }
            let duration = 2000;
            let startTime = null;

            function animateWalk(timestamp) {
                if (!startTime) startTime = timestamp;
                let progress = timestamp - startTime;
                let curX = startX + (targetX - startX) * Math.min(progress / duration, 1);
                char.setAttribute('transform', `translate(${curX}, 0)`);
                if (progress < duration) {
                    const animationId = requestAnimationFrame(animateWalk);
                    activeTimeouts.push(animationId);
                } else {
                    char.classList.remove('stickman-walking');
                    onArrived();
                }
            }
            const animationId = requestAnimationFrame(animateWalk);
            activeTimeouts.push(animationId);

            function onArrived() {
                if (scenario === 'ddos') {
                    // DDoS Attacker uses laptop to flood requests
                    statusLabel.innerText = "Attacker sets up botnet script...";
                    
                    // Modify arms to look like typing on a laptop
                    armLeft.setAttribute('x2', '65'); armLeft.setAttribute('y2', '65');
                    armRight.setAttribute('x2', '65'); armRight.setAttribute('y2', '65');
                    
                    // Show a hacker laptop screen in bubble
                    bubble.innerHTML = `
                        <div class="flex flex-col gap-1 text-left font-mono bg-black text-red-500 border border-red-500 p-2 rounded text-[9px] w-56">
                            <div class="text-[8px] border-b border-red-900 pb-1 text-slate-400"># ddos_exploit.py</div>
                            <div>$ python3 ddos_exploit.py --threads 500</div>
                            <div class="text-yellow-500 animate-pulse">[!] Targeting: https://shadowarrow.in/api/v1/orders/create</div>
                            <div class="text-green-500 font-bold mt-1 text-center animate-pulse">FLOODING REQUESTS...</div>
                        </div>
                    `;
                    bubble.style.opacity = '1';
                    bubble.style.transform = 'translate(-50%, 0) scale(1)';
                    
                    // Spawn spam request packets rapidly!
                    activeTimeouts.push(setTimeout(() => {
                        statusLabel.innerText = "Flooding server with HTTP requests! 🤖";
                        let packetCount = 0;
                        const floodInterval = setInterval(() => {
                            if (packetCount >= 8) {
                                clearInterval(floodInterval);
                                // Fade out stickman interface and trigger actual backend flow
                                bubble.style.opacity = '0';
                                callback();
                                return;
                            }
                            
                            // Create temporary packet emoji shooting out
                            const p = document.createElement('div');
                            p.className = 'flow-packet absolute z-[100] text-xl transition-all duration-[400ms] ease-out pointer-events-none';
                            p.innerText = '🤖';
                            p.style.left = '280px';
                            p.style.top = '100px';
                            document.getElementById('architecture-container').appendChild(p);
                            
                            setTimeout(() => {
                                const clientEl = document.getElementById('node-client');
                                const clientRect = clientEl.getBoundingClientRect();
                                const containerRect = document.getElementById('architecture-container').getBoundingClientRect();
                                p.style.left = `${clientRect.left - containerRect.left + clientRect.width/2 - 10}px`;
                                p.style.top = `${clientRect.top - containerRect.top + clientRect.height/2 - 10}px`;
                            }, 10);
                            
                            setTimeout(() => {
                                p.remove();
                                playTone(120, 'triangle', 0.05);
                            }, 410);
                            
                            packetCount++;
                        }, 180);
                    }, 1200));
                    
                } else if (scenario === 'path_traversal') {
                    // Path Traversal Attack
                    statusLabel.innerText = "Hacker opens terminal to fetch .env...";
                    
                    // Arms typing
                    armLeft.setAttribute('x2', '65'); armLeft.setAttribute('y2', '65');
                    armRight.setAttribute('x2', '65'); armRight.setAttribute('y2', '65');
                    
                    bubble.innerHTML = `
                        <div class="flex flex-col gap-1 text-left font-mono bg-black text-green-500 border border-green-500 p-2 rounded text-[9px] w-56">
                            <div class="text-slate-400">Terminal - root@kali:~</div>
                            <div>$ curl -X POST https://shadowarrow.in/api/v1/orders/create/../../.env</div>
                            <div class="text-yellow-500 font-bold animate-pulse">Sending Traversal Payload...</div>
                        </div>
                    `;
                    bubble.style.opacity = '1';
                    bubble.style.transform = 'translate(-50%, 0) scale(1)';
                    
                    activeTimeouts.push(setTimeout(() => {
                        // Left arm clicks enter
                        armLeft.setAttribute('y2', '75');
                        playTone(300, 'sine', 0.1);
                        
                        setTimeout(() => {
                            armLeft.setAttribute('y2', '65');
                            statusLabel.innerText = "Exploit request sent to server! 💀";
                            
                            // Shoot skull packet
                            const p = document.createElement('div');
                            p.className = 'flow-packet absolute z-[100] text-xl transition-all duration-[600ms] ease-out pointer-events-none';
                            p.innerText = '💀';
                            p.style.left = '280px';
                            p.style.top = '100px';
                            document.getElementById('architecture-container').appendChild(p);
                            
                            setTimeout(() => {
                                const clientEl = document.getElementById('node-client');
                                const clientRect = clientEl.getBoundingClientRect();
                                const containerRect = document.getElementById('architecture-container').getBoundingClientRect();
                                p.style.left = `${clientRect.left - containerRect.left + clientRect.width/2 - 10}px`;
                                p.style.top = `${clientRect.top - containerRect.top + clientRect.height/2 - 10}px`;
                            }, 10);
                            
                            setTimeout(() => {
                                p.remove();
                                bubble.style.opacity = '0';
                                callback();
                            }, 610);
                            
                        }, 200);
                    }, 1500));
                    
                } else {
                    // normal secure online / COD or price hack (smartphone flows)
                    statusLabel.innerText = "Customer takes out phone...";
                    
                    // Right arm holds phone
                    armRight.setAttribute('x2', '65');
                    armRight.setAttribute('y2', '60');
                    phoneDevice.classList.replace('opacity-0', 'opacity-100');
                    
                    activeTimeouts.push(setTimeout(() => {
                        // Open storefront
                        statusLabel.innerText = "Browsing Shadow Arrow website...";
                        
                        bubble.innerHTML = `
                            <div class="flex flex-col gap-1 text-left w-52">
                                <div class="flex items-center justify-between border-b border-indigo-900 pb-1 mb-0.5">
                                    <span class="font-bold text-indigo-300 text-[9px] tracking-wide">SHADOW ARROW STORE</span>
                                    <span class="text-[7px] bg-emerald-500/20 text-emerald-400 px-1 rounded">HTTPS</span>
                                </div>
                                <div class="text-[10px] text-white font-semibold">🛒 Shadow Arrow Stealth Hoodie</div>
                                <div class="flex justify-between items-center text-[9px] mt-0.5">
                                    <span class="text-indigo-400 font-bold">₹1,499</span>
                                    <span class="text-emerald-400 text-[8px] font-bold">In Stock</span>
                                </div>
                                <button id="stick-action-btn-1" class="w-full bg-indigo-600 text-white rounded text-[9px] py-1 font-bold mt-1.5 shadow-md shadow-indigo-600/20 text-center select-none cursor-pointer">
                                    ADD & CHECKOUT
                                </button>
                            </div>
                        `;
                        bubble.style.opacity = '1';
                        bubble.style.transform = 'translate(-50%, 0) scale(1)';
                        
                        activeTimeouts.push(setTimeout(() => {
                            // Left arm clicks checkout
                            statusLabel.innerText = "Tapping add-to-cart...";
                            armLeft.setAttribute('x2', '62');
                            armLeft.setAttribute('y2', '65');
                            playTone(400, 'sine', 0.05);
                            
                            setTimeout(() => {
                                armLeft.setAttribute('x2', '35');
                                armLeft.setAttribute('y2', '70');
                                
                                // Show checkout screen
                                showCheckoutDetails();
                            }, 200);
                        }, 1200));
                    }, 800));
                }
            }

            function showCheckoutDetails() {
                if (scenario === 'price_hack') {
                    statusLabel.innerText = "Intercepting request using Proxy Hack Tool... 😈";
                    
                    bubble.innerHTML = `
                        <div class="flex flex-col gap-1 text-left w-52 bg-slate-900 border border-rose-500/40 p-1.5 rounded">
                            <div class="text-[8px] text-rose-400 font-mono font-bold tracking-wide uppercase border-b border-rose-900 pb-0.5 mb-1">
                                ⚠️ Request Intercepted
                            </div>
                            <div class="text-[9px] font-mono text-slate-300">POST /api/v1/orders/create</div>
                            <div class="text-[8px] font-mono bg-slate-950 p-1 rounded mt-0.5">
                                <span class="text-slate-400">"total_amount": </span>
                                <span class="text-rose-500 line-through">1499.00</span>
                                <span class="text-emerald-400 font-bold">1.00</span>
                            </div>
                            <button id="stick-action-btn-2" class="w-full bg-rose-700 text-white rounded text-[9px] py-1 font-bold mt-1 text-center font-mono animate-pulse">
                                INJECT PRICE TAMPER & SUBMIT
                            </button>
                        </div>
                    `;
                    
                    activeTimeouts.push(setTimeout(() => {
                        statusLabel.innerText = "Injecting tampered price (₹1.00)...";
                        armLeft.setAttribute('x2', '62');
                        armLeft.setAttribute('y2', '65');
                        playTone(180, 'sawtooth', 0.1);
                        
                        setTimeout(() => {
                            armLeft.setAttribute('x2', '35');
                            armLeft.setAttribute('y2', '70');
                            
                            bubble.innerHTML = `
                                <div class="flex flex-col items-center justify-center p-2 text-center">
                                    <span class="text-xl">😈</span>
                                    <div class="text-[10px] font-bold text-rose-500 mt-1">TAMPERED ORDER INJECTED!</div>
                                    <div class="text-[8px] text-slate-500">Price: ₹1.00</div>
                                </div>
                            `;
                            
                            shootOrderPacket('💰');
                        }, 250);
                    }, 1800));
                    
                } else {
                    // normal secure flows: prepaid/online or COD
                    const payMethodName = scenario === 'cod' ? 'Cash On Delivery (COD)' : 'Prepaid (Online Payment)';
                    const payBtnText = scenario === 'cod' ? '⚡ PLACE COD ORDER' : '💳 PLACE ORDER (RAZORPAY)';
                    statusLabel.innerText = "Reviewing shipping and payment details...";
                    
                    bubble.innerHTML = `
                        <div class="flex flex-col gap-1 text-left w-52">
                            <div class="flex items-center justify-between border-b border-indigo-900 pb-0.5 mb-1">
                                <span class="font-bold text-indigo-300 text-[9px]">SHADOW ARROW - CHECKOUT</span>
                                <span class="text-[8px] text-slate-400">Total: ₹1,499</span>
                            </div>
                            <div class="text-[8px] text-slate-400">Name: <span class="text-white font-medium">Bijoy Lohar</span></div>
                            <div class="text-[8px] text-slate-400">Addr: <span class="text-white font-medium">Bankura, PIN: 722157</span></div>
                            <div class="text-[8px] text-slate-400">Pay via: <span class="text-emerald-400 font-bold">${payMethodName}</span></div>
                            
                            <button id="stick-action-btn-2" class="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] py-1 mt-1 font-bold text-center select-none cursor-pointer">
                                ${payBtnText}
                            </button>
                        </div>
                    `;
                    
                    activeTimeouts.push(setTimeout(() => {
                        statusLabel.innerText = "Tapping place order button...";
                        armLeft.setAttribute('x2', '62');
                        armLeft.setAttribute('y2', '65');
                        playTone(523.25, 'sine', 0.08); // C5 tick
                        
                        setTimeout(() => {
                            armLeft.setAttribute('x2', '35');
                            armLeft.setAttribute('y2', '70');
                            
                            bubble.innerHTML = `
                                <div class="flex flex-col items-center justify-center p-2 text-center">
                                    <span class="text-xl">🎉</span>
                                    <div class="text-[10px] font-bold text-emerald-400 mt-1">ORDER PLACED!</div>
                                    <div class="text-[7px] text-slate-500">Verifying on secure server...</div>
                                </div>
                            `;
                            
                            shootOrderPacket(scenario === 'cod' ? '📦' : '🛒');
                        }, 250);
                    }, 1800));
                }
            }

            function shootOrderPacket(emoji) {
                // Glow phone screen
                phoneGlow.setAttribute('opacity', '0.6');
                phoneGlow.setAttribute('class', 'phone-glow-active');
                
                statusLabel.innerText = "Order submitted! Connecting to gateway... 📡";
                
                activeTimeouts.push(setTimeout(() => {
                    // Create floating packet emoji starting from stickman phone area
                    const p = document.createElement('div');
                    p.className = 'flow-packet absolute z-[100] text-2xl transition-all duration-[800ms] ease-out pointer-events-none';
                    p.innerText = emoji;
                    p.style.filter = 'drop-shadow(0 0 8px rgba(99,102,241,0.8))';
                    p.style.left = '310px';
                    p.style.top = '90px';
                    document.getElementById('architecture-container').appendChild(p);
                    
                    // Animate packet to the Client box (node-client)
                    setTimeout(() => {
                        const clientEl = document.getElementById('node-client');
                        const clientRect = clientEl.getBoundingClientRect();
                        const containerRect = document.getElementById('architecture-container').getBoundingClientRect();
                        p.style.left = `${clientRect.left - containerRect.left + clientRect.width/2 - 12}px`;
                        p.style.top = `${clientRect.top - containerRect.top + clientRect.height/2 - 12}px`;
                    }, 20);
                    
                    setTimeout(() => {
                        p.remove();
                        // Hide stickman bubble and trigger callback
                        bubble.style.opacity = '0';
                        callback();
                    }, 820);
                    
                }, 800));
            }
        }

        function applyHack(scenario) {
            resetNodes();
            initAudio();

            if (scenario === 'select') {
                return;
            }

            // Show Stickman Stage
            const stage = document.getElementById('stickman-stage');
            if (stage) {
                stage.classList.remove('hidden');
                stage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Run Stickman animation first
            runStickmanAnimation(scenario, () => {
                // Stickman animation is complete! Start node path traversal.
                
                // First unlock client node
                const clientNode = document.getElementById('node-client');
                if (clientNode) {
                    clientNode.classList.remove('locked-node');
                    clientNode.classList.add('unlocked-node', 'animate-glow');
                    playClick();
                }

                let path = [];
                let emoji = '🛒';

                if (scenario === 'none') {
                    // Online Flow: Client -> Firewall -> Backend -> Mongo -> Razorpay -> Success -> Shiprocket -> Customer
                    path = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-razorpay', 'node-success', 'node-shiprocket', 'node-customer'];
                    emoji = '🛒';
                } else if (scenario === 'cod') {
                    // COD Flow: Skip Razorpay
                    path = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-success', 'node-shiprocket', 'node-customer'];
                    emoji = '📦';
                } else if (scenario === 'ddos') {
                    path = ['node-client', 'node-firewall'];
                    emoji = '🤖';
                } else if (scenario === 'path_traversal') {
                    path = ['node-client', 'node-firewall'];
                    emoji = '💀';
                } else if (scenario === 'price_hack') {
                    path = ['node-client', 'node-firewall', 'node-backend', 'node-mongo'];
                    emoji = '💰';
                }

                // Start flow simulation
                activeTimeouts.push(setTimeout(() => {
                    animateFlowPacket(
                        path,
                        emoji,
                        // On reach node
                        (nodeId) => {
                            const el = document.getElementById(nodeId);
                            if (el) {
                                el.classList.remove('locked-node');
                                el.classList.add('unlocked-node', 'animate-glow');
                                
                                // Specific node status updates
                                if (nodeId === 'node-firewall') {
                                    el.querySelector('.status-text').innerText = 'Verified IP & Rate Limit ✅';
                                    playTone(440, 'sine', 0.08); // A4 tick
                                } else if (nodeId === 'node-backend') {
                                    el.querySelector('.status-text').innerText = 'Sanitized Body ✅';
                                    playTone(493.88, 'sine', 0.08); // B4 tick
                                } else if (nodeId === 'node-mongo') {
                                    el.querySelector('.status-text').innerText = 'Price Verified ✅';
                                    playTone(523.25, 'sine', 0.08); // C5 tick
                                } else if (nodeId === 'node-razorpay') {
                                    el.querySelector('.status-text').innerText = 'Payment Successful ✅';
                                    playTone(587.33, 'sine', 0.1); // D5 tick
                                } else if (nodeId === 'node-success') {
                                    if (scenario === 'cod') {
                                        el.querySelector('.status-text').innerText = 'COD ORDER PLACED (UNPAID) ✅';
                                    } else {
                                        el.querySelector('.status-text').innerText = 'PAID SUCCESS ✅';
                                    }
                                    playSuccessSound();
                                } else if (nodeId === 'node-shiprocket') {
                                    el.querySelector('.status-text').innerText = 'Tracking Created ✅';
                                    playTone(698.46, 'sine', 0.1); // F5
                                } else if (nodeId === 'node-customer') {
                                    el.querySelector('.status-text').innerText = 'Order Delivered! 🎉';
                                    playSuccessSound();
                                } else {
                                    el.querySelector('.status-text').innerText = 'Order Delivered Safely! 🎉';
                                    playSuccessSound();
                                }
                            }
                        },
                        // On Block
                        (nodeId) => {
                            if (nodeId === 'node-firewall' && (scenario === 'ddos' || scenario === 'path_traversal')) {
                                const fw = document.getElementById('node-firewall');
                                if (fw) {
                                    fw.style.opacity = '1';
                                    fw.classList.remove('locked-node');
                                    fw.classList.add('unlocked-node', 'animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50');
                                    const text = fw.querySelector('.status-text');
                                    text.innerText = scenario === 'ddos' ? 'DDoS BLOCKED (Limit Exceeded) ❌' : 'ACCESS DENIED (Sensitive File Attack) ❌';
                                    text.className = 'text-[10px] sm:text-xs text-red-500 mt-1 status-text font-bold';
                                }
                                playErrorSound();
                                grayOutFrom(2);
                                return true; // Blocked
                            }
                            if (nodeId === 'node-mongo' && scenario === 'price_hack') {
                                const mongo = document.getElementById('node-mongo');
                                if (mongo) {
                                    mongo.style.opacity = '1';
                                    mongo.classList.remove('locked-node');
                                    mongo.classList.add('unlocked-node', 'animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50');
                                    const text = mongo.querySelector('.status-text');
                                    text.innerText = 'HACK REJECTED (Price Tampered) ❌';
                                    text.className = 'text-[10px] sm:text-xs text-red-500 mt-1 status-text font-bold';
                                }
                                playErrorSound();
                                grayOutFrom(4);
                                return true; // Blocked
                            }
                            return false;
                        },
                        // On Complete
                        () => {
                            console.log("Simulation complete!");
                            document.getElementById('stickman-status-label').innerText = "Simulation complete! All systems operational. ✅";
                        }
                    );
                }, 1000));
            });
        }

        if (simulatorDropdown) {
            simulatorDropdown.addEventListener('change', (e) => {
                applyHack(e.target.value);
            });
        }
    </script>
</body>
</html>
"""
