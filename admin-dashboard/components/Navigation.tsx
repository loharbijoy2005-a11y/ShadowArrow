'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ShoppingBag, BarChart3, HelpCircle, Lock, LogOut } from 'lucide-react';

interface NavigationProps {
  onLogout: () => void;
}

export default function Navigation({ onLogout }: NavigationProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Control Overview', href: '/', icon: LayoutDashboard },
    { name: 'Inventory Hub', href: '/products', icon: Package },
    { name: 'Fulfillment Desk', href: '/orders', icon: ShoppingBag },
    { name: 'Support Tickets', href: '/tickets', icon: HelpCircle },
    { name: 'System Analytics', href: '/analytics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-ops-800 border-r border-ops-700 flex flex-col justify-between h-screen sticky top-0">
      <div>
        <div className="p-6 border-b border-ops-700 flex items-center space-x-3">
          <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-mono font-bold text-sm tracking-wider uppercase text-white">Ops Control</h1>
            <p className="text-[10px] text-gray-400 font-mono">GATEWAY v2.4.1</p>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border-l-4 border-blue-500'
                    : 'text-gray-400 hover:bg-ops-700 hover:text-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-ops-700">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Lock Session</span>
        </button>
      </div>
    </aside>
  );
}
