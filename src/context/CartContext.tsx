'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { toast } from 'sonner';
import { Cart, CartItem, Product } from '@/types';

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const calculateCart = (items: CartItem[]): Cart => ({
  items,
  total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
  itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
});

const cartReducer = (state: Cart, action: CartAction): Cart => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.payload.id);
      if (existing) {
        const updated = state.items.map(i =>
          i.product.id === action.payload.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
        return calculateCart(updated);
      }
      return calculateCart([...state.items, { product: action.payload, quantity: 1 }]);
    }
    case 'REMOVE_ITEM': {
      const updated = state.items.filter(i => i.product.id !== action.payload);
      return calculateCart(updated);
    }
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const updated = state.items.filter(i => i.product.id !== action.payload.id);
        return calculateCart(updated);
      }
      const updated = state.items.map(i =>
        i.product.id === action.payload.id
          ? { ...i, quantity: action.payload.quantity }
          : i
      );
      return calculateCart(updated);
    }
    case 'CLEAR_CART':
      return calculateCart([]);
    default:
      return state;
  }
};

interface CartContextType {
  cart: Cart;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (id: string) => boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, dispatch] = useReducer(cartReducer, calculateCart([]));

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem: (product) => {
          dispatch({ type: 'ADD_ITEM', payload: product });
          toast.success(`${product.name} agregado al carrito`, {
            description: `$${product.price.toFixed(2)}`,
            duration: 2500,
          });
        },
        removeItem: (id) => {
          dispatch({ type: 'REMOVE_ITEM', payload: id });
          toast.info('Producto eliminado del carrito', { duration: 2000 });
        },
        updateQuantity: (id, quantity) =>
          dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } }),
        clearCart: () => dispatch({ type: 'CLEAR_CART' }),
        isInCart: (id) => cart.items.some(i => i.product.id === id),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
