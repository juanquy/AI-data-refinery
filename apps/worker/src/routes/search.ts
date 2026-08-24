import { Hono } from "hono";
import { Env } from "../types";
import { queryVectors } from "../lib/vector";

export const searchRouter = new Hono<{ Bindings: Env }>();

searchRouter.get("/", async (c) => {
  const query = c.req.query("q");
  const domain = c.req.query("domain") || "all";
  const limit = Number(c.req.query("limit") || 10);

  if (!query) {
    return c.json({ error: "Missing search query parameter 'q'" }, 400);
  }

  // 1. First try Vectorize semantic search if available
  const vectorMatches = await queryVectors(c.env, query, limit, domain);

  // 2. Also query D1 full-text matching to combine hybrid results
  let d1Sql = "SELECT * FROM refined_entities WHERE (summary LIKE ? OR structured_data LIKE ? OR entity_key LIKE ?)";
  const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

  if (domain !== "all") {
    d1Sql += " AND domain = ?";
    params.push(domain);
  }
  d1Sql += " ORDER BY created_at DESC LIMIT ?";
  params.push(limit);

  const { results: d1Matches } = await c.env.DB.prepare(d1Sql).bind(...params).all();

  const formattedD1Matches = (d1Matches || []).map((r: any) => ({
    id: r.id,
    domain: r.domain,
    entityKey: r.entity_key,
    versionLabel: r.version_label,
    summary: r.summary,
    structuredData: JSON.parse(r.structured_data),
    createdAt: r.created_at
  }));

  return c.json({
    status: "success",
    query,
    domain,
    results: {
      vectorSemanticMatches: vectorMatches,
      directMatches: formattedD1Matches
    }
  });
});
