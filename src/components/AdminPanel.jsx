import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import './AdminPanel.css';

/* ── Signed URL refresher for private storage docs ── */
const DocViewer = ({ storedUrl, label }) => {
  const [freshUrl, setFreshUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!storedUrl) return;
    setLoading(true);
    // Extract path from any URL format: just take everything after /verification-docs/
    const match = storedUrl.match(/verification-docs\/(.+?)(\?|$)/);
    if (!match) { setFreshUrl(storedUrl); setLoading(false); return; }
    const path = decodeURIComponent(match[1]);
    const { data } = await supabase.storage
      .from('verification-docs')
      .createSignedUrl(path, 300); // 5-minute URL
    setFreshUrl(data?.signedUrl || storedUrl);
    setLoading(false);
  };

  if (!storedUrl) return <span className="doc-missing">No enviado</span>;

  return (
    <div className="doc-viewer">
      <span className="doc-label">{label}</span>
      {freshUrl ? (
        <a href={freshUrl} target="_blank" rel="noopener noreferrer" className="doc-open-btn">
          🔍 Ver documento
        </a>
      ) : (
        <button className="doc-load-btn" onClick={refresh} disabled={loading}>
          {loading ? 'Cargando...' : '👁️ Cargar documento'}
        </button>
      )}
    </div>
  );
};

