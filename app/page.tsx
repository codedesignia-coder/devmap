"use client";

import { useState } from "react";
import GraphView from "@/components/GraphView";
import NodeDetail from "@/components/NodeDetail";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [graph, setGraph] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleGenerate = async () => {
    if (!idea) return;
    setLoading(true);
    setGraph(null);
    setSelectedNode(null);
    
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });

      const data = await res.json();
      setGraph(data);
    } catch (error) {
      console.error("Error generating graph:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        <header className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <span className="text-2xl">🧭</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">DevMap</h1>
          </div>
          <p className="text-zinc-500 text-lg">Tu Waze de código impulsado por IA</p>
        </header>

        <section className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-3xl backdrop-blur-sm mb-8 shadow-xl">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="¿Qué quieres construir hoy? Ej: clon de twitter con supabase..."
              className="flex-1 p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-zinc-600"
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 whitespace-nowrap"
            >
              {loading ? "Generando..." : "Generar Ruta"}
            </button>
          </div>
        </section>

        {graph && (
          <div className="animate-in fade-in zoom-in-95 duration-500 relative">
            <GraphView graph={graph} onNodeSelect={setSelectedNode} />
            <NodeDetail node={selectedNode} onClose={() => setSelectedNode(null)} />
          </div>
        )}
      </div>
    </main>
  );
}