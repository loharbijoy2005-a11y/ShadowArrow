'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import axios from 'axios';
import { HelpCircle, RefreshCw, CheckCircle2, Clock, Image as ImageIcon, ExternalLink, MessageSquare, Send, X, Lock, Upload, Camera, Video, CreditCard, ShieldCheck, ShieldAlert, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function TicketsAdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Status Filter State
  const [statusTab, setStatusTab] = useState('ALL');

  // Chat Drawer State
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyMedia, setReplyMedia] = useState('');
  const [replyMediaType, setReplyMediaType] = useState<'image' | 'video'>('image');
  const [replying, setReplying] = useState(false);

  // Account Deletion Approve / Reject State
  const [deletionEmailBody, setDeletionEmailBody] = useState('');
  const [deletionActionLoading, setDeletionActionLoading] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('ops_admin_token') || localStorage.getItem('admin_token');
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

      // If drawer is open, refresh active ticket details
      if (activeTicket) {
        const id = activeTicket.ticket_id || activeTicket.id || activeTicket._id;
        const detailRes = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
        if (detailRes.data) {
          setActiveTicket(detailRes.data);
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch support tickets', err);
      if (err?.response?.status === 401) {
        localStorage.removeItem('ops_admin_token');
        localStorage.removeItem('admin_token');
        window.location.href = '/';
      }
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

  const handleToggleCustomerMediaPermission = async (ticketId: string, currentAllow: boolean) => {
    try {
      await axios.put(
        `${API_URL}/api/v1/admin/tickets/${ticketId}/allow-media`,
        { allow_media_attachment: !currentAllow },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (activeTicket) {
        setActiveTicket({ ...activeTicket, allow_media_attachment: !currentAllow });
      }
      if (token) fetchTickets(token);
    } catch (err) {
      alert('Failed to toggle customer media permission');
    }
  };

  const handleOpenChatDrawer = async (ticket: any) => {
    setActiveTicket(ticket);
    const id = ticket.ticket_id || ticket.id || ticket._id;
    try {
      const res = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
      if (res.data) {
        setActiveTicket(res.data);
      }
    } catch (e) {
      console.warn('Failed to load full ticket history', e);
    }
  };

  const handleSendAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !activeTicket) return;

    setReplying(true);
    const id = activeTicket.ticket_id || activeTicket.id || activeTicket._id;
    try {
      await axios.post(
        `${API_URL}/api/v1/admin/tickets/${id}/reply`,
        {
          sender: 'admin',
          sender_name: 'Support Operations',
          message: replyMessage.trim(),
          media_url: replyMedia,
          media_type: replyMediaType,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setReplyMessage('');
      setReplyMedia('');

      const detailRes = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
      if (detailRes.data) {
        setActiveTicket(detailRes.data);
      }
      if (token) fetchTickets(token);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send admin reply');
    } finally {
      setReplying(false);
    }
  };

  const handleDeletionAction = async (action: 'APPROVE' | 'REJECT') => {
    if (!activeTicket || !token) return;
    const emailBody = deletionEmailBody.trim();
    if (!emailBody) {
      alert('Please type a message/email body for the customer before approving or rejecting.');
      return;
    }

    setDeletionActionLoading(true);
    const id = activeTicket.ticket_id || activeTicket.id || activeTicket._id;
    try {
      // Send admin reply with decision
      const decisionPrefix = action === 'APPROVE'
        ? '✅ ACCOUNT DELETION APPROVED:\n\n'
        : '❌ ACCOUNT DELETION REJECTED:\n\n';

      await axios.post(
        `${API_URL}/api/v1/admin/tickets/${id}/reply`,
        {
          sender: 'admin',
          sender_name: 'Support Operations',
          message: decisionPrefix + emailBody,
          media_url: '',
          media_type: 'image',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update ticket status
      const newStatus = action === 'APPROVE' ? 'RESOLVED' : 'IN_PROGRESS';
      await axios.put(
        `${API_URL}/api/v1/admin/tickets/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setDeletionEmailBody('');
      setActiveTicket({ ...activeTicket, status: newStatus });
      const detailRes = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
      if (detailRes.data) setActiveTicket(detailRes.data);
      if (token) fetchTickets(token);

      alert(`Deletion request ${action === 'APPROVE' ? 'APPROVED' : 'REJECTED'}. Customer notified via support thread.`);
    } catch (err: any) {
      alert(err.response?.data?.error || `Failed to ${action.toLowerCase()} deletion request.`);
    } finally {
      setDeletionActionLoading(false);
    }
  };

  const applyQuickPreset = (presetText: string, unlockCustomerMedia: boolean = false) => {
    setReplyMessage(presetText);
    if (unlockCustomerMedia && activeTicket && !activeTicket.allow_media_attachment) {
      const id = activeTicket.ticket_id || activeTicket.id || activeTicket._id;
      handleToggleCustomerMediaPermission(id, false);
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File size must be less than 3MB');
      return;
    }

    const isVid = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      setReplyMedia(reader.result as string);
      setReplyMediaType(isVid ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex min-h-screen bg-ops-900 text-gray-100 font-sans">
      <Navigation onLogout={() => { localStorage.removeItem('ops_admin_token'); window.location.href = '/'; }} />

      <main className="flex-1 p-8 space-y-8 overflow-y-auto font-mono">
        <header className="flex justify-between items-center pb-6 border-b border-ops-700">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white uppercase">CUSTOMER SUPPORT TICKETS DESK</h1>
            <p className="text-xs text-gray-400 mt-1">Real-time 2-way chat thread, defect proof inspector & status management</p>
          </div>
          <button
            onClick={() => token && fetchTickets(token)}
            className="p-2.5 bg-ops-800 border border-ops-700 rounded-xl text-gray-300 hover:text-white flex items-center space-x-2 text-xs font-bold"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Desk</span>
          </button>
        </header>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { id: 'ALL', label: 'All Tickets', count: tickets.length },
            { id: 'OPEN', label: 'Open', count: tickets.filter(t => t.status === 'OPEN').length },
            { id: 'IN_PROGRESS', label: 'In Progress', count: tickets.filter(t => t.status === 'IN_PROGRESS').length },
            { id: 'RESOLVED', label: 'Resolved', count: tickets.filter(t => t.status === 'RESOLVED').length },
            { id: 'CLOSED', label: 'Closed', count: tickets.filter(t => t.status === 'CLOSED').length },
          ].map((tab) => {
            const isSelected = statusTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-4 py-2 rounded-xl border transition flex items-center space-x-2 font-bold text-xs ${
                  isSelected
                    ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                    : 'bg-ops-800 border-ops-700/80 text-gray-300 hover:bg-ops-700 hover:text-white'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${isSelected ? 'bg-black/30 text-white' : 'bg-ops-900 text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tickets Table */}
        <div className="bg-ops-800 border border-ops-700 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-ops-900/80 border-b border-ops-700 text-gray-400 text-xs uppercase font-bold">
                <th className="p-4">Ticket ID & Date</th>
                <th className="p-4">Customer Contact</th>
                <th className="p-4">Category & Initial Issue</th>
                <th className="p-4">Thread Messages</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ops-700">
              {(() => {
                const filteredTickets = tickets.filter(t => statusTab === 'ALL' || t.status === statusTab);
                if (filteredTickets.length === 0) {
                  return (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-mono">
                        {loading ? 'Fetching support tickets from MongoDB...' : 'No tickets match the selected status tab.'}
                      </td>
                    </tr>
                  );
                }
                return filteredTickets.map((t) => {
                  const id = t.ticket_id || t.id || t._id;
                  const msgCount = (t.messages || []).length;
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
                      <td className="p-4 max-w-xs">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono font-bold rounded uppercase">
                          {t.category || 'Support Inquiry'}
                        </span>
                        <p className="text-xs text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                          {t.issue_text}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-ops-900 border border-ops-700 rounded-lg text-gray-300 text-[11px] font-bold flex items-center space-x-1.5 w-fit">
                          <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                          <span>{msgCount} Message{msgCount !== 1 ? 's' : ''}</span>
                        </span>
                      </td>
                      <td className="p-4 font-mono text-xs">
                        <span className={`px-2.5 py-1 rounded font-bold uppercase ${
                          t.status === 'RESOLVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          t.status === 'IN_PROGRESS' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                          t.status === 'CLOSED' ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' :
                          'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleOpenChatDrawer(t)}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-md"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Open Chat Thread</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </main>

      {/* SLIDE-OVER CHAT DRAWER */}
      {activeTicket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xl bg-ops-800 border-l border-ops-700 h-full flex flex-col p-6 space-y-4 shadow-2xl text-xs font-mono">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-start pb-4 border-b border-ops-700 shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-base font-black text-blue-400">#{activeTicket.ticket_id}</span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase">
                    {activeTicket.category}
                  </span>
                </div>
                <p className="text-gray-300 font-bold mt-1">Customer: {activeTicket.customer_phone || activeTicket.customer_email || 'Guest'}</p>
                <p className="text-[10px] text-gray-500">Created: {new Date(activeTicket.created_at).toLocaleString()}</p>
              </div>

              <div className="flex items-center space-x-3">
                {/* Status Dropdown */}
                <select
                  value={activeTicket.status}
                  onChange={(e) => {
                    handleUpdateStatus(activeTicket.ticket_id || activeTicket.id, e.target.value);
                    setActiveTicket({ ...activeTicket, status: e.target.value });
                  }}
                  className="bg-ops-900 border border-ops-700 rounded-xl p-2 text-white font-bold uppercase focus:outline-none"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>

                <button onClick={() => setActiveTicket(null)} className="p-1.5 text-gray-400 hover:text-white rounded-lg bg-ops-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Action Presets Bar */}
            <div className="space-y-1.5 shrink-0 bg-ops-900/70 p-3 rounded-2xl border border-ops-700/50">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">⚡ Quick Admin Action Presets</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${activeTicket.allow_media_attachment ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                  {activeTicket.allow_media_attachment ? '🔓 Customer Upload: UNLOCKED' : '🔒 Customer Upload: LOCKED'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => applyQuickPreset('Hi! Please reply with a clear photo screenshot of your defect/payment receipt.', true)}
                  className="px-2.5 py-1.5 bg-ops-700 hover:bg-ops-600 text-blue-300 rounded-lg text-[10px] font-bold border border-ops-600 flex items-center space-x-1"
                >
                  <Camera className="w-3 h-3" />
                  <span>Request Photo Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('Hi! Please reply with a short unboxing video clip showing the defect/damaged item.', true)}
                  className="px-2.5 py-1.5 bg-ops-700 hover:bg-ops-600 text-purple-300 rounded-lg text-[10px] font-bold border border-ops-600 flex items-center space-x-1"
                >
                  <Video className="w-3 h-3" />
                  <span>Request Video Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => applyQuickPreset('Hi! Please share a screenshot of the payment transaction from your bank/UPI app.', true)}
                  className="px-2.5 py-1.5 bg-ops-700 hover:bg-ops-600 text-emerald-300 rounded-lg text-[10px] font-bold border border-ops-600 flex items-center space-x-1"
                >
                  <CreditCard className="w-3 h-3" />
                  <span>Request Payment Proof</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const id = activeTicket.ticket_id || activeTicket.id || activeTicket._id;
                    handleToggleCustomerMediaPermission(id, !!activeTicket.allow_media_attachment);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border flex items-center space-x-1 transition ${
                    activeTicket.allow_media_attachment
                      ? 'bg-amber-900/40 hover:bg-amber-800/60 text-amber-300 border-amber-800/50'
                      : 'bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-300 border-emerald-800/50'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>{activeTicket.allow_media_attachment ? '🔒 Lock Customer Upload' : '🔓 Unlock Customer Photo/Video'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateStatus(activeTicket.ticket_id || activeTicket.id, 'CLOSED');
                    setActiveTicket({ ...activeTicket, status: 'CLOSED' });
                  }}
                  className="px-2.5 py-1.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded-lg text-[10px] font-bold border border-red-800/50 flex items-center space-x-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>Mark Ticket Closed</span>
                </button>
              </div>
            </div>

            {/* ACCOUNT DELETION — Approve / Reject Panel */}
            {activeTicket.category === 'ACCOUNT_DELETION' && (
              <div className="shrink-0 bg-red-950/40 border border-red-800/50 rounded-2xl p-4 space-y-3">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-black uppercase text-red-300">Account Deletion Request — Admin Decision</span>
                </div>

                {/* Active orders warning from ticket message */}
                {activeTicket.messages?.[0]?.message?.includes('ADMIN REVIEW REQUIRED') && (
                  <div className="p-2.5 bg-amber-900/30 border border-amber-700/50 rounded-xl">
                    <div className="flex items-center space-x-1.5 text-amber-300 text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Active orders detected — verify before approving!</span>
                    </div>
                    <p className="text-[10px] text-amber-200/70 mt-1 whitespace-pre-line line-clamp-5">
                      {activeTicket.messages[0].message.split('⚠️ ADMIN REVIEW REQUIRED')[1]?.split('Admin must')[0]}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1.5">Message to Customer (Required — sent as support reply)</label>
                  <textarea
                    value={deletionEmailBody}
                    onChange={(e) => setDeletionEmailBody(e.target.value)}
                    placeholder="Type your message... e.g. 'Your account deletion has been approved. Your data will be erased within 48-72 hours.' OR 'Your request has been rejected because you have active orders. Please contact us once delivered.'"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-ops-900 border border-ops-700 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleDeletionAction('APPROVE')}
                    disabled={deletionActionLoading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Deletion</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletionAction('REJECT')}
                    disabled={deletionActionLoading}
                    className="flex-1 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white font-black text-xs uppercase rounded-xl flex items-center justify-center space-x-2 transition"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Deletion</span>
                  </button>
                </div>
              </div>
            )}

            {/* Chat Thread Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-ops-900/80 rounded-2xl border border-ops-700">
              {(activeTicket.messages || []).map((msg: any, idx: number) => {
                const isAdmin = msg.sender === 'admin';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${isAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[10px] text-gray-500 mb-1">
                      {msg.sender_name || (isAdmin ? 'Support Admin' : 'Customer')} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl leading-relaxed space-y-2 font-sans ${
                        isAdmin ? 'bg-blue-600 text-white rounded-br-none' : 'bg-ops-700 text-gray-100 rounded-bl-none border border-ops-600'
                      }`}
                    >
                      <p className="whitespace-pre-line text-xs">{msg.message}</p>

                      {msg.media_url && (
                        <div className="pt-1">
                          {msg.media_type === 'video' ? (
                            <video src={msg.media_url} controls className="max-w-full max-h-48 rounded-xl border border-ops-600" />
                          ) : (
                            <img src={msg.media_url} alt="Attachment" className="max-w-full max-h-48 object-cover rounded-xl border border-ops-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            {activeTicket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendAdminReply} className="shrink-0 space-y-2 pt-1">
                {replyMedia && (
                  <div className="p-2 bg-ops-900 rounded-xl flex items-center justify-between text-xs border border-ops-700">
                    <span className="text-[11px] text-emerald-400 font-bold">Attachment Attached</span>
                    <button type="button" onClick={() => setReplyMedia('')} className="text-gray-400 hover:text-red-400">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="p-3 bg-ops-700 hover:bg-ops-600 text-gray-300 rounded-xl cursor-pointer transition shrink-0" title="Attach Media">
                    <Upload className="w-4 h-4" />
                    <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
                  </label>

                  <input
                    type="text"
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type official admin response..."
                    className="flex-1 px-4 py-3 bg-ops-900 border border-ops-700 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />

                  <button
                    type="submit"
                    disabled={replying}
                    className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl uppercase tracking-wider flex items-center space-x-1 shrink-0"
                  >
                    {replying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-3 bg-ops-900 text-gray-400 rounded-xl text-center text-xs">
                🔒 Ticket is CLOSED. Re-open status above to send further admin messages.
              </div>
            )}

          </div>
        </div>
      )}

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
