'use client';

import { useState, useEffect } from 'react';
import ListingCard from '@/components/ListingCard';
import FilterBar from '@/components/FilterBar';
import PaymentModal from '@/components/PaymentModal';
import ListingDetailsModal from '@/components/ListingDetailsModal';
import { auth, mockAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Lock, Search } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]); // Displayed listings
  const [allListings, setAllListings] = useState([]); // All fetched listings
  const [filters, setFilters] = useState({ priceRange: '', bedrooms: '' });
  const [visibleLimit, setVisibleLimit] = useState(10);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    let unsubscribe = () => { };

    const handleUser = (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    };

    if (auth) {
      unsubscribe = onAuthStateChanged(auth, handleUser);
    } else {
      unsubscribe = mockAuth.onAuthStateChanged(handleUser);

      const handleMockAuth = () => {
        mockAuth.onAuthStateChanged(handleUser);
      };
      window.addEventListener('mock-auth-change', handleMockAuth);
      return () => {
        window.removeEventListener('mock-auth-change', handleMockAuth);
        unsubscribe();
      };
    }

    return () => unsubscribe();
  }, []);

  const applyFilters = (data, currentFilters) => {
    return data.filter(listing => {
      // Price Filter
      if (currentFilters.priceRange) {
        const price = listing.price || 0;
        if (currentFilters.priceRange === '600000+') {
          if (price < 600000) return false;
        } else {
          const [min, max] = currentFilters.priceRange.split('-').map(Number);
          if (price < min || price > max) return false;
        }
      }

      // Bedroom Filter
      if (currentFilters.bedrooms) {
        const beds = listing.bedrooms || 0;
        const filterBeds = parseInt(currentFilters.bedrooms);
        if (filterBeds === 3) {
          if (beds < 3) return false;
        } else {
          if (beds !== filterBeds) return false;
        }
      }

      return true;
    });
  };

  const handleSearch = async (query, newFilters = filters) => {
    if (!query || query.trim() === '') return;

    setIsScanning(true);
    setHasSearched(true);
    setListings([]);
    setAllListings([]);

    try {
      const response = await fetch(`/api/scan?query=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.listings) {
        setAllListings(data.listings);

        const filtered = applyFilters(data.listings, newFilters);
        const remainingSlots = Math.max(0, FREE_LIMIT - dailyCount);
        const shownListings = filtered.slice(0, remainingSlots);

        setListings(shownListings);

        if (shownListings.length > 0) {
          updateDailyCount(shownListings.length);
        }

        if (newFilters) setFilters(newFilters);
      }
    } catch (error) {
      console.error("Search failed:", error);
      alert("Error al buscar. Por favor intenta de nuevo.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    if (allListings.length > 0) {
      setListings(applyFilters(allListings, newFilters));
    }
  };

  const [dailyCount, setDailyCount] = useState(0);
  const FREE_LIMIT = 10;

  useEffect(() => {
    // Initialize daily count from localStorage
    const savedData = localStorage.getItem('rentai_daily_limit');
    if (savedData) {
      const { count, date } = JSON.parse(savedData);
      const today = new Date().toDateString();

      if (date === today) {
        setDailyCount(count);
      } else {
        // Reset if new day
        localStorage.setItem('rentai_daily_limit', JSON.stringify({ count: 0, date: today }));
        setDailyCount(0);
      }
    } else {
      const today = new Date().toDateString();
      localStorage.setItem('rentai_daily_limit', JSON.stringify({ count: 0, date: today }));
    }

    // Check for payment success
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      // Grant extra credits instead of just increasing visibleLimit
      // For simplicity, we just reset the count or increase the limit. 
      // User asked to "unlock 10 more". Let's effectively reduce the count by 10 or increase a "paidCredits" counter.
      // Simpler: Just allow 10 more for this session/day by tweaking the stored count.
      const currentData = JSON.parse(localStorage.getItem('rentai_daily_limit') || '{}');
      const newCount = Math.max(0, (currentData.count || 0) - 10);

      localStorage.setItem('rentai_daily_limit', JSON.stringify({
        count: newCount,
        date: new Date().toDateString()
      }));
      setDailyCount(newCount);

      alert("¡Pago exitoso! Se han desbloqueado más alquileres.");
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const updateDailyCount = (newItemsCount) => {
    const today = new Date().toDateString();
    const newTotal = dailyCount + newItemsCount;
    setDailyCount(newTotal);
    localStorage.setItem('rentai_daily_limit', JSON.stringify({ count: newTotal, date: today }));
  };

  const handleLoadMore = () => {
    setIsPaymentModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center bg-gradient-to-b from-[var(--surface)] to-[var(--background)]">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
          Encontrá tu Alquiler Ideal <br /> con Inteligencia Artificial
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
          Escaneamos Facebook, Instagram, Reddit y X para encontrar las mejores oportunidades.
          Nuestra IA filtra estafas y duplicados para que vos no tengas que hacerlo.
        </p>
      </section>

      <FilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        isScanning={isScanning}
      />

      <div className="container mt-8">
        {!user ? (
          <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-xl bg-[var(--surface)]/50">
            <Lock size={48} className="mx-auto mb-4 text-[var(--text-secondary)]" />
            <h2 className="text-2xl font-bold mb-2">Iniciá Sesión para Ver Alquileres</h2>
            <p className="text-[var(--text-secondary)] mb-6">
              Unite a miles de usuarios encontrando su hogar seguro.
            </p>
            <button
              onClick={() => mockAuth.signInWithPopup()}
              className="btn btn-primary"
            >
              Ingresar con Google
            </button>
          </div>
        ) : (
          <>
            {!hasSearched && listings.length === 0 && (
              <div className="text-center py-20">
                <Search size={48} className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
                <h2 className="text-xl text-[var(--text-secondary)]">
                  Ingresá una ubicación arriba para comenzar la búsqueda.
                </h2>
              </div>
            )}

            {hasSearched && listings.length === 0 && !isScanning && (
              <div className="text-center py-20">
                <h2 className="text-xl text-[var(--text-secondary)]">
                  No se encontraron resultados recientes. Intentá con otra búsqueda.
                </h2>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.slice(0, visibleLimit).map((listing, index) => (
                <ListingCard
                  key={listing.id || index}
                  listing={listing}
                  index={index}
                  onViewDetails={setSelectedListing}
                />
              ))}
            </div>

            {/* Show Paywall if we hit the limit or have hidden items */}
            {(dailyCount >= FREE_LIMIT || listings.length < allListings.length) && (
              <div className="mt-12 text-center">
                <div className="p-8 border border-[var(--border)] rounded-2xl bg-[var(--surface)]/50 backdrop-blur-sm">
                  <Lock className="mx-auto mb-4 text-[var(--primary)]" size={32} />
                  <h3 className="text-xl font-bold mb-2">Alcanzaste tu límite diario gratuito</h3>
                  <p className="text-[var(--text-secondary)] mb-6">
                    Has visto {dailyCount} de {FREE_LIMIT} propiedades gratuitas hoy.
                    <br />Desbloqueá 10 más por solo $1.000 ARS.
                  </p>
                  <div className="inline-block p-1 rounded-full bg-gradient-to-r from-[var(--primary)] to-purple-600">
                    <button
                      onClick={handleLoadMore}
                      className="px-8 py-3 bg-[var(--background)] rounded-full font-semibold hover:bg-opacity-90 transition-all"
                    >
                      Desbloquear Más Alquileres
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />

      <ListingDetailsModal
        listing={selectedListing}
        isOpen={!!selectedListing}
        onClose={() => setSelectedListing(null)}
      />
    </div>
  );
}
