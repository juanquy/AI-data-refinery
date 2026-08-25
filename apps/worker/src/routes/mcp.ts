import { Hono } from "hono";
import { MCP_TOOLS } from "@data-refinery/schema";
import { Env } from "../types";
import { getLatestEntity } from "../lib/db";
import { queryVectors } from "../lib/vector";
import { fetchWebpageContent, extractStructuredData } from "../lib/extractor";
import { saveRefinedEntity } from "../lib/db";
import { z } from "zod";

export const mcpRouter = new Hono<{ Bindings: Env }>();

// GET /mcp/manifest or info
mcpRouter.get("/manifest", (c) => {
  return c.json({
    name: "data-refinery-mcp-server",
    version: "1.0.0",
    description: "Universal Data Refinery Model Context Protocol (MCP) Server for AI Agents",
    capabilities: {
      tools: true,
      resources: true
    },
    tools: MCP_TOOLS
  });
});

// POST /mcp (JSON-RPC 2.0 Endpoint)
mcpRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== "2.0") {
    return c.json({ jsonrpc: "2.0", id: id || null, error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" } });
  }

  // Handle MCP initialize
  if (method === "initialize") {
    return c.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {
            listChanged: false
          },
          resources: {
            subscribe: false,
            listChanged: false
          }
        },
        serverInfo: {
          name: "universal-data-refinery",
          version: "1.0.0"
        }
      }
    });
  }

  // Handle tools/list with dynamic custom schemas
  if (method === "tools/list") {
    let customTools: any[] = [];
    try {
      const { results: customSchemas } = await c.env.DB.prepare(
        "SELECT name, slug, description FROM custom_schemas LIMIT 20"
      ).all();

      customTools = (customSchemas || []).map((cs: any) => ({
        name: `refinery_custom_${cs.slug.replace(/-/g, "_")}`,
        description: `[Custom Enterprise Schema] ${cs.description || cs.name}`,
        inputSchema: {
          type: "object",
          properties: {
            url: { type: "string", description: "Target URL to ingest and distill" }
          },
          required: ["url"]
        }
      }));
    } catch {}

    return c.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: [...MCP_TOOLS, ...customTools]
      }
    });
  }

  // Handle resources/list
  if (method === "resources/list") {
    return c.json({
      jsonrpc: "2.0",
      id,
      result: {
        resources: [
          {
            uri: "refinery://developer/breaking-changes",
            name: "Developer Breaking Changes Feed",
            description: "Live database of API deprecations, symbol removals, and migration diffs",
            mimeType: "application/json"
          },
          {
            uri: "refinery://pricing/b2b-matrix",
            name: "B2B SaaS Pricing Matrices",
            description: "Normalized SaaS pricing tiers, limits, and overage rates",
            mimeType: "application/json"
          },
          {
            uri: "refinery://regulatory/municipal-rules",
            name: "Localized Regulatory & Permits",
            description: "Municipal ordinances, permits, penalties, and compliance checklists",
            mimeType: "application/json"
          }
        ]
      }
    });
  }

  // Handle prompts/list
  if (method === "prompts/list") {
    return c.json({
      jsonrpc: "2.0",
      id,
      result: {
        prompts: [
          {
            name: "check_sdk_upgrade",
            description: "Check if upgrading an SDK will break your code",
            arguments: [
              { name: "package", description: "Package name", required: true },
              { name: "targetVersion", description: "Target version", required: false }
            ]
          }
        ]
      }
    });
  }

  // Handle tools/call
  if (method === "tools/call") {
    const { name, arguments: args } = params || {};
    try {
      const toolResult = await handleToolExecution(c.env, name, args || {});
      return c.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(toolResult, null, 2)
            }
          ],
          isError: false
        }
      });
    } catch (err: any) {
      return c.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: `Tool execution error: ${err.message}`
            }
          ],
          isError: true
        }
      });
    }
  }

  return c.json({
    jsonrpc: "2.0",
    id,
    error: {
      code: -32601,
      message: `Method '${method}' not implemented`
    }
  });
});

/**
 * Execute MCP tool calls against Data Refinery
 */
