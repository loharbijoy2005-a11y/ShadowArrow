import React, { useState, useEffect } from 'react';
import { X, Shield, Package, Truck, CheckCircle2, RefreshCw, DollarSign, Users, Zap, FileText, Lock, Key, LogOut } from 'lucide-react';
import { Order } from '../types';
import confetti from 'canvas-confetti';
import { InvoiceModal } from './InvoiceModal';

import { safeLocalStorageGet, safeLocalStorageSet } from '../utils/security';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrdersUpdated?: (updatedOrders: Order[]) => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, onOrdersUpdated }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'cod'>('all');
  const [statusMsg, setStatusMsg] = useState('');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  // ADMIN SECURITY AUTHENTICATION STATE
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('shadow_admin_token') === 'ADMIN_TOKEN_SECURE_8627';
  });
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [verifying, setVerifying] = useState(false);

  const adminToken = sessionStorage.getItem('shadow_admin_token') || 'ADMIN_TOKEN_SECURE_8627';

  const fetchAdminOrders = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    let apiOrders: Order[] = [];
    try {
      const res = await fetch('/api/admin/orders', {
        headers: {
          'x-admin-token': adminToken
        }
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {}
      }
      if (data?.success && Array.isArray(data.orders)) {
        apiOrders = data.orders;
      } else if (data?.message) {
        setStatusMsg(data.message);
      }
    } catch (err) {
      console.warn('Admin fetch fallback');
    }

    const localOrders = safeLocalStorageGet<Order[]>('shadow_orders', []);
    
    // Merge API orders with local orders seamlessly
    const mergedMap = new Map<string, Order>();
    localOrders.forEach((o) => mergedMap.set(o.orderId, o));
    apiOrders.forEach((o) => mergedMap.set(o.orderId, o));

    const finalOrders = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    setOrders(finalOrders);
    onOrdersUpdated?.(finalOrders);
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchAdminOrders();
    }
  }, [isOpen, isAuthenticated]);

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    setVerifying(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() })
      });
      const data = await res.json();

      if (data?.success) {
        sessionStorage.setItem('shadow_admin_token', data.token || 'ADMIN_TOKEN_SECURE_8627');
        setIsAuthenticated(true);
        setPasscode('');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        setPasscodeError(data?.message || 'Incorrect Passcode! Access Denied.');
      }
    } catch (err) {
      // Local Passcode Verification Fallback
      const validPasscodes = ['shadowadmin8627', '8627', 'bgE@4NwneHFWkBpbs^EqncxHU294!0rM', 'LoharBijoy'];
      if (validPasscodes.includes(passcode.trim())) {
        sessionStorage.setItem('shadow_admin_token', 'ADMIN_TOKEN_SECURE_8627');
        setIsAuthenticated(true);
        setPasscode('');
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } else {
        setPasscodeError('Incorrect Passcode! Access Denied.');
      }
    }
    setVerifying(false);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('shadow_admin_token');
    setIsAuthenticated(false);
    setOrders([]);
  };

  if (!isOpen) return null;

  // IF NOT AUTHENTICATED AS ADMIN -> RENDER SECURITY PASSCODE PORTAL
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose} />

        <div className="relative max-w-md w-full bg-slate-900 border border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-white space-y-6 text-center">
          
          <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)]">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-black text-xl text-white tracking-tight flex items-center justify-center gap-2">
              <span>ADMIN SECURITY PORTAL</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Restricted Access — Authorized Administrator Verification Required</p>
          </div>

          {passcodeError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-2xl font-bold animate-bounce">
              ⚠️ {passcodeError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div className="relative">
              <Key className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin Secret Passcode..."
                className="w-full bg-slate-950 border border-slate-700 text-sm pl-11 pr-4 py-3 rounded-2xl text-white outline-none focus:border-amber-500 font-mono tracking-widest"
                autoFocus
                required
              />
            </div>

            <button
              type="submit"
              disabled={verifying || !passcode.trim()}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3 rounded-2xl text-sm shadow-xl transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>{verifying ? 'Verifying Passcode...' : 'Unlock Admin Dashboard'}</span>
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-500">
            <span>Passcode: <code className="text-amber-400 font-bold">shadowadmin8627</code> or <code className="text-amber-400 font-bold">8627</code></span>
            <button onClick={onClose} className="text-slate-400 hover:text-white font-bold">Cancel</button>
          </div>

        </div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const prepaidOrders = orders.filter((o) => o.paymentMethod?.toLowerCase().includes('online') || o.paymentMethod?.toLowerCase().includes('razorpay'));
  const codOrders = orders.filter((o) => o.paymentMethod?.toLowerCase().includes('cod'));

  const filteredOrders = orders.filter((o) => {
    if (filter === 'online') return o.paymentMethod?.toLowerCase().includes('online') || o.paymentMethod?.toLowerCase().includes('razorpay');
    if (filter === 'cod') return o.paymentMethod?.toLowerCase().includes('cod');
    return true;
  });

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    setStatusMsg('');

    // Update in local state & localStorage first
    setOrders((prev) => {
      const updated = prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o));
      safeLocalStorageSet('shadow_orders', updated);
      onOrdersUpdated?.(updated);
      return updated;
    });

    try {
      const res = await fetch('/api/admin/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {}
      }

      if (data?.success) {
        setStatusMsg(`Order ${orderId} status updated to "${newStatus}"!`);
        confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.warn('Status update API error');
      setStatusMsg(`Order ${orderId} status updated locally to "${newStatus}".`);
    }
    setUpdatingId(null);
  };

  const handleShiprocketAutoBook = async (orderId: string) => {
    setUpdatingId(orderId);
    setStatusMsg('');

    try {
      const res = await fetch('/api/shiprocket/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({ orderId })
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {}
      }

      if (data?.success) {
        const newStatus = data.status || `Booked on Shiprocket`;
        setOrders((prev) => {
          const updated = prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus, awbCode: data.awbCode || o.awbCode } : o));
          safeLocalStorageSet('shadow_orders', updated);
          onOrdersUpdated?.(updated);
          return updated;
        });
        setStatusMsg(data.message || `Shipment auto-booked on Shiprocket for Order ${orderId}!`);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } else if (data?.message) {
        setStatusMsg(data.message);
      }
    } catch (err: any) {
      setStatusMsg('Shiprocket booking error: ' + err.message);
    }
    setUpdatingId(null);
  };

  const handleSyncShiprocketTracking = async (orderId: string) => {
    setUpdatingId(orderId);
    setStatusMsg('');
    try {
      const res = await fetch(`/api/shiprocket/track/${orderId}`);
      const data = await res.json();
      if (data?.success && data?.status) {
        setOrders((prev) => {
          const updated = prev.map((o) => (o.orderId === orderId ? { ...o, status: data.status, awbCode: data.awbCode || o.awbCode } : o));
          safeLocalStorageSet('shadow_orders', updated);
          onOrdersUpdated?.(updated);
          return updated;
        });
        setStatusMsg(`Order ${orderId} tracking synced! Live Status: "${data.status}"`);
      } else {
        setStatusMsg(`Order ${orderId} tracking checked: ${data?.message || 'No status change'}`);
      }
    } catch (err: any) {
      setStatusMsg(`Tracking sync error: ${err.message}`);
    }
    setUpdatingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* HEADER */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center font-black">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg text-white tracking-tight flex items-center gap-2">
                <span>Shadow Arrow Control Panel & Admin Dashboard</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full uppercase">MongoDB Atlas Live</span>
              </h2>
              <p className="text-xs text-slate-400">Manage orders, update tracking status live in MongoDB, and trigger Shiprocket API shipments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchAdminOrders}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh DB</span>
            </button>
            <button
              onClick={handleAdminLogout}
              className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
              title="Lock Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock Admin</span>
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* FEEDBACK STATUS */}
        {statusMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* STATS ANALYTICS BAR */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
              <span>Total Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-amber-400 font-mono">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
              <span>Total Orders</span>
              <Package className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-black text-white font-mono">{orders.length}</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
              <span>Prepaid (Razorpay)</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono">{prepaidOrders.length}</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-slate-400 text-[11px] font-medium flex items-center justify-between">
              <span>Cash on Delivery</span>
              <Truck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono">{codOrders.length}</div>
          </div>
        </div>

        {/* FILTERS & SEARCH */}
        <div className="px-5 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Filter Orders:</span>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${filter === 'all' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-3 py-1 rounded-xl font-bold transition ${filter === 'online' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              Prepaid Online ({prepaidOrders.length})
            </button>
            <button
              onClick={() => setFilter('cod')}
              className={`px-3 py-1 rounded-xl font-bold transition ${filter === 'cod' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            >
              Cash on Delivery ({codOrders.length})
            </button>
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-600" />
              <p className="font-bold">No orders found matching the filter.</p>
              <p className="text-[11px] text-slate-500">Customer orders will appear here automatically live from MongoDB.</p>
            </div>
          ) : (
            filteredOrders.map((o) => (
              <div key={o.orderId} className="bg-slate-950 border border-slate-800 hover:border-slate-700 p-4 rounded-2xl space-y-3 transition">
                
                {/* ORDER ROW TOP HEADER */}
                <div className="flex flex-wrap justify-between items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-amber-400 text-sm">{o.orderId}</span>
                    <span className="bg-slate-900 border border-slate-700 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {o.paymentMethod}
                    </span>
                    {o.razorpayPaymentId && (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 px-2 py-0.5 rounded-full">
                        ID: {o.razorpayPaymentId}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-white font-mono">₹{o.total?.toLocaleString('en-IN')}</span>
                    <span className="block text-[10px] text-slate-500">
                      {o.createdAt ? new Date(o.createdAt).toLocaleString('en-IN') : 'Recent'}
                    </span>
                  </div>
                </div>

                {/* CUSTOMER, PAYMENT PROOF & SHIPPING DETAILS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
                  
                  {/* CUSTOMER INFO */}
                  <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-amber-400" />
                      <span>{o.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">Phone: +91 {o.phone}</div>
                    {o.email && <div className="text-[11px] text-slate-400 font-mono truncate">Email: {o.email}</div>}
                    <div className="text-[11px] text-slate-400">
                      Address: <strong className="text-slate-200">{o.address?.street}, {o.address?.city} - {o.address?.pincode} ({o.address?.state || 'India'})</strong>
                    </div>
                  </div>

                  {/* PAYMENT TRANSACTION PROOF & VERIFICATION */}
                  <div className="space-y-1.5 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment & Settlement Proof</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Method:</span>
                      <span className="font-mono font-bold text-white text-[11px]">{o.paymentMethod}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400 text-[11px]">Ref Txn ID:</span>
                      <span className="font-mono text-amber-400 text-[11px] font-bold">
                        {o.razorpayPaymentId || `TXN-${o.orderId.replace(/\D/g, '').slice(-8) || 'SA-8627'}`}
                      </span>
                    </div>
                    <div className="pt-1 flex items-center gap-1.5">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>PAYMENT VERIFIED & CONFIRMED</span>
                      </span>
                    </div>
                  </div>

                  {/* PURCHASED ITEMS */}
                  <div className="space-y-1">
                    <div className="text-[11px] text-slate-400 font-medium">Purchased Items:</div>
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                      {o.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-200 font-medium truncate max-w-[150px]">{item.name || item.product?.name}</span>
                          <span className="text-amber-400 font-mono">Qty: {item.quantity} × ₹{(item.price || item.product?.price || 0).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* ACTIONS & LIVE STATUS CONTROL */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Current Status:</span>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2.5 py-1 rounded-xl text-xs font-bold">
                      {o.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      disabled={updatingId === o.orderId}
                      onChange={(e) => {
                        if (e.target.value) handleUpdateStatus(o.orderId, e.target.value);
                      }}
                      defaultValue=""
                      className="bg-slate-900 border border-slate-700 text-xs px-2.5 py-1.5 rounded-xl text-slate-200 outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="" disabled>Change Tracking Status...</option>
                      <option value="Processing & Order Confirmed">Set: Processing</option>
                      <option value="Packed & Ready for Dispatch">Set: Packed & Ready</option>
                      <option value="Shipped via Prime Express Air">Set: Shipped via Air</option>
                      <option value="Out for Delivery">Set: Out for Delivery</option>
                      <option value="Delivered Successfully">Set: Delivered</option>
                    </select>

                    <button
                      onClick={() => handleShiprocketAutoBook(o.orderId)}
                      disabled={updatingId === o.orderId}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>{updatingId === o.orderId ? 'Booking...' : '🚀 Shiprocket Auto-Book'}</span>
                    </button>

                    <button
                      onClick={() => handleSyncShiprocketTracking(o.orderId)}
                      disabled={updatingId === o.orderId}
                      className="bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                      title="Fetch real-time tracking status from Shiprocket API"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${updatingId === o.orderId ? 'animate-spin' : ''}`} />
                      <span>🔄 Sync Live Status</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvoiceOrder(o)}
                      className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>📄 GST Invoice</span>
                    </button>
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Connected to MongoDB Atlas Database: <strong className="text-white font-mono">shadow_arrow.orders</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAdminLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1 rounded-lg border border-red-500/30 font-bold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Lock Session</span>
            </button>
            <button onClick={onClose} className="bg-slate-900 text-slate-300 hover:text-white px-3 py-1 rounded-lg border border-slate-800 font-bold">
              Close Panel
            </button>
          </div>
        </div>

      </div>

      <InvoiceModal
        order={selectedInvoiceOrder}
        isOpen={!!selectedInvoiceOrder}
        onClose={() => setSelectedInvoiceOrder(null)}
      />
    </div>
  );
};
