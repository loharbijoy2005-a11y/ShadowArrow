'use client';

import React, { useEffect, useRef } from 'react';

export default function GalaxyVFXBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    interface Star {
      x: number;
      y: number;
      size: number;
      alpha: number;
      alphaSpeed: number;
      vx: number;
      vy: number;
      color: string;
    }

    const starColors = ['#60A5FA', '#818CF8', '#A78BFA', '#38BDF8', '#FFFFFF'];
    
    // Lightweight count for buttery smooth 60fps
    const starCount = Math.min(Math.floor((width * height) / 22000), 45);
    const stars: Star[] = [];

    for (let i = 0; i < starCount; i++) {
      const alpha = Math.random() * 0.6 + 0.3;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.8 + 0.8,
        alpha: alpha,
        alphaSpeed: (Math.random() - 0.5) * 0.01,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        color: starColors[Math.floor(Math.random() * starColors.length)],
      });
    }

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Fast star particle update & render loop
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];

        star.x += star.vx;
        star.y += star.vy;

        if (star.x < 0) star.x = width;
        if (star.x > width) star.x = 0;
        if (star.y < 0) star.y = height;
        if (star.y > height) star.y = 0;

        star.alpha += star.alphaSpeed;
        if (star.alpha <= 0.2 || star.alpha >= 0.9) {
          star.alphaSpeed = -star.alphaSpeed;
        }

        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        // Optimized constellation lines (squared distance check)
        for (let j = i + 1; j < stars.length; j++) {
          const star2 = stars[j];
          const dx = star.x - star2.x;
          const dy = star.y - star2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 6400) { // 80px threshold squared
            const dist = Math.sqrt(distSq);
            ctx.globalAlpha = (1 - dist / 80) * 0.12;
            ctx.strokeStyle = '#60A5FA';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(star2.x, star2.y);
            ctx.stroke();
          }
        }

        // Soft mouse connection line
        const mdx = mouseX - star.x;
        const mdy = mouseY - star.y;
        const mdistSq = mdx * mdx + mdy * mdy;
        if (mdistSq < 14400) { // 120px threshold squared
          const mdist = Math.sqrt(mdistSq);
          ctx.globalAlpha = (1 - mdist / 120) * 0.2;
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(mouseX, mouseY);
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-60 transition-opacity duration-500"
    />
  );
}
