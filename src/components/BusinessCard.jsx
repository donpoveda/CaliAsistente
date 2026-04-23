import React, { useState } from 'react';
import './BusinessCard.css';

const BusinessCard = ({ provider, onOpenModal }) => {
  const [votes, setVotes] = useState({
    up: provider.thumbsUp,
    down: provider.thumbsDown
  });
  const [userVoted, setUserVoted] = useState(null);

  const handleVote = (e, type) => {
    e.stopPropagation(); // Don't open modal when voting
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

  const handleContactClick = (e) => {
    e.stopPropagation(); // Don't open modal when clicking contact buttons
  };

  const totalVotes = votes.up + votes.down;
  const ratingPercent = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 0;

  return (
    <div className="glass-panel business-card" onClick={onOpenModal} role="button" tabIndex={0}>
      
      {/* Report icon top-right corner */}
      <button
        className="report-icon-btn"
        title="Reportar perfil"
        onClick={e => { e.stopPropagation(); onOpenModal('report'); }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21L12 2L23 21H1ZM12 18A1 1 0 1 0 12 16A1 1 0 0 0 12 18ZM11 15H13V10H11V15Z"/>
        </svg>
      </button>

      <div className="card-header">
        <img src={provider.avatar} alt={provider.name} className="avatar" />
        <div className="header-info">
          <div className="name-row">
            <h2 className="provider-name">{provider.name}</h2>
            {provider.verified && (
              <span className="card-verified-badge" title="Identidad verificada por CaliAsistente">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#1d4ed8"/>
                  <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </div>
          <span className="service-badge">{provider.category}</span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="service-title">{provider.serviceTitle}</h3>
        <p className="description">{provider.description}</p>

        <div className="contact-info" onClick={handleContactClick}>
          <a href={`tel:${provider.phone}`} className="contact-btn phone">📞 Llamar</a>
          <a href={`https://wa.me/${provider.phone.replace('+', '')}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp">💬 WhatsApp</a>
        </div>
      </div>

      <div className="card-footer">
        <div className="rating-info">
          {totalVotes > 0 ? (
            <span className={`rating-badge ${ratingPercent >= 80 ? 'high' : ratingPercent >= 50 ? 'med' : 'low'}`}>
              De confianza: {ratingPercent}%
            </span>
          ) : (
            <span className="rating-badge new">Nuevo</span>
          )}
          {provider.reviews && provider.reviews.length > 0 && (
            <span className="reviews-count">{provider.reviews.length} opiniones</span>
          )}
        </div>
        <div className="vote-actions">
          <button
            className={`vote-btn up ${userVoted === 'up' ? 'active' : ''}`}
            onClick={e => handleVote(e, 'up')}
            title="Recomendar"
          >
            👍 <span className="vote-count">{votes.up}</span>
          </button>
          <button
            className={`vote-btn down ${userVoted === 'down' ? 'active' : ''}`}
            onClick={e => handleVote(e, 'down')}
            title="No Recomendar"
          >
            👎 <span className="vote-count">{votes.down}</span>
          </button>
        </div>
      </div>

      <div className="card-open-hint">Ver perfil completo y opiniones →</div>
    </div>
  );
};

export default BusinessCard;
