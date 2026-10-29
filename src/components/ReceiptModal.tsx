import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useApp } from '../context/AppContext';
import { X, Printer, CheckCircle2, ShieldCheck, MapPin, Clock } from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { viewReceiptOrder, setViewReceiptOrder, config } = useApp();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!viewReceiptOrder) {
      setQrDataUrl('');
      return;
    }

    // Generate secure QR payload containing token & order number for fast staff counter scan
    const qrPayload = JSON.stringify({
      orderNumber: viewReceiptOrder.orderNumber,
      token: viewReceiptOrder.pickupToken,
      canteen: config?.canteenName || 'Smart Campus Canteen',
      amount: viewReceiptOrder.total
    });

    QRCode.toDataURL(qrPayload, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR code', err));
  }, [viewReceiptOrder, config]);

  if (!viewReceiptOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar with Print & Close */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified Campus Food Token
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print / Save
            </button>
            <button
              onClick={() => setViewReceiptOrder(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-6 overflow-y-auto space-y-5 text-slate-800">
          {/* Institution Crest & Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-200">
            <div className="w-12 h-12 bg-emerald-800 text-white rounded-2xl mx-auto flex items-center justify-center text-xl font-black mb-2 shadow-sm">
              SCC
            </div>
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              {config?.collegeName || 'Apex Institute of Technology'}
            </h2>
            <p className="text-xs font-semibold text-emerald-700">
              {config?.canteenName || 'Central Campus Canteen'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {config?.location} • {config?.contactPhone}
            </p>
          </div>

          {/* Big Order Token Header */}
          <div className="bg-emerald-50/80 border border-emerald-200/60 rounded-2xl p-4 text-center">
            <span className="text-[11px] font-bold tracking-widest text-emerald-800 uppercase">
              Pickup Token Code
            </span>
            <div className="text-3xl font-black text-emerald-950 tracking-wider my-1">
              {viewReceiptOrder.pickupToken}
            </div>
            <div className="text-xs font-semibold text-emerald-800 flex items-center justify-center gap-2">
              <span>Order ID: {viewReceiptOrder.orderNumber}</span>
              <span>•</span>
              <span className="capitalize px-2 py-0.5 rounded-full bg-emerald-200/60 text-emerald-900 text-[10px]">
                {viewReceiptOrder.orderStatus.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* QR Code Section for Fast Staff Counter Scanner */}
          <div className="flex flex-col items-center justify-center py-2">
            {qrDataUrl ? (
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-900 shadow-xs inline-block">
                <img src={qrDataUrl} alt="Pickup QR Token" className="w-40 h-40 object-contain" />
              </div>
            ) : (
              <div className="w-40 h-40 bg-slate-100 rounded-2xl flex items-center justify-center text-xs text-slate-400">
                Generating QR...
              </div>
            )}
            <span className="text-[11px] text-slate-500 mt-2 font-medium">
              Show this QR code at the counter for instant food pickup
            </span>
          </div>

          {/* Pickup Details */}
          <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>Counter: {viewReceiptOrder.pickupCounter}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Slot: {viewReceiptOrder.pickupSlot || 'Immediate Kitchen Prep'}</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200 text-[11px]">
              <span>Student: {viewReceiptOrder.userName} ({viewReceiptOrder.studentId || 'N/A'})</span>
              <span>{new Date(viewReceiptOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* Itemized list */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Order Items</h4>
            <div className="divide-y divide-slate-100 text-xs">
              {viewReceiptOrder.items.map((item, idx) => (
                <div key={idx} className="py-2 flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">
                      {item.quantity}x {item.name}
                    </div>
                    {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                      <div className="text-[10px] text-slate-500">
                        {item.selectedCustomizations.map(c => c.optionName).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="font-bold text-slate-900">
                    ₹{item.itemTotalPrice.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className="border-t border-slate-200 pt-3 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>₹{viewReceiptOrder.subtotal.toFixed(2)}</span>
            </div>
            {viewReceiptOrder.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Student Discount ({viewReceiptOrder.couponCode})</span>
                <span>-₹{viewReceiptOrder.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span>₹{viewReceiptOrder.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-dashed border-slate-200">
              <span>Total Paid</span>
              <span className="text-emerald-800">₹{viewReceiptOrder.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Payment & Security Footer */}
          <div className="pt-2 text-[10px] text-center text-slate-400 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Payment Verified via {viewReceiptOrder.paymentMethod.toUpperCase()}</span>
            </div>
            <p>Txn Ref: {viewReceiptOrder.paymentDetails?.razorpayPaymentId || 'CASH_VERIFIED'}</p>
            <p>Smart Campus Canteen • Skip the queue, enjoy your break!</p>
          </div>
        </div>

        {/* Modal close bottom button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => setViewReceiptOrder(null)}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
