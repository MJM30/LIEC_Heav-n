import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { enforceRbac } from '@/lib/rbac';

export async function GET(req: NextRequest) {
  const auth = await enforceRbac(req, 'avi', 'Query AVI Records');
  if (!auth.allowed) return auth.response;

  const { db } = auth;
  try {
    const res = await db.query('SELECT * FROM avi_requests ORDER BY id DESC');
    return NextResponse.json({ aviRequests: res.rows });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Enforce server-side RBAC authorization for Blocked Finance (AVI) & YIMMILINE
  const auth = await enforceRbac(req, 'avi', 'Register Parent AVI / YIMMILINE Dossier');
  if (!auth.allowed) return auth.response;

  const { db, user } = auth;

  try {
    const body = await req.json();

    const passportId = String(body.student_id_doc || body.passport_number || '').trim().toUpperCase();
    if (!/^(OP|PO)(\d{7}|\d{9})$/.test(passportId)) {
      return NextResponse.json(
        {
          error:
            'Invalid Passport ID format: must start with OP or PO followed by 9 digits (or 9 characters total starting with OP/PO).',
        },
        { status: 400 }
      );
    }

    const countRes = await db.query<{ count: string | number }>(
      'SELECT COUNT(*) as count FROM avi_requests'
    );
    const nextNum = 1 + Number(countRes.rows[0]?.count ?? 0);
    const ref = `AVI-2025-${String(nextNum).padStart(3, '0')}`;

    const offerMap: Record<string, { name: string; rate: number; months: number }> = {
      classique: { name: 'Classique', rate: 12.0, months: 8 },
      partiel1: { name: 'Partiel 1', rate: 6.0, months: 3 },
      partiel2: { name: 'Partiel 2', rate: 12.0, months: 12 },
    };

    const offerKey = body.offer_key || 'classique';
    const offerMeta = offerMap[offerKey] || offerMap.classique;

    const principalEur = Number(body.principal_eur || body.monthly_allowance_eur) || 2800;
    const usdEurRate = Number(body.usd_eur_rate) || 0.92;
    const usdXafRate = Number(body.usd_xaf_rate) || 603.48;
    const principalUsd =
      Number(body.principal_usd || body.monthly_allowance_usd) || (usdEurRate > 0 ? principalEur / usdEurRate : 3043.48);
    const principalXaf = Number(body.principal_xaf || body.monthly_allowance_cdf) || principalEur * 655.957;
    const totalInterestEur =
      Number(body.total_interest_eur) || principalEur * (offerMeta.rate / 100);
    const liecRetainedEur = 150.0;

    await db.query(
      `INSERT INTO avi_requests (
        ref, parent_name, country_name, city, nationality, residential_address, profession, phone, email,
        has_france_guarantor, guarantor_details, session_date, student_name, student_program, passport_number,
        chosen_offer, offer_title, interest_rate, duration_months, monthly_allowance_eur, monthly_allowance_usd,
        monthly_allowance_cdf, usd_eur_rate, total_interest_eur, yimmiline_fee_eur, liec_remuneration_eur,
        risk_score, documents_submitted, workflow_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29
      )`,
      [
        ref,
        body.parent_name || 'Parent Responsable',
        body.country || body.country_name || 'RDC',
        body.town || body.city || 'Kinshasa',
        body.nationality || 'Congolaise',
        body.physical_address || body.residential_address || 'Kinshasa',
        body.occupation || body.profession || 'Cadre',
        body.phone || '+243 81 000 0000',
        body.email || 'parent@example.com',
        body.other_guarantor ?? body.has_france_guarantor ?? true,
        body.guarantor_details || 'Caution bancaire France vérifiée',
        body.expected_start || body.session_date || '2025-09',
        body.student_name || 'Étudiant LIEC',
        body.student_program || 'Programme Lyon',
        passportId,
        offerKey,
        offerMeta.name,
        offerMeta.rate,
        offerMeta.months,
        principalEur,
        principalUsd,
        principalXaf,
        usdEurRate,
        totalInterestEur,
        totalInterestEur - liecRetainedEur,
        liecRetainedEur,
        4,
        body.supporting_docs || body.documents_submitted || 'Passeport, Attestation hébergement, Fiches de paie',
        'Partner Review',
      ]
    );

    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome, details)
       VALUES ($1, 'CREATE_AVI_DOSSIER', $2, 'SUCCESS', $3)`,
      [
        `${user.name} (${user.business_profile})`,
        ref,
        `AVI dossier created for student ${body.student_name} with offer ${offerMeta.name} (LIEC share: €150.00)`,
      ]
    );

    return NextResponse.json({
      success: true,
      ref,
      message: `Demande AVI ${ref} enregistrée avec succès.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
