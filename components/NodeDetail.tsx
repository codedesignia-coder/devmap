"use client";

interface Node {
    id: string;
    title: string;
    description: string;
}

interface NodeDetailProps {
    node: Node | null;
    onClose: () => void;
}

export default function NodeDetail({ node, onClose }: NodeDetailProps) {
    if (!node) return null;

    return (
        <div className="fixed right-6 top-24 w-80 bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-2xl animate-in slide-in-from-right-4">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-white">{node.title}</h3>
                <button 
                    onClick={onClose}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
                {node.description}
            </p>
            <div className="mt-6">
                <div className="text-[10px] uppercase tracking-widest text-zinc-600 font-bold mb-2">Estado</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-xs text-zinc-300">Pendiente</span>
                </div>
            </div>
        </div>
    );
}
