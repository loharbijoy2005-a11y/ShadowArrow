'use client';

import React, { useState, useEffect } from 'react';
import { HelpCircle, X, Upload, CheckCircle2, AlertCircle, Send, Loader2, MessageSquare, Clock, Lock, ArrowLeft, Image as ImageIcon, Video } from 'lucide-react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const ISSUE_CATEGORIES = [
  'Order Delayed / Delivery Issue',
  'Wrong / Damaged Item Received',
  'Return / Refund Request',
  'Payment Deducted but Order Not Placed',
  'Other Issue',
];

interface SupportWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: string;
}

export default function SupportWidgetModal({ isOpen, onClose, initialCategory }: SupportWidgetModalProps) {
  const [activeTab, setActiveTab] = useState<'CREATE' | 'MY_TICKETS'>('CREATE');

  // Create Ticket State
  const [category, setCategory] = useState(initialCategory || ISSUE_CATEGORIES[0]);
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any>(null);
  const [error, setError] = useState('');

  // My Tickets / Chat State
  const [myContact, setMyContact] = useState('');
  const [myTickets, setMyTickets] = useState<any[]>([]);
  const [fetchingTickets, setFetchingTickets] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replyMedia, setReplyMedia] = useState('');
  const [replyMediaType, setReplyMediaType] = useState<'image' | 'video'>('image');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('shadow_user');
      if (savedUserStr) {
        const u = JSON.parse(savedUserStr);
        if (u.phone || u.email) {
          const userContact = u.phone || u.email;
          setContact(userContact);
          setMyContact(userContact);
        }
      }
    } catch (e) {}
  }, []);

  if (!isOpen) return null;

  // Handle local image file upload converting to Base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>, isReply: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File size must be less than 3MB');
      return;
    }

    const isVid = file.type.startsWith('video/');
    const reader = new FileReader();
    reader.onloadend = () => {
      if (isReply) {
        setReplyMedia(reader.result as string);
        setReplyMediaType(isVid ? 'video' : 'image');
      } else {
        setImageUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact.trim() || !description.trim()) {
      setError('Please provide your contact number/email and issue description.');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      customer_phone: contact.trim(),
      customer_email: contact.includes('@') ? contact.trim() : '',
      category: category,
      issue_text: description.trim(),
      image_url: imageUrl,
      status: 'OPEN',
      priority: category.includes('Damaged') || category.includes('Payment') ? 'HIGH' : 'MEDIUM',
    };

    try {
      const res = await axios.post(`${API_URL}/api/v1/support/tickets`, payload);
      const created = res.data?.ticket || res.data;
      setSuccessTicket(created);
      if (contact.trim()) {
        setMyContact(contact.trim());
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchMyTickets = async (contactStr?: string) => {
    const target = contactStr || myContact;
    if (!target.trim()) return;

    setFetchingTickets(true);
    try {
      const res = await axios.get(`${API_URL}/api/v1/user/tickets?contact=${encodeURIComponent(target.trim())}`);
      setMyTickets(res.data || []);
    } catch (err) {
      console.warn('Failed to fetch my tickets', err);
    } finally {
      setFetchingTickets(false);
    }
  };

  const handleOpenTicketThread = async (ticket: any) => {
    setSelectedTicket(ticket);
    const id = ticket.ticket_id || ticket.id || ticket._id;
    try {
      const res = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
      if (res.data) {
        setSelectedTicket(res.data);
      }
    } catch (e) {
      console.warn('Failed to refresh ticket detail', e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplying(true);
    const id = selectedTicket.ticket_id || selectedTicket.id || selectedTicket._id;
    try {
      const res = await axios.post(`${API_URL}/api/v1/tickets/${id}/reply`, {
        sender: 'customer',
        sender_name: 'Customer',
        message: replyMessage.trim(),
        media_url: replyMedia,
        media_type: replyMediaType,
      });

      setReplyMessage('');
      setReplyMedia('');

      // Refresh ticket details
      const updatedRes = await axios.get(`${API_URL}/api/v1/tickets/${id}`);
      if (updatedRes.data) {
        setSelectedTicket(updatedRes.data);
      }
      handleFetchMyTickets();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  const resetAndClose = () => {
    setCategory(ISSUE_CATEGORIES[0]);
    setDescription('');
    setImageUrl('');
    setSuccessTicket(null);
    setError('');
    setSelectedTicket(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-xl w-full rounded-3xl p-5 sm:p-7 shadow-2xl text-slate-900 relative space-y-5 max-h-[90vh] flex flex-col font-sans">
        
        {/* Top Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase text-slate-900 font-mono">Customer Help Desk</h2>
              <p className="text-[11px] text-slate-500 font-mono">2-Way Support Chat & Ticket Status</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        {!selectedTicket && (
          <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveTab('CREATE')}
              className={`flex-1 py-2.5 rounded-xl font-bold uppercase transition ${
                activeTab === 'CREATE' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Raise New Ticket
            </button>
            <button
              onClick={() => {
                setActiveTab('MY_TICKETS');
                if (myContact) handleFetchMyTickets(myContact);
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold uppercase transition flex items-center justify-center space-x-2 ${
                activeTab === 'MY_TICKETS' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Track My Tickets ({myTickets.length})</span>
            </button>
          </div>
        )}

        {/* TAB 1: CREATE NEW TICKET */}
        {activeTab === 'CREATE' && !selectedTicket && (
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {successTicket ? (
              <div className="py-8 text-center space-y-4 font-sans">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black uppercase text-slate-900">Support Ticket Logged</h3>
                <p className="text-xs text-slate-600">
                  Your ticket reference is <strong className="font-mono text-slate-900 text-sm">#{successTicket.ticket_id || 'TICK-REGISTERED'}</strong>. Our customer care team has been notified.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setSuccessTicket(null);
                      setActiveTab('MY_TICKETS');
                      handleFetchMyTickets(contact);
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
                  >
                    View Ticket Chat
                  </button>
                  <button
                    onClick={resetAndClose}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-2 font-mono">Select Issue Category</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ISSUE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`p-2.5 rounded-xl border text-left font-medium transition ${
                          category === cat
                            ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1 font-mono">Your Contact Phone / Email</label>
                  <input
                    type="text"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Enter phone number or email address"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold uppercase mb-1 font-mono">Issue Description</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your issue or request in detail..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-slate-700 font-bold uppercase font-mono">Attach Defect / Payment Screenshot (Optional)</label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-slate-800 cursor-pointer transition">
                      <Upload className="w-4 h-4 text-slate-700" />
                      <span>Choose File</span>
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleImageFile(e, false)} className="hidden" />
                    </label>
                    <span className="text-[11px] text-slate-500">Max 3MB (PNG, JPG, MP4)</span>
                  </div>

                  {imageUrl && (
                    <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                      <img src={imageUrl} alt="Uploaded Proof" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                      <span className="text-[11px] text-emerald-600 font-mono font-bold">Attachment added successfully</span>
                      <button type="button" onClick={() => setImageUrl('')} className="p-1 text-slate-400 hover:text-red-600 ml-auto">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg transition active:scale-98 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Logging Ticket...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Support Ticket</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: MY TICKETS LIST */}
        {activeTab === 'MY_TICKETS' && !selectedTicket && (
          <div className="overflow-y-auto flex-1 space-y-4 text-xs pr-1">
            <div className="flex gap-2">
              <input
                type="text"
                value={myContact}
                onChange={(e) => setMyContact(e.target.value)}
                placeholder="Enter phone or email to track tickets"
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={() => handleFetchMyTickets()}
                disabled={fetchingTickets}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl font-mono uppercase"
              >
                {fetchingTickets ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
              </button>
            </div>

            {myTickets.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-mono space-y-2">
                <MessageSquare className="w-8 h-8 mx-auto text-slate-300" />
                <p>{fetchingTickets ? 'Fetching active tickets...' : 'No tickets found for this contact number/email.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myTickets.map((t) => {
                  const isClosed = t.status === 'CLOSED';
                  return (
                    <div
                      key={t.ticket_id || t.id}
                      onClick={() => handleOpenTicketThread(t)}
                      className="p-4 border border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 transition cursor-pointer space-y-2"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-mono font-bold text-blue-600 text-sm">#{t.ticket_id}</span>
                          <span className="ml-2 text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold uppercase">
                            {t.category}
                          </span>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          t.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' :
                          t.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                          t.status === 'CLOSED' ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                          'bg-red-100 text-red-700 border border-red-300'
                        }`}>
                          {t.status}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 line-clamp-2">{t.issue_text}</p>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-200">
                        <span>{new Date(t.updated_at || t.created_at).toLocaleString()}</span>
                        <span className="text-blue-600 font-bold flex items-center space-x-1">
                          <span>Open Chat</span>
                          <MessageSquare className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TICKET CONVERSATION CHAT THREAD */}
        {selectedTicket && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3 font-sans">
            {/* Back Button & Header */}
            <div className="flex items-center justify-between bg-slate-100 p-3 rounded-2xl shrink-0">
              <button
                onClick={() => setSelectedTicket(null)}
                className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-700 hover:text-slate-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Tickets</span>
              </button>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-slate-900">Ticket #{selectedTicket.ticket_id}</span>
                <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                  selectedTicket.status === 'CLOSED' ? 'bg-slate-200 text-slate-600' : 'bg-blue-100 text-blue-700'
                }`}>
                  {selectedTicket.status}
                </span>
              </div>
            </div>

            {/* Closed Ticket Notice Banner */}
            {selectedTicket.status === 'CLOSED' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center space-x-2 text-amber-800 text-xs shrink-0 font-mono">
                <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Ticket Closed:</strong> This issue has been marked resolved/closed by support. Closed tickets automatically archive after 7 days.
                </span>
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              {(selectedTicket.messages || []).map((msg: any, idx: number) => {
                const isCustomer = msg.sender === 'customer';
                return (
                  <div
                    key={idx}
                    className={`flex flex-col max-w-[85%] ${isCustomer ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 font-mono mb-1">
                      {msg.sender_name || (isCustomer ? 'You' : 'Support Team')} • {new Date(msg.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                        isCustomer ? 'bg-slate-900 text-white rounded-br-none' : 'bg-white text-slate-900 border border-slate-200 shadow-sm rounded-bl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.message}</p>

                      {msg.media_url && (
                        <div className="pt-1">
                          {msg.media_type === 'video' ? (
                            <video src={msg.media_url} controls className="max-w-full max-h-48 rounded-xl border" />
                          ) : (
                            <img src={msg.media_url} alt="Attachment" className="max-w-full max-h-48 object-cover rounded-xl border" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Customer Reply Input (Disabled if CLOSED) */}
            {selectedTicket.status !== 'CLOSED' ? (
              <form onSubmit={handleSendReply} className="shrink-0 space-y-2 pt-1">
                {replyMedia && (
                  <div className="p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs font-mono">
                    <span className="text-[11px] text-emerald-600 font-bold">Media Attached</span>
                    <button type="button" onClick={() => setReplyMedia('')} className="text-slate-400 hover:text-red-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  {selectedTicket.allow_media_attachment ? (
                    <label className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-xl cursor-pointer transition shrink-0 flex items-center space-x-1" title="Attach Photo/Video (Unlocked by Support)">
                      <Upload className="w-4 h-4 text-emerald-600" />
                      <input type="file" accept="image/*,video/*" onChange={(e) => handleImageFile(e, true)} className="hidden" />
                    </label>
                  ) : null}

                  <input
                    type="text"
                    required
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Type your message reply..."
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />

                  <button
                    type="submit"
                    disabled={replying}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center space-x-1 shrink-0"
                  >
                    {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>

                {!selectedTicket.allow_media_attachment && (
                  <p className="text-[10px] text-slate-400 font-mono text-center">
                    📷 Photo/video attachments will unlock when requested by Support Team.
                  </p>
                )}
              </form>
            ) : (
              <div className="p-3 bg-slate-100 text-slate-500 rounded-xl text-center text-xs font-mono">
                Reply box locked. Create a new ticket if you need further support.
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
