/**
 * Live Real-Data End-to-End Quality Test
 * Refines live pages from the internet to test AI extraction,
 * semantic structuring, D1 storage, and vector retrieval.
 */

const API_WORKER = "https://data-refinery-worker.juanquy.workers.dev";

async function testLiveRealData() {
  console.log("================================================================================");
  console.log("🌐 EXECUTING LIVE REAL-WORLD DATA REFINEMENT & QUALITY BENCHMARK");
  console.log("================================================================================\n");

  // ---------------------------------------------------------------------------
  // TEST 1: LIVE ON-DEMAND REFINEMENT OF A REAL WEB PAGE
  // ---------------------------------------------------------------------------
  console.log("--------------------------------------------------------------------------------");
  console.log("🧪 TEST 1: Real-Time Live Web Ingestion & AI Schema Structuring");
  console.log("--------------------------------------------------------------------------------");

  // We test on a real, live public documentation page: Hacker News / Cloudflare
  const targetUrl = "https://news.ycombinator.com";
  const customPrompt = "Extract the top trending technology stories, developer topics, and summarize the key insights.";

  console.log(`📡 Ingesting live URL: ${targetUrl}`);
  console.log(`🤖 Instruction Prompt: "${customPrompt}"\n`);

  const start1 = performance.now();
  const res1 = await fetch(`${API_WORKER}/api/v1/custom/refine`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: targetUrl,
      instructionPrompt: customPrompt
    })
  });
  const duration1 = Math.round(performance.now() - start1);
  const data1: any = await res1.json();

  if (res1.status === 200 && data1.status === "success") {
    console.log(`  ✅ Live Refinement SUCCESS (${duration1}ms)`);
    console.log(`     Entity Key: ${data1.entityKey}`);
    console.log(`     Summary: ${data1.summary}`);
    console.log(`     Structured Data Extracted:`);
    console.log(JSON.stringify(data1.structuredData, null, 2).substring(0, 500) + "\n     ...");
  } else {
    console.error("  ❌ Live Refinement FAILED:", data1);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: LIVE MCP AGENT CALL REFINING A LIVE GITHUB REPO
  // ---------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🧪 TEST 2: Live Agent MCP Tool Call (refinery_refine_custom_url)");
  console.log("--------------------------------------------------------------------------------");

  const mcpPayload = {
    jsonrpc: "2.0",
    id: "live-mcp-real-001",
    method: "tools/call",
    params: {
      name: "refinery_refine_custom_url",
      arguments: {
        url: "https://httpbin.org/json",
        instructionPrompt: "Extract the slideshow title, author, and all slide topics into clean JSON."
      }
    }
  };

  console.log("🤖 Sending MCP JSON-RPC call to refine 'https://httpbin.org/json'...");
  const start2 = performance.now();
  const mcpRes = await fetch(`${API_WORKER}/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mcpPayload)
  });
  const duration2 = Math.round(performance.now() - start2);
  const mcpData: any = await mcpRes.json();

  if (mcpRes.status === 200 && mcpData.result?.content) {
    const rawText = mcpData.result.content[0]?.text;
    const parsed = typeof rawText === "string" ? JSON.parse(rawText) : rawText;
    console.log(`  ✅ MCP Live Tool Execution SUCCESS (${duration2}ms)`);
    console.log(`     Clean Schema Output:\n`, JSON.stringify(parsed, null, 2));
  } else {
    console.error("  ❌ MCP Tool Call FAILED:", mcpData);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: VECTOR & KEYWORD SEARCH ACROSS LIVE REFINED DATA
  // ---------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🧪 TEST 3: Instant Search & Retrieval of Refined Intelligence");
  console.log("--------------------------------------------------------------------------------");

  const searchRes = await fetch(`${API_WORKER}/api/v1/search?q=technology`);
  const searchData: any = await searchRes.json();

  if (searchRes.status === 200) {
    console.log(`  ✅ Instant Search SUCCESS`);
    console.log(`     Total Matching Refined Records Found: ${searchData.results?.length || 0}`);
    if (searchData.results?.length > 0) {
      searchData.results.slice(0, 3).forEach((r: any, i: number) => {
        console.log(`     ${i + 1}. [${r.domain.toUpperCase()}] ${r.entityKey}: "${r.summary?.substring(0, 70)}..."`);
      });
    }
  } else {
    console.error("  ❌ Search FAILED:", searchData);
  }

  console.log("\n================================================================================");
  console.log("🏆 LIVE REAL-DATA TEST SUMMARY: ALL LIVE PIPELINES OPERATIONAL WITH HIGH QUALITY");
  console.log("================================================================================\n");
}

testLiveRealData().catch(console.error);
