import { Hono } from "hono";
import type { Env } from "../types";

export const exportRouter = new Hono<{ Bindings: Env }>();

// 1. Export Dataset for LLM Fine-Tuning & RAG
exportRouter.get("/fine-tuning", async (c) => {
  const format = c.req.query("format") || "openai_jsonl"; // openai_jsonl | llama3_jsonl | alpaca | rag_chunks
  const domain = c.req.query("domain") || "all";
  const limit = Math.min(Number(c.req.query("limit") || 100), 500);

  try {
    let query = "SELECT * FROM refined_entities ORDER BY created_at DESC LIMIT ?";
    let params: any[] = [limit];

    if (domain !== "all") {
      query = "SELECT * FROM refined_entities WHERE domain = ? ORDER BY created_at DESC LIMIT ?";
      params = [domain, limit];
    }

    const { results } = await c.env.DB.prepare(query).bind(...params).all();
    const entities = results || [];

    // Also fetch diffs for migration fine-tuning examples
    const { results: diffResults } = await c.env.DB.prepare(
      "SELECT * FROM entity_diffs ORDER BY detected_at DESC LIMIT 50"
    ).all();
    const diffs = diffResults || [];

    const datasetRows: any[] = [];

    // 1. Process entities into fine-tuning examples
    for (const ent of entities as any[]) {
      const dataObj = typeof ent.structured_data === "string" ? JSON.parse(ent.structured_data) : ent.structured_data;
      const domainLabel = ent.domain.toUpperCase();
      const entityKey = ent.entity_key;

      if (format === "openai_jsonl") {
        datasetRows.push({
          messages: [
            {
              role: "system",
              content: `You are a Universal Data Refinery AI. You extract 100% verified, structured facts for domain: ${domainLabel}. Respond strictly in valid JSON.`
            },
            {
              role: "user",
              content: `Retrieve verified structured intelligence for "${entityKey}" in domain "${domainLabel}".`
            },
            {
              role: "assistant",
              content: JSON.stringify(dataObj, null, 2)
            }
          ]
        });
      } else if (format === "llama3_jsonl") {
        datasetRows.push({
          system: `You are a Universal Data Refinery AI specializing in ${domainLabel} data refinement.`,
          instruction: `Extract structured schema for ${entityKey}.`,
          response: JSON.stringify(dataObj)
        });
      } else if (format === "alpaca") {
        datasetRows.push({
          instruction: `Extract verified ${domainLabel} attributes for ${entityKey}.`,
          input: `Entity identifier: ${entityKey} (${ent.summary || "Refined web resource"})`,
          output: JSON.stringify(dataObj, null, 2)
        });
      } else if (format === "rag_chunks") {
        datasetRows.push({
          id: `chunk_${ent.id}`,
          text: `[${domainLabel}] ${entityKey}: ${ent.summary}\nStructured Data: ${JSON.stringify(dataObj)}`,
          metadata: {
            domain: ent.domain,
            entityKey: ent.entity_key,
            versionLabel: ent.version_label || "v1",
            createdAt: ent.created_at
          }
        });
      }
    }

    // 2. Process diffs into migration guide examples
    for (const diff of diffs as any[]) {
      const changes = typeof diff.changes_json === "string" ? JSON.parse(diff.changes_json) : diff.changes_json;
      if (format === "openai_jsonl") {
        datasetRows.push({
          messages: [
            {
              role: "system",
              content: "You are an automated Software AST Migration & Delta Analysis AI. Identify breaking changes and provide exact code migration guidance."
            },
            {
              role: "user",
              content: `What breaking changes occurred in ${diff.entity_key} (${diff.domain})?`
            },
            {
              role: "assistant",
              content: JSON.stringify({
                severity: diff.severity,
                summary: diff.diff_summary,
                changes
              }, null, 2)
            }
          ]
        });
      } else if (format === "alpaca") {
        datasetRows.push({
          instruction: `Explain the semantic code difference for ${diff.entity_key}.`,
          input: `Severity: ${diff.severity}`,
          output: `Summary: ${diff.diff_summary}\nChanges: ${JSON.stringify(changes, null, 2)}`
        });
      }
    }

    // Check if user requested direct file download
    const isDownload = c.req.query("download") === "true";
    if (isDownload) {
      const jsonlText = datasetRows.map(row => JSON.stringify(row)).join("\n");
      return new Response(jsonlText, {
        headers: {
          "Content-Type": "application/x-jsonlines",
          "Content-Disposition": `attachment; filename="refinery_${format}_dataset.jsonl"`
        }
      });
    }

    return c.json({
      status: "success",
      format,
      count: datasetRows.length,
      samplePreview: datasetRows.slice(0, 3),
      dataset: datasetRows
    });
  } catch (err: any) {
    return c.json({ error: `Dataset export failed: ${err.message}` }, 500);
  }
});
