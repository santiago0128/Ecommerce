import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';

// ─── GET /api/chat?visitorId=v_xxx ───────────────────────────
// Returns the visitor's open conversation (with messages), or null if none exists yet.
export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get('visitorId') ?? '';
  if (!visitorId) return NextResponse.json({ error: 'visitorId requerido' }, { status: 400 });

  try {
    const pool = await getPool();
    const convRes = await pool.request()
      .input('visitorId', sql.NVarChar, visitorId)
      .query(`
        SELECT TOP 1 id, visitor_id, visitor_name, status, unread_by_admin, started_at, last_message_at
        FROM chat_conversations
        WHERE visitor_id = @visitorId AND status = 'open'
        ORDER BY last_message_at DESC
      `);

    const conv = convRes.recordset[0];
    if (!conv) return NextResponse.json({ conversation: null });

    const msgRes = await pool.request()
      .input('id', sql.NVarChar, conv.id)
      .query(`
        SELECT id, conversation_id, text, [from], timestamp
        FROM chat_messages
        WHERE conversation_id = @id
        ORDER BY timestamp ASC
      `);

    return NextResponse.json({ conversation: { ...conv, messages: msgRes.recordset } });
  } catch (err) {
    console.error('[chat GET]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── POST /api/chat ───────────────────────────────────────────
// Body: { visitorId, text, from: 'user' | 'bot' }
// Gets or creates the visitor's open conversation, appends the message, returns conversation + new message.
export async function POST(req: NextRequest) {
  try {
    const { visitorId, text, from } = await req.json();
    if (!visitorId || !text || !['user', 'bot'].includes(from)) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const pool = await getPool();

    const convRes = await pool.request()
      .input('visitorId', sql.NVarChar, visitorId)
      .query(`
        SELECT TOP 1 id FROM chat_conversations
        WHERE visitor_id = @visitorId AND status = 'open'
        ORDER BY last_message_at DESC
      `);

    let conversationId: string = convRes.recordset[0]?.id;

    if (!conversationId) {
      const created = await pool.request()
        .input('visitorId', sql.NVarChar, visitorId)
        .query(`
          INSERT INTO chat_conversations (visitor_id, visitor_name)
          OUTPUT INSERTED.id
          VALUES (@visitorId, 'Visitante')
        `);
      conversationId = created.recordset[0].id;
    }

    const unreadIncrement = from === 'user' ? 1 : 0;
    const inserted = await pool.request()
      .input('conversationId', sql.NVarChar, conversationId)
      .input('text', sql.NVarChar, text)
      .input('from', sql.NVarChar, from)
      .input('inc', sql.Int, unreadIncrement)
      .query(`
        INSERT INTO chat_messages (conversation_id, text, [from])
        OUTPUT INSERTED.id, INSERTED.conversation_id, INSERTED.text, INSERTED.[from], INSERTED.timestamp
        VALUES (@conversationId, @text, @from);

        UPDATE chat_conversations
        SET last_message_at = GETUTCDATE(), unread_by_admin = unread_by_admin + @inc
        WHERE id = @conversationId;
      `);

    return NextResponse.json({ conversationId, message: inserted.recordset[0] });
  } catch (err) {
    console.error('[chat POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
