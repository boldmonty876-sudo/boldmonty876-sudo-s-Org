import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import type { 
  MenuItem, 
  Order, 
  Coupon, 
  CanteenConfig, 
  User, 
  OrderStatus,
  PaymentStatus 
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve(process.cwd(), 'server-data.json');

app.use(express.json());

// In-Memory Database Structure
interface Database {
  config: CanteenConfig;
  menu: MenuItem[];
  orders: Order[];
  coupons: Coupon[];
  users: User[];
}

const DEFAULT_CONFIG: CanteenConfig = {
  collegeName: 'Apex Institute of Technology',
  canteenName: 'Central Campus Canteen (Block C)',
  logoUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=128&auto=format&fit=crop&q=80',
  location: 'Ground Floor, Student Activity Center, Block C',
  contactPhone: '+91 98765 43210',
  contactEmail: 'canteen@campus.edu',
  openingTime: '08:00 AM',
  closingTime: '07:30 PM',
  isOpen: true,
  taxPercent: 5, // 5% GST
  minOrderAmount: 20,
  collegeEmailDomain: 'campus.edu',
  enforceCollegeDomain: false, // configurable
  allowCashOnPickup: true,
  pickupCounters: [
    'Counter 1 - Snacks & Quick Bites',
    'Counter 2 - Meals & Thali Station',
    'Counter 3 - Beverages & Shakes'
  ],
  pickupSlots: [
    { id: 'slot-1', label: 'Morning Tea Break (10:15 AM - 10:45 AM)', timeRange: '10:15 - 10:45 AM', maxCapacity: 40, currentBookings: 12 },
    { id: 'slot-2', label: 'Lunch Break Shift 1 (12:30 PM - 01:15 PM)', timeRange: '12:30 - 01:15 PM', maxCapacity: 60, currentBookings: 28 },
    { id: 'slot-3', label: 'Lunch Break Shift 2 (01:15 PM - 02:00 PM)', timeRange: '01:15 - 02:00 PM', maxCapacity: 60, currentBookings: 35 },
    { id: 'slot-4', label: 'Evening Snack Break (04:00 PM - 04:45 PM)', timeRange: '04:00 - 04:45 PM', maxCapacity: 50, currentBookings: 14 },
    { id: 'slot-5', label: 'Immediate Kitchen Prep (Next Available: ~12-15 mins)', timeRange: 'Immediate', maxCapacity: 100, currentBookings: 6 }
  ],
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_campus_demo_108',
  testMode: true,
  avgPreparationTimeMinutes: 12
};

const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'item-1',
    name: 'Mumbai Style Samosa Pav (2 pcs)',
    description: 'Crispy potato-stuffed samosas served in fresh pav with fiery garlic chutney, sweet tamarind, and fried green chillies.',
    price: 35,
    category: 'Snacks & Quick Bites',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 5,
    isAvailable: true,
    stock: 45,
    lowStockThreshold: 10,
    tags: ['Bestseller', 'Popular'],
    customizations: [
      {
        id: 'c-spice',
        title: 'Chutney & Spice Level',
        type: 'single',
        required: false,
        options: [
          { id: 'o-med', name: 'Regular Garlic & Green Chutney', priceDelta: 0 },
          { id: 'o-extra-spicy', name: 'Extra Fiery Dry Garlic Thecha', priceDelta: 0 },
          { id: 'o-sweet-only', name: 'Sweet Tamarind Chutney Only', priceDelta: 0 }
        ]
      },
      {
        id: 'c-cheese',
        title: 'Cheese Add-on',
        type: 'single',
        required: false,
        options: [
          { id: 'o-no-cheese', name: 'Classic (No Cheese)', priceDelta: 0 },
          { id: 'o-cheese', name: 'Grated Amul Cheese (+₹15)', priceDelta: 15 }
        ]
      }
    ]
  },
  {
    id: 'item-2',
    name: 'Indori Poha with Crispy Sev & Jeeravan',
    description: 'Steamed flattened rice tempered with mustard seeds, curry leaves, onions, roasted peanuts, topped with pomegranate and ratlami sev.',
    price: 30,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isVegan: true,
    prepTimeMinutes: 6,
    isAvailable: true,
    stock: 35,
    lowStockThreshold: 8,
    tags: ['Bestseller'],
    customizations: [
      {
        id: 'c-sev',
        title: 'Sev Preference',
        type: 'single',
        required: false,
        options: [
          { id: 'o-sev-reg', name: 'Standard Ratlami Sev', priceDelta: 0 },
          { id: 'o-sev-extra', name: 'Extra Sev & Fresh Lemon (+₹5)', priceDelta: 5 }
        ]
      }
    ]
  },
  {
    id: 'item-3',
    name: 'Butter Masala Dosa',
    description: 'Crispy golden crepe smeared with aromatic spiced potato masala and rich Amul butter. Served with piping hot sambar & coconut chutney.',
    price: 65,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 10,
    isAvailable: true,
    stock: 25,
    lowStockThreshold: 5,
    tags: ['Bestseller', "Today's Special"],
    customizations: [
      {
        id: 'c-dosa-style',
        title: 'Dosa Variant',
        type: 'single',
        required: false,
        options: [
          { id: 'd-butter', name: 'Amul Butter Masala', priceDelta: 0 },
          { id: 'd-mysore', name: 'Mysore Spicy Red Chutney (+₹15)', priceDelta: 15 },
          { id: 'd-cheese', name: 'Cheese Burst Masala (+₹25)', priceDelta: 25 }
        ]
      }
    ]
  },
  {
    id: 'item-4',
    name: 'Deluxe Paneer Special Thali',
    description: 'Wholesome student meal: Paneer Butter Masala, Dal Tadka, Seasonal Sabzi, Jeera Rice, 3 Butter Phulkas, Salad, Pickle, and Sweet Gulab Jamun.',
    price: 110,
    category: 'Meals & Thalis',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 12,
    isAvailable: true,
    stock: 20,
    lowStockThreshold: 5,
    tags: ['Popular', 'Budget Combo'],
    customizations: [
      {
        id: 'c-bread',
        title: 'Roti Choice',
        type: 'single',
        required: false,
        options: [
          { id: 'r-phulka', name: '3 Butter Phulkas', priceDelta: 0 },
          { id: 'r-paratha', name: '2 Tawa Parathas (+₹10)', priceDelta: 10 }
        ]
      }
    ]
  },
  {
    id: 'item-5',
    name: 'Veg Cheese Grilled Sandwich (Jumbo)',
    description: 'Triple-layer bread stuffed with cucumber, tomato, potato, capsicum, mint chutney, loaded with mozzarella and grilled golden with butter.',
    price: 70,
    category: 'Fast Food',
    imageUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 8,
    isAvailable: true,
    stock: 30,
    lowStockThreshold: 6,
    tags: ['Bestseller'],
    customizations: [
      {
        id: 'c-sauce',
        title: 'Dip Preference',
        type: 'single',
        required: false,
        options: [
          { id: 's-chips', name: 'Served with Wafers & Ketchup', priceDelta: 0 },
          { id: 's-mayo', name: 'Tandoori Mayo Dip (+₹10)', priceDelta: 10 }
        ]
      }
    ]
  },
  {
    id: 'item-6',
    name: 'Schezwan Veg Hakka Noodles',
    description: 'Wok-tossed noodles with shredded cabbage, carrots, bell peppers, spring onions, in our house-made spicy schezwan sauce.',
    price: 80,
    category: 'Fast Food',
    imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isVegan: true,
    prepTimeMinutes: 10,
    isAvailable: true,
    stock: 18,
    lowStockThreshold: 4,
    tags: ['Popular'],
    customizations: [
      {
        id: 'c-schez-spice',
        title: 'Spice Level',
        type: 'single',
        required: false,
        options: [
          { id: 'sp-med', name: 'Medium Spicy', priceDelta: 0 },
          { id: 'sp-high', name: 'Extra Hot Schezwan', priceDelta: 0 },
          { id: 'sp-mild', name: 'Mild (Non-spicy)', priceDelta: 0 }
        ]
      },
      {
        id: 'c-paneer-add',
        title: 'Add Crispy Paneer Cubes',
        type: 'single',
        required: false,
        options: [
          { id: 'pn-none', name: 'No Paneer', priceDelta: 0 },
          { id: 'pn-add', name: 'Tossed Paneer Cubes (+₹20)', priceDelta: 20 }
        ]
      }
    ]
  },
  {
    id: 'item-7',
    name: 'Thick Cold Coffee with Vanilla Ice Cream',
    description: 'Rich blended espresso coffee, chilled whole milk, creamy vanilla scoop, drizzled with Hershey’s chocolate syrup. The exam savior!',
    price: 50,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    stock: 50,
    lowStockThreshold: 10,
    tags: ['Bestseller', 'Popular'],
    customizations: [
      {
        id: 'c-sweet',
        title: 'Sugar Level',
        type: 'single',
        required: false,
        options: [
          { id: 'sg-normal', name: 'Regular Sweet', priceDelta: 0 },
          { id: 'sg-less', name: 'Less Sweet', priceDelta: 0 },
          { id: 'sg-none', name: 'Zero Sugar Added', priceDelta: 0 }
        ]
      },
      {
        id: 'c-choc',
        title: 'Extra Scoop',
        type: 'single',
        required: false,
        options: [
          { id: 'ex-none', name: 'Standard Single Scoop', priceDelta: 0 },
          { id: 'ex-choco', name: 'Double Ice Cream Scoop (+₹15)', priceDelta: 15 }
        ]
      }
    ]
  },
  {
    id: 'item-8',
    name: 'Special Adrak Elaichi Chai (Kulhad)',
    description: 'Slow-brewed strong Assam tea infused with freshly pounded ginger and cardamom. Served hot in an authentic earthen kulhad cup.',
    price: 18,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 3,
    isAvailable: true,
    stock: 100,
    lowStockThreshold: 15,
    tags: ['Bestseller'],
    customizations: []
  },
  {
    id: 'item-9',
    name: 'Amritsari Aloo Pyaaz Paratha Combo',
    description: 'Thick tandoori-style griddled paratha stuffed with spiced potato and onion mash. Served with Amul white butter, chilled curd, and mango pickle.',
    price: 60,
    category: 'Breakfast',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 9,
    isAvailable: true,
    stock: 22,
    lowStockThreshold: 5,
    tags: ['Popular'],
    customizations: [
      {
        id: 'c-dahi',
        title: 'Curd / Butter',
        type: 'single',
        required: false,
        options: [
          { id: 'cd-reg', name: 'Curd + Butter', priceDelta: 0 },
          { id: 'cd-extra', name: 'Extra Cup of Dahi (+₹10)', priceDelta: 10 }
        ]
      }
    ]
  },
  {
    id: 'item-10',
    name: 'Warm Walnut Chocolate Brownie',
    description: 'Fudgy Dutch chocolate brownie loaded with toasted walnuts, served warm with molten chocolate fudge drizzle.',
    price: 55,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    prepTimeMinutes: 4,
    isAvailable: true,
    stock: 14,
    lowStockThreshold: 4,
    tags: ['New'],
    customizations: [
      {
        id: 'c-brownie-ice',
        title: 'Add Vanilla Ice Cream',
        type: 'single',
        required: false,
        options: [
          { id: 'br-no-ice', name: 'Brownie Only', priceDelta: 0 },
          { id: 'br-ice', name: 'A La Mode (Vanilla Scoop) (+₹20)', priceDelta: 20 }
        ]
      }
    ]
  },
  {
    id: 'item-11',
    name: 'Egg Curry Rice Bowl',
    description: 'Two boiled eggs simmered in rich homestyle onion-tomato gravy, served over steaming basmati rice with kachumber salad.',
    price: 90,
    category: 'Meals & Thalis',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isEgg: true,
    prepTimeMinutes: 10,
    isAvailable: true,
    stock: 16,
    lowStockThreshold: 4,
    tags: ['Popular'],
    customizations: []
  },
  {
    id: 'item-12',
    name: 'Fresh Mosambi (Sweet Lime) Juice',
    description: 'Freshly cold-pressed sweet lime juice with a hint of black salt and mint. Made without artificial preservatives.',
    price: 40,
    category: 'Beverages',
    imageUrl: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=600&auto=format&fit=crop&q=80',
    isVeg: true,
    isVegan: true,
    prepTimeMinutes: 5,
    isAvailable: true,
    stock: 25,
    lowStockThreshold: 5,
    tags: ['Popular'],
    customizations: [
      {
        id: 'c-ice',
        title: 'Ice Preference',
        type: 'single',
        required: false,
        options: [
          { id: 'ic-norm', name: 'With Crushed Ice', priceDelta: 0 },
          { id: 'ic-none', name: 'No Ice (Pure Juice)', priceDelta: 0 }
        ]
      }
    ]
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'CAMPUS10',
    discountType: 'percentage',
    value: 10,
    minOrder: 50,
    maxDiscount: 40,
    validUntil: '2026-12-31',
    usageLimit: 1000,
    timesUsed: 42,
    description: 'Get 10% off on orders above ₹50 (Max ₹40 discount)',
    active: true
  },
  {
    code: 'FRESHER20',
    discountType: 'percentage',
    value: 20,
    minOrder: 80,
    maxDiscount: 50,
    validUntil: '2026-12-31',
    usageLimit: 500,
    timesUsed: 19,
    description: 'Welcome freshers! 20% off on your orders above ₹80',
    active: true
  },
  {
    code: 'EXAMBREAK',
    discountType: 'flat',
    value: 30,
    minOrder: 150,
    validUntil: '2026-12-31',
    usageLimit: 300,
    timesUsed: 11,
    description: 'Flat ₹30 off on study-session bulk orders above ₹150',
    active: true
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Canteen Operations Manager',
    email: 'boldmonty876@gmail.com', // Pre-configured admin from metadata
    role: 'admin',
    department: 'Canteen & Hospitality',
    phone: '+91 98765 00001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-staff-1',
    name: 'Counter Supervisor - Ravi Kumar',
    email: 'staff@campus.edu',
    role: 'staff',
    department: 'Food Services',
    phone: '+91 98765 00002',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-student-1',
    name: 'Aryan Sharma',
    email: 'aryan.sharma@campus.edu',
    role: 'student',
    studentId: 'AIT/2024/CS/104',
    department: 'Computer Science & Engineering',
    semester: 'Semester 5',
    phone: '+91 98111 22334',
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#B-101',
    pickupToken: '482915',
    userId: 'user-student-1',
    userName: 'Aryan Sharma',
    userEmail: 'aryan.sharma@campus.edu',
    userPhone: '+91 98111 22334',
    studentId: 'AIT/2024/CS/104',
    department: 'Computer Science',
    items: [
      {
        menuItemId: 'item-1',
        name: 'Mumbai Style Samosa Pav (2 pcs)',
        unitPrice: 35,
        quantity: 2,
        selectedCustomizations: [
          { groupId: 'c-spice', groupTitle: 'Chutney', optionId: 'o-med', optionName: 'Regular Garlic & Green Chutney', priceDelta: 0 }
        ],
        itemTotalPrice: 70
      },
      {
        menuItemId: 'item-8',
        name: 'Special Adrak Elaichi Chai (Kulhad)',
        unitPrice: 18,
        quantity: 1,
        selectedCustomizations: [],
        itemTotalPrice: 18
      }
    ],
    subtotal: 88,
    discount: 8.8,
    couponCode: 'CAMPUS10',
    tax: 3.96,
    total: 83.16,
    paymentMethod: 'razorpay',
    paymentStatus: 'verified',
    paymentDetails: {
      razorpayOrderId: 'order_DEMO_101',
      razorpayPaymentId: 'pay_DEMO_201',
      razorpaySignature: 'sig_verified_demo',
      paidAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
    },
    orderStatus: 'ready',
    pickupCounter: 'Counter 1 - Snacks & Quick Bites',
    pickupSlot: 'Immediate Kitchen Prep',
    estimatedReadyTime: '12 mins',
    specialInstructions: 'Please make chai extra hot.',
    createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    readyAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 'ord-102',
    orderNumber: '#B-102',
    pickupToken: '739201',
    userId: 'user-student-1',
    userName: 'Aryan Sharma',
    userEmail: 'aryan.sharma@campus.edu',
    userPhone: '+91 98111 22334',
    studentId: 'AIT/2024/CS/104',
    department: 'Computer Science',
    items: [
      {
        menuItemId: 'item-3',
        name: 'Butter Masala Dosa',
        unitPrice: 65,
        quantity: 1,
        selectedCustomizations: [
          { groupId: 'c-dosa-style', groupTitle: 'Variant', optionId: 'd-butter', optionName: 'Amul Butter Masala', priceDelta: 0 }
        ],
        itemTotalPrice: 65
      },
      {
        menuItemId: 'item-7',
        name: 'Thick Cold Coffee with Vanilla Ice Cream',
        unitPrice: 50,
        quantity: 1,
        selectedCustomizations: [
          { groupId: 'c-sweet', groupTitle: 'Sugar', optionId: 'sg-normal', optionName: 'Regular Sweet', priceDelta: 0 }
        ],
        itemTotalPrice: 50
      }
    ],
    subtotal: 115,
    discount: 11.5,
    couponCode: 'CAMPUS10',
    tax: 5.18,
    total: 108.68,
    paymentMethod: 'upi',
    paymentStatus: 'verified',
    paymentDetails: {
      razorpayOrderId: 'order_DEMO_102',
      razorpayPaymentId: 'pay_DEMO_202',
      razorpaySignature: 'sig_verified_demo',
      paidAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
    },
    orderStatus: 'preparing',
    pickupCounter: 'Counter 2 - Meals & Thali Station',
    pickupSlot: 'Lunch Break Shift 1',
    estimatedReadyTime: '10 mins',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 60 * 1000).toISOString()
  }
];

