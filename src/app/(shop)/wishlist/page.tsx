'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function WishlistPage() {
  const { items, removeItem } = useWishlist();
  const { addItem, isInCart } = useCart();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-black text-gray-900">Lista de deseos</h1>
        <span className="bg-gray-100 text-gray-600 text-sm font-bold px-2.5 py-1 rounded-full">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
          <div className="w-20 h-20 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Heart className="w-10 h-10 text-red-200" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Tu lista de deseos está vacía</h2>
          <p className="text-gray-500 mb-6">Guarda los productos que más te gustan para comprarlos después</p>
          <Link href="/tienda" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
            Explorar productos <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {items.map(product => {
              const inCart = isInCart(product.id);
              const discount = product.originalPrice
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;
              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                >
                  <Link href={`/producto/${product.id}`} className="relative block h-48 bg-gray-50 overflow-hidden">
                    <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                    {discount > 0 && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full">-{discount}%</span>
                    )}
                  </Link>
                  <div className="p-4">
                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1 capitalize">{product.category}</p>
                    <Link href={`/producto/${product.id}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 text-sm mb-2">{product.name}</h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-lg font-black text-gray-900">${product.price.toFixed(2)}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addItem(product)}
                        disabled={product.stock === 0}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          inCart ? 'bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        } disabled:opacity-40`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.stock === 0 ? 'Agotado' : inCart ? 'En carrito' : 'Agregar'}
                      </button>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-gray-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
