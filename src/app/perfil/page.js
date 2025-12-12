'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, mockAuth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getSavedListings, getRecentSearches, clearRecentSearches, getUserPreferences, updateUserPreferences, unsaveListingForUser } from '@/lib/userProfile';
import ListingCard from '@/components/ListingCard';
import { User, Search, Settings, Trash2, Clock, Heart, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PerfilPage() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savedListings, setSavedListings] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [preferences, setPreferences] = useState({ language: 'es' });
    const [activeTab, setActiveTab] = useState('saved'); // 'saved' | 'searches' | 'settings'

    useEffect(() => {
        let unsubscribe = () => { };

        const handleUser = async (currentUser) => {
            if (!currentUser) {
                router.push('/');
                return;
            }

            setUser(currentUser);

            // Load user data
            const [listings, searches, prefs] = await Promise.all([
                getSavedListings(currentUser.uid),
                getRecentSearches(currentUser.uid, 20),
                getUserPreferences(currentUser.uid)
            ]);

            setSavedListings(listings);
            setRecentSearches(searches);
            setPreferences(prefs);
            setLoading(false);
        };

        if (auth) {
            unsubscribe = onAuthStateChanged(auth, handleUser);
        } else {
            unsubscribe = mockAuth.onAuthStateChanged(handleUser);
            const handleMockAuth = () => mockAuth.onAuthStateChanged(handleUser);
            window.addEventListener('mock-auth-change', handleMockAuth);
            return () => {
                window.removeEventListener('mock-auth-change', handleMockAuth);
                unsubscribe();
            };
        }

        return () => unsubscribe();
    }, [router]);

    const handleUnsave = async (listingId) => {
        if (!user) return;

        const success = await unsaveListingForUser(user.uid, listingId);
        if (success) {
            setSavedListings(prev => prev.filter(l => l.id !== listingId));
        }
    };

    const handleClearSearches = async () => {
        if (!user || !confirm('¿Seguro que querés borrar todo tu historial de búsquedas?')) return;

        const success = await clearRecentSearches(user.uid);
        if (success) {
            setRecentSearches([]);
        }
    };

    const handleLanguageChange = async (newLang) => {
        if (!user) return;

        const newPrefs = { ...preferences, language: newLang };
        const success = await updateUserPreferences(user.uid, newPrefs);
        if (success) {
            setPreferences(newPrefs);
        }
    };

    const handleSearchAgain = (query) => {
        router.push(`/?search=${encodeURIComponent(query)}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    return (
        <div className="container py-8">
            {/* Profile Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--surface)] rounded-2xl p-8 mb-8 border border-[var(--border)]"
            >
                <div className="flex items-center gap-6">
                    <img
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.displayName || 'User')}&size=128`}
                        alt="Profile"
                        className="w-24 h-24 rounded-full border-4 border-[var(--primary)]"
                    />
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{user?.displayName}</h1>
                        <p className="text-[var(--text-secondary)]">{user?.email}</p>
                        <div className="flex gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2">
                                <Heart size={16} className="text-[var(--primary)]" />
                                <span>{savedListings.length} guardados</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Search size={16} className="text-[var(--primary)]" />
                                <span>{recentSearches.length} búsquedas</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
                <button
                    onClick={() => setActiveTab('saved')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'saved'
                            ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                        }`}
                >
                    <Heart size={18} className="inline mr-2" />
                    Alquileres Guardados
                </button>
                <button
                    onClick={() => setActiveTab('searches')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'searches'
                            ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                        }`}
                >
                    <Clock size={18} className="inline mr-2" />
                    Búsquedas Recientes
                </button>
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`px-6 py-3 font-medium transition-all ${activeTab === 'settings'
                            ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]'
                            : 'text-[var(--text-secondary)] hover:text-[var(--text-main)]'
                        }`}
                >
                    <Settings size={18} className="inline mr-2" />
                    Configuración
                </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Saved Listings Tab */}
                {activeTab === 'saved' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {savedListings.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-xl">
                                <Heart size={48} className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
                                <h3 className="text-xl font-semibold mb-2">No tenés alquileres guardados</h3>
                                <p className="text-[var(--text-secondary)]">
                                    Guardá tus alquileres favoritos para verlos más tarde
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {savedListings.map((listing, index) => (
                                    <div key={listing.id} className="relative">
                                        <ListingCard
                                            listing={listing}
                                            index={index}
                                            user={user}
                                        />
                                        <button
                                            onClick={() => handleUnsave(listing.id)}
                                            className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all z-20"
                                            title="Quitar de guardados"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Recent Searches Tab */}
                {activeTab === 'searches' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        {recentSearches.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-[var(--border)] rounded-xl">
                                <Search size={48} className="mx-auto mb-4 text-[var(--text-secondary)] opacity-50" />
                                <h3 className="text-xl font-semibold mb-2">No hay búsquedas recientes</h3>
                                <p className="text-[var(--text-secondary)]">
                                    Tus búsquedas aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Historial de Búsquedas</h3>
                                    <button
                                        onClick={handleClearSearches}
                                        className="btn btn-outline text-sm py-2 px-4 text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 size={14} className="mr-2" />
                                        Borrar Todo
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {recentSearches.map((search, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center justify-between p-4 bg-[var(--surface)] rounded-lg border border-[var(--border)] hover:border-[var(--primary)] transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Search size={18} className="text-[var(--text-secondary)]" />
                                                <div>
                                                    <p className="font-medium">{search.query}</p>
                                                    <p className="text-xs text-[var(--text-secondary)]">
                                                        {new Date(search.searchedAt).toLocaleDateString('es-AR', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleSearchAgain(search.query)}
                                                className="btn btn-outline text-sm py-2 px-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                Buscar de nuevo
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="max-w-2xl"
                    >
                        <div className="space-y-6">
                            {/* Language Setting */}
                            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <Globe size={24} className="text-[var(--primary)]" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Idioma</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Seleccioná tu idioma preferido
                                        </p>
                                    </div>
                                </div>
                                <select
                                    value={preferences.language}
                                    onChange={(e) => handleLanguageChange(e.target.value)}
                                    className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg focus:outline-none focus:border-[var(--primary)] transition-colors"
                                >
                                    <option value="es">Español</option>
                                    <option value="en">English</option>
                                </select>
                            </div>

                            {/* Account Info */}
                            <div className="p-6 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                                <div className="flex items-center gap-3 mb-4">
                                    <User size={24} className="text-[var(--primary)]" />
                                    <div>
                                        <h3 className="text-lg font-semibold">Información de Cuenta</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">
                                            Detalles de tu cuenta de Google
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Nombre:</span>
                                        <span className="font-medium">{user?.displayName}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Email:</span>
                                        <span className="font-medium">{user?.email}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-[var(--text-secondary)]">Proveedor:</span>
                                        <span className="font-medium">Google</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
