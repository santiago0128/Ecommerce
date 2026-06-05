'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat, Conversation } from '@/context/ChatContext';
import {
  MessageCircle, Send, CheckCircle2, RotateCcw,
  Bot, User, Shield, Search, Circle, Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60)   return 'hace un momento';
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

function lastMsg(conv: Conversation): string {
  const last = conv.messages[conv.messages.length - 1];
  if (!last) return 'Sin mensajes';
  const prefix = last.from === 'admin' ? 'Tú: ' : last.from === 'bot' ? 'Bot: ' : '';
  return prefix + (last.text.length > 50 ? last.text.slice(0, 50) + '…' : last.text);
}

export default function ChatsAdmin() {
  const {
    conversations,
    addAdminReply,
    markAsRead,
    resolveConversation,
    reopenConversation,
    totalUnread,
  } = useChat();

  const [selectedId, setSelectedId] = useState<string | null>(
    conversations.find(c => c.status === 'open')?.id ?? null
  );
  const [reply, setReply]     = useState('');
  const [filter, setFilter]   = useState<'all' | 'open' | 'resolved'>('open');
  const [search, setSearch]   = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const selected = conversations.find(c => c.id === selectedId) ?? null;

  // Auto-scroll when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected?.messages.length]);

  // Mark as read when opening a conversation
  useEffect(() => {
    if (selectedId) markAsRead(selectedId);
  }, [selectedId, markAsRead]);

  const filtered = conversations
    .filter(c => filter === 'all' || c.status === filter)
    .filter(c => {
      const s = search.toLowerCase();
      return !s || c.visitorName.toLowerCase().includes(s) || lastMsg(c).toLowerCase().includes(s);
    })
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());

  const handleSend = () => {
    if (!reply.trim() || !selectedId) return;
    addAdminReply(selectedId, reply.trim());
    setReply('');
    toast.success('Respuesta enviada');
  };

  const handleResolve = (id: string) => {
    resolveConversation(id);
    if (selectedId === id) setSelectedId(filtered.find(c => c.id !== id && c.status === 'open')?.id ?? null);
    toast.success('Conversación resuelta');
  };

  const MsgIcon = ({ from }: { from: 'user' | 'bot' | 'admin' }) => {
    if (from === 'user')  return <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0"><User className="w-3.5 h-3.5 text-white" /></div>;
    if (from === 'admin') return <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0"><Shield className="w-3.5 h-3.5 text-white" /></div>;
    return <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0"><Bot className="w-3.5 h-3.5 text-gray-500" /></div>;
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* ─── Left column: conversation list ─── */}
      <aside className="w-72 lg:w-80 flex-shrink-0 border-r border-gray-200 bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
              <h1 className="font-black text-gray-900 text-base">Chats</h1>
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {totalUnread}
                </span>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1">
            {(['open', 'resolved', 'all'] as const).map(f => {
              const labels = { open: 'Abiertas', resolved: 'Resueltas', all: 'Todas' };
              const count  = f === 'all' ? conversations.length : conversations.filter(c => c.status === f).length;
              return (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 text-xs font-bold py-1.5 rounded-lg transition-colors ${
                    filter === f ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {labels[f]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Sin conversaciones</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map(conv => (
                <motion.button
                  key={conv.id}
                  layout
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedId(conv.id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-gray-100 transition-colors hover:bg-indigo-50/50 ${
                    selectedId === conv.id ? 'bg-indigo-50 border-l-2 border-l-indigo-500' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white text-xs font-black">
                        {conv.visitorName.charAt(0)}
                      </div>
                      {conv.status === 'open' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-bold text-gray-800 truncate">{conv.visitorName}</p>
                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-1">
                          {timeAgo(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate leading-relaxed">{lastMsg(conv)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {conv.unreadByAdmin > 0 && (
                          <span className="bg-indigo-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                            {conv.unreadByAdmin} nuevo{conv.unreadByAdmin > 1 ? 's' : ''}
                          </span>
                        )}
                        {conv.status === 'resolved' && (
                          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Resuelta
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          )}
        </div>
      </aside>

      {/* ─── Right column: conversation detail ─── */}
      <div className="flex-1 flex flex-col overflow-hidden bg-[#f4f6fb]">
        {selected ? (
          <>
            {/* Chat topbar */}
            <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center gap-4 flex-shrink-0">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl flex items-center justify-center text-white font-black">
                  {selected.visitorName.charAt(0)}
                </div>
                {selected.status === 'open' && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white" />
                )}
              </div>

              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">{selected.visitorName}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  Iniciado {timeAgo(selected.startedAt)} · {selected.messages.length} mensajes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  selected.status === 'open'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {selected.status === 'open' ? 'Abierta' : 'Resuelta'}
                </span>

                {selected.status === 'open' ? (
                  <button
                    onClick={() => handleResolve(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolver
                  </button>
                ) : (
                  <button
                    onClick={() => reopenConversation(selected.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                  </button>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selected.messages.map((msg, i) => {
                const isUser  = msg.from === 'user';
                const isAdmin = msg.from === 'admin';
                const isBot   = msg.from === 'bot';

                // Date separator (show if first message or day changed)
                const showDate = i === 0 || new Date(msg.timestamp).toDateString() !== new Date(selected.messages[i - 1].timestamp).toDateString();

                return (
                  <div key={msg.id}>
                    {showDate && (
                      <div className="flex items-center gap-3 my-2">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[11px] text-gray-400 font-medium">
                          {new Date(msg.timestamp).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>
                    )}

                    <div className={`flex items-end gap-2.5 ${isUser || isAdmin ? 'justify-end' : 'justify-start'}`}>
                      {/* Avatar on the left (bot) */}
                      {!isUser && !isAdmin && <MsgIcon from="bot" />}

                      <div className={`max-w-[65%] ${isUser || isAdmin ? 'items-end' : 'items-start'} flex flex-col`}>
                        {isAdmin && (
                          <p className="text-[10px] text-purple-600 font-bold mb-0.5 mr-1">Soporte (tú)</p>
                        )}
                        {isBot && (
                          <p className="text-[10px] text-gray-400 mb-0.5 ml-1">Respuesta automática</p>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isUser  ? 'bg-indigo-600 text-white rounded-br-sm' :
                          isAdmin ? 'bg-purple-600 text-white rounded-br-sm' :
                                    'bg-white text-gray-700 rounded-bl-sm border border-gray-100'
                        }`}>
                          {msg.text}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-1 ${isUser || isAdmin ? 'text-right' : 'text-left'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Avatar on the right (user/admin) */}
                      {(isUser || isAdmin) && <MsgIcon from={msg.from} />}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply box */}
            {selected.status === 'open' ? (
              <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
                <div className="flex items-end gap-3">
                  <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mb-1">
                    <Shield className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                      placeholder="Escribe tu respuesta… (Enter para enviar)"
                      rows={2}
                      className="w-full bg-transparent text-sm text-gray-700 outline-none resize-none placeholder-gray-400"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[10px] text-gray-400">Enter para enviar · Shift+Enter nueva línea</p>
                      <button
                        onClick={handleSend}
                        disabled={!reply.trim()}
                        className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-colors"
                      >
                        <Send className="w-3.5 h-3.5" /> Enviar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex items-center gap-3 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-sm text-gray-500">Esta conversación está resuelta.</p>
                <button
                  onClick={() => reopenConversation(selected.id)}
                  className="ml-auto text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reabrir
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
              <MessageCircle className="w-10 h-10 text-indigo-200" />
            </div>
            <h2 className="text-lg font-black text-gray-700 mb-2">Selecciona una conversación</h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Elige una conversación de la lista para ver los mensajes y responder al visitante.
            </p>
            {totalUnread > 0 && (
              <div className="mt-5 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 flex items-center gap-2">
                <Circle className="w-3 h-3 fill-red-400 text-red-400" />
                <p className="text-sm font-bold text-red-600">{totalUnread} mensaje{totalUnread > 1 ? 's' : ''} sin leer</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
