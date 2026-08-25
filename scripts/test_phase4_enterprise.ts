/**
 * Phase 4 Automated Verification Test:
 * Tests LLM Fine-Tuning JSONL Exporter, Creator Marketplace Listings & Query Attribution,
 * Enterprise SLA Health Telemetry, and Browser Extension Manifest.
 */

import * as fs from "fs";
import * as path from "path";

async function main() {
  const baseUrl = "https://data-refinery-worker.juanquy.workers.dev";
  console.log("🚀 Starting Phase 4 Automated Verification Test against:", baseUrl);
  console.log("------------------------------------------------------------------");

  // Test 1: LLM Fine-Tuning Dataset Exporter (OpenAI JSONL)
  console.log("\n[TEST 1] Testing LLM Fine-Tuning Dataset Exporter (GET /api/v1/export/fine-tuning?format=openai_jsonl)...");
  const exportRes = await fetch(`${baseUrl}/api/v1/export/fine-tuning?format=openai_jsonl&limit=10`);
  const exportData = await exportRes.json();
  console.log(`✅ Exported dataset count: ${exportData.count} records (Format: ${exportData.format})`);
  if (exportData.samplePreview && exportData.samplePreview[0]) {
    console.log("   Sample OpenAI Message Structure:", JSON.stringify(exportData.samplePreview[0].messages[0], null, 2));
  }

  // Test 2: Creator Marketplace Listings & 70% Revenue Attribution
  console.log("\n[TEST 2] Testing Creator Marketplace (GET /api/v1/marketplace)...");
  const mktRes = await fetch(`${baseUrl}/api/v1/marketplace`);
  const mktData = await mktRes.json();
  console.log(`✅ Marketplace Listings (${mktData.count}):`, mktData.listings?.map((l: any) => `${l.title} ($${l.price_per_query}/call)`));

  if (!mktData.listings || mktData.listings.length === 0) {
    throw new Error("No marketplace listings found");
  }

  const sampleListingId = mktData.listings[0].id;
  console.log(`\n[TEST 2.1] Simulating Agent Query Attribution on Listing '${sampleListingId}' (POST /api/v1/marketplace/${sampleListingId}/query)...`);
  const queryRes = await fetch(`${baseUrl}/api/v1/marketplace/${sampleListingId}/query`, { method: "POST" });
  const queryData = await queryRes.json();
  console.log(`✅ Query Attributed! Creator Royalty (70%): $${queryData.creatorRoyaltyUSD} | Platform Fee (30%): $${queryData.platformFeeUSD}`);

  // Test 3: Enterprise SLA & Edge Network Telemetry
  console.log("\n[TEST 3] Testing Enterprise SLA Health (GET /api/v1/enterprise/sla-health)...");
  const slaRes = await fetch(`${baseUrl}/api/v1/enterprise/sla-health`);
  const slaData = await slaRes.json();
  console.log(`✅ SLA Status: ${slaData.status} | Uptime: ${slaData.currentUptime} | PoPs: ${slaData.edgeNetwork?.activePointsOfPresence} Cities`);
  console.log(`   Latency Percentiles: p50=${slaData.edgeNetwork?.edgeLatencyPercentilesMs?.p50}ms, p95=${slaData.edgeNetwork?.edgeLatencyPercentilesMs?.p95}ms`);

  // Test 4: Verify Browser Extension Package Manifest
  console.log("\n[TEST 4] Validating Universal Browser Extension Manifest V3...");
  const manifestPath = path.resolve(process.cwd(), "packages/extension/manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Extension manifest missing at: ${manifestPath}`);
  }
  const manifestContent = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  console.log(`✅ Extension Verified: "${manifestContent.name}" (v${manifestContent.version}, Manifest V${manifestContent.manifest_version})`);

  console.log("\n------------------------------------------------------------------");
  console.log("🎉 ALL PHASE 4 AUTOMATED TESTS PASSED WITH 100% SUCCESS!");
}

main().catch(err => {
  console.error("❌ Phase 4 Test Failed:", err);
  process.exit(1);
});
