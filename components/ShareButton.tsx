"use client";

import React, { useState } from 'react';
import { Share2, Check } from "lucide-react";
import { toPng } from 'html-to-image';

interface ShareButtonProps {
    elementRef: React.RefObject<HTMLDivElement | null>;
    fileName?: string;
}

export default function ShareButton({ elementRef, fileName = 'mi-devmap' }: ShareButtonProps) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleShare = async () => {
        if (!elementRef.current) return;

        setStatus('loading');
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            const dataUrl = await toPng(elementRef.current, {
                cacheBust: true,
                backgroundColor: '#030712',
                style: {
                    borderRadius: '0',
                }
            });

            const link = document.createElement('a');
            link.download = `${fileName}.png`;
            link.href = dataUrl;
            link.click();

            setStatus('success');
            setTimeout(() => setStatus('idle'), 2000);
        } catch (err) {
            console.error('Error al exportar imagen:', err);
            setStatus('idle');
        }
    };

    return (
        <button
            onClick={handleShare}
            disabled={status === 'loading'}
            className={`
                flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all active:scale-95
                ${status === 'success'
                    ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                    : "bg-zinc-900/60 backdrop-blur-xl border-white/5 text-zinc-400 hover:text-white hover:border-white/10 shadow-2xl hover:shadow-blue-500/10"}
            `}
        >
            {status === 'loading' ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            ) : status === 'success' ? (
                <Check size={18} />
            ) : (
                <Share2 size={18} />
            )}

            <span className="text-xs font-black uppercase tracking-widest leading-none">
                {status === 'loading' ? "Capturando..." : status === 'success' ? "¡Guardado!" : "Exportar Ruta"}
            </span>
        </button>
    );
}
