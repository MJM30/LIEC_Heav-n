import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const PRECONFIGURED_USERS: Record<string, {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'secretary' | 'avi';
  title: string;
  initials: string;
}> = {
  'sarah.mwamba@liec-education.com': {
    id: 1,
    name: 'Sarah Mwamba',
    email: 'sarah.mwamba@liec-education.com',
    role: 'admin',
    title: 'Administrateur / Conseillère Senior',
    initials: 'SM',
  },
  'marc.kouassi@liec-education.com': {
    id: 2,
    name: 'Marc Kouassi',
    email: 'marc.kouassi@liec-education.com',
    role: 'secretary',
    title: 'Secrétaire Orientation & Admissions',
    initials: 'MK',
  },
  'alain.kanza@liec-education.com': {
    id: 3,
    name: 'Alain Kanza',
    email: 'alain.kanza@liec-education.com',
    role: 'avi',
    title: 'Officier Financement AVI',
    initials: 'AK',
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email || '').trim().toLowerCase();

    let user = PRECONFIGURED_USERS[email];

    try {
      const db = await getDb();
      if (!user) {
        const userRes = await db.query('SELECT * FROM users WHERE LOWER(email) = $1', [email]);
        user = userRes.rows[0];
      }

      if (!user) {
        const fallbackRes = await db.query('SELECT * FROM users ORDER BY id ASC LIMIT 1');
        user = fallbackRes.rows[0] || PRECONFIGURED_USERS['sarah.mwamba@liec-education.com'];
      }

      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, 'Connexion espace sécurisé LIEC One', 'AUTH-SESSION', 'Succès')`,
        [user.name]
      );
    } catch (dbErr) {
      console.warn('Database audit logging skipped:', dbErr);
      if (!user) {
        user = PRECONFIGURED_USERS['sarah.mwamba@liec-education.com'];
      }
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
