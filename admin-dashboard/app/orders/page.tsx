'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import InvoiceModal from '@/components/InvoiceModal';
import axios from 'axios';
import { ShoppingBag, FileText, Truck, RefreshCw, CheckCircle2, Clock, XCircle, DollarSign, Copy, Check } from 'lucide-react';

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
      fetchOrders(savedToken, statusFilter);
    } else {
      window.location.href = '/';
    }
  }, [statusFilter]);

  const fetchOrders = async (authToken: string, status: string) => {
    setLoading(true);
    try {
      const url = status === 'ALL' 
        ? `${API_URL}/api/v1/admin/orders` 
        : `${API_URL}/api/v1/admin/orders?status=${status}`;
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
      if (token) fetchOrders(token, statusFilter);
    } catch (err) {
      alert('Failed to update order details in MongoDB');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white">ORDER FULFILLMENT DESK</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Customer dispatch queue, Razorpay Txn IDs, AWB tracking pipeline & real-time MongoDB sync</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-ops-800 border border-ops-700 rounded-lg px-3 py-2 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Lifecycle Statuses</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
            <button
              onClick={() => token && fetchOrders(token, statusFilter)}
              className="p-2 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    {loading ? 'Fetching orders from database...' : 'No orders matched the current filter.'}
                  </td>
                </tr>
              ) : (
                orders.map((ord) => {
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
