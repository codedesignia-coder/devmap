import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API Key not found. Please add it to .env.local" },
        { status: 500 }
      );
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://devmap.example.com",
        "X-Title": "DevMap",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-001",
        stream: true,
        messages: [
          {
            role: "system",
            content: `Eres un Arquitecto de Software y Product Manager experto. Tu misión es transformar una idea de software en una ruta de desarrollo visual épica "estilo quest".
Reglas de salida:
- Genera entre 8 y 12 nodos.
- Solo responde con el objeto JSON puro. Estructura exacta:
{
  "nodes": [
    { 
      "id": "1", 
      "title": "...", 
      "description": "...",
      "difficulty": "...",
      "estimatedTime": "...",
      "tech": "...",
      "iconType": "db|auth|setup|deploy|logic|research|frontend|api|testing|cloud",
      "subtasks": ["...", "..."],
      "resources": [{"label": "...", "url": "..."}]
    }
  ],
  "edges": [{ "from": "1", "to": "2" }]
}
IMPORTANTE: Los títulos y descripciones DEBEN ser en ESPAÑOL e inspiradores.`
          },
          {
            role: "user",
            content: `Idea: ${idea}`
          }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `Error de OpenRouter: ${errorData.error?.message || response.statusText}` },
        { status: response.status }
      );
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        if (!response.body) {
          controller.close();
          return;
        }

        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");

            for (const line of lines) {
              const trimmedLine = line.trim();
              if (!trimmedLine || trimmedLine === "data: [DONE]") continue;

              if (trimmedLine.startsWith("data: ")) {
                try {
                  const data = JSON.parse(trimmedLine.slice(6));
                  const text = data.choices?.[0]?.delta?.content || "";
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  // Errore parciales en JSON son normales en streaming
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error: any) {
    console.error("Unexpected Error:", error);
    return NextResponse.json(
      { error: `Error inesperado: ${error.message}` },
      { status: 500 }
    );
  }
}
