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

type Materia = {
  semestre: number | null;
  sigla: string;
  nombre: string;
  creditos: number;
  prerequisitos: string | null;
  es_electiva: boolean;
  carreras: { nombre: string };
};

type Contacto = {
  tipo: string;
  detalle: string;
};

const ORDINALES = [
  "",
  "Primer",
  "Segundo",
  "Tercer",
  "Cuarto",
  "Quinto",
  "Sexto",
  "Séptimo",
  "Octavo",
];

const formatearSecciones = (secciones: Seccion[]): string =>
  secciones
    .map(
      (s) =>
        `[${s.carreras.nombre} — duración: ${s.carreras.duracion}]\n${s.contenido}`,
    )
    .join("\n\n");

const describirMateria = (m: Materia): string => {
  const req = m.prerequisitos ? ` [requisito: ${m.prerequisitos}]` : "";
  return `${m.sigla} ${m.nombre} (${m.creditos} CR)${req}`;
};

const formatearMaterias = (materias: Materia[]): string => {
  if (materias.length === 0) return "";

  const carrera = materias[0]?.carreras?.nombre ?? "la carrera";
  const regulares = materias.filter((m) => !m.es_electiva);
  const electivas = materias.filter((m) => m.es_electiva);

  const lineas: string[] = [
    `PLAN DE ESTUDIOS (materias por semestre) — ${carrera}:`,
  ];

  for (let s = 1; s <= 8; s++) {
    const delSemestre = regulares.filter((m) => m.semestre === s);
    if (delSemestre.length === 0) continue;
    lineas.push(
      `${ORDINALES[s]} semestre: ${delSemestre.map(describirMateria).join("; ")}.`,
    );
  }

  if (electivas.length > 0) {
    lineas.push(`Materias electivas: ${electivas.map(describirMateria).join("; ")}.`);
  }

  return lineas.join("\n");
};

const formatearContacto = (contactos: Contacto[]): string =>
  contactos.length === 0
    ? ""
    : "INFORMACIÓN DE CONTACTO:\n" +
      contactos.map((c) => `${c.tipo}: ${c.detalle}`).join("\n");

const obtenerContexto = async (
  cliente: ReturnType<typeof createClient>,
): Promise<string> => {
  // Las secciones son obligatorias; materias y contacto son opcionales (puede
  // que aún no exista la tabla si no se corrió el SQL nuevo), así que si fallan
  // simplemente las omitimos en lugar de tumbar toda la consulta.
  const [secRes, matRes, conRes] = await Promise.all([
    cliente
      .from("secciones_carrera")
      .select("seccion, contenido, carreras(nombre, duracion)")
      .order("carrera_id"),
    cliente
      .from("materias")
      .select(
        "semestre, sigla, nombre, creditos, prerequisitos, es_electiva, carreras(nombre)",
      )
      .order("carrera_id")
      .order("es_electiva")
      .order("semestre")
      .order("sigla"),
    cliente.from("contacto").select("tipo, detalle"),
  ]);

  if (secRes.error) throw new Error(`Error leyendo BD: ${secRes.error.message}`);

  const partes = [
    formatearSecciones((secRes.data ?? []) as Seccion[]),
    matRes.error ? "" : formatearMaterias((matRes.data ?? []) as Materia[]),
    conRes.error ? "" : formatearContacto((conRes.data ?? []) as Contacto[]),
  ].filter((p) => p.length > 0);

  return partes.join("\n\n");
};

