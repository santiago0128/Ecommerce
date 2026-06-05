'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { User, Lock, Store, Bell, Shield, Save, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminAjustes() {
  const { user } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [storeName, setStoreName]   = useState('EcoShop');
  const [storeDesc, setStoreDesc]   = useState('Tu destino de compras online de confianza.');
  const [notifLow, setNotifLow]     = useState(true);
  const [notifOut, setNotifOut]     = useState(true);
  const [freeShip, setFreeShip]     = useState('50');

  const handleSave = (section: string) => {
    toast.success(`${section} guardado correctamente`);
  };

  const inputCls = 'w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';

  const Section = ({ icon: Icon, title, desc, children, onSave }: {
    icon: React.ElementType; title: string; desc: string;
    children: React.ReactNode; onSave: () => void;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
    >
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {children}
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end">
        <button
          onClick={onSave}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
        >
          <Save className="w-3.5 h-3.5" />
          Guardar cambios
        </button>
      </div>
    </motion.div>
  );

  const Toggle = ({ checked, onChange, label, desc }: {
    checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string;
  }) => (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {desc && <p className="text-xs text-gray-400 mt-0.5">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all relative flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Ajustes</h1>
        <p className="text-gray-500 text-sm mt-0.5">Configura tu tienda y preferencias</p>
      </div>

      {/* Perfil */}
      <Section icon={User} title="Perfil de administrador" desc="Datos de tu cuenta" onSave={() => handleSave('Perfil')}>
        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-black">
            {user?.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-flex items-center gap-1 mt-1 text-xs font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
              <Shield className="w-3 h-3" /> Administrador
            </span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre</label>
          <input defaultValue={user?.name} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
          <input defaultValue={user?.email} className={inputCls} />
        </div>
      </Section>

      {/* Seguridad */}
      <Section icon={Lock} title="Seguridad" desc="Cambia tu contraseña" onSave={() => handleSave('Contraseña')}>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Contraseña actual</label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} className={`${inputCls} pr-10`} placeholder="••••••••" />
            <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nueva contraseña</label>
          <input type="password" className={inputCls} placeholder="••••••••" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confirmar contraseña</label>
          <input type="password" className={inputCls} placeholder="••••••••" />
        </div>
      </Section>

      {/* Tienda */}
      <Section icon={Store} title="Configuración de la tienda" desc="Información y ajustes generales" onSave={() => handleSave('Tienda')}>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Nombre de la tienda</label>
          <input className={inputCls} value={storeName} onChange={e => setStoreName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Descripción</label>
          <textarea className={`${inputCls} h-20 resize-none`} value={storeDesc} onChange={e => setStoreDesc(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
            Umbral envío gratis ($)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
            <input type="number" className={`${inputCls} pl-7`} value={freeShip} onChange={e => setFreeShip(e.target.value)} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Los pedidos superiores a este importe tendrán envío gratuito</p>
        </div>
      </Section>

      {/* Notificaciones */}
      <Section icon={Bell} title="Notificaciones" desc="Alertas y avisos del sistema" onSave={() => handleSave('Notificaciones')}>
        <Toggle
          checked={notifLow}
          onChange={setNotifLow}
          label="Alertas de stock bajo"
          desc="Notificar cuando un producto tiene 5 o menos unidades"
        />
        <div className="border-t border-gray-100 pt-4">
          <Toggle
            checked={notifOut}
            onChange={setNotifOut}
            label="Alertas de producto agotado"
            desc="Notificar cuando un producto llega a 0 unidades"
          />
        </div>
      </Section>
    </div>
  );
}
