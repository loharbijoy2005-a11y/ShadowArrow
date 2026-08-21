'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Globe, Loader2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

// Warehouse Coordinates provided by User
const WAREHOUSE_LAT = 23.1595236;
const WAREHOUSE_LNG = 87.3516596;

// West Bengal districts coordinates dictionary
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

// Geocode matching function
const geocodeAddress = (address: string): [number, number] => {
  const addrLower = address.toLowerCase();
  
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    if (addrLower.includes(district)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.02,
        coords[1] + (Math.random() - 0.5) * 0.02
      ];
    }
  }
  
  for (const [city, coords] of Object.entries(INDIA_CITY_COORDS)) {
    if (addrLower.includes(city)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.03,
        coords[1] + (Math.random() - 0.5) * 0.03
      ];
    }
  }
  
  if (addrLower.includes('west bengal') || addrLower.includes('wb')) {
    return [
      22.9868 + (Math.random() - 0.5) * 0.4,
      87.8550 + (Math.random() - 0.5) * 0.4
    ];
  }
  
  return [
    20.5937 + (Math.random() - 0.5) * 5,
    78.9629 + (Math.random() - 0.5) * 5
  ];
};

interface RenderPoint {
  x: number;
  y: number;
  z: number;
}

export default function HolographicGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [hudMessage, setHudMessage] = useState('Connecting to system telemetry...');

  // Navigation state refs
  const rotationRef = useRef({ yaw: 0.8, pitch: 0.3 });
  const zoomRef = useRef<number>(1.2); // Current zoom level
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lastInteractionTimeRef = useRef<number>(0);

  // Fetch real database orders
  useEffect(() => {
    const fetchRealOrders = async () => {
      const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
      if (!savedToken) return;

      try {
        const res = await axios.get(`${API_URL}/api/v1/admin/orders`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const orderData = Array.isArray(res.data) ? res.data : [];
        setOrders(orderData);
        if (orderData.length > 0) {
          setHudMessage(`Loaded ${orderData.length} active database order(s).`);
        } else {
          setHudMessage('No active orders found in database.');
        }
      } catch (err) {
        console.error('Failed to load database orders for 3D globe', err);
        setHudMessage('Connection error. Displaying warehouse only.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchRealOrders();
  }, []);

  // 3D Math Calculations & Canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let slowPulse = 0;
    const baseR = 100; // Base Globe Radius

    const handleResize = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = 360;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Convert Lat/Lng to spherical 3D points
    const latLngTo3D = (lat: number, lng: number, r: number): RenderPoint => {
      const latRad = (lat * Math.PI) / 180;
      const lngRad = (lng * Math.PI) / 180;
      return {
        x: r * Math.cos(latRad) * Math.sin(lngRad),
        y: -r * Math.sin(latRad), // Invert Y for canvas mapping
        z: r * Math.cos(latRad) * Math.cos(lngRad),
      };
    };

    const drawLoop = () => {
      if (!ctx || !canvas) return;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const R = baseR * zoomRef.current; // Adjust radius by zoom level

      // Clear background
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background dots
      ctx.save();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.02)';
      for (let x = 10; x < canvas.width; x += 30) {
        for (let y = 10; y < canvas.height; y += 30) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.restore();

      const yaw = rotationRef.current.yaw;
      const pitch = rotationRef.current.pitch;

      // Auto rotate only if user has not interacted in the last 4 seconds
      const now = Date.now();
      if (now - lastInteractionTimeRef.current > 4000) {
        rotationRef.current.yaw += 0.003;
      }

      // Rotate point around pitch (X-axis) and yaw (Y-axis)
      const rotatePoint = (pt: RenderPoint) => {
        // Yaw
        const x1 = pt.x * Math.cos(yaw) - pt.z * Math.sin(yaw);
        const z1 = pt.x * Math.sin(yaw) + pt.z * Math.cos(yaw);
        // Pitch
        const y2 = pt.y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = pt.y * Math.sin(pitch) + z1 * Math.cos(pitch);

        return { x: x1, y: y2, z: z2 };
      };

      const project = (pt: RenderPoint) => {
        return {
          x: cx + pt.x,
          y: cy + pt.y,
          z: pt.z,
        };
      };

      slowPulse = (slowPulse + 0.05) % (2 * Math.PI);

      // 1. Draw Latitudes Grid (Horizontal circles)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 0.8;
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = R * Math.sin(latRad);
        const rRing = R * Math.cos(latRad);

        ctx.beginPath();
        let first = true;
        for (let th = 0; th <= 360; th += 15) {
          const thRad = (th * Math.PI) / 180;
          const pt = rotatePoint({ x: rRing * Math.cos(thRad), y: y, z: rRing * Math.sin(thRad) });
          const screen = project(pt);
          
          if (first) {
            ctx.moveTo(screen.x, screen.y);
            first = false;
          } else {
            ctx.lineTo(screen.x, screen.y);
          }
        }
        ctx.stroke();
      }

      // 2. Draw Longitudes Grid (Vertical circles)
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = (lon * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let th = 0; th <= 360; th += 15) {
          const thRad = (th * Math.PI) / 180;
          const pt = rotatePoint({
            x: R * Math.cos(thRad) * Math.cos(lonRad),
            y: R * Math.sin(thRad),
            z: R * Math.cos(thRad) * Math.sin(lonRad),
          });
          const screen = project(pt);
          
          if (first) {
            ctx.moveTo(screen.x, screen.y);
            first = false;
          } else {
            ctx.lineTo(screen.x, screen.y);
          }
        }
        ctx.stroke();
      }

      // 3. Draw Warehouse Marker (Pulsing holographic anchor at user coordinates)
      const w3D = latLngTo3D(WAREHOUSE_LAT, WAREHOUSE_LNG, R);
      const wRot = rotatePoint(w3D);
      const wScreen = project(wRot);
      const isWarehouseFront = wRot.z > -10;

      if (isWarehouseFront) {
        // Blinking anchor ring
        ctx.beginPath();
        ctx.arc(wScreen.x, wScreen.y, 8 + Math.sin(slowPulse * 1.5) * 3, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.7)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Solid inner dot
        ctx.beginPath();
        ctx.arc(wScreen.x, wScreen.y, 4, 0, 2 * Math.PI);
        ctx.fillStyle = '#818cf8';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#818cf8';
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = '#a5b4fc';
        ctx.fillText('★ SHADOW ARROW HUB', wScreen.x + 8, wScreen.y + 3);
      }

      // 4. Plot Real Orders & Draw Ultra-Thin lines (Zoom-sensitive)
      orders.forEach((order) => {
        if (!order.shipping_address) return;
        
        const coords = geocodeAddress(order.shipping_address);
        const pt3D = latLngTo3D(coords[0], coords[1], R);
        const rot = rotatePoint(pt3D);
        const screen = project(rot);

        const isFront = rot.z > -10;
        if (!isFront) return; // Skip back-face markers

        const isWestBengal = order.shipping_address.toLowerCase().includes('west bengal') || order.shipping_address.toLowerCase().includes('wb');

        let markerColor = '#10b981'; // Confirmed/Delivered
        if (order.order_status === 'PROCESSING') markerColor = '#f59e0b';
        else if (order.order_status === 'SHIPPED') markerColor = '#3b82f6';
        else if (order.order_status === 'CANCELLED') markerColor = '#ef4444';

        // Blinking calculations for West Bengal orders
        let scalePulse = 1.0;
        let opacityPulse = 0.8;
        if (isWestBengal) {
          scalePulse = 1.0 + Math.sin(slowPulse * 2.0) * 0.35; // Rapid blink
          opacityPulse = 0.5 + Math.sin(slowPulse * 2.0) * 0.5;
        }

        // Draw order node
        ctx.save();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 3 * scalePulse, 0, 2 * Math.PI);
        ctx.fillStyle = markerColor;
        ctx.globalAlpha = opacityPulse;
        ctx.shadowBlur = 10;
        ctx.shadowColor = markerColor;
        ctx.fill();
        ctx.restore();

        // Draw text label on high zoom
        if (zoomRef.current > 1.8) {
          ctx.font = '8px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText(`${order.customer_name} (₹${order.total_amount})`, screen.x + 6, screen.y + 2);
        }

        // 5. Draw Ultra-Thin Connection Arcs (Visibility dependent on zoom factor)
        // Hidden/practically invisible at low zoom, visible when user zooms in
        let lineOpacity = 0.02;
        if (zoomRef.current > 2.0) {
          // Fade in dynamically
          lineOpacity = Math.min(0.65, (zoomRef.current - 2.0) * 0.25);
        }

        if (lineOpacity > 0.03 && isWarehouseFront) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(wScreen.x, wScreen.y);
          
          // Draw simple projected 3D arc curve between warehouse and customer location
          const midX = (wScreen.x + screen.x) / 2;
          const midY = (wScreen.y + screen.y) / 2 - 25 * zoomRef.current; // Arc height
          
          ctx.quadraticCurveTo(midX, midY, screen.x, screen.y);
          ctx.strokeStyle = markerColor;
          ctx.globalAlpha = lineOpacity;
          ctx.lineWidth = 0.8; // Ultra thin
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Atmosphere/Radar Ring Glow
      ctx.beginPath();
      ctx.arc(cx, cy, R + 4, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(58, 146, 200, 0.12)';
      ctx.lineWidth = 3;
      ctx.stroke();

      animFrameId = requestAnimationFrame(drawLoop);
    };

    animFrameId = requestAnimationFrame(drawLoop);

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [orders]);

  // Drag rotation handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    rotationRef.current.yaw += dx * 0.007;
    rotationRef.current.pitch += dy * 0.007;
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    lastInteractionTimeRef.current = Date.now();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Scroll wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    // Zoom factor ranges from 0.6 (zoomed out) to 5.0 (deep zoomed in)
    const direction = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.min(5.0, Math.max(0.6, zoomRef.current + direction * 0.08));
    zoomRef.current = newZoom;
    lastInteractionTimeRef.current = Date.now();
  };

  const triggerZoom = (zoomIn: boolean) => {
    const direction = zoomIn ? 1 : -1;
    const newZoom = Math.min(5.0, Math.max(0.6, zoomRef.current + direction * 0.4));
    zoomRef.current = newZoom;
    lastInteractionTimeRef.current = Date.now();
  };

  const resetView = () => {
    rotationRef.current = { yaw: 0.8, pitch: 0.3 };
    zoomRef.current = 1.2;
    lastInteractionTimeRef.current = Date.now();
  };

  return (
    <div
      ref={containerRef}
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
              HOLOGRAPHIC 3D NETWORK GLOBE
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live offline-ready canvas sphere. Drag to rotate, scroll/zoom anywhere.
            </p>
          </div>
        </div>

        {/* Zoom & Reset Toolbar */}
        <div className="flex items-center space-x-1.5 z-10">
          <button
            onClick={() => triggerZoom(true)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => triggerZoom(false)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Render Element */}
      <div className="relative flex-1 bg-[#0b0f19] h-[360px]">
        {loadingOrders ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Initializing 3D Telemetry Grid...</span>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onWheel={handleWheel}
            className="w-full h-full cursor-grab active:cursor-grabbing block"
          />
        )}

        {/* Live HUD ticker overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-ops-950/80 border border-ops-700/80 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center justify-between font-mono text-[10px] shadow-lg pointer-events-none z-10">
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
            DRAG TO ROTATE • WHEEL TO ZOOM GLOBE
          </span>
        </div>
      </div>
    </div>
  );
}
