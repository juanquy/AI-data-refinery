import { Hono } from "hono";
import { RegulatoryComplianceSchema } from "@data-refinery/schema";
import type { Env } from "../types";
import { extractStructuredData, fetchWebpageContent } from "../lib/extractor";
import { getLatestEntity, listEntitiesByDomain, saveRefinedEntity } from "../lib/db";

export const regulatoryRouter = new Hono<{ Bindings: Env }>();

const REGULATORY_SYSTEM_PROMPT = `You are a specialized Localized Regulatory & Compliance Intelligence Refinery.
Analyze the provided municipal code, ordinance, zoning law, permit guide, or government grant notice.
Extract clear compliance rules, mandatory requirements, applicable business categories, filing fees, penalties, and step-by-step actions.
Respond ONLY with a JSON object matching this schema:
{
  "jurisdiction": string,
  "level": "MUNICIPAL" | "COUNTY" | "STATE" | "FEDERAL" | "INTERNATIONAL",
  "governingBody": string,
  "topic": string,
  "effectiveDate": string (optional),
  "summary": string,
  "requirements": [
    {
      "title": string,
      "category": "PERMIT" | "TAX" | "ZONING" | "ENVIRONMENTAL" | "DATA_PRIVACY" | "LABOR" | "GRANT_ELIGIBILITY" | "OTHER",
      "mandatory": boolean,
      "applicableTo": string[],
      "filingDeadline": string (optional),
      "estimatedCostOrFee": string (optional),
      "penaltyForNonCompliance": string (optional),
      "stepByStepAction": string[]
    }
  ],
  "officialSources": string[]
}`;

// Query regulatory entity by topic/key
regulatoryRouter.get("/:key", async (c) => {
  const key = c.req.param("key").toLowerCase();
  const entity = await getLatestEntity(c.env, "regulatory", key);

  if (!entity) {
    return c.json({ error: `No refined compliance intelligence found for key '${key}'` }, 404);
  }

  return c.json({
    status: "success",
    domain: "regulatory",
    entityKey: key,
    data: entity.structuredData,
    summary: entity.summary,
    lastRefinedAt: entity.createdAt
  });
});

// List all regulatory entities
regulatoryRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") || 20);
  const entities = await listEntitiesByDomain(c.env, "regulatory", limit);
  return c.json({ status: "success", count: entities.length, items: entities });
});

// Refine regulatory documentation from raw text or live URL
regulatoryRouter.post("/refine", async (c) => {
  const startTime = Date.now();
  const body = await c.req.json();
  const { url, rawText, topicKey } = body;

  let textToAnalyze = rawText;
  if (url && !textToAnalyze) {
    try {
      textToAnalyze = await fetchWebpageContent(url);
    } catch (err: any) {
      return c.json({ error: `Failed to fetch regulatory source URL: ${err.message}` }, 400);
    }
  }

  if (!textToAnalyze) {
    return c.json({ error: "Either 'url' or 'rawText' must be provided." }, 400);
  }

  try {
    const extraction = await extractStructuredData(
      c.env,
      textToAnalyze,
      REGULATORY_SYSTEM_PROMPT,
      RegulatoryComplianceSchema
    );

    const entityKey = (
      topicKey ||
      `${extraction.data.jurisdiction}-${extraction.data.topic}`
    )
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");

    const saved = await saveRefinedEntity(c.env, {
      domain: "regulatory",
      entityKey,
      structuredData: extraction.data,
      summary: extraction.summary,
      confidenceScore: 0.96
    });

    return c.json({
      status: "success",
      entityId: saved.entityId,
      entityKey,
      summary: extraction.summary,
      data: extraction.data,
      diff: saved.diff,
      durationMs: Date.now() - startTime
    });
  } catch (err: any) {
    return c.json({ error: `Regulatory refinery extraction failed: ${err.message}` }, 500);
  }
});
