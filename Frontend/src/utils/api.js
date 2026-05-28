import axios from 'axios';

// AXIS WEAR - In-Browser Mock Database API Wrapper
// This replaces the backend entirely, providing persistent CRUD in localStorage when backend endpoints are unavailable.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const storedAdmin = localStorage.getItem('adminInfo');
      if (storedAdmin) {
        const token = JSON.parse(storedAdmin)?.token;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const shouldUseBackend = (url) => {
  return (
    url.startsWith('/auth') ||
    url.startsWith('/upload') ||
    url.startsWith('/orders') ||
    url.startsWith('/admin/settings') ||
    url.startsWith('/categories') ||
    url.startsWith('/products') ||
    url.startsWith('/dashboard') ||
    url.startsWith('/notifications') ||
    url.startsWith('/coupons')
  );
};

const normalizeBackendResponse = (response) => {
  if (response?.data?.orders) return { data: response.data.orders };
  if (response?.data?.order) return { data: response.data.order };
  if (response?.data?.categories) return { data: response.data.categories };
  if (response?.data?.products) return { data: response.data.products };
  if (response?.data?.product) return { data: response.data.product };
  return { data: response.data };
};

const DELAY_MS = 250; // Simulate network latency

const defaultCategories = [
  { _id: 'cat_1', name: 'T-Shirts', createdAt: new Date().toISOString() },
  { _id: 'cat_2', name: 'Trousers', createdAt: new Date().toISOString() },
  { _id: 'cat_3', name: 'Track Suits', createdAt: new Date().toISOString() },
  { _id: 'cat_4', name: 'Hoodies & Jackets', createdAt: new Date().toISOString() },
  { _id: 'cat_5', name: 'Accessories', createdAt: new Date().toISOString() }
];

const defaultProducts = [
  {
    _id: 'prod_1',
    name: 'Stealth Cyber Bomber Jacket',
    description: 'Uncompromising urban style meets military technical specs. Water-resistant matte nylon shell with premium thermal padding, multi-strap adjustments, and utility sleeves. Finished in deep metallic carbon black.',
    category: { _id: 'cat_4', name: 'Hoodies & Jackets' },
    price: 129.99,
    discount: 15,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Stealth Black', 'Slate Grey'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_2',
    name: 'Minimalist Heavyweight Tee',
    description: 'Crafted from 300GSM long-staple organic cotton. A structured boxy drape with reinforced neck ribbing and drop-shoulder lines. Minimalist design for everyday rotation.',
    category: { _id: 'cat_1', name: 'T-Shirts' },
    price: 39.99,
    discount: 0,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Chalk White', 'Teal Glow', 'Slate Grey'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_3',
    name: 'AeroWeave Athletic Track Pants',
    description: 'Engineered from ultra-breathable four-way stretch fabric. Hidden pocket details, custom anodized cord ends, and tapered aesthetic cuts. Ideal for street commutes and training.',
    category: { _id: 'cat_2', name: 'Trousers' },
    price: 64.99,
    discount: 0,
    sizes: ['M', 'L', 'XL'],
    colors: ['Slate Grey', 'Stealth Black'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_4',
    name: 'Metallic Accent Cyber Hood',
    description: 'Features premium metallic-weave drawstrings and double-lined hood architecture. Deep kangaroo pouch with integrated zippered secret pocket. Brushed fleece inside for cloud-like comfort.',
    category: { _id: 'cat_4', name: 'Hoodies & Jackets' },
    price: 89.99,
    discount: 10,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: ['Teal Glow', 'Matte Carbon'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_5',
    name: 'Vanguard Woolen Knit Sweater',
    description: 'Heavy rib-knit silhouette made from 100% fine merino wool. Natural thermal regulation, soft hand-feel, and luxurious texture.',
    category: { _id: 'cat_1', name: 'T-Shirts' },
    price: 95.00,
    discount: 0,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Cream Ivory', 'Slate Grey'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  },
  {
    _id: 'prod_6',
    name: 'Tech-Utility Combat Cargo',
    description: 'Water-repellent technical canvas fabric. Custom pocket configurations, modular strap fittings, and adjustable cuffs for high-utility styling.',
    category: { _id: 'cat_2', name: 'Trousers' },
    price: 79.99,
    discount: 0,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Midnight Black', 'Olive Drab'],
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800'
    ],
    createdAt: new Date().toISOString()
  }
];

const defaultOrders = [
  {
    _id: 'ord_1',
    orderNumber: 'AX-10029',
    customerName: 'Marcus Vance',
    phoneNumber: '+92 300 1234567',
    shippingAddress: {
      name: 'Marcus Vance',
      phone: '+92 300 1234567',
      address: '10-A Clifton Block 2',
      city: 'Karachi'
    },
    orderItems: [
      {
        product: 'prod_1',
        name: 'Stealth Cyber Bomber Jacket',
        qty: 1,
        size: 'L',
        color: 'Stealth Black',
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800',
        price: 110.49
      }
    ],
    paymentMethod: 'Cash on Delivery',
    paymentStatus: 'Pending',
    verificationChannel: 'WhatsApp',
    verificationCode: '654321',
    totalPrice: 110.49,
    shippingFee: 400,
    coupon: null,
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    _id: 'ord_2',
    orderNumber: 'AX-10030',
    customerName: 'Elena Rostova',
    phoneNumber: '+92 321 9876543',
    whatsappNumber: '+92 321 9876543',
    shippingAddress: {
      name: 'Elena Rostova',
      phone: '+92 321 9876543',
      address: 'House 18, Gulberg III',
      city: 'Lahore'
    },
    orderItems: [
      {
        product: 'prod_2',
        name: 'Minimalist Heavyweight Tee',
        qty: 2,
        size: 'M',
        color: 'Teal Glow',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
        price: 39.99
      }
    ],
    paymentMethod: 'Online Payment',
    paymentStatus: 'Paid',
    verificationChannel: 'WhatsApp',
    verificationCode: '783210',
    totalPrice: 79.98,
    shippingFee: 0,
    coupon: { code: 'WELCOME250', discountAmount: 250 },
    status: 'Delivered',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
  }
];

const defaultCoupons = [
  {
    code: 'AXIS100',
    discountAmount: 100,
    description: 'Flat PKR 100 off on your first order'
  },
  {
    code: 'PKR30',
    discountPercent: 30,
    description: '30% discount for orders above PKR 3,000'
  }
];

const defaultAdminSettings = {
  whatsappNumber: '+92 310 1748362',
  email: 'ab8432202@gmail.com'
};

const defaultNotifications = [];

// Helper to initialize and retrieve localStorage tables
const getDBTable = (table, defaults) => {
  const data = localStorage.getItem(`axis_${table}`);
  if (!data) {
    localStorage.setItem(`axis_${table}`, JSON.stringify(defaults));
    return defaults;
  }
  return JSON.parse(data);
};

const saveDBTable = (table, data) => {
  localStorage.setItem(`axis_${table}`, JSON.stringify(data));
};

const resolveCategoryObject = (category, categories) => {
  if (!category) return { _id: 'uncategorized', name: 'Uncategorized' };
  if (typeof category === 'string') {
    return categories.find((c) => c._id === category) || { _id: category, name: 'Uncategorized' };
  }
  if (typeof category === 'object') {
    return categories.find((c) => c._id === category._id) || category;
  }
  return { _id: 'uncategorized', name: 'Uncategorized' };
};

const findLocalProductById = (id) => {
  const products = getDBTable('products', defaultProducts);
  const categories = getDBTable('categories', defaultCategories);
  const product = products.find((p) => p._id === id);
  if (!product) return null;
  return { ...product, category: resolveCategoryObject(product.category, categories) };
};

const findLocalProducts = (url) => {
  const products = getDBTable('products', defaultProducts);
  const categories = getDBTable('categories', defaultCategories);

  let filtered = products.map((p) => ({
    ...p,
    category: resolveCategoryObject(p.category, categories)
  }));

  if (url.includes('?')) {
    const queryStr = url.split('?')[1];
    const params = new URLSearchParams(queryStr);
    const categoryFilter = params.get('category');
    const sizeFilter = params.get('size');
    const priceMin = params.get('priceMin');
    const priceMax = params.get('priceMax');

    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category._id === categoryFilter || p.category.name === categoryFilter);
    }
    if (sizeFilter) {
      filtered = filtered.filter((p) => Array.isArray(p.sizes) && p.sizes.includes(sizeFilter));
    }
    if (priceMin) {
      filtered = filtered.filter((p) => {
        const currentPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
        return currentPrice >= Number(priceMin);
      });
    }
    if (priceMax) {
      filtered = filtered.filter((p) => {
        const currentPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
        return currentPrice <= Number(priceMax);
      });
    }
  }

  return filtered;
};

// Database migration / seed checker to eliminate legacy schema mismatch
const DB_VERSION = "v1.2";
const initDB = () => {
  const currentVersion = localStorage.getItem("axis_db_version");
  if (currentVersion !== DB_VERSION) {
    localStorage.removeItem("axis_products");
    localStorage.removeItem("axis_categories");
    localStorage.removeItem("axis_orders");
    localStorage.setItem("axis_db_version", DB_VERSION);
  }

  getDBTable('products', defaultProducts);
  getDBTable('categories', defaultCategories);
  getDBTable('orders', defaultOrders);
  getDBTable('adminSettings', defaultAdminSettings);
  getDBTable('notifications', defaultNotifications);
};

initDB();

// Delay simulation helper
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const api = {
  // Axios interceptors stub to avoid runtime crashes
  interceptors: {
    request: { use: () => { } },
    response: { use: () => { } }
  },

  get: async (url, config) => {
    if (shouldUseBackend(url)) {
      try {
        const response = await axiosInstance.get(url, config);
        return normalizeBackendResponse(response);
      } catch (backendError) {
        if (url.startsWith('/products')) {
          if (url === '/products' || url.startsWith('/products?')) {
            return { data: findLocalProducts(url) };
          }
          const id = url.split('/products/')[1];
          const product = findLocalProductById(id);
          if (product) return { data: product };
        }
        throw backendError;
      }
    }

    await delay(DELAY_MS);

    // 1. GET /products
    if (url === '/products' || url.startsWith('/products?')) {
      const products = getDBTable('products', defaultProducts);
      const categories = getDBTable('categories', defaultCategories);

      // Parse query params if any
      if (url.includes('?')) {
        const queryStr = url.split('?')[1];
        const params = new URLSearchParams(queryStr);

        const categoryFilter = params.get('category');
        const sizeFilter = params.get('size');
        const priceMin = params.get('priceMin');
        const priceMax = params.get('priceMax');

        let filtered = products.map(p => {
          // Ensure category is populated with its full object
          const fullCat = categories.find(c => c._id === (p.category?._id || p.category)) || { name: 'Uncategorized' };
          return { ...p, category: fullCat };
        });

        if (categoryFilter) {
          filtered = filtered.filter(p => p.category._id === categoryFilter || p.category.name === categoryFilter);
        }
        if (sizeFilter) {
          filtered = filtered.filter(p => p.sizes.includes(sizeFilter));
        }
        if (priceMin) {
          filtered = filtered.filter(p => {
            const currentPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            return currentPrice >= Number(priceMin);
          });
        }
        if (priceMax) {
          filtered = filtered.filter(p => {
            const currentPrice = p.discount > 0 ? p.price * (1 - p.discount / 100) : p.price;
            return currentPrice <= Number(priceMax);
          });
        }

        return { data: filtered };
      }

      // Populate categories by default
      const populated = products.map(p => {
        const fullCat = categories.find(c => c._id === (p.category?._id || p.category)) || { name: 'Uncategorized' };
        return { ...p, category: fullCat };
      });

      return { data: populated };
    }

    // 2. GET /products/:id
    if (url.startsWith('/products/')) {
      const id = url.split('/products/')[1];
      const products = getDBTable('products', defaultProducts);
      const categories = getDBTable('categories', defaultCategories);

      const product = products.find(p => p._id === id);
      if (!product) throw new Error('Product not found');

      const fullCat = categories.find(c => c._id === (product.category?._id || product.category)) || { name: 'Uncategorized' };
      return { data: { ...product, category: fullCat } };
    }

    // 3. GET /categories
    if (url === '/categories') {
      const categories = getDBTable('categories', defaultCategories);
      return { data: categories };
    }

    // 4. GET /orders
    if (url === '/orders' || url.startsWith('/orders?')) {
      const orders = getDBTable('orders', defaultOrders);
      if (url.includes('?')) {
        const queryStr = url.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const status = params.get('status');
        const paymentStatus = params.get('paymentStatus');
        const from = params.get('from');
        const to = params.get('to');
        const customer = params.get('customer');
        const orderNumber = params.get('orderNumber');

        let filtered = [...orders];
        if (status) filtered = filtered.filter(o => o.status === status);
        if (paymentStatus) filtered = filtered.filter(o => o.paymentStatus === paymentStatus);
        if (orderNumber) filtered = filtered.filter(o => o.orderNumber.toLowerCase().includes(orderNumber.toLowerCase()));
        const phoneNumber = params.get('phoneNumber');
        if (phoneNumber) filtered = filtered.filter(o => (o.phoneNumber && o.phoneNumber.includes(phoneNumber)) || (o.whatsappNumber && o.whatsappNumber.includes(phoneNumber)));
        if (customer) filtered = filtered.filter(o => o.customerName.toLowerCase().includes(customer.toLowerCase()));
        if (from) {
          filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(from));
        }
        if (to) {
          filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(to + 'T23:59:59'));
        }
        return { data: filtered };
      }
      return { data: orders };
    }

    // 5. GET /admin/settings
    if (url === '/admin/settings') {
      const settings = getDBTable('adminSettings', defaultAdminSettings);
      return { data: settings };
    }

    // 6. GET /notifications
    if (url === '/notifications' || url.startsWith('/notifications?')) {
      const notifications = getDBTable('notifications', defaultNotifications);
      if (url.includes('?')) {
        const queryStr = url.split('?')[1];
        const params = new URLSearchParams(queryStr);
        const orderNumber = params.get('orderNumber');
        const status = params.get('status');

        let filtered = [...notifications];
        if (orderNumber) {
          filtered = filtered.filter((n) => n.orderNumber.toLowerCase().includes(orderNumber.toLowerCase()));
        }
        if (status) {
          filtered = filtered.filter((n) => n.status === status);
        }
        return { data: filtered };
      }
      return { data: notifications };
    }

    // 7. GET /coupons
    if (url.startsWith('/coupons')) {
      const params = new URLSearchParams(url.split('?')[1] || '');
      const code = params.get('code');
      if (!code) throw new Error('Coupon code is required');
      const coupon = defaultCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
      if (!coupon) throw new Error('Coupon not found or expired');
      return { data: coupon };
    }

    // 7. GET /dashboard/stats or /dashboard
    if (url === '/dashboard' || url === '/dashboard/stats') {
      const products = getDBTable('products', defaultProducts);
      const orders = getDBTable('orders', defaultOrders);

      const totalSales = orders
        .filter(o => o.status !== 'Cancelled')
        .reduce((acc, o) => acc + o.totalPrice, 0);

      const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

      const now = new Date();
      const todayString = now.toISOString().slice(0, 10);
      const monthIndex = now.getMonth();
      const year = now.getFullYear();

      const todayRevenue = orders
        .filter(o => o.createdAt.slice(0, 10) === todayString && o.status !== 'Cancelled')
        .reduce((acc, o) => acc + o.totalPrice, 0);

      const monthRevenue = orders
        .filter(o => {
          const created = new Date(o.createdAt);
          return created.getFullYear() === year && created.getMonth() === monthIndex && o.status !== 'Cancelled';
        })
        .reduce((acc, o) => acc + o.totalPrice, 0);

      const productSales = orders.reduce((acc, order) => {
        order.orderItems.forEach((item) => {
          const key = item.product || item.name;
          if (!acc[key]) acc[key] = { name: item.name, qty: 0 };
          acc[key].qty += item.qty;
        });
        return acc;
      }, {});

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 3);

      const paymentCounts = orders.reduce((acc, order) => {
        const status = order.paymentStatus || 'Pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        data: {
          totalSales,
          totalOrders: orders.length,
          totalProducts: products.length,
          pendingOrdersCount,
          todayRevenue,
          monthRevenue,
          topProducts,
          paymentCounts
        }
      };
    }

    throw new Error(`Mock backend route GET ${url} not found`);
  },

  post: async (url, data, config) => {
    await delay(DELAY_MS);

    if (shouldUseBackend(url)) {
      const response = await axiosInstance.post(url, data, config);
      return normalizeBackendResponse(response);
    }

    // 2. POST /orders
    if (url === '/orders') {
      const orders = getDBTable('orders', defaultOrders);
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const adminSettings = getDBTable('adminSettings', defaultAdminSettings);
      const orderNumber = 'AX-' + Math.floor(10000 + Math.random() * 90000);
      const orderId = 'ord_' + Math.random().toString(36).substr(2, 9);
      const notification = {
        _id: 'notif_' + Math.random().toString(36).substr(2, 9),
        orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        type: 'Order',
        channels: ['WhatsApp', 'Email'],
        whatsappNumber: adminSettings.whatsappNumber,
        email: adminSettings.email,
        message: `New order ${orderNumber} placed by ${data.customerName}.`,
        status: 'sent'
      };

      const newOrder = {
        _id: orderId,
        orderNumber,
        createdAt: new Date().toISOString(),
        verificationChannel: 'WhatsApp',
        verificationCode,
        whatsappNumber: data.phoneNumber,
        adminNotification: notification,
        ...data
      };

      orders.unshift(newOrder);
      saveDBTable('orders', orders);

      const notifications = getDBTable('notifications', defaultNotifications);
      notifications.unshift(notification);
      saveDBTable('notifications', notifications);

      // Reduce product stock dynamically
      const products = getDBTable('products', defaultProducts);
      newOrder.orderItems.forEach(item => {
        const prod = products.find(p => p._id === item.product);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.qty);
        }
      });
      saveDBTable('products', products);

      console.info('Admin notification dispatched:', newOrder.adminNotification);
      return { data: newOrder };
    }

    // 3. POST /categories
    if (url === '/categories') {
      const categories = getDBTable('categories', defaultCategories);
      const newCategory = {
        _id: 'cat_' + Math.random().toString(36).substr(2, 9),
        name: data.name,
        createdAt: new Date().toISOString()
      };
      categories.push(newCategory);
      saveDBTable('categories', categories);
      return { data: newCategory };
    }

    // 4. POST /products
    if (url === '/products') {
      const products = getDBTable('products', defaultProducts);
      const categories = getDBTable('categories', defaultCategories);
      const newProduct = {
        _id: 'prod_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        ...data,
        price: Number(data.price) || 0,
        discount: Number(data.discount) || 0,
        stock: Number(data.stock) || 0,
        colors: Array.isArray(data.colors)
          ? data.colors
          : typeof data.colors === 'string'
            ? data.colors.split(',').map((c) => c.trim()).filter(Boolean)
            : [],
        category: resolveCategoryObject(data.category, categories)
      };
      products.push(newProduct);
      saveDBTable('products', products);
      return { data: newProduct };
    }

    // 5. POST /upload (image simulation)
    if (url === '/upload') {
      // Return a set of premium apparel images
      const gallery = [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800'
      ];
      return {
        data: {
          message: 'Images Uploaded',
          images: [gallery[Math.floor(Math.random() * gallery.length)]]
        }
      };
    }

    throw new Error(`Mock backend route POST ${url} not found`);
  },

  put: async (url, data, config) => {
    if (shouldUseBackend(url)) {
      const response = await axiosInstance.put(url, data, config);
      return normalizeBackendResponse(response);
    }

    await delay(DELAY_MS);

    // 1. PUT /categories/:id
    if (url.startsWith('/categories/')) {
      const id = url.split('/categories/')[1];
      const categories = getDBTable('categories', defaultCategories);

      const cat = categories.find(c => c._id === id);
      if (!cat) throw new Error('Category not found');

      cat.name = data.name;
      saveDBTable('categories', categories);
      return { data: cat };
    }

    // 2. PUT /products/:id
    if (url === '/admin/settings') {
      const settings = getDBTable('adminSettings', defaultAdminSettings);
      const updatedSettings = { ...settings, ...data };
      saveDBTable('adminSettings', updatedSettings);
      return { data: updatedSettings };
    }

    if (url.startsWith('/products/')) {
      const id = url.split('/products/')[1];
      const products = getDBTable('products', defaultProducts);
      const categories = getDBTable('categories', defaultCategories);

      const index = products.findIndex(p => p._id === id);
      if (index === -1) throw new Error('Product not found');

      products[index] = {
        ...products[index],
        ...data,
        price: data.price !== undefined ? Number(data.price) || products[index].price : products[index].price,
        discount: data.discount !== undefined ? Number(data.discount) || products[index].discount : products[index].discount,
        stock: data.stock !== undefined ? Number(data.stock) || products[index].stock : products[index].stock,
        colors: Array.isArray(data.colors)
          ? data.colors
          : typeof data.colors === 'string'
            ? data.colors.split(',').map((c) => c.trim()).filter(Boolean)
            : products[index].colors,
        category: data.category !== undefined
          ? resolveCategoryObject(data.category, categories)
          : products[index].category,
      };
      saveDBTable('products', products);
      return { data: products[index] };
    }

    // 3. PUT /orders/:id
    if (url.startsWith('/orders/')) {
      const id = url.split('/orders/')[1].split('/')[0];
      const orders = getDBTable('orders', defaultOrders);
      const ord = orders.find(o => o._id === id);
      if (!ord) throw new Error('Order not found');

      if (data.status) ord.status = data.status;
      if (data.paymentStatus) ord.paymentStatus = data.paymentStatus;

      saveDBTable('orders', orders);
      return { data: ord };
    }

    // 4. PUT /notifications/:id
    if (url.startsWith('/notifications/')) {
      const id = url.split('/notifications/')[1].split('/')[0];
      const notifications = getDBTable('notifications', defaultNotifications);
      const notif = notifications.find(n => n._id === id);
      if (!notif) throw new Error('Notification not found');
      if (data.status) notif.status = data.status;
      saveDBTable('notifications', notifications);
      return { data: notif };
    }

    throw new Error(`Mock backend route PUT ${url} not found`);
  },

  delete: async (url, config) => {
    if (shouldUseBackend(url)) {
      try {
        const response = await axiosInstance.delete(url, config);
        // After successful backend delete, sync localStorage
        if (url.startsWith('/products/')) {
          const id = url.split('/products/')[1];
          let products = getDBTable('products', defaultProducts);
          products = products.filter(p => p._id !== id);
          saveDBTable('products', products);
        } else if (url.startsWith('/categories/')) {
          const id = url.split('/categories/')[1];
          let categories = getDBTable('categories', defaultCategories);
          categories = categories.filter(c => c._id !== id);
          saveDBTable('categories', categories);
        }
        return response;
      } catch (backendError) {
        // Fallback to local delete if backend fails
        if (url.startsWith('/products/')) {
          const id = url.split('/products/')[1];
          let products = getDBTable('products', defaultProducts);
          products = products.filter(p => p._id !== id);
          saveDBTable('products', products);
          return { data: { message: 'Product removed' } };
        } else if (url.startsWith('/categories/')) {
          const id = url.split('/categories/')[1];
          let categories = getDBTable('categories', defaultCategories);
          categories = categories.filter(c => c._id !== id);
          saveDBTable('categories', categories);
          return { data: { message: 'Category removed' } };
        }
        throw backendError;
      }
    }

    await delay(DELAY_MS);

    // 1. DELETE /categories/:id
    if (url.startsWith('/categories/')) {
      const id = url.split('/categories/')[1];
      let categories = getDBTable('categories', defaultCategories);
      categories = categories.filter(c => c._id !== id);
      saveDBTable('categories', categories);
      return { data: { message: 'Category removed' } };
    }

    // 2. DELETE /products/:id
    if (url.startsWith('/products/')) {
      const id = url.split('/products/')[1];
      let products = getDBTable('products', defaultProducts);
      products = products.filter(p => p._id !== id);
      saveDBTable('products', products);
      return { data: { message: 'Product removed' } };
    }

    throw new Error(`Mock backend route DELETE ${url} not found`);
  }
};

export default api;
