const MODELO = "sentence-transformers/all-MiniLM-L6-v2";
const ENDPOINT = `https://api-inference.huggingface.co/pipeline/feature-extraction/${MODELO}`;

/**
 * Espera una cantidad de milisegundos para respetar los límites de la API.
 */
const esperar = async (milisegundos: number): Promise<void> => {
  try {
    await new Promise((resolve) => setTimeout(resolve, milisegundos));
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al esperar ${milisegundos}ms: ${mensaje}`, {
      cause: error,
    });
  }
};

/**
 * Obtiene la clave de Hugging Face desde las variables de entorno.
 */
const obtenerApiKey = (): string => {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new Error("Falta la variable de entorno HF_API_KEY.");
  }
  return apiKey;
};

/**
 * Normaliza un vector dividiendo cada componente por su norma L2.
 */
const normalizarVector = (vector: number[]): number[] => {
  const sumaCuadrados = vector.reduce((acum, valor) => acum + valor * valor, 0);
  const norma = Math.sqrt(sumaCuadrados);
  if (norma === 0) {
    return vector;
  }
  return vector.map((valor) => valor / norma);
};

/**
 * Calcula el promedio de embeddings por token para obtener un vector único.
 */
const promediarTokens = (tokens: number[][]): number[] => {
  if (tokens.length === 0) {
    return [];
  }
  const dimensiones = tokens[0].length;
  const acumulado = new Array(dimensiones).fill(0);
  for (const token of tokens) {
    for (let indice = 0; indice < dimensiones; indice += 1) {
      acumulado[indice] += token[indice] ?? 0;
    }
  }
  return acumulado.map((valor) => valor / tokens.length);
};

/**
 * Convierte la respuesta de la API en embeddings normalizados.
 */
const convertirRespuestaAEmbeddings = (
  respuesta: unknown,
  cantidadEsperada: number
): number[][] => {
  const esNumeroArray = (valor: unknown): valor is number[] =>
    Array.isArray(valor) && valor.every((item) => typeof item === "number");
  const esArrayDeNumeroArray = (valor: unknown): valor is number[][] =>
    Array.isArray(valor) && valor.every((item) => esNumeroArray(item));
  const esArrayDeArrayDeNumeroArray = (
    valor: unknown
  ): valor is number[][][] =>
    Array.isArray(valor) && valor.every((item) => esArrayDeNumeroArray(item));

  if (esNumeroArray(respuesta)) {
    return [normalizarVector(respuesta)];
  }

  if (esArrayDeNumeroArray(respuesta)) {
    if (cantidadEsperada === 1) {
      return [normalizarVector(promediarTokens(respuesta))];
    }
    return respuesta.map((vector) => normalizarVector(vector));
  }

  if (esArrayDeArrayDeNumeroArray(respuesta)) {
    if (respuesta.length !== cantidadEsperada) {
      throw new Error(
        `La API devolvió ${respuesta.length} embeddings, pero se esperaban ${cantidadEsperada}.`
      );
    }
    return respuesta.map((tokens) =>
      normalizarVector(promediarTokens(tokens))
    );
  }

  throw new Error("La respuesta de Hugging Face tiene un formato inesperado.");
};

/**
 * Solicita embeddings a la API de Hugging Face con reintentos ante 503.
 */
const solicitarEmbeddings = async (
  textos: string[],
  intento: number
): Promise<unknown> => {
  try {
    const respuesta = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${obtenerApiKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: textos,
        options: { wait_for_model: true },
      }),
    });

    if (respuesta.status === 503) {
      if (intento >= 3) {
        throw new Error(
          "El modelo de Hugging Face sigue cargando después de varios intentos."
        );
      }
      const espera = Math.pow(2, intento) * 1000;
      await esperar(espera);
      return solicitarEmbeddings(textos, intento + 1);
    }

    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      throw new Error(
        `Respuesta HTTP ${respuesta.status} de Hugging Face: ${detalle}`
      );
    }

    return await respuesta.json();
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al solicitar embeddings: ${mensaje}`, {
      cause: error,
    });
  }
};

/**
 * Genera un embedding único para un texto.
 */
export const generarEmbedding = async (texto: string): Promise<number[]> => {
  try {
    const resultados = await generarEmbeddingsBatch([texto], 1);
    const embedding = resultados[0];
    if (!embedding) {
      throw new Error("No se recibió embedding para el texto solicitado.");
    }
    return embedding;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al generar embedding: ${mensaje}`, {
      cause: error,
    });
  }
};

/**
 * Genera embeddings en lotes para respetar el rate limit de Hugging Face.
 */
export const generarEmbeddingsBatch = async (
  textos: string[],
  tamanoLote: number = 32
): Promise<number[][]> => {
  try {
    const embeddings: number[][] = [];
    const totalLotes = Math.ceil(textos.length / tamanoLote);

    for (let inicio = 0; inicio < textos.length; inicio += tamanoLote) {
      const lote = textos.slice(inicio, inicio + tamanoLote);
      const indiceLote = Math.floor(inicio / tamanoLote) + 1;
      console.log(
        `[${new Date().toISOString()}] Generando embeddings para lote ${indiceLote} de ${totalLotes} (${lote.length} textos)...`
      );

      const respuesta = await solicitarEmbeddings(lote, 0);
      const embeddingsLote = convertirRespuestaAEmbeddings(
        respuesta,
        lote.length
      );
      embeddings.push(...embeddingsLote);

      if (inicio + tamanoLote < textos.length) {
        await esperar(1000);
      }
    }

    return embeddings;
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : String(error);
    throw new Error(`Error al generar embeddings en lote: ${mensaje}`, {
      cause: error,
    });
  }
};
