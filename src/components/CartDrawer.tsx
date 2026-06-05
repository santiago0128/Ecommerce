'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { X, ShoppingCart, Minus, Plus, Trash2, ArrowRight, Truck, Tag } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const freeShippingThreshold = 50;
  const remaining = freeShippingThreshold - cart.total;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="ml-auto relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">Mi carrito</h2>
                  <p className="text-xs text-gray-500">
                    {cart.itemCount} {cart.itemCount === 1 ? 'artículo' : 'artículos'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cart.items.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                  >
                    Vaciar
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Free shipping progress */}
            {cart.items.length > 0 && (
              <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                {remaining > 0 ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs text-indigo-700 font-medium">
                        ¡Agrega <span className="font-black">${remaining.toFixed(2)}</span> más para envío gratis!
                      </span>
                    </div>
                    <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((cart.total / freeShippingThreshold) * 100, 100)}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-xs text-emerald-700 font-bold">¡Tienes envío gratis!</span>
                  </div>
                )}
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-4 px-8">
                  <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-9 h-9 text-gray-300" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">Tu carrito está vacío</p>
                    <p className="text-gray-400 text-sm mt-1">Agrega productos para empezar a comprar</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm"
                  >
                    Explorar productos
                  </button>
                </div>
              ) : (
                <motion.ul layout className="px-4 py-3 space-y-2">
                  <AnimatePresence initial={false}>
                    {cart.items.map(({ product, quantity }) => (
                      <motion.li
                        key={product.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30, height: 0, marginBottom: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="flex gap-3 bg-gray-50 rounded-2xl p-3"
                      >
                        <Link href={`/producto/${product.id}`} onClick={onClose} className="flex-shrink-0">
                          <div className="relative w-18 h-18 w-[72px] h-[72px] rounded-xl overflow-hidden bg-white border border-gray-200">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="72px"
                            />
                          </div>
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/producto/${product.id}`}
                            onClick={onClose}
                            className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 text-xs leading-snug"
                          >
                            {product.name}
                          </Link>
                          <p className="text-indigo-600 font-black mt-1 text-sm">
                            ${product.price.toFixed(2)}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-0.5">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold w-5 text-center text-gray-900">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            {/* Subtotal + delete */}
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-700">
                                ${(product.price * quantity).toFixed(2)}
                              </span>
                              <button
                                onClick={() => removeItem(product.id)}
                                className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              )}
            </div>

            {/* Footer */}
            {cart.items.length > 0 && (
              <div className="border-t border-gray-100 bg-white px-5 py-4 space-y-3">
                {/* Coupon hint */}
                <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2.5 cursor-pointer hover:bg-gray-100 transition-colors">
                  <Tag className="w-3.5 h-3.5" />
                  <span>¿Tienes un cupón de descuento?</span>
                </div>

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>${cart.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Envío</span>
                    <span className={cart.total >= freeShippingThreshold ? 'text-emerald-600 font-semibold' : ''}>
                      {cart.total >= freeShippingThreshold ? 'Gratis' : `$4.99`}
                    </span>
                  </div>
                  <div className="flex justify-between font-black text-gray-900 text-lg pt-2 border-t border-gray-100">
                    <span>Total</span>
                    <span>${(cart.total + (cart.total >= freeShippingThreshold ? 0 : 4.99)).toFixed(2)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="group flex items-center justify-center gap-2 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-bold py-3.5 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Pagar ahora
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center py-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
                >
                  Seguir comprando
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
