'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { ShieldCheck, UserCheck, Clock, FileText, Shield, Plus, Edit2, CheckCircle2, UserPlus, AlertCircle, Ban, Check, RefreshCw } from 'lucide-react';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Manager' | 'Delivery Staff';
  status: 'ACTIVE' | 'SUSPENDED';
  lastActive: string;
}

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  target: string;
  role: string;
  timestamp: string;
}

const DEFAULT_STAFF: AdminUser[] = [
  { id: '1', name: 'Bijoy Lohar', email: 'support.shadowarrow@gmail.com', role: 'Super Admin', status: 'ACTIVE', lastActive: 'Just now' },
  { id: '2', name: 'Rohan Sharma', email: 'rohan.ops@shadowarrow.in', role: 'Manager', status: 'ACTIVE', lastActive: '2 hours ago' },
  { id: '3', name: 'Vikram Singh', email: 'logistics.fleet@shadowarrow.in', role: 'Delivery Staff', status: 'ACTIVE', lastActive: '5 hours ago' },
];

const DEFAULT_LOGS: AuditLog[] = [
  { id: '1', admin: 'Bijoy Lohar (Super Admin)', action: 'Updated Product Stock & Pricing', target: 'SKU: SA-OVER-001', role: 'Super Admin', timestamp: '2026-08-17 16:35:10' },
  { id: '2', admin: 'Rohan Sharma', action: 'Changed Order Status to SHIPPED', target: 'Order #SA-89472', role: 'Manager', timestamp: '2026-08-17 15:42:00' },
  { id: '3', admin: 'Vikram Singh', action: 'Batch Printed 12 Thermal Labels', target: 'Orders #SA-89460 - #SA-89472', role: 'Delivery Staff', timestamp: '2026-08-17 14:18:22' },
  { id: '4', admin: 'Bijoy Lohar (Super Admin)', action: 'Created Promo Coupon SHADOW10', target: 'Discount 10%', role: 'Super Admin', timestamp: '2026-08-17 12:05:44' },
];