// Load or initialize DB
function loadDatabase(): Database {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error('Failed to read database file, initializing defaults:', err);
    }
  }
  const initialDb: Database = {
    config: DEFAULT_CONFIG,
    menu: DEFAULT_MENU,
    orders: DEFAULT_ORDERS,
    coupons: DEFAULT_COUPONS,
    users: DEFAULT_USERS
  };
  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write database file:', err);
  }
}

let db = loadDatabase();

// Ensure default admin exists
if (!db.users.some(u => u.email === 'boldmonty876@gmail.com')) {
  db.users.push({
    id: 'admin-' + Date.now(),
    name: 'Canteen Operations Manager',
    email: 'boldmonty876@gmail.com',
    role: 'admin',
    department: 'Campus Administration',
    phone: '+91 98765 00001',
    createdAt: new Date().toISOString()
  });
  saveDatabase(db);
}

// Server-Sent Events subscribers for instant live order dispatching
const sseClients: express.Response[] = [];

function broadcastEvent(type: string, data: any) {
  const payload = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(res => {
    try {
      res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// Helper to generate unique order numbers like #B-109
let orderCounter = 103;
function generateOrderNumber(): string {
  const prefix = 'B';
  const num = orderCounter++;
  return `#${prefix}-${num}`;
}

// Generate random secure 6-digit pickup token (e.g. "839120")
function generatePickupToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// =================== API ROUTES ===================

// SSE Endpoint for Live Kitchen and Live Order Tracking updates
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });
  res.write('\n');
  sseClients.push(res);

  req.on('close', () => {
    const idx = sseClients.indexOf(res);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// Config APIs
app.get('/api/config', (req, res) => {
  res.json({
    ...db.config,
    // Return key id for client checkout, never leak secret
    razorpayKeyId: db.config.razorpayKeyId || 'rzp_test_campus_demo_108',
  });
});

app.post('/api/config', (req, res) => {
  const updates = req.body;
  db.config = { ...db.config, ...updates };
  saveDatabase(db);
  broadcastEvent('config_updated', db.config);
  res.json({ success: true, config: db.config });
});

// Menu APIs
app.get('/api/menu', (req, res) => {
  res.json(db.menu);
});

app.post('/api/menu', (req, res) => {
  const item: MenuItem = {
    ...req.body,
    id: 'item-' + Date.now(),
    stock: Number(req.body.stock) || 30,
    lowStockThreshold: Number(req.body.lowStockThreshold) || 5,
    isAvailable: req.body.isAvailable !== false,
    tags: req.body.tags || []
  };
  db.menu.unshift(item);
  saveDatabase(db);
  broadcastEvent('menu_updated', db.menu);
  res.status(201).json(item);
});

app.put('/api/menu/:id', (req, res) => {
  const index = db.menu.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  db.menu[index] = { ...db.menu[index], ...req.body, id: req.params.id };
  saveDatabase(db);
  broadcastEvent('menu_updated', db.menu);
  res.json(db.menu[index]);
});

app.patch('/api/menu/:id/availability', (req, res) => {
  const index = db.menu.findIndex(m => m.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Item not found' });
  }
  if (typeof req.body.isAvailable === 'boolean') {
    db.menu[index].isAvailable = req.body.isAvailable;
  }
  if (typeof req.body.stock === 'number') {
    db.menu[index].stock = req.body.stock;
    if (db.menu[index].stock <= 0) {
      db.menu[index].isAvailable = false;
    }
  }
  saveDatabase(db);
  broadcastEvent('menu_updated', db.menu);
  res.json(db.menu[index]);
});

app.delete('/api/menu/:id', (req, res) => {
  db.menu = db.menu.filter(m => m.id !== req.params.id);
  saveDatabase(db);
  broadcastEvent('menu_updated', db.menu);
  res.json({ success: true });
});

// Coupons APIs
app.get('/api/coupons', (req, res) => {
  res.json(db.coupons);
});

app.post('/api/coupons', (req, res) => {
  const coupon: Coupon = {
    ...req.body,
    code: req.body.code.toUpperCase().trim(),
    timesUsed: 0,
    active: req.body.active !== false
  };
  const existingIdx = db.coupons.findIndex(c => c.code === coupon.code);
  if (existingIdx !== -1) {
    db.coupons[existingIdx] = coupon;
  } else {
    db.coupons.push(coupon);
  }
  saveDatabase(db);
  res.json(coupon);
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code required' });
  }
  const coupon = db.coupons.find(c => c.code === code.toUpperCase().trim() && c.active);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or inactive coupon code' });
  }
  if (coupon.validUntil && new Date(coupon.validUntil) < new Date()) {
    return res.status(400).json({ error: 'Coupon has expired' });
  }
  if (coupon.timesUsed >= coupon.usageLimit) {
    return res.status(400).json({ error: 'Coupon usage limit reached' });
  }
  if (subtotal < coupon.minOrder) {
    return res.status(400).json({ 
      error: `Minimum order amount of ₹${coupon.minOrder} required for coupon ${coupon.code}` 
    });
  }

  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  res.json({
    valid: true,
    code: coupon.code,
    discount: Number(discount.toFixed(2)),
    description: coupon.description
  });
});

// Auth APIs
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  const cleanEmail = email.toLowerCase().trim();
  
  // Find user or auto-create demo user
  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    // If college email domain is enforced
    if (db.config.enforceCollegeDomain && !cleanEmail.endsWith(`@${db.config.collegeEmailDomain}`)) {
      return res.status(400).json({ 
        error: `Institutional access only: Please sign in with your @${db.config.collegeEmailDomain} college email.` 
      });
    }

    user = {
      id: 'usr-' + Date.now(),
      name: cleanEmail.split('@')[0].replace('.', ' ').toUpperCase(),
      email: cleanEmail,
      role: role || (cleanEmail.includes('admin') || cleanEmail === 'boldmonty876@gmail.com' ? 'admin' : 'student'),
      studentId: 'AIT/' + Math.floor(1000 + Math.random() * 9000),
      department: 'Engineering',
      semester: 'Semester 4',
      phone: '+91 98000 ' + Math.floor(10000 + Math.random() * 90000),
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    saveDatabase(db);
  }
  res.json({ user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, studentId, department, semester, phone, role } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const cleanEmail = email.toLowerCase().trim();

  if (db.config.enforceCollegeDomain && !cleanEmail.endsWith(`@${db.config.collegeEmailDomain}`)) {
    return res.status(400).json({ 
      error: `Institutional verification failed: Email must end with @${db.config.collegeEmailDomain}` 
    });
  }

  let user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (user) {
    return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
  }

  const assignedRole = cleanEmail === 'boldmonty876@gmail.com' ? 'admin' : (role || 'student');

  user = {
    id: 'usr-' + Date.now(),
    name,
    email: cleanEmail,
    role: assignedRole,
    studentId: studentId || ('AIT/' + Math.floor(1000 + Math.random() * 9000)),
    department: department || 'General Sciences',
    semester: semester || 'Semester 1',
    phone: phone || '+91 98000 00000',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  saveDatabase(db);
  res.status(201).json({ user });
});

app.get('/api/users', (req, res) => {
  res.json(db.users);
});

// Orders & Payment APIs
app.post('/api/payments/create-order', (req, res) => {
  const { items, couponCode, pickupCounter, pickupSlot, specialInstructions, user } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  // Server-side validation of item prices & stock
  let subtotal = 0;
  const verifiedSnapshots = [];

  for (const item of items) {
    const menuItem = db.menu.find(m => m.id === item.menuItemId);
    if (!menuItem) {
      return res.status(400).json({ error: `Menu item not found: ${item.name}` });
    }
    if (!menuItem.isAvailable || menuItem.stock < item.quantity) {
      return res.status(400).json({ 
        error: `Sorry, "${menuItem.name}" is sold out or has insufficient stock (${menuItem.stock} remaining).` 
      });
    }

    // Calculate customizations price delta
    let customDelta = 0;
    if (item.selectedCustomizations && item.selectedCustomizations.length) {
      for (const sc of item.selectedCustomizations) {
        customDelta += Number(sc.priceDelta) || 0;
      }
    }

    const unitPrice = menuItem.price + customDelta;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    verifiedSnapshots.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice,
      quantity: item.quantity,
      selectedCustomizations: item.selectedCustomizations || [],
      itemTotalPrice: itemTotal
    });
  }

  if (subtotal < db.config.minOrderAmount) {
    return res.status(400).json({ 
      error: `Minimum order amount is ₹${db.config.minOrderAmount}. Current subtotal is ₹${subtotal}.` 
    });
  }

  // Validate discount coupon on server
  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.active);
    if (coupon && subtotal >= coupon.minOrder) {
      if (coupon.discountType === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
      } else {
        discount = Math.min(coupon.value, subtotal);
      }
      coupon.timesUsed += 1;
    }
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = Number(((taxableAmount * db.config.taxPercent) / 100).toFixed(2));
  const finalTotal = Number((taxableAmount + tax).toFixed(2));

  // Server generates Razorpay Order ID or test sandbox order
  const razorpayOrderId = 'order_' + crypto.randomBytes(8).toString('hex');

  // Create pending order
  const orderId = 'ord-' + Date.now();
  const orderNumber = generateOrderNumber();
  const pickupToken = generatePickupToken();

  const newOrder: Order = {
    id: orderId,
    orderNumber,
    pickupToken,
    userId: user?.id || 'guest',
    userName: user?.name || 'Campus Student',
    userEmail: user?.email || 'student@campus.edu',
    userPhone: user?.phone || '+91 98000 00000',
    studentId: user?.studentId,
    department: user?.department,
    items: verifiedSnapshots,
    subtotal,
    discount: Number(discount.toFixed(2)),
    couponCode: couponCode || undefined,
    tax,
    total: finalTotal,
    paymentMethod: 'razorpay',
    paymentStatus: 'pending',
    paymentDetails: {
      razorpayOrderId
    },
    orderStatus: 'payment_pending',
    pickupCounter: pickupCounter || db.config.pickupCounters[0],
    pickupSlot: pickupSlot || 'Immediate Kitchen Prep',
    estimatedReadyTime: `${db.config.avgPreparationTimeMinutes} mins`,
    specialInstructions: specialInstructions || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);

  res.json({
    orderId: newOrder.id,
    orderNumber: newOrder.orderNumber,
    razorpayOrderId,
    amount: Math.round(finalTotal * 100), // amount in paise
    currency: 'INR',
    keyId: db.config.razorpayKeyId,
    order: newOrder
  });
});