async function handleToolExecution(env: Env, toolName: string, args: Record<string, any>) {
  switch (toolName) {
    case "refinery_dev_breaking_changes": {
      const pkg = String(args.packageOrService || args.package || "").toLowerCase();
      if (pkg) {
        const entity = await getLatestEntity(env, "developer", pkg);
        if (entity) {
          return entity.structuredData;
        }
      }
      // Fallback to recent developer intelligence
      const { results } = await env.DB.prepare(
        "SELECT structured_data FROM refined_entities WHERE domain = 'developer' ORDER BY created_at DESC LIMIT 5"
      ).all();
      if (results && results.length > 0) {
        return results.length === 1 ? JSON.parse(String(results[0].structured_data)) : results.map((r: any) => JSON.parse(String(r.structured_data)));
      }
      return {
        status: "not_found",
        message: `No refined developer intelligence found for '${pkg}'. Trigger on-demand refinement via 'refinery_refine_custom_url'.`
      };
    }

    case "refinery_b2b_pricing_matrix": {
      const product = String(args.companyOrProduct || args.product || "").toLowerCase();
      if (product) {
        const entity = await getLatestEntity(env, "pricing", product);
        if (entity) return entity.structuredData;
      }
      // Fallback search
      const { results } = await env.DB.prepare(
        "SELECT structured_data FROM refined_entities WHERE domain = 'pricing' LIMIT 5"
      ).all();
      if (results && results.length > 0) {
        return results.length === 1 ? JSON.parse(String(results[0].structured_data)) : results.map((r: any) => JSON.parse(String(r.structured_data)));
      }
      return { status: "not_found", message: `No pricing matrix found for '${product}'` };
    }

    case "refinery_regulatory_compliance": {
      const jurisdiction = String(args.jurisdiction || "");
      const topic = String(args.topic || "");
      const searchKey = `${jurisdiction} ${topic}`.trim();

      const { results } = await env.DB.prepare(
        "SELECT structured_data FROM refined_entities WHERE domain = 'regulatory' AND (entity_key LIKE ? OR summary LIKE ?) LIMIT 5"
      )
        .bind(`%${searchKey}%`, `%${searchKey}%`)
        .all();

      return (results || []).map((r: any) => JSON.parse(r.structured_data));
    }

    case "refinery_semantic_search": {
      const query = String(args.query || "");
      const domain = String(args.domain || "all");
      const topK = Number(args.topK || 5);
      return await queryVectors(env, query, topK, domain);
    }

    case "refinery_refine_custom_url": {
      const url = String(args.url || args.sourceUrl || "");
      const instruction = String(args.instructionPrompt || args.instruction || "Extract all structured information");
      if (!url || !url.startsWith("http")) {
        return { error: "Valid HTTP or HTTPS URL required" };
      }
      const rawText = await fetchWebpageContent(url);

      const CustomSchema = z.object({
        title: z.string().default("Web Resource"),
        summary: z.string().default(""),
        extractedAttributes: z.record(z.any()).default({}),
        insights: z.array(z.string()).default([])
      });

      const extraction = await extractStructuredData(
        env,
        rawText,
        `Extract structured data as requested: ${instruction}`,
        CustomSchema
      );

      let entityKey = "custom-page";
      try {
        entityKey = new URL(url).hostname;
      } catch {}

      await saveRefinedEntity(env, {
        domain: "custom",
        entityKey,
        structuredData: extraction.data,
        summary: extraction.summary
      });

      return extraction.data;
    }

    default: {
      if (toolName.startsWith("refinery_custom_")) {
        const slug = toolName.replace("refinery_custom_", "").replace(/_/g, "-");
        const url = String(args.url || args.sourceUrl || "");
        if (!url || !url.startsWith("http")) {
          return { error: "Valid URL required for custom schema extraction" };
        }

        const schemaRecord: any = await env.DB.prepare(
          "SELECT * FROM custom_schemas WHERE slug = ? OR slug LIKE ? LIMIT 1"
        ).bind(slug, `%${slug}%`).first();

        if (schemaRecord) {
          const rawText = await fetchWebpageContent(url);
          const fields = JSON.parse(schemaRecord.fields_json);
          const fieldDescriptions = fields
            .map((f: any) => `- "${f.name}" (${f.type}): ${f.description || f.name}`)
            .join("\n");

          const prompt = `Target Schema: "${schemaRecord.name}". Extract structured JSON with attributes:\n${fieldDescriptions}`;
          const extraction = await extractStructuredData(env, rawText, prompt, z.record(z.any()));

          const entityKey = `${schemaRecord.slug}_${new URL(url).hostname}`;
          await saveRefinedEntity(env, {
            domain: "custom",
            entityKey,
            structuredData: extraction.data,
            summary: `Refined via Custom MCP Tool: ${schemaRecord.name}`
          });

          return extraction.data;
        }
      }
      throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
