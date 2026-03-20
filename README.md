# 🧭 DevMap — Tu Waze de Código

## 🚀 Descripción

DevMap es una herramienta impulsada por IA que transforma una idea de software en un **mapa visual interactivo de desarrollo**, mostrando qué construir, en qué orden y por qué.

En lugar de listas aburridas, DevMap genera un **grafo de dependencias**, ayudando a desarrolladores (especialmente juniors) a entender exactamente por dónde empezar.

---

## 🎯 Problema

Los desarrolladores junior:

* No saben por dónde empezar un proyecto
* Se sienten abrumados por la complejidad
* No entienden dependencias reales entre partes del sistema

---

## 💡 Solución

DevMap convierte una idea como:

> “Sistema de notas con React y Supabase”

En:

* Un **mapa visual (grafo)**
* Con nodos (features)
* Y conexiones (dependencias)

Ejemplo:

```
DB → Auth → Roles → Dashboard
        ↓
     Notas CRUD
```

---

## 🧠 Propuesta de Valor

* Elimina la parálisis al iniciar proyectos
* Explica dependencias reales
* Guía paso a paso al usuario
* Visual e intuitivo (tipo Google Maps del desarrollo)

---

## 🖥️ MVP (Minimum Viable Product)

### 1. Input (Home)

* Campo de texto:

  * “¿Qué quieres construir hoy?”
* Botón: “Generar Ruta”

---

### 2. Generación con IA

* Se envía la idea a un modelo LLM
* Devuelve un JSON con:

  * nodos
  * dependencias

---

### 3. Visualización (Core)

* Grafo interactivo con React Flow
* Nodos conectados por dependencias

---

### 4. Interacción básica

* Click en nodo:

  * descripción
  * explicación simple

---

## 🔥 Feature diferencial

### “¿Qué hago ahora?”

* Detecta el primer nodo ejecutable
* Lo resalta visualmente
* Reduce la confusión del usuario

---

## ⚙️ Arquitectura

### Frontend + Backend

* Next.js (App Router)

### IA

* OpenRouter (LLM)

### Base de datos (opcional)

* Supabase (guardar proyectos)

### Deploy

* CubePath

---

## 🔄 Flujo de la aplicación

```
Usuario escribe idea
        ↓
Next.js (frontend)
        ↓
API /generate
        ↓
OpenRouter (IA)
        ↓
JSON (nodes + edges)
        ↓
React Flow renderiza grafo
```

---

## 🧱 Estructura del proyecto

```
/app
  page.tsx
  /api
    /generate
      route.ts

/components
  GraphView.tsx
  InputIdea.tsx
  NodeDetail.tsx
```

---

## 📦 Estructura de datos

```json
{
  "nodes": [
    {
      "id": "auth",
      "title": "Autenticación",
      "description": "Login de usuarios"
    }
  ],
  "edges": [
    {
      "from": "db",
      "to": "auth"
    }
  ]
}
```

---

## 🧪 Tecnologías

* Next.js
* React Flow
* Tailwind CSS
* OpenRouter
* Supabase (opcional)

---

## 🎨 Experiencia de usuario (UX)

* Generación animada del mapa
* Interfaz minimalista
* Feedback en tiempo real
* Interacción simple e intuitiva

---

## 🏆 Objetivo en la hackatón

Destacar en:

1. Experiencia de usuario (UX)
2. Creatividad
3. Utilidad real

---

## 🚀 Roadmap rápido

### Fase 1 (Base)

* Input
* API fake
* Grafo estático

### Fase 2 (IA)

* Integración con OpenRouter
* Generación dinámica

### Fase 3 (UX)

* Animaciones
* “¿Qué hago ahora?”
* Panel de detalle

### Fase 4 (Deploy)

* Subir a CubePath
* URL pública

---

## 📌 Notas

* El enfoque está en UX, no en complejidad técnica
* Se prioriza demo funcional y clara
* Arquitectura simple para evitar fallos

---

## 🧠 Frase clave del proyecto

> “DevMap elimina la confusión y te dice exactamente qué hacer primero.”

---
