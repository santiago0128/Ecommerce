'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { ShoppingCart, Check, Star, Eye, Heart } from 'lucide-react';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem, isInCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const inCart = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const [adding, setAdding] = useState(false);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inCart || product.stock === 0) return;
    addItem(product);
    setAdding(true);
    setTimeout(() => setAdding(false), 1500);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggle(product);
  };

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
      {/* Image */}
      <Link href={`/producto/${product.id}`} className="relative block h-56 bg-gray-50 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-108 transition-transform duration-500"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Quick view button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <span className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-4 py-2 rounded-full shadow-lg">
            <Eye className="w-3.5 h-3.5" />
            Ver producto
          </span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-red-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="bg-amber-400 text-amber-900 text-xs font-black px-2.5 py-1 rounded-full shadow-sm">
              ⭐ Top
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center shadow-md transition-all ${
            wishlisted
              ? 'bg-red-500 text-white'
              : 'bg-white/90 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-white' : ''}`} />
        </button>

        {product.stock <= 5 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            ¡Últimas!
          </span>
        )}

        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-white text-gray-800 font-bold px-4 py-2 rounded-xl text-sm">Agotado</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[11px] text-indigo-600 font-bold uppercase tracking-widest mb-1.5 capitalize">
          {product.category}
        </p>
        <Link href={`/producto/${product.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 mb-2 text-sm leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-end gap-2 mb-4 mt-auto">
          <span className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through pb-0.5">${product.originalPrice.toFixed(2)}</span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold text-emerald-600 pb-0.5">
              Ahorra ${(product.originalPrice! - product.price).toFixed(2)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : inCart || adding
              ? 'bg-emerald-500 text-white shadow-md shadow-emerald-200'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-300 active:scale-95'
          }`}
        >
          {product.stock === 0 ? (
            'Agotado'
          ) : inCart || adding ? (
            <><Check className="w-4 h-4" />En el carrito</>
          ) : (
            <><ShoppingCart className="w-4 h-4" />Agregar</>
          )}
        </button>
      </div>
    </div>
  );
}
