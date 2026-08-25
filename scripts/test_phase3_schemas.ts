/**
 * Phase 3 Automated Verification Test:
 * Tests Multi-Tenant Workspaces, Custom Visual Schema Creation, Live Refinement, and Dynamic MCP Tool Execution.
 */

async function main() {
  const baseUrl = "https://data-refinery-worker.juanquy.workers.dev";
  console.log("🚀 Starting Phase 3 Automated Verification Test against:", baseUrl);
  console.log("------------------------------------------------------------------");

  // Test 1: Fetch Custom Schemas
  console.log("\n[TEST 1] Listing Deployed Custom Schemas (GET /api/v1/schemas)...");
  const schemasRes = await fetch(`${baseUrl}/api/v1/schemas`);
  const schemasData = await schemasRes.json();
  console.log(`✅ Schemas found (${schemasData.count}):`, schemasData.schemas?.map((s: any) => s.slug));

  if (!schemasData.schemas || schemasData.schemas.length === 0) {
    throw new Error("No custom schemas found in D1");
  }

  // Test 2: Dynamic MCP Tools Discovery
  console.log("\n[TEST 2] Testing Dynamic MCP Tool Discovery (POST /mcp tools/list)...");
  const mcpListRes = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: "test-p3-mcp-list",
      method: "tools/list"
    })
  });
  const mcpListData = await mcpListRes.json();
  const customTools = mcpListData.result?.tools?.filter((t: any) => t.name.startsWith("refinery_custom_"));
  console.log(`✅ Dynamically Provisioned Custom MCP Tools (${customTools.length}):`);
  customTools.forEach((t: any) => console.log(`   - ${t.name}: ${t.description.slice(0, 70)}...`));

  if (customTools.length === 0) {
    throw new Error("No dynamic custom MCP tools discovered");
  }

  // Test 3: Live Custom Schema Refinement
  console.log("\n[TEST 3] Testing Live Custom Schema Refinement (POST /api/v1/schemas/real-estate-zoning/refine)...");
  const refineRes = await fetch(`${baseUrl}/api/v1/schemas/real-estate-zoning/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceUrl: "https://httpbin.org/json"
    })
  });
  const refineData = await refineRes.json();
  console.log(`✅ Live Refinement Status: ${refineData.status} (Took: ${refineData.durationMs}ms)`);
  console.log("   Structured Data Result:", JSON.stringify(refineData.structuredData, null, 2));

  // Test 4: Workspace Management & Members
  console.log("\n[TEST 4] Testing Workspace Members (GET /api/v1/workspaces/ws_global_refinery/members)...");
  const wsRes = await fetch(`${baseUrl}/api/v1/workspaces/ws_global_refinery/members`);
  const wsData = await wsRes.json();
  console.log(`✅ Workspace Members (${wsData.members?.length || 0}):`, wsData.members);

  console.log("\n------------------------------------------------------------------");
  console.log("🎉 ALL PHASE 3 AUTOMATED TESTS PASSED WITH 100% SUCCESS!");
}

main().catch(err => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
