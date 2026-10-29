export type UserRole = 'student' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  semester?: string;
  phone?: string;
  createdAt: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface CustomizationGroup {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  required: boolean;
  options: CustomizationOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Breakfast' | 'Meals & Thalis' | 'Snacks & Quick Bites' | 'Beverages' | 'Fast Food' | 'Desserts';
  imageUrl: string;
  isVeg: boolean;
  isEgg?: boolean;
  isVegan?: boolean;
  isJain?: boolean;
  prepTimeMinutes: number;
  isAvailable: boolean;
  stock: number;
  lowStockThreshold: number;
  tags: ('Bestseller' | 'Popular' | 'New' | "Today's Special" | 'Budget Combo')[];
  customizations?: CustomizationGroup[];
}

export interface SelectedCustomization {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  cartItemId: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  specialInstructions?: string;
  itemTotalPrice: number;
}

export type OrderStatus =
  | 'placed'
  | 'payment_pending'
  | 'paid'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'collected'
  | 'cancelled'
  | 'rejected';

export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export interface OrderItemSnapshot {
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  selectedCustomizations: SelectedCustomization[];
  itemTotalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #B-108
  pickupToken: string; // 6-digit alphanumeric token for counter validation
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  studentId?: string;
  department?: string;
  items: OrderItemSnapshot[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  tax: number;
  total: number;
  paymentMethod: 'razorpay' | 'upi' | 'counter_cash';
  paymentStatus: PaymentStatus;
  paymentDetails?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    paidAt?: string;
  };
  orderStatus: OrderStatus;
  pickupCounter: string;
  pickupSlot?: string;
  estimatedReadyTime: string;
  specialInstructions?: string;
  cancellationReason?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  readyAt?: string;
  collectedAt?: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  value: number; // e.g. 20 for 20% or 50 for ₹50
  minOrder: number;
  maxDiscount?: number;
  validUntil: string;
  usageLimit: number;
  timesUsed: number;
  description: string;
  active: boolean;
}

export interface PickupSlot {
  id: string;
  label: string;
  timeRange: string;
  maxCapacity: number;
  currentBookings: number;
}

export interface CanteenConfig {
  collegeName: string;
  canteenName: string;
  logoUrl?: string;
  location: string;
  contactPhone: string;
  contactEmail: string;
  openingTime: string;
  closingTime: string;
  isOpen: boolean;
  taxPercent: number;
  minOrderAmount: number;
  collegeEmailDomain: string; // e.g. 'campus.edu' or 'ait.ac.in'
  enforceCollegeDomain: boolean;
  allowCashOnPickup: boolean;
  pickupCounters: string[];
  pickupSlots: PickupSlot[];
  razorpayKeyId: string;
  testMode: boolean;
  avgPreparationTimeMinutes: number;
}
