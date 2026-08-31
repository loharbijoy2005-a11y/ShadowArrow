'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import MobileBottomNav from '@/components/MobileBottomNav';
import { User, Package, MapPin, LogOut, Plus, Trash2, Edit3, PhoneCall, FileText, Loader2, RefreshCw, Smartphone, Copy, Check, Truck, Download, Coins, Shield, Crown, Gem, MoreVertical, ShieldAlert, AlertTriangle, X, CheckCircle2, Info } from 'lucide-react';
import axios from 'axios';
import { downloadDirectTaxInvoicePDF } from '@/utils/downloadInvoicePDF';

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
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'REWARDS' | 'ADDRESSES'>('ORDERS');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);

  // Rewards Passbook State
  const [rewardsInfo, setRewardsInfo] = useState<any>(null);
  const [loadingRewards, setLoadingRewards] = useState(false);

  // Clone/Duplicate Profiles State
  const [clones, setClones] = useState<any[]>([]);
  const [loadingClones, setLoadingClones] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  // Profile Context Menu & Account Deletion State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeletionModal, setShowDeletionModal] = useState(false);
  const [deletionEmailInput, setDeletionEmailInput] = useState('');
  const [deletionReasonInput, setDeletionReasonInput] = useState('Privacy Concerns');
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [deletionSuccessMsg, setDeletionSuccessMsg] = useState('');
  const [deletionErrorMsg, setDeletionErrorMsg] = useState('');

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
      fetchRewardsInfo(u.phone, u.email);
    } catch (e) {
      router.push('/account/login');
    }
  }, []);

  const getAuthHeaders = () => {
    try {
      const savedUser = localStorage.getItem('shadow_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const token = u.token || u.Token;
        if (token) {
          return { headers: { Authorization: `Bearer ${token}` } };
        }
      }
    } catch (e) {
      console.warn('Error reading token for headers', e);
    }
    return {};
  };

  const syncLatestProfile = async (localUser: any) => {
    if (!localUser || (!localUser.email && !localUser.phone)) return;
    try {
      let queryUrl = `${API_URL}/api/v1/user/profile?`;
      if (localUser.email) queryUrl += `email=${encodeURIComponent(localUser.email)}&`;
      if (localUser.phone) queryUrl += `phone=${encodeURIComponent(localUser.phone)}`;

      const res = await axios.get(queryUrl, getAuthHeaders());
      if (res.data) {
        const merged = {
          ...localUser,
          ...res.data,
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
        fetchRewardsInfo(merged.phone, merged.email);
        if (merged.phone) {
          fetchCloneAccounts(merged.phone, merged.id || merged._id);
        }
      }
    } catch (err) {
      console.warn('MongoDB profile sync note:', err);
    }
  };

  const fetchCloneAccounts = async (phone: string, currentId: string) => {
    if (!phone) return;
    setLoadingClones(true);
    try {
      const res = await axios.get(
        `${API_URL}/api/v1/user/clones?phone=${encodeURIComponent(phone)}`,
        getAuthHeaders()
      );
      if (res.data && Array.isArray(res.data)) {
        const otherClones = res.data.filter((acc: any) => (acc.id || acc._id) !== currentId);
        setClones(otherClones);
      }
    } catch (err) {
      console.warn('Failed to fetch clone accounts', err);
    } finally {
      setLoadingClones(false);
    }
  };

  const handleSetDefaultAccount = async (targetId: string, targetPhone: string) => {
    if (!window.confirm('⚠️ WARNING: Setting this account as default will clear this phone number from your other account profiles, making this profile the ONLY active account for this number.\n\nAre you sure you want to proceed?')) {
      return;
    }
    setSettingDefaultId(targetId);
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/user/clones/set-default`,
        {
          default_id: targetId,
          phone: targetPhone,
        },
        getAuthHeaders()
      );
      if (res.data) {
        const mergedUser = {
          ...res.data,
          isLoggedIn: true,
          loginTime: new Date().toISOString(),
        };
        localStorage.setItem('shadow_user', JSON.stringify(mergedUser));
        setUser(mergedUser);
        window.location.reload();
      }
    } catch (err: any) {
      alert('Failed to set default account: ' + (err.response?.data?.error || err.message));
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleUnlinkAccount = async (targetId: string) => {
    if (!window.confirm('Are you sure you want to unlink this profile from this phone number? It will no longer show up here.')) {
      return;
    }
    setUnlinkingId(targetId);
    try {
      const res = await axios.post(
        `${API_URL}/api/v1/user/clones/unlink`,
        {
          account_id: targetId,
        },
        getAuthHeaders()
      );
      if (res.data) {
        if (user.phone) {
          fetchCloneAccounts(user.phone, user.id || user._id);
        }
      }
    } catch (err: any) {
      alert('Failed to unlink account: ' + (err.response?.data?.error || err.message));
    } finally {
      setUnlinkingId(null);
    }
  };

  const fetchRewardsInfo = async (phone: string, email: string) => {
    if (!phone && !email) {
      setRewardsInfo(null);
      return;
    }
    setLoadingRewards(true);
    try {
      let queryUrl = `${API_URL}/api/v1/user/rewards?`;
      if (email) queryUrl += `email=${encodeURIComponent(email)}&`;
      if (phone) queryUrl += `phone=${encodeURIComponent(phone)}`;

      const res = await axios.get(queryUrl, getAuthHeaders());
      if (res.data) setRewardsInfo(res.data);
    } catch (err) {
      console.warn('Failed to load rewards passbook in profile', err);
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleRequestDeletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (deletionEmailInput.trim().toLowerCase() !== (user.email || '').trim().toLowerCase()) {
      setDeletionErrorMsg('Entered email does not match your registered user account email.');
      return;
    }

    setDeletionSubmitting(true);
    setDeletionErrorMsg('');
    setDeletionSuccessMsg('');

    try {
      const res = await axios.post(
        `${API_URL}/api/v1/user/request-deletion`,
        {
          email: deletionEmailInput.trim(),
          reason: deletionReasonInput,
        },
        getAuthHeaders()
      );

      if (res.data) {
        setDeletionSuccessMsg(res.data.message || 'Account deletion request submitted successfully. Processing window is 48-72 hours.');
      }
    } catch (err: any) {
      setDeletionErrorMsg(err.response?.data?.error || 'Failed to submit account deletion request. Please try again.');
    } finally {
      setDeletionSubmitting(false);
    }
  };

  const fetchUserOrders = async (phone: string, email: string) => {
    if (!phone && !email) {
      setOrders([]);
      return;
    }
    setLoadingOrders(true);
    try {
      let queryUrl = `${API_URL}/api/v1/user/orders?`;
      if (phone) queryUrl += `phone=${encodeURIComponent(phone)}&`;
      if (email) queryUrl += `email=${encodeURIComponent(email)}`;

      const res = await axios.get(queryUrl, getAuthHeaders());
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
      const res = await axios.put(`${API_URL}/api/v1/user/profile`, updatedUser, getAuthHeaders());
      if (res.data) {
        const merged = { ...updatedUser, ...res.data };
        localStorage.setItem('shadow_user', JSON.stringify(merged));
        setUser(merged);
        setShowPhoneEdit(false);
        fetchUserOrders(merged.phone, merged.email);
        if (merged.phone) {
          fetchCloneAccounts(merged.phone, merged.id || merged._id);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update phone number. Please try again.';
      alert(errorMsg);
      setNewPhone(user.phone || '');
    } finally {
      setPhoneSaving(false);
    }
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
      axios.put(`${API_URL}/api/v1/user/profile`, { ...user, addresses: updated }, getAuthHeaders()).catch(() => {});
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

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 border border-slate-300 hover:border-red-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>

            {/* Discrete 3-Dots Context Menu (Deactivate / Request Account Deletion) */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl transition"
                title="Account Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-2xl z-30 p-2 text-xs font-mono animate-in fade-in zoom-in-95 space-y-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      alert('Account Deactivated. You can log back in anytime to reactivate your session.');
                    }}
                    className="w-full text-left px-3 py-2.5 text-slate-700 hover:bg-slate-100 rounded-xl flex items-center space-x-2 font-bold transition"
                  >
                    <User className="w-4 h-4 text-slate-500" />
                    <span>Deactivate Account</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setDeletionEmailInput(user.email || '');
                      setShowDeletionModal(true);
                    }}
                    className="w-full text-left px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-xl flex items-center space-x-2 font-bold transition"
                  >
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    <span>Request Account Deletion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clone/Duplicate Accounts Alert Section */}
        {clones.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-black text-amber-900 uppercase font-mono tracking-tight flex items-center space-x-2">
                  <span>Multiple Profiles Linked To This Number ({clones.length + 1} Accounts)</span>
                </h3>
                <p className="text-xs text-amber-700 mt-1 font-mono">
                  Is phone number ke sath multiple accounts linked hain. Please choose your main account to set as Default. Baki accounts se phone number unlink ho jayega:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              {/* Current Account Indicator */}
              <div className="bg-amber-100/60 border border-amber-300 p-4 rounded-2xl flex justify-between items-center shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-amber-950 font-mono uppercase">{user.name} (Current Profile)</span>
                    <span className="px-1.5 py-0.5 bg-amber-200 text-amber-900 text-[9px] font-bold rounded font-mono">ACTIVE</span>
                  </div>
                  <p className="text-[10px] text-amber-800 font-mono">Email: {user.email || 'Not Linked'}</p>
                  <p className="text-[10px] text-amber-800 font-mono flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600" /> Coin Balance: {user.coin_balance || 0}
                  </p>
                </div>
              </div>

              {/* Duplicate Clone Accounts */}
              {clones.map((cloneAcc) => {
                const cloneId = cloneAcc.id || cloneAcc._id;
                return (
                  <div key={cloneId} className="bg-white border border-slate-200 p-4 rounded-2xl flex justify-between items-center shadow-xs">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-800 font-mono uppercase">{cloneAcc.name || 'Customer'}</span>
                      <p className="text-[10px] text-slate-500 font-mono">Email: {cloneAcc.email || 'Not Linked'}</p>
                      <p className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                        <Coins className="w-3.5 h-3.5 text-amber-500" /> Coin Balance: {cloneAcc.coin_balance || 0}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSetDefaultAccount(cloneId, user.phone)}
                        disabled={settingDefaultId === cloneId || unlinkingId === cloneId}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {settingDefaultId === cloneId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span>Make Default</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleUnlinkAccount(cloneId)}
                        disabled={settingDefaultId === cloneId || unlinkingId === cloneId}
                        className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-mono font-bold uppercase transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {unlinkingId === cloneId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <span>Unlink</span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Switcher: MY ORDERS vs ARROWCOINS REWARDS vs ADDRESS BOOK */}
        <div className="flex flex-wrap gap-3 border-b border-slate-200 pb-4">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-5 py-3 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center space-x-2 ${
              activeTab === 'ORDERS'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('REWARDS')}
            className={`px-5 py-3 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center space-x-2 ${
              activeTab === 'REWARDS'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
            }`}
          >
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <span>ArrowCoins Passbook ({rewardsInfo?.coin_balance || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ADDRESSES')}
            className={`px-5 py-3 rounded-2xl text-xs font-mono font-bold uppercase transition flex items-center space-x-2 ${
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
                          <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase border ${
                            ord.order_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                            ord.order_status === 'SHIPPED' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' :
                            ord.order_status === 'PROCESSING' || ord.order_status === 'PACKED' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            ord.order_status === 'CANCELLED' || ord.order_status === 'REFUNDED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
                            'bg-blue-100 text-blue-800 border-blue-300'
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
                          {/* Txn ID — only show for ONLINE payment with actual razorpay_payment_id */}
                           {ord.payment_method !== 'COD' && (
                            <p className="text-slate-600 text-[11px] font-mono mt-0.5">
                              Txn ID:{' '}
                              {ord.razorpay_payment_id ? (
                                <strong className="text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 font-mono select-all">
                                  {ord.razorpay_payment_id}
                                </strong>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300 font-mono font-bold text-[10px] uppercase">
                                  PENDING
                                </span>
                              )}
                            </p>
                          )}
                          <p className="text-slate-500 text-[11px] mt-0.5">Shipping Address: {ord.shipping_address}</p>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={async () => {
                              const ordId = ord.order_id || ord.id || ord._id;
                              setDownloadingPdfId(ordId);
                              try {
                                await downloadDirectTaxInvoicePDF(ord);
                              } finally {
                                setDownloadingPdfId(null);
                              }
                            }}
                            disabled={downloadingPdfId === (ord.order_id || ord.id || ord._id)}
                            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center space-x-2 transition text-xs shadow-sm"
                            title="Download A4 GST Tax Invoice PDF Directly"
                          >
                            <Download className="w-4 h-4 text-blue-400" />
                            <span>
                              {downloadingPdfId === (ord.order_id || ord.id || ord._id)
                                ? 'Downloading Invoice PDF...'
                                : 'Download Tax Invoice PDF'}
                            </span>
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

        {/* ARROWCOINS REWARDS TAB */}
        {activeTab === 'REWARDS' && (
          <section className="space-y-6">
            {loadingRewards ? (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
                <p className="text-xs font-mono text-slate-500">Loading ArrowCoins ledger...</p>
              </div>
            ) : rewardsInfo ? (
              <>
                {/* Balance + Tier Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Active Balance Card */}
                  <div className="bg-slate-900 text-white p-7 rounded-3xl border border-slate-800 shadow-xl space-y-4 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">Total Active Balance</span>
                        <div className="flex items-baseline space-x-2 mt-2">
                          <span className="text-5xl font-black font-mono text-white">{rewardsInfo.coin_balance || 0}</span>
                          <span className="text-sm font-bold text-amber-400 font-mono">ArrowCoins</span>
                        </div>
                      </div>
                      <div className="p-3.5 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/40">
                        <Coins className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="pt-3 border-t border-slate-800 flex justify-between text-xs font-mono text-slate-400">
                      <span>Rate: <strong>1 Coin = ₹1 INR</strong></span>
                      <span>Max Cap: <strong>5% of Cart</strong></span>
                    </div>
                  </div>

                  {/* Tier + Progress Card */}
                  <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">12-Month Rolling Tier</span>
                        <h2 className="text-2xl font-black font-mono text-slate-900 mt-1 uppercase flex items-center space-x-2">
                          <span>{rewardsInfo.current_tier || 'SILVER'} TIER</span>
                        </h2>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-2xl">
                        {rewardsInfo.current_tier === 'DIAMOND' ? <Gem className="w-8 h-8 text-cyan-400" /> :
                         rewardsInfo.current_tier === 'GOLD' ? <Crown className="w-8 h-8 text-amber-400" /> :
                         <Shield className="w-8 h-8 text-slate-300" />}
                      </div>
                    </div>
                    <div className="space-y-2 border-t border-slate-100 pt-3 font-mono text-xs">
                      <div className="flex justify-between items-center text-slate-700 font-bold">
                        <span>
                          {rewardsInfo.next_tier === 'MAX_TIER' ? '👑 Highest Tier Achieved!' : `Progress to ${rewardsInfo.next_tier}`}
                        </span>
                        <span className="text-slate-500">
                          {rewardsInfo.delivered_orders_12m} / {rewardsInfo.current_tier === 'SILVER' ? 5 : rewardsInfo.current_tier === 'GOLD' ? 20 : '—'} Orders
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 rounded-full"
                          style={{ width: `${Math.min(100, rewardsInfo.progress_pct || 0)}%` }}
                        />
                      </div>
                      {(rewardsInfo.orders_needed_for_next_tier || 0) > 0 && (
                        <p className="text-[11px] text-slate-500">
                          Deliver <strong className="text-slate-900">{rewardsInfo.orders_needed_for_next_tier} more order(s)</strong> to unlock {rewardsInfo.next_tier} Tier.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transaction Ledger with Expiry Info */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-black text-base uppercase text-slate-900 font-mono flex items-center space-x-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      <span>ArrowCoins History ({rewardsInfo.ledger?.length || 0})</span>
                    </h3>
                  </div>

                  {(!rewardsInfo.ledger || rewardsInfo.ledger.length === 0) ? (
                    <div className="py-12 text-center text-slate-400 font-mono space-y-2 p-6">
                      <Coins className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs">No ArrowCoins transactions yet. Place your first order to start earning!</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs font-mono">
                        <thead>
                          <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                            <th className="p-3">Date</th>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Status</th>
                            <th className="p-3">Time Left / Info</th>
                            <th className="p-3 text-right">Coins</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rewardsInfo.ledger.map((tx: any, idx: number) => {
                            const isCredit = tx.type === 'CREDIT' || tx.type === 'REFUND';
                            const dateStr = new Date(tx.created_at || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                            const now = Date.now();

                            // Calculate time info
                            let timeInfo = '';
                            let timeColor = 'text-slate-400';
                            if (tx.status === 'PENDING' && tx.created_at) {
                              const activatesAt = new Date(tx.created_at).getTime() + 7 * 24 * 60 * 60 * 1000;
                              const daysLeft = Math.ceil((activatesAt - now) / (1000 * 60 * 60 * 24));
                              timeInfo = daysLeft > 0 ? `Active in ${daysLeft}d` : 'Activating soon';
                              timeColor = 'text-amber-600';
                            } else if (tx.status === 'ACTIVE' && tx.expires_at) {
                              const expiresAt = new Date(tx.expires_at).getTime();
                              const daysLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
                              if (daysLeft <= 30) {
                                timeInfo = `Expires in ${daysLeft}d ⚠️`;
                                timeColor = 'text-red-600 font-bold';
                              } else {
                                timeInfo = `Expires in ${daysLeft}d`;
                                timeColor = 'text-emerald-600';
                              }
                            } else if (tx.status === 'EXPIRED') {
                              timeInfo = 'Expired';
                              timeColor = 'text-red-400';
                            } else if (tx.status === 'USED') {
                              timeInfo = 'Used at checkout';
                              timeColor = 'text-slate-400';
                            }

                            return (
                              <tr key={tx.id || idx} className="hover:bg-slate-50 transition">
                                <td className="p-3 text-slate-600">{dateStr}</td>
                                <td className="p-3 font-bold text-slate-900">
                                  {tx.order_code ? `#${tx.order_code}` : 'N/A'}
                                </td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                    tx.type === 'REFUND' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                    'bg-rose-100 text-rose-800 border border-rose-300'
                                  }`}>
                                    {tx.type}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    tx.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                    tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                    tx.status === 'USED' ? 'bg-slate-200 text-slate-700' :
                                    tx.status === 'EXPIRED' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className={`p-3 text-[11px] ${timeColor}`}>{timeInfo || '—'}</td>
                                <td className={`p-3 text-right font-black text-sm ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {isCredit ? `+${tx.amount}` : `-${tx.amount}`}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-12 bg-white rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
                <Coins className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-mono text-slate-500">Could not load ArrowCoins data. Please try again.</p>
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
      {/* Account Deletion Request Modal (DPDP Act & GDPR Compliant) */}
      {showDeletionModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 max-w-lg w-full rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-900 space-y-5 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => {
                setShowDeletionModal(false);
                setDeletionErrorMsg('');
                setDeletionSuccessMsg('');
              }}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl border border-red-200">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase font-mono text-slate-900">Request Account Deletion</h3>
                <p className="text-[11px] text-slate-500 font-mono">DPDP Act 2023 & GDPR Privacy Right to Erasure</p>
              </div>
            </div>

            {/* Warning Callout */}
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-2">
              <div className="flex items-center space-x-2 font-bold uppercase font-mono text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Important Deletion Disclosure</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed text-[11px]">
                <li>Submitting this request will flag your account profile for permanent erasure.</li>
                <li>Your earned <strong>ArrowCoins balance</strong> and loyalty tier privileges will be forfeited.</li>
                <li>Requests cannot be submitted if you have active or in-transit orders.</li>
                <li>Financial tax records (GST Invoices) are legally retained under Indian taxation laws.</li>
              </ul>
            </div>

            {deletionSuccessMsg ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-mono space-y-3">
                <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Request Received & Ticketed</span>
                </div>
                <p className="text-slate-700 leading-relaxed">{deletionSuccessMsg}</p>
                <div className="p-3 bg-white rounded-xl border border-emerald-300 font-bold text-slate-900">
                  Standard Processing Window: 48 to 72 Hours
                </div>
                <button
                  onClick={() => {
                    setShowDeletionModal(false);
                    setDeletionSuccessMsg('');
                  }}
                  className="w-full py-2.5 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-800 transition"
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleRequestDeletionSubmit} className="space-y-4 text-xs">
                {deletionErrorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 font-mono text-xs flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>{deletionErrorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-800 mb-1 font-bold uppercase font-mono text-[11px]">
                    Verify Registered Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={deletionEmailInput}
                    onChange={(e) => setDeletionEmailInput(e.target.value)}
                    placeholder="Enter your registered account email"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    Must match your current account email: <strong className="text-slate-900">{user.email || 'None'}</strong>
                  </p>
                </div>

                <div>
                  <label htmlFor="deletion-reason" className="block text-slate-800 mb-1 font-bold uppercase font-mono text-[11px]">
                    Primary Reason for Deletion <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="deletion-reason"
                    value={deletionReasonInput}
                    onChange={(e) => setDeletionReasonInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                  >
                    <option value="Privacy Concerns">Privacy Concerns & Data Control</option>
                    <option value="Duplicate Account">Duplicate Account Created</option>
                    <option value="Order Issues">Order or Customer Service Issue</option>
                    <option value="Taking a Break">Taking a Break / No Longer Needed</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeletionModal(false);
                      setDeletionErrorMsg('');
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold uppercase font-mono tracking-wider hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={deletionSubmitting}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl font-bold uppercase font-mono tracking-wider shadow-md transition flex items-center justify-center space-x-2"
                  >
                    {deletionSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>Submit Deletion Request</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav onToggleAI={() => {}} />
    </div>
  );
}
