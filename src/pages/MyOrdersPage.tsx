import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Receipt, 
  Clock, 
  MapPin, 
  ChevronRight, 
  RotateCcw, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag
} from 'lucide-react';
import type { Order } from '../types';

export const MyOrdersPage: React.FC = () => {
  const { 
    userOrders, 
    setCurrentPage, 
    setActiveOrderId, 
    setViewReceiptOrder, 
    addToCart, 
    menu, 
    showToast,
    user,
    setIsAuthModalOpen
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const activeOrders = userOrders.filter(o => 
    ['placed', 'payment_pending', 'paid', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)
  );

  const completedOrders = userOrders.filter(o => 
    ['collected', 'cancelled', 'rejected'].includes(o.orderStatus)
  );

  const displayedOrders = filter === 'active' 
    ? activeOrders 
    : filter === 'completed' 
    ? completedOrders 
    : userOrders;

  const handleTrack = (orderId: string) => {
    setActiveOrderId(orderId);
    setCurrentPage('tracking');
  };

  const handleReorder = (order: Order) => {
    let count = 0;
    for (const snap of order.items) {
      const original = menu.find(m => m.id === snap.menuItemId);
      if (original && original.isAvailable) {
        addToCart(original, snap.selectedCustomizations || []);
        count++;
      }
    }
    if (count > 0) {
      showToast('Items Added to Cart', `${count} items added to your cart.`, 'success');
      setCurrentPage('cart');
    } else {
      showToast('Items Sold Out', 'These items are currently out of stock.', 'warning');
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to View Orders</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Access your digital token history, live kitchen tracking, and downloadable campus receipts.
        </p>
        <button
          onClick={() => setIsAuthModalOpen(true)}
          className="mt-6 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          Sign In as Student
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Canteen Orders</h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as {user.name} ({user.studentId || user.email})
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({userOrders.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'active' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({activeOrders.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              filter === 'completed' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed ({completedOrders.length})
          </button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
          <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No orders in this view</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Order your meal before your break starts to skip the rush.
          </p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Explore Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedOrders.map(order => {
            const isActive = ['placed', 'payment_pending', 'paid', 'accepted', 'preparing', 'ready'].includes(order.orderStatus);
            const isReady = order.orderStatus === 'ready';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border p-5 sm:p-6 transition-all shadow-2xs hover:shadow-md space-y-4 ${
                  isReady ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-slate-900 text-sm">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      isReady 
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : order.orderStatus === 'preparing'
                        ? 'bg-amber-100 text-amber-900'
                        : order.orderStatus === 'collected'
                        ? 'bg-slate-100 text-slate-700'
                        : order.orderStatus === 'cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-emerald-50 text-emerald-800'
                    }`}>
                      {order.orderStatus.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Pickup Token */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pickup Token:
                    </span>
                    <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      {order.pickupToken}
                    </span>
                  </div>
                </div>

                {/* Counter & Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Ordered Items
                    </span>
                    <p className="font-medium text-slate-800">
                      {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Station & Slot
                    </span>
                    <p className="font-medium text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{order.pickupCounter}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{order.pickupSlot || 'Immediate'}</span>
                    </p>
                  </div>
                </div>

                {/* Footer Row: Total and Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs text-slate-500">Paid:</span>
                    <span className="text-base font-black text-slate-900">₹{order.total.toFixed(2)}</span>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">
                      ({order.paymentMethod})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewReceiptOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5 text-slate-500" />
                      <span>QR Receipt</span>
                    </button>

                    {isActive ? (
                      <button
                        onClick={() => handleTrack(order.id)}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-all shadow-2xs"
                      >
                        <span>Live Status</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3 text-slate-300" />
                        <span>Reorder</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
