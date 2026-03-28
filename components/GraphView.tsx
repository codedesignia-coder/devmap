"use client";

import { useState, useEffect, useRef } from "react";
import ReactFlow, { Background, Controls, Edge, Node, BackgroundVariant, ReactFlowInstance, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import CustomNode from "./CustomNode";

const nodeTypes = {
    custom: CustomNode,
};

interface GraphViewProps {
    graph: {
        nodes: Array<{ id: string; title: string; description: string; iconType?: string; isCompleted?: boolean }>;
        edges: Array<{ from: string; to: string }>;
    };
    onNodeSelect: (node: any) => void;
}

export default function GraphView({ graph, onNodeSelect }: GraphViewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
    const [hasInitialCentered, setHasInitialCentered] = useState(false);
    const [hasFinalCentered, setHasFinalCentered] = useState(false);

    // Synchronize prop with internal state to maintain stability during streaming
    useEffect(() => {
        if (!graph) {
            setNodes([]);
            setEdges([]);
            setHasInitialCentered(false);
            setHasFinalCentered(false);
            return;
        }

        const hasGraphEdges = graph.edges.length > 0;
        const targetNodes = new Set(graph.edges.map((e: any) => e.to));
        const startingNodes = graph.nodes.filter((n: any) => !targetNodes.has(n.id)).map((n: any) => n.id);
        const completedNodeIds = new Set(graph.nodes.filter((n: any) => n.isCompleted).map((n: any) => n.id));

        // Pre-calculate levels
        const levels: Record<string, number> = {};
        const adj: Record<string, string[]> = {};
        const revAdj: Record<string, string[]> = {};
        graph.nodes.forEach(n => { adj[n.id] = []; revAdj[n.id] = []; });
        graph.edges.forEach((e: any) => {
            if (adj[e.from]) adj[e.from].push(e.to);
            if (revAdj[e.to]) revAdj[e.to].push(e.from);
        });

        const getLevel = (id: string, index: number): number => {
            if (id in levels) return levels[id];
            if (!hasGraphEdges) return levels[id] = index;
            const predecessors = revAdj[id] || [];
            if (predecessors.length === 0) return levels[id] = index; // Stable index based fallback
            return levels[id] = Math.max(...predecessors.map(p => getLevel(p, -1))) + 1;
        };

        graph.nodes.forEach((n: any, idx: number) => getLevel(n.id, idx));

        const nodesByLevel: Record<number, string[]> = {};
        Object.entries(levels).forEach(([id, lvl]) => {
            if (!nodesByLevel[lvl]) nodesByLevel[lvl] = [];
            nodesByLevel[lvl].push(id);
        });

        // Generate Nodes
        const distanceX = 420;
        const distanceY = 280;

        const nextNodes: Node[] = graph.nodes.map((n: any, idx: number) => {
            const isStarting = startingNodes.includes(n.id);
            const lvl = levels[n.id] ?? 0;
            const nodesInThisLevel = nodesByLevel[lvl] || [n.id];
            const indexInLevel = nodesInThisLevel.indexOf(n.id);
            const posY = (indexInLevel - (nodesInThisLevel.length - 1) / 2) * distanceY;

            const incomingEdges = graph.edges.filter((e: any) => e.to === n.id);
            let isAvailable = false;
            let isNodeStarting = false;

            if (hasGraphEdges) {
                isAvailable = isStarting || (incomingEdges.length > 0 && incomingEdges.every((e: any) => completedNodeIds.has(e.from)));
                isNodeStarting = isAvailable && !n.isCompleted;
            } else {
                isAvailable = idx === 0;
                isNodeStarting = idx === 0;
            }

            return {
                id: n.id,
                type: "custom",
                data: { 
                    ...n, 
                    label: n.title, 
                    isStarting: isNodeStarting, 
                    isAvailable, 
                    type: n.iconType || "default",
                    isStreaming: !hasGraphEdges
                },
                position: { x: lvl * distanceX, y: posY },
                draggable: true,
                className: !hasGraphEdges ? "animate-pulse-subtle" : "animate-in zoom-in-50 duration-700"
            };
        });

        // --- GHOST NODES (SKELETONS) PADDING ---
        // If we are still discovering (no edges arrived yet) and have fewer than 8 nodes,
        // we append fake "Ghost" nodes to complete a path of 8, allowing React Flow to render sizes
        // and users to see an immediate full-width trail.
        if (!hasGraphEdges && nextNodes.length < 8) {
            const skeletonsNeeded = 8 - nextNodes.length;
            for (let i = 0; i < skeletonsNeeded; i++) {
                const fakeIndex = nextNodes.length;
                const posX = fakeIndex * distanceX;
                const posY = 0; // Skeletons are placed in a simple straight line

                nextNodes.push({
                    id: `skeleton-${i}`,
                    type: "custom",
                    data: {
                        label: "Rastreando misión...",
                        description: "¿Qué componente seguirá?",
                        isStarting: false,
                        isAvailable: false,
                        type: "default",
                        isStreaming: true,
                        isSkeleton: true // Triggers the dashed bordered ghost style in CustomNode
                    },
                    position: { x: posX, y: posY },
                    draggable: false,
                    className: "animate-in zoom-in-50 fade-in duration-500" // Gentle pop in
                });
            }
        }

        // Generate Edges
        let nextEdges: Edge[] = [];
        const activeNodeIds = new Set(nextNodes.map(n => n.id));

        if (hasGraphEdges) {
            nextEdges = graph.edges
                .filter((e: any) => activeNodeIds.has(e.from) && activeNodeIds.has(e.to))
                .map((e: any) => {
                    const isSourceCompleted = completedNodeIds.has(e.from);
                    return {
                        id: `${e.from}-${e.to}`,
                        source: e.from,
                        target: e.to,
                        animated: isSourceCompleted && !completedNodeIds.has(e.to),
                        style: { stroke: isSourceCompleted ? '#10b981' : '#3f3f46', strokeWidth: 4, opacity: isSourceCompleted ? 1 : 0.3 },
                    };
                });
        } else {
            nextEdges = nextNodes.slice(0, -1).map((n, i) => ({
                id: `stream-${n.id}-${nextNodes[i+1].id}`,
                source: n.id,
                target: nextNodes[i+1].id,
                animated: true,
                style: { stroke: '#4f46e5', strokeWidth: 3, opacity: 0.6, strokeDasharray: '6,6' },
                className: "animate-[pulse-slow_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(79,70,229,0.5)]"
            }));
        }

        setNodes(nextNodes);
        setEdges(nextEdges);
    }, [graph]);

    // Centering and FitView effects
    useEffect(() => {
        if (rfInstance && nodes.length > 0 && !hasInitialCentered) {
            rfInstance.fitView({ nodes: [{ id: nodes[0].id }], duration: 800, padding: 1.5 });
            setHasInitialCentered(true);
        }
    }, [rfInstance, nodes.length, hasInitialCentered]);

    useEffect(() => {
        if (rfInstance && edges.length > 0 && !hasFinalCentered && graph.edges.length > 0) {
            const timer = setTimeout(() => {
                rfInstance.fitView({ nodes: [{ id: nodes[0].id }], duration: 1500, padding: 1.5 });
                setHasFinalCentered(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [rfInstance, edges.length, hasFinalCentered, graph.edges.length]);

    // Follow discovery: Continuously focus on a window of newest nodes
    useEffect(() => {
        if (rfInstance && graph.edges.length === 0 && nodes.length > 1) {
            const lastNode = nodes[nodes.length - 1];
            // Zoom in slightly, offset to keep the newly discovered sequence on the right
            rfInstance.setCenter(lastNode.position.x - 100, lastNode.position.y || 0, { duration: 800, zoom: 0.85 });
        }
    }, [rfInstance, graph.nodes.length, graph.edges.length, nodes]);

    return (
        <div ref={containerRef} className="w-full h-full relative group selection:bg-transparent">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 via-transparent to-indigo-500/5 pointer-events-none"></div>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                onInit={setRfInstance}
                onNodeClick={(_, node) => {
                    if (rfInstance && containerRef.current) {
                        const width = containerRef.current.clientWidth;
                        const zoom = rfInstance.getZoom();
                        const shiftX = (width * 0.25) / zoom;
                        rfInstance.setCenter(node.position.x + shiftX, node.position.y, { zoom, duration: 800 });
                    }
                    onNodeSelect(node.data);
                }}
                fitView={false}
                minZoom={0.1}
                maxZoom={2}
            >
                <Background color="#1e293b" gap={25} size={1} variant={BackgroundVariant.Lines} className="opacity-20" />
                <Controls
                    showInteractive={false}
                    className="!bg-zinc-900/40 !backdrop-blur-xl !border-white/10 !fill-white !bottom-8 !left-8 !rounded-2xl !shadow-[0_0_40px_rgba(0,0,0,0.5)] !flex !flex-row !p-1 !gap-1"
                />
            </ReactFlow>
            <div className="absolute top-8 left-8 z-10 pointer-events-none space-y-3">
                <div className="bg-zinc-900/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5 flex items-center gap-4 shadow-2xl">
                    <div className="relative flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping absolute"></div>
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full relative"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Mapa Activo</span>
                        <span className="text-xs font-medium text-zinc-400">
                            {graph.edges.length === 0 ? `Descubriendo: ${nodes.length} misiones...` : "Ruta Completada"}
                        </span>
                    </div>
                </div>
                <div className="bg-zinc-900/40 backdrop-blur-xl px-5 py-4 rounded-3xl border border-white/5 shadow-2xl w-64 space-y-3 pointer-events-auto group/xp">
                    <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest leading-none">Nivel de Aventura</span>
                            <span className="text-lg font-black text-white leading-none mt-1">
                                {Math.floor((nodes.filter(n => (n.data as any).isCompleted).length / (nodes.length || 1)) * 100)}% <span className="text-blue-500 italic">XP</span>
                            </span>
                        </div>
                        <div className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-lg border border-white/5">
                            {nodes.filter(n => (n.data as any).isCompleted).length} / {nodes.length} Nodos
                        </div>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]" style={{ width: `${(nodes.filter(n => (n.data as any).isCompleted).length / (nodes.length || 1)) * 100}%` }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
