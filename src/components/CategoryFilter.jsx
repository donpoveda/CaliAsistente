import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, activeCategory, onSelectCategory }) => {
  return (
    <div className="category-filter-container">
      <div className="category-filter">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
