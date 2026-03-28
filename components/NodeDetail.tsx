import { useState, useEffect } from "react";

interface Node {
    id: string;
    title: string;
    description: string;
    difficulty?: string;
    estimatedTime?: string;
    tech?: string;
    isStarting?: boolean;
    isCompleted?: boolean;
    subtasks?: string[];
    subtaskStatuses?: boolean[];
    resources?: { label: string; url: string }[];
}

interface NodeDetailProps {
    node: Node | null;
    onClose: () => void;
    onToggleComplete?: (id: string) => void;
    onToggleSubtask?: (nodeId: string, subtaskIndex: number) => void;
}

export default function NodeDetail({ node, onClose, onToggleComplete, onToggleSubtask }: NodeDetailProps) {
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        setCurrentStep(1);
    }, [node?.id]);

    if (!node) return null;

    return (
        <div className="absolute inset-y-0 right-0 z-50 w-full max-w-[460px] lg:max-w-[500px] flex flex-col overflow-hidden leading-relaxed pointer-events-none">
            {/* Main Flex Wrapper */}
            <div className="relative flex-1 flex flex-col animate-in slide-in-from-right-full duration-500 cubic-bezier(0.16, 1, 0.3, 1)">

                {/* Integrated Navigation Header (Always Fixed) */}
                <div className="absolute top-0 inset-x-0 pt-6 px-6 z-[70] pointer-events-none flex items-center justify-between">
                    <div className="pointer-events-auto flex items-center gap-2">
                        <button
                            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                            disabled={currentStep === 1}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-2xl ${currentStep === 1
                                ? "opacity-0 invisible -translate-x-4"
                                : "bg-zinc-900/80 backdrop-blur-xl border-white/10 text-white hover:bg-zinc-800 active:scale-95"
                                }`}
                        >
                            <span className="text-lg">←</span>
                        </button>
                    </div>

                    <div className="pointer-events-auto flex items-center gap-2">
                        <button
                            onClick={() => setCurrentStep(prev => Math.min(3, prev + 1))}
                            disabled={currentStep === 3}
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-2xl ${currentStep === 3
                                ? "opacity-0 invisible translate-x-4"
                                : "bg-zinc-900/80 backdrop-blur-xl border-white/10 text-white hover:bg-zinc-800 active:scale-95"
                                }`}
                        >
                            <span className="text-lg">→</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl border border-white/10 bg-zinc-900/80 backdrop-blur-xl text-zinc-400 hover:text-white hover:bg-zinc-800 shadow-2xl flex items-center justify-center transition-all active:scale-95"
                        >
                            <span className="text-lg font-light">✕</span>
                        </button>
                    </div>
                </div>

                {/* Scrolling Area (Strict Flex-1) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    <style jsx>{`
                        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
                    `}</style>

                    {/* Step 1: Briefing */}
                    {currentStep === 1 && (
                        <div className="px-6 pt-20 pb-4 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-auto">

                            {/* Briefing Card */}
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 lg:p-6 rounded-3xl shadow-2xl space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${node.isCompleted ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : 'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)] animate-pulse'}`}></div>
                                    <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Misión: {node.isCompleted ? 'Finalizada' : 'En Curso'}</span>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight max-w-[95%]">
                                        {node.title}
                                    </h3>
                                    <div className="w-12 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.1)]"></div>
                                </div>

                                <p className="text-[14px] text-zinc-300 font-medium leading-relaxed">
                                    {node.description}
                                </p>
                            </div>

                            {/* Stats Wrapper */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900/60 backdrop-blur-xl p-4 lg:p-5 rounded-[1.5rem] border border-white/10 flex flex-col gap-1 shadow-2xl">
                                    <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">Dificultad</span>
                                    <div className={`text-sm lg:text-base font-black tracking-tight ${node.difficulty === "Difícil" ? "text-rose-500" :
                                        node.difficulty === "Medio" ? "text-amber-500" : "text-emerald-500"
                                        }`}>{node.difficulty || "Estándar"}</div>
                                </div>
                                <div className="bg-zinc-900/60 backdrop-blur-xl p-4 lg:p-5 rounded-[1.5rem] border border-white/10 flex flex-col gap-1 shadow-2xl">
                                    <span className="text-[9px] font-black text-white/30 tracking-widest uppercase mb-1">Inversión</span>
                                    <div className="text-sm lg:text-base font-black text-zinc-100 tracking-tight italic">{node.estimatedTime || "~45m"}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 1: Operations */}
                    {currentStep === 2 && (
                        <div className="px-6 pt-20 pb-4 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-auto">
                            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 lg:p-6 rounded-3xl shadow-2xl">
                                <div className="flex items-end justify-between border-b border-white/10 pb-4 mb-4">
                                    <div className="space-y-1">
                                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest font-mono">Operations_Unit</h4>
                                        <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase italic leading-none">Pasos Misión</h3>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg lg:text-xl font-black text-zinc-100 tabular-nums">
                                            {node.subtaskStatuses ? node.subtaskStatuses.filter(s => s).length : 0}
                                            <span className="text-zinc-600 text-sm mx-1">/</span>
                                            {node.subtasks?.length || 0}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    {node.subtasks?.map((task, i) => {
                                        const isSubtaskCompleted = node.isCompleted || (node.subtaskStatuses && node.subtaskStatuses[i]);
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => onToggleSubtask && onToggleSubtask(node.id, i)}
                                                className={`flex items-center gap-3 lg:gap-4 p-3 lg:p-4 rounded-2xl border transition-all duration-300 text-left ${isSubtaskCompleted
                                                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-blue-500/40'
                                                    }`}
                                            >
                                                <div className={`shrink-0 w-4 h-4 lg:w-5 lg:h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSubtaskCompleted
                                                    ? 'bg-emerald-500 border-emerald-400 text-black'
                                                    : 'bg-black/40 border-white/20'
                                                    }`}>
                                                    {isSubtaskCompleted && <span className="text-[8px] lg:text-[9px] font-black">✓</span>}
                                                </div>
                                                <span className={`text-[12px] lg:text-[13px] font-bold tracking-tight leading-snug transition-all duration-300 ${isSubtaskCompleted
                                                    ? 'text-zinc-600 line-through opacity-60'
                                                    : 'text-zinc-200'
                                                    }`}>
                                                    {task}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Intel & Extraction */}
                    {currentStep === 3 && (
                        <div className="px-6 pt-20 pb-4 space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-700 cubic-bezier(0.16, 1, 0.3, 1) pointer-events-auto">
                            <section className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 p-5 lg:p-6 rounded-3xl shadow-2xl space-y-3">
                                <div className="flex items-baseline gap-3 mb-1">
                                    <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight uppercase italic">Recursos</h3>
                                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Intel_Data</span>
                                </div>
                                <div className="grid gap-2">
                                    {node.resources?.map((res, i) => (
                                        <a
                                            key={i}
                                            href={res.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group/link flex items-center justify-between p-3 lg:p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-600/10 hover:border-blue-500/40 transition-all duration-300"
                                        >
                                            <div className="flex flex-col">
                                                <span className="text-[12px] lg:text-[13px] font-black text-zinc-200 group-hover/link:text-white">{res.label || "Manual_Intel"}</span>
                                            </div>
                                            <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/link:bg-blue-500/20 group-hover/link:text-blue-400 transition-all">
                                                <span className="text-sm">↗</span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </section>

                            <section className="bg-zinc-900/60 backdrop-blur-xl p-5 lg:p-6 rounded-3xl border border-white/10 shadow-2xl">
                                <h3 className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-3 flex items-center gap-3">
                                    <span className="w-4 h-[1px] bg-white/10"></span>
                                    Stack_Tecnológico
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {node.tech?.split(',').map(t => (
                                        <span key={t} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] lg:text-[10px] font-bold text-zinc-300 uppercase tracking-wide hover:text-white hover:border-blue-500/40 transition-all cursor-default">#{t.trim()}</span>
                                    ))}
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Fixed Action & Stepper Footer */}
                <div className="shrink-0 px-6 flex flex-col pointer-events-none z-[70] pb-6 gap-4">

                    {/* Persistent Action Area - Always visible when in Step 3 */}
                    <div className={`transition-all duration-500 origin-bottom ${currentStep === 3 ? 'scale-100 opacity-100 min-h-0' : 'scale-95 opacity-0 h-0 overflow-hidden'}`}>
                        <button
                            onClick={() => {
                                onToggleComplete && onToggleComplete(node.id);
                                if (!node.isCompleted) onClose();
                            }}
                            className={`pointer-events-auto w-full py-4 rounded-2xl font-black text-[11px] lg:text-xs uppercase tracking-widest transition-all duration-300 active:scale-[0.98] border shadow-2xl ${node.isCompleted
                                ? "bg-zinc-900/90 border-transparent text-zinc-500"
                                : "bg-white text-black border-white hover:bg-zinc-200"
                                }`}
                        >
                            {node.isCompleted ? "Nodo_Deshabilitado" : "Finalizar Misión"}
                        </button>
                    </div>

                    <div className="flex items-center justify-center">
                        <div className="flex gap-2 px-3 py-2 bg-zinc-900/80 backdrop-blur-xl rounded-full border border-white/10 pointer-events-auto shadow-2xl">
                            {[1, 2, 3].map(step => (
                                <button
                                    key={step}
                                    onClick={() => setCurrentStep(step)}
                                    className={`transition-all duration-300 rounded-full h-1.5 ${currentStep === step ? 'bg-blue-500 w-6' : 'bg-white/20 w-1.5 hover:bg-white/40'}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
