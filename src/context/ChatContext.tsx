'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react';

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

// Generate a stable visitor id for the session
const getVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let id = sessionStorage.getItem('ecoshop_visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2, 10);
    sessionStorage.setItem('ecoshop_visitor_id', id);
  }
  return id;
};

// Raw row shape returned by the API (snake_case columns from SQL Server)
interface RawMessage {
  id: string;
  conversation_id: string;
  text: string;
  from: 'user' | 'bot' | 'admin';
  timestamp: string;
}
interface RawConversation {
  id: string;
  visitor_id: string;
  visitor_name: string;
  status: 'open' | 'resolved';
  unread_by_admin: number;
  started_at: string;
  last_message_at: string;
  messages: RawMessage[];
}

function mapConversation(raw: RawConversation): Conversation {
  return {
    id: raw.id,
    visitorId: raw.visitor_id,
    visitorName: raw.visitor_name,
    status: raw.status,
    unreadByAdmin: raw.unread_by_admin,
    startedAt: raw.started_at,
    lastMessageAt: raw.last_message_at,
    messages: raw.messages.map(m => ({
      id: m.id,
      text: m.text,
      from: m.from,
      timestamp: m.timestamp,
    })),
  };
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [sessionConversation, setSessionConversation] = useState<Conversation | null>(null);
  const visitorIdRef = useRef<string | null>(null);

  // ─── Visitor session: load/create the open conversation for this browser session ───
  useEffect(() => {
    const visitorId = getVisitorId();
    if (!visitorId) return;
    visitorIdRef.current = visitorId;

    fetch(`/api/chat?visitorId=${encodeURIComponent(visitorId)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (data?.conversation) setSessionConversation(mapConversation(data.conversation));
      })
      .catch(() => {});
  }, []);

  const sendVisitorMessage = useCallback(async (text: string, from: 'user' | 'bot') => {
    const visitorId = visitorIdRef.current ?? getVisitorId();
    if (!visitorId) return;
    visitorIdRef.current = visitorId;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, text, from }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const msg: ChatMessage = {
        id: data.message.id,
        text: data.message.text,
        from: data.message.from,
        timestamp: data.message.timestamp,
      };

      setSessionConversation(prev => {
        if (prev && prev.id === data.conversationId) {
          return { ...prev, messages: [...prev.messages, msg], lastMessageAt: msg.timestamp };
        }
        return {
          id: data.conversationId,
          visitorId,
          visitorName: 'Visitante',
          startedAt: msg.timestamp,
          lastMessageAt: msg.timestamp,
          status: 'open',
          unreadByAdmin: from === 'user' ? 1 : 0,
          messages: [msg],
        };
      });
    } catch {
      // Silently ignore — chat is best-effort from the visitor's perspective
    }
  }, []);

  const addUserMessage = useCallback((text: string) => { void sendVisitorMessage(text, 'user'); }, [sendVisitorMessage]);
  const addBotMessage  = useCallback((text: string) => { void sendVisitorMessage(text, 'bot');  }, [sendVisitorMessage]);

  // ─── Admin panel: load and poll all conversations ───
  const loadConversations = useCallback(() => {
    fetch('/api/admin/chats')
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data?.conversations) return;
        setConversations((data.conversations as RawConversation[]).map(mapConversation));
      })
      .catch(() => {
        // ignore — admin panel will retry on next poll
      });
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 8000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const addAdminReply = useCallback((conversationId: string, text: string) => {
    fetch(`/api/admin/chats/${conversationId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(data => {
        if (!data?.message) return;
        const msg: ChatMessage = {
          id: data.message.id,
          text: data.message.text,
          from: data.message.from,
          timestamp: data.message.timestamp,
        };
        setConversations(prev => prev.map(c =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], lastMessageAt: msg.timestamp }
            : c
        ));
      })
      .catch(() => {});
  }, []);

  const patchConversation = useCallback((conversationId: string, body: Record<string, unknown>, apply: (c: Conversation) => Conversation) => {
    setConversations(prev => prev.map(c => (c.id === conversationId ? apply(c) : c)));
    fetch(`/api/admin/chats/${conversationId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).catch(() => {});
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    patchConversation(conversationId, { markRead: true }, c => ({ ...c, unreadByAdmin: 0 }));
  }, [patchConversation]);

  const resolveConversation = useCallback((conversationId: string) => {
    patchConversation(conversationId, { status: 'resolved' }, c => ({ ...c, status: 'resolved', unreadByAdmin: 0 }));
  }, [patchConversation]);

  const reopenConversation = useCallback((conversationId: string) => {
    patchConversation(conversationId, { status: 'open' }, c => ({ ...c, status: 'open' }));
  }, [patchConversation]);

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
