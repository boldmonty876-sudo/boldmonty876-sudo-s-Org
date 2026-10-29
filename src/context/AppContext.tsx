import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { 
  User, 
  MenuItem, 
  CartItem, 
  Order, 
  CanteenConfig, 
  Coupon,
  SelectedCustomization 
} from '../types';
import { api } from '../services/api';
import { playNotificationChime } from '../utils/audio';

export type AppPage = 
  | 'home' 
  | 'menu' 
  | 'cart' 
  | 'checkout' 
  | 'confirmation' 
  | 'tracking' 
  | 'my-orders' 
  | 'offers' 
  | 'admin';

interface ToastNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface AppContextType {
  currentPage: AppPage;
  setCurrentPage: (page: AppPage) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loginAs: (role: 'student' | 'staff' | 'admin') => Promise<void>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Config & Menu
  config: CanteenConfig | null;
  refreshConfig: () => Promise<void>;
  menu: MenuItem[];
  refreshMenu: () => Promise<void>;
  isLoadingMenu: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedCustomizations: SelectedCustomization[], specialInstructions?: string) => void;
  updateCartQuantity: (cartItemId: string, newQuantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartCount: number;
  appliedCoupon: { code: string; discount: number; description: string } | null;
  setAppliedCoupon: (coupon: { code: string; discount: number; description: string } | null) => void;

  // Customization Modal
  customizingItem: MenuItem | null;
  setCustomizingItem: (item: MenuItem | null) => void;

  // Orders & Tracking
  activeOrderId: string | null;
  setActiveOrderId: (orderId: string | null) => void;
  currentOrder: Order | null;
  userOrders: Order[];
  refreshOrders: () => Promise<void>;
  viewReceiptOrder: Order | null;
  setViewReceiptOrder: (order: Order | null) => void;

  // Notifications
  notifications: ToastNotification[];
  dismissNotification: (id: string) => void;
  showToast: (title: string, message: string, type?: ToastNotification['type']) => void;

  // Audio mute toggle
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<AppPage>('home');
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('scc_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [config, setConfig] = useState<CanteenConfig | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('scc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number; description: string } | null>(null);

  // Modals & Tracking
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    return localStorage.getItem('scc_active_order_id') || null;
  });
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [viewReceiptOrder, setViewReceiptOrder] = useState<Order | null>(null);

  // Notifications & Sound
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const showToast = useCallback((title: string, message: string, type: ToastNotification['type'] = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [{ id, title, message, type, timestamp: Date.now() }, ...prev]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5500);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Save user & cart to local storage
  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('scc_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('scc_user');
    }
  };

  useEffect(() => {
    localStorage.setItem('scc_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (activeOrderId) {
      localStorage.setItem('scc_active_order_id', activeOrderId);
    } else {
      localStorage.removeItem('scc_active_order_id');
    }
  }, [activeOrderId]);

  // Initial data loading
  const refreshConfig = useCallback(async () => {
    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
    } catch (err) {
      console.error('Config fetch failed:', err);
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    try {
      setIsLoadingMenu(true);
      const data = await api.getMenu();
      setMenu(data);
    } catch (err) {
      console.error('Menu fetch failed:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    if (!user) return;
    try {
      const orders = await api.getOrders(user.role === 'student' ? user.id : undefined, user.role);
      setUserOrders(orders);

      if (activeOrderId) {
        const found = orders.find(o => o.id === activeOrderId);
        if (found) setCurrentOrder(found);
      }
    } catch (err) {
      console.error('Orders fetch failed:', err);
    }
  }, [user, activeOrderId]);

  useEffect(() => {
    refreshConfig();
    refreshMenu();
  }, [refreshConfig, refreshMenu]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  // Server-Sent Events (SSE) listener for real-time order updates & live kitchen
  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.addEventListener('order_updated', (e) => {
      try {
        const order: Order = JSON.parse(e.data);
        
        // Update user's active order
        if (order.id === activeOrderId) {
          setCurrentOrder(order);
          if (order.orderStatus === 'ready') {
            if (soundEnabled) playNotificationChime('order_ready');
            showToast('Order Ready for Pickup! 🔔', `Order ${order.orderNumber} is ready at ${order.pickupCounter}. Show token ${order.pickupToken}!`, 'success');
          } else if (order.orderStatus === 'preparing') {
            showToast('Cooking Started 🍳', `Kitchen has started preparing your order ${order.orderNumber}!`, 'info');
          } else if (order.orderStatus === 'collected') {
            showToast('Order Picked Up ✨', `Order ${order.orderNumber} collected. Enjoy your break!`, 'success');
          }
        }

        // Update orders list
        setUserOrders(prev => prev.map(o => o.id === order.id ? order : o));
      } catch (err) {
        console.error('SSE order_updated error:', err);
      }
    });

    eventSource.addEventListener('order_created', (e) => {
      try {
        const newOrder: Order = JSON.parse(e.data);
        if (user && (user.role === 'admin' || user.role === 'staff')) {
          if (soundEnabled) playNotificationChime('new_order');
          showToast('New Canteen Order! 🔔', `Order ${newOrder.orderNumber} received for ₹${newOrder.total} (${newOrder.pickupCounter})`, 'info');
        }
        setUserOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      } catch (err) {
        console.error('SSE order_created error:', err);
      }
    });

    eventSource.addEventListener('menu_updated', (e) => {
      try {
        const updatedMenu: MenuItem[] = JSON.parse(e.data);
        setMenu(updatedMenu);
      } catch (err) {
        console.error('SSE menu_updated error:', err);
      }
    });

    eventSource.addEventListener('config_updated', (e) => {
      try {
        const updatedConfig: CanteenConfig = JSON.parse(e.data);
        setConfig(updatedConfig);
      } catch (err) {
        console.error('SSE config_updated error:', err);
      }
    });

    return () => {
      eventSource.close();
    };
  }, [activeOrderId, user, soundEnabled, showToast]);

  // Demo Fast Login
  const loginAs = async (role: 'student' | 'staff' | 'admin') => {
    try {
      let email = 'aryan.sharma@campus.edu';
      if (role === 'admin') email = 'boldmonty876@gmail.com';
      if (role === 'staff') email = 'staff@campus.edu';

      const res = await api.login(email, role);
      setUser(res.user);
      setIsAuthModalOpen(false);
      showToast('Signed In', `Welcome back, ${res.user.name} (${role.toUpperCase()})`, 'success');
    } catch (err: any) {
      showToast('Sign In Error', err.message || 'Could not sign in', 'error');
    }
  };

  const logout = () => {
    setUser(null);
    showToast('Signed Out', 'You have been logged out securely.', 'info');
  };

  // Cart Management
  const addToCart = (
    item: MenuItem, 
    selectedCustomizations: SelectedCustomization[], 
    specialInstructions?: string
  ) => {
    if (!item.isAvailable || item.stock <= 0) {
      showToast('Item Unavailable', `${item.name} is currently sold out.`, 'warning');
      return;
    }

    const customTotal = selectedCustomizations.reduce((acc, c) => acc + (c.priceDelta || 0), 0);
    const unitPrice = item.price + customTotal;

    // Unique key per customization combo
    const customKey = selectedCustomizations.map(c => c.optionId).sort().join('_');
    const cartItemId = `${item.id}-${customKey}`;

    setCart(prev => {
      const existing = prev.find(i => i.cartItemId === cartItemId);
      if (existing) {
        return prev.map(i => i.cartItemId === cartItemId 
          ? { ...i, quantity: i.quantity + 1, itemTotalPrice: (i.quantity + 1) * unitPrice }
          : i
        );
      } else {
        const newItem: CartItem = {
          cartItemId,
          menuItemId: item.id,
          name: item.name,
          unitPrice,
          quantity: 1,
          selectedCustomizations,
          specialInstructions,
          itemTotalPrice: unitPrice
        };
        return [...prev, newItem];
      }
    });

    playNotificationChime('success');
    showToast('Added to Cart', `${item.name} added.`, 'success');
  };

  const updateCartQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(prev => prev.map(i => {
      if (i.cartItemId === cartItemId) {
        return {
          ...i,
          quantity: newQuantity,
          itemTotalPrice: newQuantity * i.unitPrice
        };
      }
      return i;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.itemTotalPrice, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        currentPage,
        setCurrentPage,
        user,
        setUser,
        loginAs,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        config,
        refreshConfig,
        menu,
        refreshMenu,
        isLoadingMenu,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        appliedCoupon,
        setAppliedCoupon,
        customizingItem,
        setCustomizingItem,
        activeOrderId,
        setActiveOrderId,
        currentOrder,
        userOrders,
        refreshOrders,
        viewReceiptOrder,
        setViewReceiptOrder,
        notifications,
        dismissNotification,
        showToast,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
