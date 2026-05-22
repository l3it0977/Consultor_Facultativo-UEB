import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Chunk } from "./chunking.js";

export type ChunkConEmbedding = Chunk & { embedding: number[] };

const NOMBRE_TABLA = "documentos_facultad";
const TAMANO_LOTE = 50;

/**
 * Crea un cliente de Supabase usando la service role key para saltar RLS.
 */
const crearClienteSupabase = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Falta la variable de entorno SUPABASE_URL.");
  }
  if (!serviceRoleKey) {
    throw new Error("Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
};

/**
 * Inserta los chunks con embeddings en lotes para no saturar la base de datos.
 */
export const insertarChunks = async (
  chunks: ChunkConEmbedding[]
): Promise<void> => {
  try {
    if (chunks.length === 0) {
      return;
    }

    const cliente = crearClienteSupabase();
    let contador = 0;

    for (let inicio = 0; inicio < chunks.length; inicio += TAMANO_LOTE) {
      const lote = chunks.slice(inicio, inicio + TAMANO_LOTE);
      const registros = lote.map((chunk) => ({
        contenido: chunk.contenido,
        embedding: chunk.embedding,
        metadata: chunk.metadata,
      }));

      try {
        const { error } = await cliente
          .from(NOMBRE_TABLA)
          .upsert(registros, { onConflict: "id" });

        if (error) {
          throw new Error(error.message);
        }
      } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        throw new Error(`Error al insertar un lote en Supabase: ${mensaje}`, {
          cause: error,
        });
      }

      for (let indice = 0; indice < lote.length; indice += 1) {
        contador += 1;
        console.log(
          `[${new Date().toISOString()}] Insertando chunk ${contador} de ${chunks.length}...`
        );
      }
    }
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al insertar chunks en Supabase: ${mensaje}`, {
      cause: error,
    });
  }
};
