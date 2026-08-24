import { Env } from "../types";
import { computeEntityDiff } from "./differ";
import { indexEntityVector } from "./vector";

export interface SaveEntityParams {
  sourceId?: string;
  domain: "developer" | "pricing" | "regulatory" | "custom";
  entityKey: string;
  versionLabel?: string;
  structuredData: any;
  summary: string;
  confidenceScore?: number;
}

/**
 * Persists refined entity to D1, generates semantic diff against previous version, and updates Vectorize
 */
export async function saveRefinedEntity(env: Env, params: SaveEntityParams) {
  const entityId = `ent_${crypto.randomUUID()}`;
  const now = new Date().toISOString();

  // 1. Fetch previous entity snapshot to compute semantic diff
  const previousRecord: any = await env.DB.prepare(
    "SELECT id, structured_data, version_label FROM refined_entities WHERE domain = ? AND entity_key = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(params.domain, params.entityKey)
    .first();

  let diffResult: any = null;
  if (previousRecord && previousRecord.structured_data) {
    try {
      const prevData = JSON.parse(previousRecord.structured_data);
      const computedDiff = computeEntityDiff(
        params.domain,
        params.entityKey,
        prevData,
        params.structuredData
      );

      if (computedDiff) {
        const diffId = `diff_${crypto.randomUUID()}`;
        await env.DB.prepare(
          `INSERT INTO entity_diffs (id, entity_key, domain, previous_entity_id, current_entity_id, severity, diff_summary, diff_data, detected_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(
            diffId,
            params.entityKey,
            params.domain,
            previousRecord.id,
            entityId,
            computedDiff.severity,
            computedDiff.diffSummary,
            JSON.stringify(computedDiff.changes),
            now
          )
          .run();

        diffResult = {
          id: diffId,
          ...computedDiff,
          detectedAt: now
        };
      }
    } catch (diffErr) {
      console.warn("Failed to compute or save diff:", diffErr);
    }
  }

  // 2. Insert new refined entity record into D1
  await env.DB.prepare(
    `INSERT INTO refined_entities (id, source_id, domain, entity_key, version_label, structured_data, summary, confidence_score, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      entityId,
      params.sourceId || null,
      params.domain,
      params.entityKey,
      params.versionLabel || null,
      JSON.stringify(params.structuredData),
      params.summary,
      params.confidenceScore || 1.0,
      now
    )
    .run();

  // 3. Cache in KV if available for microsecond lookups
  if (env.KV_CACHE) {
    try {
      await env.KV_CACHE.put(
        `refinery:${params.domain}:${params.entityKey}:latest`,
        JSON.stringify(params.structuredData),
        { expirationTtl: 86400 } // 24 hours
      );
    } catch (kvErr) {
      console.warn("KV put failed:", kvErr);
    }
  }

  // 4. Index in Vectorize for semantic search
  const textToEmbed = `${params.entityKey} ${params.summary} ${JSON.stringify(params.structuredData).substring(0, 500)}`;
  await indexEntityVector(env, entityId, params.entityKey, params.domain, textToEmbed, {
    version: params.versionLabel || "latest",
    created_at: now
  });

  return {
    entityId,
    diff: diffResult
  };
}

/**
 * Query latest refined entity
 */
export async function getLatestEntity(env: Env, domain: string, entityKey: string) {
  // Try KV first
  if (env.KV_CACHE) {
    const cached = await env.KV_CACHE.get(`refinery:${domain}:${entityKey}:latest`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
  }

  const record: any = await env.DB.prepare(
    "SELECT * FROM refined_entities WHERE domain = ? AND entity_key = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(domain, entityKey)
    .first();

  if (!record) return null;
  return {
    id: record.id,
    domain: record.domain,
    entityKey: record.entity_key,
    versionLabel: record.version_label,
    structuredData: JSON.parse(record.structured_data),
    summary: record.summary,
    confidenceScore: record.confidence_score,
    createdAt: record.created_at
  };
}

/**
 * List latest entities for a domain
 */
export async function listEntitiesByDomain(env: Env, domain?: string, limit: number = 20) {
  let query = "SELECT * FROM refined_entities";
  const params: any[] = [];

  if (domain && domain !== "all") {
    query += " WHERE domain = ?";
    params.push(domain);
  }

  query += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);

  const stmt = env.DB.prepare(query);
  const { results } = await stmt.bind(...params).all();

  return (results || []).map((r: any) => ({
    id: r.id,
    domain: r.domain,
    entityKey: r.entity_key,
    versionLabel: r.version_label,
    structuredData: JSON.parse(r.structured_data),
    summary: r.summary,
    confidenceScore: r.confidence_score,
    createdAt: r.created_at
  }));
}

/**
 * List recent diffs / alerts
 */
export async function listRecentDiffs(env: Env, limit: number = 20) {
  const { results } = await env.DB.prepare(
    "SELECT * FROM entity_diffs ORDER BY detected_at DESC LIMIT ?"
  )
    .bind(limit)
    .all();

  return (results || []).map((r: any) => ({
    id: r.id,
    entityKey: r.entity_key,
    domain: r.domain,
    severity: r.severity,
    diffSummary: r.diff_summary,
    changes: JSON.parse(r.diff_data),
    detectedAt: r.detected_at
  }));
}
