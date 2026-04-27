import React from 'react';
import { useAuth } from '../context/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

const Header = ({ onOpenAuth, onOpenAdmin, categories, activeCategory, onSelectCategory }) => {
  const { user, profile } = useAuth();

  return (
    <header className="app-header">

      {/* ── NAV BAR: icon only on the left ── */}
      <nav className="header-nav">
        <div className="nav-logo">
          <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="url(#lg1)"/>
            <path d="M14 28C14 22 18 16 24 16C30 16 34 22 34 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="30" r="3" fill="white"/>
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#1d4ed8"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <button className="admin-nav-btn" onClick={onOpenAdmin} title="Panel de administración">⚙️</button>
              )}
              <div className="nav-user-avatar" title={profile?.display_name || user.email}>
                {(profile?.display_name || user.email || '?').charAt(0).toUpperCase()}
              </div>
            </>
          ) : (
            <div className="nav-auth-btns">
              <button className="nav-login-btn" onClick={() => onOpenAuth('login')}>Entrar</button>
              <button className="nav-provider-btn" onClick={() => onOpenAuth('provider')}>🛠️ Soy Prestador</button>
            </div>
          )}
          <HamburgerMenu
            onOpenAuth={onOpenAuth}
            onOpenAdmin={onOpenAdmin}
            categories={categories}
            activeCategory={activeCategory}
            onSelectCategory={onSelectCategory}
          />
        </div>
      </nav>

      {/* ── HERO: título, tagline, frase y badge ── */}
      <div className="hero-section">
        <div className="hero-brand">
          <svg width="52" height="52" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="url(#lgHero)"/>
            <path d="M14 28C14 22 18 16 24 16C30 16 34 22 34 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="30" r="3" fill="white"/>
            <defs>
              <linearGradient id="lgHero" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#1d4ed8"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <h1 className="hero-title">CaliAsistente</h1>
          <p className="hero-tagline">El asistente para tus tareas del hogar</p>
        </div>

        <p className="hero-quote">Expertos de confianza a un clic.</p>

        <div className="hero-badge">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"/>
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          Todos los prestadores pasan por nuestro sistema riguroso de verificación de identidad
        </div>
      </div>

    </header>
  );
};

export default Header;
