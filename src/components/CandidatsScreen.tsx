'use client';

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Briefcase,
  UserPlus,
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  Edit3,
  FolderDown,
  RefreshCw,
  Send,
  Plane,
  FileText,
  Clock,
  PlusCircle,
  Euro,
  ShieldCheck,
  Wrench,
  Flag,
  ClipboardCheck,
  Smile,
} from 'lucide-react';

import { Lang } from './ServicesAndOtherScreens';

interface CandidatsScreenProps {
  candidats: any[];
  selectedRef: string;
  onSelectRef: (ref: string) => void;
  onCreateCandidat: (data: any) => Promise<void>;
  onAddNote: (ref: string, text: string) => Promise<void>;
  onAddVoeu: (ref: string, data: any) => Promise<void>;
  onAdvanceJalon: (ref: string, jalonNum: number) => Promise<void>;
  onTogglePiece: (ref: string, pieceIndex: number) => Promise<void>;
  onNotify: (msg: string) => void;
  lang?: Lang;
}

export default function CandidatsScreen({
  candidats,
  selectedRef,
  onSelectRef,
  onCreateCandidat,
  onAddNote,
  onAddVoeu,
  onAdvanceJalon,
  onTogglePiece,
  onNotify,
}: CandidatsScreenProps) {
  const [cohortFilter, setCohortFilter] = useState('');
  const [activeSubTab, setActiveSubTab] = useState(4);
  const [noteText, setNoteText] = useState('');
  const [notifySarah, setNotifySarah] = useState(true);
  const [showNewCandidatModal, setShowNewCandidatModal] = useState(false);
  const [showNewVoeuModal, setShowNewVoeuModal] = useState(false);

  // New Candidat Form
  const [newCandName, setNewCandName] = useState('');
  const [newCandCountry, setNewCandCountry] = useState('RDC (Kinshasa)');
  const [newCandProgram, setNewCandProgram] = useState(
    'MyDigitalSchool Lyon — Web dev, digital creation, webmarketing & UX/UI design'
  );

  // New Voeu Form
  const [voeuUniv, setVoeuUniv] = useState('ISCOM Lyon');
  const [voeuProg, setVoeuProg] = useState('Communication, advertising, marketing and events');
  const [voeuCode, setVoeuCode] = useState('ISCO');

  const filteredCandidats = candidats.filter((c) => {
    const q = cohortFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      c.ref.toLowerCase().includes(q) ||
      c.full_name.toLowerCase().includes(q) ||
      c.program.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
    );
  });

  const selectedCandidat =
    candidats.find((c) => c.ref === selectedRef) || filteredCandidats[0] || candidats[0];

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim() || !selectedCandidat) return;
    await onAddNote(selectedCandidat.ref, noteText.trim());
    setNoteText('');
    onNotify('Internal candidate note recorded.');
  };

  const handleAddVoeuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidat || !voeuUniv.trim()) return;
    await onAddVoeu(selectedCandidat.ref, {
      code: voeuCode,
      codeBg: voeuUniv.includes('ISCOM') ? 'navy' : 'teal',
      university: voeuUniv,
      rankBadge: `Choice #${selectedCandidat.voeux.length + 1}`,
      rankTone: 'neutral',
      program: voeuProg,
      location: 'Lyon Campus',
      meta: 'LIEC Lyon Partner School',
      statusBadge: 'Ready File',
      statusTone: 'green',
      statusSub: 'Added by Advisor',
    });
    setShowNewVoeuModal(false);
  };

  const handleCreateCandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCandName.trim()) return;
    await onCreateCandidat({
      full_name: newCandName.trim(),
      program: newCandProgram,
      country: newCandCountry,
      cities: 'Lyon (Exclusive)',
      adviser: 'Sarah Mwamba',
    });
    setNewCandName('');
    setShowNewCandidatModal(false);
  };

  if (!selectedCandidat) return null;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0c685a] mb-1">
            <span className="h-2 w-2 rounded-full bg-[#0c685a]" />
            <span>LIEC LYON ACADEMIC PORTAL</span>
          </div>
          <h1 className="text-[28px] sm:text-[31px] font-extrabold tracking-tight text-[#092342] leading-[1.15]">
            Candidate &amp; File
            <br />
            Tracking
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-md">
            Individualized academic and consular coaching for higher education in France.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef4fb] px-3.5 py-2 text-xs font-bold text-[#092342]">
            <Users className="w-3.5 h-3.5 text-[#092342]" />
            <span>2025–2026 Cohort (Sep Intake) ▾</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef4fb] px-3.5 py-2 text-xs font-bold text-[#092342]">
            <GraduationCap className="w-3.5 h-3.5 text-[#092342]" />
            <span>All Programs ▾</span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl bg-[#eef4fb] px-3.5 py-2 text-xs font-bold text-[#092342]">
            <Briefcase className="w-3.5 h-3.5 text-[#092342]" />
            <span>Advisor: Sarah Mwamba ▾</span>
          </div>

          <button
            onClick={() => setShowNewCandidatModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#092342] hover:bg-[#12365a] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ New Candidate</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Assigned Candidates (3 cols on LG) */}
        <div className="lg:col-span-3 rounded-2xl border border-[#e6eef6] bg-white p-3.5 shadow-card space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold text-[#092342] leading-tight">
              Assigned
              <br />
              Candidates
            </h2>
            <span className="rounded-xl bg-[#6ee7b7] px-2.5 py-1 text-[10.5px] font-extrabold text-[#064e3b] leading-tight text-center">
              {14 + Math.max(0, candidats.length - 4)}
              <br />
              active
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={cohortFilter}
              onChange={(e) => setCohortFilter(e.target.value)}
              placeholder="Filter cohort..."
              className="w-full rounded-xl bg-[#f1f6fb] pl-8 pr-3 py-2 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0c685a]/20"
            />
          </div>

          <div className="space-y-2.5">
            {filteredCandidats.map((cand) => {
              const active = selectedCandidat.ref === cand.ref;
              const badgeColor =
                cand.stage_badge_tone === 'teal'
                  ? 'bg-[#0c685a] text-white'
                  : cand.stage_badge_tone === 'mint'
                  ? 'bg-[#6ee7b7] text-[#064e3b]'
                  : 'bg-[#dce7f5] text-[#092342]';

              return (
                <div
                  key={cand.ref}
                  onClick={() => onSelectRef(cand.ref)}
                  className={`cursor-pointer rounded-2xl border p-3 transition space-y-2 ${
                    active
                      ? 'border-[#092342] bg-[#e9f2fc] shadow-xs'
                      : 'border-[#e8eff7] bg-[#f8fbff] hover:bg-[#f1f6fc]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-extrabold text-[#092342]">{cand.ref}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9.5px] font-extrabold ${badgeColor}`}
                    >
                      {cand.stage_badge}
                    </span>
                  </div>

                  <div className="font-extrabold text-[#092342] text-xs leading-snug">
                    {cand.full_name}
                  </div>

                  <div className="text-[11px] text-slate-500 line-clamp-1">{cand.program}</div>

                  <div className="flex items-center justify-between text-[10.5px] text-slate-400 pt-1">
                    <span className="font-semibold text-slate-600">{cand.cities}</span>
                    <span>{cand.adviser}</span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="pt-1">
                    <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#0c685a]"
                        style={{ width: `${cand.progress_pct}%` }}
                      />
                    </div>
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                      <span>{cand.status_left}</span>
                      <span>{cand.status_right}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Main Candidate Dossier (9 cols on LG) */}
        <div className="lg:col-span-9 rounded-2xl border border-[#e6eef6] bg-white shadow-card overflow-hidden">
          {/* Dark Navy Candidate Header Banner */}
          <div className="bg-[#092342] text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                {selectedCandidat.avatar_url ? (
                  <img
                    src={selectedCandidat.avatar_url}
                    alt={selectedCandidat.full_name}
                    className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/20 shadow-md"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0c685a] to-[#2dd4bf] text-white flex items-center justify-center text-xl font-extrabold ring-2 ring-white/20 shadow-md">
                    {selectedCandidat.initials}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-[#10b981] ring-2 ring-[#092342] flex items-center justify-center text-[10px] text-white font-extrabold">
                  ✓
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {selectedCandidat.full_name}
                  </h2>
                  <span className="rounded-lg bg-white/10 px-2.5 py-0.5 text-xs font-mono font-bold text-slate-300">
                    {selectedCandidat.ref}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300">
                  <span className="inline-flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    <span>{selectedCandidat.program}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    <span>{selectedCandidat.cities}</span>
                  </span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#2dd4bf]" />
                    <span>{selectedCandidat.adviser}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start md:self-center">
              <button
                onClick={() =>
                  onNotify(`Editing profile ${selectedCandidat.ref}...`)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 px-3.5 py-2 text-xs font-bold text-white transition"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
              <button
                onClick={() =>
                  onNotify(
                    `PDF Dossier summary generated for ${selectedCandidat.ref} (${selectedCandidat.full_name}).`
                  )
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f4be37] hover:bg-[#e5ae28] px-4 py-2 text-xs font-extrabold text-[#092342] shadow-sm transition"
              >
                <FolderDown className="w-3.5 h-3.5" />
                <span>PDF File</span>
              </button>
            </div>
          </div>

          {/* 4 Sub-navigation Tabs */}
          <div className="border-b border-slate-200 px-6 bg-[#f9fbfd] flex items-center gap-6 overflow-x-auto text-xs font-bold">
            {[
              { id: 1, label: '1. Personal Information & Contact' },
              { id: 2, label: '2. Academic Background' },
              { id: 3, label: '3. Study Project & Choices' },
              { id: 4, label: '4. Tracking & Admission', dot: true },
            ].map((tab) => {
              const isTabActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id)}
                  className={`py-3.5 border-b-2 whitespace-nowrap inline-flex items-center gap-1.5 transition ${
                    isTabActive
                      ? 'border-[#0c685a] text-[#0c685a] font-extrabold'
                      : 'border-transparent text-slate-500 hover:text-[#092342]'
                  }`}
                >
                  {tab.dot && <span className="h-2 w-2 rounded-full bg-[#0c685a]" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub-tab 1, 2, 3 quick summary banner if switched */}
          {activeSubTab !== 4 && (
            <div className="mx-6 mt-5 rounded-2xl border border-[#ccece2] bg-[#f2fbf8] p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              {activeSubTab === 1 && (
                <div className="space-y-1">
                  <div className="font-extrabold text-[#092342]">
                    Contact &amp; Civil Status — {selectedCandidat.full_name}
                  </div>
                  <div className="text-slate-600">
                    Email: <strong>{selectedCandidat.email}</strong> • Phone:{' '}
                    <strong>{selectedCandidat.phone}</strong> • Country:{' '}
                    <strong>{selectedCandidat.country}</strong> • Guarantor:{' '}
                    <strong>{selectedCandidat.garant_info}</strong>
                  </div>
                </div>
              )}
              {activeSubTab === 2 && (
                <div className="space-y-1">
                  <div className="font-extrabold text-[#092342]">
                    Curriculum &amp; Academic Certifications
                  </div>
                  <div className="text-slate-600">
                    Current Degree: <strong>{selectedCandidat.current_diploma}</strong> • Language
                    Test: <strong>{selectedCandidat.tcf_score}</strong>
                  </div>
                </div>
              )}
              {activeSubTab === 3 && (
                <div className="space-y-1">
                  <div className="font-extrabold text-[#092342]">
                    Study Project &amp; Pedagogical Alignment
                  </div>
                  <div className="text-slate-600">
                    Target Program: <strong>{selectedCandidat.program}</strong> • Cities:{' '}
                    <strong>{selectedCandidat.cities}</strong> • Mock Interview:{' '}
                    <strong>{selectedCandidat.interview_date}</strong>
                  </div>
                </div>
              )}
              <button
                onClick={() => setActiveSubTab(4)}
                className="rounded-lg bg-[#0c685a] text-white px-3 py-1.5 font-bold"
              >
                View Full Tracking ↓
              </button>
            </div>
          )}

          {/* Main Dossier Body */}
          <div className="p-6 space-y-6">
            {/* Section 1: Admission Pathway & Strategic Milestones */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-[#092342] leading-snug">
                    Admission Pathway &amp; Strategic
                    <br className="hidden sm:inline" /> Milestones
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Certified progression protocol by LIEC France 2025.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-center">
                  <span className="text-xs font-bold text-slate-600 leading-tight text-right">
                    Overall
                    <br />
                    Completion
                  </span>
                  <span className="rounded-xl bg-[#ccf5e5] px-3.5 py-1.5 text-base font-extrabold text-[#0c685a]">
                    {selectedCandidat.progress_pct}%
                  </span>
                </div>
              </div>

              {/* 4 Jalon Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
                {selectedCandidat.jalons.map((jalon: any) => {
                  const isActiveJalon = jalon.tone === 'active';
                  const isDoneJalon = jalon.tone === 'done';

                  return (
                    <div
                      key={jalon.num}
                      onClick={() => onAdvanceJalon(selectedCandidat.ref, jalon.num)}
                      title="Click to set as active milestone"
                      className={`cursor-pointer rounded-2xl p-4 flex flex-col justify-between transition ${
                        isActiveJalon
                          ? 'bg-[#082241] text-white shadow-md ring-2 ring-[#082241]'
                          : 'bg-[#f2f7fc] text-[#092342] border border-[#e3edf7] hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Icon + Status Pill */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              isDoneJalon
                                ? 'bg-[#0c685a] text-white'
                                : isActiveJalon
                                ? 'bg-[#f4be37] text-[#092342]'
                                : 'bg-white text-slate-500 border border-slate-200'
                            }`}
                          >
                            {jalon.num === 1 ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : jalon.num === 2 ? (
                              <RefreshCw className="w-4 h-4" />
                            ) : jalon.num === 3 ? (
                              <Send className="w-3.5 h-3.5" />
                            ) : (
                              <Plane className="w-3.5 h-3.5" />
                            )}
                          </span>

                          <span
                            className={`rounded-md px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider ${
                              isDoneJalon
                                ? 'bg-[#ccf5e5] text-[#0c685a]'
                                : isActiveJalon
                                ? 'bg-[#f4be37] text-[#092342]'
                                : 'bg-slate-200/80 text-slate-600'
                            }`}
                          >
                            {jalon.status}
                          </span>
                        </div>

                        <div
                          className={`text-[9.5px] font-extrabold uppercase tracking-wider ${
                            isActiveJalon ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {jalon.label}
                        </div>
                        <h4
                          className={`mt-0.5 text-sm font-extrabold leading-snug ${
                            isActiveJalon ? 'text-white' : 'text-[#092342]'
                          }`}
                        >
                          {jalon.title}
                        </h4>
                        <p
                          className={`mt-2 text-[11px] leading-relaxed ${
                            isActiveJalon ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {jalon.description}
                        </p>
                      </div>

                      <div
                        className={`mt-4 pt-2.5 border-t flex items-center gap-1.5 text-[10.5px] font-extrabold ${
                          isActiveJalon
                            ? 'border-white/10 text-[#6ee7b7]'
                            : isDoneJalon
                            ? 'border-slate-200/70 text-[#0c685a]'
                            : 'border-slate-200/70 text-slate-500'
                        }`}
                      >
                        {jalon.num === 1 ? (
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        ) : jalon.num === 2 ? (
                          <FileText className="w-3.5 h-3.5 shrink-0" />
                        ) : jalon.num === 3 ? (
                          <Calendar className="w-3.5 h-3.5 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                        )}
                        <span>{jalon.footer}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom 2-Column Split: Selected Academic Targets (Left) + Notes & Documents (Right) */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Left 7 cols: Selected Academic Targets */}
              <div className="xl:col-span-7 space-y-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#092342] leading-snug">
                      Selected Academic
                      <br />
                      Targets ({selectedCandidat.voeux.length})
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Universities and colleges audited by the LIEC educational engineering division.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewVoeuModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#e9f2fc] hover:bg-[#dce9f9] px-3.5 py-2 text-xs font-extrabold text-[#092342] transition shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span className="leading-tight text-left">
                      Add a
                      <br />
                      Target
                    </span>
                  </button>
                </div>

                {/* Vœux Cards List */}
                <div className="space-y-3">
                  {selectedCandidat.voeux.map((voeu: any, idx: number) => {
                    const logoBg =
                      voeu.codeBg === 'teal'
                        ? 'bg-[#0c685a] text-white'
                        : voeu.codeBg === 'amber'
                        ? 'bg-[#5c3a04] text-[#f4be37]'
                        : 'bg-[#092342] text-white';

                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-[#e6eef6] bg-white p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`h-11 w-11 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${logoBg}`}
                          >
                            {voeu.code}
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-sm font-extrabold text-[#092342] leading-snug">
                                {voeu.university}
                              </h4>
                              <span
                                className={`rounded-xl px-2.5 py-0.5 text-[10px] font-extrabold ${
                                  voeu.rankTone === 'mint'
                                    ? 'bg-[#6ee7b7] text-[#064e3b]'
                                    : 'bg-[#e9f1fa] text-[#092342]'
                                }`}
                              >
                                {voeu.rankBadge}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{voeu.program}</p>
                            <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span>{voeu.location}</span>
                              </span>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1">
                                {voeu.meta.includes('Frais') || voeu.meta.includes('Fee') ? (
                                  <Euro className="w-3.5 h-3.5 text-slate-400" />
                                ) : voeu.meta.includes('RNCP') || voeu.meta.includes('CGE') ? (
                                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <span>{voeu.meta}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10.5px] font-extrabold ${
                              voeu.statusTone === 'green'
                                ? 'bg-[#0c685a] text-white'
                                : voeu.statusTone === 'gold'
                                ? 'bg-[#f8dca0] text-[#5c3a04]'
                                : 'bg-[#e6effa] text-[#092342]'
                            }`}
                          >
                            {voeu.statusTone === 'green' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : voeu.statusTone === 'gold' ? (
                              <Wrench className="w-3 h-3" />
                            ) : (
                              <Flag className="w-3 h-3" />
                            )}
                            <span>{voeu.statusBadge}</span>
                          </span>
                          <div className="mt-1 text-[10px] text-slate-500 font-medium">
                            {voeu.statusSub}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* LIEC Project Validation Trial Card */}
                <div className="rounded-2xl bg-[#f1f7fd] border border-[#e1ecf8] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-2xl bg-[#6ee7b7] text-[#064e3b] flex items-center justify-center shrink-0">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-[#092342]">
                        LIEC Project Validation Trial
                      </h4>
                      <p className="mt-0.5 text-[11px] text-slate-500 leading-relaxed">
                        Simulated admissions panel mock interview scheduled for{' '}
                        {selectedCandidat.interview_date}.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onNotify(
                        `Video meeting invite sent to ${selectedCandidat.full_name} for the mock interview.`
                      )
                    }
                    className="rounded-xl bg-[#0c685a] hover:bg-[#095247] px-4 py-2 text-xs font-extrabold text-white shrink-0 transition"
                  >
                    Schedule Video Call
                  </button>
                </div>
              </div>

              {/* Right 5 cols: Academic Notes & Journal + Verified Documents */}
              <div className="xl:col-span-5 space-y-6">
                {/* Academic Notes & Journal */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-[#092342]" />
                      <h3 className="text-sm font-extrabold text-[#092342] leading-tight">
                        Academic Notes
                        <br />
                        &amp; Journal
                      </h3>
                    </div>
                    <span className="text-[10.5px] font-bold text-slate-500 text-right leading-tight">
                      LIEC
                      <br />
                      Private
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {selectedCandidat.notes.map((n: any, idx: number) => (
                      <div key={idx} className="rounded-2xl bg-[#f3f7fc] p-3.5 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`font-extrabold text-[11px] ${
                              n.author.includes('Système') || n.author.includes('System')
                                ? 'text-[#0c685a]'
                                : 'text-[#092342]'
                            }`}
                          >
                            {n.author}
                          </span>
                          <span className="text-[10px] text-slate-500 shrink-0">{n.date}</span>
                        </div>
                        <p className="mt-1.5 text-[11.5px] text-slate-600 leading-relaxed">
                          {n.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Form: Add internal follow-up note */}
                  <form onSubmit={handleSaveNote} className="space-y-2.5 pt-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">
                      ADD INTERNAL FOLLOW-UP NOTE
                    </div>
                    <textarea
                      id="cand-note-input"
                      rows={3}
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Write an observation, jury instruction, or consular reminder..."
                      className="w-full rounded-2xl bg-[#f1f6fb] p-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#092342]/20"
                    />
                    <div className="flex items-center justify-between gap-2">
                      <label className="inline-flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notifySarah}
                          onChange={(e) => setNotifySarah(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-[#0c685a] focus:ring-[#0c685a]"
                        />
                        <span className="leading-tight">
                          Notify
                          <br />
                          Sarah Mwamba
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="rounded-xl bg-[#092342] hover:bg-[#12365a] px-4 py-2 text-xs font-extrabold text-white transition"
                      >
                        Save Note
                      </button>
                    </div>
                  </form>
                </div>

                {/* Verified Supporting Documents */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <h3 className="text-sm font-extrabold text-[#092342] leading-snug">
                    Verified Supporting
                    <br />
                    Documents
                  </h3>

                  <div className="space-y-2">
                    {selectedCandidat.pieces.map((piece: any, idx: number) => {
                      const isValid = piece.status === 'valid';
                      return (
                        <div
                          key={idx}
                          onClick={() => onTogglePiece(selectedCandidat.ref, idx)}
                          title="Click to toggle validation status"
                          className="cursor-pointer rounded-xl bg-[#f2f7fc] hover:bg-[#e8f1fb] p-3 flex items-center justify-between gap-2 transition"
                        >
                          <div className="flex items-center gap-2.5">
                            {isValid ? (
                              <CheckCircle2 className="w-4 h-4 text-[#0c685a] shrink-0" />
                            ) : (
                              <Clock className="w-4 h-4 text-[#d97706] shrink-0" />
                            )}
                            <span className="text-xs font-extrabold text-[#092342] leading-tight">
                              {piece.name}
                            </span>
                          </div>
                          <span
                            className={`text-[10.5px] font-bold text-right shrink-0 ${
                              isValid ? 'text-slate-500' : 'text-[#0c685a]'
                            }`}
                          >
                            {piece.meta}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Candidate */}
      {showNewCandidatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#092342]">Open New Candidate Dossier</h3>
              <button
                onClick={() => setShowNewCandidatModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateCandSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                <input
                  type="text"
                  required
                  value={newCandName}
                  onChange={(e) => setNewCandName(e.target.value)}
                  placeholder="Ex: Samuel MBEMBA"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Partner School in Lyon &amp; Specialty *
                </label>
                <select
                  value={newCandProgram}
                  onChange={(e) => setNewCandProgram(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5"
                >
                  <option value="ISCOM Lyon — Communication, advertising, marketing and events">
                    1. ISCOM Lyon — Communication, advertising, marketing &amp; events
                  </option>
                  <option value="MyDigitalSchool Lyon — Web development, digital creation, webmarketing & UX/UI">
                    2. MyDigitalSchool Lyon — Web dev, digital, webmarketing &amp; UX/UI
                  </option>
                  <option value="École Internationale Tunon Lyon — Tourism, hospitality, PR and events">
                    3. École Internationale Tunon Lyon — Tourism, hospitality, PR &amp; events
                  </option>
                  <option value="IHECF Lyon — Accounting, auditing, finance and management control">
                    4. IHECF Lyon — Accounting, auditing, finance &amp; control
                  </option>
                  <option value="Ipac Bachelor Factory Lyon — Business, management, finance & logistics">
                    5. Ipac Bachelor Factory Lyon — Business, management, finance &amp; logistics
                  </option>
                  <option value="MBway Lyon — Management, entrepreneurship, HR, finance & international business">
                    6. MBway Lyon — Management, entrepreneurship, HR, finance &amp; int. business
                  </option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Host City</label>
                  <input
                    type="text"
                    readOnly
                    value="Lyon (Exclusive)"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Country of Origin *</label>
                  <select
                    value={newCandCountry}
                    onChange={(e) => setNewCandCountry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                  >
                    <option value="RDC (Kinshasa)">🇨🇩 DRC (Kinshasa)</option>
                    <option value="RDC (Lubumbashi)">🇨🇩 DRC (Lubumbashi)</option>
                    <option value="RDC (Goma)">🇨🇩 DRC (Goma)</option>
                    <option value="Congo-Brazzaville (Brazzaville)">
                      🇨🇬 Congo-Brazzaville (Brazzaville)
                    </option>
                    <option value="Congo-Brazzaville (Pointe-Noire)">
                      🇨🇬 Congo-Brazzaville (Pointe-Noire)
                    </option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCandidatModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#092342] text-white px-5 py-2 font-extrabold"
                >
                  Create Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Target (Academic Choice) */}
      {showNewVoeuModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-elevated space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold text-[#092342]">
                Add Academic Target ({selectedCandidat.full_name})
              </h3>
              <button
                onClick={() => setShowNewVoeuModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddVoeuSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Partner School in Lyon *
                </label>
                <select
                  value={voeuUniv}
                  onChange={(e) => {
                    const school = e.target.value;
                    setVoeuUniv(school);
                    if (school.includes('ISCOM')) {
                      setVoeuCode('ISCO');
                      setVoeuProg('Communication, advertising, marketing and events');
                    } else if (school.includes('MyDigitalSchool')) {
                      setVoeuCode('MDS');
                      setVoeuProg(
                        'Web development, digital creation, webmarketing and UX/UI design'
                      );
                    } else if (school.includes('Tunon')) {
                      setVoeuCode('TUNO');
                      setVoeuProg(
                        'Tourism, hospitality, public relations and events'
                      );
                    } else if (school.includes('IHECF')) {
                      setVoeuCode('IHEC');
                      setVoeuProg(
                        'Accounting, auditing, finance and management control'
                      );
                    } else if (school.includes('Ipac')) {
                      setVoeuCode('IPAC');
                      setVoeuProg(
                        'Business, management, finance, communication and logistics'
                      );
                    } else if (school.includes('MBway')) {
                      setVoeuCode('MBW');
                      setVoeuProg(
                        'Management, entrepreneurship, human resources, finance and international business'
                      );
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                >
                  <option value="ISCOM Lyon">1. ISCOM Lyon</option>
                  <option value="MyDigitalSchool Lyon">2. MyDigitalSchool Lyon</option>
                  <option value="École Internationale Tunon Lyon">
                    3. École Internationale Tunon Lyon
                  </option>
                  <option value="IHECF Lyon">4. IHECF Lyon</option>
                  <option value="Ipac Bachelor Factory Lyon">5. Ipac Bachelor Factory Lyon</option>
                  <option value="MBway Lyon">6. MBway Lyon</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Major &amp; Study Areas *
                </label>
                <input
                  type="text"
                  required
                  value={voeuProg}
                  onChange={(e) => setVoeuProg(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campus</label>
                <input
                  type="text"
                  readOnly
                  value="Lyon Campus"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-bold"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewVoeuModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0c685a] text-white px-5 py-2 font-extrabold"
                >
                  Add Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
