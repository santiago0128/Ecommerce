'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FolderTree, Plus, Pencil, Trash2, Check, X, RefreshCw,
  Zap, Shirt, Home, Dumbbell, BookOpen, Sparkles, Tag, Gift,
  Coffee, Camera, Music, Gamepad2, Smartphone, Car, Utensils, Palette,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  product_count: number;
  avg_price: number | null;
  in_stock: number;
}

const ICONS: Record<string, LucideIcon> = {
  Zap, Shirt, Home, Dumbbell, BookOpen, Sparkles, Tag, Gift,
  Coffee, Camera, Music, Gamepad2, Smartphone, Car, Utensils, Palette,
};
const ICON_NAMES = Object.keys(ICONS);

const CategoryIcon = ({ name, className }: { name: string | null; className?: string }) => {
  const Icon = (name && ICONS[name]) || Tag;
  return <Icon className={className} />;
};

const EMPTY = { name: '', icon: 'Tag' };

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [form,       setForm]       = useState({ ...EMPTY });
  const [saving,     setSaving]     = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/categories');
      const data = await res.json();
      setCategories(data.categories ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openNew  = () => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); };
  const openEdit = (c: Category) => {
    setForm({ name: c.name, icon: c.icon ?? 'Tag' });
    setEditing(c); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    setSaving(true);
    try {
      const body   = { name: form.name.trim(), icon: form.icon };
      const url    = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Error'); return; }
      toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
      setShowForm(false);
      fetch_();
    } finally { setSaving(false); }
  };

  const handleDelete = async (c: Category) => {
    const res = await fetch(`/api/admin/categories/${c.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success(`Categoría "${c.name}" eliminada`); fetch_(); }
    else toast.error('Error al eliminar');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><FolderTree className="w-5 h-5 text-indigo-600" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Categorías</h1><p className="text-sm text-gray-500">{categories.length} categorías registradas</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Nueva categoría
          </button>
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <motion.div initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">{editing ? 'Editar categoría' : 'Nueva categoría'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Electrónica"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ícono</label>
                  <div className="grid grid-cols-8 gap-2">
                    {ICON_NAMES.map(name => {
                      const Icon = ICONS[name];
                      const selected = form.icon === name;
                      return (
                        <button key={name} type="button" onClick={() => setForm(f => ({ ...f, icon: name }))}
                          className={`aspect-square flex items-center justify-center rounded-xl border transition-colors ${selected ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                          <Icon className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 text-sm">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-16 text-center text-gray-400">Cargando categorías...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <motion.div key={cat.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <CategoryIcon name={cat.icon} className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{cat.name}</h3>
                  <p className="text-sm text-gray-500">{cat.product_count} productos</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Precio promedio</span>
                  <span className="font-medium text-gray-900">${cat.avg_price ? Number(cat.avg_price).toFixed(2) : '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Con stock</span>
                  <span className="font-medium text-emerald-600">{cat.in_stock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Sin stock</span>
                  <span className="font-medium text-red-500">{cat.product_count - cat.in_stock}</span>
                </div>
              </div>
              <Link
                href={`/tienda?category=${cat.slug}`}
                target="_blank"
                className="mb-3 block text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Ver en tienda →
              </Link>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Pencil className="w-3.5 h-3.5" /> Editar
                </button>
                <button onClick={() => handleDelete(cat)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-200"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
