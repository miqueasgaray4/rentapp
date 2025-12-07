'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose }) {
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/payment/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}),
            });

            const data = await response.json();

            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                alert("Error al iniciar el pago. Por favor intentá de nuevo.");
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Error de conexión.");
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative bg-[var(--surface)] border border-[var(--border)] w-full max-w-md rounded-2xl p-6 shadow-2xl"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-[var(--text-secondary)] hover:text-[var(--text-main)]"
                        >
                            <X size={24} />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[var(--primary)]">
                                <CreditCard size={32} />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Desbloqueá Más Alquileres</h2>
                            <p className="text-[var(--text-secondary)]">
                                Alcanzaste tu límite diario de 10 alquileres gratuitos. Desbloqueá 10 alquileres premium verificados por IA al instante.
                            </p>
                        </div>

                        <div className="bg-[var(--surface-highlight)] rounded-xl p-4 mb-6 border border-[var(--border)]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[var(--text-secondary)]">Paquete</span>
                                <span className="font-semibold">10 Alquileres Extra</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold">
                                <span>Total</span>
                                <span className="text-[var(--primary)]">$1.000 ARS</span>
                            </div>
                        </div>

                        <button
                            onClick={handlePayment}
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            ) : (
                                "Pagar con MercadoPago"
                            )}
                        </button>

                        <p className="text-xs text-center text-[var(--text-secondary)] mt-4">
                            Pago seguro procesado por MercadoPago.
                        </p>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
