import { Hono } from "hono";
import { Env } from "../types";
import { listRecentDiffs, listEntitiesByDomain } from "../lib/db";

export const promotionRouter = new Hono<{ Bindings: Env }>();

// 1. Generate fresh AI social campaign drafts based on real database intelligence
promotionRouter.get("/drafts", async (c) => {
  const diffs = await listRecentDiffs(c.env, 3);
  const devEntities = await listEntitiesByDomain(c.env, "developer", 3);
  const pricingEntities = await listEntitiesByDomain(c.env, "pricing", 3);

  const context = {
    recentDiffs: diffs.map(d => ({ entity: d.entityKey, severity: d.severity, summary: d.diffSummary })),
    developerIntelligence: devEntities.map(e => ({ name: e.entityKey, summary: e.summary, version: e.versionLabel })),
    pricingIntelligence: pricingEntities.map(p => ({ product: p.entityKey, summary: p.summary }))
  };

  const prompt = `You are a viral developer marketer for "Universal Data Refinery" (https://drefinery.freshbeats.ai).
The product transforms messy web data into deterministic JSON for AI agents via Model Context Protocol (MCP).

Based on this real refined data:
${JSON.stringify(context, null, 2)}

Generate high-engagement promotional marketing content in JSON format.
CRITICAL CONSTRAINT: Each full tweet (including hook, text, URL, and hashtags) MUST be strictly UNDER 260 characters total to fit standard Twitter limits.
{
  "tweets": [
    {
      "hook": string,
      "tweetText": string (Max 180 chars),
      "hashtags": string[] (1-2 hashtags max)
    }
  ],
  "redditPosts": [
    {
      "targetSubreddit": string,
      "title": string,
      "postBody": string
    }
  ],
  "hackerNews": {
    "title": string,
    "discussionStarter": string
  }
}
Respond ONLY with raw parseable JSON.`;

  try {
    const aiResponse: any = await c.env.AI.run("@cf/meta/llama-3.1-8b-instruct" as any, {
      messages: [
        { role: "system", content: "You are a tech marketing growth expert. Output strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    let raw = aiResponse.response || JSON.stringify(aiResponse);
    if (raw.startsWith("```json")) raw = raw.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    if (raw.startsWith("```")) raw = raw.replace(/^```\s*/, "").replace(/\s*```$/, "");

    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      raw = raw.substring(firstBrace, lastBrace + 1);
    }

    const campaign = JSON.parse(raw);
    return c.json({
      status: "success",
      generatedAt: new Date().toISOString(),
      campaign
    });
  } catch (err: any) {
    // High quality fallback marketing templates
    return c.json({
      status: "fallback",
      generatedAt: new Date().toISOString(),
      campaign: {
        tweets: [
          {
            hook: "AI agents shouldn't hallucinate.",
            tweetText: "Just launched Universal Data Refinery! ⚡ Refines SDK changelogs, B2B pricing & city permits into clean JSON for AI agents via MCP.\n\nStudio: https://drefinery.freshbeats.ai",
            hashtags: ["#AI", "#Cloudflare", "#MCP"]
          },
          {
            hook: "Raw web scraping is dying for AI agents:",
            tweetText: "Agents need strict JSON with semantic diffing, not 50k tokens of messy HTML.\n\nBuilt on @Cloudflare Workers AI:\nhttps://drefinery.freshbeats.ai",
            hashtags: ["#Cloudflare", "#AIagents"]
          }
        ],
        redditPosts: [
          {
            targetSubreddit: "r/Cloudflare",
            title: "I built an edge-native AI Data Refinery & MCP Server using Workers AI, D1 SQL, and Vectorize",
            postBody: "Hey everyone! Inspired by the shift towards machine-readable internet resources, I built an end-to-end Data Refinery running completely on Cloudflare's serverless AI stack.\n\nCheck out the live studio at https://drefinery.freshbeats.ai and the open source repo at https://github.com/juanquy/AI-data-refinery."
          }
        ],
        hackerNews: {
          title: "Show HN: Universal Data Refinery – Edge-native machine fuel for AI agents via MCP",
          discussionStarter: "We built an edge-native data refinery running on Cloudflare Workers AI that ingests messy documentation, computes semantic version diffs, and serves structured JSON directly to AI agents via MCP."
        }
      }
    });
  }
});

// 2. RSS 2.0 Feed for automated Buffer / Zapier / IFTTT social broadcasting
promotionRouter.get("/feed.rss", async (c) => {
  const diffs = await listRecentDiffs(c.env, 15);

  const rssItems = diffs.map(d => `
    <item>
      <title>[${d.severity}] ${d.domain.toUpperCase()}: ${d.entityKey} updated</title>
      <link>https://drefinery.freshbeats.ai</link>
      <description><![CDATA[${d.diffSummary}]]></description>
      <pubDate>${new Date(d.detectedAt).toUTCString()}</pubDate>
      <guid>refinery-diff-${d.id}</guid>
    </item>
  `).join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Universal Data Refinery - Live Intelligence Feed</title>
  <link>https://drefinery.freshbeats.ai</link>
  <description>Real-time breaking SDK changes, B2B pricing adjustments, and regulatory compliance updates for AI agents.</description>
  <language>en-us</language>
  <atom:link href="https://data-refinery-worker.juanquy.workers.dev/api/v1/promotions/feed.rss" rel="self" type="application/rss+xml" />
  ${rssItems}
</channel>
</rss>`;

  return c.text(rssXml, 200, {
    "Content-Type": "application/xml; charset=utf-8",
    "Cache-Control": "public, max-age=300"
  });
});
