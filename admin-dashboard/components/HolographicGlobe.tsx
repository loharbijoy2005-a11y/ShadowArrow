'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Globe, MapPin, Loader2, Info } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

// Warehouse Coordinates (Kolkata/Howrah region, West Bengal)
const WAREHOUSE_COORDS: [number, number] = [22.6105, 88.3976];

// Coordinates Dictionary for West Bengal districts
const DISTRICT_COORDS: Record<string, [number, number]> = {
  kolkata: [22.5726, 88.3639],
  howrah: [22.5958, 88.2636],
  hooghly: [22.9012, 88.3899],
  midnapore: [22.4257, 87.3199],
  medinipur: [22.4257, 87.3199],
  kharagpur: [22.3302, 87.3237],
  tamluk: [22.2965, 87.8252],
  haldia: [22.0244, 88.0583],
  burdwan: [23.2324, 87.8630],
  bardhaman: [23.2324, 87.8630],
  durgapur: [23.5204, 87.3119],
  asansol: [23.6739, 86.9524],
  siliguri: [26.7271, 88.3953],
  darjeeling: [27.0410, 88.2627],
  kalimpong: [27.0594, 88.4689],
  jalpaiguri: [26.5404, 88.7190],
  coochbehar: [26.3249, 89.4510],
  alipurduar: [26.4916, 89.5273],
  malda: [25.0108, 88.1411],
  murshidabad: [24.0984, 88.2679],
  nadia: [23.4013, 88.4913],
  krishnanagar: [23.4013, 88.4913],
  purulia: [23.3322, 86.3652],
  bankura: [23.2313, 87.0784],
  birbhum: [23.9054, 87.5246],
  suri: [23.9054, 87.5246],
  bolpur: [23.6706, 87.6978],
  barasat: [22.7230, 88.4873],
  barrackpore: [22.7663, 88.3739],
  sundarbans: [21.9497, 89.1833],
};

// Coordinates Dictionary for other major Indian cities
const INDIA_CITY_COORDS: Record<string, [number, number]> = {
  delhi: [28.6139, 77.2090],
  mumbai: [19.0760, 72.8777],
  bombay: [19.0760, 72.8777],
  bangalore: [12.9716, 77.5946],
  bengaluru: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  madras: [13.0827, 80.2707],
  hyderabad: [17.3850, 78.4867],
  pune: [18.5204, 73.8567],
  ahmedabad: [23.0225, 72.5714],
  jaipur: [26.9124, 75.7873],
  lucknow: [26.8467, 80.9462],
  patna: [25.5941, 85.1376],
  ranchi: [23.3441, 85.3090],
  bhubaneswar: [20.2961, 85.8245],
  guwahati: [26.1445, 91.7362],
};

// Fuzzy parser to resolve city name and return coordinates
const geocodeAddress = (address: string): [number, number] => {
  const addrLower = address.toLowerCase();
  
  // 1. Search for West Bengal districts first
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    if (addrLower.includes(district)) {
      // Add slight random offset to prevent exact markers stacking overlap
      return [
        coords[0] + (Math.random() - 0.5) * 0.02,
        coords[1] + (Math.random() - 0.5) * 0.02
      ];
    }
  }
  
  // 2. Search for major Indian cities
  for (const [city, coords] of Object.entries(INDIA_CITY_COORDS)) {
    if (addrLower.includes(city)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.03,
        coords[1] + (Math.random() - 0.5) * 0.03
      ];
    }
  }
  
  // 3. Fallback: if West Bengal is mentioned, center in West Bengal
  if (addrLower.includes('west bengal') || addrLower.includes('wb')) {
    return [
      22.9868 + (Math.random() - 0.5) * 0.4,
      87.8550 + (Math.random() - 0.5) * 0.4
    ];
  }
  
  // 4. Default: Scatter around central India
  return [
    21.5937 + (Math.random() - 0.5) * 5,
    78.9629 + (Math.random() - 0.5) * 5
  ];
};

