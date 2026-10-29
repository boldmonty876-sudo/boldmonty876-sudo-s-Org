import type { MenuItem, Order, Coupon, CanteenConfig, User, OrderStatus } from '../types';

export const api = {
  // Config
  async getConfig(): Promise<CanteenConfig> {
    const res = await fetch('/api/config');
    if (!res.ok) throw new Error('Failed to load configuration');
    return res.json();
  },

  async updateConfig(config: Partial<CanteenConfig>): Promise<{ success: boolean; config: CanteenConfig }> {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Failed to update configuration');
    return res.json();
  },

  // Menu
  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch('/api/menu');
    if (!res.ok) throw new Error('Failed to load menu');
    return res.json();
  },

  async addMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem> {
    const res = await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to create menu item');
    return res.json();
  },

  async updateMenuItem(id: string, item: Partial<MenuItem>): Promise<MenuItem> {
    const res = await fetch(`/api/menu/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) throw new Error('Failed to update menu item');
    return res.json();
  },

  async toggleAvailability(id: string, isAvailable: boolean, stock?: number): Promise<MenuItem> {
    const res = await fetch(`/api/menu/${id}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable, stock })
    });
    if (!res.ok) throw new Error('Failed to update item availability');
    return res.json();
  },

  async deleteMenuItem(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete menu item');
    return res.json();
  },

  // Coupons
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/coupons');
    if (!res.ok) throw new Error('Failed to load coupons');
    return res.json();
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; code: string; discount: number; description: string }> {
    const res = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid coupon code');
    return data;
  },

  async saveCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(coupon)
    });
    if (!res.ok) throw new Error('Failed to save coupon');
    return res.json();
  },

  // Auth
  async login(email: string, role?: string): Promise<{ user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(details: Partial<User>): Promise<{ user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(details)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  // Payments & Orders
  async createPaymentOrder(payload: {
    items: any[];
    couponCode?: string;
    pickupCounter: string;
    pickupSlot?: string;
    specialInstructions?: string;
    user: Partial<User>;
  }) {
    const res = await fetch('/api/payments/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to initialize payment order');
    return data;
  },

  async verifyPayment(payload: {
    orderId: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    testModeAutoApprove?: boolean;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Payment signature verification failed');
    return data;
  },

  async placeCashOrder(payload: {
    items: any[];
    couponCode?: string;
    pickupCounter: string;
    pickupSlot?: string;
    specialInstructions?: string;
    user: Partial<User>;
  }): Promise<{ success: boolean; order: Order }> {
    const res = await fetch('/api/orders/cash-on-pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to place cash order');
    return data;
  },

  async getOrders(userId?: string, role?: string): Promise<Order[]> {
    const params = new URLSearchParams();
    if (userId) params.set('userId', userId);
    if (role) params.set('role', role);
    const res = await fetch(`/api/orders?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load orders');
    return res.json();
  },

  async getOrder(id: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) throw new Error('Order not found');
    return res.json();
  },

  async updateOrderStatus(id: string, status: OrderStatus, rejectionReason?: string): Promise<Order> {
    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, rejectionReason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update order status');
    return data;
  },

  async verifyPickupToken(token?: string, orderNumber?: string): Promise<{ success: boolean; message: string; order: Order }> {
    const res = await fetch('/api/orders/verify-pickup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, orderNumber })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid pickup token');
    return data;
  },

  async cancelOrder(id: string, reason?: string): Promise<{ success: boolean; order: Order }> {
    const res = await fetch(`/api/orders/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to cancel order');
    return data;
  },

  async getReportsSummary(): Promise<{
    totalRevenueToday: number;
    totalOrdersToday: number;
    activeOrders: number;
    ordersAwaitingAcceptance: number;
    averagePrepTimeMinutes: number;
    cancelledOrdersCount: number;
    popularItems: { name: string; count: number; revenue: number }[];
    categoryRevenue: Record<string, number>;
  }> {
    const res = await fetch('/api/reports/summary');
    if (!res.ok) throw new Error('Failed to load analytics report');
    return res.json();
  }
};
