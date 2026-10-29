import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Sparkles, 
  AlertCircle, 
  Receipt, 
  RotateCcw, 
  XCircle,
  QrCode,
  BellRing
} from 'lucide-react';
import { api } from '../services/api';
import type { OrderStatus } from '../types';

export const OrderTrackingPage: React.FC = () => {
  const { 
    activeOrderId, 
    userOrders, 
    setCurrentPage, 
    setViewReceiptOrder, 
    showToast,
    addToCart,
    menu
  } = useApp();

  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const order = userOrders.find(o => o.id === activeOrderId) || userOrders[0];

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800">No Active Order Selected</h2>
        <p className="text-xs text-slate-500 mt-1">Check your orders list to track kitchen progress.</p>
        <button
          onClick={() => setCurrentPage('my-orders')}
          className="mt-4 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          View My Orders
        </button>
      </div>
    );
  }

  const steps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'placed', label: 'Order Placed', desc: 'Received in canteen system' },
    { key: 'paid', label: 'Payment Confirmed', desc: 'Verified via Razorpay' },
    { key: 'accepted', label: 'Accepted by Canteen', desc: 'Kitchen queued preparation' },
    { key: 'preparing', label: 'Preparing', desc: 'Cooks are assembling your items' },
    { key: 'ready', label: 'Ready for Pickup', desc: 'Piping hot at counter' },
    { key: 'collected', label: 'Collected', desc: 'Enjoy your campus meal!' }
  ];

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
      case 'payment_pending':
        return 0;
      case 'paid':
        return 1;
      case 'accepted':
        return 2;
      case 'preparing':
        return 3;
      case 'ready':
        return 4;
      case 'collected':
        return 5;
      default:
        return -1;
    }
  };

  const currentStepIdx = getStepIndex(order.orderStatus);
  const isTerminal = order.orderStatus === 'cancelled' || order.orderStatus === 'rejected';
  const canCancel = ['placed', 'payment_pending', 'paid'].includes(order.orderStatus);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    try {
      await api.cancelOrder(order.id, cancelReason || 'Cancelled by student');
      showToast('Order Cancelled', 'Your order was cancelled before kitchen prep.', 'info');
      setShowCancelDialog(false);
    } catch (err: any) {
      showToast('Cancellation Failed', err.message || 'Cannot cancel order at this stage.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleReorder = () => {
    for (const snap of order.items) {
      const original = menu.find(m => m.id === snap.menuItemId);
      if (original) {
        addToCart(original, snap.selectedCustomizations || []);
      }
    }
    showToast('Items Added to Cart', 'Reordered items added.', 'success');
    setCurrentPage('cart');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Live Kitchen Tracking
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Order {order.orderNumber}
          </h1>
          <p className="text-xs text-slate-500">
            Placed on {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {order.items.reduce((s, i) => s + i.quantity, 0)} items
          </p>
        </div>

        {/* Big Pickup Token Badge */}
        <div className="bg-emerald-950 text-white rounded-2xl p-4 text-center border border-emerald-800 shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 block">
            Pickup Token
          </span>
          <span className="text-3xl font-black text-amber-400 font-mono tracking-wider">
            {order.pickupToken}
          </span>
        </div>
      </div>

      {/* Big Ready Banner if status === 'ready' */}
      {order.orderStatus === 'ready' && (
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4 animate-bounce duration-1000">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-800 flex items-center justify-center shrink-0 shadow-md">
              <BellRing className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Your Food is Ready!</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                Head to <span className="font-bold underline">{order.pickupCounter}</span> now and show token <span className="font-black text-amber-300">{order.pickupToken}</span>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setViewReceiptOrder(order)}
            className="px-4 py-2 bg-white text-emerald-900 rounded-xl text-xs font-bold hover:bg-emerald-50 transition-colors shadow-sm shrink-0"
          >
            Show QR
          </button>
        </div>
      )}

      {/* Terminal Cancelled / Rejected notice */}
      {isTerminal && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">
              Order {order.orderStatus === 'cancelled' ? 'Cancelled' : 'Rejected by Canteen'}
            </h4>
            <p className="mt-0.5 text-rose-700">
              {order.cancellationReason || order.rejectionReason || 'This order was stopped before completion.'}
            </p>
          </div>
        </div>
      )}

      {/* Live Timeline Tracker */}
      {!isTerminal && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">Preparation Progress</h3>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Updates Enabled</span>
            </span>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {steps.map((st, idx) => {
              const isDone = currentStepIdx > idx;
              const isCurrent = currentStepIdx === idx;

              return (
                <div key={st.key} className="relative flex items-start gap-4">
                  <div 
                    className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-white transition-all ${
                      isDone 
                        ? 'bg-emerald-600 ring-4 ring-emerald-100' 
                        : isCurrent 
                        ? 'bg-amber-500 ring-4 ring-amber-100 scale-110' 
                        : 'bg-slate-200'
                    }`}
                  >
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                    {isCurrent && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div>
                    <h4 className={`text-sm font-bold leading-tight ${
                      isCurrent ? 'text-amber-600 text-base' : isDone ? 'text-slate-900' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Counter & Order Details */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Pickup Counter & Time Slot</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Designated Station</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span>{order.pickupCounter}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Selected Break Slot</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{order.pickupSlot || 'Immediate Kitchen Prep'}</span>
            </div>
          </div>
        </div>

        {/* Ordered Items list */}
        <div className="pt-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Items in this order
          </span>
          <div className="divide-y divide-slate-100 text-xs">
            {order.items.map((item, idx) => (
              <div key={idx} className="py-2 flex justify-between">
                <div>
                  <span className="font-semibold text-slate-800">{item.quantity}x {item.name}</span>
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <p className="text-[10px] text-slate-400">
                      {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                    </p>
                  )}
                </div>
                <span className="font-bold text-slate-900">₹{item.itemTotalPrice}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewReceiptOrder(order)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <Receipt className="w-4 h-4 text-slate-500" />
            <span>View Receipt & QR</span>
          </button>
          <button
            onClick={handleReorder}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-slate-500" />
            <span>Reorder Items</span>
          </button>
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 underline"
          >
            Cancel Order
          </button>
        )}
      </div>

      {/* Cancel Order Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 border border-slate-100 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900">Cancel this canteen order?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You can only cancel before the kitchen starts preparation. Any online payments will be refunded to your source account.
            </p>
            <input
              type="text"
              placeholder="Reason (e.g. class rescheduled)"
              value={cancelReason}
              onChange={e => setCancelReason(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-xl"
            />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
