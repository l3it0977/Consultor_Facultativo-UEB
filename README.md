# Consultor Facultativo UEB — Chatbot IA de la Facultad

Asistente virtual con IA para la Facultad de Ingeniería. Los estudiantes escriben su
nombre, conversan con un chatbot que responde dudas sobre las carreras a partir de
documentos PDF indexados, y un **avatar 3D** pronuncia en voz alta cada respuesta.

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **3D:** three.js + @react-three/fiber + @react-three/drei (avatar `.glb`)
- **Voz:** Web Speech API del navegador (TTS en español)
- **Base de datos:** Supabase (PostgreSQL + pgvector)
- **Embeddings:** Hugging Face (`sentence-transformers/all-MiniLM-L6-v2`, 384 dims)
- **LLM:** Google Gemini (`gemini-1.5-flash`)

## Módulos

1. **Autenticación / Acceso** — login solo con nombre (sin contraseña), guardado en
   `localStorage`. El bot saluda por el nombre ("Hola Leo").
2. **Indexación de PDFs** (`scripts/`) — extrae texto, divide en chunks, genera
   embeddings y los guarda en la tabla `documentos_facultad`.
3. **Chatbot RAG** — pregunta → embedding → búsqueda vectorial → Gemini → respuesta
   hablada por el avatar. La lógica corre en la Edge Function `consultar`.

## Puesta en marcha

### 1. Base de datos (una vez)

Ejecutar `supabase/sql/setup.sql` en el editor SQL del panel de Supabase. Crea la
extensión `vector`, la tabla `documentos_facultad`, el índice y la función
`match_documentos`.

### 2. Indexar documentos

```bash
cd scripts
cp .env.example .env   # completar SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HF_API_KEY
npm install
npm run indexar -- ruta/al/documento.pdf
```

### 3. Edge Function (el cerebro)

Requiere [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase login
supabase link --project-ref <TU_PROJECT_REF>
# Secrets (SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY se inyectan solos)
supabase secrets set HF_API_KEY=xxxx GEMINI_API_KEY=xxxx
supabase functions deploy consultar
```

Conseguir la API key de Gemini (gratis) en https://aistudio.google.com/apikey

### 4. Frontend

```bash
cp .env.example .env.local   # completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

### 5. Avatar 3D

Colocar el modelo del avatar en `public/avatar.glb`. Si el `.glb` incluye animaciones,
se reproduce la primera mientras el avatar habla; si no, se aplica un balanceo sutil.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo (frontend) |
| `npm run build` | Compilación de producción |
| `npm run lint` | ESLint |
| `npm run indexar` (en `scripts/`) | Indexa un PDF en Supabase |
