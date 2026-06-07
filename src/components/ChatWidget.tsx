'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/context/ChatContext';

const AUTO_REPLIES: Record<string, string> = {
  default:    '¡Gracias por contactarnos! Un agente estará contigo pronto. Mientras tanto, ¿en qué puedo ayudarte?',
  envio:      'Los envíos estándar tardan 2-4 días hábiles y son gratuitos en pedidos superiores a $50.',
  devolucion: 'Tienes 30 días para realizar una devolución gratuita. Contáctanos por email para iniciarla.',
  pago:       'Aceptamos tarjeta de crédito/débito, PayPal y transferencia bancaria. Todos los pagos son seguros.',
  horario:    'Nuestro horario de atención es de lunes a viernes de 9:00 a 18:00. Respondemos en menos de 24h.',
  hola:       '¡Hola! Soy el asistente virtual de EcoShop. ¿En qué puedo ayudarte hoy?',
};

function getReply(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('envio') || lower.includes('envío') || lower.includes('entrega')) return AUTO_REPLIES.envio;
  if (lower.includes('devol')) return AUTO_REPLIES.devolucion;
  if (lower.includes('pago') || lower.includes('tarjeta') || lower.includes('paypal')) return AUTO_REPLIES.pago;
  if (lower.includes('horario') || lower.includes('atencion') || lower.includes('atención')) return AUTO_REPLIES.horario;
  if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) return AUTO_REPLIES.hola;
  return AUTO_REPLIES.default;
}

export default function ChatWidget() {
  const { sessionConversation, addUserMessage, addBotMessage } = useChat();
  const [open, setOpen]   = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Send the initial greeting once when the widget first opens — but only if
  // this visitor doesn't already have messages (avoids re-greeting on reload)
  useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
      if (!sessionConversation || sessionConversation.messages.length === 0) {
        addBotMessage('¡Hola! 👋 Soy el asistente de EcoShop. ¿En qué puedo ayudarte?');
      }
    }
  }, [open, initialized, sessionConversation, addBotMessage]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionConversation?.messages, open, typing]);

  const send = (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text) return;
    addUserMessage(text);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      addBotMessage(getReply(text));
    }, 900 + Math.random() * 700);
  };

  const messages = sessionConversation?.messages ?? [];

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col"
            style={{ height: 440 }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-sm">Soporte EcoShop</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  <p className="text-white/70 text-xs">En línea</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-end gap-2 max-w-[85%] ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      msg.from === 'user' ? 'bg-indigo-600' : msg.from === 'admin' ? 'bg-purple-600' : 'bg-indigo-100'
                    }`}>
                      {msg.from === 'user'
                        ? <User className="w-3.5 h-3.5 text-white" />
                        : <Bot className="w-3.5 h-3.5 text-indigo-600" />
                      }
                    </div>
                    <div>
                      {msg.from === 'admin' && (
                        <p className="text-[10px] text-purple-600 font-bold mb-0.5 ml-1">Soporte</p>
                      )}
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.from === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : msg.from === 'admin'
                          ? 'bg-purple-600 text-white rounded-tl-sm'
                          : 'bg-white text-gray-700 shadow-sm rounded-tl-sm border border-gray-100'
                      }`}>
                        {msg.text}
                      </div>
                      <p className={`text-[10px] text-gray-400 mt-0.5 ${msg.from === 'user' ? 'text-right' : ''}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1">
                    {[0, 1, 2].map(i => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto border-t border-gray-100 bg-white flex-shrink-0">
              {['Envíos', 'Devoluciones', 'Pagos', 'Horario'].map(q => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="flex-shrink-0 text-xs bg-indigo-50 text-indigo-600 font-medium px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-2 p-3 border-t border-gray-100 bg-white flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Escribe tu mensaje..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <button
                onClick={() => send()}
                disabled={!input.trim()}
                className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl shadow-xl flex items-center justify-center relative"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
