'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Search, TrendingUp, ShoppingBag, Mail, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface Customer {
  id: string; name: string; email: string; phone?: string;
  joined_at: string; order_count: number; total_spent: number; last_order?: string;
}

export default function ClientesAdmin() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [sort,      setSort]      = useState<'spent'|'orders'|'name'>('spent');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort });
      if (search) params.set('search', search);
      const res  = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      setCustomers(data.customers ?? []);
    } finally { setLoading(false); }
  }, [search, sort]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const total    = customers.length;
  const revenue  = customers.reduce((s, c) => s + Number(c.total_spent), 0);
  const avgSpent = total ? revenue / total : 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Users className="w-5 h-5 text-blue-600" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Clientes</h1><p className="text-sm text-gray-500">{total} clientes registrados</p></div>
        </div>
        <button onClick={fetchCustomers} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total clientes',   value: total,                    icon: Users,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Ingresos totales', value: `$${revenue.toFixed(2)}`, icon: TrendingUp,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Gasto promedio',   value: `$${avgSpent.toFixed(2)}`, icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
              <div className={`w-11 h-11 ${s.bg} rounded-xl flex items-center justify-center`}><Icon className={`w-5 h-5 ${s.color}`} /></div>
              <div><p className="text-xl font-black text-gray-900">{s.value}</p><p className="text-xs text-gray-500">{s.label}</p></div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
          className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
          <option value="spent">Mayor gasto</option>
          <option value="orders">Más pedidos</option>
          <option value="name">Nombre A-Z</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando clientes...</div>
        ) : customers.length === 0 ? (
          <div className="py-16 text-center"><Users className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No se encontraron clientes</p></div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Cliente</span><span>Email</span><span>Pedidos</span><span>Total gastado</span><span>Miembro desde</span>
            </div>
            {customers.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-2 md:grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-4 px-5 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <div><p className="text-sm font-bold text-gray-800">{c.name}</p>{c.phone && <p className="text-xs text-gray-400">{c.phone}</p>}</div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Mail className="w-3.5 h-3.5 text-gray-400 hidden md:block" />
                  <span className="truncate text-xs md:text-sm">{c.email}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5 text-indigo-400 hidden md:block" />
                  <span className="font-bold text-gray-800 text-sm">{c.order_count}</span>
                </div>
                <span className="font-black text-emerald-600 text-sm">${Number(c.total_spent).toFixed(2)}</span>
                <span className="text-xs text-gray-400 hidden md:block">
                  {c.joined_at ? new Date(c.joined_at).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }) : '—'}
                </span>
              </motion.div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
