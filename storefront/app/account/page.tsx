'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import TaxInvoiceModal from '@/components/TaxInvoiceModal';
import ThermalInvoiceModal from '@/components/ThermalInvoiceModal';
import MobileBottomNav from '@/components/MobileBottomNav';
import { User, Package, MapPin, LogOut, Plus, Trash2, Edit3, PhoneCall, FileText, Loader2, RefreshCw, Smartphone, Copy, Check, Truck, Printer } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'ADDRESSES'>('ORDERS');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any>(null);
  const [selectedThermalOrder, setSelectedThermalOrder] = useState<any>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Phone Edit Manager State
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneSaving, setPhoneSaving] = useState(false);

  // Address Modal State
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState<SavedAddress | null>(null);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrPincode, setAddrPincode] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('shadow_user');
    if (!savedUser) {
      router.push('/account/login');
      return;
    }

    try {
      const u = JSON.parse(savedUser);
      setUser(u);
      setNewPhone(u.phone || '');

      // Fetch Latest Merged Profile from MongoDB Atlas
      syncLatestProfile(u);

      // Load Saved Addresses
      const savedAddrs = localStorage.getItem(`shadow_addrs_${u.email || u.phone}`);
      if (savedAddrs) {
        setAddresses(JSON.parse(savedAddrs));
      } else if (u.addresses) {
        setAddresses(u.addresses);
      }

      fetchUserOrders(u.phone, u.email);
    } catch (e) {
      router.push('/account/login');
    }
  }, []);

  const syncLatestProfile = async (localUser: any) => {
    try {
      let queryUrl = `${API_URL}/api/v1/user/profile?`;
      if (localUser.email) queryUrl += `email=${encodeURIComponent(localUser.email)}&`;
      if (localUser.phone) queryUrl += `phone=${encodeURIComponent(localUser.phone)}`;

      const res = await axios.get(queryUrl);
      if (res.data) {
        const merged = {
          ...localUser,
          ...res.data,
          // Preserve photo or name if set locally
          photoURL: localUser.photoURL || res.data.photo_url || res.data.photoURL,
          name: localUser.name || res.data.name,
          email: res.data.email || localUser.email || '',
          phone: res.data.phone || localUser.phone || '',
        };
        setUser(merged);
        localStorage.setItem('shadow_user', JSON.stringify(merged));
        setNewPhone(merged.phone || '');
        if (merged.addresses) setAddresses(merged.addresses);
        fetchUserOrders(merged.phone, merged.email);
      }
    } catch (err) {
      console.warn('MongoDB profile sync note:', err);
    }
  };

  const fetchUserOrders = async (phone: string, email: string) => {
    setLoadingOrders(true);
    try {
      let queryUrl = `${API_URL}/api/v1/user/orders?`;
      if (phone) queryUrl += `phone=${encodeURIComponent(phone)}&`;
      if (email) queryUrl += `email=${encodeURIComponent(email)}`;

      const res = await axios.get(queryUrl);
      const rawOrders = Array.isArray(res.data) ? res.data : [];
      const sortedOrders = [...rawOrders].sort((a: any, b: any) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      });
      setOrders(sortedOrders);
    } catch (err) {
      console.warn('Failed to fetch user orders', err);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAwb(text);
    setTimeout(() => setCopiedAwb(null), 2000);
  };

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim() || !/^[6-9]\d{9}$/.test(newPhone.trim())) {
      alert('Please enter a valid 10-digit Indian phone number.');
      return;
    }

    setPhoneSaving(true);
    const updatedUser = {
      ...user,
      phone: newPhone.trim(),
    };

    try {
      const res = await axios.put(`${API_URL}/api/v1/user/profile`, updatedUser);
      if (res.data) {
        const merged = { ...updatedUser, ...res.data };
        localStorage.setItem('shadow_user', JSON.stringify(merged));
        setUser(merged);
      }
    } catch (err) {
      localStorage.setItem('shadow_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    setShowPhoneEdit(false);
    setPhoneSaving(false);
    fetchUserOrders(updatedUser.phone, updatedUser.email);
  };

  const handleLogout = () => {
    localStorage.removeItem('shadow_user');
    router.push('/account/login');
  };

  // Address Handlers
  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrName(user?.name || '');
    setAddrPhone(user?.phone || '');
    setAddrStreet('');
    setAddrCity('');
    setAddrPincode('');
    setShowAddrModal(true);
  };

  const openEditAddr = (addr: SavedAddress) => {
    setEditingAddr(addr);
    setAddrName(addr.name);
    setAddrPhone(addr.phone);
    setAddrStreet(addr.street);
    setAddrCity(addr.city);
    setAddrPincode(addr.pincode);
    setShowAddrModal(true);
  };

  const saveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet || !addrCity || !addrPincode) return;

    let updated: SavedAddress[] = [];
    if (editingAddr) {
      updated = addresses.map((a) =>
        a.id === editingAddr.id
          ? { ...a, name: addrName, phone: addrPhone, street: addrStreet, city: addrCity, pincode: addrPincode }
          : a
      );
    } else {
      const newAddr: SavedAddress = {
        id: Date.now().toString(),
        name: addrName,
        phone: addrPhone,
        street: addrStreet,
        city: addrCity,
        pincode: addrPincode,
        isDefault: addresses.length === 0,
      };
      updated = [...addresses, newAddr];
    }

    setAddresses(updated);
    if (user) {
      localStorage.setItem(`shadow_addrs_${user.email || user.phone}`, JSON.stringify(updated));
      axios.put(`${API_URL}/api/v1/user/profile`, { ...user, addresses: updated }).catch(() => {});
    }
    setShowAddrModal(false);
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`shadow_addrs_${user.email || user.phone}`, JSON.stringify(updated));
    }
  };

  const setDefaultAddress = (id: string) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    if (user) {
      localStorage.setItem(`shadow_addrs_${user.email || user.phone}`, JSON.stringify(updated));
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <Header onToggleAI={() => {}} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 w-full space-y-10">
        
        {/* Profile Header Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex items-center space-x-4">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.name} className="w-16 h-16 rounded-full border-2 border-slate-900 shadow-md object-cover" />
            ) : (
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl">
                {user.name ? user.name[0] : 'U'}
              </div>
            )}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-slate-900 uppercase">{user.name}</h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-full border border-emerald-300">
                  VERIFIED ACCOUNT
                </span>
              </div>
              <p className="text-xs text-slate-600 font-mono mt-1">Email: {user.email ? user.email : 'Not Linked'}</p>
              
              {/* Phone Number Display & Edit Manager */}
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-slate-700 font-mono font-semibold">
                  Phone: {user.phone ? user.phone : 'No Phone Added'}
                </span>
                <button
                  onClick={() => setShowPhoneEdit(!showPhoneEdit)}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1 font-mono font-bold"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{user.phone ? 'Edit' : 'Add Mobile'}</span>
                </button>
              </div>

              {showPhoneEdit && (
                <form onSubmit={handleSavePhone} className="mt-3 flex items-center space-x-2 text-xs">
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10-digit phone"
                    className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <button
                    type="submit"
                    disabled={phoneSaving}
                    className="px-3 py-1.5 bg-slate-900 text-white font-bold rounded-lg text-xs uppercase shadow hover:bg-slate-800"
                  >
                    {phoneSaving ? 'Saving...' : 'Save'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Switcher: MY ORDERS vs ADDRESS BOOK */}
        <div className="flex space-x-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-6 py-3 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center space-x-2 ${
              activeTab === 'ORDERS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`px-6 py-3 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center space-x-2 ${
              activeTab === 'ADDRESSES'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>
        </div>

        {/* MY ORDERS TAB */}
        {activeTab === 'ORDERS' && (
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black uppercase text-slate-900 font-mono flex items-center space-x-2">
                  <Package className="w-5 h-5 text-slate-900" />
                  <span>Order History</span>
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Lifetime orders matching email: <strong className="text-slate-900">{user.email || 'N/A'}</strong> or phone: <strong className="text-slate-900">{user.phone || 'N/A'}</strong>
                </p>
              </div>

              <button
                onClick={() => fetchUserOrders(user.phone, user.email)}
                className="p-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs flex items-center space-x-1"
                title="Refresh Order History"
              >
                <RefreshCw className={`w-4 h-4 ${loadingOrders ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {loadingOrders ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-slate-900 mx-auto" />
                <p className="text-xs font-mono text-slate-500">Fetching order history from MongoDB Atlas...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <Package className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 uppercase font-mono">No Orders Found</h3>
                <p className="text-xs text-slate-500">No orders placed under email ({user.email}) or phone ({user.phone}) yet.</p>
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition"
                >
                  Browse Streetwear Drops
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((ord, idx) => {
                  const ordId = ord.order_id || ord.id || ord._id;
                  const courier = ord.courier_partner || ord.courier_name;
                  const awb = ord.awb_number || ord.tracking_number;

                  const ordDate = new Date(ord.created_at || Date.now()).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div key={ordId || idx} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6 shadow-sm">
                      
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold uppercase px-2.5 py-0.5 bg-slate-100 text-slate-900 rounded-full border border-slate-300">
                              ORDER ID
                            </span>
                            <h3 className="text-xl font-black font-mono text-slate-900">#{ord.order_id}</h3>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-1">Placed on: {ordDate}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold uppercase border ${
                            ord.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            ord.order_status === 'SHIPPED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            ord.order_status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-300' :
                            'bg-amber-100 text-amber-800 border-amber-300'
                          }`}>
                            {ord.order_status}
                          </span>
                        </div>
                      </div>

                      {/* Prominent Shipment Card when Shipped / Delivered */}
                      {awb && (
                        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <div className="flex items-center space-x-3">
                            <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                              <Truck className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-purple-950 font-mono uppercase">
                                🚚 Shipped via {courier || 'Express Courier'}
                              </p>
                              <p className="text-xs font-mono text-purple-800 font-bold mt-0.5">
                                AWB / Tracking: <span className="text-slate-900 font-black">{awb}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => copyToClipboard(awb)}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-mono font-bold text-xs rounded-xl flex items-center space-x-1.5 transition shadow"
                          >
                            {copiedAwb === awb ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy AWB</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Line Items List */}
                      <div className="space-y-3">
                        {ord.items && ord.items.map((it: any, itemIdx: number) => (
                          <div key={itemIdx} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                            <div className="flex items-center space-x-3">
                              {it.image && (
                                <img src={it.image} alt={it.title} className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                              )}
                              <div>
                                <p className="font-bold text-slate-900 text-sm">{it.title}</p>
                                <p className="text-slate-500 text-[11px]">Size: {it.size || 'Standard'} • Qty: {it.quantity}</p>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900 text-sm">₹{(it.price * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer Info & Buttons */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-slate-100 text-xs font-mono">
                        <div>
                          <p className="text-slate-600 font-mono">
                            {ord.payment_method === 'COD' ? 'Total Payable (COD)' : 'Total Paid (ONLINE)'}:{' '}
                            <strong className="text-slate-900 text-base font-bold">₹{ord.total_amount?.toFixed(2)}</strong>
                          </p>
                          {ord.payment_method !== 'COD' && ord.razorpay_payment_id && (
                            <p className="text-slate-600 text-[11px] font-mono mt-0.5">
                              Txn ID:{' '}
                              <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono select-all">
                                {ord.razorpay_payment_id}
                              </strong>
                            </p>
                          )}
                          <p className="text-slate-500 text-[11px] mt-0.5">Shipping Address: {ord.shipping_address}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedThermalOrder(ord)}
                            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center space-x-1.5 transition text-xs"
                            title="4x6 Thermal Label"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Thermal Label</span>
                          </button>
                          <button
                            onClick={() => setSelectedInvoiceOrder(ord)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 font-bold rounded-xl flex items-center space-x-1.5 transition text-xs"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-700" />
                            <span>Tax Invoice</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ADDRESS BOOK TAB */}
        {activeTab === 'ADDRESSES' && (
          <section className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black uppercase text-slate-900 font-mono flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-slate-900" />
                <span>Delivery Address Book</span>
              </h2>
              <button
                onClick={openAddAddr}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-base font-bold text-slate-900 uppercase font-mono">No Saved Addresses</h3>
                <p className="text-xs text-slate-500">You haven't saved any delivery addresses yet.</p>
                <button
                  onClick={openAddAddr}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800 transition"
                >
                  + Add New Delivery Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`p-6 rounded-2xl border transition relative space-y-3 ${
                      addr.isDefault
                        ? 'bg-white border-slate-900 shadow-md'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{addr.name}</span>
                        {addr.isDefault && (
                          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-900 text-[10px] font-mono font-bold rounded-full border border-slate-300">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => openEditAddr(addr)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                          title="Edit"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {!addr.isDefault && (
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-slate-100"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-sans leading-relaxed">
                      {addr.street}, {addr.city} - <span className="font-mono font-bold text-slate-900">{addr.pincode}</span>
                    </p>
                    <p className="text-xs font-mono text-slate-500">Phone: {addr.phone}</p>

                    {!addr.isDefault && (
                      <button
                        onClick={() => setDefaultAddress(addr.id)}
                        className="text-xs text-slate-900 hover:underline font-semibold font-mono"
                      >
                        Set as Default Address
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Tax Invoice Modal Trigger */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Address Edit/Add Modal */}
      {showAddrModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-md w-full rounded-3xl p-6 shadow-2xl text-slate-900 space-y-4">
            <h3 className="text-base font-bold uppercase font-mono text-slate-900">
              {editingAddr ? 'Edit Address' : 'Add New Address'}
            </h3>

            <form onSubmit={saveAddress} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 mb-1 font-medium">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={addrName}
                  onChange={(e) => setAddrName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Phone Number</label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={addrPhone}
                  onChange={(e) => setAddrPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit phone"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-medium">Street Address / House No.</label>
                <input
                  type="text"
                  required
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="e.g. Flat 4B, Technopark Street"
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 mb-1 font-medium">City</label>
                  <input
                    type="text"
                    required
                    value={addrCity}
                    onChange={(e) => setAddrCity(e.target.value)}
                    placeholder="e.g. Kolkata"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-medium">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    placeholder="e.g. 700091"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddrModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-wider shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* GST Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <TaxInvoiceModal order={selectedInvoiceOrder} onClose={() => setSelectedInvoiceOrder(null)} />
      )}

      {/* Thermal Invoice Modal (4x6) */}
      {selectedThermalOrder && (
        <ThermalInvoiceModal order={selectedThermalOrder} onClose={() => setSelectedThermalOrder(null)} />
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
