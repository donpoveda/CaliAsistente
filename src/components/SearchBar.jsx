import React from 'react';
import './SearchBar.css';

const SearchBar = ({ value, onChange }) => {
  return (
    <div className="searchbar-wrapper">
      <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        className="searchbar-input"
        placeholder="Buscar por nombre, servicio o categoría..."
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-label="Buscar prestador de servicios"
      />
      {value && (
        <button className="search-clear-btn" onClick={() => onChange('')} title="Limpiar">✕</button>
      )}
    </div>
  );
};

export default SearchBar;
