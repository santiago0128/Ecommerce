'use client';

import Link from 'next/link';
import { useOrders } from '@/context/OrdersContext';
import { useAuth } from '@/context/AuthContext';
import { Package, ChevronRight, Truck, CheckCircle2, Clock, XCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType }> = {
  pendiente:  { label: 'Pendiente',  color: 'bg-yellow-100 text-yellow-700 border-yellow-200',   Icon: Clock },
  procesando: { label: 'Procesando', color: 'bg-blue-100 text-blue-700 border-blue-200',         Icon: RotateCcw },
  enviado:    { label: 'Enviado',    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',   Icon: Truck },
  entregado:  { label: 'Entregado',  color: 'bg-emerald-100 text-emerald-700 border-emerald-200', Icon: CheckCircle2 },
  cancelado:  { label: 'Cancelado',  color: 'bg-red-100 text-red-700 border-red-200',            Icon: XCircle },
};

export default function PedidosPage() {
  const { user } = useAuth();
  const { orders } = useOrders();

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Debes iniciar sesión para ver tus pedidos</p>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-3 mb-8">
        <Package className="w-7 h-7 text-indigo-600" />
        <h1 className="text-2xl font-black text-gray-900">Mis pedidos</h1>
        <span className="bg-gray-100 text-gray-600 text-sm font-bold px-2.5 py-1 rounded-full">{orders.length}</span>
      </div>

      {orders.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-24">
          <Package className="w-14 h-14 text-gray-200 mx-auto mb-5" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Aún no tienes pedidos</h2>
          <p className="text-gray-500 mb-6">Explora nuestra tienda y realiza tu primera compra</p>
          <Link href="/tienda" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-colors">
            Ir a la tienda <ChevronRight className="w-4 h-4" />
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, i) => {
            const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pendiente;
            const StatusIcon = cfg.Icon;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="flex items-center gap-4 p-5">
                  <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-indigo-500" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-black text-gray-900 text-sm">{order.number}</p>
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(order.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                    {order.items.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">{order.items.length} producto{order.items.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900">${order.total.toFixed(2)}</p>
                    {order.trackingNumber && (
                      <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">{order.trackingNumber}</p>
                    )}
                  </div>

                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                </div>

                {order.status === 'enviado' && order.trackingNumber && (
                  <div className="px-5 pb-4">
                    <div className="bg-indigo-50 rounded-xl p-3 flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-indigo-800">En camino a tu destino</p>
                        <p className="text-[11px] text-indigo-600">Nº seguimiento: {order.trackingNumber}</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
