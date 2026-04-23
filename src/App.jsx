import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './components/Toast';
import { useAuth } from './context/AuthContext';
import Header from './components/Header';
import CategoryFilter from './components/CategoryFilter';
import SearchBar from './components/SearchBar';
import BusinessCard from './components/BusinessCard';
import ProviderModal from './components/ProviderModal';
import AuthModal from './components/AuthModal';
import AdminPanel from './components/AdminPanel';
import { supabase } from './lib/supabase';
import { categories, mockProviders } from './data/providers';

const AppInner = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [authModal, setAuthModal] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [dbProviders, setDbProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);

  // Handle Supabase auth callback (email confirmation redirect)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          toast('¡Email verificado correctamente! Ya puedes opinar.', 'success', 6000);
          window.history.replaceState(null, '', window.location.pathname);
        }
      });
    }
  }, []);

  // Load verified providers from Supabase
  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      const { data, error } = await supabase
        .from('providers')
        .select('*')
        .eq('verification_status', 'verified')
        .order('thumbs_up', { ascending: false });

      if (!error && data && data.length > 0) {
        setDbProviders(data);
      } else if (error) {
        // Supabase not set up yet, run on mock data silently
      }
      setLoadingProviders(false);
    };
    fetchProviders();
  }, []);

  // Merge DB + mock providers
  const allProviders = useMemo(() => {
    if (dbProviders.length > 0) {
      return dbProviders.map(p => ({
        ...p,
        thumbsUp: p.thumbs_up,
        thumbsDown: p.thumbs_down,
        avatar: p.avatar_url,
        serviceTitle: p.service_title,
        verified: true,
        reviews: []
      }));
    }
    return mockProviders;
  }, [dbProviders]);

  // Filter by category + search query
  const filteredProviders = useMemo(() => {
    let result = activeCategory === 'Todos'
      ? allProviders
      : allProviders.filter(p => p.category === activeCategory);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        (p.service_title || p.serviceTitle)?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allProviders, activeCategory, searchQuery]);

  const handleOpenAuth = (tab) => setAuthModal(tab);

  return (
    <div className="app-container">
      <Header
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => setShowAdmin(true)}
        categories={categories}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
      />

      <main>
        <SearchBar value={searchQuery} onChange={setSearchQuery} />

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
        ) : filteredProviders.length > 0 ? (
          <div className="providers-grid">
            {filteredProviders.map((provider, index) => (
              <div key={provider.id} style={{ animationDelay: `${index * 0.06}s` }}>
                <BusinessCard
                  provider={provider}
                  onOpenModal={(mode) => setSelectedProvider({ provider, openOnReport: mode === 'report' })}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="no-results glass-panel">
            {searchQuery
              ? <p>No se encontraron resultados para <strong>"{searchQuery}"</strong>. Intenta con otro término.</p>
              : <p>No hay prestadores registrados en esta categoría aún.</p>
            }
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

      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <ToastProvider>
      <AppInner />
    </ToastProvider>
  </AuthProvider>
);

export default App;
