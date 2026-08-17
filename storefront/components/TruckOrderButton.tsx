'use client';

import React, { useState } from 'react';
import { Check, Truck } from 'lucide-react';

interface TruckOrderButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onValidate?: () => boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  defaultText?: string;
}

export default function TruckOrderButton({
  onClick,
  onValidate,
  disabled = false,
  loading = false,
  type = 'submit',
  className = '',
  defaultText = 'Complete Order',
}: TruckOrderButtonProps) {
  const [status, setStatus] = useState<'idle' | 'animating' | 'success'>('idle');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || status !== 'idle') return;

    // Validate fields if validator provided
    if (onValidate && !onValidate()) {
      return;
    }

    // Trigger Truck Drive Animation
    setStatus('animating');

    if (onClick) {
      onClick(e);
    }

    // Smooth timing: 2.2 seconds drive animation to completion
    setTimeout(() => {
      setStatus('success');
    }, 2200);
  };

  return (
    <>
      {/* Keyframe Animations */}
      <style jsx global>{`
        @keyframes truckDrive {
          0% {
            transform: translateX(-120%) scale(1);
            opacity: 1;
          }
          30% {
            transform: translateX(100px) scale(1.08) rotate(-2deg);
          }
          70% {
            transform: translateX(220px) scale(1) rotate(1deg);
          }
          100% {
            transform: translateX(420px) scale(0.9);
            opacity: 0;
          }
        }

        @keyframes roadStripes {
          0% { background-position: 0 0; }
          100% { background-position: -40px 0; }
        }

        @keyframes checkPop {
          0% { transform: scale(0) rotate(-45deg); opacity: 0; }
          70% { transform: scale(1.2) rotate(10deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }

        .animate-truck-drive {
          animation: truckDrive 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-road-move {
          animation: roadStripes 0.4s linear infinite;
        }

        .animate-check-pop {
          animation: checkPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>

      <button
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        className={`relative w-full overflow-hidden rounded-2xl py-4 font-black uppercase tracking-wider text-sm transition-all duration-300 shadow-xl select-none group ${
          status === 'success'
            ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-400/50'
            : status === 'animating'
            ? 'bg-slate-900 text-white shadow-blue-500/20'
            : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-600/30 active:scale-[0.99]'
        } ${className}`}
      >
        {/* Background Animated Road Track in Background when animating */}
        {status === 'animating' && (
          <div className="absolute inset-0 opacity-25 bg-[linear-gradient(90deg,transparent_50%,rgba(255,255,255,0.7)_50%)] bg-[length:20px_100%] animate-road-move" />
        )}

        {/* Truck SVG Container */}
        <div className="absolute inset-0 flex items-center pointer-events-none">
          {status === 'animating' && (
            <div className="animate-truck-drive flex items-center space-x-1 pl-4">
              <div className="relative">
                {/* Truck Body */}
                <div className="p-2 bg-blue-500 text-white rounded-xl shadow-lg border border-blue-400 flex items-center justify-center">
                  <Truck className="w-6 h-6 animate-bounce" />
                </div>
                {/* Smoke Trail */}
                <div className="absolute -left-3 bottom-1 w-2 h-2 bg-white/50 rounded-full animate-ping" />
              </div>
              {/* Package Cargo */}
              <div className="w-3 h-3 bg-amber-400 rounded-sm shadow-md border border-amber-300" />
            </div>
          )}
        </div>

        {/* Text and Icon Content Layer */}
        <div className="relative z-10 flex items-center justify-center space-x-2">
          {status === 'idle' && (
            <>
              <Truck className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              <span>{defaultText}</span>
            </>
          )}

          {status === 'animating' && (
            <span className="animate-pulse tracking-widest text-blue-200">
              Dispatching Express Package...
            </span>
          )}

          {status === 'success' && (
            <div className="flex items-center space-x-2 animate-check-pop">
              <div className="p-1 bg-white text-emerald-600 rounded-full shadow-md">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span className="text-white font-extrabold tracking-wider">Order Placed ✓</span>
            </div>
          )}
        </div>

        {/* Shimmer Sweep Animation on Hover */}
        {status === 'idle' && (
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
        )}
      </button>
    </>
  );
}
