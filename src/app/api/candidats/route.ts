import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-user-email',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET() {
  try {
    const db = await getDb();
    const res = await db.query('SELECT * FROM candidats ORDER BY id DESC');
    const candidats = res.rows.map((row: any) => ({
      ...row,
      jalons: JSON.parse(row.jalons_json || '[]'),
      voeux: JSON.parse(row.voeux_json || '[]'),
      notes: JSON.parse(row.notes_json || '[]'),
      pieces: JSON.parse(row.pieces_json || '[]'),
    }));
    return NextResponse.json({ ok: true, candidats }, { headers: corsHeaders() });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req: NextRequest) {
  try {
    const db = await getDb();
    const body = await req.json();

    // 1. Informations du Candidat
    const fullName = (body.full_name || body.nom_complet || body.fullName || 'Nouveau Candidat').trim();
    const email = (body.email || body.adresse_email || 'candidat@liec.edu').trim();
    const phone = (body.phone || body.telephone || '+243 ').trim();

    // Validate Candidate Phone Number (max 14 digits)
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length > 14) {
      return NextResponse.json(
        { error: 'Phone / WhatsApp must be limited to a maximum of 14 digits.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const country = (body.country || body.pays_recrutement || body.pays || '🇨🇩 RDC (Kinshasa / Lubumbashi / Goma)').trim();
    const villeOrigine = (body.ville_origine || body.city || 'Kinshasa').trim();
    const destination = (body.destination || 'Lyon (Exclusivement)').trim();

    // 2. Informations du Parent & Famille
    const parentName = (body.parent_name || body.parent_full_name || body.nom_parent || '').trim();
    const parentPhone = (body.parent_phone || body.telephone_parent || '').trim();

    // Validate Parent Phone Number (max 14 digits)
    const parentPhoneDigits = parentPhone.replace(/\D/g, '');
    if (parentPhoneDigits.length > 14) {
      return NextResponse.json(
        { error: 'Parent Phone Number must be limited to a maximum of 14 digits.' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 3. Parcours Académique & Activité
    const anneeDiplome = (body.annee_diplome || body.graduation_year || body.annee_bac || '2024').trim();
    const activiteActuelle = (body.activite_actuelle || body.current_activity || 'Étudiant / Stagiaire').trim();
    const derniereAnneeUniv = (body.derniere_annee_univ || body.final_year_university || '2024').trim();

    // 4. École Partenaire & Budget
    const rawProgram = (body.program || body.ecole_partenaire || '2. MyDigitalSchool Lyon (Web dev, digital & UX/UI)').trim();
    const budgetAnnuel = (body.budget_annuel || body.budget || '8 500 € – 10 000 € / an').trim();
    const adviser = (body.adviser || 'Sarah Mwamba').trim();

    // Safe Reference generation
    const countRes = await db.query<{ count: string | number }>('SELECT COUNT(*) as count FROM candidats');
    let nextNum = 43 + Number(countRes.rows[0]?.count ?? 0);
    let ref = `#CAN-2025-${String(nextNum).padStart(3, '0')}`;
    while (true) {
      const existingCan = await db.query('SELECT 1 FROM candidats WHERE ref = $1', [ref]);
      if (existingCan.rowCount === 0) break;
      nextNum++;
      ref = `#CAN-2025-${String(nextNum).padStart(3, '0')}`;
    }

    const parts = fullName.split(/\s+/);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

    // Clean school name
    let schoolName = 'MyDigitalSchool Lyon';
    let schoolCode = 'MDS';
    if (rawProgram.includes('ISCOM')) {
      schoolName = 'ISCOM Lyon';
      schoolCode = 'ISCO';
    } else if (rawProgram.includes('Tunon')) {
      schoolName = 'École Internationale Tunon Lyon';
      schoolCode = 'TUNO';
    } else if (rawProgram.includes('IHECF')) {
      schoolName = 'IHECF Lyon';
      schoolCode = 'IHEC';
    } else if (rawProgram.includes('Ipac')) {
      schoolName = 'Ipac Bachelor Factory Lyon';
      schoolCode = 'IPAC';
    } else if (rawProgram.includes('MBway')) {
      schoolName = 'MBway Lyon';
      schoolCode = 'MBW';
    } else if (rawProgram.includes('MyDigitalSchool')) {
      schoolName = 'MyDigitalSchool Lyon';
      schoolCode = 'MDS';
    }

    const currentDiploma = `Diplôme: ${anneeDiplome} • Univ: ${derniereAnneeUniv} • Activité: ${activiteActuelle}`;
    const garantInfo = `Parent: ${parentName || 'Famille'} (${parentPhone || phone}) • Budget: ${budgetAnnuel}`;
    const citiesFormatted = `${villeOrigine} ➔ ${destination}`;

    const jalons = [
      {
        num: 1,
        label: 'JALON 1',
        title: 'Orientation & Ciblage',
        status: 'EN COURS',
        tone: 'active',
        description: `Dossier de candidature initialisé pour ${schoolName}. Sélection des spécialités en cours.`,
        footer: 'Session 2027-2028',
      },
      {
        num: 2,
        label: 'JALON 2',
        title: 'Dossier Académique',
        status: 'EN ATTENTE',
        tone: 'upcoming',
        description: `Vérification des diplômes (${anneeDiplome}) et relevés universitaires (${derniereAnneeUniv}).`,
        footer: 'Pièces requises',
      },
      {
        num: 3,
        label: 'JALON 3',
        title: 'Soumission Officielle',
        status: 'À VENIR',
        tone: 'upcoming',
        description: `Entretien d'admission et transmission officielle du dossier à ${schoolName}.`,
        footer: 'Session Lyon',
      },
      {
        num: 4,
        label: 'JALON 4',
        title: 'Visa & Installation',
        status: 'À VENIR',
        tone: 'upcoming',
        description: `Préparation du compte bloqué AVI YIMMILINE (${budgetAnnuel}) et procédure consulaire.`,
        footer: 'Guichet AVI',
      },
    ];

    const voeux = [
      {
        code: schoolCode,
        codeBg: 'navy',
        university: schoolName,
        rankBadge: 'Vœu #1 (Prioritaire)',
        rankTone: 'mint',
        program: rawProgram,
        location: destination,
        meta: 'École Partenaire Officielle LIEC Lyon',
        statusBadge: 'Nouveau Dossier',
        statusTone: 'green',
        statusSub: "Transmis aujourd'hui",
      },
    ];

    const notes = [
      {
        author: 'Portail Web LIEC-France Prépa',
        date: "Aujourd'hui",
        text: `Candidature reçue en direct via le formulaire officiel ENROLLMENT FORM • 2027-2028.\n• Candidat : ${fullName} (${email} / ${phone})\n• Recrutement : ${country} (Origine : ${villeOrigine})\n• Parent & Famille : ${parentName || 'Non renseigné'} (${parentPhone || 'Non renseigné'})\n• Parcours : Diplôme ${anneeDiplome} | Univ ${derniereAnneeUniv} | Activité : ${activiteActuelle}\n• École partenaire : ${rawProgram}\n• Budget annuel garanti : ${budgetAnnuel}`,
      },
    ];

    const pieces = [
      { name: `Passeport / Pièce d'identité (${country})`, meta: 'À vérifier', status: 'pending' },
      { name: `Diplôme certifié (${anneeDiplome})`, meta: 'En attente', status: 'pending' },
      { name: `Accord de prise en charge parentale (${parentName || 'Famille'})`, meta: budgetAnnuel, status: 'pending' },
      { name: `Dossier de candidature ${schoolName}`, meta: 'Créé', status: 'valid' },
    ];

    // 1. Insert into candidats
    await db.query(
      `INSERT INTO candidats (
        ref, initials, full_name, avatar_url, program, cities, adviser,
        stage_badge, stage_badge_tone, progress_pct, status_left, status_right,
        email, phone, parent_full_name, parent_phone, graduation_year, current_activity, final_year_university,
        country, nationality, current_diploma, tcf_score,
        garant_info, interview_date, jalons_json, voeux_json, notes_json, pieces_json
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29)`,
      [
        ref,
        initials,
        fullName,
        '',
        rawProgram,
        citiesFormatted,
        adviser,
        'Jalon 1 (PREPA)',
        'teal',
        25,
        'Dossier à 25%',
        'J-30 CF',
        email,
        phone,
        parentName || null,
        parentPhone || null,
        anneeDiplome || null,
        activiteActuelle || null,
        derniereAnneeUniv || null,
        country,
        country.includes('RDC') ? 'Congolaise (RDC)' : country.includes('Congo') ? 'Congolaise (Brazzaville)' : 'Internationale',
        currentDiploma,
        'Inscription TCF en cours',
        garantInfo,
        '15 Novembre 2025',
        JSON.stringify(jalons),
        JSON.stringify(voeux),
        JSON.stringify(notes),
        JSON.stringify(pieces),
      ]
    );

    // Optional parent_student_links check
    try {
      if (parentName && fullName) {
        await db.query(
          `INSERT INTO parent_student_links (parent_name, parent_phone, student_name, student_email, student_program, source)
           VALUES ($1, $2, $3, $4, $5, 'candidate')
           ON CONFLICT (parent_name, student_name) DO UPDATE SET
             parent_phone = COALESCE(EXCLUDED.parent_phone, parent_student_links.parent_phone),
             student_program = COALESCE(EXCLUDED.student_program, parent_student_links.student_program)`,
          [parentName, parentPhone, fullName, email, rawProgram]
        );
      }
    } catch {
      // Table may not exist in all environments, safe to ignore
    }

    // 2. Also register in demandes table so it synchronizes across all dashboard views
    const countDemRes = await db.query<{ count: string | number }>('SELECT COUNT(*) as count FROM demandes');
    let nextDemNum = 90 + Number(countDemRes.rows[0]?.count ?? 0);
    let demRef = `#DEM-2025-${String(nextDemNum).padStart(3, '0')}`;
    while (true) {
      const existingDem = await db.query('SELECT 1 FROM demandes WHERE ref = $1', [demRef]);
      if (existingDem.rowCount === 0) break;
      nextDemNum++;
      demRef = `#DEM-2025-${String(nextDemNum).padStart(3, '0')}`;
    }
    const countryFlag = country.includes('🇨🇬') ? '🇨🇬' : country.includes('🇨🇲') ? '🇨🇲' : '🇨🇩';

    await db.query(
      `INSERT INTO demandes (
        ref, initials, full_name, email, phone, whatsapp_verified,
        country_code, flag, country_name, city, nationality,
        program, service_pole, target_cities, current_level, budget_range,
        status, adviser, expected_start, message, submitted_at, is_dashboard_recent
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)
      ON CONFLICT (ref) DO NOTHING`,
      [
        demRef,
        initials,
        fullName,
        email,
        phone,
        true,
        'CD',
        countryFlag,
        country,
        `${villeOrigine}, ${country}`,
        'Congolaise',
        rawProgram,
        `PREPA / ${schoolName}`,
        'Lyon (Exclusif)',
        `Diplôme ${anneeDiplome} • ${activiteActuelle}`,
        budgetAnnuel,
        'Nouvelle',
        adviser,
        'Rentrée 2027-2028',
        `Inscription en ligne LIEC - France Prépa (2027-2028). Parent: ${parentName} (${parentPhone}). Univ: ${derniereAnneeUniv}. Budget garanti: ${budgetAnnuel}.`,
        "Soumis à l'instant via le portail web",
        true,
      ]
    );

    // 3. Register priority task for advisors
    await db.query(
      `INSERT INTO priority_tasks (title, description, priority, action_label, target_module, completed, role_queue)
       VALUES ($1, $2, 'Urgent', 'Consulter Dossier Candidat', 'candidats', FALSE, 'all')`,
      [
        `Nouveau candidat PREPA 2027-2028 : ${fullName}`,
        `${schoolName} • Ville: ${villeOrigine} • Parent: ${parentName || 'Famille'} (${parentPhone || phone})`,
      ]
    );

    // 4. Audit log entry
    await db.query(
      `INSERT INTO audit_logs (actor, action, entity_ref, outcome)
       VALUES ($1, $2, $3, 'Succès')`,
      ['Portail Web Public', `Candidature PREPA reçue : ${fullName} (${ref})`, ref]
    );

    return NextResponse.json(
      {
        ok: true,
        success: true,
        ref,
        demRef,
        fullName,
        program: rawProgram,
        schoolName,
        message: 'Candidature enregistrée avec succès dans le Dashboard LIEC-ONE',
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error creating candidat:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de la création du candidat' },
      { status: 500, headers: corsHeaders() }
    );
  }
}
