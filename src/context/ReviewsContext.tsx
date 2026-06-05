'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Review } from '@/types';

interface ReviewsContextType {
  getReviews: (productId: string) => Review[];
  addReview: (productId: string, review: Omit<Review, 'id' | 'date'>) => void;
}

const ReviewsContext = createContext<ReviewsContextType | null>(null);

const INITIAL: Record<string, Review[]> = {
  '1': [
    { id: 'r1', userId: 'u1', userName: 'Carlos M.', rating: 5, comment: 'Excelente producto, superó mis expectativas. Muy buena calidad y llegó antes de lo esperado.', date: '2024-11-15', helpful: 12 },
    { id: 'r2', userId: 'u2', userName: 'Ana García', rating: 4, comment: 'Muy buen producto, cumple perfectamente lo que promete. El envío fue rápido.', date: '2024-10-28', helpful: 8 },
  ],
  '2': [
    { id: 'r3', userId: 'u3', userName: 'Miguel R.', rating: 5, comment: 'Lo mejor que he comprado. Vale cada céntimo.', date: '2024-12-01', helpful: 20 },
  ],
};

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Record<string, Review[]>>(INITIAL);

  const getReviews = (productId: string) => reviews[productId] ?? [];

  const addReview = (productId: string, review: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
      ...review,
      id: String(Date.now()),
      date: new Date().toISOString().split('T')[0],
      helpful: 0,
    };
    setReviews(prev => ({
      ...prev,
      [productId]: [newReview, ...(prev[productId] ?? [])],
    }));
  };

  return (
    <ReviewsContext.Provider value={{ getReviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error('useReviews must be used within ReviewsProvider');
  return ctx;
}
