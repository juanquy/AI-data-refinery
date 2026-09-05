import { Hono } from "hono";
import type { Env } from "../types";
import { queryVectors } from "../lib/vector";

export const searchRouter = new Hono<{ Bindings: Env }>();

async function handleSearch(c: any) {
  try {
    let query = c.req.query("q") || c.req.query("query");
    let domain = c.req.query("domain");
    let limit = Number(c.req.query("limit") || 10);

    if (!query && c.req.method === "POST") {
      try {
        const body = await c.req.json();
        query = body.query || body.q;
        domain = body.domain || domain;
        if (body.limit) limit = Number(body.limit);
      } catch {}
    }

    domain = domain || "all";

    if (!query) {
      return c.json({ error: "Missing search query parameter 'q' or JSON body 'query'" }, 400);
    }

    // 1. First try Vectorize semantic search if available
    let vectorMatches: any[] = [];
    try {
      vectorMatches = await queryVectors(c.env, query, limit, domain);
    } catch (vErr) {
      console.warn("Vector search failed:", vErr);
    }

    // 2. Also query D1 full-text matching to combine hybrid results
    let formattedD1Matches: any[] = [];
    try {
      let d1Sql = "SELECT * FROM refined_entities WHERE (summary LIKE ? OR structured_data LIKE ? OR entity_key LIKE ?)";
      const params: any[] = [`%${query}%`, `%${query}%`, `%${query}%`];

      if (domain !== "all") {
        d1Sql += " AND domain = ?";
        params.push(domain);
      }
      d1Sql += " ORDER BY created_at DESC LIMIT ?";
      params.push(limit);

      const { results: d1Matches } = await c.env.DB.prepare(d1Sql).bind(...params).all();

      formattedD1Matches = (d1Matches || []).map((r: any) => {
        let parsedData = null;
        try {
          parsedData = JSON.parse(r.structured_data);
        } catch {
          parsedData = r.structured_data;
        }
        return {
          id: r.id,
          domain: r.domain,
          entityKey: r.entity_key,
          versionLabel: r.version_label,
          summary: r.summary,
          structuredData: parsedData,
          createdAt: r.created_at
        };
      });
    } catch (d1Err) {
      console.warn("D1 text search failed:", d1Err);
    }

    return c.json({
      status: "success",
      query,
      domain,
      results: {
        vectorSemanticMatches: vectorMatches || [],
        directMatches: formattedD1Matches || []
      }
    });
  } catch (err: any) {
    return c.json({ error: "Search failed", details: err.message }, 500);
  }
}

searchRouter.get("/", handleSearch);
searchRouter.post("/", handleSearch);


