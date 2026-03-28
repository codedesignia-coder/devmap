"use client";

import { useState, useEffect, useRef } from "react";
import GraphView from "@/components/GraphView";
import NodeDetail from "@/components/NodeDetail";
import ShareButton from "@/components/ShareButton";
import { Compass, Map as MapIcon, Cpu, Zap, Search, ChevronRight, Save } from "lucide-react";

export default function Home() {
  const [idea, setIdea] = useState("");
  const [graph, setGraph] = useState<any>(null);
  const [loaing, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [view, setView] = useState("home");
  const [status, setStatus] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);

  const loadingStatuses = [
    "Analizando requisitos...",
    "Buscando dependencias técnicas...",
    "Diseñando grafo de arquitectura...",
    "Generando misiones secuenciales..."
  ];

  // 1. Load from LocalStorage
  useEffect(() => {
    const savedGraph = localStorage.getItem("devmap_current_graph");
    const savedIdea = localStorage.getItem("devmap_current_idea");
    if (savedGraph && savedIdea) {
      setGraph(JSON.parse(savedGraph));
      setIdea(savedIdea);
      setView("map");
    }
  }, []);

  // 2. Save to LocalStorage
  useEffect(() => {
    if (graph && idea) {
      localStorage.setItem("devmap_current_graph", JSON.stringify(graph));
      localStorage.setItem("devmap_current_idea", idea);
    }
  }, [graph, idea]);

  const handleToggleComplete = (nodeId: string) => {
    if (!graph) return;
    const newNodes = graph.nodes.map((n: any) =>
      n.id === nodeId ? { ...n, isCompleted: !n.isCompleted } : n
    );
    const newGraph = { ...graph, nodes: newNodes };
    setGraph(newGraph);

    // Update selectedNode if it's the one we just toggled
    if (selectedNode && (selectedNode as any).id === nodeId) {
      setSelectedNode({ ...selectedNode, isCompleted: !(selectedNode as any).isCompleted } as any);
    }
  };

  const handleToggleSubtask = (nodeId: string, subtaskIndex: number) => {
    if (!graph) return;
    const newNodes = graph.nodes.map((n: any) => {
      if (n.id === nodeId) {
        const currentStatuses = n.subtaskStatuses || new Array(n.subtasks?.length || 0).fill(false);
        const newStatuses = [...currentStatuses];
        newStatuses[subtaskIndex] = !newStatuses[subtaskIndex];
        return { ...n, subtaskStatuses: newStatuses };
      }
      return n;
    });

    const newGraph = { ...graph, nodes: newNodes };
    setGraph(newGraph);

    // Update selectedNode if it's the one we just toggled
    if (selectedNode && (selectedNode as any).id === nodeId) {
      const updatedNode = newNodes.find((n: any) => n.id === nodeId);
      setSelectedNode(updatedNode);
    }
  };

  const handleGenerate = async () => {
    if (!idea) return;
    setLoading(true);
    setView("loading");
    setGraph(null);
    setSelectedNode(null);

    let step = 0;
    const interval = setInterval(() => {
      setStatus(loadingStatuses[step % loadingStatuses.length]);
      step++;
    }, 400);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Algo salió mal");
      }

      if (!res.body) throw new Error("No se recibió respuesta del servidor");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentGraph: { nodes: any[], edges: any[] } = { nodes: [], edges: [] };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Simple healing/partial parser for the "nodes" array
        try {
          // Identify if we have nodes
          const nodesMatch = buffer.match(/"nodes":\s*\[/);
          if (nodesMatch) {
            const nodesContent = buffer.slice(nodesMatch.index);
            // Count open/close braces to find valid objects
            let braceCount = 0;
            let startIdx = -1;
            const foundNodes = [];

            for (let i = 0; i < nodesContent.length; i++) {
              if (nodesContent[i] === '{') {
                if (braceCount === 0) startIdx = i;
                braceCount++;
              } else if (nodesContent[i] === '}') {
                braceCount--;
                if (braceCount === 0 && startIdx !== -1) {
                  try {
                    const nodeStr = nodesContent.slice(startIdx, i + 1);
                    const parsedNode = JSON.parse(nodeStr);
                    // Critical: only add nodes that have an ID and title
                    if (parsedNode.id && parsedNode.title) {
                      foundNodes.push(parsedNode);
                    }
                  } catch (e) {
                    // Object not yet complete
                  }
                }
              }
            }

            if (foundNodes.length > 0) {
              // DEDUPLICATION: Ensure unique IDs before updating state
              const uniqueNodes: any[] = [];
              const seenIds = new Set();
              for (const node of foundNodes) {
                if (!seenIds.has(node.id)) {
                  seenIds.add(node.id);
                  uniqueNodes.push(node);
                }
              }

              currentGraph = { ...currentGraph, nodes: uniqueNodes };
              setGraph({ ...currentGraph });
              if (view !== "map") setView("map");
            }
          }

          // Check for edges - replaced /s with [\s\S]* for compatibility
          const edgesMatch = buffer.match(/"edges":\s*\[([\s\S]*?)\]/);
          if (edgesMatch) {
            try {
              const edgesStr = `[${edgesMatch[1]}]`;
              const foundEdges = JSON.parse(edgesStr);
              if (foundEdges.length > 0) {
                currentGraph = { ...currentGraph, edges: foundEdges };
                setGraph({ ...currentGraph });
              }
            } catch (e) {}
          }
        } catch (e) {
          console.warn("Parsing partial JSON error:", e);
        }
      }

      // Final attempt to parse complete JSON just in case
      try {
        const finalGraph = JSON.parse(buffer);
        setGraph(finalGraph);
      } catch (e) {}

      clearInterval(interval);
    } catch (error: any) {
      console.error("Error generating graph:", error);
      alert(error.message);
      setView("home");
    } finally {
      setLoading(false);
      clearInterval(interval);
    }
  };

  return (
    <main className="min-h-screen bg-[#030712] text-white selection:bg-blue-500/30">
      {/* 1. THE ORACLE (HOME VIEW) */}
      {view === "home" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-1000">
          <div className="w-full max-w-xl text-center space-y-12">
            <header className="space-y-4">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.4)] ring-1 ring-white/10 animate-bounce-slow">
                  <Compass size={32} className="text-white" />
                </div>
                <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                  DevMap
                </h1>
              </div>
              <p className="text-blue-400 font-black tracking-[0.2em] text-sm uppercase">Tu Waze de Código</p>
              <p className="text-zinc-500 text-lg max-w-md mx-auto leading-relaxed">
                Convierte tu idea abrumadora en una ruta de misiones clara y accionable.
              </p>
            </header>

            <section className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-500 p-8 sm:p-10 rounded-[2rem] shadow-2xl">
              <div className="space-y-6">
                <div className="text-left space-y-3">
                  <div className="flex items-center gap-2.5 ml-1">
                    <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center">
                      <Search size={14} className="text-zinc-400" />
                    </div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-bold flex items-center gap-2">
                      Paso <span className="text-white font-black">1</span>: Define tu proyecto
                    </label>
                  </div>

                  <input
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                    placeholder="Ej: Clon de Twitter con Supabase y NextJS"
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-white/30 focus:bg-[#111] transition-all text-white text-base placeholder:text-zinc-600 shadow-inner"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-bold py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg"
                >
                  <Zap size={16} className="fill-black" />
                  <span className="text-base tracking-tight">Generar Ruta de Misiones</span>
                  <ChevronRight size={18} className="opacity-50" />
                </button>
              </div>
            </section>

            <footer className="pt-8 text-zinc-700 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-6">
              <span className="flex items-center gap-2"><Zap size={10} /> IA Generativa</span>
              <span className="flex items-center gap-2"><MapIcon size={10} /> Grafo Interactivo</span>
              <span className="flex items-center gap-2"><Cpu size={10} /> CubePath Ready</span>
            </footer>
          </div>
        </div>
      )}

      {/* 2. THE MAPPING (LOADING VIEW) */}
      {view === "loading" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="text-center space-y-8 max-w-sm">
            <div className="relative flex items-center justify-center w-32 h-32 mx-auto">
              {/* Spinning Ring */}
              <div className="absolute inset-0 border-4 border-blue-500/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-blue-500 rounded-full animate-spin"></div>

              <div className="bg-zinc-900 w-24 h-24 rounded-full flex items-center justify-center shadow-inner ring-1 ring-white/5">
                <Cpu size={32} className="text-blue-500 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight text-white">Consultando al Arquitecto IA</h2>
              <p className="text-zinc-500 text-sm font-medium animate-pulse">{status}</p>
            </div>
          </div>
        </div>
      )}

      {/* 3. THE QUEST MAP (MAP VIEW) */}
      {view === "map" && graph && (
        <div className="h-screen flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-1000">
          {/* Header Dashboard */}
          <header className="px-10 py-6 bg-zinc-950/50 backdrop-blur-md border-b border-white/5 flex items-center justify-between z-20">
            <div className="flex items-center gap-5">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                <MapIcon size={20} className="text-white" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-black tracking-tight text-white line-clamp-1">{idea}</h3>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-tighter">Borrador Alpha</span>
                  </div>
                  <div className="h-3 w-px bg-zinc-800"></div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Explorando Ruta</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShareButton elementRef={mapRef} fileName={`DevMap-${idea.replace(/\\s+/g, '-').toLowerCase()}`} />
              <button
                onClick={() => setView("home")}
                className="px-5 py-2 bg-white text-black rounded-xl text-xs font-black hover:bg-zinc-200 transition-all flex items-center gap-2"
              >
                <Save size={14} /> Nueva Ruta
              </button>
            </div>
          </header>

          <div ref={mapRef} className="flex-1 relative h-[75vh] mx-10 mb-10 bg-[#030712] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)]">
            <GraphView
              graph={graph}
              onNodeSelect={setSelectedNode}
            />
            <NodeDetail
              node={selectedNode}
              onClose={() => setSelectedNode(null)}
              onToggleComplete={handleToggleComplete}
              onToggleSubtask={handleToggleSubtask}
            />
            {/* HUD Footer */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10">
              <div className="bg-zinc-950/80 backdrop-blur-2xl border border-white/5 px-8 py-3 rounded-2xl flex gap-10 shadow-2xl">
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Completado</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">En Curso</span>
                </div>
                <div className="flex items-center gap-3 opacity-40">
                  <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Bloqueado</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}