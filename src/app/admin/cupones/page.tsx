'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Coupon {
  id: string; code: string; type: 'percentage'|'fixed'; value: number;
  min_order?: number; max_uses?: number; used_count: number;
  active: boolean; expires_at?: string; created_at?: string;
}

const EMPTY = { code: '', type: 'percentage' as const, value: 10, active: true, min_order: '', max_uses: '', expires_at: '' };

export default function CuponesAdmin() {
  const [coupons,   setCoupons]   = useState<Coupon[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Coupon|null>(null);
  const [form,      setForm]      = useState({ ...EMPTY });
  const [saving,    setSaving]    = useState(false);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/admin/coupons');
      const data = await res.json();
      setCoupons(data.coupons ?? []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  const openNew  = () => { setForm({ ...EMPTY }); setEditing(null); setShowForm(true); };
  const openEdit = (c: Coupon) => {
    setForm({ code: c.code, type: c.type as typeof EMPTY.type, value: c.value,
      active: c.active, min_order: c.min_order ? String(c.min_order) : '',
      max_uses: c.max_uses ? String(c.max_uses) : '', expires_at: c.expires_at ?? '' });
    setEditing(c); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) { toast.error('El código es obligatorio'); return; }
    setSaving(true);
    try {
      const body = {
        code: form.code.toUpperCase(), type: form.type, value: form.value, active: form.active,
        min_order:  form.min_order  ? parseFloat(form.min_order)  : null,
        max_uses:   form.max_uses   ? parseInt(form.max_uses)     : null,
        expires_at: form.expires_at || null,
      };
      const url    = editing ? `/api/admin/coupons/${editing.id}` : '/api/admin/coupons';
      const method = editing ? 'PUT' : 'POST';
      const res    = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data   = await res.json();
      if (!res.ok) { toast.error(data.error ?? 'Error'); return; }
      toast.success(editing ? 'Cupón actualizado' : 'Cupón creado');
      setShowForm(false);
      fetch_();
    } finally { setSaving(false); }
  };

  const handleToggle = async (c: Coupon) => {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ active: !c.active }) });
    fetch_();
  };

  const handleDelete = async (c: Coupon) => {
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' });
    if (res.ok) { toast.success(`Cupón ${c.code} eliminado`); fetch_(); }
    else toast.error('Error al eliminar');
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Tag className="w-5 h-5 text-amber-600" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Cupones y descuentos</h1><p className="text-sm text-gray-500">{coupons.length} cupones registrados</p></div>
        </div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
          <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm">
            <Plus className="w-4 h-4" /> Nuevo cupón
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
                <h2 className="font-black text-gray-900">{editing ? 'Editar cupón' : 'Nuevo cupón'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Código</label>
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="VERANO20"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 font-mono tracking-wider" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as typeof EMPTY.type }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400">
                      <option value="percentage">Porcentaje (%)</option>
                      <option value="fixed">Monto fijo ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valor {form.type === 'percentage' ? '(%)' : '($)'}</label>
                    <input type="number" min={0} max={form.type === 'percentage' ? 100 : undefined} value={form.value}
                      onChange={e => setForm(f => ({ ...f, value: +e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pedido mínimo ($)</label>
                    <input type="number" min={0} value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Usos máximos</label>
                    <input type="number" min={1} value={form.max_uses} onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Expira el</label>
                  <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{form.active ? 'Activo' : 'Inactivo'}</span>
                </label>
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
        <div className="py-16 text-center text-gray-400">Cargando cupones...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {coupons.map(coupon => {
            const usagePercent = coupon.max_uses ? Math.min((coupon.used_count / coupon.max_uses) * 100, 100) : 0;
            const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            return (
              <motion.div key={coupon.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-black text-gray-900 text-lg font-mono tracking-wider">{coupon.code}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {coupon.type === 'percentage' ? `${coupon.value}% de descuento` : `$${coupon.value} de descuento`}
                      {coupon.min_order ? ` · mín. $${coupon.min_order}` : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${!coupon.active || expired ? 'bg-gray-100 text-gray-500' : 'bg-emerald-100 text-emerald-700'}`}>
                    {!coupon.active ? 'Inactivo' : expired ? 'Expirado' : 'Activo'}
                  </span>
                </div>
                {coupon.max_uses && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Usos: {coupon.used_count} / {coupon.max_uses}</span><span>{Math.round(usagePercent)}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${usagePercent >= 100 ? 'bg-red-400' : 'bg-indigo-400'}`} style={{ width: `${usagePercent}%` }} />
                    </div>
                  </div>
                )}
                {coupon.expires_at && <p className="text-xs text-gray-400 mb-3">Expira: {new Date(coupon.expires_at).toLocaleDateString('es-ES')}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleToggle(coupon)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors border ${coupon.active ? 'border-gray-200 text-gray-600 hover:bg-gray-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50'}`}>
                    {coupon.active ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                    {coupon.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button onClick={() => openEdit(coupon)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl border border-gray-200"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(coupon)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-gray-200"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
