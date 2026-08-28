import { Hono } from "hono";
import { Env } from "../types";
import { createStripeCheckoutSession, generateApiKey, getStripeCheckoutSession } from "../lib/stripe";

export const billingRouter = new Hono<{ Bindings: Env }>();

// 0. Public Dynamic Pricing Plans
billingRouter.get("/plans", async (c) => {
  try {
    const { results } = await c.env.DB.prepare("SELECT * FROM pricing_plans ORDER BY price_usd ASC").all();
    return c.json({ status: "success", plans: results || [] });
  } catch (err: any) {
    return c.json({ error: "Failed to fetch pricing plans", details: err.message }, 500);
  }
});

// 1. Create a Stripe Checkout Session
billingRouter.post("/create-checkout", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const email = body.email;
  const redirectOrigin = body.origin || "https://drefinery.freshbeats.ai";

  const secretKey = c.env.STRIPE_SECRET_KEY || "";
  let priceId = c.env.STRIPE_PRO_PRICE_ID || "price_1U7oWJ2aItc9d3fFL5KoOsLv";
  let unitAmountCents: number | undefined = undefined;
  let productName = "Universal Data Refinery Pro";

  try {
    const proPlan: any = await c.env.DB.prepare("SELECT * FROM pricing_plans WHERE id = 'PRO' LIMIT 1").first();
    if (proPlan) {
      productName = proPlan.name || productName;
      if (proPlan.stripe_price_id) {
        priceId = proPlan.stripe_price_id;
      }
      if (proPlan.price_usd && proPlan.price_usd > 0) {
        unitAmountCents = Math.round(proPlan.price_usd * 100);
      }
    }
  } catch {}

  try {
    const session = await createStripeCheckoutSession(secretKey, {
      priceId,
      unitAmountCents,
      productName,
      customerEmail: email,
      successUrl: `${redirectOrigin}?session_id={CHECKOUT_SESSION_ID}&checkout=success`,
      cancelUrl: `${redirectOrigin}?checkout=cancelled`
    });

    return c.json({
      status: "success",
      checkoutUrl: session.url,
      sessionId: session.id
    });
  } catch (err: any) {
    return c.json({ error: `Stripe checkout creation failed: ${err.message}` }, 500);
  }
});

// 2. Retrieve newly generated API key after checkout completes
billingRouter.get("/session-key", async (c) => {
  const sessionId = c.req.query("session_id");
  if (!sessionId) {
    return c.json({ error: "Missing session_id query parameter" }, 400);
  }

  const secretKey = c.env.STRIPE_SECRET_KEY || "";

  try {
    const session: any = await getStripeCheckoutSession(secretKey, sessionId);
    if (!session || session.payment_status !== "paid") {
      return c.json({ error: "Payment not completed or invalid session" }, 400);
    }

    const email = session.customer_details?.email || session.customer_email || "customer@example.com";
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    // Check if key already generated for this session/customer
    let existingKeyRecord: any = await c.env.DB.prepare(
      "SELECT * FROM api_keys WHERE stripe_customer_id = ? OR stripe_subscription_id = ? ORDER BY created_at DESC LIMIT 1"
    )
      .bind(customerId, subscriptionId)
      .first();

    if (!existingKeyRecord) {
      // Provision new API key
      const newApiKey = generateApiKey(session.livemode || false);
      const keyId = `key_${crypto.randomUUID()}`;

      await c.env.DB.prepare(
        `INSERT INTO api_keys (id, key_value, user_email, stripe_customer_id, stripe_subscription_id, plan, monthly_quota, current_usage, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'PRO', 10000, 0, 'ACTIVE', CURRENT_TIMESTAMP)`
      )
        .bind(keyId, newApiKey, email, customerId, subscriptionId)
        .run();

      existingKeyRecord = {
        key_value: newApiKey,
        plan: "PRO",
        monthly_quota: 10000,
        current_usage: 0,
        status: "ACTIVE",
        user_email: email
      };
    }

    return c.json({
      status: "success",
      apiKey: existingKeyRecord.key_value,
      plan: existingKeyRecord.plan,
      monthlyQuota: existingKeyRecord.monthly_quota,
      currentUsage: existingKeyRecord.current_usage,
      email: existingKeyRecord.user_email
    });
  } catch (err: any) {
    return c.json({ error: `Failed to retrieve session key: ${err.message}` }, 500);
  }
});

