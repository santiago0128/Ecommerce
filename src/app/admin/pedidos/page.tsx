'use client';

import { useState, useEffect, useCallback } from 'react';
import { Package, Search, ChevronDown, Truck, CheckCircle2, Clock, XCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string; number: string; status: string; total: number;
  customer_name: string; customer_email: string;
  payment_method?: string; tracking_number?: string; created_at: string;
  shipping_address?: Record<string, string>;
  items?: Array<{ product_name: string; quantity: number; price: number }>;
}

const STATUS_CONFIG: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  pending:    { color: 'bg-yellow-100 text-yellow-700',   icon: Clock,        label: 'Pendiente' },
  processing: { color: 'bg-blue-100 text-blue-700',       icon: RotateCcw,    label: 'Procesando' },
  shipped:    { color: 'bg-indigo-100 text-indigo-700',   icon: Truck,        label: 'Enviado' },
  delivered:  { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2, label: 'Entregado' },
  cancelled:  { color: 'bg-red-100 text-red-700',         icon: XCircle,      label: 'Cancelado' },
};

const STATUS_OPTIONS = ['pending','processing','shipped','delivered','cancelled'];

export default function PedidosAdmin() {
  const [orders,   setOrders]   = useState<Order[]>([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [detail,   setDetail]   = useState<Record<string, Order>>({});

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);
      const res  = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders ?? []);
      setTotal(data.total ?? 0);
    } finally { setLoading(false); }
  }, [filter, search]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadDetail = async (id: string) => {
    if (detail[id]) return;
    const res  = await fetch(`/api/admin/orders/${id}`);
    const data = await res.json();
    if (data.order) setDetail(prev => ({ ...prev, [id]: data.order }));
  };

  const handleExpand = (id: string) => {
    const next = expanded === id ? null : id;
    setExpanded(next);
    if (next) loadDetail(next);
  };

  const handleStatus = async (id: string, status: string, num: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) {
      toast.success(`Pedido ${num} → ${STATUS_CONFIG[status]?.label ?? status}`);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      setDetail(prev => { const c = { ...prev }; delete c[id]; return c; });
    } else toast.error('Error al actualizar');
  };

  const counts: Record<string, number> = { all: total };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center"><Package className="w-5 h-5 text-indigo-600" /></div>
          <div><h1 className="text-xl font-black text-gray-900">Pedidos</h1><p className="text-sm text-gray-500">{total} pedidos en total</p></div>
        </div>
        <button onClick={fetchOrders} className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50"><RefreshCw className="w-4 h-4" /></button>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[{ key: 'all', label: 'Todos' }, ...STATUS_OPTIONS.map(s => ({ key: s, label: STATUS_CONFIG[s]?.label ?? s }))].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${filter === key ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
            {label} {counts[key] !== undefined ? `(${counts[key]})` : ''}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por número de pedido o cliente..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-300" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando pedidos...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16"><Package className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No se encontraron pedidos</p></div>
        ) : (
          <div>
            <div className="hidden lg:grid grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <span>Pedido</span><span>Cliente</span><span>Fecha</span><span>Estado</span><span>Total</span><span></span>
            </div>
            <AnimatePresence>
              {orders.map((order, i) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                const isOpen = expanded === order.id;
                const det = detail[order.id];
                return (
                  <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-gray-100 last:border-0">
                    <div className="grid grid-cols-2 lg:grid-cols-[1fr_1.5fr_1fr_1fr_0.8fr_0.5fr] gap-4 px-5 py-4 items-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleExpand(order.id)}>
                      <div><p className="font-black text-gray-900 text-sm">{order.number}</p><p className="text-xs text-gray-400 lg:hidden">{order.created_at}</p></div>
                      <div><p className="text-sm text-gray-700 font-medium">{order.customer_name}</p><p className="text-xs text-gray-400">{order.customer_email}</p></div>
                      <p className="text-sm text-gray-500 hidden lg:block">{order.created_at}</p>
                      <div><span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.color}`}><StatusIcon className="w-3 h-3" />{cfg.label}</span></div>
                      <p className="font-black text-gray-900">${Number(order.total).toFixed(2)}</p>
                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </div>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="px-5 pb-5 bg-gray-50 border-t border-gray-100">
                            {!det ? (
                              <p className="pt-4 text-sm text-gray-400">Cargando detalle...</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Dirección de envío</h4>
                                  {det.shipping_address && (
                                    <>
                                      <p className="text-sm text-gray-700">{det.shipping_address.firstName} {det.shipping_address.lastName}</p>
                                      <p className="text-sm text-gray-600">{det.shipping_address.address}</p>
                                      <p className="text-sm text-gray-600">{det.shipping_address.zipCode} {det.shipping_address.city}</p>
                                    </>
                                  )}
                                  {order.tracking_number && <p className="text-xs text-indigo-600 font-semibold mt-1">Seguimiento: {order.tracking_number}</p>}
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Actualizar estado</h4>
                                  <div className="flex flex-wrap gap-1.5">
                                    {STATUS_OPTIONS.map(s => (
                                      <button key={s} onClick={() => handleStatus(order.id, s, order.number)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all border ${order.status === s ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-300'}`}>
                                        {STATUS_CONFIG[s]?.label ?? s}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                {det.items && det.items.length > 0 && (
                                  <div className="md:col-span-2">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Productos</h4>
                                    <div className="space-y-1.5">
                                      {det.items.map((item, j) => (
                                        <div key={j} className="flex items-center gap-2 text-sm text-gray-700">
                                          <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center text-xs font-bold">{item.quantity}</span>
                                          <span>{item.product_name}</span>
                                          <span className="ml-auto font-semibold">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
