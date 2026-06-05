'use client';

import { motion } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';
import {
  BarChart3, TrendingUp, Package, DollarSign,
  Star, Tag, Percent, ShoppingBag,
} from 'lucide-react';

const BAR_COLORS = [
  'bg-indigo-500', 'bg-purple-500', 'bg-emerald-500',
  'bg-orange-500', 'bg-blue-500', 'bg-pink-500',
];

export default function AdminReportes() {
  const { products } = useProducts();

  const totalValue  = products.reduce((s, p) => s + p.price * p.stock, 0);
  const avgRating   = products.length ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : '0';
  const avgPrice    = products.length ? (products.reduce((s, p) => s + p.price, 0) / products.length) : 0;
  const withDiscount = products.filter(p => p.originalPrice).length;
  const avgDiscount  = withDiscount
    ? products.filter(p => p.originalPrice).reduce((s, p) => s + Math.round(((p.originalPrice! - p.price) / p.originalPrice!) * 100), 0) / withDiscount
    : 0;

  // Category breakdown
  const catMap: Record<string, { count: number; value: number; avgRating: number }> = {};
  products.forEach(p => {
    if (!catMap[p.category]) catMap[p.category] = { count: 0, value: 0, avgRating: 0 };
    catMap[p.category].count++;
    catMap[p.category].value += p.price * p.stock;
    catMap[p.category].avgRating += p.rating;
  });
  Object.keys(catMap).forEach(k => {
    catMap[k].avgRating = parseFloat((catMap[k].avgRating / catMap[k].count).toFixed(1));
  });
  const sortedCats = Object.entries(catMap).sort((a, b) => b[1].count - a[1].count);
  const maxCount   = sortedCats[0]?.[1].count ?? 1;

  // Price distribution
  const priceRanges = [
    { label: '$0–$50',    count: products.filter(p => p.price <= 50).length },
    { label: '$50–$200',  count: products.filter(p => p.price > 50 && p.price <= 200).length },
    { label: '$200–$500', count: products.filter(p => p.price > 200 && p.price <= 500).length },
    { label: '$500+',     count: products.filter(p => p.price > 500).length },
  ];
  const maxPriceCount = Math.max(...priceRanges.map(r => r.count), 1);

  // Top by rating
  const topRated = [...products].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const mostReviewed = [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 5);

  const MetricCard = ({ icon: Icon, label, value, sub, color, bg }: {
    icon: React.ElementType; label: string; value: string | number; sub: string;
    color: string; bg: string;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
    >
      <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mb-4`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-0.5">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </motion.div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Reportes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Análisis del catálogo de productos</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Package}    label="Total productos"   value={products.length}        sub={`${withDiscount} con descuento`}         color="text-indigo-600"  bg="bg-indigo-50" />
        <MetricCard icon={DollarSign} label="Valor inventario"  value={`$${totalValue.toLocaleString('es', {maximumFractionDigits: 0})}`} sub={`Media $${avgPrice.toFixed(2)}`} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={Star}       label="Rating promedio"   value={avgRating}              sub={`${products.reduce((s,p) => s + p.reviews, 0).toLocaleString()} reseñas`} color="text-amber-600"  bg="bg-amber-50" />
        <MetricCard icon={Percent}    label="Descuento medio"   value={`${avgDiscount.toFixed(0)}%`} sub={`${withDiscount} productos con oferta`} color="text-rose-600"    bg="bg-rose-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Tag className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-gray-900">Distribución por categoría</h2>
          </div>
          <div className="space-y-3.5">
            {sortedCats.map(([cat, data], i) => (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="capitalize font-semibold text-gray-700">{cat}</span>
                  <span className="text-gray-500 text-xs">{data.count} prods · ⭐ {data.avgRating}</span>
                </div>
                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(data.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${BAR_COLORS[i % BAR_COLORS.length]}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price distribution */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-emerald-500" />
            <h2 className="font-bold text-gray-900">Distribución de precios</h2>
          </div>
          <div className="flex items-end gap-3 h-36">
            {priceRanges.map((r, i) => (
              <div key={r.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-xs font-bold text-gray-700">{r.count}</span>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(r.count / maxPriceCount) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                  className={`w-full rounded-t-xl ${BAR_COLORS[i]}`}
                  style={{ minHeight: r.count > 0 ? 8 : 0 }}
                />
                <span className="text-[10px] text-gray-400 text-center leading-tight">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top rated */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="font-bold text-gray-900">Mejor valorados</h2>
          </div>
          <div className="space-y-2.5">
            {topRated.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-black text-amber-600">{p.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most reviewed */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-gray-900">Más reseñas</h2>
          </div>
          <div className="space-y-2.5">
            {mostReviewed.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="text-xs font-black text-gray-300 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{p.category}</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg flex-shrink-0">
                  {p.reviews.toLocaleString()} reseñas
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
