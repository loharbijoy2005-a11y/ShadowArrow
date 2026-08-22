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
                        <option value="none">🟢 Normal Secure Flow (Online Payment)</option>
                        <option value="cod">🟢 Normal Secure Flow (Cash On Delivery - COD)</option>
                        <option value="price_hack">🔴 Simulate Price Tampering (Proxy Hack)</option>
                        <option value="ddos">🔴 Simulate DDoS / Bot Attack</option>
                        <option value="path_traversal">🔴 Simulate Sensitive File Hack (.env)</option>
                    </select>
                </div>

                <!-- ROW 1 -->
                <div class="flex flex-col sm:flex-row items-center justify-center w-full gap-2 sm:gap-4">
                    <div id="node-client" class="flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🧑‍💻</div>
                        <div class="text-xs sm:text-sm font-semibold text-white">Client</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Sends Request</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-1">➔</div>
                    
                    <div id="node-firewall" class="flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-rose-900/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🛡️</div>
                        <div class="text-xs sm:text-sm font-semibold text-rose-400">Security Firewall</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Rate Limit & DDoS Check</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-2">➔</div>

                    <div id="node-backend" class="flex flex-col items-center bg-indigo-900/50 p-3 sm:p-4 rounded-xl border border-indigo-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">⚙️</div>
                        <div class="text-xs sm:text-sm font-semibold text-indigo-300">Go Backend</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Validates Order</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-3">➔</div>

                    <div id="node-mongo" class="flex flex-col items-center bg-emerald-900/50 p-3 sm:p-4 rounded-xl border border-emerald-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🗄️</div>
                        <div class="text-xs sm:text-sm font-semibold text-emerald-300">MongoDB</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Verifies Real Price</div>
                    </div>
                </div>
                
                <div class="my-4 sm:my-6 text-indigo-500 text-xl sm:text-2xl arrow-4">⬇</div>

                <!-- ROW 2 -->
                <div class="flex flex-col sm:flex-row items-center justify-center w-full gap-2 sm:gap-4">
                    <div id="node-razorpay" class="flex flex-col items-center bg-blue-900/50 p-3 sm:p-4 rounded-xl border border-blue-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">💳</div>
                        <div class="text-xs sm:text-sm font-semibold text-blue-300">Razorpay</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Creates Payment Link</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-5">➔</div>
                    
                    <div id="node-success" class="flex flex-col items-center bg-green-900/50 p-3 sm:p-4 rounded-xl border border-green-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">✅</div>
                        <div class="text-xs sm:text-sm font-semibold text-green-300">Success</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Order PAID</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-6">➔</div>

                    <div id="node-shiprocket" class="flex flex-col items-center bg-orange-900/50 p-3 sm:p-4 rounded-xl border border-orange-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">📦</div>
                        <div class="text-xs sm:text-sm font-semibold text-orange-300">Shiprocket</div>
                        <div class="text-[10px] sm:text-xs text-slate-400 mt-1 status-text">Auto Dispatched</div>
                    </div>
                    <div class="text-indigo-500 text-xl sm:text-2xl rotate-90 sm:rotate-0 py-1 sm:py-0 arrow-7">➔</div>

                    <div id="node-customer" class="flex flex-col items-center bg-purple-900/50 p-3 sm:p-4 rounded-xl border border-purple-500/50 w-full sm:w-36 shadow-lg transition-colors">
                        <div class="text-2xl sm:text-3xl mb-1 sm:mb-2">🏠</div>
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
        const graphData = {"nodes": [{"id": "admin-dashboard/build-graph.js", "label": "build-graph.js", "group": "Other"}, {"id": "admin-dashboard/next-env.d.ts", "label": "next-env.d.ts", "group": "Other"}, {"id": "admin-dashboard/next.config.js", "label": "next.config.js", "group": "Main/Entry"}, {"id": "admin-dashboard/postcss.config.js", "label": "postcss.config.js", "group": "Utilities/Config"}, {"id": "admin-dashboard/tailwind.config.js", "label": "tailwind.config.js", "group": "Main/Entry"}, {"id": "admin-dashboard/app/layout.tsx", "label": "layout.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/abandoned-carts/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/activity-logs/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/analytics/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/api/code/route.ts", "label": "route.ts", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/cms/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/code-graph/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/coupons/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/customers/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/device-preview/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/loyalty/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/orders/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/products/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/settings/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/shipping/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/app/tickets/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "admin-dashboard/components/InvoiceModal.tsx", "label": "InvoiceModal.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/components/Navigation.tsx", "label": "Navigation.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/components/ProductModal.tsx", "label": "ProductModal.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/components/ThemeCustomizerModal.tsx", "label": "ThemeCustomizerModal.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/components/ThermalLabelModal.tsx", "label": "ThermalLabelModal.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/context/ThemeContext.tsx", "label": "ThemeContext.tsx", "group": "Components/Context"}, {"id": "admin-dashboard/lib/auditLogger.ts", "label": "auditLogger.ts", "group": "Utilities/Config"}, {"id": "backend/main.go", "label": "main.go", "group": "Main/Entry"}, {"id": "backend/config/config.go", "label": "config.go", "group": "Utilities/Config"}, {"id": "backend/cron/coin_cron.go", "label": "coin_cron.go", "group": "Services/Middleware"}, {"id": "backend/db/mongodb.go", "label": "mongodb.go", "group": "DB Models"}, {"id": "backend/handlers/admin_handler.go", "label": "admin_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/ai_proxy_handler.go", "label": "ai_proxy_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/cart_handler.go", "label": "cart_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/cms_handler.go", "label": "cms_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/coin_handler.go", "label": "coin_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/coupon_handler.go", "label": "coupon_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/order_handler.go", "label": "order_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/product_handler.go", "label": "product_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/settings_handler.go", "label": "settings_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/ticket_handler.go", "label": "ticket_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/handlers/user_handler.go", "label": "user_handler.go", "group": "Controllers/Handlers"}, {"id": "backend/middleware/auth_middleware.go", "label": "auth_middleware.go", "group": "Services/Middleware"}, {"id": "backend/middleware/cors_middleware.go", "label": "cors_middleware.go", "group": "Services/Middleware"}, {"id": "backend/middleware/security.go", "label": "security.go", "group": "Services/Middleware"}, {"id": "backend/models/cart.go", "label": "cart.go", "group": "DB Models"}, {"id": "backend/models/coin_transaction.go", "label": "coin_transaction.go", "group": "DB Models"}, {"id": "backend/models/coupon.go", "label": "coupon.go", "group": "DB Models"}, {"id": "backend/models/order.go", "label": "order.go", "group": "DB Models"}, {"id": "backend/models/product.go", "label": "product.go", "group": "DB Models"}, {"id": "backend/models/site_settings.go", "label": "site_settings.go", "group": "DB Models"}, {"id": "backend/models/ticket.go", "label": "ticket.go", "group": "DB Models"}, {"id": "backend/models/user.go", "label": "user.go", "group": "DB Models"}, {"id": "backend/seed/seed.go", "label": "seed.go", "group": "Other"}, {"id": "backend/utils/jwt.go", "label": "jwt.go", "group": "Utilities/Config"}, {"id": "backend/utils/razorpay.go", "label": "razorpay.go", "group": "Utilities/Config"}, {"id": "backend/utils/shiprocket.go", "label": "shiprocket.go", "group": "Utilities/Config"}, {"id": "python_service/backend_client.py", "label": "backend_client.py", "group": "Other"}, {"id": "python_service/config.py", "label": "config.py", "group": "Utilities/Config"}, {"id": "python_service/gemini_service.py", "label": "gemini_service.py", "group": "Other"}, {"id": "python_service/main.py", "label": "main.py", "group": "Main/Entry"}, {"id": "python_service/services/backend_client.py", "label": "backend_client.py", "group": "Services/Middleware"}, {"id": "python_service/services/gemini_service.py", "label": "gemini_service.py", "group": "Services/Middleware"}, {"id": "python_service/services/__init__.py", "label": "__init__.py", "group": "Services/Middleware"}, {"id": "scripts/code_graph/generate_graph.py", "label": "generate_graph.py", "group": "Other"}, {"id": "scripts/code_graph/search_context.py", "label": "search_context.py", "group": "Other"}, {"id": "scripts/code_graph/visualizer_template.py", "label": "visualizer_template.py", "group": "Other"}, {"id": "storefront/next-env.d.ts", "label": "next-env.d.ts", "group": "Other"}, {"id": "storefront/next.config.js", "label": "next.config.js", "group": "Main/Entry"}, {"id": "storefront/postcss.config.js", "label": "postcss.config.js", "group": "Utilities/Config"}, {"id": "storefront/tailwind.config.js", "label": "tailwind.config.js", "group": "Main/Entry"}, {"id": "storefront/app/layout.tsx", "label": "layout.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/account/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/account/login/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/account/register/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/checkout/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/order-confirmation/[id]/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/faq/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/privacy/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/returns/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/rewards/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/shipping/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/policies/terms/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/product/[id]/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/rewards/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/app/track-order/page.tsx", "label": "page.tsx", "group": "Routes/Endpoints"}, {"id": "storefront/components/AIChatWindow.tsx", "label": "AIChatWindow.tsx", "group": "Components/Context"}, {"id": "storefront/components/CartDrawer.tsx", "label": "CartDrawer.tsx", "group": "Components/Context"}, {"id": "storefront/components/CartToast.tsx", "label": "CartToast.tsx", "group": "Components/Context"}, {"id": "storefront/components/FAQSection.tsx", "label": "FAQSection.tsx", "group": "Components/Context"}, {"id": "storefront/components/FloatingCartBar.tsx", "label": "FloatingCartBar.tsx", "group": "Components/Context"}, {"id": "storefront/components/Footer.tsx", "label": "Footer.tsx", "group": "Components/Context"}, {"id": "storefront/components/GalaxyVFXBackground.tsx", "label": "GalaxyVFXBackground.tsx", "group": "Components/Context"}, {"id": "storefront/components/GSTBadgeTooltip.tsx", "label": "GSTBadgeTooltip.tsx", "group": "Components/Context"}, {"id": "storefront/components/Header.tsx", "label": "Header.tsx", "group": "Components/Context"}, {"id": "storefront/components/MobileBottomNav.tsx", "label": "MobileBottomNav.tsx", "group": "Components/Context"}, {"id": "storefront/components/ProductCard.tsx", "label": "ProductCard.tsx", "group": "Components/Context"}, {"id": "storefront/components/SizeGuideModal.tsx", "label": "SizeGuideModal.tsx", "group": "Components/Context"}, {"id": "storefront/components/SupportWidgetModal.tsx", "label": "SupportWidgetModal.tsx", "group": "Components/Context"}, {"id": "storefront/components/TaxInvoiceModal.tsx", "label": "TaxInvoiceModal.tsx", "group": "Components/Context"}, {"id": "storefront/components/ThemeProvider.tsx", "label": "ThemeProvider.tsx", "group": "Components/Context"}, {"id": "storefront/components/ThermalInvoiceModal.tsx", "label": "ThermalInvoiceModal.tsx", "group": "Components/Context"}, {"id": "storefront/components/TrackOrderBubbleModal.tsx", "label": "TrackOrderBubbleModal.tsx", "group": "Components/Context"}, {"id": "storefront/components/TruckOrderButton.tsx", "label": "TruckOrderButton.tsx", "group": "Components/Context"}, {"id": "storefront/context/CartContext.tsx", "label": "CartContext.tsx", "group": "Components/Context"}, {"id": "storefront/lib/firebase.ts", "label": "firebase.ts", "group": "Utilities/Config"}, {"id": "storefront/public/theme-loader.js", "label": "theme-loader.js", "group": "Other"}, {"id": "storefront/utils/downloadInvoicePDF.ts", "label": "downloadInvoicePDF.ts", "group": "Utilities/Config"}], "edges": [{"from": "admin-dashboard/app/layout.tsx", "to": "admin-dashboard/components/ThemeCustomizerModal.tsx"}, {"from": "admin-dashboard/app/layout.tsx", "to": "admin-dashboard/context/ThemeContext.tsx"}, {"from": "admin-dashboard/app/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/abandoned-carts/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/activity-logs/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/analytics/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/cms/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/code-graph/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/coupons/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/customers/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/loyalty/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/orders/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/orders/page.tsx", "to": "admin-dashboard/components/InvoiceModal.tsx"}, {"from": "admin-dashboard/app/orders/page.tsx", "to": "admin-dashboard/components/ThermalLabelModal.tsx"}, {"from": "admin-dashboard/app/products/page.tsx", "to": "admin-dashboard/components/ProductModal.tsx"}, {"from": "admin-dashboard/app/products/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/settings/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/shipping/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/app/tickets/page.tsx", "to": "admin-dashboard/components/Navigation.tsx"}, {"from": "admin-dashboard/components/Navigation.tsx", "to": "admin-dashboard/context/ThemeContext.tsx"}, {"from": "admin-dashboard/components/Navigation.tsx", "to": "admin-dashboard/lib/auditLogger.ts"}, {"from": "admin-dashboard/components/ThemeCustomizerModal.tsx", "to": "admin-dashboard/context/ThemeContext.tsx"}, {"from": "backend/main.go", "to": "backend/seed/seed.go"}, {"from": "backend/main.go", "to": "backend/handlers/ticket_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/coin_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/admin_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/order_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/cart_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/coupon_handler.go"}, {"from": "backend/main.go", "to": "backend/handlers/product_handler.go"}, {"from": "backend/main.go", "to": "backend/db/mongodb.go"}, {"from": "backend/main.go", "to": "backend/handlers/cms_handler.go"}, {"from": "backend/main.go", "to": "backend/config/config.go"}, {"from": "backend/main.go", "to": "backend/handlers/settings_handler.go"}, {"from": "backend/main.go", "to": "backend/cron/coin_cron.go"}, {"from": "backend/main.go", "to": "backend/middleware/security.go"}, {"from": "backend/main.go", "to": "backend/handlers/ai_proxy_handler.go"}, {"from": "backend/main.go", "to": "backend/middleware/cors_middleware.go"}, {"from": "backend/main.go", "to": "backend/middleware/auth_middleware.go"}, {"from": "backend/main.go", "to": "backend/handlers/user_handler.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/product.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/ticket.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/user.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/db/mongodb.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/site_settings.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/cart.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/order.go"}, {"from": "backend/cron/coin_cron.go", "to": "backend/models/coupon.go"}, {"from": "backend/db/mongodb.go", "to": "backend/config/config.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/utils/shiprocket.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/utils/jwt.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/utils/razorpay.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/config/config.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/admin_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/ai_proxy_handler.go", "to": "backend/config/config.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/cart_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/cms_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/coin_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/coupon_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/utils/shiprocket.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/utils/jwt.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/utils/razorpay.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/config/config.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/order_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/product_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/settings_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/ticket_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/product.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/ticket.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/user.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/db/mongodb.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/site_settings.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/cart.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/order.go"}, {"from": "backend/handlers/user_handler.go", "to": "backend/models/coupon.go"}, {"from": "backend/middleware/auth_middleware.go", "to": "backend/utils/shiprocket.go"}, {"from": "backend/middleware/auth_middleware.go", "to": "backend/config/config.go"}, {"from": "backend/middleware/auth_middleware.go", "to": "backend/utils/razorpay.go"}, {"from": "backend/middleware/auth_middleware.go", "to": "backend/utils/jwt.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/product.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/ticket.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/user.go"}, {"from": "backend/seed/seed.go", "to": "backend/db/mongodb.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/site_settings.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/cart.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/order.go"}, {"from": "backend/seed/seed.go", "to": "backend/models/coupon.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/product.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/ticket.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/user.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/cart.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/site_settings.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/coin_transaction.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/order.go"}, {"from": "backend/utils/shiprocket.go", "to": "backend/models/coupon.go"}, {"from": "python_service/backend_client.py", "to": "python_service/config.py"}, {"from": "python_service/gemini_service.py", "to": "python_service/config.py"}, {"from": "python_service/gemini_service.py", "to": "python_service/backend_client.py"}, {"from": "python_service/main.py", "to": "python_service/gemini_service.py"}, {"from": "python_service/main.py", "to": "python_service/config.py"}, {"from": "python_service/services/backend_client.py", "to": "python_service/config.py"}, {"from": "python_service/services/gemini_service.py", "to": "python_service/services/backend_client.py"}, {"from": "python_service/services/gemini_service.py", "to": "python_service/config.py"}, {"from": "storefront/app/layout.tsx", "to": "storefront/components/Footer.tsx"}, {"from": "storefront/app/layout.tsx", "to": "storefront/components/ThemeProvider.tsx"}, {"from": "storefront/app/layout.tsx", "to": "storefront/components/TrackOrderBubbleModal.tsx"}, {"from": "storefront/app/layout.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/app/layout.tsx", "to": "storefront/components/CartToast.tsx"}, {"from": "storefront/app/layout.tsx", "to": "storefront/components/CartDrawer.tsx"}, {"from": "storefront/app/page.tsx", "to": "storefront/components/GalaxyVFXBackground.tsx"}, {"from": "storefront/app/page.tsx", "to": "storefront/components/MobileBottomNav.tsx"}, {"from": "storefront/app/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/page.tsx", "to": "storefront/components/AIChatWindow.tsx"}, {"from": "storefront/app/page.tsx", "to": "storefront/components/ProductCard.tsx"}, {"from": "storefront/app/account/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/account/page.tsx", "to": "storefront/components/MobileBottomNav.tsx"}, {"from": "storefront/app/account/page.tsx", "to": "storefront/utils/downloadInvoicePDF.ts"}, {"from": "storefront/app/account/login/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/account/login/page.tsx", "to": "storefront/lib/firebase.ts"}, {"from": "storefront/app/account/register/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/account/register/page.tsx", "to": "storefront/lib/firebase.ts"}, {"from": "storefront/app/checkout/page.tsx", "to": "storefront/components/TruckOrderButton.tsx"}, {"from": "storefront/app/checkout/page.tsx", "to": "storefront/components/MobileBottomNav.tsx"}, {"from": "storefront/app/checkout/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/checkout/page.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/app/checkout/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/order-confirmation/[id]/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/order-confirmation/[id]/page.tsx", "to": "storefront/components/TaxInvoiceModal.tsx"}, {"from": "storefront/app/policies/faq/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/faq/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/policies/privacy/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/privacy/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/policies/returns/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/returns/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/policies/rewards/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/rewards/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/policies/shipping/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/shipping/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/policies/terms/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/policies/terms/page.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/app/product/[id]/page.tsx", "to": "storefront/components/SizeGuideModal.tsx"}, {"from": "storefront/app/product/[id]/page.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/app/product/[id]/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/product/[id]/page.tsx", "to": "storefront/components/AIChatWindow.tsx"}, {"from": "storefront/app/product/[id]/page.tsx", "to": "storefront/components/ProductCard.tsx"}, {"from": "storefront/app/rewards/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/rewards/page.tsx", "to": "storefront/components/MobileBottomNav.tsx"}, {"from": "storefront/app/track-order/page.tsx", "to": "storefront/components/Header.tsx"}, {"from": "storefront/app/track-order/page.tsx", "to": "storefront/components/MobileBottomNav.tsx"}, {"from": "storefront/app/track-order/page.tsx", "to": "storefront/components/TaxInvoiceModal.tsx"}, {"from": "storefront/components/CartDrawer.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/components/CartToast.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/components/FloatingCartBar.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/components/Footer.tsx", "to": "storefront/components/SupportWidgetModal.tsx"}, {"from": "storefront/components/Footer.tsx", "to": "storefront/components/GSTBadgeTooltip.tsx"}, {"from": "storefront/components/Header.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/components/MobileBottomNav.tsx", "to": "storefront/context/CartContext.tsx"}, {"from": "storefront/components/ProductCard.tsx", "to": "storefront/context/CartContext.tsx"}], "details": {"admin-dashboard/build-graph.js": {"language": "JavaScript", "cluster": "Other", "functions": [], "classes_structs": [], "imports": ["path", "child_process"], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/next-env.d.ts": {"language": "TypeScript", "cluster": "Other", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/next.config.js": {"language": "JavaScript", "cluster": "Main/Entry", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/postcss.config.js": {"language": "JavaScript", "cluster": "Utilities/Config", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/tailwind.config.js": {"language": "JavaScript", "cluster": "Main/Entry", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/app/layout.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["RootLayout"], "classes_structs": [], "imports": ["@/context/ThemeContext", "next", "@/components/ThemeCustomizerModal", "./globals.css"], "dependencies": ["admin-dashboard/components/ThemeCustomizerModal.tsx", "admin-dashboard/context/ThemeContext.tsx"], "dependents": [], "churn": 3}, "admin-dashboard/app/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleLogout", "fetchAnalytics", "AdminPage", "handleLogin"], "classes_structs": [], "imports": ["axios", "lucide-react", "next/link", "@/components/Navigation", "react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 7}, "admin-dashboard/app/abandoned-carts/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleLogout", "getLeadStatusType", "fetchAbandonedCarts", "AbandonedCartsPage", "getWhatsAppLink"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 9}, "admin-dashboard/app/activity-logs/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["saveStateToStorage", "handleRoleChange", "handleToggleStatus", "ActivityLogsAdminPage", "handleAddAdmin"], "classes_structs": [], "imports": ["react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 3}, "admin-dashboard/app/analytics/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["fetchAnalytics", "AnalyticsAdminPage"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 4}, "admin-dashboard/app/api/code/route.ts": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["GET"], "classes_structs": [], "imports": ["fs", "path", "next/server"], "dependencies": [], "dependents": [], "churn": 1}, "admin-dashboard/app/cms/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleAddBanner", "CMSAdminPage", "loadSavedPolicies", "syncBannersWithBackend", "fetchBanners", "handleSavePolicies", "handleDeleteBanner"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 4}, "admin-dashboard/app/code-graph/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleLogout", "CodeGraphAdminPage"], "classes_structs": [], "imports": ["react", "@/components/Navigation"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 2}, "admin-dashboard/app/coupons/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["toggleCouponStatus", "deleteCoupon", "handleCopyCode", "handleCreateCoupon", "fetchCoupons", "CouponsAdminPage"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 3}, "admin-dashboard/app/customers/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["CustomersAdminPage", "handleLogout", "fetchCustomers"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 4}, "admin-dashboard/app/device-preview/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleCompanyChange", "getDimensions", "DevicePreviewPage", "reloadIframe"], "classes_structs": [], "imports": ["next/link", "react", "lucide-react"], "dependencies": [], "dependents": [], "churn": 4}, "admin-dashboard/app/loyalty/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["AdminLoyaltyPage", "handleSearchUserLedger", "fetchLoyaltyData", "handleManualAdjustment", "handleSaveConfig"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 2}, "admin-dashboard/app/orders/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleDatePreset", "OrdersAdminPage", "handleSelectAll", "handlePrintBatchThermal", "handleUpdateStatusSubmit", "fetchOrders", "handleExportCSV", "handleToggleSelectOrder"], "classes_structs": [], "imports": ["axios", "@/components/ThermalLabelModal", "lucide-react", "@/components/Navigation", "react", "@/components/InvoiceModal"], "dependencies": ["admin-dashboard/components/Navigation.tsx", "admin-dashboard/components/InvoiceModal.tsx", "admin-dashboard/components/ThermalLabelModal.tsx"], "dependents": [], "churn": 11}, "admin-dashboard/app/products/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["ProductsAdminPage", "fetchProducts", "handleDelete", "handleToggleStock", "handleSaveProduct"], "classes_structs": [], "imports": ["axios", "@/components/ProductModal", "lucide-react", "@/components/Navigation", "react"], "dependencies": ["admin-dashboard/components/ProductModal.tsx", "admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 4}, "admin-dashboard/app/settings/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["fetchSettings", "applyPresetTheme", "handleSave", "SettingsAdminPage"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 7}, "admin-dashboard/app/shipping/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleSaveSettings", "ShippingAdminPage"], "classes_structs": [], "imports": ["react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 1}, "admin-dashboard/app/tickets/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleToggleCustomerMediaPermission", "handleDeletionAction", "handleUpdateStatus", "handleMediaUpload", "TicketsAdminPage", "applyQuickPreset", "fetchTickets", "handleSendAdminReply", "handleOpenChatDrawer"], "classes_structs": [], "imports": ["axios", "react", "@/components/Navigation", "lucide-react"], "dependencies": ["admin-dashboard/components/Navigation.tsx"], "dependents": [], "churn": 6}, "admin-dashboard/components/InvoiceModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleDownloadPDF", "numberToWordsINR", "convert", "InvoiceModal", "handlePrint"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["admin-dashboard/app/orders/page.tsx"], "churn": 8}, "admin-dashboard/components/Navigation.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["toggleQuickMode", "Navigation"], "classes_structs": [], "imports": ["lucide-react", "@/context/ThemeContext", "next/link", "@/lib/auditLogger", "next/navigation", "react"], "dependencies": ["admin-dashboard/context/ThemeContext.tsx", "admin-dashboard/lib/auditLogger.ts"], "dependents": ["admin-dashboard/app/customers/page.tsx", "admin-dashboard/app/products/page.tsx", "admin-dashboard/app/settings/page.tsx", "admin-dashboard/app/tickets/page.tsx", "admin-dashboard/app/abandoned-carts/page.tsx", "admin-dashboard/app/analytics/page.tsx", "admin-dashboard/app/coupons/page.tsx", "admin-dashboard/app/activity-logs/page.tsx", "admin-dashboard/app/loyalty/page.tsx", "admin-dashboard/app/code-graph/page.tsx", "admin-dashboard/app/cms/page.tsx", "admin-dashboard/app/orders/page.tsx", "admin-dashboard/app/shipping/page.tsx", "admin-dashboard/app/page.tsx"], "churn": 10}, "admin-dashboard/components/ProductModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handlePriceChange", "handleRemoveImage", "handleAddImageField", "ProductModal", "handleComparePriceChange", "handleOfferDiscountChange", "handleSubmit", "handleImageChange"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["admin-dashboard/app/products/page.tsx"], "churn": 5}, "admin-dashboard/components/ThemeCustomizerModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["ThemeCustomizerModal"], "classes_structs": [], "imports": ["@/context/ThemeContext", "react", "lucide-react"], "dependencies": ["admin-dashboard/context/ThemeContext.tsx"], "dependents": ["admin-dashboard/app/layout.tsx"], "churn": 2}, "admin-dashboard/components/ThermalLabelModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["ThermalLabelModal", "renderQRCodeSVG", "numberToWordsINR", "convert", "handlePrint"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["admin-dashboard/app/orders/page.tsx"], "churn": 2}, "admin-dashboard/context/ThemeContext.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["applyThemeToDOM", "setMode", "useAdminTheme", "ThemeProvider", "setDarkness", "setHue", "setAccentHex", "setGlowIntensity", "applyPreset", "resetDefaults", "handleGlobalClick"], "classes_structs": [], "imports": ["react"], "dependencies": [], "dependents": ["admin-dashboard/components/ThemeCustomizerModal.tsx", "admin-dashboard/app/layout.tsx", "admin-dashboard/components/Navigation.tsx"], "churn": 2}, "admin-dashboard/lib/auditLogger.ts": {"language": "TypeScript", "cluster": "Utilities/Config", "functions": ["logAdminAction"], "classes_structs": [], "imports": [], "dependencies": [], "dependents": ["admin-dashboard/components/Navigation.tsx"], "churn": 1}, "backend/main.go": {"language": "Go", "cluster": "Main/Entry", "functions": ["main"], "classes_structs": [], "imports": ["log", "shadow-arrow-backend/seed", "net/http", "shadow-arrow-backend/cron", "shadow-arrow-backend/db", "shadow-arrow-backend/middleware", "github.com/gin-gonic/gin", "shadow-arrow-backend/handlers", "shadow-arrow-backend/config", "time"], "dependencies": ["backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/coin_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/db/mongodb.go", "backend/handlers/cms_handler.go", "backend/config/config.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/middleware/security.go", "backend/handlers/ai_proxy_handler.go", "backend/middleware/cors_middleware.go", "backend/middleware/auth_middleware.go", "backend/handlers/user_handler.go"], "dependents": [], "churn": 8}, "backend/config/config.go": {"language": "Go", "cluster": "Utilities/Config", "functions": ["LoadConfig", "getEnv"], "classes_structs": ["Config"], "imports": ["log", "os", "github.com/joho/godotenv"], "dependencies": [], "dependents": ["backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/db/mongodb.go", "backend/handlers/ai_proxy_handler.go", "backend/middleware/auth_middleware.go", "backend/main.go"], "churn": 2}, "backend/cron/coin_cron.go": {"language": "Go", "cluster": "Services/Middleware", "functions": ["ProcessCoinLifecycles", "StartCronScheduler"], "classes_structs": [], "imports": ["log", "go.mongodb.org/mongo-driver/bson", "shadow-arrow-backend/db", "shadow-arrow-backend/models", "context", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 1}, "backend/db/mongodb.go": {"language": "Go", "cluster": "DB Models", "functions": ["ConnectDB", "GetCollection"], "classes_structs": ["Database"], "imports": ["log", "go.mongodb.org/mongo-driver/mongo/options", "go.mongodb.org/mongo-driver/mongo", "context", "shadow-arrow-backend/config", "time"], "dependencies": ["backend/config/config.go"], "dependents": ["backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/cms_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go", "backend/main.go"], "churn": 1}, "backend/handlers/admin_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetAdminCustomers", "AdminLogin", "GetAnalytics"], "classes_structs": ["AdminLoginPayload", "AdminCustomerItem"], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "sort", "shadow-arrow-backend/db", "shadow-arrow-backend/utils", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "context", "shadow-arrow-backend/config", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/utils/shiprocket.go", "backend/models/ticket.go", "backend/models/user.go", "backend/utils/jwt.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/utils/razorpay.go", "backend/config/config.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 7}, "backend/handlers/ai_proxy_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["AIChatProxy"], "classes_structs": [], "imports": ["bytes", "log", "net/http", "github.com/gin-gonic/gin", "context", "io", "shadow-arrow-backend/config", "time"], "dependencies": ["backend/config/config.go"], "dependents": ["backend/main.go"], "churn": 2}, "backend/handlers/cart_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetAbandonedCarts", "SyncCart"], "classes_structs": ["CartSyncRequest"], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "go.mongodb.org/mongo-driver/mongo/options", "context", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 4}, "backend/handlers/cms_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetBanners", "SaveBanners"], "classes_structs": ["BannerItem", "SaveBannersRequest"], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "context", "time", "github.com/gin-gonic/gin"], "dependencies": ["backend/db/mongodb.go"], "dependents": ["backend/main.go"], "churn": 2}, "backend/handlers/coin_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["AdminManualAdjustCoins", "GetUserRewards", "AdminUpdateLoyaltyConfigHandler", "CalculateCashbackForOrder", "AdminGetTopCoinHolders", "CleanPhoneDigits", "AdminGetLoyaltyConfigHandler", "AdminGetCoinAnalytics", "EvaluateUserTier", "GetLoyaltyConfig"], "classes_structs": ["AdminManualAdjustPayload"], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "regexp", "go.mongodb.org/mongo-driver/mongo/options", "context", "go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 3}, "backend/handlers/coupon_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["ValidateCoupon", "ToggleCouponStatus", "CreateCoupon", "GetCoupons", "DeleteCoupon"], "classes_structs": ["ValidateCouponRequest"], "imports": ["fmt", "go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "regexp", "go.mongodb.org/mongo-driver/mongo/options", "context", "go.mongodb.org/mongo-driver/bson/primitive", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 2}, "backend/handlers/order_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["UpdateOrderStatus", "TrackOrder", "generateReadableOrderID", "GetAdminOrders", "GetUserOrders", "CreateOrder", "VerifyPayment"], "classes_structs": ["VerifyPaymentPayload", "UpdateStatusPayload", "CompactOrder"], "imports": ["fmt", "go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "shadow-arrow-backend/utils", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "regexp", "go.mongodb.org/mongo-driver/mongo/options", "context", "math/rand", "go.mongodb.org/mongo-driver/bson/primitive", "shadow-arrow-backend/config", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/utils/shiprocket.go", "backend/models/ticket.go", "backend/models/user.go", "backend/utils/jwt.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/utils/razorpay.go", "backend/config/config.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 7}, "backend/handlers/product_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetProductByID", "UpdateProduct", "GetProducts", "CreateProduct", "DeleteProduct"], "classes_structs": [], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "go.mongodb.org/mongo-driver/mongo/options", "context", "go.mongodb.org/mongo-driver/bson/primitive", "strconv", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 1}, "backend/handlers/settings_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetDefaultThemeSettings", "GetThemeSettings", "UpdateThemeSettings"], "classes_structs": [], "imports": ["go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "go.mongodb.org/mongo-driver/mongo/options", "context", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 3}, "backend/handlers/ticket_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["GetTickets", "UpdateTicketStatus", "ToggleMediaPermission", "CreateTicket", "generateTicketID", "GetTicketByID", "ReplyToTicket", "GetCustomerTickets"], "classes_structs": ["UpdateTicketStatusPayload", "ReplyTicketPayload", "ToggleMediaPermissionPayload"], "imports": ["fmt", "go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "go.mongodb.org/mongo-driver/mongo/options", "context", "math/rand", "go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 5}, "backend/handlers/user_handler.go": {"language": "Go", "cluster": "Controllers/Handlers", "functions": ["PhoneLogin", "GoogleSync", "GetUserProfile", "RequestAccountDeletion", "UpdateUserProfile"], "classes_structs": ["PhoneLoginPayload", "RequestDeletionPayload"], "imports": ["fmt", "go.mongodb.org/mongo-driver/bson", "net/http", "shadow-arrow-backend/db", "github.com/gin-gonic/gin", "shadow-arrow-backend/models", "context", "go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 3}, "backend/middleware/auth_middleware.go": {"language": "Go", "cluster": "Services/Middleware", "functions": ["AdminAuthMiddleware"], "classes_structs": [], "imports": ["shadow-arrow-backend/utils", "net/http", "shadow-arrow-backend/config", "strings", "github.com/gin-gonic/gin"], "dependencies": ["backend/utils/shiprocket.go", "backend/config/config.go", "backend/utils/razorpay.go", "backend/utils/jwt.go"], "dependents": ["backend/main.go"], "churn": 1}, "backend/middleware/cors_middleware.go": {"language": "Go", "cluster": "Services/Middleware", "functions": ["CORSMiddleware"], "classes_structs": [], "imports": ["time", "github.com/gin-contrib/cors", "os", "strings", "github.com/gin-gonic/gin"], "dependencies": [], "dependents": ["backend/main.go"], "churn": 3}, "backend/middleware/security.go": {"language": "Go", "cluster": "Services/Middleware", "functions": ["SecurityHeadersMiddleware", "BlockSensitiveFilesMiddleware", "RateLimiterMiddleware"], "classes_structs": ["clientRate"], "imports": ["net/http", "sync", "time", "strings", "github.com/gin-gonic/gin"], "dependencies": [], "dependents": ["backend/main.go"], "churn": 1}, "backend/models/cart.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["CartSyncItem", "AbandonedCart"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 1}, "backend/models/coin_transaction.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["CoinTransaction", "LoyaltyConfig"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 1}, "backend/models/coupon.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["Coupon"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 1}, "backend/models/order.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["OrderItem", "Order"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 3}, "backend/models/product.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["ProductSpecs", "Product"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 2}, "backend/models/site_settings.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["SiteThemeSettings"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 3}, "backend/models/ticket.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["TicketMessage", "SupportTicket", "AdminUser"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 3}, "backend/models/user.go": {"language": "Go", "cluster": "DB Models", "functions": [], "classes_structs": ["SavedAddress", "UserTier", "UserProfile"], "imports": ["go.mongodb.org/mongo-driver/bson/primitive", "time"], "dependencies": [], "dependents": ["backend/utils/shiprocket.go", "backend/seed/seed.go", "backend/handlers/ticket_handler.go", "backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/handlers/cart_handler.go", "backend/handlers/coupon_handler.go", "backend/handlers/product_handler.go", "backend/handlers/settings_handler.go", "backend/cron/coin_cron.go", "backend/handlers/coin_handler.go", "backend/handlers/user_handler.go"], "churn": 3}, "backend/seed/seed.go": {"language": "Go", "cluster": "Other", "functions": ["SeedDatabase"], "classes_structs": [], "imports": ["log", "go.mongodb.org/mongo-driver/bson", "shadow-arrow-backend/db", "shadow-arrow-backend/models", "context", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/db/mongodb.go", "backend/models/site_settings.go", "backend/models/cart.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/main.go"], "churn": 1}, "backend/utils/jwt.go": {"language": "Go", "cluster": "Utilities/Config", "functions": ["GenerateJWT", "ValidateJWT"], "classes_structs": ["JWTClaims"], "imports": ["github.com/golang-jwt/jwt/v5", "errors", "time"], "dependencies": [], "dependents": ["backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/middleware/auth_middleware.go"], "churn": 1}, "backend/utils/razorpay.go": {"language": "Go", "cluster": "Utilities/Config", "functions": ["VerifyRazorpaySignature", "CreateRazorpayOrder"], "classes_structs": [], "imports": ["encoding/hex", "log", "fmt", "github.com/razorpay/razorpay-go", "crypto/sha256", "crypto/hmac"], "dependencies": [], "dependents": ["backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/middleware/auth_middleware.go"], "churn": 1}, "backend/utils/shiprocket.go": {"language": "Go", "cluster": "Utilities/Config", "functions": ["getShiprocketEmail", "DispatchToShiprocket", "getShiprocketPickupLocation", "getShiprocketPassword", "GetShiprocketToken"], "classes_structs": ["ShiprocketAuthResponse", "ShiprocketOrderItem", "ShiprocketOrderRequest", "ShiprocketOrderResponse"], "imports": ["log", "bytes", "fmt", "net/http", "shadow-arrow-backend/models", "io", "os", "encoding/json", "strings", "time"], "dependencies": ["backend/models/product.go", "backend/models/ticket.go", "backend/models/user.go", "backend/models/cart.go", "backend/models/site_settings.go", "backend/models/coin_transaction.go", "backend/models/order.go", "backend/models/coupon.go"], "dependents": ["backend/handlers/admin_handler.go", "backend/handlers/order_handler.go", "backend/middleware/auth_middleware.go"], "churn": 3}, "python_service/backend_client.py": {"language": "Python", "cluster": "Other", "functions": ["fetch_products", "track_order", "create_support_ticket"], "classes_structs": [], "imports": ["config.BACKEND_URL", "logging", "httpx"], "dependencies": ["python_service/config.py"], "dependents": ["python_service/gemini_service.py"], "churn": 0}, "python_service/config.py": {"language": "Python", "cluster": "Utilities/Config", "functions": [], "classes_structs": [], "imports": ["dotenv.load_dotenv", "os", "warnings"], "dependencies": [], "dependents": ["python_service/gemini_service.py", "python_service/main.py", "python_service/backend_client.py", "python_service/services/gemini_service.py", "python_service/services/backend_client.py"], "churn": 0}, "python_service/gemini_service.py": {"language": "Python", "cluster": "Other", "functions": ["_extract_phone", "_extract_image_url", "_call_gemini", "_format_order", "_append_history", "generate_chat_response", "_has_any", "_verify_damage_with_gemini", "_find_product_in_text"], "classes_structs": [], "imports": ["logging", "re", "backend_client.track_order", "httpx", "config.GEMINI_MODEL", "base64", "config.GEMINI_API_KEY", "backend_client.fetch_products", "google.genai.types", "backend_client.create_support_ticket", "random", "google.genai", "json"], "dependencies": ["python_service/config.py", "python_service/backend_client.py"], "dependents": ["python_service/main.py"], "churn": 2}, "python_service/main.py": {"language": "Python", "cluster": "Main/Entry", "functions": ["root", "unhandled_exception_handler", "chat_endpoint", "health_check"], "classes_structs": ["ChatRequest", "ChatResponse"], "imports": ["fastapi.Request", "config.PORT", "fastapi.HTTPException", "logging", "fastapi.middleware.cors.CORSMiddleware", "pydantic.BaseModel", "pydantic.Field", "uvicorn", "gemini_service.generate_chat_response", "fastapi.responses.JSONResponse", "fastapi.FastAPI"], "dependencies": ["python_service/gemini_service.py", "python_service/config.py"], "dependents": [], "churn": 0}, "python_service/services/backend_client.py": {"language": "Python", "cluster": "Services/Middleware", "functions": ["fetch_products", "track_order", "create_support_ticket"], "classes_structs": [], "imports": ["config.BACKEND_URL", "logging", "httpx"], "dependencies": ["python_service/config.py"], "dependents": ["python_service/services/gemini_service.py"], "churn": 0}, "python_service/services/gemini_service.py": {"language": "Python", "cluster": "Services/Middleware", "functions": ["_extract_phone", "_extract_image_url", "_call_gemini", "_format_order", "_append_history", "generate_chat_response", "_has_any", "_verify_damage_with_gemini", "_find_product_in_text"], "classes_structs": [], "imports": ["services.backend_client.fetch_products", "logging", "re", "services.backend_client.track_order", "services.backend_client.create_support_ticket", "httpx", "config.GEMINI_MODEL", "base64", "config.GEMINI_API_KEY", "google.genai.types", "random", "google.genai", "json"], "dependencies": ["python_service/services/backend_client.py", "python_service/config.py"], "dependents": [], "churn": 2}, "python_service/services/__init__.py": {"language": "Python", "cluster": "Services/Middleware", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 0}, "scripts/code_graph/generate_graph.py": {"language": "Python", "cluster": "Other", "functions": ["__init__", "categorize_cluster", "resolve_python_import", "parse_js_ts_file", "get_language", "main", "parse_python_file", "resolve_go_import", "parse_python_file_regex", "load_gitignore", "parse_go_file", "is_ignored", "get_git_churn", "resolve_js_ts_import"], "classes_structs": ["GitIgnoreMatcher"], "imports": ["ast", "subprocess", "visualizer_template.HTML_TEMPLATE", "re", "fnmatch", "os", "json"], "dependencies": [], "dependents": [], "churn": 2}, "scripts/code_graph/search_context.py": {"language": "Python", "cluster": "Other", "functions": ["search_index", "load_index", "disable_colors", "main"], "classes_structs": [], "imports": ["sys", "argparse", "os", "json"], "dependencies": [], "dependents": [], "churn": 1}, "scripts/code_graph/visualizer_template.py": {"language": "Python", "cluster": "Other", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 8}, "storefront/next-env.d.ts": {"language": "TypeScript", "cluster": "Other", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "storefront/next.config.js": {"language": "JavaScript", "cluster": "Main/Entry", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "storefront/postcss.config.js": {"language": "JavaScript", "cluster": "Utilities/Config", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "storefront/tailwind.config.js": {"language": "JavaScript", "cluster": "Main/Entry", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "storefront/app/layout.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["RootLayout"], "classes_structs": [], "imports": ["next", "@/components/CartToast", "@/components/ThemeProvider", "./globals.css", "@/components/CartDrawer", "@/components/TrackOrderBubbleModal", "@/context/CartContext", "@/components/Footer"], "dependencies": ["storefront/components/Footer.tsx", "storefront/components/ThemeProvider.tsx", "storefront/components/TrackOrderBubbleModal.tsx", "storefront/context/CartContext.tsx", "storefront/components/CartToast.tsx", "storefront/components/CartDrawer.tsx"], "dependents": [], "churn": 6}, "storefront/app/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["fetchProducts", "HomePage", "handleLoadMore", "fetchBanners"], "classes_structs": [], "imports": ["axios", "@/components/AIChatWindow", "@/components/Header", "@/components/GalaxyVFXBackground", "lucide-react", "@/components/MobileBottomNav", "react", "@/components/ProductCard"], "dependencies": ["storefront/components/GalaxyVFXBackground.tsx", "storefront/components/MobileBottomNav.tsx", "storefront/components/Header.tsx", "storefront/components/AIChatWindow.tsx", "storefront/components/ProductCard.tsx"], "dependents": [], "churn": 6}, "storefront/app/account/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleLogout", "fetchUserOrders", "syncLatestProfile", "handleRequestDeletionSubmit", "setDefaultAddress", "fetchRewardsInfo", "AccountPage", "saveAddress", "openEditAddr", "handleSavePhone", "openAddAddr", "copyToClipboard", "deleteAddress"], "classes_structs": [], "imports": ["axios", "@/components/Header", "lucide-react", "@/utils/downloadInvoicePDF", "@/components/MobileBottomNav", "next/navigation", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/MobileBottomNav.tsx", "storefront/utils/downloadInvoicePDF.ts"], "dependents": [], "churn": 12}, "storefront/app/account/login/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleLinkGoogleMobile", "AccountLoginPage", "handlePhoneLogin", "handleGoogleSignIn"], "classes_structs": [], "imports": ["axios", "@/components/Header", "@/lib/firebase", "lucide-react", "next/navigation", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/lib/firebase.ts"], "dependents": [], "churn": 2}, "storefront/app/account/register/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["AccountRegisterPage", "handleRegister", "handleGoogleSignIn"], "classes_structs": [], "imports": ["axios", "@/components/Header", "@/lib/firebase", "lucide-react", "next/link", "next/navigation", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/lib/firebase.ts"], "dependents": [], "churn": 1}, "storefront/app/checkout/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleRemoveCoupon", "CheckoutPage", "triggerPlaceOrder", "handlePlaceOrder", "etaInfo", "handlePhoneChange", "handleApplyCoupon"], "classes_structs": [], "imports": ["axios", "@/components/Header", "@/components/GSTBadgeTooltip", "lucide-react", "@/components/TruckOrderButton", "@/components/MobileBottomNav", "@/context/CartContext", "next/navigation", "react"], "dependencies": ["storefront/components/TruckOrderButton.tsx", "storefront/components/MobileBottomNav.tsx", "storefront/components/GSTBadgeTooltip.tsx", "storefront/context/CartContext.tsx", "storefront/components/Header.tsx"], "dependents": [], "churn": 8}, "storefront/app/order-confirmation/[id]/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["OrderConfirmationPage", "fetchOrder"], "classes_structs": [], "imports": ["axios", "@/components/Header", "@/components/TaxInvoiceModal", "lucide-react", "canvas-confetti", "next/navigation", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/TaxInvoiceModal.tsx"], "dependents": [], "churn": 2}, "storefront/app/policies/faq/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["toggleAccordion", "FAQPage"], "classes_structs": [], "imports": ["@/components/GSTBadgeTooltip", "react", "@/components/Header", "lucide-react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 1}, "storefront/app/policies/privacy/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["PrivacyPolicyPage"], "classes_structs": [], "imports": ["@/components/GSTBadgeTooltip", "react", "@/components/Header", "lucide-react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 6}, "storefront/app/policies/returns/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["ReturnsPolicyPage"], "classes_structs": [], "imports": ["@/components/GSTBadgeTooltip", "react", "@/components/Header", "lucide-react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 3}, "storefront/app/policies/rewards/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["RewardsPolicyPage"], "classes_structs": [], "imports": ["@/components/Header", "@/components/GSTBadgeTooltip", "lucide-react", "next/link", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 1}, "storefront/app/policies/shipping/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["ShippingPolicyPage"], "classes_structs": [], "imports": ["@/components/GSTBadgeTooltip", "react", "@/components/Header", "lucide-react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 3}, "storefront/app/policies/terms/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["TermsOfServicePage"], "classes_structs": [], "imports": ["@/components/GSTBadgeTooltip", "react", "@/components/Header", "lucide-react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": [], "churn": 3}, "storefront/app/product/[id]/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["ProductDetailPage", "handleBuyNow", "handleAddToCart", "fetchRelated", "fetchProduct"], "classes_structs": [], "imports": ["axios", "@/components/AIChatWindow", "@/components/Header", "lucide-react", "next/link", "@/components/SizeGuideModal", "@/context/CartContext", "next/navigation", "react", "@/components/ProductCard"], "dependencies": ["storefront/components/SizeGuideModal.tsx", "storefront/context/CartContext.tsx", "storefront/components/Header.tsx", "storefront/components/AIChatWindow.tsx", "storefront/components/ProductCard.tsx"], "dependents": [], "churn": 4}, "storefront/app/rewards/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["fetchRewardsData", "RewardsPassbookPage", "getTierIcon"], "classes_structs": [], "imports": ["axios", "@/components/Header", "lucide-react", "@/components/MobileBottomNav", "next/navigation", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/MobileBottomNav.tsx"], "dependents": [], "churn": 3}, "storefront/app/track-order/page.tsx": {"language": "TypeScript", "cluster": "Routes/Endpoints", "functions": ["handleTrack", "fetchTrackOrder", "TrackOrderPage", "copyAwb", "getStepActive"], "classes_structs": [], "imports": ["axios", "@/components/Header", "@/components/TaxInvoiceModal", "lucide-react", "@/components/MobileBottomNav", "react"], "dependencies": ["storefront/components/Header.tsx", "storefront/components/MobileBottomNav.tsx", "storefront/components/TaxInvoiceModal.tsx"], "dependents": [], "churn": 4}, "storefront/components/AIChatWindow.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["detectLanguage", "AIChatWindow", "cleanText", "loadStoredMessages"], "classes_structs": [], "imports": ["axios", "react", "lucide-react"], "dependencies": [], "dependents": ["storefront/app/product/[id]/page.tsx", "storefront/app/page.tsx"], "churn": 7}, "storefront/components/CartDrawer.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["CartDrawer"], "classes_structs": [], "imports": ["next/link", "react", "@/context/CartContext", "lucide-react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": ["storefront/app/layout.tsx"], "churn": 2}, "storefront/components/CartToast.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleViewCart", "handleCheckout", "handleClose", "CartToast"], "classes_structs": [], "imports": ["@/context/CartContext", "next/navigation", "react", "lucide-react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": ["storefront/app/layout.tsx"], "churn": 1}, "storefront/components/FAQSection.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["toggleAccordion", "FAQSection"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": [], "churn": 1}, "storefront/components/FloatingCartBar.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["FloatingCartBar"], "classes_structs": [], "imports": ["@/context/CartContext", "react", "lucide-react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": [], "churn": 2}, "storefront/components/Footer.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["checkSupportReplies", "handleDismissToast", "Footer", "handleOpenTicketFromToast"], "classes_structs": [], "imports": ["axios", "@/components/GSTBadgeTooltip", "lucide-react", "next/link", "react", "@/components/SupportWidgetModal"], "dependencies": ["storefront/components/SupportWidgetModal.tsx", "storefront/components/GSTBadgeTooltip.tsx"], "dependents": ["storefront/app/layout.tsx"], "churn": 8}, "storefront/components/GalaxyVFXBackground.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["GalaxyVFXBackground", "render", "handleMouseMove", "handleResize"], "classes_structs": [], "imports": ["react"], "dependencies": [], "dependents": ["storefront/app/page.tsx"], "churn": 1}, "storefront/components/GSTBadgeTooltip.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["GSTBadgeTooltip"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["storefront/components/Footer.tsx", "storefront/app/checkout/page.tsx", "storefront/app/policies/returns/page.tsx", "storefront/app/policies/privacy/page.tsx", "storefront/app/policies/rewards/page.tsx", "storefront/app/policies/faq/page.tsx", "storefront/app/policies/terms/page.tsx", "storefront/app/policies/shipping/page.tsx"], "churn": 2}, "storefront/components/Header.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleOutsideClick", "handleSearchChange", "renderTierIcon", "tierColor", "Header"], "classes_structs": [], "imports": ["axios", "lucide-react", "next/link", "@/context/CartContext", "react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": ["storefront/app/checkout/page.tsx", "storefront/app/account/login/page.tsx", "storefront/app/account/register/page.tsx", "storefront/app/policies/returns/page.tsx", "storefront/app/product/[id]/page.tsx", "storefront/app/policies/privacy/page.tsx", "storefront/app/account/page.tsx", "storefront/app/policies/rewards/page.tsx", "storefront/app/policies/faq/page.tsx", "storefront/app/policies/terms/page.tsx", "storefront/app/order-confirmation/[id]/page.tsx", "storefront/app/rewards/page.tsx", "storefront/app/track-order/page.tsx", "storefront/app/page.tsx", "storefront/app/policies/shipping/page.tsx"], "churn": 7}, "storefront/components/MobileBottomNav.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["MobileBottomNav"], "classes_structs": [], "imports": ["lucide-react", "next/link", "@/context/CartContext", "next/navigation", "react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": ["storefront/app/checkout/page.tsx", "storefront/app/account/page.tsx", "storefront/app/rewards/page.tsx", "storefront/app/track-order/page.tsx", "storefront/app/page.tsx"], "churn": 3}, "storefront/components/ProductCard.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["ProductCard", "handleQuickAdd"], "classes_structs": [], "imports": ["next/link", "react", "@/context/CartContext", "lucide-react"], "dependencies": ["storefront/context/CartContext.tsx"], "dependents": ["storefront/app/product/[id]/page.tsx", "storefront/app/page.tsx"], "churn": 6}, "storefront/components/SizeGuideModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["SizeGuideModal"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["storefront/app/product/[id]/page.tsx"], "churn": 1}, "storefront/components/SupportWidgetModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleSendReply", "handleImageFile", "SupportWidgetModal", "resetAndClose", "handleFetchMyTickets", "handleSubmit", "handleOpenTicketThread"], "classes_structs": [], "imports": ["axios", "react", "lucide-react"], "dependencies": [], "dependents": ["storefront/components/Footer.tsx"], "churn": 4}, "storefront/components/TaxInvoiceModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleDownloadPDF", "numberToWordsINR", "convert", "TaxInvoiceModal", "handlePrint"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["storefront/app/track-order/page.tsx", "storefront/app/order-confirmation/[id]/page.tsx"], "churn": 6}, "storefront/components/ThemeProvider.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["ThemeProvider", "handleThemeEvent", "handleStorageEvent"], "classes_structs": [], "imports": ["axios", "react"], "dependencies": [], "dependents": ["storefront/app/layout.tsx"], "churn": 4}, "storefront/components/ThermalInvoiceModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["renderQRCodeSVG", "numberToWordsINR", "convert", "handlePrint", "ThermalInvoiceModal"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": [], "churn": 1}, "storefront/components/TrackOrderBubbleModal.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleTrack", "TrackOrderBubbleModal", "copyAwb"], "classes_structs": [], "imports": ["axios", "react", "lucide-react"], "dependencies": [], "dependents": ["storefront/app/layout.tsx"], "churn": 1}, "storefront/components/TruckOrderButton.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["handleClick", "TruckOrderButton"], "classes_structs": [], "imports": ["react", "lucide-react"], "dependencies": [], "dependents": ["storefront/app/checkout/page.tsx"], "churn": 4}, "storefront/context/CartContext.tsx": {"language": "TypeScript", "cluster": "Components/Context", "functions": ["removeFromCart", "useCart", "CartProvider", "clearCart", "addToCart", "runFlyToCartAnimation", "updateQuantity", "syncCartWithBackend"], "classes_structs": [], "imports": ["react"], "dependencies": [], "dependents": ["storefront/app/checkout/page.tsx", "storefront/components/FloatingCartBar.tsx", "storefront/components/MobileBottomNav.tsx", "storefront/app/layout.tsx", "storefront/app/product/[id]/page.tsx", "storefront/components/Header.tsx", "storefront/components/ProductCard.tsx", "storefront/components/CartToast.tsx", "storefront/components/CartDrawer.tsx"], "churn": 3}, "storefront/lib/firebase.ts": {"language": "TypeScript", "cluster": "Utilities/Config", "functions": [], "classes_structs": [], "imports": ["firebase/app", "firebase/auth"], "dependencies": [], "dependents": ["storefront/app/account/login/page.tsx", "storefront/app/account/register/page.tsx"], "churn": 1}, "storefront/public/theme-loader.js": {"language": "JavaScript", "cluster": "Other", "functions": [], "classes_structs": [], "imports": [], "dependencies": [], "dependents": [], "churn": 1}, "storefront/utils/downloadInvoicePDF.ts": {"language": "TypeScript", "cluster": "Utilities/Config", "functions": ["numberToWordsINR", "convert", "downloadDirectTaxInvoicePDF", "itemsRows"], "classes_structs": [], "imports": ["html2pdf.js"], "dependencies": [], "dependents": ["storefront/app/account/page.tsx"], "churn": 4}}};
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
            activeTimeouts.forEach(clearTimeout);
            activeTimeouts = [];
            // Remove any floating packets
            const packets = document.querySelectorAll('.flow-packet');
            packets.forEach(p => p.remove());
        }

        function resetNodes() {
            clearAllTimeouts();
            const allNodes = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-razorpay', 'node-success', 'node-shiprocket', 'node-customer'];
            const allArrows = ['arrow-1', 'arrow-2', 'arrow-3', 'arrow-4', 'arrow-5', 'arrow-6', 'arrow-7'];
            
            allNodes.forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.style.opacity = '1';
                    el.classList.remove('animate-glow', 'animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50');
                    
                    // restore original classes and text
                    if(id === 'node-client') { 
                        el.className = "flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Sends Request'; 
                    }
                    if(id === 'node-firewall') { 
                        el.className = "flex flex-col items-center bg-slate-800 p-3 sm:p-4 rounded-xl border border-rose-900/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Rate Limit & DDoS Check'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-backend') { 
                        el.className = "flex flex-col items-center bg-indigo-900/50 p-3 sm:p-4 rounded-xl border border-indigo-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Validates Order'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-mongo') { 
                        el.className = "flex flex-col items-center bg-emerald-900/50 p-3 sm:p-4 rounded-xl border border-emerald-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Verifies Real Price'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-razorpay') { 
                        el.className = "flex flex-col items-center bg-blue-900/50 p-3 sm:p-4 rounded-xl border border-blue-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Creates Payment Link'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-success') { 
                        el.className = "flex flex-col items-center bg-green-900/50 p-3 sm:p-4 rounded-xl border border-green-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Order PAID'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-shiprocket') { 
                        el.className = "flex flex-col items-center bg-orange-900/50 p-3 sm:p-4 rounded-xl border border-orange-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Auto Dispatched'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                    if(id === 'node-customer') { 
                        el.className = "flex flex-col items-center bg-purple-900/50 p-3 sm:p-4 rounded-xl border border-purple-500/50 w-full sm:w-36 shadow-lg transition-all"; 
                        el.querySelector('.status-text').innerText = 'Delivered Safely'; 
                        el.querySelector('.status-text').className = 'text-[10px] sm:text-xs text-slate-400 mt-1 status-text'; 
                    }
                }
            });
            allArrows.forEach(cls => {
                const els = document.querySelectorAll('.' + cls);
                els.forEach(el => {
                    el.style.opacity = '1';
                    el.classList.remove('animate-pulse', 'text-indigo-400', 'text-rose-500', 'text-red-500');
                    el.classList.add('text-indigo-500');
                });
            });
        }

        function grayOutFrom(nodeIndex) {
            const allNodes = ['node-client', 'node-firewall', 'node-backend', 'node-mongo', 'node-razorpay', 'node-success', 'node-shiprocket', 'node-customer'];
            const allArrows = ['arrow-1', 'arrow-2', 'arrow-3', 'arrow-4', 'arrow-5', 'arrow-6', 'arrow-7'];
            
            allNodes.forEach((id, idx) => {
                if (idx >= nodeIndex) {
                    const el = document.getElementById(id);
                    if (el) el.style.opacity = '0.2';
                }
            });
            // Gray out arrows that proceed from the blocked node
            allArrows.forEach((cls, idx) => {
                if (idx >= (nodeIndex - 1)) {
                    const els = document.querySelectorAll('.' + cls);
                    els.forEach(el => el.style.opacity = '0.2');
                }
            });
        }

        // Animates a traveling packet (emoji) along the nodes
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
                    }, 50));

                    // Once reached (after transition of 600ms)
                    activeTimeouts.push(setTimeout(() => {
                        const targetNodeIndex = path.indexOf(toId);
                        
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

        function applyHack(scenario) {
            resetNodes();
            initAudio();

            // Highlight the initial client node
            const client = document.getElementById('node-client');
            if (client) {
                client.classList.add('animate-glow');
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
                emoji = '🤖'; // Bot traffic
            } else if (scenario === 'path_traversal') {
                path = ['node-client', 'node-firewall'];
                emoji = '💀'; // Hacker packet
            } else if (scenario === 'price_hack') {
                path = ['node-client', 'node-firewall', 'node-backend', 'node-mongo'];
                emoji = '💰'; // Price tempered request
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
                            el.classList.add('animate-glow');
                            
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
                                playClick();
                            }
                        }
                    },
                    // On Block handler
                    (nodeId) => {
                        if (nodeId === 'node-firewall' && (scenario === 'ddos' || scenario === 'path_traversal')) {
                            const fw = document.getElementById('node-firewall');
                            fw.classList.add('animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50');
                            const text = fw.querySelector('.status-text');
                            text.innerText = scenario === 'ddos' ? 'DDoS BLOCKED (Rate Limit Exceeded) ❌' : 'ACCESS DENIED (Sensitive File Attack) ❌';
                            text.className = 'text-[10px] sm:text-xs text-red-500 mt-1 status-text font-bold';
                            playErrorSound();
                            grayOutFrom(2); // Gray out from backend onwards
                            return true; // Blocked!
                        }
                        if (nodeId === 'node-mongo' && scenario === 'price_hack') {
                            const mongo = document.getElementById('node-mongo');
                            mongo.classList.add('animate-shake', 'animate-flash-red', 'bg-red-900/50', 'border-red-500/50');
                            const text = mongo.querySelector('.status-text');
                            text.innerText = 'PROXY HACK BLOCKED (Real Price Mismatch) ❌';
                            text.className = 'text-[10px] sm:text-xs text-red-500 mt-1 status-text font-bold';
                            playErrorSound();
                            grayOutFrom(4); // Gray out success onwards
                            return true; // Blocked!
                        }
                        return false;
                    },
                    // On complete
                    () => {
                        console.log("Simulation complete!");
                    }
                );
            }, 500));
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
