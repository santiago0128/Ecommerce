'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Product } from '@/types';

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  updateProduct: (id: string, data: Partial<Product>) => void;
  refresh: () => void;
}

const ProductsContext = createContext<ProductsContextType | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);

  const load = useCallback(() => {
    fetch('/api/products')
      .then(r => (r.ok ? r.json() : null))
      .then(data => { if (data?.products) setProducts(data.products); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic local update + persist to the database (used by the inventory admin page)
  const updateProduct = useCallback((id: string, data: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));

    const body: Record<string, unknown> = {};
    if ('stock' in data)         body.stock = data.stock;
    if ('price' in data)         body.price = data.price;
    if ('originalPrice' in data) body.original_price = data.originalPrice;
    if ('featured' in data)      body.featured = data.featured;
    if ('name' in data)          body.name = data.name;
    if ('description' in data)   body.description = data.description;

    if (Object.keys(body).length === 0) return;

    fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, []);

  return (
    <ProductsContext.Provider value={{ products, loading, updateProduct, refresh: load }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}
