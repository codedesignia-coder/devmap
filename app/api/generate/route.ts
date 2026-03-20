import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { idea } = await req.json();

  // Mock response for Phase 1
  const mockGraph = {
    nodes: [
      { id: "1", title: "Configuración Base", description: "Configurar el proyecto y dependencias iniciales." },
      { id: "2", title: "Autenticación", description: "Implementar login y registro de usuarios." },
      { id: "3", title: "Base de Datos", description: "Esquema inicial de tablas." },
      { id: "4", title: "Dashboard", description: "Vista principal para el usuario autenticado." }
    ],
    edges: [
      { from: "1", to: "2" },
      { from: "1", to: "3" },
      { from: "2", to: "4" },
      { from: "3", to: "4" }
    ]
  };

  return NextResponse.json(mockGraph);
}
