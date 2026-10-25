-- ============================================================================
-- LIEC Education (LIEC One) - PostgreSQL Database Schema & Initial Seed Data
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) UNIQUE NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  title VARCHAR(100) NOT NULL DEFAULT 'Conseillère Senior',
  initials VARCHAR(10) NOT NULL DEFAULT 'SM',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demandes (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(40) UNIQUE NOT NULL,
  initials VARCHAR(10) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(160) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  whatsapp_verified BOOLEAN NOT NULL DEFAULT TRUE,
  country_code VARCHAR(10) NOT NULL DEFAULT 'CD',
  flag VARCHAR(16) NOT NULL DEFAULT '🇨🇩',
  country_name VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  nationality VARCHAR(100) DEFAULT 'Congolaise (RDC)',
  program VARCHAR(160) NOT NULL,
  service_pole VARCHAR(120) NOT NULL,
  target_cities VARCHAR(200) DEFAULT 'Lyon (Exclusif)',
  current_level VARCHAR(200) DEFAULT 'Licence 3 - Mention Bien',
  budget_range VARCHAR(120) DEFAULT '8 500 € – 10 000 € / an',
  status VARCHAR(50) NOT NULL DEFAULT 'Nouvelle',
  adviser VARCHAR(120) DEFAULT 'Sarah Mwamba',
  expected_start VARCHAR(50) DEFAULT 'Septembre 2025',
  message TEXT,
  submitted_at VARCHAR(100) NOT NULL DEFAULT 'Soumis le 25 Octobre 2025 à 16:42',
  is_dashboard_recent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demande_notes (
  id SERIAL PRIMARY KEY,
  demande_ref VARCHAR(40) NOT NULL,
  author VARCHAR(120) NOT NULL,
  timestamp_label VARCHAR(80) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prospects (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'nouveau', -- 'nouveau', 'premier_contact', 'diagnostic', 'qualifie'
  badge_text VARCHAR(60) NOT NULL,
  badge_tone VARCHAR(30) NOT NULL DEFAULT 'neutral', -- 'urgent', 'amber', 'neutral', 'gold'
  flag VARCHAR(16) NOT NULL DEFAULT '🇨🇩',
  country_city VARCHAR(120) NOT NULL,
  program_tag VARCHAR(140) NOT NULL,
  program_tag_tone VARCHAR(30) NOT NULL DEFAULT 'mint', -- 'mint', 'blue'
  highlight_box VARCHAR(180),
  meta_left VARCHAR(120) NOT NULL,
  meta_right VARCHAR(120) NOT NULL,
  meta_right_tone VARCHAR(30) DEFAULT 'teal',
  adviser_initials VARCHAR(10) NOT NULL DEFAULT 'SM',
  adviser_name VARCHAR(100) NOT NULL DEFAULT 'S. Mwamba',
  adviser_color VARCHAR(30) NOT NULL DEFAULT 'navy',
  estimated_value INTEGER NOT NULL DEFAULT 1800,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  is_prepa BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS candidats (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(40) UNIQUE NOT NULL,
  initials VARCHAR(10) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  avatar_url VARCHAR(255),
  program VARCHAR(180) NOT NULL,
  cities VARCHAR(140) NOT NULL,
  adviser VARCHAR(120) NOT NULL DEFAULT 'Sarah Mwamba',
  stage_badge VARCHAR(60) NOT NULL DEFAULT 'En cours (Jalon 2)',
  stage_badge_tone VARCHAR(30) NOT NULL DEFAULT 'teal',
  progress_pct INTEGER NOT NULL DEFAULT 65,
  status_left VARCHAR(80) NOT NULL DEFAULT 'Dossier à 65%',
  status_right VARCHAR(80) NOT NULL DEFAULT 'J-14 CF',
  email VARCHAR(160) DEFAULT 'd.kabangele@unikin.ac.cd',
  phone VARCHAR(60) DEFAULT '+243 81 552 1904',
  country VARCHAR(100) DEFAULT 'RDC (Kinshasa)',
  nationality VARCHAR(100) DEFAULT 'Congolaise (RDC)',
  current_diploma VARCHAR(180) DEFAULT 'Licence Informatique (Mention TB) - UNIKIN',
  tcf_score VARCHAR(100) DEFAULT 'TCF B2 (540 pts) certifié',
  garant_info VARCHAR(220) DEFAULT 'Oncle résidant à Villeurbanne en CDI (Revenus vérifiés)',
  interview_date VARCHAR(120) DEFAULT '04 Novembre 2025',
  jalons_json TEXT NOT NULL,
  voeux_json TEXT NOT NULL,
  notes_json TEXT NOT NULL,
  pieces_json TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS priority_tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'Urgent', -- 'Urgent', 'Modéré'
  action_label VARCHAR(120) NOT NULL,
  target_module VARCHAR(60) NOT NULL DEFAULT 'demandes',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  role_queue VARCHAR(50) NOT NULL DEFAULT 'all',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS avi_requests (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(40) UNIQUE NOT NULL,
  parent_name VARCHAR(150) NOT NULL,
  country VARCHAR(100) NOT NULL,
  town VARCHAR(100) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  physical_address VARCHAR(220) DEFAULT 'Avenue de la Gombe, Kinshasa',
  occupation VARCHAR(160) NOT NULL,
  phone VARCHAR(60) NOT NULL,
  email VARCHAR(160) NOT NULL,
  other_guarantor BOOLEAN NOT NULL DEFAULT FALSE,
  guarantor_details TEXT DEFAULT '',
  expected_start VARCHAR(40) NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  student_program VARCHAR(160) NOT NULL,
  student_id_doc VARCHAR(100) NOT NULL,
  offer_key VARCHAR(40) NOT NULL DEFAULT 'classique',
  offer_name VARCHAR(80) NOT NULL DEFAULT 'Classique',
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 12.00,
  duration_months INTEGER NOT NULL DEFAULT 8,
  principal_eur NUMERIC(12,2) NOT NULL DEFAULT 2800.00,
  principal_usd NUMERIC(12,2) NOT NULL DEFAULT 3043.48,
  principal_xaf NUMERIC(14,2) NOT NULL DEFAULT 1836680.00,
  usd_eur_rate NUMERIC(10,4) NOT NULL DEFAULT 0.9200,
  usd_xaf_rate NUMERIC(10,2) NOT NULL DEFAULT 603.48,
  total_interest_eur NUMERIC(10,2) NOT NULL DEFAULT 336.00,
  liec_fee_usd NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  files_count INTEGER NOT NULL DEFAULT 3,
  supporting_docs TEXT DEFAULT '',
  status VARCHAR(60) NOT NULL DEFAULT 'Submitted to YIMMILINE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS prepa_cohorts (
  id SERIAL PRIMARY KEY,
  code VARCHAR(40) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  campus VARCHAR(100) NOT NULL,
  start_date VARCHAR(80) NOT NULL,
  enrolled_count INTEGER NOT NULL DEFAULT 24,
  capacity INTEGER NOT NULL DEFAULT 30,
  lead_instructor VARCHAR(120) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Inscriptions ouvertes'
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  ref VARCHAR(40) UNIQUE NOT NULL,
  student_name VARCHAR(150) NOT NULL,
  service_label VARCHAR(160) NOT NULL,
  amount_eur NUMERIC(10,2) NOT NULL,
  paid_eur NUMERIC(10,2) NOT NULL,
  recipient VARCHAR(80) NOT NULL DEFAULT 'LIEC Education',
  status VARCHAR(50) NOT NULL DEFAULT 'Partiellement payé',
  issued_date VARCHAR(60) NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  actor VARCHAR(120) NOT NULL,
  action VARCHAR(160) NOT NULL,
  entity_ref VARCHAR(80) NOT NULL,
  outcome VARCHAR(50) NOT NULL DEFAULT 'Succès',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