// 3. Autonomous Agent Micro-Token Provisioning (HTTP 402 Pay-Per-Query)
billingRouter.post("/agent-token", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const agentName = body.agentName || "Autonomous_Agent";
  const agentOwner = body.agentOwner || "agent@autonomous.ai";
  const queriesAllowance = Number(body.queriesAllowance || 100);

  const rawRandom = crypto.randomUUID().replace(/-/g, "");
  const agentToken = `ref_agent_${rawRandom}`;
  const keyId = `key_agent_${crypto.randomUUID()}`;

  await c.env.DB.prepare(
    `INSERT INTO api_keys (id, key_value, user_email, plan, monthly_quota, current_usage, status, created_at)
     VALUES (?, ?, ?, 'AGENT_MICRO', ?, 0, 'ACTIVE', CURRENT_TIMESTAMP)`
  )
    .bind(keyId, agentToken, `${agentName} (${agentOwner})`, queriesAllowance)
    .run();

  return c.json({
    status: "success",
    agentName,
    agentToken,
    plan: "AGENT_MICRO",
    queriesAllowance,
    pricePerQuery: "$0.005 USD",
    protocol: "HTTP-402-Pay-Per-Query",
    usageHeaders: {
      "Authorization": `Bearer ${agentToken}`,
      "X-Refinery-Key": agentToken
    },
    message: `Prepaid agent key activated with ${queriesAllowance} query credits.`
  });
});

// 4. Verify/Inspect any key
billingRouter.get("/verify-key", async (c) => {
  const key = c.req.query("key") || c.req.header("X-Refinery-Key") || c.req.header("Authorization")?.replace("Bearer ", "");
  if (!key) {
    return c.json({ error: "Missing API key" }, 400);
  }

  const record: any = await c.env.DB.prepare(
    "SELECT * FROM api_keys WHERE key_value = ? LIMIT 1"
  )
    .bind(key)
    .first();

  if (!record) {
    return c.json({ valid: false, message: "Invalid API key" }, 404);
  }

  return c.json({
    valid: true,
    key: `${record.key_value.substring(0, 10)}...`,
    plan: record.plan,
    status: record.status,
    monthlyQuota: record.monthly_quota,
    currentUsage: record.current_usage,
    remainingQueries: Math.max(0, record.monthly_quota - record.current_usage),
    userEmail: record.user_email,
    createdAt: record.created_at
  });
});

// 4. Stripe Webhook listener
billingRouter.post("/webhook", async (c) => {
  const event: any = await c.req.json().catch(() => null);
  if (!event || !event.type) {
    return c.text("Invalid payload", 400);
  }

  const logId = `log_${crypto.randomUUID()}`;
  await c.env.DB.prepare(
    "INSERT INTO billing_logs (id, event_type, stripe_customer_id, payload, created_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)"
  )
    .bind(logId, event.type, event.data?.object?.customer || null, JSON.stringify(event))
    .run();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const email = session.customer_details?.email || session.customer_email;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    const existing = await c.env.DB.prepare(
      "SELECT id FROM api_keys WHERE stripe_customer_id = ?"
    )
      .bind(customerId)
      .first();

    if (!existing) {
      const newApiKey = generateApiKey(session.livemode || false);
      const keyId = `key_${crypto.randomUUID()}`;
      await c.env.DB.prepare(
        `INSERT INTO api_keys (id, key_value, user_email, stripe_customer_id, stripe_subscription_id, plan, monthly_quota, current_usage, status, created_at)
         VALUES (?, ?, ?, ?, ?, 'PRO', 10000, 0, 'ACTIVE', CURRENT_TIMESTAMP)`
      )
        .bind(keyId, newApiKey, email, customerId, subscriptionId)
        .run();
    }
  } else if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    await c.env.DB.prepare(
      "UPDATE api_keys SET status = 'REVOKED' WHERE stripe_subscription_id = ?"
    )
      .bind(subscription.id)
      .run();
  }

  return c.json({ received: true });
});
