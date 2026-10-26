import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { canonicalizeUserEmail } from '@/lib/rbac';
import { getOrCreateStaff2Fa } from '@/lib/authStore';
import { getTotpSetup } from '@/lib/totp';
import { STAFF_ACCOUNTS } from '@/lib/staff';

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
            'Adresse e-mail non reconnue. Seul le personnel autorisé de LIEC Heav’n peut accéder au workspace.',
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

    // Retrieve or initialize Two-Factor Authentication state
    const twoFaRecord = await getOrCreateStaff2Fa(matchedAccount.email);

    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, 'Mot de passe validé - En attente 2FA Google Authenticator (' || $2 || ')', 'AUTH-PASSWORD-CHECK', 'Succès')`,
        [matchedAccount.name, matchedAccount.role]
      );
    } catch (dbErr) {
      console.warn('Database audit logging skipped:', dbErr);
    }

    if (!twoFaRecord.isActivated) {
      // First login: Generate QR code and require activation verification
      const setup = getTotpSetup(matchedAccount.email, twoFaRecord.secret);
      return NextResponse.json({
        requires2Fa: true,
        isFirstLogin: true,
        email: matchedAccount.email,
        secret: twoFaRecord.secret,
        uri: setup.uri,
        qrSvg: setup.qrSvg,
        user: userPayload,
      });
    }

    // Subsequent login: Require 6-digit TOTP code
    return NextResponse.json({
      requires2Fa: true,
      isFirstLogin: false,
      email: matchedAccount.email,
      user: userPayload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erreur interne du serveur auth.' },
      { status: 500 }
    );
  }
}
