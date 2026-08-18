'use client';

import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAdminTheme } from '@/context/ThemeContext';

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();
  const { setIsCustomizerOpen, theme, setMode } = useAdminTheme();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { name: 'Control Overview', href: '/', icon: LayoutDashboard },
    { name: 'Fulfillment Desk', href: '/orders', icon: ShoppingBag },
    { name: 'Product Catalog', href: '/products', icon: Package },
    { name: 'Customer Directory', href: '/customers', icon: Users },
    { name: 'Abandoned Carts', href: '/abandoned-carts', icon: ShoppingCart },
    { name: 'Support & Returns', href: '/tickets', icon: HelpCircle },
    { name: 'Live Device Inspector', href: '/device-preview', icon: Monitor },
    { name: 'Coupons & Promos', href: '/coupons', icon: Tag },
    { name: 'Logistics & Shipping', href: '/shipping', icon: Truck },
    { name: 'Store CMS', href: '/cms', icon: FileText },
    { name: 'RBAC Audit Logs', href: '/activity-logs', icon: ShieldCheck },
    { name: 'System Settings', href: '/settings', icon: Settings },
    { name: 'Sales Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const toggleQuickMode = () => {
    setMode(theme.mode === 'LIGHT' ? 'DARK' : 'LIGHT');
  };

  return (
    <aside
      className={`bg-ops-800 border-r border-ops-700 flex flex-col justify-between h-screen sticky top-0 font-sans text-xs transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="overflow-y-auto">
        {/* Header Bar */}
        <div className="p-4 border-b border-ops-700 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-xl shrink-0 border border-blue-500/30">
              <Lock className="w-4 h-4" />
            </div>
            {!collapsed && (
              <div className="truncate animate-in fade-in duration-200">
                <h1 className="font-bold text-sm tracking-wider uppercase text-white">Ops Control</h1>
                <p className="text-[9px] text-gray-400 font-mono">SHADOW ARROW v2.4</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-ops-700 hover:bg-ops-600 text-gray-300 transition shrink-0"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items List */}
        <nav className="p-2.5 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={`group relative flex items-center ${
                  collapsed ? 'justify-center px-0 py-3' : 'space-x-3 px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]'
                    : 'text-gray-400 hover:bg-ops-700 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  isActive ? 'text-white scale-110' : 'text-gray-400 group-hover:scale-110 group-hover:text-blue-400'
                }`} />

                {!collapsed && (
                  <span className="truncate animate-in fade-in duration-150">{item.name}</span>
                )}

                {/* Hover Tooltip for Collapsed Sidebar */}
                {collapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1 bg-slate-900 text-white text-[11px] font-mono rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 border border-slate-700">
                    {item.name}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls */}
      <div className="p-3 border-t border-ops-700 space-y-1.5 shrink-0 bg-ops-800">
        {!collapsed ? (
          <>
            <div className="flex items-center space-x-1.5">
              <button
                onClick={toggleQuickMode}
                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-300 bg-ops-700 hover:bg-ops-600 transition"
              >
                {theme.mode === 'LIGHT' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>{theme.mode === 'LIGHT' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>

              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="p-2 rounded-xl bg-ops-700 hover:bg-ops-600 text-purple-400 transition"
                title="Theme Customizer"
              >
                <Palette className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Admin Session</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-2 py-1">
            <button
              onClick={toggleQuickMode}
              className="p-2 rounded-xl bg-ops-700 hover:bg-ops-600 text-gray-300 transition"
              title="Toggle Theme"
            >
              {theme.mode === 'LIGHT' ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl bg-ops-700 hover:bg-red-500/20 text-red-400 transition"
              title="Lock Admin Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
