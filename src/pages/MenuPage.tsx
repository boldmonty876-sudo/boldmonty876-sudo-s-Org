import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, 
  Filter, 
  Clock, 
  Plus, 
  Minus, 
  Check, 
  Flame, 
  Sparkles, 
  ArrowUpDown, 
  AlertCircle,
  Leaf,
  SlidersHorizontal
} from 'lucide-react';
import type { MenuItem } from '../types';

export const MenuPage: React.FC = () => {
  const { 
    menu, 
    isLoadingMenu, 
    setCustomizingItem, 
    cart, 
    addToCart, 
    updateCartQuantity 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [dietaryFilter, setDietaryFilter] = useState<'all' | 'veg' | 'non-veg' | 'vegan' | 'jain'>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'price-asc' | 'price-desc' | 'prep-time'>('popularity');
  const [maxPrice, setMaxPrice] = useState<number>(200);

  const categories = [
    'All',
    'Breakfast',
    'Meals & Thalis',
    'Snacks & Quick Bites',
    'Fast Food',
    'Beverages',
    'Desserts'
  ];

  // Filtering & Sorting logic
  const filteredItems = useMemo(() => {
    return menu.filter(item => {
      // Search
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Dietary
      let matchesDietary = true;
      if (dietaryFilter === 'veg') matchesDietary = item.isVeg;
      if (dietaryFilter === 'non-veg') matchesDietary = !item.isVeg || !!item.isEgg;
      if (dietaryFilter === 'vegan') matchesDietary = !!item.isVegan;
      if (dietaryFilter === 'jain') matchesDietary = !!item.isJain || (item.isVeg && !item.name.toLowerCase().includes('pyaaz') && !item.name.toLowerCase().includes('garlic'));

      // Price
      const matchesPrice = item.price <= maxPrice;

      return matchesSearch && matchesCategory && matchesDietary && matchesPrice;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'prep-time') return a.prepTimeMinutes - b.prepTimeMinutes;
      // Popularity default
      const aScore = (a.tags.includes('Bestseller') ? 10 : 0) + (a.tags.includes('Popular') ? 5 : 0);
      const bScore = (b.tags.includes('Bestseller') ? 10 : 0) + (b.tags.includes('Popular') ? 5 : 0);
      return bScore - aScore;
    });
  }, [menu, searchQuery, selectedCategory, dietaryFilter, sortBy, maxPrice]);

  // Helper to check cart quantity of an item
  const getItemCartQuantity = (menuItemId: string) => {
    return cart
      .filter(i => i.menuItemId === menuItemId)
      .reduce((sum, i) => sum + i.quantity, 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Campus Canteen Menu</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse live kitchen items, customized with your taste & spice preferences
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search samosa, dosa, coffee..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all shadow-2xs ${
              selectedCategory === cat
                ? 'bg-emerald-800 text-white shadow-emerald-950/20 scale-[1.02]'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter & Sort Controls Row */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        {/* Dietary Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Dietary:
          </span>
          <button
            onClick={() => setDietaryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors ${
              dietaryFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setDietaryFilter('veg')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
              dietaryFilter === 'veg' ? 'bg-emerald-800 text-white' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Pure Veg</span>
          </button>
          <button
            onClick={() => setDietaryFilter('non-veg')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
              dietaryFilter === 'non-veg' ? 'bg-rose-800 text-white' : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Egg / Non-Veg</span>
          </button>
          <button
            onClick={() => setDietaryFilter('vegan')}
            className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
              dietaryFilter === 'vegan' ? 'bg-teal-800 text-white' : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
            }`}
          >
            <Leaf className="w-3 h-3 text-teal-500" />
            <span>Vegan</span>
          </button>
        </div>

        {/* Sort & Max Price */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="popularity">Most Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="prep-time">Fastest Prep Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {isLoadingMenu ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
            <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto">
          <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No food items found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search terms or dietary filters to see available canteen food.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('All');
              setDietaryFilter('all');
            }}
            className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => {
            const inCartQty = getItemCartQuantity(item.id);
            const isSoldOut = !item.isAvailable || item.stock <= 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group ${
                  isSoldOut ? 'opacity-70 grayscale-[20%]' : ''
                }`}
              >
                {/* Image and Badges */}
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                    {/* Dietary badge */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
                      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-sm border-2 bg-white/95 ${item.isVeg ? 'border-emerald-600' : 'border-rose-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      </span>
                      {item.tags.includes('Bestseller') && (
                        <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Flame className="w-2.5 h-2.5 fill-slate-950" />
                          Bestseller
                        </span>
                      )}
                      {item.tags.includes("Today's Special") && (
                        <span className="bg-emerald-600 text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 shadow-xs">
                          <Sparkles className="w-2.5 h-2.5" />
                          Special
                        </span>
                      )}
                    </div>

                    {/* Prep time badge */}
                    <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>{item.prepTimeMinutes}m</span>
                    </div>

                    {/* Stock alert pill */}
                    {item.stock > 0 && item.stock <= item.lowStockThreshold && (
                      <div className="absolute bottom-2.5 left-2.5 bg-rose-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Only {item.stock} left!
                      </div>
                    )}

                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-xs font-black px-4 py-1.5 rounded-xl uppercase tracking-widest shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-emerald-800 transition-colors">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Footer with Price and Add Action */}
                <div className="p-4 pt-0 mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Price</span>
                    <span className="text-lg font-black text-slate-900">₹{item.price}</span>
                  </div>

                  {isSoldOut ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed"
                    >
                      Unavailable
                    </button>
                  ) : item.customizations && item.customizations.length > 0 ? (
                    <button
                      onClick={() => setCustomizingItem(item)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Customize</span>
                    </button>
                  ) : inCartQty > 0 ? (
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-300 rounded-xl p-1">
                      <button
                        onClick={() => {
                          const existing = cart.find(c => c.menuItemId === item.id);
                          if (existing) updateCartQuantity(existing.cartItemId, existing.quantity - 1);
                        }}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 shadow-2xs text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-black text-emerald-950">
                        {inCartQty}
                      </span>
                      <button
                        onClick={() => addToCart(item, [])}
                        disabled={inCartQty >= item.stock}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-emerald-800 hover:bg-emerald-100 shadow-2xs text-xs disabled:opacity-40"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item, [])}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-2xs hover:shadow-sm transition-all active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
