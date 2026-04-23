import React, { useState, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import BusinessCard from './components/BusinessCard';
import ProviderModal from './components/ProviderModal';
import { categories, mockProviders } from './data/providers';

const App = () => {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [openOnReport, setOpenOnReport] = useState(false);

  const filteredProviders = useMemo(() => {
    if (activeCategory === "Todos") return mockProviders;
    return mockProviders.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handleOpenModal = (provider, mode) => {
    setSelectedProvider(provider);
    setOpenOnReport(mode === 'report');
  };

  const handleCloseModal = () => {
    setSelectedProvider(null);
    setOpenOnReport(false);
  };

  return (
    <div className="app-container">
      <Header />

      <main>
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        <div className="providers-grid">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider, index) => (
              <div key={provider.id} style={{ animationDelay: `${index * 0.1}s` }}>
                <BusinessCard
                  provider={provider}
                  onOpenModal={(mode) => handleOpenModal(provider, mode)}
                />
              </div>
            ))
          ) : (
            <div className="no-results glass-panel">
              <p>No se encontraron prestadores de servicios en esta categoría.</p>
            </div>
          )}
        </div>
      </main>

      {selectedProvider && (
        <ProviderModal
          provider={selectedProvider}
          openOnReport={openOnReport}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default App;
