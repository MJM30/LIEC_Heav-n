import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    const passportId = String(body.student_id_doc || '').trim().toUpperCase();
    // Respecting 9 digits/characters starting with either OP or PO (accepts OP/PO + 9 digits or 9 chars total OP/PO + 7 digits)
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

    const principalEur = Number(body.principal_eur) || 2800;
    const usdEurRate = Number(body.usd_eur_rate) || 0.92;
    const usdXafRate = Number(body.usd_xaf_rate) || 603.48;
    const principalUsd =
      Number(body.principal_usd) || (usdEurRate > 0 ? principalEur / usdEurRate : 3043.48);
    const principalXaf = Number(body.principal_xaf) || principalEur * 655.957;
    const totalInterestEur =
      Number(body.total_interest_eur) || principalEur * (offerMeta.rate / 100);
    // Out of the interest paid to obtain the AVI, LIEC recovers 150 EUR on every file
    const liecRetainedEur = 150.0;

    const res = await db.query(
      `INSERT INTO avi_requests (
        ref, parent_name, country, town, nationality, physical_address, occupation, phone, email,
        other_guarantor, guarantor_details, expected_start, student_name, student_program, student_id_doc,
        offer_key, offer_name, interest_rate, duration_months, principal_eur, principal_usd, principal_xaf,
        usd_eur_rate, usd_xaf_rate, total_interest_eur, liec_fee_usd, files_count, supporting_docs, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)
      RETURNING *`,
      [
        ref,
        body.parent_name || 'Parent Borrower',
        body.country || 'RDC',
        body.town || 'Kinshasa',
        body.nationality || 'Congolaise (RDC)',
        body.physical_address || 'Avenue de la Gombe, Kinshasa',
        body.occupation || 'Salaried Employee',
        body.phone || '+243 81 000 0000',
        body.email || 'parent@example.com',
        Boolean(body.other_guarantor),
        body.other_guarantor ? String(body.guarantor_details || '') : 'Parent is primary guarantor',
        body.expected_start || '2025-09',
        body.student_name || 'Student',
        body.student_program || 'MyDigitalSchool Lyon — Web Dev & UX/UI',
        passportId,
        offerKey,
        offerMeta.name,
        offerMeta.rate,
        offerMeta.months,
        principalEur,
        principalUsd,
        principalXaf,
        usdEurRate,
        usdXafRate,
        totalInterestEur,
        liecRetainedEur,
        Number(body.files_count) || 1,
        body.supporting_docs || 'Attached supporting files',
        'Processing YIMMILINE',
      ]
    );

    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
       VALUES ('AVI Officer', $1, $2, 'Success')`,
      [
        `AVI Prefinancing submitted (${offerMeta.name} · €${principalEur.toFixed(2)} EUR · LIEC Interest €150.00)`,
        ref,
      ]
    );

    return NextResponse.json({ aviRequest: res.rows[0], ref });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
