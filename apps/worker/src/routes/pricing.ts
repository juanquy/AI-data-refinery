import { Hono } from "hono";
import { B2BPricingMatrixSchema } from "@data-refinery/schema";
import type { Env } from "../types";
import { extractStructuredData, fetchWebpageContent } from "../lib/extractor";
import { getLatestEntity, listEntitiesByDomain, saveRefinedEntity } from "../lib/db";

export const pricingRouter = new Hono<{ Bindings: Env }>();

const PRICING_SYSTEM_PROMPT = `You are a specialized B2B SaaS & Cloud Pricing Matrix Refinery.
Analyze the provided pricing table, tier description, or billing page.
Extract structured tiers, normalized monthly/annual costs, feature availability, hidden conditions, overage rates, and usage limits.
Respond ONLY with a JSON object matching this schema:
{
  "companyOrProductName": string,
  "category": string,
  "officialPricingUrl": string (optional),
  "lastUpdated": string (optional),
  "tiers": [
    {
      "name": string,
      "monthlyPrice": number | null,
      "annualPricePerMonth": number | null,
      "pricingModel": "FLAT_FEE" | "PER_SEAT" | "USAGE_BASED" | "TIERED" | "HYBRID" | "CUSTOM",
      "currency": "USD",
      "includedLimits": Record<string, string | number | boolean>,
      "overageRates": Record<string, string> (optional),
      "targetAudience": string (optional),
      "features": string[],
      "hiddenConditions": string[]
    }
  ],
  "freeTierAvailable": boolean,
  "freeTrialDays": number | null (optional),
  "enterpriseContactRequired": boolean,
  "estimatedEntryCostMonthly": number | null,
  "summary": string
}`;

// Query refined pricing matrix for a company/product
pricingRouter.get("/:product", async (c) => {
  const product = c.req.param("product").toLowerCase();
  const entity = await getLatestEntity(c.env, "pricing", product);

  if (!entity) {
    return c.json({ error: `No refined pricing matrix found for product '${product}'` }, 404);
  }

  return c.json({
    status: "success",
    domain: "pricing",
    entityKey: product,
    data: entity.structuredData,
    summary: entity.summary,
    lastRefinedAt: entity.createdAt
  });
});

// List all pricing entities
pricingRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") || 20);
  const entities = await listEntitiesByDomain(c.env, "pricing", limit);
  return c.json({ status: "success", count: entities.length, items: entities });
});

// Refine pricing matrix from raw text or live URL
pricingRouter.post("/refine", async (c) => {
  const startTime = Date.now();
  const body = await c.req.json();
  const { url, rawText, productKey } = body;

  let textToAnalyze = rawText;
  if (url && !textToAnalyze) {
    try {
      textToAnalyze = await fetchWebpageContent(url);
    } catch (err: any) {
      return c.json({ error: `Failed to fetch pricing URL: ${err.message}` }, 400);
    }
  }

  if (!textToAnalyze) {
    return c.json({ error: "Either 'url' or 'rawText' must be provided." }, 400);
  }

  try {
    const extraction = await extractStructuredData(
      c.env,
      textToAnalyze,
      PRICING_SYSTEM_PROMPT,
      B2BPricingMatrixSchema
    );

    const entityKey = (productKey || extraction.data.companyOrProductName).toLowerCase();
    const saved = await saveRefinedEntity(c.env, {
      domain: "pricing",
      entityKey,
      structuredData: extraction.data,
      summary: extraction.summary,
      confidenceScore: 0.97
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
    return c.json({ error: `Pricing refinery extraction failed: ${err.message}` }, 500);
  }
});
