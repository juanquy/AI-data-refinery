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
import { schemasRouter } from "./routes/schemas";
import { workspacesRouter } from "./routes/workspaces";
import { exportRouter } from "./routes/export";
import { marketplaceRouter } from "./routes/marketplace";
import { enterpriseRouter } from "./routes/enterprise";
import { listRecentDiffs, listEntitiesByDomain } from "./lib/db";

const app = new Hono<{ Bindings: Env }>();

// Global Middlewares
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Refinery-Key", "X-Custom-Auth", "X-Founder-Passcode"]
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
      c.header("X-Refinery-Price-Per-Query", "$0.005 USD");
      c.header("X-Refinery-Protocol", "HTTP-402-Autonomous-Agent");
      c.header("X-Refinery-Agent-Token-Endpoint", "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token");
      return c.json({
        error: "Invalid or inactive API Key",
        status: 402,
        message: "Payment Required. Obtain an Autonomous Agent Token at /api/v1/billing/agent-token or subscribe at https://drefinery.freshbeats.ai",
        agentTokenEndpoint: "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/agent-token",
        checkoutUrl: "https://data-refinery-worker.juanquy.workers.dev/api/v1/billing/create-checkout"
      }, 402);
    }

    if (record.current_usage >= record.monthly_quota) {
      c.header("X-Refinery-Price-Per-Query", "$0.005 USD");
      c.header("X-Refinery-Protocol", "HTTP-402-Autonomous-Agent");
      return c.json({
        error: "Monthly quota exceeded",
        status: 402,
        message: "Payment Required: Your quota has been exhausted. Refill at /api/v1/billing/agent-token or https://drefinery.freshbeats.ai",
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
app.route("/api/v1/schemas", schemasRouter);
app.route("/api/v1/workspaces", workspacesRouter);
app.route("/api/v1/export", exportRouter);
app.route("/api/v1/marketplace", marketplaceRouter);
app.route("/api/v1/enterprise", enterpriseRouter);
app.route("/mcp", mcpRouter);

// Dynamic SVG Badge Generator for GitHub READMEs
app.get("/badge/:package.svg", async (c) => {
  let version = "Verified";
  let color = "#10b981";

  try {
    const pkg = (c.req.param("package") || "").replace(/\.svg$/, "").toLowerCase();
    const entity: any = await c.env.DB.prepare(
      "SELECT version_label FROM refined_entities WHERE domain = 'developer' AND entity_key = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(pkg).first();

    const diff: any = await c.env.DB.prepare(
      "SELECT severity FROM entity_diffs WHERE domain = 'developer' AND entity_key = ? ORDER BY detected_at DESC LIMIT 1"
    ).bind(pkg).first();

    if (entity?.version_label) version = entity.version_label;
    if (diff?.severity === "CRITICAL") color = "#ef4444";
    else if (diff?.severity === "MAJOR") color = "#f59e0b";
  } catch (err) {
    // Fallback defaults
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="20" role="img" aria-label="Refinery: ${version}">
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <mask id="a"><rect width="160" height="20" rx="3" fill="#fff"/></mask>
  <g mask="url(#a)">
    <path fill="#0f172a" d="M0 0h90v20H0z"/>
    <path fill="${color}" d="M90 0h70v20H90z"/>
    <path fill="url(#b)" d="M0 0h160v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
    <text x="450" y="150" fill="#000" fill-opacity=".3" transform="scale(.1)" textLength="700">Refinery</text>
    <text x="450" y="140" fill="#fff" transform="scale(.1)" textLength="700">Refinery</text>
    <text x="1250" y="150" fill="#000" fill-opacity=".3" transform="scale(.1)" textLength="500">${version}</text>
    <text x="1250" y="140" fill="#fff" transform="scale(.1)" textLength="500">${version}</text>
  </g>
</svg>`;

  return c.text(svg, 200, {
    "Content-Type": "image/svg+xml; charset=utf-8",
    "Cache-Control": "public, max-age=600"
  });
});

export default {
  fetch: app.fetch,
  
  // Scheduled Cron Handler for Autonomous Background Refining & Webhook Dispatching
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`[Cron Trigger] Starting automated background refinery cycle: ${event.cron}`);
    ctx.waitUntil(
      (async () => {
        try {
          // 1. Process active scheduled pipelines
          const { results: pipelines } = await env.DB.prepare(
            "SELECT * FROM scheduled_pipelines WHERE status = 'ACTIVE' LIMIT 10"
          ).all();

          console.log(`[Cron Trigger] Executing ${pipelines?.length || 0} active pipelines...`);

          // 2. Dispatch outbound alerts to registered Discord / Slack webhooks for critical diffs
          const recentDiff: any = await env.DB.prepare(
            "SELECT * FROM entity_diffs WHERE severity IN ('CRITICAL', 'MAJOR') ORDER BY detected_at DESC LIMIT 1"
          ).first();

          if (recentDiff) {
            const { results: webhooks } = await env.DB.prepare(
              "SELECT webhook_url FROM webhook_subscriptions WHERE status = 'ACTIVE' LIMIT 20"
            ).all();

            if (webhooks && webhooks.length > 0) {
              const alertPayload = {
                event: "refinery.diff.alert",
                timestamp: new Date().toISOString(),
                severity: recentDiff.severity,
                entity: recentDiff.entity_key,
                domain: recentDiff.domain,
                summary: recentDiff.diff_summary,
                refineryUrl: "https://drefinery.freshbeats.ai"
              };

              await Promise.allSettled(
                webhooks.map(wh =>
                  fetch(wh.webhook_url as string, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(alertPayload)
                  })
                )
              );
              console.log(`[Cron Trigger] Dispatched alerts to ${webhooks.length} webhooks.`);
            }
          }
        } catch (err) {
          console.error("[Cron Trigger Error]", err);
        }
      })()
    );
  }
};
