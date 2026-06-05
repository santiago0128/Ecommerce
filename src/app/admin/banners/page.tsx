'use client';

import { useState, useEffect, useCallback } from 'react';
import { Image as ImageIcon, Plus, Pencil, Trash2, GripVertical, Check, X, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Banner {
  id: string; title: string; subtitle?: string; image?: string;
  link?: string; bg_color?: string; active: boolean; sort_order: number;
}

const BG_OPTIONS = [
  'from-indigo-500 to-purple-600', 'from-orange-400 to-pink-500',
  'from-emerald-400 to-teal-500',  'from-blue-500 to-cyan-500',
  'from-rose-400 to-red-500',      'from-amber-400 to-orange-500',
];

const EMPTY = { title: '', subtitle: '', bg_color: BG_OPTIONS[0], active: true, link: '', sort_order: 99 };

export default function BannersAdmin() {
  const [banners,  setBanners]  = useState<Banner[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Banner|null>(null);
  const [form,     setForm]     = useState({ ...EMPTY });
  const [saving,   setSaving]   = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/banners');
      const data = await res.json();
      setBanners(data.banners ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openNew  = () => { setForm({ ...EMPTY, sort_order: banners.length + 1 }); setEditing(null); setShowForm(true); };
  const openEdit = (b: Banner) => {
    setForm({ title: b.title, subtitle: b.subtitle ?? '', bg_color: b.bg_color ?? BG_OPTIONS[0], active: b.active, link: b.link ?? '', sort_order: b.sort_order });
    setEditing(b); setShowForm(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('El título es obligatorio'); return; }
    setSaving(true);
    try {
      const body = { ...form, subtitle: form.subtitle || null, link: form.link || null };
      const url    = editing ? `/api/admin/banners/${editing.id}` : '/api/admin/banners';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Error'); return; }
      toast.success(editing ? 'Banner actualizado' : 'Banner creado');
      setShowForm(false);
      fetch_();
    } finally { setSaving(false); }
  };

  const toggle = async (b: Banner) => {
    await fetch(`/api/admin/banners/${b.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !b.active }) });
    fetch_();
  };

  const remove = async (b: Banner) => {
    const res = await fetch(`/api/admin/banners/${b.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success('Banner eliminado'); fetch_(); }
    else toast.error('Error al eliminar');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center"><ImageIcon className="w-5 h-5 text-pink-600" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Banners y promociones</h1>
            <p className="text-sm text-gray-500">{banners.filter(b => b.active).length} activos de {banners.length}</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo banner
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
                <h2 className="font-black text-gray-900">{editing ? 'Editar banner' : 'Nuevo banner'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej. Verano 2025"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subtítulo</label>
                  <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="Hasta 40% descuento"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Enlace (opcional)</label>
                  <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="/tienda?category=ropa"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color de fondo</label>
                  <div className="flex flex-wrap gap-2">
                    {BG_OPTIONS.map(bg => (
                      <button key={bg} onClick={() => setForm(f => ({ ...f, bg_color: bg }))}
                        className={`w-9 h-9 rounded-xl bg-gradient-to-r ${bg} transition-all ${form.bg_color === bg ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`} />
                    ))}
                  </div>
                </div>
                <div className={`h-16 rounded-xl bg-gradient-to-r ${form.bg_color} flex items-center px-4`}>
                  <div>
                    <p className="text-white font-black text-sm">{form.title || 'Título del banner'}</p>
                    {form.subtitle && <p className="text-white/80 text-xs">{form.subtitle}</p>}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancelar</button>
                <button onClick={save} disabled={saving} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2 disabled:opacity-50">
                  <Check className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="py-16 text-center text-gray-400">Cargando banners...</div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {[...banners].sort((a, b) => a.sort_order - b.sort_order).map(banner => (
              <motion.div key={banner.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="flex items-center gap-4 p-4">
                  <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />
                  <div className={`w-28 h-16 rounded-xl bg-gradient-to-r ${banner.bg_color ?? BG_OPTIONS[0]} flex items-center px-3 flex-shrink-0`}>
                    <div>
                      <p className="text-white font-black text-xs leading-tight">{banner.title}</p>
                      {banner.subtitle && <p className="text-white/70 text-[10px]">{banner.subtitle}</p>}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800">{banner.title}</p>
                    {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                    {banner.link && <p className="text-xs text-indigo-500 mt-0.5">{banner.link}</p>}
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${banner.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {banner.active ? 'Visible' : 'Oculto'}
                  </span>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button onClick={() => toggle(banner)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors">
                      {banner.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => openEdit(banner)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(banner)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
