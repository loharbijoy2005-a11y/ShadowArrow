'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { Users, Search, Phone, Mail, UserCheck, ShieldCheck, MapPin, ShoppingBag, RefreshCw, X, Award, ExternalLink, Coins, ArrowUpDown } from 'lucide-react';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:8080'
    : 'https://shadow-arrow-backend.onrender.com');

export default function CustomersAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [authFilter, setAuthFilter] = useState('ALL');
  const [sortOption, setSortOption] = useState<'COINS' | 'SPENT'>('COINS');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchCustomers(savedToken);
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchCustomers = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/customers`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setCustomers(res.data || []);
    } catch (err: any) {
      console.error('Failed to fetch customers registry', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('ops_admin_token');
        window.location.href = '/';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('ops_admin_token');
    window.location.href = '/';
  };

  // Filter and sort logic
  const filteredCustomers = customers
    .filter((c) => {
      const matchesSearch =
        (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.phone || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (authFilter === 'ALL') return matchesSearch;
      if (authFilter === 'GOOGLE') return matchesSearch && (c.auth_type || '').includes('Google');
      if (authFilter === 'PHONE') return matchesSearch && (c.auth_type || '').includes('Phone');
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortOption === 'COINS') {
        return (b.coin_balance || 0) - (a.coin_balance || 0);
      }
      return (b.total_spent || 0) - (a.total_spent || 0);
    });

  // Calculate statistics
  const totalCustomers = customers.length;
  const googleUsers = customers.filter((c) => (c.auth_type || '').includes('Google')).length;
  const phoneUsers = customers.filter((c) => (c.auth_type || '').includes('Phone')).length;
  const totalLTV = customers.reduce((acc, c) => acc + (c.total_spent || 0), 0);

  return (
    <div className="min-h-screen bg-ops-900 text-gray-100 flex font-sans">
      <Navigation onLogout={handleLogout} />

      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-ops-700 pb-6">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-mono font-bold uppercase tracking-wider text-white">Customer Registry</h1>
                  <p className="text-xs text-gray-400 font-mono">Total Verified Profiles & Contact Linkage</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => token && fetchCustomers(token)}
              className="flex items-center space-x-2 px-4 py-2 bg-ops-800 hover:bg-ops-700 text-gray-300 rounded-xl text-xs font-mono border border-ops-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
          </div>

          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-gray-400 font-mono uppercase">Total Customers</span>
              <p className="text-2xl font-bold font-mono text-white">{totalCustomers}</p>
            </div>
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-gray-400 font-mono uppercase">Google Auth Users</span>
              <p className="text-2xl font-bold font-mono text-emerald-400">{googleUsers}</p>
            </div>
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-gray-400 font-mono uppercase">Phone Auth Users</span>
              <p className="text-2xl font-bold font-mono text-blue-400">{phoneUsers}</p>
            </div>
            <div className="bg-ops-800 border border-ops-700 rounded-2xl p-5 space-y-1">
              <span className="text-xs text-gray-400 font-mono uppercase">Combined LTV</span>
              <p className="text-2xl font-bold font-mono text-amber-400">₹{totalLTV.toLocaleString('en-IN')}</p>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Name, Email, or Mobile..."
                className="w-full pl-10 pr-4 py-2.5 bg-ops-900 border border-ops-700 rounded-xl text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="flex items-center space-x-2 text-xs font-mono w-full md:w-auto">
              <button
                onClick={() => setAuthFilter('ALL')}
                className={`px-4 py-2 rounded-xl border transition ${
                  authFilter === 'ALL'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                    : 'bg-ops-900 text-gray-400 border-ops-700 hover:bg-ops-700'
                }`}
              >
                All ({customers.length})
              </button>
              <button
                onClick={() => setAuthFilter('GOOGLE')}
                className={`px-4 py-2 rounded-xl border transition ${
                  authFilter === 'GOOGLE'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                    : 'bg-ops-900 text-gray-400 border-ops-700 hover:bg-ops-700'
                }`}
              >
                Google Mail ({googleUsers})
              </button>
              <button
                onClick={() => setAuthFilter('PHONE')}
                className={`px-4 py-2 rounded-xl border transition ${
                  authFilter === 'PHONE'
                    ? 'bg-blue-600/20 text-blue-400 border-blue-500'
                    : 'bg-ops-900 text-gray-400 border-ops-700 hover:bg-ops-700'
                }`}
              >
                Phone Login ({phoneUsers})
              </button>

              <button
                onClick={() => setSortOption(sortOption === 'COINS' ? 'SPENT' : 'COINS')}
                className="px-4 py-2 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-300 font-bold hover:bg-amber-500/20 transition flex items-center space-x-1.5"
                title="Toggle Sorting Priority"
              >
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Rank: {sortOption === 'COINS' ? 'Highest ArrowCoins' : 'Highest Spend'}</span>
              </button>
            </div>
          </div>

          {/* Customers Table */}
          <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-gray-400 font-mono text-xs">
                Loading customer registry records...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-12 text-center text-gray-400 font-mono text-xs">
                No customer profiles match your search filter.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-ops-900 text-gray-400 border-b border-ops-700 uppercase">
                    <tr>
                      <th className="px-6 py-4">Customer Name</th>
                      <th className="px-6 py-4">Email Address</th>
                      <th className="px-6 py-4">Mobile Number</th>
                      <th className="px-6 py-4">Account Method</th>
                      <th className="px-6 py-4 text-center">ArrowCoins</th>
                      <th className="px-6 py-4 text-center">Received / Delivered</th>
                      <th className="px-6 py-4 text-center">Cancelled</th>
                      <th className="px-6 py-4 text-center">Trust Rating</th>
                      <th className="px-6 py-4 text-right">Total Spent</th>
                      <th className="px-6 py-4 text-center">Profile Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ops-700">
                    {filteredCustomers.map((c) => (
                      <tr key={c.id} className="hover:bg-ops-700/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-white flex items-center space-x-3">
                          {c.photo_url ? (
                            <img src={c.photo_url} alt="" className="w-8 h-8 rounded-full border border-ops-700 shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                              {(c.name || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="truncate max-w-[150px]">{c.name || 'Anonymous User'}</span>
                        </td>

                        <td className="px-6 py-4 text-gray-300">
                          {c.email ? (
                            <span className="flex items-center space-x-1 text-gray-300">
                              <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                              <span className="truncate max-w-[180px]">{c.email}</span>
                            </span>
                          ) : (
                            <span className="text-gray-600 italic">No Email Provided</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          {c.phone ? (
                            <span className="flex items-center space-x-1.5 text-emerald-400 font-bold">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{c.phone}</span>
                            </span>
                          ) : (
                            <span className="text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded text-[10px] font-bold">
                              Phone Not Linked
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              (c.auth_type || '').includes('Google')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>{c.auth_type || 'Registered'}</span>
                          </span>
                        </td>

                        {/* ArrowCoins Balance */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-lg font-bold">
                            <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                            <span>{c.coin_balance || 0} Coins</span>
                          </span>
                        </td>

                        {/* Received / Delivered Count */}
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-bold">
                            {c.orders_received || 0} Orders
                          </span>
                        </td>

                        {/* Cancelled Count */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-bold ${
                            (c.orders_cancelled || 0) > 0
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-ops-700 text-gray-500'
                          }`}>
                            {c.orders_cancelled || 0} Cancelled
                          </span>
                        </td>

                        {/* Trust Rating Badge */}
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            c.trust_score === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                            c.trust_score === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                            'bg-red-500/10 text-red-400 border border-red-500/30'
                          }`}>
                            <Award className="w-3 h-3" />
                            <span>{c.trust_score || 'HIGH'} TRUST</span>
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right font-bold text-amber-400">
                          ₹{(c.total_spent || 0).toLocaleString('en-IN')}
                        </td>

                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-lg text-[11px] font-mono transition"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Customer Detail Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ops-800 border border-ops-700 max-w-xl w-full rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-ops-700 pb-4">
              <div className="flex items-center space-x-3">
                {selectedCustomer.photo_url ? (
                  <img src={selectedCustomer.photo_url} alt="" className="w-12 h-12 rounded-full border border-ops-700" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-lg font-mono">
                    {(selectedCustomer.name || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 className="text-lg font-mono font-bold text-white uppercase">{selectedCustomer.name || 'Customer'}</h2>
                  <span className="text-xs text-blue-400 font-mono">{selectedCustomer.auth_type || 'User Profile'}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-ops-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-ops-900 p-4 rounded-2xl border border-ops-700">
              <div>
                <span className="text-gray-500 block uppercase">Email</span>
                <span className="text-gray-200 font-bold">{selectedCustomer.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Mobile Number</span>
                <span className="text-emerald-400 font-bold">{selectedCustomer.phone || 'Not Linked'}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Total Orders</span>
                <span className="text-white font-bold">{selectedCustomer.total_orders || 0}</span>
              </div>
              <div>
                <span className="text-gray-500 block uppercase">Lifetime Spend</span>
                <span className="text-amber-400 font-bold">₹{(selectedCustomer.total_spent || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Saved Addresses Section */}
            <div className="space-y-3">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-gray-400 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>Saved Addresses ({selectedCustomer.addresses?.length || 0})</span>
              </h3>

              {(!selectedCustomer.addresses || selectedCustomer.addresses.length === 0) ? (
                <div className="bg-ops-900 border border-ops-700 p-4 rounded-xl text-center text-xs font-mono text-gray-500">
                  No saved delivery addresses on file.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedCustomer.addresses.map((addr: any, idx: number) => (
                    <div key={idx} className="bg-ops-900 border border-ops-700 p-3.5 rounded-xl text-xs font-mono space-y-1">
                      <div className="flex justify-between items-center text-gray-300 font-bold">
                        <span>{addr.name || selectedCustomer.name}</span>
                        <span className="text-emerald-400">{addr.phone || selectedCustomer.phone}</span>
                      </div>
                      <p className="text-gray-400">{addr.street}, {addr.city} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-ops-700 flex justify-end">
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-ops-700 hover:bg-ops-600 text-gray-200 rounded-xl text-xs font-mono font-bold transition"
              >
                Close Registry Card
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
