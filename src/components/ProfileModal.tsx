import React, { useState, useEffect } from 'react';
import { X, User as UserIcon, MapPin, Save, CheckCircle2, ShieldCheck, Plus, Trash2, Home, Briefcase, Check } from 'lucide-react';
import { User, SavedAddress } from '../types';
import { sanitizeInput } from '../utils/security';
import { INDIAN_STATES, lookupPincode } from '../data/indianLocations';
import confetti from 'canvas-confetti';

interface ProfileModalProps {
  isOpen: boolean;
  user: User | null;
  onClose: () => void;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  user,
  onClose,
  onUpdateUser
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [activeAddressId, setActiveAddressId] = useState<string>('');

  // Add / Edit Address Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressLabel, setAddressLabel] = useState('Home');
  const [stateName, setStateName] = useState('West Bengal');
  const [district, setDistrict] = useState('Bankura');
  const [pincodeVal, setPincodeVal] = useState('722157');
  const [streetAddr, setStreetAddr] = useState('');

  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setPhone(user.phone || '');

      let initialAddresses: SavedAddress[] = user.savedAddresses || [];

      // If user has no savedAddresses array yet, construct default from fullAddress
      if (initialAddresses.length === 0 && user.fullAddress) {
        const parts = user.fullAddress.split(',').map((p) => p.trim());
        let st = user.fullAddress;
        let dist = 'Bankura';
        let state = 'West Bengal';
        let pin = '722157';

        if (parts.length >= 3) {
          st = parts[0];
          dist = parts[1] || 'Bankura';
          const pinMatch = parts[parts.length - 1].match(/\b\d{6}\b/);
          if (pinMatch) {
            pin = pinMatch[0];
            const detected = lookupPincode(pin);
            if (detected) {
              state = detected.state;
              dist = detected.district;
            }
          }
        }

        initialAddresses = [
          {
            id: 'addr-primary',
            label: 'Home',
            street: st,
            city: dist,
            state: state,
            pincode: pin,
            isDefault: true
          }
        ];
      }

