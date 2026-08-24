import { z } from "zod";
import { Env } from "../types";

/**
 * Clean raw HTML into dense, token-efficient text/markdown
 */
export function sanitizeHtmlToText(html: string): string {
  let cleaned = html
    // Remove scripts, styles, svgs, noscripts, iframes
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    // Convert common block elements to linebreaks
    .replace(/<\/(p|div|h[1-6]|li|tr|article|section|header|footer)>/gi, "\n")
    .replace(/<br\s*[\/]?>/gi, "\n")
    // Remove all remaining HTML tags
    .replace(/<[^>]+>/g, " ")
    // Decode basic HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    // Collapse multi-spaces and multi-newlines
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

  // Limit content length to fit comfortably within LLM context window (~30,000 characters)
  if (cleaned.length > 30000) {
    cleaned = cleaned.substring(0, 30000) + "\n\n...[Content truncated for refinement]";
  }
  return cleaned;
}

/**
 * Fetch webpage content with resilient headers
 */
export async function fetchWebpageContent(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 DataRefineryBot/1.0",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.7",
      "Accept-Language": "en-US,en;q=0.9"
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL ${url}: ${response.status} ${response.statusText}`);
  }

  const rawHtml = await response.text();
  return sanitizeHtmlToText(rawHtml);
}

/**
 * Extract structured JSON using Cloudflare Workers AI
 */
export async function extractStructuredData<T>(
  env: Env,
  rawText: string,
  systemPrompt: string,
  schema: z.ZodType<T>,
  modelName: string = "@cf/meta/llama-3.1-8b-instruct"
): Promise<{ data: T; summary: string; rawOutput: string }> {
  const fullPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with a valid, parseable JSON object matching the requested schema. Do not enclose in backticks or markdown if possible. Do not include commentary outside the JSON.\n\nRAW CONTENT TO REFINE:\n\"\"\"\n${rawText}\n\"\"\"`;

  let response: any;
  try {
    response = await env.AI.run(modelName as any, {
      messages: [
        {
          role: "system",
          content: "You are the core extraction engine of an AI Data Refinery. Your job is to extract high-precision structured data from raw, messy text into strict JSON format with zero hallucination."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 3000
    });
  } catch (err: any) {
    // Fallback model if primary model is unavailable or rate-limited
    try {
      response = await env.AI.run("@cf/meta/llama-3.3-70b-instruct" as any, {
        prompt: `${systemPrompt}\n\nStrict JSON output:\n${rawText}`,
        max_tokens: 3000
      });
    } catch (fallbackErr: any) {
      throw new Error(`Workers AI extraction failed: ${err.message || err}`);
    }
  }

  const rawOutput: string = response.response || (typeof response === "string" ? response : JSON.stringify(response));

  // Clean output to extract pure JSON block if surrounded by markdown code blocks
  let jsonString = rawOutput.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }

  // Find first '{' and last '}'
  const firstBrace = jsonString.indexOf("{");
  const lastBrace = jsonString.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonString = jsonString.substring(firstBrace, lastBrace + 1);
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(jsonString);
  } catch (jsonErr: any) {
    throw new Error(`AI returned invalid JSON: ${jsonErr.message}. Output was: ${rawOutput.substring(0, 500)}`);
  }

  // Validate against Zod schema
  const validationResult = schema.safeParse(parsedJson);
  if (!validationResult.success) {
    // If strict parse fails, attempt lenient extraction or throw with details
    throw new Error(`Schema validation error: ${JSON.stringify(validationResult.error.format())}`);
  }

  const summary = (parsedJson as any).summary || "Refined structured entity";
  return {
    data: validationResult.data,
    summary,
    rawOutput
  };
}
