'use client';

import { useState } from 'react';
import { TaxRate } from '@/types';
import { Receipt, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL: TaxRate[] = [
  { id: '1', name: 'IVA General',   rate: 21, country: 'España',   active: true },
  { id: '2', name: 'IVA Reducido',  rate: 10, country: 'España',   active: true },
  { id: '3', name: 'IVA Superreducido', rate: 4, country: 'España', active: true },
  { id: '4', name: 'TVA Standard',  rate: 20, country: 'Francia',  active: false },
  { id: '5', name: 'MwSt Standard', rate: 19, country: 'Alemania', active: false },
];

const EMPTY: Omit<TaxRate, 'id'> = { name: '', rate: 21, country: 'España', active: true };

export default function ImpuestosAdmin() {
  const [taxes, setTaxes]       = useState<TaxRate[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<TaxRate | null>(null);
  const [form, setForm]         = useState<Omit<TaxRate, 'id'>>(EMPTY);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (t: TaxRate) => { setForm({ name: t.name, rate: t.rate, country: t.country, active: t.active }); setEditing(t); setShowForm(true); };

  const save = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editing) {
      setTaxes(prev => prev.map(t => t.id === editing.id ? { ...t, ...form } : t));
      toast.success('Impuesto actualizado');
    } else {
      setTaxes(prev => [...prev, { ...form, id: String(Date.now()) }]);
      toast.success('Impuesto creado');
    }
    setShowForm(false);
  };

  const toggle = (id: string) => setTaxes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t));

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Impuestos</h1>
            <p className="text-sm text-gray-500">{taxes.filter(t => t.active).length} activos</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
          <Plus className="w-4 h-4" /> Nuevo impuesto
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">{editing ? 'Editar impuesto' : 'Nuevo impuesto'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="IVA General"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tasa (%)</label>
                    <input type="number" min={0} max={100} value={form.rate}
                      onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">País</label>
                    <input value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                      placeholder="España"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                    className={`w-10 h-6 rounded-full transition-colors relative ${form.active ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{form.active ? 'Activo' : 'Inactivo'}</span>
                </label>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Cancelar</button>
                <button onClick={save} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" /> Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <span>Nombre</span>
          <span>Tasa</span>
          <span>País</span>
          <span>Estado</span>
          <span>Acciones</span>
        </div>
        {taxes.map((tax, i) => (
          <motion.div
            key={tax.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors"
          >
            <p className="font-semibold text-gray-800 text-sm">{tax.name}</p>
            <p className="font-black text-gray-900">{tax.rate}%</p>
            <p className="text-sm text-gray-600">{tax.country}</p>
            <button onClick={() => toggle(tax.id)} className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full transition-colors ${
              tax.active ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>
              {tax.active ? 'Activo' : 'Inactivo'}
            </button>
            <div className="flex gap-1.5">
              <button onClick={() => openEdit(tax)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setTaxes(prev => prev.filter(t => t.id !== tax.id)); toast.success('Impuesto eliminado'); }}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
