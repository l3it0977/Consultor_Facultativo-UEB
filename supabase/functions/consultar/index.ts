// Edge Function "consultar" — chatbot de la Facultad de Ingeniería (UEB)
// Flujo: pregunta → leer todas las carreras y secciones de Supabase → Gemini → respuesta
// Secret requerido: GEMINI_API_KEY
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta Supabase automáticamente.

import { createClient } from "jsr:@supabase/supabase-js@2";

const MODELO_GEMINI = "gemini-2.5-flash";

const headersCors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Seccion = {
  seccion: string;
  contenido: string;
  carreras: { nombre: string; duracion: string };
};

const obtenerContexto = async (
  cliente: ReturnType<typeof createClient>,
): Promise<string> => {
  const { data, error } = await cliente
    .from("secciones_carrera")
    .select("seccion, contenido, carreras(nombre, duracion)")
    .order("carrera_id");

  if (error) throw new Error(`Error leyendo BD: ${error.message}`);

  const secciones = (data ?? []) as Seccion[];

  return secciones
    .map(
      (s) =>
        `[${s.carreras.nombre} — duración: ${s.carreras.duracion}]\n${s.contenido}`,
    )
    .join("\n\n");
};

const generarRespuestaGemini = async (
  pregunta: string,
  contexto: string,
): Promise<string> => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Falta el secret GEMINI_API_KEY.");

  const instruccion = [
    "Eres el asistente virtual de la Facultad de Ingeniería de la Universidad del Beni (UEB).",
    "Respondes dudas sobre las carreras usando ÚNICAMENTE la información del contexto entregado.",
    "Responde en español, de forma breve, clara y amable.",
    "IMPORTANTE: NO uses formato Markdown. No uses asteriscos, almohadillas, guiones ni ningún símbolo de formato.",
    "Escribe solo texto plano como si fuera una conversación normal hablada.",
    "Si la información no está en el contexto, di que no tienes ese dato y sugiere",
    "contactar directamente a la facultad. No inventes datos.",
    "",
    "=== INFORMACIÓN DE LAS CARRERAS ===",
    contexto || "(sin información disponible)",
    "=== FIN DE LA INFORMACIÓN ===",
    "",
    `Pregunta del estudiante: ${pregunta}`,
  ].join("\n");

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: instruccion }] }],
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Gemini HTTP ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  const texto = datos?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!texto) throw new Error("Gemini no devolvió texto en la respuesta.");
  return texto.trim();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: headersCors });
  }

  try {
    const { pregunta } = await req.json();
    if (!pregunta || typeof pregunta !== "string" || !pregunta.trim()) {
      return new Response(
        JSON.stringify({ error: "Falta la pregunta." }),
        { status: 400, headers: { ...headersCors, "Content-Type": "application/json" } },
      );
    }

    const cliente = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const contexto = await obtenerContexto(cliente);
    const respuesta = await generarRespuestaGemini(pregunta.trim(), contexto);

    return new Response(
      JSON.stringify({ respuesta }),
      { headers: { ...headersCors, "Content-Type": "application/json" } },
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error("Error en consultar:", mensaje);
    return new Response(
      JSON.stringify({ error: mensaje }),
      { status: 500, headers: { ...headersCors, "Content-Type": "application/json" } },
    );
  }
});
