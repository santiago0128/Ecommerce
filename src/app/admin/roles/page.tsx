'use client';

import { useState } from 'react';
import { Shield, Plus, Pencil, Trash2, Check, X, User, Settings, Package, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  usersCount: number;
}

const ALL_PERMISSIONS = [
  { id: 'products',   label: 'Gestionar productos',   icon: Package },
  { id: 'orders',     label: 'Gestionar pedidos',      icon: Package },
  { id: 'customers',  label: 'Ver clientes',            icon: User },
  { id: 'reports',    label: 'Ver reportes',            icon: BarChart2 },
  { id: 'coupons',    label: 'Gestionar cupones',       icon: Package },
  { id: 'settings',   label: 'Ajustes de la tienda',   icon: Settings },
  { id: 'roles',      label: 'Gestionar roles',         icon: Shield },
];

const INITIAL_ROLES: Role[] = [
  {
    id: '1', name: 'Administrador', description: 'Acceso completo a todas las funciones', color: 'bg-purple-500',
    permissions: ALL_PERMISSIONS.map(p => p.id), usersCount: 1,
  },
  {
    id: '2', name: 'Gestor de tienda', description: 'Gestiona productos, pedidos y cupones', color: 'bg-indigo-500',
    permissions: ['products', 'orders', 'coupons'], usersCount: 2,
  },
  {
    id: '3', name: 'Analista', description: 'Solo acceso a reportes y métricas', color: 'bg-emerald-500',
    permissions: ['reports', 'customers'], usersCount: 1,
  },
];

const EMPTY: Omit<Role, 'id' | 'usersCount'> = { name: '', description: '', color: 'bg-indigo-500', permissions: [] };

const COLOR_OPTIONS = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];

export default function RolesAdmin() {
  const [roles, setRoles]       = useState<Role[]>(INITIAL_ROLES);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<Role | null>(null);
  const [form, setForm]         = useState<typeof EMPTY>(EMPTY);

  const openNew = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (r: Role) => { setForm({ name: r.name, description: r.description, color: r.color, permissions: [...r.permissions] }); setEditing(r); setShowForm(true); };

  const togglePerm = (id: string) =>
    setForm(f => ({ ...f, permissions: f.permissions.includes(id) ? f.permissions.filter(p => p !== id) : [...f.permissions, id] }));

  const save = () => {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return; }
    if (editing) {
      setRoles(prev => prev.map(r => r.id === editing.id ? { ...r, ...form } : r));
      toast.success('Rol actualizado');
    } else {
      setRoles(prev => [...prev, { ...form, id: String(Date.now()), usersCount: 0 }]);
      toast.success('Rol creado');
    }
    setShowForm(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Roles y permisos</h1>
            <p className="text-sm text-gray-500">{roles.length} roles configurados</p>
          </div>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm">
          <Plus className="w-4 h-4" /> Nuevo rol
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-gray-900">{editing ? 'Editar rol' : 'Nuevo rol'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre del rol</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Ej. Gestor de contenido"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descripción</label>
                  <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Breve descripción del rol"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {COLOR_OPTIONS.map(c => (
                      <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-8 h-8 rounded-full ${c} transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`} />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Permisos</label>
                  <div className="space-y-2">
                    {ALL_PERMISSIONS.map(perm => {
                      const Icon = perm.icon;
                      const has = form.permissions.includes(perm.id);
                      return (
                        <label key={perm.id} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${has ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                          <input type="checkbox" checked={has} onChange={() => togglePerm(perm.id)} className="accent-indigo-600" />
                          <Icon className={`w-4 h-4 ${has ? 'text-indigo-500' : 'text-gray-400'}`} />
                          <span className="text-sm font-medium text-gray-700">{perm.label}</span>
                        </label>
                      );
                    })}
                  </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {roles.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{role.name}</p>
                  <p className="text-xs text-gray-500">{role.usersCount} usuario{role.usersCount !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(role)} className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {role.name !== 'Administrador' && (
                  <button onClick={() => { setRoles(prev => prev.filter(r => r.id !== role.id)); toast.success('Rol eliminado'); }}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">{role.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {role.permissions.map(pid => {
                const perm = ALL_PERMISSIONS.find(p => p.id === pid);
                if (!perm) return null;
                return (
                  <span key={pid} className="text-xs bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-full">{perm.label}</span>
                );
              })}
              {role.permissions.length === 0 && (
                <span className="text-xs text-gray-400 italic">Sin permisos asignados</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
