import React from 'react';
import { useAuth } from '../context/AuthContext';
import HamburgerMenu from './HamburgerMenu';
import './Header.css';

const Header = ({ onOpenAuth, onOpenAdmin, categories, activeCategory, onSelectCategory }) => {
  const { user, profile } = useAuth();

  return (
    <header className="app-header">
      <nav className="header-nav">
        {/* Brand */}
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
          <div className="nav-brand-group">
            <span className="nav-brand">CaliAsistente</span>
            <span className="nav-sub">Cali, Colombia 🛡️ Verificados</span>
          </div>
        </div>

        {/* Right side */}
        <div className="nav-right">
          {user ? (
            <>
              {profile?.role === 'admin' && (
                <button className="admin-nav-btn" onClick={onOpenAdmin}>⚙️</button>
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
    </header>
  );
};

export default Header;
