import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import './AuthModal.css';

const CATEGORIES = [
  'Plomería','Electricidad','Mensajería','Pintura',
  'Carpintería','Mantenimiento','Jardinería','Coaching','Otro'
];

/* ── Tiny image-preview component ── */
const FilePreview = ({ file, label }) => {
  const [src, setSrc] = useState(null);
  useEffect(() => {
    if (!file) { setSrc(null); return; }
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  if (!src) return null;
  return (
    <div className="file-preview-wrap">
      <img src={src} alt={label} className="file-preview-img" />
      <span className="file-preview-label">{label}</span>
    </div>
  );
};

const AuthModal = ({ initialTab = 'login', onClose }) => {
  const [tab, setTab] = useState(initialTab);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // User registration
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');

  // Provider registration
  const [provEmail, setProvEmail] = useState('');
  const [provPassword, setProvPassword] = useState('');
  const [provName, setProvName] = useState('');
  const [provServiceTitle, setProvServiceTitle] = useState('');
  const [provCategory, setProvCategory] = useState('Plomería');
  const [provDescription, setProvDescription] = useState('');
  const [provPhone, setProvPhone] = useState('');
  const [provCedula, setProvCedula] = useState('');
  const [cedulaFile, setCedulaFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState('');

  const cedulaRef = useRef();
  const selfieRef = useRef();

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

  /* Upload a file to Supabase Storage and return its public URL */
  const uploadDoc = async (file, path) => {
    const { error } = await supabase.storage
      .from('verification-docs')
      .upload(path, file, { upsert: true });
    if (error) throw new Error(`Error subiendo ${path}: ${error.message}`);
    // Return a signed URL (60 min) so admins can view it
    const { data } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(path, 3600);
    return data?.signedUrl || null;
  };

  const handleRegisterProvider = async (e) => {
    e.preventDefault();

    // Validation
    if (!cedulaFile) { setMessage({ type: 'error', text: 'Por favor sube la foto de tu cédula.' }); return; }
    if (!selfieFile) { setMessage({ type: 'error', text: 'Por favor sube el selfie con tu cédula.' }); return; }
    if (provCedula.trim().length < 6) { setMessage({ type: 'error', text: 'Ingresa un número de cédula válido.' }); return; }

    setLoading(true); setMessage(null);

    // 1. Create auth user
    setUploadProgress('Creando cuenta…');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: provEmail,
      password: provPassword,
      options: { data: { display_name: provName, role: 'provider' } }
    });
    if (authError) { setMessage({ type: 'error', text: authError.message }); setLoading(false); setUploadProgress(''); return; }

    const uid = authData.user?.id;
    let cedulaUrl = null;
    let selfieUrl = null;

    // 2. Upload documents
    try {
      setUploadProgress('Subiendo foto de cédula… (1/2)');
      cedulaUrl = await uploadDoc(cedulaFile, `${uid}/cedula.${cedulaFile.name.split('.').pop()}`);
      setUploadProgress('Subiendo selfie… (2/2)');
      selfieUrl = await uploadDoc(selfieFile, `${uid}/selfie.${selfieFile.name.split('.').pop()}`);
    } catch (uploadErr) {
      setMessage({ type: 'error', text: uploadErr.message });
      setLoading(false); setUploadProgress(''); return;
    }

    // 3. Insert provider record
    setUploadProgress('Guardando solicitud…');
    const { error: provError } = await supabase.from('providers').insert({
      user_id: uid,
      name: provName,
      service_title: provServiceTitle,
      category: provCategory,
      description: provDescription,
      phone: provPhone,
      cedula_number: provCedula.trim(),
      cedula_photo_url: cedulaUrl,
      selfie_url: selfieUrl,
      verification_status: 'pending',
      avatar_url: `https://i.pravatar.cc/150?u=${provEmail}`
    });

    setUploadProgress('');
    if (provError) setMessage({ type: 'error', text: provError.message });
    else setMessage({
      type: 'success',
      text: '¡Solicitud enviada! Tus documentos están en revisión. Recibirás confirmación por correo en 24–48 horas hábiles. Recuerda también verificar tu email.'
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
              Tu perfil pasa por verificación de identidad antes de publicarse. Se revisará en 24–48 horas hábiles.
            </div>

            {/* ── Datos de acceso ── */}
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

            {/* ── Tu servicio ── */}
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

            {/* ── Verificación de identidad ── */}
            <h4 className="auth-section-title">🪪 Verificación de identidad</h4>
            <p className="auth-id-hint">
              Tus documentos son privados y solo los verá el equipo de CaliAsistente para confirmar tu identidad.
              No se mostrarán públicamente.
            </p>

            <div className="auth-form-group">
              <label>Número de cédula</label>
              <input
                type="text"
                value={provCedula}
                onChange={e => setProvCedula(e.target.value.replace(/\D/g, ''))}
                required
                placeholder="ej: 1234567890"
                maxLength={12}
              />
            </div>

            {/* Cédula photo upload */}
            <div className="auth-upload-group">
              <div className="auth-upload-label">
                <span>📄 Foto de tu cédula</span>
                <span className="auth-upload-hint">Ambas caras si es posible · JPG, PNG o PDF · máx 5 MB</span>
              </div>
              <input
                id="cedula-upload"
                ref={cedulaRef}
                type="file"
                accept="image/*,application/pdf"
                className="auth-file-input"
                onChange={e => setCedulaFile(e.target.files[0] || null)}
              />
              <button
                type="button"
                className={`auth-upload-btn ${cedulaFile ? 'uploaded' : ''}`}
                onClick={() => cedulaRef.current.click()}
              >
                {cedulaFile ? `✅ ${cedulaFile.name}` : '📎 Seleccionar foto de cédula'}
              </button>
              <FilePreview file={cedulaFile} label="Vista previa cédula" />
            </div>

            {/* Selfie upload */}
            <div className="auth-upload-group">
              <div className="auth-upload-label">
                <span>🤳 Selfie sosteniendo tu cédula</span>
                <span className="auth-upload-hint">Que se vean tu cara y la cédula · JPG o PNG · máx 5 MB</span>
              </div>
              <input
                id="selfie-upload"
                ref={selfieRef}
                type="file"
                accept="image/*"
                className="auth-file-input"
                onChange={e => setSelfieFile(e.target.files[0] || null)}
              />
              <button
                type="button"
                className={`auth-upload-btn ${selfieFile ? 'uploaded' : ''}`}
                onClick={() => selfieRef.current.click()}
              >
                {selfieFile ? `✅ ${selfieFile.name}` : '📎 Seleccionar selfie'}
              </button>
              <FilePreview file={selfieFile} label="Vista previa selfie" />
            </div>

            {uploadProgress && (
              <div className="auth-upload-progress">
                <div className="auth-progress-spinner" />
                {uploadProgress}
              </div>
            )}

            <button type="submit" className="auth-submit-btn provider" disabled={loading}>
              {loading ? uploadProgress || 'Enviando solicitud...' : '🛡️ Enviar para verificación'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
