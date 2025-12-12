'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth, googleProvider, mockAuth } from '@/lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { User, LogOut, Menu } from 'lucide-react';

export default function Navbar() {
    const [user, setUser] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        console.log("🔍 Navbar mounted, auth:", auth ? "REAL" : "MOCK");

        let unsubscribe = () => { };

        if (auth) {
            console.log("✅ Using real Firebase auth");
            unsubscribe = onAuthStateChanged(auth, (currentUser) => {
                console.log("👤 Auth state changed:", currentUser ? currentUser.email : "No user");
                setUser(currentUser);
            });
        } else {
            console.log("⚠️ Using mock auth");
            // Fallback to mock auth
            unsubscribe = mockAuth.onAuthStateChanged((currentUser) => {
                console.log("👤 Mock auth state:", currentUser ? currentUser.email : "No user");
                setUser(currentUser);
            });

            // Listen for custom events for mock auth
            const handleMockAuth = () => {
                mockAuth.onAuthStateChanged(setUser);
            };
            window.addEventListener('mock-auth-change', handleMockAuth);
            return () => {
                window.removeEventListener('mock-auth-change', handleMockAuth);
            };
        }

        return () => unsubscribe();
    }, []);

    const handleLogin = async () => {
        try {
            if (auth) {
                await signInWithPopup(auth, googleProvider);
            } else {
                await mockAuth.signInWithPopup();
            }
        } catch (error) {
            console.error("Login failed", error);
            // Fallback to mock if real fails (e.g. invalid config)
            if (auth) {
                console.log("Falling back to mock auth");
                await mockAuth.signInWithPopup();
            }
        }
    };

    const handleLogout = async () => {
        if (auth) {
            await signOut(auth);
        } else {
            await mockAuth.signOut();
        }
    };

    // Prevent hydration mismatch by only rendering auth state after mount
    if (!mounted) return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[var(--primary)]">
                    <span className="text-2xl">🏢</span> RentAI
                </Link>
            </div>
        </nav>
    );

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2 text-xl font-bold text-[var(--primary)]">
                    <span className="text-2xl">🏢</span> RentAI
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link href="/perfil" className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors">
                                Mi Perfil
                            </Link>
                            <div className="flex items-center gap-2">
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full border border-[var(--border)]"
                                />
                                <span className="text-sm font-medium">{user.displayName || user.email}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline text-xs py-2 px-3 h-8"
                            >
                                <LogOut size={14} className="mr-1" /> Salir
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="btn btn-primary"
                        >
                            <User size={18} className="mr-2" /> Ingresar con Google
                        </button>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-[var(--text-secondary)]"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] p-4">
                    {user ? (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}`}
                                    alt="Profile"
                                    className="w-10 h-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium">{user.displayName}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{user.email}</p>
                                </div>
                            </div>
                            <Link
                                href="/perfil"
                                className="btn btn-outline w-full justify-start"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User size={16} className="mr-2" /> Mi Perfil
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline w-full justify-start"
                            >
                                <LogOut size={16} className="mr-2" /> Salir
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleLogin}
                            className="btn btn-primary w-full"
                        >
                            <User size={18} className="mr-2" /> Ingresar con Google
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}
