import React, { useState, useEffect } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import BusinessCard from './components/BusinessCard';
import ProviderModal from './components/ProviderModal';
import AuthModal from './components/AuthModal';
import { supabase } from './lib/supabase';
import { categories, mockProviders } from './data/providers';

const AppInner = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [authModal, setAuthModal] = useState(null); // null | 'login' | 'register' | 'provider'
  const [dbProviders, setDbProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Load verified providers from Supabase
  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('verification_status', 'verified')
        .order('thumbs_up', { ascending: false });

      if (!error && data && data.length > 0) setDbProviders(data);
      setLoadingProviders(false);
    };
    fetchProviders();
  }, []);

  // Merge: use DB providers if available, fallback to mock for development
  const allProviders = dbProviders.length > 0 ? dbProviders.map(p => ({
    ...p,
    thumbsUp: p.thumbs_up,
    thumbsDown: p.thumbs_down,
    avatar: p.avatar_url,
    verified: p.verification_status === 'verified',
    reviews: [] // reviews loaded per-modal
  })) : mockProviders;

  const filteredProviders = activeCategory === 'Todos'
    ? allProviders
    : allProviders.filter(p => p.category === activeCategory);

  return (
    <div className="app-container">
      <Header
        onOpenAuth={(tab) => setAuthModal(tab)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <main>
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {loadingProviders && dbProviders.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Cargando servicios...</p>
          </div>
        ) : (
          <div className="providers-grid">
            {filteredProviders.length > 0 ? (
              filteredProviders.map((provider, index) => (
                <div key={provider.id} style={{ animationDelay: `${index * 0.07}s` }}>
                  <BusinessCard
                    provider={provider}
                    onOpenModal={(mode) => setSelectedProvider({ provider, openOnReport: mode === 'report' })}
                  />
                </div>
              ))
            ) : (
              <div className="no-results glass-panel">
                <p>No se encontraron prestadores en esta categoría.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {selectedProvider && (
        <ProviderModal
          provider={selectedProvider.provider}
          openOnReport={selectedProvider.openOnReport}
          onClose={() => setSelectedProvider(null)}
          onRequireAuth={(tab) => { setSelectedProvider(null); setAuthModal(tab || 'login'); }}
        />
      )}

      {authModal && (
        <AuthModal
          initialTab={authModal}
          onClose={() => setAuthModal(null)}
        />
      )}
    </div>
  );
};

// Wrap with AuthProvider at the top
const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
