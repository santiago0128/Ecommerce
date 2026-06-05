export interface ProductVariant {
  type: 'talla' | 'color' | 'capacidad' | 'material';
  options: string[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  tags: string[];
  featured?: boolean;
  variants?: ProductVariant[];
  brand?: string;
  sku?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful?: number;
}

export interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: 'card' | 'paypal' | 'transfer';
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
  price: number;
  selectedVariants?: Record<string, string>;
}

export interface Order {
  id: string;
  number: string;
  date: string;
  status: 'pendiente' | 'procesando' | 'enviado' | 'entregado' | 'cancelado';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  couponCode?: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'porcentaje' | 'monto';
  value: number;
  minOrder?: number;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  expiresAt?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  link?: string;
  bgColor: string;
  active: boolean;
  order: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orders: number;
  totalSpent: number;
  joinedAt: string;
  lastOrder?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  phone?: string;
  address?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rate: number;
  freeThreshold?: number;
  carrier?: string;
}

export interface TaxRate {
  id: string;
  name: string;
  rate: number;
  country: string;
  active: boolean;
}