const AdminPanel = ({ onClose }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending'); // 'pending' | 'verified' | 'reports'
  const [reports, setReports] = useState([]);
  const [rejectModal, setRejectModal] = useState(null); // { id, name }
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (profile?.role !== 'admin') return;
    fetchData();
  }, [tab, profile]);

  const fetchData = async () => {
    setLoading(true);
    if (tab === 'reports') {
      const { data } = await supabase
        .from('reports')
        .select('*, providers(name, category)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      setReports(data || []);
    } else {
      const status = tab === 'pending' ? 'pending' : 'verified';
      const { data } = await supabase
        .from('providers')
        .select('*')
        .eq('verification_status', status)
        .order('created_at', { ascending: false });
      setPending(data || []);
    }
    setLoading(false);
  };

  const handleVerify = async (providerId, action, notes = '') => {
    const status = action === 'approve' ? 'verified' : 'rejected';
    const { error } = await supabase
      .from('providers')
      .update({ verification_status: status, verification_notes: notes })
      .eq('id', providerId);
    if (error) { toast(error.message, 'error'); return; }
    toast(
      action === 'approve' ? '✅ Prestador aprobado y publicado' : '❌ Perfil rechazado',
      action === 'approve' ? 'success' : 'warning'
    );
    fetchData();
  };

  const handleDismissReport = async (reportId) => {
    await supabase.from('reports').update({ status: 'dismissed' }).eq('id', reportId);
    toast('Reporte desestimado', 'info');
    fetchData();
  };

  const openRejectModal = (provider) => {
    setRejectReason('');
    setRejectModal(provider);
  };

  const confirmReject = async () => {
    if (!rejectModal) return;
    await handleVerify(rejectModal.id, 'reject', rejectReason || 'No cumple requisitos');
    setRejectModal(null);
  };

  if (profile?.role !== 'admin') {
    return (
      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-panel glass-panel" onClick={e => e.stopPropagation()}>
          <button className="admin-close-btn" onClick={onClose}>✕</button>
          <div className="admin-access-denied">
            <span>🔒</span>
            <h3>Acceso restringido</h3>
            <p>Solo los administradores pueden acceder a este panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-panel glass-panel" onClick={e => e.stopPropagation()}>
        <div className="admin-header">
          <h2 className="admin-title">⚙️ Panel de Administración</h2>
          <button className="admin-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-tabs">
          <button className={`admin-tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>
            Pendientes
          </button>
          <button className={`admin-tab ${tab === 'verified' ? 'active' : ''}`} onClick={() => setTab('verified')}>
            Verificados
          </button>
          <button className={`admin-tab ${tab === 'reports' ? 'active' : ''}`} onClick={() => setTab('reports')}>
            Reportes
          </button>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="loading-spinner" /></div>
        ) : tab !== 'reports' ? (
          pending.length === 0 ? (
            <p className="admin-empty">No hay prestadores en esta categoría.</p>
          ) : (
            <div className="admin-list">
              {pending.map(p => (
                <div key={p.id} className="admin-card glass-panel">
                  <div className="admin-card-top">
                    <img src={p.avatar_url || `https://i.pravatar.cc/80?u=${p.id}`} alt={p.name} className="admin-avatar" />
                    <div className="admin-card-info">
                      <h4 className="admin-name">{p.name}</h4>
                      <p className="admin-service">{p.service_title} · <span className="admin-category">{p.category}</span></p>
                      <p className="admin-phone">📞 {p.phone}</p>
                      <p className="admin-desc">{p.description}</p>
                      <p className="admin-date">Registrado: {new Date(p.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>

                  {/* ── Identity verification docs ── */}
                  {tab === 'pending' && (
                    <div className="admin-id-section">
                      <h5 className="admin-id-title">🪪 Verificación de identidad</h5>
                      <div className="admin-id-row">
                        <div className="admin-id-field">
                          <span className="admin-id-label">Cédula:</span>
                          <span className="admin-id-value">{p.cedula_number || <em className="doc-missing">No informado</em>}</span>
                        </div>
                        <div className="admin-id-docs">
                          <DocViewer storedUrl={p.cedula_photo_url} label="📄 Foto cédula" />
                          <DocViewer storedUrl={p.selfie_url} label="🤳 Selfie" />
                        </div>
                      </div>
                    </div>
                  )}

                  {tab === 'pending' && (
                    <div className="admin-actions">
                      <button className="admin-approve-btn" onClick={() => handleVerify(p.id, 'approve')}>
                        ✅ Aprobar y publicar
                      </button>
                      <button className="admin-reject-btn" onClick={() => openRejectModal(p)}>
                        ❌ Rechazar
                      </button>
                    </div>
                  )}
                  {tab === 'verified' && (
                    <div className="admin-actions">
                      <span className="admin-status-badge verified">✔ Verificado</span>
                      <button className="admin-reject-btn" onClick={() => openRejectModal(p)}>
                        Suspender
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        ) : (
          reports.length === 0 ? (
            <p className="admin-empty">No hay reportes pendientes. ✨</p>
          ) : (
            <div className="admin-list">
              {reports.map(r => (
                <div key={r.id} className="admin-card glass-panel">
                  <div className="admin-card-top">
                    <div className="admin-report-icon">⚠️</div>
                    <div className="admin-card-info">
                      <h4 className="admin-name">Reporte sobre: {r.providers?.name || r.provider_id}</h4>
                      <p className="admin-desc">{r.reason}</p>
                      <p className="admin-date">{new Date(r.created_at).toLocaleDateString('es-CO')}</p>
                    </div>
                  </div>
                  <div className="admin-actions">
                    <button className="admin-reject-btn" onClick={() => handleVerify(r.provider_id, 'reject', 'Suspendido por reportes')}>
                      Suspender prestador
                    </button>
                    <button className="admin-dismiss-btn" onClick={() => handleDismissReport(r.id)}>
                      Desestimar reporte
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* ── Reject / Suspend modal ── */}
      {rejectModal && (
        <div className="reject-modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="reject-modal glass-panel" onClick={e => e.stopPropagation()}>
            <h4>Razón del rechazo</h4>
            <p className="reject-modal-name">{rejectModal.name}</p>
            <textarea
              className="reject-reason-input"
              rows={3}
              placeholder="Explica brevemente el motivo del rechazo (opcional)…"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
            />
            <div className="reject-modal-actions">
              <button className="admin-approve-btn" onClick={() => setRejectModal(null)}>Cancelar</button>
              <button className="admin-reject-btn" onClick={confirmReject}>Confirmar rechazo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
