'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useProducts } from '@/context/ProductsContext';
import { Boxes, AlertTriangle, CheckCircle, Minus, Plus, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventario() {
  const { products, updateProduct } = useProducts();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out' | 'ok'>('all');
  const [editing, setEditing] = useState<Record<string, string>>({});

  const outOfStock = products.filter(p => p.stock === 0).length;
  const lowStock   = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const okStock    = products.filter(p => p.stock > 5).length;

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.category.includes(q);
    const matchFilter =
      filter === 'all' ? true
        : filter === 'out' ? p.stock === 0
        : filter === 'low' ? p.stock > 0 && p.stock <= 5
        : p.stock > 5;
    return matchSearch && matchFilter;
  });

  const handleStockChange = (id: string, delta: number) => {
    const p = products.find(p => p.id === id);
    if (!p) return;
    const newStock = Math.max(0, p.stock + delta);
    updateProduct(id, { stock: newStock });
    toast.success(`Stock actualizado: ${newStock} unidades`);
  };

  const handleDirectEdit = (id: string, value: string) => {
    setEditing(prev => ({ ...prev, [id]: value }));
  };

  const commitEdit = (id: string) => {
    const val = parseInt(editing[id]);
    if (!isNaN(val) && val >= 0) {
      updateProduct(id, { stock: val });
      toast.success(`Stock actualizado: ${val} unidades`);
    }
    setEditing(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-900">Inventario</h1>
        <p className="text-gray-500 text-sm mt-0.5">Gestiona el stock de todos tus productos</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Agotados',   value: outOfStock, icon: AlertTriangle, color: 'text-red-600',   bg: 'bg-red-50',    border: 'border-red-100',   filter: 'out' },
          { label: 'Stock bajo', value: lowStock,   icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50',  border: 'border-amber-100', filter: 'low' },
          { label: 'Disponible', value: okStock,    icon: CheckCircle,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', filter: 'ok' },
        ].map(card => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setFilter(f => f === card.filter as typeof filter ? 'all' : card.filter as typeof filter)}
              className={`flex items-center gap-4 p-4 bg-white rounded-2xl border ${card.border} shadow-sm hover:shadow-md transition-all text-left ${filter === card.filter ? 'ring-2 ring-offset-1 ring-indigo-400' : ''}`}
            >
              <div className={`w-11 h-11 ${card.bg} ${card.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-black text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 font-medium">{card.label}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="w-3.5 h-3.5" />
          <span className="font-medium">{filtered.length} productos</span>
        </div>
      </div>

      {/* Products list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 grid grid-cols-12 gap-4">
          <span className="col-span-5 text-xs font-bold uppercase tracking-wider text-gray-500">Producto</span>
          <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-gray-500 hidden md:block">Categoría</span>
          <span className="col-span-2 text-xs font-bold uppercase tracking-wider text-gray-500">Estado</span>
          <span className="col-span-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Ajustar stock</span>
        </div>

        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.04 } } }}>
          {filtered.map(product => {
            const isEditing = editing[product.id] !== undefined;
            return (
              <motion.div
                key={product.id}
                variants={staggerItem}
                className="px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-indigo-50/20 transition-colors grid grid-cols-12 gap-4 items-center"
              >
                {/* Product info */}
                <div className="col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                    <Image src={product.image} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">${product.price.toFixed(2)}</p>
                  </div>
                </div>

                {/* Category */}
                <div className="col-span-2 hidden md:block">
                  <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium capitalize">
                    {product.category}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                    product.stock === 0 ? 'bg-red-100 text-red-700'
                      : product.stock <= 5 ? 'bg-amber-100 text-amber-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {product.stock === 0 ? 'Agotado' : product.stock <= 5 ? 'Stock bajo' : 'Disponible'}
                  </span>
                </div>

                {/* Stock control */}
                <div className="col-span-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleStockChange(product.id, -1)}
                    disabled={product.stock === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-30 transition-all"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {isEditing ? (
                    <input
                      type="number"
                      value={editing[product.id]}
                      onChange={e => handleDirectEdit(product.id, e.target.value)}
                      onBlur={() => commitEdit(product.id)}
                      onKeyDown={e => e.key === 'Enter' && commitEdit(product.id)}
                      className="w-16 text-center border-2 border-indigo-400 rounded-lg py-1 text-sm font-bold text-gray-900 focus:outline-none bg-indigo-50"
                      autoFocus
                    />
                  ) : (
                    <button
                      onClick={() => handleDirectEdit(product.id, String(product.stock))}
                      className="w-16 text-center py-1.5 rounded-lg text-sm font-black text-gray-900 hover:bg-indigo-50 hover:text-indigo-700 transition-colors border border-transparent hover:border-indigo-200"
                      title="Clic para editar"
                    >
                      {product.stock}
                    </button>
                  )}

                  <button
                    onClick={() => handleStockChange(product.id, 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center">
              <Boxes className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-500">No se encontraron productos</p>
          </div>
        )}
      </div>
    </div>
  );
}
