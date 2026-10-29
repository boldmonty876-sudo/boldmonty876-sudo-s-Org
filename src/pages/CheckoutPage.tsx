import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  CreditCard, 
  MapPin, 
  Clock, 
  User as UserIcon, 
  Phone, 
  Mail, 
  CheckCircle2, 
  AlertCircle,
  QrCode,
  Banknote,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutPage: React.FC = () => {
  const { 
    cart, 
    cartSubtotal, 
    appliedCoupon, 
    config, 
    user, 
    setCurrentPage, 
    setActiveOrderId, 
    clearCart, 
    showToast,
    setIsAuthModalOpen
  } = useApp();

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [studentId, setStudentId] = useState(user?.studentId || 'AIT/2024/CS/104');
  const [department, setDepartment] = useState(user?.department || 'Computer Science');
  const [pickupCounter, setPickupCounter] = useState(config?.pickupCounters[0] || 'Counter 1 - Snacks & Quick Bites');
  const [pickupSlot, setPickupSlot] = useState(config?.pickupSlots[0]?.label || 'Immediate Kitchen Prep');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'upi_qr' | 'counter_cash'>('razorpay');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Financial calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * (config?.taxPercent || 5)) / 100).toFixed(2));
  const finalTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (cart.length === 0) {
      setCurrentPage('menu');
      return;
    }

    if (!name || !email) {
      setErrorMessage('Student name and institutional email are required.');
      return;
    }

    setIsProcessing(true);

    try {
      const studentPayload = {
        id: user?.id || 'guest-' + Date.now(),
        name,
        email,
        phone,
        studentId,
        department
      };

      if (paymentMethod === 'counter_cash') {
        // Direct Cash on Pickup order creation
        const res = await api.placeCashOrder({
          items: cart,
          couponCode: appliedCoupon?.code,
          pickupCounter,
          pickupSlot,
          specialInstructions,
          user: studentPayload
        });

        setActiveOrderId(res.order.id);
        clearCart();
        showToast('Order Placed!', `Token ${res.order.pickupToken} generated. Pay at pickup counter.`, 'success');
        setCurrentPage('confirmation');
        return;
      }

      // Razorpay Online Flow:
      // Step 1: Create secure order on backend
      const orderInit = await api.createPaymentOrder({
        items: cart,
        couponCode: appliedCoupon?.code,
        pickupCounter,
        pickupSlot,
        specialInstructions,
        user: studentPayload
      });

      // Step 2: Open Razorpay checkout if window.Razorpay exists and credentials configured
      if (typeof window.Razorpay === 'function' && config?.razorpayKeyId && !config.testMode) {
        const options = {
          key: orderInit.keyId,
          amount: orderInit.amount,
          currency: 'INR',
          name: config.collegeName,
          description: `Order ${orderInit.orderNumber} - Canteen Meal`,
          order_id: orderInit.razorpayOrderId,
          prefill: {
            name,
            email,
            contact: phone
          },
          theme: {
            color: '#15803d'
          },
          handler: async function (response: any) {
            try {
              // Server-side verification
              const verifyRes = await api.verifyPayment({
                orderId: orderInit.orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });

              setActiveOrderId(verifyRes.order.id);
              clearCart();
              showToast('Payment Verified! 🎉', `Order ${verifyRes.order.orderNumber} placed successfully.`, 'success');
              setCurrentPage('confirmation');
            } catch (err: any) {
              setErrorMessage(err.message || 'Payment signature verification failed.');
            }
          },
          modal: {
            ondismiss: function () {
              setIsProcessing(false);
              showToast('Payment Cancelled', 'You can retry or select another payment method.', 'warning');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Developer Test Sandbox Mode:
        // Demonstrates the real cryptographic backend verification flow safely
        // Call backend server verification with test sandbox auto-approve
        const verifyRes = await api.verifyPayment({
          orderId: orderInit.orderId,
          razorpayOrderId: orderInit.razorpayOrderId,
          razorpayPaymentId: 'pay_test_' + Math.random().toString(36).substr(2, 9),
          razorpaySignature: 'simulated_valid_signature_token',
          testModeAutoApprove: true
        });

        setActiveOrderId(verifyRes.order.id);
        clearCart();
        showToast('Payment Verified! 🎉', `Test Mode: Order ${verifyRes.order.orderNumber} verified by server.`, 'success');
        setCurrentPage('confirmation');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to place order. Please review your cart.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Checkout & Pickup Counter</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review counter station, pickup time slot, and complete digital payment
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-8">
        {/* Step 1: Student Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h3 className="font-extrabold text-sm text-slate-900">Student & Contact Details</h3>
            </div>
            {!user && (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                Sign In for Auto-Fill
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campus Email (for Receipt)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  placeholder="student@campus.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Student Roll Number</label>
              <input
                type="text"
                placeholder="AIT/2024/CS/104"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Phone (for Counter SMS)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Pickup Station & Time Slot */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Pickup Counter & Time Slot</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Designated Pickup Counter</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {config?.pickupCounters.map((counter, i) => {
                  const isSelected = pickupCounter === counter;
                  return (
                    <label
                      key={i}
                      onClick={() => setPickupCounter(counter)}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                      <span>{counter}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Pickup Time Slot</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {config?.pickupSlots.map(slot => {
                  const isSelected = pickupSlot === slot.label;
                  return (
                    <label
                      key={slot.id}
                      onClick={() => setPickupSlot(slot.label)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span>{slot.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {slot.currentBookings}/{slot.maxCapacity} orders
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Kitchen Instructions (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. please pack in paper bag, extra napkins"
                value={specialInstructions}
                onChange={e => setSpecialInstructions(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Payment Method */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="font-extrabold text-sm text-slate-900">Payment Gateway</h3>
          </div>

          <div className="space-y-3">
            {/* Razorpay Online */}
            <label
              onClick={() => setPaymentMethod('razorpay')}
              className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === 'razorpay'
                  ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Online Digital Payment (Razorpay)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    UPI (Google Pay, PhonePe, Paytm), Debit/Credit Cards & Net Banking
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                Fastest Pickup
              </span>
            </label>

            {/* Cash on Pickup (if enabled) */}
            {config?.allowCashOnPickup && (
              <label
                onClick={() => setPaymentMethod('counter_cash')}
                className={`p-4 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'counter_cash'
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">
                      Cash on Food Pickup
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Pay cash directly to canteen staff when presenting your order token
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Final Submit & Pay Button */}
        <div className="bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div>
            <span className="text-xs text-slate-400 uppercase tracking-wider">Payable Total</span>
            <div className="text-3xl font-black text-amber-400">
              ₹{finalTotal.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {cart.reduce((s, i) => s + i.quantity, 0)} items • GST included
            </p>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            {isProcessing ? (
              <span>Verifying Payment...</span>
            ) : (
              <>
                <span>Pay & Place Order</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
