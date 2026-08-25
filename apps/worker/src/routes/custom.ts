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

customRouter.post("/refine", async (c) => {
  const startTime = Date.now();
  const rawBody = await c.req.json();
  const sourceUrl = rawBody.sourceUrl || rawBody.url;
  const domainName = rawBody.domainName || "custom";
  const instructionPrompt = rawBody.instructionPrompt || rawBody.prompt || "Extract key structured data";

  if (!sourceUrl || !sourceUrl.startsWith("http")) {
    return c.json({ error: "Valid sourceUrl or url required" }, 400);
  }

  let rawText = "";
  try {
    rawText = await fetchWebpageContent(sourceUrl);
  } catch (err: any) {
    return c.json({ error: `Failed to fetch target URL: ${err.message}` }, 400);
  }

  const prompt = `You are a Universal AI Data Refinery.
Your task: Ingest this raw webpage text and extract structured machine intelligence based on these instructions:
"${instructionPrompt}"

You MUST output a JSON object with these EXACT keys:
{
  "title": "Clear concise title of the page or topic",
  "summary": "2-3 sentence executive summary of key takeaways",
  "extractedAttributes": { ...key structured data, items, numbers, or records found... },
  "keyInsights": ["bullet insight 1", "bullet insight 2"],
  "actionableItems": ["recommended action 1"]
}`;

  try {
    const extraction = await extractStructuredData(
      c.env,
      rawText,
      prompt,
      GenericExtractionSchema
    );

    const entityKey = new URL(sourceUrl).hostname;
    await saveRefinedEntity(c.env, {
      domain: domainName,
      entityKey,
      structuredData: extraction.data,
      summary: extraction.summary
    });

    return c.json({
      status: "success",
      durationMs: Date.now() - startTime,
      sourceUrl,
      entityKey,
      summary: extraction.summary,
      structuredData: extraction.data
    });
  } catch (err: any) {
    // If strict schema fails, attempt generic JSON normalization
    try {
      const fallbackAi: any = await c.env.AI.run("@cf/meta/llama-3.3-70b-instruct" as any, {
        messages: [
          { role: "system", content: "Extract clean structured JSON with 'title', 'summary', and 'extractedAttributes' keys." },
          { role: "user", content: `URL: ${sourceUrl}\nInstructions: ${instructionPrompt}\nText:\n${rawText.substring(0, 10000)}` }
        ],
        temperature: 0.1,
        max_tokens: 2500
      });
      const rawTextOutput = String(fallbackAi?.response || JSON.stringify(fallbackAi));
      const firstBrace = rawTextOutput.indexOf("{");
      const lastBrace = rawTextOutput.lastIndexOf("}");
      let parsed: any = {};
      if (firstBrace !== -1 && lastBrace !== -1) {
        parsed = JSON.parse(rawTextOutput.substring(firstBrace, lastBrace + 1));
      }
      const normalizedData = {
        title: parsed.title || parsed.name || `${new URL(sourceUrl).hostname} Refined Data`,
        summary: parsed.summary || parsed.description || "Structured web intelligence extracted by Workers AI",
        extractedAttributes: parsed.extractedAttributes || parsed.attributes || parsed,
        keyInsights: parsed.keyInsights || parsed.insights || [],
        actionableItems: parsed.actionableItems || []
      };
      return c.json({
        status: "success",
        durationMs: Date.now() - startTime,
        sourceUrl,
        entityKey: new URL(sourceUrl).hostname,
        summary: normalizedData.summary,
        structuredData: normalizedData
      });
    } catch (finalErr: any) {
      return c.json({ error: `Custom refinement failed: ${err.message}` }, 500);
    }
  }
});
