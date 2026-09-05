import { Hono } from "hono";
import { DeveloperReleaseSchema } from "@data-refinery/schema";
import type { Env } from "../types";
import { extractStructuredData, fetchWebpageContent } from "../lib/extractor";
import { getLatestEntity, listEntitiesByDomain, saveRefinedEntity } from "../lib/db";

export const devRouter = new Hono<{ Bindings: Env }>();

const DEV_SYSTEM_PROMPT = `You are a specialized Developer API & SDK Breaking Changes Refinery.
Analyze the provided release notes, GitHub changelog, or migration documentation.
Extract exact breaking changes, deprecated methods, code migration snippets, and version compatibility.
Respond ONLY with a JSON object matching this schema:
{
  "packageOrServiceName": string,
  "ecosystem": "NPM" | "PYPI" | "CRATES" | "GO" | "MAVEN" | "REST_API" | "GRAPHQL" | "OTHER",
  "version": string,
  "releaseDate": string (optional),
  "summary": string,
  "hasBreakingChanges": boolean,
  "breakingChanges": [
    {
      "symbolName": string,
      "type": "DEPRECATION" | "REMOVAL" | "SIGNATURE_CHANGE" | "BEHAVIOR_CHANGE" | "CONFIG_CHANGE",
      "description": string,
      "migrationGuide": string,
      "beforeCodeSnippet": string (optional),
      "afterCodeSnippet": string (optional),
      "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
    }
  ],
  "deprecations": string[],
  "newFeatures": string[],
  "bugFixes": string[],
  "compatibility": {
    "minNodeVersion": string (optional),
    "supportedRuntimes": string[],
    "peerDependencies": Record<string, string> (optional)
  }
}`;

// Query refined breaking changes for a package
devRouter.get("/:package", async (c) => {
  const pkg = c.req.param("package").toLowerCase();
  const entity = await getLatestEntity(c.env, "developer", pkg);

  if (!entity) {
    return c.json({ error: `No refined developer intelligence found for package '${pkg}'` }, 404);
  }

  return c.json({
    status: "success",
    domain: "developer",
    entityKey: pkg,
    version: entity.versionLabel,
    data: entity.structuredData,
    summary: entity.summary,
    lastRefinedAt: entity.createdAt
  });
});

// List all developer entities
devRouter.get("/", async (c) => {
  const limit = Number(c.req.query("limit") || 20);
  const entities = await listEntitiesByDomain(c.env, "developer", limit);
  return c.json({ status: "success", count: entities.length, items: entities });
});

// Refine a new release from raw text or URL
devRouter.post("/refine", async (c) => {
  const startTime = Date.now();
  const body = await c.req.json();
  const { url, rawText, packageKey } = body;

  let textToAnalyze = rawText;
  if (url && !textToAnalyze) {
    try {
      textToAnalyze = await fetchWebpageContent(url);
    } catch (err: any) {
      return c.json({ error: `Failed to fetch source URL: ${err.message}` }, 400);
    }
  }

  if (!textToAnalyze) {
    return c.json({ error: "Either 'url' or 'rawText' must be provided." }, 400);
  }

  try {
    const extraction = await extractStructuredData(
      c.env,
      textToAnalyze,
      DEV_SYSTEM_PROMPT,
      DeveloperReleaseSchema
    );

    const entityKey = (packageKey || extraction.data.packageOrServiceName).toLowerCase();
    const saved = await saveRefinedEntity(c.env, {
      domain: "developer",
      entityKey,
      versionLabel: extraction.data.version,
      structuredData: extraction.data,
      summary: extraction.summary,
      confidenceScore: 0.98
    });

    return c.json({
      status: "success",
      entityId: saved.entityId,
      entityKey,
      version: extraction.data.version,
      summary: extraction.summary,
      data: extraction.data,
      diff: saved.diff,
      durationMs: Date.now() - startTime
    });
  } catch (err: any) {
    return c.json({ error: `Refinery extraction failed: ${err.message}` }, 500);
  }
});
