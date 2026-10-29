import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  UtensilsCrossed, 
  Clock, 
  Tag, 
  Receipt, 
  ShieldCheck, 
  User as UserIcon, 
  Volume2, 
  VolumeX, 
  Menu as MenuIcon, 
  X, 
  Sparkles,
  ChevronDown,
  LogOut,
  MapPin
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    user, 
    logout, 
    setIsAuthModalOpen, 
    cartCount, 
    cartSubtotal,
    config,
    userOrders,
    soundEnabled,
    setSoundEnabled
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Active orders count for badge
  const activeOrdersCount = userOrders.filter(o => 
    ['placed', 'payment_pending', 'paid', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)
  ).length;

  const navigate = (page: any) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Campus Alert & Operating Hours Banner */}
      <div className="bg-emerald-900 text-white text-[11px] px-4 py-1.5 flex items-center justify-between font-medium">
        <div className="flex items-center gap-2 max-w-2xl truncate">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold text-emerald-200 uppercase tracking-wider text-[10px]">
            {config?.isOpen ? 'Canteen Open' : 'Kitchen Closed'}
          </span>
          <span className="hidden sm:inline text-emerald-300/60">•</span>
          <span className="hidden sm:inline truncate">
            {config?.location || 'Central Student Activity Block'}
          </span>
          <span className="text-emerald-300/60">•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-300" />
            {config?.openingTime} - {config?.closingTime}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-emerald-200 text-[10px] bg-emerald-800/80 px-2 py-0.5 rounded-full border border-emerald-700">
            ⚡ Avg wait: {config?.avgPreparationTimeMinutes || 12} mins
          </span>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute counter alerts' : 'Enable counter alerts'}
            className="text-emerald-200 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => navigate('home')} 
          className="flex items-center gap-3 cursor-pointer group select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
            <UtensilsCrossed className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-slate-900 text-lg leading-tight tracking-tight">
                Smart Campus
              </span>
              <span className="text-emerald-600 font-extrabold text-lg">Canteen</span>
            </div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none truncate max-w-[190px] sm:max-w-xs">
              {config?.collegeName || 'Apex Institute of Technology'}
            </p>
          </div>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-1 text-sm font-semibold text-slate-600">
          <button
            onClick={() => navigate('home')}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              currentPage === 'home' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('menu')}
            className={`px-3.5 py-2 rounded-xl transition-colors ${
              currentPage === 'menu' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => navigate('offers')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors ${
              currentPage === 'offers' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Offers & Combos</span>
          </button>
          <button
            onClick={() => navigate('my-orders')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-colors relative ${
              currentPage === 'my-orders' || currentPage === 'tracking' ? 'text-emerald-700 bg-emerald-50 font-bold' : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center -ml-0.5 animate-pulse">
                {activeOrdersCount}
              </span>
            )}
          </button>
          
          {/* Admin / Kitchen Counter Button */}
          <button
            onClick={() => navigate('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
              currentPage === 'admin' 
                ? 'bg-slate-900 text-white border-slate-900' 
                : 'text-slate-700 border-slate-200 hover:border-emerald-600 hover:text-emerald-700 bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kitchen & Admin</span>
          </button>
        </nav>

        {/* Right Section: Cart + User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Cart Pill */}
          <button
            onClick={() => navigate('cart')}
            className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-2xs ${
              cartCount > 0
                ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-900/15'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-amber-500 text-slate-950 font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline font-bold">
              {cartCount > 0 ? `₹${cartSubtotal.toFixed(0)}` : 'Cart'}
            </span>
          </button>

          {/* User Sign In / Profile dropdown */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden md:inline">{user.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-xs text-slate-900 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    {user.studentId && (
                      <p className="text-[10px] font-mono text-emerald-700 mt-0.5">
                        Roll: {user.studentId} • {user.department?.split(' ')[0]}
                      </p>
                    )}
                    <span className="inline-block mt-1.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold uppercase">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate('my-orders')}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold"
                  >
                    <Receipt className="w-4 h-4 text-slate-400" />
                    My Active Orders ({activeOrdersCount})
                  </button>

                  {(user.role === 'admin' || user.role === 'staff') && (
                    <button
                      onClick={() => navigate('admin')}
                      className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Live Kitchen Counter
                    </button>
                  )}

                  <div className="border-t border-slate-100 my-1" />

                  <button
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all shadow-2xs"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-5 space-y-1.5 animate-in slide-in-from-top-2">
          <button
            onClick={() => navigate('home')}
            className={`w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold ${
              currentPage === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigate('menu')}
            className={`w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold ${
              currentPage === 'menu' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => navigate('offers')}
            className={`w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold flex items-center justify-between ${
              currentPage === 'offers' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
            }`}
          >
            <span>Offers & Student Combos</span>
            <Tag className="w-4 h-4 text-amber-500" />
          </button>
          <button
            onClick={() => navigate('my-orders')}
            className={`w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold flex items-center justify-between ${
              currentPage === 'my-orders' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
            }`}
          >
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {activeOrdersCount} active
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('admin')}
            className={`w-full py-2.5 px-3 rounded-xl text-left text-sm font-bold flex items-center justify-between ${
              currentPage === 'admin' ? 'bg-slate-900 text-white' : 'text-slate-800 bg-slate-100'
            }`}
          >
            <span>Kitchen Counter & Admin</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      )}
    </header>
  );
};