// Server-side Payment Verification
app.post('/api/payments/verify', (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature, testModeAutoApprove } = req.body;

  const orderIndex = db.orders.findIndex(o => o.id === orderId);
  if (orderIndex === -1) {
    return res.status(404).json({ error: 'Order not found for verification.' });
  }

  const order = db.orders[orderIndex];

  // Prevent double processing
  if (order.paymentStatus === 'verified') {
    return res.json({ success: true, order, message: 'Payment already verified.' });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_secret_campus_demo_108';

  // Signature validation
  let isValid = false;
  if (testModeAutoApprove || db.config.testMode) {
    // In dev / test mode with sandbox simulation
    isValid = true;
  } else if (razorpayOrderId && razorpayPaymentId && razorpaySignature) {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    isValid = expectedSignature === razorpaySignature;
  }

  if (!isValid) {
    order.paymentStatus = 'failed';
    order.orderStatus = 'cancelled';
    order.cancellationReason = 'Payment signature verification failed';
    saveDatabase(db);
    broadcastEvent('order_updated', order);
    return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
  }

  // Deduct inventory atomically on verified payment
  for (const item of order.items) {
    const mItem = db.menu.find(m => m.id === item.menuItemId);
    if (mItem) {
      mItem.stock = Math.max(0, mItem.stock - item.quantity);
      if (mItem.stock === 0) {
        mItem.isAvailable = false;
      }
    }
  }

  order.paymentStatus = 'verified';
  order.orderStatus = 'paid'; // Immediately paid, canteen will accept
  order.paymentDetails = {
    razorpayOrderId,
    razorpayPaymentId: razorpayPaymentId || ('pay_' + crypto.randomBytes(7).toString('hex')),
    razorpaySignature: razorpaySignature || 'simulated_sig_ok',
    paidAt: new Date().toISOString()
  };
  order.updatedAt = new Date().toISOString();

  saveDatabase(db);
  broadcastEvent('order_created', order);
  broadcastEvent('menu_updated', db.menu);

  res.json({
    success: true,
    order
  });
});

