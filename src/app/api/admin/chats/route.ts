import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// ─── GET /api/admin/chats ─────────────────────────────────────
// Returns every conversation with its messages, newest activity first.
export async function GET(req: NextRequest) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const pool = await getPool();
    const [convRes, msgRes] = await Promise.all([
      pool.request().query(`
        SELECT id, visitor_id, visitor_name, status, unread_by_admin, started_at, last_message_at
        FROM chat_conversations
        ORDER BY last_message_at DESC
      `),
      pool.request().query(`
        SELECT id, conversation_id, text, [from], timestamp
        FROM chat_messages
        ORDER BY timestamp ASC
      `),
    ]);

    const messagesByConv = new Map<string, unknown[]>();
    for (const msg of msgRes.recordset) {
      const list = messagesByConv.get(msg.conversation_id) ?? [];
      list.push(msg);
      messagesByConv.set(msg.conversation_id, list);
    }

    const conversations = convRes.recordset.map(c => ({
      ...c,
      messages: messagesByConv.get(c.id) ?? [],
    }));

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('[admin/chats GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
