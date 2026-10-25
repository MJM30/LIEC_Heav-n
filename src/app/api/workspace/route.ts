import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import {
  authenticateServerRequest,
  evaluateModuleAccess,
  applyFieldLevelAcl,
} from '@/lib/rbac';

export async function GET(req: NextRequest) {
  try {
    const db = await getDb();
    const auth = await authenticateServerRequest(req, db);

    if (!auth.success) {
      return auth.response;
    }

    const { user } = auth;
    const profile = user.business_profile;

    // Concurrently fetch all raw dataset
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
      rolesRes,
    ] = await Promise.all([
      db.query('SELECT * FROM demandes ORDER BY id ASC'),
      db.query('SELECT * FROM demande_notes ORDER BY id ASC'),
      db.query('SELECT * FROM prospects ORDER BY id ASC'),
      db.query('SELECT * FROM candidats ORDER BY id ASC'),
      db.query('SELECT * FROM priority_tasks ORDER BY id ASC'),
      db.query('SELECT * FROM avi_requests ORDER BY id DESC'),
      db.query('SELECT * FROM prepa_cohorts ORDER BY id ASC'),
      db.query('SELECT * FROM invoices ORDER BY id DESC'),
      db.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 50'),
      db.query('SELECT id, name, email, business_profile, role, title, initials, active, suspended_at, suspended_by, created_at FROM users ORDER BY id ASC'),
      db.query('SELECT * FROM roles ORDER BY id ASC'),
    ]);

    // Parse JSON fields on candidats
    const parsedCandidats = candidatsRes.rows.map((row: any) => ({
      ...row,
      jalons: JSON.parse(row.jalons_json || '[]'),
      voeux: JSON.parse(row.voeux_json || '[]'),
      notes: JSON.parse(row.notes_json || '[]'),
      pieces: JSON.parse(row.pieces_json || '[]'),
    }));

    // Apply Access Matrix according to PDF Section 3
    let filteredDemandes = demandesRes.rows;
    let filteredProspects = prospectsRes.rows;
    let filteredCandidats = parsedCandidats;
    let filteredAviRequests = aviRes.rows;
    let filteredInvoices = invoicesRes.rows;
    let filteredAuditLogs = auditRes.rows;
    let filteredUsers = usersRes.rows;
    let filteredRoles = rolesRes.rows;
    let filteredTasks = tasksRes.rows;
    let filteredPrepaCohorts = prepaRes.rows;

    if (profile === 'Secretary') {
      // Secretary: Denied by default from General Finance & Blocked Finance (AVI)
      filteredAviRequests = [];
      filteredInvoices = [];
      filteredAuditLogs = [];
      filteredUsers = [];
      filteredRoles = [];

      // Field-level ACL on Student Records
      filteredCandidats = parsedCandidats.map((c) =>
        applyFieldLevelAcl(user, 'candidats', c)
      );
    } else if (profile === 'Finance Officer') {
      // Finance Officer: Denied from internal secretary intake prospects, prepa content, user management & audit
      filteredProspects = [];
      filteredPrepaCohorts = [];
      filteredAuditLogs = [];
      filteredUsers = [];
      filteredRoles = [];

      // Tasks filtered to financial & AVI follow-ups
      filteredTasks = tasksRes.rows.filter(
        (t: any) =>
          t.category?.toLowerCase().includes('avi') ||
          t.category?.toLowerCase().includes('finance') ||
          t.title?.toLowerCase().includes('avi') ||
          t.title?.toLowerCase().includes('caution') ||
          t.title?.toLowerCase().includes('garant')
      );
    }

    return NextResponse.json({
      engine: db.engine,
      currentUser: user,
      rbacProfile: profile,
      technicalRoles: user.technical_roles,
      demandes: filteredDemandes,
      demandeNotes: notesRes.rows,
      prospects: filteredProspects,
      candidats: filteredCandidats,
      priorityTasks: filteredTasks,
      aviRequests: filteredAviRequests,
      prepaCohorts: filteredPrepaCohorts,
      invoices: filteredInvoices,
      auditLogs: filteredAuditLogs,
      users: filteredUsers,
      roles: filteredRoles,
    });
  } catch (error: any) {
    console.error('Error in workspace RBAC query:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des données PostgreSQL', details: error?.message },
      { status: 500 }
    );
  }
}