// Alternative direct order creation for Cash on Pickup (if enabled by admin)
app.post('/api/orders/cash-on-pickup', (req, res) => {
  if (!db.config.allowCashOnPickup) {
    return res.status(400).json({ error: 'Cash on pickup is currently disabled by canteen management.' });
  }

  const { items, couponCode, pickupCounter, pickupSlot, specialInstructions, user } = req.body;
  if (!items || !items.length) {
    return res.status(400).json({ error: 'Order must contain items.' });
  }

  let subtotal = 0;
  const verifiedSnapshots = [];

  for (const item of items) {
    const menuItem = db.menu.find(m => m.id === item.menuItemId);
    if (!menuItem || !menuItem.isAvailable || menuItem.stock < item.quantity) {
      return res.status(400).json({ error: `Item ${item.name} is unavailable or out of stock.` });
    }
    let customDelta = 0;
    if (item.selectedCustomizations) {
      for (const sc of item.selectedCustomizations) customDelta += sc.priceDelta || 0;
    }
    const unitPrice = menuItem.price + customDelta;
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;
    verifiedSnapshots.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      unitPrice,
      quantity: item.quantity,
      selectedCustomizations: item.selectedCustomizations || [],
      itemTotalPrice: itemTotal
    });

    // Deduct stock
    menuItem.stock = Math.max(0, menuItem.stock - item.quantity);
    if (menuItem.stock === 0) menuItem.isAvailable = false;
  }

  let discount = 0;
  if (couponCode) {
    const coupon = db.coupons.find(c => c.code === couponCode.toUpperCase().trim() && c.active);
    if (coupon && subtotal >= coupon.minOrder) {
      discount = coupon.discountType === 'percentage' 
        ? Math.min((subtotal * coupon.value) / 100, coupon.maxDiscount || Infinity)
        : Math.min(coupon.value, subtotal);
      coupon.timesUsed += 1;
    }
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = Number(((taxable * db.config.taxPercent) / 100).toFixed(2));
  const total = Number((taxable + tax).toFixed(2));

  const newOrder: Order = {
    id: 'ord-' + Date.now(),
    orderNumber: generateOrderNumber(),
    pickupToken: generatePickupToken(),
    userId: user?.id || 'guest',
    userName: user?.name || 'Campus Student',
    userEmail: user?.email || 'student@campus.edu',
    userPhone: user?.phone || '+91 98000 00000',
    studentId: user?.studentId,
    department: user?.department,
    items: verifiedSnapshots,
    subtotal,
    discount: Number(discount.toFixed(2)),
    couponCode: couponCode || undefined,
    tax,
    total,
    paymentMethod: 'counter_cash',
    paymentStatus: 'pending',
    orderStatus: 'placed',
    pickupCounter: pickupCounter || db.config.pickupCounters[0],
    pickupSlot: pickupSlot || 'Immediate Kitchen Prep',
    estimatedReadyTime: `${db.config.avgPreparationTimeMinutes} mins`,
    specialInstructions: specialInstructions || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.orders.unshift(newOrder);
  saveDatabase(db);
  broadcastEvent('order_created', newOrder);
  broadcastEvent('menu_updated', db.menu);

  res.status(201).json({ success: true, order: newOrder });
});

