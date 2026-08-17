'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import InvoiceModal from '@/components/InvoiceModal';
import axios from 'axios';
import { ShoppingBag, FileText, Truck, RefreshCw, CheckCircle2, Clock, XCircle, DollarSign, Copy, Check, Calendar, Search, Download, Filter, CalendarDays, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const INDIAN_COURIERS = [
  'Blue Dart Express',
  'Delhivery',
  'Amazon Shipping',
  'DTDC',
  'Xpressbees',
  'Shadowfax',
  'Ecom Express',
  'India Post Speed Post',
  'Ekart Logistics',
];

export default function OrdersAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);

  // Date Range & Search Filtering States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [datePreset, setDatePreset] = useState('ALL');
  
  // Status Edit Modal State
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('CONFIRMED');
  const [paymentStatus, setPaymentStatus] = useState('PAID');
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [courierName, setCourierName] = useState('Blue Dart Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [txnId, setTxnId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchOrders(savedToken, statusFilter, startDate, endDate);
    } else {
      window.location.href = '/';
    }
  }, [statusFilter, startDate, endDate]);

  const fetchOrders = async (authToken: string, status: string, start?: string, end?: string) => {
    setLoading(true);
    try {
      let url = `${API_URL}/api/v1/admin/orders?status=${encodeURIComponent(status)}`;
      if (start) url += `&start_date=${encodeURIComponent(start)}`;
      if (end) url += `&end_date=${encodeURIComponent(end)}`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const rawOrders = Array.isArray(res.data) ? res.data : [];
      const sortedOrders = [...rawOrders].sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA; // Strict newest orders first at top of list
      });
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Failed to fetch admin orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'TODAY') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'YESTERDAY') {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'LAST7') {
      const d7 = new Date(now);
      d7.setDate(d7.getDate() - 7);
      setStartDate(d7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Client-side Filtered Orders Computation
  const filteredOrders = orders.filter((ord) => {
    if (statusFilter !== 'ALL' && ord.order_status !== statusFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchID = (ord.order_id || '').toLowerCase().includes(q);
      const matchName = (ord.customer_name || '').toLowerCase().includes(q);
      const matchPhone = (ord.customer_phone || '').toLowerCase().includes(q);
      const matchAddress = (ord.shipping_address || '').toLowerCase().includes(q);
      const matchTxn = (ord.razorpay_payment_id || '').toLowerCase().includes(q);
      const matchItem = ord.items && ord.items.some((it: any) => (it.title || '').toLowerCase().includes(q));

      if (!matchID && !matchName && !matchPhone && !matchAddress && !matchTxn && !matchItem) {
        return false;
      }
    }

    if (startDate || endDate) {
      const ordDate = ord.created_at ? new Date(ord.created_at) : null;
      if (!ordDate || isNaN(ordDate.getTime())) return false;

      if (startDate) {
        const sDate = new Date(startDate);
        sDate.setHours(0, 0, 0, 0);
        if (ordDate < sDate) return false;
      }

      if (endDate) {
        const eDate = new Date(endDate);
        eDate.setHours(23, 59, 59, 999);
        if (ordDate > eDate) return false;
      }
    }

    return true;
  });

  const filteredTotalValue = filteredOrders.reduce((acc, o) => acc + (o.total_amount || 0), 0);

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = ['Order ID', 'Date & Time', 'Customer Name', 'Phone', 'Email', 'Shipping Address', 'Payment Method', 'Txn ID', 'Order Status', 'Courier', 'AWB', 'Total Amount (INR)'];
    const rows = filteredOrders.map(o => [
      `"${o.order_id || ''}"`,
      `"${new Date(o.created_at || Date.now()).toLocaleString('en-IN')}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_phone || ''}"`,
      `"${o.customer_email || ''}"`,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      `"${o.payment_method || ''}"`,
      `"${o.razorpay_payment_id || ''}"`,
      `"${o.order_status || ''}"`,
      `"${o.courier_partner || o.courier_name || ''}"`,
      `"${o.awb_number || o.tracking_number || ''}"`,
      `"${o.total_amount || 0}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shadow_arrow_orders_export_${startDate || 'all'}_to_${endDate || 'today'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;
    const id = editingOrder.order_id || editingOrder.id || editingOrder._id;
    setSubmitting(true);
    try {
      await axios.put(
        `${API_URL}/api/v1/admin/orders/${id}/status`,
        {
          order_status: newStatus,
          status: newStatus,
          payment_status: paymentStatus,
          customer_name: custName.trim(),
          customer_phone: custPhone.trim(),
          shipping_address: shippingAddress.trim(),
          razorpay_payment_id: txnId.trim(),
          courier_partner: courierName,
          courier_name: courierName,
          awb_number: trackingNumber.trim(),
          tracking_number: trackingNumber.trim(),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingOrder(null);
      if (token) fetchOrders(token, statusFilter, startDate, endDate);
    } catch (err) {
      alert('Failed to update order details in MongoDB');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-6 overflow-y-auto">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white">ORDER FULFILLMENT DESK</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Calendar date range lookup, dispatch manifests, Txn IDs & real-time MongoDB pipeline</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportCSV}
              disabled={filteredOrders.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-mono font-bold rounded-lg transition shadow"
              title="Export filtered orders manifest to CSV"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV Manifest</span>
            </button>
            <button
              onClick={() => token && fetchOrders(token, statusFilter, startDate, endDate)}
              className="p-2 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white transition"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Date & Time Calendar Control Bar */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 shadow-xl space-y-4 font-mono text-xs">
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            
            {/* Search Input Bar */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Order ID, Phone, Customer Name, Txn ID, or Item..."
                className="w-full bg-ops-900 border border-ops-700 rounded-xl pl-9 pr-8 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-gray-400 font-bold uppercase mr-1">Date Presets:</span>
              {[
                { label: 'All Time', value: 'ALL' },
                { label: 'Today', value: 'TODAY' },
                { label: 'Yesterday', value: 'YESTERDAY' },
                { label: 'Last 7 Days', value: 'LAST7' },
                { label: 'This Month', value: 'THIS_MONTH' },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => handleDatePreset(p.value)}
                  className={`px-3 py-1.5 rounded-lg border transition font-bold text-[11px] ${
                    datePreset === p.value
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-ops-900 text-gray-300 border-ops-700 hover:bg-ops-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Picker Inputs & Status Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-ops-700/60 items-center">
            
            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>From Date (Calendar)</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setDatePreset('CUSTOM'); }}
                className="w-full bg-ops-900 border border-ops-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1 flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-purple-400" />
                <span>To Date (Calendar)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setDatePreset('CUSTOM'); }}
                className="w-full bg-ops-900 border border-ops-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Lifecycle Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-ops-900 border border-ops-700 rounded-lg p-2 text-xs text-gray-200 focus:outline-none focus:border-blue-500 font-bold"
              >
                <option value="ALL">All Lifecycle Statuses</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PROCESSING">PROCESSING</option>
                <option value="SHIPPED">SHIPPED</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REFUNDED">REFUNDED</option>
              </select>
            </div>

            <div className="flex items-end space-x-2 pt-4 sm:pt-0">
              {(startDate || endDate || searchQuery || statusFilter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => { setStartDate(''); setEndDate(''); setSearchQuery(''); setStatusFilter('ALL'); setDatePreset('ALL'); }}
                  className="w-full p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear All Filters</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Filter Summary Banner */}
        <div className="p-4 bg-ops-800/80 border border-ops-700 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 font-mono text-xs">
          <div className="flex items-center space-x-2 text-gray-300">
            <CalendarDays className="w-4 h-4 text-blue-400" />
            <span>
              Date Range:{' '}
              <strong className="text-white font-bold">
                {startDate ? new Date(startDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Beginning'}
                {' → '}
                {endDate ? new Date(endDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Present'}
              </strong>
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded-full font-bold">
              📦 Orders Found: <strong className="text-white">{filteredOrders.length}</strong>
            </span>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
              💰 Filtered Sales: <strong className="text-white">₹{filteredTotalValue.toFixed(2)}</strong>
            </span>
          </div>
        </div>

        {/* Customer Orders Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-ops-900/80 border-b border-ops-700 text-gray-400 text-xs font-mono uppercase">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Payment & Razorpay Txn</th>
                <th className="p-4">Fulfillment Status & AWB</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ops-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    {loading ? 'Fetching orders from database...' : 'No orders matched the current date/search filter.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const id = ord.order_id || ord.id || ord._id;
                  const courier = ord.courier_partner || ord.courier_name;
                  const awb = ord.awb_number || ord.tracking_number;
                  const razorpayTxn = ord.razorpay_payment_id || ord.razorpay_order_id;

                  return (
                    <tr key={id} className="hover:bg-ops-700/50 transition">
                      <td className="p-4 font-mono">
                        <p className="font-bold text-blue-400 text-sm">#{ord.order_id}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {new Date(ord.created_at || Date.now()).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-white text-sm">{ord.customer_name}</p>
                        <p className="text-xs font-mono text-gray-400">{ord.customer_phone}</p>
                        <p className="text-[11px] text-gray-500 truncate max-w-xs">{ord.shipping_address}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          {ord.items && ord.items.map((it: any, idx: number) => (
                            <p key={idx} className="text-gray-300">
                              • <span className="font-semibold text-white">{it.title}</span> {it.size ? `(${it.size})` : ''} x {it.quantity}
                            </p>
                          ))}
                          <p className="font-mono text-emerald-400 font-bold mt-1">Total: ₹{ord.total_amount}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                          ord.payment_method === 'ONLINE' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>
                          {ord.payment_method}
                        </span>
                        <div className="mt-1">
                          <span className={`font-semibold ${
                            ord.payment_status === 'PAID' ? 'text-emerald-400' :
                            ord.payment_status === 'REFUNDED' ? 'text-purple-400' : 'text-amber-400'
                          }`}>
                            {ord.payment_status}
                          </span>
                        </div>
                        {ord.payment_method === 'ONLINE' && razorpayTxn && (
                          <div className="mt-1 text-[10px] text-gray-300 bg-ops-900 px-2 py-1 rounded border border-ops-700" title={razorpayTxn}>
                            Txn ID: <strong className="text-blue-300 font-bold">{razorpayTxn}</strong>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                            ord.order_status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                            ord.order_status === 'SHIPPED' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                            ord.order_status === 'PROCESSING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            ord.order_status === 'CANCELLED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            ord.order_status === 'REFUNDED' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                            'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}>
                            {ord.order_status}
                          </span>
                          {awb && (
                            <div className="text-[11px] font-mono text-gray-300 mt-1">
                              <span className="text-gray-400">{courier || 'Courier'}:</span> <strong className="text-blue-400 font-bold">{awb}</strong>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="p-2 text-gray-400 hover:text-blue-400 rounded-lg hover:bg-ops-700 flex items-center space-x-1 text-xs"
                            title="View GST Tax Invoice"
                          >
                            <FileText className="w-4 h-4" />
                            <span className="hidden md:inline font-mono">Invoice</span>
                          </button>
                          <button
                            onClick={() => {
                              setEditingOrder(ord);
                              setNewStatus(ord.order_status || 'SHIPPED');
                              setPaymentStatus(ord.payment_status || 'PAID');
                              setCustName(ord.customer_name || '');
                              setCustPhone(ord.customer_phone || '');
                              setShippingAddress(ord.shipping_address || '');
                              setCourierName(ord.courier_partner || ord.courier_name || 'Blue Dart Express');
                              setTrackingNumber(ord.awb_number || ord.tracking_number || '');
                              setTxnId(ord.razorpay_payment_id || ord.razorpay_order_id || '');
                            }}
                            className="p-2 text-gray-400 hover:text-purple-400 rounded-lg hover:bg-ops-700 flex items-center space-x-1 text-xs"
                            title="Edit Order Details & AWB"
                          >
                            <Truck className="w-4 h-4" />
                            <span className="hidden md:inline font-mono font-bold text-blue-400">Edit Details</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Invoice Modal */}
      {selectedInvoiceOrder && (
        <InvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Update Order Status & Shipment Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ops-800 border border-ops-700 max-w-lg w-full rounded-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-mono font-bold text-white uppercase">Edit Order & Real-Time MongoDB Sync</h3>
            <p className="text-xs text-gray-400 font-mono">Order Ref: #{editingOrder.order_id}</p>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-sm font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">1. Fulfillment Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  >
                    <option value="CONFIRMED">CONFIRMED (Order Placed)</option>
                    <option value="PROCESSING">PROCESSING (Packed & Ready)</option>
                    <option value="SHIPPED">SHIPPED (Handed to Courier)</option>
                    <option value="DELIVERED">DELIVERED (Package Delivered)</option>
                    <option value="CANCELLED">CANCELLED (Restock Items)</option>
                    <option value="REFUNDED">REFUNDED (Payment Refunded)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">2. Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  >
                    <option value="PAID">PAID</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">3. Customer Name</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={(e) => setCustName(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">4. Customer Mobile</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">5. Shipping Address</label>
                <textarea
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">6. Courier Partner</label>
                  <select
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  >
                    {INDIAN_COURIERS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-1">7. AWB / Tracking No</label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="e.g. AWB-984729104"
                    className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">8. Razorpay Payment / Txn ID</label>
                <input
                  type="text"
                  value={txnId}
                  onChange={(e) => setTxnId(e.target.value)}
                  placeholder="e.g. pay_online_17283921"
                  className="w-full bg-ops-900 border border-ops-700 rounded p-2.5 text-white text-xs font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-ops-700">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 bg-ops-700 text-gray-300 rounded hover:bg-ops-600 text-xs font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-500 disabled:opacity-50 text-xs font-mono font-bold"
                >
                  {submitting ? 'Syncing to MongoDB...' : 'Save & Sync MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
