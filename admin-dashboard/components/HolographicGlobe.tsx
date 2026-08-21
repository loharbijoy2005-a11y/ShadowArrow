'use client';

import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Globe as GlobeIcon, Loader2 } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

// Warehouse Coordinates (Kolkata/Howrah, West Bengal)
const WAREHOUSE_LAT = 22.6105;
const WAREHOUSE_LNG = 88.3976;

// West Bengal district coordinate definitions
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

// Geocoder parser
const geocodeAddress = (address: string): [number, number] => {
  const addrLower = address.toLowerCase();
  
  for (const [district, coords] of Object.entries(DISTRICT_COORDS)) {
    if (addrLower.includes(district)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.04,
        coords[1] + (Math.random() - 0.5) * 0.04
      ];
    }
  }
  
  for (const [city, coords] of Object.entries(INDIA_CITY_COORDS)) {
    if (addrLower.includes(city)) {
      return [
        coords[0] + (Math.random() - 0.5) * 0.05,
        coords[1] + (Math.random() - 0.5) * 0.05
      ];
    }
  }
  
  if (addrLower.includes('west bengal') || addrLower.includes('wb')) {
    return [
      22.9868 + (Math.random() - 0.5) * 0.6,
      87.8550 + (Math.random() - 0.5) * 0.6
    ];
  }
  
  return [
    20.5937 + (Math.random() - 0.5) * 6,
    78.9629 + (Math.random() - 0.5) * 6
  ];
};

export default function HolographicGlobe() {
  const globeContainerRef = useRef<HTMLDivElement | null>(null);
  const globeInstanceRef = useRef<any>(null);

  const [globeLoaded, setGlobeLoaded] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [hudMessage, setHudMessage] = useState('Syncing database orders...');

  // Dynamically load ThreeJS and GlobeGL from CDNs
  useEffect(() => {
    // 1. Load Three.js first
    const threeScript = document.createElement('script');
    threeScript.src = 'https://unpkg.com/three@0.145.0/build/three.min.js';
    threeScript.async = true;
    threeScript.onload = () => {
      // 2. Load Globe.gl after Three.js is complete
      const globeScript = document.createElement('script');
      globeScript.src = 'https://unpkg.com/globe.gl@2.32.1/dist/globe.gl.min.js';
      globeScript.async = true;
      globeScript.onload = () => {
        setGlobeLoaded(true);
      };
      document.head.appendChild(globeScript);
    };
    document.head.appendChild(threeScript);

    return () => {
      document.head.removeChild(threeScript);
      const scripts = document.head.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src && scripts[i].src.includes('globe.gl')) {
          document.head.removeChild(scripts[i]);
        }
      }
    };
  }, []);

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

  // Initialize and Render 3D Globe
  useEffect(() => {
    if (!globeLoaded || !globeContainerRef.current) return;
    if (globeInstanceRef.current) return; // Prevent double init

    const Globe = (window as any).Globe;
    if (!Globe) return;

    // Format Point Markers, Arcs, and Labels for Globe.gl
    const pointsData = orders.map((order) => {
      const coords = geocodeAddress(order.shipping_address);
      let color = '#10b981'; // Completed
      if (order.order_status === 'PROCESSING') color = '#f59e0b';
      else if (order.order_status === 'SHIPPED') color = '#3b82f6';
      else if (order.order_status === 'CANCELLED') color = '#ef4444';

      return {
        lat: coords[0],
        lng: coords[1],
        size: 0.15,
        color: color,
        label: `${order.customer_name} (${order.order_id})`,
      };
    });

    const arcsData = orders.map((order) => {
      const coords = geocodeAddress(order.shipping_address);
      let color = '#10b981'; // Completed
      if (order.order_status === 'PROCESSING') color = '#f59e0b';
      else if (order.order_status === 'SHIPPED') color = '#3b82f6';
      else if (order.order_status === 'CANCELLED') color = '#ef4444';

      return {
        startLat: WAREHOUSE_LAT,
        startLng: WAREHOUSE_LNG,
        endLat: coords[0],
        endLng: coords[1],
        color: ['rgba(99, 102, 241, 0.75)', color],
      };
    });

    const labelsData = orders.map((order) => {
      const coords = geocodeAddress(order.shipping_address);
      return {
        lat: coords[0],
        lng: coords[1],
        text: `${order.customer_name} (₹${order.total_amount})`,
        color: '#f8fafc',
        size: 0.75,
        dotRadius: 0.1,
      };
    });

    // Add Central Warehouse label
    labelsData.push({
      lat: WAREHOUSE_LAT,
      lng: WAREHOUSE_LNG,
      text: '★ SHADOW ARROW WAREHOUSE',
      color: '#818cf8',
      size: 1.1,
      dotRadius: 0.35,
    });

    // Instantiate Globe.gl
    const myGlobe = Globe()(globeContainerRef.current)
      .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
      .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
      .backgroundColor('rgba(0,0,0,0)') // Transparent background
      .showAtmosphere(true)
      .atmosphereColor('#3a92c8')
      .atmosphereAltitude(0.2)
      .width(globeContainerRef.current.clientWidth)
      .height(360)
      
      // Points styling
      .pointsData(pointsData)
      .pointColor('color')
      .pointRadius('size')
      .pointAltitude(0.01)
      .pointLabel('label')
      
      // Animated 3D Arc paths styling
      .arcsData(arcsData)
      .arcColor('color')
      .arcDashLength(0.4)
      .arcDashGap(0.15)
      .arcDashAnimateTime(1800)
      .arcStroke(1.2)
      
      // Holographic Labels styling
      .labelsData(labelsData)
      .labelLat('lat')
      .labelLng('lng')
      .labelText('text')
      .labelColor('color')
      .labelSize('size')
      .labelDotRadius('dotRadius')
      .labelResolution(3);

    // Auto rotate settings
    myGlobe.controls().autoRotate = true;
    myGlobe.controls().autoRotateSpeed = 0.6;
    myGlobe.controls().enableZoom = true;

    // Focus initial view on India/Asia region
    myGlobe.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2.2 });

    globeInstanceRef.current = myGlobe;

    // Resize listener
    const handleResize = () => {
      if (globeContainerRef.current && globeInstanceRef.current) {
        globeInstanceRef.current.width(globeContainerRef.current.clientWidth);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (globeContainerRef.current) {
        globeContainerRef.current.innerHTML = '';
      }
      globeInstanceRef.current = null;
    };
  }, [globeLoaded, orders]);

  return (
    <div
      className="w-full bg-ops-800 border border-ops-700 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-ops-700/80 flex items-center justify-between bg-ops-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <GlobeIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              REAL-TIME 3D PLANET EARTH GLOBE
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live NASA Blue Marble 3D projection rendering real customer orders
            </p>
          </div>
        </div>
      </div>

      {/* Render Element */}
      <div className="relative flex-1 bg-ops-900/40 h-[360px]">
        {loadingOrders || !globeLoaded ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Initializing Three.js engine & dynamic assets...</span>
          </div>
        ) : (
          <div
            ref={globeContainerRef}
            className="w-full h-full outline-none z-0"
            id="globeEl"
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
            DRAG TO ROTATE • SCROLL TO ZOOM WORLDWIDE
          </span>
        </div>
      </div>
    </div>
  );
}
