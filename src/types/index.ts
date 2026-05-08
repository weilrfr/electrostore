import type { Timestamp } from 'firebase/firestore';

// ─── Пользователь ─────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  createdAt: Timestamp;
  role: 'customer' | 'admin';
  addresses: Address[];
  balance: number; // внутренний кошелёк
  preferences: {
    notifications: boolean;
    newsletter: boolean;
  };
}

// ─── Товары ───────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviews: number;
  images: string[];
  specifications: Record<string, string>;
  sku: string;
  tags: string[];
  featured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductFilter {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  search?: string;
}

// ─── Категории ────────────────────────────────────────────────────────────────

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  subcategories: Subcategory[];
}

// ─── Корзина ──────────────────────────────────────────────────────────────────

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPrice?: number;
  image: string;
  quantity: number;
  stock: number;
}

// ─── Заказы ───────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'completed' | 'failed';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  paymentMethod: 'wallet';
  paymentStatus: PaymentStatus;
  trackingNumber?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Отзывы ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  images?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Кошелёк ──────────────────────────────────────────────────────────────────

export type TransactionType = 'topup' | 'purchase' | 'refund';

export interface WalletTransaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  description: string;
  orderId?: string;
  createdAt: Timestamp;
}

export type TopupRequestStatus = 'pending' | 'approved' | 'rejected';

export interface TopupRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  status: TopupRequestStatus;
  comment?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

export interface PaginationOptions {
  page: number;
  perPage: number;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
}