const generarRespuestaGemini = async (
  pregunta: string,
  contexto: string,
): Promise<string> => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Falta el secret GEMINI_API_KEY.");

  const instruccion = [
    "Eres Faculto, el asistente virtual de la Universidad Evangélica Boliviana (UEB), especializado en su Facultad de Ingeniería.",
    "Hablas en español con un tono cercano, natural y amable, como una persona conversando, NO como un folleto.",
    "Puedes mantener una charla natural: saluda, responde cortesías, haz pequeños comentarios y sigue el hilo de la conversación.",
    "Tu tema es la UEB: sus carreras, materias, créditos, requisitos, perfiles, duración, contacto, etc.",
    "Mientras la conversación gire en torno a la UEB —o sea charla social normal como saludos o agradecimientos— respóndela con naturalidad.",
    "SOLO si el usuario pregunta o comenta algo que claramente NO tiene que ver con la UEB ni es una cortesía (por ejemplo política, deportes, recetas, otros temas ajenos), responde amablemente: 'No tengo información sobre eso, pero con gusto te ayudo con cualquier cosa sobre la UEB.'",
    "IMPORTANTE, al pronunciar este tipo de letras 'I', 'II' , 'III', son en numeración romana, es decir '1', '2' y '3' respectivamente.",
    "Solo si preguntan '¿Quién es tu creador?' o '¿Quién te creó?', responde: 'Soy un asistente virtual creado por unos estudiantes altamente guapos de la Universidad Evangélica Boliviana (UEB) para ayudarte con información sobre la Facultad de Ingeniería.'",
    "Sé claro y CONCISO: responde primero lo esencial en pocas frases. No envíes un testamento en cada respuesta.",
    "Solo si el usuario pide más detalle, más información o que profundices, entonces da una respuesta más larga y completa.",
    "Para datos concretos (materias, créditos, requisitos, duración, contacto) usa ÚNICAMENTE la información del contexto. No inventes datos: si algo no está en el contexto, dilo con sinceridad y sugiere contactar a la facultad.",
    "IMPORTANTE: NO uses formato Markdown. Nada de asteriscos, almohadillas, guiones de lista ni símbolos de formato. Solo texto plano, como en una conversación hablada.",
    "",
    "=== INFORMACIÓN DE LA UEB (FACULTAD DE INGENIERÍA) ===",
    contexto || "(sin información disponible)",
    "=== FIN DE LA INFORMACIÓN ===",
    "",
    `Mensaje del estudiante: ${pregunta}`,
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

// Transcribe un audio (base64) a texto usando Gemini. Lo usa la interfaz de
// voz: en vez de depender del reconocimiento del navegador (frágil, da
// "network"), grabamos el audio y lo transcribimos aquí.
const transcribirAudio = async (
  audioBase64: string,
  mimeType: string,
): Promise<string> => {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) throw new Error("Falta el secret GEMINI_API_KEY.");

  const instruccion =
    "Transcribe exactamente lo que dice la persona en este audio. " +
    "Devuelve únicamente la transcripción en español, sin comillas ni texto adicional. " +
    "Si el audio está vacío o no se entiende nada, responde con una cadena vacía.";

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${MODELO_GEMINI}:generateContent?key=${apiKey}`;

  const respuesta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: instruccion },
          { inlineData: { mimeType: mimeType, data: audioBase64 } },
        ],
      }],
    }),
  });

  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`Gemini (audio) HTTP ${respuesta.status}: ${detalle}`);
  }

  const datos = await respuesta.json();
  const texto = datos?.candidates?.[0]?.content?.parts?.[0]?.text;
  return (texto ?? "").trim();
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: headersCors });
  }

  try {
    const cuerpo = await req.json();
    const audio = typeof cuerpo?.audio === "string" ? cuerpo.audio : "";
    const mimeType = typeof cuerpo?.mimeType === "string"
      ? cuerpo.mimeType
      : "audio/webm";
    let pregunta = typeof cuerpo?.pregunta === "string"
      ? cuerpo.pregunta.trim()
      : "";

    // Si llega audio (interfaz de voz), lo transcribimos antes de responder.
    if (!pregunta && audio) {
      pregunta = await transcribirAudio(audio, mimeType);
    }

    if (!pregunta) {
      return new Response(
        JSON.stringify({ error: "No se entendió la pregunta. Intenta de nuevo." }),
        { status: 400, headers: { ...headersCors, "Content-Type": "application/json" } },
      );
    }

    const cliente = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const contexto = await obtenerContexto(cliente);
    const respuesta = await generarRespuestaGemini(pregunta, contexto);

    // Devolvemos también `pregunta` para que la voz muestre lo que se transcribió.
    return new Response(
      JSON.stringify({ pregunta, respuesta }),
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
