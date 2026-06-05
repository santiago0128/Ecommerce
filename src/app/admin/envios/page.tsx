'use client';

import { useState } from 'react';
import { ShippingZone } from '@/types';
import { Truck, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const INITIAL: ShippingZone[] = [
  { id: '1', name: 'España Peninsular', countries: ['España'],              rate: 4.99, freeThreshold: 50,  carrier: 'Correos' },
  { id: '2', name: 'Islas Baleares',    countries: ['Baleares'],            rate: 6.99, freeThreshold: 75,  carrier: 'MRW' },
  { id: '3', name: 'Islas Canarias',    countries: ['Canarias', 'Ceuta', 'Melilla'], rate: 9.99, carrier: 'SEUR' },
  { id: '4', name: 'Europa',            countries: ['Francia', 'Alemania', 'Italia', 'Portugal'], rate: 12.99, freeThreshold: 100, carrier: 'DHL' },
  { id: '5', name: 'Internacional',     countries: ['Resto del mundo'],     rate: 24.99, carrier: 'FedEx' },
];

const EMPTY: Omit<ShippingZone, 'id'> = { name: '', countries: [], rate: 4.99 };

export default function EnviosAdmin() {
  const [zones, setZones]       = useState<ShippingZone[]>(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<ShippingZone | null>(null);
  const [form, setForm]         = useState<Omit<ShippingZone, 'id'>>(EMPTY);
  const [countriesInput, setCountriesInput] = useState('');

  const openNew = () => { setForm(EMPTY); setCountriesInput(''); setEditing(null); setShowForm(true); };
  const openEdit = (z: ShippingZone) => {
    setForm({ name: z.name, countries: z.countries, rate: z.rate, freeThreshold: z.freeThreshold, carrier: z.carrier });
    setCountriesInput(z.countries.join(', '));
    setEditing(z);
    setShowForm(true);
  };

  const save = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    const countries = countriesInput.split(',').map(c => c.trim()).filter(Boolean);
    const data = { ...form, countries };
    if (editing) {
      setZones(prev => prev.map(z => z.id === editing.id ? { ...z, ...data } : z));
      toast.success('Zona actualizada');
    } else {
      setZones(prev => [...prev, { ...data, id: String(Date.now()) }]);
      toast.success('Zona creada');
    }
    setShowForm(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Zonas de envío</h1>
            <p className="text-sm text-gray-500">{zones.length} zonas configuradas</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
          <Plus className="w-4 h-4" /> Nueva zona
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">{editing ? 'Editar zona' : 'Nueva zona'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre de la zona</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="España Peninsular"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Países / Regiones (separados por coma)</label>
                  <input value={countriesInput} onChange={e => setCountriesInput(e.target.value)}
                    placeholder="España, Portugal, Francia"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tarifa ($)</label>
                    <input type="number" min={0} step={0.01} value={form.rate}
                      onChange={e => setForm(f => ({ ...f, rate: +e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Envío gratis desde ($)</label>
                    <input type="number" min={0} value={form.freeThreshold ?? ''}
                      onChange={e => setForm(f => ({ ...f, freeThreshold: e.target.value ? +e.target.value : undefined }))}
                      placeholder="Sin mínimo"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Transportista</label>
                  <input value={form.carrier ?? ''} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))}
                    placeholder="Correos, DHL, MRW..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
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

      <div className="space-y-3">
        {zones.map((zone, i) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-gray-900">{zone.name}</p>
                  {zone.carrier && (
                    <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded-full">{zone.carrier}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {zone.countries.map(c => (
                    <span key={c} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{c}</span>
                  ))}
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-black text-gray-900">${zone.rate.toFixed(2)}</span>
                  {zone.freeThreshold && (
                    <span className="text-emerald-600 text-xs font-semibold">Gratis desde ${zone.freeThreshold}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => openEdit(zone)} className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-xl transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => { setZones(prev => prev.filter(z => z.id !== zone.id)); toast.success('Zona eliminada'); }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
