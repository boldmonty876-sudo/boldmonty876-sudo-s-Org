import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export const CartPage: React.FC = () => {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    clearCart, 
    cartSubtotal, 
    setCurrentPage, 
    config, 
    appliedCoupon, 
    setAppliedCoupon,
    showToast,
    menu
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const minOrder = config?.minOrderAmount || 20;
  const isBelowMin = cartSubtotal < minOrder;

  // Max prep time of items in cart
  const estimatedPrepTime = cart.reduce((max, item) => {
    const menuItem = menu.find(m => m.id === item.menuItemId);
    return Math.max(max, menuItem?.prepTimeMinutes || 10);
  }, 10);

  // Financial calculations
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const taxableAmount = Math.max(0, cartSubtotal - discountAmount);
  const taxAmount = Number(((taxableAmount * (config?.taxPercent || 5)) / 100).toFixed(2));
  const finalTotal = Number((taxableAmount + taxAmount).toFixed(2));

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await api.validateCoupon(code, cartSubtotal);
      setAppliedCoupon({
        code: res.code,
        discount: res.discount,
        description: res.description
      });
      setCouponInput('');
      showToast('Coupon Applied! 🎉', `Saved ₹${res.discount} with ${res.code}`, 'success');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
      showToast('Coupon Error', err.message || 'Invalid coupon', 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon Removed', 'Coupon discount cleared.', 'info');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-700 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          Looks like you haven't selected anything for your break yet. Choose from our fresh samosas, thalis, or iced shakes!
        </p>
        <button
          onClick={() => setCurrentPage('menu')}
          className="mt-6 px-6 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold shadow-md transition-all"
        >
          Explore Canteen Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Canteen Cart</h1>
          <p className="text-xs text-slate-500 mt-1">Review your items before proceeding to instant campus pickup</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xs overflow-hidden divide-y divide-slate-100">
            {cart.map(item => (
              <div key={item.cartItemId} className="p-4 sm:p-5 flex items-start justify-between gap-4">
                <div className="flex-1 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{item.name}</h4>
                  <div className="text-xs font-semibold text-emerald-700">
                    ₹{item.unitPrice} each
                  </div>

                  {/* Selected Customizations */}
                  {item.selectedCustomizations && item.selectedCustomizations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.selectedCustomizations.map((c, idx) => (
                        <span 
                          key={idx}
                          className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        >
                          {c.optionName} {c.priceDelta > 0 ? `(+₹${c.priceDelta})` : ''}
                        </span>
                      ))}
                    </div>
                  )}

                  {item.specialInstructions && (
                    <p className="text-[11px] text-amber-700 italic pt-1">
                      Note: "{item.specialInstructions}"
                    </p>
                  )}
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-600 hover:bg-white transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm text-slate-900">
                      ₹{item.itemTotalPrice.toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Prep Time & Pickup Guarantee Info */}
          <div className="bg-emerald-50/70 border border-emerald-200/60 rounded-2xl p-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 text-emerald-900 font-semibold">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Estimated Kitchen Prep Time: ~{estimatedPrepTime} minutes</span>
            </div>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
              Order Ahead
            </span>
          </div>
        </div>

        {/* Right Column: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-4">
          {/* Apply Coupon Box */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
              <Tag className="w-4 h-4 text-amber-500" />
              <span>Student Discount Coupon</span>
            </div>

            {appliedCoupon ? (
              <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{appliedCoupon.code} Applied</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-2"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. CAMPUS10)"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 uppercase font-mono"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading || !couponInput.trim()}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
                {couponError && (
                  <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
                )}

                {/* Quick 1-click popular coupons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('CAMPUS10')}
                    className="text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    + CAMPUS10 (10% off)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon('FRESHER20')}
                    className="text-[10px] font-mono font-bold bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded-md hover:bg-amber-100 transition-colors"
                  >
                    + FRESHER20 (20% off)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Breakdown */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs space-y-4">
            <h3 className="font-extrabold text-base text-slate-900">Payment Summary</h3>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="font-semibold text-slate-900">₹{cartSubtotal.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Student Coupon ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <span>GST & Service ({config?.taxPercent || 5}%)</span>
                </span>
                <span className="font-semibold text-slate-900">₹{taxAmount.toFixed(2)}</span>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-200 flex justify-between items-baseline">
                <div>
                  <span className="text-base font-black text-slate-900 block leading-tight">Total Payable</span>
                  <span className="text-[10px] text-slate-400">All campus canteen taxes included</span>
                </div>
                <span className="text-2xl font-black text-emerald-800">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {isBelowMin && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Minimum order of ₹{minOrder} required (add ₹{(minOrder - cartSubtotal).toFixed(2)} more).</span>
              </div>
            )}

            <button
              onClick={() => setCurrentPage('checkout')}
              disabled={isBelowMin}
              className="w-full py-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-black text-sm tracking-wide shadow-md shadow-emerald-900/15 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center text-slate-400 flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Razorpay Verified UPI & Card Processing</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
