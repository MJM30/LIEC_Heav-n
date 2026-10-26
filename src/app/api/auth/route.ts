import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { canonicalizeUserEmail } from '@/lib/rbac';
import { getOrCreateStaff2Fa } from '@/lib/authStore';
import { getTotpSetup } from '@/lib/totp';
import { STAFF_ACCOUNTS } from '@/lib/staff';

// 2FA Feature Toggle: Disabled (set to false) as requested by user
export const ENABLE_2FA = false;

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

    // If 2FA is enabled, enforce Google Authenticator TOTP verification
    if (ENABLE_2FA) {
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
    }

    // Direct Login (2FA Disabled): Grant immediate access with staff credentials
    try {
      const db = await getDb();
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, 'Connexion réussie espace sécurisé LIEC Heav’n (' || $2 || ')', 'AUTH-SESSION', 'Succès')`,
        [matchedAccount.name, matchedAccount.role]
      );
    } catch (dbErr) {
      console.warn('Database audit logging skipped:', dbErr);
    }

    const res = NextResponse.json({
      authenticated: true,
      requires2Fa: false,
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
