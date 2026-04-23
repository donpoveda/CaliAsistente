import React, { useState, useEffect } from 'react';
import './ProviderModal.css';

const ProviderModal = ({ provider, onClose }) => {
  const [votes, setVotes] = useState({
    up: provider.thumbsUp,
    down: provider.thumbsDown
  });
  const [userVoted, setUserVoted] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSent, setReportSent] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleVote = (type) => {
    if (userVoted === type) return;
    setVotes(prev => {
      let newUp = prev.up;
      let newDown = prev.down;
      if (type === 'up') { newUp += 1; if (userVoted === 'down') newDown -= 1; }
      else { newDown += 1; if (userVoted === 'up') newUp -= 1; }
      return { up: newUp, down: newDown };
    });
    setUserVoted(type);
  };

  const handleReport = () => {
    if (!reportReason.trim()) return;
    setReportSent(true);
    setTimeout(() => setShowReport(false), 2000);
  };

  const totalVotes = votes.up + votes.down;
  const ratingPercent = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <button className="modal-close-btn" onClick={onClose} title="Cerrar">✕</button>
          <div className="modal-profile">
            <img src={provider.avatar} alt={provider.name} className="modal-avatar" />
            <div>
              <div className="modal-name-row">
                <h2 className="modal-name">{provider.name}</h2>
                {provider.verified && (
                  <span className="verified-badge" title="Identidad verificada">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#1d4ed8"/>
                      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Verificado
                  </span>
                )}
              </div>
              <h3 className="modal-service">{provider.serviceTitle}</h3>
              <span className="modal-category-badge">{provider.category}</span>
            </div>
          </div>

          <p className="modal-description">{provider.description}</p>

          <div className="modal-contact">
            <a href={`tel:${provider.phone}`} className="contact-btn phone">📞 Llamar</a>
            <a href={`https://wa.me/${provider.phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp">💬 WhatsApp</a>
          </div>

          {/* Rating bar */}
          <div className="modal-rating">
            <div className="rating-bar-container">
              <div className="rating-bar-fill" style={{ width: `${ratingPercent}%` }}></div>
            </div>
            <div className="rating-stats">
              <span className={`rating-label ${ratingPercent >= 80 ? 'high' : ratingPercent >= 50 ? 'med' : 'low'}`}>
                {ratingPercent}% de confianza
              </span>
              <span className="vote-total">{totalVotes} calificaciones</span>
            </div>
            <div className="vote-actions">
              <button className={`vote-btn up ${userVoted === 'up' ? 'active' : ''}`} onClick={() => handleVote('up')} title="Recomendar">
                👍 <span className="vote-count">{votes.up}</span>
              </button>
              <button className={`vote-btn down ${userVoted === 'down' ? 'active' : ''}`} onClick={() => handleVote('down')} title="No Recomendar">
                👎 <span className="vote-count">{votes.down}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="modal-reviews-section">
          <h4 className="reviews-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"/></svg>
            Opiniones de la comunidad
          </h4>

          {provider.reviews && provider.reviews.length > 0 ? (
            <div className="reviews-list">
              {provider.reviews.map((review, i) => (
                <div key={i} className="review-card">
                  <div className="review-top">
                    <div className="review-author-avatar">
                      {review.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="review-meta">
                      <span className="review-author">{review.author}</span>
                      <span className="review-date">{review.date}</span>
                    </div>
                    <span className={`review-vote-icon ${review.vote}`}>
                      {review.vote === 'up' ? '👍' : '👎'}
                    </span>
                  </div>
                  <p className="review-text">{review.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">Aún no hay opiniones para este prestador.</p>
          )}
        </div>

        {/* Report Section */}
        <div className="modal-report-section">
          {!showReport ? (
            <button className="report-trigger-btn" onClick={() => setShowReport(true)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21L12 2L23 21H1ZM12 18A1 1 0 1 0 12 16A1 1 0 0 0 12 18ZM11 15H13V10H11V15Z"/></svg>
              Reportar este perfil
            </button>
          ) : reportSent ? (
            <p className="report-sent">✅ Reporte enviado. Gracias por ayudarnos a mantener la confianza.</p>
          ) : (
            <div className="report-form">
              <p className="report-label">¿Cuál es el motivo del reporte?</p>
              <textarea
                className="report-textarea"
                placeholder="Describe el problema..."
                value={reportReason}
                onChange={e => setReportReason(e.target.value)}
                rows={3}
              />
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
