'use client';

import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { ShieldCheck, UserCheck, Clock, FileText, Lock, Shield, Eye } from 'lucide-react';

export default function ActivityLogsAdminPage() {
  const [logs] = useState([
    { id: '1', admin: 'Bijoy Lohar (Super Admin)', action: 'Updated Product Stock & Pricing', target: 'SKU: SA-OVER-001', role: 'Super Admin', timestamp: '2026-08-17 16:35:10' },
    { id: '2', admin: 'Operations Manager', action: 'Changed Order Status to SHIPPED', target: 'Order #SA-89472', role: 'Manager', timestamp: '2026-08-17 15:42:00' },
    { id: '3', admin: 'Fulfillment Staff', action: 'Batch Printed 12 Thermal Labels', target: 'Orders #SA-89460 - #SA-89472', role: 'Delivery Staff', timestamp: '2026-08-17 14:18:22' },
    { id: '4', admin: 'Bijoy Lohar (Super Admin)', action: 'Created Promo Coupon SHADOW10', target: 'Discount 10%', role: 'Super Admin', timestamp: '2026-08-17 12:05:44' },
    { id: '5', admin: 'Support Desk', action: 'Approved Exchange Return Ticket', target: 'Ticket #RET-1092', role: 'Manager', timestamp: '2026-08-17 10:11:05' },
  ]);

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-mono">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 font-bold uppercase">
                MODULE 1 • RBAC SECURITY & AUDIT TRAIL
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white mt-1">
              Admin Activity & Audit Logs
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Role-Based Access Control (RBAC) matrix and full audit log tracking admin changes
            </p>
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 bg-ops-800 border border-ops-700 rounded-xl text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-gray-300 font-bold">RBAC Enforced</span>
          </div>
        </div>

        {/* Roles Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase">Super Admin</span>
              <Shield className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-gray-300 font-bold">Full Control (All Modules + Vault + RBAC)</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase">Operations Manager</span>
              <UserCheck className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-300 font-bold">Products, Orders, Customers & Refunds</p>
          </div>

          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
            <div className="flex justify-between items-center text-gray-400">
              <span className="text-xs font-bold uppercase">Delivery Staff</span>
              <FileText className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xs text-gray-300 font-bold">Thermal Print & Order Status Updates</p>
          </div>
        </div>

        {/* Audit Trail Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-ops-700 flex justify-between items-center">
            <h2 className="font-bold text-sm uppercase text-white tracking-wider">
              Immutable Admin Activity Log Registry ({logs.length})
            </h2>
            <span className="text-xs text-gray-400">Timestamped Security Auditing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-ops-700/50 text-gray-400 border-b border-ops-700 font-bold uppercase">
                  <th className="p-4">Admin Operator</th>
                  <th className="p-4">Role Badge</th>
                  <th className="p-4">Action Performed</th>
                  <th className="p-4">Target Entity</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ops-700/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ops-700/30 transition">
                    <td className="p-4 font-bold text-white">{log.admin}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        log.role === 'Super Admin'
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                          : log.role === 'Manager'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      }`}>
                        {log.role}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-200">{log.action}</td>
                    <td className="p-4 text-blue-400">{log.target}</td>
                    <td className="p-4 text-gray-400">{log.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}
