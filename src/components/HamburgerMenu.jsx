import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './HamburgerMenu.css';

const HamburgerMenu = ({ onOpenAuth, onOpenProvider, categories, activeCategory, onSelectCategory }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const { user, profile, signOut } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (cat) => {
    onSelectCategory(cat);
    setOpen(false);
  };

  return (
    <div className="hamburger-wrapper" ref={menuRef}>
      <button
        className={`hamburger-btn ${open ? 'open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
      >
        <span /><span /><span />
      </button>

      <div className={`hamburger-menu glass-panel ${open ? 'visible' : ''}`}>
        {/* User session area */}
        {user ? (
          <div className="menu-user-area">
            <div className="menu-user-avatar">
              {(profile?.display_name || user.email || '?').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="menu-user-name">{profile?.display_name || user.email?.split('@')[0]}</p>
              <p className="menu-user-role">
                {profile?.role === 'provider' ? '🛠️ Prestador' : '👤 Usuario'}
              </p>
            </div>
          </div>
        ) : (
          <div className="menu-auth-buttons">
            <button className="menu-login-btn" onClick={() => { onOpenAuth('login'); setOpen(false); }}>
              Iniciar sesión
            </button>
            <button className="menu-register-btn" onClick={() => { onOpenAuth('register'); setOpen(false); }}>
              Registrarme
            </button>
          </div>
        )}

        <div className="menu-divider" />

        {/* Categories */}
        <p className="menu-section-label">Categorías</p>
        <div className="menu-categories">
          {categories.map(cat => (
            <button
              key={cat}
              className={`menu-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-divider" />

        {/* Actions */}
        <div className="menu-actions">
          {!user && (
            <button className="menu-action-btn provider" onClick={() => { onOpenAuth('provider'); setOpen(false); }}>
              🛠️ Registrar mi servicio
            </button>
          )}
          {user && profile?.role === 'user' && (
            <button className="menu-action-btn provider" onClick={() => { onOpenAuth('provider'); setOpen(false); }}>
              🛠️ Quiero ser prestador
            </button>
          )}
          {user && (
            <button className="menu-action-btn signout" onClick={() => { signOut(); setOpen(false); }}>
              Cerrar sesión
            </button>
          )}
        </div>

        <div className="menu-footer">
          <p>CaliAsistente © 2026</p>
          <p>Cali, Colombia</p>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
