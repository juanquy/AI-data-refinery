import test from "node:test";
import assert from "node:assert/strict";
import { computeEntityDiff } from "../src/lib/differ.ts";

test("Differ correctly identifies breaking changes in developer domain", () => {
  const previousData = {
    version: "14.0.0",
    breakingChanges: []
  };

  const currentData = {
    version: "15.0.0",
    breakingChanges: [
      {
        symbolName: "stripe.charges.create",
        type: "REMOVAL",
        description: "Callbacks removed"
      }
    ]
  };

  const diff = computeEntityDiff("developer", "stripe-node", previousData, currentData);

  assert.ok(diff !== null);
  assert.equal(diff.severity, "CRITICAL");
  assert.equal(diff.entityKey, "stripe-node");
  assert.ok(diff.changes.some(c => c.field === "breakingChanges"));
});

test("Differ correctly identifies pricing increases as critical", () => {
  const previousPricing = {
    companyOrProductName: "Acme Cloud",
    tiers: [
      { name: "Pro", monthlyPrice: 20 }
    ]
  };

  const currentPricing = {
    companyOrProductName: "Acme Cloud",
    tiers: [
      { name: "Pro", monthlyPrice: 35 }
    ]
  };

  const diff = computeEntityDiff("pricing", "acme-cloud", previousPricing, currentPricing);

  assert.ok(diff !== null);
  assert.equal(diff.severity, "CRITICAL");
  assert.ok(diff.changes.some(c => c.field === "tier:Pro:monthlyPrice"));
});

test("Differ returns null when structured payloads are identical", () => {
  const data = {
    company: "Test",
    tiers: [{ name: "Free", price: 0 }]
  };

  const diff = computeEntityDiff("pricing", "test", data, data);
  assert.equal(diff, null);
});
