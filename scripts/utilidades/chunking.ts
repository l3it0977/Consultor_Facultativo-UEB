import type { PaginaTexto } from "./extraer-texto.js";

export interface OpcionesChunk {
  tamanoMax: number;
  solapamiento: number;
}

export interface Chunk {
  contenido: string;
  metadata: {
    pagina: number;
    indiceChunk: number;
    totalChunks: number;
    palabras: number;
  };
}

interface ChunkTemporal {
  contenido: string;
  palabras: number;
}

/**
 * Divide el texto en oraciones usando puntos y saltos de línea como separadores.
 */
const dividirEnOraciones = (texto: string): string[] => {
  return texto
    .split(/(?:\.\s+|\n+)/)
    .map((oracion) => oracion.trim())
    .filter((oracion) => oracion.length > 0);
};

/**
 * Cuenta la cantidad de palabras en un texto para controlar el tamaño del chunk.
 */
const contarPalabras = (texto: string): number => {
  const palabras = texto.split(/\s+/).filter((palabra) => palabra.length > 0);
  return palabras.length;
};

/**
 * Obtiene las últimas N palabras de un texto para aplicar el solapamiento.
 */
const obtenerUltimasPalabras = (texto: string, cantidad: number): string[] => {
  if (cantidad <= 0) {
    return [];
  }
  const palabras = texto.split(/\s+/).filter((palabra) => palabra.length > 0);
  return palabras.slice(Math.max(0, palabras.length - cantidad));
};

/**
 * Convierte un chunk temporal en un chunk definitivo con metadata.
 */
const crearChunkDefinitivo = (
  chunk: ChunkTemporal,
  pagina: number,
  indiceChunk: number,
  totalChunks: number
): Chunk => {
  return {
    contenido: chunk.contenido,
    metadata: {
      pagina,
      indiceChunk,
      totalChunks,
      palabras: chunk.palabras,
    },
  };
};

/**
 * Divide el contenido de cada página en chunks con solapamiento y metadata útil.
 */
export const dividirEnChunks = (
  paginas: PaginaTexto[],
  opciones: OpcionesChunk = { tamanoMax: 400, solapamiento: 40 }
): Chunk[] => {
  const opcionesFinales: OpcionesChunk = {
    tamanoMax: opciones.tamanoMax ?? 400,
    solapamiento: opciones.solapamiento ?? 40,
  };

  const chunks: Chunk[] = [];

  for (const pagina of paginas) {
    const oraciones = dividirEnOraciones(pagina.texto);
    const temporales: ChunkTemporal[] = [];
    let contenidoActual: string[] = [];
    let palabrasActual = 0;

    const cerrarChunk = (): void => {
      const contenido = contenidoActual.join(" ").trim();
      if (contenido.length === 0) {
        contenidoActual = [];
        palabrasActual = 0;
        return;
      }
      const palabras = contarPalabras(contenido);
      if (palabras >= 20) {
        temporales.push({ contenido, palabras });
      }
      const palabrasSolapadas = obtenerUltimasPalabras(
        contenido,
        opcionesFinales.solapamiento
      );
      contenidoActual =
        palabrasSolapadas.length > 0 ? [palabrasSolapadas.join(" ")] : [];
      palabrasActual = palabrasSolapadas.length;
    };

    for (const oracion of oraciones) {
      const palabrasOracion = contarPalabras(oracion);
      if (
        palabrasActual + palabrasOracion > opcionesFinales.tamanoMax &&
        contenidoActual.length > 0
      ) {
        cerrarChunk();
      }
      if (palabrasOracion > 0) {
        contenidoActual.push(oracion);
        palabrasActual += palabrasOracion;
      }
    }

    if (contenidoActual.length > 0) {
      const contenidoFinal = contenidoActual.join(" ").trim();
      const palabrasFinal = contarPalabras(contenidoFinal);
      if (palabrasFinal >= 20) {
        temporales.push({ contenido: contenidoFinal, palabras: palabrasFinal });
      }
    }

    const totalChunks = temporales.length;
    temporales.forEach((chunkTemporal, indice) => {
      chunks.push(
        crearChunkDefinitivo(
          chunkTemporal,
          pagina.numeroPagina,
          indice + 1,
          totalChunks
        )
      );
    });
  }

  return chunks;
};
