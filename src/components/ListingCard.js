'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, ExternalLink, MapPin, Bed, Bath, Wifi, ImageOff } from 'lucide-react';

export default function ListingCard({ listing, index, onViewDetails }) {
    const {
        title,
        price,
        currency,
        location,
        bedrooms,
        bathrooms,
        images,
        source,
        aiAnalysis
    } = listing;

    const isFraudRisk = aiAnalysis.fraudScore > 0.5;
    const hasImage = images && images.length > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="card group flex flex-col h-full relative"
        >
            {/* Image Section */}
            <div className="relative h-48 overflow-hidden bg-gray-800 flex items-center justify-center">
                {hasImage ? (
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
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
                    <div className="absolute top-2 left-2 bg-red-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <AlertTriangle size={12} /> Riesgo Alto
                    </div>
                )}
                {!isFraudRisk && (
                    <div className="absolute top-2 left-2 bg-green-500/90 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
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
                <div className="mt-auto pt-4 border-t border-[var(--border)]">
                    <p className="text-xs text-[var(--text-secondary)] mb-2">
                        <span className="text-[var(--primary)] font-semibold">Análisis IA:</span> {aiAnalysis.summary}
                    </p>
                    <button
                        onClick={() => onViewDetails && onViewDetails(listing)}
                        className="btn btn-outline w-full text-sm py-2"
                    >
                        Ver Detalles <ExternalLink size={14} className="ml-2" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
