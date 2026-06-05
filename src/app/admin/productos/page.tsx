'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, Star, X, Package,
  ChevronUp, ChevronDown, ImageOff, RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string; name: string; description: string; price: number;
  original_price?: number; image: string; category_id: string;
  category_name?: string; stock: number; sku?: string; brand?: string;
  rating: number; review_count: number; featured: boolean; active: boolean; tags: string[];
}

interface Category { id: string; name: string; slug: string; }

const EMPTY_FORM = {
  name: '', description: '', price: '', original_price: '',
  image: '', category_id: '', stock: '', sku: '', brand: '', featured: false,
};

type SortField = 'name' | 'price' | 'stock' | 'rating';

export default function AdminProductos() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [stockFilter, setStockFilter] = useState<'all'|'low'|'out'>('all');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState<string|null>(null);
  const [form,       setForm]       = useState({ ...EMPTY_FORM });
  const [deleteConfirm, setDeleteConfirm] = useState<string|null>(null);
  const [sortField,  setSortField]  = useState<SortField>('name');
  const [sortDir,    setSortDir]    = useState<'asc'|'desc'>('asc');
  const [saving,     setSaving]     = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search)    params.set('search', search);
      if (catFilter) params.set('category', catFilter);
      if (stockFilter !== 'all') params.set('stock', stockFilter);
      const res  = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      setProducts(data.products ?? []);
    } finally { setLoading(false); }
  }, [search, catFilter, stockFilter]);

  useEffect(() => {
    fetch('/api/admin/products').then(r => r.json()).then(d => setProducts(d.products ?? []));
    fetch('/api/admin/coupons').catch(() => {}); // warm pool
    sqlcmdFetchCategories().then(setCategories);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function sqlcmdFetchCategories(): Promise<Category[]> {
    try {
      const res = await fetch('/api/admin/categories');
      if (!res.ok) return [];
      const d = await res.json();
      return d.categories ?? [];
    } catch { return []; }
  }

  const openCreate = () => { setEditingId(null); setForm({ ...EMPTY_FORM }); setModalOpen(true); };
  const openEdit   = (p: Product) => {
    setEditingId(p.id);
    setForm({ name: p.name, description: p.description ?? '', price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      image: p.image ?? '', category_id: p.category_id ?? '',
      stock: String(p.stock), sku: p.sku ?? '', brand: p.brand ?? '', featured: p.featured });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) { toast.error('Nombre, precio y stock son requeridos'); return; }
    setSaving(true);
    try {
      const body = {
        name: form.name.trim(), description: form.description.trim(),
        price: form.price, original_price: form.original_price || null,
        image: form.image.trim(), category_id: form.category_id || null,
        stock: form.stock, sku: form.sku || null, brand: form.brand || null,
        featured: form.featured, tags: [],
      };
      const url    = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';
      const method = editingId ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); toast.error(d.error ?? 'Error'); return; }
      toast.success(editingId ? 'Producto actualizado' : 'Producto creado');
      setModalOpen(false);
      fetchProducts();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Producto desactivado'); setDeleteConfirm(null); fetchProducts(); }
    else toast.error('Error al eliminar');
  };

  const handleToggleFeatured = async (p: Product) => {
    await fetch(`/api/admin/products/${p.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ featured: !p.featured }) });
    fetchProducts();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
  };

  const sorted = [...products].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name')   cmp = a.name.localeCompare(b.name);
    if (sortField === 'price')  cmp = a.price - b.price;
    if (sortField === 'stock')  cmp = a.stock - b.stock;
    if (sortField === 'rating') cmp = a.rating - b.rating;
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-800">
      {label}
      <span className="flex flex-col">
        <ChevronUp   className={`w-2.5 h-2.5 -mb-0.5 ${sortField === field && sortDir === 'asc'  ? 'text-indigo-600' : 'text-gray-300'}`} />
        <ChevronDown className={`w-2.5 h-2.5 ${sortField === field && sortDir === 'desc' ? 'text-indigo-600' : 'text-gray-300'}`} />
      </span>
    </button>
  );

  const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';
  const discount = form.price && form.original_price
    ? Math.round(((parseFloat(form.original_price) - parseFloat(form.price)) / parseFloat(form.original_price)) * 100) : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Productos</h1>
          <p className="text-gray-500 text-sm mt-0.5">{products.length} en catálogo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProducts} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md">
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" placeholder="Buscar por nombre..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all" />
        </div>
        {categories.length > 0 && (
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="border border-gray-200 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">Todas las categorías</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-gray-50">
          {(['all','low','out'] as const).map((v, i) => (
            <button key={v} onClick={() => setStockFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${stockFilter === v ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}>
              {['Todos','Stock bajo','Agotados'][i]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando productos...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-left"><SortBtn field="name" label="Producto" /></th>
                  <th className="px-5 py-3.5 text-left hidden md:table-cell"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Categoría</span></th>
                  <th className="px-5 py-3.5 text-left"><SortBtn field="price" label="Precio" /></th>
                  <th className="px-5 py-3.5 text-left"><SortBtn field="stock" label="Stock" /></th>
                  <th className="px-5 py-3.5 text-left hidden lg:table-cell"><SortBtn field="rating" label="Rating" /></th>
                  <th className="px-5 py-3.5 text-left hidden xl:table-cell"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Destacado</span></th>
                  <th className="px-5 py-3.5 text-right"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Acciones</span></th>
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="flex flex-col items-center gap-3"><Package className="w-10 h-10 text-gray-200" /><p className="text-gray-400">No se encontraron productos</p></div></td></tr>
                ) : sorted.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: i * 0.02 } }}
                    className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {p.image ? <Image src={p.image} alt={p.name} width={44} height={44} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageOff className="w-5 h-5 text-gray-300" /></div>}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1 max-w-[200px]">{p.name}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{p.sku ?? p.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">{p.category_name ?? p.category_id ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-gray-900 text-sm">${p.price.toFixed(2)}</p>
                      {p.original_price && <p className="text-xs text-gray-400 line-through">${p.original_price.toFixed(2)}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-bold ${p.stock === 0 ? 'bg-red-100 text-red-700' : p.stock <= 5 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {p.stock === 0 ? 'Agotado' : `${p.stock} uds`}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <div className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold text-gray-700">{p.rating ?? '—'}</span>
                        <span className="text-xs text-gray-400">({p.review_count ?? 0})</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden xl:table-cell">
                      <button onClick={() => handleToggleFeatured(p)}
                        className={`w-8 h-5 rounded-full transition-all relative ${p.featured ? 'bg-amber-400' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${p.featured ? 'left-3.5' : 'left-0.5'}`} />
                      </button>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteConfirm(p.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-indigo-600" /></div>
                <h2 className="text-base font-bold text-gray-900">{editingId ? 'Editar producto' : 'Nuevo producto'}</h2>
                <button onClick={() => setModalOpen(false)} className="ml-auto p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <div className="overflow-y-auto flex-1 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Nombre *</label>
                    <input className={inputCls} value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Nombre del producto" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Descripción</label>
                    <textarea className={`${inputCls} h-20 resize-none`} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Precio *</label>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                      <input className={`${inputCls} pl-7`} type="number" min="0" step="0.01" value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Precio original {discount > 0 && <span className="text-emerald-600 normal-case">(-{discount}%)</span>}</label>
                    <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">$</span>
                      <input className={`${inputCls} pl-7`} type="number" min="0" step="0.01" value={form.original_price} onChange={e => setForm(f => ({...f, original_price: e.target.value}))} /></div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Stock *</label>
                    <input className={inputCls} type="number" min="0" value={form.stock} onChange={e => setForm(f => ({...f, stock: e.target.value}))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Categoría</label>
                    <select className={inputCls} value={form.category_id} onChange={e => setForm(f => ({...f, category_id: e.target.value}))}>
                      <option value="">Sin categoría</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">SKU</label>
                    <input className={inputCls} value={form.sku} onChange={e => setForm(f => ({...f, sku: e.target.value}))} placeholder="ABC-001" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Marca</label>
                    <input className={inputCls} value={form.brand} onChange={e => setForm(f => ({...f, brand: e.target.value}))} placeholder="Marca" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">URL de imagen</label>
                    <input className={inputCls} value={form.image} onChange={e => setForm(f => ({...f, image: e.target.value}))} placeholder="https://..." />
                    {form.image && <div className="mt-2 w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50"><Image src={form.image} alt="preview" width={80} height={80} className="w-full h-full object-cover" /></div>}
                  </div>
                  <div className="md:col-span-2">
                    <button type="button" onClick={() => setForm(f => ({...f, featured: !f.featured}))}
                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all w-full text-left ${form.featured ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
                      <Star className={`w-5 h-5 ${form.featured ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                      <div><p className="font-semibold text-gray-900 text-sm">Producto destacado</p><p className="text-xs text-gray-500">Aparece en sección destacada</p></div>
                      <div className={`ml-auto w-10 h-6 rounded-full transition-all ${form.featured ? 'bg-amber-400' : 'bg-gray-200'} relative`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.featured ? 'left-5' : 'left-1'}`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">Cancelar</button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.price || !form.stock}
                  className="px-5 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-40 shadow-sm">
                  {saving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4"><Trash2 className="w-7 h-7 text-red-600" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Desactivar producto</h3>
              <p className="text-sm text-gray-500 mb-6">El producto se ocultará del catálogo pero no se eliminará de la base de datos.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200">Cancelar</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-600 rounded-xl hover:bg-red-700">Desactivar</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
