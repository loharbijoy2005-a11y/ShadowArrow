'use client';

import React, { useState } from 'react';
import { HelpCircle, X, Upload, CheckCircle2, AlertCircle, Send, Loader2 } from 'lucide-react';
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
  const [category, setCategory] = useState(initialCategory || ISSUE_CATEGORIES[0]);
  const [contact, setContact] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle local image file upload converting to Base64
  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('Image file size must be less than 3MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
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
      setSuccessTicket(res.data?.ticket || res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setCategory(ISSUE_CATEGORIES[0]);
    setContact('');
    setDescription('');
    setImageUrl('');
    setSuccessTicket(null);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 relative space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-slate-900 font-mono">Customer Help Desk</h2>
              <p className="text-[11px] text-slate-500 font-mono">Priority Ticket Desk & Proof Upload</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-1.5 text-slate-400 hover:text-slate-900 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {successTicket ? (
          <div className="py-8 text-center space-y-4 font-sans">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black uppercase text-slate-900">Support Ticket Logged</h3>
            <p className="text-xs text-slate-600">
              Your ticket reference is <strong className="font-mono text-slate-900 text-sm">#{successTicket.ticket_id || 'TICK-REGISTERED'}</strong>. Our customer care team has been notified.
            </p>
            <button
              onClick={resetAndClose}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick-choice Issue Selection */}
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

            {/* Contact Input */}
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

            {/* Issue Description */}
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

            {/* Image Upload Field */}
            <div className="space-y-2">
              <label className="block text-slate-700 font-bold uppercase font-mono">Attach Defect / Payment Screenshot (Optional)</label>
              <div className="flex items-center space-x-3">
                <label className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 border border-slate-300 hover:bg-slate-200 rounded-xl text-slate-800 cursor-pointer transition">
                  <Upload className="w-4 h-4 text-slate-700" />
                  <span>Choose File</span>
                  <input type="file" accept="image/*" onChange={handleImageFile} className="hidden" />
                </label>
                <span className="text-[11px] text-slate-500">Max 3MB (PNG, JPG, WebP)</span>
              </div>

              {imageUrl && (
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                  <img src={imageUrl} alt="Uploaded Proof" className="w-12 h-12 object-cover rounded-lg border border-slate-300" />
                  <span className="text-[11px] text-emerald-600 font-mono font-bold">Photo attached successfully</span>
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
    </div>
  );
}
