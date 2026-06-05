'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrdersContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Phone, MapPin, Package, Heart, LogOut, Edit3, Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_COLORS: Record<string, string> = {
  pendiente:  'bg-yellow-100 text-yellow-700',
  procesando: 'bg-blue-100 text-blue-700',
  enviado:    'bg-indigo-100 text-indigo-700',
  entregado:  'bg-emerald-100 text-emerald-700',
  cancelado:  'bg-red-100 text-red-700',
};

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const { orders } = useOrders();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName]   = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">Debes iniciar sesión para ver tu perfil</p>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const recentOrders = orders.slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-black text-gray-900 mb-8">Mi cuenta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-800">Mis datos</h2>
            <button
              onClick={() => setEditing(!editing)}
              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            >
              {editing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex flex-col items-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg mb-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {editing ? (
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                className="text-center font-bold text-gray-800 border-b-2 border-indigo-400 outline-none bg-transparent w-full"
              />
            ) : (
              <p className="font-bold text-gray-800 text-lg">{user.name}</p>
            )}
            <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-1 rounded-full mt-1.5 capitalize">
              {user.role}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {editing ? (
                <input
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Tu teléfono"
                  className="border-b border-gray-300 outline-none bg-transparent flex-1"
                />
              ) : (
                <span>{phone || 'No especificado'}</span>
              )}
            </div>
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              {editing ? (
                <input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Tu dirección"
                  className="border-b border-gray-300 outline-none bg-transparent flex-1"
                />
              ) : (
                <span>{address || 'No especificado'}</span>
              )}
            </div>
          </div>

          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="mt-5 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          )}

          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <Link href="/wishlist" className="flex items-center gap-2.5 px-3 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-colors">
              <Heart className="w-4 h-4" /> Lista de deseos
            </Link>
            <Link href="/pedidos" className="flex items-center gap-2.5 px-3 py-2.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl text-sm font-medium transition-colors">
              <Package className="w-4 h-4" /> Mis pedidos
            </Link>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        </motion.div>

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-800">Pedidos recientes</h2>
            <Link href="/pedidos" className="text-indigo-600 text-sm font-semibold hover:underline">
              Ver todos
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Aún no tienes pedidos</p>
              <Link href="/tienda" className="text-indigo-600 text-sm font-semibold hover:underline mt-1 inline-block">
                Empieza a comprar
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm">{order.number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  <span className="font-black text-gray-900 text-sm flex-shrink-0">${order.total.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
