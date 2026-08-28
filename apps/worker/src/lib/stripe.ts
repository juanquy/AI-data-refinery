export interface CreateCheckoutParams {
  priceId?: string;
  unitAmountCents?: number;
  productName?: string;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  clientReferenceId?: string;
}

/**
 * Creates a Stripe Checkout Session via native fetch on Cloudflare Edge
 */
export async function createStripeCheckoutSession(
  secretKey: string,
  params: CreateCheckoutParams
): Promise<{ url: string; id: string }> {
  const body = new URLSearchParams();
  body.append("payment_method_types[]", "card");
  body.append("mode", "subscription");

  if (params.unitAmountCents && params.unitAmountCents > 0) {
    body.append("line_items[0][price_data][currency]", "usd");
    body.append("line_items[0][price_data][product_data][name]", params.productName || "Universal Data Refinery Pro");
    body.append("line_items[0][price_data][unit_amount]", Math.round(params.unitAmountCents).toString());
    body.append("line_items[0][price_data][recurring][interval]", "month");
  } else {
    body.append("line_items[0][price]", params.priceId || "price_1U7p5j2aItc9d3fFvEDeTvyd");
  }

  body.append("line_items[0][quantity]", "1");
  body.append("success_url", params.successUrl);
  body.append("cancel_url", params.cancelUrl);

  if (params.customerEmail) {
    body.append("customer_email", params.customerEmail);
  }
  if (params.clientReferenceId) {
    body.append("client_reference_id", params.clientReferenceId);
  }

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  const data: any = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || "Failed to create Stripe Checkout session");
  }

  return {
    url: data.url,
    id: data.id
  };
}

/**
 * Retrieves a checkout session from Stripe
 */
export async function getStripeCheckoutSession(secretKey: string, sessionId: string) {
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
    headers: {
      "Authorization": `Bearer ${secretKey}`
    }
  });
  return await response.json();
}

/**
 * Generates a high-entropy secure API key string
 */
export function generateApiKey(isLive: boolean = false): string {
  const prefix = isLive ? "rf_live_" : "rf_test_";
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const randomHex = Array.from(bytes)
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${randomHex}`;
}
