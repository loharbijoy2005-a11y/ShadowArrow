'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, HelpCircle, Users, Lock, LogOut, ShoppingCart, Palette, Tag, Truck, FileText, Settings, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useAdminTheme } from '@/context/ThemeContext';

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
    setMode(theme.mode === 'LIGHT' ? 'DARK' : 'LIGHT');
  };

  return (
    <aside className="w-64 bg-ops-800 border-r border-ops-700 flex flex-col justify-between h-screen sticky top-0 font-mono text-xs">
      <div className="overflow-y-auto">
        <div className="p-5 border-b border-ops-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-wider uppercase text-white">Ops Control</h1>
              <p className="text-[9px] text-gray-400">SHADOW ARROW v2.4</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={toggleQuickMode}
              className="p-1.5 rounded-lg bg-ops-700 hover:bg-ops-600 text-gray-300 transition"
              title={theme.mode === 'LIGHT' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme.mode === 'LIGHT' ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={() => setIsCustomizerOpen(true)}
              className="p-1.5 rounded-lg bg-ops-700 hover:bg-ops-600 text-gray-300 transition"
              title="Open Theme & Color Customizer Sliders"
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-400 hover:bg-ops-700 hover:text-gray-200'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-ops-700 space-y-1.5 shrink-0 bg-ops-800">
        <button
          onClick={() => setIsCustomizerOpen(true)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-gray-300 bg-ops-700 hover:bg-ops-600 transition"
        >
          <div className="flex items-center space-x-2">
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span>Theme Sliders</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 bg-black/40 rounded text-blue-400 font-bold">
            {theme.mode}
          </span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock Admin Session</span>
        </button>
      </div>
    </aside>
  );
}
