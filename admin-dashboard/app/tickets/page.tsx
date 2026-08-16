'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { HelpCircle, RefreshCw, CheckCircle2, Clock, Image as ImageIcon, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TicketsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token');
    if (savedToken) {
      setToken(savedToken);
      fetchTickets(savedToken);
    } else {
      window.location.href = '/';
    }
  }, []);

  const fetchTickets = async (authToken: string) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/admin/tickets`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to fetch support tickets', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, status: string) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/admin/tickets/${ticketId}/status`,
        { status: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (token) fetchTickets(token);
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-mono font-bold tracking-tight text-white uppercase">CUSTOMER SUPPORT TICKETS DESK</h1>
            <p className="text-xs text-gray-400 font-mono mt-1">Priority issue logs, defect screenshots & resolution status</p>
          </div>
          <button
            onClick={() => token && fetchTickets(token)}
            className="p-2 bg-ops-800 border border-ops-700 rounded-lg text-gray-300 hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Tickets Grid / Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-ops-900/80 border-b border-ops-700 text-gray-400 text-xs font-mono uppercase">
                <th className="p-4">Ticket ID & Date</th>
                <th className="p-4">Customer Contact</th>
                <th className="p-4">Category & Issue Description</th>
                <th className="p-4">Proof Screenshot</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ops-700">
              {tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                    {loading ? 'Fetching support tickets from MongoDB...' : 'No support tickets logged yet.'}
                  </td>
                </tr>
              ) : (
                tickets.map((t) => {
                  const id = t.ticket_id || t.id || t._id;
                  return (
                    <tr key={id} className="hover:bg-ops-700/50 transition">
                      <td className="p-4 font-mono">
                        <p className="font-bold text-blue-400 text-sm">#{t.ticket_id}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          {new Date(t.created_at || Date.now()).toLocaleString()}
                        </p>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <p className="font-bold text-white">{t.customer_phone || t.customer_email || 'Anonymous'}</p>
                      </td>
                      <td className="p-4 max-w-sm">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded uppercase">
                          {t.category || 'Support Inquiry'}
                        </span>
                        <p className="text-xs text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
                          {t.issue_text}
                        </p>
                      </td>
                      <td className="p-4">
                        {t.image_url ? (
                          <button
                            onClick={() => setSelectedImage(t.image_url)}
                            className="flex items-center space-x-2 p-1.5 bg-ops-900 border border-ops-700 rounded-lg hover:border-blue-500 transition text-xs text-blue-400"
                          >
                            <img src={t.image_url} alt="Proof" className="w-8 h-8 object-cover rounded" />
                            <span className="font-mono text-[10px]">Inspect</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-gray-500 font-mono italic">No attachment</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <span className={`px-2.5 py-1 rounded font-bold uppercase ${
                          t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          t.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {t.status !== 'RESOLVED' && (
                            <button
                              onClick={() => handleUpdateStatus(id, 'RESOLVED')}
                              className="px-3 py-1.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-600 hover:text-white transition text-xs font-mono font-bold uppercase"
                            >
                              Mark Resolved
                            </button>
                          )}
                          {t.status === 'OPEN' && (
                            <button
                              onClick={() => handleUpdateStatus(id, 'IN_PROGRESS')}
                              className="px-3 py-1.5 bg-amber-600/20 text-amber-400 border border-amber-500/30 rounded-lg hover:bg-amber-600 hover:text-white transition text-xs font-mono font-bold uppercase"
                            >
                              In Progress
                            </button>
                          )}
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

      {/* Image Inspection Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-3xl w-full bg-ops-800 border border-ops-700 rounded-2xl p-4 space-y-4">
            <div className="flex justify-between items-center border-b border-ops-700 pb-2">
              <span className="text-xs font-mono text-gray-300 font-bold uppercase">Customer Defect / Payment Screenshot</span>
              <button onClick={() => setSelectedImage(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-black rounded-xl p-2">
              <img src={selectedImage} alt="Full Proof" className="max-w-full max-h-[70vh] object-contain rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