// Orders retrieval & management
app.get('/api/orders', (req, res) => {
  const { userId, role } = req.query;
  if (role === 'admin' || role === 'staff') {
    return res.json(db.orders);
  }
  if (userId) {
    const userOrders = db.orders.filter(o => o.userId === userId);
    return res.json(userOrders);
  }
  res.json(db.orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

// Update order status (Staff / Admin Kitchen workflow)
app.patch('/api/orders/:id/status', (req, res) => {
  const { status, rejectionReason } = req.body as { status: OrderStatus; rejectionReason?: string };
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

  const order = db.orders[orderIndex];
  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'ready') {
    order.readyAt = new Date().toISOString();
  } else if (status === 'collected') {
    order.collectedAt = new Date().toISOString();
    if (order.paymentMethod === 'counter_cash') {
      order.paymentStatus = 'verified';
    }
  } else if (status === 'rejected') {
    order.rejectionReason = rejectionReason || 'Kitchen is experiencing high volume.';
    // Restore stock if rejected
    for (const item of order.items) {
      const mItem = db.menu.find(m => m.id === item.menuItemId);
      if (mItem) mItem.stock += item.quantity;
    }
  }

  saveDatabase(db);
  broadcastEvent('order_updated', order);
  res.json(order);
});

// Counter pickup token verification (Staff scans QR or types 6-digit token)
app.post('/api/orders/verify-pickup', (req, res) => {
  const { token, orderNumber } = req.body;
  if (!token && !orderNumber) {
    return res.status(400).json({ error: 'Pickup token or Order Number is required.' });
  }

  const cleanToken = token ? token.trim() : null;
  const cleanOrderNum = orderNumber ? orderNumber.trim().toUpperCase() : null;

  const order = db.orders.find(o => 
    (cleanToken && o.pickupToken === cleanToken) || 
    (cleanOrderNum && o.orderNumber.toUpperCase() === cleanOrderNum)
  );

  if (!order) {
    return res.status(404).json({ error: 'No matching order found for this token or order number.' });
  }

  if (order.orderStatus === 'collected') {
    return res.status(400).json({ error: 'Order has already been collected.', order });
  }

  if (order.orderStatus === 'cancelled' || order.orderStatus === 'rejected') {
    return res.status(400).json({ error: `Cannot verify pickup: Order was ${order.orderStatus}.` });
  }

  // Mark as collected
  order.orderStatus = 'collected';
  order.collectedAt = new Date().toISOString();
  order.updatedAt = new Date().toISOString();
  if (order.paymentMethod === 'counter_cash') {
    order.paymentStatus = 'verified';
  }

  saveDatabase(db);
  broadcastEvent('order_updated', order);

  res.json({
    success: true,
    message: `Order ${order.orderNumber} successfully marked as COLLECTED for student ${order.userName}.`,
    order
  });
});

// Student Cancel Order API (Allowed only if status is placed, payment_pending, or paid before accepted)
app.post('/api/orders/:id/cancel', (req, res) => {
  const { reason, userId } = req.body;
  const orderIndex = db.orders.findIndex(o => o.id === req.params.id);
  if (orderIndex === -1) return res.status(404).json({ error: 'Order not found' });

  const order = db.orders[orderIndex];
  
  if (['preparing', 'ready', 'collected'].includes(order.orderStatus)) {
    return res.status(400).json({ 
      error: 'Cannot cancel order: Food is already being prepared or is ready for pickup at the counter.' 
    });
  }

  order.orderStatus = 'cancelled';
  order.cancellationReason = reason || 'Cancelled by student before kitchen preparation';
  order.updatedAt = new Date().toISOString();

  // Restore inventory
  for (const item of order.items) {
    const mItem = db.menu.find(m => m.id === item.menuItemId);
    if (mItem) mItem.stock += item.quantity;
  }

  saveDatabase(db);
  broadcastEvent('order_updated', order);
  broadcastEvent('menu_updated', db.menu);

  res.json({ success: true, order });
});

// Admin Analytics & Reports API
app.get('/api/reports/summary', (req, res) => {
  const verifiedOrders = db.orders.filter(o => o.paymentStatus === 'verified' && o.orderStatus !== 'cancelled');
  const today = new Date().toISOString().split('T')[0];
  const todayOrders = verifiedOrders.filter(o => o.createdAt.startsWith(today));

  const totalRevenueToday = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrdersToday = todayOrders.length;
  const activeOrders = db.orders.filter(o => ['paid', 'accepted', 'preparing', 'ready'].includes(o.orderStatus)).length;
  const ordersAwaitingAcceptance = db.orders.filter(o => o.orderStatus === 'paid' || o.orderStatus === 'placed').length;

  // Item rankings
  const itemCounts: Record<string, { name: string; count: number; revenue: number }> = {};
  for (const order of verifiedOrders) {
    for (const item of order.items) {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = { name: item.name, count: 0, revenue: 0 };
      }
      itemCounts[item.name].count += item.quantity;
      itemCounts[item.name].revenue += item.itemTotalPrice;
    }
  }

  const popularItems = Object.values(itemCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Category breakdown
  const categoryRevenue: Record<string, number> = {};
  for (const order of verifiedOrders) {
    for (const item of order.items) {
      const menuItem = db.menu.find(m => m.id === item.menuItemId);
      const cat = menuItem?.category || 'Other';
      categoryRevenue[cat] = (categoryRevenue[cat] || 0) + item.itemTotalPrice;
    }
  }

  res.json({
    totalRevenueToday: Number(totalRevenueToday.toFixed(2)),
    totalOrdersToday,
    activeOrders,
    ordersAwaitingAcceptance,
    averagePrepTimeMinutes: db.config.avgPreparationTimeMinutes,
    cancelledOrdersCount: db.orders.filter(o => o.orderStatus === 'cancelled').length,
    popularItems,
    categoryRevenue
  });
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Campus Canteen] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
