'use client';

import { useState } from 'react';
import { CreditCard, Wallet, Building2, DollarSign, Eye, EyeOff, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface PaymentMethod {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  bg: string;
  enabled: boolean;
  description: string;
  fields?: { key: string; label: string; type?: string; placeholder: string }[];
}

const METHODS: PaymentMethod[] = [
  {
    id: 'card', name: 'Tarjeta de crédito/débito', icon: CreditCard,
    color: 'text-indigo-600', bg: 'bg-indigo-50',
    enabled: true,
    description: 'Acepta Visa, Mastercard y American Express a través de Stripe.',
    fields: [
      { key: 'stripePublic', label: 'Clave pública Stripe', placeholder: 'pk_live_...' },
      { key: 'stripeSecret', label: 'Clave secreta Stripe', type: 'password', placeholder: 'sk_live_...' },
    ],
  },
  {
    id: 'paypal', name: 'PayPal', icon: Wallet,
    color: 'text-blue-600', bg: 'bg-blue-50',
    enabled: true,
    description: 'Permite a los clientes pagar con su cuenta PayPal.',
    fields: [
      { key: 'paypalClientId', label: 'Client ID de PayPal', placeholder: 'AaBbCc...' },
      { key: 'paypalSecret',   label: 'Secreto de PayPal', type: 'password', placeholder: 'EeFfGg...' },
    ],
  },
  {
    id: 'mercadopago', name: 'MercadoPago', icon: DollarSign,
    color: 'text-cyan-600', bg: 'bg-cyan-50',
    enabled: false,
    description: 'Ideal para Latinoamérica. Acepta tarjetas, efectivo y billetera.',
    fields: [
      { key: 'mpAccessToken', label: 'Access Token MercadoPago', type: 'password', placeholder: 'APP_USR-...' },
    ],
  },
  {
    id: 'transfer', name: 'Transferencia bancaria', icon: Building2,
    color: 'text-emerald-600', bg: 'bg-emerald-50',
    enabled: true,
    description: 'El cliente paga manualmente por transferencia. Confirmación manual.',
    fields: [
      { key: 'bankName',    label: 'Banco',  placeholder: 'Banco Santander' },
      { key: 'bankIban',    label: 'IBAN',   placeholder: 'ES91 2100 0418 4502 0005 1332' },
      { key: 'bankHolder',  label: 'Titular', placeholder: 'EcoShop S.L.' },
    ],
  },
];

export default function PagosAdmin() {
  const [methods, setMethods] = useState(METHODS);
  const [fields, setFields]   = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setMethods(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));

  const handleSave = (id: string) => {
    toast.success(`Configuración de ${methods.find(m => m.id === id)?.name} guardada`);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Métodos de pago</h1>
          <p className="text-sm text-gray-500">Configura las pasarelas de pago de tu tienda</p>
        </div>
      </div>

      <div className="space-y-4">
        {methods.map((method, i) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              <div className="flex items-center gap-4 p-5">
                <div className={`w-12 h-12 ${method.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-6 h-6 ${method.color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">{method.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${method.enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                    {method.enabled ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
                    onClick={() => toggle(method.id)}
                    className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${method.enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${method.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              {method.enabled && method.fields && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4 bg-gray-50">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Credenciales de API</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {method.fields.map(field => (
                      <div key={field.key}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{field.label}</label>
                        <div className="relative">
                          <input
                            type={field.type === 'password' && !showKeys[field.key] ? 'password' : 'text'}
                            value={fields[field.key] ?? ''}
                            onChange={e => setFields(f => ({ ...f, [field.key]: e.target.value }))}
                            placeholder={field.placeholder}
                            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-400 bg-white pr-10"
                          />
                          {field.type === 'password' && (
                            <button
                              type="button"
                              onClick={() => setShowKeys(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showKeys[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleSave(method.id)}
                    className="mt-4 flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Guardar configuración
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
