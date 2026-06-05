'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';
import { categories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Grid3X3, List, Zap, Shirt, Home, Dumbbell, BookOpen, Sparkles,
} from 'lucide-react';

type SortOption = 'relevance' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

const catIcons: Record<string, React.ElementType> = {
  electronica: Zap, ropa: Shirt, hogar: Home,
  deportes: Dumbbell, libros: BookOpen, belleza: Sparkles,
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
};
const stagger = { show: { transition: { staggerChildren: 0.05 } } };

function TiendaContent() {
  const searchParams = useSearchParams();
  const { products } = useProducts();
  const initialCategory = searchParams.get('category') || '';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy]                       = useState<SortOption>('relevance');
  const [maxPrice, setMaxPrice]                   = useState(2500);
  const [searchQuery, setSearchQuery]             = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [view, setView]                           = useState<'grid' | 'list'>('grid');

  const filtered = useMemo(() => {
    let list = [...products];
    if (selectedCategory) list = list.filter(p => p.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.includes(q))
      );
    }
    list = list.filter(p => p.price <= maxPrice);
    switch (sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [products, selectedCategory, sortBy, maxPrice, searchQuery]);

  const resetFilters = () => {
    setSelectedCategory('');
    setSearchQuery('');
    setMaxPrice(2500);
    setSortBy('relevance');
  };

  const hasFilters = selectedCategory || searchQuery || maxPrice < 2500 || sortBy !== 'relevance';

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Buscar</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Nombre, descripción..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Categoría</h3>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => setSelectedCategory('')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${
                !selectedCategory
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas las categorías
            </button>
          </li>
          {categories.map(cat => {
            const Icon = catIcons[cat.slug];
            return (
              <li key={cat.id}>
                <button
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center gap-2.5 ${
                    selectedCategory === cat.slug
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
                  {cat.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-bold text-gray-900 mb-1 text-sm uppercase tracking-wider">Precio máximo</h3>
        <p className="text-indigo-600 font-black text-lg mb-3">${maxPrice.toLocaleString()}</p>
        <input
          type="range"
          min={0}
          max={2500}
          step={50}
          value={maxPrice}
          onChange={e => setMaxPrice(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>$0</span>
          <span>$2,500</span>
        </div>
      </div>

      {hasFilters && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 border border-indigo-200 py-2.5 rounded-xl hover:bg-indigo-50 transition-all"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar filtros
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <span className="hover:text-indigo-600 cursor-pointer transition-colors">Inicio</span>
        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400" />
        <span className="text-gray-900 font-semibold">Tienda</span>
        {selectedCategory && (
          <>
            <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-gray-400" />
            <span className="text-indigo-600 font-semibold capitalize">{selectedCategory}</span>
          </>
        )}
      </nav>

      <div className="flex gap-8">
        {/* Sidebar desktop */}
        <div className="hidden lg:block w-60 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-36 shadow-sm">
            <FiltersPanel />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
            <p className="text-gray-600 text-sm">
              <span className="font-black text-gray-900 text-lg">{filtered.length}</span>
              <span className="ml-1">productos</span>
              {selectedCategory && <span className="text-indigo-600 ml-1 capitalize font-medium">en {selectedCategory}</span>}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filtros
                {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
              </button>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="relevance">Relevancia</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="rating">Mejor valorados</option>
              </select>

              <div className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setView('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setView('list')}
                  className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-700'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Product grid */}
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 bg-white rounded-2xl border border-gray-200"
            >
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-9 h-9 text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-700 mb-2">No encontramos productos</p>
              <p className="text-gray-400 text-sm mb-6">Prueba con otros filtros o términos de búsqueda</p>
              <button
                onClick={resetFilters}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors text-sm"
              >
                Ver todos los productos
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${selectedCategory}-${sortBy}-${maxPrice}`}
              initial="hidden"
              animate="show"
              variants={stagger}
              className={view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'
                : 'flex flex-col gap-4'
              }
            >
              <AnimatePresence>
                {filtered.map(product => (
                  <motion.div key={product.id} variants={fadeUp} layout>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* Mobile filters drawer */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative ml-auto w-80 bg-white h-full overflow-y-auto p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Filtros</h2>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <FiltersPanel />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function TiendaPage() {
  return (
    <Suspense>
      <TiendaContent />
    </Suspense>
  );
}
