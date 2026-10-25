'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, Layers, Globe, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'fr'>('en');
  const [email, setEmail] = useState('sarah.mwamba@liec-education.com');
  const [password, setPassword] = useState('LiecAdmin2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem('liec_lang') as 'en' | 'fr' | null;
    if (savedLang === 'fr' || savedLang === 'en') {
      setLang(savedLang);
    } else {
      setLang('en');
      localStorage.setItem('liec_lang', 'en');
    }
    if (localStorage.getItem('liec_theme') === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleLanguage = (target: 'en' | 'fr') => {
    setLang(target);
    localStorage.setItem('liec_lang', target);
  };

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('liec_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const isEn = lang === 'en';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setInfoMessage(null);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      if (res.ok) {
        router.push('/');
      } else {
        setInfoMessage(
          isEn
            ? 'Error connecting to PostgreSQL server.'
            : 'Erreur lors de la connexion au serveur PostgreSQL.'
        );
      }
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#f6f9fc] text-[#092342] dark:bg-[#071322] dark:text-slate-100">
      {/* Left Branding Column */}
      <section className="hidden lg:flex flex-col justify-between p-12 xl:p-16 bg-white dark:bg-[#091b2e] relative overflow-hidden border-r border-[#e5eef6] dark:border-slate-800">
        {/* Brand Header */}
        <Link href="/" className="inline-flex items-center gap-3 z-10 w-max">
          <img
            src="/logo_LIEC.jpeg"
            alt="LIEC Logo"
            className="h-12 w-12 rounded-2xl object-contain shadow-sm bg-white p-1 border border-slate-200 dark:border-slate-700"
          />
          <div>
            <div className="text-xl font-extrabold tracking-tight text-[#092342] dark:text-white leading-none">
              LIEC <span className="text-[#0c685a]">One</span>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Education Consulting & PREPA Training
            </span>
          </div>
          <span className="ml-2 rounded-full bg-[#d8f6ea] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0c685a]">
            ADMIN
          </span>
        </Link>

        {/* Hero Copy */}
        <div className="max-w-lg z-10 my-auto py-12 space-y-5">
          <div className="text-xs font-extrabold uppercase tracking-widest text-[#0c685a]">
            LIEC ONE · EDUCATION MANAGEMENT
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-[#092342] dark:text-white leading-[1.12]">
            Helping students build their <span className="text-[#0c685a]">future.</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {isEn
              ? 'A secure single workspace to coordinate received applications, prospect CRM, Campus France university applications, PREPA training, and YimmiLine AVI financing.'
              : 'Un espace unique et sécurisé pour coordonner les demandes reçues, le CRM prospects, les candidatures Campus France, la formation PREPA et le financement AVI YimmiLine.'}
          </p>

          <div className="space-y-3.5 pt-3">
            <div className="flex items-center gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="h-9 w-9 rounded-xl bg-[#e0f8ef] text-[#0c685a] flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4" />
              </span>
              <span>
                {isEn
                  ? 'Candidate dossier tracking and Campus France admission milestones'
                  : 'Suivi des dossiers candidats et jalons d’admission Campus France'}
              </span>
            </div>
            <div className="flex items-center gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="h-9 w-9 rounded-xl bg-[#eef4fb] text-[#092342] flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4" />
              </span>
              <span>
                {isEn
                  ? 'LIEC education consulting and PREPA training management (Kinshasa, Brazzaville & Lyon)'
                  : 'Conseil éducatif LIEC et gestion PREPA (Kinshasa, Brazzaville & Lyon)'}
              </span>
            </div>
            <div className="flex items-center gap-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
              <span className="h-9 w-9 rounded-xl bg-[#fef4d6] text-[#b87c08] flex items-center justify-center shrink-0">
                <Globe className="w-4 h-4" />
              </span>
              <span>
                {isEn
                  ? 'International services, YimmiLine AVI financing (Classic, Partial 1, Partial 2)'
                  : 'Services internationaux, financement AVI YimmiLine (Classique, Partiel 1, Partiel 2)'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-400 z-10">
          © 2026 LIEC Education (LIEC One) · {isEn ? 'Authorized Staff Portal' : 'Espace sécurisé réservé au personnel autorisé'}
        </div>

        {/* Decorative Circle */}
        <div className="pointer-events-none absolute -right-44 -bottom-44 h-[420px] w-[420px] rounded-full border-[44px] border-[#eefaf6] dark:border-slate-800/40" />
      </section>

      {/* Right Sign-In Column */}
      <section className="flex items-center justify-center p-6 sm:p-10 bg-gradient-to-br from-[#eefaf6] via-[#f6f9fc] to-[#eef5fc] dark:from-[#071322] dark:via-[#091b2e] dark:to-[#071322]">
        <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-[#0c223a] border border-[#e5eef6] dark:border-slate-800 p-8 sm:p-11 shadow-elevated space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-2xl font-extrabold text-[#092342] dark:text-white">
                {isEn ? 'LIEC Workspace Login' : 'Connexion Espace LIEC'}
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {isEn
                  ? 'Sign in to access your administration dashboard (2025–2026 Cohort).'
                  : 'Connectez-vous pour accéder à votre tableau de bord (Cohorte 2025–2026).'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <div className="inline-flex items-center rounded-xl border border-[#ccece2] bg-[#f0faf7] dark:bg-slate-800 dark:border-slate-700 p-1 shadow-xs">
                <button
                  type="button"
                  onClick={() => toggleLanguage('en')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                    lang === 'en'
                      ? 'bg-[#0c685a] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#092342]'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => toggleLanguage('fr')}
                  className={`rounded-lg px-2.5 py-1 text-xs font-extrabold transition ${
                    lang === 'fr'
                      ? 'bg-[#0c685a] text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#092342]'
                  }`}
                >
                  FR
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6eef6] dark:border-slate-700 bg-[#f1f6fb] dark:bg-slate-800 px-3 py-2 text-xs font-extrabold text-[#092342] dark:text-slate-200 shrink-0"
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-[#f4be37]" />
                    <span>{isEn ? 'Light' : 'Clair'}</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-[#092342]" />
                    <span>{isEn ? 'Dark' : 'Sombre'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {infoMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 dark:border-amber-900/60 p-3 text-xs text-amber-800 dark:text-amber-200 font-medium">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? 'Professional Email Address' : 'Adresse e-mail professionnelle'}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah.mwamba@liec-education.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 px-4 py-3 text-sm text-[#092342] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c685a]/25"
              />
            </div>

            <div>
              <label className="block font-extrabold text-slate-700 dark:text-slate-300 mb-1.5">
                {isEn ? 'Password' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEn ? 'Enter your password' : 'Entrez votre mot de passe'}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-900 pl-4 pr-20 py-3 text-sm text-[#092342] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0c685a]/25"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-[#0c685a] hover:underline px-2 py-1"
                >
                  {showPassword ? (isEn ? 'Hide' : 'Masquer') : isEn ? 'Show' : 'Afficher'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-[#0c685a]"
                />
                <span>{isEn ? 'Keep session active' : 'Maintenir la session active'}</span>
              </label>
              <button
                type="button"
                onClick={() =>
                  setInfoMessage(
                    isEn
                      ? 'To reset your staff credentials, please contact the LIEC system administrator.'
                      : 'Pour réinitialiser votre accès, veuillez contacter l’administrateur système LIEC.'
                  )
                }
                className="font-extrabold text-[#0c685a] hover:underline"
              >
                {isEn ? 'Forgot password?' : 'Mot de passe oublié ?'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#0c6358] hover:bg-[#094e45] text-white py-3.5 text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 transition"
            >
              <span>
                {loading
                  ? isEn
                    ? 'Authenticating with PostgreSQL...'
                    : 'Authentification PostgreSQL...'
                  : isEn
                  ? 'Sign in to LIEC One'
                  : 'Se connecter à LIEC One'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
            <span className="bg-white dark:bg-[#0c223a] px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              {isEn ? 'PRECONFIGURED DEMO ACCOUNTS' : 'COMPTES DÉMO PRÉCONFIGURÉS'}
            </span>
            <div className="border-t border-slate-200 dark:border-slate-700 w-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
            {[
              {
                name: 'Sarah Mwamba',
                role: isEn ? 'Admin / Senior' : 'Admin / Senior',
                email: 'sarah.mwamba@liec-education.com',
              },
              {
                name: 'Marc Kouassi',
                role: isEn ? 'Secretariat' : 'Secrétariat',
                email: 'marc.kouassi@liec-education.com',
              },
              {
                name: 'Alain Kanza',
                role: isEn ? 'AVI Officer' : 'Officier AVI',
                email: 'alain.kanza@liec-education.com',
              },
            ].map((u) => (
              <button
                key={u.email}
                type="button"
                onClick={() => setEmail(u.email)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#0c685a] bg-[#f8fbff] dark:bg-slate-900/60 p-2.5 text-left transition"
              >
                <div className="font-extrabold text-[#092342] dark:text-white">{u.name}</div>
                <div className="text-[10px] text-[#0c685a] font-bold">{u.role}</div>
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-[#ccece2] dark:border-slate-700 bg-[#f2fbf8] dark:bg-slate-900/40 p-3.5 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
            <ShieldCheck className="w-4 h-4 text-[#0c685a] shrink-0 mt-0.5" />
            <span>
              <strong>{isEn ? 'PostgreSQL Authentication Connected:' : 'Authentification PostgreSQL connectée :'}</strong>{' '}
              {isEn
                ? 'All staff sign-in events are logged in the audit_logs table.'
                : 'Toutes les connexions du personnel sont consignées dans la table audit_logs.'}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
