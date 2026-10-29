import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  Download, 
  Settings, 
  QrCode, 
  UserCheck, 
  DollarSign, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  MapPin,
  Lock
} from 'lucide-react';
import { api } from '../services/api';
import type { Order, MenuItem, OrderStatus, CanteenConfig } from '../types';

export const AdminDashboard: React.FC = () => {
  const { 
    user, 
    loginAs, 
    config, 
    refreshConfig, 
    menu, 
    refreshMenu, 
    showToast,
    soundEnabled,
    setSoundEnabled,
    setViewReceiptOrder
  } = useApp();

  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'analytics' | 'settings'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  
  // Orders Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderCounterFilter, setOrderCounterFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

  // Counter Pickup Verification Box
  const [verifyTokenInput, setVerifyTokenInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Menu item modal
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [itemForm, setItemForm] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 50,
    category: 'Snacks & Quick Bites',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 10,
    stock: 30,
    lowStockThreshold: 5,
    tags: []
  });

  // Analytics summary state
  const [analytics, setAnalytics] = useState<any>(null);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<CanteenConfig | null>(config);

  useEffect(() => {
    if (config) setSettingsForm(config);
  }, [config]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getOrders(undefined, 'admin');
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const data = await api.getReportsSummary();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchAnalytics();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  // Staff order status transition action
  const handleUpdateStatus = async (orderId: string, status: OrderStatus, rejectionReason?: string) => {
    try {
      await api.updateOrderStatus(orderId, status, rejectionReason);
      showToast('Status Updated', `Order transitioned to ${status.toUpperCase()}`, 'success');
      fetchOrders();
      fetchAnalytics();
    } catch (err: any) {
      showToast('Action Failed', err.message || 'Could not update status', 'error');
    }
  };

  // Staff pickup token verification
  const handleVerifyPickup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyTokenInput.trim()) return;
    setVerifyLoading(true);
    setVerifyMessage(null);

    try {
      const res = await api.verifyPickupToken(verifyTokenInput.trim());
      setVerifyMessage({ text: res.message, success: true });
      showToast('Token Verified! ✅', res.message, 'success');
      setVerifyTokenInput('');
      fetchOrders();
      fetchAnalytics();
    } catch (err: any) {
      setVerifyMessage({ text: err.message || 'Invalid pickup token', success: false });
      showToast('Verification Failed', err.message, 'error');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Menu item save
  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.updateMenuItem(editingItem.id, itemForm);
        showToast('Item Updated', `${itemForm.name} updated.`, 'success');
      } else {
        await api.addMenuItem(itemForm as any);
        showToast('Item Added', `${itemForm.name} added to menu.`, 'success');
      }
      setShowItemModal(false);
      setEditingItem(null);
      refreshMenu();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save menu item', 'error');
    }
  };

  // Toggle item availability
  const handleToggleAvailable = async (item: MenuItem) => {
    try {
      await api.toggleAvailability(item.id, !item.isAvailable);
      showToast('Status Updated', `${item.name} is now ${!item.isAvailable ? 'IN STOCK' : 'SOLD OUT'}.`, 'info');
      refreshMenu();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Stock adjuster
  const handleAdjustStock = async (item: MenuItem, delta: number) => {
    const newStock = Math.max(0, item.stock + delta);
    try {
      await api.toggleAvailability(item.id, newStock > 0, newStock);
      refreshMenu();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Delete item
  const handleDeleteItem = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" from canteen menu?`)) return;
    try {
      await api.deleteMenuItem(id);
      showToast('Item Removed', `${name} deleted.`, 'info');
      refreshMenu();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Student Name', 'Roll No', 'Counter', 'Items', 'Subtotal', 'Tax', 'Total', 'Payment', 'Status'];
    const rows = orders.map(o => [
      o.orderNumber,
      new Date(o.createdAt).toLocaleString(),
      `"${o.userName}"`,
      `"${o.studentId || ''}"`,
      `"${o.pickupCounter}"`,
      `"${o.items.map(i => `${i.quantity}x ${i.name}`).join('; ')}"`,
      o.subtotal,
      o.tax,
      o.total,
      o.paymentStatus,
      o.orderStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `canteen_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Export Complete', 'Orders exported to CSV.', 'success');
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      await api.updateConfig(settingsForm);
      showToast('Settings Saved', 'Campus & canteen configuration updated.', 'success');
      refreshConfig();
    } catch (err: any) {
      showToast('Error', err.message, 'error');
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesCounter = orderCounterFilter === 'all' || o.pickupCounter === orderCounterFilter;
    const matchesSearch = 
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.pickupToken.includes(orderSearchQuery) ||
      o.userName.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesCounter && matchesSearch;
  });

  const isStaffOrAdmin = user && (user.role === 'admin' || user.role === 'staff');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Access Guard Banner if not authorized */}
      {!isStaffOrAdmin && (
        <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Staff & Admin Portal Preview Mode
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                You are currently viewing as a guest. Switch to an authorized role to test the live counter workflow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loginAs('staff')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Sign In as Kitchen Staff
            </button>
            <button
              onClick={() => loginAs('admin')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Sign In as Operations Admin
            </button>
          </div>
        </div>
      )}

      {/* Top Header & Tabs */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Canteen Counter & Admin Portal
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {config?.canteenName} • {config?.collegeName}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'orders' ? 'bg-white text-emerald-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Live Kitchen Orders ({orders.filter(o => ['paid', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)).length})
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'menu' ? 'bg-white text-emerald-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menu & Stock ({menu.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'analytics' ? 'bg-white text-emerald-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'settings' ? 'bg-white text-emerald-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Campus Config
          </button>
        </div>
      </div>

      {/* ================= TAB 1: LIVE ORDERS & PICKUP VERIFICATION ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Quick Counter Pickup Verification Box */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-800/40">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-5 space-y-1">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-base tracking-tight text-white">
                    Counter Pickup Verification
                  </h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Enter student 6-digit pickup token code or Order Number to verify and mark as collected.
                </p>
              </div>

              <div className="lg:col-span-7">
                <form onSubmit={handleVerifyPickup} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Token (e.g. 482915) or #B-101"
                    value={verifyTokenInput}
                    onChange={e => setVerifyTokenInput(e.target.value)}
                    className="flex-1 bg-white/10 text-white placeholder:text-slate-400 border border-white/20 rounded-2xl px-4 py-3 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {verifyLoading ? 'Verifying...' : 'Verify Pickup'}
                  </button>
                </form>

                {verifyMessage && (
                  <div className={`mt-2 text-xs font-semibold px-3 py-1.5 rounded-xl ${
                    verifyMessage.success ? 'bg-emerald-800 text-emerald-200' : 'bg-rose-900/80 text-rose-200'
                  }`}>
                    {verifyMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-400 uppercase text-[11px]">Filter Status:</span>
              {['all', 'paid', 'accepted', 'preparing', 'ready', 'collected'].map(st => (
                <button
                  key={st}
                  onClick={() => setOrderStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
                    orderStatusFilter === st 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search order #, token, name..."
                value={orderSearchQuery}
                onChange={e => setOrderSearchQuery(e.target.value)}
                className="text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Live Orders Feed */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
              <UtensilsCrossed className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-base">No orders matching filter</h3>
              <p className="text-xs text-slate-500 mt-1">Orders placed by students will appear in real-time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map(order => {
                const isPaid = order.paymentStatus === 'verified';
                const isReady = order.orderStatus === 'ready';

                return (
                  <div
                    key={order.id}
                    className={`bg-white rounded-3xl border p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                      isReady ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200/80'
                    }`}
                  >
                    <div>
                      {/* Top Order header */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                          <span className="font-mono font-black text-slate-900 text-base">
                            {order.orderNumber}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Token */}
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block">Token</span>
                          <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {order.pickupToken}
                          </span>
                        </div>
                      </div>

                      {/* Student info */}
                      <div className="pt-2 text-xs text-slate-600 flex items-center justify-between">
                        <span className="font-bold text-slate-800 truncate">{order.userName}</span>
                        <span className="text-[11px] font-mono text-slate-500">{order.studentId || 'Student'}</span>
                      </div>
                      <div className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                        {order.pickupCounter}
                      </div>

                      {/* Items */}
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 divide-y divide-slate-200/60 text-xs">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="py-1 flex justify-between">
                            <span className="font-medium text-slate-800">
                              {item.quantity}x {item.name}
                            </span>
                            <span className="font-bold text-slate-900">₹{item.itemTotalPrice}</span>
                          </div>
                        ))}
                      </div>

                      {order.specialInstructions && (
                        <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <strong>Note:</strong> "{order.specialInstructions}"
                        </div>
                      )}
                    </div>

                    {/* Status Workflow Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          order.orderStatus === 'ready' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
                        }`}>
                          {order.orderStatus.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Transition triggers */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {(order.orderStatus === 'paid' || order.orderStatus === 'placed') && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'accepted')}
                              className="py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                              Accept Order
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'rejected', 'Kitchen items out of stock')}
                              className="py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-xl text-xs font-bold transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {order.orderStatus === 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'preparing')}
                            className="col-span-2 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
                          >
                            Start Cooking (Preparing)
                          </button>
                        )}

                        {order.orderStatus === 'preparing' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'ready')}
                            className="col-span-2 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black transition-colors shadow-sm animate-pulse"
                          >
                            Mark Ready at Counter 🔔
                          </button>
                        )}

                        {order.orderStatus === 'ready' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'collected')}
                            className="col-span-2 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black transition-colors"
                          >
                            Confirm Picked Up (Collected)
                          </button>
                        )}

                        {order.orderStatus === 'collected' && (
                          <div className="col-span-2 text-center text-xs text-slate-400 font-semibold py-1">
                            ✓ Completed & Picked Up
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: MENU & INVENTORY MANAGEMENT ================= */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Live Canteen Menu & Inventory</h2>
              <p className="text-xs text-slate-500">Track stock levels, toggle sold out dishes, and edit pricing</p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: '',
                  description: '',
                  price: 50,
                  category: 'Snacks & Quick Bites',
                  imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
                  isVeg: true,
                  prepTimeMinutes: 10,
                  stock: 30,
                  lowStockThreshold: 5,
                  tags: []
                });
                setShowItemModal(true);
              }}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Dish Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock Control</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {menu.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="font-bold text-slate-900">{item.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 line-clamp-1">{item.description}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-slate-600">{item.category}</td>

                      <td className="p-4 font-black text-slate-900 text-sm">₹{item.price}</td>

                      {/* Stock controls */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAdjustStock(item, -5)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                            title="-5 stock"
                          >
                            -
                          </button>
                          <span className={`w-8 text-center font-bold font-mono ${
                            item.stock <= item.lowStockThreshold ? 'text-rose-600' : 'text-slate-800'
                          }`}>
                            {item.stock}
                          </span>
                          <button
                            onClick={() => handleAdjustStock(item, 5)}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                            title="+5 stock"
                          >
                            +
                          </button>
                          {item.stock <= item.lowStockThreshold && item.stock > 0 && (
                            <span className="text-[9px] bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded border border-rose-200">
                              Low
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Availability toggle */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleAvailable(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-colors ${
                            item.isAvailable && item.stock > 0
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {item.isAvailable && item.stock > 0 ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setItemForm(item);
                              setShowItemModal(true);
                            }}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: SALES ANALYTICS ================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Verified Today Revenue
              </span>
              <div className="text-3xl font-black text-emerald-800">
                ₹{analytics?.totalRevenueToday || 0}
              </div>
              <p className="text-[10px] text-slate-400">Excludes cancelled/failed orders</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Orders Today
              </span>
              <div className="text-3xl font-black text-slate-900">
                {analytics?.totalOrdersToday || 0}
              </div>
              <p className="text-[10px] text-slate-400">Processed by kitchen staff</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Avg Preparation Speed
              </span>
              <div className="text-3xl font-black text-amber-600">
                {analytics?.averagePrepTimeMinutes || 12}m
              </div>
              <p className="text-[10px] text-slate-400">Target: Under 15m</p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Cancelled / Rejected
              </span>
              <div className="text-3xl font-black text-rose-600">
                {analytics?.cancelledOrdersCount || 0}
              </div>
              <p className="text-[10px] text-slate-400">Pre-cooking refunds</p>
            </div>
          </div>

          {/* Popular Items & Categories Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Items */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Top Moving Food Items</h3>
              <div className="space-y-3">
                {analytics?.popularItems?.map((it: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{it.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{it.count} ordered</span>
                      <span className="font-bold text-emerald-800">₹{it.revenue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category revenue */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-2xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900">Revenue by Category</h3>
              <div className="space-y-3">
                {analytics?.categoryRevenue && Object.entries(analytics.categoryRevenue).map(([cat, rev]: [string, any]) => (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{cat}</span>
                      <span className="font-bold text-slate-900">₹{rev.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(100, (rev / (analytics.totalRevenueToday || 1)) * 100)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CAMPUS & CANTEEN CONFIGURATION ================= */}
      {activeTab === 'settings' && settingsForm && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Campus Canteen Settings</h2>
            <p className="text-xs text-slate-500">Configure college details, opening hours, tax rules, and payment keys</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College / Institution Name</label>
              <input
                type="text"
                value={settingsForm.collegeName}
                onChange={e => setSettingsForm({ ...settingsForm, collegeName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Canteen Facility Name</label>
              <input
                type="text"
                value={settingsForm.canteenName}
                onChange={e => setSettingsForm({ ...settingsForm, canteenName: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Location on Campus</label>
              <input
                type="text"
                value={settingsForm.location}
                onChange={e => setSettingsForm({ ...settingsForm, location: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Canteen Contact Phone</label>
              <input
                type="text"
                value={settingsForm.contactPhone}
                onChange={e => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Opening Time</label>
              <input
                type="text"
                value={settingsForm.openingTime}
                onChange={e => setSettingsForm({ ...settingsForm, openingTime: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Closing Time</label>
              <input
                type="text"
                value={settingsForm.closingTime}
                onChange={e => setSettingsForm({ ...settingsForm, closingTime: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">GST Tax Percent (%)</label>
              <input
                type="number"
                value={settingsForm.taxPercent}
                onChange={e => setSettingsForm({ ...settingsForm, taxPercent: Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Order Amount (₹)</label>
              <input
                type="number"
                value={settingsForm.minOrderAmount}
                onChange={e => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">College Email Domain</label>
              <input
                type="text"
                placeholder="campus.edu"
                value={settingsForm.collegeEmailDomain}
                onChange={e => setSettingsForm({ ...settingsForm, collegeEmailDomain: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-5">
              <input
                type="checkbox"
                id="enforceDomain"
                checked={settingsForm.enforceCollegeDomain}
                onChange={e => setSettingsForm({ ...settingsForm, enforceCollegeDomain: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="enforceDomain" className="text-xs font-bold text-slate-800">
                Enforce College Email Requirement
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors shadow-md"
            >
              Save Configuration Changes
            </button>
          </div>
        </form>
      )}

      {/* ================= MODAL: ADD / EDIT MENU ITEM ================= */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4 border border-slate-100 shadow-2xl">
            <h3 className="font-extrabold text-base text-slate-900">
              {editingItem ? 'Edit Dish Details' : 'Add New Dish to Canteen'}
            </h3>

            <form onSubmit={handleSaveItem} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  value={itemForm.name}
                  onChange={e => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={itemForm.description}
                  onChange={e => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={itemForm.price}
                    onChange={e => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={e => setItemForm({ ...itemForm, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option>Breakfast</option>
                    <option>Meals & Thalis</option>
                    <option>Snacks & Quick Bites</option>
                    <option>Fast Food</option>
                    <option>Beverages</option>
                    <option>Desserts</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={itemForm.stock}
                    onChange={e => setItemForm({ ...itemForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Prep Time (mins)</label>
                  <input
                    type="number"
                    value={itemForm.prepTimeMinutes}
                    onChange={e => setItemForm({ ...itemForm, prepTimeMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={itemForm.imageUrl}
                  onChange={e => setItemForm({ ...itemForm, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-1.5 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={itemForm.isVeg}
                    onChange={e => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Pure Vegetarian</span>
                </label>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-700 text-white rounded-xl font-bold hover:bg-emerald-800"
                >
                  Save Dish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
