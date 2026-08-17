'use client';

import React from 'react';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

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
  defaultText = 'PLACE ORDER',
}: TruckOrderButtonProps) {

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

    // Validate fields if validator provided
    if (onValidate && !onValidate()) {
      return;
    }

    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`relative w-full overflow-hidden rounded-2xl py-4 font-black uppercase tracking-wider text-sm transition-all duration-200 shadow-xl select-none group flex items-center justify-center space-x-2 text-white ${
        loading
          ? 'bg-slate-800 text-slate-300 cursor-not-allowed shadow-none'
          : 'bg-slate-900 hover:bg-slate-800 active:scale-[0.99] shadow-slate-900/30'
      } ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
          <span className="tracking-widest">Processing Order...</span>
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 text-blue-400" />
          <span>{defaultText}</span>
        </>
      )}

      {/* Shimmer Sweep Effect */}
      {!loading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
      )}
    </button>
  );
}

