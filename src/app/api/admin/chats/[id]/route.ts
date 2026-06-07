import { NextRequest, NextResponse } from 'next/server';
import { getPool, sql } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

type Ctx = { params: Promise<{ id: string }> };

// ─── POST /api/admin/chats/:id ────────────────────────────────
// Body: { text } — sends an admin reply into the conversation.
export async function POST(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const { text } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Texto requerido' }, { status: 400 });
    }

    const pool = await getPool();
    const inserted = await pool.request()
      .input('id', sql.NVarChar, id)
      .input('text', sql.NVarChar, text.trim())
      .query(`
        INSERT INTO chat_messages (conversation_id, text, [from])
        OUTPUT INSERTED.id, INSERTED.conversation_id, INSERTED.text, INSERTED.[from], INSERTED.timestamp
        VALUES (@id, @text, 'admin');

        UPDATE chat_conversations SET last_message_at = GETUTCDATE() WHERE id = @id;
      `);

    if (!inserted.recordset[0]) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ message: inserted.recordset[0] });
  } catch (err) {
    console.error('[admin/chats/:id POST]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

// ─── PATCH /api/admin/chats/:id ───────────────────────────────
// Body: { status?: 'open' | 'resolved', markRead?: true }
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const auth = requireAdmin(req);
  if ('error' in auth) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  try {
    const { status, markRead } = await req.json();
    const sets: string[] = [];
    const pool = await getPool();
    const request = pool.request().input('id', sql.NVarChar, id);

    if (status === 'open' || status === 'resolved') {
      sets.push('status = @status');
      request.input('status', sql.NVarChar, status);
    }
    if (status === 'resolved' || markRead === true) sets.push('unread_by_admin = 0');

    if (!sets.length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    const result = await request
      .query(`UPDATE chat_conversations SET ${Array.from(new Set(sets)).join(', ')} WHERE id = @id`);

    if (result.rowsAffected[0] === 0) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[admin/chats/:id PATCH]', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
