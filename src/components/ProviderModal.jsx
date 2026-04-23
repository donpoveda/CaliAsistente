import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ProviderModal.css';

const ProviderModal = ({ provider, onClose, onRequireAuth }) => {
  const { user, profile } = useAuth();

  const [votes, setVotes] = useState({ up: provider.thumbsUp || provider.thumbs_up || 0, down: provider.thumbsDown || provider.thumbs_down || 0 });
  const [userVote, setUserVote] = useState(null); // 'up' | 'down' | null
  const [reviews, setReviews] = useState(provider.reviews || []);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewVote, setNewReviewVote] = useState('up');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const isDbProvider = !!provider.verification_status; // came from DB

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Load reviews from Supabase if DB provider
  useEffect(() => {
    if (!isDbProvider) return;
    const loadReviews = async () => {
      setLoadingReviews(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', provider.id)
        .order('created_at', { ascending: false });
      if (data) setReviews(data.map(r => ({
        author: r.author_name,
        date: new Date(r.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }),
        text: r.text,
        vote: r.vote
      })));
      setLoadingReviews(false);
    };

    // Load user's existing vote
    const loadUserVote = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('provider_id', provider.id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setUserVote(data.vote_type);
    };

    loadReviews();
    loadUserVote();
  }, [provider.id, user, isDbProvider]);

  const handleVote = async (type) => {
    if (!user) { onRequireAuth('login'); return; }
    if (userVote === type) return;

    const prev = userVote;
    setUserVote(type);
    setVotes(v => {
      let up = v.up, down = v.down;
      if (type === 'up') { up += 1; if (prev === 'down') down -= 1; }
      else { down += 1; if (prev === 'up') up -= 1; }
      return { up, down };
    });

    if (isDbProvider) {
      if (prev) {
        await supabase.from('votes').update({ vote_type: type }).eq('provider_id', provider.id).eq('user_id', user.id);
      } else {
        await supabase.from('votes').insert({ provider_id: provider.id, user_id: user.id, vote_type: type });
      }
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { onRequireAuth('login'); return; }
    if (!newReviewText.trim()) return;
    setSubmittingReview(true);
    setReviewMsg(null);

    const authorName = profile?.display_name || user.email?.split('@')[0] || 'Usuario';

    if (isDbProvider) {
      const { error } = await supabase.from('reviews').insert({
        provider_id: provider.id,
        user_id: user.id,
        author_name: authorName,
        text: newReviewText.trim(),
        vote: newReviewVote
      });
      if (error) { setReviewMsg({ type: 'error', text: error.message }); setSubmittingReview(false); return; }
    }

    // Optimistic update for mock mode
    setReviews(prev => [{
      author: authorName,
      date: 'Hoy',
      text: newReviewText.trim(),
      vote: newReviewVote
    }, ...prev]);
    setNewReviewText('');
    setReviewMsg({ type: 'success', text: '¡Gracias! Tu opinión se publicó correctamente.' });
    setSubmittingReview(false);
  };

  const handleReport = async () => {
    if (!user) { onRequireAuth('login'); return; }
    if (!reportReason.trim()) return;
    if (isDbProvider) {
      await supabase.from('reports').insert({ provider_id: provider.id, user_id: user.id, reason: reportReason.trim() });
    }
    setReportSent(true);
    setTimeout(() => setShowReport(false), 2500);
  };

  const totalVotes = votes.up + votes.down;
  const ratingPercent = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose} title="Cerrar">✕</button>
          <div className="modal-profile">
            <img src={provider.avatar || provider.avatar_url || `https://i.pravatar.cc/150?u=${provider.id}`} alt={provider.name} className="modal-avatar" />
            <div>
              <div className="modal-name-row">
                <h2 className="modal-name">{provider.name}</h2>
                {(provider.verified || provider.verification_status === 'verified') && (
                  <span className="verified-badge" title="Identidad verificada">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#1d4ed8"/>
                      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verificado
                  </span>
                )}
              </div>
              <h3 className="modal-service">{provider.service_title || provider.serviceTitle}</h3>
              <span className="modal-category-badge">{provider.category}</span>
            </div>
          </div>

          <p className="modal-description">{provider.description}</p>

          <div className="modal-contact">
            <a href={`tel:${provider.phone}`} className="contact-btn phone" onClick={e => e.stopPropagation()}>📞 Llamar</a>
            <a href={`https://wa.me/${(provider.phone || '').replace('+', '')}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp" onClick={e => e.stopPropagation()}>💬 WhatsApp</a>
          </div>

          {/* Rating bar */}
          <div className="modal-rating">
            <div className="rating-bar-container">
              <div className="rating-bar-fill" style={{ width: `${ratingPercent}%` }} />
            </div>
            <div className="rating-stats">
              <span className={`rating-label ${ratingPercent >= 80 ? 'high' : ratingPercent >= 50 ? 'med' : 'low'}`}>
                {totalVotes > 0 ? `${ratingPercent}% de confianza` : 'Sin calificaciones aún'}
              </span>
              <span className="vote-total">{totalVotes} calificaciones</span>
            </div>
            <div className="vote-actions">
              <button className={`vote-btn up ${userVote === 'up' ? 'active' : ''}`} onClick={() => handleVote('up')} title="Recomendar">
                👍 <span className="vote-count">{votes.up}</span>
              </button>
              <button className={`vote-btn down ${userVote === 'down' ? 'active' : ''}`} onClick={() => handleVote('down')} title="No Recomendar">
                👎 <span className="vote-count">{votes.down}</span>
              </button>
              {!user && <span className="auth-nudge" onClick={() => onRequireAuth('login')}>Inicia sesión para votar →</span>}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="modal-reviews-section">
          <h4 className="reviews-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
            Opiniones de la comunidad
          </h4>

          {/* Leave a review — requires auth */}
          {user ? (
            <form className="review-form" onSubmit={handleSubmitReview}>
              <p className="review-form-label">Comparte tu experiencia</p>
              {reviewMsg && <div className={`review-msg ${reviewMsg.type}`}>{reviewMsg.text}</div>}
              <textarea
                className="review-textarea"
                placeholder="¿Cómo fue tu experiencia con este prestador?"
                value={newReviewText}
                onChange={e => setNewReviewText(e.target.value)}
                rows={3}
                required
              />
              <div className="review-form-footer">
                <div className="review-vote-select">
                  <button type="button" className={`rv-btn ${newReviewVote === 'up' ? 'active-up' : ''}`} onClick={() => setNewReviewVote('up')}>👍 Lo recomiendo</button>
                  <button type="button" className={`rv-btn ${newReviewVote === 'down' ? 'active-down' : ''}`} onClick={() => setNewReviewVote('down')}>👎 No lo recomiendo</button>
                </div>
                <button type="submit" className="review-submit-btn" disabled={submittingReview}>
                  {submittingReview ? 'Publicando...' : 'Publicar opinión'}
                </button>
              </div>
            </form>
          ) : (
            <button className="auth-required-btn" onClick={() => onRequireAuth('login')}>
              🔒 Inicia sesión para dejar una opinión
            </button>
          )}

          {/* Review list */}
          {loadingReviews ? (
            <div className="reviews-loading"><div className="loading-spinner small" /></div>
          ) : reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review, i) => (
                <div key={i} className="review-card">
                  <div className="review-top">
                    <div className="review-author-avatar">{(review.author || '?').charAt(0).toUpperCase()}</div>
                    <div className="review-meta">
                      <span className="review-author">{review.author}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <span className={`review-vote-icon ${review.vote}`}>{review.vote === 'up' ? '👍' : '👎'}</span>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">Sé el primero en opinar sobre este prestador.</p>
          )}
        </div>

        {/* Report Section */}
        <div className="modal-report-section">
          {!showReport ? (
            <button className="report-trigger-btn" onClick={() => user ? setShowReport(true) : onRequireAuth('login')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21L12 2L23 21H1ZM12 18A1 1 0 1 0 12 16A1 1 0 0 0 12 18ZM11 15H13V10H11V15Z"/></svg>
              Reportar este perfil
            </button>
          ) : reportSent ? (
            <p className="report-sent">✅ Reporte enviado. Gracias por ayudarnos.</p>
          ) : (
            <div className="report-form">
              <p className="report-label">¿Cuál es el motivo del reporte?</p>
              <textarea className="report-textarea" placeholder="Describe el problema..." value={reportReason} onChange={e => setReportReason(e.target.value)} rows={3} />
              <div className="report-actions">
                <button className="report-cancel-btn" onClick={() => setShowReport(false)}>Cancelar</button>
                <button className="report-submit-btn" onClick={handleReport}>Enviar reporte</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderModal;
