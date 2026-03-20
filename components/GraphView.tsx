"use client";

import ReactFlow, { Background, Controls, Edge, Node } from "reactflow";
import "reactflow/dist/style.css";

interface GraphViewProps {
    graph: {
        nodes: Array<{ id: string; title: string; description: string }>;
        edges: Array<{ from: string; to: string }>;
    };
    onNodeSelect: (node: any) => void;
}

export default function GraphView({ graph, onNodeSelect }: GraphViewProps) {
    const nodes: Node[] = graph.nodes.map((n, i) => ({
        id: n.id,
        data: { label: n.title, description: n.description },
        position: { x: i * 200, y: (i % 2) * 100 },
        className: 'bg-zinc-900 text-white border-zinc-700 rounded-lg p-2 font-medium shadow-lg hover:border-blue-500 transition-colors cursor-pointer',
        style: { width: 150 }
    }));

    const edges: Edge[] = graph.edges.map((e) => ({
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        animated: true,
        style: { stroke: '#444' },
    }));

    return (
        <div className="w-full h-[60vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-inner">
            <ReactFlow 
                nodes={nodes} 
                edges={edges}
                onNodeClick={(_, node) => onNodeSelect({ title: node.data.label, description: node.data.description })}
                fitView
            >
                <Background color="#222" gap={20} />
                <Controls className="bg-zinc-800 fill-white" />
            </ReactFlow>
        </div>
    );
}