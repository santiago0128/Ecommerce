'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Coupon } from '@/types';

interface CouponsContextType {
  coupons: Coupon[];
  validateCoupon: (code: string, orderTotal: number) => { valid: boolean; coupon?: Coupon; discount: number; message: string };
  addCoupon: (c: Omit<Coupon, 'id' | 'usedCount'>) => void;
  updateCoupon: (id: string, data: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  useCoupon: (code: string) => void;
}

const CouponsContext = createContext<CouponsContextType | null>(null);

const INITIAL_COUPONS: Coupon[] = [
  { id: '1', code: 'WELCOME10', type: 'porcentaje', value: 10, minOrder: 20, maxUses: 100, usedCount: 34, active: true, expiresAt: '2025-12-31' },
  { id: '2', code: 'VERANO20',  type: 'porcentaje', value: 20, minOrder: 50, maxUses: 50,  usedCount: 12, active: true, expiresAt: '2025-08-31' },
  { id: '3', code: 'DESCUENTO5', type: 'monto',     value: 5,  minOrder: 30, maxUses: 200, usedCount: 89, active: true },
  { id: '4', code: 'BLACKFRIDAY', type: 'porcentaje', value: 30, minOrder: 100, maxUses: 30, usedCount: 30, active: false },
];

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);

  const validateCoupon = (code: string, orderTotal: number) => {
    const c = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!c) return { valid: false, discount: 0, message: 'Cupón no encontrado' };
    if (!c.active) return { valid: false, discount: 0, message: 'Este cupón está inactivo' };
    if (c.maxUses && c.usedCount >= c.maxUses) return { valid: false, discount: 0, message: 'Este cupón ha alcanzado su límite de usos' };
    if (c.expiresAt && new Date(c.expiresAt) < new Date()) return { valid: false, discount: 0, message: 'Este cupón ha expirado' };
    if (c.minOrder && orderTotal < c.minOrder) return { valid: false, discount: 0, message: `Pedido mínimo de $${c.minOrder} para este cupón` };
    const discount = c.type === 'porcentaje' ? (orderTotal * c.value) / 100 : c.value;
    return { valid: true, coupon: c, discount, message: `¡Cupón aplicado! -${c.type === 'porcentaje' ? `${c.value}%` : `$${c.value}`}` };
  };

  const addCoupon = (c: Omit<Coupon, 'id' | 'usedCount'>) =>
    setCoupons(prev => [{ ...c, id: String(Date.now()), usedCount: 0 }, ...prev]);

  const updateCoupon = (id: string, data: Partial<Coupon>) =>
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));

  const deleteCoupon = (id: string) =>
    setCoupons(prev => prev.filter(c => c.id !== id));

  const useCoupon = (code: string) =>
    setCoupons(prev => prev.map(c => c.code.toUpperCase() === code.toUpperCase() ? { ...c, usedCount: c.usedCount + 1 } : c));

  return (
    <CouponsContext.Provider value={{ coupons, validateCoupon, addCoupon, updateCoupon, deleteCoupon, useCoupon }}>
      {children}
    </CouponsContext.Provider>
  );
}

export function useCoupons() {
  const ctx = useContext(CouponsContext);
  if (!ctx) throw new Error('useCoupons must be used within CouponsProvider');
  return ctx;
}
