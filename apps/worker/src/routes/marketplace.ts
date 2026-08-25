import { Hono } from "hono";
import { Env } from "../types";

export const marketplaceRouter = new Hono<{ Bindings: Env }>();

// 1. List Marketplace Listings
marketplaceRouter.get("/", async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT * FROM marketplace_listings ORDER BY is_featured DESC, total_queries DESC"
    ).all();

    const listings = (results || []).map((item: any) => ({
      ...item,
      schema: typeof item.schema_json === "string" ? JSON.parse(item.schema_json) : item.schema_json,
      sampleOutput: typeof item.sample_output_json === "string" ? JSON.parse(item.sample_output_json) : item.sample_output_json
    }));

    return c.json({
      status: "success",
      count: listings.length,
      listings
    });
  } catch (err: any) {
    return c.json({ error: `Failed to fetch marketplace listings: ${err.message}` }, 500);
  }
});

// 2. Publish New Listing to Marketplace
marketplaceRouter.post("/", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const creatorName = String(body.creatorName || "Community Developer").trim();
  const description = String(body.description || "").trim();
  const domain = String(body.domain || "custom").trim();
  const pricePerQuery = Number(body.pricePerQuery || 0.005);
  const schema = body.schema || { fields: [] };
  const sampleOutput = body.sampleOutput || {};

  if (!title || !description) {
    return c.json({ error: "Title and description are required" }, 400);
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const id = `mkt_${crypto.randomUUID()}`;

  try {
    await c.env.DB.prepare(
      `INSERT INTO marketplace_listings (id, creator_name, title, slug, domain, description, schema_json, sample_output_json, price_per_query, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`
    )
      .bind(
        id,
        creatorName,
        title,
        slug,
        domain,
        description,
        JSON.stringify(schema),
        JSON.stringify(sampleOutput),
        pricePerQuery
      )
      .run();

    return c.json({
      status: "success",
      message: `Listing '${title}' published to Creator Marketplace!`,
      listing: { id, title, slug, creatorName, pricePerQuery }
    });
  } catch (err: any) {
    return c.json({ error: `Failed to publish listing: ${err.message}` }, 500);
  }
});

// 3. Record Query & Attribute Creator Earnings (70% Creator / 30% Platform Split)
marketplaceRouter.post("/:id/query", async (c) => {
  const id = c.req.param("id");

  try {
    const listing: any = await c.env.DB.prepare(
      "SELECT * FROM marketplace_listings WHERE id = ? OR slug = ? LIMIT 1"
    ).bind(id, id).first();

    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    const price = Number(listing.price_per_query || 0.005);
    const creatorCut = price * 0.70; // 70% Creator Revenue Share

    await c.env.DB.prepare(
      `UPDATE marketplace_listings 
       SET total_queries = total_queries + 1, earnings_usd = earnings_usd + ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    ).bind(creatorCut, listing.id).run();

    return c.json({
      status: "success",
      queryAttributed: true,
      pricePerQueryUSD: price,
      creatorRoyaltyUSD: creatorCut,
      platformFeeUSD: price * 0.30,
      listingId: listing.id
    });
  } catch (err: any) {
    return c.json({ error: `Attribution failed: ${err.message}` }, 500);
  }
});
