import React from 'react';
import { useApp } from '../context/AppContext';
import { UtensilsCrossed, ShieldCheck, Clock, MapPin, Phone, Mail, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config, setCurrentPage } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <span className="font-black text-white text-base">Smart Campus</span>{' '}
                <span className="text-emerald-400 font-extrabold text-base">Canteen</span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                  {config?.collegeName || 'Apex Institute of Technology'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Eliminating the lunch rush. Order ahead from class or lab, pay digitally, and pick up your hot food using your digital token code or QR.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold bg-emerald-950/60 p-2.5 rounded-xl border border-emerald-800/40">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>FSSAI Certified • Fresh Campus Kitchen</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => setCurrentPage('home')} className="hover:text-emerald-400 transition-colors">
                  Home & Specials
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('menu')} className="hover:text-emerald-400 transition-colors">
                  Full Canteen Menu
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('offers')} className="hover:text-emerald-400 transition-colors">
                  Student Offers & Meal Combos
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('my-orders')} className="hover:text-emerald-400 transition-colors">
                  Order History & Digital Receipts
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentPage('admin')} className="hover:text-emerald-400 transition-colors">
                  Kitchen Staff & Counter Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Pickup Counters & Schedule */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Pickup Counters</h4>
            <div className="space-y-2 text-xs text-slate-400">
              {config?.pickupCounters.map((counter, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{counter}</span>
                </div>
              ))}
              <div className="pt-2 text-[11px] text-amber-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>Operating: {config?.openingTime} to {config?.closingTime}</span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Canteen Desk</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{config?.location || 'Ground Floor, Student Activity Center'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{config?.contactPhone || '+91 98765 43210'}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{config?.contactEmail || 'canteen@campus.edu'}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {config?.collegeName || 'Smart Campus Canteen'}. All rights reserved.</p>
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Built for college breaks with</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
            <span>Zero Queue Technology</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