export default function HolographicGlobe() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [hudMessage, setHudMessage] = useState('Syncing database orders...');

  // Dynamically load Leaflet Assets on Mount
  useEffect(() => {
    // 1. Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // 2. Custom dark mode styles injection
    const style = document.createElement('style');
    style.innerHTML = `
      .leaflet-container {
        background: #0b0f19 !important;
        font-family: monospace !important;
      }
      .leaflet-bar {
        border: 1px solid rgba(255,255,255,0.1) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.5) !important;
      }
      .leaflet-bar a {
        background-color: #0f172a !important;
        color: #94a3b8 !important;
        border-bottom: 1px solid rgba(255,255,255,0.08) !important;
      }
      .leaflet-bar a:hover {
        background-color: #1e293b !important;
        color: #ffffff !important;
      }
      .leaflet-popup-content-wrapper {
        background: #0f172a !important;
        color: #f1f5f9 !important;
        border: 1px solid #334155 !important;
        border-radius: 12px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6) !important;
      }
      .leaflet-popup-tip {
        background: #0f172a !important;
        border: 1px solid #334155 !important;
      }
      .leaflet-popup-close-button {
        color: #94a3b8 !important;
        padding: 4px 6px !important;
      }
    `;
    document.head.appendChild(style);

    // 3. Leaflet JS Script
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    script.crossOrigin = '';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
      document.head.removeChild(script);
    };
  }, []);

  // Fetch database orders
  useEffect(() => {
    const fetchRealOrders = async () => {
      const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
      if (!savedToken) return;

      try {
        // Fetch processing & shipped orders to map active workflow
        const res = await axios.get(`${API_URL}/api/v1/admin/orders`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const orderData = Array.isArray(res.data) ? res.data : [];
        setOrders(orderData);
        if (orderData.length > 0) {
          setHudMessage(`Loaded ${orderData.length} real order(s) from database.`);
        } else {
          setHudMessage('No active orders found in database.');
        }
      } catch (err) {
        console.error('Failed to load database orders for map', err);
        setHudMessage('Connection error. Displaying warehouse only.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRealOrders();
  }, []);

  // Map Initialization & Marker Rendering
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Centered at West Bengal (lat=22.9868, lon=87.8550) with zoom level 6.5
    const map = L.map(mapContainerRef.current, {
      center: [22.9868, 87.8550],
      zoom: 7,
      zoomControl: true,
      fadeAnimation: true,
      markerZoomAnimation: true,
    });

    // Dark-themed premium map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // 1. Warehouse Neon Beacon Marker (West Bengal Hub)
    const warehouseIcon = L.divIcon({
      className: 'custom-warehouse-icon',
      html: `
        <div class="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-400 flex items-center justify-center animate-ping absolute" style="margin-left: -6px; margin-top: -6px;"></div>
        <div class="w-5 h-5 rounded-full bg-indigo-600 border border-indigo-300 flex items-center justify-center relative shadow-[0_0_12px_#6366f1]">🏬</div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    L.marker(WAREHOUSE_COORDS, { icon: warehouseIcon })
      .addTo(map)
      .bindPopup(`
        <div class="text-xs p-1 font-mono">
          <strong class="text-indigo-400 text-sm">SHADOW ARROW Hub</strong><br/>
          <span class="text-slate-400">West Bengal Central Warehouse</span><br/>
          <span class="text-[10px] text-slate-500 mt-1 block">Distributing across states & districts</span>
        </div>
      `);

    // 2. Plot real orders with markers and tracking lines
    orders.forEach((order) => {
      if (!order.shipping_address) return;
      
      const orderCoords = geocodeAddress(order.shipping_address);
      const isWestBengal = order.shipping_address.toLowerCase().includes('west bengal') || order.shipping_address.toLowerCase().includes('wb');
      
      // Select marker color based on order status
      let markerColor = '#10b981'; // Green for delivered/completed
      let orderStatusLabel = order.order_status || 'CONFIRMED';
      
      if (orderStatusLabel === 'PROCESSING') {
        markerColor = '#f59e0b'; // Amber
      } else if (orderStatusLabel === 'SHIPPED') {
        markerColor = '#3b82f6'; // Blue
      } else if (orderStatusLabel === 'CANCELLED') {
        markerColor = '#ef4444'; // Red
      }

      const orderIcon = L.divIcon({
        className: 'custom-order-icon',
        html: `
          <div class="w-3.5 h-3.5 rounded-full border border-white flex items-center justify-center" style="background-color: ${markerColor}; box-shadow: 0 0 8px ${markerColor}"></div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      // Add order marker
      const marker = L.marker(orderCoords, { icon: orderIcon })
        .addTo(map)
        .bindPopup(`
          <div class="text-[11px] font-mono leading-relaxed p-0.5">
            <strong class="text-white text-xs">${order.customer_name}</strong><br/>
            <span class="text-slate-400">ID: ${order.order_id}</span><br/>
            <span class="text-slate-400">Dest: ${order.shipping_address}</span><br/>
            <div class="mt-1 flex items-center gap-1.5">
              <span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase" style="background-color: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}40">
                ${orderStatusLabel}
              </span>
              <span class="text-indigo-300 font-bold">₹${order.total_amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        `);

      // 3. Draw shipping connection curves (polylines) from warehouse to customer location
      if (orderStatusLabel === 'PROCESSING' || orderStatusLabel === 'SHIPPED' || orderStatusLabel === 'CONFIRMED') {
        // Curve coordinates helper
        const midPoint: [number, number] = [
          (WAREHOUSE_COORDS[0] + orderCoords[0]) / 2 + (Math.random() - 0.5) * 0.3,
          (WAREHOUSE_COORDS[1] + orderCoords[1]) / 2 + (Math.random() - 0.5) * 0.3,
        ];
        
        const polyline = L.polyline([WAREHOUSE_COORDS, midPoint, orderCoords], {
          color: markerColor,
          weight: 1.5,
          opacity: 0.5,
          dashArray: '3, 4',
        }).addTo(map);
      }
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
    };
  }, [leafletLoaded, orders]);

  return (
    <div
      className="w-full bg-ops-800 border border-ops-700 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-ops-700/80 flex items-center justify-between bg-ops-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              LIVE GEOGRAPHICAL ORDERS SCANNER
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live OpenStreetMap tracker showing real orders with district-level zoom
            </p>
          </div>
        </div>
      </div>

      {/* Map rendering div */}
      <div className="relative flex-1 bg-[#0b0f19] h-[360px]">
        {loadingOrders ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Connecting to database & loading telemetry...</span>
          </div>
        ) : (
          <div
            ref={mapContainerRef}
            className="w-full h-full border-none outline-none z-0"
            id="real-order-map"
          />
        )}

        {/* Live HUD ticker overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-ops-950/80 border border-ops-700/80 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center justify-between font-mono text-[10px] shadow-lg z-[400] pointer-events-none">
          <div className="flex items-center space-x-2.5 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-slate-400 uppercase tracking-wider">DATABASE SYNC:</span>
            <span className="text-indigo-300 font-bold truncate">
              {hudMessage}
            </span>
          </div>
          <span className="text-slate-500 text-[9px] uppercase hidden sm:inline-block font-bold">
            ZOOM IN TO SCAN WEST BENGAL DISTRICTS
          </span>
        </div>
      </div>
    </div>
  );
}
