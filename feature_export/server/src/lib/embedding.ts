import logger from './logger.js';

type EmbeddingPipeline = (text: string, options?: { pooling?: string; normalize?: boolean }) => Promise<{ data: number[] }>;

let cachedPipe: EmbeddingPipeline | null = null;

/**
 * Generate an embedding vector from text using Xenova Transformers.
 * Pipeline is cached after first initialization for performance.
 */

export async function generateEmbedding(text: string): Promise<number[] | null> {
  if (!text) return null;

  try {
    if (!cachedPipe) {
      const { pipeline } = await import('@xenova/transformers');
      cachedPipe = await pipeline('feature-extraction', 'Supabase/gte-small') as EmbeddingPipeline;
      logger.info('Embedding pipeline initialized');
    }

    const output = await cachedPipe(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('Embedding generation failed:', message);
    return null;
  }
}


export async function concatenateInfo(
  title?: string,
  genres?: string[] | string | null,
  thesis?: string | null,
  country?: string | null,
  uploader?:string|null
): Promise<number[] | null> {
  try {
    // Normalize genres to comma-separated text
    let genresText = "";
    if (Array.isArray(genres)) {
      genresText = genres.join(", ");
    } else if (typeof genres === "string") {
      genresText = genres;
    }

    // Build a unified semantic string
    const text = `
      Film title: ${title ?? "Untitled"}
      by: ${uploader ?? "unkown"}
      Genres: ${genresText || "N/A"}
      Region: ${country || "Unknown"}
      Thesis: ${thesis || "No thesis provided"}
    `.trim();

    logger.info("🔹 Generating embedding for:", text);
    return await generateEmbedding(text);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn(" Failed to generate concatenated film embedding:", message);
    return null;
  }
}