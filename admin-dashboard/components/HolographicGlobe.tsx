'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Globe } from 'lucide-react';

interface City {
  name: string;
  lat: number;
  lon: number;
}

const CITIES: City[] = [
  { name: 'Mumbai', lat: 19.076, lon: 72.877 },
  { name: 'Delhi', lat: 28.613, lon: 77.209 },
  { name: 'Bengaluru', lat: 12.971, lon: 77.594 },
  { name: 'Kolkata', lat: 22.572, lon: 88.363 },
  { name: 'Chennai', lat: 13.082, lon: 80.270 },
  { name: 'Hyderabad', lat: 17.385, lon: 78.486 },
  { name: 'London', lat: 51.507, lon: -0.127 },
  { name: 'New York', lat: 40.712, lon: -74.005 },
  { name: 'Tokyo', lat: 35.676, lon: 139.650 },
  { name: 'Singapore', lat: 1.352, lon: 103.819 },
];

interface LaserArc {
  src: City;
  dest: City;
  t: number;      // 0 to 1 progress
  speed: number;
  points: { x: number; y: number; z: number }[];
  particles: { x: number; y: number; size: number; alpha: number; color: string }[];
  color: string;
  finished: boolean;
}

export default function HolographicGlobe() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentOrder, setRecentOrder] = useState<string>('Monitoring system traffic...');

  // Animation values refs (to prevent React re-renders from lagging canvas)
  const rotationRef = useRef({ yaw: 0.8, pitch: 0.3 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const activeArcsRef = useRef<LaserArc[]>([]);
  const explosionsRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; life: number }[]>([]);

  // Synthesize notification sound
  const playAudioChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const audioCtx = new AudioCtx();
      
      const playTone = (freq: number, delay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime + delay);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + delay + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      // Holographic double-ping chime chord
      playTone(523.25, 0, 0.35);    // C5
      playTone(659.25, 0.06, 0.4);   // E5
      playTone(783.99, 0.12, 0.5);   // G5
    } catch (e) {
      console.warn('Audio Autoplay policy blocked sound');
    }
  };

  // Convert Lat/Lon to 3D Cartesian coordinates
  const get3DCoords = (lat: number, lon: number, r: number) => {
    const latRad = (lat * Math.PI) / 180;
    const lonRad = (lon * Math.PI) / 180;
    return {
      x: r * Math.cos(latRad) * Math.sin(lonRad),
      y: r * Math.sin(latRad),
      z: r * Math.cos(latRad) * Math.cos(lonRad),
    };
  };

  // Generate 3D arc path
  const generateArcPath = (src: City, dest: City, r: number) => {
    const p1 = get3DCoords(src.lat, src.lon, r);
    const p2 = get3DCoords(dest.lat, dest.lon, r);
    const path = [];
    const steps = 40;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // Linear interpolation
      let px = p1.x + (p2.x - p1.x) * t;
      let py = p1.y + (p2.y - p1.y) * t;
      let pz = p1.z + (p2.z - p1.z) * t;
      
      // Add arc height normal to globe surface
      const normalX = px;
      const normalY = py;
      const normalZ = pz;
      const normalLen = Math.sqrt(normalX * normalX + normalY * normalY + normalZ * normalZ);
      
      // Midpoint altitude multiplier
      const altitude = 45 * Math.sin(t * Math.PI);
      px += (normalX / normalLen) * altitude;
      py += (normalY / normalLen) * altitude;
      pz += (normalZ / normalLen) * altitude;
      
      path.push({ x: px, y: py, z: pz });
    }
    return path;
  };

  // Add random simulated order shipping arc
  const triggerMockOrder = () => {
    if (CITIES.length < 2) return;
    const srcIdx = Math.floor(Math.random() * CITIES.length);
    let destIdx = Math.floor(Math.random() * CITIES.length);
    while (destIdx === srcIdx) {
      destIdx = Math.floor(Math.random() * CITIES.length);
    }
    
    const src = CITIES[srcIdx];
    const dest = CITIES[destIdx];
    const colors = ['#f43f5e', '#38bdf8', '#a855f7', '#fbbf24', '#10b981'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    
    const orderTypes = ['Premium Sneakers Ordered', 'Carbon Arrow Hoodie Ordered', 'Custom Cargo Pants Ordered', 'Cyber Bow Release Ordered', 'Tactical Gear Sync Complete'];
    const type = orderTypes[Math.floor(Math.random() * orderTypes.length)];
    
    setRecentOrder(`[NEW] ${type} from ${src.name} to ${dest.name}!`);
    
    const path = generateArcPath(src, dest, 120);
    activeArcsRef.current.push({
      src,
      dest,
      t: 0,
      speed: 0.015 + Math.random() * 0.01,
      points: path,
      particles: [],
      color: chosenColor,
      finished: false,
    });
  };

  // Canvas Drawing & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    const R = 120; // Globe base radius
    let slowPulse = 0;

    const handleResize = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth;
        canvas.height = 360;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const drawLoop = () => {
      if (!ctx || !canvas) return;

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Clear with radial overlay for glowing look
      ctx.fillStyle = '#0b0f19';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid background dots
      ctx.save();
      ctx.fillStyle = 'rgba(99, 102, 241, 0.03)';
      for (let x = 10; x < canvas.width; x += 30) {
        for (let y = 10; y < canvas.height; y += 30) {
          ctx.fillRect(x, y, 2, 2);
        }
      }
      ctx.restore();

      // Slow auto rotate when not dragging
      if (!isDraggingRef.current && isPlaying) {
        rotationRef.current.yaw += 0.0025;
      }

      const yaw = rotationRef.current.yaw;
      const pitch = rotationRef.current.pitch;

      // 3D coordinate rotation helper
      const rotatePoint = (x: number, y: number, z: number) => {
        // Yaw (Y-axis rotation)
        const x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
        const z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
        
        // Pitch (X-axis rotation)
        const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
        const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
        
        return { x: x1, y: y2, z: z2 };
      };

      // Project points to 2D
      const project = (pt: { x: number; y: number; z: number }) => {
        return {
          x: cx + pt.x,
          y: cy + pt.y,
          z: pt.z, // Keep depth for coloring
        };
      };

      slowPulse = (slowPulse + 0.04) % (2 * Math.PI);

      // 1. Draw Latitudes Grid (Horizontal)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
      ctx.lineWidth = 0.8;
      for (let lat = -80; lat <= 80; lat += 20) {
        const latRad = (lat * Math.PI) / 180;
        const y = R * Math.sin(latRad);
        const rRing = R * Math.cos(latRad);

        ctx.beginPath();
        let first = true;
        for (let th = 0; th <= 360; th += 10) {
          const thRad = (th * Math.PI) / 180;
          const pt = rotatePoint(rRing * Math.cos(thRad), y, rRing * Math.sin(thRad));
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

      // 2. Draw Longitudes Grid (Vertical)
      for (let lon = 0; lon < 180; lon += 30) {
        const lonRad = (lon * Math.PI) / 180;
        ctx.beginPath();
        let first = true;
        for (let th = 0; th <= 360; th += 10) {
          const thRad = (th * Math.PI) / 180;
          const pt = rotatePoint(
            R * Math.cos(thRad) * Math.cos(lonRad),
            R * Math.sin(thRad),
            R * Math.cos(thRad) * Math.sin(lonRad)
          );
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

      // 3. Draw City Anchors
      CITIES.forEach((city) => {
        const coords = get3DCoords(city.lat, city.lon, R);
        const rotated = rotatePoint(coords.x, coords.y, coords.z);
        const screen = project(rotated);
        
        // Front-facing cities are brighter
        const isFront = rotated.z > -10;
        const opacity = isFront ? 0.8 : 0.18;

        // Draw outer pulsing rings on active hubs
        if (isFront) {
          ctx.beginPath();
          ctx.arc(screen.x, screen.y, 6 + Math.sin(slowPulse + city.lat) * 2, 0, 2 * Math.PI);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Draw inner dot
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = isFront ? '#38bdf8' : 'rgba(56, 189, 248, 0.3)';
        ctx.shadowBlur = isFront ? 8 : 0;
        ctx.shadowColor = '#38bdf8';
        ctx.fill();

        // City labels (only front-facing)
        if (isFront) {
          ctx.font = 'bold 9px monospace';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillText(city.name, screen.x + 6, screen.y + 3);
        }
      });

      // 4. Update and Draw Laser Arcs
      const activeArcs = activeArcsRef.current;
      for (let i = activeArcs.length - 1; i >= 0; i--) {
        const arc = activeArcs[i];
        
        // Draw the curved route line
        ctx.beginPath();
        let first = true;
        arc.points.forEach((pt) => {
          const rotated = rotatePoint(pt.x, pt.y, pt.z);
          const screen = project(rotated);
          
          if (first) {
            ctx.moveTo(screen.x, screen.y);
            first = false;
          } else {
            ctx.lineTo(screen.x, screen.y);
          }
        });
        ctx.strokeStyle = arc.color + '40'; // Semi-transparent route line
        ctx.lineWidth = 1.2;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash

        // Draw moving laser particle
        arc.t += arc.speed;
        if (arc.t >= 1.0) {
          arc.finished = true;
          // Trigger explosion particle effect at destination
          const finalPt = arc.points[arc.points.length - 1];
          const finalRot = rotatePoint(finalPt.x, finalPt.y, finalPt.z);
          const finalScreen = project(finalRot);
          
          playAudioChime();
          for (let p = 0; p < 18; p++) {
            explosionsRef.current.push({
              x: finalScreen.x,
              y: finalScreen.y,
              vx: (Math.random() - 0.5) * 4.5,
              vy: (Math.random() - 0.5) * 4.5,
              color: arc.color,
              life: 1.0,
            });
          }
          activeArcs.splice(i, 1);
          continue;
        }

        // Draw current laser beam position
        const targetIdx = Math.floor(arc.points.length * arc.t);
        const currentPt = arc.points[Math.min(targetIdx, arc.points.length - 1)];
        if (currentPt) {
          const rotPt = rotatePoint(currentPt.x, currentPt.y, currentPt.z);
          const screenPt = project(rotPt);

          // Render neon dot representing flying shipping package
          ctx.beginPath();
          ctx.arc(screenPt.x, screenPt.y, 4.5, 0, 2 * Math.PI);
          ctx.fillStyle = arc.color;
          ctx.shadowBlur = 12;
          ctx.shadowColor = arc.color;
          ctx.fill();
        }
      }

      // 5. Update and Draw Explosions
      const explosions = explosionsRef.current;
      for (let i = explosions.length - 1; i >= 0; i--) {
        const exp = explosions[i];
        exp.x += exp.vx;
        exp.y += exp.vy;
        exp.life -= 0.025; // fade out life

        if (exp.life <= 0) {
          explosions.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(exp.x, exp.y, 1.8 * exp.life, 0, 2 * Math.PI);
        ctx.fillStyle = exp.color;
        ctx.globalAlpha = exp.life;
        ctx.fill();
        ctx.globalAlpha = 1.0; // Reset opacity
      }

      // Draw Orbit Halo Ring
      ctx.beginPath();
      ctx.arc(cx, cy, R + 2, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.08)';
      ctx.lineWidth = 4;
      ctx.stroke();

      if (isPlaying) {
        animFrameId = requestAnimationFrame(drawLoop);
      }
    };

    if (isPlaying) {
      animFrameId = requestAnimationFrame(drawLoop);
    } else {
      drawLoop(); // Render static frame if paused
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, soundEnabled]);

  // Drag interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    // Scale dragging speed
    rotationRef.current.yaw += dx * 0.007;
    rotationRef.current.pitch += dy * 0.007;
    
    dragStartRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  // Automatically trigger new mock orders every few seconds to animate live map
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      triggerMockOrder();
    }, 4500 + Math.random() * 2500);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className="w-full bg-ops-800 border border-ops-700 rounded-2xl flex flex-col overflow-hidden relative shadow-2xl backdrop-blur-xl"
    >
      {/* Visual Header */}
      <div className="px-5 py-4 border-b border-ops-700/80 flex items-center justify-between bg-ops-950/40">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-lg">
            <Globe className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              HOLOGRAPHIC 3D TRAFFIC & ORDER GLOBE
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              Live telemetry tracking order packages moving in real-time
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className={`p-2 rounded-lg border transition ${
              soundEnabled
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Pause Toggle */}
          <button
            onClick={() => setIsPlaying((prev) => !prev)}
            className={`p-2 rounded-lg border transition ${
              isPlaying
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-800/40 border-slate-700 text-slate-500 hover:text-slate-400'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Resume Simulation'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 3D Canvas element */}
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className="w-full h-[360px] cursor-grab active:cursor-grabbing block"
        />

        {/* Live HUD ticker overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-ops-950/80 border border-ops-700/80 px-4 py-2.5 rounded-xl backdrop-blur-md flex items-center justify-between font-mono text-[10px] shadow-lg pointer-events-none">
          <div className="flex items-center space-x-2.5 truncate">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400 uppercase tracking-wider">LIVE TELEMETRY:</span>
            <span className="text-indigo-300 font-bold truncate" title={recentOrder}>
              {recentOrder}
            </span>
          </div>
          <span className="text-slate-500 text-[9px] uppercase hidden sm:inline-block font-bold">
            DRAG TO ROTATE GLOBE
          </span>
        </div>
      </div>
    </div>
  );
}
