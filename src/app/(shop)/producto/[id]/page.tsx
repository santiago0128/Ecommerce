'use client';

import { use, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useReviews } from '@/context/ReviewsContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ShoppingCart, Check, Star, Truck, RotateCcw, ShieldCheck, Send, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={onChange ? 'button' : 'button'}
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            className={`w-5 h-5 transition-colors ${
              n <= (hovered || value) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { products } = useProducts();
  const product = products.find(p => p.id === id);

  if (!product) notFound();

  const { addItem, isInCart, cart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { getReviews, addReview } = useReviews();
  const { user } = useAuth();

  const [quantity, setQuantity]         = useState(1);
  const [activeImage, setActiveImage]   = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [reviewForm, setReviewForm]     = useState({ rating: 0, comment: '' });
  const [showReviewForm, setShowReviewForm] = useState(false);

  const reviews  = getReviews(product.id);
  const inCart   = isInCart(product.id);
  const wishlisted = isWishlisted(product.id);
  const cartItem = cart.items.find(i => i.product.id === product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const related  = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : product.rating;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) addItem(product);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewForm.rating === 0) { toast.error('Por favor selecciona una puntuación'); return; }
    addReview(product.id, {
      userId: user?.id ?? 'guest',
      userName: user?.name ?? 'Usuario anónimo',
      rating: reviewForm.rating,
      comment: reviewForm.comment,
    });
    setReviewForm({ rating: 0, comment: '' });
    setShowReviewForm(false);
    toast.success('¡Gracias por tu valoración!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-indigo-600">Inicio</Link>
        <span>/</span>
        <Link href="/tienda" className="hover:text-indigo-600">Tienda</Link>
        <span>/</span>
        <Link href={`/tienda?category=${product.category}`} className="hover:text-indigo-600 capitalize">{product.category}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium line-clamp-1">{product.name}</span>
      </nav>

      {/* Product detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <Image
              src={product.images[activeImage] || product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {discount > 0 && (
              <span className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1.5 rounded-full">-{discount}%</span>
            )}
            <button
              onClick={() => toggle(product)}
              className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                wishlisted ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${wishlisted ? 'fill-white' : ''}`} />
            </button>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3 flex-wrap">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                    activeImage === i ? 'border-indigo-600' : 'border-gray-200'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-indigo-600 font-semibold uppercase tracking-wide capitalize mb-2">{product.category}</p>
          {product.brand && <p className="text-xs text-gray-400 font-medium mb-1">{product.brand}</p>}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-3 mb-6">
            <StarRating value={Math.round(avgRating)} />
            <span className="text-gray-600 text-sm font-medium">{avgRating.toFixed(1)}</span>
            <span className="text-gray-400 text-sm">({reviews.length} valoraciones)</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-4xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice.toFixed(2)}</span>
                <span className="bg-red-100 text-red-700 text-sm font-semibold px-2.5 py-1 rounded-full">
                  Ahorras ${(product.originalPrice - product.price).toFixed(2)}
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 mb-6">
              {product.variants.map(variant => (
                <div key={variant.type}>
                  <p className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                    {variant.type}: <span className="font-normal text-gray-500">{selectedVariants[variant.type] ?? 'Seleccionar'}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map(opt => {
                      const selected = selectedVariants[variant.type] === opt;
                      const isColor = variant.type === 'color';
                      return (
                        <button
                          key={opt}
                          onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.type]: opt }))}
                          className={`transition-all ${
                            isColor
                              ? `w-8 h-8 rounded-full border-2 ${selected ? 'border-indigo-600 scale-110' : 'border-gray-200 hover:border-gray-400'}`
                              : `px-4 py-1.5 text-sm font-medium rounded-xl border-2 ${
                                  selected
                                    ? 'border-indigo-600 bg-indigo-600 text-white'
                                    : 'border-gray-200 text-gray-700 hover:border-indigo-300'
                                }`
                          }`}
                          style={isColor ? { backgroundColor: opt.toLowerCase() } : undefined}
                          title={isColor ? opt : undefined}
                        >
                          {!isColor && opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            {product.stock === 0 ? (
              <span className="text-red-600 font-semibold text-sm">Agotado</span>
            ) : product.stock <= 5 ? (
              <span className="text-orange-500 font-semibold text-sm">¡Sólo quedan {product.stock}!</span>
            ) : (
              <span className="text-emerald-600 font-semibold text-sm">En stock</span>
            )}
          </div>

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">−</button>
                <span className="px-4 py-3 font-bold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-all ${
                  addedFeedback ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                }`}
              >
                {addedFeedback ? <><Check className="w-4 h-4" /> Agregado</> : <><ShoppingCart className="w-4 h-4" />{inCart ? `Agregar más (${cartItem?.quantity})` : 'Agregar al carrito'}</>}
              </button>
              <button
                onClick={() => toggle(product)}
                className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${
                  wishlisted ? 'border-red-400 bg-red-50 text-red-500' : 'border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-400'
                }`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? 'fill-red-400' : ''}`} />
              </button>
            </div>
          )}

          {product.sku && <p className="text-xs text-gray-400 mb-4">SKU: {product.sku}</p>}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.tags.map(tag => (
              <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1.5 rounded-full capitalize">{tag}</span>
            ))}
          </div>

          {/* Benefits */}
          <div className="border-t pt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { Icon: Truck,       text: 'Envío gratis +$50' },
              { Icon: RotateCcw,  text: 'Devoluciones 30 días' },
              { Icon: ShieldCheck, text: 'Pago 100% seguro' },
            ].map(b => {
              const BIcon = b.Icon;
              return (
                <div key={b.text} className="flex items-center gap-2 text-sm text-gray-600">
                  <BIcon className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  {b.text}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Valoraciones ({reviews.length})</h2>
          {user && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Star className="w-4 h-4" />
              {showReviewForm ? 'Cancelar' : 'Escribir reseña'}
            </button>
          )}
        </div>

        {/* Review form */}
        <AnimatePresence>
          {showReviewForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleReviewSubmit}
              className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6 mb-6 overflow-hidden"
            >
              <h3 className="font-bold text-gray-800 mb-4">Tu valoración</h3>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Puntuación</p>
                <StarRating value={reviewForm.rating} onChange={v => setReviewForm(f => ({ ...f, rating: v }))} />
              </div>
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-600 mb-2">Comentario</p>
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder="Cuéntanos tu experiencia con este producto..."
                  rows={3}
                  required
                  className="w-full border border-indigo-200 bg-white rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                />
              </div>
              <button type="submit" className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors">
                <Send className="w-4 h-4" /> Publicar reseña
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <Star className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500">Aún no hay reseñas. ¡Sé el primero en valorar este producto!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{review.userName}</p>
                      <p className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                {review.helpful !== undefined && review.helpful > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {review.helpful} personas encontraron esto útil
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
