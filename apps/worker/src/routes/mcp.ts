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

  // Handle tools/list
  if (method === "tools/list") {
    return c.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: MCP_TOOLS
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
      const pkg = String(args.packageOrService || "").toLowerCase();
      const entity = await getLatestEntity(env, "developer", pkg);
      if (!entity) {
        return {
          status: "not_found",
          message: `No refined developer intelligence found for '${pkg}'. Trigger on-demand refinement via 'refinery_refine_custom_url'.`
        };
      }
      if (args.breakingOnly && entity.structuredData?.breakingChanges) {
        return {
          package: pkg,
          version: entity.versionLabel,
          breakingChanges: entity.structuredData.breakingChanges,
          summary: entity.summary
        };
      }
      return entity.structuredData;
    }

    case "refinery_b2b_pricing_matrix": {
      const product = String(args.companyOrProduct || "").toLowerCase();
      if (product) {
        const entity = await getLatestEntity(env, "pricing", product);
        if (entity) return entity.structuredData;
      }
      // Fallback search
      const { results } = await env.DB.prepare(
        "SELECT structured_data FROM refined_entities WHERE domain = 'pricing' LIMIT 5"
      ).all();
      return (results || []).map((r: any) => JSON.parse(r.structured_data));
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
      const url = String(args.url || "");
      const instruction = String(args.instructionPrompt || "");
      const rawText = await fetchWebpageContent(url);

      const CustomSchema = z.object({
        title: z.string(),
        summary: z.string(),
        extractedAttributes: z.record(z.any()),
        insights: z.array(z.string())
      });

      const extraction = await extractStructuredData(
        env,
        rawText,
        `Extract structured data as requested: ${instruction}`,
        CustomSchema
      );

      const entityKey = new URL(url).hostname;
      await saveRefinedEntity(env, {
        domain: "custom",
        entityKey,
        structuredData: extraction.data,
        summary: extraction.summary
      });

      return extraction.data;
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}
