'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';

export default function FilterBar({ onSearch, onFilterChange, isScanning }) {
    const [query, setQuery] = useState('');
    const [filters, setFilters] = useState({
        priceRange: '',
        bedrooms: ''
    });

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(query, filters);
        }
    };

    return (
        <div className="w-full bg-[var(--surface)] border-y border-[var(--border)] py-4 sticky top-16 z-40 backdrop-blur-md bg-opacity-90">
            <div className="container flex flex-col md:flex-row gap-4 items-center">

                {/* Search Input */}
                <form onSubmit={handleSubmit} className="relative flex-grow w-full md:w-auto flex gap-2">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por zona, barrio..."
                            className="input pl-10 w-full"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isScanning}
                        className="btn btn-primary whitespace-nowrap flex items-center gap-2"
                    >
                        {isScanning ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Buscando...
                            </>
                        ) : (
                            <span>Buscar</span>
                        )}
                    </button>
                </form>

                {/* Filters */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 no-scrollbar">
                    <select
                        className="input w-auto min-w-[140px] cursor-pointer"
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    >
                        <option value="">Rango de Precio</option>
                        <option value="0-300000">Hasta $300k</option>
                        <option value="300000-600000">$300k - $600k</option>
                        <option value="600000+">$600k+</option>
                    </select>

                    <select
                        className="input w-auto min-w-[120px] cursor-pointer"
                        value={filters.bedrooms}
                        onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                    >
                        <option value="">Habitaciones</option>
                        <option value="1">1 Amb</option>
                        <option value="2">2 Amb</option>
                        <option value="3">3+ Amb</option>
                    </select>

                    <button className="btn btn-outline whitespace-nowrap">
                        <SlidersHorizontal size={16} className="mr-2" /> Más Filtros
                    </button>
                </div>
            </div>
        </div>
    );
}
