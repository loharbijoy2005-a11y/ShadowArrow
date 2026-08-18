'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  BarChart3,
  HelpCircle,
  Users,
  Lock,
  LogOut,
  ShoppingCart,
  Palette,
  Tag,
  Truck,
  FileText,
  Settings,
  ShieldCheck,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useAdminTheme } from '@/context/ThemeContext';
import { logAdminAction } from '@/lib/auditLogger';

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();
  const { setIsCustomizerOpen, theme, setMode } = useAdminTheme();

  const navItems = [
    { name: 'Control Overview', href: '/', icon: LayoutDashboard },
    { name: 'Fulfillment Desk', href: '/orders', icon: ShoppingBag },
    { name: 'Product Catalog', href: '/products', icon: Package },
    { name: 'Customer Directory', href: '/customers', icon: Users },
    { name: 'Abandoned Carts', href: '/abandoned-carts', icon: ShoppingCart },
    { name: 'Support & Returns', href: '/tickets', icon: HelpCircle },
    { name: 'Coupons & Promos', href: '/coupons', icon: Tag },
    { name: 'Logistics & Shipping', href: '/shipping', icon: Truck },
    { name: 'Store CMS', href: '/cms', icon: FileText },
    { name: 'RBAC Audit Logs', href: '/activity-logs', icon: ShieldCheck },
    { name: 'System Settings', href: '/settings', icon: Settings },
    { name: 'Sales Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const toggleQuickMode = () => {
    const nextMode = theme.mode === 'LIGHT' ? 'DARK' : 'LIGHT';
    setMode(nextMode);
    logAdminAction('Toggled Admin Theme Mode', `Mode set to ${nextMode}`);
  };

  return (
    <aside className="w-16 bg-ops-800 border-r border-ops-700 flex flex-col justify-between h-screen sticky top-0 font-sans text-xs shrink-0 z-40 shadow-2xl">
      
      {/* Top Header Icon */}
      <div className="overflow-y-auto overflow-x-hidden flex-1 py-4 space-y-4">
        
        <div className="flex justify-center pb-3 border-b border-ops-700/80">
          <Link
            href="/"
            className="p-2.5 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/40 hover:scale-110 transition-transform shadow-md group relative"
            title="Admin Panel"
          >
            <Lock className="w-5 h-5 text-blue-400" />
            <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
              Admin Panel v2.4
            </div>
          </Link>
        </div>

        {/* Clean Icon Navigation Buttons Only */}
        <nav className="flex flex-col items-center space-y-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => logAdminAction(`Navigated to ${item.name}`, `Path: ${item.href}`)}
                className={`group relative p-3 rounded-2xl transition-all duration-200 active:scale-90 flex items-center justify-center ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105'
                    : 'text-gray-400 hover:bg-ops-700 hover:text-white hover:scale-105'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-white' : 'group-hover:scale-110 group-hover:text-blue-400'
                }`} />

                {/* Hover Tooltip Card */}
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900/95 text-white text-xs font-mono font-bold rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 border border-slate-700/80 backdrop-blur-md">
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls Bar (Device Inspector, Palette, Theme Toggle, Lock) */}
      <div className="p-2 border-t border-ops-700 flex flex-col items-center space-y-2.5 shrink-0 bg-ops-800">
        
        {/* Device Preview Inspector Button */}
        <Link
          href="/device-preview"
          onClick={() => logAdminAction('Opened Live Device Inspector', 'Path: /device-preview')}
          className={`group relative p-2.5 rounded-xl transition-all duration-200 active:scale-95 border ${
            pathname === '/device-preview'
              ? 'bg-blue-600 text-white border-blue-500 shadow-md'
              : 'bg-ops-700 text-emerald-400 hover:bg-ops-600 border-ops-600'
          }`}
        >
          <Monitor className="w-4 h-4" />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
            Live Storefront Device Inspector
          </div>
        </Link>

        {/* Theme Palette Sliders Button */}
        <button
          onClick={() => {
            setIsCustomizerOpen(true);
            logAdminAction('Opened Theme Color Sliders', 'Customizer Modal');
          }}
          className="group relative p-2.5 rounded-xl bg-ops-700 hover:bg-ops-600 text-purple-400 border border-ops-600 transition active:scale-95"
        >
          <Palette className="w-4 h-4" />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
            Color Palette Sliders ({theme.mode})
          </div>
        </button>

        {/* Light/Dark Mode Switch */}
        <button
          onClick={toggleQuickMode}
          className="group relative p-2.5 rounded-xl bg-ops-700 hover:bg-ops-600 text-gray-300 border border-ops-600 transition active:scale-95"
        >
          {theme.mode === 'LIGHT' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
            Toggle {theme.mode === 'LIGHT' ? 'Dark' : 'Light'} Mode
          </div>
        </button>

        {/* Lock Admin Session */}
        <button
          onClick={() => {
            logAdminAction('Locked Admin Session', 'Gateway Logout');
            onLogout();
          }}
          className="group relative p-2.5 rounded-xl bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/20 transition active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
            Lock Admin Session
          </div>
        </button>

      </div>
    </aside>
  );
}
