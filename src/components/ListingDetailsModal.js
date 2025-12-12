'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Bed, Bath, Wifi, ShieldCheck, AlertTriangle, ExternalLink, Calendar, DollarSign, Share2, Heart, ImageOff } from 'lucide-react';

export default function ListingDetailsModal({ listing, isOpen, onClose }) {
    if (!listing) return null;

    const {
        title,
        description,
        price,
        currency,
        location,
        bedrooms,
        bathrooms,
        amenities,
        images,
        source,
        aiAnalysis,
        postedAt,
        contact
    } = listing;

    const isFraudRisk = aiAnalysis.fraudScore > 0.5;
    const hasImage = images && images.length > 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-[var(--surface)] border border-[var(--border)] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl flex flex-col md:flex-row"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-10 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                        >
                            <X size={20} />
                        </button>

                        {/* Image Section (Left/Top) */}
                        <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-gray-900 flex items-center justify-center">
                            {hasImage ? (
                                <img
                                    src={images[0]}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex flex-col items-center text-[var(--text-secondary)]">
                                    <ImageOff size={48} className="mb-4 opacity-50" />
                                    <span>Sin imagen disponible</span>
                                </div>
                            )}
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="bg-black/60 backdrop-blur-sm text-xs px-3 py-1.5 rounded-full text-white border border-white/10">
                                    Fuente: {source}
                                </span>
                            </div>
                        </div>

                        {/* Content Section (Right/Bottom) */}
                        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col">
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    {isFraudRisk ? (
                                        <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-red-500/20">
                                            <AlertTriangle size={12} /> Riesgo Alto
                                        </span>
                                    ) : (
                                        <span className="bg-green-500/10 text-green-500 text-xs font-bold px-2 py-1 rounded flex items-center gap-1 border border-green-500/20">
                                            <ShieldCheck size={12} /> Verificado IA
                                        </span>
                                    )}
                                    <span className="text-[var(--text-secondary)] text-xs flex items-center gap-1">
                                        <Calendar size={12} /> Publicado {new Date(postedAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-bold mb-2 leading-tight">{title}</h2>
                                <div className="flex items-center text-[var(--text-secondary)] text-sm mb-4">
                                    <MapPin size={16} className="mr-1 text-[var(--primary)]" />
                                    {location}
                                </div>

                                <div className="text-3xl font-bold text-[var(--primary)] mb-6">
                                    {price > 0 ? `${currency} $${price.toLocaleString()}` : 'Consultar Precio'}
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-[var(--surface-highlight)] rounded-xl border border-[var(--border)]">
                                    <div className="text-center">
                                        <div className="flex justify-center mb-1 text-[var(--text-secondary)]"><Bed size={20} /></div>
                                        <div className="font-semibold">{bedrooms} Amb</div>
                                    </div>
                                    <div className="text-center border-l border-[var(--border)]">
                                        <div className="flex justify-center mb-1 text-[var(--text-secondary)]"><Bath size={20} /></div>
                                        <div className="font-semibold">{bathrooms} Baños</div>
                                    </div>
                                    <div className="text-center border-l border-[var(--border)]">
                                        <div className="flex justify-center mb-1 text-[var(--text-secondary)]"><Wifi size={20} /></div>
                                        <div className="font-semibold">WiFi</div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Descripción</h3>
                                    <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                <div className="mb-6">
                                    <h3 className="font-semibold mb-2">Análisis IA</h3>
                                    <div className="bg-[var(--surface-highlight)] p-4 rounded-xl border border-[var(--border)] text-sm">
                                        <p className="mb-2"><span className="text-[var(--text-secondary)]">Precio:</span> <span className="font-medium">{aiAnalysis.priceRating}</span></p>
                                        <p><span className="text-[var(--text-secondary)]">Resumen:</span> {aiAnalysis.summary}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Section */}
                            {contact?.phone && (
                                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                                        <span className="text-green-600">📱</span> Información de Contacto
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--text-secondary)]">Teléfono:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-medium">{contact.phone}</span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(contact.phone);
                                                        alert('Número copiado al portapapeles');
                                                    }}
                                                    className="text-xs text-[var(--primary)] hover:underline"
                                                >
                                                    Copiar
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-[var(--text-secondary)]">Extraído de:</span>
                                            <span className="font-medium capitalize">{contact.source === 'image' ? 'Imagen (OCR)' : 'Texto'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-auto space-y-3">
                                {contact?.phone ? (
                                    <>
                                        <button
                                            onClick={() => {
                                                const phoneNumber = contact.phone.replace(/\D/g, '');
                                                const message = encodeURIComponent(`Hola! Vi tu publicación de alquiler: ${title}`);
                                                window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
                                            }}
                                            className="btn btn-primary w-full py-3 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 border-green-600"
                                        >
                                            <span className="text-xl">💬</span> Contactar por WhatsApp
                                        </button>
                                        <button
                                            onClick={() => window.open(listing.url, '_blank')}
                                            className="btn btn-outline w-full py-3 flex items-center justify-center gap-2"
                                        >
                                            Ver Publicación Original <ExternalLink size={18} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => window.open(listing.url, '_blank')}
                                        className="btn btn-primary w-full py-3 flex items-center justify-center gap-2"
                                    >
                                        Ver Publicación Original <ExternalLink size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
