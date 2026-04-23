import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header">
      <div className="logo-area">
        <div className="logo-icon">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="24" fill="url(#logoGrad)"/>
            <path d="M14 28C14 22 18 16 24 16C30 16 34 22 34 28" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="24" cy="30" r="3" fill="white"/>
            <path d="M20 30L24 27L28 30" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <defs>
              <linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48">
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
        <svg className="shield-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="currentColor"/>
          <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Todos los prestadores han pasado por nuestro sistema riguroso de verificación de identidad
      </div>
    </header>
  );
};

export default Header;
