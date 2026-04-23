import React, { useState } from 'react';
import './BusinessCard.css';

const BusinessCard = ({ provider, onOpenModal }) => {
  const [userVoted, setUserVoted] = useState(null);
  const [votes, setVotes] = useState({ up: provider.thumbsUp || 0, down: provider.thumbsDown || 0 });

  const handleVote = (e, type) => {
    e.stopPropagation();
    if (userVoted === type) return;
    setVotes(prev => {
      let { up, down } = prev;
      if (type === 'up') { up += 1; if (userVoted === 'down') down -= 1; }
      else { down += 1; if (userVoted === 'up') up -= 1; }
      return { up, down };
    });
    setUserVoted(type);
  };

  const total = votes.up + votes.down;
  const pct = total > 0 ? Math.round((votes.up / total) * 100) : null;
  const pctClass = pct === null ? 'new' : pct >= 80 ? 'high' : pct >= 50 ? 'med' : 'low';

  const reviewCount = provider.reviews?.length || 0;

  return (
    <div className="business-card glass-panel" onClick={onOpenModal} role="button" tabIndex={0}>

      {/* Report button */}
      <button className="report-icon-btn" title="Reportar" onClick={e => { e.stopPropagation(); onOpenModal('report'); }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1 21L12 2L23 21H1ZM12 18A1 1 0 1 0 12 16A1 1 0 0 0 12 18ZM11 15H13V10H11V15Z"/>
        </svg>
      </button>

      {/* Top: avatar + name + category */}
      <div className="card-top">
        <img
          src={provider.avatar || provider.avatar_url || `https://i.pravatar.cc/80?u=${provider.id}`}
          alt={provider.name}
          className="avatar"
        />
        <div className="card-identity">
          <div className="name-row">
            <span className="provider-name">{provider.name}</span>
            {provider.verified && (
              <svg className="verified-dot" width="14" height="14" viewBox="0 0 24 24" fill="none" title="Verificado">
                <path d="M12 2L4 6V12C4 16.4 7.4 20.5 12 22C16.6 20.5 20 16.4 20 12V6L12 2Z" fill="#1d4ed8"/>
                <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="service-title">{provider.serviceTitle || provider.service_title}</span>
          <span className="service-badge">{provider.category}</span>
        </div>
      </div>

      {/* Description: 2 lines max */}
      <p className="description">{provider.description}</p>

      {/* Contact */}
      <div className="contact-row" onClick={e => e.stopPropagation()}>
        <a href={`tel:${provider.phone}`} className="contact-btn phone">📞</a>
        <a href={`https://wa.me/${(provider.phone || '').replace('+', '')}`} target="_blank" rel="noreferrer" className="contact-btn whatsapp">💬</a>
      </div>

      {/* Footer: rating + votes */}
      <div className="card-footer">
        <div className="footer-left">
          <span className={`rating-badge ${pctClass}`}>
            {pct !== null ? `${pct}%` : 'Nuevo'}
          </span>
          {reviewCount > 0 && <span className="opinion-count">{reviewCount} 💬</span>}
        </div>
        <div className="vote-row">
          <button className={`vote-btn up ${userVoted === 'up' ? 'active' : ''}`} onClick={e => handleVote(e, 'up')}>
            👍 {votes.up}
          </button>
          <button className={`vote-btn down ${userVoted === 'down' ? 'active' : ''}`} onClick={e => handleVote(e, 'down')}>
            👎 {votes.down}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessCard;