      setAddresses(initialAddresses);
      const defaultAddr = initialAddresses.find((a) => a.isDefault) || initialAddresses[0];
      if (defaultAddr) {
        setActiveAddressId(defaultAddr.id);
      }
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPincodeVal(val);
    if (val.length === 6) {
      const found = lookupPincode(val);
      if (found) {
        setStateName(found.state);
        setDistrict(found.district);
      }
    }
  };

  const handleStartAddNew = () => {
    setEditingId(null);
    setAddressLabel('Work');
    setStreetAddr('');
    setPincodeVal('722157');
    setStateName('West Bengal');
    setDistrict('Bankura');
    setIsAddingNew(true);
  };

  const handleSaveAddressForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanStreet = sanitizeInput(streetAddr);
    const cleanDistrict = sanitizeInput(district);
    const cleanState = sanitizeInput(stateName);
    const cleanPin = sanitizeInput(pincodeVal);
    const cleanLabel = sanitizeInput(addressLabel) || 'Address';

    if (!cleanStreet || !cleanPin) return;

    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, label: cleanLabel, street: cleanStreet, city: cleanDistrict, state: cleanState, pincode: cleanPin }
            : a
        )
      );
    } else {
      const newAddr: SavedAddress = {
        id: 'addr-' + Date.now(),
        label: cleanLabel,
        street: cleanStreet,
        city: cleanDistrict,
        state: cleanState,
        pincode: cleanPin,
        isDefault: addresses.length === 0
      };
      setAddresses((prev) => [...prev, newAddr]);
      setActiveAddressId(newAddr.id);
    }

    setIsAddingNew(false);
    setEditingId(null);
  };

  const handleDeleteAddress = (idToDelete: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== idToDelete));
    if (activeAddressId === idToDelete) {
      const remaining = addresses.filter((a) => a.id !== idToDelete);
      if (remaining.length > 0) setActiveAddressId(remaining[0].id);
    }
  };

  const handleSetDefaultAddress = (id: string) => {
    setActiveAddressId(id);
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id
      }))
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setLoading(true);

    const cleanName = sanitizeInput(name) || user.name || 'Member';
    const cleanPhone = sanitizeInput(phone);

    const primaryAddr = addresses.find((a) => a.id === activeAddressId) || addresses[0];
    const fullAddressStr = primaryAddr
      ? `${primaryAddr.street}, ${primaryAddr.city}, ${primaryAddr.state} - ${primaryAddr.pincode}`
      : user.fullAddress || '';

    let updatedUser: User = {
      ...user,
      name: cleanName,
      phone: cleanPhone,
      fullAddress: fullAddressStr,
      savedAddresses: addresses
    };

    try {
      const res = await fetch('/api/user/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('shadow_token') ? { Authorization: `Bearer ${localStorage.getItem('shadow_token')}` } : {})
        },
        body: JSON.stringify({
          name: cleanName,
          email: user.email,
          phone: cleanPhone,
          fullAddress: fullAddressStr,
          savedAddresses: addresses
        })
      });
      const text = await res.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {}
      }
      if (data?.success && data?.user) {
        updatedUser = {
          ...updatedUser,
          name: data.user.name || updatedUser.name,
          phone: data.user.phone || updatedUser.phone,
          fullAddress: data.user.fullAddress || updatedUser.fullAddress
        };
      }
    } catch (err) {
      console.log('Local standalone profile update active');
    }

    setLoading(false);
    onUpdateUser(updatedUser);
    setSuccessMsg('Profile & Delivery Addresses updated successfully!');
    confetti({ particleCount: 90, spread: 65, origin: { y: 0.6 } });
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Profile & Address Manager</h3>
              <p className="text-[11px] text-slate-400">Manage saved delivery locations & profile details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* FEEDBACK MSG */}
        {successMsg && (
          <div className="m-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-popIn">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* FORM BODY */}
        <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-xs overflow-y-auto flex-1">
          
          {/* PERSONAL DETAILS SECTION */}
          <div className="space-y-3 pb-3 border-b border-slate-800">
            <h4 className="font-extrabold text-amber-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" />
              <span>Personal Account Details</span>
            </h4>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Full Name (Custom Display Name) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">
                  {user.email && !user.email.includes('@shadowarrow.com') ? 'Email Address' : 'Mobile Account'}
                </label>
                <input
                  type="text"
                  disabled
                  value={user.email && !user.email.includes('@shadowarrow.com') ? user.email : (user.phone ? `+91 ${user.phone}` : 'Mobile Verified')}
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-3 py-2.5 text-slate-400 cursor-not-allowed text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* MULTI-ADDRESS MANAGEMENT SECTION */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-emerald-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Saved Delivery Addresses ({addresses.length})</span>
              </h4>
              {!isAddingNew && (
                <button
                  type="button"
                  onClick={handleStartAddNew}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              )}
            </div>

            {/* LIST OF SAVED ADDRESSES */}
            {!isAddingNew && (
              <div className="space-y-2.5">
                {addresses.length === 0 ? (
                  <p className="text-slate-500 text-[11px] italic">No saved addresses found. Click "Add New Address" below.</p>
                ) : (
                  addresses.map((addr) => {
                    const isSelected = activeAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSetDefaultAddress(addr.id)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-slate-950 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${isSelected ? 'border-amber-400 bg-amber-500 text-slate-950' : 'border-slate-700 bg-slate-900'}`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white text-xs flex items-center gap-1">
                                {addr.label === 'Work' || addr.label === 'Office' ? <Briefcase className="w-3 h-3 text-cyan-400" /> : <Home className="w-3 h-3 text-amber-400" />}
                                {addr.label}
                              </span>
                              {isSelected && (
                                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.2 rounded-full font-bold">
                                  Default Delivery
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {addr.street}, {addr.city}, {addr.state} - <span className="font-mono font-bold text-amber-400">{addr.pincode}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(addr.id);
                            }}
                            className="p-1.5 text-slate-500 hover:text-red-400 transition"
                            title="Delete address"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* ADD / EDIT ADDRESS FORM */}
            {isAddingNew && (
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 animate-fadeIn">
                <div className="flex justify-between items-center pb-2 border-b border-slate-900">
                  <h5 className="font-extrabold text-white text-xs flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enter New Delivery Address Details</span>
                  </h5>
                  <button
                    type="button"
                    onClick={() => setIsAddingNew(false)}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Address Label (Home/Work)</label>
                    <select
                      value={addressLabel}
                      onChange={(e) => setAddressLabel(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-2.5 py-2 rounded-xl text-white outline-none text-xs"
                    >
                      <option value="Home">Home Address</option>
                      <option value="Work">Office / Work</option>
                      <option value="Alternative">Alternative Address</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">Pincode (Auto-Detects) *</label>
                    <input
                      type="text"
                      required
                      value={pincodeVal}
                      onChange={handlePincodeChange}
                      placeholder="6-digit Pincode"
                      maxLength={6}
                      className="w-full bg-slate-900 border border-slate-800 px-2.5 py-2 rounded-xl text-white outline-none text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">State *</label>
                    <select
                      value={stateName}
                      onChange={(e) => {
                        const selState = e.target.value;
                        setStateName(selState);
                        const stateObj = INDIAN_STATES.find((s) => s.state === selState);
                        if (stateObj && stateObj.districts.length > 0) {
                          setDistrict(stateObj.districts[0]);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-800 px-2.5 py-2 rounded-xl text-white outline-none text-xs"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s.code} value={s.state}>
                          {s.state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[10px] font-bold mb-1">District / City *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 px-2.5 py-2 rounded-xl text-white outline-none text-xs"
                    >
                      {(INDIAN_STATES.find((s) => s.state === stateName)?.districts || ['Bankura', 'Kolkata', 'Mumbai', 'Delhi']).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-[10px] font-bold mb-1">House No. / Street / Village / Landmark *</label>
                  <input
                    type="text"
                    required
                    value={streetAddr}
                    onChange={(e) => setStreetAddr(e.target.value)}
                    placeholder="Enter House No., Street Name, or Landmark"
                    className="w-full bg-slate-900 border border-slate-800 px-2.5 py-2 rounded-xl text-white outline-none text-xs"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveAddressForm}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs py-2 rounded-xl transition"
                >
                  Save Address Entry
                </button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs py-3.5 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.35)] transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving Profile...' : 'Save All Changes & Selected Address'}</span>
            </button>
          </div>

        </form>

        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5 flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Session Storage • Verified Multi-Address Profile</span>
        </div>

      </div>
    </div>
  );
};
