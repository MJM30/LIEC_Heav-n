'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TestAccount {
  roleKey: 'admin' | 'secretary' | 'avi';
  name: string;
  roleLabel: string;
  email: string;
  desc: string;
  badgeTone: string;
  badgeColor: string;
  borderActive: string;
}

const TEST_ACCOUNTS: TestAccount[] = [
  {
    roleKey: 'admin',
    name: 'Sarah Mwamba',
    roleLabel: 'Administrateur',
    email: 'sarah.mwamba@liec-education.com',
    desc: 'Accès total + Gestion de rôles',
    badgeTone: '#e7faff',
    badgeColor: '#007da7',
    borderActive: '#00bff3',
  },
  {
    roleKey: 'secretary',
    name: 'Marc Kouassi',
    roleLabel: 'Secrétaire',
    email: 'marc.kouassi@liec-education.com',
    desc: 'Admissions, Prospects & PREPA',
    badgeTone: '#eafbf4',
    badgeColor: '#0c685a',
    borderActive: '#00d2bd',
  },
  {
    roleKey: 'avi',
    name: 'Alain Kanza',
    roleLabel: 'Officier AVI',
    email: 'alain.kanza@liec-education.com',
    desc: 'Guichet AVI & Rapports stats',
    badgeTone: '#fff9e6',
    badgeColor: '#8f6500',
    borderActive: '#a2df35',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('sarah.mwamba@liec-education.com');
  const [password, setPassword] = useState('LiecAdmin2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectAccount = (acc: TestAccount) => {
    setEmail(acc.email);
    setPassword('LiecAdmin2025!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, remember }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        localStorage.setItem('liec_user', JSON.stringify(data.user));
        localStorage.setItem('liec_role', data.user.role);
        router.push('/');
      } else {
        setError(data.error || 'Identifiants invalides.');
      }
    } catch {
      // Fallback local en cas d'indisponibilité réseau
      const lower = email.trim().toLowerCase();
      let matchedRole: 'admin' | 'secretary' | 'avi' = 'admin';
      let matchedName = 'Sarah Mwamba';
      let matchedTitle = 'Administrateur / Conseillère Senior';

      if (lower.includes('marc') || lower.includes('secretary') || lower.includes('secretaire')) {
        matchedRole = 'secretary';
        matchedName = 'Marc Kouassi';
        matchedTitle = 'Secrétaire Orientation & Admissions';
      } else if (lower.includes('alain') || lower.includes('avi') || lower.includes('kanza')) {
        matchedRole = 'avi';
        matchedName = 'Alain Kanza';
        matchedTitle = 'Officier Financement AVI';
      }

      const fallbackUser = {
        id: 1,
        name: matchedName,
        email,
        role: matchedRole,
        title: matchedTitle,
        initials: matchedName.split(' ').map((n) => n[0]).join(''),
      };

      localStorage.setItem('liec_user', JSON.stringify(fallbackUser));
      localStorage.setItem('liec_role', fallbackUser.role);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --blue: #00bff3;
          --blue-dark: #007da7;
          --teal: #00d2bd;
          --lime: #a2df35;
          --ink: #17212d;
          --muted: #64748b;
          --line: #dfe7ee;
          --bg: #f5f9fc;
        }
        * { box-sizing: border-box; }
        .login-body-wrapper {
          margin: 0;
          min-height: 100vh;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          color: var(--ink);
          background: var(--bg);
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
        }
        .left {
          padding: 40px 8%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: #fff;
          position: relative;
          overflow: hidden;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          width: max-content;
          position: relative;
          z-index: 1;
        }
        .logo {
          width: 62px;
          height: 62px;
          object-fit: contain;
        }
        .wordmark {
          font-weight: 900;
          font-size: 20px;
          letter-spacing: -1px;
          display: flex;
          line-height: 1;
        }
        .wordmark span:nth-child(1) { color: #a2df35; }
        .wordmark span:nth-child(2) { color: #00bff3; }
        .wordmark span:nth-child(3) { color: #00bfae; }
        .wordmark span:nth-child(4) { color: #00bff3; }
        .brand-copy strong {
          display: block;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .brand-copy small {
          font-size: 11px;
          color: var(--muted);
        }
        .hero {
          max-width: 540px;
          position: relative;
          z-index: 1;
          padding: 45px 0;
        }
        .eyebrow {
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          font-weight: 800;
          color: var(--blue-dark);
        }
        .hero h1 {
          font-size: clamp(30px, 4vw, 50px);
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin: 16px 0;
          color: var(--ink);
          font-weight: 900;
        }
        .hero h1 em {
          font-style: normal;
          color: #00a9c9;
        }
        .hero p {
          font-size: 15px;
          line-height: 1.7;
          color: #64748b;
          max-width: 440px;
        }
        .feature-list {
          display: grid;
          gap: 13px;
          margin-top: 28px;
        }
        .feature {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: #405069;
        }
        .feature-icon {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: #e7faff;
          color: #007da7;
          font-size: 16px;
        }
        .left-foot {
          color: #93a0b2;
          font-size: 11px;
          position: relative;
          z-index: 1;
        }
        .decoration {
          position: absolute;
          width: 430px;
          height: 430px;
          border-radius: 50%;
          border: 42px solid #e7faff;
          right: -220px;
          bottom: -180px;
          pointer-events: none;
        }
        .right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 36px 28px;
          background: linear-gradient(145deg, #eafaff, #f7fffd 65%, #f5ffe9);
        }
        .login-card {
          width: min(94%, 680px);
          background: white;
          border: 1px solid #e4edf2;
          border-radius: 22px;
          padding: 44px;
          box-shadow: 0 24px 70px rgba(20, 65, 90, 0.10);
        }
        .mobile-brand {
          display: none;
          margin-bottom: 28px;
        }
        .login-card h2 {
          font-size: 24px;
          letter-spacing: -0.5px;
          margin: 0 0 8px;
          font-weight: 800;
          color: var(--ink);
        }
        .sub {
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
          margin: 0 0 26px;
        }
        .field {
          display: grid;
          gap: 8px;
          margin-bottom: 17px;
        }
        label {
          font-size: 12px;
          font-weight: 700;
          color: #42516a;
        }
        input {
          width: 100%;
          border: 1px solid #d9e2eb;
          border-radius: 10px;
          padding: 13px 14px;
          font: 14px Arial, Helvetica, sans-serif;
          outline: none;
          background: #fff;
          color: #17212d;
        }
        input:focus {
          border-color: var(--blue);
          box-shadow: 0 0 0 3px rgba(0, 191, 243, 0.12);
        }
        .password-wrap {
          position: relative;
        }
        .password-wrap input {
          padding-right: 72px;
        }
        .show-pass {
          position: absolute;
          right: 10px;
          top: 10px;
          border: 0;
          background: transparent;
          color: #007da7;
          font-weight: 700;
          font-size: 11px;
          padding: 6px;
          cursor: pointer;
        }
        .row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin: 4px 0 22px;
          font-size: 11px;
          color: var(--muted);
        }
        .remember {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
        }
        .remember input {
          width: 14px;
          height: 14px;
          accent-color: var(--blue);
          cursor: pointer;
        }
        a {
          color: #007da7;
          text-decoration: none;
          font-weight: 700;
        }
        a:hover {
          text-decoration: underline;
        }
        .submit {
          width: 100%;
          border: 0;
          border-radius: 10px;
          padding: 14px;
          background: var(--blue);
          color: #00364a;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 7px 16px rgba(0, 191, 243, 0.16);
          transition: background 0.15s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .submit:hover {
          background: #36cdf6;
        }
        .submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #9aa7b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin: 22px 0 16px;
        }
        .divider:before, .divider:after {
          content: "";
          height: 1px;
          background: #e8edf2;
          flex: 1;
        }
        .demo-note {
          background: #f3fbff;
          border: 1px solid #d9f4ff;
          border-radius: 10px;
          padding: 12px;
          color: #557187;
          font-size: 11px;
          line-height: 1.55;
          margin-top: 18px;
        }
        .error {
          background: #fff1f2;
          border: 1px solid #ffd7dc;
          color: #a52d3b;
          border-radius: 9px;
          padding: 10px;
          margin-bottom: 14px;
          font-size: 11px;
        }
        .role-cards-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 6px;
        }
        .role-card {
          border: 1.5px solid #e4edf2;
          border-radius: 12px;
          padding: 12px 10px;
          text-align: left;
          background: #fafcfe;
          cursor: pointer;
          transition: all 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .role-card:hover {
          background: #fff;
          border-color: #00bff3;
          box-shadow: 0 4px 12px rgba(0, 191, 243, 0.08);
        }
        .role-card.active {
          border-color: #00bff3;
          background: #f0faff;
          box-shadow: 0 0 0 2px rgba(0, 191, 243, 0.2);
        }
        .role-badge {
          display: inline-block;
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 6px;
          border-radius: 6px;
          width: max-content;
        }
        .role-name {
          font-size: 12px;
          font-weight: 800;
          color: #17212d;
          margin-top: 2px;
        }
        .role-desc {
          font-size: 10px;
          color: #64748b;
          line-height: 1.35;
        }
        @media (max-width: 850px) {
          .login-body-wrapper {
            grid-template-columns: 1fr;
          }
          .left {
            display: none;
          }
          .right {
            min-height: 100vh;
            padding: 20px 14px;
          }
          .login-card {
            padding: 27px 22px;
          }
          .mobile-brand {
            display: flex;
          }
          .role-cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}} />

      <div className="login-body-wrapper">
        {/* Left Branding Column */}
        <section className="left">
          <Link href="/" className="brand" aria-label="LIEC One home">
            <img className="logo" src="/logo_LIEC.jpeg" alt="LIEC logo" />
            <div>
              <div className="wordmark">
                <span>L</span>
                <span>I</span>
                <span>E</span>
                <span>C</span>
              </div>
              <div className="brand-copy">
                <strong>LIEC One</strong>
                <small>Education management</small>
              </div>
            </div>
          </Link>

          <div className="hero">
            <div className="eyebrow">LIEC ONE · EDUCATION MANAGEMENT</div>
            <h1>
              Helping students build their <em>future.</em>
            </h1>
            <p>
              A single workspace to coordinate student admissions, training, finances and international student services.
            </p>

            <div className="feature-list">
              <div className="feature">
                <span className="feature-icon">♙</span> Student records and admissions tracking
              </div>
              <div className="feature">
                <span className="feature-icon">▣</span> LIEC education consulting and PREPA training management
              </div>
              <div className="feature">
                <span className="feature-icon">⌂</span> International services and partner requests
              </div>
            </div>
          </div>

          <div className="left-foot">
            © 2026 LIEC One · Secure workspace for authorized staff
          </div>
          <div className="decoration" />
        </section>

        {/* Right Authentication Form Column */}
        <section className="right">
          <div className="login-card">
            <Link href="/" className="brand mobile-brand" aria-label="LIEC One home">
              <img className="logo" src="/logo_LIEC.jpeg" alt="LIEC logo" />
              <div>
                <div className="wordmark">
                  <span>L</span>
                  <span>I</span>
                  <span>E</span>
                  <span>C</span>
                </div>
                <div className="brand-copy">
                  <strong>LIEC One</strong>
                  <small>Education management</small>
                </div>
              </div>
            </Link>

            <h2>Welcome back</h2>
            <p className="sub">Sign in to your LIEC One workspace.</p>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="email">Work email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@liec.example"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <div className="password-wrap">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    className="show-pass"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="row">
                <label className="remember">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setError('Veuillez contacter l’administrateur système LIEC pour réinitialiser vos identifiants.');
                  }}
                >
                  Forgot password?
                </a>
              </div>

              <button className="submit" type="submit" disabled={loading}>
                <span>{loading ? 'Authenticating...' : 'Sign in'}</span>
                <span aria-hidden="true">→</span>
              </button>
            </form>

            <div className="divider">COMPTES DE TEST AUTORISÉS</div>

            <div className="role-cards-grid">
              {TEST_ACCOUNTS.map((acc) => {
                const isSelected = email.toLowerCase() === acc.email.toLowerCase();
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => selectAccount(acc)}
                    className={`role-card ${isSelected ? 'active' : ''}`}
                    title={`Se connecter en tant que ${acc.roleLabel}`}
                  >
                    <span
                      className="role-badge"
                      style={{ background: acc.badgeTone, color: acc.badgeColor }}
                    >
                      {acc.roleLabel}
                    </span>
                    <div className="role-name">{acc.name}</div>
                    <div className="role-desc">{acc.desc}</div>
                  </button>
                );
              })}
            </div>

            <div className="demo-note">
              <strong>Espace sécurisé par rôle :</strong> Cliquez sur l'un des trois comptes ci-dessus pour préremplir votre identifiant et tester les permissions par rôle dans le workspace LIEC One.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