export default function ActivityLogsAdminPage() {
  const [activeTab, setActiveTab] = useState<'rbac' | 'logs'>('rbac');
  const [staffList, setStaffList] = useState<AdminUser[]>(DEFAULT_STAFF);
  const [logs, setLogs] = useState<AuditLog[]>(DEFAULT_LOGS);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Admin Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Super Admin' | 'Manager' | 'Delivery Staff'>('Manager');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const savedStaff = localStorage.getItem('shadow_rbac_staff');
    const savedLogs = localStorage.getItem('shadow_audit_logs');
    if (savedStaff) setStaffList(JSON.parse(savedStaff));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const saveStateToStorage = (newStaff: AdminUser[], newLogs: AuditLog[]) => {
    setStaffList(newStaff);
    setLogs(newLogs);
    localStorage.setItem('shadow_rbac_staff', JSON.stringify(newStaff));
    localStorage.setItem('shadow_audit_logs', JSON.stringify(newLogs));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleRoleChange = (staffId: string, newRole: 'Super Admin' | 'Manager' | 'Delivery Staff') => {
    const updatedStaff = staffList.map(s => s.id === staffId ? { ...s, role: newRole } : s);
    const targetUser = staffList.find(s => s.id === staffId);
    
    const newLog: AuditLog = {
      id: Date.now().toString(),
      admin: 'Bijoy Lohar (Super Admin)',
      action: `Changed RBAC Role to ${newRole}`,
      target: `User: ${targetUser?.name || staffId} (${targetUser?.email})`,
      role: 'Super Admin',
      timestamp: new Date().toLocaleString('en-IN'),
    };

    saveStateToStorage(updatedStaff, [newLog, ...logs]);
  };

  const handleToggleStatus = (staffId: string) => {
    const targetUser = staffList.find(s => s.id === staffId);
    const nextStatus = targetUser?.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const updatedStaff = staffList.map(s => s.id === staffId ? { ...s, status: nextStatus } : s);

    const newLog: AuditLog = {
      id: Date.now().toString(),
      admin: 'Bijoy Lohar (Super Admin)',
      action: `Set Admin Status to ${nextStatus}`,
      target: `User: ${targetUser?.name} (${targetUser?.email})`,
      role: 'Super Admin',
      timestamp: new Date().toLocaleString('en-IN'),
    };

    saveStateToStorage(updatedStaff, [newLog, ...logs]);
  };

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newStaffMember: AdminUser = {
      id: Date.now().toString(),
      name: newName,
      email: newEmail,
      role: newRole,
      status: 'ACTIVE',
      lastActive: 'Never',
    };

    const updatedStaff = [...staffList, newStaffMember];
    const newLog: AuditLog = {
      id: Date.now().toString(),
      admin: 'Bijoy Lohar (Super Admin)',
      action: `Created New Admin Staff User`,
      target: `User: ${newName} (${newEmail}) [Role: ${newRole}]`,
      role: 'Super Admin',
      timestamp: new Date().toLocaleString('en-IN'),
    };

    saveStateToStorage(updatedStaff, [newLog, ...logs]);
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-ops-700 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs rounded border border-blue-500/20 font-bold uppercase">
                MODULE 1 • RBAC SECURITY & AUDIT TRAIL
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Role-Based Access Control & Audit Trail
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage admin staff permissions, role assignments, and real-time security audit log history
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {savedSuccess && (
              <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>RBAC Settings Saved!</span>
              </span>
            )}

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Admin User</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex space-x-3 border-b border-ops-700 pb-3">
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'rbac' ? 'bg-blue-600 text-white shadow-lg' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin Staff & RBAC Roles ({staffList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'bg-ops-800 text-gray-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Security Audit Log Registry ({logs.length})</span>
          </button>
        </div>

        {/* Add New Admin Form Modal / Card */}
        {showAddForm && (
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold uppercase text-white flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-blue-400" />
              <span>Provision New Admin Team Member</span>
            </h3>

            <form onSubmit={handleAddAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="ramesh.ops@shadowarrow.in"
                  required
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase text-[10px] font-bold mb-1">Assigned RBAC Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-ops-900 border border-ops-700 rounded-xl p-2.5 text-white font-bold focus:outline-none focus:border-blue-500"
                >
                  <option value="Super Admin">Super Admin (Full Access)</option>
                  <option value="Manager">Operations Manager (Catalog/Orders)</option>
                  <option value="Delivery Staff">Delivery Staff (Thermal Labels)</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-ops-700 text-gray-300 rounded-xl font-bold hover:bg-ops-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition shadow-lg"
                >
                  Create & Grant Role
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'rbac' && (
          <div className="space-y-8">
            {/* Roles Matrix Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs font-bold uppercase text-purple-400">Super Admin</span>
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-xs text-gray-300 font-bold">Complete Access across all 12 Modules, Encrypted Key Vault & RBAC Matrix</p>
              </div>

              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs font-bold uppercase text-blue-400">Operations Manager</span>
                  <UserCheck className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-xs text-gray-300 font-bold">Catalog Products, Order Workflows, Customer Directory & Refund Approvals</p>
              </div>

              <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-2">
                <div className="flex justify-between items-center text-gray-400">
                  <span className="text-xs font-bold uppercase text-emerald-400">Delivery Staff</span>
                  <FileText className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-xs text-gray-300 font-bold">4x6 Thermal Label Printing & Shipped Order Status Progression</p>
              </div>
            </div>

            {/* Editable Admin Staff Table */}
            <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 border-b border-ops-700 flex justify-between items-center">
                <h2 className="font-bold text-sm uppercase text-white tracking-wider">
                  Admin Team User Directory ({staffList.length} Accounts)
                </h2>
                <span className="text-xs text-gray-400">Editable Role-Based Access Control</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-ops-700/50 text-gray-400 border-b border-ops-700 font-bold uppercase">
                      <th className="p-4">Admin Staff Member</th>
                      <th className="p-4">Assigned Role (Dropdown Editor)</th>
                      <th className="p-4">Account Status</th>
                      <th className="p-4">Last Session Activity</th>
                      <th className="p-4 text-center">RBAC Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ops-700/50">
                    {staffList.map((staff) => (
                      <tr key={staff.id} className="hover:bg-ops-700/30 transition">
                        <td className="p-4 space-y-0.5">
                          <p className="font-bold text-white text-sm">{staff.name}</p>
                          <p className="text-gray-400 text-xs">{staff.email}</p>
                        </td>

                        {/* Editable Role Select */}
                        <td className="p-4">
                          <select
                            value={staff.role}
                            onChange={(e) => handleRoleChange(staff.id, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none cursor-pointer ${
                              staff.role === 'Super Admin'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : staff.role === 'Manager'
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            <option value="Super Admin">Super Admin</option>
                            <option value="Manager">Operations Manager</option>
                            <option value="Delivery Staff">Delivery Staff</option>
                          </select>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            staff.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {staff.status}
                          </span>
                        </td>

                        <td className="p-4 text-gray-400">{staff.lastActive}</td>

                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(staff.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 mx-auto ${
                              staff.status === 'ACTIVE'
                                ? 'bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white'
                                : 'bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white'
                            }`}
                            title={staff.status === 'ACTIVE' ? 'Suspend Admin Access' : 'Activate Admin Access'}
                          >
                            {staff.status === 'ACTIVE' ? (
                              <>
                                <Ban className="w-3.5 h-3.5" />
                                <span>Suspend</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Registry Tab */}
        {activeTab === 'logs' && (
          <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-ops-700 flex justify-between items-center">
              <h2 className="font-bold text-sm uppercase text-white tracking-wider">
                Immutable Security Audit Log Registry ({logs.length} Events)
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
        )}

      </main>
    </div>
  );
}
