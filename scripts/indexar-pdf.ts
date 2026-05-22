import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { extraerTextoPDF } from "./utilidades/extraer-texto.js";
import { dividirEnChunks } from "./utilidades/chunking.js";
import { generarEmbeddingsBatch } from "./utilidades/embeddings.js";
import { insertarChunks } from "./utilidades/supabase-admin.js";

const ARGUMENTO_ARCHIVO = "--archivo";

/**
 * Imprime mensajes con timestamp para seguir el progreso del script.
 */
const logConTiempo = (mensaje: string): void => {
  console.log(`[${new Date().toISOString()}] ${mensaje}`);
};

/**
 * Valida que el usuario haya enviado el argumento --archivo con una ruta válida.
 */
const obtenerRutaArchivo = (args: string[]): string => {
  const indice = args.indexOf(ARGUMENTO_ARCHIVO);
  if (indice === -1 || !args[indice + 1]) {
    throw new Error(
      "Debes indicar la ruta del PDF con --archivo ruta/al/documento.pdf"
    );
  }
  return args[indice + 1];
};

/**
 * Verifica que el archivo exista y tenga extensión .pdf antes de procesarlo.
 */
const validarArchivoPDF = (rutaArchivo: string): void => {
  if (!fs.existsSync(rutaArchivo)) {
    throw new Error(`El archivo no existe: ${rutaArchivo}`);
  }
  if (path.extname(rutaArchivo).toLowerCase() !== ".pdf") {
    throw new Error("El archivo debe tener extensión .pdf.");
  }
};

/**
 * Verifica que las variables de entorno necesarias estén presentes.
 */
const validarVariablesEntorno = (): void => {
  const variables = [
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "HF_API_KEY",
  ];
  const faltantes = variables.filter((nombre) => !process.env[nombre]);
  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables de entorno: ${faltantes.join(", ")}.`
    );
  }
};

/**
 * Ejecuta el pipeline completo de indexación del PDF en Supabase.
 */
const ejecutar = async (): Promise<void> => {
  try {
    dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    validarVariablesEntorno();

    const rutaArchivo = obtenerRutaArchivo(process.argv.slice(2));
    const rutaAbsoluta = path.resolve(process.cwd(), rutaArchivo);
    validarArchivoPDF(rutaAbsoluta);

    const inicio = Date.now();

    logConTiempo("[1/4] Extrayendo texto del PDF...");
    const paginas = await extraerTextoPDF(rutaAbsoluta);

    logConTiempo("[2/4] Dividiendo en chunks...");
    const chunks = dividirEnChunks(paginas, {
      tamanoMax: 400,
      solapamiento: 40,
    });
    logConTiempo(`Se generaron ${chunks.length} chunks.`);

    logConTiempo(
      "[3/4] Generando embeddings (esto puede tomar varios minutos)..."
    );
    const textos = chunks.map((chunk) => chunk.contenido);
    const embeddings = await generarEmbeddingsBatch(textos, 32);

    if (embeddings.length !== chunks.length) {
      throw new Error(
        "La cantidad de embeddings no coincide con la cantidad de chunks."
      );
    }

    const chunksConEmbedding = chunks.map((chunk, indice) => {
      const embedding = embeddings[indice];
      if (!embedding) {
        throw new Error(`Falta embedding para el chunk ${indice + 1}.`);
      }
      return { ...chunk, embedding };
    });

    logConTiempo("[4/4] Insertando en Supabase...");
    await insertarChunks(chunksConEmbedding);

    const tiempoTotal = (Date.now() - inicio) / 1000;
    logConTiempo(`Indexación completada. ${chunks.length} chunks almacenados.`);
    logConTiempo(
      `Resumen: ${paginas.length} páginas, ${chunks.length} chunks, ${tiempoTotal.toFixed(
        2
      )} segundos.`
    );
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    console.error(`[${new Date().toISOString()}] Error: ${mensaje}`);
    process.exit(1);
  }
};

void ejecutar();
