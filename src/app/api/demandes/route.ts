import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const COUNTRY_MAP: Record<string, { code: string; flag: string }> = {
  RDC: { code: 'CD', flag: '🇨🇩' },
  'Congo (RDC)': { code: 'CD', flag: '🇨🇩' },
  'Congo-Brazzaville': { code: 'CG', flag: '🇨🇬' },
  Congo: { code: 'CG', flag: '🇨🇬' },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    const fullName = (body.full_name || body.name || 'Nouveau Candidat').trim();
    const email = (body.email || 'contact@exemple.com').trim();
    const phone = (body.phone || '+243 81 000 0000').trim();
    const countryName = (body.country_name || body.country || 'RDC').trim();
    const city = (
      body.city ||
      body.town ||
      (countryName.includes('Brazza') || countryName === 'Congo'
        ? 'Brazzaville, Congo'
        : 'Kinshasa, RDC')
    ).trim();
    const nationality =
      countryName.includes('Brazza') || countryName === 'Congo'
        ? 'Congolaise (Brazzaville)'
        : 'Congolaise (RDC)';
    const program = (body.program || 'MyDigitalSchool Lyon — Dév. Web & UX/UI').trim();
    const servicePole = (body.service_pole || 'PREPA / Écoles Partenaires Lyon').trim();
    const targetCities = (body.target_cities || 'Lyon (Campus Partenaire LIEC)').trim();
    const currentLevel = (body.current_level || 'Licence / Bac+3 (En cours)').trim();
    const budgetRange = (body.budget_range || '8 500 € – 10 000 € / an').trim();
    const expectedStart = (body.expected_start || 'Septembre 2025').trim();
    const message = (
      body.message || 'Demande soumise depuis le portail web LIEC pour un recrutement à Lyon.'
    ).trim();

    const countRes = await db.query<{ count: string | number }>('SELECT COUNT(*) as count FROM demandes');
    const nextNum = 89 + Number(countRes.rows[0]?.count ?? 0);
    const ref = `#DEM-2025-${String(nextNum).padStart(3, '0')}`;
    const initials = getInitials(fullName);
    const countryMeta = COUNTRY_MAP[countryName] || { code: 'CD', flag: '🇨🇩' };

    const nowLabel = "Soumis à l'instant";

    const insertRes = await db.query(
      `INSERT INTO demandes (
        ref, initials, full_name, email, phone, whatsapp_verified, country_code, flag,
        country_name, city, nationality, program, service_pole, target_cities, current_level,
        budget_range, status, adviser, expected_start, message, submitted_at, is_dashboard_recent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      RETURNING *`,
      [
        ref,
        initials,
        fullName,
        email,
        phone,
        true,
        countryMeta.code,
        countryMeta.flag,
        countryName,
        city,
        nationality,
        program,
        servicePole,
        targetCities,
        currentLevel,
        budgetRange,
        'Nouvelle',
        'Sarah Mwamba',
        expectedStart,
        message,
        nowLabel,
        true,
      ]
    );

    await db.query(
      `INSERT INTO demande_notes (demande_ref, author, timestamp_label, content)
       VALUES ($1, $2, $3, $4)`,
      [ref, 'Portail Public LIEC Lyon', "À l'instant", `Demande reçue (${countryName} → Lyon) : ${message}`]
    );

    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
       VALUES ($1, $2, $3, 'Succès')`,
      ['Portail Web / API', `Création nouvelle demande (${fullName} - ${program})`, ref]
    );

    return NextResponse.json({ demande: insertRes.rows[0], ref });
  } catch (error: any) {
    console.error('Error creating demande:', error);
    return NextResponse.json({ error: error?.message || 'Erreur création demande' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();
    const { ref, action } = body;

    if (!ref) {
      return NextResponse.json({ error: 'Référence requise' }, { status: 400 });
    }

    if (action === 'add_note') {
      const author = body.author || 'Sarah Mwamba (Conseillère)';
      const content = (body.content || '').trim();
      if (!content) {
        return NextResponse.json({ error: 'Contenu de note vide' }, { status: 400 });
      }
      const res = await db.query(
        `INSERT INTO demande_notes (demande_ref, author, timestamp_label, content)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [ref, author, "Aujourd'hui, à l'instant", content]
      );
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, $2, $3, 'Succès')`,
        [author, 'Ajout note interne sur demande', ref]
      );
      return NextResponse.json({ note: res.rows[0] });
    }

    if (action === 'update_status') {
      const newStatus = body.status || 'Qualifiée';
      const adviser = body.adviser;
      if (adviser) {
        await db.query(`UPDATE demandes SET status = $1, adviser = $2 WHERE ref = $3`, [
          newStatus,
          adviser,
          ref,
        ]);
      } else {
        await db.query(`UPDATE demandes SET status = $1 WHERE ref = $2`, [newStatus, ref]);
      }
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ('Sarah Mwamba', $1, $2, 'Succès')`,
        [`Changement statut demande -> ${newStatus}`, ref]
      );
      return NextResponse.json({ ok: true, status: newStatus });
    }

    if (action === 'convert_to_candidat') {
      const demRes = await db.query(`SELECT * FROM demandes WHERE ref = $1`, [ref]);
      const dem = demRes.rows[0];
      if (!dem) {
        return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
      }

      await db.query(`UPDATE demandes SET status = 'Convertie' WHERE ref = $1`, [ref]);

      const canCountRes = await db.query<{ count: string | number }>('SELECT COUNT(*) as count FROM candidats');
      const nextCanNum = 43 + Number(canCountRes.rows[0]?.count ?? 0);
      const canRef = `#CAN-2025-${String(nextCanNum).padStart(3, '0')}`;

      const schoolCode = dem.program.includes('ISCOM')
        ? 'ISCO'
        : dem.program.includes('Tunon')
        ? 'TUNO'
        : dem.program.includes('IHECF')
        ? 'IHEC'
        : dem.program.includes('Ipac')
        ? 'IPAC'
        : dem.program.includes('MBway')
        ? 'MBW'
        : 'MDS';

      const schoolName = dem.program.includes('ISCOM')
        ? 'ISCOM Lyon'
        : dem.program.includes('Tunon')
        ? 'École Internationale Tunon Lyon'
        : dem.program.includes('IHECF')
        ? 'IHECF Lyon'
        : dem.program.includes('Ipac')
        ? 'Ipac Bachelor Factory Lyon'
        : dem.program.includes('MBway')
        ? 'MBway Lyon'
        : 'MyDigitalSchool Lyon';

      const defaultJalons = [
        {
          num: 1,
          label: 'JALON 1',
          title: 'Orientation & Ciblage',
          status: 'EN COURS',
          tone: 'active',
          description: `Dossier issu de la demande ${dem.ref} (${dem.country_name}). Ciblage école partenaire : ${schoolName}.`,
          footer: 'École partenaire Lyon validée',
        },
        {
          num: 2,
          label: 'JALON 2',
          title: 'Pièces Académiques',
          status: 'À VENIR',
          tone: 'upcoming',
          description: `Vérification du niveau ${dem.current_level} et préparation test TCF.`,
          footer: '3 / 10 documents validés',
        },
        {
          num: 3,
          label: 'JALON 3',
          title: 'Dépôt Officiel',
          status: 'ATTENTE',
          tone: 'pending',
          description: `Soumission Campus France (${dem.country_name}) & portail d'admission ${schoolName}.`,
          footer: 'Échéance : 15 Décembre',
        },
        {
          num: 4,
          label: 'JALON 4',
          title: 'Visa & Installation',
          status: 'ATTENTE',
          tone: 'pending',
          description: `Garant financier (${dem.budget_range}), attestation bancaire AVI et logement à Lyon.`,
          footer: 'Dès réception des avis',
        },
      ];

      const defaultVoeux = [
        {
          code: schoolCode,
          codeBg: 'navy',
          university: schoolName,
          rankBadge: 'Vœu n°1',
          rankTone: 'mint',
          program: dem.program,
          location: 'Campus Lyon',
          meta: 'École Partenaire LIEC Lyon',
          statusBadge: 'Dossier Initié',
          statusTone: 'green',
          statusSub: `Qualifié par ${dem.adviser}`,
        },
      ];

      const defaultNotes = [
        {
          author: dem.adviser || 'Sarah Mwamba',
          date: "Aujourd'hui",
          text: `Dossier candidat créé pour ${schoolName} suite à la qualification de la demande ${dem.ref} (${dem.city}).`,
        },
      ];

      const defaultPieces = [
        { name: `Passeport biométrique (${dem.country_name})`, meta: 'Vérifié', status: 'valid' },
        { name: dem.current_level, meta: 'Reçu', status: 'valid' },
        { name: `Lettre de motivation ${schoolName}`, meta: 'En cours', status: 'pending' },
      ];

      await db.query(
        `INSERT INTO candidats (
          ref, initials, full_name, avatar_url, program, cities, adviser,
          stage_badge, stage_badge_tone, progress_pct, status_left, status_right,
          email, phone, country, nationality, current_diploma, tcf_score,
          garant_info, interview_date, jalons_json, voeux_json, notes_json, pieces_json
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
        [
          canRef,
          dem.initials,
          dem.full_name.toUpperCase(),
          '',
          dem.program,
          'Lyon (Campus Partenaire)',
          dem.adviser || 'Sarah Mwamba',
          'En cours (Jalon 1)',
          'teal',
          25,
          'Dossier à 25%',
          'Qualifié',
          dem.email,
          dem.phone,
          dem.city,
          dem.nationality,
          dem.current_level,
          'En cours de planification',
          `Budget garanti : ${dem.budget_range}`,
          'À planifier',
          JSON.stringify(defaultJalons),
          JSON.stringify(defaultVoeux),
          JSON.stringify(defaultNotes),
          JSON.stringify(defaultPieces),
        ]
      );

      await db.query(
        `INSERT INTO prospects (
          full_name, stage, badge_text, badge_tone, flag, country_city, program_tag,
          program_tag_tone, highlight_box, meta_left, meta_right, meta_right_tone,
          adviser_initials, adviser_name, adviser_color, estimated_value, is_urgent, is_prepa
        ) VALUES ($1,'qualifie','Qualifié CRM','gold',$2,$3,$4,'mint',NULL,'1 800 € TTC','Converti Candidat','teal','SM','S. Mwamba','navy',1800,FALSE,TRUE)`,
        [dem.full_name, dem.flag, dem.city, dem.program]
      );

      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ('Sarah Mwamba', $1, $2, 'Succès')`,
        [`Qualification et conversion en Candidat Lyon (${canRef})`, ref]
      );

      return NextResponse.json({ ok: true, candidatRef: canRef });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating demande:', error);
    return NextResponse.json({ error: error?.message || 'Erreur mise à jour demande' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const db = await getDb();
    const { searchParams } = new URL(req.url);
    const ref = searchParams.get('ref');
    if (!ref) {
      return NextResponse.json({ error: 'Référence manquante' }, { status: 400 });
    }
    await db.query(`UPDATE demandes SET status = 'Clôturée' WHERE ref = $1`, [ref]);
    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
       VALUES ('Sarah Mwamba', 'Archivage demande', $1, 'Succès')`,
      [ref]
    );
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
