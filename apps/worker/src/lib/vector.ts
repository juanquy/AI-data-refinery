import type { Env } from "../types";

/**
 * Generate 768-dimension vector embedding using Cloudflare Workers AI BGE model
 */
export async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  try {
    const response: any = await env.AI.run("@cf/baai/bge-base-en-v1.5" as any, {
      text: [text.substring(0, 1000)]
    });

    if (response && response.data && response.data[0]) {
      return response.data[0];
    }
    return [];
  } catch (err) {
    console.warn("Vector embedding generation skipped/failed:", err);
    return [];
  }
}

/**
 * Index refined entity in Cloudflare Vectorize
 */
export async function indexEntityVector(
  env: Env,
  id: string,
  entityKey: string,
  domain: string,
  textToEmbed: string,
  metadata: Record<string, any>
) {
  if (!env.VECTOR_INDEX) {
    return; // Vectorize not bound or available
  }

  try {
    const values = await generateEmbedding(env, textToEmbed);
    if (values.length > 0) {
      await env.VECTOR_INDEX.upsert([
        {
          id,
          values,
          metadata: {
            entityKey,
            domain,
            summary: textToEmbed.substring(0, 200),
            ...metadata
          }
        }
      ]);
    }
  } catch (err) {
    console.warn(`Failed to upsert vector for ${entityKey}:`, err);
  }
}

/**
 * Query Vectorize index for semantic matches
 */
export async function queryVectors(
  env: Env,
  query: string,
  topK: number = 5,
  domainFilter?: string
) {
  if (!env.VECTOR_INDEX) {
    return [];
  }

  try {
    const vector = await generateEmbedding(env, query);
    if (vector.length === 0) return [];

    const matches = await env.VECTOR_INDEX.query(vector, {
      topK,
      returnMetadata: "all"
    });

    if (!matches || !matches.matches) return [];

    let results = matches.matches;
    if (domainFilter && domainFilter !== "all") {
      results = results.filter((m: any) => m.metadata?.domain === domainFilter);
    }
    return results;
  } catch (err) {
    console.warn("Vector query failed:", err);
    return [];
  }
}
