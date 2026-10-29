import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  QrCode, 
  Receipt, 
  ArrowRight, 
  UtensilsCrossed,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const OrderConfirmationPage: React.FC = () => {
  const { 
    activeOrderId, 
    userOrders, 
    setCurrentPage, 
    setViewReceiptOrder, 
    config 
  } = useApp();

  const [qrUrl, setQrUrl] = useState<string>('');
  const order = userOrders.find(o => o.id === activeOrderId);

  useEffect(() => {
    // Launch celebratory campus confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    if (!order) return;
    const payload = JSON.stringify({
      orderNumber: order.orderNumber,
      token: order.pickupToken,
      canteen: config?.canteenName,
      total: order.total
    });
    QRCode.toDataURL(payload, { width: 200, margin: 1 })
      .then(url => setQrUrl(url))
      .catch(console.error);
  }, [order, config]);

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Order Placed</h2>
        <p className="text-xs text-slate-500 mt-1">Fetching your live campus token...</p>
        <button
          onClick={() => setCurrentPage('my-orders')}
          className="mt-4 px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
        >
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Success Badge */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Payment Confirmed • Kitchen Notified
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Your Food is Being Prepared!
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Skip the line. Just show your pickup code or scan this QR at the counter when your status turns green.
        </p>
      </div>

      {/* Prominent High-Visibility Order & Token Box */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-4 border border-emerald-800/50">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-300">
            Show at Pickup Counter
          </span>
          <div className="text-5xl font-black tracking-wider text-amber-400 my-2">
            {order.pickupToken}
          </div>
          <p className="text-xs font-semibold text-emerald-200">
            Order Reference: {order.orderNumber}
          </p>
        </div>

        {/* QR Code Container */}
        <div className="bg-white p-3 rounded-2xl inline-block shadow-md">
          {qrUrl ? (
            <img src={qrUrl} alt="Pickup QR Token" className="w-36 h-36 mx-auto object-contain" />
          ) : (
            <div className="w-36 h-36 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-xs">
              Loading QR...
            </div>
          )}
        </div>

        <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs text-emerald-100">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{order.pickupCounter}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
            <Clock className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
            <span>Slot: {order.pickupSlot || 'Immediate'}</span>
          </div>
        </div>
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-sm text-slate-900">Order Items Snapshot</h3>
          <span className="text-xs font-black text-emerald-800">Total Paid: ₹{order.total}</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {order.items.map((item, i) => (
            <div key={i} className="py-2 flex justify-between">
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

        {order.specialInstructions && (
          <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
            <strong>Cooking Note:</strong> "{order.specialInstructions}"
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setCurrentPage('tracking')}
          className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
        >
          <span>Track Order Live</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => setViewReceiptOrder(order)}
          className="w-full py-3.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-2xl font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2"
        >
          <Receipt className="w-4 h-4 text-slate-500" />
          <span>Print Official Receipt</span>
        </button>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => setCurrentPage('menu')}
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors"
        >
          ← Return to Canteen Menu
        </button>
      </div>
    </div>
  );
};
