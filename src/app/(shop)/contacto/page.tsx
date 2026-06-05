'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, HelpCircle, Package } from 'lucide-react';

const faqs = [
  { q: '¿Cuánto tarda el envío?', a: 'Los envíos estándar tardan 2-4 días hábiles. Los envíos express llegan en 24h.' },
  { q: '¿Cómo puedo devolver un producto?', a: 'Tienes 30 días desde la recepción para solicitar una devolución gratuita.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjeta de crédito/débito, PayPal y transferencia bancaria.' },
  { q: '¿Tienen tienda física?', a: 'Somos 100% online, pero nuestro almacén central está en Madrid.' },
];

export default function ContactoPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const update = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    toast.success('¡Mensaje enviado! Te responderemos en menos de 24h', { duration: 4000 });
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-3">Contacto</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          ¿Tienes alguna pregunta o necesitas ayuda? Estamos aquí para ti.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-14">
        {/* Contact info */}
        <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
          {[
            { icon: Mail,    label: 'Email',    value: 'soporte@ecoshop.com', href: 'mailto:soporte@ecoshop.com' },
            { icon: Phone,   label: 'Teléfono', value: '+34 900 123 456', href: 'tel:+34900123456' },
            { icon: MapPin,  label: 'Dirección', value: 'Calle Gran Vía 28, Madrid, 28013', href: null },
            { icon: Clock,   label: 'Horario',  value: 'Lun–Vie 9:00–18:00', href: null },
          ].map(item => {
            const Icon = item.icon;
            const inner = (
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 shadow-sm">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                </div>
              </div>
            );
            return item.href ? (
              <a key={item.label} href={item.href} className="block hover:scale-[1.01] transition-transform">{inner}</a>
            ) : (
              <div key={item.label}>{inner}</div>
            );
          })}
        </motion.div>

        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-7 shadow-sm"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
            Envíanos un mensaje
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre</label>
                <input
                  required value={form.name} onChange={e => update('name', e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  placeholder="tu@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Asunto</label>
              <input
                required value={form.subject} onChange={e => update('subject', e.target.value)}
                placeholder="¿En qué podemos ayudarte?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mensaje</label>
              <textarea
                required value={form.message} onChange={e => update('message', e.target.value)}
                rows={5} placeholder="Escribe tu mensaje aquí..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors"
            >
              {sending ? (
                <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Enviando...</span>
              ) : (
                <><Send className="w-4 h-4" /> Enviar mensaje</>
              )}
            </button>
          </form>
        </motion.div>
      </div>

      {/* FAQs */}
      <motion.section initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-500" />
          Preguntas frecuentes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm mb-1">{faq.q}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
