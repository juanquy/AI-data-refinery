import { Hono } from "hono";
import { z } from "zod";
import { CustomRefinementRequestSchema } from "@data-refinery/schema";
import { Env } from "../types";
import { extractStructuredData, fetchWebpageContent } from "../lib/extractor";
import { listEntitiesByDomain, saveRefinedEntity } from "../lib/db";

export const customRouter = new Hono<{ Bindings: Env }>();

const GenericExtractionSchema = z.object({
  title: z.string().describe("Entity or page title"),
  summary: z.string().describe("Executive summary of refined content"),
  extractedAttributes: z.record(z.any()).describe("Key structured attributes and entities found"),
  keyInsights: z.array(z.string()).default([]),
  actionableItems: z.array(z.string()).default([])
});

customRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") || 20);
  const entities = await listEntitiesByDomain(c.env, "custom", limit);
  return c.json({ status: "success", count: entities.length, items: entities });
});

// Universal on-demand refine endpoint
customRouter.post("/refine", async (c) => {
  const startTime = Date.now();
  const rawBody = await c.req.json();
  const parseResult = CustomRefinementRequestSchema.safeParse(rawBody);

  if (!parseResult.success) {
    return c.json({ error: "Invalid request payload", details: parseResult.error.format() }, 400);
  }

  const { sourceUrl, domainName, instructionPrompt } = parseResult.data;

  let rawText = "";
  try {
    rawText = await fetchWebpageContent(sourceUrl);
  } catch (err: any) {
    return c.json({ error: `Failed to fetch target URL: ${err.message}` }, 400);
  }

  const prompt = `You are a Universal AI Data Refinery.
Your task: Extract structured machine intelligence according to these user instructions:
"${instructionPrompt}"

Respond ONLY with a valid JSON object matching this structure:
{
  "title": string,
  "summary": string,
  "extractedAttributes": Record<string, any>,
  "keyInsights": string[],
  "actionableItems": string[]
}`;

  try {
    const extraction = await extractStructuredData(
      c.env,
      rawText,
      prompt,
      GenericExtractionSchema
    );

    const entityKey = new URL(sourceUrl).hostname + new URL(sourceUrl).pathname.replace(/[^a-zA-Z0-9]/g, "-");
    const saved = await saveRefinedEntity(c.env, {
      domain: "custom",
      entityKey,
      structuredData: {
        sourceUrl,
        customDomain: domainName,
        ...extraction.data
      },
      summary: extraction.summary,
      confidenceScore: 0.95
    });

    return c.json({
      status: "success",
      entityId: saved.entityId,
      entityKey,
      sourceUrl,
      domain: domainName,
      summary: extraction.summary,
      data: extraction.data,
      diff: saved.diff,
      durationMs: Date.now() - startTime
    });
  } catch (err: any) {
    return c.json({ error: `Custom refinement failed: ${err.message}` }, 500);
  }
});
