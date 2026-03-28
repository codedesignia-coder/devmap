"use client";

import { memo } from "react";
import { Handle, Position } from "reactflow";
import {
  Compass,
  Cpu,
  Database,
  Lock,
  CheckCircle,
  Search,
  Zap,
  Loader,
  Flag
} from "lucide-react";

const iconMap = {
  db: Database,
  auth: Lock,
  setup: Compass,
  deploy: Flag,
  logic: Cpu,
  research: Search,
  frontend: Zap,
  api: Cpu,
  testing: CheckCircle,
  cloud: Flag,
  default: Search
};

interface CustomNodeProps {
  data: {
    label: string;
    description: string;
    isStarting?: boolean;
    type?: keyof typeof iconMap;
    isStreaming?: boolean;
  };
}

const CustomNode = ({ data }: CustomNodeProps) => {
  const Icon = iconMap[data.type || "default"] || iconMap.default;
  const isStarting = data.isStarting;
  const isCompleted = (data as any).isCompleted;
  const isStreaming = data.isStreaming;
  const isSkeleton = (data as any).isSkeleton;
  // If streaming and not starting, it's just 'discovering' - don't fully lock it.
  const isLocked = !isStarting && !isCompleted && !(data as any).isAvailable && !isStreaming;

  return (
    <div className={`relative group ${isLocked ? "opacity-40 grayscale" : ""}`}>
      {/* Glow Effect for starting/available nodes - softened to prevent eye strain */}
      {(isStarting || (data as any).isAvailable) && !isCompleted && !isStreaming && (
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur-md opacity-20 group-hover:opacity-50 transition-opacity duration-700 animate-pulse"></div>
      )}

      {/* Intense Glow for pure streaming discovery nodes */}
      {isStreaming && (
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl blur-lg opacity-30 animate-pulse-slow"></div>
      )}

      {/* Completion Effect */}
      {isCompleted && (
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl blur opacity-20 transition duration-500"></div>
      )}

      <div className={`
        relative px-6 py-5 backdrop-blur-3xl border transition-all duration-500
        ${isCompleted
          ? "bg-emerald-950/30 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          : isStarting
            ? "bg-blue-900/40 border-blue-500/50 shadow-[0_4px_24px_rgba(59,130,246,0.12)] ring-1 ring-blue-400/10 scale-[1.01]"
            : isSkeleton
              ? "bg-zinc-950/20 border-zinc-800/50 border-dashed opacity-60" // Ghost node style
            : isStreaming
              ? "bg-[length:200%_auto] animate-glow-x bg-gradient-to-r from-indigo-950/60 via-indigo-900/40 to-indigo-950/60 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              : "bg-zinc-900/60 border-white/5 hover:border-white/10 hover:bg-zinc-900/80"}
        rounded-[2rem] w-[280px] hover:scale-[1.03] group/node active:scale-95
      `}>
        <Handle
          type="target"
          position={Position.Left}
          className={`-left-1.5 w-3 h-3 border-none transition-colors ${isCompleted ? "bg-emerald-500" : isStreaming && !isStarting ? "bg-zinc-600" : "bg-blue-500"}`}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`
            w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500
            ${isCompleted
              ? "bg-emerald-600 text-white"
              : isStarting
                ? "bg-blue-600 text-white animate-float"
                : isSkeleton
                  ? "bg-transparent text-zinc-700 border border-zinc-800 border-dashed"
                : isStreaming
                  ? "bg-indigo-900/50 text-indigo-300"
                  : "bg-zinc-800 text-zinc-500 group-hover/node:bg-zinc-700"}
          `}>
            {isCompleted ? <CheckCircle size={28} /> : isStreaming && !isStarting ? <Loader size={28} className={isSkeleton ? "animate-spin-slow opacity-30" : "animate-spin-slow"} /> : <Icon size={28} className={isStarting ? "drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]" : ""} />}
          </div>

          <div className="text-center space-y-1">
            <div className={`text-base font-black tracking-tight leading-none ${isCompleted ? "text-emerald-400" : isStreaming && !isStarting ? "text-indigo-200" : "text-white"}`}>
              {data.label}
            </div>
            <div className="text-[10px] text-zinc-500 font-medium line-clamp-1 max-w-[180px]">
              {data.description}
            </div>
          </div>

          {(isStarting || isCompleted || isStreaming) && (
            <div className={`
              mt-2 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border
              ${isCompleted
                ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                : isStarting 
                  ? "text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                  : isSkeleton
                    ? "text-zinc-600 bg-transparent border-dashed border-zinc-800"
                  : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"}
            `}>
              {isCompleted ? "MISIÓN CUMPLIDA" : isStarting ? "PRÓXIMA MISIÓN" : isSkeleton ? "ESPERANDO IA" : "GENERANDO INFO..."}
            </div>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Right}
          className={`-right-1.5 w-3 h-3 border-none transition-colors ${isCompleted ? "bg-emerald-500" : isStreaming ? "bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.8)]" : "bg-indigo-500"}`}
        />
      </div>
    </div>
  );
};

export default memo(CustomNode);
