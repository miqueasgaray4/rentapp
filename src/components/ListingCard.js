'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ExternalLink, MapPin, Bed, Bath, ImageOff, ChevronLeft, ChevronRight, Heart, MessageCircle } from 'lucide-react';
import { saveListingForUser, unsaveListingForUser, isListingSaved } from '@/lib/userProfile';

export default function ListingCard({ listing, index, onViewDetails, user }) {
    const {
        title,
        price,
        currency,
        location,
        bedrooms,
        bathrooms,
        images,
        source,
        aiAnalysis,
        contact,
        url
    } = listing;

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isSaved, setIsSaved] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const isFraudRisk = aiAnalysis?.fraudScore > 0.5;
    const hasImages = images && images.length > 0;
    const hasContact = contact?.phone;

    // Check if listing is saved
    useEffect(() => {
        if (user) {
            isListingSaved(user.uid, listing.id).then(setIsSaved);
        }
    }, [user, listing.id]);

    const handleNextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const handlePrevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleSaveToggle = async (e) => {
        e.stopPropagation();

        if (!user) {
            alert('Inicia sesión para guardar alquileres');
            return;
        }

        setIsSaving(true);
        try {
            if (isSaved) {
                await unsaveListingForUser(user.uid, listing.id);
                setIsSaved(false);
            } else {
                await saveListingForUser(user.uid, listing);
                setIsSaved(true);
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            alert('Error al guardar. Intenta de nuevo.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleWhatsAppClick = (e) => {
        e.stopPropagation();
        if (hasContact) {
            const phoneNumber = contact.phone.replace(/\D/g, '');
            const message = encodeURIComponent(`Hola! Vi tu publicación de alquiler: ${title}`);
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        }
    };

    const handleViewOriginal = (e) => {
        e.stopPropagation();
        window.open(url, '_blank');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="card group flex flex-col h-full relative"
        >
            {/* Save Button */}
            <button
                onClick={handleSaveToggle}
                disabled={isSaving}
                className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-sm p-2 rounded-full hover:bg-black/80 transition-all"
                title={user ? (isSaved ? 'Quitar de guardados' : 'Guardar alquiler') : 'Inicia sesión para guardar'}
            >
                <Heart
                    size={20}
                    className={`transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`}
                />
            </button>

            {/* Image Section with Carousel */}
            <div className="relative h-48 overflow-hidden bg-gray-800 flex items-center justify-center">
                {hasImages ? (
                    <>
                        <img
                            src={images[currentImageIndex]}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling?.classList.remove('hidden');
                            }}
                        />
                        <div className="hidden flex-col items-center text-[var(--text-secondary)]">
                            <ImageOff size={32} className="mb-2 opacity-50" />
                            <span className="text-xs">Imagen no disponible</span>
                        </div>

                        {/* Image Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm p-1 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronLeft size={20} className="text-white" />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm p-1 rounded-full hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <ChevronRight size={20} className="text-white" />
                                </button>

                                {/* Image Indicators */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {images.map((_, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${idx === currentImageIndex
                                                    ? 'bg-white w-4'
                                                    : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center text-[var(--text-secondary)]">
                        <ImageOff size={32} className="mb-2 opacity-50" />
                        <span className="text-xs">Sin imagen</span>
                    </div>
                )}

                <div className="absolute top-2 right-2 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-sm text-xs px-2 py-1 rounded text-white border border-white/10">
                        {source}
                    </span>
                </div>
                {isFraudRisk && (
                    <div className="absolute top-12 right-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle size={12} /> Riesgo Alto
                    </div>
                )}
                {!isFraudRisk && (
                    <div className="absolute top-12 right-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <ShieldCheck size={12} /> Verificado IA
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg leading-tight line-clamp-2">{title}</h3>
                </div>

                <p className="text-2xl font-bold text-[var(--primary)] mb-1">
                    {price > 0 ? `${currency} $${price.toLocaleString()}` : 'Consultar Precio'}
                </p>

                <div className="flex items-center text-[var(--text-secondary)] text-sm mb-4">
                    <MapPin size={14} className="mr-1" />
                    {location}
                </div>

                {/* Features */}
                <div className="flex gap-4 mb-4 text-sm text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1">
                        <Bed size={16} />
                        <span>{bedrooms} amb</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath size={16} />
                        <span>{bathrooms} baño</span>
                    </div>
                </div>

                {/* AI Insight */}
                <div className="mb-4">
                    <p className="text-xs text-[var(--text-secondary)]">
                        <span className="text-[var(--primary)] font-semibold">Análisis IA:</span> {aiAnalysis?.summary || 'Procesando...'}
                    </p>
                </div>

                {/* Contact Buttons */}
                <div className="mt-auto pt-4 border-t border-[var(--border)] space-y-2">
                    {hasContact && (
                        <button
                            onClick={handleWhatsAppClick}
                            className="btn btn-primary w-full text-sm py-2 bg-green-600 hover:bg-green-700 border-green-600"
                        >
                            <MessageCircle size={14} className="mr-2" />
                            Contactar por WhatsApp
                        </button>
                    )}
                    <button
                        onClick={handleViewOriginal}
                        className={`btn btn-outline w-full text-sm py-2 ${hasContact ? '' : 'btn-primary'}`}
                    >
                        {hasContact ? 'Ver Publicación Original' : 'Ver Detalles'} <ExternalLink size={14} className="ml-2" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
