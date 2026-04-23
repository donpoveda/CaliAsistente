import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

const CATEGORIES = [
  'Plomería','Electricidad','Mensajería','Pintura',
  'Carpintería','Mantenimiento','Jardinería','Coaching','Otro'
];

const AuthModal = ({ initialTab = 'login', onClose }) => {
  const [tab, setTab] = useState(initialTab); // 'login' | 'register' | 'provider'
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text }

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // User registration state
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');

  // Provider registration state
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provName, setProvName] = useState('');
  const [provServiceTitle, setProvServiceTitle] = useState('');
  const [provCategory, setProvCategory] = useState('Plomería');
  const [provDescription, setProvDescription] = useState('');
  const [provPhone, setProvPhone] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) setMessage({ type: 'error', text: error.message });
    else { setMessage({ type: 'success', text: '¡Bienvenido de nuevo!' }); setTimeout(onClose, 1000); }
    setLoading(false);
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);
    const { error } = await supabase.auth.signUp({
      email: regEmail,
      password: regPassword,
      options: { data: { display_name: regName, role: 'user' } }
    });
    if (error) setMessage({ type: 'error', text: error.message });
    else setMessage({ type: 'success', text: '¡Cuenta creada! Revisa tu correo para verificar tu email antes de opinar.' });
    setLoading(false);
  };

  const handleRegisterProvider = async (e) => {
    e.preventDefault();
    setLoading(true); setMessage(null);

    // 1. Create the auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: provEmail,
      password: provPassword,
      options: { data: { display_name: provName, role: 'provider' } }
    });

    if (authError) { setMessage({ type: 'error', text: authError.message }); setLoading(false); return; }

    // 2. Create the provider profile (pending verification)
    const { error: provError } = await supabase.from('providers').insert({
      user_id: authData.user?.id,
      name: provName,
      service_title: provServiceTitle,
      category: provCategory,
      description: provDescription,
      phone: provPhone,
      verification_status: 'pending',
      avatar_url: `https://i.pravatar.cc/150?u=${provEmail}`
    });

    if (provError) setMessage({ type: 'error', text: provError.message });
    else setMessage({
      type: 'success',
      text: '¡Solicitud enviada! Tu perfil está en revisión. Recibirás confirmación por correo una vez verificada tu identidad. Verifica también tu email.'
    });
    setLoading(false);
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal glass-panel" onClick={e => e.stopPropagation()}>
        <button className="auth-close-btn" onClick={onClose}>✕</button>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>
            Iniciar Sesión
          </button>
          <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>
            Registrarme
          </button>
          <button className={`auth-tab ${tab === 'provider' ? 'active' : ''}`} onClick={() => setTab('provider')}>
            Soy Prestador
          </button>
        </div>

        {message && (
          <div className={`auth-message ${message.type}`}>{message.text}</div>
        )}

        {/* LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-form-group">
              <label>Correo electrónico</label>
              <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required placeholder="tu@correo.com" />
            </div>
            <div className="auth-form-group">
              <label>Contraseña</label>
              <input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required placeholder="••••••••" />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
            <p className="auth-switch">¿No tienes cuenta? <button type="button" onClick={() => setTab('register')}>Regístrate gratis</button></p>
          </form>
        )}

        {/* REGISTER USER */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterUser} className="auth-form">
            <div className="auth-verification-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"/></svg>
              Verificaremos tu email para que tus opiniones sean de confianza
            </div>
            <div className="auth-form-group">
              <label>Tu nombre</label>
              <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Nombre o apodo" />
            </div>
            <div className="auth-form-group">
              <label>Correo electrónico</label>
              <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="tu@correo.com" />
            </div>
            <div className="auth-form-group">
              <label>Contraseña (mín. 6 caracteres)</label>
              <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>
            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta'}
            </button>
            <p className="auth-switch">¿Ya tienes cuenta? <button type="button" onClick={() => setTab('login')}>Inicia sesión</button></p>
          </form>
        )}

        {/* REGISTER PROVIDER */}
        {tab === 'provider' && (
          <form onSubmit={handleRegisterProvider} className="auth-form">
            <div className="auth-verification-notice provider">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z"/></svg>
              Tu perfil pasa por verificación de identidad antes de publicarse. Se revisará en 24-48 horas hábiles.
            </div>
            <h4 className="auth-section-title">Datos de acceso</h4>
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>Tu nombre completo</label>
                <input type="text" value={provName} onChange={e => setProvName(e.target.value)} required placeholder="Nombre completo" />
              </div>
              <div className="auth-form-group">
                <label>Correo electrónico</label>
                <input type="email" value={provEmail} onChange={e => setProvEmail(e.target.value)} required placeholder="tu@correo.com" />
              </div>
            </div>
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>Contraseña</label>
                <input type="password" value={provPassword} onChange={e => setProvPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
              <div className="auth-form-group">
                <label>Teléfono / WhatsApp</label>
                <input type="tel" value={provPhone} onChange={e => setProvPhone(e.target.value)} required placeholder="+57 300 123 4567" />
              </div>
            </div>
            <h4 className="auth-section-title">Tu servicio</h4>
            <div className="auth-form-row">
              <div className="auth-form-group">
                <label>Título de tu servicio</label>
                <input type="text" value={provServiceTitle} onChange={e => setProvServiceTitle(e.target.value)} required placeholder="ej: Plomero Experto" />
              </div>
              <div className="auth-form-group">
                <label>Categoría</label>
                <select value={provCategory} onChange={e => setProvCategory(e.target.value)}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="auth-form-group">
              <label>Descripción breve de tu servicio</label>
              <textarea value={provDescription} onChange={e => setProvDescription(e.target.value)} required rows={3} placeholder="Describe qué haces, tu experiencia y zona de cobertura en Cali..." />
            </div>
            <button type="submit" className="auth-submit-btn provider" disabled={loading}>
              {loading ? 'Enviando solicitud...' : '🛡️ Enviar para verificación'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
