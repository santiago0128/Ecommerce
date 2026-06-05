'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, Cart } from '@/types';

interface OrdersContextType {
  orders: Order[];
  placeOrder: (cart: Cart, form: Record<string, string>) => Order;
  getOrder: (id: string) => Order | undefined;
  updateStatus: (id: string, status: Order['status']) => void;
}

const OrdersContext = createContext<OrdersContextType | null>(null);

const STATUS_LABELS: Order['status'][] = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

const MOCK_ORDERS: Order[] = [
  {
    id: '1001', number: 'ECO-1001', date: '2024-12-01T10:30:00Z',
    status: 'entregado',
    items: [],
    subtotal: 349.99, shipping: 0, discount: 0, total: 349.99,
    shippingAddress: { firstName: 'Carlos', lastName: 'García', address: 'Calle Mayor 12', city: 'Madrid', state: 'Madrid', zipCode: '28001', country: 'España' },
    paymentMethod: 'card',
  },
  {
    id: '1002', number: 'ECO-1002', date: '2025-01-15T14:20:00Z',
    status: 'enviado',
    items: [],
    subtotal: 179.99, shipping: 4.99, discount: 0, total: 184.98,
    shippingAddress: { firstName: 'Ana', lastName: 'López', address: 'Av. Diagonal 45', city: 'Barcelona', state: 'Cataluña', zipCode: '08001', country: 'España' },
    paymentMethod: 'paypal',
    trackingNumber: 'TRK-ABC12345',
  },
];

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  useEffect(() => {
    const stored = localStorage.getItem('orders');
    if (stored) { try { const parsed = JSON.parse(stored); if (parsed.length > 0) setOrders(parsed); } catch {} }
  }, []);

  const save = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
  };

  const placeOrder = (cart: Cart, form: Record<string, string>): Order => {
    const id  = String(Date.now());
    const num = `ECO-${Math.floor(10000 + Math.random() * 90000)}`;
    const shipping = cart.total >= 50 ? 0 : 4.99;
    const order: Order = {
      id, number: num, date: new Date().toISOString(),
      status: 'pendiente',
      items: cart.items.map(i => ({ product: i.product, quantity: i.quantity, price: i.product.price })),
      subtotal: cart.total,
      shipping,
      discount: 0,
      total: cart.total + shipping,
      shippingAddress: {
        firstName: form.firstName ?? '',
        lastName: form.lastName ?? '',
        address: form.address ?? '',
        city: form.city ?? '',
        state: form.state ?? '',
        zipCode: form.zipCode ?? '',
        country: form.country ?? '',
      },
      paymentMethod: form.paymentMethod ?? 'card',
    };
    const updated = [order, ...orders];
    save(updated);
    return order;
  };

  const getOrder = (id: string) => orders.find(o => o.id === id);

  const updateStatus = (id: string, status: Order['status']) => {
    save(orders.map(o => o.id === id ? { ...o, status } : o));
  };

  return (
    <OrdersContext.Provider value={{ orders, placeOrder, getOrder, updateStatus }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}

export { STATUS_LABELS };
