'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from './CartDrawer';
import {
  ShoppingCart, Search, Menu, X, Settings, LogOut, User,
  ChevronDown, Zap, Shirt, Home, Dumbbell, BookOpen, Sparkles, Heart,
} from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

const categories = [
  { label: 'Electrónica', slug: 'electronica', icon: Zap },
  { label: 'Ropa',        slug: 'ropa',        icon: Shirt },
  { label: 'Hogar',       slug: 'hogar',       icon: Home },
  { label: 'Deportes',    slug: 'deportes',    icon: Dumbbell },
  { label: 'Libros',      slug: 'libros',      icon: BookOpen },
  { label: 'Belleza',     slug: 'belleza',     icon: Sparkles },
];

export default function Header() {
  const { cart } = useCart();
  const { user, isAdmin, logout } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const [cartOpen, setCartOpen]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [catOpen, setCatOpen]     = useState(false);
  const [scrolled, setScrolled]   = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs py-2 overflow-hidden">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <span key={i} className="px-8">
              🚀 Envío gratis en pedidos +$50 &nbsp;·&nbsp; ✨ Nuevos productos cada semana &nbsp;·&nbsp; 🔥 Hasta 40% OFF en electrónica &nbsp;·&nbsp; 💳 Pago seguro garantizado &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-300 ${
          scrolled ? 'shadow-lg border-b border-gray-100' : 'border-b border-gray-200'
        }`}
      >
        {/* Main row */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-indigo-300 transition-shadow duration-300">
                <span className="text-white font-black text-base">E</span>
              </div>
              <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">
                Eco<span className="text-indigo-600">Shop</span>
              </span>
            </Link>

            {/* Search bar (desktop) */}
            <div className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Buscar productos, categorías..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                  onFocus={e => (e.currentTarget.placeholder = '')}
                  onBlur={e => (e.currentTarget.placeholder = 'Buscar productos, categorías...')}
                />
              </div>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Search mobile */}
              <Link href="/tienda" className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors">
                <Search className="w-5 h-5" />
              </Link>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                aria-label="Lista de deseos"
              >
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 animate-bounce-in">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {cart.itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[10px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-0.5 animate-bounce-in">
                    {cart.itemCount > 9 ? '9+' : cart.itemCount}
                  </span>
                )}
              </button>

              {/* Admin / Login */}
              {isAdmin ? (
                <div className="hidden md:flex items-center gap-1 ml-1">
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Admin
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-medium px-3 py-2 rounded-xl transition-colors ml-1"
                >
                  <User className="w-4 h-4" />
                  Acceder
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nav row (desktop) */}
          <nav className="hidden md:flex items-center gap-1 pb-2">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
              Inicio
            </Link>
            <Link href="/tienda" className="text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
              Tienda
            </Link>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                Categorías
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-fade-in z-50">
                  {categories.map(cat => {
                    const Icon = cat.icon;
                    return (
                      <Link
                        key={cat.slug}
                        href={`/tienda?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                      >
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                          <Icon className="w-4 h-4 text-indigo-500" />
                        </div>
                        {cat.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <span className="text-gray-200 mx-1">|</span>
            <Link href="/tienda?category=electronica" className="text-sm font-medium text-orange-500 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors">
              🔥 Ofertas
            </Link>
          </nav>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white animate-fade-in-up">
            <div className="px-4 py-3">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { href: '/', label: 'Inicio' },
                  { href: '/tienda', label: 'Tienda' },
                  ...categories.map(c => ({ href: `/tienda?category=${c.slug}`, label: c.label })),
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="border-t border-gray-100 mt-3 pt-3 flex gap-2">
                {isAdmin ? (
                  <>
                    <Link href="/admin" className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-semibold" onClick={() => setMenuOpen(false)}>
                      <Settings className="w-4 h-4" />Panel Admin
                    </Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="px-4 py-2.5 text-red-500 bg-red-50 rounded-xl text-sm font-medium">
                      <LogOut className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="flex-1 flex items-center justify-center gap-2 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold" onClick={() => setMenuOpen(false)}>
                    <User className="w-4 h-4" />Iniciar sesión
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
