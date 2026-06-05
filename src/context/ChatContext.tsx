'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ChatMessage {
  id: string;
  text: string;
  from: 'user' | 'bot' | 'admin';
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  visitorName: string;
  visitorId: string;
  startedAt: string; // ISO string
  lastMessageAt: string; // ISO string
  messages: ChatMessage[];
  status: 'open' | 'resolved';
  unreadByAdmin: number;
}

interface ChatContextType {
  conversations: Conversation[];
  // Used by ChatWidget — get or create the session conversation
  sessionConversation: Conversation | null;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  // Used by admin panel
  addAdminReply: (conversationId: string, text: string) => void;
  markAsRead: (conversationId: string) => void;
  resolveConversation: (conversationId: string) => void;
  reopenConversation: (conversationId: string) => void;
  totalUnread: number;
}

const ChatContext = createContext<ChatContextType | null>(null);

const now = () => new Date().toISOString();
const fmt = () => new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

// Generate a stable visitor id for the session
const getVisitorId = () => {
  if (typeof window === 'undefined') return 'ssr';
  let id = sessionStorage.getItem('ecoshop_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('ecoshop_visitor_id', id);
  }
  return id;
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c_demo1',
    visitorName: 'Visitante #1',
    visitorId: 'v_demo1',
    startedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'open',
    unreadByAdmin: 2,
    messages: [
      { id: 'm1', text: '¡Hola! 👋 Soy el asistente de EcoShop. ¿En qué puedo ayudarte?', from: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString() },
      { id: 'm2', text: 'Hola, quiero saber cuánto tarda el envío a Canarias', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString() },
      { id: 'm3', text: 'Los envíos estándar tardan 2-4 días hábiles y son gratuitos en pedidos superiores a $50.', from: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 19).toISOString() },
      { id: 'm4', text: 'Y si pido hoy, ¿llega antes del viernes?', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
      { id: 'm5', text: 'También quiero saber si tienen devolución gratuita', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString() },
    ],
  },
  {
    id: 'c_demo2',
    visitorName: 'Visitante #2',
    visitorId: 'v_demo2',
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    status: 'resolved',
    unreadByAdmin: 0,
    messages: [
      { id: 'm6', text: '¡Hola! 👋 Soy el asistente de EcoShop. ¿En qué puedo ayudarte?', from: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'm7', text: 'Buenos días, tengo un problema con mi pedido #ECO-23451', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 60000).toISOString() },
      { id: 'm8', text: '¡Gracias por contactarnos! Un agente estará contigo pronto.', from: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 62000).toISOString() },
      { id: 'm9', text: 'Hola, soy del equipo de soporte. ¿En qué puedo ayudarte con el pedido #ECO-23451?', from: 'admin', timestamp: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
      { id: 'm10', text: 'Ya está solucionado, gracias!', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    ],
  },
  {
    id: 'c_demo3',
    visitorName: 'Visitante #3',
    visitorId: 'v_demo3',
    startedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    status: 'open',
    unreadByAdmin: 1,
    messages: [
      { id: 'm11', text: '¡Hola! 👋 Soy el asistente de EcoShop. ¿En qué puedo ayudarte?', from: 'bot', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
      { id: 'm12', text: '¿Aceptan tarjeta de débito?', from: 'user', timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString() },
    ],
  },
];

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Get or create conversation for current visitor session
  const getOrCreateSession = useCallback((): string => {
    if (sessionId) return sessionId;
    const visitorId = getVisitorId();
    const existing = conversations.find(c => c.visitorId === visitorId && c.status === 'open');
    if (existing) { setSessionId(existing.id); return existing.id; }
    const newId = 'c_' + Math.random().toString(36).substring(2, 10);
    const newConv: Conversation = {
      id: newId,
      visitorId,
      visitorName: `Visitante`,
      startedAt: now(),
      lastMessageAt: now(),
      status: 'open',
      unreadByAdmin: 0,
      messages: [],
    };
    setConversations(prev => [newConv, ...prev]);
    setSessionId(newId);
    return newId;
  }, [sessionId, conversations]);

  const sessionConversation = conversations.find(c => c.id === sessionId) ?? null;

  const addUserMessage = useCallback((text: string) => {
    const convId = getOrCreateSession();
    const msg: ChatMessage = { id: String(Date.now()), text, from: 'user', timestamp: now() };
    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, msg], lastMessageAt: now(), unreadByAdmin: c.unreadByAdmin + 1 }
        : c
    ));
  }, [getOrCreateSession]);

  const addBotMessage = useCallback((text: string) => {
    const convId = getOrCreateSession();
    const msg: ChatMessage = { id: String(Date.now()), text, from: 'bot', timestamp: now() };
    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, msg], lastMessageAt: now() }
        : c
    ));
  }, [getOrCreateSession]);

  const addAdminReply = useCallback((conversationId: string, text: string) => {
    const msg: ChatMessage = { id: String(Date.now()), text, from: 'admin', timestamp: now() };
    setConversations(prev => prev.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, msg], lastMessageAt: now() }
        : c
    ));
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, unreadByAdmin: 0 } : c
    ));
  }, []);

  const resolveConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'resolved', unreadByAdmin: 0 } : c
    ));
  }, []);

  const reopenConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, status: 'open' } : c
    ));
  }, []);

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadByAdmin, 0);

  return (
    <ChatContext.Provider value={{
      conversations,
      sessionConversation,
      addUserMessage,
      addBotMessage,
      addAdminReply,
      markAsRead,
      resolveConversation,
      reopenConversation,
      totalUnread,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
