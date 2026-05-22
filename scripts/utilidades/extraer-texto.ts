import fs from "node:fs";
import pdfParse from "pdf-parse";

export interface PaginaTexto {
  numeroPagina: number;
  texto: string;
}

interface PaginaPDF {
  pageIndex: number;
  getTextContent: () => Promise<{ items: Array<{ str: string }> }>;
}

/**
 * Limpia el texto del PDF para eliminar caracteres no imprimibles y normalizar espacios.
 */
const limpiarTexto = (texto: string): string => {
  const sinControl = texto.replace(/\p{C}+/gu, " ");
  const sinSaltosMultiples = sinControl.replace(/[\r\n]+/g, " ");
  const espaciosNormalizados = sinSaltosMultiples.replace(/\s+/g, " ");
  return espaciosNormalizados.trim();
};

/**
 * Extrae el texto de cada página de un PDF y lo devuelve como un arreglo ordenado.
 */
export const extraerTextoPDF = async (
  rutaArchivo: string
): Promise<PaginaTexto[]> => {
  try {
    const buffer = fs.readFileSync(rutaArchivo);
    const paginas: PaginaTexto[] = [];

    const opciones = {
      pagerender: async (pagina: PaginaPDF): Promise<string> => {
        try {
          const contenido = await pagina.getTextContent();
          const textoPagina = contenido.items.map((item) => item.str).join(" ");
          const textoLimpio = limpiarTexto(textoPagina);
          paginas.push({
            numeroPagina: pagina.pageIndex + 1,
            texto: textoLimpio,
          });
          return textoPagina;
        } catch (error) {
          const mensaje =
            error instanceof Error ? error.message : String(error);
          throw new Error(
            `Error al procesar la página ${pagina.pageIndex + 1}: ${mensaje}`,
            { cause: error }
          );
        }
      },
    };

    await pdfParse(buffer, opciones);
    paginas.sort((a, b) => a.numeroPagina - b.numeroPagina);
    return paginas;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al extraer texto del PDF: ${mensaje}`, {
      cause: error,
    });
  }
};
