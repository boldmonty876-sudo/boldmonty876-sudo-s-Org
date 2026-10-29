import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  QrCode, 
  CreditCard, 
  Sparkles, 
  Flame, 
  Star, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { setCurrentPage, menu, config, setCustomizingItem, addToCart } = useApp();

  const categories = [
    { name: 'Breakfast', count: menu.filter(m => m.category === 'Breakfast').length, img: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=300&auto=format&fit=crop&q=80' },
    { name: 'Meals & Thalis', count: menu.filter(m => m.category === 'Meals & Thalis').length, img: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=300&auto=format&fit=crop&q=80' },
    { name: 'Snacks & Quick Bites', count: menu.filter(m => m.category === 'Snacks & Quick Bites').length, img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&auto=format&fit=crop&q=80' },
    { name: 'Fast Food', count: menu.filter(m => m.category === 'Fast Food').length, img: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop&q=80' },
    { name: 'Beverages', count: menu.filter(m => m.category === 'Beverages').length, img: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=300&auto=format&fit=crop&q=80' },
    { name: 'Desserts', count: menu.filter(m => m.category === 'Desserts').length, img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&auto=format&fit=crop&q=80' }
  ];

  const specials = menu.filter(m => m.tags.includes("Today's Special") || m.tags.includes('Bestseller')).slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-700/60 text-emerald-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span>Campus Food Ordering • Short Break Ready</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Skip the Queue. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-300 to-emerald-300">
                Enjoy Your Break.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
              Order your favorite canteen snacks, fresh thalis, and iced coffee straight from your phone before class ends. Walk straight to the pickup counter and collect with your token code or QR.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => setCurrentPage('menu')}
                className="flex items-center gap-2 px-7 py-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Order Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setCurrentPage('menu')}
                className="flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-2xl font-bold text-sm backdrop-blur-md transition-colors"
              >
                <span>Explore Full Menu</span>
              </button>
            </div>

            {/* Live Break Status & Metrics */}
            <div className="pt-6 grid grid-cols-3 gap-3 border-t border-emerald-800/60 max-w-lg">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-lg sm:text-xl">
                  <Zap className="w-4 h-4 fill-amber-400" />
                  <span>~12m</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Avg Prep Time</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-lg sm:text-xl">
                  <Clock className="w-4 h-4" />
                  <span>15 Mins</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Saved per Break</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-xs">
                <div className="flex items-center gap-1.5 text-sky-400 font-extrabold text-lg sm:text-xl">
                  <QrCode className="w-4 h-4" />
                  <span>Zero</span>
                </div>
                <p className="text-[11px] text-slate-300 font-medium">Counter Queues</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card / Interactive Preview */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-sm sm:max-w-md bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl p-5 border border-slate-700/80 shadow-2xl">
              {/* Pickup Counter Badge */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Live Counter Status
                  </span>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800">
                  TOKEN #B-108
                </span>
              </div>

              {/* Sample Food Hero Card */}
              <div className="mt-4 relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-4/3">
                <img
                  src="https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=700&auto=format&fit=crop&q=80"
                  alt="Butter Masala Dosa"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-slate-950" />
                  Bestseller Today
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h4 className="font-extrabold text-base">Butter Masala Dosa + Cold Coffee</h4>
                  <p className="text-xs text-slate-300 mt-0.5">Ready for pickup at Counter 2 in 8 mins</p>
                </div>
              </div>

              {/* Mini Token Display */}
              <div className="mt-4 bg-slate-950/80 rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white p-1 shrink-0 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-slate-900" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Token</span>
                    <p className="font-mono font-black text-sm text-emerald-400 tracking-wider">928-104</p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('menu')}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Order Ahead
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Fast 3-Step Process
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            How Smart Campus Canteen Works
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No more pushing through crowded counter crowds during 15-minute breaks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative">
            <span className="absolute -top-4 left-7 w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-md">
              1
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Browse & Customize</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Open the live menu between classes. Pick your samosa pav, thali, or shake, select spice levels and add-ons, and add to your cart.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative">
            <span className="absolute -top-4 left-7 w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-md">
              2
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pay Digitally (UPI / Cards)</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Instant digital checkout via Google Pay, PhonePe, Paytm, or Cards powered by Razorpay. Zero cash hassle at the counter.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow relative">
            <span className="absolute -top-4 left-7 w-8 h-8 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-md">
              3
            </span>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Pick Up via Token / QR</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Receive a live notification when food is ready. Show your unique 6-digit token or scan QR at your designated counter and grab your meal!
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-xs text-slate-500 mt-1">Freshly prepared campus staples and hot refreshments</p>
          </div>
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <div
              key={i}
              onClick={() => setCurrentPage('menu')}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all p-3 text-center"
            >
              <div className="w-20 h-20 mx-auto rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors truncate">
                {cat.name}
              </h4>
              <span className="text-[10px] text-slate-400 font-medium">
                {cat.count} items
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Today's Specials & Bestsellers Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Today's Specials & Bestsellers</h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">The fastest moving, chef-curated campus meals</p>
          </div>
          <button
            onClick={() => setCurrentPage('menu')}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>See Full Menu</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specials.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
            >
              <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 bg-white/90 ${item.isVeg ? 'border-emerald-600' : 'border-rose-600'}`}>
                    <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  </span>
                  {item.tags.includes('Bestseller') && (
                    <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.prepTimeMinutes} mins
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
                    <span className="text-base font-black text-slate-900">₹{item.price}</span>
                  </div>

                  {item.customizations && item.customizations.length > 0 ? (
                    <button
                      onClick={() => setCustomizingItem(item)}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      Add +
                    </button>
                  ) : (
                    <button
                      onClick={() => addToCart(item, [])}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-colors"
                    >
                      Add +
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Student Benefits & Queue-Free Guarantee */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
              Campus Life Upgrade
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Short Breaks Shouldn't Mean Skipped Meals.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Between a 10-minute sprint from the 4th floor lecture hall and the next physics tutorial, students used to spend 12 minutes standing in front of the cash desk. Smart Campus Canteen handles prep timing so you get piping hot food right on schedule.
            </p>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setCurrentPage('menu')}
                className="px-6 py-3.5 bg-white text-emerald-950 rounded-2xl font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors shadow-md"
              >
                Start Your Order
              </button>
              <button
                onClick={() => setCurrentPage('offers')}
                className="px-6 py-3.5 bg-emerald-800/60 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs border border-emerald-700 transition-colors"
              >
                View Student Combos
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
