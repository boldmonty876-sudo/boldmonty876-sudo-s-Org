import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Tag, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  ArrowRight, 
  Flame, 
  Percent, 
  ShieldCheck,
  UtensilsCrossed 
} from 'lucide-react';
import { api } from '../services/api';
import type { Coupon } from '../types';

export const OffersPage: React.FC = () => {
  const { setCurrentPage, addToCart, menu, showToast, setAppliedCoupon, cartSubtotal } = useApp();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    api.getCoupons().then(setCoupons).catch(console.error);
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('Code Copied', `${code} copied to clipboard!`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleApplyDirect = async (c: Coupon) => {
    try {
      if (cartSubtotal < c.minOrder) {
        showToast('Min Order Notice', `Add items to cart to reach ₹${c.minOrder} to use ${c.code}`, 'info');
        setCurrentPage('menu');
        return;
      }
      const res = await api.validateCoupon(c.code, cartSubtotal);
      setAppliedCoupon({
        code: res.code,
        discount: res.discount,
        description: res.description
      });
      showToast('Coupon Applied! 🎉', `Applied ${res.code} to your cart!`, 'success');
      setCurrentPage('cart');
    } catch (err: any) {
      showToast('Coupon Notice', err.message || 'Cannot apply coupon yet.', 'warning');
    }
  };

  const campusCombos = [
    {
      id: 'combo-1',
      title: 'Quick Break Samosa & Kulhad Chai Combo',
      description: '2 Crispy Mumbai Samosa Pav with spicy chutney paired with authentic steaming ginger-cardamom kulhad chai.',
      comboPrice: 48,
      originalPrice: 53,
      savings: 'Save ₹5',
      items: ['Mumbai Style Samosa Pav (2 pcs)', 'Special Adrak Elaichi Chai (Kulhad)'],
      img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'combo-2',
      title: 'South Indian Power Breakfast Combo',
      description: 'Hot Butter Masala Dosa with sambar & coconut chutney plus chilled Cold Coffee with vanilla ice cream.',
      comboPrice: 105,
      originalPrice: 115,
      savings: 'Save ₹10',
      items: ['Butter Masala Dosa', 'Thick Cold Coffee with Vanilla Ice Cream'],
      img: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500&auto=format&fit=crop&q=80'
    },
    {
      id: 'combo-3',
      title: 'Hostel Night Study Energy Combo',
      description: 'Jumbo Veg Cheese Grilled Sandwich + Warm Walnut Chocolate Brownie with fudge drizzle.',
      comboPrice: 115,
      originalPrice: 125,
      savings: 'Save ₹10',
      items: ['Veg Cheese Grilled Sandwich (Jumbo)', 'Warm Walnut Chocolate Brownie'],
      img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80'
    }
  ];

  const handleAddCombo = (combo: typeof campusCombos[0]) => {
    let addedCount = 0;
    for (const name of combo.items) {
      const match = menu.find(m => m.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(m.name.toLowerCase()));
      if (match) {
        addToCart(match, []);
        addedCount++;
      }
    }
    showToast('Combo Added to Cart!', `${combo.title} added with student combo discount.`, 'success');
    setCurrentPage('cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Header */}
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Student Pocket Friendly Deals
        </span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
          Offers, Discounts & Meal Combos
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Special campus subsidies, first-year welcome coupons, and exam break power deals.
        </p>
      </div>

      {/* Coupons Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
          <Tag className="w-5 h-5 text-amber-500" />
          <span>Active Canteen Coupons</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map(coupon => (
            <div
              key={coupon.code}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono font-black text-emerald-800 text-lg tracking-wider bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {coupon.code}
                  </span>
                  <span className="text-xs font-black text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                    {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} FLAT`}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {coupon.description}
                </p>

                <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                  <p>• Min order: ₹{coupon.minOrder}</p>
                  {coupon.maxDiscount && <p>• Max discount: ₹{coupon.maxDiscount}</p>}
                  <p>• Valid till: {new Date(coupon.validUntil).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleCopy(coupon.code)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleApplyDirect(coupon)}
                  className="py-2 px-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Meal Combos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span>Curated Student Combos</span>
          </h2>
          <span className="text-xs text-slate-500">Pair & save money</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {campusCombos.map(combo => (
            <div
              key={combo.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={combo.img}
                  alt={combo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  {combo.savings}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {combo.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {combo.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-black text-slate-900">₹{combo.comboPrice}</span>
                    <span className="text-xs text-slate-400 line-through">₹{combo.originalPrice}</span>
                  </div>

                  <button
                    onClick={() => handleAddCombo(combo)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 flex items-center gap-1.5"
                  >
                    <span>Order Combo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
