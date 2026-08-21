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
    </style>
</head>
<body class="h-full overflow-hidden flex flex-col">
    <!-- Header -->
    <header class="glass-panel z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-3">
            <div class="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-500/30">G</div>
            <div>
                <h1 class="text-lg font-bold tracking-tight text-white">Codebase Knowledge Graph</h1>
                <p class="text-xs text-slate-400">Interactive dependency visualizer & context search index</p>
            </div>
        </div>
        <div class="flex gap-4 text-sm text-slate-400">
            <div>Files: <span id="stat-files" class="font-semibold text-indigo-400">0</span></div>
            <div class="h-4 w-px bg-slate-800"></div>
            <div>Dependencies: <span id="stat-deps" class="font-semibold text-indigo-400">0</span></div>
            <div class="h-4 w-px bg-slate-800"></div>
            <div>Languages: <span id="stat-langs" class="font-semibold text-indigo-400">0</span></div>
        </div>
    </header>

    <!-- Main Workspace -->
    <div class="flex-1 flex overflow-hidden relative">
        
        <!-- Network Background Container -->
        <div id="network-container" class="absolute inset-0"></div>

        <!-- Left Controls Panel -->
        <div class="absolute left-6 top-6 bottom-6 w-80 flex flex-col gap-4 pointer-events-none z-10">
            <!-- Search & Filter Card -->
            <div class="glass-panel rounded-xl p-4 flex flex-col gap-4 pointer-events-auto shadow-2xl overflow-y-auto max-h-full">
                <div>
                    <label class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search Node</label>
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
            const localImportsPattern = new RegExp(`shadow-arrow|\\.\\./|\\./|@/`);
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
    </script>
</body>
</html>
"""
