import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { canonicalizeUserEmail } from '@/lib/rbac';

export interface StaffAccount {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'secretary' | 'avi';
  title: string;
  initials: string;
  password: string;
  acceptedEmails: string[];
}

export const STAFF_ACCOUNTS: StaffAccount[] = [
  {
    id: 1,
    name: 'Sarah Mwamba',
    email: 'sarah.mwamba@liec-education.com',
    role: 'admin',
    title: 'Senior Lyon Advisor & Platform Admin',
    initials: 'SM',
    password: 'Admin@LIEC2026!',
    acceptedEmails: [
      'sarah.mwamba@liec-education.com',
      'admin@liec-education.com',
      'admin@liec.com',
    ],
  },
  {
    id: 2,
    name: 'Marc Kouassi',
    email: 'marc.kouassi@liec-education.com',
    role: 'secretary',
    title: 'DRC Admissions Secretary',
    initials: 'MK',
    password: 'Secretary@LIEC2026!',
    acceptedEmails: [
      'marc.kouassi@liec-education.com',
      'secretary@liec-education.com',
      'secretaire@liec-education.com',
    ],
  },
  {
    id: 3,
    name: 'Alain Kanza',
    email: 'alain.kanza@liec-education.com',
    role: 'avi',
    title: 'Officier Financement AVI',
    initials: 'AK',
    password: 'AviOfficer@LIEC2026!',
    acceptedEmails: [
      'alain.kanza@liec-education.com',
      'avi@liec-education.com',
      'officer.avi@liec-education.com',
      'finance@liec-education.com',
    ],
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = (body.email || '').trim().toLowerCase();
    const password = (body.password || '').trim();

    if (!rawEmail || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis.' },
        { status: 400 }
      );
    }

    const matchedAccount = STAFF_ACCOUNTS.find(
      (acc) =>
        acc.acceptedEmails.some((e) => e.toLowerCase() === rawEmail) ||
        acc.email.toLowerCase() === rawEmail
    );

    if (!matchedAccount) {
      return NextResponse.json(
        {
          error:
            'Adresse e-mail non reconnue. Seul le personnel autorisé LIEC peut accéder au workspace.',
        },
        { status: 401 }
      );
    }

    if (matchedAccount.password !== password) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect pour cet utilisateur staff.' },
        { status: 401 }
      );
    }

    const userPayload = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      email: matchedAccount.email,
      role: matchedAccount.role,
      title: matchedAccount.title,
      initials: matchedAccount.initials,
    };

    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, 'Connexion espace sécurisé LIEC One (' || $2 || ')', 'AUTH-SESSION', 'Succès')`,
        [matchedAccount.name, matchedAccount.role]
      );
    } catch (dbErr) {
      console.warn('Database audit logging skipped:', dbErr);
    }

    const res = NextResponse.json({
      authenticated: true,
      user: userPayload,
    });

    res.cookies.set('liec_user_email', matchedAccount.email, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur interne du serveur auth.' },
      { status: 500 }
    );
  }
}
