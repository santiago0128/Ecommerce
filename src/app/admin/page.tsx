'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package, DollarSign, Users, ShoppingBag, AlertTriangle,
  TrendingUp, ArrowRight, Plus, ExternalLink, Boxes, BarChart3,
  RotateCcw, Truck, CheckCircle2, Clock, XCircle,
} from 'lucide-react';

interface DashStats {
  orders:       { total: number; pending: number; processing: number; shipped: number; delivered: number };
  products:     { total: number; low_stock: number };
  customers:    { total: number };
  revenue:      { total_revenue: number; today: number; last_7_days: number; last_30_days: number };
  recentOrders: Array<{ id: string; number: string; total: number; status: string; customer_name: string; created_at: string }>;
}

const STATUS_CFG: Record<string, { color: string; icon: React.ElementType }> = {
  pending:    { color: 'bg-yellow-100 text-yellow-700',   icon: Clock },
  processing: { color: 'bg-blue-100 text-blue-700',       icon: RotateCcw },
  shipped:    { color: 'bg-indigo-100 text-indigo-700',   icon: Truck },
  delivered:  { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled:  { color: 'bg-red-100 text-red-700',         icon: XCircle },
};

const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function AdminDashboard() {
  const [stats,   setStats]   = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-96">
      <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
    </div>
  );

  if (!stats) return (
    <div className="p-8 text-center text-gray-500">No se pudieron cargar las estadísticas.</div>
  );

  const { orders, products, customers, revenue, recentOrders } = stats;
  const alerts = (orders.pending ?? 0) + (products.low_stock ?? 0);

  const statCards = [
    {
      label: 'Pedidos totales', value: orders.total,
      sub: `${orders.pending} pendientes`,
      icon: ShoppingBag, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
    },
    {
      label: 'Ingresos 30 días', value: `$${Number(revenue.last_30_days).toLocaleString('es', { minimumFractionDigits: 0 })}`,
      sub: `Hoy: $${Number(revenue.today).toFixed(2)}`,
      icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', trend: 'up',
    },
    {
      label: 'Clientes', value: customers.total,
      sub: 'Registrados en total',
      icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100',
    },
    {
      label: 'Alertas', value: alerts,
      sub: `${orders.pending} pedidos · ${products.low_stock} productos`,
      icon: AlertTriangle,
      color: alerts > 0 ? 'text-red-600' : 'text-gray-400',
      bg: alerts > 0 ? 'bg-red-50' : 'bg-gray-50',
      border: alerts > 0 ? 'border-red-100' : 'border-gray-100',
      trend: alerts > 0 ? 'down' : null,
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="flex items-center justify-between">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Resumen general · <span className="text-indigo-600 font-medium">Tiempo real</span></p>
        </motion.div>
        <motion.div variants={fadeUp} className="flex gap-2">
          <Link href="/tienda" target="_blank" className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ExternalLink className="w-3.5 h-3.5" /> Ver tienda
          </Link>
          <Link href="/admin/productos" className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Nuevo producto
          </Link>
        </motion.div>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} variants={fadeUp} className={`bg-white rounded-2xl p-5 border ${s.border} shadow-sm hover:shadow-md transition-shadow`}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${s.bg} ${s.color} rounded-xl flex items-center justify-center`}><Icon className="w-5 h-5" /></div>
                {s.trend === 'up' && <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-full"><TrendingUp className="w-3 h-3" />Activo</span>}
                {s.trend === 'down' && <span className="flex items-center gap-1 text-red-500 text-xs font-bold bg-red-50 px-2 py-1 rounded-full"><AlertTriangle className="w-3 h-3" />Alerta</span>}
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-sm font-semibold text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            <h2 className="font-bold text-gray-900 text-sm">Ingresos</h2>
          </div>
          <div className="space-y-4">
            {[
              { label: 'Hoy',        value: revenue.today },
              { label: 'Últimos 7 días', value: revenue.last_7_days },
              { label: 'Últimos 30 días', value: revenue.last_30_days },
              { label: 'Total histórico', value: revenue.total_revenue },
            ].map(item => (
              <div key={item.label}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="font-black text-gray-900">${Number(item.value).toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((Number(item.value) / Math.max(Number(revenue.total_revenue), 1)) * 100, 100)}%` }}
                    transition={{ duration: 0.8, delay: 0.4 }} className="h-full bg-indigo-500 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2"><Package className="w-4 h-4 text-indigo-500" /><h2 className="font-bold text-gray-900 text-sm">Pedidos recientes</h2></div>
            <Link href="/admin/pedidos" className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1">Ver todos <ArrowRight className="w-3 h-3" /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8"><Package className="w-8 h-8 text-gray-200 mb-2" /><p className="text-sm text-gray-400">No hay pedidos aún</p></div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map(o => {
                const cfg = STATUS_CFG[o.status] ?? STATUS_CFG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={o.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.color}`}><StatusIcon className="w-3.5 h-3.5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{o.number}</p>
                      <p className="text-xs text-gray-400 truncate">{o.customer_name}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-gray-900">${Number(o.total).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">{o.created_at}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4"><ShoppingBag className="w-4 h-4 text-indigo-500" /><h2 className="font-bold text-gray-900 text-sm">Acciones rápidas</h2></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/admin/productos', label: 'Añadir producto', icon: Plus,         color: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200' },
            { href: '/admin/inventario', label: 'Ajustar stock',  icon: Boxes,        color: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200' },
            { href: '/admin/pedidos',   label: 'Ver pedidos',     icon: Package,      color: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-200' },
            { href: '/tienda',          label: 'Abrir tienda',    icon: ExternalLink, color: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200', target: true },
          ].map(action => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href} target={action.target ? '_blank' : undefined}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl text-center font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 ${action.color}`}>
                <Icon className="w-5 h-5" />{action.label}
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
