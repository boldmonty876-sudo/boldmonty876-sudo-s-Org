import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Check, Clock, Sparkles } from 'lucide-react';
import type { SelectedCustomization } from '../types';

export const CustomizationModal: React.FC = () => {
  const { customizingItem, setCustomizingItem, addToCart } = useApp();
  const [selected, setSelected] = useState<Record<string, SelectedCustomization>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!customizingItem) {
      setSelected({});
      setSpecialInstructions('');
      setQuantity(1);
      return;
    }

    // Initialize defaults for single selection groups if options exist
    const initial: Record<string, SelectedCustomization> = {};
    if (customizingItem.customizations) {
      customizingItem.customizations.forEach(group => {
        if (group.options.length > 0) {
          const first = group.options[0];
          initial[group.id] = {
            groupId: group.id,
            groupTitle: group.title,
            optionId: first.id,
            optionName: first.name,
            priceDelta: first.priceDelta
          };
        }
      });
    }
    setSelected(initial);
    setQuantity(1);
    setSpecialInstructions('');
  }, [customizingItem]);

  if (!customizingItem) return null;

  const handleSelectOption = (
    groupId: string, 
    groupTitle: string, 
    optionId: string, 
    optionName: string, 
    priceDelta: number
  ) => {
    setSelected(prev => ({
      ...prev,
      [groupId]: {
        groupId,
        groupTitle,
        optionId,
        optionName,
        priceDelta
      }
    }));
  };

  const deltaTotal = Object.values(selected).reduce((acc, curr) => acc + curr.priceDelta, 0);
  const finalUnitPrice = customizingItem.price + deltaTotal;
  const totalPrice = finalUnitPrice * quantity;

  const handleConfirm = () => {
    const list = Object.values(selected);
    for (let i = 0; i < quantity; i++) {
      addToCart(customizingItem, list, specialInstructions.trim() || undefined);
    }
    setCustomizingItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Image & Close */}
        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
          <img 
            src={customizingItem.imageUrl} 
            alt={customizingItem.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <button
            onClick={() => setCustomizingItem(null)}
            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center justify-center w-4 h-4 border-2 rounded-sm ${customizingItem.isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
                <span className={`w-2 h-2 rounded-full ${customizingItem.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {customizingItem.category}
              </span>
              <span className="text-slate-300 text-xs flex items-center gap-1 ml-auto">
                <Clock className="w-3.5 h-3.5" />
                {customizingItem.prepTimeMinutes} mins prep
              </span>
            </div>
            <h3 className="text-xl font-bold leading-tight drop-shadow-sm">{customizingItem.name}</h3>
          </div>
        </div>

        {/* Scrollable Customization Options */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          <p className="text-xs text-slate-500 leading-relaxed">
            {customizingItem.description}
          </p>

          {customizingItem.customizations && customizingItem.customizations.length > 0 ? (
            customizingItem.customizations.map(group => (
              <div key={group.id} className="border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-900">{group.title}</h4>
                  <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    {group.required ? 'Required' : 'Optional'}
                  </span>
                </div>
                <div className="space-y-2">
                  {group.options.map(opt => {
                    const isChecked = selected[group.id]?.optionId === opt.id;
                    return (
                      <label
                        key={opt.id}
                        onClick={() => handleSelectOption(group.id, group.title, opt.id, opt.name, opt.priceDelta)}
                        className={`flex items-center justify-between p-3.5 rounded-xl border text-sm cursor-pointer transition-all ${
                          isChecked 
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-medium shadow-xs' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                            isChecked ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                          <span>{opt.name}</span>
                        </div>
                        {opt.priceDelta > 0 && (
                          <span className="text-xs font-semibold text-emerald-700">
                            +₹{opt.priceDelta}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-xs text-slate-400 bg-slate-50 rounded-xl">
              Standard preparation with authentic campus recipe.
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div className="border-t border-slate-100 pt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g., extra crisp pav, less spice, pack separately"
              value={specialInstructions}
              onChange={e => setSpecialInstructions(e.target.value)}
              maxLength={100}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center border border-slate-200 bg-white rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-slate-800">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(customizingItem.stock, quantity + 1))}
              disabled={quantity >= customizingItem.stock}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 flex items-center justify-between px-5 py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-900/15 transition-all hover:shadow-lg active:scale-[0.98]"
          >
            <span>Add to Cart</span>
            <span className="bg-emerald-800/80 px-2.5 py-1 rounded-lg text-emerald-100 text-xs font-extrabold tracking-wide">
              ₹{totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
