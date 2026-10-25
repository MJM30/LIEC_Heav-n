import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    const fullName = (body.full_name || 'Nouveau Candidat').trim();
    const program = (body.program || 'MyDigitalSchool Lyon — Dév. Web & UX/UI').trim();
    const cities = (body.cities || 'Lyon (Campus Part-Dieu)').trim();
    const adviser = (body.adviser || 'Sarah Mwamba').trim();
    const email = (body.email || 'candidat@liec.edu').trim();
    const phone = (body.phone || '+243 81 000 0000').trim();
    const country = (body.country || 'RDC (Kinshasa)').trim();

    const countRes = await db.query<{ count: string | number }>('SELECT COUNT(*) as count FROM candidats');
    const nextNum = 43 + Number(countRes.rows[0]?.count ?? 0);
    const ref = `#CAN-2025-${String(nextNum).padStart(3, '0')}`;
    const parts = fullName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

    const schoolName = program.split('—')[0]?.trim() || 'MyDigitalSchool Lyon';
    const schoolCode = schoolName.includes('ISCOM')
      ? 'ISCO'
      : schoolName.includes('Tunon')
      ? 'TUNO'
      : schoolName.includes('IHECF')
      ? 'IHEC'
      : schoolName.includes('Ipac')
      ? 'IPAC'
      : schoolName.includes('MBway')
      ? 'MBW'
      : 'MDS';

    const jalons = [
      {
        num: 1,
        label: 'JALON 1',
        title: 'Orientation & Ciblage',
        status: 'EN COURS',
        tone: 'active',
        description: `Sélection de l'école partenaire à Lyon (${schoolName}) en cours avec ${adviser}.`,
        footer: 'École partenaire Lyon',
      },
      {
        num: 2,
        label: 'JALON 2',
        title: 'Pièces Académiques',
        status: 'À VENIR',
        tone: 'upcoming',
        description: 'Collecte et certification des relevés de notes et test de langue TCF.',
        footer: '2 / 10 documents validés',
      },
      {
        num: 3,
        label: 'JALON 3',
        title: 'Dépôt Officiel',
        status: 'ATTENTE',
        tone: 'pending',
        description: `Soumission Campus France (${country}) & portail d'admission ${schoolName}.`,
        footer: 'Échéance : 15 Décembre',
      },
      {
        num: 4,
        label: 'JALON 4',
        title: 'Visa & Installation',
        status: 'ATTENTE',
        tone: 'pending',
        description: 'Garant financier, attestation bancaire AVI et réservation logement à Lyon.',
        footer: 'Dès réception des avis',
      },
    ];

    const voeux = [
      {
        code: schoolCode,
        codeBg: 'navy',
        university: schoolName,
        rankBadge: 'Vœu n°1',
        rankTone: 'mint',
        program,
        location: 'Campus Lyon',
        meta: 'École Partenaire LIEC Lyon',
        statusBadge: 'En préparation',
        statusTone: 'gold',
        statusSub: `Suivi par ${adviser}`,
      },
    ];

    const notes = [
      {
        author: adviser,
        date: "Aujourd'hui",
        text: `Ouverture du dossier pédagogique LIEC Lyon (${schoolName}) pour ${fullName} (${country}).`,
      },
    ];

    const pieces = [
      { name: `Passeport biométrique (${country})`, meta: 'Vérifié', status: 'valid' },
      { name: `Lettre de motivation ${schoolName}`, meta: 'En rédaction', status: 'pending' },
    ];

    await db.query(
      `INSERT INTO candidats (
        ref, initials, full_name, avatar_url, program, cities, adviser,
        stage_badge, stage_badge_tone, progress_pct, status_left, status_right,
        email, phone, country, nationality, current_diploma, tcf_score,
        garant_info, interview_date, jalons_json, voeux_json, notes_json, pieces_json
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)`,
      [
        ref,
        initials,
        fullName,
        '',
        program,
        cities,
        adviser,
        'Jalon 1',
        'teal',
        25,
        'Dossier à 25%',
        'J-30 CF',
        email,
        phone,
        country,
        country,
        'Licence / Bac+3 (En cours)',
        'Inscription TCF en cours',
        'Dossier AVI YIMMILINE à initier',
        '15 Novembre 2025',
        JSON.stringify(jalons),
        JSON.stringify(voeux),
        JSON.stringify(notes),
        JSON.stringify(pieces),
      ]
    );

    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
       VALUES ($1, $2, $3, 'Succès')`,
      [adviser, `Création nouveau candidat Lyon (${fullName})`, ref]
    );

    return NextResponse.json({ ok: true, ref });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();
    const { ref, action } = body;

    const res = await db.query('SELECT * FROM candidats WHERE ref = $1', [ref]);
    const cand = res.rows[0];
    if (!cand) {
      return NextResponse.json({ error: 'Candidat introuvable' }, { status: 404 });
    }

    if (action === 'add_note') {
      const notes = JSON.parse(cand.notes_json || '[]');
      const newNote = {
        author: body.author || 'Sarah Mwamba',
        date: "Aujourd'hui, à l'instant",
        text: (body.text || '').trim(),
      };
      notes.unshift(newNote);
      await db.query('UPDATE candidats SET notes_json = $1 WHERE ref = $2', [
        JSON.stringify(notes),
        ref,
      ]);
      await db.query(
        `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
         VALUES ($1, 'Ajout note pédagogique dossier candidat', $2, 'Succès')`,
        [newNote.author, ref]
      );
      return NextResponse.json({ ok: true, notes });
    }

    if (action === 'add_voeu') {
      const voeux = JSON.parse(cand.voeux_json || '[]');
      const newVoeu = {
        code: (body.code || 'MDS').slice(0, 4).toUpperCase(),
        codeBg: voeux.length % 2 === 0 ? 'navy' : 'teal',
        university: body.university || 'MyDigitalSchool Lyon',
        rankBadge: `Vœu n°${voeux.length + 1}`,
        rankTone: voeux.length === 0 ? 'mint' : 'neutral',
        program: body.program || cand.program,
        location: body.location || 'Campus Lyon',
        meta: body.meta || 'École Partenaire LIEC Lyon',
        statusBadge: 'Cible Ajoutée',
        statusTone: 'green',
        statusSub: 'Validé par comité LIEC Lyon',
      };
      voeux.push(newVoeu);
      await db.query('UPDATE candidats SET voeux_json = $1 WHERE ref = $2', [
        JSON.stringify(voeux),
        ref,
      ]);
      return NextResponse.json({ ok: true, voeux });
    }

    if (action === 'advance_jalon') {
      const jalonNum = Number(body.jalonNum);
      const jalons = JSON.parse(cand.jalons_json || '[]').map((j: any) => {
        if (j.num < jalonNum) {
          return { ...j, status: 'VALIDÉ', tone: 'done' };
        }
        if (j.num === jalonNum) {
          return { ...j, status: 'EN COURS', tone: 'active' };
        }
        return { ...j, status: 'À VENIR', tone: 'upcoming' };
      });
      const pctMap: Record<number, number> = { 1: 30, 2: 62, 3: 85, 4: 96 };
      const nextPct = pctMap[jalonNum] || cand.progress_pct;
      await db.query(
        'UPDATE candidats SET jalons_json = $1, progress_pct = $2, stage_badge = $3 WHERE ref = $4',
        [JSON.stringify(jalons), nextPct, `En cours (Jalon ${jalonNum})`, ref]
      );
      return NextResponse.json({ ok: true, jalons, progress_pct: nextPct });
    }

    if (action === 'toggle_piece') {
      const index = Number(body.index);
      const pieces = JSON.parse(cand.pieces_json || '[]');
      if (pieces[index]) {
        pieces[index].status = pieces[index].status === 'valid' ? 'pending' : 'valid';
        pieces[index].meta = pieces[index].status === 'valid' ? 'Certifié' : 'En révision';
      }
      await db.query('UPDATE candidats SET pieces_json = $1 WHERE ref = $2', [
        JSON.stringify(pieces),
        ref,
      ]);
      return NextResponse.json({ ok: true, pieces });
    }

    return NextResponse.json({ error: 'Action non supportée' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
