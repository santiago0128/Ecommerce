'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';
import { categories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import {
  Truck, RotateCcw, ShieldCheck, Headphones,
  ArrowRight, ChevronRight, Star, TrendingUp, Zap,
} from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  show: { transition: { staggerChildren: 0.08 } },
};

const trustBadges = [
  { icon: Truck,        title: 'Envío gratis',    desc: 'En pedidos +$50',       color: 'text-indigo-500',  bg: 'bg-indigo-50' },
  { icon: RotateCcw,    title: 'Devoluciones',    desc: '30 días sin coste',     color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { icon: ShieldCheck,  title: 'Pago seguro',     desc: 'SSL y cifrado 256-bit', color: 'text-purple-500',  bg: 'bg-purple-50' },
  { icon: Headphones,   title: 'Soporte 24/7',    desc: 'Siempre disponible',    color: 'text-rose-500',    bg: 'bg-rose-50' },
];

const catIcons: Record<string, string> = {
  electronica: '💻', ropa: '👕', hogar: '🏠',
  deportes: '⚽', libros: '📚', belleza: '✨',
};

export default function HomePage() {
  const { products } = useProducts();
  const featured = products.filter(p => p.featured);
  const newArrivals = [...products].slice(-4).reverse();

  return (
    <div className="overflow-x-hidden">
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-950 via-indigo-900 to-purple-900 text-white overflow-hidden min-h-[580px] flex items-center">
        {/* Animated blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-[420px] h-[420px] bg-indigo-600/30 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-[-60px] right-[-60px] w-[480px] h-[480px] bg-purple-600/25 rounded-full blur-3xl animate-blob delay-300" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-400/10 rounded-full blur-2xl animate-blob delay-600" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={stagger}
              className="max-w-xl"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 bg-white/10 text-indigo-200 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-white/20 backdrop-blur-sm">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Nuevas ofertas cada semana
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6 tracking-tight">
                Todo lo que
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">
                  necesitas
                </span>
                en un solo lugar
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-indigo-200 mb-8 leading-relaxed">
                Electrónica, ropa, hogar y mucho más. Envío gratis en pedidos superiores a $50 y devoluciones sin coste durante 30 días.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/tienda"
                  className="group flex items-center justify-center gap-2 bg-white text-indigo-800 px-8 py-3.5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                >
                  Explorar tienda
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/tienda?category=electronica"
                  className="flex items-center justify-center gap-2 border border-white/25 text-white px-8 py-3.5 rounded-2xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all"
                >
                  <Zap className="w-4 h-4 text-yellow-300" />
                  Ver ofertas
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-2">
                  {['bg-indigo-400','bg-purple-400','bg-pink-400','bg-blue-400'].map((c, i) => (
                    <div key={i} className={`w-8 h-8 ${c} rounded-full border-2 border-indigo-900 flex items-center justify-center text-white text-xs font-bold`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-indigo-300 text-xs">+12,000 clientes satisfechos</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — product showcase */}
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0, transition: { duration: 0.7, delay: 0.2 } }}
              className="hidden lg:grid grid-cols-2 gap-4"
            >
              {featured.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  href={`/producto/${p.id}`}
                  className={`group relative bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/15 hover:border-white/30 transition-all hover:-translate-y-1 ${i === 0 ? 'col-span-2' : ''}`}
                >
                  <div className={`relative ${i === 0 ? 'h-40' : 'h-28'} overflow-hidden`}>
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-white text-xs font-semibold line-clamp-1">{p.name}</p>
                    <p className="text-indigo-300 text-xs font-bold mt-0.5">${p.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── TRUST BADGES ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {trustBadges.map(b => {
              const Icon = b.icon;
              return (
                <motion.div key={b.title} variants={fadeUp} className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${b.bg} ${b.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{b.title}</p>
                    <p className="text-gray-500 text-xs">{b.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── CATEGORIES ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Categorías</h2>
              <p className="text-gray-500 text-sm mt-1">Encuentra lo que buscas rápidamente</p>
            </div>
            <Link href="/tienda" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm group">
              Ver todas <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <motion.div key={cat.id} variants={fadeUp} style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  href={`/tienda?category=${cat.slug}`}
                  className="group flex flex-col items-center gap-2.5 p-4 bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:bg-gradient-to-b hover:from-indigo-50 hover:to-white transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {catIcons[cat.slug] ?? '🛍️'}
                  </div>
                  <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-indigo-700 transition-colors">
                    {cat.name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURED PRODUCTS ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Productos destacados</h2>
              <p className="text-gray-500 text-sm mt-1">Los más valorados por nuestros clientes</p>
            </div>
            <Link href="/tienda" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm group">
              Ver todos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featured.map(product => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ─── PROMO BANNER ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1, transition: { duration: 0.5 } }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-8 sm:p-12 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
                Oferta limitada
              </span>
              <h3 className="text-2xl sm:text-4xl font-black mb-2">¡Hasta 40% de descuento!</h3>
              <p className="text-indigo-200 text-lg">En toda la sección de electrónica este mes.</p>
            </div>
            <Link
              href="/tienda?category=electronica"
              className="group flex items-center gap-2 bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-0.5 whitespace-nowrap flex-shrink-0 text-lg"
            >
              Aprovechar oferta
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── NEW ARRIVALS ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900">Recién llegados</h2>
              <p className="text-gray-500 text-sm mt-1">Productos nuevos esta semana</p>
            </div>
            <Link href="/tienda" className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold text-sm group">
              Ver todos <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {newArrivals.map(product => (
              <motion.div key={product.id} variants={fadeUp}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
