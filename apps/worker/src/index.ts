import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Env } from "./types";
import { devRouter } from "./routes/dev";
import { pricingRouter } from "./routes/pricing";
import { regulatoryRouter } from "./routes/regulatory";
import { customRouter } from "./routes/custom";
import { searchRouter } from "./routes/search";
import { mcpRouter } from "./routes/mcp";
import { billingRouter } from "./routes/billing";
import { promotionRouter } from "./routes/promotions";
import { managementRouter } from "./routes/management";
import { listRecentDiffs, listEntitiesByDomain } from "./lib/db";

const app = new Hono<{ Bindings: Env }>();

// Global Middlewares
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Refinery-Key", "X-Custom-Auth"]
  })
);

// Agent Quota & HTTP 402 Payment Required Middleware
app.use("/api/v1/dev/*", async (c, next) => {
  const apiKey = c.req.header("X-Refinery-Key") || c.req.header("Authorization")?.replace("Bearer ", "");
  if (apiKey) {
    const record: any = await c.env.DB.prepare(
      "SELECT * FROM api_keys WHERE key_value = ? AND status = 'ACTIVE' LIMIT 1"
    ).bind(apiKey).first();

    if (!record) {
      return c.json({
        error: "Invalid or inactive API Key",
        status: 402,
        message: "Payment Required. Subscribe at https://drefinery.freshbeats.ai",
        checkoutUrl: "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/create-checkout"
      }, 402);
    }

    if (record.current_usage >= record.monthly_quota) {
      return c.json({
        error: "Monthly quota exceeded",
        status: 402,
        message: "Payment Required: Your 10,000 monthly quota has been exhausted. Upgrade plan at https://drefinery.freshbeats.ai",
        currentUsage: record.current_usage,
        monthlyQuota: record.monthly_quota
      }, 402);
    }

    // Increment usage asynchronously
    c.executionCtx.waitUntil(
      c.env.DB.prepare("UPDATE api_keys SET current_usage = current_usage + 1 WHERE id = ?").bind(record.id).run()
    );
  }
  await next();
});

// Health & System Info
app.get("/", (c) => {
  return c.json({
    name: "Universal Data Refinery",
    tagline: "High-Performance Edge-Native Machine Intelligence Refinery for AI Agents",
    version: "1.0.0",
    runtime: "Cloudflare Workers & Workers AI",
    status: "operational",
    endpoints: {
      developer: "/api/v1/dev",
      pricing: "/api/v1/pricing",
      regulatory: "/api/v1/regulatory",
      customOnDemand: "/api/v1/custom",
      search: "/api/v1/search",
      diffsAndAlerts: "/api/v1/diffs",
      mcpServer: "/mcp",
      mcpManifest: "/mcp/manifest"
    }
  });
});

// Diffs & Semantic Alerts Feed
app.get("/api/v1/diffs", async (c) => {
  const limit = Number(c.req.query("limit") || 20);
  const diffs = await listRecentDiffs(c.env, limit);
  return c.json({ status: "success", count: diffs.length, diffs });
});

// Aggregate Overview / Stats
app.get("/api/v1/stats", async (c) => {
  const devItems = await listEntitiesByDomain(c.env, "developer", 5);
  const pricingItems = await listEntitiesByDomain(c.env, "pricing", 5);
  const regulatoryItems = await listEntitiesByDomain(c.env, "regulatory", 5);
  const customItems = await listEntitiesByDomain(c.env, "custom", 5);
  const recentDiffs = await listRecentDiffs(c.env, 5);

  return c.json({
    status: "success",
    counts: {
      developer: devItems.length,
      pricing: pricingItems.length,
      regulatory: regulatoryItems.length,
      custom: customItems.length,
      recentDiffs: recentDiffs.length
    },
    latestDiffs: recentDiffs
  });
});

// Mount Subrouters
app.route("/api/v1/dev", devRouter);
app.route("/api/v1/pricing", pricingRouter);
app.route("/api/v1/regulatory", regulatoryRouter);
app.route("/api/v1/custom", customRouter);
app.route("/api/v1/search", searchRouter);
app.route("/api/v1/billing", billingRouter);
app.route("/api/v1/promotions", promotionRouter);
app.route("/api/v1/management", managementRouter);
app.route("/mcp", mcpRouter);

export default {
  fetch: app.fetch,
  
  // Scheduled Cron Handler for Autonomous Background Refining
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`[Cron Trigger] Starting automated background refinery cycle: ${event.cron}`);
    ctx.waitUntil(
      (async () => {
        // Query active sources registered for periodic crawling
        try {
          const { results: sources } = await env.DB.prepare(
            "SELECT * FROM refinery_sources WHERE enabled = 1 LIMIT 10"
          ).all();

          console.log(`[Cron Trigger] Processed ${sources?.length || 0} scheduled sources.`);
        } catch (err) {
          console.error("[Cron Trigger Error]", err);
        }
      })()
    );
  }
};
