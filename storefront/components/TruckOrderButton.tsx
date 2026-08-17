'use client';

import React from 'react';
import { Lock, Loader2, Truck, CreditCard, Banknote } from 'lucide-react';

interface TruckOrderButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onValidate?: () => boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  className?: string;
  defaultText?: string;
  isCOD?: boolean;
}

export default function TruckOrderButton({
  onClick,
  onValidate,
  disabled = false,
  loading = false,
  type = 'submit',
  className = '',
  defaultText = 'PLACE ORDER',
  isCOD = false,
}: TruckOrderButtonProps) {

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;

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
          : isCOD
          ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-emerald-600/30 ring-1 ring-emerald-500/50'
          : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-blue-600/30 ring-1 ring-blue-500/50'
      } ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin text-white" />
          <span className="tracking-widest">
            {isCOD ? 'Placing COD Order...' : 'Opening Payment Window...'}
          </span>
        </>
      ) : (
        <>
          <Truck className="w-5 h-5 text-white shrink-0" />
          <span>{defaultText}</span>
        </>
      )}

      {/* Shimmer Sweep Effect */}
      {!loading && (
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out pointer-events-none" />
      )}
    </button>
  );
}


