import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Bot,
  User as UserIcon,
  Heart,
  PackageCheck,
  ShoppingBag,
  Zap,
  CheckCircle2,
  LogOut,
  ChevronDown,
  Shield
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  user: User | null;
  pincode: string;
  deliveryDate: string;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenAi: () => void;
  onOpenAuth: () => void;
  onOpenOrders: () => void;
  onOpenProfile?: () => void;
  onLogout: () => void;
  onPincodeChange: (pincode: string) => void;
  onSearch: (query: string, category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  wishlistCount,
  user,
  pincode,
  deliveryDate,
  onOpenCart,
  onOpenWishlist,
  onOpenAi,
  onOpenAuth,
  onOpenOrders,
  onOpenProfile,
  onLogout,
  onPincodeChange,
  onSearch
}) => {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [isEditingPincode, setIsEditingPincode] = useState(false);
  const [pinInput, setPinInput] = useState(pincode);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim(), category);
  };

  const handlePincodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{6}$/.test(pinInput)) {
      onPincodeChange(pinInput);
      setIsEditingPincode(false);
    } else {
      alert('Please enter a valid 6-digit Indian Pincode.');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 shadow-2xl">
      {/* TOP ANNOUNCEMENT MARQUEE BANNER */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white text-xs font-semibold py-1.5 px-4 overflow-hidden relative shadow-md flex items-center justify-between">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
            ⚡ SHADOW ARROW MEGA FESTIVAL SALE: Prime Free Delivery on orders above ₹999!
          </span>
          <span className="flex items-center gap-2">
            🔥 USE CODE <span className="bg-black/30 px-2 py-0.5 rounded text-yellow-300 font-mono">SHADOW10</span> FOR INSTANT DISCOUNT
          </span>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            3 - 4 Days Express Delivery Across India
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3 lg:gap-6">

          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSearch('', 'all')}>
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-yellow-400 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] flex items-center justify-center transform hover:scale-105 transition">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <span className="font-black text-amber-400 text-lg tracking-tighter">SA</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tight text-white">
                  SHADOW <span className="text-amber-500">ARROW</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prime Marketplace</p>
            </div>
          </div>

          {/* DYNAMIC PINCODE / LOCATION SELECTOR */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 px-3 py-2 rounded-xl text-xs text-slate-300 transition">
            <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0" />
            {isEditingPincode ? (
              <form onSubmit={handlePincodeSubmit} className="flex items-center gap-1">
                <input
                  type="text"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Pincode"
                  className="w-16 bg-slate-950 border border-slate-700 text-xs px-1.5 py-0.5 rounded text-white outline-none focus:border-amber-500"
                  maxLength={6}
                  autoFocus
                />
                <button type="submit" className="text-amber-400 font-bold hover:underline text-[10px]">
                  Save
                </button>
              </form>
            ) : (
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setIsEditingPincode(true)}>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Deliver to</span>
                  <span className="font-bold text-white">{pincode} • ({deliveryDate})</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
            )}
          </div>

          {/* SEARCH BAR */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-lg items-center bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden focus-within:border-amber-500 transition shadow-inner">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-950 text-slate-400 text-xs font-semibold px-3 py-2.5 border-r border-slate-800 outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              <option value="gaming">Esports & Gaming</option>
              <option value="fashion">Cyberpunk Techwear</option>
              <option value="electronics">Electronics & Display</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search mechanical keyboards, 2K monitors, techwear..."
              className="flex-1 bg-transparent px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none"
            />
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-4 py-2.5 text-xs font-black transition flex items-center justify-center">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* ACTION BUTTONS */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* SHADOW AI BOT TRIGGER BUTTON */}
            <button
              onClick={onOpenAi}
              className="relative bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.4)] transition transform hover:scale-105"
            >
              <Bot className="w-4 h-4 animate-spin-slow" />
              <span className="hidden sm:inline">Shadow AI</span>
            </button>

            {/* USER PROFILE DROPDOWN / SIGN IN */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs font-bold text-white hover:border-amber-500 transition"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:inline">{user.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <div className="font-bold text-white text-sm truncate">{user.name}</div>
                      <div className="text-slate-400 text-[11px] font-mono truncate">
                        {user.phone ? `+91 ${user.phone}` : (user.email && !user.email.includes('@shadowarrow.com') ? user.email : 'Mobile Account')}
                      </div>
                    </div>
                    {onOpenProfile && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full px-4 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2 text-left"
                      >
                        <UserIcon className="w-4 h-4 text-amber-400" /> Edit Profile & Address
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenOrders();
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800 text-slate-300 flex items-center gap-2 text-left"
                    >
                      <PackageCheck className="w-4 h-4 text-emerald-400" /> My Orders
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full px-4 py-2 hover:bg-slate-800 text-red-400 flex items-center gap-2 text-left border-t border-slate-800"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="p-2 sm:px-3 sm:py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-transparent hover:border-slate-800 transition"
              >
                <UserIcon className="w-4 h-4 text-amber-500" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            )}



            {/* RETURNS & ORDERS TAB */}
            <button
              onClick={onOpenOrders}
              className="hidden sm:flex p-2 sm:px-3 sm:py-2 text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl text-xs font-bold items-center gap-1.5 transition"
            >
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline">Orders</span>
            </button>

            {/* WISHLIST */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 text-slate-300 hover:text-red-400 hover:bg-slate-900 rounded-xl transition"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* CART DRAWER BUTTON */}
            <button
              onClick={onOpenCart}
              className="relative bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 sm:px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition transform hover:scale-105"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-slate-950 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full border border-amber-500/40">
                {cartCount}
              </span>
            </button>

          </div>

        </div>

        {/* MOBILE SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className="mt-2.5 lg:hidden flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Shadow products..."
            className="flex-1 bg-transparent px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
          />
          <button type="submit" className="bg-amber-500 text-slate-950 px-3 py-2 text-xs font-bold">
            <Search className="w-4 h-4" />
          </button>
        </form>

      </div>
    </header>
  );
};
