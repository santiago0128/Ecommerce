'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface WishlistContextType {
  items: Product[];
  addItem: (p: Product) => void;
  removeItem: (id: string) => void;
  toggle: (p: Product) => void;
  isWishlisted: (id: string) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('wishlist');
    if (stored) { try { setItems(JSON.parse(stored)); } catch {} }
  }, []);

  const save = (newItems: Product[]) => {
    setItems(newItems);
    localStorage.setItem('wishlist', JSON.stringify(newItems));
  };

  const addItem    = (p: Product) => { if (!items.find(i => i.id === p.id)) save([...items, p]); };
  const removeItem = (id: string)  => save(items.filter(i => i.id !== id));
  const toggle     = (p: Product)  => items.find(i => i.id === p.id) ? removeItem(p.id) : addItem(p);
  const isWishlisted = (id: string) => !!items.find(i => i.id === id);

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggle, isWishlisted, count: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
