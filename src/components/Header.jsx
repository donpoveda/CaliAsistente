import React from 'react';
import { useAuth } from '../context/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

const Header = ({ onOpenAuth, onOpenAdmin, categories, activeCategory, onSelectCategory }) => {
  const { user, profile } = useAuth();

  return (
    <header className="app-header">
      {/* Top navigation bar */}
      <nav className="header-nav">
        <div className="nav-logo">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <circle cx="24" cy="24" r="24" fill="url(#logoGrad2)"/>
            <path d="M14 28C14 22 18 16 24 16C30 16 34 22 34 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="30" r="3" fill="white"/>
            <defs>
              <linearGradient id="logoGrad2" x1="0" y1="0" x2="48" y2="48">
                <stop offset="0%" stopColor="#1d4ed8"/>
                <stop offset="100%" stopColor="#3b82f6"/>
              </linearGradient>
            </defs>
          </svg>
          <span className="nav-brand">CaliAsistente</span>
        </div>

        <div className="nav-right">
          {user ? (
            <div className="nav-user">
              {profile?.role === 'admin' && (
                <button className="admin-nav-btn" onClick={onOpenAdmin} title="Panel de administración">
                  ⚙️ Admin
                </button>
              )}
              <div className="nav-user-avatar">
                {(profile?.display_name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <span className="nav-user-name">{profile?.display_name || user.email?.split('@')[0]}</span>
            </div>
          ) : (
            <div className="nav-auth-btns">
              <button className="nav-login-btn" onClick={() => onOpenAuth('login')}>Entrar</button>
              <button className="nav-register-btn nav-register-main" onClick={() => onOpenAuth('provider')}>
                🛠️ Soy Prestador
              </button>
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

      {/* Hero section */}
      <div className="hero-section">
        <div className="logo-area">
          <div className="logo-icon">
            <svg width="56" height="56" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="24" fill="url(#logoGradHero)"/>
              <path d="M14 28C14 22 18 16 24 16C30 16 34 22 34 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="30" r="3" fill="white"/>
              <path d="M20 30L24 27L28 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="logoGradHero" x1="0" y1="0" x2="48" y2="48">
                  <stop offset="0%" stopColor="#1d4ed8"/>
                  <stop offset="100%" stopColor="#3b82f6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="title">CaliAsistente</h1>
            <p className="tagline">Servicios confiables para tu ciudad</p>
          </div>
        </div>
        <p className="trust-phrase">
          <span className="trust-quote">"Tu opinión construye la confianza de nuestra ciudad."</span>
        </p>
        <div className="verification-notice">
          <svg className="shield-icon" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="currentColor"/>
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Todos los prestadores han pasado por nuestro sistema riguroso de verificación de identidad
        </div>
      </div>
    </header>
  );
};

export default Header;
