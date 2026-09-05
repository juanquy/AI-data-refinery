import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../types";
import { extractStructuredData, fetchWebpageContent } from "../lib/extractor";
import { saveRefinedEntity } from "../lib/db";

export const schemasRouter = new Hono<{ Bindings: Env }>();

// 1. List All Custom Schemas
schemasRouter.get("/", async (c) => {
  const workspaceId = c.req.query("workspaceId") || "ws_global_refinery";
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM custom_schemas WHERE workspace_id = ? OR is_public = 1 ORDER BY created_at DESC"
    )
      .bind(workspaceId)
      .all();

    const formatted = (results || []).map((s: any) => ({
      ...s,
      fields: typeof s.fields_json === "string" ? JSON.parse(s.fields_json) : s.fields_json
    }));

    return c.json({ status: "success", count: formatted.length, schemas: formatted });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch schemas: ${err.message}` }, 500);
  }
});

// 2. Get Single Custom Schema
schemasRouter.get("/:idOrSlug", async (c) => {
  const param = c.req.param("idOrSlug");
  try {
    const schema: any = await c.env.DB.prepare(
      "SELECT * FROM custom_schemas WHERE id = ? OR slug = ? LIMIT 1"
    )
      .bind(param, param)
      .first();

    if (!schema) {
      return c.json({ error: `Schema '${param}' not found` }, 404);
    }

    return c.json({
      status: "success",
      schema: {
        ...schema,
        fields: typeof schema.fields_json === "string" ? JSON.parse(schema.fields_json) : schema.fields_json
      }
    });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch schema: ${err.message}` }, 500);
  }
});

// 3. Create a New Custom Visual Schema
schemasRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const description = String(body.description || "").trim();
  const customPrompt = String(body.customPrompt || "").trim();
  const workspaceId = body.workspaceId || "ws_global_refinery";
  const fields = Array.isArray(body.fields) ? body.fields : [];

  if (!name) {
    return c.json({ error: "Schema name is required" }, 400);
  }

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const schemaId = `schema_${crypto.randomUUID()}`;
  const fieldsJson = JSON.stringify(fields);

  try {
    await c.env.DB.prepare(
      `INSERT INTO custom_schemas (id, workspace_id, name, slug, description, fields_json, custom_system_prompt, is_public, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
      .bind(schemaId, workspaceId, name, slug, description, fieldsJson, customPrompt)
      .run();

    return c.json({
      status: "success",
      schema: {
        id: schemaId,
        workspaceId,
        name,
        slug,
        description,
        fields,
        customPrompt
      }
    });
  } catch (err: any) {
    return c.json({ error: `Failed to create schema: ${err.message}` }, 500);
  }
});

// 4. Refine a live URL using a Custom Visual Schema
schemasRouter.post("/:slug/refine", async (c) => {
  const startTime = Date.now();
  const slug = c.req.param("slug");
  const body = await c.req.json().catch(() => ({}));
  const sourceUrl = body.sourceUrl || body.url;

  if (!sourceUrl || !sourceUrl.startsWith("http")) {
    return c.json({ error: "Valid sourceUrl or url required" }, 400);
  }

  try {
    // 1. Fetch schema definition from D1
    const schemaRecord: any = await c.env.DB.prepare(
      "SELECT * FROM custom_schemas WHERE slug = ? OR id = ? LIMIT 1"
    ).bind(slug, slug).first();

    if (!schemaRecord) {
      return c.json({ error: `Custom schema '${slug}' not found` }, 404);
    }

    const fields = JSON.parse(schemaRecord.fields_json);
    const rawText = await fetchWebpageContent(sourceUrl);

    // 2. Build extraction prompt dynamically from custom schema fields
    const fieldDescriptions = fields
      .map((f: any) => `- "${f.name}" (${f.type}${f.required ? ", required" : ""}): ${f.description || f.name}`)
      .join("\n");

    const extractionPrompt = `You are a Universal AI Data Refinery specializing in custom enterprise extraction.
Target Schema: "${schemaRecord.name}" (${schemaRecord.description})
${schemaRecord.custom_system_prompt ? `Special Instructions: ${schemaRecord.custom_system_prompt}` : ""}

Extract data from the webpage content into a strict JSON object with these EXACT attributes:
${fieldDescriptions}

Respond ONLY with valid JSON matching these fields.`;

    const DynamicExtractionSchema = z.record(z.any());

    const extraction = await extractStructuredData(
      c.env,
      rawText,
      extractionPrompt,
      DynamicExtractionSchema
    );

    const entityKey = `${schemaRecord.slug}_${new URL(sourceUrl).hostname}`;
    await saveRefinedEntity(c.env, {
      domain: "custom",
      entityKey,
      structuredData: extraction.data,
      summary: `Refined via Custom Schema: ${schemaRecord.name}`
    });

    return c.json({
      status: "success",
      durationMs: Date.now() - startTime,
      schema: {
        id: schemaRecord.id,
        name: schemaRecord.name,
        slug: schemaRecord.slug
      },
      sourceUrl,
      entityKey,
      structuredData: extraction.data
    });
  } catch (err: any) {
    return c.json({ error: `Custom schema refinement failed: ${err.message}` }, 500);
  }
});

// 5. Delete Custom Schema
schemasRouter.delete("/:id", async (c) => {
  const id = c.req.param("id");
  try {
    await c.env.DB.prepare("DELETE FROM custom_schemas WHERE id = ?").bind(id).run();
    return c.json({ status: "success", message: `Schema '${id}' deleted` });
  } catch (err: any) {
    return c.json({ error: `Failed to delete schema: ${err.message}` }, 500);
  }
});
