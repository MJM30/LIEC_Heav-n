import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = await getDb();

    const [
      demandesRes,
      notesRes,
      prospectsRes,
      candidatsRes,
      tasksRes,
      aviRes,
      prepaRes,
      invoicesRes,
      auditRes,
      usersRes,
    ] = await Promise.all([
      db.query('SELECT * FROM demandes ORDER BY id ASC'),
      db.query('SELECT * FROM demande_notes ORDER BY id ASC'),
      db.query('SELECT * FROM prospects ORDER BY id ASC'),
      db.query('SELECT * FROM candidats ORDER BY id ASC'),
      db.query('SELECT * FROM priority_tasks ORDER BY id ASC'),
      db.query('SELECT * FROM avi_requests ORDER BY id DESC'),
      db.query('SELECT * FROM prepa_cohorts ORDER BY id ASC'),
      db.query('SELECT * FROM invoices ORDER BY id DESC'),
      db.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 30'),
      db.query('SELECT * FROM users ORDER BY id ASC'),
    ]);

    const candidats = candidatsRes.rows.map((row: any) => ({
      ...row,
      jalons: JSON.parse(row.jalons_json || '[]'),
      voeux: JSON.parse(row.voeux_json || '[]'),
      notes: JSON.parse(row.notes_json || '[]'),
      pieces: JSON.parse(row.pieces_json || '[]'),
    }));

    return NextResponse.json({
      engine: db.engine,
      demandes: demandesRes.rows,
      demandeNotes: notesRes.rows,
      prospects: prospectsRes.rows,
      candidats,
      priorityTasks: tasksRes.rows,
      aviRequests: aviRes.rows,
      prepaCohorts: prepaRes.rows,
      invoices: invoicesRes.rows,
      auditLogs: auditRes.rows,
      users: usersRes.rows,
    });
  } catch (error: any) {
    console.error('Error loading workspace data:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données PostgreSQL', details: error?.message },
      { status: 500 }
    );
  }
}
